# Component Registry

All UI components in the Workflow project, with MUI component usage and props.

---

## Dialogs

---

### `ApprovalDialog`
**File:** `src/ApprovalDialog.tsx`
**Description:** Initiates the approval workflow. Allows the user to select one or more approvers with AND/OR logic and add an optional comment before sending for approval.

**Props**
| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Controls Dialog open state |
| `onClose` | `() => void` | Called on Cancel or X click |
| `onSend` | `(approvers: string[]) => void` | Called with selected approver IDs on submit |

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Dialog` | `maxWidth="sm"` `fullWidth` | Modal container; `backdropClick` is suppressed |
| `DialogTitle` | `component="div"` | Title row with X close button |
| `DialogContent` | — | Scrollable body |
| `DialogActions` | — | Footer with "+ Add an approver" left, Cancel + Send right |
| `Alert` | `severity="info"` | Info banner: "Approvers will be notified by email…" |
| `TextField` | `variant="outlined"` `multiline` `rows={3}` | Optional comment for approvers |
| `FormControl` | `variant="outlined"` `size="medium"` | Wrapper for each approver Select |
| `Select` | `displayEmpty` | Approver picker; renders italic placeholder when empty |
| `MenuItem` | — | One entry per user; disabled if already selected in another row |
| `Button` | `variant="text"` `size="large"` | "+ Add an approver" (left of footer) |
| `Button` | `variant="outlined"` `size="large"` | Cancel action |
| `Button` | `variant="contained"` `size="large"` | "Send for approval"; disabled until ≥1 approver selected |
| `IconButton` | `size="medium"` | Close (X) button in title |
| `Stack` | `direction="column"` `spacing={2}` | Vertical layout of content sections |
| `Typography` | — | Labels above comment and approver fields |
| `Box` | — | Approver row container (Select + AND/OR + delete icon) |

**MUI Icons (`@mui/icons-material`)**
| Icon | Usage |
|---|---|
| `CloseIcon` | X button in DialogTitle |
| `AddIcon` | Start icon for "+ Add an approver" Button |
| `DeleteOutlineIcon` | Remove-approver IconButton (color: error `#E62843`); hidden when only 1 row |

---

### `AddApproverDialog`
**File:** `src/AddApproverDialog.tsx`
**Description:** Adds a single new approver to an already in-progress approval. Displays existing approvers as read-only Chips, presents a Select for the new approver with Avatar-enriched options, and includes an optional message field.

**Props**
| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Controls Dialog open state |
| `onClose` | `() => void` | Called on Cancel or X click |
| `onAdd` | `(approver: string) => void` | Called with the new approver ID on confirm |
| `existingApprovers` | `string[]` | IDs of approvers already in the approval; shown as Chips and excluded from Select |

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Dialog` | `maxWidth="sm"` `fullWidth` | Modal container; `backdropClick` is suppressed |
| `DialogTitle` | `component="div"` | Title row with icon + label + X close button |
| `DialogContent` | — | Scrollable body |
| `DialogActions` | — | Footer with Cancel and "Add approver" buttons |
| `FormControl` | `variant="outlined"` `size="medium"` | Wrapper for the new approver Select |
| `Select` | `displayEmpty` | New approver picker; shows italic placeholder when empty |
| `MenuItem` | — | One entry per available user with Avatar + name + email |
| `TextField` | `variant="outlined"` `multiline` `rows={3}` | Optional message to the new approver |
| `Chip` | `size="small"` | Read-only display of each existing approver |
| `Avatar` | Custom `bgcolor` | Coloured initials avatar inside each Chip and MenuItem |
| `Button` | `variant="outlined"` `size="large"` | Cancel action |
| `Button` | `variant="contained"` `size="large"` | "Add approver"; disabled until approver selected |
| `IconButton` | `size="medium"` | Close (X) button in title |
| `Box` | — | Layout containers |
| `Typography` | — | Section labels, user name, email inside MenuItem |

**MUI Icons (`@mui/icons-material`)**
| Icon | Usage |
|---|---|
| `CloseIcon` | X button in DialogTitle |
| `PersonAddOutlinedIcon` | Leading icon in dialog title |

---

### `CancelApprovalDialog`
**File:** `src/CancelApprovalDialog.tsx`
**Description:** Warning dialog that appears when the user attempts to edit a video while approval is pending. Backdrop click and Escape key are both suppressed.

**Props**
| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Controls Dialog open state |
| `onClose` | `() => void` | Called on Cancel or X click |
| `onConfirm` | `() => void` | Called on "Cancel approval & edit video" — resets approval state and navigates to Studio |

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Dialog` | `maxWidth="sm"` `fullWidth` | Modal container; both `backdropClick` and `escapeKeyDown` are suppressed |
| `DialogTitle` | `component="div"` | Title row |
| `DialogContent` | — | Two-paragraph body text |
| `DialogActions` | — | Footer with Cancel and confirm buttons |
| `Button` | `variant="text"` `size="large"` | "Cancel" — keeps approval active |
| `Button` | `variant="contained"` `size="large"` | "Cancel approval & edit video" — destructive primary action |
| `IconButton` | `size="medium"` | X close button |
| `Typography` | — | Title and body paragraphs |

