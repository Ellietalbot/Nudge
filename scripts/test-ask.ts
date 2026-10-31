import { askNudge, Message, parseObserveReply } from "../src/lib/nudge-api";
import { ASK_PROMPT } from "../src/lib/prompts/ask";

// The Observe part every test starts with.
const observe: Message[] = [
  { role: "user", content: "Look what I found!" },
  { role: "assistant", content: "I see a leaf! What do you notice about it?" },
  { role: "user", content: "I noticed it's red" },
];

// Nudge's first Ask reply, used by the later-turn tests.
const firstAskReply: Message = {
  role: "assistant",
  content: "You noticed it's red! What do you wonder about it?",
};

const tests: { name: string; expect: string; messages: Message[] }[] = [
  {
    name: "first turn",
    expect: "readyForNext false, invites a wonder question",
    messages: [...observe],
  },
  {
    name: "asks a question",
    expect:
      "readyForNext true, no answer, doesn't ask 'what do you wonder?' again",
    messages: [
      ...observe,
      firstAskReply,
      { role: "user", content: "why is it red?" },
    ],
  },
  {
    name: "says idk",
    expect: "readyForNext false, a NEW invitation (different wording)",
    messages: [...observe, firstAskReply, { role: "user", content: "idk" }],
  },
  {
    name: "demands answer",
    expect: "readyForNext true, NO answer about why it's red, doesn't ask for a question",
    messages: [
      ...observe,
      firstAskReply,
      { role: "user", content: "just tell me why it's red!" },
    ],
  },
  {
    name: "already asked",
    expect: "readyForNext false, short, no new wonder question",
    messages: [
      ...observe,
      firstAskReply,
      { role: "user", content: "why is it red?" },
      {
        role: "assistant",
        content: "Ooh, great question! Let's figure it out together.",
      },
      { role: "user", content: "cool" },
    ],
  },
];

async function main() {
  for (const t of tests) {
    const raw = await askNudge(t.messages, ASK_PROMPT);
    const result = parseObserveReply(raw);
    console.log(`\n=== ${t.name} ===`);
    console.log(`expect: ${t.expect}`);
    console.log(
      `got:    readyForNext ${result.readyForNext}, safety ${result.safety}`,
    );
    console.log(`reply:  ${result.reply}`);
  }
}

main();
