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
| UI components | MUI (Material UI) | 7.3.6 |
| CSS-in-JS | Emotion | 11.13.x |
| Component library | `@sundaysky/smartvideo-hub-truffle-component-library` | 8.0.x |
| Package manager | npm | (lockfile committed) |

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
  main.tsx                       # React entry point (TruffleThemeProvider wraps app)
  App.tsx                        # Root component, routing, and global state
  AccountSettingsDialog.tsx      # See "AccountSettingsDialog carve-out" below
  theme.ts                       # MUI theme + design tokens (sourced from Figma)
  pages/
    VideoLibrary/                # Main page (videos list + folders)
      VideoLibraryPage.tsx
      VideoCard.tsx
      FolderCard.tsx
      VideoTableView.tsx
      StatusLabel.tsx
      types.ts                   # VideoItem, LiveVideoState, StatusKey, resolveStatuses
    VideoOverview/               # Per-video overview / details page
      VideoOverviewPage.tsx
      OverviewSidebar.tsx
      VideoPreviewCard.tsx
      ReviewOptionsPanel.tsx
    Studio/                      # Video editor
      StudioPage.tsx
      CommentsPanel.tsx
      EditHeadingDialog.tsx
      EditBulletDialog.tsx
      PlaceholderToolbar.tsx
      ButtonPlaceholderToolbar.tsx
      BulletPlaceholderToolbar.tsx
      placeholderToolbarStyles.ts
      SceneThumbnails.tsx
    TemplateLibrary/
      TemplateLibraryPage.tsx
      TemplateCard.tsx
    Template/
      TemplatePage.tsx
    TemplateStudio/
      TemplateStudioPage.tsx
  dialogs/                       # Modal dialogs
    ApprovalDialog.tsx
    ApproveVideoDialog.tsx
    CancelApprovalDialog.tsx
    ConfirmationDialog.tsx
    AddApproverDialog.tsx
    ManageAccessDialog.tsx
    VideoPermissionDialog.tsx
    AvatarPermissionDialog.tsx
    SceneLibraryDialog.tsx
    LanguagePickerDialog.tsx
    CreateTemplateDialog.tsx
    PublishTemplateDialog.tsx
    WorkflowApprovalStepper.tsx
  panels/                        # Floating / docked side panels
    NotificationsPanel.tsx
    MediaLibraryPanel.tsx
    AvatarLibraryPanel.tsx
    LanguagesPanel.tsx
  components/                    # Cross-area reusable components
    AppSidebar.tsx
    PermAvatarGroup.tsx
    TasksPanel.tsx
public/
  thumb.svg                      # Placeholder video thumbnail
.claude/
  launch.json                    # Dev server config for Claude Code preview
  settings.local.json            # Claude Code permission allowlist (local, not committed)
