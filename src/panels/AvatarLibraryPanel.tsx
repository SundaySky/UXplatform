import type { SxProps, Theme } from "@mui/material";
import { useState } from "react";
import {
    Box, Typography, IconButton, Button, Tooltip, SvgIcon,
    Popover, Divider, Badge
} from "@mui/material";
import { TruffleIconButton } from "@sundaysky/smartvideo-hub-truffle-component-library";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPerson, faHexagon, faTrash, faCircleInfo, faLock, faArrowsLeftRight, faPlus, faUpRightAndDownLeftFromCenter, faEllipsisVertical, faXmark, faCircleQuestion } from "@fortawesome/pro-regular-svg-icons";

import AvatarPermissionDialog, {
    type AvatarPermissionSettings,
    type AccessRequest
} from "../dialogs/AvatarPermissionDialog";
import { OWNER_USER } from "../dialogs/ManageAccessDialog";

// ─── Constants ────────────────────────────────────────────────────────────────
const PANEL_WIDTH = 280;
const AVATAR_CREDITS = 340;
const AVATARS_LEFT = 2;

const GRADIENT_BETA =
  "linear-gradient(141.73deg, #EB89F1 12.13%, #D47FEF 22.85%, #C175EE 33.17%, " +
  "#AB6DEC 44.29%, #936BEB 55.41%, #775EE9 66.53%, #5358E7 77.25%, #0053E5 88.37%)";

const navyTooltipSx = {
    bgcolor: "secondary.main", borderRadius: "6px",
    maxWidth: 240, whiteSpace: "pre-line" as const,
    "& .MuiTooltip-arrow": { color: "secondary.main" }
};


// ─── Mock data ─────────────────────────────────────────────────────────────────
interface AvatarItem {
  id: string
  name: string
  img: string | null
  isCustom?: boolean
  createdDate?: string
  createdBy?: string
}

// Requests only on taylor
const MOCK_REQUESTS: Record<string, AccessRequest[]> = {
    taylor: [
        { id: "eb", initials: "EB", color: "#7B1FA2", name: "Eli Bogan", email: "bogane@Sundaysky.com" },
        { id: "ke", initials: "KE", color: "#0288D1", name: "Kenton Emard", email: "emardk@Sundaysky.com" },
        { id: "ss", initials: "SS", color: "#2E7D32", name: "Shea Streich", email: "streichs@Sundaysky.com" },
        { id: "bw", initials: "BW", color: "#E65100", name: "Brigitte Wintheiser", email: "wintheiserb@Sundaysky.com" }
    ]
};

const CUSTOM_AVATARS: AvatarItem[] = [
    { id: "adam", name: "Adam", img: "https://randomuser.me/api/portraits/men/32.jpg", isCustom: true, createdDate: "Dec 29, 2025", createdBy: "You" },
    { id: "chris", name: "Chris (CEO)", img: "https://randomuser.me/api/portraits/men/75.jpg", isCustom: true, createdDate: "Jan 5, 2026", createdBy: "You" },
    { id: "taylor", name: "Taylor", img: "https://randomuser.me/api/portraits/women/44.jpg", isCustom: true, createdDate: "Feb 12, 2026", createdBy: "You" },
    { id: "jordan", name: "Jordan", img: "https://randomuser.me/api/portraits/men/46.jpg", isCustom: true, createdDate: "Mar 1, 2026", createdBy: "You" }
];

