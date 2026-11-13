import type { Material } from "@/design-system";
import { toSafety, type NudgeSafety } from "./nudge-api";

export type InvestigationResult = {
  safety: NudgeSafety;
  question: string;
  minutes: string;
  materials: Material[];
  steps: { instruction: string; tip?: string }[];
};

export const FALLBACK_INVESTIGATION: InvestigationResult = {
  safety: "doNotTouch",
  question: "What can you find out by looking closely?",
  minutes: "About 10 minutes",
  materials: [
    { emoji: "📄", name: "Paper", quantity: "1 sheet" },
    { emoji: "🖍️", name: "Crayon or a pencil" },
  ],
  steps: [
    { instruction: "Look closely for 5 minutes from a safe spot" },
    { instruction: "Draw what you see" },
    {
      instruction: "Look again and add anything new",
      tip: "Does anything you see fit your guess?",
    },
  ],
};
// Logs why the parser gave up, plus Claude's raw reply, so a fallback can be explained.
function logFallback(reason: string, raw: string): InvestigationResult {
  console.warn(`Investigate fallback (${reason}). Raw reply:`, raw);
  return FALLBACK_INVESTIGATION;
}

function cleanText(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function cleanMaterial(item: any): Material | null {
  const emoji = cleanText(item?.emoji);
  const name = cleanText(item?.name);
  if (!emoji || !name) return null;
  const quantity = cleanText(item?.quantity);
  return quantity ? { emoji, name, quantity } : { emoji, name };
}

function cleanStep(item: any): { instruction: string; tip?: string } | null {
  const instruction = cleanText(item?.instruction);
  if (!instruction) return null;
  const tip = cleanText(item?.tip);
  return tip ? { instruction, tip } : { instruction };
}

export function parseInvestigationReply(raw: string): InvestigationResult {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const data = JSON.parse(raw.slice(start, end + 1));
    const safety = toSafety(data.safety);

    if (safety === "stop") {
      return {
        ...FALLBACK_INVESTIGATION,
        safety: "stop",
        materials: [],
        steps: [],
      };
    }

    const question = cleanText(data.question);
    if (!question) return logFallback("question is missing", raw);

    // Claude sends a whole number; the app writes the words and enforces the 15-minute limit.
    const n = data.minutes;
    if (!Number.isInteger(n) || n < 1 || n > 15)
      return logFallback("minutes must be a whole number from 1 to 15", raw);
    const minutes = n === 1 ? "About 1 minute" : `About ${n} minutes`;

    if (
      !Array.isArray(data.materials) ||
      data.materials.length < 1 ||
      data.materials.length > 5
    ) {
      return logFallback("needs 1 to 5 materials", raw);
    }
    const materials = data.materials
      .map(cleanMaterial)
      .filter((m: Material | null): m is Material => m !== null);
    if (materials.length !== data.materials.length)
      return logFallback("a material is missing its emoji or name", raw);

    if (
      new Set(materials.map((m: Material) => m.name)).size !== materials.length
    ) {
      return logFallback("two materials share a name", raw);
    }

    if (
      !Array.isArray(data.steps) ||
      data.steps.length < 2 ||
      data.steps.length > 6
    ) {
      return logFallback("needs 2 to 6 steps", raw);
    }
    const steps = data.steps
      .map(cleanStep)
      .filter(
        (
          s: { instruction: string; tip?: string } | null,
        ): s is { instruction: string; tip?: string } => s !== null,
      );
    if (steps.length !== data.steps.length)
      return logFallback("a step is missing its instruction", raw);

    return { safety, question, minutes, materials, steps };
  } catch {
    return logFallback("reply is not valid JSON", raw);
  }
}
