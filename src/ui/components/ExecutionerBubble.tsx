import React from 'react';
import { Box, Text } from 'ink';
import { getMoodColor } from '../colors.js';
import type { ExecutionerDialogue } from '../../executioner/personality.js';

interface ExecutionerBubbleProps {
  dialogue: ExecutionerDialogue;
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);
  return lines.length > 0 ? lines : [''];
}

export function ExecutionerBubble({ dialogue }: ExecutionerBubbleProps) {
  const color = getMoodColor(dialogue.mood);
  const maxWidth = 50;

  const topBorder = `╭${'─'.repeat(maxWidth)}╮`;
  const bottomBorder = `╰${'─'.repeat(maxWidth)}╯`;

  const lines = wrapText(dialogue.text, maxWidth);

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
