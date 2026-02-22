import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { THEME } from '../ui/colors.js';
import { SCOUTING_LOGO } from '../ui/ascii-art.js';

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      onDone();
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onDone]);

  const campfire = tick % 4;
  const fires = ['🔥', '🔥🔥', '🔥🔥🔥', '🔥🔥'];

  return (
    <Box flexDirection="column" alignItems="center" paddingY={2}>
      <Box flexDirection="column" alignItems="center">
        {SCOUTING_LOGO.map((line, i) => (
          <Text key={i} color={THEME.primary}>{line}</Text>
        ))}
      </Box>
      <Text> </Text>
      <Text bold color={THEME.secondary}>
        ⚜️  Scouting Hangman  ⚜️
      </Text>
      <Text color={THEME.muted}>Het galgje-spel voor scouts</Text>
      <Text> </Text>
      <Text>{fires[campfire]}</Text>
      <Text color={THEME.muted}>🪵🪵</Text>
      <Text> </Text>
      <Text color={THEME.muted} dimColor>Laden...</Text>
    </Box>
  );
}
