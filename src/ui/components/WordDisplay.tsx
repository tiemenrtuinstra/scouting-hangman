import React from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../colors.js';

interface WordDisplayProps {
  word: string;
  guessedLetters: string[];
  revealed?: boolean;
}

export function WordDisplay({ word, guessedLetters, revealed = false }: WordDisplayProps) {
  const letters = word.split('');

  return (
    <Box gap={1} justifyContent="center" flexWrap="wrap">
      {letters.map((letter, i) => {
        if (letter === ' ') {
          return <Box key={i} width={3} />;
        }

        const isGuessed = guessedLetters.includes(letter);
        const show = revealed || isGuessed;

        return (
          <Box key={i} flexDirection="column" alignItems="center">
            <Text
              bold
              color={revealed && !isGuessed ? THEME.danger : THEME.primary}
            >
              {show ? ` ${letter.toUpperCase()} ` : ' _ '}
            </Text>
            <Text color={THEME.muted}>{'───'}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
