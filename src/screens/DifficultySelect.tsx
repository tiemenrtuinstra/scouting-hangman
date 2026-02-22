import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { THEME } from '../ui/colors.js';
import { DIFFICULTIES, type DifficultyLevel } from '../game/difficulty.js';

interface DifficultySelectProps {
  onSelect: (difficulty: DifficultyLevel) => void;
  onBack: () => void;
}

const DIFFICULTY_ITEMS = (Object.entries(DIFFICULTIES) as [DifficultyLevel, typeof DIFFICULTIES[DifficultyLevel]][]).map(
  ([key, config]) => ({
    label: `${config.label} — ${config.description}`,
    value: key,
  })
);

export function DifficultySelect({ onSelect, onBack }: DifficultySelectProps) {
  const items = [
    ...DIFFICULTY_ITEMS,
    { label: '← Terug', value: 'back' as string },
  ];

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Text bold color={THEME.secondary}>Kies je moeilijkheidsgraad:</Text>
      <Text> </Text>
      <Box flexDirection="column">
        <SelectInput
          items={items}
          onSelect={(item) => {
            if (item.value === 'back') {
              onBack();
            } else {
              onSelect(item.value as DifficultyLevel);
            }
          }}
        />
      </Box>
    </Box>
  );
}