const STOCK_AVATARS: AvatarItem[] = [
    { id: "s-chrissy", name: "Chrissy", img: "https://randomuser.me/api/portraits/women/65.jpg" },
    { id: "s-amanda", name: "Amanda", img: "https://randomuser.me/api/portraits/women/17.jpg" },
    { id: "s-ahron", name: "Ahron", img: "https://randomuser.me/api/portraits/men/22.jpg" },
    { id: "s-rachel", name: "Rachel", img: "https://randomuser.me/api/portraits/women/68.jpg" },
    { id: "s-james", name: "James", img: "https://randomuser.me/api/portraits/men/41.jpg" },
    { id: "s-rebecca", name: "Rebecca", img: "https://randomuser.me/api/portraits/women/27.jpg" },
    { id: "s-iema", name: "Iema", img: "https://randomuser.me/api/portraits/women/54.jpg" },
    { id: "s-melissa", name: "Melissa", img: "https://randomuser.me/api/portraits/women/33.jpg" },
    { id: "s-carlos", name: "Carlos", img: "https://randomuser.me/api/portraits/men/57.jpg" },
    { id: "s-diana", name: "Diana", img: "https://randomuser.me/api/portraits/women/72.jpg" },
    { id: "s-ben", name: "Ben", img: "https://randomuser.me/api/portraits/men/15.jpg" },
    { id: "s-grace", name: "Grace", img: "https://randomuser.me/api/portraits/women/49.jpg" }
];

const BETA_AVATARS: AvatarItem[] = [
    { id: "b-alex", name: "Alex", img: "https://randomuser.me/api/portraits/men/88.jpg" },
    { id: "b-morgan", name: "Morgan", img: "https://randomuser.me/api/portraits/women/58.jpg" },
    { id: "b-sam", name: "Sam", img: "https://randomuser.me/api/portraits/men/63.jpg" },
    { id: "b-riley", name: "Riley", img: "https://randomuser.me/api/portraits/women/82.jpg" }
];

// ─── Rounded-square avatar chip (for options menu) ─────────────────────────
function AvatarChip({
    initials,
    color,
    tooltip
}: {
  initials: string
  color: string
  tooltip: string
}) {
    return (
        <Tooltip title={tooltip} placement="top" arrow componentsProps={{ tooltip: { sx: navyTooltipSx } }}>
            <Box sx={{
                width: 28, height: 28,
                bgcolor: color,
                borderRadius: "6px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "default", flexShrink: 0
            }}>
                <Typography variant="caption" sx={chipInitialsSx}>
                    {initials}
                </Typography>
            </Box>
        </Tooltip>
    );
}

