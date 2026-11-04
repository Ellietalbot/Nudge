import { ChatThread } from "@/components/chat-thread";
import { Screen } from "@/components/screen";
import {
  AIDisclosure,
  BackLink,
  ErrorState,
  HypothesisBuilder,
  SafetyCard,
  StepProgress,
} from "@/design-system";
import { ERROR_COPY } from "@/lib/error-copy";
import { useExploration } from "@/lib/exploration-context";
import {
  frameToParts,
  HYPOTHESIZE_START,
  parseHypothesisReply,
  type HypothesisResult,
} from "@/lib/hypothesize";
import { askNudge, NudgeError, NudgeErrorKind } from "@/lib/nudge-api";
import { HYPOTHESIZE_PROMPT } from "@/lib/prompts";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function Hypothesize() {
  const { messages, addMessages, trimTo, stepStarts, startStep } =
    useExploration();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [errorKind, setErrorKind] = useState<NudgeErrorKind>("server");
  const [result, setResult] = useState<HypothesisResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Messages before this step. Anything after it is an earlier guess,
  // if the child came back to change it.
  const start = stepStarts.hypothesize ?? messages.length;

  useEffect(() => {
    startStep("hypothesize");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function getChips() {
      try {
        const raw = await askNudge(
          [...messages.slice(0, start), HYPOTHESIZE_START],
          HYPOTHESIZE_PROMPT,
        );
        const parsed = parseHypothesisReply(raw);
        console.log("Nudge says (Hypothesize):", parsed);
        if (!cancelled) {
          setResult(parsed);
          setStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setErrorKind(error instanceof NudgeError ? error.kind : "server");
          setStatus("error");
        }
      }
    }

    getChips();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function handleDone(sentence: string) {
    trimTo(start); // replace an earlier guess instead of adding a second one
    addMessages({ role: "user", content: sentence });
    router.push("/explore/investigate");
  }

  let dock = null;

  if (status === "error") {
    dock = (
      <ErrorState
        title={ERROR_COPY[errorKind].title}
        body={ERROR_COPY[errorKind].body}
        onRetry={() => {
          setStatus("loading");
          setAttempt((a) => a + 1);
        }}
      />
    );
  } else if (status === "ready" && result?.safety === "stop") {
    // Distress or inappropriate content: no builder, so the loop can't continue.
    dock = <SafetyCard level="stop" />;
  } else if (status === "ready" && result) {
    dock = (
      <View style={{ gap: 8 }}>
        {result.safety !== "none" && (
          <SafetyCard
            level={result.safety}
            compact={result.safety === "caution" || result.safety === "askAdult"}
          />
        )}
        <HypothesisBuilder
          key={result.frame}
          compact
          parts={frameToParts(result.frame)}
          banks={result.banks}
          onDone={handleDone}
        />
      </View>
    );
  }

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, gap: 8 }}>
        <View>
          <BackLink onPress={() => router.back()} />
          <StepProgress current={2} />
          <AIDisclosure compact />
        </View>
        <ChatThread
          messages={messages}
          stepStarts={stepStarts}
          loading={status === "loading"}
        />
        <View style={{ marginBottom: 90 }}>{dock}</View>
      </View>
    </Screen>
  );
}
