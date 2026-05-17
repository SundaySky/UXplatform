import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Slider,
    Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/pro-regular-svg-icons/faPlay";
import { faPause } from "@fortawesome/pro-regular-svg-icons/faPause";
import { faBackwardStep } from "@fortawesome/pro-regular-svg-icons/faBackwardStep";
import { faForwardStep } from "@fortawesome/pro-regular-svg-icons/faForwardStep";
import { faXmark } from "@fortawesome/pro-regular-svg-icons/faXmark";
import {
    getCurrentPlaybackMs,
    getSnapshot,
    loadLog,
    next,
    pause,
    play,
    prev,
    seek,
    setSpeed,
    subscribe,
    unload
} from "./player";
import type { RecordedEvent, RecordingLog } from "./recorder";

function isOpenShortcut(e: KeyboardEvent): boolean {
    return e.ctrlKey && e.altKey && e.shiftKey && e.code === "KeyP";
}

function validateLog(value: unknown): asserts value is RecordingLog {
    if (!value || typeof value !== "object") {
        throw new Error("Not a JSON object");
    }
    const log = value as Record<string, unknown>;
    if (!Array.isArray(log.events)) {
        throw new Error("Missing 'events' array");
    }
    for (const ev of log.events) {
        if (!ev || typeof ev !== "object") {
            throw new Error("Event is not an object");
        }
        const e = ev as Record<string, unknown>;
        if (typeof e.t !== "number") {
            throw new Error("Event missing 't'");
        }
        if (typeof e.type !== "string") {
            throw new Error("Event missing 'type'");
        }
        if (!e.target || typeof e.target !== "object") {
            throw new Error("Event missing 'target'");
        }
    }
}

