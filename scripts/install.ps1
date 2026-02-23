# Scouting Hangman Installer (Windows)
# Usage: irm https://raw.githubusercontent.com/tiemenrtuinstra/scouting-hangman/main/scripts/install.ps1 | iex

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  Scouting Hangman installeren..." -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = (node -v) 2>$null
} catch {
    $nodeVersion = $null
}

if (-not $nodeVersion) {
    Write-Host "  Node.js is niet geinstalleerd." -ForegroundColor Red
    Write-Host "  Installeer Node.js 20+ via: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

$major = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($major -lt 20) {
    Write-Host "  Node.js 20+ is vereist. Je hebt $nodeVersion" -ForegroundColor Red
    exit 1
}

Write-Host "  Node.js $nodeVersion gevonden" -ForegroundColor Green

# Install globally
Write-Host "  npm install -g scouting-hangman..." -ForegroundColor Cyan
npm install -g scouting-hangman@latest

Write-Host ""
Write-Host "  Scouting Hangman is geinstalleerd!" -ForegroundColor Green
Write-Host "  Start het spel met: scouting-hangman" -ForegroundColor White
Write-Host ""
