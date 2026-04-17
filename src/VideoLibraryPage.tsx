import { useState, useRef, useCallback } from "react";
import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    AppBar, Badge, Box, Button, Card, Chip, Divider, IconButton, List, ListItemButton,
    ListItemIcon, ListItemText, Menu, SvgIcon, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Toolbar, ToggleButton, Typography
} from "@mui/material";
import {
    Label, Search, TruffleAvatar, ThumbnailActions, ThumbnailActionsButton,
    ThumbnailActionsIconButton, TruffleToggleButtonGroup, ToggleIconButton,
    TruffleMenuItem, TypographyWithTooltipOnOverflow
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPen, faEllipsisVertical, faBars, faFolderPlus, faFolder, faPlus, faImages, faLightbulb, faChartBar, faCopy, faShare, faCircleInfo, faLock, faLayerGroup, faBoxArchive, faTrash, faUsers, faComment, faArrowUpRightFromSquare, faFilm, faArrowDown } from "@fortawesome/pro-regular-svg-icons";
import { faChevronLeft, faChevronRight, faGrip } from "@fortawesome/pro-solid-svg-icons";
import VideoPermissionDialog, { type VideoPermissionSettings } from "./VideoPermissionDialog";
import AccountSettingsDialog from "./AccountSettingsDialog";
import ApprovalDialog from "./ApprovalDialog";
import ConfirmationDialog from "./ConfirmationDialog";
import { NotificationBell, type NotificationItem } from "./NotificationsPanel";
import { TOTAL_COMMENT_COUNT } from "./StudioPage";
import { OWNER_USER } from "./ManageAccessDialog";

// ─── Figma asset image — split template (HEADING PLACEHOLDER left + media right)
const IMG_THUMB = "/thumb.svg";

// ─── Per-video live state (mirrored from App) ─────────────────────────────────
export interface LiveVideoState {
  phase: number
  pageState: "draft" | "pending"
  sentApprovers: string[]
  headingText?: string
  subheadingText?: string
  permSettings?: VideoPermissionSettings
}

const PHASE_TO_PENDING: Record<number, boolean> = { 0: false, 1: true, 2: true, 3: false, 4: false };

