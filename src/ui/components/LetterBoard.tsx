import React from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../colors.js';

interface LetterBoardProps {
  guessedLetters: string[];
  word: string;
}

export function LetterBoard({ guessedLetters, word }: LetterBoardProps) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const topRow = alphabet.slice(0, 13);
  const bottomRow = alphabet.slice(13);

  const renderLetter = (letter: string) => {
    const isGuessed = guessedLetters.includes(letter);
    const isInWord = word.includes(letter);

    if (!isGuessed) {
      return <Text color={THEME.muted}>{` ${letter.toUpperCase()} `}</Text>;
    }
    if (isInWord) {
      return <Text color={THEME.success} bold>{`[${letter.toUpperCase()}]`}</Text>;
    }
    return <Text color={THEME.danger} strikethrough>{` ${letter.toUpperCase()} `}</Text>;
  };

  return (
    <Box flexDirection="column" alignItems="center">
      <Box>
        {topRow.map(l => <Box key={l}>{renderLetter(l)}</Box>)}
      </Box>
      <Box>
        {bottomRow.map(l => <Box key={l}>{renderLetter(l)}</Box>)}
      </Box>
    </Box>
  );
}