**MUI Icons (`@mui/icons-material`)**
| Icon | Usage |
|---|---|
| `CloseIcon` | X button in DialogTitle |

---

### `ApproveVideoDialog`
**File:** `src/ApproveVideoDialog.tsx`
**Description:** Final confirmation dialog for the video owner to approve the video for sharing.

**Props**
| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Controls Dialog open state |
| `onClose` | `() => void` | Called on Cancel or X click |
| `onApprove` | `() => void` | Called when approval is confirmed; advances video to Phase 4 |

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Dialog` | `maxWidth="sm"` `fullWidth` | Modal container |
| `DialogTitle` | `component="div"` | Title row |
| `DialogContent` | — | Descriptive body text |
| `DialogActions` | — | Cancel and Approve action buttons |
| `Button` | `variant="outlined"` `size="large"` | Cancel action |
| `Button` | `variant="contained"` `size="large"` | "Approve" — advances approval state |
| `IconButton` | `size="medium"` | X close button |
| `Typography` | — | Title and body text |
| `Box` | — | Layout containers |

**MUI Icons (`@mui/icons-material`)**
| Icon | Usage |
|---|---|
| `CloseIcon` | X button in DialogTitle |
| `HelpOutlineIcon` | Help icon button in title area |

---

### `ConfirmationDialog`
**File:** `src/ConfirmationDialog.tsx`
**Description:** Shown after approval is sent. Confirms who was notified, adapts messaging for single vs. multi-approver, and provides a "Share video using link" secondary action.

**Props**
| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Controls Dialog open state |
| `onClose` | `() => void` | Called on close |
| `approverCount` | `number` | Drives singular vs. plural copy and the multi-approver note |

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Dialog` | `maxWidth="sm"` `fullWidth` | Modal container |
| `DialogTitle` | `component="div"` | Title row |
| `DialogContent` | — | Confirmation message body |
| `DialogActions` | — | "Share video using link" left · "Done" right |
| `Button` | `variant="text"` `startIcon` | "Share video using link" (left-aligned) |
| `Button` | `variant="contained"` `size="large"` | "Done" — closes dialog |
| `IconButton` | `size="medium"` | X close button |
| `Box` | — | Layout containers |
| `Typography` | — | Title and body paragraphs |

**MUI Icons (`@mui/icons-material`)**
| Icon | Usage |
|---|---|
| `CloseIcon` | X button in DialogTitle |
| `LinkIcon` | Start icon on "Share video using link" Button |

---

### `VideoPermissionDialog`
**File:** `src/VideoPermissionDialog.tsx`
**Description:** Full-screen-width Dialog for setting video-level access permissions. Supports "Teams" and "Private" tabs, an everyone-role dropdown, and an Autocomplete for adding specific users with role assignment.

