export const THEME = {
  primary: '#4CAF50',      // Scouting green (brighter for readability)
  secondary: '#FFB300',    // Amber/gold (slightly brighter)
  accent: '#42A5F5',       // Blue (brighter for dark terminals)
  danger: '#EF5350',       // Red (brighter for readability)
  warning: '#FDD835',      // Yellow (brighter)
  success: '#66BB6A',      // Green (brighter for readability)
  muted: '#9E9E9E',        // Gray (brighter for dark terminals)
  text: '#FFFFFF',         // White
  bg: '#1A1A1A',           // Dark background
  highlight: '#A5D6A7',    // Light green highlight (brighter)
} as const;

export type ThemeColor = keyof typeof THEME;

export function getMoodColor(mood: string): string {
  const moodColors: Record<string, string> = {
    neutraal: THEME.muted,
    onder_de_indruk: THEME.success,
    sarcastisch: THEME.warning,
    gefrustreerd: THEME.danger,
    meedogenloos: '#E53935',
    kindvriendelijk: THEME.secondary,
  };
  return moodColors[mood] ?? THEME.muted;
}

export function getLetterColor(letter: string, word: string, guessedLetters: string[]): string {
  if (!guessedLetters.includes(letter.toLowerCase())) return THEME.muted;
  if (word.includes(letter.toLowerCase())) return THEME.success;
  return THEME.danger;
}

export function getHealthColor(wrongGuesses: number, maxGuesses: number): string {
  const remaining = maxGuesses - wrongGuesses;
  if (remaining <= 1) return THEME.danger;
  if (remaining <= 3) return THEME.warning;
  return THEME.success;
}
