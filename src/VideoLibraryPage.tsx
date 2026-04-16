import { useState, useRef, useCallback } from "react";
import type { SxProps, Theme } from "@mui/material";
import {
    Box, Typography, Button, Avatar, IconButton, Tooltip, SvgIcon,
    InputAdornment, OutlinedInput,
    Menu, MenuItem, ListItemText, Divider
} from "@mui/material";
import { Label, TypographyWithTooltipOnOverflow } from "@sundaysky/smartvideo-hub-truffle-component-library";
import VideoPermissionDialog, { type VideoPermissionSettings } from "./VideoPermissionDialog";
import AccountSettingsDialog from "./AccountSettingsDialog";
import ApprovalDialog from "./ApprovalDialog";
import ConfirmationDialog from "./ConfirmationDialog";
import { NotificationBell, type NotificationItem } from "./NotificationsPanel";
import { TOTAL_COMMENT_COUNT } from "./StudioPage";
import { OWNER_USER } from "./ManageAccessDialog";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AddIcon from "@mui/icons-material/Add";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SyncIcon from "@mui/icons-material/Sync";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import LockPersonIcon from "@mui/icons-material/LockPerson";

// ─── Custom icon: FA "image-circle-check" approximation ──────────────────────
function ImageCircleCheckIcon() {
    return (
        <SvgIcon sx={{ fontSize: "inherit" }} viewBox="0 0 22 22">
            {/* Photo frame */}
            <path d="M14.5 2h-12C1.67 2 1 2.67 1 3.5v9C1 13.33 1.67 14 2.5 14H9.4a5.52 5.52 0 0 1-.4-2H2.5v-8h12v5.9a5.52 5.52 0 0 1 1.5.95V3.5c0-.83-.67-1.5-1.5-1.5z"/>
            <path d="M3 12 5.5 8 8 11 10.5 7 13 12H3z"/>
            <circle cx="12" cy="4.5" r="1"/>
            {/* Check-circle badge */}
            <circle cx="16.5" cy="16.5" r="5"/>
            <path d="M14 16.5l2 2 4-4" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </SvgIcon>
    );
}

// ─── Figma asset image — split template (HEADING PLACEHOLDER left + media right)
const IMG_THUMB = "/thumb.svg";

// ─── DS tokens (now using theme palette paths) ──────────────────────────────

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

const STATUS_LABEL_MAP: Record<StatusKey, { color: "default" | "info" | "success" | "error"; icon?: React.ReactNode }> = {
    "Draft":                  { color: "default" },
    "Approved for sharing":   { color: "info", icon: <SyncIcon /> },
    "Downloaded for Sharing": { color: "success", icon: <SyncIcon /> },
    "Downloaded":             { color: "info", icon: <SyncIcon /> },
    "Live":                   { color: "error" },
    "Shared":                 { color: "info" },
    "Pending approval":       { color: "default" }
};

function StatusLabel({ status }: { status: StatusKey }) {
    const cfg = STATUS_LABEL_MAP[status];
    return (
        <Label label={status} color={cfg.color} startIcon={cfg.icon} />
    );
}

