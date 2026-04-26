import { useState } from "react";
import type { SxProps, Theme } from "@mui/material";
import {
    Box, Typography, Button, Popover, Divider, Badge, IconButton, SvgIcon,
    ToggleButton
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faThumbsUp } from "@fortawesome/pro-regular-svg-icons";
import { TruffleToggleButtonGroup } from "@sundaysky/smartvideo-hub-truffle-component-library";


export interface NotificationItem {
  id: number
  iconColor: string
  parts: Array<{ text: string; isLink?: boolean }>
  date: string
  unread: boolean
  onLinkClick?: () => void
}

interface Props {
  anchorEl: HTMLElement | null
  onClose: () => void
  onMarkAllRead?: () => void
  notifications: NotificationItem[]
}

export default function NotificationsPanel({ anchorEl, onClose, onMarkAllRead, notifications }: Props) {
    const [tab, setTab] = useState<"all" | "unread">("all");

    const unreadCount = notifications.filter(n => n.unread).length;
    const displayed = tab === "unread" ? notifications.filter(n => n.unread) : notifications;

    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{ sx: popoverPaperSx }}
        >
            <Box sx={panelBodySx}>

                {/* ── Title ───────────────────────────────────────────────────────────── */}
                <Box sx={titleRowSx}>
                    <Typography variant="subtitle1" color="text.primary">
            Notifications
                    </Typography>
                </Box>

                {/* ── Toggle tabs + Mark all as read ──────────────────────────────────── */}
                <Box sx={tabRowSx}>
                    <TruffleToggleButtonGroup
                        value={tab}
                        exclusive
                        onChange={(_, v) => {
                            if (v !== null) {
                                setTab(v as "all" | "unread");
                            }
                        }}
                        size="small"
                        sx={notifToggleGroupSx}
                    >
                        <ToggleButton value="all" color="primary" selected={tab === "all"} onClick={() => setTab("all")}>All</ToggleButton>
                        <ToggleButton value="unread" color="primary" selected={tab === "unread"} onClick={() => setTab("unread")}>Unread ({unreadCount})</ToggleButton>
                    </TruffleToggleButtonGroup>
                    <Button variant="text" size="small" onClick={onMarkAllRead}>
                        Mark all as read
                    </Button>
                </Box>

                {/* ── Divider ─────────────────────────────────────────────────────────── */}
                <Divider sx={dividerSx} />

                {/* ── Notification items ───────────────────────────────────────────────── */}
                <Box sx={listSx}>
                    {displayed.length === 0 && (
                        <Typography variant="caption" sx={emptyTextSx}>
              No {tab === "unread" ? "unread " : ""}notifications
                        </Typography>
                    )}

                    {displayed.map(n => (
                        <Box key={n.id} sx={notifItemSx}>
                            {/* Icon avatar — no badge */}
                            <Box sx={notifIconWrapSx}>
                                <Box sx={notifIconBoxSx}>
                                    <SvgIcon sx={{ fontSize: "18px !important", width: "18px !important", height: "18px !important", color: n.iconColor }}><FontAwesomeIcon icon={faThumbsUp} /></SvgIcon>
                                </Box>
                            </Box>

                            {/* Text + date */}
                            <Box sx={notifTextColSx}>
                                <Typography component="div" variant="caption" sx={notifBodySx}>
                                    {n.parts.map((part, pi) => (
                                        <Box
                                            key={pi}
                                            component="span"
                                            onClick={part.isLink ? () => {
                                                n.onLinkClick?.(); onClose(); 
                                            } : undefined}
                                            sx={{
                                                fontWeight: n.unread ? 700 : 400,
                                                color: part.isLink ? "primary.main" : "inherit",
                                                cursor: part.isLink ? "pointer" : "inherit",
                                                "&:hover": part.isLink ? { textDecoration: "underline" } : {}
                                            }}
                                        >
                                            {part.text}
                                        </Box>
                                    ))}
                                </Typography>
                                <Typography variant="caption" sx={notifDateSx}>
                                    {n.date}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Popover>
    );
}

// ─── Bell icon button ─────────────────────────────────────────────────────────
interface BellProps {
  dark?: boolean
  notifications?: NotificationItem[]
}

export function NotificationBell({ dark = false, notifications = [] }: BellProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [readIds, setReadIds] = useState<Set<number>>(new Set());

    // Merge parent-provided unread state with locally tracked read IDs
    const computed = notifications.map(n => ({
        ...n,
        unread: n.unread && !readIds.has(n.id)
    }));

    const unreadCount = computed.filter(n => n.unread).length;

    return (
        <>
            <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ color: dark ? "common.white" : "action.active" }}
            >
                <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={badgeSx}
                >
                    <SvgIcon sx={bellIconSx}><FontAwesomeIcon icon={faBell} /></SvgIcon>
                </Badge>
            </IconButton>
            <NotificationsPanel
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                onMarkAllRead={() => setReadIds(new Set(notifications.map(n => n.id)))}
                notifications={computed}
            />
        </>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const popoverPaperSx: SxProps<Theme> = (theme) => ({
    width: 332, borderRadius: "8px",
    boxShadow: `0px 0px 5px 0px ${alpha(theme.palette.secondary.main, 0.25)}`,
    mt: "4px", overflow: "visible"
});
const panelBodySx: SxProps<Theme> = { pt: 1, pb: 2, px: 2 };
const titleRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", minHeight: 40, pb: 1 };
const tabRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", justifyContent: "space-between" };

const notifToggleGroupSx: SxProps<Theme> = (theme) => ({
    "& .MuiToggleButton-root.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        color: theme.palette.primary.main
    }
});
const dividerSx: SxProps<Theme> = { my: "12px", borderColor: "divider" };
const listSx: SxProps<Theme> = { display: "flex", flexDirection: "column" };
const emptyTextSx: SxProps<Theme> = { color: "text.secondary", textAlign: "center", py: 2 };
const notifItemSx: SxProps<Theme> = { py: "8px", display: "flex", gap: "6px", alignItems: "flex-start", borderRadius: "8px" };
const notifIconWrapSx: SxProps<Theme> = { flexShrink: 0, mr: "4px" };
const notifIconBoxSx: SxProps<Theme> = { width: 32, height: 32, bgcolor: "primary.light", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" };
const notifTextColSx: SxProps<Theme> = { flex: 1, minWidth: 0 };
const notifBodySx: SxProps<Theme> = { color: "text.primary", whiteSpace: "pre-wrap" };
const notifDateSx: SxProps<Theme> = { color: "text.disabled", mt: "2px" };
const bellIconSx: SxProps<Theme> = { fontSize: "22px !important", width: "22px !important", height: "22px !important" };
const badgeSx: SxProps<Theme> = { "& .MuiBadge-badge": { fontSize: 9, minWidth: 14, height: 14, padding: 0 } };
