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

## Source of Truth — THE REAL APP (READ FIRST)

**UXplatform is a prototype. It must mirror the real app.** Compliance with design-system rules is necessary but NOT sufficient — the real app is the ground truth for structure, component choice, layout, colors, and behavior. Rules alone will let wrong-but-"legal" code slip through (e.g. a `Box` styled as a card when the real app uses `Card`; default body margins; wrong palette slot on the sidebar).

### Authoritative locations (read access granted)

| Resource | Path | What it is |
|---|---|---|
| **Real app source** | `/Users/zoel/IdeaProjects/studio/smartvideo-hub/smartvideo-hub/client/components/newNav/` | Canonical React/TS implementation. **The primary reference.** |
| **Real app rendered HTML** | `real_app/*.html` (`main_page.html`, `video_page.html`, `studio.html`) | DOM + inline styles as rendered by the real app. Use for CSS classes, computed styles, layout. |
| **Real app React tree** | `real_app/*_components.txt` | Component hierarchy dumps from React DevTools. Use to identify which component renders which section. |
| **Real app screenshot** | `real_app/Real_App.png` | Visual target. |
| **Current prototype screenshot** | `real_app/UXPlatform.png` | Current state — for diffing. |
| **Truffle library guide** | `AI-COMPONENT-GUIDE.md` | Props/variants reference for Truffle components. Secondary to real app usage. |

### The order of consultation (non-negotiable)

For every section, component, or style decision:

1. **Open the real app source first.** Find the file in `smartvideo-hub/client/components/newNav/` that renders the equivalent UI. Mirror its component choice, props, structure, and sx.
2. **Cross-check the rendered HTML.** Open the matching `real_app/*.html` to confirm DOM structure, class names, and any global/root styles (body margin, html reset, font loading, background colors).
3. **Cross-check the React tree dump** (`*_components.txt`) to confirm which wrappers / providers / containers are in play.
4. **Consult `AI-COMPONENT-GUIDE.md`** for props/variants of any Truffle component the real app uses.
5. **Fall back to plain MUI** only if the real app does so.
6. **Build a new custom thing only if the real app does.** Never invent a primitive (`Box`-as-card) when the real app uses an existing component (`Card`, `TruffleVideoCard`).

If the real app and `AI-COMPONENT-GUIDE.md` disagree, **the real app wins.**

### Global / root scope must be checked too

Component-level compliance misses page-wide issues. Always inspect and match the real app for:

- `index.html` — root element, viewport, preloaded fonts, favicon
- `index.css` / global CSS — body/html reset, margin, font-family on root, background color
- `main.tsx` — providers, wrappers, order of `TruffleThemeProvider` / `NewNavThemeProvider` / `StyledEngineProvider`
- App shell — `MainContainer`, sidebar, top nav, layout grid

### Visual diff is a gate, not a "nice to have"

A phase is **not** complete until the page has been opened in the browser and diffed side-by-side against `real_app/Real_App.png` (or the real app running locally if available). `tsc --noEmit` passing and `style=` grep-clean is not "done." Use the `platform-browser-debug` skill to drive this.

If you cannot perform the visual diff (no browser access, skill unavailable), the phase status is **incomplete / blocked on visual verification** — never ✅.

### Prototype → real-app file map (living document)

See `REAL-APP-REFERENCE.md` for the prototype-to-real-app file map. **Update it whenever you discover a new mapping.**

---

## Component Library — Secondary Reference

Read `AI-COMPONENT-GUIDE.md` for Truffle component props/variants. It is the authoritative reference for the library, but the **real app source determines *which* components to use and *how* to compose them.** Do not choose a component based solely on the guide's table — confirm the real app uses it in the equivalent place.

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

When implementing any UI element:

1. **First**: Check if it exists as a custom component in the Truffle library (see table in rule 5)
2. **Second**: Use standard MUI component (`@mui/material`) — it already has theme overrides applied
3. **Last resort**: Build a new component — but follow all rules above (theme tokens, typography variants, no hardcoded styles)

### 10. What NOT to Do — Summary

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
- Do NOT choose a component or primitive without first opening the equivalent file in the real app source (`smartvideo-hub/client/components/newNav/`)
- Do NOT skip global/root styles — always check `index.html`, `index.css`, `main.tsx`, body margin, font-family on root
- Do NOT declare a phase ✅ without a side-by-side visual diff against `real_app/Real_App.png` or the real app running in a browser
- Do NOT invent a primitive (e.g. `Box`-as-card) when the real app uses an existing component (e.g. `Card`, `TruffleVideoCard`) — mirror, don't re-derive
- Do NOT trust `AI-COMPONENT-GUIDE.md` over the real app — the real app wins every conflict

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
