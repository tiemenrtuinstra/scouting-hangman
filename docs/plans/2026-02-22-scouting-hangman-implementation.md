# Scouting Hangman Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a visually rich, terminal-based Hangman game with scouting theme, featuring a talking executioner with memory, SQLite persistence, achievements, and cross-platform installation.

**Architecture:** React Ink 5 (React for terminals) with TypeScript. SQLite via better-sqlite3 for word lists, game stats, achievements, and executioner memory. CLI entry via commander. Distributed as npm global package + Node.js SEA binaries.

**Tech Stack:** React 18, Ink 5, TypeScript, better-sqlite3 12.x, commander 14.x, tsup, ink-text-input, ink-select-input, ink-spinner, ink-gradient, ink-big-text

---

## Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/index.tsx`

**Step 1: Initialize npm project with package.json**

Create `package.json` with all dependencies, bin entry, and scripts:

```json
{
  "name": "scouting-hangman",
  "version": "1.0.0",
  "description": "Scouting Hangman - Een interactief galgje-spel voor scouts met een pratende beul",
  "type": "module",
  "bin": {
    "scouting-hangman": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx src/index.tsx",
    "build": "tsup src/index.tsx --format esm --target node20 --clean --banner.js '#!/usr/bin/env node'",
    "start": "node dist/index.js",
    "seed": "tsx scripts/seed-db.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "build:binary": "tsx scripts/build-binary.ts"
  },
  "keywords": ["scouting", "hangman", "galgje", "cli", "terminal", "game"],
  "author": "tiemenrtuinstra",
  "license": "MIT",
  "dependencies": {
    "better-sqlite3": "^12.6.2",
    "commander": "^14.0.3",
    "ink": "^5.1.0",
    "ink-big-text": "^2.0.0",
    "ink-gradient": "^4.0.0",
    "ink-select-input": "^6.2.0",
    "ink-spinner": "^5.0.0",
    "ink-text-input": "^4.0.3",
    "react": "^18.3.1"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "@types/react": "^18.3.18",
    "tsup": "^8.5.1",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

**Step 2: Create TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create .gitignore**

```
node_modules/
dist/
*.db
*.sqlite
.DS_Store
```

**Step 4: Create minimal entry point**

Create `src/index.tsx`:

```tsx
#!/usr/bin/env node
import { render } from 'ink';
import React from 'react';
import { Text } from 'ink';

function App() {
  return <Text color="green">Scouting Hangman laden...</Text>;
}

render(<App />);
```

**Step 5: Install dependencies**

Run: `cd scouting-hangman && npm install`
Expected: All packages install successfully, `node_modules/` created.

**Step 6: Verify it works**

Run: `npm run dev`
Expected: Terminal shows green text "Scouting Hangman laden..."

**Step 7: Commit**

```bash
git add package.json tsconfig.json .gitignore src/index.tsx
git commit -m "feat: scaffold project with React Ink, TypeScript, SQLite"
```

---

## Task 2: Database Layer

**Files:**
- Create: `src/db/database.ts`
- Create: `src/db/migrations.ts`
- Create: `src/db/words.ts`
- Create: `src/db/stats.ts`
- Create: `src/db/seed.ts`
- Create: `data/default-words.json`
- Create: `scripts/seed-db.ts`
- Test: `src/db/__tests__/database.test.ts`

**Step 1: Write database connection tests**

Create `src/db/__tests__/database.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { getDatabase, closeDatabase, initializeDatabase } from '../database.js';

describe('Database', () => {
  afterEach(() => {
    closeDatabase();
  });

  it('should create an in-memory database for testing', () => {
    const db = getDatabase(':memory:');
    expect(db).toBeDefined();
    expect(db.open).toBe(true);
  });

  it('should initialize all tables', () => {
    const db = getDatabase(':memory:');
    initializeDatabase(db);

    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all() as { name: string }[];

    const tableNames = tables.map(t => t.name);
    expect(tableNames).toContain('players');
    expect(tableNames).toContain('words');
    expect(tableNames).toContain('game_sessions');
    expect(tableNames).toContain('achievements');
    expect(tableNames).toContain('executioner_memory');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/db/__tests__/database.test.ts`
Expected: FAIL - modules not found

**Step 3: Implement database.ts**

Create `src/db/database.ts`:

```typescript
import Database from 'better-sqlite3';
import { runMigrations } from './migrations.js';
import path from 'path';
import os from 'os';
import fs from 'fs';

let db: Database.Database | null = null;

export function getDbPath(): string {
  const dataDir = path.join(os.homedir(), '.scouting-hangman');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'game.db');
}

export function getDatabase(dbPath?: string): Database.Database {
  if (db && db.open) return db;
  db = new Database(dbPath ?? getDbPath());
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function initializeDatabase(database?: Database.Database): void {
  const d = database ?? getDatabase();
  runMigrations(d);
}

export function closeDatabase(): void {
  if (db && db.open) {
    db.close();
    db = null;
  }
}
```

**Step 4: Implement migrations.ts**

Create `src/db/migrations.ts`:

```typescript
import type Database from 'better-sqlite3';

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      difficulty INTEGER DEFAULT 1,
      hint TEXT,
      times_played INTEGER DEFAULT 0,
      times_won INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      word_id INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      won BOOLEAN NOT NULL,
      wrong_guesses INTEGER NOT NULL,
      guessed_letters TEXT NOT NULL,
      duration_seconds INTEGER,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      finished_at DATETIME,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (word_id) REFERENCES words(id)
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      achievement_key TEXT NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id),
      UNIQUE(player_id, achievement_key)
    );

    CREATE TABLE IF NOT EXISTS executioner_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      mood TEXT NOT NULL DEFAULT 'neutraal',
      respect_level INTEGER DEFAULT 50,
      last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id),
      UNIQUE(player_id)
    );
  `);
}
```

**Step 5: Write words CRUD tests**

