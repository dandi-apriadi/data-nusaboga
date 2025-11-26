#!/usr/bin/env bash
set -e

# Get current branch
branch=$(git rev-parse --abbrev-ref HEAD)
timestamp=$(date +'%Y%m%d%H%M%S' 2>/dev/null || powershell -Command "Get-Date -Format 'yyyyMMddHHmmss'")
safety="safety-${branch}-${timestamp}"

echo "Creating safety branch: $safety"
git branch "$safety"

echo "Fetching latest changes from origin"
git fetch origin

echo "Resetting $branch to origin/$branch"
git reset --hard "origin/$branch"
git clean -fd

echo "Checking git status"
git status

echo ""
echo "============================================="
echo "Rollback completed successfully!"
echo "If something went wrong, you can recover with:"
echo "  git checkout $safety"
echo "============================================="