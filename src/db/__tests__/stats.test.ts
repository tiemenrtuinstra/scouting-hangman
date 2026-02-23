import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase, initializeDatabase, closeDatabase } from '../database.js';
import { addWord } from '../words.js';
import { getOrCreatePlayer, saveGameSession, getPlayerStats, getAllPlayers, renamePlayer, resetPlayerStats, getLeaderboard } from '../stats.js';

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
      score: 150,
    });

    const stats = getPlayerStats(db, player.id);
    expect(stats.totalGames).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(0);
    expect(stats.totalScore).toBe(150);
  });

  it('should calculate streaks correctly', () => {
    const player = getOrCreatePlayer(db, 'Tiemen');
    const wordId = addWord(db, { word: 'test', category: 'test', difficulty: 1 });

    // Win 3, lose 1, win 2
    for (const won of [true, true, true, false, true, true]) {
      saveGameSession(db, {
        playerId: player.id, wordId, difficulty: 'normaal',
        won, wrongGuesses: won ? 0 : 8,
        guessedLetters: [], durationSeconds: 10, score: won ? 100 : 0,
      });
    }

    const stats = getPlayerStats(db, player.id);
    expect(stats.currentStreak).toBe(2);
    expect(stats.bestStreak).toBe(3);
  });

  it('should track all-wins streak correctly', () => {
    const player = getOrCreatePlayer(db, 'Tiemen');
    const wordId = addWord(db, { word: 'test', category: 'test', difficulty: 1 });

    for (let i = 0; i < 5; i++) {
      saveGameSession(db, {
        playerId: player.id, wordId, difficulty: 'normaal',
        won: true, wrongGuesses: 0,
        guessedLetters: [], durationSeconds: 10, score: 100,
      });
    }

    const stats = getPlayerStats(db, player.id);
    expect(stats.currentStreak).toBe(5);
    expect(stats.bestStreak).toBe(5);
  });

  it('should list all players', () => {
    getOrCreatePlayer(db, 'Alice');
    getOrCreatePlayer(db, 'Bob');
    const players = getAllPlayers(db);
    expect(players).toHaveLength(2);
    expect(players.map(p => p.name)).toContain('Alice');
  });

  it('should rename player', () => {
    const player = getOrCreatePlayer(db, 'OldName');
    const result = renamePlayer(db, player.id, 'NewName');
    expect(result.success).toBe(true);
    const players = getAllPlayers(db);
    expect(players[0].name).toBe('NewName');
  });

  it('should prevent duplicate name on rename', () => {
    const p1 = getOrCreatePlayer(db, 'Alice');
    getOrCreatePlayer(db, 'Bob');
    const result = renamePlayer(db, p1.id, 'Bob');
    expect(result.success).toBe(false);
  });

  it('should reset player stats', () => {
    const player = getOrCreatePlayer(db, 'Tiemen');
    const wordId = addWord(db, { word: 'test', category: 'test', difficulty: 1 });
    saveGameSession(db, {
      playerId: player.id, wordId, difficulty: 'normaal',
      won: true, wrongGuesses: 0,
      guessedLetters: [], durationSeconds: 10, score: 100,
    });
    resetPlayerStats(db, player.id);
    const stats = getPlayerStats(db, player.id);
    expect(stats.totalGames).toBe(0);
  });

  it('should generate leaderboard sorted by score', () => {
    const p1 = getOrCreatePlayer(db, 'HighScorer');
    const p2 = getOrCreatePlayer(db, 'LowScorer');
    const wordId = addWord(db, { word: 'test', category: 'test', difficulty: 1 });

    saveGameSession(db, {
      playerId: p1.id, wordId, difficulty: 'normaal',
      won: true, wrongGuesses: 0, guessedLetters: [], durationSeconds: 10, score: 500,
    });
    saveGameSession(db, {
      playerId: p2.id, wordId, difficulty: 'normaal',
      won: true, wrongGuesses: 3, guessedLetters: [], durationSeconds: 30, score: 100,
    });

    const lb = getLeaderboard(db);
    expect(lb[0].name).toBe('HighScorer');
    expect(lb[0].totalScore).toBe(500);
  });
});
