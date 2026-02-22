import React from 'react';
import { Box, Text, useInput } from 'ink';
import { THEME } from '../ui/colors.js';
import { ACHIEVEMENTS } from '../game/achievements.js';

interface AchievementsScreenProps {
  unlockedKeys: string[];
  onBack: () => void;
}

export function AchievementsScreen({ unlockedKeys, onBack }: AchievementsScreenProps) {
  useInput((_input, key) => {
    if (key.escape || key.return) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" gap={1} paddingY={1}>
      <Text bold color={THEME.secondary}>🏅 Prestaties</Text>
      <Text> </Text>
      <Box flexDirection="column" borderStyle="round" borderColor={THEME.primary} paddingX={2} paddingY={1}>
        {ACHIEVEMENTS.map(achievement => {
          const unlocked = unlockedKeys.includes(achievement.key);
          return (
            <Box key={achievement.key} gap={1}>
              <Text>{unlocked ? achievement.icon : '🔒'}</Text>
              <Text
                color={unlocked ? THEME.text : THEME.muted}
                bold={unlocked}
                dimColor={!unlocked}
              >
                {achievement.name}
              </Text>
              <Text color={THEME.muted} dimColor={!unlocked}>
                — {achievement.description}
              </Text>
              {unlocked && <Text color={THEME.success}> ✓</Text>}
            </Box>
          );
        })}
      </Box>
      <Text> </Text>
      <Text color={THEME.muted}>
        {unlockedKeys.length}/{ACHIEVEMENTS.length} behaald
      </Text>
      <Text color={THEME.muted}>Druk op Enter of Escape om terug te gaan</Text>
    </Box>
  );
}
