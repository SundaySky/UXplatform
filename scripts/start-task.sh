#!/usr/bin/env bash
# start-task.sh — start a new task on a fresh branch off the latest main.
# Usage: ./scripts/start-task.sh "short task description"
#
# Pulls latest main, then creates and switches to a new branch
# whose name is derived from the description (lowercase, dashes, no slashes).
# Branch naming follows the project rule: dashes only, never `/`.

set -euo pipefail

if [ $# -eq 0 ] || [ -z "${1:-}" ]; then
  echo "Usage: $0 \"short task description\""
  echo "Example: $0 \"add filter chip to library\""
  exit 1
fi

DESC="$1"

# Slugify: lowercase, non-alphanumerics → dash, collapse dashes, trim, max 60 chars
SLUG=$(printf '%s' "$DESC" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9]+/-/g' \
  | sed -E 's/^-+//; s/-+$//' \
  | cut -c1-60 \
  | sed -E 's/-+$//')

if [ -z "$SLUG" ]; then
  echo "ERROR: Could not derive a valid branch name from: $DESC"
  exit 1
fi

CURRENT=$(git rev-parse --abbrev-ref HEAD)

# If there are uncommitted changes, give actionable next steps and bail out.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: You have uncommitted changes on '$CURRENT'. Cannot start a new task."
  echo ""
  git status --short
  echo ""
  echo "Resolve before starting a new task:"
  echo "  - Done with this work?    →  ./scripts/end-task.sh \"<title>\""
  echo "  - Want to set it aside?   →  ./scripts/abandon-task.sh \"<reason>\""
  exit 1
fi

# Untracked files would also be lost on checkout — warn but don't block.
if [ -n "$(git ls-files --others --exclude-standard)" ]; then
  echo "WARNING: You have untracked files. They will follow you to the new branch."
  git ls-files --others --exclude-standard
  echo ""
fi

echo "==> Fetching origin..."
git fetch origin

if [ "$CURRENT" != "main" ]; then
  echo "==> Switching to main..."
  git checkout main
fi

echo "==> Pulling latest main..."
git pull origin main

# Avoid name collisions locally and on the remote.
BRANCH="$SLUG"
N=2
while git show-ref --verify --quiet "refs/heads/$BRANCH" \
   || git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; do
  BRANCH="${SLUG}-${N}"
  N=$((N + 1))
done

echo "==> Creating branch '$BRANCH' from main..."
git checkout -b "$BRANCH"

echo ""
echo "Done. You are now on branch '$BRANCH', ready to start work."
echo "When finished, run: ./scripts/end-task.sh \"<commit and PR title>\""
