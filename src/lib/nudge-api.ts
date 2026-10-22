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
type Message = { role: "user" | "assistant"; content: string | ContentBlock[]};

export async function askNudge(messages: Message[], system?:string): Promise<string> {
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

  // 5. If res.ok is false, throw an Error using data.error
  // 6. Otherwise, return the text field
}