Add to `src/db/__tests__/words.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase, initializeDatabase, closeDatabase } from '../database.js';
import { addWord, getRandomWord, getWordsByCategory, getAllCategories } from '../words.js';

describe('Words', () => {
  let db: ReturnType<typeof getDatabase>;

  beforeEach(() => {
    closeDatabase();
    db = getDatabase(':memory:');
    initializeDatabase(db);
  });

  it('should add a word', () => {
    const id = addWord(db, { word: 'kampvuur', category: 'kamperen', difficulty: 1, hint: 'Brandt in het midden van het kamp' });
    expect(id).toBeGreaterThan(0);
  });

  it('should get a random word', () => {
    addWord(db, { word: 'kampvuur', category: 'kamperen', difficulty: 1 });
    addWord(db, { word: 'sjorren', category: 'scouting', difficulty: 2 });
    const word = getRandomWord(db);
    expect(word).toBeDefined();
    expect(['kampvuur', 'sjorren']).toContain(word!.word);
  });

  it('should get a random word by difficulty', () => {
    addWord(db, { word: 'tent', category: 'kamperen', difficulty: 1 });
    addWord(db, { word: 'vlaggenparade', category: 'scouting', difficulty: 3 });
    const word = getRandomWord(db, { difficulty: 1 });
    expect(word!.word).toBe('tent');
  });

  it('should list all categories', () => {
    addWord(db, { word: 'kampvuur', category: 'kamperen', difficulty: 1 });
    addWord(db, { word: 'sjorren', category: 'scouting', difficulty: 2 });
    const categories = getAllCategories(db);
    expect(categories).toContain('kamperen');
    expect(categories).toContain('scouting');
  });
});
```

**Step 6: Implement words.ts**

Create `src/db/words.ts`:

```typescript
import type Database from 'better-sqlite3';

export interface Word {
  id: number;
  word: string;
  category: string;
  difficulty: number;
  hint: string | null;
  times_played: number;
  times_won: number;
}

export interface AddWordInput {
  word: string;
  category: string;
  difficulty?: number;
  hint?: string;
}

export function addWord(db: Database.Database, input: AddWordInput): number {
  const difficulty = input.difficulty ?? calculateDifficulty(input.word);
  const stmt = db.prepare(
    'INSERT OR IGNORE INTO words (word, category, difficulty, hint) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(input.word.toLowerCase(), input.category, difficulty, input.hint ?? null);
  return Number(result.lastInsertRowid);
}

export function getRandomWord(
  db: Database.Database,
  options?: { difficulty?: number; category?: string }
): Word | undefined {
  let query = 'SELECT * FROM words';
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (options?.difficulty) {
    conditions.push('difficulty = ?');
    params.push(options.difficulty);
  }
  if (options?.category) {
    conditions.push('category = ?');
    params.push(options.category);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY RANDOM() LIMIT 1';

  return db.prepare(query).get(...params) as Word | undefined;
}

export function getWordsByCategory(db: Database.Database, category: string): Word[] {
  return db.prepare('SELECT * FROM words WHERE category = ? ORDER BY word').all(category) as Word[];
}

export function getAllCategories(db: Database.Database): string[] {
  const rows = db.prepare('SELECT DISTINCT category FROM words ORDER BY category').all() as { category: string }[];
  return rows.map(r => r.category);
}

export function incrementWordPlayed(db: Database.Database, wordId: number, won: boolean): void {
  db.prepare('UPDATE words SET times_played = times_played + 1 WHERE id = ?').run(wordId);
  if (won) {
    db.prepare('UPDATE words SET times_won = times_won + 1 WHERE id = ?').run(wordId);
  }
}

function calculateDifficulty(word: string): number {
  const len = word.length;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  return 3;
}
```

**Step 7: Write stats tests**

Create `src/db/__tests__/stats.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase, initializeDatabase, closeDatabase } from '../database.js';
import { addWord } from '../words.js';
import {
  getOrCreatePlayer,
  saveGameSession,
  getPlayerStats,
  getLeaderboard,
} from '../stats.js';

describe('Stats', () => {
  let db: ReturnType<typeof getDatabase>;

  beforeEach(() => {
    closeDatabase();
    db = getDatabase(':memory:');
    initializeDatabase(db);
  });

  it('should create a player', () => {
    const player = getOrCreatePlayer(db, 'Tiemen');
    expect(player.id).toBeGreaterThan(0);
    expect(player.name).toBe('Tiemen');
  });

  it('should return existing player on second call', () => {
    const p1 = getOrCreatePlayer(db, 'Tiemen');
    const p2 = getOrCreatePlayer(db, 'Tiemen');
    expect(p1.id).toBe(p2.id);
  });

  it('should save and retrieve game stats', () => {
    const player = getOrCreatePlayer(db, 'Tiemen');
    const wordId = addWord(db, { word: 'kampvuur', category: 'kamperen', difficulty: 1 });

    saveGameSession(db, {
      playerId: player.id,
      wordId,
      difficulty: 'normaal',
      won: true,
      wrongGuesses: 3,
      guessedLetters: ['a', 'e', 'k', 'm', 'p', 'v', 'u', 'r'],
      durationSeconds: 45,
    });

    const stats = getPlayerStats(db, player.id);
    expect(stats.totalGames).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(0);
  });
});
```

**Step 8: Implement stats.ts**

Create `src/db/stats.ts`:

```typescript
import type Database from 'better-sqlite3';

export interface Player {
  id: number;
  name: string;
  created_at: string;
}

export interface GameSessionInput {
  playerId: number;
  wordId: number;
  difficulty: string;
  won: boolean;
  wrongGuesses: number;
  guessedLetters: string[];
  durationSeconds: number;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  avgWrongGuesses: number;
  currentStreak: number;
  bestStreak: number;
  totalPlayTime: number;
  fastestWin: number | null;
  longestWord: string | null;
}

export interface LeaderboardEntry {
  name: string;
  wins: number;
  totalGames: number;
  winRate: number;
  bestStreak: number;
}

export function getOrCreatePlayer(db: Database.Database, name: string): Player {
  const existing = db.prepare('SELECT * FROM players WHERE name = ?').get(name) as Player | undefined;
  if (existing) return existing;

  const result = db.prepare('INSERT INTO players (name) VALUES (?)').run(name);
  return { id: Number(result.lastInsertRowid), name, created_at: new Date().toISOString() };
}

export function saveGameSession(db: Database.Database, input: GameSessionInput): number {
  const result = db.prepare(`
    INSERT INTO game_sessions (player_id, word_id, difficulty, won, wrong_guesses, guessed_letters, duration_seconds, finished_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    input.playerId,
    input.wordId,
    input.difficulty,
    input.won ? 1 : 0,
    input.wrongGuesses,
    JSON.stringify(input.guessedLetters),
    input.durationSeconds
  );
  return Number(result.lastInsertRowid);
}

