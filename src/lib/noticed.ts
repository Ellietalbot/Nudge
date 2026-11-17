// Turns what the child typed on Observe into the "I noticed…" line Ask sees.
// "Bumps on the leaf" → "I noticed bumps on the leaf"
// "I noticed bumps"   → "I noticed bumps"        (not "I noticed i noticed…")
// "I see bumps"       → "I noticed I see bumps"  (keeps the capital I)
export function noticedLine(typed: string): string {
  const text = typed.trim();
  if (/^i noticed\b/i.test(text)) {
    return "I noticed" + text.slice("i noticed".length);
  }
  // The word "I" (also "I'm", "I've"…) stays a capital; anything else is lowercased.
  const keepCapital = /^I\b/.test(text);
  const first = keepCapital ? text.charAt(0) : text.charAt(0).toLowerCase();
  return `I noticed ${first}${text.slice(1)}`;
}
