import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { THEME } from '../ui/colors.js';
import type { Player } from '../db/stats.js';

interface PlayerSelectScreenProps {
  players: Player[];
  currentPlayerId: number;
  currentPlayerName: string;
  onSelectPlayer: (player: Player) => void;
  onCreatePlayer: (name: string) => void;
  onRenamePlayer: (newName: string) => void;
  onBack: () => void;
}

export function PlayerSelectScreen({
  players,
  currentPlayerId,
  currentPlayerName,
  onSelectPlayer,
  onCreatePlayer,
  onRenamePlayer,
  onBack,
}: PlayerSelectScreenProps) {
  const [mode, setMode] = useState<'menu' | 'new' | 'rename'>('menu');
  const [inputValue, setInputValue] = useState('');

  useInput((_input, key) => {
    if (key.escape && mode !== 'menu') {
      setInputValue('');
      setMode('menu');
    }
  });

  if (mode === 'new') {
    return (
      <Box flexDirection="column" alignItems="center" paddingY={1}>
        <Text bold color={THEME.secondary}>Nieuwe speler aanmaken:</Text>
        <Text> </Text>
        <Box>
          <Text color={THEME.highlight}>{'> '}</Text>
          <TextInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={(value) => {
              const trimmed = value.trim();
              if (trimmed.length > 0) {
                onCreatePlayer(trimmed);
              }
            }}
            placeholder="Typ een naam..."
          />
        </Box>
        <Text> </Text>
        <Text color={THEME.muted}>Enter = bevestigen, Escape = annuleren</Text>
      </Box>
    );
  }

  if (mode === 'rename') {
    return (
      <Box flexDirection="column" alignItems="center" paddingY={1}>
        <Text bold color={THEME.secondary}>Naam wijzigen:</Text>
        <Text color={THEME.muted}>Huidige naam: <Text color={THEME.highlight}>{currentPlayerName}</Text></Text>
        <Text> </Text>
        <Box>
          <Text color={THEME.highlight}>{'> '}</Text>
          <TextInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={(value) => {
              const trimmed = value.trim();
              if (trimmed.length > 0) {
                onRenamePlayer(trimmed);
              }
            }}
            placeholder="Typ een nieuwe naam..."
          />
        </Box>
        <Text> </Text>
        <Text color={THEME.muted}>Enter = bevestigen, Escape = annuleren</Text>
      </Box>
    );
  }

  const items = [
    ...players.map(p => ({
      label: p.id === currentPlayerId
        ? `⚜️  ${p.name} (huidige speler)`
        : `    ${p.name}`,
      value: `player:${p.id}`,
    })),
    { label: '➕  Nieuwe speler', value: 'action:new' },
    { label: '✏️   Naam wijzigen', value: 'action:rename' },
    { label: '← Terug', value: 'action:back' },
  ];

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Text bold color={THEME.secondary}>Speler kiezen:</Text>
      <Text> </Text>
      <Box flexDirection="column">
        <SelectInput
          items={items}
          onSelect={(item) => {
            if (item.value === 'action:back') {
              onBack();
            } else if (item.value === 'action:new') {
              setInputValue('');
              setMode('new');
            } else if (item.value === 'action:rename') {
              setInputValue(currentPlayerName);
              setMode('rename');
            } else if (item.value.startsWith('player:')) {
              const id = parseInt(item.value.split(':')[1], 10);
              const player = players.find(p => p.id === id);
              if (player) onSelectPlayer(player);
            }
          }}
        />
      </Box>
    </Box>
  );
}