// ─── Approval status icon — inline, to the right of status chips ──────────────
// Phase 0 pending  → grey group icon  "Awaiting response from [names]"
// Phase 1          → orange group icon  "1 of 2 responded. Waiting for [name]"
// Phase 2          → blue comment icon  "[N] comments from approvers ready to view"
function ApprovalStatusIcon({ state, totalComments }: { state: LiveVideoState; totalComments: number }) {
    const { phase, pageState, sentApprovers } = state;

    if (phase === 0 && pageState === "draft") {
        return null;
    }
    if (phase >= 3) {
        return null;
    }

    let IconEl: React.ElementType;
    let color: string;
    let tip: string;

    if (phase === 0 && pageState === "pending") {
        IconEl = GroupOutlinedIcon;
        color = "success.main";
        const names = sentApprovers.length > 0 ? formatNames(sentApprovers) : "approvers";
        tip = `Awaiting response from ${names}`;
    }
    else if (phase === 1) {
        IconEl = GroupOutlinedIcon;
        color = "warning.main";
        const total = sentApprovers.length;
        const pending = sentApprovers.slice(1);
        const remaining = pending.length > 0 ? formatNames(pending) : "remaining approver";
        tip = `1 of ${total} approver${total !== 1 ? "s" : ""} responded. Waiting for ${remaining}`;
    }
    else if (phase === 2) {
        IconEl = CommentOutlinedIcon;
        color = "primary.main";
        tip = `${totalComments} comments from approvers ready to view`;
    }
    else {
        return null;
    }

    return (
        <Tooltip
            title={tip}
            placement="top"
            arrow
            componentsProps={{
                tooltip: { sx: { bgcolor: "secondary.main", borderRadius: "8px", px: "10px", py: "8px", color: "common.white", maxWidth: 240 } },
                arrow:   { sx: { color: "secondary.main" } }
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, cursor: "default" }}>
                <IconEl sx={{ fontSize: 16, color }} />
            </Box>
        </Tooltip>
    );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
type ThumbType = "full" | "photo" | "split-template"

function VideoThumbnail({ headingText, subheadingText }: { _type?: ThumbType; headingText?: string; subheadingText?: string }) {
    return (
        <Box sx={{ position: "relative", width: "100%", height: 171, overflow: "hidden" }}>
            <Box component="img" src={IMG_THUMB} alt=""
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

            {/* Left half — white bg + pink accent line */}
            <Box sx={{ position: "absolute", inset: 0, width: "50%", bgcolor: "common.white", pointerEvents: "none" }}>
                <Box sx={{ height: 4, bgcolor: "#C084FC", width: "100%" }} />
            </Box>

            {/* Right half — drag media */}
            <Box sx={{
                position: "absolute", top: 0, right: 0, bottom: 0, width: "50%",
                background: "repeating-linear-gradient(-45deg,#EBEBEF 0px,#EBEBEF 8px,#E2E2E7 8px,#E2E2E7 16px)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: "4px", pointerEvents: "none"
            }}>
                <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 28, color: "grey.500" }} />
                <Typography sx={{ fontSize: 9, color: "grey.500" }}>
          Drag media here
                </Typography>
            </Box>

            {/* Text overlays — flowing column, no fixed subheading position */}
            <Box sx={{
                position: "absolute", left: "4%", top: "18%", width: "43%",
                containerType: "inline-size", pointerEvents: "none",
                display: "flex", flexDirection: "column"
            }}>
                <Typography sx={{ fontFamily: "\"Inter\", sans-serif", fontWeight: 700, fontSize: "9cqw", color: "secondary.main", lineHeight: 1.2, wordBreak: "break-word" }}>
                    {headingText ?? "Heading Placeholder"}
                </Typography>
                <Typography sx={{ fontFamily: "\"Inter\", sans-serif", fontWeight: 400, fontSize: "4cqw", color: "text.secondary", lineHeight: 1.4, wordBreak: "break-word", mt: "6%" }}>
                    {subheadingText ?? "Sub-heading Placeholder"}
                </Typography>
            </Box>

            {/* Footnote */}
            <Box sx={{ position: "absolute", left: "4%", width: "43%", bottom: "5%", containerType: "inline-size", pointerEvents: "none" }}>
                <Typography sx={{ fontSize: "3cqw", letterSpacing: "0.4px", color: "text.disabled", lineHeight: 1.66 }}>
          Footnote placeholder
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Video card ───────────────────────────────────────────────────────────────
// Figma: "Thumbnail video gallery" — bg-white p-[8px] rounded-[8px]
export interface VideoItem {
  title: string
  subtitle?: string
  editedBy: string
  statuses: StatusKey[]
  personalized: boolean
  thumb: ThumbType
}

// ─── Permission avatar group shown inside Permissions menu item ───────────────
const navyTipSx: SxProps<Theme> = {
    bgcolor: "secondary.main", borderRadius: "8px", px: 1.5, py: 1,
    "& .MuiTooltip-arrow": { color: "secondary.main" }
};

export function PermAvatarGroup({ settings, coloredAvatars = true }: { settings?: VideoPermissionSettings; coloredAvatars?: boolean }) {
    const s = settings ?? {
        tab: "teams" as const, everyoneRole: "viewer" as const,
        users: [], ownerUsers: [OWNER_USER], noDuplicate: false
    };
    const { tab, everyoneRole, users, ownerUsers } = s;

    const miniAvatar = (key: string, content: React.ReactNode, tip: string, bgColor?: string) => (
        <Tooltip key={key} title={tip} placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
            <Box sx={{
                width: 20, height: 20, borderRadius: "4px", bgcolor: coloredAvatars && bgColor ? bgColor : "divider",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10,
                fontWeight: 600, lineHeight: 1, color: coloredAvatars && bgColor ? "common.white" : "text.primary"
            }}>
                {content}
            </Box>
        </Tooltip>
    );

    if (tab === "private") {
        return (
            <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1, ml: "4px" }}>
        Just me
            </Typography>
        );
    }

    return (
        <Box sx={{ display: "flex", gap: "3px", alignItems: "center" }}>
            {/* Owners — show initials with user color background */}
            {ownerUsers.slice(0, 2).map(u =>
                miniAvatar(u.id,
                    <Typography sx={{ fontSize: 10, fontWeight: 600, lineHeight: 1 }}>
                        {u.initials}
                    </Typography>,
                    `${u.name}${u.id === OWNER_USER.id ? " (You)" : ""} — Owner`,
                    u.color
                )
            )}
            {/* Editors — show initials with user color background */}
            {users.filter(pu => pu.role === "editor").slice(0, 2).map(pu =>
                miniAvatar(pu.user.id,
                    <Typography sx={{ fontSize: 10, fontWeight: 600, lineHeight: 1 }}>
                        {pu.user.initials}
                    </Typography>,
                    `${pu.user.name} — Can edit`,
                    pu.user.color
                )
            )}
            {/* Viewers — show initials with user color background */}
            {users.filter(pu => pu.role === "viewer").slice(0, 1).map(pu =>
                miniAvatar(pu.user.id + "_v",
                    <Typography sx={{ fontSize: 10, fontWeight: 600, lineHeight: 1 }}>
                        {pu.user.initials}
                    </Typography>,
                    `${pu.user.name} — Can view`,
                    pu.user.color
                )
            )}
            {/* Everyone — show with users icon in black */}
            {everyoneRole !== "restricted" &&
        miniAvatar("everyone",
            <PeopleAltOutlinedIcon sx={{ fontSize: 12, color: "text.primary" }} />,
            `Everyone in your account — Can ${everyoneRole === "editor" ? "edit" : "view"}`
        )
            }
        </Box>
    );
}

