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

// Total seconds across all saved visits. Doesn't include the one running now.
export async function totalUsageSeconds(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ total: number | null }>(
    `SELECT SUM((julianday(ended_at) - julianday(started_at)) * 86400) AS total
     FROM usage_sessions`,
  );
  return row?.total ?? 0;
}
