import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase, initializeDatabase, closeDatabase } from '../database.js';
import { addWord, getRandomWord, getAllCategories } from '../words.js';

describe('Words', () => {
  let db: ReturnType<typeof getDatabase>;

  beforeEach(() => {
    closeDatabase();
    db = getDatabase(':memory:');
    initializeDatabase(db);
  });

  it('should add a word', () => {
    const id = addWord(db, { word: 'kampvuur', category: 'kamperen', difficulty: 1, hint: 'Brandt in het midden van het kamp' });
    expect(id).toBeGreaterThan(0);
  });

  it('should get a random word', () => {
    addWord(db, { word: 'kampvuur', category: 'kamperen', difficulty: 1 });
    addWord(db, { word: 'sjorren', category: 'scouting', difficulty: 2 });
    const word = getRandomWord(db);
    expect(word).toBeDefined();
    expect(['kampvuur', 'sjorren']).toContain(word!.word);
  });

  it('should get a random word by difficulty', () => {
    addWord(db, { word: 'tent', category: 'kamperen', difficulty: 1 });
    addWord(db, { word: 'vlaggenparade', category: 'scouting', difficulty: 3 });
    const word = getRandomWord(db, { difficulty: 1 });
    expect(word!.word).toBe('tent');
  });

  it('should list all categories', () => {
    addWord(db, { word: 'kampvuur', category: 'kamperen', difficulty: 1 });
    addWord(db, { word: 'sjorren', category: 'scouting', difficulty: 2 });
    const categories = getAllCategories(db);
    expect(categories).toContain('kamperen');
    expect(categories).toContain('scouting');
  });
});
