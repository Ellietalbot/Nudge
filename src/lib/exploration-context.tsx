import type { StepId } from "@/design-system";
import { Message } from "@/lib/nudge-api";
import { createContext, useContext, useState } from "react";

// Where each step's messages begin, e.g. { ask: 3, hypothesize: 7 }.
export type StepStarts = Partial<Record<StepId, number>>;

type Exploration = {
  messages: Message[];
  addMessages: (...newMessages: Message[]) => void;
  trimTo: (length: number) => void;
  stepStarts: StepStarts;
  startStep: (stepId: StepId) => void;
  reset: () => void;
  photoUri: string | null;
  setPhotoUri: (uri: string | null) => void;
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

  function addMessages(...newMessages: Message[]) {
    setMessages((prev) => [...prev, ...newMessages]);
  }

  // Drop everything after `length`, e.g. an old guess before saving a new one.
  function trimTo(length: number) {
    setMessages((prev) => prev.slice(0, length));
  }

  // Saved only the first time, so a step's start never moves when the child
  // leaves the screen and comes back. `!== undefined` because a start can be 0.
  function startStep(stepId: StepId) {
    setStepStarts((prev) =>
      prev[stepId] !== undefined
        ? prev
        : { ...prev, [stepId]: messages.length },
    );
  }

  function reset() {
    setMessages([]);
    setStepStarts({});
    setPhotoUri(null);
  }

  return (
    <ExplorationContext.Provider
      value={{
        messages,
        addMessages,
        trimTo,
        stepStarts,
        startStep,
        reset,
        photoUri,
        setPhotoUri,
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
