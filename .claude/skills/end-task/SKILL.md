---
name: end-task
description: Finish the current task — commit, push, open a PR, merge it into main, then return to a clean updated main. Use whenever the user signals they are done with a piece of work — phrases like "I'm done", "finish this task", "ship it", "merge it in", "we're good to go", "/end-task". Requires being on a non-`main` branch with at least one commit (or pending changes) ahead of main.
---

# end-task

Ships the current task: stages all changes, commits, pushes, opens a PR against `main`, merges it, and returns the workspace to a clean updated `main`.

## When to invoke

- The user says "I'm done", "ship it", "finish this task", "merge it", "we're done", or types `/end-task`.
- The user has just confirmed that everything they wanted to do in this task is complete.

Do **NOT** invoke this skill if:
- The user is on `main` (there's nothing to merge — the script will error out).
- The work clearly isn't finished (e.g. broken state, mid-implementation, failing build the user hasn't acknowledged). Confirm with the user first.

## What to do

1. Get a short PR/commit title from the user. If they already gave one (e.g. "/end-task added filter chip to library"), use that. Otherwise ask: *"What's a short title for the PR?"* Keep it under ~10 words, imperative mood (e.g. *"Add filter chip to library page"*).
2. Run the script from the repo root:
   ```bash
   ./scripts/end-task.sh "<commit and PR title>"
   ```
3. Report the PR URL and confirm the user is back on a clean `main`.

## What the script does

1. Refuses to run on `main`.
2. `git add -A` and commits any pending changes with the supplied title (and a `Co-Authored-By: Claude` trailer).
3. Refuses to push if the branch has zero commits ahead of `origin/main` (suggests `abandon-task` instead).
4. `git push -u origin <branch>`.
5. Opens a PR against `main` using `gh pr create` (or reuses an existing open PR for the same branch if one already exists).
6. Merges the PR with `gh pr merge --merge --delete-branch` (deletes the remote branch automatically).
7. `git checkout main && git pull origin main`.
8. Deletes the now-stale local branch with `git branch -D`.

## Failure modes to surface to the user

- **`gh` not authenticated** → ask the user to run `gh auth login` (it's interactive — they should run it themselves with `! gh auth login`).
- **Merge conflict against `main`** → the merge step will fail. Report the failure and ask the user how they want to resolve it; do not force-push or destructive-reset.
- **Branch protection / required reviews** (not currently set on this repo, but possible in the future) → the merge step will fail with a clear gh error; surface it and ask the user.
