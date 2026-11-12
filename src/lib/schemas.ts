// JSON Schemas for structured outputs: the proxy passes one to Claude as
// output_config.format, so the reply text is always valid JSON in this shape.
// Each schema matches its prompt's JSON exactly (same fields, same order).
//
// Schemas can't enforce lengths, counts or number ranges (minLength, minimum…),
// so the parsers still check those. Keep the parsers.

import { SAFETY_LEVELS } from "./nudge-api";

// Shared by every step: Claude must pick one of the five safety levels.
const SAFETY = { type: "string", enum: SAFETY_LEVELS } as const;

// Observe: {"object": "...", "safety": "...", "reply": "..."}
export const OBSERVE_SCHEMA = {
  type: "object",
  properties: {
    object: { type: "string" },
    safety: SAFETY,
    reply: { type: "string" },
  },
  required: ["object", "safety", "reply"],
  additionalProperties: false,
};

// Ask: {"safety": "...", "readyForNext": false, "reply": "..."}
export const ASK_SCHEMA = {
  type: "object",
  properties: {
    safety: SAFETY,
    readyForNext: { type: "boolean" },
    reply: { type: "string" },
  },
  required: ["safety", "readyForNext", "reply"],
  additionalProperties: false,
};

// Reflect: {"safety": "...", "reply": "...", "readyForNext": false}
export const REFLECT_SCHEMA = {
  type: "object",
  properties: {
    safety: SAFETY,
    reply: { type: "string" },
    readyForNext: { type: "boolean" },
  },
  required: ["safety", "reply", "readyForNext"],
  additionalProperties: false,
};
