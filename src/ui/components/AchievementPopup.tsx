import React from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../colors.js';
import { ACHIEVEMENTS, getTierIcon } from '../../game/achievements.js';

interface AchievementPopupProps {
  achievementKeys: string[];
}

export function AchievementPopup({ achievementKeys }: AchievementPopupProps) {
  if (achievementKeys.length === 0) return null;

  return (
    <Box flexDirection="column" borderStyle="double" borderColor={THEME.secondary} paddingX={2} paddingY={1}>
      <Text bold color={THEME.secondary}>⭐ NIEUWE PRESTATIE! ⭐</Text>
      <Text> </Text>
      {achievementKeys.map(key => {
        const achievement = ACHIEVEMENTS.find(a => a.key === key);
        if (!achievement) return null;
        const tierBadge = achievement.tier ? ` ${getTierIcon(achievement.tier)}` : '';
        return (
          <Box key={key} gap={1}>
            <Text>{achievement.icon}</Text>
            <Text bold color={THEME.text}>{achievement.name}{tierBadge}</Text>
            <Text color={THEME.muted}>— {achievement.description}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
