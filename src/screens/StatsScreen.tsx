import React from 'react';
import { Box, Text, useInput } from 'ink';
import { StatsPanel, type PlayerStatsData } from '../ui/components/StatsPanel.js';
import { THEME } from '../ui/colors.js';

interface StatsScreenProps {
  stats: PlayerStatsData;
  playerName: string;
  onBack: () => void;
}

export function StatsScreen({ stats, playerName, onBack }: StatsScreenProps) {
  useInput((_input, key) => {
    if (key.escape || key.return) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" gap={1} paddingY={1}>
      <StatsPanel stats={stats} playerName={playerName} />
      <Text color={THEME.muted}>Druk op Enter of Escape om terug te gaan</Text>
    </Box>
  );
}
