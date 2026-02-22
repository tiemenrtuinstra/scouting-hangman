# Scouting Hangman - Design Document

**Datum:** 2026-02-22
**Status:** Goedgekeurd
**Taal:** Nederlands

## Samenvatting

Een visueel rijke, terminal-gebaseerde Hangman game met scouting-thema. Gebouwd met React Ink (React voor terminals) en TypeScript, met SQLite voor woordenlijsten en statistieken. Cross-platform installeerbaar via npm, met optionele standalone binaries en Android APK support.

## Doelgroep

Iedereen: van welpen (7+) tot leiding/staf. Moeilijkheidsgraden passen de ervaring aan:
- **Makkelijk:** Kindvriendelijke beul, korte woorden, hints beschikbaar
- **Normaal:** Humoristische beul, gemiddelde woorden
- **Moeilijk:** Sarcastische/meedogenloze beul, lange/zeldzame woorden

## Technologie

| Component | Technologie |
|-----------|-------------|
| Terminal UI | React Ink 5 |
| Taal | TypeScript |
| Database | better-sqlite3 |
| CLI parsing | commander |
| Bundling | tsup (build), pkg/Node SEA (binaries) |
| Android | Termux wrapper APK |

## Architectuur

### Projectstructuur

```
scouting-hangman/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.tsx             # Entry point, CLI arguments
│   ├── app.tsx               # Hoofd React Ink app
│   ├── screens/
│   │   ├── MainMenu.tsx      # Hoofdmenu
│   │   ├── Game.tsx          # Hangman spelscherm
│   │   ├── GameOver.tsx      # Win/verlies scherm
│   │   ├── Stats.tsx         # Statistieken
│   │   ├── Leaderboard.tsx   # Ranglijst
│   │   ├── Settings.tsx      # Instellingen
│   │   └── WordManager.tsx   # Woorden beheer
│   ├── components/
│   │   ├── Gallows.tsx       # ASCII art galg (8 stadia)
│   │   ├── WordDisplay.tsx   # Woord weergave (_ _ _ _)
│   │   ├── LetterInput.tsx   # Letter invoer
│   │   ├── UsedLetters.tsx   # Gebruikte letters
│   │   ├── Executioner.tsx   # Beul karakter + tekstballon
│   │   ├── Header.tsx        # Header met logo
│   │   ├── ProgressBar.tsx   # Visuele voortgangsbalk
│   │   ├── Achievement.tsx   # Achievement popup
│   │   ├── SplashScreen.tsx  # Geanimeerd splash screen
│   │   ├── Confetti.tsx      # Win-confetti effect
│   │   └── StatsChart.tsx    # ASCII grafieken
│   ├── executioner/
│   │   ├── personality.ts    # Beul persoonlijkheid engine
│   │   ├── dialogues.ts      # Alle teksten per mood/situatie
│   │   └── moods.ts          # Mood systeem
│   ├── db/
│   │   ├── database.ts       # SQLite connectie & setup
│   │   ├── migrations.ts     # Schema migraties
│   │   ├── words.ts          # Woorden CRUD
│   │   ├── stats.ts          # Statistieken queries
│   │   └── seed.ts           # Standaard woordenlijst
│   ├── game/
│   │   ├── engine.ts         # Spel logica (state machine)
│   │   ├── difficulty.ts     # Moeilijkheidsgraden
│   │   └── achievements.ts   # Achievement systeem
│   └── utils/
│       ├── ascii-art.ts      # Galg ASCII art, splash, avatars
│       ├── colors.ts         # Kleurenschema
│       └── animations.ts     # Typewriter, confetti, shake
├── scripts/
│   ├── build-binary.ts       # Standalone binary builder
│   └── seed-db.ts            # CLI tool om DB te vullen
└── data/
    └── default-words.json    # Standaard woordenlijst
```

### Database Schema

```sql
CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    difficulty INTEGER DEFAULT 1,
    hint TEXT,
    times_played INTEGER DEFAULT 0,
    times_won INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game_sessions (
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

CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    achievement_key TEXT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    UNIQUE(player_id, achievement_key)
);

CREATE TABLE executioner_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    mood TEXT NOT NULL,
    respect_level INTEGER DEFAULT 50,
    last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    UNIQUE(player_id)
);
```

## Het Beul-systeem

### Persoonlijkheden (moods)

| Mood | Trigger | Toon |
|------|---------|------|
| Neutraal | Standaard / nieuwe speler | Droge humor, scouting-weetjes |
| Onder de indruk | Goede winrate, streaks | Complimenten, nerveus |
| Sarcastisch | Matige speler | Grappen over fouten |
| Gefrustreerd | Speler wint te veel | Wil verslaan maar kan niet |
| Meedogenloos | Moeilijke modus | Kort, dreigend |
| Kindvriendelijk | Makkelijke modus | Bemoedigend, hints |

### Beul-momenten

1. **Start spel** - Begroeting op basis van historie
2. **Correct geraden** - Reactie passend bij mood
3. **Fout geraden** - Galg update + commentaar
4. **1-2 fouten over** - Spanningsopbouw
5. **Winst** - Teleurstelling of respect
6. **Verlies** - Triomf, onthulling woord
7. **Achievement** - Reactie op prestatie