**Props**
| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Controls Dialog open state |
| `onClose` | `() => void` | Called on cancel or X click |
| `onSave` | `(s: VideoPermissionSettings) => void` | Called with the updated settings on save |
| `initialSettings?` | `VideoPermissionSettings` | Pre-populates the form |

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Dialog` | `maxWidth="sm"` `fullWidth` | Modal container |
| `DialogTitle` | `component="div"` | Title + X close button |
| `DialogContent` | — | Permission settings form |
| `DialogActions` | — | Cancel and Save buttons |
| `ToggleButtonGroup` | `exclusive` | "Teams" / "Private" tab switcher |
| `ToggleButton` | — | Individual tab option |
| `Autocomplete` | `multiple` `freeSolo` | User search and selection |
| `TextField` | `size="small"` | Autocomplete input |
| `Chip` | — | Selected users in the Autocomplete |
| `Avatar` | — | User initials in Chips and list items |
| `Menu` | — | Role picker dropdown (Editor / Viewer) |
| `MenuItem` | — | Role options |
| `Checkbox` | — | "Prevent duplicate sharing" toggle |
| `Alert` | `severity="info"` | Contextual info banners |
| `Divider` | — | Section separators |
| `Tooltip` | — | Help text on icons |
| `Button` | `variant="outlined"` | Cancel |
| `Button` | `variant="contained"` | Save |
| `IconButton` | — | X close, help, back navigation |
| `Typography` | — | Section labels and descriptions |
| `Box` | — | Layout containers |

**MUI Icons (`@mui/icons-material`)**
| Icon | Usage |
|---|---|
| `CloseIcon` | X close button |
| `HelpOutlineIcon` | Help tooltip trigger |
| `GroupsIcon` | Teams tab icon |
| `PersonAddOutlinedIcon` | Add user prompt icon |
| `KeyboardArrowDownIcon` | Role dropdown chevron |
| `CheckIcon` | Active role indicator in Menu |
| `InfoOutlinedIcon` | Info tooltip trigger |
| `LockOutlinedIcon` | Private mode indicator |
| `SettingsOutlinedIcon` | Settings action |
| `NoAccountsIcon` | Restricted access indicator |
| `ArrowBackIcon` | Back navigation in sub-view |

---

### `ManageAccessDialog`
**File:** `src/ManageAccessDialog.tsx`
**Description:** Reusable access management dialog shared by video and avatar permission flows. Exports the core permission types (`PermissionTab`, `EveryoneRole`, `UserRole`, `PermissionUser`, `PermissionSettings`) used across the app.

**Exported Types**
| Type | Values |
|---|---|
| `PermissionTab` | `'teams'` \| `'private'` |
| `EveryoneRole` | `'editor'` \| `'viewer'` \| `'restricted'` |
| `UserRole` | `'editor'` \| `'viewer'` |
| `PermissionUser` | `{ user: User; role: UserRole }` |
| `PermissionSettings` | `{ tab, everyoneRole, users, ownerUsers }` |

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Dialog` | `maxWidth="sm"` `fullWidth` | Modal container |
| `DialogTitle` | `component="div"` | Title + navigation |
| `DialogContent` | — | Permission form body |
| `DialogActions` | — | Cancel and Save buttons |
| `ToggleButtonGroup` | `exclusive` | Teams / Private tab switcher |
| `ToggleButton` | — | Individual tab |
| `Autocomplete` | `multiple` | User search |
| `TextField` | — | Autocomplete input |
| `Chip` | — | Selected user tags |
| `Avatar` | — | User initials |
| `Menu` | — | Role picker |
| `MenuItem` | — | Role options |
| `Checkbox` | — | Permission toggles |
| `FormControlLabel` | — | Labelled checkbox wrapper |
| `Alert` | `severity="info"` | Info banners |
| `Divider` | — | Section separators |
| `Tooltip` | — | Help text |
| `Button` | `variant="outlined"` / `variant="contained"` | Cancel / Save |
| `IconButton` | — | Close, help, back |
| `InputAdornment` | `position="start"` | Search icon in Autocomplete |
| `Typography` | — | Labels |
| `Box` | — | Layout |

