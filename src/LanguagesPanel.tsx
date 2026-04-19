import { useState } from "react";
import {
    Box, Typography, IconButton, SvgIcon, Button,
    Select, MenuItem, FormControl
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark, faCircleInfo, faCircleQuestion, faCoins, faCheck,
    faTriangleExclamation
} from "@fortawesome/pro-regular-svg-icons";
import { faPlay } from "@fortawesome/pro-solid-svg-icons";
import {
    AttentionBox,
    TruffleLink
} from "@sundaysky/smartvideo-hub-truffle-component-library";

// ─── Constants ────────────────────────────────────────────────────────────────
const PANEL_WIDTH = 260;
const MAX_LANGUAGES = 10;

const LANGUAGE_OPTIONS: { name: string; flag: string }[] = [
    { name: "Arabic", flag: "🇸🇦" },
    { name: "Chinese (Simplified)", flag: "🇨🇳" },
    { name: "Chinese (Traditional)", flag: "🇹🇼" },
    { name: "Czech", flag: "🇨🇿" },
    { name: "Danish", flag: "🇩🇰" },
    { name: "Dutch", flag: "🇳🇱" },
    { name: "Finnish", flag: "🇫🇮" },
    { name: "French", flag: "🇫🇷" },
    { name: "German", flag: "🇩🇪" },
    { name: "Greek", flag: "🇬🇷" },
    { name: "Hebrew", flag: "🇮🇱" },
    { name: "Hindi", flag: "🇮🇳" },
    { name: "Hungarian", flag: "🇭🇺" },
    { name: "Indonesian", flag: "🇮🇩" },
    { name: "Italian", flag: "🇮🇹" },
    { name: "Japanese", flag: "🇯🇵" },
    { name: "Korean", flag: "🇰🇷" },
    { name: "Norwegian", flag: "🇳🇴" },
    { name: "Polish", flag: "🇵🇱" },
    { name: "Portuguese (Brazil)", flag: "🇧🇷" },
    { name: "Portuguese (Portugal)", flag: "🇵🇹" },
    { name: "Romanian", flag: "🇷🇴" },
    { name: "Russian", flag: "🇷🇺" },
    { name: "Spanish", flag: "🇪🇸" },
    { name: "Swedish", flag: "🇸🇪" },
    { name: "Thai", flag: "🇹🇭" },
    { name: "Turkish", flag: "🇹🇷" },
    { name: "Ukrainian", flag: "🇺🇦" },
    { name: "Vietnamese", flag: "🇻🇳" }
];

const FLAG_BY_NAME = Object.fromEntries(LANGUAGE_OPTIONS.map(l => [l.name, l.flag]));

