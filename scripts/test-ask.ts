import { askNudge, Message } from "../src/lib/nudge-api";
import { ASK_PROMPT } from "../src/lib/prompts/ask";

async function main() {
  const messages: Message[] = [
    { role: "user", content: "Look what I found!" },
    { role: "assistant", content: "What do you notice?" },
    { role: "user", content: "I noticed it has bumpy lines" },
  ];

  const reply = await askNudge(messages, ASK_PROMPT);
  console.log(reply);
}

main();
