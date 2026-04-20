import { useState } from "react";
import {
    Box, Typography, IconButton, SvgIcon, Button,
    Select, MenuItem, FormControl, Divider, Checkbox, Tooltip
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark, faCircleInfo, faCircleQuestion, faCoins, faCheck,
    faTriangleExclamation, faPencil, faTrashCan
} from "@fortawesome/pro-regular-svg-icons";
import { faPlay, faCircleCheck, faCircleXmark } from "@fortawesome/pro-solid-svg-icons";
import {
    AttentionBox,
    TruffleLink
} from "@sundaysky/smartvideo-hub-truffle-component-library";

// ─── Types ────────────────────────────────────────────────────────────────────
type PanelState =
    | "promo" | "selector" | "settled"
    | "applying" | "success" | "error"
    | "applying_changes" | "success_changes" | "error_changes"
    | "removing" | "success_remove";

// ─── Constants ────────────────────────────────────────────────────────────────
const PANEL_WIDTH = 260;
export const MAX_LANGUAGES = 15;
const APPLYING_DELAY_MS = 1500;

export const LANGUAGE_OPTIONS: { name: string; flag: string; code: string }[] = [
    { name: "Arabic", flag: "🇸🇦", code: "AR" },
    { name: "Chinese (Simplified)", flag: "🇨🇳", code: "ZH" },
    { name: "Chinese (Traditional)", flag: "🇹🇼", code: "ZH" },
    { name: "Czech", flag: "🇨🇿", code: "CS" },
    { name: "Danish", flag: "🇩🇰", code: "DA" },
    { name: "Dutch", flag: "🇳🇱", code: "NL" },
    { name: "Finnish", flag: "🇫🇮", code: "FI" },
    { name: "French", flag: "🇫🇷", code: "FR" },
    { name: "German", flag: "🇩🇪", code: "DE" },
    { name: "Greek", flag: "🇬🇷", code: "EL" },
    { name: "Hebrew", flag: "🇮🇱", code: "HE" },
    { name: "Hindi", flag: "🇮🇳", code: "HI" },
    { name: "Hungarian", flag: "🇭🇺", code: "HU" },
    { name: "Indonesian", flag: "🇮🇩", code: "ID" },
    { name: "Italian", flag: "🇮🇹", code: "IT" },
    { name: "Japanese", flag: "🇯🇵", code: "JA" },
    { name: "Korean", flag: "🇰🇷", code: "KO" },
    { name: "Norwegian", flag: "🇳🇴", code: "NO" },
    { name: "Polish", flag: "🇵🇱", code: "PL" },
    { name: "Portuguese (Brazil)", flag: "🇧🇷", code: "PT" },
    { name: "Portuguese (Portugal)", flag: "🇵🇹", code: "PT" },
    { name: "Romanian", flag: "🇷🇴", code: "RO" },
    { name: "Russian", flag: "🇷🇺", code: "RU" },
    { name: "Spanish", flag: "🇪🇸", code: "ES" },
    { name: "Swedish", flag: "🇸🇪", code: "SV" },
    { name: "Thai", flag: "🇹🇭", code: "TH" },
    { name: "Turkish", flag: "🇹🇷", code: "TR" },
    { name: "Ukrainian", flag: "🇺🇦", code: "UK" },
    { name: "Vietnamese", flag: "🇻🇳", code: "VI" }
];

export const FLAG_BY_NAME: Record<string, string> = Object.fromEntries(LANGUAGE_OPTIONS.map(l => [l.name, l.flag]));
export const CODE_BY_NAME: Record<string, string> = Object.fromEntries(LANGUAGE_OPTIONS.map(l => [l.name, l.code]));

