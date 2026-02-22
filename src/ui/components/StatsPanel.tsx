import React from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../colors.js';

export interface PlayerStatsData {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  fastestWin: number | null;
  longestWord: string | null;
}

interface StatsPanelProps {
  stats: PlayerStatsData;
  playerName: string;
}

export function StatsPanel({ stats, playerName }: StatsPanelProps) {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={THEME.primary} paddingX={2} paddingY={1}>
      <Text bold color={THEME.secondary}>📊 Statistieken: {playerName}</Text>
      <Text> </Text>
      <Box flexDirection="column" gap={0}>
        <Text color={THEME.text}>🎮 Gespeeld:    <Text bold>{stats.totalGames}</Text></Text>
        <Text color={THEME.success}>✅ Gewonnen:    <Text bold>{stats.wins}</Text></Text>
        <Text color={THEME.danger}>❌ Verloren:    <Text bold>{stats.losses}</Text></Text>
        <Text color={THEME.text}>📈 Win rate:    <Text bold>{stats.winRate}%</Text></Text>
        <Text> </Text>
        <Text color={THEME.secondary}>🔥 Huidige reeks:  <Text bold>{stats.currentStreak}</Text></Text>
        <Text color={THEME.secondary}>⭐ Beste reeks:    <Text bold>{stats.bestStreak}</Text></Text>
        {stats.fastestWin !== null && (
          <Text color={THEME.text}>⚡ Snelste win:    <Text bold>{stats.fastestWin}s</Text></Text>
        )}
        {stats.longestWord && (
          <Text color={THEME.text}>📏 Langste woord:  <Text bold>{stats.longestWord}</Text></Text>
        )}
      </Box>
    </Box>
  );
}
