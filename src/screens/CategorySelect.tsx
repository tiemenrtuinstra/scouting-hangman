import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { THEME } from '../ui/colors.js';

interface CategorySelectProps {
  categories: string[];
  onSelect: (category: string | null) => void;
  onBack: () => void;
}

export function CategorySelect({ categories, onSelect, onBack }: CategorySelectProps) {
  const items = [
    { label: '🎲  Alle categorieën', value: '__all__' },
    ...categories.map(cat => ({
      label: `📁  ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
      value: cat,
    })),
    { label: '← Terug', value: '__back__' },
  ];

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Text bold color={THEME.secondary}>Kies een categorie:</Text>
      <Text> </Text>
      <Box flexDirection="column">
        <SelectInput
          items={items}
          onSelect={(item) => {
            if (item.value === '__back__') {
              onBack();
            } else if (item.value === '__all__') {
              onSelect(null);
            } else {
              onSelect(item.value);
            }
          }}
        />
      </Box>
    </Box>
  );
}
