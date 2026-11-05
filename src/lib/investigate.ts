import type { Material } from "@/design-system";
import { SAFETY_LEVELS, type NudgeSafety } from "./nudge-api";

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

    if (data.safety === "stop") {
      return {
        ...FALLBACK_INVESTIGATION,
        safety: "stop",
        materials: [],
        steps: [],
      };
    }

    const question = cleanText(data.question);
    if (!question) return FALLBACK_INVESTIGATION;

    // Claude sends a whole number; the app writes the words and enforces the 15-minute limit.
    const n = data.minutes;
    if (!Number.isInteger(n) || n < 1 || n > 15) return FALLBACK_INVESTIGATION;
    const minutes = n === 1 ? "About 1 minute" : `About ${n} minutes`;

    if (
      !Array.isArray(data.materials) ||
      data.materials.length < 1 ||
      data.materials.length > 5
    ) {
      return FALLBACK_INVESTIGATION;
    }
    const materials = data.materials
      .map(cleanMaterial)
      .filter((m: Material | null): m is Material => m !== null);
    if (materials.length !== data.materials.length)
      return FALLBACK_INVESTIGATION;

    if (
      new Set(materials.map((m: Material) => m.name)).size !== materials.length
    ) {
      return FALLBACK_INVESTIGATION;
    }

    if (
      !Array.isArray(data.steps) ||
      data.steps.length < 2 ||
      data.steps.length > 6
    ) {
      return FALLBACK_INVESTIGATION;
    }
    const steps = data.steps
      .map(cleanStep)
      .filter(
        (
          s: { instruction: string; tip?: string } | null,
        ): s is { instruction: string; tip?: string } => s !== null,
      );
    if (steps.length !== data.steps.length) return FALLBACK_INVESTIGATION;

    const safety: NudgeSafety = SAFETY_LEVELS.includes(data.safety)
      ? data.safety
      : "doNotTouch";

    return { safety, question, minutes, materials, steps };
  } catch {
    return FALLBACK_INVESTIGATION;
  }
}
