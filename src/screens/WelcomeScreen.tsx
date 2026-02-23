import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { THEME } from '../ui/colors.js';
import { SCOUTING_LOGO } from '../ui/ascii-art.js';
import type { Player, PlayerStats } from '../db/stats.js';

export interface PlayerOverview {
  player: Player;
  stats: PlayerStats;
}

interface WelcomeScreenProps {
  players: PlayerOverview[];
  onSelectPlayer: (player: Player) => void;
  onNewPlayer: () => void;
}

function formatPlayTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}u${remainMins > 0 ? `${remainMins}m` : ''}`;
}

function formatStats(stats: PlayerStats): string {
  const parts: string[] = [];
  parts.push(`${stats.wins}W-${stats.losses}L`);
  if (stats.currentStreak >= 2) parts.push(`streak ${stats.currentStreak}`);
  if (stats.totalPlayTime > 0) parts.push(formatPlayTime(stats.totalPlayTime));
  return parts.join(' | ');
}

export function WelcomeScreen({ players, onSelectPlayer, onNewPlayer }: WelcomeScreenProps) {
  const totalItems = players.length + 1; // players + "Nieuwe speler"
  const [cursor, setCursor] = useState(0);

  useInput((_input, key) => {
    if (key.upArrow) {
      setCursor(prev => (prev - 1 + totalItems) % totalItems);
    } else if (key.downArrow) {
      setCursor(prev => (prev + 1) % totalItems);
    } else if (key.return) {
      if (cursor < players.length) {
        onSelectPlayer(players[cursor].player);
      } else {
        onNewPlayer();
      }
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1} gap={1}>
      <Box flexDirection="column" alignItems="center">
        {SCOUTING_LOGO.map((line, i) => (
          <Text key={i} color={THEME.primary}>{line}</Text>
        ))}
      </Box>

      <Text bold color={THEME.secondary}>Scouting Hangman</Text>
      <Text color={THEME.muted}>Kies je speler:</Text>

      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={THEME.primary}
        paddingX={2}
        paddingY={1}
      >
        {players.map(({ player, stats }, i) => {
          const selected = cursor === i;
          const pointer = selected ? '>' : ' ';
          const nameColor = selected ? THEME.highlight : THEME.text;
          const statsText = formatStats(stats);

          return (
            <Box key={player.id} gap={1}>
              <Text color={THEME.primary} bold>{pointer}</Text>
              <Text color={nameColor} bold={selected}>{player.name}</Text>
              <Text color={THEME.muted} dimColor>{statsText}</Text>
            </Box>
          );
        })}

        {players.length > 0 && <Text color={THEME.muted}>{'  ───'}</Text>}

        <Box gap={1}>
          <Text color={THEME.primary} bold>{cursor === players.length ? '>' : ' '}</Text>
          <Text
            color={cursor === players.length ? THEME.secondary : THEME.muted}
            bold={cursor === players.length}
          >
            + Nieuwe speler
          </Text>
        </Box>
      </Box>

      <Text color={THEME.muted} dimColor>↑↓ navigeer, Enter = kies</Text>
    </Box>
  );
}
