import { useEffect, useRef, useState } from "react";
import {
    Box, Typography, IconButton, SvgIcon, Button,
    Select, MenuItem, FormControl, Divider,
    Autocomplete, TextField, InputAdornment
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark, faCircleInfo, faCircleQuestion, faCoins, faCheck,
    faTriangleExclamation, faPencil, faTrashCan,
    faAngleDown, faSparkles
} from "@fortawesome/pro-regular-svg-icons";
import { faPlay, faCircleCheck, faCircleXmark } from "@fortawesome/pro-solid-svg-icons";
import {
    AttentionBox,
    Label,
    ToggleIconButton,
    TruffleAlert,
    TruffleLink,
    combineSxProps
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import LanguagePickerDialog from "../dialogs/LanguagePickerDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
type PanelState =
    | "promo" | "selector" | "picker" | "settled"
    | "applying" | "success" | "error"
    | "applying_changes" | "success_changes" | "error_changes"
    | "removing" | "success_remove";

// ─── Constants ────────────────────────────────────────────────────────────────
const PANEL_WIDTH = 366;
export const MAX_LANGUAGES = 14;
const APPLYING_DELAY_MS = 1500;

export const LANGUAGE_OPTIONS: { name: string; flag: string; code: string }[] = [
    { name: "Bulgarian", flag: "🇧🇬", code: "BG" },
    { name: "Chinese (Simplified)", flag: "🇨🇳", code: "ZH" },
    { name: "Chinese (Traditional)", flag: "🇹🇼", code: "ZH" },
    { name: "Croatian", flag: "🇭🇷", code: "HR" },
    { name: "Czech", flag: "🇨🇿", code: "CS" },
    { name: "Danish", flag: "🇩🇰", code: "DA" },
    { name: "Dutch", flag: "🇳🇱", code: "NL" },
    { name: "Filipino (Tagalog)", flag: "🇵🇭", code: "FIL" },
    { name: "Finnish", flag: "🇫🇮", code: "FI" },
    { name: "French", flag: "🇫🇷", code: "FR" },
    { name: "French (Canada)", flag: "🇨🇦", code: "FR" },
    { name: "German", flag: "🇩🇪", code: "DE" },
    { name: "Greek", flag: "🇬🇷", code: "EL" },
    { name: "Hindi", flag: "🇮🇳", code: "HI" },
    { name: "Indonesian", flag: "🇮🇩", code: "ID" },
    { name: "Italian", flag: "🇮🇹", code: "IT" },
    { name: "Japanese", flag: "🇯🇵", code: "JA" },
    { name: "Korean", flag: "🇰🇷", code: "KO" },
    { name: "Malay", flag: "🇲🇾", code: "MS" },
    { name: "Polish", flag: "🇵🇱", code: "PL" },
    { name: "Portuguese (Brazil)", flag: "🇧🇷", code: "PT" },
    { name: "Portuguese (Portugal)", flag: "🇵🇹", code: "PT" },
    { name: "Romanian", flag: "🇷🇴", code: "RO" },
    { name: "Russian", flag: "🇷🇺", code: "RU" },
    { name: "Slovak", flag: "🇸🇰", code: "SK" },
    { name: "Spanish", flag: "🇪🇸", code: "ES" },
    { name: "Spanish (Mexico)", flag: "🇲🇽", code: "ES" },
    { name: "Swedish", flag: "🇸🇪", code: "SV" },
    { name: "Tamil", flag: "🇱🇰", code: "TA" },
    { name: "Turkish", flag: "🇹🇷", code: "TR" },
    { name: "Ukrainian", flag: "🇺🇦", code: "UK" }
];

// ─── Source language options (the original video language) ────────────────────
export const SOURCE_LANGUAGE_OPTIONS: { name: string; flag: string }[] = [
    { name: "English (US)", flag: "🇺🇸" },
    { name: "English (UK)", flag: "🇬🇧" },
    { name: "French", flag: "🇫🇷" },
    { name: "German", flag: "🇩🇪" },
    { name: "Spanish", flag: "🇪🇸" },
    { name: "Japanese", flag: "🇯🇵" },
    { name: "Portuguese (Brazil)", flag: "🇧🇷" }
];
export const SOURCE_FLAG_BY_NAME: Record<string, string> = Object.fromEntries(
    SOURCE_LANGUAGE_OPTIONS.map(l => [l.name, l.flag])
);

export const FLAG_BY_NAME: Record<string, string> = Object.fromEntries(LANGUAGE_OPTIONS.map(l => [l.name, l.flag]));
export const CODE_BY_NAME: Record<string, string> = Object.fromEntries(LANGUAGE_OPTIONS.map(l => [l.name, l.code]));

// ─── Component ────────────────────────────────────────────────────────────────
export default function LanguagesPanel({
    open,
    onClose,
    enabledLangs,
    onEnabledLangsChange,
    selectedLangs: selectedLangsProp,
    onSelectedLangsChange
}: {
    open: boolean;
    onClose: () => void;
    enabledLangs: string[];
    onEnabledLangsChange: (langs: string[]) => void;
    /** Optional controlled in-progress selections — when provided, picks survive unmount. */
    selectedLangs?: string[];
    onSelectedLangsChange?: (langs: string[]) => void;
}) {
    // Initialize panelState from the lifted enabledLangs/selectedLangs so the
    // panel resumes wherever the user left off across task switches / page navs.
    const [panelState, setPanelState] = useState<PanelState>(() => {
        if (enabledLangs.length > 0) {
            return "settled";
        }
        if (selectedLangsProp && selectedLangsProp.length > 0 && selectedLangsProp.some(l => l !== "")) {
            return "selector";
        }
        return "promo";
    });

    // If the lifted enabledLangs prop becomes non-empty AFTER mount (e.g. App
    // state hadn't propagated when this component first mounted), advance the
    // panel from intro/promo to settled so the user sees their saved languages.
    useEffect(() => {
        if (enabledLangs.length > 0 && panelState === "promo") {
            setPanelState("settled");
        }
    }, [enabledLangs.length, panelState]);
    // Source language (the original video narration language)
    const [sourceLanguage, setSourceLanguage] = useState("English (US)");
    // In-progress selections — one language per row.
    // Backed by a controlled prop when provided (lifted to App.tsx so picks persist
    // across task switches), with a local fallback for standalone usage.
    const [internalSelectedLangs, setInternalSelectedLangs] = useState<string[]>([]);
    const selectedLangs = selectedLangsProp ?? internalSelectedLangs;
    const setSelectedLangs = (langs: string[] | ((prev: string[]) => string[])) => {
        const next = typeof langs === "function" ? (langs as (p: string[]) => string[])(selectedLangs) : langs;
        if (onSelectedLangsChange) {
            onSelectedLangsChange(next);
        }
        else {
            setInternalSelectedLangs(next);
        }
    };
    // Snapshot of what was sent to "apply"
    const [pendingLangs, setPendingLangs] = useState<string[]>([]);
    // Language picker dialog
    const [showPicker, setShowPicker] = useState(false);
    // Which slot's autocomplete dropdown is forced open (after clearing the X inside it)
    const [openSlotIdx, setOpenSlotIdx] = useState<number | null>(null);
    // Count for the success TruffleAlert shown briefly after languages are applied; null = hidden
    const [successAlertCount, setSuccessAlertCount] = useState<number | null>(null);

    const filledLangs = selectedLangs.filter(l => l !== "");
    const selectedCount = filledLangs.length;
    const isEditMode = enabledLangs.length > 0;
    const isRemovingAll = isEditMode && selectedCount === 0;
    const isRemovingAny = enabledLangs.some(lang => !filledLangs.includes(lang));
    const hasChanges =
        filledLangs.length !== enabledLangs.length ||
        filledLangs.some(lang => !enabledLangs.includes(lang)) ||
        enabledLangs.some(lang => !filledLangs.includes(lang));
    const canEnable = isRemovingAll || (hasChanges && selectedCount > 0);
    const activeLangsList = enabledLangs;

    // Tracks whether the picker dialog was just confirmed (vs cancelled), so the
    // following onClose can route the panel to the right state.
    const pickerConfirmedRef = useRef(false);

    function handlePickerConfirm(langs: string[]) {
        const sorted = [...langs].sort((a, b) => a.localeCompare(b));
        setSelectedLangs(sorted.slice(0, MAX_LANGUAGES));
        pickerConfirmedRef.current = true;
    }

    function handleSetLangAt(idx: number, lang: string) {
        setSelectedLangs(prev => prev.map((l, i) => i === idx ? lang : l));
    }

    function handleRemoveAt(idx: number) {
        setSelectedLangs(prev => prev.filter((_, i) => i !== idx));
    }

    function handleEnableTranslation() {
        const newLangs = [...filledLangs].sort((a, b) => a.localeCompare(b));
        const isUpdating = isEditMode && newLangs.length > 0;

        setPendingLangs(newLangs);

        if (isRemovingAll) {
            setPanelState("removing");
            setTimeout(() => {
                onEnabledLangsChange([]);
                setSelectedLangs([]);
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
                setSuccessAlertCount(newLangs.length);
                setTimeout(() => setSuccessAlertCount(null), 6000);
            }, APPLYING_DELAY_MS);
        }
    }

    function handleCancel() {
        setSelectedLangs([...enabledLangs]);
        setPanelState(enabledLangs.length > 0 ? "settled" : "promo");
    }

    function handleGotIt() {
        setPanelState("settled");
    }

    function handleGotItRemove() {
        setSelectedLangs([]);
        setPanelState("promo");
    }

    function handleTryAgain() {
        setPanelState("selector");
    }

    function handleEdit() {
        setSelectedLangs([...enabledLangs]);
        setPanelState("selector");
    }

    // Header is hidden during transient (applying / success / error / removing) states
    const isTransient = panelState !== "promo" && panelState !== "selector" && panelState !== "picker" && panelState !== "settled";
    const showCredits = !isTransient;
    // Source language only shows in promo (settled has it inline so it can scroll with content)
    const showSourceLang = !isTransient && panelState === "promo";

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
                            <SvgIcon color="gradient" sx={iconSmSx}>
                                <FontAwesomeIcon icon={faCoins} />
                            </SvgIcon>
                            <Typography variant="body1" color="info.main" sx={{ lineHeight: 1 }}>
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
                                <SvgIcon sx={infoIconSx}>
                                    <FontAwesomeIcon icon={faCircleInfo} />
                                </SvgIcon>
                            </IconButton>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
                            {panelState === "promo"
                                ? "Editable until additional languages are added"
                                : "Locked for switching once language setup starts"}
                        </Typography>
                        {panelState === "promo" ? (
                            <FormControl size="small" fullWidth>
                                <Select
                                    value={sourceLanguage}
                                    onChange={e => setSourceLanguage(e.target.value)}
                                    IconComponent={() => (
                                        <SvgIcon sx={selectIconSx}>
                                            <FontAwesomeIcon icon={faAngleDown} />
                                        </SvgIcon>
                                    )}
                                    renderValue={(val) => (
                                        <Box sx={sourceLangRenderValueSx}>
                                            <Box sx={flagCircleSmSx}>
                                                <Typography sx={{ fontSize: 13, lineHeight: 1 }}>
                                                    {SOURCE_FLAG_BY_NAME[val as string]}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" noWrap>{val as string}</Typography>
                                        </Box>
                                    )}
                                    MenuProps={{ PaperProps: { sx: { maxHeight: 280 } } }}
                                >
                                    {SOURCE_LANGUAGE_OPTIONS.map(({ name, flag }) => (
                                        <MenuItem key={name} value={name}>
                                            <Box sx={menuItemInnerSx}>
                                                <Typography sx={{ fontSize: 16, lineHeight: 1 }}>{flag}</Typography>
                                                <Typography variant="body1">{name}</Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <Box sx={sourceSelectRowSx}>
                                <Box sx={flagCircleMdSx}>
                                    <Typography sx={{ fontSize: 20, lineHeight: 1 }}>
                                        {SOURCE_FLAG_BY_NAME[sourceLanguage]}
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ flex: 1 }}>{sourceLanguage}</Typography>
                                <IconButton size="small" color="primary">
                                    <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faPlay} /></SvgIcon>
                                </IconButton>
                            </Box>
                        )}
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
                                <Typography variant="h3" sx={promoThumbTitleSx}>
                                    Hello &#123;first name&#125;
                                </Typography>
                            </Box>

                            <Typography variant="h3" sx={{ textAlign: "center" }}>
                                Make this video multilingual
                            </Typography>

                            <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                                {[
                                    "Add languages to generate automatic translations.",
                                    "Review, edit, and preview narration without credits. Credits apply at approval or publishing."
                                ].map((text, i) => (
                                    <Box component="li" key={i} sx={{ mb: 0.75 }}>
                                        <Typography variant="body1">{text}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="medium"
                                    fullWidth
                                    onClick={() => {
                                        setPanelState("picker"); setShowPicker(true);
                                    }}
                                >
                                    Add up to {MAX_LANGUAGES} languages
                                </Button>
                                <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
                                    <TruffleLink href="#" underline="hover" color="primary">
                                        Learn more
                                    </TruffleLink>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* ── Language selector ────────────────────────────────────── */}
                {panelState === "selector" && (
                    <>
                        {/* ── Scrollable area ── */}
                        <Box sx={selectorScrollSx}>
                            {/* ── Narration source language ── */}
                            <Box sx={selectorSourceSectionSx}>
                                <Box sx={sourceLabelRowSx}>
                                    <Typography variant="h5">Narration source language</Typography>
                                    <IconButton size="small" sx={{ p: "2px" }}>
                                        <SvgIcon sx={infoIconSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                                    </IconButton>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
                                    Editable until additional languages are added
                                </Typography>
                                <Box sx={sourceSelectRowSx}>
                                    <Box sx={flagCircleMdSx}>
                                        <Typography sx={{ fontSize: 20, lineHeight: 1 }}>
                                            {SOURCE_FLAG_BY_NAME[sourceLanguage]}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ flex: 1 }}>{sourceLanguage}</Typography>
                                    <IconButton size="small" color="primary">
                                        <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faPlay} /></SvgIcon>
                                    </IconButton>
                                    <IconButton size="small" color="primary">
                                        <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faCheck} /></SvgIcon>
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* ── Selector card (heading + rows only) ── */}
                            <Box sx={selectorCardSx}>
                                <Box sx={selectorCardHeadingSx}>
                                    <Typography variant="h5" sx={{ flex: 1 }}>
                                        {isEditMode
                                            ? `Edit ${selectedCount} additional language${selectedCount !== 1 ? "s" : ""}`
                                            : `Select up to ${MAX_LANGUAGES} languages`}
                                    </Typography>
                                    {selectedCount > 0 && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="primary"
                                            onClick={() => setShowPicker(true)}
                                            sx={addBtnSx}
                                        >
                                            {isEditMode || selectedCount >= MAX_LANGUAGES ? "Manage" : "+ Add"}
                                        </Button>
                                    )}
                                </Box>

                                {/* ── Language rows: read-only display of selected languages.
                                    Adding/removing happens via the picker dialog (Manage / + Add). */}
                                <Box sx={langRowsContainerSx}>
                                    {selectedLangs.map((lang, idx) => (
                                        <Box key={idx} sx={slotRowSx}>
                                            <Autocomplete
                                                value={lang ? LANGUAGE_OPTIONS.find(l => l.name === lang) ?? null : null}
                                                onChange={(_, newValue) => {
                                                    handleSetLangAt(idx, newValue?.name ?? "");
                                                    setOpenSlotIdx(newValue ? null : idx);
                                                }}
                                                open={openSlotIdx === idx}
                                                onOpen={() => setOpenSlotIdx(idx)}
                                                onClose={() => setOpenSlotIdx(null)}
                                                options={LANGUAGE_OPTIONS.filter(l => l.name === lang || !filledLangs.includes(l.name))}
                                                getOptionLabel={(opt) => opt.name}
                                                isOptionEqualToValue={(opt, val) => opt.name === val.name}
                                                popupIcon={<SvgIcon sx={autocompleteChevronSx}><FontAwesomeIcon icon={faAngleDown} /></SvgIcon>}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        size="medium"
                                                        placeholder={lang ? undefined : "Choose or type language"}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            startAdornment: lang ? (
                                                                <InputAdornment position="start">
                                                                    <Box sx={flagCircleSmSx}>
                                                                        <Typography sx={{ fontSize: 13, lineHeight: 1 }}>
                                                                            {FLAG_BY_NAME[lang]}
                                                                        </Typography>
                                                                    </Box>
                                                                </InputAdornment>
                                                            ) : null
                                                        }}
                                                    />
                                                )}
                                                renderOption={({ key, ...optionProps }, option) => (
                                                    <MenuItem key={key} {...optionProps}>
                                                        <Box sx={menuItemInnerSx}>
                                                            <Typography sx={{ fontSize: 16, lineHeight: 1 }}>{option.flag}</Typography>
                                                            <Typography variant="body1">{option.name}</Typography>
                                                        </Box>
                                                    </MenuItem>
                                                )}
                                                ListboxProps={{ sx: { maxHeight: 320 } }}
                                                sx={{ flex: 1, minWidth: 0 }}
                                            />
                                            <IconButton size="small" color="primary" sx={{ flexShrink: 0 }}>
                                                <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faPlay} /></SvgIcon>
                                            </IconButton>
                                            <ToggleIconButton
                                                size="small"
                                                color="error"
                                                value="remove"
                                                onClick={() => handleRemoveAt(idx)}
                                                icon={<FontAwesomeIcon icon={faTrashCan} />}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            <Box sx={{ pb: 1 }} />
                        </Box>

                        {/* ── Sticky footer: attention boxes + action button + cancel ── */}
                        <Box sx={stickyFooterSx}>
                            <AttentionBox
                                color="info"
                                icon={<SvgIcon sx={infoIconSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>}
                                sx={{ mb: 1.5 }}
                            >
                                <Typography variant="body1">Credits will apply on video approval</Typography>
                            </AttentionBox>

                            {isRemovingAny && (
                                <AttentionBox
                                    color="warning"
                                    icon={<SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faTriangleExclamation} /></SvgIcon>}
                                    sx={{ mb: 1.5 }}
                                >
                                    <Typography variant="body1">
                                        Removing a language deletes its generated content, and the AI
                                        credits used to create it won&apos;t be refunded.
                                    </Typography>
                                </AttentionBox>
                            )}

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size={isEditMode && !isRemovingAll ? "large" : "medium"}
                                disabled={!canEnable}
                                onClick={handleEnableTranslation}
                                sx={!isRemovingAll ? gradientBtnSx : undefined}
                                startIcon={
                                    !isEditMode && !isRemovingAll
                                        ? <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faSparkles} /></SvgIcon>
                                        : undefined
                                }
                            >
                                {isRemovingAll
                                    ? "Remove languages"
                                    : isEditMode
                                        ? "Apply changes"
                                        : "Enable translations"}
                                {!isRemovingAll && (() => {
                                    // In edit mode the badge counts ACTUAL CHANGES
                                    // (additions + removals); otherwise it's just the
                                    // total count of selected languages.
                                    const additions = filledLangs.filter(l => !enabledLangs.includes(l)).length;
                                    const removals = enabledLangs.filter(l => !filledLangs.includes(l)).length;
                                    const count = isEditMode ? additions + removals : selectedCount;
                                    return count > 0
                                        ? <Box component="span" sx={countBadgeSx}>{count}</Box>
                                        : null;
                                })()}
                            </Button>

                            <Box sx={{ textAlign: "center", mt: 1.5 }}>
                                <TruffleLink
                                    href="#"
                                    underline="hover"
                                    onClick={(e) => {
                                        e.preventDefault(); handleCancel(); 
                                    }}
                                >
                                    Cancel
                                </TruffleLink>
                            </Box>
                        </Box>
                    </>
                )}

                {/* ── Picker state (popup flow) ────────────────────────────── */}
                {panelState === "picker" && (
                    <>
                        <Box sx={selectorScrollSx}>
                            {/* ── Narration source language ── */}
                            <Box sx={selectorSourceSectionSx}>
                                <Box sx={sourceLabelRowSx}>
                                    <Typography variant="h5">Narration source language</Typography>
                                    <IconButton size="small" sx={{ p: "2px" }}>
                                        <SvgIcon sx={infoIconSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                                    </IconButton>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
                                    {selectedCount === 0
                                        ? "Editable until additional languages are added"
                                        : "Locked for switching once language setup starts"}
                                </Typography>
                                <Box sx={sourceSelectRowSx}>
                                    <Box sx={flagCircleMdSx}>
                                        <Typography sx={{ fontSize: 20, lineHeight: 1 }}>
                                            {SOURCE_FLAG_BY_NAME[sourceLanguage]}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ flex: 1 }}>{sourceLanguage}</Typography>
                                    <IconButton size="small" color="primary">
                                        <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faPlay} /></SvgIcon>
                                    </IconButton>
                                    {selectedCount === 0 && (
                                        <IconButton size="small" color="primary">
                                            <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faCheck} /></SvgIcon>
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>

                            {/* ── Picker card ── */}
                            <Box sx={pickerCardSx}>
                                {selectedLangs.length === 0 ? (
                                    /* ── Empty state: invite to pick ── */
                                    <>
                                        <Typography variant="h5" sx={{ textAlign: "center" }}>
                                            Select up to {MAX_LANGUAGES} additional languages
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center" }}>
                                            Choose multiple languages at once. You can review voice options before applying them.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            color="primary"
                                            fullWidth
                                            onClick={() => setShowPicker(true)}
                                        >
                                            Select languages
                                        </Button>
                                        <Box sx={{ textAlign: "center", mt: 1.5 }}>
                                            <TruffleLink
                                                href="#"
                                                underline="hover"
                                                onClick={(e) => {
                                                    e.preventDefault(); handleCancel();
                                                }}
                                            >
                                                Cancel
                                            </TruffleLink>
                                        </Box>
                                    </>
                                ) : (
                                    /* ── Has languages: show slots + Add button ── */
                                    <>
                                        <Box sx={selectorCardHeadingSx}>
                                            <Typography variant="h5" sx={{ flex: 1 }}>
                                                Select up to {MAX_LANGUAGES} languages
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="primary"
                                                onClick={() => setShowPicker(true)}
                                                sx={addBtnSx}
                                            >
                                                {isEditMode || selectedCount >= MAX_LANGUAGES ? "Manage" : "+ Add"}
                                            </Button>
                                        </Box>

                                        <Box sx={langRowsContainerSx}>
                                            {selectedLangs.map((lang, idx) => (
                                                <Box key={idx} sx={slotRowSx}>
                                                    <Autocomplete
                                                        value={lang ? LANGUAGE_OPTIONS.find(l => l.name === lang) ?? null : null}
                                                        onChange={(_, newValue) => {
                                                            handleSetLangAt(idx, newValue?.name ?? "");
                                                            setOpenSlotIdx(newValue ? null : idx);
                                                        }}
                                                        open={openSlotIdx === idx}
                                                        onOpen={() => setOpenSlotIdx(idx)}
                                                        onClose={() => setOpenSlotIdx(null)}
                                                        options={LANGUAGE_OPTIONS.filter(l => l.name === lang || !filledLangs.includes(l.name))}
                                                        getOptionLabel={(opt) => opt.name}
                                                        isOptionEqualToValue={(opt, val) => opt.name === val.name}
                                                        popupIcon={<SvgIcon sx={autocompleteChevronSx}><FontAwesomeIcon icon={faAngleDown} /></SvgIcon>}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                size="medium"
                                                                placeholder={lang ? undefined : "Choose or type language"}
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    startAdornment: lang ? (
                                                                        <InputAdornment position="start">
                                                                            <Box sx={flagCircleSmSx}>
                                                                                <Typography sx={{ fontSize: 13, lineHeight: 1 }}>
                                                                                    {FLAG_BY_NAME[lang]}
                                                                                </Typography>
                                                                            </Box>
                                                                        </InputAdornment>
                                                                    ) : null
                                                                }}
                                                            />
                                                        )}
                                                        renderOption={({ key, ...optionProps }, option) => (
                                                            <MenuItem key={key} {...optionProps}>
                                                                <Box sx={menuItemInnerSx}>
                                                                    <Typography sx={{ fontSize: 16, lineHeight: 1 }}>{option.flag}</Typography>
                                                                    <Typography variant="body1">{option.name}</Typography>
                                                                </Box>
                                                            </MenuItem>
                                                        )}
                                                        ListboxProps={{ sx: { maxHeight: 320 } }}
                                                        sx={{ flex: 1, minWidth: 0 }}
                                                    />
                                                    <IconButton size="small" color="primary" sx={{ flexShrink: 0 }}>
                                                        <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faPlay} /></SvgIcon>
                                                    </IconButton>
                                                    <ToggleIconButton
                                                        size="small"
                                                        color="error"
                                                        value="remove"
                                                        onClick={() => handleRemoveAt(idx)}
                                                        icon={<FontAwesomeIcon icon={faTrashCan} />}
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    </>
                                )}
                            </Box>

                            <Box sx={{ pb: 1 }} />
                        </Box>

                        {/* ── Footer — only when languages are selected ── */}
                        {selectedCount > 0 && (
                            <Box sx={stickyFooterSx}>
                                <AttentionBox
                                    color="info"
                                    icon={<SvgIcon sx={infoIconSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>}
                                    sx={{ mb: 1.5 }}
                                >
                                    <Typography variant="body1">Credits will apply on video approval</Typography>
                                </AttentionBox>

                                {isRemovingAny && (
                                    <AttentionBox
                                        color="warning"
                                        icon={<SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faTriangleExclamation} /></SvgIcon>}
                                        sx={{ mb: 1.5 }}
                                    >
                                        <Typography variant="body1">
                                            Removing a language deletes its generated content, and the AI
                                            credits used to create it won&apos;t be refunded.
                                        </Typography>
                                    </AttentionBox>
                                )}

                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    onClick={handleEnableTranslation}
                                    sx={combineSxProps(gradientBtnSx, { mb: 1.5 })}
                                    startIcon={<SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faSparkles} /></SvgIcon>}
                                >
                                    Enable translations
                                    <Label label={String(selectedCount)} color="default" size="small" sx={{ ml: 1 }} />
                                </Button>

                                <Box sx={{ textAlign: "center" }}>
                                    <TruffleLink
                                        href="#"
                                        underline="hover"
                                        onClick={(e) => {
                                            e.preventDefault(); handleCancel(); 
                                        }}
                                    >
                                        Cancel
                                    </TruffleLink>
                                </Box>
                            </Box>
                        )}
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
                        {/* ── Narration source language (scrolls with content) ── */}
                        <Box sx={selectorSourceSectionSx}>
                            <Box sx={sourceLabelRowSx}>
                                <Typography variant="h5">Narration source language</Typography>
                                <IconButton size="small" sx={{ p: "2px" }}>
                                    <SvgIcon sx={infoIconSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                                </IconButton>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
                                Locked for switching once language setup starts
                            </Typography>
                            <Box sx={sourceSelectRowSx}>
                                <Box sx={flagCircleMdSx}>
                                    <Typography sx={{ fontSize: 20, lineHeight: 1 }}>
                                        {SOURCE_FLAG_BY_NAME[sourceLanguage]}
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ flex: 1 }}>{sourceLanguage}</Typography>
                                <IconButton size="small" color="primary">
                                    <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faPlay} /></SvgIcon>
                                </IconButton>
                            </Box>
                        </Box>

                        <Box sx={additionalLangsHeaderSx}>
                            <Typography variant="h5" sx={{ flex: 1 }}>
                                {enabledLangs.length} additional languages
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                startIcon={<SvgIcon sx={iconXsSx}><FontAwesomeIcon icon={faPencil} /></SvgIcon>}
                                onClick={handleEdit}
                                sx={addBtnSx}
                            >
                                Edit
                            </Button>
                        </Box>

                        {activeLangsList.map((lang, index) => (
                            <Box key={lang}>
                                {index > 0 && <Divider />}
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

            {/* ── Language picker dialog ───────────────────────────────── */}
            <LanguagePickerDialog
                open={showPicker}
                onClose={() => {
                    setShowPicker(false);
                    // If user just confirmed (clicked "Select languages"), show the
                    // selector view with the picked languages in dropdowns.
                    if (pickerConfirmedRef.current) {
                        pickerConfirmedRef.current = false;
                        setPanelState("selector");
                        return;
                    }
                    // Otherwise (cancel/X/Esc), revert from the picker state to the
                    // appropriate panel view so the user isn't left on a blank picker.
                    if (panelState === "picker") {
                        if (enabledLangs.length > 0 && filledLangs.length > 0 && !isEditMode) {
                            setPanelState("settled");
                        }
                        else if (isEditMode) {
                            setPanelState("selector");
                        }
                        else {
                            setPanelState("promo");
                        }
                    }
                }}
                currentLangs={filledLangs}
                onConfirm={handlePickerConfirm}
            />

            {/* ── Success toast (fixed at bottom of viewport) ───────────── */}
            {successAlertCount !== null && (
                <Box sx={successToastWrapperSx}>
                    {/* @ts-expect-error TruffleAlert's typed Pick<HTMLAttributes> incorrectly requires React 18 placeholder/onPointer props; remove when the library switches to Omit (cf. AttentionBox.d.ts which works). */}
                    <TruffleAlert
                        severity="success"
                        variant="filled"
                        CloseIconButtonProps={{ onClick: () => setSuccessAlertCount(null) }}
                    >
                        {successAlertCount} language{successAlertCount !== 1 ? "s" : ""} successfully applied.
                    </TruffleAlert>
                </Box>
            )}
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
    px: "6px",
    pt: "2px",
    pb: "3px",
    borderRadius: "4px",
    bgcolor: "info.light"
};

const iconBtnSx: SxProps<Theme> = {
    color: "text.secondary",
    p: "4px"
};

const iconSmSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important"
};

const iconXsSx: SxProps<Theme> = {
    fontSize: "14px !important",
    width: "14px !important",
    height: "14px !important"
};

const infoIconSx: SxProps<Theme> = {
    fontSize: "12px !important",
    width: "12px !important",
    height: "12px !important",
    color: "action.active"
};

const selectIconSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "primary.main",
    position: "absolute",
    right: "8px",
    pointerEvents: "none"
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
    flexDirection: "column",
    gap: 1.5,
    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
    borderRadius: "10px",
    p: 2
};

