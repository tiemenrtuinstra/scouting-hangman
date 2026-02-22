import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { THEME } from '../ui/colors.js';

export type MenuAction = 'play' | 'stats' | 'achievements' | 'leaderboard' | 'settings' | 'quit';

interface MainMenuProps {
  playerName: string;
  onSelect: (action: MenuAction) => void;
}

const MENU_ITEMS = [
  { label: '🎮  Nieuw Spel', value: 'play' as MenuAction },
  { label: '📊  Statistieken', value: 'stats' as MenuAction },
  { label: '🏅  Prestaties', value: 'achievements' as MenuAction },
  { label: '🏆  Ranglijst', value: 'leaderboard' as MenuAction },
  { label: '⚙️   Instellingen', value: 'settings' as MenuAction },
  { label: '🚪  Afsluiten', value: 'quit' as MenuAction },
];

export function MainMenu({ playerName, onSelect }: MainMenuProps) {
  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Box borderStyle="double" borderColor={THEME.primary} paddingX={4} paddingY={1}>
        <Text bold color={THEME.secondary}>⚜️ Scouting Hangman ⚜️</Text>
      </Box>
      <Text> </Text>
      <Text color={THEME.text}>Welkom, <Text bold color={THEME.highlight}>{playerName}</Text>!</Text>
      <Text> </Text>
      <Box flexDirection="column">
        <SelectInput
          items={MENU_ITEMS}
          onSelect={(item) => onSelect(item.value)}
        />
      </Box>
    </Box>
  );
}
