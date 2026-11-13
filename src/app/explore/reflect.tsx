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
import { saveExploration } from "@/db/journal";
import { useExploration } from "@/lib/exploration-context";
import { buildEntry } from "@/lib/journal-entry";
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
import { keepPhoto } from "@/lib/saved-photo";
import { REFLECT_SCHEMA } from "@/lib/schemas";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Reflect() {
  const { messages, addMessages, stepStarts, startStep, photoUri, reset } =
    useExploration();
  const db = useSQLiteContext();
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
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
        const raw = await askNudge(messages, REFLECT_PROMPT, REFLECT_SCHEMA);
        const result = parseNudgeReply(raw, REFLECT_FALLBACK_REPLY);

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
  async function handleSave() {
    if (saving) return; // a second tap while saving would save twice
    setSaving(true);
    setSaveFailed(false);
    try {
      const photoPath = photoUri ? await keepPhoto(photoUri) : null;
      const entry = buildEntry(messages, stepStarts, photoPath);
      const id = await saveExploration(db, entry);
      console.log(
        `Saved journal entry ${id}: ${entry.chat.length} messages, photo ${photoPath ?? "none"}`,
      );
      router.dismissAll(); // Explore tab back to its first screen
      router.navigate("/journal");
      reset(); // after leaving, so Reflect doesn't flash an empty chat
    } catch (error) {
      console.error("Saving the journal entry failed:", error);
      setSaveFailed(true); // the exploration is still in memory, so Try again works
    } finally {
      setSaving(false);
    }
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
        {saveFailed && (
          <ErrorState
            title={ERROR_COPY.save.title}
            body={ERROR_COPY.save.body}
            onRetry={handleSave}
          />
        )}
        {showSave && !saveFailed && (
          <Button
            label={saving ? "Saving…" : "Save to my journal"}
            onPress={handleSave}
            disabled={saving}
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
