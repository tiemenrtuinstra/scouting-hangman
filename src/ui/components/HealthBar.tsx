import React from 'react';
import { Box, Text } from 'ink';
import { getHealthColor } from '../colors.js';

interface HealthBarProps {
  wrongGuesses: number;
  maxGuesses: number;
}

export function HealthBar({ wrongGuesses, maxGuesses }: HealthBarProps) {
  const remaining = maxGuesses - wrongGuesses;
  const color = getHealthColor(wrongGuesses, maxGuesses);

  return (
    <Box gap={1}>
      <Text color={color}>
        {'♥'.repeat(remaining)}{'♡'.repeat(wrongGuesses)}
      </Text>
      <Text color={color}> ({remaining}/{maxGuesses})</Text>
    </Box>
  );
}
