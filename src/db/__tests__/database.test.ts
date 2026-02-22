import { describe, it, expect, afterEach } from 'vitest';
import { getDatabase, closeDatabase, initializeDatabase } from '../database.js';

describe('Database', () => {
  afterEach(() => {
    closeDatabase();
  });

  it('should create an in-memory database for testing', () => {
    const db = getDatabase(':memory:');
    expect(db).toBeDefined();
    expect(db.open).toBe(true);
  });

  it('should initialize all tables', () => {
    const db = getDatabase(':memory:');
    initializeDatabase(db);

    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all() as { name: string }[];

    const tableNames = tables.map(t => t.name);
    expect(tableNames).toContain('players');
    expect(tableNames).toContain('words');
    expect(tableNames).toContain('game_sessions');
    expect(tableNames).toContain('achievements');
    expect(tableNames).toContain('executioner_memory');
  });
});
