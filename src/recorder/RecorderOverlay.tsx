import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
    getEventCount,
    isRecording,
    startRecording,
    stopRecording,
    subscribe,
    type GitInfo
} from "./recorder";
import { evaluateGitStatus, fetchGitStatus, type GitStatus, type GuardVerdict } from "./gitGuard";

function toGitInfo(s: GitStatus | null | undefined): GitInfo | undefined {
    if (!s || !s.available) {
        return undefined;
    }
    return { branch: s.branch, sha: s.sha, tag: s.currentTag };
}

// Hidden activation: Ctrl+Alt+Shift+R toggles recording. The shortcut is
// deliberately obscure so it can't be hit accidentally during a normal demo,
// but is still typeable on any keyboard.
function isToggleShortcut(e: KeyboardEvent): boolean {
    return e.ctrlKey && e.altKey && e.shiftKey && e.code === "KeyR";
}

export default function RecorderOverlay() {
    const [recording, setRecording] = useState(isRecording());
    const [count, setCount] = useState(getEventCount());
    const [verdict, setVerdict] = useState<GuardVerdict | null>(null);
    const [checking, setChecking] = useState(false);

    useEffect(() => subscribe(() => {
        setRecording(isRecording());
        setCount(getEventCount());
    }), []);

    // Tick the event counter while recording so the indicator updates.
    useEffect(() => {
        if (!recording) {
            return;
        }
        const id = window.setInterval(() => setCount(getEventCount()), 500);
        return () => window.clearInterval(id);
    }, [recording]);

    useEffect(() => {
        async function tryStart() {
            setChecking(true);
            try {
                const status = await fetchGitStatus();
                const v = evaluateGitStatus(status);
                if (v.severity === "ok") {
                    startRecording(toGitInfo(status));
                }
                else {
                    setVerdict(v);
                }
            }
            finally {
                setChecking(false);
            }
        }

        function onKey(e: KeyboardEvent) {
            if (!isToggleShortcut(e)) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            if (isRecording()) {
                stopRecording();
            }
            else if (!checking && !verdict) {
                void tryStart();
            }
        }
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [checking, verdict]);

    function onConfirmStart() {
        const gi = toGitInfo(verdict?.status);
        setVerdict(null);
        startRecording(gi);
    }

    function onCancel() {
        setVerdict(null);
    }

    return (
        <>
            {recording && (
                <Box sx={pillSx} role="status" aria-live="polite">
                    <Box sx={dotSx} />
                    <Typography variant="caption" sx={labelSx}>REC</Typography>
                    <Typography variant="caption" sx={countSx}>{count}</Typography>
                </Box>
            )}
            <GuardDialog verdict={verdict} onCancel={onCancel} onConfirm={onConfirmStart} />
        </>
    );
}

// ─── Guard dialog ───────────────────────────────────────────────────────────
function GuardDialog({
    verdict,
    onCancel,
    onConfirm
}: {
    verdict: GuardVerdict | null;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const blocked = verdict?.severity === "block";
    return (
        <Dialog
            open={!!verdict}
            onClose={onCancel}
            slotProps={{ paper: { "data-rec-player": "true" } as never }}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{verdict?.title}</DialogTitle>
            <DialogContent>
                {verdict?.reasons.map((r, i) => (
                    <Typography key={i} variant="body1" sx={{ mb: 1 }}>
                        {r}
                    </Typography>
                ))}
                {verdict?.suggestion && (
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                        {verdict.suggestion}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                {blocked ? (
                    <Button size="large" onClick={onCancel}>
                        OK
                    </Button>
                ) : (
                    <>
                        <Button size="large" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button variant="contained" size="large" onClick={onConfirm}>
                            Start anyway
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const pillSx: SxProps<Theme> = {
    position: "fixed",
    top: 12,
    right: 12,
    zIndex: 2147483647,
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    px: 1.25,
    py: 0.5,
    borderRadius: 999,
    bgcolor: "error.main",
    boxShadow: 3,
    pointerEvents: "none"
};

const dotSx: SxProps<Theme> = {
    width: 8,
    height: 8,
    borderRadius: "50%",
    bgcolor: "common.white",
    animation: "rec-blink 1.4s ease-in-out infinite",
    "@keyframes rec-blink": {
        "0%, 100%": { opacity: 1 },
        "50%": { opacity: 0.25 }
    }
};

const labelSx: SxProps<Theme> = {
    color: "common.white",
    fontWeight: 600,
    letterSpacing: 0.5
};

const countSx: SxProps<Theme> = {
    color: "common.white",
    opacity: 0.85,
    minWidth: 16,
    textAlign: "right"
};
