// Puts a sentence starter in front of what the child typed, for the line the
// next step sees. Shown here with "I noticed":
// "Bumps on the leaf" → "I noticed bumps on the leaf"
// "I noticed bumps"   → "I noticed bumps"        (not "I noticed i noticed…")
// "I see bumps"       → "I noticed I see bumps"  (keeps the capital I)
// `starter` is our own words (no regex symbols), so it can go in a RegExp as is.
export function starterLine(starter: string, typed: string): string {
  const text = typed.trim();
  if (new RegExp(`^${starter}\\b`, "i").test(text)) {
    return starter + text.slice(starter.length);
  }
  // The word "I" (also "I'm", "I've"…) stays a capital; anything else is lowercased.
  const keepCapital = /^I\b/.test(text);
  const first = keepCapital ? text.charAt(0) : text.charAt(0).toLowerCase();
  return `${starter} ${first}${text.slice(1)}`;
}

export function noticedLine(typed: string): string {
  return starterLine("I noticed", typed);
}

// Observe's typed start: "a ladybug on my window" → "I found a ladybug on my window".
export function foundLine(typed: string): string {
  return starterLine("I found", typed);
}