export function getPlayerStats(db: Database.Database, playerId: number): PlayerStats {
  const row = db.prepare(`
    SELECT
      COUNT(*) as totalGames,
      SUM(CASE WHEN won = 1 THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN won = 0 THEN 1 ELSE 0 END) as losses,
      AVG(wrong_guesses) as avgWrongGuesses,
      SUM(duration_seconds) as totalPlayTime,
      MIN(CASE WHEN won = 1 THEN duration_seconds END) as fastestWin
    FROM game_sessions WHERE player_id = ?
  `).get(playerId) as any;

  const longestWordRow = db.prepare(`
    SELECT w.word FROM game_sessions gs
    JOIN words w ON gs.word_id = w.id
    WHERE gs.player_id = ? AND gs.won = 1
    ORDER BY LENGTH(w.word) DESC LIMIT 1
  `).get(playerId) as { word: string } | undefined;

  const streaks = calculateStreaks(db, playerId);

  return {
    totalGames: row.totalGames ?? 0,
    wins: row.wins ?? 0,
    losses: row.losses ?? 0,
    winRate: row.totalGames > 0 ? (row.wins / row.totalGames) * 100 : 0,
    avgWrongGuesses: row.avgWrongGuesses ?? 0,
    currentStreak: streaks.current,
    bestStreak: streaks.best,
    totalPlayTime: row.totalPlayTime ?? 0,
    fastestWin: row.fastestWin ?? null,
    longestWord: longestWordRow?.word ?? null,
  };
}

function calculateStreaks(db: Database.Database, playerId: number): { current: number; best: number } {
  const games = db.prepare(
    'SELECT won FROM game_sessions WHERE player_id = ? ORDER BY started_at DESC'
  ).all(playerId) as { won: number }[];

  let current = 0;
  let best = 0;
  let streak = 0;

  for (const game of games) {
    if (game.won) {
      streak++;
      if (streak > best) best = streak;
    } else {
      if (current === 0) current = streak;
      streak = 0;
    }
  }
  if (current === 0) current = streak;

  return { current, best };
}

export function getLeaderboard(db: Database.Database, limit = 10): LeaderboardEntry[] {
  return db.prepare(`
    SELECT
      p.name,
      COUNT(*) as totalGames,
      SUM(CASE WHEN gs.won = 1 THEN 1 ELSE 0 END) as wins,
      ROUND(CAST(SUM(CASE WHEN gs.won = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 1) as winRate
    FROM game_sessions gs
    JOIN players p ON gs.player_id = p.id
    GROUP BY p.id
    ORDER BY wins DESC, winRate DESC
    LIMIT ?
  `).all(limit) as LeaderboardEntry[];
}
```

**Step 9: Create default words JSON**

Create `data/default-words.json` with 100+ scouting words across all categories.

**Step 10: Create seed script**

Create `src/db/seed.ts`:

```typescript
import type Database from 'better-sqlite3';
import { addWord } from './words.js';
import defaultWords from '../../data/default-words.json' assert { type: 'json' };

export function seedDatabase(db: Database.Database): number {
  let count = 0;
  const insert = db.transaction(() => {
    for (const entry of defaultWords) {
      const id = addWord(db, {
        word: entry.word,
        category: entry.category,
        difficulty: entry.difficulty,
        hint: entry.hint,
      });
      if (id > 0) count++;
    }
  });
  insert();
  return count;
}
```

Create `scripts/seed-db.ts`:

```typescript
import { getDatabase, initializeDatabase } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed.js';

const db = getDatabase();
initializeDatabase(db);
const count = seedDatabase(db);
console.log(`Database gevuld met ${count} woorden.`);
```

**Step 11: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

**Step 12: Commit**

```bash
git add src/db/ data/ scripts/ src/db/__tests__/
git commit -m "feat: add SQLite database layer with words, stats, players, and seeding"
```

---

## Task 3: Game Engine (Core Logic)

**Files:**
- Create: `src/game/engine.ts`
- Create: `src/game/difficulty.ts`
- Create: `src/game/achievements.ts`
- Test: `src/game/__tests__/engine.test.ts`
- Test: `src/game/__tests__/achievements.test.ts`

**Step 1: Write game engine tests**

Create `src/game/__tests__/engine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { createGameState, guessLetter, isGameWon, isGameLost, MAX_WRONG_GUESSES } from '../engine.js';

describe('Game Engine', () => {
  it('should create initial state', () => {
    const state = createGameState('kampvuur', 1, 'kamperen');
    expect(state.word).toBe('kampvuur');
    expect(state.guessedLetters).toEqual([]);
    expect(state.wrongGuesses).toBe(0);
    expect(state.maxWrongGuesses).toBe(MAX_WRONG_GUESSES);
  });

  it('should handle correct guess', () => {
    let state = createGameState('kampvuur', 1, 'kamperen');
    state = guessLetter(state, 'k');
    expect(state.guessedLetters).toContain('k');
    expect(state.wrongGuesses).toBe(0);
  });

  it('should handle wrong guess', () => {
    let state = createGameState('kampvuur', 1, 'kamperen');
    state = guessLetter(state, 'z');
    expect(state.guessedLetters).toContain('z');
    expect(state.wrongGuesses).toBe(1);
  });

  it('should detect win', () => {
    let state = createGameState('ab', 1, 'test');
    state = guessLetter(state, 'a');
    state = guessLetter(state, 'b');
    expect(isGameWon(state)).toBe(true);
  });

  it('should detect loss after 8 wrong guesses', () => {
    let state = createGameState('kampvuur', 1, 'test');
    for (const letter of ['z', 'x', 'q', 'w', 'y', 'b', 'd', 'f']) {
      state = guessLetter(state, letter);
    }
    expect(isGameLost(state)).toBe(true);
    expect(state.wrongGuesses).toBe(8);
  });

  it('should ignore duplicate guesses', () => {
    let state = createGameState('kampvuur', 1, 'test');
    state = guessLetter(state, 'k');
    state = guessLetter(state, 'k');
    expect(state.guessedLetters.filter(l => l === 'k')).toHaveLength(1);
  });

  it('should handle hint (costs 1 guess)', () => {
    let state = createGameState('kampvuur', 1, 'test');
    state = guessLetter(state, 'k');
    // useHint reveals an unrevealed letter but costs a wrong guess
  });
});
```

**Step 2: Implement engine.ts**

Create `src/game/engine.ts`:

```typescript
export const MAX_WRONG_GUESSES = 8;

