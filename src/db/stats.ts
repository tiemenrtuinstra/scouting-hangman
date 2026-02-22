import type Database from 'better-sqlite3';

export interface Player {
  id: number;
  name: string;
  created_at: string;
}

export interface GameSessionInput {
  playerId: number;
  wordId: number;
  difficulty: string;
  won: boolean;
  wrongGuesses: number;
  guessedLetters: string[];
  durationSeconds: number;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  avgWrongGuesses: number;
  currentStreak: number;
  bestStreak: number;
  totalPlayTime: number;
  fastestWin: number | null;
  longestWord: string | null;
}

export interface LeaderboardEntry {
  name: string;
  wins: number;
  totalGames: number;
  winRate: number;
  bestStreak: number;
}

export function getOrCreatePlayer(db: Database.Database, name: string): Player {
  const existing = db.prepare('SELECT * FROM players WHERE name = ?').get(name) as Player | undefined;
  if (existing) return existing;

  const result = db.prepare('INSERT INTO players (name) VALUES (?)').run(name);
  return { id: Number(result.lastInsertRowid), name, created_at: new Date().toISOString() };
}

export function saveGameSession(db: Database.Database, input: GameSessionInput): number {
  const result = db.prepare(`
    INSERT INTO game_sessions (player_id, word_id, difficulty, won, wrong_guesses, guessed_letters, duration_seconds, finished_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    input.playerId,
    input.wordId,
    input.difficulty,
    input.won ? 1 : 0,
    input.wrongGuesses,
    JSON.stringify(input.guessedLetters),
    input.durationSeconds
  );
  return Number(result.lastInsertRowid);
}

export function getPlayerStats(db: Database.Database, playerId: number): PlayerStats {
  const row = db.prepare(`
    SELECT
      COUNT(*) as totalGames,
      SUM(CASE WHEN won = 1 THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN won = 0 THEN 1 ELSE 0 END) as losses,
      AVG(wrong_guesses) as avgWrongGuesses,
      SUM(duration_seconds) as totalPlayTime,
      MIN(CASE WHEN won = 1 THEN duration_seconds END) as fastestWin
    FROM game_sessions WHERE player_id = ?
  `).get(playerId) as any;

  const longestWordRow = db.prepare(`
    SELECT w.word FROM game_sessions gs
    JOIN words w ON gs.word_id = w.id
    WHERE gs.player_id = ? AND gs.won = 1
    ORDER BY LENGTH(w.word) DESC LIMIT 1
  `).get(playerId) as { word: string } | undefined;

  const streaks = calculateStreaks(db, playerId);

  return {
    totalGames: row.totalGames ?? 0,
    wins: row.wins ?? 0,
    losses: row.losses ?? 0,
    winRate: row.totalGames > 0 ? (row.wins / row.totalGames) * 100 : 0,
    avgWrongGuesses: row.avgWrongGuesses ?? 0,
    currentStreak: streaks.current,
    bestStreak: streaks.best,
    totalPlayTime: row.totalPlayTime ?? 0,
    fastestWin: row.fastestWin ?? null,
    longestWord: longestWordRow?.word ?? null,
  };
}

function calculateStreaks(db: Database.Database, playerId: number): { current: number; best: number } {
  const games = db.prepare(
    'SELECT won FROM game_sessions WHERE player_id = ? ORDER BY started_at DESC'
  ).all(playerId) as { won: number }[];

  let current = 0;
  let best = 0;
  let streak = 0;

  for (const game of games) {
    if (game.won) {
      streak++;
      if (streak > best) best = streak;
    } else {
      if (current === 0) current = streak;
      streak = 0;
    }
  }
  if (current === 0) current = streak;

  return { current, best };
}

export function getLeaderboard(db: Database.Database, limit = 10): LeaderboardEntry[] {
  return db.prepare(`
    SELECT
      p.name,
      COUNT(*) as totalGames,
      SUM(CASE WHEN gs.won = 1 THEN 1 ELSE 0 END) as wins,
      ROUND(CAST(SUM(CASE WHEN gs.won = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 1) as winRate
    FROM game_sessions gs
    JOIN players p ON gs.player_id = p.id
    GROUP BY p.id
    ORDER BY wins DESC, winRate DESC
    LIMIT ?
  `).all(limit) as LeaderboardEntry[];
}
