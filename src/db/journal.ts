import type { ChatLine, JournalEntryData } from "@/lib/journal-entry";
import type { SQLiteDatabase } from "expo-sqlite";

// Writes one finished exploration: the journal entry, one row per step table,
// and every chat message. All of it saves, or none of it does.
// Returns the new journal entry's id.
export async function saveExploration(
  db: SQLiteDatabase,
  data: JournalEntryData,
): Promise<number> {
  let entryId = 0;

  // Exclusive: nothing else can write in the middle. Every query inside must
  // use `txn`, not `db`. If anything throws, SQLite rolls everything back.
  await db.withExclusiveTransactionAsync(async (txn) => {
    const entry = await txn.runAsync(
      "INSERT INTO journal_entries (input_type) VALUES (?)",
      data.inputType,
    );
    entryId = entry.lastInsertRowId;

    await txn.runAsync(
      "INSERT INTO step_observe (journal_entry_id, photo_path, question_text) VALUES (?, ?, ?)",
      entryId,
      data.photoPath,
      data.noticed,
    );
    await txn.runAsync(
      "INSERT INTO step_ask (journal_entry_id, ai_question_text, child_question_text) VALUES (?, ?, ?)",
      entryId,
      data.nudgeQuestion,
      data.childQuestion,
    );
    await txn.runAsync(
      "INSERT INTO step_hypothesize (journal_entry_id, hypothesis_text) VALUES (?, ?)",
      entryId,
      data.hypothesis,
    );
    await txn.runAsync(
      "INSERT INTO step_investigate (journal_entry_id, experiment_text, result_notes) VALUES (?, ?, ?)",
      entryId,
      data.experiment,
      null, // the child doesn't write results yet
    );
    await txn.runAsync(
      "INSERT INTO step_reflect (journal_entry_id, finding_text) VALUES (?, ?)",
      entryId,
      data.finding,
    );

    // `for...of` with `await` keeps the messages in order.
    for (const line of data.chat) {
      await txn.runAsync(
        "INSERT INTO chat_messages (journal_entry_id, step, sender, message_text) VALUES (?, ?, ?, ?)",
        entryId,
        line.step,
        line.sender,
        line.text,
      );
    }
  });

  return entryId;
}

export type EntryRow = {
  id: number;
  created_at: string;
  photo_path: string | null;
  child_question_text: string | null;
  finding_text: string | null;
};

// One row per saved exploration, newest first: what the journal list shows.
export async function listEntries(db: SQLiteDatabase): Promise<EntryRow[]> {
  return db.getAllAsync<EntryRow>(
    `SELECT e.id, e.created_at, o.photo_path, a.child_question_text, r.finding_text
   FROM journal_entries e
   LEFT JOIN step_observe o ON o.journal_entry_id = e.id
   LEFT JOIN step_ask     a ON a.journal_entry_id = e.id
   LEFT JOIN step_reflect r ON r.journal_entry_id = e.id
   ORDER BY e.created_at DESC, e.id DESC`,
  );
}

// One entry's chat, oldest first, for the entry detail screen.
export async function getEntryChat(
  db: SQLiteDatabase,
  id: number,
): Promise<ChatLine[]> {
  return db.getAllAsync<ChatLine>(
    `SELECT step, sender, message_text AS text
    FROM chat_messages
    WHERE journal_entry_id = ?
    ORDER BY id`,
    id,
  );
}
