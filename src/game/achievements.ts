import type Database from 'better-sqlite3';
import { getPlayerStats } from '../db/stats.js';

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
  const newAchievements: string[] = [];

  const checks: [string, boolean][] = [
    ['eerste_stap', stats.wins >= 1],
    ['kampvuurmeester', stats.currentStreak >= 10],
    ['snelheidsduivel', gameWon && durationSeconds < 30],
    ['foutloos', gameWon && wrongGuesses === 0],
    ['doorbijer', stats.totalGames >= 50],
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
