import type Database from 'better-sqlite3';
import { getPlayerStats } from '../db/stats.js';
import { getMemory } from '../executioner/personality.js';

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: 'eerste_stap', name: 'Eerste Stap', description: 'Win je eerste spel', icon: '🎯' },
  { key: 'kampvuurmeester', name: 'Kampvuurmeester', description: 'Win 10 spellen op rij', icon: '🔥' },
  { key: 'snelheidsduivel', name: 'Snelheidsduivel', description: 'Win een spel in minder dan 30 seconden', icon: '⚡' },
  { key: 'foutloos', name: 'Foutloos', description: 'Win zonder foute letters', icon: '💎' },
  { key: 'doorbijer', name: 'Doorbijer', description: 'Speel 50 spellen', icon: '🏋️' },
  { key: 'scoutingkenner', name: 'Scoutingkenner', description: 'Win in elke categorie', icon: '🏅' },
  { key: 'beul_verslagen', name: 'De Beul Verslagen', description: 'Bereik maximaal respect bij de beul', icon: '👑' },
  { key: 'knopenexpert', name: 'Knopenexpert', description: 'Raad 5 knopen-woorden correct', icon: '🪢' },
];

function hasWonInAllCategories(db: Database.Database, playerId: number): boolean {
  const allCategories = db.prepare('SELECT DISTINCT category FROM words').all() as { category: string }[];
  const wonCategories = db.prepare(
    `SELECT DISTINCT w.category FROM game_sessions gs
     JOIN words w ON gs.word_id = w.id
     WHERE gs.player_id = ? AND gs.won = 1`
  ).all(playerId) as { category: string }[];
  return allCategories.length > 0 && wonCategories.length >= allCategories.length;
}

function getKnopenWins(db: Database.Database, playerId: number): number {
  const row = db.prepare(
    `SELECT COUNT(*) as cnt FROM game_sessions gs
     JOIN words w ON gs.word_id = w.id
     WHERE gs.player_id = ? AND gs.won = 1 AND w.category = 'knopen'`
  ).get(playerId) as { cnt: number };
  return row.cnt;
}

export function checkNewAchievements(
  db: Database.Database,
  playerId: number,
  gameWon: boolean,
  wrongGuesses: number,
  durationSeconds: number,
  _category: string,
): string[] {
  const stats = getPlayerStats(db, playerId);
  const existing = getUnlockedAchievements(db, playerId);
  const memory = getMemory(db, playerId);
  const newAchievements: string[] = [];

  const checks: [string, boolean][] = [
    ['eerste_stap', stats.wins >= 1],
    ['kampvuurmeester', stats.currentStreak >= 10],
    ['snelheidsduivel', gameWon && durationSeconds < 30],
    ['foutloos', gameWon && wrongGuesses === 0],
    ['doorbijer', stats.totalGames >= 50],
    ['scoutingkenner', hasWonInAllCategories(db, playerId)],
    ['beul_verslagen', memory.respectLevel >= 100],
    ['knopenexpert', getKnopenWins(db, playerId) >= 5],
  ];

  for (const [key, condition] of checks) {
    if (condition && !existing.includes(key)) {
      unlockAchievement(db, playerId, key);
      newAchievements.push(key);
    }
  }

  return newAchievements;
}

export function unlockAchievement(db: Database.Database, playerId: number, key: string): void {
  db.prepare('INSERT OR IGNORE INTO achievements (player_id, achievement_key) VALUES (?, ?)').run(playerId, key);
}

export function getUnlockedAchievements(db: Database.Database, playerId: number): string[] {
  const rows = db.prepare('SELECT achievement_key FROM achievements WHERE player_id = ?').all(playerId) as { achievement_key: string }[];
  return rows.map(r => r.achievement_key);
}