// ─── Component ────────────────────────────────────────────────────────────────
export default function LanguagesPanel({
    open,
    onClose,
    enabledLangs,
    onEnabledLangsChange
}: {
    open: boolean;
    onClose: () => void;
    enabledLangs: string[];
    onEnabledLangsChange: (langs: string[]) => void;
}) {
    const [panelState, setPanelState] = useState<PanelState>("promo");
    // Confirmed selections — one language per row
    const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
    // Pending multi-select value for the "add next" adder slot (committed on dropdown close)
    const [addingValue, setAddingValue] = useState<string[]>([]);
    // Snapshot of what was sent to "apply"
    const [pendingLangs, setPendingLangs] = useState<string[]>([]);

    const selectedCount = selectedLangs.length;
    const isEditMode = enabledLangs.length > 0;
    const isRemovingAll = isEditMode && selectedCount === 0;
    const isRemovingAny = enabledLangs.some(lang => !selectedLangs.includes(lang));
    const hasChanges =
        selectedLangs.length !== enabledLangs.length ||
        selectedLangs.some(lang => !enabledLangs.includes(lang)) ||
        enabledLangs.some(lang => !selectedLangs.includes(lang));
    const canEnable = isRemovingAll || (hasChanges && selectedCount > 0);

    const activeLangsList = enabledLangs;

    // When the adder dropdown closes, commit each selection as its own individual row
    function handleAddingClose() {
        if (addingValue.length > 0) {
            setSelectedLangs(prev => [...prev, ...addingValue].slice(0, MAX_LANGUAGES));
            setAddingValue([]);
        }
    }

    function handleRemoveLang(index: number) {
        setSelectedLangs(prev => prev.filter((_, i) => i !== index));
    }

    function handleSwapLang(index: number, newLang: string) {
        setSelectedLangs(prev => prev.map((l, i) => i === index ? newLang : l));
    }

    function handleEnableTranslation() {
        const newLangs = [...selectedLangs];
        const isUpdating = isEditMode && newLangs.length > 0;

        setPendingLangs(newLangs);

        if (isRemovingAll) {
            setPanelState("removing");
            setTimeout(() => {
                onEnabledLangsChange([]);
                setSelectedLangs([]);
                setAddingValue([]);
                setPanelState("success_remove");
            }, APPLYING_DELAY_MS);
        }
        else if (isUpdating) {
            setPanelState("applying_changes");
            setTimeout(() => {
                onEnabledLangsChange(newLangs);
                setPanelState("success_changes");
            }, APPLYING_DELAY_MS);
        }
        else {
            setPanelState("applying");
            setTimeout(() => {
                onEnabledLangsChange(newLangs);
                setPanelState("success");
            }, APPLYING_DELAY_MS);
        }
    }

    function handleCancel() {
        setSelectedLangs([...enabledLangs]);
        setAddingValue([]);
        setPanelState(enabledLangs.length > 0 ? "settled" : "promo");
    }

    function handleGotIt() {
        setPanelState("settled");
    }

    function handleGotItRemove() {
        setSelectedLangs([]);
        setAddingValue([]);
        setPanelState("promo");
    }

    function handleTryAgain() {
        setPanelState("selector");
    }

    function handleEdit() {
        setSelectedLangs([...enabledLangs]);
        setAddingValue([]);
        setPanelState("selector");
    }

    // Header and source-language section are hidden during all transient states
    const isTransient = panelState !== "promo" && panelState !== "selector" && panelState !== "settled";
    const showCredits = !isTransient;
    // In selector state, source language scrolls with content (not pinned above scroll area)
    const showSourceLang = !isTransient && panelState !== "selector";

    // ── Shared bullet lists ──────────────────────────────────────────────────
    const applyingBullets = [
        "Narration text can be edited at any time.",
        "Any changes to the source language will automatically apply to all translated languages."
    ];
    const successBullets = [
        "Use the top bar to switch display languages.",
        "All translations can be edited at any time from the narration placeholders."
    ];

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
                            {panelState === "promo"
                                ? "Editable until additional languages are added"
                                : "Locked for switching once language setup starts"}
                        </Typography>
                        <Box sx={sourceSelectRowSx}>
                            {panelState === "settled" ? (
                                <>
                                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
                                        <Typography sx={{ fontSize: 20, lineHeight: 1 }}>🇺🇸</Typography>
                                        <Typography variant="body1">English</Typography>
                                    </Box>
                                    <IconButton size="small" color="primary">
                                        <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faPlay} /></SvgIcon>
                                    </IconButton>
                                </>
                            ) : (
                                <>
                                    <FormControl size="small" sx={{ flex: 1 }}>
                                        <Select value="en">
                                            <MenuItem value="en">
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography sx={{ fontSize: 16, lineHeight: 1 }}>🇺🇸</Typography>
                                                    <Typography variant="body1">English</Typography>
                                                </Box>
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                    <IconButton size="small" color="primary">
                                        <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faPlay} /></SvgIcon>
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>
                )}

                {/* ── Promo card ───────────────────────────────────────────── */}
                {panelState === "promo" && (
                    <Box sx={bodyScrollSx}>
                        <Box sx={promoCardSx}>
                            <Box sx={promoThumbSx}>
                                <Box sx={promoFlagsRowSx}>
                                    {["🇮🇹", "🇩🇪", "🇪🇸"].map((flag) => (
                                        <Box key={flag} sx={promoFlagPillSx}>
                                            <Typography sx={{ fontSize: 14, lineHeight: 1 }}>{flag}</Typography>
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
                                        <Typography variant="body1" color="text.secondary">{text}</Typography>
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
                        <Box sx={selectorScrollSx}>
                            {/* ── Narration source language — scrolls with content ── */}
                            <Box sx={selectorSourceSectionSx}>
                                <Box sx={sourceLabelRowSx}>
                                    <Typography variant="h5">Narration source language</Typography>
                                    <IconButton size="small" sx={{ p: "2px" }}>
                                        <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                                    </IconButton>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
                                    Editable until additional languages are added
                                </Typography>
                                <Box sx={sourceSelectRowSx}>
                                    <FormControl size="small" sx={{ flex: 1 }}>
                                        <Select value="en" disabled>
                                            <MenuItem value="en">
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography sx={{ fontSize: 16, lineHeight: 1 }}>🇺🇸</Typography>
                                                    <Typography variant="body1">English</Typography>
                                                </Box>
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                    <IconButton size="small" color="primary">
                                        <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faPlay} /></SvgIcon>
                                    </IconButton>
                                    <IconButton size="small" color="primary">
                                        <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faCheck} /></SvgIcon>
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* ── Sticky heading ── */}
                            <Typography variant="h5" sx={stickyHeadingSx}>
                                {isEditMode
                                    ? `Edit up to ${MAX_LANGUAGES} languages`
                                    : `Select up to ${MAX_LANGUAGES} languages`}
                            </Typography>

                            {/* ── One row per confirmed language (single-select, swappable) ── */}
                            {selectedLangs.map((lang, i) => (
                                <Box key={`confirmed-${i}`} sx={slotRowSx}>
                                    <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
                                        <Select
                                            value={lang}
                                            onChange={(e) => handleSwapLang(i, e.target.value as string)}
                                            renderValue={(val) => (
                                                <Box sx={slotRenderValueSx}>
                                                    <Box sx={flagCircleSmSx}>
                                                        <Typography sx={{ fontSize: 13, lineHeight: 1 }}>
                                                            {FLAG_BY_NAME[val as string]}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" sx={{ flex: 1, minWidth: 0 }} noWrap>
                                                        {val as string}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        sx={{ p: "2px", flexShrink: 0 }}
                                                        onMouseDown={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            handleRemoveLang(i);
                                                        }}
                                                    >
                                                        <SvgIcon sx={iconXsSx}>
                                                            <FontAwesomeIcon icon={faXmark} />
                                                        </SvgIcon>
                                                    </IconButton>
                                                </Box>
                                            )}
                                            MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                                        >
                                            {LANGUAGE_OPTIONS
                                                .filter(l => l.name === lang || !selectedLangs.includes(l.name))
                                                .map(({ name, flag }) => (
                                                    <MenuItem key={name} value={name}>
                                                        <Typography sx={{ fontSize: 16, lineHeight: 1, mr: 1 }}>{flag}</Typography>
                                                        <Typography variant="body1">{name}</Typography>
                                                    </MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                </Box>
                            ))}

                            {/* ── Multi-select adder — on close each selection becomes its own row ── */}
                            {selectedCount < MAX_LANGUAGES && (
                                <Box sx={slotRowSx}>
                                    <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
                                        <Select
                                            multiple
                                            displayEmpty
                                            value={addingValue}
                                            onChange={(e) => setAddingValue(e.target.value as string[])}
                                            onClose={handleAddingClose}
                                            renderValue={(sel) => {
                                                const selected = sel as string[];
                                                if (selected.length === 0) {
                                                    return (
                                                        <Typography variant="body1" color="text.disabled" sx={{ fontStyle: "italic" }}>
                                                            Choose languages
                                                        </Typography>
                                                    );
                                                }
                                                return (
                                                    <Box sx={slotRenderValueSx}>
                                                        <Box sx={flagCircleSmSx}>
                                                            <Typography sx={{ fontSize: 13, lineHeight: 1 }}>
                                                                {FLAG_BY_NAME[selected[0]]}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body1" sx={{ flex: 1, minWidth: 0 }} noWrap>
                                                            {selected.length === 1
                                                                ? selected[0]
                                                                : `${selected[0]} +${selected.length - 1}`}
                                                        </Typography>
                                                    </Box>
                                                );
                                            }}
                                            MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                                        >
                                            {LANGUAGE_OPTIONS
                                                .filter(l => !selectedLangs.includes(l.name))
                                                .map(({ name, flag }) => {
                                                    const checked = addingValue.includes(name);
                                                    const atMax = (selectedCount + addingValue.length) >= MAX_LANGUAGES && !checked;
                                                    return (
                                                        <MenuItem key={name} value={name} disabled={atMax}>
                                                            <Tooltip
                                                                title={atMax ? `Remove a language to add another (max ${MAX_LANGUAGES})` : ""}
                                                                placement="right"
                                                                disableInteractive
                                                            >
                                                                <Box sx={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    width: "100%",
                                                                    pointerEvents: atMax ? "all" : undefined
                                                                }}>
                                                                    <Checkbox checked={checked} size="small" sx={{ p: "4px", mr: 0.5 }} />
                                                                    <Typography sx={{ fontSize: 16, lineHeight: 1, mr: 1 }}>{flag}</Typography>
                                                                    <Typography variant="body1">{name}</Typography>
                                                                </Box>
                                                            </Tooltip>
                                                        </MenuItem>
                                                    );
                                                })}
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}
                        </Box>

                        {/* Sticky footer */}
                        <Box sx={stickyFooterSx}>
                            <AttentionBox
                                color="info"
                                icon={<SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>}
                                sx={{ mb: 1.5 }}
                            >
                                <Typography variant="body1">Credits will apply on video approval</Typography>
                            </AttentionBox>

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="medium"
                                disabled={!canEnable}
                                onClick={handleEnableTranslation}
                                sx={{ mb: 1.5 }}
                            >
                                {isRemovingAll
                                    ? "Remove languages"
                                    : isEditMode
                                        ? "Apply changes"
                                        : "Enable translation"}
                                {!isRemovingAll && selectedCount > 0 && (
                                    <Box component="span" sx={countBadgeSx}>{selectedCount}</Box>
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
                                    icon={<SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faTriangleExclamation} /></SvgIcon>}
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

                {/* ── Applying / Applying changes ──────────────────────────── */}
                {(panelState === "applying" || panelState === "applying_changes") && (
                    <Box sx={centeredBodySx}>
                        <Box sx={flagCirclesRowSx}>
                            {pendingLangs.slice(0, 3).map(lang => (
                                <Box key={lang} sx={flagCircleLgSx}>
                                    <Typography sx={{ fontSize: 28, lineHeight: 1 }}>
                                        {FLAG_BY_NAME[lang]}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        <Typography variant="h4" sx={{ textAlign: "center", mt: 3, mb: 2.5 }}>
                            {panelState === "applying_changes"
                                ? "Applying changes"
                                : `Applying ${pendingLangs.length} language${pendingLangs.length !== 1 ? "s" : ""}`}
                        </Typography>
                        <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                            {applyingBullets.map((text, i) => (
                                <Box component="li" key={i} sx={{ mb: i < applyingBullets.length - 1 ? 1 : 0 }}>
                                    <Typography variant="body1" color="text.secondary">{text}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* ── Success / Changes applied ────────────────────────────── */}
                {(panelState === "success" || panelState === "success_changes") && (
                    <Box sx={centeredBodySx}>
                        <SvgIcon sx={successIconSx}>
                            <FontAwesomeIcon icon={faCircleCheck} />
                        </SvgIcon>
                        <Typography variant="h4" sx={{ textAlign: "center", mt: 3, mb: 2.5 }}>
                            {panelState === "success_changes"
                                ? "Changes applied successfully"
                                : `${enabledLangs.length} language${enabledLangs.length !== 1 ? "s" : ""} applied successfully`}
                        </Typography>
                        <Box component="ul" sx={{ pl: 2.5, m: 0, mb: 3 }}>
                            {successBullets.map((text, i) => (
                                <Box component="li" key={i} sx={{ mb: i < successBullets.length - 1 ? 1 : 0 }}>
                                    <Typography variant="body1" color="text.secondary">{text}</Typography>
                                </Box>
                            ))}
                        </Box>
                        <Button variant="contained" color="primary" fullWidth size="medium" onClick={handleGotIt}>
                            Got it!
                        </Button>
                    </Box>
                )}

                {/* ── Error / Changes error ────────────────────────────────── */}
                {(panelState === "error" || panelState === "error_changes") && (
                    <Box sx={centeredBodySx}>
                        <SvgIcon sx={errorIconSx}>
                            <FontAwesomeIcon icon={faCircleXmark} />
                        </SvgIcon>
                        <Typography variant="h4" sx={{ textAlign: "center", mt: 3, mb: 3 }}>
                            {panelState === "error_changes"
                                ? "Changes couldn't be applied"
                                : "Languages couldn't be applied"}
                        </Typography>
                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            size="medium"
                            onClick={handleTryAgain}
                            sx={{ mb: 1.5 }}
                        >
                            Try again
                        </Button>
                        <Box sx={{ textAlign: "center" }}>
                            <TruffleLink href="#" underline="hover" color="primary">
                                Contact support
                            </TruffleLink>
                        </Box>
                    </Box>
                )}

                {/* ── Removing ─────────────────────────────────────────────── */}
                {panelState === "removing" && (
                    <Box sx={centeredBodySx}>
                        <Box sx={trashIconCircleSx}>
                            <SvgIcon sx={{ fontSize: "26px !important", width: "26px !important", height: "26px !important", color: "background.paper" }}>
                                <FontAwesomeIcon icon={faTrashCan} />
                            </SvgIcon>
                        </Box>
                        <Typography variant="h4" sx={{ textAlign: "center", mt: 3 }}>
                            Removing languages
                        </Typography>
                    </Box>
                )}

                {/* ── Languages removed successfully ───────────────────────── */}
                {panelState === "success_remove" && (
                    <Box sx={centeredBodySx}>
                        <SvgIcon sx={successIconSx}>
                            <FontAwesomeIcon icon={faCircleCheck} />
                        </SvgIcon>
                        <Typography variant="h4" sx={{ textAlign: "center", mt: 3, mb: 3 }}>
                            Languages removed successfully
                        </Typography>
                        <Button variant="contained" color="primary" fullWidth size="medium" onClick={handleGotItRemove}>
                            Got it!
                        </Button>
                    </Box>
                )}

                {/* ── Settled (language list) ──────────────────────────────── */}
                {panelState === "settled" && (
                    <Box sx={bodyScrollSx}>
                        <Box sx={additionalLangsHeaderSx}>
                            <Typography variant="h5" sx={{ flex: 1 }}>Additional languages</Typography>
                            <Button
                                variant="text"
                                size="small"
                                startIcon={<SvgIcon sx={iconXsSx}><FontAwesomeIcon icon={faPencil} /></SvgIcon>}
                                onClick={handleEdit}
                                sx={editBtnSx}
                            >
                                Edit
                            </Button>
                        </Box>

                        {activeLangsList.map((lang, i) => (
                            <Box key={lang}>
                                {i > 0 && <Divider />}
                                <Box sx={langListItemSx}>
                                    <Box sx={flagCircleMdSx}>
                                        <Typography sx={{ fontSize: 20, lineHeight: 1 }}>
                                            {FLAG_BY_NAME[lang]}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ flex: 1 }}>{lang}</Typography>
                                    <IconButton size="small" color="primary">
                                        <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faPlay} /></SvgIcon>
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
    fontSize: "18px !important",
    width: "18px !important",
    height: "18px !important"
};

const iconXsSx: SxProps<Theme> = {
    fontSize: "14px !important",
    width: "14px !important",
    height: "14px !important"
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

// ─── Transient states layout ──────────────────────────────────────────────────

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
    borderColor: "divider"
};

const successIconSx: SxProps<Theme> = {
    fontSize: "52px !important",
    width: "52px !important",
    height: "52px !important",
    color: "success.main"
};

const errorIconSx: SxProps<Theme> = {
    fontSize: "52px !important",
    width: "52px !important",
    height: "52px !important",
    color: "error.main"
};

const trashIconCircleSx: SxProps<Theme> = {
    width: 52,
    height: 52,
    borderRadius: "50%",
    bgcolor: "text.primary",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
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
    "& .MuiButton-startIcon": { mr: "4px" }
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

const flagCircleSmSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    borderRadius: "50%",
    bgcolor: "action.hover",
    border: "1px solid",
    borderColor: "divider",
    flexShrink: 0
};

const slotRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    mb: 1.5
};

const slotRenderValueSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    width: "100%",
    minWidth: 0
};


// ── Selector-state layout ─────────────────────────────────────────────────────

// Source language section inside the selector scroll area (scrolls with content)
const selectorSourceSectionSx: SxProps<Theme> = {
    pb: 2,
    mb: 1,
    borderBottom: "1px solid",
    borderColor: "divider"
};

// "Select up to X languages" heading — sticks to top of scroll container
const stickyHeadingSx: SxProps<Theme> = {
    position: "sticky",
    top: 0,
    zIndex: 1,
    bgcolor: "background.paper",
    pt: 1.5,
    pb: 1.5
};