export interface GameState {
  word: string;
  wordId: number;
  category: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  hintUsed: boolean;
  startTime: number;
}

export function createGameState(word: string, wordId: number, category: string): GameState {
  return {
    word: word.toLowerCase(),
    wordId,
    category,
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrongGuesses: MAX_WRONG_GUESSES,
    hintUsed: false,
    startTime: Date.now(),
  };
}

export function guessLetter(state: GameState, letter: string): GameState {
  const l = letter.toLowerCase();
  if (state.guessedLetters.includes(l)) return state;
  if (isGameWon(state) || isGameLost(state)) return state;

  const newGuessed = [...state.guessedLetters, l];
  const isCorrect = state.word.includes(l);

  return {
    ...state,
    guessedLetters: newGuessed,
    wrongGuesses: isCorrect ? state.wrongGuesses : state.wrongGuesses + 1,
  };
}

export function useHint(state: GameState): { state: GameState; revealedLetter: string | null } {
  if (state.hintUsed || isGameWon(state) || isGameLost(state)) {
    return { state, revealedLetter: null };
  }

  const unrevealedLetters = [...new Set(state.word.split(''))]
    .filter(l => !state.guessedLetters.includes(l));

  if (unrevealedLetters.length === 0) return { state, revealedLetter: null };

  const revealedLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];

  return {
    state: {
      ...state,
      guessedLetters: [...state.guessedLetters, revealedLetter],
      wrongGuesses: state.wrongGuesses + 1,
      hintUsed: true,
    },
    revealedLetter,
  };
}

export function isGameWon(state: GameState): boolean {
  return [...new Set(state.word.split(''))].every(l => state.guessedLetters.includes(l));
}

export function isGameLost(state: GameState): boolean {
  return state.wrongGuesses >= state.maxWrongGuesses;
}

export function getDisplayWord(state: GameState): string[] {
  return state.word.split('').map(l => (state.guessedLetters.includes(l) ? l.toUpperCase() : '_'));
}

export function getGameDuration(state: GameState): number {
  return Math.floor((Date.now() - state.startTime) / 1000);
}

export function calculateScore(state: GameState, won: boolean): number {
  if (!won) return 0;
  const wordBonus = state.word.length * 10;
  const accuracyBonus = (state.maxWrongGuesses - state.wrongGuesses) * 25;
  const speedBonus = Math.max(0, 300 - getGameDuration(state));
  const hintPenalty = state.hintUsed ? -50 : 0;
  return Math.max(0, wordBonus + accuracyBonus + speedBonus + hintPenalty);
}
```

**Step 3: Implement difficulty.ts**

Create `src/game/difficulty.ts`:

```typescript
export type DifficultyLevel = 'makkelijk' | 'normaal' | 'moeilijk';

export interface DifficultyConfig {
  label: string;
  dbDifficulty: number[];
  description: string;
}

export const DIFFICULTIES: Record<DifficultyLevel, DifficultyConfig> = {
  makkelijk: {
    label: 'Makkelijk',
    dbDifficulty: [1],
    description: 'Korte woorden, vriendelijke beul',
  },
  normaal: {
    label: 'Normaal',
    dbDifficulty: [1, 2],
    description: 'Gemiddelde woorden, humoristische beul',
  },
  moeilijk: {
    label: 'Moeilijk',
    dbDifficulty: [2, 3],
    description: 'Lange woorden, meedogenloze beul',
  },
};
```

**Step 4: Implement achievements.ts**

Create `src/game/achievements.ts`:

```typescript
import type Database from 'better-sqlite3';
import { getPlayerStats } from '../db/stats.js';

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: 'eerste_stap', name: 'Eerste Stap', description: 'Win je eerste spel', icon: '🎯' },
  { key: 'kampvuurmeester', name: 'Kampvuurmeester', description: 'Win 10 spellen op rij', icon: '🔥' },
  { key: 'snelheidsduivel', name: 'Snelheidsduivel', description: 'Win een spel in minder dan 30 seconden', icon: '⚡' },
  { key: 'foutloos', name: 'Foutloos', description: 'Win zonder foute letters', icon: '💎' },
  { key: 'doorbijer', name: 'Doorbijer', description: 'Speel 50 spellen', icon: '🏋️' },
  { key: 'scoutingkenner', name: 'Scoutingkenner', description: 'Win in elke categorie', icon: '🏅' },
  { key: 'beul_verslagen', name: 'De Beul Verslagen', description: 'Bereik maximaal respect bij de beul', icon: '👑' },
  { key: 'knopenexpert', name: 'Knopenexpert', description: 'Raad 5 knopen-woorden correct', icon: '🪢' },
];

export function checkNewAchievements(
  db: Database.Database,
  playerId: number,
  gameWon: boolean,
  wrongGuesses: number,
  durationSeconds: number,
  category: string,
): string[] {
  const stats = getPlayerStats(db, playerId);
  const existing = getUnlockedAchievements(db, playerId);
  const newAchievements: string[] = [];

  const checks: [string, boolean][] = [
    ['eerste_stap', stats.wins >= 1],
    ['kampvuurmeester', stats.currentStreak >= 10],
    ['snelheidsduivel', gameWon && durationSeconds < 30],
    ['foutloos', gameWon && wrongGuesses === 0],
    ['doorbijer', stats.totalGames >= 50],
  ];

  for (const [key, condition] of checks) {
    if (condition && !existing.includes(key)) {
      unlockAchievement(db, playerId, key);
      newAchievements.push(key);
    }
  }

  return newAchievements;
}