```

### File-organization rules — STRICT

When creating new files or moving existing ones, follow these rules:

1. **One component per file.** Each `.tsx` file owns one default-exported React component. The filename matches the component name (PascalCase).
2. **Small inner helpers stay in the parent file.** A helper component or function under ~30 lines that is used in only one place can be defined inline in its parent. Do not create a new file just to extract it. Examples that should stay inline: a `Pill` used only in a toolbar, a `DashedLabel` used only in a card, a `statusLabel()` formatter helper, a `sceneContentFor()` lookup function.
3. **Where new files go:**
   - **`pages/<Area>/`** — files used only inside one area of the app (Video Library, Video Overview, Studio, Template Library, Template, Template Studio). Sample data, area-scoped types, and area-scoped helpers also live here.
   - **`dialogs/`** — modal dialogs (anything that opens with `<Dialog>` from MUI or `SimpleDialogBase` from Truffle). Confirmation dialogs, permission dialogs, picker dialogs.
   - **`panels/`** — floating or docked side panels (Notifications, Media library, Avatar library, Languages picker panel). Anything `CommentsPanel`-like that floats over the editor lives in its area's `pages/<Area>/` folder, not here, because it is editor-scoped.
   - **`components/`** — cross-area reusable components imported by 2+ pages or by `App.tsx`. Examples currently here: `AppSidebar`, `PermAvatarGroup`, `TasksPanel`. Do **not** put an area-only component here just because it might be reusable later — wait until a second consumer actually appears.
4. **Styles co-located with the component.** Define `SxProps<Theme>` constants at the bottom of the same file (per the Styling Pattern section below). Only extract styles into a sibling `.ts` file when the same constants are imported by 2+ files in the same folder (e.g. `pages/Studio/placeholderToolbarStyles.ts`).
5. **Types go in the file that owns them, unless 2+ files need them.** When two or more files in the same area need the same type or helper, put it in a sibling `types.ts` (or a more specific name if the file isn't only types). Example: `pages/VideoLibrary/types.ts` defines `VideoItem`, `LiveVideoState`, `StatusKey`, and `resolveStatuses` because `VideoLibraryPage`, `VideoCard`, and `VideoTableView` all import from it.
6. **Index files (`index.ts` re-exports) are NOT used.** Always import from the specific file path.

### AccountSettingsDialog carve-out — TEMPORARY

`src/AccountSettingsDialog.tsx` lives at the `src/` root, not under `dialogs/`. It is excluded from the structure above on purpose because work on this file is happening on a parallel branch and a `git mv` would produce conflicts when those branches merge. **Do not move `AccountSettingsDialog.tsx` until the parallel work has merged into `main`.** Once that merges, move it to `src/dialogs/AccountSettingsDialog.tsx` and update the imports in `App.tsx` and `pages/VideoLibrary/VideoLibraryPage.tsx`.

---

## Component Library — Primary Reference

**The Truffle component library is the first-priority source of building blocks.** Before writing new UI code, find the existing component in `@sundaysky/smartvideo-hub-truffle-component-library` and use it as intended:

- Use its documented props rather than re-styling via `sx`.
- Do not override its typography, colors, borders, radii, shadows, or other appearance-related styles.
- Layout-only `sx` (margin, padding, width, flex) is fine.

Read `AI-COMPONENT-GUIDE.md` for Truffle component props/variants — it is the authoritative reference for the library. If a need is not met by the Truffle library, fall back to plain MUI (`@mui/material`), which already has the library's theme overrides applied. Build a new component only as a last resort, and only when no library or MUI component fits.

### Component decision order

1. **Truffle library component** from `@sundaysky/smartvideo-hub-truffle-component-library` (see the table in Rule 5 for common needs).
2. **Standard MUI component** from `@mui/material` — theme overrides are already applied.
3. **New custom component** — last resort, and must follow every rule in this file.

---

## Figma Designs as Input

When the input for a task is a Figma design (a `figma.com/...` URL, a Figma file reference, or a screenshot shared from Figma), the workflow is:

1. **Pull the design.** Use the Figma MCP tools — primarily `get_design_context` with the file key and node id extracted from the URL — to retrieve the design, its variables, and a screenshot. Fall back to `get_screenshot` + `get_metadata` if a full code context is not needed.
2. **Match Figma layers to library components.** Walk the design top-down and, for each layer, identify what it is conceptually (button, text field, dialog, avatar, card, menu item, accordion, etc.). Map that to the equivalent Truffle library component first, then to a standard MUI component. **Name matching is not exact** — a Figma layer called "Primary CTA" should still map to `Button variant="contained"`; a "Status pill" maps to `Label`; an "Icon button w/ dropdown" maps to `TruffleIconButton` + `Menu`. Use the Rule 5 table and `AI-COMPONENT-GUIDE.md` to find the right match.
3. **Match props.** If the Figma layer's properties (size, variant, disabled state, color role, icon placement, etc.) correspond to props on the identified component, use those props. Do not re-implement the same behavior via `sx` or by building a new wrapper. Note that Figma prop names often differ from component prop names — match by meaning, not by string.
4. **Only introduce new primitives if the library has no match.** If neither the Truffle library nor MUI has a component that fits the Figma layer, confirm with the user before building something new.
5. **Tokens over hex.** If the design exposes design tokens (CSS variables), map them to the theme palette and typography variants. If it only exposes raw hex/rgb values, still map them to the nearest theme slot — never copy the raw value into code. If no slot fits, ask the user before inventing one.

Screenshots alone (no Figma URL) follow the same mapping rules — just without MCP retrieval.

### Figma-to-code fidelity checklist

For every component implemented from a Figma design or screenshot, verify **all** of the following before considering the task done. Do not skip any item even if it seems obvious.

| Property | What to check |
|---|---|
| **Size** | `size` prop matches Figma (small / medium / large). When unsure, use the DS defaults below. |
| **Variant** | `variant` prop matches Figma (contained / outlined / text for buttons; filled / outlined / standard for inputs; etc.). |
| **Color / role** | Color role matches (primary / secondary / error / warning / info / success / inherit). Never infer from hex — map to the nearest semantic role. |
| **Alignment** | Text and layout alignment matches Figma (left / center / right; flex justification). |
| **Spacing** | Gap, padding, and margin match Figma spacing tokens (MUI spacing unit = 8 px). |
| **Icon placement** | Icons appear on the correct side (startIcon / endIcon / standalone). Icon size matches. |
| **Full-width vs auto** | `fullWidth` applied only when the Figma component stretches to its container edge. |
| **Disabled / loading state** | Disabled prop set when Figma shows a disabled state. |
| **Typography variant** | Text uses the correct variant (h1–h6, subtitle1/2, body1/2, caption). |

---

### Design System defaults — apply when Figma input is absent

When building UI that is **not** directly from a Figma design (inferred dialogs, panels, empty states, etc.), apply these established DS conventions:

| Context | Default |
|---|---|
| **Dialog primary action button** | `variant="contained"` `size="large"` `fullWidth` |
| **Dialog secondary / cancel button** | `variant="text"` or `TruffleLink` |
| **Inline card primary action** | `variant="contained"` `size="medium"` `fullWidth` |
| **Destructive action button** | `variant="outlined"` `color="error"` |
| **Icon-only button** | `TruffleIconButton` (never raw `IconButton` with custom sx) |
| **Form inputs** | `size="medium"` outlined (Truffle theme default) |
| **Confirmation / alert dialog** | Use `SimpleDialogBase` from Truffle, not a raw `Dialog` |
| **Section headings in panels** | `Typography variant="h5"` |
| **Body text in cards/panels** | `Typography variant="body1"` |
| **Secondary/helper text** | `Typography variant="body1" color="text.secondary"` |
| **Metadata / timestamps** | `Typography variant="caption"` |

---

### DS conflict alerts — STRICT

If during implementation you discover that what is asked for **conflicts with the design system rules** (e.g. hardcoded color, unsupported size, typography override, component that should not be re-implemented), you MUST surface this before writing code:

> 🔴 **DS CONFLICT:** [describe the conflict and which rule it violates]. Ask the user how to proceed before implementing.

Do not silently work around a DS conflict. Do not implement a workaround without the user's explicit approval.

---

### When uncertain about a component

If you are unsure about the correct size, variant, alignment, or which Truffle/MUI component to use, **ask the user before implementing**. A short clarifying question is always better than implementing the wrong thing and needing a correction. Frame the question specifically:

> "In Figma this looks like a [X] — should I use [option A] or [option B]?"

---

## UI change preflight — STRICT

Before any `Edit` or `Write` tool call that adds or modifies UI, Claude MUST first state, in the response, a short component plan. This applies to **every** UI change — whether the input is a Figma design, a screenshot, or a plain-language description from the user. The plan goes in the response **before** the tool calls, not after.

### Preflight format

For each visual element being added or changed, list:

1. **What it is** — one phrase (e.g. "count badge next to button label").
2. **Component used** — the Truffle or MUI component name and key props (e.g. `Label color="default" size="small"`).
3. **Citation or new** — either a file:line reference where this same pattern is already used in the codebase, OR an explicit "**new pattern**" flag.

Example:

> **UI preflight for this change:**
> - Count badge inside button → `Label label={String(count)} color="default" size="small"` — matches `LanguagesPanel.tsx:788`
> - Description below dialog title → `Typography variant="body1" color="text.secondary"` — **new pattern** for this dialog; flagging.

### Hard stops

- **Never write inline JSX text for a recurring visual element** (count, status, pill, badge, alert, banner, etc.) without first searching the codebase for the existing component. Counts and status text in this codebase use `Label` — not template strings inside a Button or Typography.
- **If the preflight reveals a new pattern**, ask the user before writing the code: "I don't see this pattern in the codebase — should I use [X] or [Y], or is there a Figma reference?"
- **If the input is a Figma URL**, the preflight must reference the Figma file/node and the variables pulled via the Figma MCP tools — not just a guess from the screenshot.

The goal of the preflight is to expose component decisions BEFORE they're encoded, so the user can correct them in seconds instead of after a screenshot round-trip.

---

## Design System Rules — STRICT

The following rules are non-negotiable. Every piece of UI code must comply.

### 1. Theme Is the Single Source of Truth

The app is wrapped in `TruffleThemeProvider` (see `main.tsx`). This provides the complete MUI theme — palette, typography, shadows, spacing, and 40+ component overrides. The local `theme.ts` file provides supplementary token mappings sourced from Figma.

**Do NOT create your own `createTheme()` or `ThemeProvider`.**

### 2. NEVER Hardcode Colors

Every color must come from the theme palette. No hex codes, no rgb() values, no CSS color names in component code.

```tsx
// CORRECT
<Box sx={{ color: "text.primary", bgcolor: "primary.light" }} />
<Box sx={(theme) => ({ borderColor: theme.palette.divider })} />

