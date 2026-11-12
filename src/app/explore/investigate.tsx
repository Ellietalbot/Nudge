import { Screen } from "@/components/screen";
import {
  BackLink,
  ChildBubble,
  ErrorState,
  InvestigationCard,
  SafetyCard,
  StepProgress,
  ThinkingState,
} from "@/design-system";
import { ERROR_COPY } from "@/lib/error-copy";
import { useExploration } from "@/lib/exploration-context";
import {
  parseInvestigationReply,
  type InvestigationResult,
} from "@/lib/investigate";
import { askNudge, NudgeError, NudgeErrorKind } from "@/lib/nudge-api";
import { INVESTIGATE_PROMPT } from "@/lib/prompts";
import { INVESTIGATE_SCHEMA } from "@/lib/schemas";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function Investigate() {
  // 1. Keep what we need from the context.
  const { messages, addMessages, trimTo, stepStarts, startStep } =
    useExploration();

  // 2. All the state, including status and attempt.
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [errorKind, setErrorKind] = useState<NudgeErrorKind>("server");
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  const start = stepStarts.investigate ?? messages.length;
  const guess = messages[start - 1]; // the "I think…" message from Hypothesize

  useEffect(() => {
    startStep("investigate");
  }, []);

  // 3. The fetch lives inside an effect, with its `cancelled` flag.
  useEffect(() => {
    let cancelled = false;

    async function getExperiment() {
      try {
        // 4. No start message: the conversation already ends with the guess.
        const raw = await askNudge(
          messages.slice(0, start),
          INVESTIGATE_PROMPT,
          INVESTIGATE_SCHEMA,
        );
        const parsed = parseInvestigationReply(raw);
        console.log("Nudge says (Investigate):", parsed);
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

    getExperiment();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function handleDone() {
    if (!result) return;
    const plan = result.steps
      .map((s, i) => `${i + 1}. ${s.instruction}`)
      .join("\n");
    trimTo(start); // replace an earlier experiment if the child came back
    addMessages(
      {
        role: "assistant",
        content: `Let's test it! ${result.question}\n${plan}`,
      },
      { role: "user", content: "I did it!" },
    );
    router.push("/explore/reflect");
  }

  // 5 + 6. JSX without quotes, one branch per state.
  let card = null;

  if (status === "loading") {
    card = <ThinkingState title="Nudge is planning an experiment…" />;
  } else if (status === "error") {
    card = (
      <ErrorState
        title={ERROR_COPY[errorKind].title}
        body={ERROR_COPY[errorKind].body}
        onRetry={() => {
          setStatus("loading");
          setAttempt((a) => a + 1);
        }}
      />
    );
  } else if (result?.safety === "stop") {
    card = <SafetyCard level="stop" />;
  } else if (result) {
    card = (
      <View style={{ gap: 16 }}>
        {result.safety !== "none" && (
          <SafetyCard
            level={result.safety}
            compact={
              result.safety === "caution" || result.safety === "askAdult"
            }
          />
        )}
        <InvestigationCard
          question={result.question}
          minutes={result.minutes}
          safety={[
            { icon: "adult", label: "With a grown-up" },
            ...(result.safety === "doNotTouch"
              ? [{ icon: "touch" as const, label: "Don't touch it" }]
              : []),
          ]}
          materials={result.materials}
          steps={result.steps}
          onDone={handleDone}
        />
      </View>
    );
  }

  return (
    <Screen>
      <View>
        <BackLink onPress={() => router.back()} />
        <StepProgress current={3} />
      </View>
      {typeof guess?.content === "string" && (
        <ChildBubble>{guess.content}</ChildBubble>
      )}
      {card}
    </Screen>
  );
}
