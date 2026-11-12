// Nudge — Claude API proxy
// The app sends messages here; this function adds the secret API key and
// forwards them to Claude. The key never ships inside the app.

import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

// The model is chosen HERE, on the server, so the app can't switch to a
// pricier one. To change models later, edit this one line and redeploy.
const MODEL = "claude-haiku-5-5";
const MAX_TOKENS = 4096; // upper limit on reply length incl. thinking (keeps costs predictable)

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

export default {
  // "publishable" = the app must send your project's publishable key
  fetch: withSupabase({ auth: ["publishable"] }, async (req) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Use POST" }, { status: 405 });
    }
    if (!ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY secret is not set" },
        { status: 500 },
      );
    }

    // Expected body: { system?: string, messages: [{ role, content }, ...], schema?: {...} }
    // schema (optional): a JSON Schema the reply must follow (structured outputs).
    let body: { system?: string; messages?: unknown[]; schema?: object };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Body must be JSON" }, { status: 400 });
    }
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json(
        { error: "messages must be a non-empty array" },
        { status: 400 },
      );
    }

    // Reaching Claude can fail (network trouble, or a reply that isn't JSON).
    // Catch it here so the logs say what happened and the app gets a clear 502.
    let res: Response;
    let data;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          ...(body.system ? { system: body.system } : {}),
          ...(body.schema
            ? {
                output_config: {
                  format: { type: "json_schema", schema: body.schema },
                },
              }
            : {}),
          messages: body.messages,
        }),
      });

      data = await res.json();
    } catch (err) {
      console.error("Couldn't reach Claude", err);
      return Response.json({ error: "Couldn't reach Claude" }, { status: 502 });
    }
    if (!res.ok) {
      console.error("Claude API error", res.status, data);
      return Response.json(
        { error: data?.error?.message ?? "Claude API error" },
        { status: res.status },
      );
    }

    // The model ran out of room (thinking counts too), so the reply is cut off.
    // The app's parser falls back safely; this makes it visible in the logs.
    if (data.stop_reason === "max_tokens") {
      console.error("Reply cut off at MAX_TOKENS", data.usage);
    }

    // Return just the text, which is all the app needs.
    const textBlocks = (data.content ?? []).filter(
      (b: { type: string }) => b.type === "text",
    );
    // Checking a bug: words sometimes arrive joined ("meltsfaster"). If a reply
    // comes in several text pieces, log how they start and end.
    if (textBlocks.length > 1) {
      console.log(
        "Reply in several text pieces:",
        (data.content ?? []).map((b: { type: string }) => b.type),
        textBlocks.map((b: { text: string }) => JSON.stringify(b.text.slice(-15))),
      );
    }
    const text = textBlocks.map((b: { text: string }) => b.text).join("");
    return Response.json({
      text,
      textPieces: textBlocks.length,
      model: data.model,
      usage: data.usage,
    });
  }),
};

/* Test after deploying (replace YOUR_PUBLISHABLE_KEY — find it in
   Supabase dashboard → Project Settings → API Keys):

  curl -i 'https://rgzzkbuuypoavekyrbyi.supabase.co/functions/v1/claude-proxy' \
    --header 'apikey: YOUR_PUBLISHABLE_KEY' \
    --header 'content-type: application/json' \
    --data '{"messages":[{"role":"user","content":"Say hi to a curious 8-year-old in one sentence."}]}'
*/
