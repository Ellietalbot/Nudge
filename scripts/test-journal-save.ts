// Runs saveExploration against a real SQLite database in memory (Node's built-in
// node:sqlite) with the app's own schema. No phone, no API.
// Run: npx tsx scripts/test-journal-save.ts
import { DatabaseSync } from "node:sqlite";
import type { SQLiteDatabase } from "expo-sqlite";
import { listEntries, saveExploration } from "../src/db/journal";
import { schema } from "../src/db/schema";
import type { JournalEntryData } from "../src/lib/journal-entry";

let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(
    `${ok ? "✅" : "❌"} ${name} → ${JSON.stringify(actual)}${ok ? "" : ` (expected ${JSON.stringify(expected)})`}`,
  );
}

// A stand-in for expo-sqlite with just the methods journal.ts uses.
function fakeExpoDb(sqlite: DatabaseSync) {
  const txn = {
    async runAsync(sql: string, ...params: (string | number | null)[]) {
      const r = sqlite.prepare(sql).run(...params);
      return {
        lastInsertRowId: Number(r.lastInsertRowid),
        changes: Number(r.changes),
      };
    },
  };
  return {
    async getAllAsync(sql: string, ...params: (string | number | null)[]) {
      return sqlite.prepare(sql).all(...params);
    },
    async withExclusiveTransactionAsync(
      task: (t: typeof txn) => Promise<void>,
    ) {
      sqlite.exec("BEGIN");
      try {
        await task(txn);
        sqlite.exec("COMMIT");
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  } as unknown as SQLiteDatabase;
}

const entry: JournalEntryData = {
  inputType: "photo",
  photoPath: "file:///photos/keyboard.jpg",
  noticed: "I noticed the keys have letters",
  nudgeQuestion: "What's a question?",
  childQuestion: "How does the computer know which key I press?",
  hypothesis: "each key has its own spot.",
  experiment: "Let's test it!\n1. Draw four squares",
  finding: "Each key sends its own signal.",
  chat: [
    { step: "observe", sender: "child", text: "Look what I found!" },
    { step: "ask", sender: "nudge", text: "What's a question?" },
    {
      step: "reflect",
      sender: "nudge",
      text: "Didn't that work? It's like magic!",
    }, // apostrophes
  ],
};

async function main() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(schema);
  const db = fakeExpoDb(sqlite);

  console.log("\nSaving one exploration");
  const id = await saveExploration(db, entry);
  check("returns the new id", id, 1);
  check(
    "one journal entry",
    sqlite.prepare("SELECT input_type FROM journal_entries").all(),
    [{ input_type: "photo" }],
  );
  check(
    "observe row",
    sqlite
      .prepare(
        "SELECT journal_entry_id, photo_path, question_text FROM step_observe",
      )
      .get(),
    {
      journal_entry_id: 1,
      photo_path: "file:///photos/keyboard.jpg",
      question_text: "I noticed the keys have letters",
    },
  );
  check(
    "reflect row",
    sqlite.prepare("SELECT finding_text FROM step_reflect").get(),
    { finding_text: "Each key sends its own signal." },
  );
  check(
    "investigate result_notes is null",
    sqlite.prepare("SELECT result_notes FROM step_investigate").get(),
    { result_notes: null },
  );
  check(
    "chat in order, apostrophes intact",
    sqlite
      .prepare(
        "SELECT step, sender, message_text FROM chat_messages ORDER BY id",
      )
      .all()
      .map((r: any) => `${r.step}/${r.sender}: ${r.message_text}`),
    [
      "observe/child: Look what I found!",
      "ask/nudge: What's a question?",
      "reflect/nudge: Didn't that work? It's like magic!",
    ],
  );

  console.log("\nA second save gets its own id");
  check(
    "returns 2",
    await saveExploration(db, { ...entry, inputType: "text", photoPath: null }),
    2,
  );
  check(
    "two entries",
    sqlite.prepare("SELECT COUNT(*) AS n FROM journal_entries").get(),
    { n: 2 },
  );

  console.log("\nA bad message rolls back the whole save");
  const bad = {
    ...entry,
    chat: [{ step: "lunch", sender: "child", text: "oops" }],
  } as unknown as JournalEntryData;
  let threw = false;
  try {
    await saveExploration(db, bad);
  } catch {
    threw = true;
  }
  check("the save throws", threw, true);
  check(
    "still only two entries (nothing half-saved)",
    sqlite.prepare("SELECT COUNT(*) AS n FROM journal_entries").get(),
    { n: 2 },
  );
  check(
    "no step_observe row for the failed save",
    sqlite.prepare("SELECT COUNT(*) AS n FROM step_observe").get(),
    { n: 2 },
  );

  console.log("\nListing entries");
  const rows = await listEntries(db);
  check("two rows (the failed save isn't there)", rows.length, 2);
  // Both saves happen in the same second, so this tests the `e.id DESC` tie-breaker.
  check(
    "newest first",
    rows.map((r) => r.id),
    [2, 1],
  );
  check("text entry has no photo", rows[0].photo_path, null);
  check(
    "photo entry has its photo, question and finding",
    {
      photo_path: rows[1].photo_path,
      child_question_text: rows[1].child_question_text,
      finding_text: rows[1].finding_text,
    },
    {
      photo_path: "file:///photos/keyboard.jpg",
      child_question_text: "How does the computer know which key I press?",
      finding_text: "Each key sends its own signal.",
    },
  );
  check(
    "created_at comes back as a string",
    typeof rows[0].created_at,
    "string",
  );

  console.log(failures === 0 ? "\nAll passed 🎉" : `\n${failures} failed`);
}
main();
