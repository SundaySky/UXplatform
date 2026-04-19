import { useState } from "react";
import {
    Box, Typography, IconButton, SvgIcon, Button,
    Select, MenuItem, FormControl, Divider, Checkbox
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark, faCircleInfo, faCircleQuestion, faCoins, faCheck,
    faTriangleExclamation, faPencil
} from "@fortawesome/pro-regular-svg-icons";
import { faPlay, faCircleCheck } from "@fortawesome/pro-solid-svg-icons";
import {
    AttentionBox,
    TruffleLink
} from "@sundaysky/smartvideo-hub-truffle-component-library";

// ─── Types ────────────────────────────────────────────────────────────────────
type PanelState = "promo" | "selector" | "applying" | "success" | "settled";

// ─── Constants ────────────────────────────────────────────────────────────────
const PANEL_WIDTH = 260;
const MAX_LANGUAGES = 10;
const APPLYING_DELAY_MS = 1500;

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
    const [panelState, setPanelState] = useState<PanelState>("promo");
    // Plain list of selected language names (not slot-indexed)
    const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
    // Snapshot confirmed via "Enable translation"
    const [enabledLangs, setEnabledLangs] = useState<string[]>([]);

    const selectedCount = selectedLangs.length;
    const enabledCount = enabledLangs.length;
    const hasSelection = selectedCount > 0;
    const isRemovingAny = enabledLangs.some(lang => !selectedLangs.includes(lang));
    const activeLangsList = enabledLangs;

    function handleMultiSelectChange(value: string[]) {
        // Enforce MAX_LANGUAGES cap; ignore if somehow exceeded
        if (value.length <= MAX_LANGUAGES) {
            setSelectedLangs(value);
        }
    }

    function handleRemoveLang(lang: string) {
        setSelectedLangs(prev => prev.filter(l => l !== lang));
    }

    function handleEnableTranslation() {
        setEnabledLangs([...selectedLangs]);
        setPanelState("applying");
        setTimeout(() => {
            setPanelState("success");
        }, APPLYING_DELAY_MS);
    }

    function handleCancel() {
        setSelectedLangs([...enabledLangs]);
        setPanelState(enabledLangs.some(l => l !== "") ? "settled" : "promo");
    }

    function handleGotIt() {
        setPanelState("settled");
    }

    function handleEdit() {
        setSelectedLangs([...enabledLangs]);
        setPanelState("selector");
    }

    // In applying/success states the header is minimal (no credits badge) and
    // the source-language section is hidden so the content fills the full panel.
    const showCredits = panelState !== "applying" && panelState !== "success";
    const showSourceLang = panelState !== "applying" && panelState !== "success";

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
                    {showCredits && (
                        <Box sx={creditBadgeSx}>
                            <SvgIcon sx={iconSmSx}>
                                <FontAwesomeIcon icon={faCoins} />
                            </SvgIcon>
                            <Typography variant="caption" sx={{ lineHeight: 1 }}>
                                340
                            </Typography>
                        </Box>
                    )}
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
                {showSourceLang && (
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
                            {panelState === "selector"
                                ? "Editable until additional languages are added"
                                : "Locked for switching once language setup starts"}
                        </Typography>

                        <Box sx={sourceSelectRowSx}>
                            {/* Settled state: plain flag + name row, no dropdown */}
                            {panelState === "settled" ? (
                                <>
                                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
                                        <Typography sx={{ fontSize: 20, lineHeight: 1 }}>🇺🇸</Typography>
                                        <Typography variant="body1">English</Typography>
                                    </Box>
                                    <IconButton size="small" color="primary">
                                        <SvgIcon sx={iconSmSx}>
                                            <FontAwesomeIcon icon={faPlay} />
                                        </SvgIcon>
                                    </IconButton>
                                </>
                            ) : (
                                <>
                                    <FormControl size="small" sx={{ flex: 1 }}>
                                        <Select value="en" disabled={panelState === "selector"}>
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
                                    {panelState === "selector" && (
                                        <IconButton size="small" color="primary">
                                            <SvgIcon sx={iconSmSx}>
                                                <FontAwesomeIcon icon={faCheck} />
                                            </SvgIcon>
                                        </IconButton>
                                    )}
                                </>
                            )}
                        </Box>
                    </Box>
                )}

                {/* ── Promo card ───────────────────────────────────────────── */}
                {panelState === "promo" && (
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
                                onClick={() => setPanelState("selector")}
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
                )}

                {/* ── Language selector ────────────────────────────────────── */}
                {panelState === "selector" && (
                    <>
                        {/* Scrollable area: multi-select + selected language rows */}
                        <Box sx={selectorScrollSx}>
                            <Typography variant="h5" sx={{ mb: 1.5 }}>
                                Select up to {MAX_LANGUAGES} languages
                            </Typography>

                            {/* Single multi-select dropdown */}
                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                <Select
                                    multiple
                                    displayEmpty
                                    value={selectedLangs}
                                    onChange={(e) => handleMultiSelectChange(e.target.value as string[])}
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                            return (
                                                <Typography variant="body1" color="text.disabled">
                                                    Choose languages…
                                                </Typography>
                                            );
                                        }
                                        return (
                                            <Typography variant="body1">
                                                {selected.length} language{selected.length !== 1 ? "s" : ""} selected
                                            </Typography>
                                        );
                                    }}
                                    MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                                >
                                    {LANGUAGE_OPTIONS.map(({ name, flag }) => {
                                        const checked = selectedLangs.includes(name);
                                        const atMax = selectedCount >= MAX_LANGUAGES && !checked;
                                        return (
                                            <MenuItem key={name} value={name} disabled={atMax}>
                                                <Checkbox checked={checked} size="small" sx={{ p: "4px", mr: 0.5 }} />
                                                <Typography sx={{ fontSize: 16, lineHeight: 1, mr: 1 }}>{flag}</Typography>
                                                <Typography variant="body1">{name}</Typography>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>

                            {/* Selected language rows */}
                            {selectedLangs.map((lang, i) => (
                                <Box key={lang}>
                                    {i > 0 && <Divider />}
                                    <Box sx={selectedLangRowSx}>
                                        <Box sx={flagCircleSmSx}>
                                            <Typography sx={{ fontSize: 16, lineHeight: 1 }}>
                                                {FLAG_BY_NAME[lang]}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ flex: 1 }}>
                                            {lang}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            sx={iconBtnSx}
                                            onClick={() => handleRemoveLang(lang)}
                                        >
                                            <SvgIcon sx={iconSmSx}>
                                                <FontAwesomeIcon icon={faXmark} />
                                            </SvgIcon>
                                        </IconButton>
                                    </Box>
                                </Box>
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
                                Enable translation
                                {selectedCount > 0 && (
                                    <Box component="span" sx={countBadgeSx}>
                                        {selectedCount}
                                    </Box>
                                )}
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

                {/* ── Applying (loading) state ─────────────────────────────── */}
                {panelState === "applying" && (
                    <Box sx={centeredBodySx}>
                        <Box sx={flagCirclesRowSx}>
                            {activeLangsList.slice(0, 3).map(lang => (
                                <Box key={lang} sx={flagCircleLgSx}>
                                    <Typography sx={{ fontSize: 28, lineHeight: 1 }}>
                                        {FLAG_BY_NAME[lang]}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        <Typography variant="h4" sx={{ textAlign: "center", mt: 3, mb: 2.5 }}>
                            Applying {enabledCount} language{enabledCount !== 1 ? "s" : ""}
                        </Typography>

                        <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                            <Box component="li" sx={{ mb: 1 }}>
                                <Typography variant="body1" color="text.secondary">
                                    Narration text can be edited at any time.
                                </Typography>
                            </Box>
                            <Box component="li">
                                <Typography variant="body1" color="text.secondary">
                                    Any changes to the source language will automatically apply to all translated languages.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* ── Success state ────────────────────────────────────────── */}
                {panelState === "success" && (
                    <Box sx={centeredBodySx}>
                        <SvgIcon sx={successIconSx}>
                            <FontAwesomeIcon icon={faCircleCheck} />
                        </SvgIcon>

                        <Typography variant="h4" sx={{ textAlign: "center", mt: 3, mb: 2.5 }}>
                            {enabledCount} language{enabledCount !== 1 ? "s" : ""} applied successfully
                        </Typography>

                        <Box component="ul" sx={{ pl: 2.5, m: 0, mb: 3 }}>
                            <Box component="li" sx={{ mb: 1 }}>
                                <Typography variant="body1" color="text.secondary">
                                    Use the top bar to switch display languages.
                                </Typography>
                            </Box>
                            <Box component="li">
                                <Typography variant="body1" color="text.secondary">
                                    All translations can be edited at any time from the narration placeholders.
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="medium"
                            onClick={handleGotIt}
                        >
                            Got it!
                        </Button>
                    </Box>
                )}

                {/* ── Settled state (language list) ────────────────────────── */}
                {panelState === "settled" && (
                    <Box sx={bodyScrollSx}>
                        {/* "Additional languages" header row with Edit link */}
                        <Box sx={additionalLangsHeaderSx}>
                            <Typography variant="h5" sx={{ flex: 1 }}>
                                Additional languages
                            </Typography>
                            <Button
                                variant="text"
                                size="small"
                                startIcon={
                                    <SvgIcon sx={iconXsSx}>
                                        <FontAwesomeIcon icon={faPencil} />
                                    </SvgIcon>
                                }
                                onClick={handleEdit}
                                sx={editBtnSx}
                            >
                                Edit
                            </Button>
                        </Box>

                        {/* Language rows */}
                        {activeLangsList.map((lang, i) => (
                            <Box key={lang}>
                                {i > 0 && <Divider />}
                                <Box sx={langListItemSx}>
                                    <Box sx={flagCircleMdSx}>
                                        <Typography sx={{ fontSize: 20, lineHeight: 1 }}>
                                            {FLAG_BY_NAME[lang]}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ flex: 1 }}>
                                        {lang}
                                    </Typography>
                                    <IconButton size="small" color="primary">
                                        <SvgIcon sx={iconSmSx}>
                                            <FontAwesomeIcon icon={faPlay} />
                                        </SvgIcon>
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
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

const iconXsSx: SxProps<Theme> = {
    fontSize: "14px !important"
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

const countBadgeSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    ml: 1,
    px: "7px",
    py: "1px",
    borderRadius: "10px",
    bgcolor: "primary.contrastText",
    color: "primary.main",
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: 1.5
};

// ─── Applying / Success shared layout ─────────────────────────────────────────

const centeredBodySx: SxProps<Theme> = {
    flex: 1,
    overflowY: "auto",
    px: 2,
    pt: 4,
    pb: 3,
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
};

const flagCirclesRowSx: SxProps<Theme> = {
    display: "flex",
    gap: "10px",
    justifyContent: "center"
};

const flagCircleLgSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 52,
    borderRadius: "50%",
    bgcolor: "action.hover",
    border: "1px solid",
    borderColor: "divider",
    fontSize: "28px"
};

const successIconSx: SxProps<Theme> = {
    fontSize: "52px !important",
    color: "success.main"
};

// ─── Settled (language list) ───────────────────────────────────────────────────

const additionalLangsHeaderSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    mb: 1
};

const editBtnSx: SxProps<Theme> = {
    p: 0,
    minWidth: 0,
    fontWeight: 400,
    "& .MuiButton-startIcon": {
        mr: "4px"
    }
};

const langListItemSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    py: 1.5
};

const flagCircleMdSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: "50%",
    bgcolor: "action.hover",
    border: "1px solid",
    borderColor: "divider",
    flexShrink: 0
};

// ─── Selector — selected language rows ────────────────────────────────────────

const selectedLangRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    py: 1
};

const flagCircleSmSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: "50%",
    bgcolor: "action.hover",
    border: "1px solid",
    borderColor: "divider",
    flexShrink: 0
};
