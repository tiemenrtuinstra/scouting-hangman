import type Database from 'better-sqlite3';

export interface Word {
  id: number;
  word: string;
  category: string;
  difficulty: number;
  hint: string | null;
  times_played: number;
  times_won: number;
}

export interface AddWordInput {
  word: string;
  category: string;
  difficulty?: number;
  hint?: string;
}

export function addWord(db: Database.Database, input: AddWordInput): number {
  const difficulty = input.difficulty ?? calculateDifficulty(input.word);
  const stmt = db.prepare(
    'INSERT OR IGNORE INTO words (word, category, difficulty, hint) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(input.word.toLowerCase(), input.category, difficulty, input.hint ?? null);
  return Number(result.lastInsertRowid);
}

export function getRandomWord(
  db: Database.Database,
  options?: { difficulty?: number; category?: string }
): Word | undefined {
  let query = 'SELECT * FROM words';
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (options?.difficulty) {
    conditions.push('difficulty = ?');
    params.push(options.difficulty);
  }
  if (options?.category) {
    conditions.push('category = ?');
    params.push(options.category);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY RANDOM() LIMIT 1';

  return db.prepare(query).get(...params) as Word | undefined;
}

export function getAllCategories(db: Database.Database): string[] {
  const rows = db.prepare('SELECT DISTINCT category FROM words ORDER BY category').all() as { category: string }[];
  return rows.map(r => r.category);
}

export function incrementWordPlayed(db: Database.Database, wordId: number, won: boolean): void {
  if (won) {
    db.prepare('UPDATE words SET times_played = times_played + 1, times_won = times_won + 1 WHERE id = ?').run(wordId);
  } else {
    db.prepare('UPDATE words SET times_played = times_played + 1 WHERE id = ?').run(wordId);
  }
}

function calculateDifficulty(word: string): number {
  const len = word.length;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  return 3;
}
