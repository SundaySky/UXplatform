# Truffle Component Library - AI Reference Guide

> **Audience**: AI assistants generating UI code that consumes `@sundaysky/smartvideo-hub-truffle-component-library`.
> Read this file in full before writing any UI code. It is the authoritative reference for available components, theme tokens, and usage patterns.

---

## Quick Start

```tsx
// The app root must be wrapped with TruffleThemeProvider
import { TruffleThemeProvider } from "@sundaysky/smartvideo-hub-truffle-component-library";

<TruffleThemeProvider>
  <App />
</TruffleThemeProvider>
```

All MUI components rendered inside `TruffleThemeProvider` automatically receive the Truffle theme (palette, typography, shadows, component overrides). You do **not** need to create or pass a separate theme.

---

## Theme System

### Color Palette

**Rule: NEVER hardcode colors. Always use `theme.palette.*` via the `sx` prop or `useTheme()`.**

| Token | Value | When to use |
|---|---|---|
| `primary.main` | `rgb(0, 83, 229)` | Primary actions, links, selected states |
| `primary.light` | `rgb(244, 247, 255)` | Light backgrounds, hover tints |
| `primary.dark` | `rgb(3, 25, 79)` | Emphasis on primary elements |
| `primary.contrastText` | `#FFFFFF` | Text on primary-colored backgrounds |
| `secondary.main` | `rgb(3, 25, 79)` | Secondary actions, dark navy |
| `secondary.light` | `#7F8CED` | Light secondary accents |
| `error.main` | `rgb(230, 40, 67)` | Errors, destructive actions |
| `error.light` | `rgb(255, 229, 233)` | Error backgrounds |
| `warning.main` | `rgb(244, 105, 0)` | Warnings |
| `warning.light` | `rgb(255, 245, 206)` | Warning backgrounds |
| `success.main` | `rgb(17, 135, 71)` | Success states |
| `success.light` | `rgb(229, 247, 224)` | Success backgrounds |
| `info.main` | `rgb(1, 118, 215)` | Informational states |
| `info.light` | `rgb(230, 243, 255)` | Info backgrounds |
| `text.primary` | `rgb(50, 51, 56)` | Main body text |
| `text.secondary` | `rgb(60, 60, 72)` | Secondary/supporting text |
| `text.disabled` | `rgba(50, 51, 56, 0.5)` | Disabled text |
| `action.active` | `rgb(50, 51, 56)` | Active icons |
| `action.hover` | `rgba(0, 83, 229, 0.06)` | Hover background |
| `action.selected` | `rgba(0, 83, 229, 0.1)` | Selected background |
| `action.disabled` | `rgba(0, 0, 0, 0.38)` | Disabled icons/actions |
| `action.disabledBackground` | `#CECFD2` | Disabled button bg |
| `divider` | `rgba(0, 83, 229, 0.12)` | Dividers, borders |
| `background.paper` | `#FFFFFF` | Card/surface backgrounds |
| `background.default` | `#FFFFFF` | Page background |
| `other.editorBackground` | `#F4F7FF` | Editor/canvas background |
| `common.white` | `#FFFFFF` | Explicit white |
| `common.black` | `#000000` | Explicit black |

