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

// Hypothesize: {"safety": "...", "frame": "... ___ ...", "banks": [{"label": "...", "words": ["..."]}]}
// On "stop" the prompt sends an empty frame and an empty banks array, which
// this schema allows. The parser checks blanks = banks and 3–4 words per bank.
export const HYPOTHESIZE_SCHEMA = {
  type: "object",
  properties: {
    safety: SAFETY,
    frame: { type: "string" },
    banks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          words: { type: "array", items: { type: "string" } },
        },
        required: ["label", "words"],
        additionalProperties: false,
      },
    },
  },
  required: ["safety", "frame", "banks"],
  additionalProperties: false,
};

// Investigate: {"safety", "question", "minutes": 10, "materials": [...], "steps": [...]}
// "quantity" and "tip" are optional because the prompt says to leave them out
// when they aren't needed. They come last in their objects, so the field order
// still matches the prompt. The parser checks 1–15 minutes, 1–5 materials and 2–6 steps.
export const INVESTIGATE_SCHEMA = {
  type: "object",
  properties: {
    safety: SAFETY,
    question: { type: "string" },
    minutes: { type: "integer" },
    materials: {
      type: "array",
      items: {
        type: "object",
        properties: {
          emoji: { type: "string" },
          name: { type: "string" },
          quantity: { type: "string" },
        },
        required: ["emoji", "name"],
        additionalProperties: false,
      },
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          instruction: { type: "string" },
          tip: { type: "string" },
        },
        required: ["instruction"],
        additionalProperties: false,
      },
    },
  },
  required: ["safety", "question", "minutes", "materials", "steps"],
  additionalProperties: false,
};
