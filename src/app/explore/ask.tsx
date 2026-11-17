import { ChatThread } from "@/components/chat-thread";
import { Screen } from "@/components/screen";
import {
  AIDisclosure,
  BackLink,
  Button,
  ErrorState,
  QuickReplies,
  type QuickReply,
  SafetyCard,
  StepProgress,
  TextField,
} from "@/design-system";
import { ERROR_COPY } from "@/lib/error-copy";
import { useExploration } from "@/lib/exploration-context";
import {
  askNudge,
  NudgeError,
  NudgeErrorKind,
  parseNudgeReply,
} from "@/lib/nudge-api";
import { ASK_PROMPT } from "@/lib/prompts";
import { ASK_SCHEMA } from "@/lib/schemas";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GUESS_REPLY = "I have a guess!";

export default function Ask() {
  const {
    messages,
    addMessages,
    stepStarts,
    startStep,
    dropStepsFrom,
    safety,
    raiseSafety,
  } = useExploration();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [text, setText] = useState("");
  const started = useRef(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [errorKind, setErrorKind] = useState<NudgeErrorKind>("server");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    startStep("ask");
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", () =>
      setKeyboardOpen(true),
    );
    const hide = Keyboard.addListener("keyboardWillHide", () =>
      setKeyboardOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    const last = messages[messages.length - 1];

    if (!last || last.role !== "user") {
      setStatus("ready");
      return;
    }
    if (started.current) return;
    started.current = true;

    async function getNudgeReply() {
      try {
        const raw = await askNudge(messages, ASK_PROMPT, ASK_SCHEMA);
        const result = parseNudgeReply(raw);
        console.log("Nudge says (Ask):", result);
        addMessages({ role: "assistant", content: result.reply });
        raiseSafety(result.safety);
        setReady((prev) => prev || result.readyForNext);
        setStatus("ready");
      } catch (error) {
        console.error(error);
        started.current = false;
        setErrorKind(error instanceof NudgeError ? error.kind : "server");
        setStatus("error");
      }
    }
    getNudgeReply();
  }, [attempt]);

  function send(said: string = text) {
    const trimmed = said.trim();
    if (!trimmed || status === "loading") return;

    // Back from Hypothesize (or later) and asking more: the old guess and
    // anything after it no longer fit, so those steps start over.
    dropStepsFrom("hypothesize");
    addMessages({ role: "user", content: trimmed });
    setText("");
    started.current = false; // allow the effect to call Nudge again
    setStatus("loading");
    setAttempt((a) => a + 1); // re-runs the effect
  }
  const askTurns = messages
    .slice(stepStarts.ask ?? messages.length)
    .filter((m) => m.role === "user").length;

  const showNext =
    (ready || askTurns >= 3) && safety !== "stop" && status !== "loading";

  // Tap-to-answer after Nudge asks something. The forward reply takes the
  // place of the Next button; while typing, the button comes back instead.
  const lastMessage = messages[messages.length - 1];
  const showReplies =
    status === "ready" &&
    safety !== "stop" &&
    lastMessage?.role === "assistant" &&
    !keyboardOpen &&
    !text.trim();
  const replies: QuickReply[] = [
    ...(showNext ? [{ label: GUESS_REPLY, forward: "hypothesize" as const }] : []),
    { label: "I'm not sure" },
  ];

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        style={{ flex: 1, gap: 8 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <View>
          <BackLink onPress={() => router.back()} />
          <StepProgress current={1} />
          <AIDisclosure compact />
        </View>
        <ChatThread
          messages={messages}
          stepStarts={stepStarts}
          loading={status === "loading"}
        />
        {safety !== "none" && safety !== "stop" && (
          <SafetyCard
            level={safety}
            compact={safety === "caution" || safety === "askAdult"}
          />
        )}
        {status === "error" && (
          <ErrorState
            title={ERROR_COPY[errorKind].title}
            body={ERROR_COPY[errorKind].body}
            onRetry={() => {
              setStatus("loading");
              setAttempt((a) => a + 1);
            }}
          />
        )}
        {safety === "stop" && <SafetyCard level="stop" />}
        {showReplies ? (
          <QuickReplies
            replies={replies}
            onPick={(label) => {
              if (label === GUESS_REPLY) router.push("/explore/hypothesize");
              else send(label);
            }}
          />
        ) : (
          showNext && (
            <Button
              label="Next: make a guess"
              onPress={() => router.push("/explore/hypothesize")}
            />
          )
        )}
        {status !== "error" && safety !== "stop" && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <TextField
                label="Your message"
                hideLabel
                value={text}
                onChangeText={setText}
                placeholder="Like: I wonder…"
              />
            </View>
            <Button
              label="Send"
              onPress={() => send()}
              disabled={!text.trim() || status === "loading"}
            />
          </View>
        )}
        {/* Room for the home indicator (the tab bar is hidden during an exploration). */}
        <View style={{ height: keyboardOpen ? 0 : insets.bottom }} />
      </KeyboardAvoidingView>
    </Screen>
  );
}
