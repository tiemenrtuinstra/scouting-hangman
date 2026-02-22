import React from 'react';
import { Box, Text } from 'ink';
import { getMoodColor } from '../colors.js';
import type { ExecutionerDialogue } from '../../executioner/personality.js';

interface ExecutionerBubbleProps {
  dialogue: ExecutionerDialogue;
}

export function ExecutionerBubble({ dialogue }: ExecutionerBubbleProps) {
  const color = getMoodColor(dialogue.mood);
  const maxWidth = 50;
  const text = dialogue.text;

  const topBorder = `╭${'─'.repeat(maxWidth)}╮`;
  const bottomBorder = `╰${'─'.repeat(maxWidth)}╯`;

  const padded = text.padEnd(maxWidth);
  const lines = [];
  for (let i = 0; i < padded.length; i += maxWidth) {
    lines.push(padded.slice(i, i + maxWidth));
  }

  return (
    <Box flexDirection="row" gap={1}>
      <Box flexDirection="column">
        {dialogue.avatar.split('\n').map((line, i) => (
          <Text key={i} color={color}>{line}</Text>
        ))}
      </Box>
      <Box flexDirection="column">
        <Text color={color}>{topBorder}</Text>
        {lines.map((line, i) => (
          <Text key={i} color={color}>│{line.padEnd(maxWidth)}│</Text>
        ))}
        <Text color={color}>{bottomBorder}</Text>
      </Box>
    </Box>
  );
}