**MUI Icons (`@mui/icons-material`)**
| Icon | Usage |
|---|---|
| `CloseIcon` | X close |
| `HelpOutlineIcon` | Help trigger |
| `GroupsIcon` | Teams tab |
| `PersonAddOutlinedIcon` | Add user prompt |
| `KeyboardArrowDownIcon` | Role chevron |
| `CheckIcon` | Active role |
| `InfoOutlinedIcon` | Info trigger |
| `ArrowBackIcon` | Back navigation |

---

### `AvatarPermissionDialog`
**File:** `src/AvatarPermissionDialog.tsx`
**Description:** Permission dialog scoped to a single custom avatar. Supports "Everyone", "Specific users", and "Private" usage permissions, plus an approver list and an access-request approval/denial flow.

**Props**
| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Controls Dialog open state |
| `onClose` | `() => void` | Called on cancel |
| `avatarName` | `string` | Displayed in the title |
| `initialSettings?` | `AvatarPermissionSettings` | Pre-populates form |
| `initialRequests?` | `AccessRequest[]` | Pending access requests shown for approval |
| `onSave` | `(s: AvatarPermissionSettings, remaining: AccessRequest[]) => void` | Called on save with updated settings and remaining requests |

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Dialog` | `maxWidth="sm"` `fullWidth` | Modal container |
| `DialogTitle` | `component="div"` | Title + X close |
| `DialogContent` | — | Permission form body |
| `DialogActions` | — | Cancel and Save buttons |
| `ToggleButtonGroup` | `exclusive` | Usage permission switcher (Everyone / Specific / Private) |
| `ToggleButton` | — | Each permission option |
| `Autocomplete` | `multiple` | Specific user search |
| `TextField` | — | Autocomplete input |
| `Chip` | — | Selected user tags |
| `Avatar` | — | User initials |
| `Menu` | — | Role picker for approvers |
| `MenuItem` | — | Role options |
| `Alert` | `severity="info"` | Contextual info banners |
| `Divider` | — | Section separators |
| `Tooltip` | — | Help text |
| `Button` | `variant="outlined"` / `variant="contained"` | Cancel / Save |
| `Button` | `variant="text"` `color="success"` | Approve request |
| `Button` | `variant="text"` `color="error"` | Deny request |
| `IconButton` | — | Close, help, back |
| `Typography` | — | Labels and descriptions |
| `Box` | — | Layout containers |

**MUI Icons (`@mui/icons-material`)**
| Icon | Usage |
|---|---|
| `CloseIcon` | X close |
| `HelpOutlineIcon` | Help trigger |
| `GroupsIcon` | "Everyone" permission option icon |
| `PersonAddOutlinedIcon` | "Specific users" option icon |
| `KeyboardArrowDownIcon` | Role dropdown chevron |
| `CheckIcon` | Active permission/role indicator |
| `InfoOutlinedIcon` | Info tooltip |
| `CheckCircleOutlineIcon` | "Approve" request action |
| `DoNotDisturbOnOutlinedIcon` | "Deny" request action |
| `VisibilityOutlinedIcon` | View-only permission indicator |
| `ArrowBackIcon` | Back navigation |

---

## Panels & Pages

---

### `NotificationsPanel`
**File:** `src/NotificationsPanel.tsx`
**Description:** A Popover-based notification drawer anchored to the bell icon in the top bar. Supports All / Unread tab filtering and a "Mark all as read" action. Includes `NotificationBell` as a co-exported trigger component.

**Props — `NotificationsPanel`**
| Prop | Type | Description |
|---|---|---|
| `anchorEl` | `HTMLElement \| null` | Popover anchor element |
| `onClose` | `() => void` | Called when the Popover closes |
| `onMarkAllRead?` | `() => void` | Called when "Mark all as read" is clicked |
| `notifications` | `NotificationItem[]` | List of notification objects to render |

**Props — `NotificationBell`**
| Prop | Type | Description |
|---|---|---|
| `dark?` | `boolean` | Uses dark icon color when true |
| `notifications?` | `NotificationItem[]` | Drives the unread Badge count |

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Popover` | `anchorOrigin` `transformOrigin` | Notification drawer container |
| `Badge` | `color="error"` | Unread count on the bell icon |
| `IconButton` | — | Bell trigger button |
| `Button` | `variant="text"` `size="small"` | Tab filters (All / Unread) and "Mark all as read" |
| `Divider` | — | Section separators |
| `Box` | — | Layout containers |
| `Typography` | — | Notification text, timestamps, header |

