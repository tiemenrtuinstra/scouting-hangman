import React, { useState, useCallback } from 'react';
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
  useHint,
} from '../game/engine.js';
import {
  getExecutionerDialogue,
  type ExecutionerDialogue,
} from '../executioner/personality.js';

interface GameScreenProps {
  db: Database.Database;
  gameState: GameState;
  playerId: number;
  playerName: string;
  difficulty: string;
  hint: string | null;
  onStateChange: (state: GameState) => void;
  onGameEnd: (won: boolean, finalState: GameState) => void;
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
}: GameScreenProps) {
  const [dialogue, setDialogue] = useState<ExecutionerDialogue>(
    () => getExecutionerDialogue(db, playerId, 'game_start', difficulty)
  );
  const [showHint, setShowHint] = useState(false);
  const [lastGuess, setLastGuess] = useState<string | null>(null);

  const handleGuess = useCallback((letter: string) => {
    if (isGameWon(gameState) || isGameLost(gameState)) return;
    if (gameState.guessedLetters.includes(letter)) return;

    const newState = guessLetter(gameState, letter);
    onStateChange(newState);
    setLastGuess(letter);

    if (isGameWon(newState)) {
      setDialogue(getExecutionerDialogue(db, playerId, 'win', difficulty));
      setTimeout(() => onGameEnd(true, newState), 1500);
    } else if (isGameLost(newState)) {
      setDialogue(getExecutionerDialogue(db, playerId, 'loss', difficulty));
      setTimeout(() => onGameEnd(false, newState), 1500);
    } else if (newState.wrongGuesses > gameState.wrongGuesses) {
      if (newState.wrongGuesses >= newState.maxWrongGuesses - 1) {
        setDialogue(getExecutionerDialogue(db, playerId, 'almost_dead', difficulty));
      } else {
        setDialogue(getExecutionerDialogue(db, playerId, 'wrong_guess', difficulty));
      }
    } else {
      setDialogue(getExecutionerDialogue(db, playerId, 'correct_guess', difficulty));
    }
  }, [gameState, db, playerId, difficulty, onStateChange, onGameEnd]);

  useInput((input, key) => {
    if (key.escape) return;

    if (input === '?' && !gameState.hintUsed && hint) {
      if (!showHint) {
        setShowHint(true);
      } else {
        const result = useHint(gameState);
        if (result.revealedLetter) {
          onStateChange(result.state);
          setDialogue(getExecutionerDialogue(db, playerId, 'wrong_guess', difficulty));
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
        difficulty={difficulty}
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
