---
name: abandon-task
description: Set the current task aside without merging it — commit any pending changes, preserve the branch under an `abandoned-…` name on the remote, then return to a clean updated main. Use when the user wants to drop the current work without losing it — phrases like "abandon this task", "set this aside", "scrap this for now", "I want to start over", "/abandon-task". The work stays retrievable later via the renamed branch on the remote.
---

# abandon-task

Sets the current task aside. Commits any pending work, renames the branch to `abandoned-<original>-<timestamp>`, pushes that name to the remote so the work is preserved, and returns to a clean updated `main`.

## When to invoke

- The user says "abandon this", "set this aside", "scrap this", "let's start over", or types `/abandon-task`.
- The user wants to switch to something else but doesn't want to merge what's currently on the branch.

Do **NOT** invoke this skill if:
- The user is on `main` (there's nothing to abandon — the script will error out).
- The branch is already named `abandoned-…` (the script refuses to re-abandon).
- The user actually wants to ship the work — use `end-task` instead.

## What to do

1. Optionally ask for a short reason (one phrase). It's recorded in the commit message as `WIP: abandoned task (<reason>)`. If the user doesn't give one, run with no argument and the script defaults to `"no reason given"`.
2. Run the script from the repo root:
   ```bash
   ./scripts/abandon-task.sh "<optional short reason>"
   ```
3. Report the **abandoned branch name** to the user — they may need it to retrieve the work later.

## What the script does

1. Refuses to run on `main` or on a branch already named `abandoned-…`.
2. `git add -A` and commits any pending changes with message `WIP: abandoned task (<reason>)`.
3. Renames the local branch to `abandoned-<original-name>-<YYYYMMDD-HHMMSS>`.
4. Pushes the renamed branch to `origin` so the work is preserved on the remote.
5. If the original branch name was already on the remote, deletes that old remote ref so only the abandoned name remains.
6. `git checkout main && git pull origin main`.
7. Deletes the local renamed branch (the remote copy is the source of truth from this point on).

## Retrieving abandoned work later

```bash
git fetch origin
git checkout abandoned-<original-name>-<timestamp>
```

The user can also list all preserved branches with:
```bash
git branch -r | grep abandoned-
```

## Branch naming rule

The abandoned branch name uses **dashes only — never slashes**. The script enforces this. It satisfies the project's branch-naming rule.
