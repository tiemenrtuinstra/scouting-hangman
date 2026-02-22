import type Database from 'better-sqlite3';
import { type ExecutionerMood, type DialogueMoment, determineMood, type ExecutionerMemory } from './moods.js';
import { DIALOGUES } from './dialogues.js';

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
): ExecutionerDialogue {
  const memory = getMemory(db, playerId);
  const mood = determineMood(memory.respectLevel, difficulty);
  const lines = DIALOGUES[mood][moment];
  const text = lines[Math.floor(Math.random() * lines.length)];

  return { text, mood, avatar: AVATARS[mood].join('\n') };
}

export function updateExecutionerMood(db: Database.Database, playerId: number, won: boolean): void {
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
  `).run(playerId, determineMood(newRespect, 'normaal'), newRespect);
}

export function getMemory(db: Database.Database, playerId: number): ExecutionerMemory {
  const row = db.prepare('SELECT mood, respect_level FROM executioner_memory WHERE player_id = ?').get(playerId) as { mood: ExecutionerMood; respect_level: number } | undefined;

  return row
    ? { mood: row.mood, respectLevel: row.respect_level }
    : { mood: 'neutraal', respectLevel: 50 };
}
