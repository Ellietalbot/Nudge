import type { StepId } from "@/design-system";
import type { StepStarts } from "./exploration-context";

const ORDER: StepId[] = [
  "observe",
  "ask",
  "hypothesize",
  "investigate",
  "reflect",
];

// When the child goes back to an earlier step and changes it (e.g. sends
// another Ask message after reaching Hypothesize), everything from `from`
// onwards is out of date. Returns how many messages to keep (undefined = all,
// because `from` hasn't started yet) and the step starts without `from` and
// the steps after it, so they start again at the right place.
export function dropFrom(
  starts: StepStarts,
  from: StepId,
): { keep: number | undefined; starts: StepStarts } {
  const later = ORDER.slice(ORDER.indexOf(from));
  const kept: StepStarts = {};
  for (const [id, index] of Object.entries(starts) as [StepId, number][]) {
    if (!later.includes(id)) kept[id] = index;
  }
  return { keep: starts[from], starts: kept };
}