export default function PlayerOverlay() {
    const [, bump] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => subscribe(() => bump(n => n + 1)), []);

    // Tick the displayed playback time while playing so the mm:ss readout advances
    // continuously between events, not just on dispatch.
    const status = getSnapshot().status;
    useEffect(() => {
        if (status !== "playing") {
            return;
        }
        const id = window.setInterval(() => bump(n => n + 1), 100);
        return () => window.clearInterval(id);
    }, [status]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (!isOpenShortcut(e)) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            setDialogOpen(true);
        }
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, []);

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-picking the same file later
        if (!file) {
            return;
        }
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const json = JSON.parse(String(ev.target?.result ?? ""));
                validateLog(json);
                loadLog(json);
                setLoadError(null);
                setDialogOpen(false);
            }
            catch (err) {
                setLoadError(err instanceof Error ? err.message : String(err));
            }
        };
        reader.onerror = () => setLoadError("Failed to read file");
        reader.readAsText(file);
    }

    const snap = getSnapshot();
    const isLoaded = snap.log !== null && snap.status !== "idle";

    return (
        <>
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                slotProps={{ paper: { "data-rec-player": "true" } as never }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Load recording</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Select a recording JSON file to replay against this prototype.
                    </Typography>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => fileInputRef.current?.click()}
                        fullWidth
                    >
                        {fileName ?? "Choose recording file"}
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json,.json"
                        hidden
                        onChange={handleFile}
                    />
                    {loadError && (
                        <Typography color="error" variant="body1" sx={{ mt: 2 }}>
                            {loadError}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button size="large" onClick={() => setDialogOpen(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {isLoaded && snap.log && <ControlBar log={snap.log} />}

            {snap.cursor.visible && <CursorIndicator x={snap.cursor.x} y={snap.cursor.y} />}
        </>
    );
}

// ─── Control bar ────────────────────────────────────────────────────────────
function ControlBar({ log }: { log: RecordingLog }) {
    const snap = getSnapshot();
    const total = log.events.length;
    const currentIdx = Math.min(snap.index, total - 1);
    const current = log.events[currentIdx];
    const prevEvent = currentIdx > 0 ? log.events[currentIdx - 1] : null;
    const routeChanged = !!current?.url && (!prevEvent || prevEvent.url !== current.url);
    const isPlaying = snap.status === "playing";
    const isFinished = snap.status === "finished";

    return (
        <Paper data-rec-player="true" elevation={6} sx={barSx}>
            <Box sx={rowSx}>
                <IconButton
                    size="small"
                    onClick={prev}
                    disabled={snap.index <= 0}
                    aria-label="Previous event"
                    sx={iconBtnSx}
                >
                    <FontAwesomeIcon icon={faBackwardStep} />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => (isPlaying ? pause() : play())}
                    disabled={isFinished && snap.index >= total}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    sx={iconBtnSx}
                >
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => void next()}
                    disabled={snap.index >= total}
                    aria-label="Next event"
                    sx={iconBtnSx}
                >
                    <FontAwesomeIcon icon={faForwardStep} />
                </IconButton>

                <Box sx={scrubberWrapSx}>
                    <Slider
                        size="small"
                        min={0}
                        max={total}
                        value={snap.index}
                        onChange={(_, v) => seek(Array.isArray(v) ? v[0] : v)}
                        aria-label="Scrub events"
                    />
                </Box>

                <Typography variant="caption" sx={counterSx}>
                    {snap.index} / {total}
                </Typography>

                <Typography variant="caption" sx={timeSx}>
                    {formatMs(getCurrentPlaybackMs())} / {formatMs(log.durationMs)}
                </Typography>

                <Select
                    size="small"
                    value={snap.options.speed}
                    onChange={e => setSpeed(Number(e.target.value))}
                    sx={speedSx}
                    MenuProps={{
                        slotProps: { root: { "data-rec-player": "true" } as never },
                        sx: { zIndex: 2147483647 }
                    }}
                >
                    <MenuItem value={0.5}>0.5×</MenuItem>
                    <MenuItem value={1}>1×</MenuItem>
                    <MenuItem value={2}>2×</MenuItem>
                    <MenuItem value={4}>4×</MenuItem>
                    <MenuItem value={8}>8×</MenuItem>
                    <MenuItem value={16}>16×</MenuItem>
                </Select>

                <IconButton size="small" onClick={unload} aria-label="Close playback" sx={iconBtnSx}>
                    <FontAwesomeIcon icon={faXmark} />
                </IconButton>
            </Box>
            <Box sx={descRowSx}>
                <Typography variant="caption" sx={descSx}>
                    {routeChanged && current?.url ? `→ ${current.url}  ·  ` : ""}
                    {describeEvent(current)}
                </Typography>
                {snap.lastOutcome && snap.lastOutcome.outcome === "no-target" && (
                    <Typography variant="caption" sx={warnSx}>
                        previous: no element matched
                    </Typography>
                )}
            </Box>
        </Paper>
    );
}

function formatMs(ms: number): string {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const mm = Math.floor(totalSec / 60);
    const ss = totalSec % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function describeEvent(ev: RecordedEvent | undefined): string {
    if (!ev) {
        return "—";
    }
    const t = ev.target;
    if (ev.type === "custom") {
        const ce = ev.detail?.event;
        if (typeof ce === "string") {
            return `marker: ${ce}`;
        }
        return `custom: ${t.component ?? ""}`;
    }
    const verb = ev.type === "click" ? "click" : ev.type === "input" ? "input" : ev.type === "change" ? "change" : "key";
    const what = t.component ? t.component : (t.tag ?? "element");
    const text = t.text ? ` — "${t.text}"` : "";
    const extra = ev.type === "keydown" ? ` [${String(ev.detail?.key ?? "")}]` : "";
    return `${verb} ${what}${text}${extra}`;
}

// ─── Cursor ─────────────────────────────────────────────────────────────────
function CursorIndicator({ x, y }: { x: number; y: number }) {
    return <Box data-rec-player="true" sx={cursorSx} style={{ left: x, top: y }} />;
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const barSx: SxProps<Theme> = {
    position: "fixed",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(800px, calc(100vw - 32px))",
    zIndex: 2147483646,
    px: 2,
    py: 1,
    bgcolor: "background.paper",
    borderTop: "3px solid",
    borderColor: "error.main"
};

const rowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1
};

const iconBtnSx: SxProps<Theme> = {
    color: "text.primary"
};

const scrubberWrapSx: SxProps<Theme> = {
    flex: 1,
    px: 1,
    minWidth: 160
};

const counterSx: SxProps<Theme> = {
    color: "text.secondary",
    minWidth: 56,
    textAlign: "center",
    fontVariantNumeric: "tabular-nums"
};

const timeSx: SxProps<Theme> = {
    color: "text.secondary",
    minWidth: 92,
    textAlign: "center",
    fontVariantNumeric: "tabular-nums"
};

const speedSx: SxProps<Theme> = {
    minWidth: 76
};

const descRowSx: SxProps<Theme> = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 2,
    pt: 0.5,
    overflow: "hidden"
};

const descSx: SxProps<Theme> = {
    color: "text.secondary",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1
};

const warnSx: SxProps<Theme> = {
    color: "warning.main",
    whiteSpace: "nowrap"
};

const cursorSx: SxProps<Theme> = {
    position: "fixed",
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "3px solid",
    borderColor: "error.main",
    bgcolor: "transparent",
    pointerEvents: "none",
    zIndex: 2147483645,
    transform: "translate(-50%, -50%)",
    transition: "left 240ms ease, top 240ms ease",
    boxShadow: theme => `0 0 0 4px ${theme.palette.error.main}33, 0 4px 12px ${theme.palette.common.black}66`,
    animation: "rec-pulse 0.9s ease-in-out infinite",
    "@keyframes rec-pulse": {
        "0%, 100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
        "50%": { opacity: 0.55, transform: "translate(-50%, -50%) scale(1.15)" }
    }
};