// WRONG — these are all violations
<Box sx={{ color: "#323338" }} />
<Box sx={{ backgroundColor: "rgb(244, 247, 255)" }} />
<Box sx={{ borderColor: "rgba(0, 83, 229, 0.12)" }} />
<Typography style={{ color: "grey" }}>text</Typography>
```

If you need a color that doesn't exist in the palette, ask the user — don't invent one.

### 3. NEVER Override Typography

Use only the defined typography variants. Never set custom font sizes, font weights, font families, or line heights.

```tsx
// CORRECT
<Typography variant="h4">Title</Typography>
<Typography variant="body1" color="text.secondary">Description</Typography>
<Typography variant="caption">12px metadata</Typography>

// WRONG — all of these violate the design system
<Typography sx={{ fontSize: 18 }}>Custom size</Typography>
<Typography sx={{ fontWeight: 700 }}>Custom weight</Typography>
<Typography sx={{ fontFamily: "Roboto" }}>Wrong font</Typography>
<span style={{ fontSize: "16px", fontWeight: 600 }}>Inline text</span>
```

Available variants (see AI-COMPONENT-GUIDE.md for full list):
- **Headings** (Inter): h1 (28px/600), h2 (24px/500), h3 (20px/600), h4 (16px/600), h5 (14px/600), h6 (14px/500)
- **Body** (Open Sans): subtitle1 (16px/500), subtitle2 (14px/500), body1 (14px/400), body2 (14px/300), caption (12px/400)
- **Custom**: label (10.5px), input (14px), tooltip (12px), helper (12px)

### 4. NEVER Override MUI Component Base Styles

The component library provides pre-configured overrides for Button, TextField, Dialog, Chip, Avatar, Tooltip, Table, and 40+ other MUI components. These already match the design system.

```tsx
// WRONG — do not re-style base MUI components
<Button sx={{ borderRadius: 4, textTransform: "uppercase", fontSize: 16 }}>Click</Button>
<TextField sx={{ "& .MuiOutlinedInput-root": { borderRadius: 12 } }} />

