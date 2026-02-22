export type DifficultyLevel = 'makkelijk' | 'normaal' | 'moeilijk';

export interface DifficultyConfig {
  label: string;
  dbDifficulty: number[];
  description: string;
}

export const DIFFICULTIES: Record<DifficultyLevel, DifficultyConfig> = {
  makkelijk: {
    label: 'Makkelijk',
    dbDifficulty: [1],
    description: 'Korte woorden, vriendelijke beul',
  },
  normaal: {
    label: 'Normaal',
    dbDifficulty: [1, 2],
    description: 'Gemiddelde woorden, humoristische beul',
  },
  moeilijk: {
    label: 'Moeilijk',
    dbDifficulty: [2, 3],
    description: 'Lange woorden, meedogenloze beul',
  },
};