const APPROVER_NAMES: Record<string, string> = {
    sjohnson:   "Sarah Johnson",
    mchen:      "Michael Chen",
    erodriguez: "Emma Rodriguez",
    jwilson:    "James Wilson"
};
function approverName(key: string) {
    return APPROVER_NAMES[key] ?? key;
}
function formatNames(keys: string[]) {
    const names = keys.map(approverName);
    if (names.length === 0) {
        return "";
    }
    if (names.length === 1) {
        return names[0];
    }
    if (names.length === 2) {
        return `${names[0]} and ${names[1]}`;
    }
    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function resolveStatuses(
    video: VideoItem,
    videoStates?: Record<string, LiveVideoState>
): StatusKey[] {
    const state = videoStates?.[video.title];
    if (!state) {
        return video.statuses;
    }
    const { phase, pageState } = state;
    if (phase >= 3) {
        return ["Approved for sharing"];
    }
    const isPending = phase > 0 ? PHASE_TO_PENDING[phase] : pageState === "pending";
    return [isPending ? "Pending approval" : "Draft"];
}

// ─── Status chip config ───────────────────────────────────────────────────────
export type StatusKey =
  | "Draft"
  | "Approved for sharing"
  | "Downloaded for Sharing"
  | "Downloaded"
  | "Live"
  | "Shared"
  | "Pending approval"

const STATUS_LABEL_MAP: Record<StatusKey, { color: "default" | "info" | "success" | "error" }> = {
    "Draft":                  { color: "default" },
    "Approved for sharing":   { color: "info" },
    "Downloaded for Sharing": { color: "success" },
    "Downloaded":             { color: "info" },
    "Live":                   { color: "error" },
    "Shared":                 { color: "info" },
    "Pending approval":       { color: "default" }
};

function StatusLabel({ status }: { status: StatusKey }) {
    const cfg = STATUS_LABEL_MAP[status];
    return <Label label={status} color={cfg.color} />;
}

// ─── Approval status icon ─────────────────────────────────────────────────────
function ApprovalStatusIcon({ state, totalComments }: { state: LiveVideoState; totalComments: number }) {
    const { phase, pageState, sentApprovers } = state;
    if (phase === 0 && pageState === "draft") {
        return null;
    }
    if (phase >= 3) {
        return null;
    }

    let icon: typeof faUsers | typeof faComment;
    let color: string;
    let tip: string;

    if (phase === 0 && pageState === "pending") {
        icon = faUsers;
        color = "success.main";
        const names = sentApprovers.length > 0 ? formatNames(sentApprovers) : "approvers";
        tip = `Awaiting response from ${names}`;
    }
    else if (phase === 1) {
        icon = faUsers;
        color = "warning.main";
        const total = sentApprovers.length;
        const pending = sentApprovers.slice(1);
        const remaining = pending.length > 0 ? formatNames(pending) : "remaining approver";
        tip = `1 of ${total} approver${total !== 1 ? "s" : ""} responded. Waiting for ${remaining}`;
    }
    else if (phase === 2) {
        icon = faComment;
        color = "primary.main";
        tip = `${totalComments} comments from approvers ready to view`;
    }
    else {
        return null;
    }

    return (
        <Box sx={approvalIconContainerSx} title={tip}>
            <SvgIcon sx={{ fontSize: 16, color }}>
                <FontAwesomeIcon icon={icon} />
            </SvgIcon>
        </Box>
    );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
function VideoThumbnail({ headingText, subheadingText }: { headingText?: string; subheadingText?: string }) {
    return (
        <Box sx={thumbnailWrapperSx}>
            <Box component="img" src={IMG_THUMB} alt="" sx={thumbnailImgSx} />
            {/* Left half — white bg */}
            <Box sx={thumbnailLeftHalfSx}>
                <Box sx={thumbnailAccentLineSx} />
            </Box>
            {/* Right half — drag media */}
            <Box sx={thumbnailRightHalfSx}>
                <SvgIcon sx={thumbnailDragIconSx}>
                    <FontAwesomeIcon icon={faImages} />
                </SvgIcon>
                <Typography variant="caption" sx={thumbnailDragTextSx}>
                    Drag media here
                </Typography>
            </Box>
            {/* Text overlays — canvas-specific cqw units */}
            <Box sx={thumbnailTextAreaSx}>
                <Typography sx={thumbnailHeadingSx}>
                    {headingText ?? "Heading Placeholder"}
                </Typography>
                <Typography sx={thumbnailSubheadingSx}>
                    {subheadingText ?? "Sub-heading Placeholder"}
                </Typography>
            </Box>
            {/* Footnote */}
            <Box sx={thumbnailFootnoteSx}>
                <Typography sx={thumbnailFootnoteTextSx}>
                    Footnote placeholder
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Video item type ──────────────────────────────────────────────────────────
export interface VideoItem {
  title: string
  subtitle?: string
  editedBy: string
  statuses: StatusKey[]
  personalized: boolean
}

// ─── Permission avatar group ──────────────────────────────────────────────────
export function PermAvatarGroup({ settings, coloredAvatars = true }: { settings?: VideoPermissionSettings; coloredAvatars?: boolean }) {
    const s = settings ?? {
        tab: "teams" as const, everyoneRole: "viewer" as const,
        users: [], ownerUsers: [OWNER_USER], noDuplicate: false
    };
    const { tab, everyoneRole, users, ownerUsers } = s;

    const miniAvatar = (key: string, content: React.ReactNode, tip: string, bgColor?: string) => (
        <Box
            key={key}
            title={tip}
            sx={{
                ...miniAvatarBaseSx,
                bgcolor: coloredAvatars && bgColor ? bgColor : "divider",
                color: coloredAvatars && bgColor ? "common.white" : "text.primary"
            }}
        >
            {content}
        </Box>
    );

    if (tab === "private") {
        return (
            <Typography variant="caption" sx={permPrivateLabelSx}>
                Just me
            </Typography>
        );
    }

    return (
        <Box sx={permAvatarGroupSx}>
            {ownerUsers.slice(0, 2).map(u =>
                miniAvatar(u.id,
                    <Typography variant="caption" sx={miniAvatarTextSx}>{u.initials}</Typography>,
                    `${u.name}${u.id === OWNER_USER.id ? " (You)" : ""} — Owner`,
                    u.color
                )
            )}
            {users.filter(pu => pu.role === "editor").slice(0, 2).map(pu =>
                miniAvatar(pu.user.id,
                    <Typography variant="caption" sx={miniAvatarTextSx}>{pu.user.initials}</Typography>,
                    `${pu.user.name} — Can edit`,
                    pu.user.color
                )
            )}
            {users.filter(pu => pu.role === "viewer").slice(0, 1).map(pu =>
                miniAvatar(pu.user.id + "_v",
                    <Typography variant="caption" sx={miniAvatarTextSx}>{pu.user.initials}</Typography>,
                    `${pu.user.name} — Can view`,
                    pu.user.color
                )
            )}
            {everyoneRole !== "restricted" &&
                miniAvatar("everyone",
                    <SvgIcon sx={everyoneAvatarIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>,
                    `Everyone in your account — Can ${everyoneRole === "editor" ? "edit" : "view"}`
                )
            }
        </Box>
    );
}

// ─── Video card ───────────────────────────────────────────────────────────────
function VideoCard({
    video, onClick, liveState, onPermChange, onSubmitForApproval,
    approversList, approvalsEnabled = false, onApprovalsDisabled
}: {
  video: VideoItem
  onClick?: () => void
  liveState?: LiveVideoState
  onPermChange?: (key: string, s: VideoPermissionSettings) => void
  onSubmitForApproval?: (videoKey: string, approvers: string[]) => void
  approversList?: { value: string; label: string }[]
  approvalsEnabled?: boolean
  onApprovalsDisabled?: () => void
}) {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [videoPermOpen, setVideoPermOpen] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmApprovers, setConfirmApprovers] = useState<string[]>([]);
    const [approvalOpen, setApprovalOpen] = useState(false);
    const savedMenuAnchor = useRef<HTMLElement | null>(null);

    const videoPermSettings = liveState?.permSettings;

    const openMenu = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setMenuAnchor(e.currentTarget);
    };
    const closeMenu = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setMenuAnchor(null);
    };

    return (
        <Card
            elevation={1}
            onClick={() => {
                if (approvalOpen || confirmationOpen || videoPermOpen) {
                    return;
                }
                onClick?.();
            }}
            sx={videocardSx}
        >
            {/* Thumbnail with ThumbnailActions hover overlay */}
            <ThumbnailActions
                showActions="onHover"
                leftActions={
                    <ThumbnailActionsIconButton size="small">
                        <FontAwesomeIcon icon={faPlay} />
                    </ThumbnailActionsIconButton>
                }
                rightActions={
                    <ThumbnailActionsButton
                        size="small"
                        startIcon={<FontAwesomeIcon icon={faPen} />}
                    >
                        Edit
                    </ThumbnailActionsButton>
                }
                ContentProps={{ sx: thumbnailContentPropsSx }}
            >
                <VideoThumbnail
                    headingText={liveState?.headingText ?? video.title}
                    subheadingText={liveState?.subheadingText}
                />
            </ThumbnailActions>

            {/* Card body */}
            <Box sx={cardBodySx}>
                {/* Title + 3-dots */}
                <Box sx={cardTitleRowSx}>
                    <TypographyWithTooltipOnOverflow variant="h5" multiline sx={cardTitleSx}>
                        {video.title}
                    </TypographyWithTooltipOnOverflow>
                    <ToggleButton
                        size="small"
                        value="menu"
                        selected={Boolean(menuAnchor)}
                        onClick={openMenu}
                        sx={threeDotsBtnSx}
                    >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </ToggleButton>
                </Box>

                {/* Edited by */}
                <Typography variant="body1" noWrap sx={editedByTextSx}>
                    {video.editedBy}
                </Typography>

                {/* Status labels */}
                <Box sx={statusRowSx}>
                    {video.statuses.map(s => <StatusLabel key={s} status={s} />)}
                    {video.personalized && (
                        <Label label="Personalized" color="default" variant="outlined"
                            startIcon={<SvgIcon sx={personalizedLabelIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>}
                        />
                    )}
                    {liveState && <ApprovalStatusIcon state={liveState} totalComments={TOTAL_COMMENT_COUNT} />}
                </Box>
            </Box>

            {/* 3-dots dropdown menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => closeMenu()}
                onClick={e => e.stopPropagation()}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: menuPaperSx } }}
            >
                {/* Header: video name */}
                <Box sx={menuHeaderSx} onClick={e => e.stopPropagation()}>
                    <Typography variant="h5" sx={menuTitleSx}>
                        {video.title}
                    </Typography>
                    <Box sx={menuFolderLabelSx}>
                        <SvgIcon sx={menuFolderIconSx}>
                            <FontAwesomeIcon icon={faFolder} />
                        </SvgIcon>
                        <Typography variant="caption" sx={menuFolderTextSx}>
                            Shared assets
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={menuDividerSx} />

                <TruffleMenuItem onClick={e => closeMenu(e)}
                    secondaryAction={<SvgIcon sx={menuSecondaryIconSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>}
                >
                    Details
                </TruffleMenuItem>

                <TruffleMenuItem onClick={e => closeMenu(e)}
                    secondaryAction={<SvgIcon sx={menuSecondaryIconSx}><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></SvgIcon>}
                >
                    Video Page
                </TruffleMenuItem>

                <TruffleMenuItem
                    onClick={e => {
                        e.stopPropagation();
                        savedMenuAnchor.current = menuAnchor;
                        setMenuAnchor(null);
                        setVideoPermOpen(true);
                    }}
                    secondaryAction={<PermAvatarGroup settings={videoPermSettings} coloredAvatars={false} />}
                >
                    Permissions
                    <SvgIcon sx={menuItemIconMlSx}><FontAwesomeIcon icon={faLock} /></SvgIcon>
                </TruffleMenuItem>

                <Divider sx={menuDividerSx} />

                <TruffleMenuItem onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faShare} /></SvgIcon>
                    Share video
                </TruffleMenuItem>

                <TruffleMenuItem onClick={e => {
                    closeMenu(e);
                    if (approvalsEnabled) {
                        setApprovalOpen(true);
                    }
                    else {
                        onApprovalsDisabled?.();
                    }
                }}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                    Submit for approval
                </TruffleMenuItem>

                <Divider sx={menuDividerSx} />

                <TruffleMenuItem onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faCopy} /></SvgIcon>
                    Duplicate video
                </TruffleMenuItem>

                <TruffleMenuItem onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faLayerGroup} /></SvgIcon>
                    Video to template
                </TruffleMenuItem>

                <Divider sx={menuDividerSx} />

                <TruffleMenuItem onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faFolder} /></SvgIcon>
                    Move to folder
                </TruffleMenuItem>

                <TruffleMenuItem onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faBoxArchive} /></SvgIcon>
                    Archive
                </TruffleMenuItem>

                <TruffleMenuItem error onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconDeleteSx}><FontAwesomeIcon icon={faTrash} /></SvgIcon>
                    Delete
                </TruffleMenuItem>
            </Menu>

            {/* Per-card permission dialog */}
            <VideoPermissionDialog
                open={videoPermOpen}
                onClose={() => setVideoPermOpen(false)}
                onSave={s => {
                    onPermChange?.(video.title, s);
                    setVideoPermOpen(false);
                    setMenuAnchor(savedMenuAnchor.current);
                }}
                initialSettings={videoPermSettings}
            />

            {/* Submit for approval dialog */}
            <ApprovalDialog
                open={approvalOpen}
                onClose={() => setApprovalOpen(false)}
                onSend={approvers => {
                    setApprovalOpen(false);
                    setConfirmApprovers(approvers);
                    setConfirmationOpen(true);
                    onSubmitForApproval?.(video.title, approvers);
                }}
                availableApprovers={approversList}
            />

            {/* Approval confirmation dialog */}
            <ConfirmationDialog
                open={confirmationOpen}
                onClose={() => setConfirmationOpen(false)}
                approverCount={confirmApprovers.length}
            />
        </Card>
    );
}

