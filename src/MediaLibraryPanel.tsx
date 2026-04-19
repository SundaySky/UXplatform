import { useState } from "react";
import {
    Box, Typography, IconButton, Button, Divider, SvgIcon,
    OutlinedInput, InputAdornment, Menu, MenuItem,
    Tooltip, InputBase,
    Dialog, DialogContent
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUpFromBracket, faWandMagicSparkles, faPuzzlePiece, faFolderPlus,
    faSquare, faTableCells, faList, faMagnifyingGlass, faChevronDown,
    faFilter, faArrowLeft, faArrowRight, faFolder, faImages,
    faUpRightAndDownLeftFromCenter, faEllipsisVertical,
    faUsers, faUserGear, faLock, faXmark, faCircleQuestion
} from "@fortawesome/pro-regular-svg-icons";
import { TruffleDialogTitle, TruffleDialogActions } from "@sundaysky/smartvideo-hub-truffle-component-library";

import ManageAccessDialog, {
    type PermissionSettings,
    type User,
    OWNER_USER
} from "./ManageAccessDialog";

// ─── Local display type (not exported by ManageAccessDialog anymore) ──────────
type ViewPermission = "everyone" | "editors" | "specific" | "private"

function toVp(s: PermissionSettings): ViewPermission {
    if (s.tab === "private") {
        return "private";
    }
    if (s.everyoneRole === "restricted") {
        return s.users.length > 0 ? "specific" : "editors";
    }
    return "everyone";
}

function toViewUsers(s: PermissionSettings): User[] {
    return s.users.map(pu => pu.user);
}

function fromVp(vp: ViewPermission, base: PermissionSettings): PermissionSettings {
    if (vp === "private") {
        return { ...base, tab: "private" };
    }
    if (vp === "everyone") {
        return { ...base, tab: "teams", everyoneRole: "viewer" };
    }
    return { ...base, tab: "teams", everyoneRole: "restricted" };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PANEL_WIDTH = 366;

const GRADIENT_GENERATE =
  "linear-gradient(141.73deg, #EB89F1 12.13%, #D47FEF 22.85%, #C175EE 33.17%, " +
  "#AB6DEC 44.29%, #936BEB 55.41%, #775EE9 66.53%, #5358E7 77.25%, #0053E5 88.37%)";

// ─── Tooltip sx (navy) ────────────────────────────────────────────────────────
const navyTooltipSx = {
    bgcolor: "secondary.main",
    borderRadius: "8px",
    px: 1.5, py: 1,
    maxWidth: 240,
    "& .MuiTooltip-arrow": { color: "secondary.main" }
};

// ─── Static sample data ───────────────────────────────────────────────────────
const MEDIA_FOLDERS = [
    { name: "AI Media Assets", isAi: true },
    { name: "Spring camping", isAi: false },
    { name: "Marketing department", isAi: false }
];

const MEDIA_ITEMS = [
    { id: 0, name: "Product launch 2025", duration: "1:05", bg: "#1E2D3D", added: "Dec 29, 2025 3:27 PM" },
    { id: 1, name: "Team intro", duration: "0:45", bg: "#1A1A2E", added: "Jan 5, 2026 10:12 AM" },
    { id: 2, name: "Spring campaign hero", duration: "2:10", bg: "#2E4A2A", added: "Feb 3, 2026 2:45 PM" },
    { id: 3, name: "Marketing highlights", duration: "1:30", bg: "#3A2A1E", added: "Mar 1, 2026 9:00 AM" }
];

// ─── Subfolders shown when navigating into a folder ──────────────────────────
const FOLDER_CONTENTS: Record<string, { name: string; isAi?: boolean }[]> = {
    "AI Media Assets":      [{ name: "Generated clips", isAi: true }, { name: "AI backgrounds", isAi: true }],
    "Spring camping":       [{ name: "Day 1 footage" }, { name: "Highlights reel" }],
    "Marketing department": [{ name: "Q1 2026 assets" }, { name: "Social media" }]
};

// ─── Default permissions ──────────────────────────────────────────────────────
const defaultPermissions = (): PermissionSettings => ({
    tab:          "teams",
    everyoneRole: "viewer",
    users:        [],
    ownerUsers:   [OWNER_USER]
});

// ─── Menu target type ─────────────────────────────────────────────────────────
interface MenuTarget {
  type: "media" | "folder"
  name: string
  added: string
}

// ─── Helpers for permission display ──────────────────────────────────────────
function visibleLabel(vp: ViewPermission) {
    switch (vp) {
        case "everyone": return "Everyone in your account";
        case "editors": return "Who can manage access";
        case "specific": return "Specific users";
        case "private": return "Only you";
    }
}

// ─── Effective permission (child + parent → most restrictive) ─────────────────
function getEffectiveVp(ownVp: ViewPermission, parentVp: ViewPermission): ViewPermission {
    if (parentVp === "everyone") {
        return ownVp;
    }
    if (ownVp === "private" || parentVp === "private") {
        return "private";
    }
    if (parentVp === "editors" && ownVp === "everyone") {
        return "editors";
    }
    if (parentVp === "specific" && (ownVp === "everyone" || ownVp === "editors")) {
        return "specific";
    }
    return ownVp;
}

// ─── Conflict detection ───────────────────────────────────────────────────────
function hasPermissionConflict(
    newVp: ViewPermission,
    newViewUsers: User[],
    parentVp: ViewPermission,
    parentViewUsers: User[]
): boolean {
    if (parentVp === "everyone") {
        return false;
    }
    if (newVp === "private") {
        return false;
    } // most restrictive → always safe
    if (parentVp === "private") {
        return true;
    } // parent is private, child can't be non-private
    if (parentVp === "editors") {
        return newVp === "everyone";
    }
    if (parentVp === "specific") {
        if (newVp === "everyone" || newVp === "editors") {
            return true;
        }
        if (newVp === "specific") {
            const parentIds = new Set(parentViewUsers.map(u => u.id));
            return newViewUsers.some(u => !parentIds.has(u.id));
        }
    }
    return false;
}

function VisibleIcon({ vp }: { vp: ViewPermission }) {
    const sx = { fontSize: "14px !important" };
    switch (vp) {
        case "everyone": return <SvgIcon sx={{ ...sx, color: "primary.main" }}><FontAwesomeIcon icon={faUsers} /></SvgIcon>;
        case "editors": return <SvgIcon sx={{ ...sx, color: "primary.main" }}><FontAwesomeIcon icon={faUserGear} /></SvgIcon>;
        case "specific": return <SvgIcon sx={{ ...sx, color: "warning.main" }}><FontAwesomeIcon icon={faUsers} /></SvgIcon>;
        case "private": return <SvgIcon sx={{ ...sx, color: "success.main" }}><FontAwesomeIcon icon={faLock} /></SvgIcon>;
    }
}

// ─── Permission badge ─────────────────────────────────────────────────────────
function PermBadge({ vp, strikethrough }: { vp: ViewPermission; strikethrough?: boolean }) {
    return (
        <Box sx={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            px: "8px", py: "3px", borderRadius: "12px",
            bgcolor: strikethrough ? "action.hover" : "primary.light",
            border: "1px solid",
            borderColor: strikethrough ? "divider" : "primary.light"
        }}>
            {vp !== "everyone" && <VisibleIcon vp={vp} />}
            <Typography variant="caption" sx={{
                color: strikethrough ? "text.secondary" : "text.primary",
                textDecoration: strikethrough ? "line-through" : "none",
                lineHeight: 1
            }}>
                {visibleLabel(vp)}
            </Typography>
        </Box>
    );
}

