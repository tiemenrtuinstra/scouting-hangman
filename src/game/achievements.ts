import type Database from 'better-sqlite3';
import { getPlayerStats } from '../db/stats.js';
import { getMemory } from '../executioner/personality.js';

export type AchievementTier = 'brons' | 'zilver' | 'goud';

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  icon: string;
  tier?: AchievementTier;
  group?: string;
}

const TIER_ICONS: Record<AchievementTier, string> = {
  brons: '🥉',
  zilver: '🥈',
  goud: '🥇',
};

export function getTierIcon(tier: AchievementTier): string {
  return TIER_ICONS[tier];
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // === Original standalone ===
  { key: 'eerste_stap', name: 'Eerste Stap', description: 'Win je eerste spel', icon: '🎯' },
  { key: 'foutloos', name: 'Foutloos', description: 'Win zonder foute letters', icon: '💎' },
  { key: 'scoutingkenner', name: 'Scoutingkenner', description: 'Win in elke categorie', icon: '🏅' },
  { key: 'beul_verslagen', name: 'De Beul Verslagen', description: 'Bereik maximaal respect bij de beul', icon: '👑' },
  { key: 'knopenexpert', name: 'Knopenexpert', description: 'Raad 5 knopen-woorden correct', icon: '🪢' },

  // === Tiered: wins ===
  { key: 'winnaar_brons', name: 'Winnaar', description: 'Win 5 spellen', icon: '🏆', tier: 'brons', group: 'wins' },
  { key: 'winnaar_zilver', name: 'Ervaren Winnaar', description: 'Win 25 spellen', icon: '🏆', tier: 'zilver', group: 'wins' },
  { key: 'winnaar_goud', name: 'Meester Winnaar', description: 'Win 100 spellen', icon: '🏆', tier: 'goud', group: 'wins' },

  // === Tiered: streak ===
  { key: 'reeks_brons', name: 'Op Dreef', description: 'Win 3 spellen op rij', icon: '🔥', tier: 'brons', group: 'streak' },
  { key: 'reeks_zilver', name: 'Onstopbaar', description: 'Win 15 spellen op rij', icon: '🔥', tier: 'zilver', group: 'streak' },
  { key: 'reeks_goud', name: 'Legendarisch', description: 'Win 25 spellen op rij', icon: '🔥', tier: 'goud', group: 'streak' },

  // === Tiered: speed ===
  { key: 'bliksem_brons', name: 'Bliksemschicht', description: 'Win in minder dan 20 seconden', icon: '⚡', tier: 'brons', group: 'speed' },
  { key: 'bliksem_zilver', name: 'Tijdreiziger', description: 'Win in minder dan 15 seconden', icon: '⚡', tier: 'zilver', group: 'speed' },

  // === Tiered: games played ===
  { key: 'doorbijer', name: 'Doorbijer', description: 'Speel 50 spellen', icon: '🏋️', tier: 'brons', group: 'games' },
  { key: 'nachtbraker', name: 'Nachtbraker', description: 'Speel 20+ spellen', icon: '🌙', tier: undefined, group: undefined },

  // === Standalone: special conditions ===
  { key: 'hardleers', name: 'Hardleers', description: 'Win na 5 verliezen op rij', icon: '🧠' },
  { key: 'zuinig', name: 'Zuinig', description: 'Win 10 spellen zonder hint', icon: '🤐' },
  { key: 'woordenboek', name: 'Woordenboek', description: 'Win een woord met 10+ letters', icon: '📖' },
  { key: 'lang_woord_meester', name: 'Lang Woord Meester', description: 'Win een woord met 14+ letters', icon: '📚' },
  { key: 'snelheidsduivel', name: 'Snelheidsduivel', description: 'Win in minder dan 30 seconden', icon: '⚡' },
  { key: 'kampvuurmeester', name: 'Kampvuurmeester', description: 'Win 10 spellen op rij', icon: '🔥' },
  { key: 'marathonloper', name: 'Marathonloper', description: '60+ minuten totale speeltijd', icon: '🏃' },
  { key: 'perfectionist', name: 'Perfectionist', description: '5 foutloze wins op rij', icon: '✨' },
  { key: 'alleskunner', name: 'Alleskunner', description: 'Score 500+ in één spel', icon: '🌟' },

  // === Category-specific ===
  { key: 'waterman', name: 'Waterman', description: 'Win 5 waterscouting-woorden', icon: '🌊' },
  { key: 'natuurkenner', name: 'Natuurkenner', description: 'Win 5 natuur-woorden', icon: '🌿' },
  { key: 'ehbo_held', name: 'EHBO Held', description: 'Win 5 ehbo-woorden', icon: '🩹' },
  { key: 'zeebonk', name: 'Zeebonk', description: 'Win 5 zeilen-woorden', icon: '⛵' },
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

function getCategoryWins(db: Database.Database, playerId: number, category: string): number {
  const row = db.prepare(
    `SELECT COUNT(*) as cnt FROM game_sessions gs
     JOIN words w ON gs.word_id = w.id
     WHERE gs.player_id = ? AND gs.won = 1 AND w.category = ?`
  ).get(playerId, category) as { cnt: number };
  return row.cnt;
}

function getWinsWithoutHint(db: Database.Database, playerId: number): number {
  const row = db.prepare(
    `SELECT COUNT(*) as cnt FROM game_sessions
     WHERE player_id = ? AND won = 1 AND (hint_used = 0 OR hint_used IS NULL)`
  ).get(playerId) as { cnt: number };
  return row.cnt;
}

function getLongestWonWordLength(db: Database.Database, playerId: number): number {
  const row = db.prepare(
    `SELECT MAX(LENGTH(REPLACE(w.word, ' ', ''))) as maxLen FROM game_sessions gs
     JOIN words w ON gs.word_id = w.id
     WHERE gs.player_id = ? AND gs.won = 1`
  ).get(playerId) as { maxLen: number | null };
  return row.maxLen ?? 0;
}

function hadLossStreakThenWin(db: Database.Database, playerId: number): boolean {
  // Check if most recent game is a win and the 5 before it were all losses
  const games = db.prepare(
    'SELECT won FROM game_sessions WHERE player_id = ? ORDER BY started_at DESC, id DESC LIMIT 6'
  ).all(playerId) as { won: number }[];
  if (games.length < 6) return false;
  if (!games[0].won) return false; // most recent must be a win
  return games.slice(1, 6).every(g => !g.won); // 5 before it were losses
}

function getPerfectWinStreak(db: Database.Database, playerId: number): number {
  // Count consecutive most-recent wins with 0 wrong guesses
  const games = db.prepare(
    'SELECT won, wrong_guesses FROM game_sessions WHERE player_id = ? ORDER BY started_at DESC, id DESC'
  ).all(playerId) as { won: number; wrong_guesses: number }[];
  let streak = 0;
  for (const g of games) {
    if (g.won && g.wrong_guesses === 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function checkNewAchievements(
  db: Database.Database,
  playerId: number,
  gameWon: boolean,
  wrongGuesses: number,
  durationSeconds: number,
  _category: string,
  score?: number,
  hintUsed?: boolean,
): string[] {
  const stats = getPlayerStats(db, playerId);
  const existing = getUnlockedAchievements(db, playerId);
  const memory = getMemory(db, playerId);
  const newAchievements: string[] = [];

  const longestWordLen = getLongestWonWordLength(db, playerId);

  const checks: [string, boolean][] = [
    // Original
    ['eerste_stap', stats.wins >= 1],
    ['kampvuurmeester', stats.bestStreak >= 10],
    ['snelheidsduivel', gameWon && durationSeconds < 30],
    ['foutloos', gameWon && wrongGuesses === 0],
    ['doorbijer', stats.totalGames >= 50],
    ['scoutingkenner', hasWonInAllCategories(db, playerId)],
    ['beul_verslagen', memory.respectLevel >= 100],
    ['knopenexpert', getCategoryWins(db, playerId, 'knopen') >= 5],

    // Tiered: wins
    ['winnaar_brons', stats.wins >= 5],
    ['winnaar_zilver', stats.wins >= 25],
    ['winnaar_goud', stats.wins >= 100],

    // Tiered: streak
    ['reeks_brons', stats.bestStreak >= 3],
    ['reeks_zilver', stats.bestStreak >= 15],
    ['reeks_goud', stats.bestStreak >= 25],

    // Tiered: speed
    ['bliksem_brons', gameWon && durationSeconds < 20],
    ['bliksem_zilver', gameWon && durationSeconds < 15],

    // Games played
    ['nachtbraker', stats.totalGames >= 20],

    // Special conditions
    ['hardleers', hadLossStreakThenWin(db, playerId)],
    ['zuinig', getWinsWithoutHint(db, playerId) >= 10],
    ['woordenboek', longestWordLen >= 10],
    ['lang_woord_meester', longestWordLen >= 14],
    ['marathonloper', stats.totalPlayTime >= 3600],
    ['perfectionist', getPerfectWinStreak(db, playerId) >= 5],
    ['alleskunner', (score ?? 0) >= 500],

    // Category-specific
    ['waterman', getCategoryWins(db, playerId, 'waterscouting') >= 5],
    ['natuurkenner', getCategoryWins(db, playerId, 'natuur') >= 5],
    ['ehbo_held', getCategoryWins(db, playerId, 'ehbo') >= 5],
    ['zeebonk', getCategoryWins(db, playerId, 'zeilen') >= 5],
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
