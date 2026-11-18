// Times how long Nudge is open. Pure: no database and no React, so it can be
// tested with plain Node. Only one session runs at a time.

let sessionStart: Date | null = null;

// The app came to the front. Starts a session unless one is already running.
export function startSession(now: Date = new Date()) {
  if (sessionStart === null) sessionStart = now;
}

// The app left the front. Returns the finished session, or null if none was
// running. (iOS sends "inactive" and then "background"; only the first ends it.)
export function endSession(
  now: Date = new Date(),
): { start: Date; end: Date } | null {
  if (sessionStart === null) return null;
  const session = { start: sessionStart, end: now };
  sessionStart = null;
  return session;
}

// Seconds in the running session so far, or 0 if none is running. With
// `since`, only the part after it counts (the app was open over midnight).
export function currentSessionSeconds(
  now: Date = new Date(),
  since?: Date,
): number {
  if (sessionStart === null) return 0;
  const from = Math.max(sessionStart.getTime(), since?.getTime() ?? 0);
  return Math.max(0, (now.getTime() - from) / 1000);
}

// Midnight at the start of `now`'s day, in the phone's own time zone.
export function startOfToday(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// "Less than a minute", "1 minute", "25 minutes", "1 hour 5 minutes".
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return "Less than a minute";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const minText = `${m} ${m === 1 ? "minute" : "minutes"}`;
  if (h === 0) return minText;
  const hourText = `${h} ${h === 1 ? "hour" : "hours"}`;
  return m === 0 ? hourText : `${hourText} ${minText}`;
}
