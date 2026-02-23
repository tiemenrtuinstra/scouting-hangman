import React from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../colors.js';
import type { PlayerStats } from '../../db/stats.js';

interface StatsPanelProps {
  stats: PlayerStats;
  playerName: string;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function StatsPanel({ stats, playerName }: StatsPanelProps) {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={THEME.primary} paddingX={2} paddingY={1}>
      <Text bold color={THEME.secondary}>📊 Statistieken: {playerName}</Text>
      <Text> </Text>
      <Box flexDirection="column" gap={0}>
        <Text color={THEME.text}>🎮 Gespeeld:       <Text bold>{stats.totalGames}</Text></Text>
        <Text color={THEME.success}>✅ Gewonnen:       <Text bold>{stats.wins}</Text></Text>
        <Text color={THEME.danger}>❌ Verloren:       <Text bold>{stats.losses}</Text></Text>
        <Text color={THEME.text}>📈 Win rate:       <Text bold>{Math.round(stats.winRate)}%</Text></Text>
        <Text color={THEME.secondary}>🏆 Totale score:   <Text bold>{stats.totalScore}</Text></Text>
        <Text> </Text>
        <Text color={THEME.secondary}>🔥 Huidige reeks:  <Text bold>{stats.currentStreak}</Text></Text>
        <Text color={THEME.secondary}>⭐ Beste reeks:    <Text bold>{stats.bestStreak}</Text></Text>
        {stats.fastestWin !== null && (
          <Text color={THEME.text}>⚡ Snelste win:    <Text bold>{stats.fastestWin}s</Text></Text>
        )}
        {stats.longestWord && (
          <Text color={THEME.text}>📏 Langste woord:  <Text bold>{stats.longestWord}</Text></Text>
        )}
        <Text color={THEME.muted}>⏱️  Speeltijd:      <Text bold>{formatTime(stats.totalPlayTime)}</Text></Text>
        <Text color={THEME.muted}>🎯 Gem. fouten:    <Text bold>{Math.round(stats.avgWrongGuesses * 10) / 10}</Text></Text>
      </Box>
    </Box>
  );
}
