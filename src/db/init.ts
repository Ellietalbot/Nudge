import type { SQLiteDatabase } from "expo-sqlite";
import { migrationV2, schema } from "./schema";

// Brings the database up to the current version. `user_version` remembers
// which steps already ran, so each one runs once per phone.
export async function initDb(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const version = row?.user_version ?? 0;

  // v1 added chat_messages.step, back when no real entries existed.
  if (version < 1) {
    await db.execAsync("DROP TABLE IF EXISTS chat_messages;");
  }
  await db.execAsync(schema);
  // v2 adds journal_entries.safety_level.
  if (version < 2) {
    await db.execAsync(migrationV2);
  }
  await db.execAsync("PRAGMA user_version = 2;");
}