export function unlockAchievement(db: Database.Database, playerId: number, key: string): void {
  db.prepare('INSERT OR IGNORE INTO achievements (player_id, achievement_key) VALUES (?, ?)').run(playerId, key);
}

export function getUnlockedAchievements(db: Database.Database, playerId: number): string[] {
  const rows = db.prepare('SELECT achievement_key FROM achievements WHERE player_id = ?').all(playerId) as { achievement_key: string }[];
  return rows.map(r => r.achievement_key);
}
```

**Step 5: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

**Step 6: Commit**

```bash
git add src/game/
git commit -m "feat: add game engine with state machine, difficulty levels, and achievements"
```

---

## Task 4: Executioner (Beul) System

**Files:**
- Create: `src/executioner/moods.ts`
- Create: `src/executioner/dialogues.ts`
- Create: `src/executioner/personality.ts`
- Test: `src/executioner/__tests__/personality.test.ts`

**Step 1: Write personality tests**

Create `src/executioner/__tests__/personality.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase, initializeDatabase, closeDatabase } from '../../db/database.js';
import { getOrCreatePlayer } from '../../db/stats.js';
import { getExecutionerDialogue, updateExecutionerMood } from '../personality.js';
import type { ExecutionerMood } from '../moods.js';

describe('Executioner Personality', () => {
  let db: ReturnType<typeof getDatabase>;

  beforeEach(() => {
    closeDatabase();
    db = getDatabase(':memory:');
    initializeDatabase(db);
  });

  it('should return neutraal mood for new player', () => {
    const player = getOrCreatePlayer(db, 'Test');
    const dialogue = getExecutionerDialogue(db, player.id, 'game_start', 'normaal');
    expect(dialogue.mood).toBe('neutraal');
    expect(dialogue.text.length).toBeGreaterThan(0);
  });

  it('should update mood after games', () => {
    const player = getOrCreatePlayer(db, 'Test');
    updateExecutionerMood(db, player.id, true);
    const memory = db.prepare('SELECT * FROM executioner_memory WHERE player_id = ?').get(player.id) as any;
    expect(memory.respect_level).toBeGreaterThan(50);
  });
});
```

**Step 2: Implement moods.ts**

Create `src/executioner/moods.ts`:

```typescript
export type ExecutionerMood = 'neutraal' | 'onder_de_indruk' | 'sarcastisch' | 'gefrustreerd' | 'meedogenloos' | 'kindvriendelijk';

export type DialogueMoment = 'game_start' | 'correct_guess' | 'wrong_guess' | 'almost_dead' | 'win' | 'loss' | 'achievement' | 'streak';

export interface ExecutionerMemory {
  mood: ExecutionerMood;
  respectLevel: number;
}

export function determineMood(respectLevel: number, difficulty: string): ExecutionerMood {
  if (difficulty === 'makkelijk') return 'kindvriendelijk';
  if (difficulty === 'moeilijk') return 'meedogenloos';

  if (respectLevel >= 80) return 'gefrustreerd';
  if (respectLevel >= 65) return 'onder_de_indruk';
  if (respectLevel <= 30) return 'sarcastisch';
  return 'neutraal';
}
```

**Step 3: Implement dialogues.ts**

Create `src/executioner/dialogues.ts` with extensive Dutch dialogue for every mood and moment (100+ lines of dialogue). This is the creative heart of the game.

```typescript
import type { ExecutionerMood, DialogueMoment } from './moods.js';

type DialogueMap = Record<ExecutionerMood, Record<DialogueMoment, string[]>>;