// ─── Component ────────────────────────────────────────────────────────────────
export default function LanguagesPanel({
    open,
    onClose
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [showSelector, setShowSelector] = useState(false);
    const [selectedLangs, setSelectedLangs] = useState<string[]>(
        Array(MAX_LANGUAGES).fill("")
    );
    // Snapshot of languages that have been "enabled" via the button
    const [enabledLangs, setEnabledLangs] = useState<string[]>(
        Array(MAX_LANGUAGES).fill("")
    );

    const selectedCount = selectedLangs.filter((l) => l !== "").length;
    const hasSelection = selectedCount > 0;

    // User is removing a language that was previously enabled
    const isRemovingAny = enabledLangs.some((lang, i) => lang !== "" && selectedLangs[i] === "");

    function handleLangChange(index: number, value: string) {
        const next = [...selectedLangs];
        next[index] = value;
        setSelectedLangs(next);
    }

    function handleEnableTranslation() {
        setEnabledLangs([...selectedLangs]);
        setShowSelector(false);
    }

    function handleCancel() {
        setShowSelector(false);
        setSelectedLangs([...enabledLangs]);
    }

    return (
        <Box
            sx={{
                width: open ? PANEL_WIDTH : 0,
                flexShrink: 0,
                overflow: "hidden",
                transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
                display: "flex",
                height: "100%"
            }}
        >
            {/* Fixed-width inner container */}
            <Box sx={panelInnerSx}>

                {/* ── Header ──────────────────────────────────────────────── */}
                <Box sx={headerSx}>
                    <Typography variant="h4" sx={{ flex: 1 }}>
                        Languages
                    </Typography>
                    {/* Credits badge */}
                    <Box sx={creditBadgeSx}>
                        <SvgIcon sx={iconSmSx}>
                            <FontAwesomeIcon icon={faCoins} />
                        </SvgIcon>
                        <Typography variant="caption" sx={{ lineHeight: 1 }}>
                            340
                        </Typography>
                    </Box>
                    <IconButton size="small" sx={iconBtnSx}>
                        <SvgIcon sx={iconSmSx}>
                            <FontAwesomeIcon icon={faCircleQuestion} />
                        </SvgIcon>
                    </IconButton>
                    <IconButton size="small" onClick={onClose} sx={iconBtnSx}>
                        <SvgIcon sx={iconSmSx}>
                            <FontAwesomeIcon icon={faXmark} />
                        </SvgIcon>
                    </IconButton>
                </Box>

                {/* ── Narration source language ────────────────────────────── */}
                <Box sx={sourceLanguageSectionSx}>
                    <Box sx={sourceLabelRowSx}>
                        <Typography variant="h5">
                            Narration source language
                        </Typography>
                        <IconButton size="small" sx={{ p: "2px" }}>
                            <SvgIcon sx={iconSmSx}>
                                <FontAwesomeIcon icon={faCircleInfo} />
                            </SvgIcon>
                        </IconButton>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
                        {showSelector
                            ? "Editable until additional languages are added"
                            : "Locked for switching once language setup starts"}
                    </Typography>

                    <Box sx={sourceSelectRowSx}>
                        <FormControl size="small" sx={{ flex: 1 }}>
                            <Select value="en" disabled={showSelector}>
                                <MenuItem value="en">
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography sx={{ fontSize: 16, lineHeight: 1 }}>🇺🇸</Typography>
                                        <Typography variant="body1">English</Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <IconButton size="small" color="primary">
                            <SvgIcon sx={iconSmSx}>
                                <FontAwesomeIcon icon={faPlay} />
                            </SvgIcon>
                        </IconButton>
                        {showSelector && (
                            <IconButton size="small" color="primary">
                                <SvgIcon sx={iconSmSx}>
                                    <FontAwesomeIcon icon={faCheck} />
                                </SvgIcon>
                            </IconButton>
                        )}
                    </Box>
                </Box>

                {!showSelector ? (
                    // ── Promo card (scrollable) ──────────────────────────────
                    <Box sx={bodyScrollSx}>
                        <Box sx={promoCardSx}>
                            {/* Thumbnail */}
                            <Box sx={promoThumbSx}>
                                <Box sx={promoFlagsRowSx}>
                                    {["🇮🇹", "🇩🇪", "🇪🇸"].map((flag) => (
                                        <Box key={flag} sx={promoFlagPillSx}>
                                            <Typography sx={{ fontSize: 14, lineHeight: 1 }}>
                                                {flag}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Typography variant="h5" sx={{ color: "background.paper" }}>
                                    Hello &#123;first name&#125;
                                </Typography>
                            </Box>

                            <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                                Make this video multilingual
                            </Typography>

                            <Box component="ul" sx={{ pl: 2.5, m: 0, mb: 2.5 }}>
                                {[
                                    "Add languages to generate automatic translations.",
                                    "Review, edit, and preview narration without credits. Credits apply at approval or publishing."
                                ].map((text, i) => (
                                    <Box component="li" key={i} sx={{ mb: 0.75 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            {text}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                size="medium"
                                onClick={() => setShowSelector(true)}
                            >
                                Add up to {MAX_LANGUAGES} languages
                            </Button>

                            <Box sx={{ textAlign: "center", mt: 1.5 }}>
                                <TruffleLink href="#" underline="hover" color="primary">
                                    Learn more
                                </TruffleLink>
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    // ── Language selector ────────────────────────────────────
                    <>
                        {/* Scrollable list of dropdowns */}
                        <Box sx={selectorScrollSx}>
                            <Typography variant="h5" sx={{ mb: 2 }}>
                                Select up to {MAX_LANGUAGES} languages
                            </Typography>

                            {Array.from({ length: MAX_LANGUAGES }, (_, i) => (
                                <FormControl key={i} fullWidth size="small" sx={{ mb: 1.5 }}>
                                    <Select
                                        displayEmpty
                                        value={selectedLangs[i]}
                                        onChange={(e) => handleLangChange(i, e.target.value)}
                                        renderValue={(val) => {
                                            if (!val) {
                                                return (
                                                    <Typography variant="body1" color="text.disabled">
                                                        Choose language {i + 1}
                                                    </Typography>
                                                );
                                            }
                                            return (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography sx={{ fontSize: 16, lineHeight: 1 }}>
                                                        {FLAG_BY_NAME[val]}
                                                    </Typography>
                                                    <Typography variant="body1">{val}</Typography>
                                                </Box>
                                            );
                                        }}
                                    >
                                        <MenuItem value="">
                                            <Typography variant="body1" color="text.secondary">
                                                Choose language {i + 1}
                                            </Typography>
                                        </MenuItem>
                                        {LANGUAGE_OPTIONS.map(({ name, flag }) => (
                                            <MenuItem key={name} value={name}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography sx={{ fontSize: 16, lineHeight: 1 }}>{flag}</Typography>
                                                    <Typography variant="body1">{name}</Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ))}
                        </Box>

                        {/* Sticky footer — always visible */}
                        <Box sx={stickyFooterSx}>
                            {/* Credits notice — always shown when in selector, above the button */}
                            <AttentionBox
                                color="info"
                                icon={
                                    <SvgIcon sx={iconSmSx}>
                                        <FontAwesomeIcon icon={faCircleInfo} />
                                    </SvgIcon>
                                }
                                sx={{ mb: 1.5 }}
                            >
                                <Typography variant="body1">
                                    Credits will apply on video approval
                                </Typography>
                            </AttentionBox>

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="medium"
                                disabled={!hasSelection}
                                onClick={handleEnableTranslation}
                                sx={{ mb: 1.5 }}
                            >
                                Enable translation{selectedCount > 0 ? ` (${selectedCount})` : ""}
                            </Button>

                            <Box sx={{ textAlign: "center", mb: isRemovingAny ? 2 : 0 }}>
                                <TruffleLink
                                    href="#"
                                    underline="hover"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleCancel();
                                    }}
                                >
                                    Cancel
                                </TruffleLink>
                            </Box>

                            {isRemovingAny && (
                                <AttentionBox
                                    color="warning"
                                    icon={
                                        <SvgIcon sx={iconSmSx}>
                                            <FontAwesomeIcon icon={faTriangleExclamation} />
                                        </SvgIcon>
                                    }
                                >
                                    <Typography variant="body1">
                                        Removing a language deletes its generated content, and the AI
                                        credits used to create it won&apos;t be refunded.
                                    </Typography>
                                </AttentionBox>
                            )}
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const panelInnerSx: SxProps<Theme> = {
    width: PANEL_WIDTH,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden"
};

const headerSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    px: 1.5,
    py: 1.25,
    borderBottom: "1px solid",
    borderColor: "divider",
    flexShrink: 0
};

const creditBadgeSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    px: "8px",
    py: "3px",
    borderRadius: "12px",
    bgcolor: "action.hover",
    border: "1px solid",
    borderColor: "divider"
};

const iconBtnSx: SxProps<Theme> = {
    color: "text.secondary",
    p: "4px"
};

const iconSmSx: SxProps<Theme> = {
    fontSize: "18px !important"
};

const sourceLanguageSectionSx: SxProps<Theme> = {
    px: 2,
    pt: 2,
    pb: 1.5,
    borderBottom: "1px solid",
    borderColor: "divider",
    flexShrink: 0
};

const sourceLabelRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    mb: "4px"
};

const sourceSelectRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 0.5
};

const bodyScrollSx: SxProps<Theme> = {
    flex: 1,
    overflowY: "auto",
    px: 2,
    py: 2
};

const selectorScrollSx: SxProps<Theme> = {
    flex: 1,
    overflowY: "auto",
    px: 2,
    pt: 2,
    pb: 1
};

const stickyFooterSx: SxProps<Theme> = {
    flexShrink: 0,
    px: 2,
    pt: 1.5,
    pb: 2,
    borderTop: "1px solid",
    borderColor: "divider"
};

const promoCardSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column"
};

const promoThumbSx: SxProps<Theme> = {
    bgcolor: "secondary.main",
    borderRadius: "8px",
    p: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 1,
    minHeight: 100
};

const promoFlagsRowSx: SxProps<Theme> = {
    display: "flex",
    gap: "6px"
};

const promoFlagPillSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: "50%",
    bgcolor: "background.paper"
};
