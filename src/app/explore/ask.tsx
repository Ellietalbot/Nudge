import { ChatThread } from "@/components/chat-thread";
import { Screen } from "@/components/screen";
import { BackLink, ErrorState, StepProgress } from "@/design-system";
import { useExploration } from "@/lib/exploration-context";
import { askNudge, NudgeSafety, parseObserveReply } from "@/lib/nudge-api";
import { ASK_PROMPT } from "@/lib/prompts";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

export default function Ask() {
  const { messages, addMessages } = useExploration();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [safety, setSafety] = useState<NudgeSafety>("none");
  const [attempt, setAttempt] = useState(0);
  const started = useRef(false);
  const observeCount = useRef(messages.length);

  useEffect(() => {
    const last = messages[messages.length - 1];

    if (!last || last.role !== "user") {
      setStatus("ready");
      return;
    }
    if (started.current) return;
    started.current = true;

    async function openingTurn() {
      try {
        const raw = await askNudge(messages, ASK_PROMPT);
        const result = parseObserveReply(raw);
        addMessages({ role: "assistant", content: result.reply });
        setSafety(result.safety);
        setStatus("ready");
      } catch (error) {
        console.error(error);
        started.current = false;
        setStatus("error");
      }
    }
    openingTurn();
  }, [attempt]);

  return (
    <Screen scroll={false}>
      <View>
        <BackLink onPress={() => router.back()} />
        <StepProgress current={1} />
      </View>
      <ChatThread
        messages={messages}
        dividerAfter={observeCount.current}
        loading={status === "loading"}
      />
      {status === "error" && (
        <ErrorState
          title="Oops! Nudge couldn't answer"
          body="Check that you are connected to the internet, then try again."
          onRetry={() => {
            setStatus("loading");
            setAttempt((a) => a + 1);
          }}
        />
      )}
    </Screen>
  );
}