export const DIALOGUES: DialogueMap = {
  neutraal: {
    game_start: [
      'Welkom bij de galg, scout. Laten we kijken wat je waard bent.',
      'Ah, een nieuwe uitdager. Ik hoop dat je beter bent dan de vorige...',
      'De galg staat klaar. Jij ook?',
      'Hmm, laten we eens kijken of jij slimmer bent dan je eruitziet.',
      'Nog een scout die denkt dat hij slim is. Bewijs het maar.',
    ],
    correct_guess: [
      'Hmm, niet slecht.',
      'Oké, die zat erin.',
      'Toevalstreffer, vast.',
      'Je hebt geluk vandaag.',
    ],
    wrong_guess: [
      'Ha! Mis!',
      'Nee hoor. De strop wordt strakker...',
      'Fout. Dat gaat je opbreken.',
      'Jammer dan. Weer een stap dichter bij het einde.',
    ],
    almost_dead: [
      'Nog één foutje en het is voorbij...',
      'Ik kan het touw al bijna aanspannen...',
      'Je laatste kans, scout. Kies wijselijk.',
    ],
    win: [
      'Pff. Je had geluk. Volgende keer pak ik je.',
      'Oké, je bent ontsnapt. Dit keer.',
      'Goed gespeeld. Maar denk niet dat het altijd zo makkelijk gaat.',
    ],
    loss: [
      'Ha! Ik wist het. De galg wint altijd.',
      'Volgende keer beter, scout. Of niet.',
      'Dat was het dan. Beter je scouting-kennis opfrissen!',
    ],
    achievement: [
      'Oh, een prestatie. Indrukwekkend... denk ik.',
      'Gefeliciteerd. Nu terug aan de galg.',
    ],
    streak: [
      'Je bent op dreef, scout. Maar hoe lang nog?',
      'Niet slecht, die reeks. Maar ik breek hem wel.',
    ],
  },
  onder_de_indruk: {
    game_start: [
      'Oh nee, jij weer... Je bent echt goed, hè?',
      'De kampioen is terug. Ik word er zenuwachtig van.',
      'Oké, oké, je bent goed. Maar dit woord is MOEILIJK.',
    ],
    correct_guess: [
      'Natuurlijk wist je dat. Waarom verbaast me dit nog?',
      'Hoe... hoe doe je dat toch?',
      'Oké, ik geef het toe. Je bent goed.',
    ],
    wrong_guess: [
      'Ha! Eindelijk een fout! Er is hoop!',
      'Ja! Mis! De held is ook maar een mens!',
      'Oeh, een foutje! Misschien is dit mijn dag!',
    ],
    almost_dead: [
      'Wacht... ga je nu ECHT verliezen? Dit is mijn moment!',
      'Kom op, nog één foutje... voor mij?',
    ],
    win: [
      'Alwéér?! Ik moet echt moeilijkere woorden gaan zoeken...',
      'Je bent een legende. Een vervelende legende, maar toch.',
    ],
    loss: [
      'JA! EINDELIJK! Ik heb gewonnen! Feestje!',
      'Ha! De grote kampioen is gevallen! Dit onthoud ik!',
    ],
    achievement: [
      'Nóg een prestatie? Je verzamelt ze als scouting-badges...',
    ],
    streak: [
      'Die reeks van je maakt me gek. Stop alsjeblieft.',
    ],
  },
  sarcastisch: {
    game_start: [
      'Oh, je bent terug. Ik dacht dat je het had opgegeven.',
      'Laten we eerlijk zijn, dit gaat niet goed aflopen voor jou.',
      'Weet je zeker dat je dit wilt? Er zijn makkelijkere spellen...',
    ],
    correct_guess: [
      'Wow, je kunt het alfabet! Gefeliciteerd.',
      'Wauw, een goede gok. Zelfs een kapotte klok heeft twee keer per dag gelijk.',
      'Oh kijk, een correct antwoord. Markeer de kalender.',
    ],
    wrong_guess: [
      'Verrassing, verrassing...',
      'Wie had dat gedacht? Oh wacht, iedereen.',
      'Typisch. Heel typisch.',
    ],
    almost_dead: [
      'Bijna... bijna heb ik je. En dit keer ga je niet ontsnappen.',
      'Nog één foutje. Niet dat ik eraan twijfel...',
    ],
    win: [
      'Oké... dat had ik niet verwacht. Respect, denk ik.',
      'Huh. Je bent beter dan je eruitziet. Nét.',
    ],
    loss: [
      'Tja. Dat was voorspelbaar.',
      'Volgende keer misschien een woordzoeker proberen?',
    ],
    achievement: [
      'Een prestatie? Zelfs een blind hoen vindt soms een korrel.',
    ],
    streak: [
      'Een reeks? Van verliezen toch?',
    ],
  },
  gefrustreerd: {
    game_start: [
      'JIJ. WEER. Oké, dit keer heb ik een ONMOGELIJK woord.',
      'Ik heb de hele nacht nagedacht over dit woord. Je gaat verliezen.',
      'Bereid je voor. Dit wordt MIJN overwinning.',
    ],
    correct_guess: [
      'NEE! Hoe wist je dat?!',
      'Onmogelijk! Je smokkelt toch niet?!',
      'ARGH. Oké. Oké. Er zijn nog meer letters...',
    ],
    wrong_guess: [
      'JA! FOUT! De galg groeit!',
      'Eindelijk! Ik wist dat je niet ALLES wist!',
    ],
    almost_dead: [
      'Ja... ja... nog eentje... ALSJEBLIEFT maak een fout...',
    ],
    win: [
      'IK GEEF HET OP. Je bent onverslaanbaar. Bijna.',
      'HOE?! Ik had het perfecte woord! VOLGENDE KEER!',
    ],
    loss: [
      'JAAA! GEWONNEN! IK HEB GEWONNEN! Neem dat!',
      'HA! De streak is voorbij! Dit voelt ZO goed!',
    ],
    achievement: [
      'Nog meer prestaties?! Hou op!',
    ],
    streak: [
      'Die reeks... die VERVLOEKTE reeks...',
    ],
  },
  meedogenloos: {
    game_start: [
      'De galg wacht.',
      'Begin maar. Je gaat verliezen.',
      'Moeilijke modus. Geen genade.',
    ],
    correct_guess: [
      '...',
      'Hmm.',
      'Dat verandert niets.',
    ],
    wrong_guess: [
      'De strop trekt aan.',
      'Weer een stap.',
      'Het einde nadert.',
    ],
    almost_dead: [
      'Vaarwel, scout.',
      'Het was kort.',
    ],
    win: [
      'Indrukwekkend. Geniet ervan. Het duurt niet.',
      'Je leeft. Vandaag.',
    ],
    loss: [
      'Voorspelbaar.',
      'De galg wint. Altijd.',
    ],
    achievement: [
      'Irrelevant.',
    ],
    streak: [
      'Streaks eindigen altijd.',
    ],
  },
  kindvriendelijk: {
    game_start: [
      'Hallo scout! Welkom bij het galgje-spel! Doe je best!',
      'Hoi! Leuk dat je er bent! Laten we een woord raden!',
      'Welkom terug! Ik heb een leuk woord voor je!',
    ],
    correct_guess: [
      'Goed zo! Die letter zit erin!',
      'Super! Je bent hartstikke slim!',
      'Ja! Lekker bezig!',
      'Héél goed! Ga zo door!',
    ],
    wrong_guess: [
      'Oeps, die zat er niet in. Maar geeft niks, je kunt het!',
      'Jammer! Maar je hebt nog genoeg pogingen!',
      'Die was het niet, maar niet opgeven hoor!',
    ],
    almost_dead: [
      'Let op, je hebt nog maar een paar pogingen! Denk goed na!',
      'Bijna op, maar je kunt het nog! Welke letter denk je?',
    ],
    win: [
      'HOERA! Je hebt het geraden! Wat knap!',
      'Gewonnen! Je bent een echte scouting-kampioen!',
      'Fantastisch! Je bent super goed hierin!',
    ],
    loss: [
      'Jammer! Maar je hebt je best gedaan en dat is het belangrijkste!',
      'Niet gelukt deze keer, maar volgende keer beter! Het woord was trouwens...',
    ],
    achievement: [
      'Wauw! Je hebt een prestatie behaald! Geweldig!',
      'Een badge erbij! Je bent een echte verzamelaar!',
    ],
    streak: [
      'Wat een reeks! Je bent niet te stoppen!',
    ],
  },
};
```

**Step 4: Implement personality.ts**

Create `src/executioner/personality.ts`:

```typescript
import type Database from 'better-sqlite3';
import { type ExecutionerMood, type DialogueMoment, determineMood, type ExecutionerMemory } from './moods.js';
import { DIALOGUES } from './dialogues.js';

