#!/usr/bin/env bash
set -e

# Function to clean up build files that might conflict
cleanup_build_files() {
  echo "Cleaning up potential conflicting build files..."
  if [ -d "frontend/build/static/js" ]; then
    find frontend/build/static/js -name "main.*.js*" -type f -delete 2>/dev/null || true
  fi
  if [ -d "frontend/build/static/css" ]; then
    find frontend/build/static/css -name "main.*.css*" -type f -delete 2>/dev/null || true
  fi
}

# Function to handle ongoing git operations
handle_ongoing_operations() {
  if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
    echo "Detected ongoing rebase operation. Cleaning up..."
    cleanup_build_files
    git rebase --abort || true
  fi
  
  if [ -f ".git/MERGE_HEAD" ]; then
    echo "Detected ongoing merge operation. Cleaning up..."
    cleanup_build_files
    git merge --abort || true
  fi
}

echo "Checking for ongoing git operations..."
handle_ongoing_operations

# Clean up build files before any git operations
cleanup_build_files

# Get current branch
branch=$(git rev-parse --abbrev-ref HEAD)
timestamp=$(date -u +'%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date +'%Y-%m-%dT%H:%M:%SZ')
msg=${1:-"chore(backup): $branch @ $timestamp"}

# Stage all changes (including deletions)
git add -A

# Check if there are any changes to commit
if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

echo "Committing changes to branch: $branch"
git commit -m "$msg"

# Try to pull latest changes to avoid conflicts
echo "Pulling latest changes from origin/$branch"
git fetch origin "$branch" || {
  echo "Warning: Could not fetch from origin. Proceeding without pull."
}

# Only pull if remote tracking branch exists
if git show-ref --verify --quiet refs/remotes/origin/"$branch"; then
  git pull --rebase origin "$branch" || {
    echo "Rebase conflict detected. Cleaning up and retrying..."
    cleanup_build_files
    git rebase --abort || true
    echo "Please resolve conflicts manually and run backup again."
    exit 1
  }
else
  echo "No remote tracking branch found for $branch. Skipping pull."
fi

echo "Pushing $branch to origin"
git push origin "$branch"
echo "Successfully pushed $branch to GitHub!"