import React from 'react';
import { Box, Text, useInput } from 'ink';
import { THEME } from '../ui/colors.js';
import type { LeaderboardEntry } from '../db/stats.js';

interface LeaderboardScreenProps {
  entries: LeaderboardEntry[];
  onBack: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const NAME_WIDTH = 16;

function truncName(name: string): string {
  return name.length > NAME_WIDTH
    ? name.slice(0, NAME_WIDTH - 1) + '…'
    : name.padEnd(NAME_WIDTH);
}

export function LeaderboardScreen({ entries, onBack }: LeaderboardScreenProps) {
  useInput((_input, key) => {
    if (key.escape || key.return) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" gap={1} paddingY={1}>
      <Text bold color={THEME.secondary}>🏆 Ranglijst</Text>
      <Text> </Text>
      {entries.length === 0 ? (
        <Text color={THEME.muted}>Nog geen spelers. Speel een spel om op de ranglijst te komen!</Text>
      ) : (
        <Box flexDirection="column" borderStyle="round" borderColor={THEME.primary} paddingX={2} paddingY={1}>
          <Box gap={2} marginBottom={1}>
            <Text bold color={THEME.muted}>#  </Text>
            <Text bold color={THEME.muted}>{'Speler'.padEnd(NAME_WIDTH)}</Text>
            <Text bold color={THEME.muted}>{'Score'.padStart(8)}</Text>
            <Text bold color={THEME.muted}>{'Wins'.padStart(6)}</Text>
            <Text bold color={THEME.muted}>{'Gespeeld'.padStart(10)}</Text>
            <Text bold color={THEME.muted}>{'Win%'.padStart(6)}</Text>
          </Box>
          {entries.map((entry, i) => (
            <Box key={entry.name} gap={2}>
              <Text color={THEME.secondary}>{MEDALS[i] ?? `${i + 1}. `}</Text>
              <Text color={THEME.text} bold={i < 3}>{truncName(entry.name)}</Text>
              <Text color={THEME.secondary}>{String(entry.totalScore).padStart(8)}</Text>
              <Text color={THEME.success}>{String(entry.wins).padStart(6)}</Text>
              <Text color={THEME.text}>{String(entry.totalGames).padStart(10)}</Text>
              <Text color={THEME.highlight}>{`${entry.winRate}%`.padStart(6)}</Text>
            </Box>
          ))}
        </Box>
      )}
      <Text> </Text>
      <Text color={THEME.muted}>Druk op Enter of Escape om terug te gaan</Text>
    </Box>
  );
}
