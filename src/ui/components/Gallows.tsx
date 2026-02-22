import React from 'react';
import { Box, Text } from 'ink';
import { getGallows } from '../ascii-art.js';
import { getHealthColor } from '../colors.js';

interface GallowsProps {
  wrongGuesses: number;
  maxGuesses: number;
}

export function Gallows({ wrongGuesses, maxGuesses }: GallowsProps) {
  const lines = getGallows(wrongGuesses);
  const color = getHealthColor(wrongGuesses, maxGuesses);

  return (
    <Box flexDirection="column">
      {lines.map((line, i) => (
        <Text key={i} color={color}>{line}</Text>
      ))}
    </Box>
  );
}
