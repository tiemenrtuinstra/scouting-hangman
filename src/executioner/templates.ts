import type { ExecutionerMood, DialogueMoment } from './moods.js';

/** All data available for dialogue template interpolation and conditions. */
export interface DialogueContext {
  playerName: string;
  streak: number;
  totalWins: number;
  totalGames: number;
  winRate: number;
  category: string;
  wordLength: number;
  score: number;
  difficulty: string;
  remainingLives: number;
  wrongGuesses: number;
  hintUsed: boolean;
  respectLevel: number;
  mood: ExecutionerMood;
  moment: DialogueMoment;
}

/** A single dialogue line with optional condition and weight. */
export interface DialogueLine {
  text: string;
  /** Only include this line if condition returns true. Omit = always eligible. */
  condition?: (ctx: DialogueContext) => boolean;
  /** Higher weight = more likely to be picked. Default = 1. */
  weight?: number;
}

/** Dialogue map: mood → moment → DialogueLine[] */
export type DialogueMap = Record<ExecutionerMood, Record<DialogueMoment, DialogueLine[]>>;

/**
 * Replace {key} placeholders in a template string with values from context.
 * Unknown keys are left as-is.
 */
export function interpolate(template: string, ctx: DialogueContext): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = (ctx as unknown as Record<string, unknown>)[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

/**
 * Filter eligible lines by condition, then pick one using weighted random selection.
 * Returns null if no lines are eligible.
 */
export function selectLine(lines: DialogueLine[], ctx: DialogueContext): string | null {
  const eligible = lines.filter(line => !line.condition || line.condition(ctx));
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, line) => sum + (line.weight ?? 1), 0);
  let roll = Math.random() * totalWeight;

  for (const line of eligible) {
    roll -= line.weight ?? 1;
    if (roll <= 0) {
      return interpolate(line.text, ctx);
    }
  }

  // Fallback (shouldn't happen due to math, but safety net)
  return interpolate(eligible[eligible.length - 1].text, ctx);
}
