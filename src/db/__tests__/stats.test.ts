import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase, initializeDatabase, closeDatabase } from '../database.js';
import { addWord } from '../words.js';
import { getOrCreatePlayer, saveGameSession, getPlayerStats } from '../stats.js';

describe('Stats', () => {
  let db: ReturnType<typeof getDatabase>;

  beforeEach(() => {
    closeDatabase();
    db = getDatabase(':memory:');
    initializeDatabase(db);
  });

  it('should create a player', () => {
    const player = getOrCreatePlayer(db, 'Tiemen');
    expect(player.id).toBeGreaterThan(0);
    expect(player.name).toBe('Tiemen');
  });

  it('should return existing player on second call', () => {
    const p1 = getOrCreatePlayer(db, 'Tiemen');
    const p2 = getOrCreatePlayer(db, 'Tiemen');
    expect(p1.id).toBe(p2.id);
  });

  it('should save and retrieve game stats', () => {
    const player = getOrCreatePlayer(db, 'Tiemen');
    const wordId = addWord(db, { word: 'kampvuur', category: 'kamperen', difficulty: 1 });

    saveGameSession(db, {
      playerId: player.id,
      wordId,
      difficulty: 'normaal',
      won: true,
      wrongGuesses: 3,
      guessedLetters: ['a', 'e', 'k', 'm', 'p', 'v', 'u', 'r'],
      durationSeconds: 45,
    });

    const stats = getPlayerStats(db, player.id);
    expect(stats.totalGames).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(0);
  });
});