// ─── Folder card ──────────────────────────────────────────────────────────────
function FolderCard({ name, count }: { name: string; count: number }) {
    return (
        <Box sx={folderCardSx}>
            <Box sx={folderIconBoxSx}>
                <SvgIcon sx={folderIconSvgSx}>
                    <FontAwesomeIcon icon={faFolder} />
                </SvgIcon>
            </Box>
            <Box sx={folderCardTextWrapSx}>
                <TypographyWithTooltipOnOverflow variant="subtitle2" sx={folderCardNameSx}>
                    {name}
                </TypographyWithTooltipOnOverflow>
                <Typography variant="caption" sx={folderCardCountSx}>
                    {count} {count === 1 ? "item" : "items"}
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Left sidebar ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { icon: faFilm, label: "Video Library", selected: true },
    { icon: faLayerGroup, label: "Template Library", selected: false },
    { icon: faImages, label: "Media", selected: false },
    { icon: faLightbulb, label: "Inspiration Gallery", selected: false },
    { icon: faChartBar, label: "Analytics", selected: false }
];

function AppSidebar() {
    return (
        <Box sx={sidebarSx}>
            {/* Logo area */}
            <Box sx={sidebarLogoBoxSx}>
                <Box component="img" src="" alt="sundaysky-logo" sx={sidebarLogoImgSx} />
            </Box>

            {/* Create button */}
            <Box sx={sidebarCreateBtnWrapperSx}>
                <Button
                    variant="contained"
                    color="gradient"
                    startIcon={<FontAwesomeIcon icon={faPlus} />}
                    sx={createButtonSx}
                >
                    Create
                </Button>
            </Box>

            {/* Nav items */}
            <List disablePadding sx={sidebarListSx}>
                {NAV_ITEMS.map(({ icon, label, selected }) => (
                    <ListItemButton
                        key={label}
                        selected={selected}
                        sx={navItemButtonSx}
                    >
                        <Box sx={navItemContentSx}>
                            <ListItemIcon sx={navItemIconSx}>
                                <SvgIcon sx={navItemIconSvgSx}>
                                    <FontAwesomeIcon icon={icon} />
                                </SvgIcon>
                            </ListItemIcon>
                            <ListItemText
                                primary={label}
                                primaryTypographyProps={{
                                    variant: "body1",
                                    sx: navItemTextSx
                                }}
                            />
                        </Box>
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const RECENT_VIDEOS: VideoItem[] = [
    { title: "Stay Safe During Missile Threats", subtitle: "Essential Safety Protocols", editedBy: "Edited in the past 7 days by you", statuses: ["Draft"], personalized: false },
    { title: "Recent TTS Pronunciation Advancements", subtitle: "Explore New Tools for Enhanced Communication", editedBy: "Edited in the past 7 days by you", statuses: ["Draft"], personalized: true },
    { title: "Prepare for Winter Fun!", subtitle: "Family Bonding through Home Prep", editedBy: "Edited in the past 7 days by you", statuses: ["Draft"], personalized: false },
    { title: "Understanding the American-Israel-Iran Conflict: Peace & Safety", subtitle: undefined, editedBy: "Edited in the past month by you", statuses: ["Draft"], personalized: false },
    { title: "Discover Tel Aviv's Scenic Parks", subtitle: "Urban Oasis Awaits", editedBy: "Edited in the past month by you", statuses: ["Approved for sharing"], personalized: true }
];

const ALL_VIDEOS: VideoItem[] = [
    { title: "Prepare for Winter Fun!", subtitle: "Family Bonding through Home Prep", editedBy: "Edited in the past month", statuses: ["Approved for sharing"], personalized: true },
    { title: "Stay Safe During Missile Threats", subtitle: "Essential Safety Protocols", editedBy: "Edited on Nov 4, 2025", statuses: ["Downloaded for Sharing"], personalized: false },
    { title: "Doc-to-vid test", subtitle: undefined, editedBy: "Edited on Jan 12", statuses: ["Downloaded"], personalized: true },
    { title: "Testing recording what will happen when the video name is really really long", subtitle: undefined, editedBy: "Edited on Jul 9, 2025", statuses: ["Downloaded"], personalized: false },
    { title: "Recording", subtitle: undefined, editedBy: "Edited on Nov 11, 2025", statuses: ["Downloaded"], personalized: false },
    { title: "Template editor", subtitle: undefined, editedBy: "Edited on Jul 10, 2025", statuses: ["Approved for sharing"], personalized: true },
    { title: "Editor template test", subtitle: undefined, editedBy: "Edited on Apr 29, 2025", statuses: ["Approved for sharing"], personalized: false },
    { title: "Onboarding Steps", subtitle: undefined, editedBy: "Edited on Oct 16, 2025", statuses: ["Downloaded"], personalized: false }
];

const FOLDERS = [
    { name: "Announcements", count: 3 },
    { name: "Old campaigns", count: 0 },
    { name: "Sales", count: 1 },
    { name: "Onboarding videos Se...", count: 0 },
    { name: "Copilot drafts", count: 3 },
    { name: "Archive", count: 0 }
];

// ─── Video table view ─────────────────────────────────────────────────────────
const TABLE_COLUMNS = ["Name", "Last Approved", "Last Edited", "Creation Date", "Actions"] as const;

function VideoTableView({ videos, videoStates, onSelect }: {
    videos: VideoItem[];
    videoStates?: Record<string, LiveVideoState>;
    onSelect: (v: VideoItem) => void;
}) {
    return (
        <TableContainer>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        {TABLE_COLUMNS.map(col => (
                            <TableCell key={col} sx={tableHeadCellSx}>
                                <Box sx={tableHeadCellInnerSx}>
                                    <Typography variant="subtitle1">{col}</Typography>
                                    {col !== "Actions" && (
                                        <SvgIcon sx={tableSortIconSx}><FontAwesomeIcon icon={faArrowDown} /></SvgIcon>
                                    )}
                                </Box>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {videos.map((v, i) => {
                        const statuses = resolveStatuses(v, videoStates);
                        return (
                            <TableRow key={v.title + i} hover onClick={() => onSelect(v)} sx={tableRowSx}>
                                {/* Name */}
                                <TableCell sx={tableNameCellSx}>
                                    <Box sx={tableNameCellInnerSx}>
                                        <Box component="img" src={IMG_THUMB} alt="" sx={tableThumbSx} />
                                        <Box>
                                            <TypographyWithTooltipOnOverflow variant="h5" sx={tableVideoTitleSx}>
                                                {v.title}
                                            </TypographyWithTooltipOnOverflow>
                                            {statuses.map(s => <Label key={s} label={s} color={STATUS_LABEL_MAP[s as StatusKey]?.color ?? "default"} sx={tableLabelSx} />)}
                                        </Box>
                                    </Box>
                                </TableCell>
                                {/* Last Approved */}
                                <TableCell>
                                    <Typography variant="body1" color="text.secondary">—</Typography>
                                </TableCell>
                                {/* Last Edited */}
                                <TableCell>
                                    <Typography variant="body1" color="text.secondary">{v.editedBy}</Typography>
                                </TableCell>
                                {/* Creation Date */}
                                <TableCell>
                                    <Typography variant="body1" color="text.secondary">—</Typography>
                                </TableCell>
                                {/* Actions */}
                                <TableCell sx={tableActionsCellSx}>
                                    <Box sx={tableActionsBoxSx}>
                                        <IconButton size="medium" onClick={e => {
                                            e.stopPropagation(); onSelect(v); 
                                        }}>
                                            <SvgIcon sx={tableActionIconSx}><FontAwesomeIcon icon={faPen} /></SvgIcon>
                                        </IconButton>
                                        <IconButton size="medium" onClick={e => e.stopPropagation()}>
                                            <SvgIcon sx={tableActionIconSx}><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VideoLibraryPage({
    onSelectVideo,
    notifications,
    videoStates,
    onPermChange,
    onSubmitForApproval,
    approvalsEnabled = false,
    onApprovalsDisabled,
    approverIds = new Set(),
    approversList = [],
    onApprovalsEnabledChange,
    onApproversChange,
    onApproversListChange,
    onUserDeletionBlocked: parentOnUserDeletionBlocked,
    accountSettingsOpen: externalAccountSettingsOpen = false,
    accountSettingsInitialTab: externalAccountSettingsInitialTab = "users",
    onAccountSettingsOpen
}: {
  onSelectVideo: (v: VideoItem) => void
  notifications?: NotificationItem[]
  videoStates?: Record<string, LiveVideoState>
  onPermChange?: (key: string, s: VideoPermissionSettings) => void
  onSubmitForApproval?: (videoKey: string, approvers: string[]) => void
  approvalsEnabled?: boolean
  onApprovalsDisabled?: () => void
  approverIds?: Set<string>
  approversList?: { value: string; label: string }[]
  onApprovalsEnabledChange?: (enabled: boolean, hasPendingApprovals?: boolean) => void
  onApproversChange?: (ids: Set<string>) => void
  onApproversListChange?: (approvers: { value: string; label: string }[]) => void
  onUserDeletionBlocked?: (userId: string, reason: "only-approver" | "pending-approvals") => void
  accountSettingsOpen?: boolean
  accountSettingsInitialTab?: "users" | "permissions" | "approvals" | "access"
  onAccountSettingsOpen?: (open: boolean) => void
}) {
    const [_accountSettingsOpen, setAccountSettingsOpen] = useState(false);
    const [_accountSettingsInitialTab, setAccountSettingsInitialTab] = useState<"users" | "permissions" | "approvals" | "access">("users");
    const accountSettingsOpen = externalAccountSettingsOpen ?? _accountSettingsOpen;
    const accountSettingsInitialTab = externalAccountSettingsInitialTab ?? _accountSettingsInitialTab;
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const pendingApprovalsCount = videoStates
        ? Object.values(videoStates).filter(v => v.sentApprovers?.length > 0).length
        : 0;

    const handleApprovalsEnabledChange = useCallback((enabled: boolean, hasPendingApprovals?: boolean) => {
        onApprovalsEnabledChange?.(enabled, hasPendingApprovals && pendingApprovalsCount > 0);
    }, [onApprovalsEnabledChange, pendingApprovalsCount]);

    const handleApproversChange = useCallback((ids: Set<string>) => {
        onApproversChange?.(ids);
    }, [onApproversChange]);

    const handleApproversListChange = useCallback((approvers: { value: string; label: string }[]) => {
        onApproversListChange?.(approvers);
    }, [onApproversListChange]);

    const handleUserDeletionBlocked = useCallback((userId: string, reason: "only-approver" | "pending-approvals") => {
        parentOnUserDeletionBlocked?.(userId, reason);
    }, [parentOnUserDeletionBlocked]);

    return (
        <Box sx={pageRootSx}>
            <AccountSettingsDialog
                open={accountSettingsOpen}
                initialTab={accountSettingsInitialTab}
                onClose={() => {
                    setAccountSettingsOpen(false);
                    setAccountSettingsInitialTab("users");
                    onAccountSettingsOpen?.(false);
                }}
                approvalsEnabled={approvalsEnabled}
                approverIds={approverIds}
                approversList={approversList}
                videoStates={videoStates}
                onApprovalsEnabledChange={handleApprovalsEnabledChange}
                onApproversChange={handleApproversChange}
                onApproversListChange={handleApproversListChange}
                onUserDeletionBlocked={handleUserDeletionBlocked}
                pendingApprovalsCount={pendingApprovalsCount}
            />
            <AppSidebar />

            <Box sx={mainColumnSx}>
                {/* AppBar */}
                <AppBar position="sticky" color="primary" elevation={4} sx={appBarSx}>
                    <Toolbar variant="dense" sx={toolbarSx}>
                        {/* Left: non-production badge */}
                        <Chip label="staging" color="success" size="small" />
                        <Box sx={flexSpacerSx} />
                        {/* Right: search, bell, user */}
                        <Box sx={appBarRightSx}>
                            <Search
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onClear={() => setSearchQuery("")}
                                numberOfResults={0}
                                placeholder="Search libraries"
                                sx={searchSx}
                            />
                            <NotificationBell notifications={notifications} />
                            <Box
                                onClick={() => {
                                    setAccountSettingsOpen(true);
                                    setAccountSettingsInitialTab("users");
                                    onAccountSettingsOpen?.(true);
                                }}
                                sx={userMenuTriggerSx}
                            >
                                <Badge
                                    variant="dot"
                                    color="error"
                                    overlap="circular"
                                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                >
                                    <TruffleAvatar text="MC" size="medium" />
                                </Badge>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Box sx={pageContentSx}>
                    {/* Page title + view toggle */}
                    <Box sx={pageTitleRowSx}>
                        <Typography variant="h1" sx={headingPrimaryColorSx}>
                            Video Library
                        </Typography>
                        <Box sx={viewToggleBoxSx}>
                            <Typography variant="caption" sx={captionSecondaryColorSx}>View as</Typography>
                            <TruffleToggleButtonGroup
                                value={viewMode}
                                exclusive
                                onChange={(_e, val) => {
                                    if (val) {
                                        setViewMode(val);
                                    } 
                                }}
                                variant="outlined"
                            >
                                <ToggleIconButton value="grid" icon={<FontAwesomeIcon icon={faGrip} />} />
                                <ToggleIconButton value="list" icon={<FontAwesomeIcon icon={faBars} />} />
                            </TruffleToggleButtonGroup>
                        </Box>
                    </Box>

                    {/* ── Recent ── */}
                    <Box sx={sectionBoxSx}>
                        <Typography variant="h2" sx={headingPrimaryColorSx}>Recent</Typography>
                        <Box sx={recentScrollRowSx}>
                            {/* Left chevron */}
                            <IconButton color="primary" size="medium" sx={chevronBtnSx}>
                                <SvgIcon><FontAwesomeIcon icon={faChevronLeft} /></SvgIcon>
                            </IconButton>
                            {/* Scroll container */}
                            <Box sx={recentScrollContainerSx}>
                                {RECENT_VIDEOS.map((v, i) => (
                                    <Box key={v.title + i} sx={recentCardSlotSx}>
                                        <VideoCard
                                            video={{ ...v, statuses: resolveStatuses(v, videoStates) }}
                                            liveState={videoStates?.[v.title]}
                                            onClick={() => onSelectVideo(v)}
                                            onPermChange={onPermChange}
                                            onSubmitForApproval={onSubmitForApproval}
                                            approversList={approversList}
                                            approvalsEnabled={approvalsEnabled}
                                            onApprovalsDisabled={onApprovalsDisabled}
                                        />
                                    </Box>
                                ))}
                            </Box>
                            {/* Right chevron */}
                            <IconButton color="primary" size="medium" sx={chevronBtnSx}>
                                <SvgIcon><FontAwesomeIcon icon={faChevronRight} /></SvgIcon>
                            </IconButton>
                        </Box>
                    </Box>

                    {/* ── Folders ── */}
                    <Box sx={foldersSectionSx}>
                        <Box sx={sectionHeaderRowSx}>
                            <Typography variant="h2" sx={headingPrimaryColorSx}>
                                Folders ({FOLDERS.length})
                            </Typography>
                            <Box
                                component="button"
                                onClick={() => {}}
                                sx={newFolderBtnSx}
                            >
                                <SvgIcon sx={newFolderIconSx}><FontAwesomeIcon icon={faFolderPlus} /></SvgIcon>
                                <Typography variant="body1" sx={newFolderTextSx}>New folder</Typography>
                            </Box>
                        </Box>
                        <Box sx={foldersGridSx}>
                            {FOLDERS.map(f => <FolderCard key={f.name} name={f.name} count={f.count} />)}
                        </Box>
                    </Box>

                    {/* ── Videos ── */}
                    <Typography variant="h2" sx={videosSectionHeadingSx}>
                        Videos ({ALL_VIDEOS.length})
                    </Typography>
                    {viewMode === "list" ? (
                        <VideoTableView
                            videos={ALL_VIDEOS}
                            videoStates={videoStates}
                            onSelect={onSelectVideo}
                        />
                    ) : (
                        <Box sx={videosGridSx}>
                            {ALL_VIDEOS.map((v, i) => (
                                <VideoCard
                                    key={v.title + "-all-" + i}
                                    video={{ ...v, statuses: resolveStatuses(v, videoStates) }}
                                    liveState={videoStates?.[v.title]}
                                    onClick={() => onSelectVideo(v)}
                                    onPermChange={onPermChange}
                                    onSubmitForApproval={onSubmitForApproval}
                                    approversList={approversList}
                                    approvalsEnabled={approvalsEnabled}
                                    onApprovalsDisabled={onApprovalsDisabled}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageRootSx: SxProps<Theme> = {
    display: "flex",
    height: "100%",
    bgcolor: "background.default",
    overflow: "hidden"
};

const mainColumnSx: SxProps<Theme> = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0
};

const sidebarSx: SxProps<Theme> = (theme) => ({
    width: 112,
    flexShrink: 0,
    background: `linear-gradient(to bottom, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    overflow: "hidden"
});

const sidebarLogoBoxSx: SxProps<Theme> = {
    height: 104,
    width: 112,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    cursor: "pointer",
    "&:hover": { opacity: 0.8 }
};

const sidebarLogoImgSx: SxProps<Theme> = {
    width: 62,
    height: 62,
    display: "none" // placeholder — real app uses SVG logo
};

const sidebarCreateBtnWrapperSx: SxProps<Theme> = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    mb: 1
};

const createButtonSx: SxProps<Theme> = {
    height: 30,
    width: 94,
    minWidth: "unset",
    borderRadius: "16px",
    px: "10px"
};

const sidebarListSx: SxProps<Theme> = {
    width: "100%"
};

const navItemButtonSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    px: "4px",
    py: "12px",
    width: "100%",
    "&.Mui-selected": {
        bgcolor: (theme: Theme) => alpha(theme.palette.common.white, 0.12)
    },
    "&:hover": {
        bgcolor: (theme: Theme) => alpha(theme.palette.common.white, 0.06)
    }
};

const navItemContentSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    width: "100%"
};

const navItemIconSx: SxProps<Theme> = {
    minWidth: "unset",
    justifyContent: "center"
};

const navItemTextSx: SxProps<Theme> = {
    lineHeight: 1.3,
    letterSpacing: "0.46px",
    color: "common.white",
    textAlign: "center",
    textTransform: "capitalize"
};

const appBarSx: SxProps<Theme> = {
    flexShrink: 0
};

const toolbarSx: SxProps<Theme> = {
    gap: 2,
    px: 3
};

const appBarRightSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1.5
};

const searchSx: SxProps<Theme> = {
    width: 220
};

const userMenuTriggerSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    borderRadius: 1,
    p: "4px",
    "&:hover": { bgcolor: "action.hover" }
};

const pageContentSx: SxProps<Theme> = {
    flex: 1,
    overflow: "auto",
    px: 4,
    py: 3
};

const pageTitleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    mb: 3
};

const viewToggleBoxSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px"
};

const sectionBoxSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    pl: 1,
    mb: 4
};

const recentScrollRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1
};

const recentScrollContainerSx: SxProps<Theme> = {
    display: "flex",
    gap: 1,
    overflowX: "auto",
    py: 1,
    px: 1,
    bgcolor: "other.editorBackground",
    borderRadius: "8px 0 0 8px",
    flex: 1,
    "&::-webkit-scrollbar": { height: 4 },
    "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
    "&::-webkit-scrollbar-thumb": { bgcolor: "grey.300", borderRadius: 2 }
};

const recentCardSlotSx: SxProps<Theme> = {
    width: 310,
    minWidth: 310,
    flexShrink: 0
};

const chevronBtnSx: SxProps<Theme> = {
    flexShrink: 0
};

const foldersSectionSx: SxProps<Theme> = {
    mb: 4
};

const sectionHeaderRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    mb: 2
};

const newFolderBtnSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    height: 36,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 1,
    bgcolor: "transparent",
    cursor: "pointer",
    px: 2,
    "&:hover": { borderColor: "primary.main", bgcolor: "action.selected" }
};

const foldersGridSx: SxProps<Theme> = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 1.5
};

const videosGridSx: SxProps<Theme> = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
    gap: 2,
    pb: 4
};

const tableHeadCellSx: SxProps<Theme> = { bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" };
const tableHeadCellInnerSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "4px" };
const tableSortIconSx: SxProps<Theme> = { fontSize: 12, color: "action.active" };
const tableRowSx: SxProps<Theme> = { cursor: "pointer" };
const tableNameCellSx: SxProps<Theme> = { maxWidth: 360 };
const tableNameCellInnerSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: 1.5 };
const tableThumbSx: SxProps<Theme> = { width: 64, height: 36, objectFit: "cover", borderRadius: "4px", flexShrink: 0 };
const tableVideoTitleSx: SxProps<Theme> = { mb: "2px" };
const tableLabelSx: SxProps<Theme> = { mt: "2px" };
const tableActionsCellSx: SxProps<Theme> = { width: 96 };
const tableActionsBoxSx: SxProps<Theme> = { display: "flex", alignItems: "center" };
const tableActionIconSx: SxProps<Theme> = { fontSize: 16 };

const folderCardSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    px: 2,
    py: "12px",
    borderRadius: 1,
    bgcolor: "background.paper",
    cursor: "pointer",
    "&:hover": { bgcolor: "action.hover" },
    minWidth: 0
};

const folderIconBoxSx: SxProps<Theme> = {
    width: 36,
    height: 36,
    borderRadius: "6px",
    bgcolor: "other.editorBackground",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
};

// VideoCard styles
const videocardSx: SxProps<Theme> = {
    p: 1,
    width: "100%",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column"
};

const thumbnailContentPropsSx: SxProps<Theme> = {
    width: "100%",
    aspectRatio: "16/9",
    overflow: "hidden"
};

const cardBodySx: SxProps<Theme> = {
    pt: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px"
};

const cardTitleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between"
};

const cardTitleSx: SxProps<Theme> = {
    color: "text.primary",
    flex: 1,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: "42px",
    lineHeight: 1.5
};

const threeDotsBtnSx: SxProps<Theme> = {
    mt: "-2px",
    ml: "4px",
    flexShrink: 0
};

const statusRowSx: SxProps<Theme> = {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center"
};

const approvalIconContainerSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    cursor: "default"
};

const menuPaperSx: SxProps<Theme> = {
    minWidth: 256,
    mt: "4px",
    py: "4px"
};

const menuHeaderSx: SxProps<Theme> = {
    px: 2,
    pt: "10px",
    pb: 1
};

const menuFolderLabelSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "4px"
};

// Thumbnail styles (canvas-specific — cqw units are intentional exceptions)
const thumbnailWrapperSx: SxProps<Theme> = {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden"
};

const thumbnailImgSx: SxProps<Theme> = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
};

const thumbnailLeftHalfSx: SxProps<Theme> = {
    position: "absolute",
    inset: 0,
    width: "50%",
    bgcolor: "common.white",
    pointerEvents: "none"
};

const thumbnailAccentLineSx: SxProps<Theme> = {
    height: 4,
    bgcolor: "secondary.light",
    width: "100%"
};

const thumbnailRightHalfSx: SxProps<Theme> = {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "50%",
    bgcolor: "grey.200",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    pointerEvents: "none"
};

const thumbnailTextAreaSx: SxProps<Theme> = {
    position: "absolute",
    left: "4%",
    top: "18%",
    width: "43%",
    containerType: "inline-size",
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column"
};

// These use cqw units (container query widths) — intentional exception to typography rules
const thumbnailHeadingSx: SxProps<Theme> = {
    fontFamily: "\"Inter\", sans-serif",
    fontWeight: 700,
    fontSize: "9cqw",
    color: "secondary.main",
    lineHeight: 1.2,
    wordBreak: "break-word"
};

const thumbnailSubheadingSx: SxProps<Theme> = {
    fontFamily: "\"Inter\", sans-serif",
    fontWeight: 400,
    fontSize: "4cqw",
    color: "text.secondary",
    lineHeight: 1.4,
    wordBreak: "break-word",
    mt: "6%"
};

const thumbnailFootnoteSx: SxProps<Theme> = {
    position: "absolute",
    left: "4%",
    width: "43%",
    bottom: "5%",
    containerType: "inline-size",
    pointerEvents: "none"
};

const thumbnailFootnoteTextSx: SxProps<Theme> = {
    fontSize: "3cqw",
    letterSpacing: "0.4px",
    color: "text.disabled",
    lineHeight: 1.66
};

// PermAvatarGroup styles
const miniAvatarBaseSx: SxProps<Theme> = {
    width: 20,
    height: 20,
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
};

const miniAvatarTextSx: SxProps<Theme> = {
    lineHeight: 1,
    fontWeight: 600
};

const permAvatarGroupSx: SxProps<Theme> = {
    display: "flex",
    gap: "3px",
    alignItems: "center"
};

const permPrivateLabelSx: SxProps<Theme> = {
    color: "text.secondary",
    lineHeight: 1,
    ml: "4px"
};

const everyoneAvatarIconSx: SxProps<Theme> = {
    fontSize: 12,
    color: "text.primary"
};

const thumbnailDragIconSx: SxProps<Theme> = {
    fontSize: 28,
    color: "grey.500"
};

const thumbnailDragTextSx: SxProps<Theme> = {
    color: "grey.500"
};

const editedByTextSx: SxProps<Theme> = {
    color: "text.secondary"
};

const menuTitleSx: SxProps<Theme> = {
    color: "text.primary",
    lineHeight: 1.4,
    mb: "4px"
};

const menuFolderIconSx: SxProps<Theme> = {
    fontSize: 13,
    color: "text.secondary"
};

const menuFolderTextSx: SxProps<Theme> = {
    color: "text.secondary",
    lineHeight: 1.4
};

const menuDividerSx: SxProps<Theme> = {
    my: "4px"
};

const menuSecondaryIconSx: SxProps<Theme> = {
    fontSize: 16,
    color: "action.active"
};

const menuItemIconMrSx: SxProps<Theme> = {
    fontSize: 16,
    color: "action.active",
    mr: 1
};

const menuItemIconMlSx: SxProps<Theme> = {
    fontSize: 16,
    color: "action.active",
    ml: 1
};

const menuItemIconDeleteSx: SxProps<Theme> = {
    fontSize: 16,
    mr: 1
};

const personalizedLabelIconSx: SxProps<Theme> = {
    fontSize: 12
};

const folderIconSvgSx: SxProps<Theme> = {
    fontSize: 20,
    color: "primary.main"
};

const folderCardTextWrapSx: SxProps<Theme> = {
    minWidth: 0
};

const folderCardNameSx: SxProps<Theme> = {
    color: "text.primary",
    lineHeight: 1.5
};

const folderCardCountSx: SxProps<Theme> = {
    color: "text.secondary",
    lineHeight: 1.5
};

const navItemIconSvgSx: SxProps<Theme> = {
    fontSize: 20,
    color: "common.white"
};

const flexSpacerSx: SxProps<Theme> = {
    flex: 1
};

const headingPrimaryColorSx: SxProps<Theme> = {
    color: "text.primary"
};

const captionSecondaryColorSx: SxProps<Theme> = {
    color: "text.secondary"
};

const newFolderIconSx: SxProps<Theme> = {
    fontSize: 16
};

const newFolderTextSx: SxProps<Theme> = {
    color: "text.primary"
};

const videosSectionHeadingSx: SxProps<Theme> = {
    color: "text.primary",
    mb: 2
};
