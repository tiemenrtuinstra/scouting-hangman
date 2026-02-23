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
  score: number;
  hintUsed?: boolean;
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
  totalScore: number;
  fastestWin: number | null;
  longestWord: string | null;
}

export interface LeaderboardEntry {
  name: string;
  wins: number;
  totalGames: number;
  winRate: number;
  totalScore: number;
}

export function getOrCreatePlayer(db: Database.Database, name: string): Player {
  const existing = db.prepare('SELECT * FROM players WHERE name = ?').get(name) as Player | undefined;
  if (existing) return existing;

  const result = db.prepare('INSERT INTO players (name) VALUES (?)').run(name);
  return { id: Number(result.lastInsertRowid), name, created_at: new Date().toISOString() };
}

export function saveGameSession(db: Database.Database, input: GameSessionInput): number {
  const result = db.prepare(`
    INSERT INTO game_sessions (player_id, word_id, difficulty, won, wrong_guesses, guessed_letters, duration_seconds, score, hint_used, finished_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    input.playerId,
    input.wordId,
    input.difficulty,
    input.won ? 1 : 0,
    input.wrongGuesses,
    JSON.stringify(input.guessedLetters),
    input.durationSeconds,
    input.score,
    input.hintUsed ? 1 : 0
  );
  return Number(result.lastInsertRowid);
}

interface StatsRow {
  totalGames: number;
  wins: number | null;
  losses: number | null;
  avgWrongGuesses: number | null;
  totalPlayTime: number | null;
  totalScore: number | null;
  fastestWin: number | null;
}

export function getPlayerStats(db: Database.Database, playerId: number): PlayerStats {
  const row = db.prepare(`
    SELECT
      COUNT(*) as totalGames,
      SUM(CASE WHEN won = 1 THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN won = 0 THEN 1 ELSE 0 END) as losses,
      AVG(wrong_guesses) as avgWrongGuesses,
      SUM(duration_seconds) as totalPlayTime,
      COALESCE(SUM(score), 0) as totalScore,
      MIN(CASE WHEN won = 1 THEN duration_seconds END) as fastestWin
    FROM game_sessions WHERE player_id = ?
  `).get(playerId) as StatsRow;

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
    winRate: row.totalGames > 0 ? ((row.wins ?? 0) / row.totalGames) * 100 : 0,
    avgWrongGuesses: row.avgWrongGuesses ?? 0,
    currentStreak: streaks.current,
    bestStreak: streaks.best,
    totalPlayTime: row.totalPlayTime ?? 0,
    totalScore: row.totalScore ?? 0,
    fastestWin: row.fastestWin ?? null,
    longestWord: longestWordRow?.word ?? null,
  };
}

function calculateStreaks(db: Database.Database, playerId: number): { current: number; best: number } {
  const games = db.prepare(
    'SELECT won FROM game_sessions WHERE player_id = ? ORDER BY started_at DESC, id DESC'
  ).all(playerId) as { won: number }[];

  let best = 0;
  let streak = 0;
  let currentFound = false;
  let current = 0;

  for (const game of games) {
    if (game.won) {
      streak++;
      if (streak > best) best = streak;
    } else {
      if (!currentFound) {
        current = streak;
        currentFound = true;
      }
      streak = 0;
    }
  }
  // If no loss was found, the entire history is one streak
  if (!currentFound) current = streak;

  return { current, best };
}

export function getAllPlayers(db: Database.Database): Player[] {
  return db.prepare('SELECT * FROM players ORDER BY name').all() as Player[];
}

export function renamePlayer(db: Database.Database, playerId: number, newName: string): { success: boolean; error?: string } {
  const conflict = db.prepare('SELECT id FROM players WHERE name = ? AND id != ?').get(newName, playerId);
  if (conflict) return { success: false, error: 'Deze naam is al in gebruik' };
  db.prepare('UPDATE players SET name = ? WHERE id = ?').run(newName, playerId);
  return { success: true };
}

export function resetPlayerStats(db: Database.Database, playerId: number): void {
  db.prepare('DELETE FROM game_sessions WHERE player_id = ?').run(playerId);
  db.prepare('DELETE FROM executioner_memory WHERE player_id = ?').run(playerId);
}

export function resetPlayerAchievements(db: Database.Database, playerId: number): void {
  db.prepare('DELETE FROM achievements WHERE player_id = ?').run(playerId);
}

export function getLeaderboard(db: Database.Database, limit = 10): LeaderboardEntry[] {
  return db.prepare(`
    SELECT
      p.name,
      COUNT(*) as totalGames,
      SUM(CASE WHEN gs.won = 1 THEN 1 ELSE 0 END) as wins,
      ROUND(CAST(SUM(CASE WHEN gs.won = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 1) as winRate,
      COALESCE(SUM(gs.score), 0) as totalScore
    FROM game_sessions gs
    JOIN players p ON gs.player_id = p.id
    GROUP BY p.id
    ORDER BY totalScore DESC, wins DESC, winRate DESC
    LIMIT ?
  `).all(limit) as LeaderboardEntry[];
}