// CORRECT — use them as-is; the theme handles their appearance
<Button variant="contained">Click</Button>
<Button variant="outlined" size="small">Click</Button>
<TextField label="Name" />
```

You may add layout-related `sx` (margin, padding, width, flex properties) but not appearance overrides (colors, borders, border-radius, shadows, font properties).

### 5. Use Custom Components from the Library

Before building any UI element, check if a component already exists in the library. The following are commonly needed and MUST be used instead of ad-hoc implementations:

| Need | Use this | NOT this |
|---|---|---|
| Truncated text with tooltip | `TypographyWithTooltipOnOverflow` | Typography + manual Tooltip + noWrap |
| Status badge/label | `Label` | Custom Box with colored background |
| Icon button with variants | `TruffleIconButton` | IconButton with custom sx styles |
| Avatar with sizes | `TruffleAvatar` | Avatar with custom width/height |
| Search input | `Search` | OutlinedInput with custom search icon |
| Filter button + popover | `Filter` | Button + Popover + custom state |
| Thumbnail card grid item | `ThumbnailActions` | Custom Box with hover/selected logic |
| Alert/notice box | `AttentionBox` | Box with custom colored background |
| Alert banner | `TruffleAlert` | Alert with custom close button |
| Menu item with extras | `TruffleMenuItem` | MenuItem with custom check/secondary |
| Sidebar menu panel | `TruffleMenuPanel` | Box with custom list styles |
| Modal title/content/actions | `TruffleModalTitle` / `TruffleModalContent` / `TruffleModalActions` | Custom dialog layout |
| Dialog title/actions | `TruffleDialogTitle` / `TruffleDialogActions` | DialogTitle with custom styling |
| Confirmation dialog | `SimpleDialogBase` | Dialog with custom button layout |
| Draggable dialog | `DraggableConfigurationDialog` | Dialog + react-draggable |
| Accordion | `TruffleAccordion` | Accordion with custom elevation |
| Toggle button group | `TruffleToggleButtonGroup` + `ToggleIconButton` | ToggleButtonGroup with custom dividers |
| Popover (draggable) | `TrufflePopover` | Popover with custom styles |
| Link with icons | `TruffleLink` | Link with flex + icon wrappers |
| Text field with char limit | `EnhancedTextField` | TextField with custom counter |
| Color picker | `ColorPicker` | Custom color input |
| File drag & drop | `Dropzone` + `UploadFile` + `FileUploaded` | Custom drag area |
| Merge multiple sx | `combineSxProps()` | Array spread or manual merge |
| Gradient fill on icons | `TruffleSvgGradientId` | Custom SVG gradient defs |
| Rich text editor | `RichTextField` | Custom Quill setup |

### 6. Use MUI Layout Components

Use `Box`, `Stack`, `Grid`, `Container` for layout. Do not use raw HTML elements with CSS.

```tsx
// CORRECT
<Stack direction="row" spacing={2} alignItems="center">
  <TruffleAvatar text="JD" size="small" />
  <Typography variant="body1">John Doe</Typography>