// ─── AvatarCard ───────────────────────────────────────────────────────────────
function AvatarCard({
    avatar,
    anyActive,
    isActive,
    onAdd,
    permSettings,
    requestCount,
    onOpenMenu
}: {
  avatar: AvatarItem
  anyActive: boolean // any avatar is currently in scene
  isActive: boolean // this specific avatar is the active one
  onAdd: (id: string) => void
  permSettings?: AvatarPermissionSettings
  requestCount?: number
  onOpenMenu?: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void
}) {
    const [hovered, setHovered] = useState(false);
    const perm = permSettings?.usagePermission ?? "everyone";
    const showPermIcon = perm !== "everyone";

    const permTooltip = perm === "private"
        ? "Only you can use this avatar. Everyone else can view it."
        : "Only specific users can use this custom avatar. Everyone else can see it.";

    // Button label: if any avatar is active → Replace, otherwise Add (icon already shows +)
    const btnLabel = anyActive ? "Replace" : "Add";

    return (
        <Box
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                borderRadius: "8px",
                overflow: "hidden",
                border: isActive
                    ? "2px solid"
                    : "1px solid",
                borderColor: isActive ? "primary.main" : "divider",
                cursor: "pointer",
                position: "relative",
                bgcolor: hovered ? "grey.50" : "background.paper",
                transition: "box-shadow 0.15s",
                boxShadow: hovered ? "0 2px 8px rgba(3,25,79,0.14)" : "none"
            }}
        >
            {/* Photo area */}
            <Box sx={cardPhotoAreaSx}>
                {avatar.img ? (
                    <Box
                        component="img"
                        src={avatar.img}
                        alt={avatar.name}
                        sx={cardImgSx}
                    />
                ) : (
                    <Box sx={cardPlaceholderBoxSx}>
                        <SvgIcon sx={cardPlaceholderIconSx}><FontAwesomeIcon icon={faPerson} /></SvgIcon>
                    </Box>
                )}

                {/* Hover overlay — action buttons */}
                {hovered && (
                    <Box sx={cardHoverOverlaySx}>
                        {/* + Add / Replace */}
                        <Button
                            variant="contained"
                            color="white"
                            size="small"
                            startIcon={
                                anyActive
                                    ? <SvgIcon sx={overlayBtnIconSx}><FontAwesomeIcon icon={faArrowsLeftRight} /></SvgIcon>
                                    : <SvgIcon sx={overlayBtnIconSx}><FontAwesomeIcon icon={faPlus} /></SvgIcon>
                            }
                            onClick={e => {
                                e.stopPropagation(); onAdd(avatar.id);
                            }}
                        >
                            {btnLabel}
                        </Button>

                        {/* Spacer */}
                        <Box sx={spacerSx} />

                        {/* Expand preview */}
                        <Tooltip title="Preview" placement="top" arrow
                            componentsProps={{ tooltip: { sx: navyTooltipSx } }}
                        >
                            <TruffleIconButton
                                variant="contained"
                                color="white"
                                size="small"
                                onClick={e => e.stopPropagation()}
                                placeholder={undefined}
                                onPointerEnterCapture={undefined}
                                onPointerLeaveCapture={undefined}
                            >
                                <SvgIcon sx={overlaySmallIconSx}><FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} /></SvgIcon>
                            </TruffleIconButton>
                        </Tooltip>

                        {/* Three-dot options (custom avatars only) */}
                        {avatar.isCustom && onOpenMenu && (
                            <TruffleIconButton
                                variant="contained"
                                color="white"
                                size="small"
                                onClick={e => {
                                    e.stopPropagation(); onOpenMenu(e, avatar.id);
                                }}
                                placeholder={undefined}
                                onPointerEnterCapture={undefined}
                                onPointerLeaveCapture={undefined}
                            >
                                <SvgIcon sx={overlaySmallIconSx}><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                            </TruffleIconButton>
                        )}
                    </Box>
                )}

                {/* Request count badge */}
                {(requestCount ?? 0) > 0 && (
                    <Box sx={requestBadgeBoxSx}>
                        <Typography variant="caption" sx={requestBadgeTextSx}>
                            {requestCount} request{requestCount !== 1 ? "s" : ""}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Name label row */}
            <Box sx={nameLabelRowSx}>
                <Typography variant="caption" sx={nameTextSx}>
                    {avatar.name}
                </Typography>

                {/* Permission icon (custom avatars only, non-everyone) */}
                {showPermIcon && (
                    <Tooltip
                        title={permTooltip}
                        placement="top"
                        arrow
                        componentsProps={{ tooltip: { sx: navyTooltipSx } }}
                    >
                        <Box sx={permIconBoxSx}>
                            {perm === "private"
                                ? <SvgIcon sx={privateLockIconSx}><FontAwesomeIcon icon={faLock} /></SvgIcon>
                                : <SvgIcon sx={specificLockIconSx}><FontAwesomeIcon icon={faLock} /></SvgIcon>}
                        </Box>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
}

// ─── AvatarGrid ───────────────────────────────────────────────────────────────
function AvatarGrid({
    avatars,
    activeAvatarId,
    onAdd,
    permMap,
    requestsMap,
    onOpenMenu
}: {
  avatars: AvatarItem[]
  activeAvatarId: string | null
  onAdd: (id: string) => void
  permMap?: Record<string, AvatarPermissionSettings>
  requestsMap?: Record<string, AccessRequest[]>
  onOpenMenu?: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void
}) {
    const anyActive = activeAvatarId !== null;

    return (
        <Box sx={avatarGridSx}>
            {avatars.map(av => (
                <AvatarCard
                    key={av.id}
                    avatar={av}
                    anyActive={anyActive}
                    isActive={activeAvatarId === av.id}
                    onAdd={onAdd}
                    permSettings={permMap?.[av.id]}
                    requestCount={requestsMap?.[av.id]?.length ?? 0}
                    onOpenMenu={onOpenMenu}
                />
            ))}
        </Box>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AvatarLibraryPanel({
    open,
    onClose,
    onTotalRequestsChange
}: {
  open: boolean
  onClose: () => void
  onTotalRequestsChange?: (count: number) => void
}) {
    const [tab, setTab] = useState<0 | 1 | 2 | 3>(0);

    // Track which avatar is currently placed in the scene (single at a time)
    const [activeAvatarId, setActiveAvatarId] = useState<string | null>(null);
    // Accumulate all avatars ever placed (for Used in video tab)
    const [usedAvatarIds, setUsedAvatarIds] = useState<Set<string>>(new Set<string>());

    // Permission settings per custom avatar
    const [permMap, setPermMap] = useState<Record<string, AvatarPermissionSettings>>({});

    // Pending requests per custom avatar
    const [requestsMap, setRequestsMap] = useState<Record<string, AccessRequest[]>>(MOCK_REQUESTS);

    // Context menu — track by position for reliable placement
    const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [menuAvatarId, setMenuAvatarId] = useState<string | null>(null);

    // Permission dialog
    const [permDialogOpen, setPermDialogOpen] = useState(false);
    const [permDialogAvatarId, setPermDialogAvatarId] = useState<string | null>(null);

    const menuAvatar = CUSTOM_AVATARS.find(a => a.id === menuAvatarId);
    const menuApprovers = menuAvatarId ? (permMap[menuAvatarId]?.approverUsers ?? [OWNER_USER]) : [OWNER_USER];

    const permDialogAvatar = CUSTOM_AVATARS.find(a => a.id === permDialogAvatarId);

    // Compute avatars used in video (dynamic, based on usedAvatarIds)
    const usedInVideo: AvatarItem[] = [
        ...CUSTOM_AVATARS.filter(a => usedAvatarIds.has(a.id)),
        ...STOCK_AVATARS.filter(a => usedAvatarIds.has(a.id))
    ];

    function totalRequests() {
        return Object.values(requestsMap).reduce((n, arr) => n + arr.length, 0);
    }

    function handleAdd(id: string) {
        setActiveAvatarId(id);
        setUsedAvatarIds(prev => new Set([...prev, id]));
    }

    function openMenu(e: React.MouseEvent<HTMLButtonElement>, id: string) {
        const rect = e.currentTarget.getBoundingClientRect();
        // Anchor top-right corner of menu to bottom-right of button
        setMenuPos({ top: rect.bottom + 4, left: rect.right });
        setMenuAvatarId(id);
    }

    function closeMenu() {
        setMenuAvatarId(null);
    }

    function handleOpenPermDialog() {
        setPermDialogAvatarId(menuAvatarId);
        setPermDialogOpen(true);
    // Don't close menu — it stays behind the dialog and re-appears on dialog close
    }

    function handleSavePermissions(s: AvatarPermissionSettings, remaining: AccessRequest[]) {
        if (!permDialogAvatarId) {
            return;
        }
        setPermMap(prev => ({ ...prev, [permDialogAvatarId]: s }));
        setRequestsMap(prev => {
            const next = { ...prev, [permDialogAvatarId]: remaining };
            const total = Object.values(next).reduce((n, arr) => n + arr.length, 0);
            onTotalRequestsChange?.(total);
            return next;
        });
        setPermDialogOpen(false);
    }

    const tabs: { label: string; isBeta?: boolean }[] = [
        { label: "Custom" },
        { label: "Beta", isBeta: true },
        { label: "Stock" },
        { label: "Used in video" }
    ];

    const total = totalRequests();

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <>
            <Box sx={{
                width:       open ? PANEL_WIDTH : 0,
                flexShrink:  0,
                overflow:    "hidden",
                transition:  "width 0.26s cubic-bezier(0.4,0,0.2,1)",
                bgcolor:     "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
                display:     "flex",
                height:      "100%"
            }}>
                <Box sx={panelInnerSx}>

                    {/* ── Header ───────────────────────────────────────────────── */}
                    <Box sx={headerRowSx}>
                        <Typography variant="h3" sx={headerTitleSx}>
              Avatars
                        </Typography>

                        {/* Credit badge */}
                        <Tooltip title="Avatar credits" placement="bottom" arrow
                            componentsProps={{ tooltip: { sx: navyTooltipSx } }}
                        >
                            <Box sx={creditBadgeBoxSx}>
                                <SvgIcon sx={creditBadgeIconSx}><FontAwesomeIcon icon={faHexagon} /></SvgIcon>
                                <Typography variant="caption" sx={creditBadgeTextSx}>
                                    {AVATAR_CREDITS}
                                </Typography>
                            </Box>
                        </Tooltip>

                        <IconButton size="small" sx={headerIconBtnSx}>
                            <SvgIcon sx={headerIconSizeSx}><FontAwesomeIcon icon={faCircleQuestion} /></SvgIcon>
                        </IconButton>
                        <IconButton size="small" onClick={onClose} sx={headerIconBtnSx}>
                            <SvgIcon sx={headerIconSizeSx}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                        </IconButton>
                    </Box>

                    {/* ── Tabs ──────────────────────────────────────────────── */}
                    <Box sx={tabsRowSx}>
                        {tabs.map(({ label, isBeta }, i) => (
                            <Box
                                key={label}
                                onClick={() => setTab(i as 0 | 1 | 2 | 3)}
                                sx={{
                                    flexShrink: 0,
                                    py: "8px",
                                    px: "5px",
                                    cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                                    borderBottom: tab === i ? "2px solid" : "2px solid transparent",
                                    borderBottomColor: tab === i ? "secondary.main" : "transparent",
                                    mb: "-1px",
                                    userSelect: "none"
                                }}
                            >
                                {isBeta ? (
                                    <Box sx={betaGradientBoxSx}>
                                        <Typography variant="caption" sx={betaLabelTextSx}>
                      Beta
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="caption" sx={{
                                        color: tab === i ? "secondary.main" : "text.disabled",
                                        whiteSpace: "nowrap"
                                    }}>
                                        {label}
                                    </Typography>
                                )}
                                {/* Request badge on Custom tab */}
                                {label === "Custom" && total > 0 && (
                                    <Badge
                                        badgeContent={total}
                                        color="error"
                                        sx={customTabBadgeSx}
                                    />
                                )}
                            </Box>
                        ))}
                    </Box>

                    {/* ── Scrollable content ────────────────────────────────── */}
                    <Box sx={scrollableContentSx}>

                        {/* Custom tab */}
                        {tab === 0 && (
                            <Box>
                                <Box sx={createAvatarPaddingBoxSx}>
                                    <Button
                                        variant="outlined" fullWidth
                                        startIcon={<SvgIcon sx={createAvatarBtnIconSx}><FontAwesomeIcon icon={faPlus} /></SvgIcon>}
                                        sx={createAvatarBtnSx}
                                    >
                                        <Box sx={createAvatarBtnLabelBoxSx}>Create Avatar</Box>
                                        <Typography variant="caption" sx={createAvatarCreditsTextSx}>
                                            {AVATARS_LEFT} left
                                        </Typography>
                                    </Button>
                                </Box>
                                <AvatarGrid
                                    avatars={CUSTOM_AVATARS}
                                    activeAvatarId={activeAvatarId}
                                    onAdd={handleAdd}
                                    permMap={permMap}
                                    requestsMap={requestsMap}
                                    onOpenMenu={openMenu}
                                />
                            </Box>
                        )}

                        {/* Beta tab */}
                        {tab === 1 && (
                            <AvatarGrid
                                avatars={BETA_AVATARS}
                                activeAvatarId={activeAvatarId}
                                onAdd={handleAdd}
                            />
                        )}

                        {/* Stock tab */}
                        {tab === 2 && (
                            <AvatarGrid
                                avatars={STOCK_AVATARS}
                                activeAvatarId={activeAvatarId}
                                onAdd={handleAdd}
                            />
                        )}

                        {/* Used in video tab — only shows dynamically added avatars */}
                        {tab === 3 && (
                            usedInVideo.length > 0 ? (
                                <AvatarGrid
                                    avatars={usedInVideo}
                                    activeAvatarId={activeAvatarId}
                                    onAdd={handleAdd}
                                    permMap={permMap}
                                    requestsMap={requestsMap}
                                    onOpenMenu={openMenu}
                                />
                            ) : (
                                <Box sx={emptyStateBoxSx}>
                                    <SvgIcon sx={emptyStateIconSx}><FontAwesomeIcon icon={faPerson} /></SvgIcon>
                                    <Typography variant="caption" sx={emptyStateTextSx}>
                    No avatars are featured in this video yet.
                                    </Typography>
                                </Box>
                            )
                        )}
                    </Box>
                </Box>
            </Box>

            {/* ── Context menu popover ──────────────────────────────────────────── */}
            <Popover
                open={Boolean(menuAvatarId) && !permDialogOpen}
                anchorReference="anchorPosition"
                anchorPosition={menuPos}
                onClose={closeMenu}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                    sx: popoverPaperSx
                }}
            >
                {menuAvatar && (
                    <Box>
                        {/* Header */}
                        <Box sx={menuHeaderBoxSx}>
                            <Typography variant="h5" sx={menuAvatarNameSx}>
                                {menuAvatar.name}
                            </Typography>
                            <Typography variant="caption" sx={menuCreatedDateSx}>
                Created: {menuAvatar.createdDate}, {menuAvatar.createdBy}
                            </Typography>
                        </Box>

                        <Divider sx={menuDividerSx} />

                        {/* Manage permissions row — icon + label + user chips inline */}
                        <Box
                            onClick={handleOpenPermDialog}
                            sx={managePermRowSx}
                        >
                            <SvgIcon sx={managePermIconSx}><FontAwesomeIcon icon={faLock} /></SvgIcon>
                            <Typography variant="caption" sx={managePermLabelSx}>
                Manage usage permission
                            </Typography>
                            {/* User chips — approvers + requesters */}
                            <Box sx={chipsRowSx}>
                                {menuApprovers.map(user => (
                                    <AvatarChip
                                        key={user.id}
                                        initials={user.initials}
                                        color={user.color}
                                        tooltip={`${user.name}\nCan manage access, delete, and rename.`}
                                    />
                                ))}
                                {(menuAvatarId ? (requestsMap[menuAvatarId] ?? []) : []).map(req => (
                                    <AvatarChip
                                        key={req.id}
                                        initials={req.initials}
                                        color={req.color}
                                        tooltip={`${req.name}\nRequested access`}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <Divider sx={menuDividerSx} />

                        {/* Details */}
                        <Box sx={menuDetailsSectionBoxSx}>
                            <Box
                                sx={menuDetailsRowSx}
                                onClick={closeMenu}
                            >
                                <SvgIcon sx={menuDetailsIconSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                                <Typography variant="caption" sx={menuDetailsLabelSx}>
                  Details
                                </Typography>
                            </Box>
                        </Box>

                        {/* Delete */}
                        <Box sx={menuDeleteSectionBoxSx}>
                            <Box
                                sx={menuDeleteRowSx}
                                onClick={closeMenu}
                            >
                                <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faTrash} /></SvgIcon>
                                <Typography variant="caption" sx={menuDeleteLabelSx}>
                  Delete
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Popover>

            {/* ── Avatar permission dialog ────────────────────────────────────── */}
            {permDialogAvatar && (
                <AvatarPermissionDialog
                    open={permDialogOpen}
                    onClose={() => setPermDialogOpen(false)}
                    avatarName={permDialogAvatar.name}
                    initialSettings={permMap[permDialogAvatar.id]}
                    initialRequests={requestsMap[permDialogAvatar.id] ?? []}
                    onSave={handleSavePermissions}
                />
            )}
        </>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

// AvatarChip
const chipInitialsSx: SxProps<Theme> = {
    color: "common.white", lineHeight: 1
};

// AvatarCard
const cardPhotoAreaSx: SxProps<Theme> = {
    position: "relative",
    width: "100%",
    paddingTop: "100%",
    bgcolor: "grey.100",
    overflow: "hidden"
};

const cardImgSx: SxProps<Theme> = {
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    objectFit: "cover"
};

const cardPlaceholderBoxSx: SxProps<Theme> = {
    position: "absolute", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center"
};

const cardPlaceholderIconSx: SxProps<Theme> = {
    fontSize: 52, color: "action.disabled"
};

const cardHoverOverlaySx: SxProps<Theme> = {
    position: "absolute",
    top: 0, left: 0, right: 0,
    display: "flex", alignItems: "flex-start",
    p: "6px",
    gap: "4px"
};

const overlayBtnIconSx: SxProps<Theme> = {
    fontSize: "14px !important"
};

const spacerSx: SxProps<Theme> = {
    flex: 1
};

const overlaySmallIconSx: SxProps<Theme> = {
    fontSize: 14
};

const requestBadgeBoxSx: SxProps<Theme> = {
    position: "absolute", bottom: 8, left: 8,
    bgcolor: "error.main", color: "common.white",
    borderRadius: "10px", px: "8px", py: "2px",
    display: "flex", alignItems: "center"
};

const requestBadgeTextSx: SxProps<Theme> = {
    color: "common.white", lineHeight: 1
};

const nameLabelRowSx: SxProps<Theme> = {
    px: "10px", py: "6px", display: "flex", alignItems: "center", gap: "4px"
};

const nameTextSx: SxProps<Theme> = {
    color: "text.primary", lineHeight: 1.5,
    flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
};

const permIconBoxSx: SxProps<Theme> = {
    display: "flex", cursor: "default"
};

const privateLockIconSx: SxProps<Theme> = {
    fontSize: 14, color: "success.main"
};

const specificLockIconSx: SxProps<Theme> = {
    fontSize: 14, color: "warning.main"
};

// AvatarGrid
const avatarGridSx: SxProps<Theme> = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
    p: "12px"
};

// AvatarLibraryPanel — panel structure
const panelInnerSx: SxProps<Theme> = {
    width:         PANEL_WIDTH,
    flexShrink:    0,
    height:        "100%",
    display:       "flex",
    flexDirection: "column",
    overflow:      "hidden"
};

const headerRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center",
    px: 2, pt: 1.5, pb: 1, flexShrink: 0, gap: "6px"
};

const headerTitleSx: SxProps<Theme> = {
    color: "text.primary", flex: 1, lineHeight: 1.5
};

const creditBadgeBoxSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "4px",
    bgcolor: "primary.light",
    border: "1px solid",
    borderColor: "primary.main",
    borderRadius: "12px",
    px: "10px", py: "3px",
    cursor: "default"
};

const creditBadgeIconSx: SxProps<Theme> = {
    fontSize: 13, color: "primary.main"
};

const creditBadgeTextSx: SxProps<Theme> = {
    color: "primary.main", lineHeight: 1
};

const headerIconBtnSx: SxProps<Theme> = {
    color: "action.active"
};

const headerIconSizeSx: SxProps<Theme> = {
    fontSize: 18
};

const tabsRowSx: SxProps<Theme> = {
    display: "flex", borderBottom: "1px solid", borderColor: "divider",
    flexShrink: 0
};

const betaGradientBoxSx: SxProps<Theme> = {
    background: GRADIENT_BETA, borderRadius: "4px",
    px: "8px", pt: "2px", pb: "3px"
};

const betaLabelTextSx: SxProps<Theme> = {
    color: "common.white", lineHeight: 1.5
};

const customTabBadgeSx: SxProps<Theme> = {
    ml: "4px", "& .MuiBadge-badge": { fontSize: 9, minWidth: 16, height: 16, padding: 0, position: "relative", transform: "none" }
};

const scrollableContentSx: SxProps<Theme> = {
    flex: 1, overflowY: "auto"
};

const createAvatarPaddingBoxSx: SxProps<Theme> = {
    px: 2, pt: 2, pb: 0
};

const createAvatarBtnIconSx: SxProps<Theme> = {
    fontSize: "16px !important"
};

const createAvatarBtnSx: SxProps<Theme> = {
    justifyContent: "flex-start",
    color: "primary.main", borderColor: "grey.300",
    borderRadius: "8px", py: "7px",
    "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" }
};

const createAvatarBtnLabelBoxSx: SxProps<Theme> = {
    flex: 1, textAlign: "left"
};

const createAvatarCreditsTextSx: SxProps<Theme> = {
    color: "text.secondary"
};

const emptyStateBoxSx: SxProps<Theme> = {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    py: 6, px: 4, gap: 1
};

const emptyStateIconSx: SxProps<Theme> = {
    fontSize: 40, color: "action.disabled"
};

const emptyStateTextSx: SxProps<Theme> = {
    color: "text.secondary", textAlign: "center"
};

// Popover / context menu
const popoverPaperSx: SxProps<Theme> = {
    borderRadius: "10px", minWidth: 260, maxWidth: 310,
    boxShadow: "0 4px 20px rgba(3,25,79,0.18)",
    p: 0, overflow: "hidden"
};

const menuHeaderBoxSx: SxProps<Theme> = {
    px: 2, pt: 1.5, pb: 1
};

const menuAvatarNameSx: SxProps<Theme> = {
    color: "text.primary"
};

const menuCreatedDateSx: SxProps<Theme> = {
    color: "text.secondary", mt: "2px"
};

const menuDividerSx: SxProps<Theme> = {
    borderColor: "divider"
};

const managePermRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "8px",
    px: 2, py: 1.25, cursor: "pointer",
    "&:hover": { bgcolor: "action.hover" }
};

const managePermIconSx: SxProps<Theme> = {
    fontSize: 18, color: "action.active", flexShrink: 0
};

const managePermLabelSx: SxProps<Theme> = {
    color: "text.primary", flex: 1
};

const chipsRowSx: SxProps<Theme> = {
    display: "flex", gap: "4px", alignItems: "center", flexShrink: 0
};

const menuDetailsSectionBoxSx: SxProps<Theme> = {
    px: 2, pt: 1, pb: "4px"
};

const menuDetailsRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: 1,
    cursor: "pointer", py: "4px", px: "4px", borderRadius: "6px",
    color: "text.primary",
    "&:hover": { bgcolor: "action.hover" }
};

const menuDetailsIconSx: SxProps<Theme> = {
    fontSize: 18, color: "action.active"
};

const menuDetailsLabelSx: SxProps<Theme> = {
    color: "text.primary"
};

const menuDeleteSectionBoxSx: SxProps<Theme> = {
    px: 2, pt: "4px", pb: 1
};

const menuDeleteRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: 1,
    cursor: "pointer", py: "4px", px: "4px", borderRadius: "6px",
    color: "error.main",
    "&:hover": { bgcolor: "rgba(230,40,67,0.06)" }
};

const menuDeleteLabelSx: SxProps<Theme> = {
    color: "error.main"
};
