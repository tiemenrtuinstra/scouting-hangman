import React from 'react';
import { Box, Text, useInput } from 'ink';
import { THEME } from '../ui/colors.js';
import { ACHIEVEMENTS, getTierIcon, type AchievementDef } from '../game/achievements.js';

interface AchievementsScreenProps {
  unlockedKeys: string[];
  onBack: () => void;
}

function AchievementRow({ achievement, unlocked }: { achievement: AchievementDef; unlocked: boolean }) {
  const tierBadge = achievement.tier ? ` ${getTierIcon(achievement.tier)}` : '';

  return (
    <Box gap={1}>
      <Text>{unlocked ? achievement.icon : '🔒'}</Text>
      <Text
        color={unlocked ? THEME.text : THEME.muted}
        bold={unlocked}
        dimColor={!unlocked}
      >
        {achievement.name}{tierBadge}
      </Text>
      <Text color={THEME.muted} dimColor={!unlocked}>
        — {achievement.description}
      </Text>
      {unlocked && <Text color={THEME.success}> ✓</Text>}
    </Box>
  );
}

export function AchievementsScreen({ unlockedKeys, onBack }: AchievementsScreenProps) {
  useInput((_input, key) => {
    if (key.escape || key.return) {
      onBack();
    }
  });

  // Separate grouped (tiered) and standalone achievements
  const grouped = new Map<string, AchievementDef[]>();
  const standalone: AchievementDef[] = [];

  for (const a of ACHIEVEMENTS) {
    if (a.group) {
      const list = grouped.get(a.group) ?? [];
      list.push(a);
      grouped.set(a.group, list);
    } else {
      standalone.push(a);
    }
  }

  // Sort tiers within groups: brons → zilver → goud
  const tierOrder = { brons: 0, zilver: 1, goud: 2 };
  for (const [, list] of grouped) {
    list.sort((a, b) => (tierOrder[a.tier ?? 'brons'] ?? 0) - (tierOrder[b.tier ?? 'brons'] ?? 0));
  }

  const groupLabels: Record<string, string> = {
    wins: 'Overwinningen',
    streak: 'Win Reeksen',
    speed: 'Snelheid',
    games: 'Spellen Gespeeld',
  };

  return (
    <Box flexDirection="column" alignItems="center" gap={1} paddingY={1}>
      <Text bold color={THEME.secondary}>🏅 Prestaties</Text>
      <Text> </Text>
      <Box flexDirection="column" borderStyle="round" borderColor={THEME.primary} paddingX={2} paddingY={1} gap={0}>
        {/* Grouped (tiered) achievements */}
        {[...grouped.entries()].map(([group, achievements]) => (
          <Box key={group} flexDirection="column">
            <Text color={THEME.secondary} bold dimColor>
              ── {groupLabels[group] ?? group} ──
            </Text>
            {achievements.map(a => (
              <AchievementRow
                key={a.key}
                achievement={a}
                unlocked={unlockedKeys.includes(a.key)}
              />
            ))}
            <Text> </Text>
          </Box>
        ))}

        {/* Standalone achievements */}
        {standalone.length > 0 && (
          <>
            <Text color={THEME.secondary} bold dimColor>
              ── Overige Prestaties ──
            </Text>
            {standalone.map(a => (
              <AchievementRow
                key={a.key}
                achievement={a}
                unlocked={unlockedKeys.includes(a.key)}
              />
            ))}
          </>
        )}
      </Box>
      <Text> </Text>
      <Text color={THEME.muted}>
        {unlockedKeys.length}/{ACHIEVEMENTS.length} behaald
      </Text>
      <Text color={THEME.muted}>Druk op Enter of Escape om terug te gaan</Text>
    </Box>
  );
}