function VideoCard({ video, onClick, liveState, onPermChange, onSubmitForApproval, approversList, approvalsEnabled = false, onApprovalsDisabled }: { video: VideoItem; onClick?: () => void; liveState?: LiveVideoState; onPermChange?: (key: string, s: VideoPermissionSettings) => void; onSubmitForApproval?: (videoKey: string, approvers: string[]) => void; approversList?: { value: string; label: string }[]; approvalsEnabled?: boolean; onApprovalsDisabled?: () => void }) {
    const [hovered, setHovered] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [videoPermOpen, setVideoPermOpen] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmApprovers, setConfirmApprovers] = useState<string[]>([]);
    const [approvalOpen, setApprovalOpen] = useState(false);
    // Saved so we can re-open the menu after the permission dialog closes
    const savedMenuAnchor = useRef<HTMLElement | null>(null);

    const videoPermSettings = liveState?.permSettings;

    const openMenu = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation(); setMenuAnchor(e.currentTarget); 
    };
    const closeMenu = (e?: React.MouseEvent) => {
        e?.stopPropagation(); setMenuAnchor(null); 
    };

    return (
        <Box
            onClick={() => {
                // Don't navigate while any dialog is open — React portal clicks bubble through component tree
                if (approvalOpen || confirmationOpen || videoPermOpen) {
                    return;
                }
                onClick?.();
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                bgcolor: "background.paper", borderRadius: "8px", p: "8px",
                display: "flex", flexDirection: "column",
                cursor: onClick ? "pointer" : "default",
                transition: "box-shadow 0.18s",
                boxShadow: hovered ? "0px 6px 20px rgba(3,25,79,0.16)" : "0px 0px 0px 1px rgba(0,83,229,0.08)",
                width: "100%", height: "100%", boxSizing: "border-box"
            }}
        >
            {/* Thumbnail with hover play overlay */}
            <Box sx={{
                borderRadius: "8px", overflow: "hidden",
                border: 1, borderColor: "divider", bgcolor: "grey.100",
                width: "100%", position: "relative"
            }}>
                <VideoThumbnail headingText={liveState?.headingText ?? video.title} subheadingText={liveState?.subheadingText} />
                {/* Play overlay — fades in on card hover */}
                <Box sx={{
                    position: "absolute", inset: 0,
                    bgcolor: "rgba(3,25,79,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: hovered ? 1 : 0,
                    transition: "opacity 0.18s",
                    borderRadius: "7px"
                }}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.18)",
                        border: "2px solid rgba(255,255,255,0.85)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <PlayArrowIcon sx={{ color: "common.white", fontSize: 28, ml: "2px" }} />
                    </Box>
                </Box>
            </Box>

            {/* Card content */}
            <Box sx={{ pt: "8px", display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                {/* Title + 3-dots */}
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <TypographyWithTooltipOnOverflow variant="h5" multiline sx={{
                        color: "text.primary", flex: 1,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        overflow: "hidden", minHeight: "42px", lineHeight: 1.5
                    }}>
                        {video.title}
                    </TypographyWithTooltipOnOverflow>
                    <IconButton
                        size="small"
                        onClick={openMenu}
                        sx={{
                            color: hovered ? "primary.main" : "action.active",
                            mt: "-2px", ml: "4px", flexShrink: 0,
                            opacity: hovered ? 1 : 0,
                            transition: "opacity 0.18s, color 0.18s"
                        }}
                    >
                        <MoreVertIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* Edited by */}
                <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: "0.4px", lineHeight: 1.66 }}>
                    {video.editedBy}
                </Typography>

                {/* Status chips + inline approval icon */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                    {video.statuses.map(s => <StatusLabel key={s} status={s} />)}
                    {video.personalized && <Label label="Personalized" color="default" variant="outlined" startIcon={<PeopleAltOutlinedIcon sx={{ fontSize: 12 }} />} />}
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
                PaperProps={{ sx: { borderRadius: "10px", minWidth: 256, boxShadow: "0px 4px 20px rgba(3,25,79,0.15)", mt: "4px", py: "4px" } }}
            >
                {/* Header: video name + location */}
                <Box sx={{ px: "16px", pt: "10px", pb: "8px" }} onClick={e => e.stopPropagation()}>
                    <Typography variant="h5" sx={{ color: "text.primary", lineHeight: 1.4, mb: "4px" }}>
                        {video.title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <FolderOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                        <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.4 }}>
              Shared assets
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: "4px", borderColor: "divider" }} />

                <MenuItem onClick={e => closeMenu(e)} sx={{ gap: "4px", py: "8px", px: "16px" }}>
                    <Box sx={{ color: "action.active", display: "flex", alignItems: "center", flexShrink: 0 }}><InfoOutlinedIcon sx={{ fontSize: 16 }} /></Box>
                    <ListItemText primaryTypographyProps={{ variant: "body1" as const, color: "text.primary" }}>Details</ListItemText>
                </MenuItem>

                <MenuItem onClick={e => closeMenu(e)} sx={{ gap: "4px", py: "8px", px: "16px" }}>
                    <Box sx={{ color: "action.active", display: "flex", alignItems: "center", flexShrink: 0 }}><OpenInNewIcon sx={{ fontSize: 16 }} /></Box>
                    <ListItemText primaryTypographyProps={{ variant: "body1" as const, color: "text.primary" }}>Video Page</ListItemText>
                </MenuItem>

                <MenuItem onClick={e => {
                    e.stopPropagation(); savedMenuAnchor.current = menuAnchor; setMenuAnchor(null); setVideoPermOpen(true); 
                }} sx={{ gap: "4px", py: "8px", px: "16px" }}>
                    <Box sx={{ color: "action.active", display: "flex", alignItems: "center", flexShrink: 0 }}><LockPersonIcon sx={{ fontSize: 16 }} /></Box>
                    <ListItemText primaryTypographyProps={{ variant: "body1" as const, color: "text.primary" }}>Permissions</ListItemText>
                    <PermAvatarGroup settings={videoPermSettings} coloredAvatars={false} />
                </MenuItem>

                <Divider sx={{ my: "4px", borderColor: "divider" }} />

                <MenuItem onClick={e => closeMenu(e)} sx={{ gap: "4px", py: "8px", px: "16px" }}>
                    <Box sx={{ color: "action.active", display: "flex", alignItems: "center", flexShrink: 0 }}><ShareOutlinedIcon sx={{ fontSize: 16 }} /></Box>
                    <ListItemText primaryTypographyProps={{ variant: "body1" as const, color: "text.primary" }}>Share video</ListItemText>
                </MenuItem>

                <MenuItem onClick={e => {
                    closeMenu(e); if (approvalsEnabled) {
                        setApprovalOpen(true); 
                    }
                    else {
                        onApprovalsDisabled?.(); 
                    } 
                }} sx={{ gap: "4px", py: "8px", px: "16px" }}>
                    <Box sx={{ color: "action.active", display: "flex", alignItems: "center", flexShrink: 0 }}><ImageCircleCheckIcon /></Box>
                    <ListItemText primaryTypographyProps={{ variant: "body1" as const, color: "text.primary" }}>Submit for approval</ListItemText>
                </MenuItem>

                <Divider sx={{ my: "4px", borderColor: "divider" }} />

                <MenuItem onClick={e => closeMenu(e)} sx={{ gap: "4px", py: "8px", px: "16px" }}>
                    <Box sx={{ color: "action.active", display: "flex", alignItems: "center", flexShrink: 0 }}><ContentCopyIcon sx={{ fontSize: 16 }} /></Box>
                    <ListItemText primaryTypographyProps={{ variant: "body1" as const, color: "text.primary" }}>Duplicate video</ListItemText>
                </MenuItem>

                <MenuItem onClick={e => closeMenu(e)} sx={{ gap: "4px", py: "8px", px: "16px" }}>
                    <Box sx={{ color: "action.active", display: "flex", alignItems: "center", flexShrink: 0 }}><DashboardCustomizeOutlinedIcon sx={{ fontSize: 16 }} /></Box>
                    <ListItemText primaryTypographyProps={{ variant: "body1" as const, color: "text.primary" }}>Video to template</ListItemText>
                </MenuItem>

                <Divider sx={{ my: "4px", borderColor: "divider" }} />

                <MenuItem onClick={e => closeMenu(e)} sx={{ gap: "4px", py: "8px", px: "16px" }}>
                    <Box sx={{ color: "action.active", display: "flex", alignItems: "center", flexShrink: 0 }}><FolderOutlinedIcon sx={{ fontSize: 16 }} /></Box>
                    <ListItemText primaryTypographyProps={{ variant: "body1" as const, color: "text.primary" }}>Move to folder</ListItemText>
                </MenuItem>

                <MenuItem onClick={e => closeMenu(e)} sx={{ gap: "4px", py: "8px", px: "16px" }}>
                    <Box sx={{ color: "action.active", display: "flex", alignItems: "center", flexShrink: 0 }}><ArchiveOutlinedIcon sx={{ fontSize: 16 }} /></Box>
                    <ListItemText primaryTypographyProps={{ variant: "body1" as const, color: "text.primary" }}>Archive</ListItemText>
                </MenuItem>

                <MenuItem onClick={e => closeMenu(e)} sx={{ gap: "4px", py: "8px", px: "16px" }}>
                    <Box sx={{ color: "error.main", display: "flex", alignItems: "center", flexShrink: 0 }}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></Box>
                    <ListItemText primaryTypographyProps={{ variant: "body1" as const, color: "error.main" }}>Delete</ListItemText>
                </MenuItem>
            </Menu>

            {/* Per-card permission dialog */}
            <VideoPermissionDialog
                open={videoPermOpen}
                onClose={() => setVideoPermOpen(false)}
                onSave={s => {
                    onPermChange?.(video.title, s); setVideoPermOpen(false); setMenuAnchor(savedMenuAnchor.current); 
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
        </Box>
    );
}

