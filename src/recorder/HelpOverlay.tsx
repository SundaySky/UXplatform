import { Fragment, useEffect, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

type Shortcut = {
    keys: string[];
    description: string;
};

const SHORTCUTS: Shortcut[] = [
    { keys: ["Ctrl", "Alt", "Shift", "R"], description: "Start or stop recording user interactions" },
    { keys: ["Ctrl", "Alt", "Shift", "P"], description: "Open the playback dialog to load and replay a recording" },
    { keys: ["?"], description: "Show this help" }
];

// Mac convention: Control = ⌃, Option (Alt) = ⌥, Shift = ⇧, Command (Meta) = ⌘.
// We only translate the labels — the actual shortcuts still bind to e.ctrlKey,
// e.altKey, e.shiftKey, so Mac users hold the same physical keys they always do.
const MAC_KEY_LABELS: Record<string, string> = {
    Ctrl: "⌃", // ⌃
    Control: "⌃",
    Alt: "⌥", // ⌥
    Option: "⌥",
    Shift: "⇧", // ⇧
    Cmd: "⌘", // ⌘
    Command: "⌘",
    Meta: "⌘",
    Enter: "⏎", // ⏎
    Return: "⏎",
    Escape: "⎋", // ⎋
    Esc: "⎋",
    Backspace: "⌫", // ⌫
    Delete: "⌦", // ⌦
    Tab: "⇥", // ⇥
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→"
};

export function isMacPlatform(): boolean {
    if (typeof navigator === "undefined") {
        return false;
    }
    const ua = navigator.userAgent || "";
    // iOS devices report as Mac in newer iPadOS; treating them as Mac for label
    // purposes is fine — they share the same key glyph conventions.
    return /Mac|iPhone|iPad|iPod/.test(ua);
}

export function displayKey(key: string, mac: boolean): string {
    if (!mac) {
        return key;
    }
    return MAC_KEY_LABELS[key] ?? key;
}

function isHelpShortcut(e: KeyboardEvent): boolean {
    if (e.key !== "?") {
        return false;
    }
    // Allow Shift (required to type "?" on most layouts) but reject modifier combos
    // we'd actually expect to mean something else.
    if (e.ctrlKey || e.metaKey || e.altKey) {
        return false;
    }
    return true;
}

function isEditableTarget(): boolean {
    const el = document.activeElement;
    if (!el) {
        return false;
    }
    const tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") {
        return true;
    }
    if (el instanceof HTMLElement) {
        // Browsers expose this getter; jsdom doesn't always compute it from the
        // attribute, so check both. `contenteditable="false"` is intentionally
        // excluded — that element is opted out.
        if (el.isContentEditable) {
            return true;
        }
        const ce = el.getAttribute("contenteditable");
        if (ce === "" || ce === "true" || ce === "plaintext-only") {
            return true;
        }
    }
    return false;
}

export default function HelpOverlay() {
    const [open, setOpen] = useState(false);
    // Computed once per mount — platform doesn't change at runtime.
    const [mac] = useState(isMacPlatform);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (!isHelpShortcut(e)) {
                return;
            }
            // While the dialog is closed, ignore the shortcut if the user is
            // typing in a field — they probably meant to type a literal "?".
            // While the dialog is open, allow toggling closed regardless of focus.
            if (!open && isEditableTarget()) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            setOpen(o => !o);
        }
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            slotProps={{ paper: { "data-rec-player": "true" } as never }}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    {SHORTCUTS.map((s, i) => (
                        <Box key={i} sx={rowSx}>
                            <KeyCombo keys={s.keys} mac={mac} />
                            <Typography variant="body1" sx={descSx}>
                                {s.description}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" size="large" onClick={() => setOpen(false)}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function KeyCombo({ keys, mac }: { keys: string[]; mac: boolean }) {
    return (
        <Stack direction="row" spacing={0.5} alignItems="center">
            {keys.map((k, i) => (
                <Fragment key={i}>
                    <Chip label={displayKey(k, mac)} size="small" />
                    {i < keys.length - 1 && (
                        <Typography variant="body1" color="text.secondary">+</Typography>
                    )}
                </Fragment>
            ))}
        </Stack>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const rowSx: SxProps<Theme> = {
    display: "grid",
    gridTemplateColumns: "minmax(180px, auto) 1fr",
    alignItems: "center",
    gap: 2
};

const descSx: SxProps<Theme> = {
    color: "text.primary"
};
