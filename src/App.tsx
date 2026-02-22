import React, { useState, useCallback, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import type Database from 'better-sqlite3';
import { getDatabase, initializeDatabase } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import { getRandomWord, incrementWordPlayed, getAllCategories } from './db/words.js';
import { getOrCreatePlayer, saveGameSession, getPlayerStats, getLeaderboard } from './db/stats.js';
import { checkNewAchievements, getUnlockedAchievements } from './game/achievements.js';
import { updateExecutionerMood } from './executioner/personality.js';
import { createGameState, getGameDuration, type GameState } from './game/engine.js';
import { DIFFICULTIES, type DifficultyLevel } from './game/difficulty.js';
import { THEME } from './ui/colors.js';

import { SplashScreen } from './screens/SplashScreen.js';
import { PlayerNameScreen } from './screens/PlayerNameScreen.js';
import { MainMenu, type MenuAction } from './screens/MainMenu.js';
import { DifficultySelect } from './screens/DifficultySelect.js';
import { GameScreen } from './screens/GameScreen.js';
import { GameOverScreen } from './screens/GameOverScreen.js';
import { StatsScreen } from './screens/StatsScreen.js';
import { AchievementsScreen } from './screens/AchievementsScreen.js';
import { LeaderboardScreen } from './screens/LeaderboardScreen.js';

type Screen =
  | 'splash'
  | 'player_name'
  | 'main_menu'
  | 'difficulty_select'
  | 'playing'
  | 'game_over'
  | 'stats'
  | 'achievements'
  | 'leaderboard';

export function App() {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('splash');
  const [db, setDb] = useState<Database.Database | null>(null);
  const [playerId, setPlayerId] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('normaal');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<{
    won: boolean;
    state: GameState;
    newAchievements: string[];
    streak: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const database = getDatabase();
      initializeDatabase(database);
      seedDatabase(database);
      setDb(database);
    } catch (err) {
      setError(`Database fout: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  const startGame = useCallback((diff: DifficultyLevel) => {
    if (!db) return;

    const config = DIFFICULTIES[diff];
    const randomDifficulty = config.dbDifficulty[Math.floor(Math.random() * config.dbDifficulty.length)];
    const word = getRandomWord(db, { difficulty: randomDifficulty });

    if (!word) {
      setError('Geen woorden beschikbaar. Probeer een andere moeilijkheidsgraad.');
      setScreen('main_menu');
      return;
    }

    setDifficulty(diff);
    setGameState(createGameState(word.word, word.id, word.category));
    setCurrentHint(word.hint);
    setGameResult(null);
    setScreen('playing');
  }, [db]);

  const handleGameEnd = useCallback((won: boolean, finalState: GameState) => {
    if (!db) return;

    const duration = getGameDuration(finalState);

    saveGameSession(db, {
      playerId,
      wordId: finalState.wordId,
      difficulty,
      won,
      wrongGuesses: finalState.wrongGuesses,
      guessedLetters: finalState.guessedLetters,
      durationSeconds: duration,
    });

    incrementWordPlayed(db, finalState.wordId, won);
    updateExecutionerMood(db, playerId, won);

    const newAchievements = checkNewAchievements(
      db, playerId, won, finalState.wrongGuesses, duration, finalState.category
    );

    const stats = getPlayerStats(db, playerId);

    setGameResult({
      won,
      state: finalState,
      newAchievements,
      streak: stats.currentStreak,
    });
    setScreen('game_over');
  }, [db, playerId, difficulty]);

  const handleMenuSelect = useCallback((action: MenuAction) => {
    switch (action) {
      case 'play':
        setScreen('difficulty_select');
        break;
      case 'stats':
        setScreen('stats');
        break;
      case 'achievements':
        setScreen('achievements');
        break;
      case 'leaderboard':
        setScreen('leaderboard');
        break;
      case 'quit':
        exit();
        break;
    }
  }, [exit]);

  const handlePlayerName = useCallback((name: string) => {
    if (!db) return;
    const player = getOrCreatePlayer(db, name);
    setPlayerId(player.id);
    setPlayerName(name);
    setScreen('main_menu');
  }, [db]);

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color={THEME.danger} bold>❌ Fout: {error}</Text>
        <Text color={THEME.muted}>Probeer het opnieuw of verwijder ~/.scouting-hangman/game.db</Text>
      </Box>
    );
  }

  if (!db) {
    return <Text color={THEME.muted}>Database laden...</Text>;
  }

  switch (screen) {
    case 'splash':
      return <SplashScreen onDone={() => setScreen('player_name')} />;

    case 'player_name':
      return <PlayerNameScreen onSubmit={handlePlayerName} />;

    case 'main_menu':
      return <MainMenu playerName={playerName} onSelect={handleMenuSelect} />;

    case 'difficulty_select':
      return (
        <DifficultySelect
          onSelect={startGame}
          onBack={() => setScreen('main_menu')}
        />
      );

    case 'playing':
      if (!gameState) return null;
      return (
        <GameScreen
          db={db}
          gameState={gameState}
          playerId={playerId}
          playerName={playerName}
          difficulty={difficulty}
          hint={currentHint}
          onStateChange={setGameState}
          onGameEnd={handleGameEnd}
        />
      );

    case 'game_over':
      if (!gameResult) return null;
      return (
        <GameOverScreen
          won={gameResult.won}
          gameState={gameResult.state}
          word={gameResult.state.word}
          newAchievements={gameResult.newAchievements}
          streak={gameResult.streak}
          onSelect={(action) => {
            switch (action) {
              case 'play_again':
                startGame(difficulty);
                break;
              case 'menu':
                setScreen('main_menu');
                break;
              case 'quit':
                exit();
                break;
            }
          }}
        />
      );

    case 'stats': {
      const stats = getPlayerStats(db, playerId);
      return (
        <StatsScreen
          stats={stats}
          playerName={playerName}
          onBack={() => setScreen('main_menu')}
        />
      );
    }

    case 'achievements': {
      const unlocked = getUnlockedAchievements(db, playerId);
      return (
        <AchievementsScreen
          unlockedKeys={unlocked}
          onBack={() => setScreen('main_menu')}
        />
      );
    }

    case 'leaderboard': {
      const entries = getLeaderboard(db);
      return (
        <LeaderboardScreen
          entries={entries}
          onBack={() => setScreen('main_menu')}
        />
      );
    }

    default:
      return null;
  }
}
