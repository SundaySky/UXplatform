# CLAUDE.md — UXplatform Workflow

Developer and AI assistant guide for the **Workflow** project — a video approval workflow UI built with React, TypeScript, and Vite.

---

## Project Overview

A prototype web application for managing and approving videos in a production workflow. Features include a video library, studio editing view, multi-role approval dialogs, and a notifications panel.

**Repository:** https://github.com/SundaySky/UXplatform.git
**Branch model:** single `main` branch, push directly or via PRs

---

## Tech Stack

| Layer | Tool | Version |
|---|---|---|
| Language | TypeScript | 5.6.2 |
| Framework | React | 18.3.1 |
| Build / Dev server | Vite | 6.0.1 |
| UI components | MUI (Material UI) | 6.1.6 |
| CSS-in-JS | Emotion | 11.13.x |
| Package manager | npm | (lockfile committed) |

No test framework, linting, or formatting tooling is configured yet.

---

## Getting Started

```bash
npm install
npm run dev       # dev server at http://localhost:5173
```

---

## Available Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start Vite dev server with HMR on port 5173 |
| `npm run build` | Type-check (`tsc -b`) then produce a production bundle in `dist/` |
| `npm run preview` | Serve the last production build locally |

---

## Project Structure

```
src/
  main.tsx                  # React entry point
  App.tsx                   # Root component, routing, and global state
  StudioPage.tsx            # Editing / studio view
  VideoLibraryPage.tsx      # Video library listing
  ApprovalDialog.tsx        # Approval workflow dialog
  ApproveVideoDialog.tsx    # Confirm-approve confirmation
  CancelApprovalDialog.tsx  # Cancel-approval confirmation
  ConfirmationDialog.tsx    # Generic reusable confirmation dialog
  NotificationsPanel.tsx    # Notifications drawer/panel
  theme.ts                  # MUI theme + design tokens (sourced from Figma)
public/
  thumb.svg                 # Placeholder video thumbnail
.claude/
  launch.json               # Dev server config for Claude Code preview
  settings.local.json       # Claude Code permission allowlist (local, not committed)
```

---

## Design System

The theme (`src/theme.ts`) is the single source of truth for all visual tokens. It is derived from the Figma design file.

- **Primary:** `#0053E5` (blue)
- **Secondary:** `#03194F` (dark navy)
- **Border radius base:** `8px`
- **Typography:** Inter (headings) + Open Sans (body), loaded via Google Fonts in `index.html`
- Component-level MUI overrides are defined at the bottom of `theme.ts`

**Do not hard-code colors, spacing, or font values** — always reference theme tokens via MUI's `sx` prop, `styled()`, or `useTheme()`.

---

## TypeScript

- Strict mode is enabled (`strict: true`).
- `noUnusedLocals` and `noUnusedParameters` are on — clean up unused imports/variables before building.
- Target: `ES2020` for app code; `ES2022` for Vite config.
- Two tsconfig files: `tsconfig.app.json` (source) and `tsconfig.node.json` (build tooling). The root `tsconfig.json` is a project-reference wrapper.

---

## Multi-Developer Collaboration

Several people may be working on this codebase simultaneously. Keep the following in mind:

- **Pull before you push.** Always `git pull` before starting a new session to avoid unnecessary conflicts.
- **Keep components focused.** Each file owns one component. Avoid modifying unrelated components in the same commit.
- **Avoid reformatting files you didn't change.** No formatter is enforced yet, so mass whitespace/style changes create noisy diffs that are hard to review.
- **Coordinate on `App.tsx` and `theme.ts`** — these are shared entry points and the most likely sources of merge conflicts. Communicate before making structural changes to either.
- **Commit often with clear messages.** Use short, descriptive present-tense messages (e.g. `Add cancel approval confirmation step`).
- **No force-pushing to `main`.** If you need to undo a commit, use `git revert`.

---

## Git Workflow

```bash
git pull                      # always start here
# ... make changes ...
git add <specific files>      # prefer explicit file staging over git add .
git commit -m "Short description of change"
git push
```

Commit message style (match existing history):
- Imperative mood: `Add`, `Fix`, `Update`, `Remove`
- Sentence case, no trailing period
- Reference the feature area: `Approval dialog: …`, `VideoLibrary: …`

`.env`, `.env.local`, `dist/`, `node_modules/`, and `.claude/preview/` are gitignored — never commit these.

---

## Dev Server (Claude Code)

The Claude Code dev server config lives at `.claude/launch.json`. To start the preview inside Claude Code, the configured server is:

- **Name:** `workflow-dev`
- **Command:** `npm run dev`
- **Port:** `5173`

---

## Future Work / Known Gaps

- No test framework — consider adding Vitest + React Testing Library
- No ESLint / Prettier — consider adding to prevent style drift across contributors
- No CI/CD pipeline — GitHub Actions would be a natural fit
- No `.env.example` — create one when environment variables are introduced
