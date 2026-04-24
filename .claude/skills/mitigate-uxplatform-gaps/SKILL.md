---
name: mitigate-uxplatform-gaps
description: Close visual gaps between the UXplatform prototype (this repo) and the real SundaySky app (a local checkout of smartvideo-hub/smartvideo-hub/client). Use whenever the user wants to align the prototype with the real app — phrases like "fix the gaps in the prototype", "make the prototype match the real app", "mitigate differences", "the prototype's studio/video library/overview/account settings doesn't match production", or asks to audit/align a specific section. Operates on ONE section at a time (main page / video overview / studio / account settings). Compares via source code AND Playwright screenshots, then edits the prototype to close gaps. Asks the user before changing anything ambiguous.
---

Close visual gaps between the UXplatform **prototype** and the real **SundaySky app** for a single section chosen by the user. Prototype is source-of-truth for features being actively designed; real app is source-of-truth for everything else.

## Paths — authoritative

This skill lives **inside the prototype repo** at `<prototype>/.claude/skills/mitigate-uxplatform-gaps/`. All prototype work is inside that repo.

- **`<prototype>`** — the repo that contains this skill. Resolve it from the git root of the current working directory (this is the UXplatform repo).
- **`<real-app>`** — a local checkout of `smartvideo-hub/smartvideo-hub/client`. Path is **per-developer**. Known working layout: `.../smartvideo-hub/smartvideo-hub/client` (nested — don't drop the inner `smartvideo-hub`). Try the following in order and pick the first that exists:
  1. `$UXPLATFORM_REAL_APP` env var, if set.
  2. `../smartvideo-hub/smartvideo-hub/client` relative to `<prototype>`.
  3. `$HOME/IdeaProjects/studio/smartvideo-hub/smartvideo-hub/client` (original author's layout).
  4. Otherwise ask the user for the path — do NOT guess.
- **Working directory for each run**: `<prototype>/.claude/uxplatform-gaps/<section>/iteration-<N>/`
  - Contains `prototype.png`, `real-app.png`, `prototype.html`, `real-app.html`, `prototype.meta.json`, `real-app.meta.json`, `plan.md`.
  - These are generated artifacts — they're gitignored, not committed.

## Section map — MUST pick one before starting

Ask the user which section if they haven't named one. Valid values: `videos-library`, `video-overview`, `studio`, `account-settings`.

| Section | Real app source | Prototype source | Real-app URL |
|---|---|---|---|
| `videos-library` | `components/newNav/components/videos/VideosOverview.tsx` inside `components/newNav/components/main/MainContainerRouter.tsx`; left panel `components/newNav/components/main/MainContainer.tsx` | `src/VideoLibraryPage.tsx` (+ related) | `/accounts/:accountId/videos` |
| `video-overview` | `components/editor/Components/VideoOverviewPage/VideoOverviewPage.tsx` | search `src/` (likely imported from `App.tsx`) | `/accounts/:accountId/videos/:videoId` |
| `studio` | `components/editor/Components/TruffleEditingWorkSpace/Editor.tsx` — sub-areas: `AppBarContainer`, `LibrariesContainer`, `MainWorkSpaceAndTemplateForm`, `ScenesLineup` inside `BottomContainer` | `src/StudioPage.tsx` | `/accounts/:accountId/videos/:videoId/content` |
| `account-settings` | `components/newNav/components/userManagement/AccountSettingsDialog.tsx` | `src/AccountSettingsDialog.tsx` | opened via 3-dot menu on user avatar (top-right on main page/studio; bottom-left on video overview) |

All real-app paths are relative to `<real-app>/` (resolved above). If a file is not at the expected path, ask the user — don't guess.

### Real-app route map (for navigation inside the real app)

Note: the URL segment is **`/accounts/`** (plural). Earlier versions of this doc said `/account/` — that was wrong. Always confirm by running the bootstrap capture first and reading `finalUrl`.

| Area | URL Pattern |
|---|---|
| Videos list | `/accounts/:accountId/videos` |
| Archived videos | `/accounts/:accountId/videos/archive` |
| AI video drafts | `/accounts/:accountId/videos/ai-video-drafts` |
| Folder | `/accounts/:accountId/videos/folders/:folderId` |
| Video overview | `/accounts/:accountId/videos/:videoId` |
| Video editor (studio) | `/accounts/:accountId/videos/:videoId/content` |
| Templates | `/accounts/:accountId/templates` |
| Inspiration gallery | `/accounts/:accountId/inspiration-gallery` |
| AI CoPilot | `/accounts/:accountId/ai-copilot` |
| Analytics | `/accounts/:accountId/analytics` |
| Users / account management | `/accounts/:accountId/users` |
| Video review | `/accounts/:accountId/videos/:videoId/reviews/:reviewId` |

## Setup — check before starting

1. **Real app on 8080**: assumed running. The user's local real app is expected to bypass authentication entirely (a local-dev convenience), so Playwright can load any URL directly — no `storageState`, no login flow, no cookie juggling. Verify with `curl -sI http://localhost:8080` returns 200/302. If it's down, ask the user to start it — do NOT try to start it yourself. If the real app requires auth on this developer's machine, the skill's Playwright script won't work as-is; ask the user how they want to handle it.
2. **Prototype on 5173**: check `lsof -ti:5173`; if empty, start it in the background from `<prototype>` with `npm run dev > /tmp/uxplatform-dev.log 2>&1 &` and wait until `curl -sI http://localhost:5173` returns 200.
3. **Playwright**: the skill's script installs Playwright on first run into `scripts/` next to this SKILL.md. If `scripts/node_modules/playwright` is missing, run `cd <skill-dir>/scripts && npm install` and then `npx playwright install chromium`. First run downloads ~90 MB of Chromium — takes a minute or two. Subsequent runs are instant.
4. **Account ID**: do NOT hardcode. Run the capture script once against `http://localhost:8080`; its `meta.json` reports the `finalUrl` after redirect — extract the `/account/:accountId/` segment and reuse it.
5. **Video ID (studio and video-overview only)**: ask the user for a test video ID, or navigate the real app to `/videos`, capture DOM, and pick the first video card's link (e.g. an anchor whose href matches `/account/<id>/videos/<videoId>`). Reuse the same video for both real app and prototype to keep comparisons fair.

## Workflow — up to 8 iterations

Track iteration number. For each iteration, create `<prototype>/.claude/uxplatform-gaps/<section>/iteration-<N>/`.

### Stage 1 — Source code comparison

- Read the real-app component(s) from the section map.
- Read the prototype counterpart(s).
- List differences along these axes (each axis is a real source of misses — skip none):
  - **Exact component wrapper used**, not just "same library". If the real app uses `VideoAndSceneSearchBar` (a compound/wrapper) and the prototype uses the raw `Search` primitive, that IS a gap — the wrapper applies its own dimensions, default menus, and behaviors. Both being in the Truffle library is not enough.
  - **Icon identity** — every icon. Note the exact import (e.g. `faFilm` vs `faPhotoFilm`, `["far","lightbulb-on"]` vs `faLightbulb`, `<VideosIcon/>` custom SVG vs `<FontAwesomeIcon icon={faFilm}/>`). Do NOT lump "Video Library icon" into one line — list every nav item / every toolbar icon separately.
  - **Image/SVG asset files** — when an element renders via `<img src="..."/>` or `<SvgIcon>` with a custom SVG, compare the actual file contents. `prototype/public/sundaysky-logo.svg` and `real-app/images/svg/newNavLogo.svg` may be two different files with different dimensions/proportions. Read both as bytes or text and compare.
  - **Props on each component** — size, variant, color, fullWidth, `size="small"` vs `size="medium"`, `marginLeft`, `darkMode`, etc.
  - **`sx` styles** — in two sub-categories:
    - **Dimensions** — `width`, `height`, `minWidth`, `maxWidth`, breakpoint-scoped widths.
    - **Spacing** — `pt`, `pl`, `pr`, `pb`, `mt`, `ml`, `gap`, `columnGap`, `rowGap`. These control vertical position of titles and horizontal indentation of headings. Sign flips and off-by-8px errors hide here.
    - **Appearance** — colors, borders, border-radius, box-shadow.
  - **Typography variants** — exact `variant="h1"` / `"h2"` / `"body1"` etc. A title rendered as `h1` vs `h2` is a gap.
  - **Layout structure** — Stack/Grid/Box nesting, Breadcrumbs wrappers. A title wrapped in an unused `<Breadcrumbs>` (single child) is DOM-equivalent in many cases but can add stray padding — flag as a gap.
  - **Strings/labels**.
  - **Conditional rendering logic** — when the real app has `accounts.length >= 2 ? <Pill+Name+Avatar/> : <Avatar/>`, the prototype must model the appropriate branch. If the prototype shows a pill container with no name inside, that's a bug (leftover pill without its content). Read the logic, don't just the visible branch.
- For each difference, note whether the real app uses an override (e.g. custom `sx`, wrapper component, or theme override). If the real app overrides, the prototype may replicate the same override — that's fine, the goal is visual match, not stylistic purity.

#### Global stylesheet / entry-point imports — check on first iteration

Some sizing and color behavior in shared UI comes from **global CSS** imported at the app's entry point, not from component-level `sx`. The Truffle library provides MUI theme overrides but does NOT ship these globals — consumer apps are expected to import them themselves. Mismatches here look like "same component, different rendering" and are invisible to any component-level diff.

On iteration-1, compare entry files between the two apps and confirm that every global stylesheet imported by the real app is also imported by the prototype:

- Real-app entry: `components/index.tsx` and/or `components/newNavigationIndex.tsx` (grep for `import ".*\\.css"` and for `import "@.*css"`).
- Prototype entry: `src/main.tsx` (plus anything it imports transitively for side effects).

Known globals that matter:

- **`@fortawesome/fontawesome-pro/css/all.css`** — load-bearing. It defines `.svg-inline--fa { height: 1em }`, which is what makes FontAwesome icons scale to their parent's `font-size`. Without it, every FA icon in the prototype renders at its natural viewBox size (often 512×512 scaled down to the SVG's default), so any component that sets `fontSize: 16px` on an `<SvgIcon>` wrapping a FontAwesomeIcon (notably the Truffle `Search`'s 16×16 magnifying-glass inside a 24×24 adornment box) renders the icon at the wrong size and inflates the control's height. Symptom: search input, icon-button controls, and toolbar items look taller in the prototype than in the real app even though both use the same component.
- **Universal `box-sizing: border-box`**. The real app imports Bootstrap 3 (`bootstrap/dist/css/bootstrap.css`) as a legacy dependency, and Bootstrap 3 applies `*, *::before, *::after { box-sizing: border-box }` globally. MUI components — particularly `MuiSvgIcon` — are authored expecting border-box: MUI sets `width: 24px; height: 24px; padding: 4px`, and with border-box that renders as a 24×24 box. Without the universal rule, the prototype defaults to `content-box`, so the same element renders as 32×32 (24 + 8px padding). This cascades through `OutlinedInput` (search input becomes 40px tall instead of 32px) and any adornment dimensions. The prototype should NOT take Bootstrap; instead add the reset to `src/index.css`:

  ```css
  *, *::before, *::after { box-sizing: border-box; }
  ```

  This is the key part of MUI's `<CssBaseline/>` without its other opinionated resets.
- Any other MUI-level baseline (`CssBaseline`) or theme-provider setup the real app configures but the prototype skips.

If a global is missing from the prototype, add it to `src/main.tsx` near the top (before `<App/>` renders). This is a one-line fix that often closes many "the icon/input looks slightly off" gaps at once — don't chase per-component `sx` overrides before ruling this out.

### Stage 2 — Visual comparison (Playwright, headless)

Run `scripts/capture.mjs` twice — once for the prototype, once for the real app. See `scripts/README.md` for the exact CLI. Both runs save a full-page screenshot, the outerHTML of the target region, and a `meta.json`. Artifacts go into the iteration working dir.

**Wait time matters.** The default `--wait-ms 800` is usually enough for the prototype but too short for the real app (it fetches real data over the network). Use `--wait-ms 2500` to `3000` for the real app. Bump higher if the first screenshot shows a loading skeleton.

For sections opened via interaction (e.g. `account-settings` behind a 3-dot menu), use the `--click-sequence` flag (see script README) to click the avatar → menu item → dialog before capturing.

Then:
- Read both screenshots as images (they're PNGs on disk — use the Read tool with the absolute path).
- Read both HTML files and compare structurally. Small node-count differences are expected; major class-name, role, or component-tree divergences are real gaps.
- **Run the pixel-measurement pass (below) before writing the plan. Do NOT skip it.**
- Write a single consolidated gap list to `plan.md` in the iteration dir.

#### Pixel-measurement pass — MANDATORY

Screenshots alone are NOT reliable for detecting the small deltas (4–16px) that drive most visible visual differences. Claude cannot reliably distinguish an 8px height difference by looking at a PNG — any claim like "the search bar is now 32px tall" made purely from a screenshot is a guess, not a measurement. Trust arithmetic, not eyeballing.

**Always use `scripts/capture.mjs --measure` for anything that hinges on dimensions.** The flag takes a JSON array of `{name, selector}` targets and writes a `measurements` array into `meta.json` containing each element's `getBoundingClientRect()` and `getComputedStyle()`. Open the two `meta.json` files and subtract — that's the real delta. See `scripts/README.md` for CLI details.

Screenshots are still useful (for seeing *what* is different at a glance), but the measurement JSON is what you cite when writing a gap line or verifying a fix. A gap is "real-app search h=32px, prototype h=40px, delta=8px" — not "the prototype's search looks a bit taller." If you find yourself writing the latter, you haven't measured yet.

Eyeball the following anchors in every run — then pass them as `--measure` targets to get numbers.

Anchors to measure in every run (even if they "look the same" at a glance):

- **Sidebar**
  - Top offset of the logo's top edge, and its rendered width × height.
  - Top offset of the primary CTA (Create button), and its width.
  - Top offset of the FIRST nav item.
  - Horizontal center position of nav icons.
  - Gap between consecutive nav items.
- **AppBar**
  - Height of the search input and its rendered width.
  - Shape/border of the avatar (is there a pill container around it? does it have a visible border?).
  - Whether an account-name label appears next to the avatar, and whether any badge/bell/divider sits between the search and the avatar.
- **Page header (titles)**
  - Top offset of the page title (Y coordinate of its baseline).
  - Left offset of the page title (X coordinate of its left edge).
  - Top offset and left offset of each section heading below it (e.g. "Recent", "Folders"). Compare the section heading's X to the page title's X — if they're indented relative to each other on one screenshot but aligned on the other, that's a gap.
- **Content rows**
  - Row heights (card, table row) and column count.
  - Gap/columnGap between cards.

Extra dimension checks that prior iterations missed:

- **Input / button heights.** For every text input (search, filter, combobox) and every icon-button toolbar control, measure the rendered outer height. MUI's default input is ~40px; `size="small"` is ~32px. A 6–8px height difference is trivially visible to a human eye but easy to skip past in a side-by-side glance. If the real app's input is shorter than the prototype's, the fix is almost always a `size` prop or an `sx` override on the input's root.
- **Icon rendered color.** Zoom mentally into each nav/toolbar icon: is it the same color as the real app? SVG icons loaded via `<img src="..."/>` do NOT inherit `color: common.white` from a parent — `currentColor` only resolves when the SVG is inlined (e.g. via `<SvgIcon>`, React-component import, or `<use>`). If the real-app source uses `<SvgIcon><MyIcon/></SvgIcon>` with `currentColor` fills, the prototype cannot reproduce the color by dropping the same file into `<img>`. Either (a) render the SVG inline so `currentColor` resolves against the CSS color cascade, or (b) edit the copied SVG to have an explicit `fill` (e.g. `white`) instead of `currentColor`. Check the `fill=` attributes in the copied file before declaring the asset step done.
- **Y-distance between stacked headings.** Measure the pixel distance from the page-title baseline to the first section-heading baseline (e.g. "Video Library" → "Recent"). In the real app this is typically small (~40–60px when there's nothing between them, larger when a toolbar row sits between). If the prototype's distance is much larger, look for intermediate boxes eating vertical space: a `pageTitleRow` for View-toggle, a `breadcrumbBar.mb`, etc. The fix isn't always "remove the intermediate row" — sometimes it's "tighten the `mb`/`gap` so the row sits closer to the elements it separates."

Write each measurement as a row in `plan.md` (real app vs prototype, delta). Anything with delta ≥ 8px becomes a gap line. Do not treat "small visual difference" as non-actionable — quantify it, then classify.

When dimensions come from `sx`/styled constants, trace back to the source: the delta you see on screen usually has a named culprit in code (`pl: 1` on the Recent section, missing `width="auto"` on the logo, a breakpoint-scoped `width` in the wrong range). Fixing at the source is cheaper than fixing visually.

If the prototype capture reports `consoleErrorsCount > 0`, log the first few errors in `plan.md` as a "pre-existing prototype bugs" note — but do NOT treat them as gaps versus the real app. They're separate from this skill's job.

### Stage 3 — Gap classification

Before classifying, filter out the five common non-gaps. These will show up in almost every run and must NOT be listed as gaps:

1. **Structural divergence between files.** The prototype is monolithic — the sidebar, AppBar, and body for a given section all live in a single `src/*.tsx` file (e.g. `AppSidebar` is defined inside `VideoLibraryPage.tsx`). The real app is split across `MainContainer` + `MainContainerRouter` + `VideosOverview` + `AppBarContainer` + …. Match by **visual region**, not by file — compare the prototype's sidebar JSX block to the real app's `MainContainer` sidebar region, the prototype's AppBar JSX block to `AppBarContainer`, and the prototype's page body to `VideosOverview`. Same visuals = not a gap, regardless of how the code is sliced.
2. **`styled()` wrapper vs `Box` + `sx`.** The real app uses `styled.div` / `muiStyled("div")` (e.g. `StyledNavigationMenu`), the prototype uses `<Box sx={...}>`. If the resulting DOM and styles are equivalent, this is not a gap.
3. **Data differences.** Static mock thumbnails, canned video titles, fixed "edited by" strings, hardcoded folder counts on the prototype vs real fetched data on the real app — these are data, not design. Don't flag them.
4. **Dev-environment artifacts in the real-app screenshot.** The real app running locally may show things that aren't part of the product: a green "Local" environment badge, a dev account switcher, mock-banner ribbons, etc. Don't port these into the prototype.
5. **Feature-flag / account-tier divergence.** Some nav items and sections are gated (e.g. Template Library nav item appears only when `hasContributorSeats`; some pages require specific feature flags). If the test account doesn't have the feature on and the prototype does, that's a product question ("should the prototype model the tier gate?") — classify as **ambiguous** and ask the user, don't silently remove it from the prototype.

For what remains, assign one of:

- **obvious-gap** — prototype is drifting and should match real app. Fix it. **This is the default.**
- **likely-intentional** — prototype deliberately diverges because this is an area being actively redesigned. Leave it. Requires POSITIVE evidence, not just "maybe it's on purpose": prototype introduces brand-new components/panels not in the real app (e.g. a Tasks side panel the real app lacks entirely); recent commits in the prototype touched the same area with a design-forward message ("new flow", "redesign", etc.); the divergence is a coherent design change, not a stylistic slip.
- **ambiguous** — could be either. Record it, but DON'T interrupt the workflow to ask immediately. Batch all ambiguous items into ONE question to the user at the end of Stage 3, so they answer everything in a single pass. Format: show screenshot paths once, then a numbered list of one-sentence descriptions + "keep prototype as-is" / "fix to match real app" / "leave for now" per item.

**Bias toward `obvious-gap`.** Prior iterations of this skill over-used `ambiguous` and left user-visible drift (wrong icons, weird avatar borders, wrong logo SVG, misaligned section headings) unfixed. Most differences in **shared app chrome** — the sidebar, AppBar, logo, page title styling, section headings — are drift, not redesign. Default them to `obvious-gap`. Use `ambiguous` only when BOTH of these are true: (a) the difference is in content that feels design-forward (new panel, reimagined layout, added capability), and (b) you cannot find strong evidence either way in recent commits or adjacent files. "Icon X is different" on its own is an `obvious-gap`, not ambiguous — icons are not redesign decisions.

Record the classification in `plan.md` alongside each gap. Stage 4 (mitigation) starts after the user has answered the batched question — or immediately if there were no ambiguous items.

### Stage 4 — Mitigation

Apply edits to the prototype source only. Respect `<prototype>/CLAUDE.md` strictly:

- Never hardcode colors, font sizes, font weights, or font families — map to theme/palette/typography variants.
- Prefer Truffle library components over raw MUI. Prefer MUI over new custom components.
- Use `sx` prop, not `style`. Layout-only `sx` is fine; appearance-only `sx` overriding the theme is not.
- If the real app overrides a Truffle default via `sx`, replicating the same `sx` in the prototype is fine — that's matching the real app, not fighting the design system.
- Do NOT commit, push, or open a PR as part of the skill. Edits only.

#### Asset copying — when SVGs or images differ

When an `obvious-gap` is about an image or SVG, the fix is almost always to copy the asset from the real app and point the prototype at it. Don't try to "visually approximate" — use the same file.

- **Logo**: `client/images/svg/newNavLogo.svg` → copy to `UXplatform/public/` (replace the existing `sundaysky-logo.svg` or add alongside).
- **Sidebar nav icons with custom SVGs**: `client/images/svgAsComponents/videos.svg`, `left-panel-template.svg` — copy the SVG files into `UXplatform/public/` (or `UXplatform/src/assets/`) and render them via `<Box component="img" src="..."/>` or inline-SVG `<SvgIcon>`.
- **FontAwesome icon names**: if the real app uses a specific FA icon (e.g. `faPhotoFilm`, `["far","lightbulb-on"]`, `["far","analytics"]`), the prototype should import the same icon from the same FA package. Don't substitute a "similar" icon like `faImages` for `faPhotoFilm`.

When you copy an asset, use Bash `cp` with absolute paths. After copying, update the `src=` attribute in the prototype to point at the new file. Keep asset filenames identical to the real app's where practical so the mapping is obvious.

**After copying an SVG, check its `fill` attributes.** If the file contains `fill="currentColor"` (which the real app resolves via the CSS color cascade through `<SvgIcon>`), you have two options:

1. **Inline the SVG.** Render it as a React component via `<SvgIcon>{<InlineSvg/>}</SvgIcon>` so `currentColor` resolves against the parent's `color: common.white`. In Vite this needs SVGR (extra setup) or an inline JSX copy of the SVG's path data.
2. **Hardcode the fill in the copied file.** Open the file you copied into `public/` and replace `fill="currentColor"` with the intended color (`fill="white"` for sidebar icons on the dark gradient). This is the simplest fix when the icon's color is context-fixed (e.g. sidebar icons are always white). Do NOT change the real-app source — edit only the prototype's copy.

If you skip this check, the icon renders as the browser's default `currentColor` fallback (often black or transparent) even though you "copied the real SVG" — which reads as an obvious visual gap the skill missed.

#### Chrome defaults (sidebar, AppBar, logo, headings)

Unless the user has explicitly said a specific piece of chrome is being redesigned, the following MUST match the real app exactly:

- Sidebar width, background gradient, logo position/size, Create button position, nav-item list starting offset, nav-item icon choice, nav-item label/wrapping.
- AppBar height, toolbar padding, search input dimensions (including breakpoint-scoped widths), presence/shape of divider, avatar variant, whether an account-name pill wraps the avatar.
- Page title top offset, left offset, typography variant (`h1`), color.
- Section headings (Recent, Folders, etc.) left-alignment with the page title, typography variant (`h2`/`h3`).

If the prototype's sidebar/AppBar renders a pill-shaped container around the avatar but the real app shows a bare avatar (or vice versa), the prototype is wrong — don't classify it as ambiguous just because it "might be a new design."

### Stage 5 — Verification

1. From `<prototype>`, run `npm run build`. If it fails, fix compilation errors before the next iteration. Never disable type checking to make the build pass.
2. Re-capture the prototype (Stage 2), read the new screenshot, and **re-run the pixel-measurement pass against the same anchors as iteration-1.** Each fix in Stage 4 should have closed at least one anchor's delta; if an anchor's delta is unchanged, the fix didn't land and something else is overriding it.
3. For every fix you made, confirm in the new screenshot that the expected visual change is present (icon color right? search height right? title Y offset right?). Don't trust that "the code compiled" — verify visually. The user sees the screenshot, not the diff.
4. Decide whether to continue.

**Stop when ANY of these is true:**
- Remaining gaps are cosmetically minor (anti-aliasing, sub-pixel spacing, icon rendering quirks).
- 8 iterations reached.
- Last iteration made no useful progress, or the iteration before it looked better (the skill is going in circles or degrading the code) — revert the degrading change and stop.

Report the final state to the user with:
- Path to iteration-1 screenshots (before) and the final iteration's screenshots (after).
- A short list of what changed in the prototype source.
- Any gaps left unresolved and why.

## Guardrails

- Playwright runs **headless only**.
- The skill **edits** prototype code. It does not run git commands — no commit, no push, no branch creation.
- If a real-app source file is missing at the expected path, ask the user — don't guess a replacement path.
- If prototype and real app look essentially the same on first iteration, say so and stop. Don't manufacture gaps.
- If the user asks for a section not in the table, stop and ask them to pick one (or extend the map explicitly).
- Do not open the Figma MCP — the real app is the reference, not Figma.

## Tool usage

- **Read / Grep / Glob / Edit / Write** for source code work in both repos.
- **Bash** for `npm run build`, starting the prototype dev server in the background, and running the capture script.
- **Playwright via `scripts/capture.mjs`** for DOM + screenshot capture. The script is the only place Playwright code lives — don't inline it into Bash.
- The script uses the `playwright` npm package installed inside `scripts/`. Don't install Playwright into the prototype's `node_modules` — keep it skill-local.