// ─── Folder thumbnail ─────────────────────────────────────────────────────────
function FolderThumb({ isAi }: { isAi?: boolean }) {
    return (
        <Box sx={{
            width: "100%", paddingTop: "68%", position: "relative",
            background: isAi
                ? "linear-gradient(135deg, #9C27B0 0%, #5C35CC 100%)"
                : "#3F51B5",
            overflow: "hidden"
        }}>
            <Box sx={folderThumbInnerSx}>
                {isAi
                    ? <SvgIcon sx={{ color: "common.white", fontSize: 34, opacity: 0.9 }}><FontAwesomeIcon icon={faWandMagicSparkles} /></SvgIcon>
                    : <SvgIcon sx={{ color: "common.white", fontSize: 38, opacity: 0.9 }}><FontAwesomeIcon icon={faFolder} /></SvgIcon>
                }
            </Box>
        </Box>
    );
}

// ─── White icon button on hover overlay ──────────────────────────────────────
function HoverIconBtn({
    onClick, children
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
}) {
    return (
        <IconButton
            size="small"
            onClick={onClick}
            sx={hoverIconBtnSx}
        >
            {children}
        </IconButton>
    );
}

// ─── Conflict dialog ──────────────────────────────────────────────────────────
function ConflictDialog({
    open, onClose, onFixParent,
    parentName, childName, childType,
    parentVp, newVp, childOwnVp,
    parentViewUsers: _parentViewUsers, newViewUsers: _newViewUsers
}: {
  open: boolean
  onClose: () => void
  onFixParent: () => void
  parentName: string
  childName: string
  childType: "media" | "folder"
  parentVp: ViewPermission
  newVp: ViewPermission
  childOwnVp: ViewPermission
  parentViewUsers: User[]
  newViewUsers: User[]
}) {
    const childIcon = childType === "folder"
        ? <SvgIcon sx={{ fontSize: 16, color: "warning.main" }}><FontAwesomeIcon icon={faFolder} /></SvgIcon>
        : <SvgIcon sx={{ fontSize: 16, color: "text.secondary" }}><FontAwesomeIcon icon={faImages} /></SvgIcon>;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: onClose }}>
                <Box sx={conflictTitleBoxSx}>
                    <SvgIcon sx={{ color: "error.main", fontSize: 22 }}><FontAwesomeIcon icon={faLock} /></SvgIcon>
                    Permission conflict with parent folder
                </Box>
            </TruffleDialogTitle>
            <DialogContent sx={conflictDialogContentSx}>
                {/* Multi-line description */}
                <Box sx={conflictDescriptionBoxSx}>
                    <Typography variant="body1" sx={conflictBodyTextSx}>
            "{childName}" can't be saved with the selected permission.
                    </Typography>
                    <Typography variant="body1" sx={conflictBodyTextSx}>
            Its parent folder "{parentName}" has more restrictive settings.
                    </Typography>
                    <Typography variant="body1" sx={conflictBodyTextSx}>
            Update the parent folder's permission to proceed.
                    </Typography>
                </Box>

                {/* Permission tree */}
                <Box sx={conflictTreeBoxSx}>
                    {/* Parent row */}
                    <Box sx={conflictTreeRowSx}>
                        <SvgIcon sx={{ fontSize: 16, color: "warning.main" }}><FontAwesomeIcon icon={faFolder} /></SvgIcon>
                        <Typography variant="caption" sx={conflictTreeNameSx}>
                            {parentName}
                        </Typography>
                        <Box sx={conflictTreeBadgeRowSx}>
                            <PermBadge vp={parentVp} strikethrough />
                            <SvgIcon sx={{ fontSize: 14, color: "text.secondary" }}><FontAwesomeIcon icon={faArrowRight} /></SvgIcon>
                            <PermBadge vp={newVp} />
                        </Box>
                    </Box>

                    {/* Child row — only shown when child has a different own permission than the parent */}
                    {childOwnVp !== parentVp && (
                        <Box sx={conflictChildRowSx}>
                            <Typography sx={{ color: "grey.300", fontSize: 14, lineHeight: 1, userSelect: "none" }}>└</Typography>
                            {childIcon}
                            <Typography variant="caption" sx={conflictChildNameSx}>
                                {childName}
                            </Typography>
                            <Box sx={conflictTreeBadgeRowSx}>
                                <PermBadge vp={childOwnVp} strikethrough />
                                <SvgIcon sx={{ fontSize: 14, color: "text.secondary" }}><FontAwesomeIcon icon={faArrowRight} /></SvgIcon>
                                <PermBadge vp={newVp} />
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <TruffleDialogActions>
                <Button variant="outlined" color="primary" size="large" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="primary" size="large" onClick={onFixParent}>
                    Change "{parentName}" to {visibleLabel(newVp)}
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MediaLibraryPanel({
    open,
    onClose,
    folder,
    onOpenFolder,
    onCloseFolder
}: {
  open: boolean
  onClose: () => void
  folder: string | null
  onOpenFolder: (name: string) => void
  onCloseFolder: () => void
}) {
    const [tab, setTab] = useState<0 | 1>(0);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchVal, setSearchVal] = useState("");

    // Three-dot menu state
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);
    const [editName, setEditName] = useState("");

    // Per-item permission settings
    const [permissions, setPermissions] = useState<Record<string, PermissionSettings>>({});

    // Manage access dialog
    const [manageOpen, setManageOpen] = useState(false);
    const [manageKey, setManageKey] = useState<string | null>(null);
    const [manageType, setManageType] = useState<"media" | "folder">("media");
    const [manageParentKey, setManageParentKey] = useState<string | null>(null);

    // Permission conflict dialog
    const [conflictOpen, setConflictOpen] = useState(false);
    const [conflictInfo, setConflictInfo] = useState<{
    parentKey: string
    childKey: string
    childType: "media" | "folder"
    newSettings: PermissionSettings
  } | null>(null);

    function getPerms(key: string): PermissionSettings {
        return permissions[key] ?? defaultPermissions();
    }

    function openMenu(
        e: React.MouseEvent<HTMLButtonElement>,
        type: "media" | "folder",
        name: string,
        added: string
    ) {
        e.stopPropagation();
        setMenuAnchor(e.currentTarget);
        setMenuTarget({ type, name, added });
        setEditName(name);
    }

    function closeMenu() {
        setMenuAnchor(null);
        setMenuTarget(null);
    }

    function openManageAccess(key: string, type: "media" | "folder", parentKey?: string | null) {
        setManageKey(key);
        setManageType(type);
        setManageParentKey(parentKey ?? null);
        setManageOpen(true);
    // do NOT close the menu — dialog overlays it, menu stays when dialog closes
    }

    function handleSavePermissions(s: PermissionSettings) {
        if (!manageKey) {
            return;
        }
        // Check for conflict with parent folder
        if (manageParentKey) {
            const parentPerms = getPerms(manageParentKey);
            if (hasPermissionConflict(toVp(s), toViewUsers(s), toVp(parentPerms), toViewUsers(parentPerms))) {
                setConflictInfo({ parentKey: manageParentKey, childKey: manageKey, childType: manageType, newSettings: s });
                setConflictOpen(true);
                return; // keep ManageAccessDialog open for correction
            }
        }
        setPermissions(prev => ({ ...prev, [manageKey]: s }));
        setManageOpen(false);
    }

    function handleFixParent() {
        if (!conflictInfo) {
            return;
        }
        const { tab, everyoneRole } = conflictInfo.newSettings;
        setPermissions(prev => ({
            ...prev,
            [conflictInfo.parentKey]: { ...getPerms(conflictInfo.parentKey), tab, everyoneRole },
            [conflictInfo.childKey]:  conflictInfo.newSettings
        }));
        setConflictOpen(false);
        setConflictInfo(null);
        setManageOpen(false);
    }

    // Effective parent permission for nested items
    const parentVp: ViewPermission = folder !== null ? toVp(getPerms(folder)) : "everyone";

    return (
        <Box sx={{
            width:      open ? PANEL_WIDTH : 0,
            flexShrink: 0,
            overflow:   "hidden",
            transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
            bgcolor:    "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            display:    "flex",
            height:     "100%"
        }}>
            {/* Fixed-width inner container */}
            <Box sx={panelInnerSx}>

                {/* ── Header ──────────────────────────────────────────────────────── */}
                <Box sx={headerRowSx}>
                    <Typography variant="h3" sx={headerTitleSx}>
            Media
                    </Typography>
                    <IconButton size="small" sx={headerIconBtnSx}>
                        <SvgIcon sx={iconSm18Sx}><FontAwesomeIcon icon={faCircleQuestion} /></SvgIcon>
                    </IconButton>
                    <IconButton size="small" onClick={onClose} sx={headerIconBtnSx}>
                        <SvgIcon sx={iconSm18Sx}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                    </IconButton>
                </Box>

                {/* ── Upload / Generate / Record ──────────────────────────────────── */}
                <Box sx={actionButtonsRowSx}>
                    <Button
                        variant="contained" size="small"
                        startIcon={<SvgIcon sx={{ fontSize: "14px !important" }}><FontAwesomeIcon icon={faArrowUpFromBracket} /></SvgIcon>}
                        sx={uploadBtnSx}
                    >Upload</Button>

                    <Button
                        variant="contained" size="small"
                        startIcon={<SvgIcon sx={{ fontSize: "14px !important" }}><FontAwesomeIcon icon={faWandMagicSparkles} /></SvgIcon>}
                        sx={generateBtnSx}
                    >Generate</Button>

                    <Box sx={recordWrapperSx}>
                        <Button
                            variant="outlined" size="small" fullWidth
                            startIcon={
                                <Box sx={recordDotSx} />
                            }
                            sx={recordBtnSx}
                        >Record</Button>
                        <Box sx={recordNewBadgeSx}>
                            <Typography variant="caption" sx={recordNewBadgeTextSx}>New</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* ── Tabs ────────────────────────────────────────────────────────── */}
                <Box sx={tabsRowSx}>
                    {["Your Media", "Stock"].map((label, i) => (
                        <Box
                            key={label}
                            onClick={() => setTab(i as 0 | 1)}
                            sx={{
                                flex: 1, py: "8px", textAlign: "center", cursor: "pointer",
                                borderBottom: tab === i ? "2px solid" : "2px solid transparent",
                                borderBottomColor: tab === i ? "secondary.main" : "transparent",
                                mb: "-1px"
                            }}
                        >
                            <Typography variant="body1" sx={{
                                color: tab === i ? "secondary.main" : "text.disabled"
                            }}>{label}</Typography>
                        </Box>
                    ))}
                    <Box sx={tabsIntegrationBtnSx}>
                        <SvgIcon sx={{ fontSize: 16, color: "action.active" }}><FontAwesomeIcon icon={faPuzzlePiece} /></SvgIcon>
                    </Box>
                </Box>

                {/* ── Actions row ─────────────────────────────────────────────────── */}
                <Box sx={actionsRowSx}>
                    <Box sx={actionsLeftGroupSx}>
                        <IconButton size="small" sx={folderPlusBtnSx}>
                            <SvgIcon sx={iconSm18Sx}><FontAwesomeIcon icon={faFolderPlus} /></SvgIcon>
                        </IconButton>
                        <Button
                            variant="outlined" size="small"
                            startIcon={<SvgIcon sx={{ fontSize: "14px !important" }}><FontAwesomeIcon icon={faSquare} /></SvgIcon>}
                            sx={selectBtnSx}
                        >Select</Button>
                    </Box>

                    <Box sx={viewToggleGroupSx}>
                        {(["grid", "list"] as const).map((mode, i) => (
                            <Box
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                sx={{
                                    p: "4px", display: "flex", alignItems: "center", cursor: "pointer",
                                    bgcolor: viewMode === mode ? "primary.light" : "transparent",
                                    borderRadius: "6px", transition: "background 0.15s"
                                }}
                            >
                                {i === 0
                                    ? <SvgIcon sx={{ fontSize: 16, color: "action.active" }}><FontAwesomeIcon icon={faTableCells} /></SvgIcon>
                                    : <SvgIcon sx={{ fontSize: 16, color: "action.active" }}><FontAwesomeIcon icon={faList} /></SvgIcon>
                                }
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* ── Search ──────────────────────────────────────────────────────── */}
                <Box sx={searchBoxSx}>
                    <OutlinedInput
                        value={searchVal}
                        onChange={e => setSearchVal(e.target.value)}
                        placeholder="Search folder and media"
                        size="small" fullWidth
                        startAdornment={
                            <InputAdornment position="start">
                                <SvgIcon sx={{ fontSize: 16, color: "text.secondary" }}><FontAwesomeIcon icon={faMagnifyingGlass} /></SvgIcon>
                            </InputAdornment>
                        }
                        sx={searchInputSx}
                    />
                </Box>

                {/* ── Filters ─────────────────────────────────────────────────────── */}
                <Box sx={filtersRowSx}>
                    <SvgIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }}><FontAwesomeIcon icon={faFilter} /></SvgIcon>
                    {["Type", "Source", "Duration", "Orientation"].map(f => (
                        <Button
                            key={f} size="small"
                            endIcon={<SvgIcon sx={{ fontSize: "13px !important" }}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>}
                            sx={filterChipBtnSx}
                        >{f}</Button>
                    ))}
                </Box>

                {/* ── Scrollable content ───────────────────────────────────────────── */}
                <Box sx={scrollableContentSx}>

                    {/* Folder strip */}
                    {folder && (() => {
                        const fp = getPerms(folder);
                        return (
                            <Box sx={{ mb: 1.5, pt: 0.5 }}>
                                <Box sx={folderHeaderRowSx}>
                                    <IconButton size="small" onClick={onCloseFolder} sx={backBtnSx}>
                                        <SvgIcon sx={iconSm18Sx}><FontAwesomeIcon icon={faArrowLeft} /></SvgIcon>
                                    </IconButton>
                                    <Typography variant="h5" sx={folderTitleSx}>
                                        {folder}
                                    </Typography>
                                </Box>
                                <Divider sx={folderDividerSx} />
                                <Box sx={folderVisibilityRowSx}>
                                    <Typography variant="body1" sx={folderVisibilityLabelSx}>
                    Visible to:
                                    </Typography>
                                    <Button
                                        variant="text" size="small"
                                        startIcon={<VisibleIcon vp={toVp(fp)} />}
                                        endIcon={<SvgIcon sx={{ fontSize: "13px !important" }}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>}
                                        onClick={() => openManageAccess(folder, "folder")}
                                        sx={folderVisibilityBtnSx}
                                    >
                                        {visibleLabel(toVp(fp))}
                                    </Button>
                                </Box>
                            </Box>
                        );
                    })()}

                    {/* Grid */}
                    <Box sx={mediaGridSx}>

                        {/* Folder items (root view) */}
                        {!folder && MEDIA_FOLDERS.map(f => {
                            const fvp = toVp(getPerms(f.name));
                            return (
                                <Box
                                    key={f.name}
                                    onClick={() => onOpenFolder(f.name)}
                                    sx={cardSx}
                                >
                                    <Box sx={cardThumbWrapperSx}>
                                        <FolderThumb isAi={f.isAi} />
                                        <Box className="hover-overlay" sx={cardHoverOverlaySx} />
                                    </Box>
                                    <Box sx={cardActionsOverlaySx}>
                                        <HoverIconBtn onClick={e => openMenu(e, "folder", f.name, "Dec 10, 2025 9:00 AM")}>
                                            <SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                                        </HoverIconBtn>
                                    </Box>
                                    <Box sx={cardFooterSx}>
                                        <Typography variant="caption" sx={cardNameTextSx}>
                                            {f.name}
                                        </Typography>
                                        {fvp !== "everyone" && (
                                            <Tooltip
                                                title={<Typography variant="caption" sx={{ color: "common.white" }}>{visibleLabel(fvp)}</Typography>}
                                                placement="top" arrow
                                                componentsProps={{ tooltip: { sx: navyTooltipSx } }}
                                            >
                                                <Box sx={cardPermIconWrapperSx} onClick={e => e.stopPropagation()}>
                                                    <VisibleIcon vp={fvp} />
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}

                        {/* Subfolders inside a folder */}
                        {folder && (FOLDER_CONTENTS[folder] ?? []).map(sf => {
                            const sfvp = toVp(getPerms(sf.name));
                            const sfIconVp = getEffectiveVp(sfvp, parentVp);
                            // Only show icon when this subfolder's permission differs from its parent
                            const sfShowIcon = sfIconVp !== parentVp;
                            return (
                                <Box
                                    key={sf.name}
                                    onClick={() => onOpenFolder(sf.name)}
                                    sx={cardSx}
                                >
                                    <Box sx={cardThumbWrapperSx}>
                                        <FolderThumb isAi={sf.isAi} />
                                        <Box className="hover-overlay" sx={cardHoverOverlaySx} />
                                    </Box>
                                    <Box sx={cardActionsOverlaySx}>
                                        <HoverIconBtn onClick={e => openMenu(e, "folder", sf.name, "Jan 10, 2026 9:00 AM")}>
                                            <SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                                        </HoverIconBtn>
                                    </Box>
                                    <Box sx={cardFooterSx}>
                                        <Typography variant="caption" sx={cardNameTextSx}>
                                            {sf.name}
                                        </Typography>
                                        {sfShowIcon && (
                                            <Tooltip
                                                title={<Typography variant="caption" sx={{ color: "common.white" }}>{visibleLabel(sfIconVp)}</Typography>}
                                                placement="top" arrow
                                                componentsProps={{ tooltip: { sx: navyTooltipSx } }}
                                            >
                                                <Box sx={cardPermIconWrapperSx} onClick={e => e.stopPropagation()}>
                                                    <VisibleIcon vp={sfIconVp} />
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}

                        {/* Media items */}
                        {MEDIA_ITEMS.map(item => {
                            const ivp = toVp(getPerms(item.name));
                            const itemIconVp = getEffectiveVp(ivp, parentVp);
                            // Only show icon when this item's permission differs from its parent folder
                            const itemShowIcon = itemIconVp !== parentVp;
                            return (
                                <Box
                                    key={item.id}
                                    sx={mediaCardSx}
                                >
                                    <Box sx={mediaCardInnerSx}>
                                        <Box sx={{ width: "100%", paddingTop: "68%", bgcolor: item.bg, position: "relative" }}>
                                            <Box sx={mediaCenteredIconSx}>
                                                <SvgIcon sx={{ color: "rgba(255,255,255,0.22)", fontSize: 26 }}><FontAwesomeIcon icon={faImages} /></SvgIcon>
                                            </Box>
                                        </Box>
                                        <Box className="hover-overlay" sx={mediaHoverOverlaySx} />
                                        <Box sx={mediaDurationBadgeSx}>
                                            <Typography variant="caption" sx={mediaDurationTextSx}>
                                                {item.duration}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box className="hover-actions" sx={mediaHoverActionsSx}>
                                        <HoverIconBtn onClick={e => e.stopPropagation()}>
                                            <SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} /></SvgIcon>
                                        </HoverIconBtn>
                                        <HoverIconBtn onClick={e => openMenu(e, "media", item.name, item.added)}>
                                            <SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                                        </HoverIconBtn>
                                    </Box>

                                    <Box sx={cardFooterSx}>
                                        <Typography variant="caption" sx={cardNameTextSx}>
                                            {item.name}
                                        </Typography>
                                        {itemShowIcon && (
                                            <Tooltip
                                                title={<Typography variant="caption" sx={{ color: "common.white" }}>{visibleLabel(itemIconVp)}</Typography>}
                                                placement="top" arrow
                                                componentsProps={{ tooltip: { sx: navyTooltipSx } }}
                                            >
                                                <Box sx={cardPermIconWrapperSx}>
                                                    <VisibleIcon vp={itemIconVp} />
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>

            {/* ── Three-dot menu ─────────────────────────────────────────────────── */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeMenu}
                disableAutoFocusItem
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                    paper: {
                        sx: menuPaperSx
                    }
                }}
            >
                {/* Inline editable name */}
                <Box sx={menuEditNameBoxSx} onKeyDown={e => e.stopPropagation()}>
                    <InputBase
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        fullWidth
                        sx={menuInputBaseSx}
                    />
                </Box>

                {/* Added date */}
                <Box sx={menuAddedDateBoxSx}>
                    <Typography variant="caption" sx={menuAddedDateTextSx}>
            Added: {menuTarget?.added ?? ""}
                    </Typography>
                </Box>

                <Divider sx={menuDividerSx} />

                {/* Action items */}
                <MenuItem dense onClick={closeMenu} sx={menuItemDefaultSx}>
          Details
                </MenuItem>
                {menuTarget?.type === "folder" && (
                    <MenuItem
                        dense
                        onClick={() => {
                            closeMenu();
                            openManageAccess(menuTarget.name, "folder", folder);
                        }}
                        sx={menuItemPermissionsSx}
                    >
                        <SvgIcon sx={{ fontSize: 16, color: "action.active" }}><FontAwesomeIcon icon={faLock} /></SvgIcon>
            Permissions
                    </MenuItem>
                )}
                <MenuItem dense onClick={closeMenu} sx={menuItemDefaultSx}>
          Move to folder
                </MenuItem>
                <MenuItem dense onClick={closeMenu} sx={menuItemDeleteSx}>
          Delete
                </MenuItem>
            </Menu>

            {/* ── Manage access dialog ─────────────────────────────────────────────── */}
            <ManageAccessDialog
                open={manageOpen}
                onClose={() => setManageOpen(false)}
                itemType={manageType}
                initialSettings={manageKey ? (() => {
                    const own = getPerms(manageKey);
                    if (!manageParentKey) {
                        return own;
                    }
                    const effectiveVp = getEffectiveVp(toVp(own), toVp(getPerms(manageParentKey)));
                    return fromVp(effectiveVp, own);
                })() : undefined}
                onSave={handleSavePermissions}
            />

            {/* ── Permission conflict dialog ────────────────────────────────────────── */}
            {conflictInfo && (
                <ConflictDialog
                    open={conflictOpen}
                    onClose={() => setConflictOpen(false)}
                    onFixParent={handleFixParent}
                    parentName={conflictInfo.parentKey}
                    childName={conflictInfo.childKey}
                    childType={conflictInfo.childType}
                    parentVp={toVp(getPerms(conflictInfo.parentKey))}
                    newVp={toVp(conflictInfo.newSettings)}
                    childOwnVp={toVp(getPerms(conflictInfo.childKey))}
                    parentViewUsers={toViewUsers(getPerms(conflictInfo.parentKey))}
                    newViewUsers={toViewUsers(conflictInfo.newSettings)}
                />
            )}
        </Box>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const folderThumbInnerSx: SxProps<Theme> = {
    position: "absolute", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center"
};

const hoverIconBtnSx: SxProps<Theme> = {
    bgcolor: "rgba(255,255,255,0.92)",
    color: "secondary.main",
    boxShadow: "0px 0px 5px rgba(3,25,79,0.25)",
    p: "5px",
    borderRadius: "6px",
    "&:hover": { bgcolor: "background.paper", boxShadow: "0px 0px 8px rgba(3,25,79,0.35)" }
};

const conflictTitleBoxSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: 1
};

const conflictDialogContentSx: SxProps<Theme> = {
    p: "20px 28px", display: "flex", flexDirection: "column", gap: "16px"
};

const conflictDescriptionBoxSx: SxProps<Theme> = {
    display: "flex", flexDirection: "column", gap: "2px"
};

const conflictBodyTextSx: SxProps<Theme> = {
    color: "text.primary", lineHeight: 1.7
};

const conflictTreeBoxSx: SxProps<Theme> = {
    p: "14px 16px", bgcolor: "action.hover",
    borderRadius: "8px", border: "1px solid", borderColor: "divider",
    display: "flex", flexDirection: "column", gap: "10px"
};

const conflictTreeRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap"
};

const conflictTreeNameSx: SxProps<Theme> = {
    color: "text.primary", flex: "1 1 auto", minWidth: 0
};

const conflictTreeBadgeRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "6px"
};

const conflictChildRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "8px", pl: "24px", flexWrap: "wrap"
};

const conflictChildNameSx: SxProps<Theme> = {
    color: "text.secondary", flex: "1 1 auto", minWidth: 0
};

const panelInnerSx: SxProps<Theme> = {
    width:         PANEL_WIDTH,
    flexShrink:    0,
    height:        "100%",
    display:       "flex",
    flexDirection: "column",
    overflow:      "hidden"
};

const headerRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", px: 2, pt: 1.5, pb: 1, flexShrink: 0
};

const headerTitleSx: SxProps<Theme> = {
    color: "text.primary", flex: 1, lineHeight: 1.5
};

const headerIconBtnSx: SxProps<Theme> = {
    color: "action.active"
};

const iconSm18Sx: SxProps<Theme> = {
    fontSize: 18
};

const actionButtonsRowSx: SxProps<Theme> = {
    px: 2, pb: 1.5, display: "flex", gap: "8px", flexShrink: 0
};

const uploadBtnSx: SxProps<Theme> = {
    flex: 1, borderRadius: "8px"
};

const generateBtnSx: SxProps<Theme> = {
    flex: 1, background: GRADIENT_GENERATE, color: "common.white",
    borderRadius: "8px",
    "&:hover": { opacity: 0.88, background: GRADIENT_GENERATE }
};

const recordWrapperSx: SxProps<Theme> = {
    flex: 1, position: "relative"
};

const recordDotSx: SxProps<Theme> = {
    width: 9, height: 9, borderRadius: "50%", bgcolor: "error.main", flexShrink: 0
};

const recordBtnSx: SxProps<Theme> = {
    color: "text.primary", borderColor: "grey.300",
    borderRadius: "8px"
};

const recordNewBadgeSx: SxProps<Theme> = {
    position: "absolute", top: -5, right: -5,
    background: GRADIENT_GENERATE, borderRadius: "4px",
    px: "5px", pt: "1px", pb: "2px", pointerEvents: "none"
};

const recordNewBadgeTextSx: SxProps<Theme> = {
    color: "common.white", lineHeight: 1.5
};

const tabsRowSx: SxProps<Theme> = {
    display: "flex", borderBottom: "1px solid", borderColor: "divider", px: 2, flexShrink: 0
};

const tabsIntegrationBtnSx: SxProps<Theme> = {
    px: 2, display: "flex", alignItems: "center", cursor: "pointer"
};

const actionsRowSx: SxProps<Theme> = {
    px: 2, pt: 1.5, pb: 1,
    display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
};

const actionsLeftGroupSx: SxProps<Theme> = {
    display: "flex", gap: 1, alignItems: "center"
};

const folderPlusBtnSx: SxProps<Theme> = {
    border: "1px solid", borderColor: "grey.300", borderRadius: "8px",
    color: "primary.main", p: "5px"
};

const selectBtnSx: SxProps<Theme> = {
    color: "text.primary", borderColor: "grey.300",
    borderRadius: "8px"
};

const viewToggleGroupSx: SxProps<Theme> = {
    display: "flex", alignItems: "center",
    border: "1px solid", borderColor: "grey.300", borderRadius: "8px", p: "2px", gap: "2px"
};

const searchBoxSx: SxProps<Theme> = {
    px: 2, pb: 1, flexShrink: 0
};

const searchInputSx: SxProps<Theme> = {
    bgcolor: "background.paper",
    borderRadius: "8px",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "grey.300" }
};

const filtersRowSx: SxProps<Theme> = {
    px: 2, pb: 1,
    display: "flex", gap: "6px", alignItems: "center", flexShrink: 0,
    overflowX: "auto", "&::-webkit-scrollbar": { display: "none" }
};

const filterChipBtnSx: SxProps<Theme> = {
    color: "text.secondary", border: "1px solid", borderColor: "grey.300",
    borderRadius: "8px", py: "2px", px: "8px",
    minWidth: "auto", flexShrink: 0
};

const scrollableContentSx: SxProps<Theme> = {
    flex: 1, overflowY: "auto", px: 2
};

const folderHeaderRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", mb: 0.5
};

const backBtnSx: SxProps<Theme> = {
    color: "action.active", mr: "4px", p: "4px"
};

const folderTitleSx: SxProps<Theme> = {
    color: "text.primary", lineHeight: 1.5
};

const folderDividerSx: SxProps<Theme> = {
    borderColor: "divider", mb: 1
};

const folderVisibilityRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center"
};

const folderVisibilityLabelSx: SxProps<Theme> = {
    color: "text.primary", mr: "4px", flexShrink: 0
};

const folderVisibilityBtnSx: SxProps<Theme> = {
    color: "primary.main",
    p: "2px 4px", minWidth: 0
};

const mediaGridSx: SxProps<Theme> = {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", pb: 2
};

const cardSx: SxProps<Theme> = {
    display: "flex", flexDirection: "column",
    cursor: "pointer", borderRadius: "8px", overflow: "visible",
    border: "1px solid", borderColor: "grey.300",
    transition: "box-shadow 0.18s", position: "relative",
    "&:hover": { boxShadow: "0 2px 10px rgba(3,25,79,0.14)" },
    "&:hover .hover-overlay": { opacity: 1 },
    "&:hover .hover-actions": { opacity: 1 }
};

const cardThumbWrapperSx: SxProps<Theme> = {
    borderRadius: "8px 8px 0 0", overflow: "hidden", position: "relative"
};

const cardHoverOverlaySx: SxProps<Theme> = {
    position: "absolute", inset: 0,
    bgcolor: "rgba(3,25,79,0.38)", opacity: 0,
    transition: "opacity 0.18s", pointerEvents: "none",
    borderRadius: "8px 8px 0 0"
};

const cardActionsOverlaySx: SxProps<Theme> = {
    position: "absolute", top: 6, right: 6,
    display: "flex", gap: "4px", zIndex: 2
};

const cardFooterSx: SxProps<Theme> = {
    px: 1, py: "6px", display: "flex", alignItems: "center", gap: "4px", overflow: "hidden"
};

const cardNameTextSx: SxProps<Theme> = {
    color: "text.primary", lineHeight: 1.4,
    flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
};

const cardPermIconWrapperSx: SxProps<Theme> = {
    display: "flex", flexShrink: 0
};

const mediaCardSx: SxProps<Theme> = {
    position: "relative", borderRadius: "8px", overflow: "visible",
    cursor: "pointer", border: "1px solid", borderColor: "grey.300",
    transition: "box-shadow 0.18s",
    "&:hover": { boxShadow: "0 2px 10px rgba(3,25,79,0.14)" },
    "&:hover .hover-overlay": { opacity: 1 },
    "&:hover .hover-actions": { opacity: 1 }
};

const mediaCardInnerSx: SxProps<Theme> = {
    borderRadius: "8px", overflow: "hidden", position: "relative"
};

const mediaCenteredIconSx: SxProps<Theme> = {
    position: "absolute", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center"
};

const mediaHoverOverlaySx: SxProps<Theme> = {
    position: "absolute", inset: 0,
    bgcolor: "rgba(3,25,79,0.38)", opacity: 0,
    transition: "opacity 0.18s", pointerEvents: "none",
    borderRadius: "8px"
};

const mediaDurationBadgeSx: SxProps<Theme> = {
    position: "absolute", bottom: 4, left: 4,
    bgcolor: "rgba(0,0,0,0.62)", borderRadius: "4px", px: "4px", py: "1px",
    pointerEvents: "none"
};

const mediaDurationTextSx: SxProps<Theme> = {
    color: "common.white", lineHeight: 1.4
};

const mediaHoverActionsSx: SxProps<Theme> = {
    position: "absolute", top: 6, right: 6,
    display: "flex", gap: "4px",
    opacity: 0, transition: "opacity 0.18s", zIndex: 2
};

const menuPaperSx: SxProps<Theme> = {
    boxShadow: "0px 0px 5px rgba(3,25,79,0.25)",
    borderRadius: "8px", p: "8px", minWidth: 260, mt: "4px"
};

const menuEditNameBoxSx: SxProps<Theme> = {
    px: 1, pb: "4px"
};

const menuInputBaseSx: SxProps<Theme> = {
    color: "text.primary",
    "& .MuiInputBase-input": {
        p: "4px 6px", borderRadius: "6px",
        border: "1.5px solid transparent", transition: "border 0.15s",
        "&:hover": { border: "1.5px solid", borderColor: "grey.300" },
        "&:focus": { border: "1.5px solid", borderColor: "primary.main" }
    }
};

const menuAddedDateBoxSx: SxProps<Theme> = {
    px: 1, pb: "8px"
};

const menuAddedDateTextSx: SxProps<Theme> = {
    color: "text.secondary", lineHeight: 1.5
};

const menuDividerSx: SxProps<Theme> = {
    borderColor: "divider", mx: -1
};

const menuItemDefaultSx: SxProps<Theme> = {
    borderRadius: "6px", mt: "4px",
    color: "text.primary"
};

const menuItemPermissionsSx: SxProps<Theme> = {
    borderRadius: "6px",
    color: "text.primary",
    display: "flex", alignItems: "center", gap: "8px"
};

const menuItemDeleteSx: SxProps<Theme> = {
    borderRadius: "6px",
    color: "error.main",
    "&:hover": { bgcolor: "rgba(230,40,67,0.06)" }
};
