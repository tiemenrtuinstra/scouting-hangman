import { describe, it, expect } from 'vitest';
import { createGameState, guessLetter, isGameWon, isGameLost, useHint, getDisplayWord, MAX_WRONG_GUESSES } from '../engine.js';

describe('Game Engine', () => {
  it('should create initial state', () => {
    const state = createGameState('kampvuur', 1, 'kamperen');
    expect(state.word).toBe('kampvuur');
    expect(state.guessedLetters).toEqual([]);
    expect(state.wrongGuesses).toBe(0);
    expect(state.maxWrongGuesses).toBe(MAX_WRONG_GUESSES);
  });

  it('should handle correct guess', () => {
    let state = createGameState('kampvuur', 1, 'kamperen');
    state = guessLetter(state, 'k');
    expect(state.guessedLetters).toContain('k');
    expect(state.wrongGuesses).toBe(0);
  });

  it('should handle wrong guess', () => {
    let state = createGameState('kampvuur', 1, 'kamperen');
    state = guessLetter(state, 'z');
    expect(state.guessedLetters).toContain('z');
    expect(state.wrongGuesses).toBe(1);
  });

  it('should detect win', () => {
    let state = createGameState('ab', 1, 'test');
    state = guessLetter(state, 'a');
    state = guessLetter(state, 'b');
    expect(isGameWon(state)).toBe(true);
  });

  it('should detect loss after 8 wrong guesses', () => {
    let state = createGameState('kampvuur', 1, 'test');
    for (const letter of ['z', 'x', 'q', 'w', 'y', 'b', 'd', 'f']) {
      state = guessLetter(state, letter);
    }
    expect(isGameLost(state)).toBe(true);
    expect(state.wrongGuesses).toBe(8);
  });

  it('should ignore duplicate guesses', () => {
    let state = createGameState('kampvuur', 1, 'test');
    state = guessLetter(state, 'k');
    state = guessLetter(state, 'k');
    expect(state.guessedLetters.filter(l => l === 'k')).toHaveLength(1);
  });

  it('should display word correctly', () => {
    let state = createGameState('kampvuur', 1, 'test');
    state = guessLetter(state, 'k');
    state = guessLetter(state, 'a');
    const display = getDisplayWord(state);
    expect(display).toEqual(['K', 'A', '_', '_', '_', '_', '_', '_']);
  });

  it('should handle hint correctly', () => {
    const state = createGameState('ab', 1, 'test');
    const result = useHint(state);
    expect(result.revealedLetter).toBeTruthy();
    expect(result.state.hintUsed).toBe(true);
    expect(result.state.wrongGuesses).toBe(1);
    expect(result.state.guessedLetters).toContain(result.revealedLetter);
  });

  it('should not allow second hint', () => {
    let state = createGameState('abc', 1, 'test');
    const first = useHint(state);
    const second = useHint(first.state);
    expect(second.revealedLetter).toBeNull();
  });
});
