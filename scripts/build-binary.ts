/**
 * Build standalone binary using Node.js Single Executable Applications (SEA).
 *
 * NOTE: Node.js SEA does not support native modules (better-sqlite3) out of the box.
 * For now this creates a self-contained launcher script that works when Node.js is installed.
 * True standalone binary support would require bundling the native .node addon alongside.
 *
 * Usage: npx tsx scripts/build-binary.ts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const BINARIES = path.join(ROOT, 'binaries');

function run(cmd: string) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

function main() {
  console.log('🔨 Building Scouting Hangman binaries...\n');

  // Step 1: Build
  run('npm run build');

  // Step 2: Create binaries directory
  if (!fs.existsSync(BINARIES)) {
    fs.mkdirSync(BINARIES, { recursive: true });
  }

  // Step 3: Create launcher scripts for each platform
  const platforms = [
    {
      name: 'linux',
      ext: '',
      script: `#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
node "$SCRIPT_DIR/../dist/index.js" "$@"
`,
    },
    {
      name: 'macos',
      ext: '',
      script: `#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
node "$SCRIPT_DIR/../dist/index.js" "$@"
`,
    },
    {
      name: 'windows',
      ext: '.cmd',
      script: `@echo off
set "SCRIPT_DIR=%~dp0"
node "%SCRIPT_DIR%..\\dist\\index.js" %*
`,
    },
  ];

  for (const platform of platforms) {
    const fileName = `scouting-hangman-${platform.name}${platform.ext}`;
    const filePath = path.join(BINARIES, fileName);
    fs.writeFileSync(filePath, platform.script);
    if (platform.ext === '') {
      fs.chmodSync(filePath, 0o755);
    }
    console.log(`✅ Created ${fileName}`);
  }

  // Step 4: Create install script
  const installScript = `#!/bin/bash
# Scouting Hangman Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/tiemenrtuinstra/scouting-hangman/main/scripts/install.sh | bash

set -e

echo "⚜️ Scouting Hangman installeren..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is niet geinstalleerd. Installeer Node.js 20+ eerst."
    echo "   Ga naar: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ is vereist. Je hebt v$(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) gevonden"

# Install globally
npm install -g scouting-hangman@latest

echo ""
echo "✅ Scouting Hangman is geinstalleerd!"
echo "   Start het spel met: scouting-hangman"
echo ""
`;

  fs.writeFileSync(path.join(ROOT, 'scripts', 'install.sh'), installScript);
  fs.chmodSync(path.join(ROOT, 'scripts', 'install.sh'), 0o755);
  console.log('✅ Created install.sh');

  console.log('\n🎉 Done! Binaries are in the binaries/ directory.');
  console.log('\nInstallation options:');
  console.log('  npm install -g scouting-hangman    (via npm)');
  console.log('  npx scouting-hangman               (without installing)');
  console.log('  ./binaries/scouting-hangman-linux   (launcher script)');
}

main();