</Stack>

// WRONG
<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
  <span>JD</span>
  <span style={{ fontSize: 14 }}>John Doe</span>
</div>
```

### 7. Use MUI's `sx` Prop — Not `style` or `styled()`

```tsx
// CORRECT
<Box sx={{ mt: 2, p: 1, display: "flex" }} />

// WRONG
<Box style={{ marginTop: 16, padding: 8, display: "flex" }} />
```

MUI spacing unit = 8px. `p: 2` = 16px, `mt: 1` = 8px, etc.

### 8. Icons

- **Primary**: FontAwesome Pro icons (`@fortawesome/pro-regular-svg-icons`, `pro-solid-svg-icons`, `pro-light-svg-icons`)
- **Supplementary**: MUI icons (`@mui/icons-material`) for standard UI actions
- **Custom**: Library-exported icons from `@sundaysky/smartvideo-hub-truffle-component-library`

```tsx
import { faUser } from "@fortawesome/pro-regular-svg-icons/faUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CloseIcon from "@mui/icons-material/Close";
```

### 9. Component Decision Order

Follow the three-step decision order in the **Component Library — Primary Reference** section above: Truffle library → MUI → new custom component. When the task input is a Figma design, use the **Figma Designs as Input** workflow to map each layer to the right library or MUI component.

### 11. Truffle Theme Overrides That Can Surprise You

The Truffle theme sets base styles on some MUI components that are not obvious from reading JSX. These overrides CASCADE everywhere the component is used. If a standard MUI component is behaving in a way you didn't expect, assume the Truffle theme has customized it before assuming a base-MUI bug.

Known load-bearing overrides (verify in `node_modules/@sundaysky/smartvideo-hub-truffle-component-library/dist/MuiComponents/` before assuming):

- **`MuiListItemText.primary` and `.secondary`** default to `whiteSpace: nowrap; overflow: hidden; text-overflow: ellipsis`. In any narrow container (e.g. a 112px sidebar, a compact menu), labels TRUNCATE with an ellipsis instead of wrapping. If you need the label to wrap, either (a) pass a JSX label with an explicit `<br />` inside a Box wrapper (`textAlign: "center", display: "inline-block"`), or (b) override `whiteSpace: "normal"` via the `sx` prop — e.g. `"& .MuiListItemText-primary": { whiteSpace: "normal" }`, plus `wordBreak: "break-word"` on the primary Typography if needed.
- **Other overrides to check when something looks off**: `MuiButton`, `MuiChip`, `MuiDialog`, `MuiTooltip`. Read the override file in `node_modules/@sundaysky/smartvideo-hub-truffle-component-library/dist/MuiComponents/<Name>/<Name>.js` before concluding "this is a base MUI behavior."

### 12. Hover Shadows Need Clearance — from Containers AND from Neighbors

Cards/thumbnails with hover shadows (e.g. `boxShadow: 24`, which in the Truffle theme is a soft glow with ~10px blur) need clearance in two directions:

- **From scroll-container edges.** When the card sits inside a container with `overflow: auto` (or `overflowX: auto`), the container clips the shadow. Add padding on every side where the shadow extends. Treat scroll-container padding on those sides as load-bearing, not decorative — setting it to `0` on a side where a hovered child's shadow extends will visibly clip the shadow.
- **From neighbor cards in a grid/flex row.** When cards sit in a grid (or flex row) with tight `columnGap`/`rowGap`/`gap`, the hovered card's shadow visually overlaps the adjacent card. The gap must be at least the shadow's blur radius plus any desired visual clearance. With Truffle's 10px-blur shadow 24, an 8px gap causes overlap; use `columnGap: "24px"` (or similar) when cards in the grid have hover shadows.

### 13. What NOT to Do — Summary

- Do NOT hardcode colors (hex, rgb, rgba, named colors)
- Do NOT set custom font sizes, weights, or families
- Do NOT override Button variants, border radius, or text transform
- Do NOT override TextField, Dialog, Chip, or other MUI component base styles
- Do NOT create custom `ThemeProvider` or `createTheme()`
- Do NOT use raw HTML elements (`div`, `span`, `p`) for layout — use MUI components
- Do NOT use `style` attribute — use `sx` prop
- Do NOT re-implement functionality that exists in the component library
- Do NOT use deprecated components (`InlineTextField`, `DeprecatedInlineTextField`, `ComplexInputDialog`, `TabbedDialog`)
- Do NOT use `useIsEllipsisActive` — use `TypographyWithTooltipOnOverflow`
- Do NOT define inline `SxProps` objects — define them as named constants at the bottom of the file
- Do NOT invent a primitive (e.g. `Box`-as-card) when the Truffle library or MUI already provides a component for it — search the library first
- Do NOT re-implement a component's built-in props via `sx` or a wrapper — use the props the component already exposes
- Do NOT assume narrow-sidebar `ListItemText` labels will wrap — Truffle's theme sets `whiteSpace: nowrap` by default; use an explicit `<br />` in a JSX label OR a `whiteSpace: normal` override
- Do NOT set a horizontal scroll container's top/side padding to `0` if the children have hover shadows — the shadow will be clipped (see rule 12)
- Do NOT use a grid/flex gap smaller than the hover shadow's blur radius — hovered cards will visually overlap neighbors (see rule 12)

---

## Styling Pattern

Define SxProps as typed constants at the bottom of the file. Use `combineSxProps` from the library to compose them.

```tsx
import type { SxProps, Theme } from "@mui/material";
import { combineSxProps } from "@sundaysky/smartvideo-hub-truffle-component-library";

