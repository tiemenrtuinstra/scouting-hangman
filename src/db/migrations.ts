import type Database from 'better-sqlite3';

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      difficulty INTEGER DEFAULT 1,
      hint TEXT,
      times_played INTEGER DEFAULT 0,
      times_won INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      word_id INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      won BOOLEAN NOT NULL,
      wrong_guesses INTEGER NOT NULL,
      guessed_letters TEXT NOT NULL,
      duration_seconds INTEGER,
      score INTEGER DEFAULT 0,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      finished_at DATETIME,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (word_id) REFERENCES words(id)
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      achievement_key TEXT NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id),
      UNIQUE(player_id, achievement_key)
    );

    CREATE TABLE IF NOT EXISTS executioner_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      mood TEXT NOT NULL DEFAULT 'neutraal',
      respect_level INTEGER DEFAULT 50,
      last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id),
      UNIQUE(player_id)
    );

    -- Indexes for frequently queried columns
    CREATE INDEX IF NOT EXISTS idx_game_sessions_player ON game_sessions(player_id);
    CREATE INDEX IF NOT EXISTS idx_game_sessions_word ON game_sessions(word_id);
    CREATE INDEX IF NOT EXISTS idx_achievements_player ON achievements(player_id);
    CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
    CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words(difficulty);
  `);

  // Add score column to existing databases (safe to re-run)
  addColumnIfNotExists(db, 'game_sessions', 'score', 'INTEGER DEFAULT 0');
  addColumnIfNotExists(db, 'game_sessions', 'hint_used', 'BOOLEAN DEFAULT 0');
}

function addColumnIfNotExists(db: Database.Database, table: string, column: string, definition: string): void {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!columns.some(c => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
