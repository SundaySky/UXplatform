import { useCallback, useEffect, useRef, useState } from "react";
import {
    Box, Button, Checkbox, Dialog, DialogContent, Divider, IconButton, SvgIcon, TextField, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faXmark } from "@fortawesome/pro-regular-svg-icons";
import { faChevronRight } from "@fortawesome/pro-solid-svg-icons";
import { TruffleDialogActions, TruffleDialogTitle } from "@sundaysky/smartvideo-hub-truffle-component-library";

// checkedNow = checked this panel session (stays in Unresolved with strikethrough)
// resolved   = resolved in a previous session (shown in Completed tab)
interface CommentItem { text: string; checkedNow: boolean; resolved: boolean }
export interface CommentThread { id: number; author: string; comments: CommentItem[] }

// Total comment count for use in the "View [x] approver comments" button
export const TOTAL_COMMENT_COUNT = 4; // Sarah: 2 + Emma: 1 + Manager: 1

export const INITIAL_THREADS: CommentThread[] = [
    {
        id: 1, author: "Sarah Johnson",
        comments: [
            { text: "Opening scene - add the name of the company to the title", checkedNow: false, resolved: false },
            { text: "Opening scene - We may need a different version of this image depending on rights. Can you check and update me?", checkedNow: false, resolved: false }
        ]
    },
    {
        id: 2, author: "Emma Rodriguez",
        comments: [
            { text: "Closing scene - A legal disclaimer is required on this screen", checkedNow: false, resolved: false }
        ]
    },
    {
        id: 3, author: "Manager",
        comments: [
            { text: "Your manager has asked you to create a new scene in the video. In this scene, include three bullet points that clearly communicate key aspects of the delivery policy. Please come up with short, clear statements for each bullet. For example: Fast delivery within 3–5 business days, Free shipping on orders over $50, Easy returns within 30 days (don't change the bullet icon for now).", checkedNow: false, resolved: false }
        ]
    }
];

