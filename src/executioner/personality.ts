import type Database from 'better-sqlite3';
import { type ExecutionerMood, type DialogueMoment, determineMood, type ExecutionerMemory } from './moods.js';
import { DIALOGUES } from './dialogues.js';
import { type DialogueContext, selectLine } from './templates.js';

export interface ExecutionerDialogue {
  text: string;
  mood: ExecutionerMood;
  avatar: string;
}

const AVATARS: Record<ExecutionerMood, string[]> = {
  neutraal: [
    '╭─────╮',
    '│ •_• │',
    '╰──┬──╯',
    '  /│\\',
    '  / \\',
  ],
  onder_de_indruk: [
    '╭─────╮',
    '│ O_O │',
    '╰──┬──╯',
    '  /│\\',
    '  / \\',
  ],
  sarcastisch: [
    '╭─────╮',
    '│ ¬_¬ │',
    '╰──┬──╯',
    '  /│\\',
    '  / \\',
  ],
  gefrustreerd: [
    '╭─────╮',
    '│ >_< │',
    '╰──┬──╯',
    '  /│\\',
    '  / \\',
  ],
  meedogenloos: [
    '╭─────╮',
    '│ ☠_☠ │',
    '╰──┬──╯',
    '  /│\\',
    '  / \\',
  ],
  kindvriendelijk: [
    '╭─────╮',
    '│ ^_^ │',
    '╰──┬──╯',
    '  /│\\',
    '  / \\',
  ],
};

export function getAvatar(mood: ExecutionerMood): string[] {
  return AVATARS[mood];
}

export function getExecutionerDialogue(
  db: Database.Database,
  playerId: number,
  moment: DialogueMoment,
  difficulty: string,
  context?: Partial<DialogueContext>,
): ExecutionerDialogue {
  const memory = getMemory(db, playerId);
  const mood = determineMood(memory.respectLevel, difficulty);
  const lines = DIALOGUES[mood][moment];

  let text: string;

  if (context) {
    // Build full context with defaults for any missing fields
    const fullCtx: DialogueContext = {
      playerName: context.playerName ?? 'scout',
      streak: context.streak ?? 0,
      totalWins: context.totalWins ?? 0,
      totalGames: context.totalGames ?? 0,
      winRate: context.winRate ?? 0,
      category: context.category ?? '',
      wordLength: context.wordLength ?? 0,
      score: context.score ?? 0,
      difficulty: context.difficulty ?? difficulty,
      remainingLives: context.remainingLives ?? 8,
      wrongGuesses: context.wrongGuesses ?? 0,
      hintUsed: context.hintUsed ?? false,
      respectLevel: memory.respectLevel,
      mood,
      moment,
    };

    text = selectLine(lines, fullCtx) ?? lines[Math.floor(Math.random() * lines.length)].text;
  } else {
    // Legacy path: simple random selection
    text = lines[Math.floor(Math.random() * lines.length)].text;
  }

  return { text, mood, avatar: AVATARS[mood].join('\n') };
}

export function updateExecutionerMood(db: Database.Database, playerId: number, won: boolean, difficulty: string): void {
  const memory = getMemory(db, playerId);
  const delta = won ? 5 : -3;
  const newRespect = Math.max(0, Math.min(100, memory.respectLevel + delta));

  db.prepare(`
    INSERT INTO executioner_memory (player_id, mood, respect_level, last_interaction)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(player_id) DO UPDATE SET
      mood = excluded.mood,
      respect_level = excluded.respect_level,
      last_interaction = CURRENT_TIMESTAMP
  `).run(playerId, determineMood(newRespect, difficulty), newRespect);
}

export function getMemory(db: Database.Database, playerId: number): ExecutionerMemory {
  const row = db.prepare('SELECT mood, respect_level FROM executioner_memory WHERE player_id = ?').get(playerId) as { mood: ExecutionerMood; respect_level: number } | undefined;

  return row
    ? { mood: row.mood, respectLevel: row.respect_level }
    : { mood: 'neutraal', respectLevel: 50 };
}
