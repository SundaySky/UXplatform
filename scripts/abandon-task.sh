#!/usr/bin/env bash
# abandon-task.sh — set the current task aside and return to clean main.
# Usage: ./scripts/abandon-task.sh ["optional reason"]
#
# Stages and commits any pending changes, renames the branch to make it
# clearly recoverable later, pushes it to the remote, then switches back
# to main and pulls. The renamed branch is preserved on the remote so the
# work can be retrieved at any time with:
#
#   git fetch origin && git checkout abandoned-<original-name>-<timestamp>

set -euo pipefail

REASON="${1:-no reason given}"
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" = "main" ]; then
  echo "ERROR: You're on main — nothing to abandon."
  exit 1
fi

if [[ "$BRANCH" == abandoned-* ]]; then
  echo "ERROR: Branch '$BRANCH' is already marked abandoned."
  echo "Switch to main with: git checkout main"
  exit 1
fi

echo "==> Staging all changes on '$BRANCH'..."
git add -A

if git diff --cached --quiet; then
  echo "==> No pending changes to commit."
else
  echo "==> Staged changes:"
  git status --short
  echo ""
  git commit -m "WIP: abandoned task ($REASON)

Co-Authored-By: Claude <noreply@anthropic.com>"
fi

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ABANDONED_BRANCH="abandoned-${BRANCH}-${TIMESTAMP}"

echo "==> Renaming branch to '$ABANDONED_BRANCH'..."
git branch -m "$ABANDONED_BRANCH"

echo "==> Pushing '$ABANDONED_BRANCH' to origin (preserving the work)..."
git push -u origin "$ABANDONED_BRANCH"

# If the original branch was already pushed under its old name, delete that
# remote ref so the abandoned name is the canonical one.
if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  echo "==> Removing old remote branch '$BRANCH'..."
  git push origin --delete "$BRANCH" || true
fi

echo "==> Switching to main and pulling..."
git checkout main
git pull origin main

# Clean up the local renamed branch — it's safe on the remote now.
if git show-ref --verify --quiet "refs/heads/$ABANDONED_BRANCH"; then
  git branch -D "$ABANDONED_BRANCH"
fi

echo ""
echo "Done. Branch saved on the remote as: $ABANDONED_BRANCH"
echo "To retrieve later:"
echo "  git fetch origin && git checkout $ABANDONED_BRANCH"
