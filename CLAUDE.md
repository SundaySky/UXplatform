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
  main.tsx                  # React entry point (TruffleThemeProvider wraps app)
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

### 12. Hover Shadows Need Clearance in Scroll Containers

When a card or thumbnail applies a large hover shadow (e.g. `boxShadow: 24`) AND sits inside a container with `overflow: auto` (or `overflowX: auto`), the container clips the shadow. Add padding on every side where the shadow extends so it isn't cut off. Treat scroll-container padding on those sides as load-bearing, not decorative — setting it to `0` on a side where a hovered child's shadow extends will visibly clip the shadow.

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
