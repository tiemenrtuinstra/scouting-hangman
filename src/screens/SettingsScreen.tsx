import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { THEME } from '../ui/colors.js';
import { DIFFICULTIES, type DifficultyLevel } from '../game/difficulty.js';

type SettingsView = 'main' | 'difficulty' | 'reset' | 'confirm_reset';
type ResetType = 'stats' | 'achievements' | 'all';

interface SettingsScreenProps {
  currentDifficulty: DifficultyLevel;
  playerName: string;
  onChangeDifficulty: (difficulty: DifficultyLevel) => void;
  onSwitchPlayer: () => void;
  onResetStats: () => void;
  onResetAchievements: () => void;
  onResetAll: () => void;
  onBack: () => void;
}

export function SettingsScreen({
  currentDifficulty,
  playerName,
  onChangeDifficulty,
  onSwitchPlayer,
  onResetStats,
  onResetAchievements,
  onResetAll,
  onBack,
}: SettingsScreenProps) {
  const [view, setView] = useState<SettingsView>('main');
  const [pendingReset, setPendingReset] = useState<ResetType | null>(null);

  if (view === 'difficulty') {
    const items = [
      ...(Object.entries(DIFFICULTIES) as [DifficultyLevel, typeof DIFFICULTIES[DifficultyLevel]][]).map(
        ([key, config]) => ({
          label: key === currentDifficulty
            ? `${config.label} — ${config.description} (huidig)`
            : `${config.label} — ${config.description}`,
          value: key,
        })
      ),
      { label: '← Terug', value: 'back' as string },
    ];

    return (
      <Box flexDirection="column" alignItems="center" paddingY={1}>
        <Text bold color={THEME.secondary}>Standaard moeilijkheidsgraad:</Text>
        <Text> </Text>
        <Box flexDirection="column">
          <SelectInput
            items={items}
            onSelect={(item) => {
              if (item.value === 'back') {
                setView('main');
              } else {
                onChangeDifficulty(item.value as DifficultyLevel);
                setView('main');
              }
            }}
          />
        </Box>
      </Box>
    );
  }

  if (view === 'confirm_reset' && pendingReset) {
    const labels: Record<ResetType, string> = {
      stats: 'statistieken',
      achievements: 'prestaties',
      all: 'alle gegevens',
    };

    const confirmItems = [
      { label: '✅  Ja, wissen', value: 'confirm' },
      { label: '← Nee, terug', value: 'cancel' },
    ];

    return (
      <Box flexDirection="column" alignItems="center" paddingY={1}>
        <Text bold color={THEME.danger}>Weet je het zeker?</Text>
        <Text color={THEME.text}>Je {labels[pendingReset]} worden permanent gewist.</Text>
        <Text> </Text>
        <Box flexDirection="column">
          <SelectInput
            items={confirmItems}
            onSelect={(item) => {
              if (item.value === 'confirm') {
                switch (pendingReset) {
                  case 'stats': onResetStats(); break;
                  case 'achievements': onResetAchievements(); break;
                  case 'all': onResetAll(); break;
                }
              }
              setPendingReset(null);
              setView('main');
            }}
          />
        </Box>
      </Box>
    );
  }

  if (view === 'reset') {
    const items = [
      { label: '📊  Statistieken wissen', value: 'stats' },
      { label: '🏅  Prestaties wissen', value: 'achievements' },
      { label: '🗑  Alles wissen', value: 'all' },
      { label: '← Terug', value: 'back' },
    ];

    return (
      <Box flexDirection="column" alignItems="center" paddingY={1}>
        <Text bold color={THEME.secondary}>Gegevens resetten:</Text>
        <Text color={THEME.danger}>Let op: dit kan niet ongedaan worden!</Text>
        <Text> </Text>
        <Box flexDirection="column">
          <SelectInput
            items={items}
            onSelect={(item) => {
              if (item.value === 'back') {
                setView('main');
              } else {
                setPendingReset(item.value as ResetType);
                setView('confirm_reset');
              }
            }}
          />
        </Box>
      </Box>
    );
  }

  // Main settings view
  const diffLabel = DIFFICULTIES[currentDifficulty].label;
  const items = [
    { label: `🎯  Moeilijkheidsgraad (${diffLabel})`, value: 'difficulty' },
    { label: '👤  Speler wisselen', value: 'switch_player' },
    { label: '🗑  Gegevens resetten', value: 'reset' },
    { label: '← Terug', value: 'back' },
  ];

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Text bold color={THEME.secondary}>Instellingen</Text>
      <Text color={THEME.muted}>Speler: <Text color={THEME.highlight}>{playerName}</Text></Text>
      <Text> </Text>
      <Box flexDirection="column">
        <SelectInput
          items={items}
          onSelect={(item) => {
            switch (item.value) {
              case 'difficulty':
                setView('difficulty');
                break;
              case 'switch_player':
                onSwitchPlayer();
                break;
              case 'reset':
                setView('reset');
                break;
              case 'back':
                onBack();
                break;
            }
          }}
        />
      </Box>
    </Box>
  );
}
