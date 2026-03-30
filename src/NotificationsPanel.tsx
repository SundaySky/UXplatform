import React, { useState } from "react";
import {
    Box, Typography, Button, Popover, Divider, Badge, IconButton
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";

const ns = {
    primary:      "#0053E5",
    primaryLight: "#F4F7FF",
    textPrimary:  "#323338",
    textSecondary:"rgba(50,51,56,0.8)",
    textDisabled: "rgba(50,51,56,0.5)",
    grey300:      "#CFD6EA",
    dividerGrey:  "#E0E0E0"
};

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
            PaperProps={{
                sx: {
                    width: 332, borderRadius: "8px",
                    boxShadow: "0px 0px 5px 0px rgba(3,25,79,0.25)",
                    mt: "4px", overflow: "visible"
                }
            }}
        >
            <Box sx={{ pt: 1, pb: 2, px: 2 }}>

                {/* ── Title ───────────────────────────────────────────────────────────── */}
                <Box sx={{ display: "flex", alignItems: "center", minHeight: 40, pb: 1 }}>
                    <Typography sx={{
                        fontFamily: "\"Open Sans\", sans-serif", fontWeight: 500, fontSize: 16,
                        color: ns.textPrimary, lineHeight: 1.5
                    }}>
            Notifications
                    </Typography>
                </Box>

                {/* ── Toggle tabs + Mark all as read ──────────────────────────────────── */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{
                        display: "inline-flex", alignItems: "stretch",
                        border: `1px solid ${ns.grey300}`,
                        borderRadius: "8px", padding: "1px",
                        overflow: "hidden"
                    }}>
                        {(["all", "unread"] as const).map((key, i) => (
                            <React.Fragment key={key}>
                                {i > 0 && (
                                    <Box sx={{ width: "1px", bgcolor: ns.grey300, flexShrink: 0, my: "2px" }} />
                                )}
                                <Box
                                    onClick={() => setTab(key)}
                                    sx={{
                                        px: "8px", py: "4px", borderRadius: "7px", cursor: "pointer",
                                        bgcolor: tab === key ? "rgba(0,83,229,0.1)" : "transparent",
                                        transition: "background-color 0.15s"
                                    }}
                                >
                                    <Typography sx={{
                                        fontFamily: "\"Open Sans\", sans-serif", fontWeight: 500, fontSize: 14,
                                        color: tab === key ? ns.textPrimary : ns.textSecondary, whiteSpace: "nowrap"
                                    }}>
                                        {key === "all" ? "All" : `Unread (${unreadCount})`}
                                    </Typography>
                                </Box>
                            </React.Fragment>
                        ))}
                    </Box>
                    <Button
                        variant="text" size="small"
                        onClick={onMarkAllRead}
                        sx={{
                            fontFamily: "\"Inter\", sans-serif", fontWeight: 500, fontSize: 14,
                            textTransform: "none", color: ns.primary
                        }}
                    >
            Mark all as read
                    </Button>
                </Box>

                {/* ── Divider ─────────────────────────────────────────────────────────── */}
                <Divider sx={{ my: "12px", borderColor: ns.dividerGrey }} />

                {/* ── Notification items ───────────────────────────────────────────────── */}
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {displayed.length === 0 && (
                        <Typography sx={{
                            fontFamily: "\"Open Sans\", sans-serif", fontSize: 13,
                            color: ns.textSecondary, textAlign: "center", py: 2
                        }}>
              No {tab === "unread" ? "unread " : ""}notifications
                        </Typography>
                    )}

                    {displayed.map(n => (
                        <Box key={n.id} sx={{
                            py: "8px", display: "flex", gap: "6px", alignItems: "flex-start",
                            borderRadius: "8px"
                        }}>
                            {/* Icon avatar — no badge */}
                            <Box sx={{ flexShrink: 0, mr: "4px" }}>
                                <Box sx={{
                                    width: 32, height: 32, bgcolor: ns.primaryLight,
                                    borderRadius: "4px",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <ThumbUpAltOutlinedIcon sx={{ fontSize: 18, color: n.iconColor }} />
                                </Box>
                            </Box>

                            {/* Text + date */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography component="div" sx={{
                                    fontFamily: "\"Open Sans\", sans-serif",
                                    fontSize: 12, lineHeight: 1.5,
                                    color: ns.textPrimary,
                                    whiteSpace: "pre-wrap"
                                }}>
                                    {n.parts.map((part, pi) => (
                                        <Box
                                            key={pi}
                                            component="span"
                                            onClick={part.isLink ? () => {
                                                n.onLinkClick?.(); onClose(); 
                                            } : undefined}
                                            sx={{
                                                fontWeight: n.unread ? 700 : 400,
                                                color: part.isLink ? ns.primary : "inherit",
                                                cursor: part.isLink ? "pointer" : "inherit",
                                                "&:hover": part.isLink ? { textDecoration: "underline" } : {}
                                            }}
                                        >
                                            {part.text}
                                        </Box>
                                    ))}
                                </Typography>
                                <Typography sx={{
                                    fontFamily: "\"Open Sans\", sans-serif", fontWeight: 400, fontSize: 12,
                                    color: ns.textDisabled, mt: "2px", lineHeight: 1.5
                                }}>
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
                sx={{ color: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.56)" }}
            >
                <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{ "& .MuiBadge-badge": { fontSize: 9, minWidth: 14, height: 14, padding: 0 } }}
                >
                    <NotificationsNoneIcon sx={{ fontSize: 22 }} />
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