**MUI Icons (`@mui/icons-material`)**
| Icon | Usage |
|---|---|
| `NotificationsNoneIcon` | Bell icon in the trigger button |
| `ThumbUpAltOutlinedIcon` | Approval notification item icon |

---

### `VideoLibraryPage`
**File:** `src/VideoLibraryPage.tsx`
**Description:** The main library listing. Renders a grid of `VideoCard` components, a search bar, and a left navigation sidebar. Each card has a 3-dots `Menu` with approval, sharing, and management actions. Exports `PermAvatarGroup` for use in `App.tsx`.

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Box` | — | Page layout, card containers |
| `Typography` | — | Video titles, metadata labels |
| `Button` | `variant="contained"` / `variant="outlined"` | Primary actions on cards |
| `Avatar` | — | User avatars in permission group |
| `IconButton` | — | 3-dots menu trigger |
| `Tooltip` | — | Hover labels on icons and buttons |
| `OutlinedInput` | `size="small"` | Search bar |
| `InputAdornment` | `position="start"` | Search icon inside input |
| `Menu` | — | 3-dots context menu per video card |
| `MenuItem` | — | Individual menu actions |
| `ListItemText` | — | Menu item label |
| `Divider` | — | Separator between menu sections |
| `SvgIcon` | — | Custom SVG icon wrapper |

**MUI Icons (`@mui/icons-material`)**
| Icon | Usage |
|---|---|
| `MoreVertIcon` | 3-dots trigger |
| `SearchIcon` | Search bar adornment |
| `PlayArrowIcon` | Video play indicator |
| `ContentCopyIcon` | "Copy" action |
| `ShareOutlinedIcon` | "Share" action |
| `DeleteOutlineIcon` | "Delete" action |
| `VideoLibraryOutlinedIcon` | Library nav icon |
| `DashboardCustomizeOutlinedIcon` | Dashboard nav icon |
| `PermMediaOutlinedIcon` | Media nav icon |
| `AutoAwesomeOutlinedIcon` | AI/auto nav icon |
| `BarChartOutlinedIcon` | Analytics nav icon |
| `FolderOutlinedIcon` | Folder nav icon |
| `AddIcon` | "New video" button |
| `PeopleAltOutlinedIcon` | People/team icon |
| `SyncIcon` | Sync action |
| `GroupOutlinedIcon` | Group icon |
| `CommentOutlinedIcon` | Comments icon |
| `AddPhotoAlternateOutlinedIcon` | Add photo/thumbnail |
| `InfoOutlinedIcon` | Details action |
| `OpenInNewIcon` | Open in new tab |
| `ArchiveOutlinedIcon` | Archive action |
| `LockPersonIcon` | Permission lock |

---

### `StudioPage`
**File:** `src/StudioPage.tsx`
**Description:** The video editing view. Contains a floating `PlaceholderToolbar` for in-video text editing, a draggable `CommentsPanel`, inline text-edit dialogs for heading/subheading/footnote, and a left navigation sidebar with icons matching the Figma design.

**Props**
| Prop | Type | Description |
|---|---|---|
| `videoTitle` | `string` | Shown in the top breadcrumb |
| `initialHeadingText?` | `string` | Pre-populates the video heading |
| `initialSubheadingText?` | `string` | Pre-populates the video subheading |
| `approverNames` | `string` | Shown in the CommentsPanel header |
| `onNavigateToVideoPage` | `() => void` | Breadcrumb back link |
| `onNavigateToLibrary` | `() => void` | Library back link |
| `onRequestReapproval` | `() => void` | "Resend for approval" action |
| `onHeadingChange?` | `(text: string) => void` | Persists heading edits to parent |
| `onSubheadingChange?` | `(text: string) => void` | Persists subheading edits to parent |
| `openCommentsOnMount?` | `boolean` | Opens comments panel on first render |
| `triggerOpenComments?` | `number` | Increments to re-open comments (from notification link) |
| `notifications?` | `NotificationItem[]` | Passed to `NotificationBell` in top bar |
| `initialThreads?` | `CommentThread[]` | Pre-loaded comment threads |
| `initialPermSettings?` | `VideoPermissionSettings` | Pre-populates permission state |
| `onPermChange?` | `(s: VideoPermissionSettings) => void` | Persists permission changes |
| `awaitingApprovers?` | `boolean` | Hides thread list and Resend button; shows waiting state |
| `onEditAttempt?` | `() => void` | Intercepts placeholder Edit clicks during Phase 1 |

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Box` | — | Page layout, canvas, panels |
| `Typography` | — | Breadcrumbs, labels, comment text |
| `IconButton` | `size="small"` | Toolbar pills, panel controls, nav icons |
| `Button` | `variant="contained"` / `variant="text"` | Resend approval, action buttons |
| `Tooltip` | — | Nav icon labels, toolbar hints |
| `Dialog` | `maxWidth="sm"` | Inline text-edit dialogs (heading, subheading, footnote) |
| `DialogTitle` | — | Edit dialog title |
| `DialogContent` | — | Edit dialog text field |
| `DialogActions` | — | Edit dialog Cancel + Save |
| `TextField` | `variant="standard"` | In-dialog text editor |
| `Divider` | — | Panel and sidebar separators |

