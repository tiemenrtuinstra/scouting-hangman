import React from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../colors.js';

interface GameHeaderProps {
  category: string;
  difficulty: string;
  playerName: string;
}

export function GameHeader({ category, difficulty, playerName }: GameHeaderProps) {
  return (
    <Box
      borderStyle="round"
      borderColor={THEME.primary}
      paddingX={2}
      justifyContent="space-between"
      width="100%"
    >
      <Text color={THEME.secondary} bold>⚜ Scouting Hangman</Text>
      <Text color={THEME.muted}>
        Speler: <Text bold color={THEME.text}>{playerName}</Text>
        {' │ '}
        Categorie: <Text bold color={THEME.highlight}>{category}</Text>
        {' │ '}
        Moeilijkheid: <Text bold color={THEME.warning}>{difficulty}</Text>
      </Text>
    </Box>
  );
}