export interface ExecutionerDialogue {
  text: string;
  mood: ExecutionerMood;
  avatar: string;
}

const AVATARS: Record<ExecutionerMood, string> = {
  neutraal:       '╭─────╮\n│ •_• │\n╰──┬──╯\n  /│\\\n  / \\',
  onder_de_indruk:'╭─────╮\n│ O_O │\n╰──┬──╯\n  /│\\\n  / \\',
  sarcastisch:    '╭─────╮\n│ ¬_¬ │\n╰──┬──╯\n  /│\\\n  / \\',
  gefrustreerd:   '╭─────╮\n│ >_< │\n╰──┬──╯\n  /│\\\n  / \\',
  meedogenloos:   '╭─────╮\n│ ☠_☠ │\n╰──┬──╯\n  /│\\\n  / \\',
  kindvriendelijk:'╭─────╮\n│ ^_^ │\n╰──┬──╯\n  /│\\\n  / \\',
};

export function getExecutionerDialogue(
  db: Database.Database,
  playerId: number,
  moment: DialogueMoment,
  difficulty: string,
): ExecutionerDialogue {
  const memory = getMemory(db, playerId);
  const mood = determineMood(memory.respectLevel, difficulty);
  const lines = DIALOGUES[mood][moment];
  const text = lines[Math.floor(Math.random() * lines.length)];

  return { text, mood, avatar: AVATARS[mood] };
}

export function updateExecutionerMood(db: Database.Database, playerId: number, won: boolean): void {
  const memory = getMemory(db, playerId);
  const delta = won ? 5 : -3;
  const newRespect = Math.max(0, Math.min(100, memory.respectLevel + delta));

  db.prepare(`
    INSERT INTO executioner_memory (player_id, mood, respect_level, last_interaction)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(player_id) DO UPDATE SET
      mood = excluded.mood,
      respect_level = excluded.respect_level,
      last_interaction = CURRENT_TIMESTAMP
  `).run(playerId, determineMood(newRespect, 'normaal'), newRespect);
}

function getMemory(db: Database.Database, playerId: number): ExecutionerMemory {
  const row = db.prepare('SELECT mood, respect_level FROM executioner_memory WHERE player_id = ?').get(playerId) as { mood: ExecutionerMood; respect_level: number } | undefined;

  return row
    ? { mood: row.mood, respectLevel: row.respect_level }
    : { mood: 'neutraal', respectLevel: 50 };
}
```

**Step 5: Run tests, commit**

```bash
npx vitest run
git add src/executioner/
git commit -m "feat: add executioner personality system with moods, dialogues, and memory"
```

---

## Task 5: Utility Functions (ASCII Art, Colors, Animations)

**Files:**
- Create: `src/utils/ascii-art.ts`
- Create: `src/utils/colors.ts`
- Create: `src/utils/animations.ts`

**Step 1: Implement ascii-art.ts**

Create `src/utils/ascii-art.ts` with:
- 8-stage gallows ASCII art (large, detailed)
- Splash screen ASCII art
- Trophy/achievement frame art
- Box-drawing character helpers

**Step 2: Implement colors.ts**

Create `src/utils/colors.ts` with the color scheme constants used across all components.

**Step 3: Implement animations.ts**

Create `src/utils/animations.ts` with:
- `useTypewriter(text, speed)` - React hook for typewriter effect
- `useConfetti()` - React hook for confetti animation
- `useShake()` - React hook for screen shake effect
- `useDelayedReveal(items, delay)` - Staggered reveal of items

**Step 4: Commit**

```bash
git add src/utils/
git commit -m "feat: add ASCII art, color scheme, and animation utilities"
```

---

## Task 6: Core UI Components

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Gallows.tsx`
- Create: `src/components/WordDisplay.tsx`
- Create: `src/components/LetterInput.tsx`
- Create: `src/components/UsedLetters.tsx`
- Create: `src/components/Executioner.tsx`
- Create: `src/components/ProgressBar.tsx`
- Create: `src/components/Achievement.tsx`
- Create: `src/components/SplashScreen.tsx`
- Create: `src/components/Confetti.tsx`
- Create: `src/components/StatsChart.tsx`

**Step 1: Build Header component**

The header shows game title, player name, streak, score. Uses `ink-gradient` and `ink-big-text` for the splash screen version.

**Step 2: Build Gallows component**

Takes `wrongGuesses` (0-8) and renders the appropriate ASCII art stage. Uses delayed animation for each new body part.

**Step 3: Build WordDisplay component**

Shows the word as `_ _ K A M _ _ U R` with green for revealed letters and dim for unrevealed.

**Step 4: Build LetterInput component**

Uses `ink-text-input` to capture single letter input. Validates A-Z only. Shows "Raad een letter:" prompt.

**Step 5: Build UsedLetters component**

Grid of all 26 letters. Green with checkmark for correct, red with X for wrong, dim for unused.

**Step 6: Build Executioner component**

Renders the beul avatar + speech bubble with typewriter effect. Takes mood and text as props.

**Step 7: Build ProgressBar component**

Shows `████████░░ 5/8` with color gradient from green (safe) to red (danger).

**Step 8: Build remaining components**

Achievement popup, SplashScreen with ink-big-text, Confetti, StatsChart.

**Step 9: Commit**

```bash
git add src/components/
git commit -m "feat: add all UI components with animations and visual effects"
```

---

## Task 7: Screens (Main Menu, Game, Stats, etc.)

**Files:**
- Create: `src/screens/MainMenu.tsx`
- Create: `src/screens/Game.tsx`
- Create: `src/screens/GameOver.tsx`
- Create: `src/screens/Stats.tsx`
- Create: `src/screens/Leaderboard.tsx`
- Create: `src/screens/Settings.tsx`
- Create: `src/screens/WordManager.tsx`
- Create: `src/screens/PlayerSelect.tsx`

**Step 1: Build navigation system**

In `src/app.tsx`, create a screen router with React state:

```tsx
type Screen = 'splash' | 'player_select' | 'menu' | 'game' | 'game_over' | 'stats' | 'leaderboard' | 'settings' | 'words';
```

**Step 2: Build PlayerSelect screen**

First screen after splash - enter name or select existing player.

**Step 3: Build MainMenu screen**