export default function MyComponent({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box sx={combineSxProps(containerSx, sx)}>
      <Typography variant="h4" sx={titleSx}>Title</Typography>
    </Box>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const containerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  p: 3,
  bgcolor: "background.paper",
  borderRadius: 1,
};

const titleSx: SxProps<Theme> = {
  color: "text.primary",
};
```

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

This repo is used by non-developers as well as developers. Three scripts in `scripts/` (and matching skills under `.claude/skills/`) automate the entire start → work → ship cycle. **Use them — do not run raw `git checkout`/`commit`/`push`/`gh pr ...` commands by hand.**

| Skill | Script | What it does |
|---|---|---|
| `start-task` | `./scripts/start-task.sh "<short description>"` | Pulls the latest `main`, then creates and switches to a new branch named after the description. |
| `end-task` | `./scripts/end-task.sh "<commit and PR title>"` | Stages all changes, commits, pushes, opens a PR, merges it (deletes the remote branch), then switches to `main` and pulls. |
| `abandon-task` | `./scripts/abandon-task.sh "<optional reason>"` | Commits any pending work, renames the branch to `abandoned-<original>-<timestamp>`, pushes that name to the remote (so the work is recoverable), then returns to a clean `main`. |

### Branching Rules — STRICT

- **Never work directly on `main`.** All work happens on a user branch created by `start-task`.
- **Before making any code change while on `main`,** Claude MUST invoke the `start-task` skill first — no exceptions. Ask the user for a short task description, then run the script.
- **When the user signals they are done** ("I'm done", "ship it", "merge it", "/end-task", etc.), Claude invokes the `end-task` skill — do not run the individual git/gh commands manually.
- **When the user wants to drop the current work** without merging it ("abandon", "scrap this", "set aside", "/abandon-task"), Claude invokes the `abandon-task` skill.
- **Branch naming uses dashes only — never `/`.** The `start-task` script enforces this when it slugifies the description. Manual branch creation is forbidden.

### Commit message style

`end-task` uses the title you give it as both the commit message subject and the PR title. Match existing history:
- Imperative mood: `Add`, `Fix`, `Update`, `Remove`
- Sentence case, no trailing period
- Reference the feature area: `Approval dialog: …`, `VideoLibrary: …`

### Manual git is allowed only for:

- Read-only inspection (`git status`, `git log`, `git diff`, `git branch`, `gh pr view`, etc.).
- Recovering an abandoned branch (`git fetch origin && git checkout abandoned-<name>-<timestamp>`).
- Resolving merge conflicts that the scripts cannot resolve themselves.

For everything else (creating a branch, committing, pushing, opening/merging PRs), use the scripts.

### Gitignore

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