// ─── Folder card ──────────────────────────────────────────────────────────────
function FolderCard({ name, count }: { name: string; count: number }) {
    return (
        <Box sx={{
            display: "flex", alignItems: "center", gap: "12px",
            px: "16px", py: "12px", borderRadius: "8px",
            bgcolor: "background.paper",
            cursor: "pointer",
            "&:hover": { bgcolor: "action.selected" },
            minWidth: 0
        }}>
            {/* Folder icon in a rounded square bg */}
            <Box sx={{
                width: 36, height: 36, borderRadius: "6px",
                bgcolor: "other.editorBackground",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
            }}>
                <FolderOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <TypographyWithTooltipOnOverflow variant="subtitle2" sx={{
                    color: "text.primary", lineHeight: 1.5
                }}>
                    {name}
                </TypographyWithTooltipOnOverflow>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                    {count} {count === 1 ? "item" : "items"}
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Left sidebar ─────────────────────────────────────────────────────────────
// Figma specs: width=112px, nav item px=4px py=16px gap=4px,
// font=Open Sans SemiBold 13px white tracking=0.46px capitalize,
// selected bg=#02143e, Create button = gradient pill h=30px w=94px rounded=16px
const NAV_ITEMS = [
    { icon: <VideoLibraryOutlinedIcon sx={{ fontSize: 20 }} />, label: "Video Library", selected: true },
    { icon: <DashboardCustomizeOutlinedIcon sx={{ fontSize: 20 }} />, label: "Template Library", selected: false },
    { icon: <PermMediaOutlinedIcon sx={{ fontSize: 20 }} />, label: "Media", selected: false },
    { icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 20 }} />, label: "Inspiration Gallery", selected: false },
    { icon: <BarChartOutlinedIcon sx={{ fontSize: 20 }} />, label: "Analytics", selected: false }
];

