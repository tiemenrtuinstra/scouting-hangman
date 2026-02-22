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

export function seedDatabase(db: Database.Database): number {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dataPath = path.resolve(__dirname, '../../data/default-words.json');
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
