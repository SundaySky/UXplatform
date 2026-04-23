import { useState, useEffect, useMemo } from "react";
import {
    Box, Dialog, DialogContent, DialogActions,
    Typography, SvgIcon, TextField, InputAdornment,
    Checkbox, Button, Tooltip
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/pro-regular-svg-icons";
import { TruffleDialogTitle, Label } from "@sundaysky/smartvideo-hub-truffle-component-library";
import { LANGUAGE_OPTIONS, MAX_LANGUAGES } from "./LanguagesPanel";

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
    /** Languages already confirmed/applied (shown pre-checked, not counted as "new") */
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

    // Reset pending + search every time the dialog opens
    useEffect(() => {
        if (open) {
            setPending([...currentLangs]);
            setSearch("");
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Re-order so items fill column by column (top-down in col 1, then col 2, then col 3)
    const displayedLangs = useMemo(() => {
        const rows = Math.ceil(filtered.length / GRID_COLS);
        const out: typeof filtered = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const idx = col * rows + row;
                if (idx < filtered.length) {
                    out.push(filtered[idx]);
                }
            }
        }
        return out;
    }, [filtered]);

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
                <Box sx={dialogTitleRowSx}>
                    Additional languages
                    <Label label={`${selectedCount} / ${maxLanguages} selected`} color="default" size="small" />
                </Box>
            </TruffleDialogTitle>

            <DialogContent sx={dialogContentSx}>
                {/* ── Search ── */}
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
                            )
                        }
                    }}
                    sx={{ mb: 2 }}
                />

                {/* ── Language grid ── */}
                <Box sx={gridSx}>
                    {displayedLangs.map(({ name, flag }) => {
                        const checked = pending.includes(name);
                        const alreadyConfirmed = currentLangs.includes(name);
                        const atMaxDisabled = !checked && atMax;
                        const disabled = alreadyConfirmed || atMaxDisabled;
                        return (
                            <Tooltip
                                key={name}
                                title={atMaxDisabled ? `You've reached the limit of ${maxLanguages} languages. Deselect one to swap it.` : ""}
                                placement="top"
                                arrow
                            >
                                <Box
                                    sx={disabled ? disabledRowSx : rowSx}
                                    onClick={() => !disabled && handleToggle(name)}
                                >
                                    <Tooltip
                                        title={alreadyConfirmed ? "To remove this language, use the X in the dropdown selector" : ""}
                                        placement="top"
                                        arrow
                                    >
                                        <Box component="span" sx={{ flexShrink: 0, display: "inline-flex" }}>
                                            <Checkbox
                                                checked={checked}
                                                size="medium"
                                                color="primary"
                                                disabled={disabled}
                                                sx={{ p: "2px" }}
                                                onChange={() => handleToggle(name)}
                                                onClick={e => e.stopPropagation()}
                                            />
                                        </Box>
                                    </Tooltip>
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
                    {selectedCount > 0
                        ? `Select ${selectedCount} additional language${selectedCount !== 1 ? "s" : ""}`
                        : "Select additional languages"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const dialogTitleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1.5
};

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

const gridSx: SxProps<Theme> = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    columnGap: 1,
    rowGap: "4px"
};

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
    gap: 1
};