const GRADIENT_CREATE =
  "linear-gradient(154.241deg, rgb(235,137,241) 16.092%, rgb(212,127,239) 25.944%, " +
  "rgb(193,117,238) 35.796%, rgb(171,109,236) 45.649%, rgb(147,101,235) 55.501%, " +
  "rgb(119,94,233) 65.353%, rgb(83,88,231) 75.205%, rgb(0,83,229) 85.057%)";

function AppSidebar() {
    return (
        <Box sx={{
            width: 112, flexShrink: 0, bgcolor: "secondary.main",
            display: "flex", flexDirection: "column", alignItems: "center",
            height: "100%", overflow: "hidden"
        }}>
            {/* Logo area — Figma: LogoforMenu h=104px — click scrolls content to top */}
            <Box sx={{
                height: 104, width: 112, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
                cursor: "pointer", "&:hover": { opacity: 0.8 }
            }}>
                {[{ chars: "SUN", color: "common.white" }, { chars: "DAY", color: "common.white" }, { chars: "SKY", color: "primary.main" }]
                    .map(({ chars, color }) => (
                        <Typography key={chars} variant="caption" sx={{
                            letterSpacing: "0.22em", lineHeight: 1.4, color, display: "block",
                            textTransform: "uppercase"
                        }}>
                            {chars}
                        </Typography>
                    ))}
            </Box>

            {/* Create button — Figma: gradient pill h=30px w=94px rounded=16px */}
            <Button
                startIcon={<AddIcon sx={{ fontSize: "13px !important" }} />}
                sx={{
                    background: GRADIENT_CREATE,
                    color: "common.white",
                    height: 30, width: 94, minWidth: "unset",
                    borderRadius: "16px",
                    px: "10px",
                    mb: "8px",
                    flexShrink: 0,
                    "&:hover": { opacity: 0.88, background: GRADIENT_CREATE }
                }}
            >
        Create
            </Button>

            {/* Nav items — Figma: width=112px px=4px py=16px gap=4px */}
            {NAV_ITEMS.map(({ icon, label, selected }) => (
                <Box key={label} sx={(theme) => ({
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "4px", px: "4px", py: "16px", width: 112,
                    cursor: "pointer",
                    bgcolor: selected ? theme.palette.secondary.main : "transparent",
                    "&:hover": { bgcolor: selected ? theme.palette.secondary.main : "rgba(255,255,255,0.06)" }
                })}>
                    <Box sx={{ color: "common.white" }}>{icon}</Box>
                    <Typography variant="subtitle2" sx={{
                        lineHeight: 1.3, letterSpacing: "0.46px",
                        color: "common.white", textAlign: "center", textTransform: "capitalize"
                    }}>
                        {label}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

// ─── Data — matches real app screenshots ─────────────────────────────────────
// Recent: 5 cards with real names, varied lengths, statuses, and thumbnail types
const RECENT_VIDEOS: VideoItem[] = [
    {
        title:        "Stay Safe During Missile Threats",
        subtitle:     "Essential Safety Protocols",
        editedBy:     "Edited in the past 7 days by you",
        statuses:     ["Draft"],
        personalized: false,
        thumb:        "photo"
    },
    {
        title:        "Recent TTS Pronunciation Advancements", // ← links to video page
        subtitle:     "Explore New Tools for Enhanced Communication",
        editedBy:     "Edited in the past 7 days by you",
        statuses:     ["Draft"],
        personalized: true,
        thumb:        "full"
    },
    {
        title:        "Prepare for Winter Fun!",
        subtitle:     "Family Bonding through Home Prep",
        editedBy:     "Edited in the past 7 days by you",
        statuses:     ["Draft"],
        personalized: false,
        thumb:        "split-template"
    },
    {
        title:        "Understanding the American-Israel-Iran Conflict: Peace & Safety",
        subtitle:     undefined,
        editedBy:     "Edited in the past month by you",
        statuses:     ["Draft"],
        personalized: false,
        thumb:        "split-template"
    },
    {
        title:        "Discover Tel Aviv's Scenic Parks",
        subtitle:     "Urban Oasis Awaits",
        editedBy:     "Edited in the past month by you",
        statuses:     ["Approved for sharing"],
        personalized: true,
        thumb:        "photo"
    }
];

// Videos section: varied titles, statuses, and formats
const ALL_VIDEOS: VideoItem[] = [
    {
        title:        "Prepare for Winter Fun!",
        subtitle:     "Family Bonding through Home Prep",
        editedBy:     "Edited in the past month",
        statuses:     ["Approved for sharing"],
        personalized: true,
        thumb:        "full"
    },
    {
        title:        "Stay Safe During Missile Threats",
        subtitle:     "Essential Safety Protocols",
        editedBy:     "Edited on Nov 4, 2025",
        statuses:     ["Downloaded for Sharing"],
        personalized: false,
        thumb:        "photo"
    },
    {
        title:        "Doc-to-vid test",
        subtitle:     undefined,
        editedBy:     "Edited on Jan 12",
        statuses:     ["Downloaded"],
        personalized: true,
        thumb:        "split-template"
    },
    {
        title:        "Testing recording what will happen when the video name is really really long",
        subtitle:     undefined,
        editedBy:     "Edited on Jul 9, 2025",
        statuses:     ["Downloaded"],
        personalized: false,
        thumb:        "split-template"
    },
    {
        title:        "Recording",
        subtitle:     undefined,
        editedBy:     "Edited on Nov 11, 2025",
        statuses:     ["Downloaded"],
        personalized: false,
        thumb:        "photo"
    },
    {
        title:        "Template editor",
        subtitle:     undefined,
        editedBy:     "Edited on Jul 10, 2025",
        statuses:     ["Approved for sharing"],
        personalized: true,
        thumb:        "split-template"
    },
    {
        title:        "Editor template test",
        subtitle:     undefined,
        editedBy:     "Edited on Apr 29, 2025",
        statuses:     ["Approved for sharing"],
        personalized: false,
        thumb:        "split-template"
    },
    {
        title:        "Onboarding Steps",
        subtitle:     undefined,
        editedBy:     "Edited on Oct 16, 2025",
        statuses:     ["Downloaded"],
        personalized: false,
        thumb:        "split-template"
    }
];

const FOLDERS = [
    { name: "Announcements", count: 3 },
    { name: "Old campaigns", count: 0 },
    { name: "Sales", count: 1 },
    { name: "Onboarding videos Se...", count: 0 },
    { name: "Copilot drafts", count: 3 },
    { name: "Archive", count: 0 }
];

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

    // Count pending approvals across all videos
    const pendingApprovalsCount = videoStates ? Object.values(videoStates).filter(v => v.sentApprovers?.length > 0).length : 0;

    // Memoize callbacks to prevent infinite loops in child components
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
        <Box sx={{ display: "flex", height: "100%", bgcolor: "background.paper", overflow: "hidden" }}>
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

            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Header */}
                <Box sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    px: 4, py: 1.5, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider"
                }}>
                    {/* Breadcrumb */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {["Link", "Link", "Link", "Link"].map((l, i, arr) => (
                            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Typography variant="caption" sx={{
                                    color: "text.secondary", cursor: "pointer", lineHeight: 1.5,
                                    "&:hover": { color: "primary.main" }
                                }}>
                                    {l}
                                </Typography>
                                {i < arr.length - 1 && (
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>/</Typography>
                                )}
                            </Box>
                        ))}
                    </Box>

                    {/* Right: search + bell + user */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <OutlinedInput
                            placeholder="Search..."
                            size="small"
                            startAdornment={
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                </InputAdornment>
                            }
                            sx={{ width: 200, bgcolor: "background.paper" }}
                        />
                        <NotificationBell notifications={notifications} />
                        <Box
                            onClick={() => {
                                setAccountSettingsOpen(true);
                                setAccountSettingsInitialTab("users");
                                onAccountSettingsOpen?.(true);
                            }}
                            sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", borderRadius: "8px", px: "6px", py: "4px", "&:hover": { bgcolor: "action.hover" } }}
                        >
                            <Typography variant="body1" sx={{ color: "text.primary" }}>
                maya-carmel-playgr...
                            </Typography>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main", fontSize: 11 }}>
                MC
                            </Avatar>
                        </Box>
                    </Box>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, overflow: "auto", px: 4, py: 3 }}>

                    <Typography variant="h1" sx={{ color: "text.primary", mb: 3, lineHeight: 1.5 }}>
            Video Library
                    </Typography>

                    {/* ── Recent ─────────────────────────────────────────────────────── */}
                    {/* Figma: flex flex-col gap-[16px] pl-[8px] */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", pl: "8px", mb: 4 }}>
                        {/* Title — Figma: Inter Medium 24px h-[32px] */}
                        <Typography variant="h2" sx={{ color: "text.primary", lineHeight: "32px" }}>
              Recent
                        </Typography>
                        {/* Horizontal scroll strip — Figma: bg-[#f4f7ff] pl-[8px] py-[8px] gap-[8px]
                rounded-bl-[8px] rounded-tl-[8px] overflow-clip (→ overflow-x:auto) */}
                        <Box sx={{
                            display: "flex", gap: "8px", alignItems: "flex-start",
                            overflowX: "auto", pl: "8px", py: "8px",
                            bgcolor: "other.editorBackground",
                            borderRadius: "8px 0 0 8px",
                            // thin scrollbar
                            "&::-webkit-scrollbar": { height: 4 },
                            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                            "&::-webkit-scrollbar-thumb": { bgcolor: "#C9D4EB", borderRadius: 2 }
                        }}>
                            {RECENT_VIDEOS.map((v, i) => (
                                // Figma: each card w-[320px] min-w-[320px] shrink-0
                                <Box key={v.title + i} sx={{ width: 320, minWidth: 320, flexShrink: 0 }}>
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
                    </Box>

                    {/* ── Folders ────────────────────────────────────────────────────── */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Typography variant="h2" sx={{ color: "text.primary", lineHeight: 1.5 }}>
              Folders ({FOLDERS.length})
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon sx={{ fontSize: "14px !important" }} />}
                            sx={{
                                borderColor: "divider", color: "text.primary",
                                "&:hover": { borderColor: "primary.main", bgcolor: "action.selected" }
                            }}
                        >
              New folder
                        </Button>
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1.5, mb: 4 }}>
                        {FOLDERS.map(f => <FolderCard key={f.name} name={f.name} count={f.count} />)}
                    </Box>

                    {/* ── Videos ─────────────────────────────────────────────────────── */}
                    <Typography variant="h2" sx={{ color: "text.primary", lineHeight: 1.5, mb: 2 }}>
            Videos ({ALL_VIDEOS.length})
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 2, pb: 4, alignItems: "stretch" }}>
                        {ALL_VIDEOS.map((v, i) => (
                            <Box key={v.title + "-all-" + i} sx={{ display: "flex" }}>
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

                </Box>
            </Box>
        </Box>
    );
}