Menu items: Nieuw Spel, Statistieken, Ranglijst, Woorden Beheer, Instellingen, Afsluiten. Uses `ink-select-input`.

**Step 4: Build Game screen**

Main game loop. Combines Gallows, WordDisplay, LetterInput, UsedLetters, Executioner, ProgressBar, Header. Handles all game state transitions.

**Step 5: Build GameOver screen**

Shows win/loss result, word revealed, score, achievements unlocked, beul final comment. Options: Nieuw Spel, Menu, Afsluiten.

**Step 6: Build Stats screen**

Player statistics with ASCII bar charts. Win/loss ratio, streaks, play time, achievements list.

**Step 7: Build Leaderboard screen**

Top 10 players by wins with formatted table.

**Step 8: Build Settings screen**

Difficulty selection, player name change.

**Step 9: Build WordManager screen**

Add/view/delete words. Shows words by category. Option to re-seed database.

**Step 10: Commit**

```bash
git add src/screens/ src/app.tsx
git commit -m "feat: add all game screens with navigation and full game loop"
```

---

## Task 8: CLI Entry Point & App Wiring

**Files:**
- Modify: `src/index.tsx`
- Create: `src/app.tsx`

**Step 1: Wire up CLI with commander**

```tsx
#!/usr/bin/env node
import { program } from 'commander';
import { render } from 'ink';
import React from 'react';
import App from './app.js';
import { getDatabase, initializeDatabase } from './db/database.js';
import { seedDatabase } from './db/seed.js';

program
  .name('scouting-hangman')
  .description('Scouting Hangman - Galgje voor scouts!')
  .version('1.0.0')
  .option('--seed', 'Vul de database met standaard woorden')
  .option('--reset', 'Reset de database')
  .action((options) => {
    const db = getDatabase();
    initializeDatabase(db);

    if (options.seed) {
      const count = seedDatabase(db);
      console.log(`${count} woorden toegevoegd.`);
      process.exit(0);
    }

    // Auto-seed if empty
    const wordCount = db.prepare('SELECT COUNT(*) as count FROM words').get() as { count: number };
    if (wordCount.count === 0) {
      seedDatabase(db);
    }

    render(<App db={db} />);
  });

program.parse();
```

**Step 2: Build and test**

Run: `npm run build && npm run start`
Expected: Game launches with splash screen.

**Step 3: Commit**

```bash
git add src/index.tsx src/app.tsx
git commit -m "feat: wire up CLI entry point with commander and auto-seeding"
```

---

## Task 9: Default Word List

**Files:**
- Create: `data/default-words.json`

**Step 1: Create comprehensive word list**

Create `data/default-words.json` with 120+ words across all categories:

```json
[
  { "word": "patrouille", "category": "scouting", "difficulty": 2, "hint": "Een klein groepje scouts" },
  { "word": "sjorren", "category": "scouting", "difficulty": 1, "hint": "Vastbinden met touw" },
  ...
]
```

Categories (minimum 15 words each):
- scouting (termen, rangen, groepen)
- kamperen (materiaal, activiteiten)
- knopen (alle scoutingknopen)
- natuur (bomen, dieren, planten)
- activiteiten (spelvormen, technieken)
- tradities (rituelen, ceremonies)

**Step 2: Commit**

```bash
git add data/
git commit -m "feat: add default word list with 120+ scouting words"
```

---

## Task 10: Build, Test & npm Package Setup

**Files:**
- Modify: `package.json`
- Create: `README.md`

**Step 1: Finalize package.json for npm publishing**

Add `files`, `repository`, `homepage` fields. Ensure `bin` is correct.

**Step 2: Write README.md**

Dutch README with:
- Description, screenshots (ASCII mockups)
- Installation instructions (npm, git clone, binary)
- How to play
- How to add words
- Credits

**Step 3: Build and test the full package**

```bash
npm run build
npm link
scouting-hangman
```

Run through: splash → player select → menu → game → win/loss → stats → quit

**Step 4: Commit and push**

```bash
git add -A
git commit -m "feat: finalize package for npm distribution with README"
git push origin main
```

---

## Task 11: Standalone Binary Build

**Files:**
- Create: `scripts/build-binary.ts`
- Modify: `package.json` (add build:binary script)

**Step 1: Implement Node.js SEA builder**

Use Node.js Single Executable Applications (built into Node 20+) to create standalone binaries. This bundles the entire app into a single executable.

**Step 2: Test on Windows**

Run: `npm run build:binary`
Expected: Creates `dist/scouting-hangman.exe`

**Step 3: Document in README**

Add binary build instructions.

**Step 4: Commit**

```bash
git add scripts/ package.json README.md
git commit -m "feat: add standalone binary build via Node.js SEA"
```

---

## Task 12: Android Termux APK Wrapper (Fase 2)

**Files:**
- Create: `android/` directory with basic wrapper project

**Step 1: Create Termux install script**

```bash
#!/bin/bash
# install-android.sh
pkg install nodejs
npm install -g scouting-hangman
echo "Scouting Hangman geinstalleerd! Typ: scouting-hangman"
```

**Step 2: Create basic Android wrapper project stub**

Create `android/README.md` documenting how to build the APK wrapper with Termux embedding. This is a future task outline.

**Step 3: Commit**

```bash
git add android/
git commit -m "feat: add Android Termux install script and APK wrapper stub"
```

---

## Implementation Order Summary

| # | Task | Dependencies | Estimated Steps |
|---|------|-------------|-----------------|
| 1 | Project Scaffolding | None | 7 |
| 2 | Database Layer | Task 1 | 12 |
| 3 | Game Engine | Task 1 | 6 |
| 4 | Executioner System | Tasks 2, 3 | 5 |
| 5 | Utility Functions | Task 1 | 4 |
| 6 | UI Components | Tasks 4, 5 | 9 |
| 7 | Screens | Task 6 | 10 |
| 8 | CLI Entry & Wiring | Tasks 2-7 | 3 |
| 9 | Word List | Task 2 | 2 |
| 10 | Build & Package | Tasks 1-9 | 4 |
| 11 | Standalone Binary | Task 10 | 4 |
| 12 | Android APK | Task 10 | 3 |
