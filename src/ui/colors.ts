export const THEME = {
  primary: '#2E7D32',      // Scouting green
  secondary: '#FFA000',    // Amber/gold
  accent: '#1565C0',       // Blue
  danger: '#C62828',       // Red
  warning: '#F57F17',      // Yellow-orange
  success: '#2E7D32',      // Green
  muted: '#757575',        // Gray
  text: '#FFFFFF',         // White
  bg: '#1A1A1A',           // Dark background
  highlight: '#81C784',    // Light green highlight
} as const;

export type ThemeColor = keyof typeof THEME;

export function getMoodColor(mood: string): string {
  const moodColors: Record<string, string> = {
    neutraal: THEME.muted,
    onder_de_indruk: THEME.success,
    sarcastisch: THEME.warning,
    gefrustreerd: THEME.danger,
    meedogenloos: '#4A0000',
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
