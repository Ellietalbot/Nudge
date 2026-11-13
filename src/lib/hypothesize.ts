import type { WordBank } from "@/design-system";
import type { Message } from "./nudge-api";
import { toSafety, type NudgeSafety } from "./nudge-api";

export type HypothesisResult = {
  safety: NudgeSafety;
  frame: string;
  banks: WordBank[];
};

export const HYPOTHESIZE_START: Message = {
  role: "user",
  content: "(The child tapped Next and is ready to build a guess.)",
};

export const FALLBACK_HYPOTHESIS: HypothesisResult = {
  safety: "doNotTouch",
  frame: "it happens because ___.",
  banks: [
    {
      label: "My guess",
      words: [
        "of something nearby",
        "of something far away",
        "something changed",
        "something is missing",
      ],
    },
  ],
};

// Logs why the parser gave up, plus Claude's raw reply, so a fallback can be explained.
function logFallback(reason: string, raw: string): HypothesisResult {
  console.warn(`Hypothesize fallback (${reason}). Raw reply:`, raw);
  return FALLBACK_HYPOTHESIS;
}

function cleanBank(bank: any): WordBank | null {
  if (typeof bank?.label !== "string" || !Array.isArray(bank.words)) {
    return null;
  }
  const label = bank.label.trim();
  const words = [
    ...new Set(
      bank.words
        .filter((w: unknown): w is string => typeof w === "string")
        .map((w: string) => w.trim())
        .filter((w: string) => w.length > 0),
    ),
  ] as string[];

  if (label === "" || words.length < 2 || words.length > 4) return null;
  return { label, words };
}

export function parseHypothesisReply(raw: string): HypothesisResult {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const data = JSON.parse(raw.slice(start, end + 1));
    const safety = toSafety(data.safety);
    if (safety === "stop") {
      return { safety: "stop", frame: "", banks: [] };
    }

    if (typeof data.frame !== "string")
      return logFallback("frame is not text", raw);
    const frame = data.frame.trim();
    if (frame === "" || frame.toLowerCase().startsWith("i think")) {
      return logFallback("frame is empty or starts with I think", raw);
    }

    if (
      !Array.isArray(data.banks) ||
      data.banks.length < 1 ||
      data.banks.length > 2
    ) {
      return logFallback("needs 1 or 2 word banks", raw);
    }

    const banks = data.banks.map(cleanBank);
    if (banks.some((b: WordBank | null) => b === null)) {
      return logFallback("a word bank needs a label and 2 to 4 words", raw);
    }

    if (new Set(banks.map((b: WordBank) => b.label)).size !== banks.length) {
      return logFallback("two word banks share a label", raw);
    }

    if (frame.split("___").length - 1 !== banks.length) {
      return logFallback("blanks don't match the number of word banks", raw);
    }

    return { safety, frame, banks };
  } catch {
    return logFallback("reply is not valid JSON", raw);
  }
}

export function frameToParts(frame: string): (string | number)[] {
  const pieces = frame.split("___");
  const result: (string | number)[] = [];

  for (let i = 0; i < pieces.length; i++) {
    const text = pieces[i].trim();
    if (text !== "") {
      result.push(text);
    }
    if (i < pieces.length - 1) {
      result.push(i);
    }
  }
  return result;
}