const promoThumbSx: SxProps<Theme> = {
    bgcolor: "secondary.dark",
    borderRadius: "8px",
    p: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 1.5,
    minHeight: 120
};

const promoThumbTitleSx: SxProps<Theme> = {
    color: "common.white",
    fontStyle: "italic"
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
    mt: 4,
    mb: 1
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
    gap: "4px"
};

// Container for language rows — 8px gap between each slot
const langRowsContainerSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 1
};

const sourceLangRenderValueSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    width: "100%",
    minWidth: 0
};

const autocompleteChevronSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "primary.main"
};

// ── Selector-state layout ─────────────────────────────────────────────────────

// Source language section inside the selector scroll area (scrolls with content)
const selectorSourceSectionSx: SxProps<Theme> = {
    pb: 2,
    mb: 0,
    borderBottom: "1px solid",
    borderColor: "divider"
};

// Heading row inside the selector card (h5 + optional "+ Add" button)
const selectorCardHeadingSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1
};

const addBtnSx: SxProps<Theme> = {
    flexShrink: 0
};

// Card wrapping the heading, language slots, and actions
const selectorCardSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    p: 2,
    mt: 2,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "10px"
};

// ── Dropdown menu item layouts ────────────────────────────────────────────────

const menuItemInnerSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%"
};

const gradientBtnSx: SxProps<Theme> = (theme) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    background: `linear-gradient(135deg, ${(theme as any).palette.brand.gradientMagentaBlue})`,
    color: theme.palette.common.white,
    "&:hover": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        background: `linear-gradient(135deg, ${(theme as any).palette.brand.gradientMagentaBlue})`,
        opacity: 0.92
    },
    "&.Mui-disabled": {
        background: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled
    }
});

// ── Picker state ──────────────────────────────────────────────────────────────

const pickerCardSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    p: 2,
    mt: 2,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "10px"
};

// ── Success toast (fixed bottom-center of viewport) ───────────────────────────
const successToastWrapperSx: SxProps<Theme> = {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: (theme) => theme.zIndex.snackbar
};

