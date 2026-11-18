import type { SQLiteDatabase } from "expo-sqlite";

// Saves one finished visit to the app.
export async function saveUsageSession(
  db: SQLiteDatabase,
  start: Date,
  end: Date,
) {
  await db.runAsync(
    "INSERT INTO usage_sessions (started_at, ended_at) VALUES (?, ?)",
    start.toISOString(),
    end.toISOString(),
  );
}

// Seconds in saved visits since `since` (e.g. midnight). A visit that started
// before then counts only from `since`. Doesn't include the one running now.
// MAX works on the ISO strings because they sort in time order.
export async function usageSecondsSince(
  db: SQLiteDatabase,
  since: Date,
): Promise<number> {
  const from = since.toISOString();
  const row = await db.getFirstAsync<{ total: number | null }>(
    `SELECT SUM((julianday(ended_at) - julianday(MAX(started_at, ?))) * 86400)
       AS total
     FROM usage_sessions
     WHERE ended_at > ?`,
    from,
    from,
  );
  return row?.total ?? 0;
}
