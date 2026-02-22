import type Database from 'better-sqlite3';
import { addWord } from './words.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

interface WordEntry {
  word: string;
  category: string;
  difficulty: number;
  hint: string;
}

function findDataFile(): string {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(__dirname, '../../data/default-words.json'),  // dev: src/db/ -> data/
    path.resolve(__dirname, '../data/default-words.json'),     // built: dist/ -> data/
  ];
  for (const candidate of candidates) {
    try {
      readFileSync(candidate, 'utf-8');
      return candidate;
    } catch { /* try next */ }
  }
  throw new Error('default-words.json niet gevonden');
}

export function seedDatabase(db: Database.Database): number {
  const dataPath = findDataFile();
  const defaultWords: WordEntry[] = JSON.parse(readFileSync(dataPath, 'utf-8'));

  let count = 0;
  const insert = db.transaction(() => {
    for (const entry of defaultWords) {
      const id = addWord(db, {
        word: entry.word,
        category: entry.category,
        difficulty: entry.difficulty,
        hint: entry.hint,
      });
      if (id > 0) count++;
    }
  });
  insert();
  return count;
}