### Beul-geheugen

De beul onthoudt per speler:
- **respect_level** (0-100): Stijgt bij winst, daalt bij verlies
- **mood**: Past zich aan op basis van recente prestaties
- Referenties naar eerdere spellen ("Vorige keer wist je SJORREN niet eens...")

### Beul-avatar (dynamisch)

```
  Blij:           Neutraal:        Boos:           Gevaarlijk:
   ╭─────╮        ╭─────╮         ╭─────╮         ╭─────╮
   │ ^_^ │        │ •_• │         │ >_< │         │ ☠_☠ │
   ╰──┬──╯        ╰──┬──╯         ╰──┬──╯         ╰──┬──╯
     /│\             /│\              /│\              /│\
     / \             / \              / \              / \
```

## Visueel Ontwerp

### Splash Screen
Groot ASCII art logo met "SCOUTING HANGMAN", animatie bij opstarten.

### Game Screen Layout
```
╔══════════════════════════════════════════════════════════════════╗
║  🏕️  SCOUTING HANGMAN  🏕️                    Speler: [naam]    ║
║  Moeilijkheid: [level]          Streak: 🔥 [n]    Score: [pts] ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║    [GALG ASCII ART]           [BEUL AVATAR + TEKSTBALLON]       ║
║                                                                  ║
║    Categorie: [categorie]                                        ║
║    [WOORD DISPLAY]                                               ║
║    Pogingen over: [PROGRESSBAR] [n]/8                            ║
║    Gebruikt: [LETTER GRID]                                       ║
║    Raad een letter: [INPUT]                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  [Q] Menu  [H] Hint  [S] Stats                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

### Animaties
- **Typewriter effect:** Beul-tekst verschijnt letter voor letter
- **Letter reveal:** Correcte letters "vallen" op hun plek
- **Galg build:** Lichaamsdelen verschijnen met vertraging
- **Win confetti:** Kleurrijke karakters "vallen" over het scherm
- **Verlies:** Rood scherm, galg "schud"
- **Achievement popup:** Gouden kader met animatie

### Kleurenschema
- **Groen:** Correcte letters, winst
- **Rood:** Foute letters, verlies, gevaar
- **Geel/Amber:** Beul-tekst, waarschuwingen
- **Cyan:** Headers, UI elementen
- **Magenta:** Achievements, speciale momenten
- **Wit:** Standaard tekst

## Spelregels

- **8 pogingen** per ronde (max foute letters)
- Alleen letters (A-Z), geen cijfers of speciale tekens
- Woorden zijn in het Nederlands, zonder spaties of koppeltekens in de raad-weergave
- Hints beschikbaar (kost 1 poging)
- Score systeem: punten op basis van woordlengte, snelheid, en aantal fouten

## Woordenlijst Categorieën

| Categorie | Voorbeelden |
|-----------|-------------|
| Scouting-termen | patrouille, sjorren, vlaggenparade, opkomst, belofte |
| Kamperen | tentharingen, slaapzak, kampvuur, kookgerei, kompas |
| Knopen | mastworp, paalsteek, schootsteek, platte knoop |
| Natuur | eikenboom, specht, paddenstoel, reebok, hazelaar |
| Activiteiten | dropping, hike, pionieren, seinvlaggen, veldspel |
| Tradities | troepraad, totempaal, stafweekend, zomerkamp |

## Achievement Systeem

| Achievement | Voorwaarde |
|-------------|-----------|
| Eerste Stap | Win je eerste spel |
| Kampvuurmeester | Win 10 spellen op rij |
| Knopenexpert | Raad 5 knopen-woorden correct |
| Snelheidsduivel | Win een spel in minder dan 30 seconden |
| Foutloos | Win zonder foute letters |
| Scoutingkenner | Win in elke categorie minstens 1 keer |
| Doorbijer | Speel 50 spellen |
| De Beul Verslagen | Bereik respect_level 100 bij de beul |

## Installatie & Distributie

### Via npm (primair)
```bash
npm install -g scouting-hangman
scouting-hangman
```

### Via git clone
```bash
git clone https://github.com/tiemenrtuinstra/scouting-hangman.git
cd scouting-hangman
npm install
npm run build
npm link
scouting-hangman
```

### Standalone binaries
Gegenereerd via build script voor:
- Windows (.exe)
- macOS (arm64 + x64)
- Linux (x64)

### Android (Termux wrapper APK)
APK die Termux embedt en het spel automatisch start. Fase 2 feature.

## Spelflow

1. Splash screen met animatie
2. Spelernaam invoeren (of selecteren uit bestaande)
3. Hoofdmenu: Nieuw Spel | Statistieken | Leaderboard | Woorden Beheer | Instellingen | Quit
4. Moeilijkheidsgraad kiezen
5. Beul begroet je (op basis van historie)
6. Spel loop: letter raden → feedback → beul reageert → herhaal
7. Game over scherm (win/verlies)
8. Achievement check
9. Terug naar hoofdmenu of nieuw spel
