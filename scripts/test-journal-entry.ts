// Checks the journal helpers with fake explorations — no phone, no database, no API.
// Run: npx tsx scripts/test-journal-entry.ts
import type { Message } from "../src/lib/nudge-api";
import type { ChatLine } from "../src/lib/journal-entry";
import {
  buildEntry,
  chatToThread,
  formatEntryDate,
  messageText,
  stepOf,
} from "../src/lib/journal-entry";

let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
  // JSON.stringify compares arrays and objects by contents; `===` would ask
  // whether they're the very same object.
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
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

console.log("\nformatEntryDate (as a phone in Boise sees it)");
// Pin the time zone so the checks give the same answer on any computer.
process.env.TZ = "America/Boise";
check("afternoon save", formatEntryDate("2026-11-13 19:42:10"), "Nov 13");
check(
  "UTC is already tomorrow, Boise is still today",
  formatEntryDate("2026-11-14 02:00:00"),
  "Nov 13",
);
check("not a date → empty", formatEntryDate("nonsense"), "");

console.log("\nchatToThread — a saved chat back into a thread");
const saved: ChatLine[] = [
  { step: "observe", sender: "child", text: "Look what I found!" },
  { step: "observe", sender: "nudge", text: "What do you notice?" },
  { step: "ask", sender: "nudge", text: "What do you wonder?" },
  { step: "ask", sender: "child", text: "Why is it bumpy?" },
  { step: "hypothesize", sender: "child", text: "to catch sun" },
  { step: "investigate", sender: "nudge", text: "Let's test it!" },
  { step: "reflect", sender: "nudge", text: "Bumps help leaves stay dry." },
  { step: "reflect", sender: "child", text: "cool" },
];
const thread = chatToThread(saved);
check(
  "roles",
  thread.messages.map((m) => m.role),
  [
    "user",
    "assistant",
    "assistant",
    "user",
    "user",
    "assistant",
    "assistant",
    "user",
  ],
);
check("content is the text", thread.messages[3].content, "Why is it bumpy?");
check(
  "a divider before each step's first line, none for observe",
  thread.stepStarts,
  { ask: 2, hypothesize: 4, investigate: 5, reflect: 6 },
);
check(
  "round trip: chatToThread then buildEntry gives the same chat",
  buildEntry(thread.messages, thread.stepStarts, null).chat,
  saved,
);
check("an empty chat", chatToThread([]), { messages: [], stepStarts: {} });

console.log(failures === 0 ? "\nAll passed 🎉" : `\n${failures} failed`);
