import type { SQLiteDatabase } from "expo-sqlite";
import { schema } from "./schema";
import { Alert } from "react-native";


export async function initDb(db: SQLiteDatabase) {
  await db.execAsync(schema);
}