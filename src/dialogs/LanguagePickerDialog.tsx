import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import {
    Box, Dialog, DialogContent, DialogActions,
    Typography, SvgIcon, TextField, InputAdornment, IconButton,
    Checkbox, Button, Tooltip
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/pro-regular-svg-icons";
import { TruffleDialogTitle, Label } from "@sundaysky/smartvideo-hub-truffle-component-library";
import { LANGUAGE_OPTIONS, MAX_LANGUAGES } from "../panels/LanguagesPanel";

// ─── Extended language metadata ───────────────────────────────────────────────

const LANGUAGE_DETAILS: Record<string, { nativeName: string; country: string }> = {
    "Bulgarian":               { nativeName: "Български", country: "Bulgaria" },
    "Chinese (Simplified)":    { nativeName: "简体中文", country: "Mainland China" },
    "Chinese (Traditional)":   { nativeName: "繁體中文", country: "Taiwan" },
    "Croatian":                { nativeName: "Hrvatski", country: "Croatia" },
    "Czech":                   { nativeName: "Čeština", country: "Czechia" },
    "Danish":                  { nativeName: "Dansk", country: "Denmark" },
    "Dutch":                   { nativeName: "Nederlands", country: "Netherlands" },
    "Filipino (Tagalog)":      { nativeName: "Filipino", country: "Philippines" },
    "Finnish":                 { nativeName: "Suomi", country: "Finland" },
    "French":                  { nativeName: "Français", country: "France" },
    "French (Canada)":         { nativeName: "Français", country: "Canada" },
    "German":                  { nativeName: "Deutsch", country: "Germany" },
    "Greek":                   { nativeName: "Ελληνικά", country: "Greece" },
    "Hindi":                   { nativeName: "हिंदी", country: "India" },
    "Indonesian":              { nativeName: "Indonesia", country: "Indonesia" },
    "Italian":                 { nativeName: "Italiano", country: "Italy" },
    "Japanese":                { nativeName: "日本語", country: "Japan" },
    "Korean":                  { nativeName: "한국어", country: "South Korea" },
    "Malay":                   { nativeName: "Bahasa Melayu", country: "Malaysia" },
    "Polish":                  { nativeName: "Polski", country: "Poland" },
    "Portuguese (Brazil)":     { nativeName: "Português", country: "Brazil" },
    "Portuguese (Portugal)":   { nativeName: "Português", country: "Portugal" },
    "Romanian":                { nativeName: "Română", country: "Romania" },
    "Russian":                 { nativeName: "Русский", country: "Russia" },
    "Slovak":                  { nativeName: "Slovenčina", country: "Slovakia" },
    "Spanish":                 { nativeName: "Español", country: "Spain" },
    "Spanish (Mexico)":        { nativeName: "Español", country: "Mexico" },
    "Swedish":                 { nativeName: "Svenska", country: "Sweden" },
    "Tamil":                   { nativeName: "தமிழ்", country: "Sri Lanka" },
    "Turkish":                 { nativeName: "Türkçe", country: "Turkey" },
    "Ukrainian":               { nativeName: "Українська", country: "Ukraine" }
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LanguagePickerDialogProps {
    open: boolean;
    onClose: () => void;
    /** Languages already selected (shown pre-checked) */
    currentLangs: string[];
    /** Called with the full new selection when "Select N" is clicked */
    onConfirm: (langs: string[]) => void;
    maxLanguages?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LanguagePickerDialog({
    open,
    onClose,
    currentLangs,
    onConfirm,
    maxLanguages = MAX_LANGUAGES
}: LanguagePickerDialogProps) {
    const [search, setSearch] = useState("");
    const [pending, setPending] = useState<string[]>([]);
    const [showSearch, setShowSearch] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Reset pending + search every time the dialog opens
    useEffect(() => {
        if (open) {
            setPending([...currentLangs]);
            setSearch("");
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Show the search field only if the dialog actually has a scroll — i.e.
    // when the language grid alone would overflow the content area. Measured
    // once on open and on container resize; filter-driven grid shrinkage
    // doesn't re-trigger, so the user keeps the search while typing.
    useLayoutEffect(() => {
        if (!open) {
            setShowSearch(false);
            return;
        }
        const measure = () => {
            if (!gridRef.current || !contentRef.current) {
                return;
            }
            const gridHeight = gridRef.current.scrollHeight;
            const available = contentRef.current.clientHeight;
            setShowSearch(gridHeight > available);
        };
        const id = requestAnimationFrame(measure);
        const ro = new ResizeObserver(measure);
        if (contentRef.current) {
            ro.observe(contentRef.current);
        }
        return () => {
            cancelAnimationFrame(id);
            ro.disconnect();
        };
    }, [open]);

    const GRID_COLS = 3;

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return LANGUAGE_OPTIONS.filter(({ name }) => {
            const det = LANGUAGE_DETAILS[name];
            return (
                name.toLowerCase().includes(q) ||
                det?.nativeName.toLowerCase().includes(q) ||
                det?.country.toLowerCase().includes(q)
            );
        });
    }, [search]);

    // Fill column-by-column: with 31 items across 3 cols, this gives 11 / 11 / 9
    const rowsPerCol = Math.max(1, Math.ceil(filtered.length / GRID_COLS));

    const selectedCount = pending.length;
    const atMax = selectedCount >= maxLanguages;

    function handleToggle(name: string) {
        setPending(prev =>
            prev.includes(name)
                ? prev.filter(l => l !== name)
                : atMax ? prev : [...prev, name]
        );
    }

    function handleConfirm() {
        onConfirm(pending);
        onClose();
    }

    function handleClose() {
        onClose();
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && selectedCount > 0) {
            e.preventDefault();
            handleConfirm();
        }
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            onKeyDown={handleKeyDown}
            PaperProps={{ sx: dialogPaperSx }}
            fullWidth
        >
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: handleClose }}>
                Additional languages
            </TruffleDialogTitle>

            <DialogContent ref={contentRef} sx={dialogContentSx}>
                {/* ── Search (only when grid would overflow) ── */}
                {showSearch && (
                    <TextField
                        fullWidth
                        size="medium"
                        placeholder="Search languages..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SvgIcon sx={searchIconSx}>
                                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                                        </SvgIcon>
                                    </InputAdornment>
                                ),
                                endAdornment: search.length > 0 ? (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            aria-label="Clear search"
                                            onClick={() => setSearch("")}
                                        >
                                            <SvgIcon sx={searchIconSx}>
                                                <FontAwesomeIcon icon={faXmark} />
                                            </SvgIcon>
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }
                        }}
                        sx={{ mb: 2 }}
                    />
                )}

                {/* ── Language grid ── */}
                <Box ref={gridRef} sx={gridSx(rowsPerCol)}>
                    {filtered.map(({ name, flag }) => {
                        const checked = pending.includes(name);
                        const atMaxDisabled = !checked && atMax;
                        // Row click only ADDS — to remove a language the user must click
                        // the checkbox itself. This prevents accidental unchecks while browsing.
                        const handleRowClick = () => {
                            if (!atMaxDisabled && !checked) {
                                handleToggle(name);
                            }
                        };
                        return (
                            <Tooltip
                                key={name}
                                title={atMaxDisabled ? `You've reached the limit of ${maxLanguages} languages. Deselect one to add another.` : ""}
                                placement="top"
                                arrow
                                enterDelay={0}
                                leaveDelay={200}
                            >
                                <Box
                                    sx={atMaxDisabled ? disabledRowSx : rowSx}
                                    onClick={handleRowClick}
                                >
                                    <Box component="span" sx={{ flexShrink: 0, display: "inline-flex" }}>
                                        <Checkbox
                                            checked={checked}
                                            size="medium"
                                            color="primary"
                                            disabled={atMaxDisabled}
                                            sx={{ p: "2px" }}
                                            onChange={() => handleToggle(name)}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </Box>
                                    <Box sx={flagCircleSx}>
                                        <Typography sx={{ fontSize: 16, lineHeight: 1 }}>
                                            {flag}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" noWrap sx={{ minWidth: 0, flex: 1 }}>
                                        {name}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        );
                    })}
                </Box>
            </DialogContent>

            <DialogActions sx={dialogActionsSx}>
                <Button variant="text" color="inherit" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={selectedCount === 0}
                    onClick={handleConfirm}
                >
                    Select languages
                    <Label label={`${selectedCount}/${maxLanguages}`} color="default" size="small" sx={{ ml: 1 }} />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const dialogPaperSx: SxProps<Theme> = {
    width: 752,
    maxWidth: "calc(100vw - 64px)"
};

const dialogContentSx: SxProps<Theme> = {
    pt: 1.5,
    pb: 0,
    px: 3,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflowY: "auto"
};

const searchIconSx: SxProps<Theme> = {
    fontSize: "18px !important",
    width: "18px !important",
    height: "18px !important",
    color: "action.active"
};

const gridSx = (rowsPerCol: number): SxProps<Theme> => ({
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gridTemplateRows: `repeat(${rowsPerCol}, auto)`,
    gridAutoFlow: "column",
    columnGap: 1,
    rowGap: "4px"
});

const rowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    px: "8px",
    py: "4px",
    borderRadius: 1,
    cursor: "pointer",
    "&:hover": {
        bgcolor: "action.hover"
    }
};

const disabledRowSx: SxProps<Theme> = {
    ...rowSx as object,
    opacity: 0.4,
    cursor: "default",
    "&:hover": {}
};

const flagCircleSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: "50%",
    bgcolor: "action.hover",
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden",
    flexShrink: 0
};

const dialogActionsSx: SxProps<Theme> = {
    px: 3,
    py: 2,
    borderTop: "1px solid",
    borderColor: "divider",
    gap: 1,
    justifyContent: "flex-end"
};
