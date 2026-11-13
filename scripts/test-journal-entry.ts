// Checks the journal helpers with fake explorations — no phone, no database, no API.
// Run: npx tsx scripts/test-journal-entry.ts
import type { Message } from "../src/lib/nudge-api";
import { buildEntry, messageText, stepOf } from "../src/lib/journal-entry";

let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(
    `${ok ? "✅" : "❌"} ${name} → ${JSON.stringify(actual)}${ok ? "" : ` (expected ${JSON.stringify(expected)})`}`,
  );
}

console.log("\nstepOf");
const starts = { ask: 3, hypothesize: 7 };
check("index 1, before Ask", stepOf(1, starts), "observe");
check("index 3, exactly at Ask's start", stepOf(3, starts), "ask");
check("index 8, after Hypothesize starts", stepOf(8, starts), "hypothesize");
check("index 0, nothing started yet", stepOf(0, {}), "observe");
check("index 0, Ask starts at 0 (typed path)", stepOf(0, { ask: 0 }), "ask");

console.log("\nmessageText");
const plain: Message = { role: "assistant", content: "What do you notice?" };
const photo: Message = {
  role: "user",
  content: [
    {
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: "AAAA" },
    },
    { type: "text", text: "Look what I found!" },
  ],
};
const twoTexts: Message = {
  role: "user",
  content: [
    { type: "text", text: "Look what I found!" },
    { type: "text", text: "It's shiny." },
  ],
};
check("plain string", messageText(plain), "What do you notice?");
check(
  "photo message skips the image",
  messageText(photo),
  "Look what I found!",
);
check(
  "two text blocks get a space",
  messageText(twoTexts),
  "Look what I found! It's shiny.",
);

console.log("\nbuildEntry — photo exploration");
// Shaped like the Nov 13 keyboard run: Observe 0–2, Ask 3–6, Hypothesize 7,
// Investigate 8–9, Reflect 10–14.
const full: Message[] = [
  photo, // 0 observe: image + "Look what I found!"
  { role: "assistant", content: "Hi, curious explorer! What do you notice?" }, // 1
  { role: "user", content: "I noticed the keys have letters" }, // 2
  { role: "assistant", content: "You noticed the buttons! What's a question?" }, // 3 ask
  { role: "user", content: "the buttons" }, // 4
  { role: "assistant", content: "Ooh, great question!" }, // 5
  { role: "user", content: "How does the computer know which key I press?" }, // 6
  {
    role: "user",
    content: "the computer knows because each key has its own spot.",
  }, // 7 hypothesize
  {
    role: "assistant",
    content:
      "Let's test it! Does each key have its own spot?\n1. Draw four squares",
  }, // 8 investigate
  { role: "user", content: "I did it!" }, // 9
  { role: "assistant", content: "What happened to the squares?" }, // 10 reflect
  { role: "user", content: "The marks stayed on 2 and 4" }, // 11
  { role: "assistant", content: "Did that match your guess?" }, // 12
  { role: "user", content: "yes" }, // 13
  {
    role: "assistant",
    content: "Inside a keyboard, each key sends its own signal.",
  }, // 14
];
const fullStarts = { ask: 3, hypothesize: 7, investigate: 8, reflect: 10 };
const e = buildEntry(full, fullStarts, "file:///photos/keyboard.jpg");
check("inputType", e.inputType, "photo");
check("photoPath", e.photoPath, "file:///photos/keyboard.jpg");
check("noticed", e.noticed, "I noticed the keys have letters");
check(
  "nudgeQuestion",
  e.nudgeQuestion,
  "You noticed the buttons! What's a question?",
);
check(
  "childQuestion",
  e.childQuestion,
  "How does the computer know which key I press?",
);
check(
  "hypothesis",
  e.hypothesis,
  "the computer knows because each key has its own spot.",
);
check(
  "experiment starts with the plan",
  e.experiment?.startsWith("Let's test it!"),
  true,
);
check(
  "finding is the explanation",
  e.finding,
  "Inside a keyboard, each key sends its own signal.",
);
check("chat has every message", e.chat.length, 15);
check("chat[0] has no base64", e.chat[0].text, "Look what I found!");
check("chat[7] is hypothesize", e.chat[7].step, "hypothesize");
check(
  "chat[9] is a child line in investigate",
  `${e.chat[9].step}/${e.chat[9].sender}`,
  "investigate/child",
);

console.log("\nbuildEntry — typed path");
const typed = buildEntry(
  [{ role: "user", content: "I noticed the moon looks bigger tonight" }],
  {},
  null,
);
check("inputType", typed.inputType, "text");
check("photoPath", typed.photoPath, null);
check("noticed", typed.noticed, "I noticed the moon looks bigger tonight");
check("steps not reached are null", typed.finding, null);

console.log(failures === 0 ? "\nAll passed 🎉" : `\n${failures} failed`);
