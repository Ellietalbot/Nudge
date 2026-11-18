import type { StepId } from "@/design-system";
import { Message, saferOf, type NudgeSafety } from "@/lib/nudge-api";
import { createContext, useContext, useState } from "react";
import { dropFrom } from "./step-starts";

// Where each step's messages begin, e.g. { ask: 3, hypothesize: 7 }.
export type StepStarts = Partial<Record<StepId, number>>;

type Exploration = {
  messages: Message[];
  addMessages: (...newMessages: Message[]) => void;
  trimTo: (length: number) => void;
  stepStarts: StepStarts;
  startStep: (stepId: StepId, at?: number) => void;
  dropStepsFrom: (stepId: StepId) => void;
  reset: () => void;
  photoUri: string | null;
  setPhotoUri: (uri: string | null) => void;
  // The most cautious safety level any step has reported in this exploration.
  safety: NudgeSafety;
  raiseSafety: (level: NudgeSafety) => void;
};

const ExplorationContext = createContext<Exploration | null>(null);

export function ExplorationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stepStarts, setStepStarts] = useState<StepStarts>({});
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [safety, setSafety] = useState<NudgeSafety>("none");

  function addMessages(...newMessages: Message[]) {
    setMessages((prev) => [...prev, ...newMessages]);
  }

  // Drop everything after `length`, e.g. an old guess before saving a new one.
  function trimTo(length: number) {
    setMessages((prev) => prev.slice(0, length));
  }

  // Saved only the first time, so a step's start never moves when the child
  // leaves the screen and comes back. `!== undefined` because a start can be 0.
  // `at` defaults to the next message; Ask passes its own (see ask.tsx).
  function startStep(stepId: StepId, at?: number) {
    setStepStarts((prev) =>
      prev[stepId] !== undefined
        ? prev
        : { ...prev, [stepId]: at ?? messages.length },
    );
  }

  // Only ever goes up during an exploration: a warning never disappears.
  function raiseSafety(level: NudgeSafety) {
    setSafety((prev) => saferOf(prev, level));
  }

  // The child went back and changed an earlier step: forget `stepId` and every
  // step after it (their messages and their starts), so they run again.
  function dropStepsFrom(stepId: StepId) {
    const { keep, starts } = dropFrom(stepStarts, stepId);
    if (keep !== undefined) trimTo(keep);
    setStepStarts(starts);
  }

  function reset() {
    setMessages([]);
    setStepStarts({});
    setPhotoUri(null);
    setSafety("none");
  }

  return (
    <ExplorationContext.Provider
      value={{
        messages,
        addMessages,
        trimTo,
        stepStarts,
        startStep,
        dropStepsFrom,
        reset,
        photoUri,
        setPhotoUri,
        safety,
        raiseSafety,
      }}
    >
      {children}
    </ExplorationContext.Provider>
  );
}

export function useExploration() {
  const ctx = useContext(ExplorationContext);
  if (!ctx) {
    throw new Error("Must be used inside Exploration Provider");
  }
  return ctx;
}
