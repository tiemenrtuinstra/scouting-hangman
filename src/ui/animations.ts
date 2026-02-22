const SPINNER_FRAMES = ['◐', '◓', '◑', '◒'];
const CAMPFIRE_FRAMES = [
  ['  🔥  ', ' 🪵🪵 '],
  [' 🔥🔥 ', ' 🪵🪵 '],
  ['🔥🔥🔥', ' 🪵🪵 '],
  [' 🔥🔥 ', ' 🪵🪵 '],
];

export function getSpinnerFrame(tick: number): string {
  return SPINNER_FRAMES[tick % SPINNER_FRAMES.length];
}

export function getCampfireFrame(tick: number): string[] {
  return CAMPFIRE_FRAMES[tick % CAMPFIRE_FRAMES.length];
}

export function createProgressBar(current: number, max: number, width: number = 20): string {
  const filled = Math.round((current / max) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

export function createLetterBoard(guessedLetters: string[], word: string): string[] {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const rows: string[] = [];
  const topRow = alphabet.slice(0, 13);
  const bottomRow = alphabet.slice(13);

  const formatRow = (letters: string[]) =>
    letters
      .map(l => {
        if (!guessedLetters.includes(l)) return ` ${l.toUpperCase()} `;
        if (word.includes(l)) return `[${l.toUpperCase()}]`;
        return ` · `;
      })
      .join('');

  rows.push(formatRow(topRow));
  rows.push(formatRow(bottomRow));
  return rows;
}

export function createWordDisplay(word: string, guessedLetters: string[]): string {
  return word
    .split('')
    .map(l => {
      if (l === ' ') return '   ';
      if (guessedLetters.includes(l)) return ` ${l.toUpperCase()} `;
      return ' _ ';
    })
    .join('');
}

export function createHealthBar(wrongGuesses: number, maxGuesses: number): string {
  const remaining = maxGuesses - wrongGuesses;
  const hearts = '♥'.repeat(remaining);
  const empty = '♡'.repeat(wrongGuesses);
  return `${hearts}${empty}`;
}
