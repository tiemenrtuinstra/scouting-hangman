import Database from 'better-sqlite3';
import { runMigrations } from './migrations.js';
import path from 'path';
import os from 'os';
import fs from 'fs';

let db: Database.Database | null = null;

function getDbPath(): string {
  const dataDir = path.join(os.homedir(), '.scouting-hangman');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'game.db');
}

export function getDatabase(dbPath?: string): Database.Database {
  if (db && db.open) return db;
  db = new Database(dbPath ?? getDbPath());
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function initializeDatabase(database?: Database.Database): void {
  const d = database ?? getDatabase();
  runMigrations(d);
}

export function closeDatabase(): void {
  if (db && db.open) {
    db.close();
    db = null;
  }
}
