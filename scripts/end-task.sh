#!/usr/bin/env bash
# end-task.sh — finish the current task: commit, push, PR, merge, return to clean main.
# Usage: ./scripts/end-task.sh "commit and PR title"
#
# Steps: stage all changes → commit → push → open PR → merge PR (deletes remote branch)
#        → switch to main → pull → delete the local branch.
#
# Requires: gh (GitHub CLI), authenticated.

set -euo pipefail

if [ $# -eq 0 ] || [ -z "${1:-}" ]; then
  echo "Usage: $0 \"commit and PR title\""
  echo "Example: $0 \"Add filter chip to library page\""
  exit 1
fi

TITLE="$1"
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" = "main" ]; then
  echo "ERROR: You're on main — there's nothing to merge."
  echo "Run ./scripts/start-task.sh \"<description>\" first to create a working branch."
  exit 1
fi

echo "==> Staging all changes on '$BRANCH'..."
git add -A

if git diff --cached --quiet; then
  echo "==> Nothing new to commit (working tree is clean)."
else
  git commit -m "$TITLE

Co-Authored-By: Claude <noreply@anthropic.com>"
fi

# Refuse to push an empty branch (no commits ahead of main).
AHEAD=$(git rev-list --count "origin/main..HEAD" 2>/dev/null || echo 0)
if [ "$AHEAD" = "0" ]; then
  echo "ERROR: Branch '$BRANCH' has no new commits compared to main. Nothing to merge."
  echo "If you meant to discard this branch, run ./scripts/abandon-task.sh \"<reason>\"."
  exit 1
fi

echo "==> Pushing '$BRANCH' to origin..."
git push -u origin "$BRANCH"

# Reuse an existing PR for this branch if one already exists.
EXISTING_PR=$(gh pr list --head "$BRANCH" --state open --json url --jq '.[0].url' 2>/dev/null || echo "")

if [ -n "$EXISTING_PR" ]; then
  PR_URL="$EXISTING_PR"
  echo "==> Reusing existing PR: $PR_URL"
else
  echo "==> Opening PR..."
  PR_URL=$(gh pr create \
    --title "$TITLE" \
    --body "$(cat <<EOF
## Summary
Automated PR from branch \`$BRANCH\`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" \
    --base main \
    --head "$BRANCH")
  echo "==> PR: $PR_URL"
fi

echo "==> Merging PR..."
gh pr merge "$PR_URL" --merge --delete-branch

echo "==> Switching to main and pulling..."
git checkout main
git pull origin main

# Local branch lingers after the remote-side delete; clean it up.
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "==> Deleting local branch '$BRANCH'..."
  git branch -D "$BRANCH"
fi

echo ""
echo "Done. Back on clean main, fully up to date."
