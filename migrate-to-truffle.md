# Migrate to Truffle — Component Library Compliance Playbook

This playbook documents every design system violation in the existing UXplatform components and provides exact migration instructions to make them fully compliant with the Truffle component library and AI-COMPONENT-GUIDE.md.

**Goal:** Convert all ad-hoc, one-off styled components to use theme tokens, typography variants, and library components — with as little visual change as possible.

**Scope:** 15 source files (excluding `src/test-components/`, `main.tsx`, and `theme.ts`)

---

## Table of Contents

1. [Migration Principles](#1-migration-principles)
2. [Pre-requisites](#2-pre-requisites)
3. [Color Mapping Reference](#3-color-mapping-reference)
4. [Typography Mapping Reference](#4-typography-mapping-reference)
5. [Box Shadow Mapping](#5-box-shadow-mapping)
6. [Component Replacement Reference](#6-component-replacement-reference)
7. [Structural Patterns to Apply](#7-structural-patterns-to-apply)
8. [Per-File Migration Plans](#8-per-file-migration-plans)
9. [theme.ts Deprecation](#9-themets-deprecation)
10. [Verification Checklist](#10-verification-checklist)

---

## 1. Migration Principles

1. **One file at a time.** Each component file is self-contained. Migrate and verify one before moving to the next.
2. **Visual parity first.** The migrated component should look identical. If the closest theme token produces a slightly different value, note it but prefer the theme token.
3. **Delete all `ds`/`s`/`c`/`t`/`ns` constant blocks.** Every file defines its own hardcoded token object. These are the primary source of violations. Replace every reference with a theme palette path.
4. **Typography: variant prop, not sx.** Replace every `sx={{ fontFamily, fontSize, fontWeight, lineHeight }}` with a `variant` prop on `<Typography>`. Only add `color` via sx.
5. **Use library components.** Before writing any ad-hoc UI element, check if the Truffle library already provides it (see Section 6).
6. **SxProps at the bottom.** Move all inline `sx` objects to named `SxProps<Theme>` constants at the bottom of the file.
7. **`combineSxProps` for merging.** Never spread or array-merge sx props manually.

---

## 2. Pre-requisites

Before starting migration:

- [ ] `TruffleThemeProvider` wraps the app in `main.tsx` (already done)
- [ ] `@sundaysky/smartvideo-hub-truffle-component-library` is installed (already done)
- [ ] Read `AI-COMPONENT-GUIDE.md` for the full component and token reference
- [ ] Confirm the dev server runs (`npm run dev`) so you can visually verify after each migration

---

## 3. Color Mapping Reference

### 3A. Direct Palette Mappings

Every hardcoded color below has a direct theme palette equivalent. Replace `"#hex"` with the palette path string in `sx` props.

| Hardcoded Value | Theme Path (sx shorthand) | Theme Path (callback) | Category |
|---|---|---|---|
| `#0053E5` | `"primary.main"` | `theme.palette.primary.main` | Primary |
| `#F4F7FF` | `"background.default"` | `theme.palette.background.default` | Background |
| `#FFFFFF` / `#fff` | `"common.white"` or `"background.paper"` | `theme.palette.common.white` | White |
| `#03194F` | `"secondary.main"` | `theme.palette.secondary.main` | Secondary |
| `#323338` | `"text.primary"` | `theme.palette.text.primary` | Text |
| `#E62843` | `"error.main"` | `theme.palette.error.main` | Error |
| `#118747` | `"success.main"` | `theme.palette.success.main` | Success |
| `#F46900` | `"warning.main"` | `theme.palette.warning.main` | Warning |
| `#0176D7` | `"info.main"` | `theme.palette.info.main` | Info |
| `#EEEEEE` | `"grey.200"` | `theme.palette.grey[200]` | Grey |
| `#CFD6EA` | `"grey.300"` | `theme.palette.grey[300]` | Grey |
| `#BDBDBD` | `"grey.400"` | `theme.palette.grey[400]` | Grey |
| `#EFF7FE` | `"info.light"` | `theme.palette.info.light` | Info bg |
| `#E5F7E0` | `"success.light"` | `theme.palette.success.light` | Success bg |
| `#FFEBEE` | `"error.light"` | `theme.palette.error.light` | Error bg |
| `#FFF5CE` | `"warning.light"` | `theme.palette.warning.light` | Warning bg |
| `#7F8CED` | `"secondary.light"` | `theme.palette.secondary.light` | Secondary |

### 3B. Rgba → Palette Path Mappings

| Hardcoded Rgba | Theme Path | Notes |
|---|---|---|
| `rgba(60, 60, 72, 0.8)` | `"text.secondary"` | Truffle theme text.secondary = `rgb(60,60,72)` |
| `rgba(60, 60, 72, 0.6)` | `"text.secondary"` | Slightly lighter variant — use `text.secondary` with opacity if needed |
| `rgba(50, 51, 56, 0.8)` | `"text.secondary"` | NotificationsPanel variant — same intent |
| `rgba(50, 51, 56, 0.5)` | `"text.disabled"` | Truffle theme text.disabled |
| `rgba(0, 0, 0, 0.87)` | `"text.primary"` | Standard MUI text.primary |
| `rgba(0, 0, 0, 0.56)` | `"action.active"` | Standard MUI action.active |
| `rgba(0, 0, 0, 0.54)` | `"action.active"` | Close enough to action.active |
| `rgba(0, 0, 0, 0.38)` | `"action.disabled"` | Standard MUI action.disabled |
| `rgba(0, 83, 229, 0.12)` | `"divider"` | Primary-tinted divider |
| `rgba(0, 83, 229, 0.10)` | `"action.selected"` | Selected state background |
| `rgba(0, 83, 229, 0.06)` | `"action.hover"` | Hover state background |
| `rgba(0, 83, 229, 0.08)` | Use callback: `alpha(theme.palette.primary.main, 0.08)` | Tab background |
| `rgba(0, 83, 229, 0.04)` | Use callback: `alpha(theme.palette.primary.main, 0.04)` | Subtle hover |
| `rgba(0, 83, 229, 0.24)` | Use callback: `alpha(theme.palette.primary.main, 0.24)` | Border |

### 3C. Colors Requiring `alpha()` Helper

For opacity variants not directly in the palette, use MUI's `alpha` utility:

```tsx
import { alpha } from "@mui/material/styles";

// In sx callback:
sx={(theme) => ({
  bgcolor: alpha(theme.palette.primary.main, 0.08),
  borderColor: alpha(theme.palette.primary.main, 0.24),
})}
```

### 3D. Colors Requiring Theme Expansion

These colors are used in the codebase but don't have direct Truffle palette paths. They should be added to the theme or accessed via the Truffle theme's existing values:

| Color | Current Use | Recommended Approach |
|---|---|---|
| `#284862` | Alert info text color | Access via Truffle alert component override — use `TruffleAlert` or `AttentionBox` instead |
| `#0047CC` / `#0046C2` / `#0042BB` | Primary hover states | Let MUI Button's built-in `:hover` handle this — remove manual hover colors |
| `#C41C32` / `#C41E34` / `#C41E3A` | Error button hover | Let MUI Button's built-in `:hover` handle this |
| `#02143e` | Dark sidebar selected | Use `secondary.main` or `alpha(secondary.main, 0.9)` |
| `#1A1A2E` | Near-black headings | Use `secondary.main` (#03194F) or `text.primary` |
| `#888` | Grey icons | Use `action.active` or `action.disabled` |
| `#E0E0E0` | Divider borders | Use `"divider"` (Truffle divider = primary at 12% opacity) |
| `#FAFAFA` | Subtle backgrounds | Use `"grey.50"` |
| `#f5f5f5` | Light grey backgrounds | Use `"grey.100"` |
| `#C9D4EB` | Scrollbar thumb | Use `"grey.300"` |

### 3E. Avatar Identity Colors

These are per-user colors stored in data objects. They are NOT theme violations — they represent user-specific brand colors. Keep them as-is in the data models (`USERS`, `ALL_USERS`, etc.), but when rendering them use the `TruffleAvatar` component's `color` prop or dynamic sx with `bgcolor`.

### 3F. Design-Specific Colors (Keep as Constants)

These colors are design-specific and don't map to the general palette. They should be kept as named constants but at the file bottom with clear comments:

| Color | Use | Recommendation |
|---|---|---|
| `#C084FC` | Purple timeline accent | Keep as named constant |
| `#EBEBEF` / `#E2E2E7` | Hatching/placeholder pattern | Keep as named constant |
| Gradient strings | AI/Create button gradients | Keep — use `palette.brand.gradientMagentaBlue` if available, else keep as constant |

### 3G. Shadow Colors

All `rgba(3, 25, 79, ...)` shadow values should be eliminated by using MUI theme elevations. See Section 5.

---

## 4. Typography Mapping Reference

### 4A. Direct Variant Mappings

Replace inline `sx={{ fontFamily, fontSize, fontWeight }}` with `variant="..."` and optionally `color="..."`.

| Ad-hoc Pattern | Variant | Confidence | Notes |
|---|---|---|---|
| Open Sans 400 14px 1.5 | `body1` | Exact | Most common pattern (26+ uses) |
| Open Sans 500 14px 1.5 | `subtitle2` | Exact | Emphasized body text |
| Open Sans 300 14px 1.5 | `body2` | Exact | Light body text |
| Open Sans 400 12px (any lh) | `caption` | Exact | Small metadata, dates, emails |
| Open Sans 500 16px 1.5 | `subtitle1` | Exact | Panel titles, section headers |
| Open Sans 400 12px 1.5 letterSpacing:1px uppercase | `overline` | Exact | Category labels |
| Inter 500 14px | `button` | Exact | Button text, action links |
| Inter 600 28px 1.5 | `h1` | Exact | Page titles |
| Inter 500 24px 1.5 | `h2` | Exact | Section titles |
| Inter 600 16px 1.5 | `h4` | Exact | Card titles, emphasized labels |
| Inter 600 14px 1.5 | `h5` | Exact | Small bold headings |
| Inter 500 14px 1.5 | `h6` | Exact | Small medium headings |

### 4B. Close-Match Mappings (Minor Visual Delta)

| Ad-hoc Pattern | Best Variant | Visual Delta | Decision |
|---|---|---|---|
| Open Sans **600** 20px 1.5 (dialog titles) | `h3` | h3 is **Inter** 600 20px — font family changes from Open Sans to Inter | **Use `h3`.** The Truffle dialog title components already use the correct font. When migrating to `TruffleModalTitle`/`SimpleDialogBase`, this resolves automatically |
| Open Sans **700** 22px (panel headers) | `h2` | h2 is Inter 500 24px — both family and weight differ | **Use `h3`** (Inter 600 20px) for most cases. The 2px size difference is negligible |
| Open Sans 600 14px (card titles) | `h5` | h5 is **Inter** 600 14px — font family changes | **Use `h5`.** The font change is acceptable for design system compliance |
| Open Sans 500 14px (no lineHeight) | `subtitle2` | subtitle2 has lineHeight 1.5 — adds line-height | **Use `subtitle2`.** Added line-height is a minor improvement |
| Inter 600 13px (stepper labels) | `h5` | h5 is 14px — 1px larger | **Use `h5`** with `sx={{ fontSize: 13 }}` only if 1px matters for the layout. Otherwise use `h5` as-is |
| Open Sans 600 13px (sidebar labels) | `caption` | caption is 400 weight — loses bold | **Use `subtitle2`** (14px 500) or `caption` with `fontWeight: 600` override if the size must stay 13px |
| Open Sans 400 11px (small labels) | `caption` | caption is 12px — 1px larger | **Use `caption`.** The 1px difference is acceptable |
| Inter 700 11px (logo letters) | Keep custom | Brand logo — exempt from variant mapping | Keep as-is |

### 4C. Non-Standard Sizes (Keep Custom with Comment)

These are intentional design-specific sizes that don't map to any variant. They should remain as explicit sx values but move to named constants at the file bottom:

| Pattern | Context | Recommendation |
|---|---|---|
| Open Sans 700 10px | Avatar initials in chips | Keep — avatar/chip internal sizing |
| Open Sans 400 9px | Thumbnail placeholder text | Keep — thumbnail-specific |
| Open Sans 400 7px | Scene thumbnail tiny text | Keep — scene-specific |
| `9cqw`, `4cqw`, `3cqw`, `2.5cqw` | Container-query responsive text | Keep — responsive viewport sizes |
| serif 700 18px | Font picker preview | Keep — deliberate serif showcase |
| fontSize 9 (Badge) | Notification badge | Keep — micro-UI element |

### 4D. Typography Migration Quick Reference

**Before (violation):**
```tsx
<Typography sx={{
    fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
    fontSize: 14, lineHeight: 1.5, color: "#323338"
}}>
    Some body text
</Typography>
```

**After (compliant):**
```tsx
<Typography variant="body1" color="text.primary">
    Some body text
</Typography>
```

**Before (violation):**
```tsx
<Typography sx={{
    fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
    fontSize: 20, lineHeight: 1.5, color: ds.textPrimary
}}>
    Dialog Title
</Typography>
```

**After (compliant):**
```tsx
<Typography variant="h3" color="text.primary">
    Dialog Title
</Typography>
```

---

## 5. Box Shadow Mapping

### 5A. Shadows to Remove

MUI components (Dialog, Popover, Menu, Paper) have built-in elevation shadows from the theme. Remove all custom `boxShadow` values from their `PaperProps.sx`:

| Component | Current Custom Shadow | Action |
|---|---|---|
| `Dialog PaperProps` | `"0px 0px 10px 0px rgba(3,25,79,0.25)"` | **Remove** — Dialog has default elevation |
| `Popover PaperProps` | `"0px 0px 5px 0px rgba(3,25,79,0.25)"` | **Remove** — Popover has default elevation |
| `Menu PaperProps` | `"0px 4px 20px rgba(3,25,79,0.15)"` | **Remove** — Menu has default elevation |

### 5B. Shadows to Convert to Theme Elevations

For custom floating elements (cards, toolbars, panels):

| Current Shadow | Replacement | Notes |
|---|---|---|
| `"0px 6px 20px rgba(3,25,79,0.16)"` (card hover) | `theme.shadows[11]` or `elevation={11}` on Paper | Floating card hover |
| `"0px 4px 16px rgba(3,25,79,0.18)"` (toolbar) | `theme.shadows[8]` | Floating toolbar |
| `"0px 2px 8px rgba(3,25,79,0.14)"` (light hover) | `theme.shadows[4]` | Subtle hover |
| `"0px 0px 0px 1px rgba(0,83,229,0.08)"` (card rest) | `theme.shadows[2]` or `theme.shadows[3]` | Inset border (Truffle shadows[2] and [3] are inset primary borders) |

### 5C. How to Apply

```tsx
// Before:
<Box sx={{ boxShadow: "0px 6px 20px rgba(3,25,79,0.16)" }} />

// After (sx callback):
<Box sx={(theme) => ({ boxShadow: theme.shadows[11] })} />

// Or for hover transitions:
const cardSx: SxProps<Theme> = {
    boxShadow: 2, // rest state — thin inset border
    "&:hover": { boxShadow: 11 }, // hover — elevated
};
```

---

## 6. Component Replacement Reference

### 6A. Dialog Components

**Current pattern:** Raw `Dialog` + `DialogTitle` + `DialogContent` + `DialogActions` with custom title layout (flex, close icon button, help icon).

**Replace with:**

| Current | Library Component | When to Use |
|---|---|---|
| `DialogTitle` + `IconButton(Close)` + `IconButton(Help)` | `TruffleModalTitle` | Modal-style dialogs with close/help buttons |
| `DialogContent` with custom padding | `TruffleModalContent` | Content area of modals |
| `DialogActions` with custom layout | `TruffleModalActions` | Action buttons area |
| Simple confirm dialog (title + message + 2 buttons) | `SimpleDialogBase` | Confirmation/alert dialogs |

**Files affected:** `ApprovalDialog`, `ApproveVideoDialog`, `AddApproverDialog`, `CancelApprovalDialog`, `ConfirmationDialog`, `VideoPermissionDialog`, `ManageAccessDialog`, `AvatarPermissionDialog`, `StudioPage` (multiple inner dialogs)

**Example migration:**

```tsx
// BEFORE
<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
    PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0px 0px 10px rgba(3,25,79,0.25)" } }}>
    <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", ... }}>
        <Typography sx={{ fontFamily: ..., fontWeight: 600, fontSize: 20 }}>
            Title Here
        </Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent sx={{ px: "32px", ... }}>
        ...
    </DialogContent>
    <DialogActions sx={{ px: "32px", ... }}>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm}>Confirm</Button>
    </DialogActions>
</Dialog>

// AFTER
<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <TruffleModalTitle
        CloseIconButtonProps={{ onClick: onClose }}
    >
        Title Here
    </TruffleModalTitle>
    <TruffleModalContent>
        ...
    </TruffleModalContent>
    <TruffleModalActions>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm}>Confirm</Button>
    </TruffleModalActions>
</Dialog>
```

### 6B. Alert / Notice Boxes

**Current pattern:** `<Alert>` with custom `sx` overrides for `bgcolor`, `color`, icon color, and message font.

**Replace with:** `TruffleAlert` (for dismissible banners) or `AttentionBox` (for inline notices).

**Files affected:** `ApprovalDialog` (info alert), `StudioPage` (warning dialogs)

```tsx
// BEFORE
<Alert severity="info" sx={{
    bgcolor: "#EFF7FE", color: "#284862", borderRadius: 2,
    "& .MuiAlert-icon": { color: "#0176D7" },
    "& .MuiAlert-message": { fontFamily: "\"Open Sans\"", fontWeight: 400, fontSize: 14 }
}}>
    Approvers will be notified...
</Alert>

// AFTER
<AttentionBox color="info" icon={<InfoIcon />}>
    Approvers will be notified...
</AttentionBox>
```

### 6C. Status Labels / Chips

**Current pattern:** Custom `StatusLabel` component built with `<Box>` + `<Typography>` + manual bgcolor/color.

**Replace with:** `Label` component from the library.

**Files affected:** `VideoLibraryPage` (StatusLabel, PersonalizedChip)

```tsx
// BEFORE (custom StatusLabel)
<Box sx={{ display: "inline-flex", gap: "4px", bgcolor: cfg.bg, borderRadius: "4px", px: "6px", ... }}>
    <Typography sx={{ fontFamily: ..., fontSize: 12, color: cfg.color }}>
        {status}
    </Typography>
</Box>

// AFTER
<Label
    variant="filled"
    color={statusToLabelColor(status)} // map to "default" | "info" | "success" | "error" | "warning"
    size="small"
    startIcon={cfg.Icon ? <cfg.Icon /> : undefined}
    label={status}
/>
```

### 6D. Toggle Tabs

**Current pattern:** Custom Box-based toggle with click handlers, manual border, radius, and selected bg.

**Replace with:** `TruffleToggleButtonGroup` + `ToggleButton`.

**Files affected:** `NotificationsPanel` (All/Unread tabs), `StudioPage` (Unresolved/Completed tabs)

### 6E. Search Input

**Current pattern:** `<OutlinedInput>` with `<SearchIcon>` in `startAdornment`.

**Replace with:** `Search` component from the library.

**Files affected:** `VideoLibraryPage`, `App`

### 6F. Menu Items

**Current pattern:** `<MenuItem>` with custom icon box + `<ListItemText>` with `primaryTypographyProps` overrides.

**Replace with:** `TruffleMenuItem`.

**Files affected:** `VideoLibraryPage` (video card context menu), `App` (header menu)

### 6G. Truncated Text

**Current pattern:** `<Typography>` with `-webkit-box`, `WebkitLineClamp`, `overflow: hidden`.

**Replace with:** `TypographyWithTooltipOnOverflow`.

**Files affected:** `VideoLibraryPage` (card title), `App` (card title)

### 6H. Avatars

**Current pattern:** `<Avatar>` with custom width, height, bgcolor, fontSize.

**Replace with:** `TruffleAvatar` with `text` and `size` props.

**Files affected:** `AddApproverDialog`, `ManageAccessDialog`, `AvatarPermissionDialog`, `VideoPermissionDialog`, `AvatarLibraryPanel`

### 6I. Tooltip Styling

**Current pattern:** `componentsProps={{ tooltip: { sx: { bgcolor: "#03194F", borderRadius: "8px", ... } } }}` — repeated in nearly every file as `navyTooltipSx`.

**Replace with:** Default MUI `<Tooltip>` — the Truffle theme already overrides Tooltip to use the navy background. Remove all `componentsProps` tooltip style overrides.

**Files affected:** All files with `navyTipSx` or `navyTooltipSx` constants

### 6J. Notification Panel

**Current pattern:** Custom `<Popover>` with manual styling.

**Replace with:** `TrufflePopover` (if it needs to be draggable) or keep as `Popover` but remove all sx overrides (theme handles Paper styling).

**Files affected:** `NotificationsPanel`

### 6K. Buttons with Style Overrides

**Current pattern:** `<Button>` with custom `sx` for fontFamily, textTransform, fontWeight, fontSize, borderRadius.

**Replace with:** `<Button>` without any sx overrides — the Truffle theme already styles all Button variants correctly.

**Files affected:** `ApproveVideoDialog`, `CancelApprovalDialog`, `StudioPage`, `VideoPermissionDialog`, `AvatarPermissionDialog`, `ManageAccessDialog`

```tsx
// BEFORE
<Button variant="contained" color="primary" size="large" onClick={onConfirm}
    sx={{ fontFamily: '"Open Sans"', textTransform: "none", fontWeight: 600, fontSize: 15, borderRadius: "8px" }}>
    Approve
</Button>

// AFTER
<Button variant="contained" color="primary" size="large" onClick={onConfirm}>
    Approve
</Button>
```

### 6L. Icon Buttons

**Current pattern:** `<IconButton>` with custom `sx={{ color: ... }}`.

**Replace with:** `TruffleIconButton` where applicable (provides color variants like "white", "gradient"). For standard icon buttons, keep `<IconButton>` but use palette colors.

```tsx
// BEFORE
<IconButton size="small" sx={{ color: "rgba(0,0,0,0.56)" }}>

// AFTER
<IconButton size="small" color="default">
```

---

## 7. Structural Patterns to Apply

### 7A. Delete Token Constants

Every file has a block like:

```tsx
const ds = {
    textPrimary:  "#323338",
    textSecondary: "rgba(60, 60, 72, 0.8)",
    ...
};
```

**Delete all of these.** Replace every reference with the theme palette path (see Section 3).

### 7B. Move Inline SxProps to Named Constants

```tsx
// BEFORE (inline)
<Box sx={{ display: "flex", gap: 2, p: 3, bgcolor: "background.paper" }}>

// AFTER (named constant at file bottom)
<Box sx={containerSx}>

// ─── Styles ─────────────────────────────────────────────────────────
const containerSx: SxProps<Theme> = {
    display: "flex",
    gap: 2,
    p: 3,
    bgcolor: "background.paper",
};
```

### 7C. Use `combineSxProps` for Merging

```tsx
import { combineSxProps } from "@sundaysky/smartvideo-hub-truffle-component-library";

// When a component accepts an external sx prop:
<Box sx={combineSxProps(containerSx, props.sx)} />

// Guard optional sx:
<Box sx={props.sx ? combineSxProps(baseSx, props.sx) : baseSx} />
```

### 7D. Import `SxProps` and `Theme` Types

```tsx
import type { SxProps, Theme } from "@mui/material";
```

### 7E. Use `useTheme()` for Dynamic Values

When you need a palette color outside of `sx` (e.g., for icon `color` prop in a non-MUI context):

```tsx
import { useTheme } from "@mui/material";

const { palette } = useTheme();
// Then use: palette.primary.main, palette.text.secondary, etc.
```

### 7F. Use MUI Layout Components

Replace any remaining raw HTML elements:

```tsx
// BEFORE
<div style={{ display: "flex", gap: 8 }}>

// AFTER
<Stack direction="row" spacing={1}>
```

---

## 8. Per-File Migration Plans

### Violation Severity Legend

- **C** = Color violation (hardcoded hex/rgba)
- **T** = Typography violation (inline font specs)
- **S** = Shadow violation (hardcoded boxShadow)
- **R** = Component replacement available (library component exists)
- **X** = SxProps not at file bottom (structural)

---

### 8.1 `ApprovalDialog.tsx`

**Violations:** C(6) T(10) S(1) R(3) X

**Token block to delete:** `ds` (lines 14-24)

| Line(s) | Violation | Fix |
|---|---|---|
| 14-24 | `const ds = { ... }` hardcoded colors | Delete — replace refs with palette paths |
| 85 | `boxShadow: "0px 0px 10px..."` on Dialog | Remove — use default Dialog elevation |
| 84 | `borderRadius: 2` on Dialog Paper | Remove — theme handles Paper borderRadius |
| 90-106 | Custom DialogTitle layout with Typography sx | Replace with `TruffleModalTitle` + `CloseIconButtonProps` |
| 96-99 | Typography fontFamily/fontWeight/fontSize 20/600 | Dialog title text → handled by TruffleModalTitle |
| 109 | DialogContent custom padding | Replace with `TruffleModalContent` |
| 113-127 | Alert with custom sx overrides | Replace with `AttentionBox color="info"` |
| 133-136, 162-165 | Typography body text with inline fonts | `variant="body1" color="text.primary"` |
| 180-185 | Typography inside Select renderValue | `variant="body1" color="text.primary"` / `variant="body1" color="text.disabled"` |
| 193-194 | MenuItem with fontFamily/fontSize sx | Remove sx — theme handles MenuItem typography |
| 208-215 | Select with custom fontFamily | Remove — theme handles |
| 242-268 | DialogActions custom layout | Replace with `TruffleModalActions` |

**Component replacements:**
- `Dialog` title area → `TruffleModalTitle`
- `DialogContent` → `TruffleModalContent`
- `DialogActions` → `TruffleModalActions`
- `Alert` → `AttentionBox`

---

### 8.2 `ApproveVideoDialog.tsx`

**Violations:** C(2) T(4) S(1) R(2) X

| Line(s) | Violation | Fix |
|---|---|---|
| 22-24 | `borderRadius: "12px"`, `boxShadow` on Dialog | Remove both |
| 29-33 | Custom Typography for title (fontFamily, 700, 20px, `#323338`) | Use `TruffleModalTitle` instead of manual layout |
| 36-40 | IconButtons with hardcoded `rgba(0,0,0,0.56)` color | `color="default"` (theme handles) |
| 46-49 | Typography body (fontFamily, 400, 16px, `#323338`) | `variant="subtitle1" color="text.primary"` |
| 60-61, 71-72 | Button sx overrides (fontFamily, textTransform, fontWeight, fontSize) | Remove all sx — theme handles Button styling |

**Ideal:** Replace entire Dialog with `SimpleDialogBase` (it's a simple confirm dialog).

---

### 8.3 `AddApproverDialog.tsx`

**Violations:** C(9) T(14) S(1) R(3) X

**Token block to delete:** `ds` (lines 13-23)

| Key migrations |
|---|
| Delete `ds` token block |
| Replace Dialog title area with `TruffleModalTitle` |
| Replace all Typography with inline fonts → `variant` prop |
| Replace `Avatar` with custom sx → `TruffleAvatar` |
| Replace `Chip` with custom avatar + sx → remove sx overrides (theme handles Chip) |
| Replace custom divider `<Box sx={{ borderTop: ... }}>` → `<Divider />` |
| Remove all `fontFamily`/`fontSize` from MenuItem sx |

---

### 8.4 `CancelApprovalDialog.tsx`

**Violations:** C(1) T(5) S(1) R(1) X

**Token block to delete:** `ds` (line 7-9)

| Key migrations |
|---|
| Simple dialog — best candidate for `SimpleDialogBase` replacement |
| Delete `ds` token block, replace `ds.textPrimary` → `"text.primary"` |
| Remove Dialog PaperProps (borderRadius, boxShadow) |
| Title Typography → handled by SimpleDialogBase |
| Body Typography → `variant="body1" color="text.primary"` |
| Button sx overrides → remove (theme handles) |

---

### 8.5 `ConfirmationDialog.tsx`

**Violations:** C(1) T(3) S(1) R(2) X

**Token block to delete:** `ds` (lines 9-12)

| Key migrations |
|---|
| Delete `ds`, replace with palette paths |
| Remove Dialog PaperProps overrides |
| Replace title area with `TruffleModalTitle` |
| Body Typography → `variant="body1" color="text.primary"` |

---

### 8.6 `NotificationsPanel.tsx`

**Violations:** C(5) T(6) S(1) R(3) X

**Token block to delete:** `ns` (lines 8-16)

| Key migrations |
|---|
| Delete `ns` token block |
| Title Typography → `variant="subtitle1" color="text.primary"` |
| Custom toggle tabs → `TruffleToggleButtonGroup` |
| Notification text → `variant="caption"` / `variant="body1"` |
| Divider `borderColor: ns.dividerGrey` → remove (theme handles Divider) |
| `NotificationBell`: `sx={{ color: "rgba(255,255,255,0.7)" }}` → keep (dark context needs explicit white) |
| Popover PaperProps boxShadow → remove |
| Badge `sx` override → remove (theme handles Badge) |
| Custom 32px icon square → could use `TruffleAvatar` with custom content |

---

### 8.7 `WorkflowApprovalStepper.tsx`

**Violations:** C(9) T(3) S(0) R(0) X

**Token block to delete:** `ds` (lines 9-18)

| Key migrations |
|---|
| Delete `ds`, replace with palette paths |
| Tooltip `navyTooltipSx` → remove (theme handles) |
| `StepNode` circle colors → use palette paths in sx callback |
| Label Typography → `variant="caption"` with conditional `fontWeight` |
| Header Typography → `variant="h5"` or `variant="caption"` |
| `bgcolor: "#fff"` → `bgcolor: "background.paper"` |

---

### 8.8 `VideoLibraryPage.tsx` (LARGEST — ~900+ lines)

**Violations:** C(48) T(62) S(2) R(8+) X

**Token block to delete:** `t` (lines 54-77)

This is the most violation-dense file. Key migrations:

| Area | Violations | Fix |
|---|---|---|
| `StatusLabel` component | Custom Box+Typography | Replace with library `Label` |
| `PersonalizedChip` component | Custom Box+Typography | Replace with `Label variant="outlined"` |
| `ApprovalStatusIcon` tooltips | `navyTipSx` + hardcoded colors | Remove tooltip sx — theme handles |
| `VideoThumbnail` | Many hardcoded colors for placeholder | Keep design-specific colors as constants |
| `VideoCard` | Inline sx for hover, shadow, typography | Move to named SxProps constants; use theme shadows |
| Card title Typography | fontFamily+fontSize 14+fontWeight 600 | `TypographyWithTooltipOnOverflow variant="h5"` |
| Card subtitle Typography | fontFamily+fontSize 12 | `variant="caption"` |
| 3-dots menu items | MenuItem with custom ListItemText props | `TruffleMenuItem` |
| Search input | `OutlinedInput` with SearchIcon | `Search` component |
| Folder card | Custom Box+Typography | Keep structure, replace colors/fonts |
| `AppSidebar` | Navy sidebar with hardcoded colors | Replace with palette paths, keep gradient constants |
| `PermAvatarGroup` | Mini avatars with inline sx | Consider `TruffleAvatar size="extraSmall"` |

---

### 8.9 `StudioPage.tsx` (LARGEST — ~1100+ lines)

**Violations:** C(51) T(75) S(3) R(5+) X

**Token block to delete:** `s` (lines 244-258)

| Area | Violations | Fix |
|---|---|---|
| `PlaceholderToolbar` | Hardcoded colors, inline Typography | Move to constants, use palette paths |
| `EditHeadingDialog` | `#1A1A2E`, `#888`, `#0053E5` hardcoded | Replace with palette paths; use `TruffleModalTitle` |
| `NavSection` / `NavItem` | Inline Typography with fontFamily | Use `variant="overline"` / `variant="body1"` |
| `CommentsPanel` | Custom draggable panel with many inline styles | Move all sx to constants; use palette paths |
| Toggle tabs (Unresolved/Completed) | Custom Box-based toggle | `TruffleToggleButtonGroup` |
| `SceneThumbnail` | Design-specific colors in thumbnail | Keep as named constants |
| `UnresolvedWarningDialog` | Full custom dialog | Migrate to `SimpleDialogBase` or `TruffleModalTitle` pattern |
| Button sx overrides | fontFamily, textTransform, borderRadius | Remove — theme handles |
| All Divider borderColor overrides | `borderColor: "#E0E0E0"` | Remove — theme handles |

---

### 8.10 `MediaLibraryPanel.tsx`

**Violations:** C(32) T(54) S(5) R(3+) X

**Token block to delete:** `c` (local tokens)

| Key migrations |
|---|
| Delete all hardcoded token constants |
| All Typography → use variants |
| Dialog/Popover PaperProps → remove boxShadow, borderRadius |
| Tooltip sx overrides → remove |
| Custom folder/file cards → keep structure, fix colors |
| AI generate button gradient → keep as named constant |
| Tab typography overrides → remove (theme handles Tabs) |

---

### 8.11 `VideoPermissionDialog.tsx`

**Violations:** C(16) T(51) S(7) R(4+) X

**Token block to delete:** `c` (lines 44-55)

| Key migrations |
|---|
| Delete `c` token block + `navyTipSx` |
| Dialog PaperProps → remove all boxShadow/borderRadius |
| All Typography → use variants |
| `RoleButton` custom Button sx → remove overrides |
| Menu PaperProps → remove shadow |
| Custom autocomplete/chip styling → simplify (theme handles) |
| `VideoAccessBar` → fix all inline colors |
| ToggleButtonGroup → use `TruffleToggleButtonGroup` |

---

### 8.12 `ManageAccessDialog.tsx`

**Violations:** C(32) T(42) S(6) R(4+) X

**Token block to delete:** `c` (lines 44-54)

| Key migrations |
|---|
| Very similar to VideoPermissionDialog — same patterns |
| Delete `c` token block + `navyTooltipSx` |
| All Dialog/Menu/Popover PaperProps → remove |
| All Typography → use variants |
| `UserAvatar` → `TruffleAvatar` |
| Custom autocomplete chips → simplify |

---

### 8.13 `AvatarLibraryPanel.tsx`

**Violations:** C(29) T(35) S(4) R(3+) X

**Token block to delete:** `c` (lines 34-45)

| Key migrations |
|---|
| Delete `c` token block + `navyTooltipSx` |
| `AvatarChip` → `TruffleAvatar` or keep with palette colors |
| `AvatarCard` → fix all hardcoded colors, move sx to constants |
| All Typography → use variants |
| Badge sx → remove (theme handles) |
| Gradient `GRADIENT_BETA` → keep as named constant |

---

### 8.14 `AvatarPermissionDialog.tsx`

**Violations:** C(13) T(46) S(0) R(3+) X

**Token block to delete:** `c` (lines 50-61)

| Key migrations |
|---|
| Nearly identical structure to VideoPermissionDialog |
| Delete `c` token block + `navyTooltipSx` |
| All Typography → use variants |
| Autocomplete/Chip sx → simplify |
| `RoleButton` / `PersonRow` → fix inline fonts |

---

### 8.15 `App.tsx`

**Violations:** C(56) T(109) S(1) R(5+) X

**Token block to delete:** Multiple inline token constants

This is the largest file by violation count because it contains the main layout, header, sidebar, and orchestrates all pages. Key migrations:

| Area | Fix |
|---|
| Header bar | Replace inline Typography with variants; use palette paths |
| Sidebar nav | Fix hardcoded navy colors → `secondary.main` |
| Video overview panel | Replace StatusLabel pattern with `Label` |
| Search input | Replace with `Search` component |
| Menu items | Replace with `TruffleMenuItem` |
| Tooltip overrides | Remove — theme handles |
| Card titles | `TypographyWithTooltipOnOverflow` |
| All Typography | Map to variants per Section 4 |

---

## 9. theme.ts Deprecation

The file `src/theme.ts` creates a standalone `createTheme()` that is **never imported** by any component. The app uses `TruffleThemeProvider` from `main.tsx` instead.

**Action:** Delete `theme.ts` or rename it to `theme.reference.ts` and add a comment that it's for documentation only. It should not be imported as a theme provider.

---

## 10. Verification Checklist

After migrating each file, verify:

- [ ] **No hardcoded colors** — `grep -E '#[0-9a-fA-F]{3,8}|rgba?\(' <file>` returns zero matches (except data objects like user avatar colors)
- [ ] **No fontFamily in sx** — `grep 'fontFamily' <file>` returns zero matches
- [ ] **No fontSize in sx** — `grep 'fontSize' <file>` returns zero matches (except intentional non-standard sizes like container-query units)
- [ ] **No fontWeight in sx** — `grep 'fontWeight' <file>` returns zero matches (except intentional overrides with comment)
- [ ] **No boxShadow on Dialog/Popover/Menu** — PaperProps.sx should not contain `boxShadow`
- [ ] **All Typography uses variant** — every `<Typography>` has a `variant` prop
- [ ] **SxProps at file bottom** — all sx objects are named constants of type `SxProps<Theme>` at the bottom
- [ ] **Library components used** — Label, TruffleModalTitle, AttentionBox, Search, TruffleMenuItem etc. replace ad-hoc equivalents
- [ ] **Visual parity** — component looks the same as before (spot-check in dev server)
- [ ] **TypeScript compiles** — `npm run build` passes

---

## Summary Statistics

| Metric | Count |
|---|---|
| Files to migrate | 15 |
| Hardcoded `fontFamily` declarations | 345 |
| Hardcoded hex colors | 315 |
| Hardcoded `fontSize` declarations | 531 |
| Hardcoded `boxShadow` values | ~40 |
| Token constant blocks to delete (`ds`/`s`/`c`/`t`/`ns`) | 15 |
| Library components to adopt | 12+ (Label, TruffleModalTitle, AttentionBox, Search, TruffleMenuItem, TruffleAvatar, TypographyWithTooltipOnOverflow, TruffleToggleButtonGroup, SimpleDialogBase, TruffleAlert, TrufflePopover, combineSxProps) |

### Recommended Migration Order (least to most complex)

1. `CancelApprovalDialog.tsx` — 5 typography, 1 color, 1 shadow → SimpleDialogBase
2. `ConfirmationDialog.tsx` — 3 typography, 1 color, 1 shadow
3. `ApproveVideoDialog.tsx` — 4 typography, 2 colors, 1 shadow → SimpleDialogBase
4. `WorkflowApprovalStepper.tsx` — 3 typography, 9 colors, no shadows
5. `NotificationsPanel.tsx` — 6 typography, 5 colors, 1 shadow
6. `ApprovalDialog.tsx` — 10 typography, 6 colors, 1 shadow
7. `AddApproverDialog.tsx` — 14 typography, 9 colors, 1 shadow
8. `AvatarPermissionDialog.tsx` — 46 fontSize, 13 colors
9. `VideoPermissionDialog.tsx` — 51 fontSize, 16 colors, 7 shadows
10. `ManageAccessDialog.tsx` — 42 fontSize, 32 colors, 6 shadows
11. `MediaLibraryPanel.tsx` — 54 fontSize, 32 colors, 5 shadows
12. `AvatarLibraryPanel.tsx` — 35 fontSize, 29 colors, 4 shadows
13. `StudioPage.tsx` — 75 fontSize, 51 colors, 3 shadows
14. `VideoLibraryPage.tsx` — 62 fontSize, 48 colors, 2 shadows
15. `App.tsx` — 109 fontSize, 56 colors, 1 shadow (largest file)
