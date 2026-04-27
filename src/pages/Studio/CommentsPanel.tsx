import { useCallback, useEffect, useRef, useState } from "react";
import {
    Box, Button, Divider, IconButton, SvgIcon, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-regular-svg-icons";

// checkedNow = checked this panel session (stays in Unresolved with strikethrough)
// resolved   = resolved in a previous session (shown in Completed tab)
interface CommentItem { text: string; checkedNow: boolean; resolved: boolean }
export interface CommentThread { id: number; author: string; comments: CommentItem[] }

// Total comment count for use in the "View [x] approver comments" button.
// Counts Sarah's unresolved comments only (resolved ones live on the History tab).
export const TOTAL_COMMENT_COUNT = 2;

export const INITIAL_THREADS: CommentThread[] = [
    {
        id: 1, author: "Sarah Johnson",
        comments: [
            { text: "Opening scene - add the name of the company to the title", checkedNow: false, resolved: false },
            { text: "Opening scene - We may need a different version of this image depending on rights. Can you check and update me?", checkedNow: false, resolved: false }
        ]
    }
];

// Draggable + resizable comments panel
export default function CommentsPanel({
    open, onClose, threads, onRequestApproval, awaitingApprovers
}: {
  open: boolean
  onClose: () => void
  threads: CommentThread[]
  setThreads: React.Dispatch<React.SetStateAction<CommentThread[]>>
  approverNames?: string
  onRequestApproval: () => void
  awaitingApprovers?: boolean
}) {
    const [pos, setPos] = useState({ x: 0, y: 80 });
    const [tab, setTab] = useState<"unresolved" | "completed">("unresolved");
    const dragging = useRef(false);
    const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

    // Position on open — sits on the LEFT side of the screen, just to the right of
    // the studio's left nav menu, so it doesn't cover the input form on the right.
    // The user can still drag it elsewhere; this is just the initial placement.
    useEffect(() => {
        if (open) {
            setPos({ x: 240, y: 80 });
        }
    }, [open]);


    // Drag
    const onHeaderMouseDown = useCallback((e: React.MouseEvent) => {
        dragging.current = true;
        dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
        e.preventDefault();
    }, [pos]);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!dragging.current) {
                return;
            }
            setPos({ x: dragStart.current.px + (e.clientX - dragStart.current.mx), y: dragStart.current.py + (e.clientY - dragStart.current.my) });
        };
        const onUp = () => {
            dragging.current = false;
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
        };
    }, []);

    const unresolvedCount = threads.reduce((n, t) => n + t.comments.filter(c => !c.resolved).length, 0);

    const handleRequestApproval = () => {
        onRequestApproval();
    };

    if (!open) {
        return null;
    }

    return (
        <>
            <Box sx={(theme) => ({
                position: "fixed", left: pos.x, top: pos.y,
                width: 292, minWidth: 260,
                minHeight: 460,
                bgcolor: "background.paper", borderRadius: "8px",
                boxShadow: `0px 0px 5px 0px ${alpha(theme.palette.secondary.main, 0.25)}`,
                zIndex: 1300,
                display: "flex", flexDirection: "column",
                resize: "both", overflow: "hidden"
            })}>

                {/* ── Header (drag to move) ─────────────────────────────────────── */}
                <Box onMouseDown={onHeaderMouseDown} sx={commentsPanelHeaderSx}>
                    <Typography variant="subtitle2" sx={{ color: "text.primary" }}>
            Comments
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={onClose}
                        sx={{ color: "text.primary", p: "8px", borderRadius: "8px" }}
                    >
                        <SvgIcon sx={{ fontSize: "16px !important", width: "16px !important", height: "16px !important" }}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                    </IconButton>
                </Box>

                {/* ── Toggle tab selector (ToggleButtonGroup pill style) ────────── */}
                <Box sx={commentsTabAreaSx}>
                    <Box sx={commentsTabGroupSx}>
                        {[
                            { key: "unresolved", label: awaitingApprovers ? "Unresolved" : `Unresolved (${unresolvedCount})` },
                            { key: "completed", label: "History" }
                        ].map(({ key, label }) => (
                            <Box
                                key={key}
                                onClick={() => setTab(key as typeof tab)}
                                sx={{
                                    px: "6px", py: "4px",
                                    borderRadius: "7px",
                                    cursor: "pointer",
                                    bgcolor: tab === key ? "action.selected" : "transparent",
                                    transition: "background-color 0.15s"
                                }}
                            >
                                <Typography variant="body1" sx={{
                                    color: tab === key ? "text.primary" : "text.secondary",
                                    whiteSpace: "nowrap"
                                }}>
                                    {label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* ── Divider ───────────────────────────────────────────────────── */}
                <Divider sx={{ borderColor: "grey.400", flexShrink: 0 }} />

                {/* ── Awaiting all approvers state ──────────────────────────────── */}
                {awaitingApprovers && tab === "unresolved" && (
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: 3 }}>
                        <Typography variant="body1" sx={{
                            color: "text.primary", textAlign: "center"
                        }}>
              1 of 2 approvers responded<br />
              Comments will appear here once all approvers have responded.
                        </Typography>
                    </Box>
                )}

                {/* ── Comment threads ───────────────────────────────────────────── */}
                <Box sx={{ flex: 1, overflowY: "auto", px: 2, pt: "16px", pb: "16px", display: "flex", flexDirection: "column", gap: "20px", ...(awaitingApprovers && tab === "unresolved" ? { display: "none" } : {}) }}>
                    {threads.map(thread => {
                        const visibleComments = tab === "unresolved"
                            ? thread.comments.filter(c => !c.resolved)
                            : thread.comments.filter(c => c.resolved);
                        if (visibleComments.length === 0) {
                            return null;
                        }
                        return (
                            <Box key={thread.id}>
                                {/* "By [Approver], [date]" header — always shown per Figma */}
                                <Box sx={commentAuthorPillSx}>
                                    <Typography variant="caption" color="info.main">
                                        By {thread.author}, Mar 23, 12:05 PM
                                    </Typography>
                                </Box>

                                {/* Comments — plain paragraphs (no checkboxes per Figma).
                                    Resolved comments (History tab) render with strikethrough. */}
                                {visibleComments.map((c, visibleIdx) => {
                                    const originalIdx = thread.comments.indexOf(c);
                                    const isResolved = c.resolved;
                                    return (
                                        <Box key={originalIdx}>
                                            {visibleIdx > 0 && (
                                                <Box sx={{ height: "16px" }} />
                                            )}
                                            <Typography variant="body1" sx={{
                                                color: isResolved ? "text.secondary" : "text.primary",
                                                textDecoration: isResolved ? "line-through" : "none",
                                                lineHeight: 1.5
                                            }}>
                                                {c.text}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        );
                    })}

                    {/* Empty states */}
                    {tab === "completed" && threads.every(t => t.comments.every(c => !c.resolved)) && (
                        <Typography variant="body1" sx={{ color: "text.secondary", textAlign: "center", mt: 3, px: 2 }}>
                            Once comments are resolved, they’ll appear here for everyone to see.
                        </Typography>
                    )}
                    {tab === "unresolved" && unresolvedCount === 0 && (
                        <Typography variant="body1" sx={{ color: "text.secondary", textAlign: "center", mt: 3, px: 2 }}>
                            There are no unresolved comments for this video.
                            <br /><br />
                            If you request approval, you’ll be notified by email when feedback is available.
                        </Typography>
                    )}
                </Box>

                {/* ── Footer: "Resubmit for approval" — disabled on History tab
                    OR when there are no unresolved comments left to resubmit. ── */}
                {!awaitingApprovers && threads.length > 0 && (
                    <Box sx={commentsPanelFooterSx}>
                        <Button
                            variant="contained"
                            size="medium"
                            disabled={tab === "completed" || unresolvedCount === 0}
                            onClick={handleRequestApproval}
                            sx={commentsResendBtnSx}
                        >
                            Resubmit for approval
                        </Button>
                    </Box>
                )}
            </Box>
        </>
    );
}

const commentsPanelHeaderSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 2,
    pt: 1,
    pb: 1,
    cursor: "grab",
    "&:active": { cursor: "grabbing" },
    userSelect: "none",
    flexShrink: 0
};

const commentsTabAreaSx: SxProps<Theme> = {
    px: 2,
    pb: "8px",
    flexShrink: 0
};

const commentsTabGroupSx: SxProps<Theme> = {
    display: "inline-flex",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "grey.300",
    borderRadius: "8px",
    padding: "1px",
    gap: 0
};

// Pill-shaped header above each thread per Figma: info.light bg, info.main text
const commentAuthorPillSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    bgcolor: "info.light",
    borderRadius: "100px",
    px: 1.5,
    py: "4px",
    mb: "12px"
};

const commentsPanelFooterSx: SxProps<Theme> = {
    px: 2,
    pb: 2,
    pt: 1,
    flexShrink: 0,
    display: "flex",
    justifyContent: "flex-end"
};

const commentsResendBtnSx: SxProps<Theme> = {
    bgcolor: "primary.main",
    "&:hover": { bgcolor: "primary.dark" }
};

