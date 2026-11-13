export type TextBlock = { type: "text"; text: string };
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

export type NudgeErrorKind = "offline" | "timeout" | "server";

export class NudgeError extends Error {
  kind: NudgeErrorKind;
  constructor(kind: NudgeErrorKind, message?: string) {
    super(message ?? kind);
    this.kind = kind;
  }
}

export async function askNudge(
  messages: Message[],
  system?: string,
  schema?: object,
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  let gotResponse = false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: `${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ messages, system, schema }),
      signal: controller.signal,
    });
    gotResponse = true;

    if (!res.ok) {
      throw new NudgeError("server", `Proxy returned ${res.status}`);
    }

    const data = await res.json();
    return data.text;
  } catch (err) {
    if (err instanceof NudgeError) {
      throw err;
    } else if (controller.signal.aborted) {
      throw new NudgeError("timeout", "Request timed out.");
    } else if (!gotResponse) {
      throw new NudgeError("offline", (err as Error)?.message);
    } else {
      throw new NudgeError(
        "server",
        (err as Error)?.message ?? "Unknown error",
      );
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

export type NudgeSafety =
  | "none"
  | "caution"
  | "askAdult"
  | "doNotTouch"
  | "stop";

export type NudgeResult = {
  object?: string;
  safety: NudgeSafety;
  reply: string;
  readyForNext: boolean;
};

export const SAFETY_LEVELS: NudgeSafety[] = [
  "none",
  "caution",
  "askAdult",
  "doNotTouch",
  "stop",
];

// Turns whatever Claude sent as "safety" into one of our five levels.
// Structured outputs may change an enum's capitalization ("askadult"), so match
// case-insensitively and return our own spelling. Anything else → "doNotTouch".
export function toSafety(value: unknown): NudgeSafety {
  const text = typeof value === "string" ? value.toLowerCase() : "";
  return (
    SAFETY_LEVELS.find((level) => level.toLowerCase() === text) ?? "doNotTouch"
  );
}

export function saferOf(a: NudgeSafety, b: NudgeSafety): NudgeSafety {
  return SAFETY_LEVELS.indexOf(a) >= SAFETY_LEVELS.indexOf(b) ? a : b;
}

const FALLBACK_REPLY =
  "Let's look closely without touching! What do you notice?";

// Reflect's fallback: the Observe one ("What do you notice?") makes no sense mid-Reflect.
export const REFLECT_FALLBACK_REPLY =
  "Oops, I got a little mixed up! Can you tell me that again?";

export function parseNudgeReply(
  raw: string,
  fallbackReply: string = FALLBACK_REPLY,
): NudgeResult {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const data = JSON.parse(raw.slice(start, end + 1));
    const safety = toSafety(data.safety);
    const reply =
      typeof data.reply === "string" && data.reply.trim()
        ? data.reply
        : fallbackReply;

    return {
      ...(data.object != null ? { object: String(data.object) } : {}),
      safety,
      reply,
      readyForNext: data.readyForNext === true,
    };
  } catch {
    return {
      safety: "doNotTouch",
      reply: fallbackReply,
      readyForNext: false,
    };
  }
}
