// Checks the app-time helpers. No phone, no database.
// Run: npx tsx scripts/test-usage.ts
import {
  currentSessionSeconds,
  endSession,
  formatDuration,
  startSession,
} from "../src/lib/usage";

let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(
    `${ok ? "✅" : "❌"} ${name} → ${JSON.stringify(actual)}${ok ? "" : ` (expected ${JSON.stringify(expected)})`}`,
  );
}

console.log("\nformatDuration");
check("0 s", formatDuration(0), "Less than a minute");
check("29 s rounds down", formatDuration(29), "Less than a minute");
check("30 s rounds up", formatDuration(30), "1 minute");
check("5 min", formatDuration(300), "5 minutes");
check("5 min 29 s", formatDuration(329), "5 minutes");
check("60 min", formatDuration(3600), "1 hour");
check("65 min", formatDuration(3900), "1 hour 5 minutes");
check("2 h 1 min", formatDuration(7260), "2 hours 1 minute");

console.log("\nsessions");
const t0 = new Date("2026-11-18T23:00:00.000Z");
const at = (s: number) => new Date(t0.getTime() + s * 1000);
check("nothing running", currentSessionSeconds(at(10)), 0);
check("end with nothing running", endSession(at(10)), null);
startSession(t0);
startSession(at(60)); // a second "active" doesn't restart the clock
check("running 5 min", currentSessionSeconds(at(300)), 300);
check("end it", endSession(at(300)), {
  start: "2026-11-18T23:00:00.000Z",
  end: "2026-11-18T23:05:00.000Z",
});
check("second end does nothing", endSession(at(301)), null);
check("stopped", currentSessionSeconds(at(400)), 0);

console.log(failures ? `\n❌ ${failures} failed` : "\n✅ All passed");
if (failures) process.exit(1);
