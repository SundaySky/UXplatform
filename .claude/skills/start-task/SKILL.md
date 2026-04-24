---
name: start-task
description: Start a new task on a fresh git branch off the latest main. Use whenever the user begins new work — phrases like "start a new task", "let's work on X", "I want to add/change/fix Y", or before making any code edit while currently on `main`. Pulls the latest `main`, then creates and switches to a new branch whose name is derived from the task description (lowercase, dashes only, no slashes — per the project's branch-naming rule).
---

# start-task

Starts a new task by creating a fresh branch off the latest `main`.

## When to invoke

- The user explicitly says "start a new task", "let's start working on X", or types `/start-task`.
- The user is about to make changes (asks Claude to add/change/fix something) **while currently on the `main` branch** — Claude must invoke this skill first, before any edit.
- The user says they want to begin a new piece of work that should land as its own PR.

Do **NOT** invoke this skill if the user is already on a non-`main` branch with in-progress work for the current task — only when starting something new.

## What to do

1. Get a short task description from the user. If they already gave one (e.g. "start a new task: add filter chip"), use that. Otherwise ask: *"What's a short description for this task?"* Keep the description under ~8 words.
2. Run the script from the repo root:
   ```bash
   ./scripts/start-task.sh "<short task description>"
   ```
3. Report the resulting branch name to the user.

## What the script does

- Verifies the working tree is clean. If not, it prints the dirty files and instructs the user to either run `end-task` or `abandon-task` first.
- `git fetch origin`, switches to `main`, `git pull origin main`.
- Slugifies the description (lowercase, non-alphanumerics → dashes, max 60 chars, no leading/trailing dashes, no slashes).
- Adds a `-2`, `-3`, ... suffix if a branch with that name already exists locally or on the remote.
- Creates and checks out the new branch.

## Branch naming rule

Branch names use **dashes only — never slashes**. The script enforces this. Do not bypass the script with manual `git checkout -b` calls that include `/`.

## After the script succeeds

You can begin making code changes on the new branch. When the task is done, the user (or you) should run the `end-task` skill to ship it.
