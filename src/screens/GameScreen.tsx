import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import type Database from 'better-sqlite3';
import { GameHeader } from '../ui/components/GameHeader.js';
import { Gallows } from '../ui/components/Gallows.js';
import { WordDisplay } from '../ui/components/WordDisplay.js';
import { LetterBoard } from '../ui/components/LetterBoard.js';
import { HealthBar } from '../ui/components/HealthBar.js';
import { ExecutionerBubble } from '../ui/components/ExecutionerBubble.js';
import { HintDisplay } from '../ui/components/HintDisplay.js';
import { THEME } from '../ui/colors.js';
import {
  type GameState,
  guessLetter,
  isGameWon,
  isGameLost,
  applyHint,
} from '../game/engine.js';
import {
  getExecutionerDialogue,
  type ExecutionerDialogue,
} from '../executioner/personality.js';
import { getPlayerStats } from '../db/stats.js';
import { DIFFICULTIES } from '../game/difficulty.js';
import type { DifficultyLevel } from '../game/difficulty.js';
import type { DialogueContext } from '../executioner/templates.js';

interface GameScreenProps {
  db: Database.Database;
  gameState: GameState;
  playerId: number;
  playerName: string;
  difficulty: DifficultyLevel;
  hint: string | null;
  onStateChange: (state: GameState) => void;
  onGameEnd: (won: boolean, finalState: GameState) => void;
  onQuit: () => void;
}

export function GameScreen({
  db,
  gameState,
  playerId,
  playerName,
  difficulty,
  hint,
  onStateChange,
  onGameEnd,
  onQuit,
}: GameScreenProps) {
  // Cache player stats at game start (don't re-query on every guess)
  const statsRef = useRef(getPlayerStats(db, playerId));

  const buildContext = useCallback((state: GameState, score?: number): Partial<DialogueContext> => {
    const stats = statsRef.current;
    return {
      playerName,
      streak: stats.currentStreak,
      totalWins: stats.wins,
      totalGames: stats.totalGames,
      winRate: Math.round(stats.winRate),
      category: state.category,
      wordLength: state.word.replace(/ /g, '').length,
      score: score ?? 0,
      difficulty,
      remainingLives: state.maxWrongGuesses - state.wrongGuesses,
      wrongGuesses: state.wrongGuesses,
      hintUsed: state.hintUsed,
    };
  }, [playerName, difficulty]);

  const [dialogue, setDialogue] = useState<ExecutionerDialogue>(
    () => getExecutionerDialogue(db, playerId, 'game_start', difficulty, buildContext(gameState))
  );
  const [showHint, setShowHint] = useState(false);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
    };
  }, []);

  const scheduleGameEnd = useCallback((won: boolean, state: GameState) => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    endTimerRef.current = setTimeout(() => onGameEnd(won, state), 1500);
  }, [onGameEnd]);

  const handleGuess = useCallback((letter: string) => {
    if (isGameWon(gameState) || isGameLost(gameState)) return;
    if (gameState.guessedLetters.includes(letter)) return;

    const newState = guessLetter(gameState, letter);
    onStateChange(newState);

    const ctx = buildContext(newState);

    if (isGameWon(newState)) {
      setDialogue(getExecutionerDialogue(db, playerId, 'win', difficulty, ctx));
      scheduleGameEnd(true, newState);
    } else if (isGameLost(newState)) {
      setDialogue(getExecutionerDialogue(db, playerId, 'loss', difficulty, ctx));
      scheduleGameEnd(false, newState);
    } else if (newState.wrongGuesses > gameState.wrongGuesses) {
      if (newState.wrongGuesses >= newState.maxWrongGuesses - 1) {
        setDialogue(getExecutionerDialogue(db, playerId, 'almost_dead', difficulty, ctx));
      } else {
        setDialogue(getExecutionerDialogue(db, playerId, 'wrong_guess', difficulty, ctx));
      }
    } else {
      setDialogue(getExecutionerDialogue(db, playerId, 'correct_guess', difficulty, ctx));
    }
  }, [gameState, db, playerId, difficulty, onStateChange, scheduleGameEnd, buildContext]);

  useInput((input, key) => {
    if (key.escape) {
      onQuit();
      return;
    }

    if (isGameWon(gameState) || isGameLost(gameState)) return;

    if (input === '?' && !gameState.hintUsed && hint) {
      if (!showHint) {
        setShowHint(true);
      } else {
        const result = applyHint(gameState);
        if (result.revealedLetter) {
          onStateChange(result.state);
          const ctx = buildContext(result.state);
          if (isGameLost(result.state)) {
            setDialogue(getExecutionerDialogue(db, playerId, 'loss', difficulty, ctx));
            scheduleGameEnd(false, result.state);
          } else {
            setDialogue(getExecutionerDialogue(db, playerId, 'wrong_guess', difficulty, ctx));
          }
        }
      }
      return;
    }

    const letter = input.toLowerCase();
    if (letter >= 'a' && letter <= 'z') {
      handleGuess(letter);
    }
  });

  const gameOver = isGameWon(gameState) || isGameLost(gameState);

  return (
    <Box flexDirection="column" gap={1}>
      <GameHeader
        category={gameState.category}
        difficulty={DIFFICULTIES[difficulty].label}
        playerName={playerName}
      />

      <Box gap={2}>
        <Box flexDirection="column" gap={1}>
          <Gallows
            wrongGuesses={gameState.wrongGuesses}
            maxGuesses={gameState.maxWrongGuesses}
          />
          <HealthBar
            wrongGuesses={gameState.wrongGuesses}
            maxGuesses={gameState.maxWrongGuesses}
          />
        </Box>

        <Box flexDirection="column" gap={1} flexGrow={1}>
          <ExecutionerBubble dialogue={dialogue} />

          <WordDisplay
            word={gameState.word}
            guessedLetters={gameState.guessedLetters}
            revealed={gameOver}
          />

          <LetterBoard
            guessedLetters={gameState.guessedLetters}
            word={gameState.word}
          />

          <HintDisplay
            hint={hint}
            hintUsed={gameState.hintUsed}
            visible={showHint}
          />

          {!gameOver && (
            <Text color={THEME.muted}>
              Type een letter om te raden
              {hint && !gameState.hintUsed && ' │ ? = hint'}
              {' │ Esc = stoppen'}
            </Text>
          )}

          {gameOver && (
            <Text color={THEME.muted} italic>Even geduld...</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}