// Inner dialog (Figma node 19050-66136) — only used by CommentsPanel
function UnresolvedWarningDialog({ open, count, onClose, onConfirm }: { open: boolean; count: number; onClose: () => void; onConfirm: () => void }) {
    const [explanation, setExplanation] = useState("");
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ zIndex: 1500 }}>
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: onClose }}>
                Unresolved comments require explanation
            </TruffleDialogTitle>
            <DialogContent sx={{ pt: "8px !important" }}>
                <Typography variant="body1" sx={{
                    color: "text.primary", mb: 2
                }}>
          There are {count} unresolved {count === 1 ? "comment" : "comments"}.{" "}
                    <Box component="span"
                        sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                        onClick={onClose}
                    >
            View comments
                    </Box>
                </Typography>
                <Typography sx={{
                    lineHeight: 1.5, color: "text.primary", mb: 1
                }}>
          Explain why you're requesting sign-off again without changes
                </Typography>
                <TextField
                    fullWidth multiline rows={3}
                    placeholder="Explain unresolved comments"
                    value={explanation}
                    onChange={e => setExplanation(e.target.value)}
                    variant="outlined" size="medium"
                    InputProps={{ sx: { letterSpacing: "0.15px" } }}
                />
            </DialogContent>
            <TruffleDialogActions>
                <Button variant="outlined" color="primary" size="large" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="primary" size="large" onClick={onConfirm}>
                    Send for approvers
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// Draggable + resizable comments panel
export default function CommentsPanel({
    open, onClose, threads, setThreads, onRequestApproval, awaitingApprovers
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
    const [warningOpen, setWarningOpen] = useState(false);
    const dragging = useRef(false);
    const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

    // Position on open
    useEffect(() => {
        if (open) {
            setPos({ x: Math.max(0, window.innerWidth - 330 - 266), y: 80 });
        }
    }, [open]);

    // On close: move checkedNow → resolved (for next session)
    useEffect(() => {
        if (!open) {
            setThreads(prev => prev.map(t => ({
                ...t,
                comments: t.comments.map(c =>
                    c.checkedNow ? { ...c, checkedNow: false, resolved: true } : c
                )
            })));
        }
    }, [open, setThreads]);

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

    // Toggle check: stays in Unresolved tab (strikethrough) until panel closes
    const toggleCheck = (threadId: number, idx: number) =>
        setThreads(prev => prev.map(t =>
            t.id === threadId
                ? { ...t, comments: t.comments.map((c, i) => i === idx ? { ...c, checkedNow: !c.checkedNow } : c) }
                : t
        ));

    const unresolvedCount = threads.reduce((n, t) => n + t.comments.filter(c => !c.checkedNow && !c.resolved).length, 0);
    const allAddressed = threads.every(t => t.comments.every(c => c.checkedNow || c.resolved));

    const handleRequestApproval = () => {
        if (!allAddressed) {
            setWarningOpen(true); return;
        }
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
                            { key: "completed", label: "Completed" }
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

                {/* ── "View version" link — Unresolved tab only, hidden when no comments ── */}
                {tab === "unresolved" && unresolvedCount > 0 && (
                    <Box sx={commentsViewVersionRowSx}>
                        <SvgIcon sx={{ fontSize: "14px !important", color: "primary.main" }}><FontAwesomeIcon icon={faEye} /></SvgIcon>
                        <Typography variant="body1" sx={{ color: "primary.main" }}>
              View version sent for approval
                        </Typography>
                        <SvgIcon sx={{ fontSize: "11px !important", color: "primary.main" }}><FontAwesomeIcon icon={faChevronRight} /></SvgIcon>
                    </Box>
                )}

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
                <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: "4px", pb: "12px", display: "flex", flexDirection: "column", gap: "16px", ...(awaitingApprovers && tab === "unresolved" ? { display: "none" } : {}) }}>
                    {threads.map(thread => {
                        const visibleComments = tab === "unresolved"
                            ? thread.comments.filter(c => !c.resolved)
                            : thread.comments.filter(c => c.resolved);
                        if (visibleComments.length === 0) {
                            return null;
                        }
                        return (
                            <Box key={thread.id}>
                                {/* "By [Approver Name]" label — only when multiple approvers */}
                                {threads.length > 1 && (
                                    <Typography variant="body1" sx={{ color: "text.secondary", mb: "8px" }}>
                    By {thread.author}
                                    </Typography>
                                )}

                                {/* Comments with MUI Checkbox */}
                                {visibleComments.map((c, visibleIdx) => {
                                    const originalIdx = thread.comments.indexOf(c);
                                    const isChecked = c.checkedNow || c.resolved;
                                    return (
                                        <Box key={originalIdx}>
                                            {visibleIdx > 0 && (
                                                <Divider sx={{ my: "8px", borderColor: "grey.400" }} />
                                            )}
                                            <Box sx={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                                                <Checkbox
                                                    size="small"
                                                    checked={isChecked}
                                                    onChange={() => tab === "unresolved" && toggleCheck(thread.id, originalIdx)}
                                                    disabled={tab === "completed"}
                                                    sx={commentCheckboxSx}
                                                />
                                                <Typography sx={{
                                                    color: isChecked ? "text.secondary" : "text.primary",
                                                    lineHeight: 1.5,
                                                    textDecoration: isChecked ? "line-through" : "none",
                                                    flex: 1
                                                }}>
                                                    {c.text}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        );
                    })}

                    {/* Empty states */}
                    {tab === "completed" && threads.every(t => t.comments.every(c => !c.resolved)) && (
                        <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", mt: 2 }}>
              No completed comments yet
                        </Typography>
                    )}
                    {tab === "unresolved" && unresolvedCount === 0 && (
                        <Typography variant="body1" sx={{ color: "text.secondary", textAlign: "center", mt: 3, pb: "50px" }}>
              There are no unresolved comments
                        </Typography>
                    )}
                </Box>

                {/* ── Footer: "Resend for approval" — hidden when awaiting approvers or no comments yet ── */}
                {!awaitingApprovers && threads.length > 0 && (
                    <Box sx={commentsPanelFooterSx}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleRequestApproval}
                            sx={commentsResendBtnSx}
                        >
              Resend for approval
                        </Button>
                    </Box>
                )}
            </Box>

            {/* ── Unresolved warning dialog ─────────────────────────────────────── */}
            <UnresolvedWarningDialog
                open={warningOpen}
                count={unresolvedCount}
                onClose={() => setWarningOpen(false)}
                onConfirm={() => {
                    setWarningOpen(false); onRequestApproval();
                }}
            />
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

const commentsViewVersionRowSx: SxProps<Theme> = {
    px: 2,
    py: "8px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
    "&:hover": { opacity: 0.8 }
};

const commentsPanelFooterSx: SxProps<Theme> = {
    px: 2,
    py: "12px",
    borderTop: 1,
    borderTopStyle: "solid",
    borderTopColor: "grey.400",
    flexShrink: 0,
    display: "flex",
    justifyContent: "flex-end"
};

const commentsResendBtnSx: SxProps<Theme> = {
    bgcolor: "primary.main",
    "&:hover": { bgcolor: "primary.dark" },
    px: 2
};

const commentCheckboxSx: SxProps<Theme> = {
    p: "2px",
    flexShrink: 0,
    mt: "1px",
    color: "action.active",
    "&.Mui-checked": { color: "primary.main" }
};
