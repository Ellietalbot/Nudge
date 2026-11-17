export const schema = `PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    input_type TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
   );

CREATE TABLE IF NOT EXISTS step_observe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_entry_id INTEGER NOT NULL UNIQUE,
    photo_path TEXT,
    question_text TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
   );
CREATE TABLE IF NOT EXISTS step_ask (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_entry_id INTEGER NOT NULL UNIQUE,
    ai_question_text TEXT,
    child_question_text TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
   );

CREATE TABLE IF NOT EXISTS step_hypothesize (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_entry_id INTEGER NOT NULL UNIQUE,
    hypothesis_text TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
   );
CREATE TABLE IF NOT EXISTS step_investigate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_entry_id INTEGER NOT NULL UNIQUE,
    experiment_text TEXT,
    result_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE   
    );

CREATE TABLE IF NOT EXISTS step_reflect (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_entry_id INTEGER NOT NULL UNIQUE,
    finding_text TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
   );
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_entry_id INTEGER NOT NULL,
    step TEXT NOT NULL CHECK (step IN ('observe', 'ask', 'hypothesize', 'investigate', 'reflect')),
    message_text TEXT,
    sender TEXT NOT NULL CHECK (sender IN ('child', 'nudge')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
   );`;

// v2: the exploration's safety level (the most cautious any step reported),
// so the parent dashboard can show it. ALTER, not CREATE: real entries exist.
export const migrationV2 = `ALTER TABLE journal_entries
  ADD COLUMN safety_level TEXT NOT NULL DEFAULT 'none'
  CHECK (safety_level IN ('none', 'caution', 'askAdult', 'doNotTouch', 'stop'));`;
