import type { Message, TextBlock } from "./nudge-api";
import type { StepId } from "@/design-system";
import type { StepStarts } from "./exploration-context";

// One message as the journal stores it: which step, who said it, and the words.
export type ChatLine = {
  step: StepId;
  sender: "child" | "nudge";
  text: string;
};

// Everything one saved exploration needs, one field per column it fills.
export type JournalEntryData = {
  inputType: "photo" | "text";
  photoPath: string | null;
  noticed: string | null; // step_observe.question_text
  nudgeQuestion: string | null; // step_ask.ai_question_text
  childQuestion: string | null; // step_ask.child_question_text
  hypothesis: string | null; // step_hypothesize.hypothesis_text
  experiment: string | null; // step_investigate.experiment_text
  finding: string | null; // step_reflect.finding_text
  chat: ChatLine[];
};

export function messageText(message: Message): string {
  if (typeof message.content === "string") {
    return message.content;
  }
  return message.content
    .filter((block): block is TextBlock => block.type === "text")
    .map((block) => block.text)
    .join(" ");
}

export function stepOf(index: number, stepStarts: StepStarts): StepId {
  let step: StepId = "observe";
  for (const id of ["ask", "hypothesize", "investigate", "reflect"] as const) {
    const start = stepStarts[id];
    // if this step has a start AND the message is at or after it, update `step`
    if (start !== undefined && index >= start) {
      step = id;
    }
  }
  return step;
}

// Turns the exploration into what each table needs. Pure: no database, no phone,
// so scripts/test-journal-entry.ts can check it in Node.
export function buildEntry(
  messages: Message[],
  stepStarts: StepStarts,
  photoUri: string | null,
): JournalEntryData {
  const chat: ChatLine[] = messages.map((message, index) => ({
    step: stepOf(index, stepStarts),
    sender: message.role === "user" ? "child" : "nudge",
    text: messageText(message),
  }));

  function first(step: StepId, sender: ChatLine["sender"]): string | null {
    return (
      chat.find((l) => l.step === step && l.sender === sender)?.text ?? null
    );
  }

  function last(step: StepId, sender: ChatLine["sender"]): string | null {
    const matches = chat.filter((l) => l.step === step && l.sender === sender);
    return matches[matches.length - 1]?.text ?? null;
  }

  return {
    inputType: photoUri ? "photo" : "text",
    photoPath: photoUri,
    noticed: last("observe", "child"), // "I noticed…", not "Look what I found!"
    nudgeQuestion: first("ask", "nudge"),
    childQuestion: last("ask", "child"), // the question that moved them on
    hypothesis: last("hypothesize", "child"),
    experiment: first("investigate", "nudge"), // "Let's test it!" + the plan
    finding: last("reflect", "nudge"), // the explanation comes last
    chat,
  };
}

// SQLite saves UTC as "YYYY-MM-DD HH:MM:SS" with no zone; this gives the date in the device's own time zone
export function formatEntryDate(createdAt: string): string {
  const date = new Date(createdAt.replace(" ", "T") + "Z");
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
