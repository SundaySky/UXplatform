import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
    getEventCount,
    isRecording,
    startRecording,
    stopRecording,
    subscribe
} from "./recorder";

// Hidden activation: Ctrl+Alt+Shift+R toggles recording. The shortcut is
// deliberately obscure so it can't be hit accidentally during a normal demo,
// but is still typeable on any keyboard.
function isToggleShortcut(e: KeyboardEvent): boolean {
    return e.ctrlKey && e.altKey && e.shiftKey && e.code === "KeyR";
}

export default function RecorderOverlay() {
    const [recording, setRecording] = useState(isRecording());
    const [count, setCount] = useState(getEventCount());

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
        function onKey(e: KeyboardEvent) {
            if (!isToggleShortcut(e)) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            if (isRecording()) {
                stopRecording();
            }
            else {
                startRecording();
            }
        }
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, []);

    if (!recording) {
        return null;
    }

    return (
        <Box sx={pillSx} role="status" aria-live="polite">
            <Box sx={dotSx} />
            <Typography variant="caption" sx={labelSx}>REC</Typography>
            <Typography variant="caption" sx={countSx}>{count}</Typography>
        </Box>
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
