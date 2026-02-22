import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { THEME } from '../ui/colors.js';
import { SCOUTING_LOGO } from '../ui/ascii-art.js';

interface PlayerNameScreenProps {
  onSubmit: (name: string) => void;
}

export function PlayerNameScreen({ onSubmit }: PlayerNameScreenProps) {
  const [name, setName] = useState('');

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      onSubmit(trimmed);
    }
  };

  return (
    <Box flexDirection="column" alignItems="center" paddingY={2} gap={1}>
      <Box flexDirection="column" alignItems="center">
        {SCOUTING_LOGO.map((line, i) => (
          <Text key={i} color={THEME.primary}>{line}</Text>
        ))}
      </Box>
      <Text> </Text>
      <Text bold color={THEME.secondary}>⚜️ Welkom bij Scouting Hangman! ⚜️</Text>
      <Text> </Text>
      <Text color={THEME.text}>Wat is je naam, scout?</Text>
      <Text> </Text>
      <Box>
        <Text color={THEME.highlight}>{'> '}</Text>
        <TextInput
          value={name}
          onChange={setName}
          onSubmit={handleSubmit}
          placeholder="Typ je naam..."
        />
      </Box>
    </Box>
  );
}
