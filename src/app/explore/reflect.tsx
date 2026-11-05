import { ChatThread } from "@/components/chat-thread";
import { Screen } from "@/components/screen";
import {
  AIDisclosure,
  BackLink,
  Button,
  ErrorState,
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
  NudgeSafety,
  parseNudgeReply,
  REFLECT_FALLBACK_REPLY,
  saferOf,
} from "@/lib/nudge-api";
import { REFLECT_PROMPT } from "@/lib/prompts";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Reflect() {
  const { messages, addMessages, stepStarts, startStep } = useExploration();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [safety, setSafety] = useState<NudgeSafety>("none");
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [text, setText] = useState("");
  const started = useRef(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [errorKind, setErrorKind] = useState<NudgeErrorKind>("server");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    startStep("reflect");
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
        let raw = await askNudge(messages, REFLECT_PROMPT);
        let result = parseNudgeReply(raw, REFLECT_FALLBACK_REPLY);
        if (result.reply === REFLECT_FALLBACK_REPLY) {
          // Claude sometimes answers in plain text instead of JSON: try once more.
          console.log("Reflect fallback, trying again. Raw reply:", raw);
          raw = await askNudge(messages, REFLECT_PROMPT);
          result = parseNudgeReply(raw, REFLECT_FALLBACK_REPLY);
        }
        console.log("Nudge says (Reflect):", result);
        addMessages({ role: "assistant", content: result.reply });
        setSafety((prev) => saferOf(prev, result.safety));
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

  function send() {
    const trimmed = text.trim();
    if (!trimmed || status === "loading") return;

    addMessages({ role: "user", content: trimmed });
    setText("");
    started.current = false; // allow the effect to call Nudge again
    setStatus("loading");
    setAttempt((a) => a + 1); // re-runs the effect
  }
  // Safety net: the prompt explains by Nudge's 3rd reply, but if it ever
  // doesn't, still offer the journal after 4 child messages.
  const reflectTurns = messages
    .slice(stepStarts.reflect ?? messages.length)
    .filter((m) => m.role === "user").length;

  const showSave =
    (ready || reflectTurns >= 4) && safety !== "stop" && status !== "loading";

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        style={{ flex: 1, gap: 8 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <View>
          <BackLink onPress={() => router.back()} />
          <StepProgress current={4} />
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
        {showSave && (
          <Button
            label="Save to my journal"
            // Saving the entry for real is the Week 9 journal task.
            onPress={() => router.push("/journal")}
          />
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
                placeholder="Like: The sunny one melted first…"
              />
            </View>
            <Button
              label="Send"
              onPress={send}
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
