export const MAX_WRONG_GUESSES = 8;

export interface GameState {
  word: string;
  wordId: number;
  category: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  hintUsed: boolean;
  startTime: number;
}

export function createGameState(word: string, wordId: number, category: string): GameState {
  return {
    word: word.toLowerCase(),
    wordId,
    category,
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrongGuesses: MAX_WRONG_GUESSES,
    hintUsed: false,
    startTime: Date.now(),
  };
}

export function guessLetter(state: GameState, letter: string): GameState {
  const l = letter.toLowerCase();
  if (state.guessedLetters.includes(l)) return state;
  if (isGameWon(state) || isGameLost(state)) return state;

  const newGuessed = [...state.guessedLetters, l];
  const isCorrect = state.word.includes(l);

  return {
    ...state,
    guessedLetters: newGuessed,
    wrongGuesses: isCorrect ? state.wrongGuesses : state.wrongGuesses + 1,
  };
}

export function useHint(state: GameState): { state: GameState; revealedLetter: string | null } {
  if (state.hintUsed || isGameWon(state) || isGameLost(state)) {
    return { state, revealedLetter: null };
  }

  const unrevealedLetters = [...new Set(state.word.split(''))]
    .filter(l => l !== ' ' && !state.guessedLetters.includes(l));

  if (unrevealedLetters.length === 0) return { state, revealedLetter: null };

  const revealedLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];

  return {
    state: {
      ...state,
      guessedLetters: [...state.guessedLetters, revealedLetter],
      wrongGuesses: state.wrongGuesses + 1,
      hintUsed: true,
    },
    revealedLetter,
  };
}

export function isGameWon(state: GameState): boolean {
  return [...new Set(state.word.split(''))]
    .filter(l => l !== ' ')
    .every(l => state.guessedLetters.includes(l));
}

export function isGameLost(state: GameState): boolean {
  return state.wrongGuesses >= state.maxWrongGuesses;
}

export function getDisplayWord(state: GameState): string[] {
  return state.word.split('').map(l => {
    if (l === ' ') return ' ';
    return state.guessedLetters.includes(l) ? l.toUpperCase() : '_';
  });
}

export function getGameDuration(state: GameState): number {
  return Math.floor((Date.now() - state.startTime) / 1000);
}

export function calculateScore(state: GameState, won: boolean): number {
  if (!won) return 0;
  const letterCount = state.word.split('').filter(l => l !== ' ').length;
  const wordBonus = letterCount * 10;
  const accuracyBonus = (state.maxWrongGuesses - state.wrongGuesses) * 25;
  const speedBonus = Math.max(0, 300 - getGameDuration(state));
  const hintPenalty = state.hintUsed ? -50 : 0;
  return Math.max(0, wordBonus + accuracyBonus + speedBonus + hintPenalty);
}
