import type { SQLiteDatabase } from "expo-sqlite";
import { schema } from "./schema";

export async function initDb(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const version = row?.user_version ?? 0;

    //v1 adds chat messages steps. Once real data exists use alter 
  if (version < 1) {
    await db.execAsync("DROP TABLE IF EXISTS chat_messages;");
  }
  await db.execAsync(schema);
  await db.execAsync("PRAGMA user_version = 1;");
}
