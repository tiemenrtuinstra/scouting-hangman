export type ExecutionerMood = 'neutraal' | 'onder_de_indruk' | 'sarcastisch' | 'gefrustreerd' | 'meedogenloos' | 'kindvriendelijk';

export type DialogueMoment = 'game_start' | 'correct_guess' | 'wrong_guess' | 'almost_dead' | 'win' | 'loss' | 'achievement' | 'streak';

export interface ExecutionerMemory {
  mood: ExecutionerMood;
  respectLevel: number;
}

export function determineMood(respectLevel: number, difficulty: string): ExecutionerMood {
  if (difficulty === 'makkelijk') return 'kindvriendelijk';
  if (difficulty === 'moeilijk') return 'meedogenloos';

  if (respectLevel >= 80) return 'gefrustreerd';
  if (respectLevel >= 65) return 'onder_de_indruk';
  if (respectLevel <= 30) return 'sarcastisch';
  return 'neutraal';
}
