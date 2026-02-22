import React from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../colors.js';

interface HintDisplayProps {
  hint: string | null;
  hintUsed: boolean;
  visible: boolean;
}

export function HintDisplay({ hint, hintUsed, visible }: HintDisplayProps) {
  if (!visible || !hint) return null;

  return (
    <Box paddingX={1}>
      <Text color={THEME.accent}>
        💡 Hint: <Text italic>{hint}</Text>
        {hintUsed && <Text color={THEME.muted}> (gebruikt — kost 1 leven)</Text>}
      </Text>
    </Box>
  );
}
