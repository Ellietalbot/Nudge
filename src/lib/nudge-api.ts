type TextBlock = { type: "text"; text: string };
type ImageBlock = {
  type: "image";
  source: {
    type: "base64";
    media_type: "image/jpeg";
    data: string;
  };
};
type ContentBlock = TextBlock | ImageBlock;
export type Message = {
  role: "user" | "assistant";
  content: string | ContentBlock[];
};

export async function askNudge(
  messages: Message[],
  system?: string,
): Promise<string> {
  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/claude-proxy`;
  const apiKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    !process.env.EXPO_PUBLIC_SUPABASE_URL ||
    !process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    throw new Error(
      "Missing Supabase URL or API key in environment variables.",
    );
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: `${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ messages, system }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data.text;
}

export type NudgeSafety = "none" | "caution" | "askAdult" | "doNotTouch" | "stop";

export type ObserveResult = {
  object: string;
  safety: NudgeSafety;
  reply: string;
};

const SAFETY_LEVELS: NudgeSafety[] = ["none", "caution", "askAdult", "doNotTouch", "stop"];
const FALLBACK_REPLY = "Let's look closely without touching! What do you notice?";

export function parseObserveReply(raw: string): ObserveResult {
  try {
    // Claude sometimes wraps JSON in ```json fences or adds a word before it,
    // so take everything from the first { to the last }.
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const data = JSON.parse(raw.slice(start, end + 1));

    const safety = SAFETY_LEVELS.includes(data.safety) ? data.safety : "doNotTouch";
    const reply =
      typeof data.reply === "string" && data.reply.trim() ? data.reply : FALLBACK_REPLY;

    return { object: String(data.object ?? "unclear"), safety, reply };
  } catch {
    // Not valid JSON at all: fail safe, not silent.
    return { object: "unclear", safety: "doNotTouch", reply: FALLBACK_REPLY };
  }
}
