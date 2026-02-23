#!/bin/bash
# Release script for scouting-hangman
# Usage: ./scripts/release.sh [patch|minor|major]
#
# This script:
# 1. Verifies clean working tree
# 2. Runs tests
# 3. Bumps version in package.json (npm version)
# 4. Creates a git tag (v1.x.x)
# 5. Pushes commit + tag to trigger the release workflow

set -e

BUMP="${1:-patch}"

if [[ "$BUMP" != "patch" && "$BUMP" != "minor" && "$BUMP" != "major" ]]; then
  echo "Usage: $0 [patch|minor|major]"
  echo "  patch  — bugfixes (1.0.0 → 1.0.1)"
  echo "  minor  — new features (1.0.0 → 1.1.0)"
  echo "  major  — breaking changes (1.0.0 → 2.0.0)"
  exit 1
fi

# Check for clean working tree
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: working tree is not clean. Commit or stash changes first."
  exit 1
fi

# Run tests
echo "Running tests..."
npm test

# Bump version, commit, and create tag
echo "Bumping $BUMP version..."
NEW_VERSION=$(npm version "$BUMP" -m "release: v%s")
echo "Version bumped to $NEW_VERSION"

# Push commit and tag
echo "Pushing to remote..."
git push && git push --tags

echo ""
echo "Release $NEW_VERSION pushed!"
echo "GitHub Actions will now:"
echo "  1. Run tests"
echo "  2. Publish to npm"
echo "  3. Create a GitHub Release"
echo ""
echo "Monitor: https://github.com/tiemenrtuinstra/scouting-hangman/actions"