**MUI Icons (`@mui/icons-material`)**
| Icon | Usage |
|---|---|
| `EditOutlinedIcon` | "Edit" pill in PlaceholderToolbar |
| `VisibilityOutlinedIcon` | Preview toggle |
| `AlignHorizontalLeftIcon` | Alignment control |
| `ContentCopyOutlinedIcon` | Copy action |
| `ArrowBackIosNewIcon` / `ArrowForwardIosIcon` | Scene prev/next navigation |
| `CloseIcon` | Close CommentsPanel |
| `CommentOutlinedIcon` / `CommentIcon` | Toggle comments panel |
| `CheckBoxOutlineBlankIcon` / `CheckBoxIcon` | Comment resolve checkbox |

---

### `AvatarLibraryPanel`
**File:** `src/AvatarLibraryPanel.tsx`
**Description:** Slide-in panel for browsing and managing custom, beta, stock, and in-video avatars. Each card shows hover overlays with Add/Replace and Preview actions, and custom avatars have a 3-dots Popover with permission management and delete.

**Props**
| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Controls panel slide-in via width transition |
| `onClose` | `() => void` | Close button callback |
| `onTotalRequestsChange?` | `(count: number) => void` | Bubbles total pending access-request count to parent |

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Box` | — | Panel, grid, card containers |
| `Typography` | — | Avatar names, section labels, credits badge |
| `IconButton` | `size="small"` | Close, help buttons in header |
| `Button` | `variant="outlined"` | "Create Avatar" full-width button |
| `Button` | `variant="contained"` `size="small"` | "Add" / "Replace" card hover button |
| `Tooltip` | — | Preview hint, permission icon hints |
| `Popover` | `anchorReference="anchorPosition"` | 3-dots context menu for custom avatars |
| `Divider` | — | Popover section separators |
| `Badge` | `color="error"` | Pending request count on Custom tab |

**MUI Icons (`@mui/icons-material`)**
| Icon | Usage |
|---|---|
| `CloseIcon` | Panel close button |
| `HelpOutlineIcon` | Help button in header |
| `AddIcon` | Start icon on "Create Avatar" button |
| `OpenInFullIcon` | Preview expand on card hover |
| `MoreVertIcon` | 3-dots menu trigger on custom avatar cards |
| `PersonIcon` | Placeholder when avatar has no image |
| `TokenOutlinedIcon` | Credits badge icon |
| `DeleteOutlinedIcon` | Delete action in Popover |
| `InfoOutlinedIcon` | Details action in Popover |
| `LockOutlinedIcon` | Manage permissions action in Popover |
| `SwapHorizIcon` | "Replace" icon on hover overlay |

---

## Workflow Components

---

### `WorkflowApprovalStepper`
**File:** `src/WorkflowApprovalStepper.tsx`
**Description:** A 4-step horizontal stepper showing the video's approval progress (Draft → Sent for review → Feedback received → Approved). Shown on the video page once Phase 1 begins. Each step circle changes color based on `done` / `active` / `pending` status.

**Props**
| Prop | Type | Description |
|---|---|---|
| `phase` | `number` | Current workflow phase (0–4); drives step statuses |
| `approvers` | `string[]` | Approver IDs; displayed as names in the header subtitle |

**Phase → Active Step Mapping**
| Phase | Active Step |
|---|---|
| 0 | Draft |
| 1 | Sent for review |
| 2 | Feedback received |
| 3 | Approved |
| 4 | All steps done (all green) |

**MUI Components (`@mui/material`)**
| Component | Variant / Config | Usage |
|---|---|---|
| `Box` | — | Stepper container, step node, connector line |
| `Typography` | — | "Approval progress" header, step labels, approver/responded subtitle |
| `Tooltip` | `placement="top"` `arrow` | Shows full approver names on hover of the subtitle |

**MUI Icons (`@mui/icons-material`)**
| Icon | Step | Usage |
|---|---|---|
| `EditOutlinedIcon` | Draft | Icon inside the Draft step circle |
| `SendOutlinedIcon` | Sent for review | Icon inside the Sent step circle |
| `HourglassTopIcon` | Feedback received | Icon inside the Feedback step circle |
| `TaskAltIcon` | Approved | Icon inside the Approved step circle |
| `CheckIcon` | Any done step | Replaces the step icon when status is `done` |

---

## Quick-Reference: MUI Components Used Across the Codebase

| MUI Component | Used In |
|---|---|
| `Dialog` | ApprovalDialog, AddApproverDialog, CancelApprovalDialog, ApproveVideoDialog, ConfirmationDialog, VideoPermissionDialog, ManageAccessDialog, AvatarPermissionDialog, StudioPage (inline editors) |
| `DialogTitle` | All dialogs |
| `DialogContent` | All dialogs |
| `DialogActions` | All dialogs |
| `Button` | All dialogs, VideoLibraryPage, StudioPage, AvatarLibraryPanel, NotificationsPanel |
| `IconButton` | All dialogs, StudioPage, AvatarLibraryPanel, VideoLibraryPage, NotificationsPanel |
| `Typography` | All components |
| `Box` | All components |
| `TextField` | ApprovalDialog, AddApproverDialog, VideoPermissionDialog, ManageAccessDialog, AvatarPermissionDialog, StudioPage |
| `Select` / `FormControl` / `MenuItem` | ApprovalDialog, AddApproverDialog |
| `Autocomplete` | VideoPermissionDialog, ManageAccessDialog, AvatarPermissionDialog |
| `Chip` | AddApproverDialog, VideoPermissionDialog, ManageAccessDialog, AvatarPermissionDialog |
| `Avatar` | AddApproverDialog, VideoPermissionDialog, ManageAccessDialog, AvatarPermissionDialog, VideoLibraryPage |
| `Tooltip` | Most components |
| `Alert` | ApprovalDialog, VideoPermissionDialog, ManageAccessDialog, AvatarPermissionDialog |
| `Divider` | Most components |
| `ToggleButtonGroup` / `ToggleButton` | VideoPermissionDialog, ManageAccessDialog, AvatarPermissionDialog |
| `Menu` / `MenuItem` | VideoLibraryPage, VideoPermissionDialog, ManageAccessDialog, AvatarPermissionDialog |
| `Popover` | NotificationsPanel, AvatarLibraryPanel |
| `Badge` | NotificationsPanel, AvatarLibraryPanel |
| `Stack` | ApprovalDialog |
| `OutlinedInput` / `InputAdornment` | VideoLibraryPage |
| `Checkbox` / `FormControlLabel` | VideoPermissionDialog, ManageAccessDialog |