**Grey scale**: `grey[50]` (#FAFAFA), `grey[100]` (#F5F5F5), `grey[200]` (#F7F7F7), `grey[300]` (#CFD6EA), `grey[400]` (#CECFD2), `grey[500]` (#94979C), `grey[600]` (#85888E), `grey[700]` (#616161), `grey[800]` (#424242), `grey[900]` (#212121)

**Custom palette extensions**:
- `palette.gradient` - Theme-aware gradient color (same values as primary)
- `palette.neutral` - For neutral notifications
- `palette.white` - Pure white with dark contrast text
- `palette.brand.gradientBlackBlue` - CSS gradient stops for blue-to-navy gradient
- `palette.brand.gradientMagentaBlue` - CSS gradient stops for magenta-to-blue
- `palette.brand.gradientMagentaOrange` - CSS gradient stops for magenta-to-orange

### Typography

**Rule: NEVER set custom font sizes, weights, or font families. Always use MUI Typography variants.**

| Variant | Font | Size | Weight | Use for |
|---|---|---|---|---|
| `h1` | Inter | 28px | 600 | Page titles |
| `h2` | Inter | 24px | 500 | Section titles |
| `h3` | Inter | 20px | 600 | Subsection titles |
| `h4` | Inter | 16px | 600 | Card titles, emphasized labels |
| `h5` | Inter | 14px | 600 | Small bold headings |
| `h6` | Inter | 14px | 500 | Small medium headings |
| `subtitle1` | Open Sans | 16px | 500 | Large emphasized body |
| `subtitle2` | Open Sans | 14px | 500 | Emphasized body text |
| `body1` | Open Sans | 14px | 400 | Default body text |
| `body2` | Open Sans | 14px | 300 | Light body text |
| `caption` | Open Sans | 12px | 400 | Small labels, metadata |
| `overline` | Open Sans | 12px | 400 | Category labels (capitalized) |
| `label` | Open Sans | 10.5px | 400 | Form field labels (custom) |
| `input` | Open Sans | 14px | 400 | Input field text (custom) |
| `inputLabel` | Open Sans | 12px | 400 | Input labels (custom) |
| `tooltip` | Open Sans | 12px | 400 | Tooltip text (custom) |
| `helper` | Open Sans | 12px | 400 | Helper/hint text (custom) |

All variants use `line-height: 150%` (headings and body) or specific values for custom variants.

```tsx
// Correct
<Typography variant="h4">Title</Typography>
<Typography variant="body1">Description</Typography>
<Typography variant="caption" color="text.secondary">Metadata</Typography>

// WRONG - never do this
<Typography sx={{ fontSize: 16, fontWeight: 600 }}>Title</Typography>
<span style={{ fontSize: "14px" }}>Description</span>
```

### Shape

- **Base border radius**: `8px` (all MUI components inherit this)

### Shadows

The theme defines 25 shadow levels (MUI standard). Notable custom shadows:
- `shadows[2]`, `shadows[3]`: Inset borders using primary color at 0.12 opacity
- `shadows[11]`: Elevated "lifted" shadow for floating elements
- `shadows[25]`: Bottom inset border

---

## MUI Component Overrides

The theme includes pre-configured overrides for 40+ MUI components. These overrides are applied automatically through `TruffleThemeProvider`. **Do not re-implement these overrides inline.**

Customized MUI components:
`Alert`, `AppBar`, `Autocomplete`, `Avatar`, `Badge`, `Button`, `Checkbox`, `Chip`, `CircularProgress`, `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Divider`, `FormControlLabel`, `FormGroup`, `FormHelperText`, `FormLabel`, `IconButton`, `Input`, `InputBase`, `InputLabel`, `LinearProgress`, `Link`, `ListItem`, `ListItemAvatar`, `ListItemButton`, `ListItemIcon`, `ListItemText`, `ListSubheader`, `Menu`, `MenuItem`, `OutlinedInput`, `Radio`, `Select`, `Skeleton`, `Snackbar`, `SvgIcon`, `Switch`, `Tab`, `Table`, `TableCell`, `TableRow`, `Tabs`, `TextField`, `ToggleButton`, `ToggleButtonGroup`, `Toolbar`, `Tooltip`

**Key implication**: When you use `<Button>`, `<TextField>`, `<Dialog>`, etc. from MUI, they already look correct. Do not add styling to "fix" them.

---

## Custom Components

All components below are imported from `@sundaysky/smartvideo-hub-truffle-component-library`.

### TruffleThemeProvider

Wraps the app to provide the Truffle MUI theme and gradient SVG definitions. **Must be at the root of the component tree.**

```tsx
import { TruffleThemeProvider } from "@sundaysky/smartvideo-hub-truffle-component-library";
```

---

### TypographyWithTooltipOnOverflow

Typography component that automatically shows a tooltip when text is truncated/overflowed. Use this instead of manually combining `Typography` + `Tooltip` + `noWrap`.

```tsx
import { TypographyWithTooltipOnOverflow } from "@sundaysky/smartvideo-hub-truffle-component-library";

// Single-line with auto tooltip on overflow
<TypographyWithTooltipOnOverflow variant="body1">
  This text shows a tooltip if it overflows its container
</TypographyWithTooltipOnOverflow>

// Multiline with vertical overflow detection
<TypographyWithTooltipOnOverflow variant="body1" multiline>
  Long content that may overflow vertically
</TypographyWithTooltipOnOverflow>
```

| Prop | Type | Notes |
|---|---|---|
| All `TypographyProps` | - | Standard MUI Typography props |
| `multiline` | `boolean` | Detect vertical overflow instead of horizontal |
| `TooltipProps` | `Partial<TooltipProps>` | Customize the tooltip |

**When to use**: Any time you display text that might be truncated (lists, table cells, labels, sidebar items).

---

### AttentionBox

Colored alert/notice container for contextual messages (info, warning, error, success).

```tsx
import { AttentionBox } from "@sundaysky/smartvideo-hub-truffle-component-library";

<AttentionBox color="info" icon={<InfoIcon />}>
  <Typography variant="body1">Important information here</Typography>
</AttentionBox>

<AttentionBox
  color="warning"
  CloseIconButtonProps={{ onClick: handleClose }}
  HelpCenterIconButtonProps={{ onClick: handleHelp }}
>
  <Typography variant="body1">Warning with actions</Typography>
</AttentionBox>

// Structured layout with sub-components:
<AttentionBox color="info" icon={<InfoIcon />}>
  <AttentionBoxTitle>Important</AttentionBoxTitle>
  <AttentionBoxContent>Detailed explanation here.</AttentionBoxContent>
  <AttentionBoxActions>
    <Button size="small">Learn more</Button>
  </AttentionBoxActions>
</AttentionBox>
```

| Prop | Type | Notes |
|---|---|---|
| `color` | `"default" \| "primary" \| "info" \| "success" \| "error" \| "warning"` | Background tint |
| `icon` | `ReactNode` | Leading icon |
| `CloseIconButtonProps` | `IconButtonProps` | Close button (top-right) |
| `HelpCenterIconButtonProps` | `IconButtonProps` | Help button |
| All `BoxProps` | - | Container props |

The library also exports compositional sub-components for structured layouts:
- `AttentionBoxTitle` — Bold title text
- `AttentionBoxContent` — Body content area
- `AttentionBoxActions` — Action buttons area

**When to use**: Inline notices, validation summaries, contextual help boxes.

---

### TruffleAvatar

Avatar with standardized sizes and content variants. Uses a discriminated union — pass exactly one of `icon`, `text`, or `image`.

```tsx
import { TruffleAvatar } from "@sundaysky/smartvideo-hub-truffle-component-library";

<TruffleAvatar icon={<PersonIcon />} size="medium" />
<TruffleAvatar text="JD" size="small" />
<TruffleAvatar image="https://example.com/photo.jpg" size="large" />
```

| Prop | Type | Notes |
|---|---|---|
| `size` | `"small" (24px) \| "medium" (32px) \| "large" (40px)` | Avatar dimensions |
| `icon` | `JSX.Element` | Icon variant |
| `text` | `string \| JSX.Element` | Text/initials variant |
| `image` | `string` | Image URL variant |

---

### TruffleIconButton

Enhanced MUI IconButton with visual variants.

```tsx
import { TruffleIconButton } from "@sundaysky/smartvideo-hub-truffle-component-library";

<TruffleIconButton variant="icon"><CloseIcon /></TruffleIconButton>
<TruffleIconButton variant="outlined"><EditIcon /></TruffleIconButton>
<TruffleIconButton variant="contained" color="primary"><AddIcon /></TruffleIconButton>
```

| Prop | Type | Notes |
|---|---|---|
| `variant` | `"icon" \| "outlined" \| "contained"` | Visual style |
| All `IconButtonProps` | - | Standard MUI IconButton props |

- `icon`: Default transparent background
- `outlined`: 1px grey border
- `contained`: Solid background with color-aware hover

**Note on `color="white"` and `color="gradient"`:** These extended color values are defined via MUI module augmentation inside the library. If TypeScript complains about them, add a local augmentation:

```tsx
// types/mui-overrides.d.ts
declare module "@mui/material/IconButton" {
  interface IconButtonPropsColorOverrides {
    white: true;
    gradient: true;
  }
}
```

---

### ToggleIconButton

Icon-based toggle button with color and size variants. Use inside `TruffleToggleButtonGroup` or standalone.

```tsx
import { ToggleIconButton } from "@sundaysky/smartvideo-hub-truffle-component-library";

<ToggleIconButton value="bold" icon={<BoldIcon />} />
<ToggleIconButton value="align" icon={<AlignIcon />} color="primary" size="small" />
```

| Prop | Type | Notes |
|---|---|---|
| `icon` | `ReactNode` | The icon to display |
| `color` | `"primary" \| "secondary" \| "error" \| "info" \| "success" \| "warning" \| "white" \| "gradient"` | Color variant |
| `size` | `"small" (24px) \| "medium" (32px) \| "large" (40px)` | Button dimensions |
| All `ToggleButtonProps` | - | Standard MUI ToggleButton props |

---

### TruffleToggleButtonGroup

Styled ToggleButtonGroup that auto-inserts dividers between children.

```tsx
import { TruffleToggleButtonGroup, ToggleIconButton } from "@sundaysky/smartvideo-hub-truffle-component-library";

<TruffleToggleButtonGroup value={alignment} exclusive onChange={handleChange} variant="outlined">
  <ToggleIconButton value="left" icon={<AlignLeftIcon />} />
  <ToggleIconButton value="center" icon={<AlignCenterIcon />} />
  <ToggleIconButton value="right" icon={<AlignRightIcon />} />
</TruffleToggleButtonGroup>
```

| Prop | Type | Notes |
|---|---|---|
| `variant` | `"outlined" \| "icon"` | Visual grouping style |
| All `ToggleButtonGroupProps` | - | Standard MUI props |

---

### Label

Badge/chip-like label with status colors, gradient support, and built-in overflow tooltip.

```tsx
import { Label } from "@sundaysky/smartvideo-hub-truffle-component-library";

<Label label="Draft" color="default" />
<Label label="Published" color="success" variant="outlined" />
<Label label="AI Generated" color="gradient" startIcon={<SparkleIcon />} />
<Label label="Error" color="error" size="small" />
```

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | Label text |
| `color` | `"default" \| "warning" \| "info" \| "success" \| "error" \| "gradient"` | Color variant |
| `variant` | `"standard" \| "outlined"` | Filled or outlined |
| `size` | `"small" \| "medium"` | Height variant |
| `startIcon` | `ReactNode` | Icon before text |
| `multiline` | `boolean` | Allow text wrapping |
| `TypographyProps` | `TypographyWithTooltipOnOverflowProps` | Customize inner text |
| All `BoxProps` | - | Container props |

---

### TruffleMenuItem

Enhanced MUI MenuItem with error state, alignment, and secondary actions. Shows a checkmark when `selected`.

```tsx
import { TruffleMenuItem } from "@sundaysky/smartvideo-hub-truffle-component-library";

<TruffleMenuItem selected={isActive}>Option A</TruffleMenuItem>
<TruffleMenuItem error>Delete this item</TruffleMenuItem>
<TruffleMenuItem secondaryAction={<Chip label="New" size="small" />}>
  Feature X
</TruffleMenuItem>
```

| Prop | Type | Notes |
|---|---|---|
| `error` | `boolean` | Red text/background for destructive actions |
| `alignItems` | `"flex-start" \| "center"` | Content alignment |
| `secondaryAction` | `ReactNode` | Right-aligned secondary element |
| All `MenuItemProps` | - | Standard MUI MenuItem props |

---

### TruffleMenuPanel

Styled panel for sidebar menus and navigation lists.

```tsx
import { TruffleMenuPanel } from "@sundaysky/smartvideo-hub-truffle-component-library";

<TruffleMenuPanel variant="filled">
  <List>
    <ListItemButton selected>Dashboard</ListItemButton>
    <ListItemButton>Settings</ListItemButton>
  </List>
</TruffleMenuPanel>
```

| Prop | Type | Notes |
|---|---|---|
| `variant` | `"filled" \| "outlined"` | `filled` = grey background; `outlined` = white with right border |
| All `BoxProps` | - | Container props |

---

### Search

Search input with result count and clear button.

```tsx
import { Search } from "@sundaysky/smartvideo-hub-truffle-component-library";

<Search
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery("")}
  numberOfResults={results.length}
  placeholder="Search videos..."
/>
```

| Prop | Type | Notes |
|---|---|---|
| `onClear` | `MouseEventHandler` | Clear button handler |
| `numberOfResults` | `number` **(required)** | Shown as count badge; pass `0` when no search is active |
| All `OutlinedInputProps` | - | Standard MUI OutlinedInput props |

---

### Filter

Button + popover filter pattern. The button shows the selected value or placeholder, with a clear action.

```tsx
import { Filter } from "@sundaysky/smartvideo-hub-truffle-component-library";

<Filter
  placeholderValue="Status"
  selectedValue={selectedStatus}
  onClear={() => setSelectedStatus(null)}
  popoverTitle="Filter by status"
  anchorEl={anchorEl}
  setAnchorEl={setAnchorEl}
>
  {/* Popover content — e.g. list of selectable options */}
  <List>
    <ListItemButton onClick={() => setSelectedStatus("Active")}>Active</ListItemButton>
    <ListItemButton onClick={() => setSelectedStatus("Draft")}>Draft</ListItemButton>
  </List>
</Filter>
```

| Prop | Type | Notes |
|---|---|---|
| `placeholderValue` | `string \| JSX.Element` | Text when nothing selected |
| `selectedValue` | `string \| JSX.Element \| null` | Currently selected filter |
| `onClear` | `() => void` | Reset handler |
| `popoverTitle` | `string` | Title shown in popover |
| `anchorEl` | `HTMLElement \| null` | Popover anchor |
| `setAnchorEl` | `(el: HTMLElement \| null) => void` | Popover toggle |

---

### EnhancedTextField

TextField with optional character limit counter and warning state.

```tsx
import { EnhancedTextField } from "@sundaysky/smartvideo-hub-truffle-component-library";

<EnhancedTextField
  label="Video title"
  limitCharacters={100}
  warning={title.length > 80}
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>
```

| Prop | Type | Notes |
|---|---|---|
| `limitCharacters` | `number` | Max characters; shows counter |
| `warning` | `boolean` | Warning border/helper color |
| All `TextFieldProps` | - | Standard MUI TextField props |

---

### TruffleAlert

MUI Alert with optional close and help action buttons.

```tsx
import { TruffleAlert } from "@sundaysky/smartvideo-hub-truffle-component-library";

<TruffleAlert severity="info" CloseIconButtonProps={{ onClick: handleDismiss }}>
  Your changes have been saved.
</TruffleAlert>
```

| Prop | Type | Notes |
|---|---|---|
| `CloseIconButtonProps` | `IconButtonProps` | Close button |
| `HelpCenterIconButtonProps` | `IconButtonProps` | Help button |
| All `AlertProps` | - | Standard MUI Alert props |

---

### TruffleAccordion

Styled MUI Accordion with optional divider control.

```tsx
import { TruffleAccordion } from "@sundaysky/smartvideo-hub-truffle-component-library";

<TruffleAccordion divider={false}>
  <AccordionSummary>Settings</AccordionSummary>
  <AccordionDetails>Content here</AccordionDetails>
</TruffleAccordion>
```

| Prop | Type | Notes |
|---|---|---|
| `divider` | `boolean` | Show/hide divider line before accordion |
| All `AccordionProps` | - | Standard MUI Accordion props |

The library also exports **`TruffleAccordionSummary`** and **`TruffleAccordionDetails`** with additional styling props:

- `TruffleAccordionSummary`: adds `padding`, `summarySxProps`, `icon`, `text` props for consistent header layout
- `TruffleAccordionDetails`: adds `padding` prop (`"xs"` | `"small"` | `"medium"` | `"large"`) for standardized content spacing

Prefer these over raw MUI `AccordionSummary` / `AccordionDetails` when using `TruffleAccordion`.

---

### TrufflePopover

Draggable MUI Popover with variant styles.

```tsx
import { TrufflePopover } from "@sundaysky/smartvideo-hub-truffle-component-library";

<TrufflePopover
  open={open}
  anchorEl={anchorEl}
  onClose={handleClose}
  variant="standard"
>
  <Box sx={{ p: 2 }}>Popover content</Box>
</TrufflePopover>
```

| Prop | Type | Notes |
|---|---|---|
| `variant` | `"standard" \| "pill"` | `standard` = 8px padding; `pill` = 4px padding, rounded |
| `onClose` | Required | Must be provided |
| All `PopoverProps` | - | Standard MUI Popover props |

---

### TruffleLink

MUI Link with optional start/end icons.

```tsx
import { TruffleLink } from "@sundaysky/smartvideo-hub-truffle-component-library";

<TruffleLink href="#" startIcon={<LaunchIcon />}>View documentation</TruffleLink>
```

| Prop | Type | Notes |
|---|---|---|
| `startIcon` | `ReactElement` | Icon before text |
| `endIcon` | `ReactElement` | Icon after text |
| All `LinkProps` | - | Standard MUI Link props |

---

### ThumbnailActions

Thumbnail card with selectable state, hover overlays, and loading skeleton. Use for grid/list views of visual items (templates, videos, layouts).

```tsx
import { ThumbnailActions } from "@sundaysky/smartvideo-hub-truffle-component-library";

<ThumbnailActions
  sx={{ width: 180 }}
  ContentProps={{ sx: { height: 110 } }}
  selected={isSelected}
  disabled={!isEnabled}
  showActions="onHover"
  rightActions={<IconButton><DeleteIcon /></IconButton>}
  label={<Typography variant="h6">Template A</Typography>}
  onClick={handleClick}
>
  <img src={thumbnailUrl} alt="thumbnail" />
</ThumbnailActions>
```

| Prop | Type | Notes |
|---|---|---|
| `selected` | `boolean` | 2px primary color ring |
| `disabled` | `boolean` | 0.5 opacity, hides actions |
| `loading` | `boolean` | Skeleton overlay |
| `showActions` | `"onHover" \| "always"` | Action visibility mode |
| `rightActions` | `ReactNode` | Top-right overlay |
| `leftActions` | `ReactNode` | Top-left overlay |
| `label` | `ReactNode` | Below thumbnail |
| `lowerAdornment` | `ReactNode` | Icon/element beside label |
| `ContentProps` | `BoxProps` | Inner content box — set height/width here |
| All `BoxProps` | - | Container props |

**Note**: When wrapping in `Tooltip` while disabled, add a `<Box>` between Tooltip and ThumbnailActions (Tooltip needs pointer-events).

---

### Modal Parts: TruffleModalTitle / TruffleModalContent / TruffleModalActions

Structured parts for building modal/popover layouts. Use together inside Dialog or TrufflePopover.

```tsx
import {
  TruffleModalTitle,
  TruffleModalContent,
  TruffleModalActions
} from "@sundaysky/smartvideo-hub-truffle-component-library";

<Dialog open={open} onClose={handleClose}>
  <TruffleModalTitle
    CloseIconButtonProps={{ onClick: handleClose }}
    LabelProps={{ label: "Beta", color: "info" }}
  >
    <Typography variant="h4">Edit Settings</Typography>
  </TruffleModalTitle>
  <TruffleModalContent>
    {/* form content */}
  </TruffleModalContent>
  <TruffleModalActions>
    <Button variant="outlined" onClick={handleClose}>Cancel</Button>
    <Button variant="contained" onClick={handleSave}>Save</Button>
  </TruffleModalActions>
</Dialog>
```

**TruffleModalTitle props**:
| Prop | Type | Notes |
|---|---|---|
| `children` | `ReactNode` | Title content (typically `<Typography variant="h4">`) |
| `startIcon` | `ReactNode` | Icon before title |
| `InformationTooltipProps` | `TooltipProps` | Info (i) icon with tooltip |
| `LabelProps` | `LabelProps` | Status label badge |
| `headerAction` | `ReactNode` | Extra action element |
| `HelpCenterIconButtonProps` | `IconButtonProps` | Help button |
| `CloseIconButtonProps` | `IconButtonProps` | Close button |

**TruffleModalContent**: Styled `Box` — no special props beyond `BoxProps`. Common pattern is to place form fields (EnhancedTextField, Select, Autocomplete) inside with Stack layout:

```tsx
<TruffleModalContent>
  <Stack spacing={2}>
    <EnhancedTextField label="Title" limitCharacters={100} />
    <FormControl fullWidth>
      <InputLabel>Category</InputLabel>
      <Select label="Category">
        <MenuItem value="a">Option A</MenuItem>
      </Select>
    </FormControl>
  </Stack>
</TruffleModalContent>
```

**TruffleModalActions**: Flex row, right-aligned, 8px gap. Props: `BoxProps`.

---

### Dialog Exports: TruffleDialogTitle / TruffleDialogActions

Pre-styled MUI DialogTitle and DialogActions for standard dialogs. Exported separately.

```tsx
import {
  TruffleDialogTitle,
  TruffleDialogActions
} from "@sundaysky/smartvideo-hub-truffle-component-library";
```

---

### FullScreenDialogTitle / FullScreenDialogTransition

Components for full-screen dialog patterns.

```tsx
import {
  FullScreenDialogTitle,
  FullScreenDialogTransition
} from "@sundaysky/smartvideo-hub-truffle-component-library";

<Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={FullScreenDialogTransition}>
  <FullScreenDialogTitle
    CloseIconButtonProps={{ onClick: handleClose }}
    actions={<Button variant="outlined">Share</Button>}
  >
    <Typography variant="h4">Video Preview</Typography>
  </FullScreenDialogTitle>
  <DialogContent>
    {/* content */}
  </DialogContent>
</Dialog>
```

**FullScreenDialogTitle** renders an AppBar with Divider. Props:
| Prop | Type | Notes |
|---|---|---|
| `children` | `ReactNode` | Title content (typically `<Typography variant="h4">`) |
| `CloseIconButtonProps` | `IconButtonProps` | Close button (built-in icon) |
| `HelpCenterIconButtonProps` | `IconButtonProps` | Help button |
| `actions` | `ReactNode` | Right-aligned action buttons |
| `additionalActions` | `ReactNode` | Extra action elements |
| `startIcon` | `ReactNode` | Icon before title |

**FullScreenDialogTransition**: A `Slide` transition (direction "up") for Dialog's `TransitionComponent` prop.

---

### SimpleDialogBase

Base dialog with title, content area, and two action buttons. Use for confirmation/input dialogs.

```tsx
import { SimpleDialogBase } from "@sundaysky/smartvideo-hub-truffle-component-library";

<SimpleDialogBase
  open={open}
  onClose={handleClose}
  dialogTitle="Confirm deletion"
  primaryActionButtonText="Delete"
  secondaryActionButtonText="Cancel"
  PrimaryActionButtonProps={{ onClick: handleDelete, color: "error" }}
  SecondaryActionButtonProps={{ onClick: handleClose }}
>
  <Typography>Are you sure you want to delete this item?</Typography>
</SimpleDialogBase>
```

---

### DraggableConfirmationDialog

Dialog that can be dragged and supports shake animation for attention.

**Note:** The export name is `DraggableConfirmationDialog` (not "Configuration").

```tsx
import { DraggableConfirmationDialog } from "@sundaysky/smartvideo-hub-truffle-component-library";

<DraggableConfirmationDialog
  open={open}
  title="Configuration"
  isDraggable
  isShakeable={hasUnsavedChanges}
  inEditorStyling={false}
  closeIconButton={{ show: true }}
  infoIconButton={{ show: true, onClick: handleInfoClick }}
>
  {/* dialog content */}
</DraggableConfirmationDialog>
```

| Prop | Type | Notes |
|---|---|---|
| `title` | `string \| JSX.Element` | Dialog title |
| `isDraggable` | `boolean` | Enable dragging |
| `isShakeable` | `boolean` | Shake animation on trigger |
| `closeIconButton` | `{ show: boolean; dataTestId?: string; dataTrackingId?: string }` | Close button config |
| `infoIconButton` | `{ show: boolean; onClick: MouseEventHandler; dataTestId?: string; dataTrackingId?: string }` | Info button config (`onClick` required) |
| `inEditorStyling` | `boolean` **(required)** | Editor-specific style |

---

### ColorPicker / ColorButton / ColorIcon

Full color picker system with saturation/hue/alpha controls, predefined colors, and eye dropper.

```tsx
import { ColorPicker, ColorButton, ColorIcon } from "@sundaysky/smartvideo-hub-truffle-component-library";

// ColorPicker - full picker in a draggable popover
<ColorPicker
  value={{ color: "#0053E5" }}
  anchorEl={anchorEl}
  onColorChange={(color) => handleColorChange(color.hex)}
  onClose={handleClose}
  predefinedColors={{ title: "Brand Colors", colors: [...] }}
  enableTransparency
  enableNoFill
/>

// ColorButton - circular color swatch button (30px)
<ColorButton color="#0053E5" selected={isSelected} onClick={handleClick} />

// ColorIcon - text/bg color icon that opens ColorPicker
<ColorIcon variant="textColor" color="#323338" onClick={handleOpen} />
```

---

### Dropzone / UploadFile / FileUploaded

File upload component trio.

```tsx
import { Dropzone, UploadFile, FileUploaded } from "@sundaysky/smartvideo-hub-truffle-component-library";

// Dropzone - drag and drop area
<Dropzone active={isDragOver} error={hasError} loading={isUploading}>
  <UploadFile
    primaryText="Drag & drop your file here"
    secondaryText="or"
    actions={<Button variant="outlined">Browse files</Button>}
  />
</Dropzone>

// FileUploaded - show uploaded file
<FileUploaded
  primaryText="video.mp4"
  secondaryText="12 MB"
  loading={uploadProgress < 100}
  DeleteButtonProps={{ onClick: handleDelete }}
/>
```

---

### KeyboardShortcutGroup

Displays keyboard shortcut key combinations.

```tsx
import { KeyboardShortcutGroup } from "@sundaysky/smartvideo-hub-truffle-component-library";

<KeyboardShortcutGroup color="default">
  <kbd>Ctrl</kbd><kbd>S</kbd>
</KeyboardShortcutGroup>
```

---

### NoOutlineSelect

Styled MUI Select without outline/underline. Hover reveals a light background.

```tsx
import { NoOutlineSelect } from "@sundaysky/smartvideo-hub-truffle-component-library";

<NoOutlineSelect value={selected} onChange={handleChange}>
  <MenuItem value="a">Option A</MenuItem>
  <MenuItem value="b">Option B</MenuItem>
</NoOutlineSelect>
```

---

### Tooltip Parts: TooltipTitle / TooltipContent / TooltipActions

Structured content for rich tooltips.

```tsx
import { TooltipTitle, TooltipContent, TooltipActions } from "@sundaysky/smartvideo-hub-truffle-component-library";

<Tooltip title={
  <>
    <TooltipTitle>Feature name</TooltipTitle>
    <TooltipContent>Description of this feature and how to use it.</TooltipContent>
    <TooltipActions><Button size="small">Learn more</Button></TooltipActions>
  </>
}>
  <IconButton><InfoIcon /></IconButton>
</Tooltip>
```

---

### TruffleGradientDefinitions

SVG gradient definition for use with icon fills. Rendered automatically by `TruffleThemeProvider`.

```tsx
// To apply gradient fill to an SVG icon:
import { TruffleSvgGradientId } from "@sundaysky/smartvideo-hub-truffle-component-library";

<SvgIcon sx={{ fill: `url(#${TruffleSvgGradientId})` }}>
  <path d="..." />
</SvgIcon>
```

---

### RichTextField

Quill-based rich text editor with customizable formatting toolbar, mention support, and AI text editing.

```tsx
import { RichTextField } from "@sundaysky/smartvideo-hub-truffle-component-library";

<RichTextField
  defaultValue={deltaContent}
  formatting={{ bold: true, italic: true, alignment: true, colors: true }}
  fonts={[{ label: "Default", fonts: ["Inter", "Open Sans"] }]}
  onChange={handleChange}
/>
```

This is a complex component — refer to its Storybook for full usage patterns.

---

## Utilities

### combineSxProps

**Always use this to merge SxProps**. Filters falsy values and flattens arrays at runtime.

```tsx
import { combineSxProps } from "@sundaysky/smartvideo-hub-truffle-component-library";

// When all args are guaranteed SxProps:
<Box sx={combineSxProps(baseSx, activeSx, props.sx)} />

// When conditionally including SxProps, build an array and spread:
const sxParts: SxProps<Theme>[] = [baseSx];
if (isActive) sxParts.push(activeSx);
if (props.sx) sxParts.push(props.sx);
<Box sx={combineSxProps(...sxParts)} />
```

**Note:** The TypeScript signature expects `SxProps<Theme>` arguments. Passing `false | SxProps<Theme>` (e.g. `isActive && activeSx`) or `SxProps<Theme> | undefined` (e.g. an optional `sx` prop) may cause a TS error even though the runtime handles falsy values. Use the array-and-spread pattern above, or guard with a ternary:

```tsx
// Guard optional sx prop:
<Box sx={sx ? combineSxProps(baseSx, sx) : baseSx} />
```

### pulseSxProps

Pre-built pulse animation keyframes (scale 1 to 0.6).

```tsx
import { pulseSxProps } from "@sundaysky/smartvideo-hub-truffle-component-library";

<Box sx={combineSxProps(pulseSxProps, otherSx)} />
```

### Types

- `ExtendWithDataAttributes<T>` — Adds `data-testid` and `data-tracking-id` to any props type
- `WithRequired<T, K>` — Makes property K required in type T

---

## Icons

### FontAwesome (primary icon set)

The product uses FontAwesome Pro icons. Import from specific weight packages:

```tsx
import { faUser } from "@fortawesome/pro-regular-svg-icons/faUser";
import { faCheck } from "@fortawesome/pro-solid-svg-icons/faCheck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

<FontAwesomeIcon icon={faUser} />
```

Available weights: `pro-regular-svg-icons`, `pro-solid-svg-icons`, `pro-light-svg-icons`, `free-brands-svg-icons`.

### MUI Icons (supplementary)

```tsx
import CloseIcon from "@mui/icons-material/Close";
```

### Custom Icons

The library exports custom SVG icons from `src/Icons/`. Import directly:

```tsx
import { SomeCustomIcon } from "@sundaysky/smartvideo-hub-truffle-component-library";
```

---

## Styling Patterns

### Use `sx` prop with theme tokens

```tsx
// Correct - theme-aware styling
<Box sx={{ color: "text.secondary", bgcolor: "primary.light", p: 2, borderRadius: 1 }} />

// Correct - callback for complex theme access
<Box sx={(theme) => ({ border: `1px solid ${theme.palette.divider}` })} />

// WRONG - hardcoded values
<Box sx={{ color: "#3C3C48", backgroundColor: "#F4F7FF", padding: "16px" }} />
```

### Define styles as constants

```tsx
const containerSx: SxProps<Theme> = {
  display: "flex",
  gap: 1,
  p: 2,
  bgcolor: "background.paper",
  borderRadius: 1,
};

const activeSx: SxProps<Theme> = (theme) => ({
  border: `2px solid ${theme.palette.primary.main}`,
});

// Type-safe conditional merging:
const sxParts: SxProps<Theme>[] = [containerSx];
if (isActive) sxParts.push(activeSx);
if (props.sx) sxParts.push(props.sx);
<Box sx={combineSxProps(...sxParts)} />
```

### Hover-reveal pattern for card overlays

The canonical pattern for showing actions/overlays on card hover uses CSS className selectors. The parent hides children by default and reveals them on `:hover`:

```tsx
const cardSx: SxProps<Theme> = {
  position: "relative",
  "&:hover": {
    "& .card-hover-overlay": { display: "block" },
    "& .card-actions": { visibility: "visible" },
  },
};

const overlaySx: SxProps<Theme> = {
  display: "none",
  position: "absolute",
  top: 0,
  width: "100%",
  height: "100%",
  backgroundColor: (theme) => theme.palette.text.disabled,
};

const actionsSx: SxProps<Theme> = {
  position: "absolute",
  top: 16,
  right: 16,
  visibility: "hidden",
  display: "flex",
  gap: "8px",
};

// In JSX:
<Card sx={cardSx}>
  <Box className="card-hover-overlay" sx={overlaySx} />
  <Box className="card-actions" sx={actionsSx}>
    <TruffleIconButton variant="contained" color="white" size="small">
      <FontAwesomeIcon icon={faPlay} />
    </TruffleIconButton>
  </Box>
</Card>
```

### Use MUI layout components

```tsx
// Correct - use Box, Stack, Grid
<Stack direction="row" spacing={2} alignItems="center">
  <Avatar />
  <Typography variant="body1">Name</Typography>
</Stack>

// WRONG - custom CSS flexbox
<div style={{ display: "flex", flexDirection: "row", gap: "16px", alignItems: "center" }}>
```

---

## Edge Cases & Exceptions

### Visual/Canvas Text (cqw units)

Typography inside video previews or canvas overlays often uses container-query units (`fontSize: "9cqw"`, `"4cqw"`, etc.). These are **not UI text** — they are visual elements that scale with the preview container. For these elements:

- **Keep** explicit `fontFamily`, `fontWeight`, `fontSize` overrides (variants don't support cqw)
- **Still replace** hardcoded colors with palette paths (`"secondary.main"`, `"text.primary"`, etc.)

### Typography Sizes Without Exact Variant Match

The theme defines specific font sizes. When you encounter text at sizes like 11px, 13px, or 9px that don't have exact variant matches:

| Needed size | Use variant | Notes |
|---|---|---|
| 11px | `caption` | Closest match (12px). Accept the 1px difference. |
| 13px | `caption` or `subtitle2` | Use `caption` for light text, `subtitle2` for emphasized text. If the 1-2px difference matters, add `sx={{ fontSize: 13 }}` but still drop `fontFamily`/`fontWeight`. |
| 9px–10px | `caption` with fontSize override | `variant="caption" sx={{ fontSize: 10 }}` |

### Brand/Logo Text

The SundaySky wordmark and app sidebar navigation use brand-specific typography (e.g., Inter 700, 11px, letter-spacing 0.22em, uppercase). These **may** keep explicit font overrides since they are brand identity elements, not standard UI text. Still replace colors with palette paths.

### Tooltip Navy Background

Many tooltips use a dark navy background for contrast. Use `"secondary.main"` as the bgcolor:

```tsx
<Tooltip
  componentsProps={{
    tooltip: { sx: { bgcolor: "secondary.main" } },
    arrow: { sx: { color: "secondary.main" } }
  }}
>
```

---

## Deprecated Components

The following are deprecated. Do not use in new code:
- `InlineTextField` — use MUI `TextField` directly
- `DeprecatedInlineTextField` — use MUI `TextField` directly
- `SimpleInputDialog` — use `Dialog` + `TruffleDialogTitle` + `TruffleDialogActions`
- `ConfirmationDialog` (from dialogs/) — use `SimpleDialogBase` or build with Dialog parts
- `ComplexInputDialog` — use `Dialog` with custom confirmation logic
- `TabbedDialog` — use `Dialog` with custom layout
- `commonTooltipProps` — configure Tooltip props directly
- `useIsEllipsisActive` — use `TypographyWithTooltipOnOverflow` instead

---

## Known Issues

### React 18/19 type incompatibility

The library is built against React 19 types. When consumed in a React 18 project, `ForwardRefExoticComponent`-based exports (e.g. `TruffleIconButton`, `TruffleAlert`) may produce TypeScript errors about missing `placeholder`, `onPointerEnterCapture`, and `onPointerLeaveCapture` properties. This is a types-only issue — the components work correctly at runtime. Workaround: use `tsc --noEmit` (skips declaration emit) or add `skipLibCheck: true` in `tsconfig.json`.
