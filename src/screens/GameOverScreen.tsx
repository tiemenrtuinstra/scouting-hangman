import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { THEME } from '../ui/colors.js';
import { WIN_ART, LOSS_ART } from '../ui/ascii-art.js';
import { AchievementPopup } from '../ui/components/AchievementPopup.js';
import { calculateScore } from '../game/engine.js';
import type { GameState } from '../game/engine.js';

type GameOverAction = 'play_again' | 'menu' | 'quit';

interface GameOverScreenProps {
  won: boolean;
  gameState: GameState;
  newAchievements: string[];
  streak: number;
  onSelect: (action: GameOverAction) => void;
}

const MENU_ITEMS = [
  { label: '🔄  Nog een keer!', value: 'play_again' as GameOverAction },
  { label: '🏠  Hoofdmenu', value: 'menu' as GameOverAction },
  { label: '🚪  Afsluiten', value: 'quit' as GameOverAction },
];

export function GameOverScreen({ won, gameState, newAchievements, streak, onSelect }: GameOverScreenProps) {
  const art = won ? WIN_ART : LOSS_ART;
  const word = gameState.word;
  const score = calculateScore(gameState, won);

  return (
    <Box flexDirection="column" alignItems="center" gap={1} paddingY={1}>
      <Box flexDirection="column" alignItems="center">
        {art.map((line, i) => (
          <Text key={i} color={won ? THEME.success : THEME.danger}>{line}</Text>
        ))}
      </Box>

      <Text color={THEME.text}>
        Het woord was: <Text bold color={won ? THEME.success : THEME.danger}>{word.toUpperCase()}</Text>
      </Text>

      {won && (
        <Box flexDirection="column" alignItems="center">
          <Text color={THEME.secondary}>Score: <Text bold>{score}</Text> punten</Text>
          {streak > 1 && (
            <Text color={THEME.warning}>🔥 Reeks van {streak}!</Text>
          )}
        </Box>
      )}

      <AchievementPopup achievementKeys={newAchievements} />

      <Box flexDirection="column" paddingTop={1}>
        <SelectInput
          items={MENU_ITEMS}
          onSelect={(item) => onSelect(item.value)}
        />
      </Box>
    </Box>
  );
}
