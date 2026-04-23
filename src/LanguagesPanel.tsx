import { useState } from "react";
import {
    Box, Typography, IconButton, SvgIcon, Button,
    Select, MenuItem, FormControl, Checkbox, Tooltip,
    Autocomplete, TextField, InputAdornment, Divider
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark, faCircleInfo, faCircleQuestion, faCoins, faCheck,
    faTriangleExclamation, faPencil, faTrashCan,
    faAngleDown
} from "@fortawesome/pro-regular-svg-icons";
import { faPlay, faCircleCheck, faCircleXmark } from "@fortawesome/pro-solid-svg-icons";
import {
    AttentionBox,
    Label,
    TruffleLink
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import LanguagePickerDialog from "./LanguagePickerDialog";

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
    onEnabledLangsChange
}: {
    open: boolean;
    onClose: () => void;
    enabledLangs: string[];
    onEnabledLangsChange: (langs: string[]) => void;
}) {
    const [panelState, setPanelState] = useState<PanelState>("promo");
    // Source language (the original video narration language)
    const [sourceLanguage, setSourceLanguage] = useState("English (US)");
    // Confirmed selections — one language per row
    const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
    // Snapshot of what was sent to "apply"
    const [pendingLangs, setPendingLangs] = useState<string[]>([]);
    // Language picker dialog
    const [showPicker, setShowPicker] = useState(false);

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

    function handlePickerConfirm(langs: string[]) {
        const sorted = [...langs].sort((a, b) => a.localeCompare(b));
        setSelectedLangs(sorted.slice(0, MAX_LANGUAGES));
    }

    function handleSwapLang(oldLang: string, newLang: string) {
        setSelectedLangs(prev => prev.map(l => l === oldLang ? newLang : l));
    }

    function handleRemoveLang(name: string) {
        setSelectedLangs(prev => prev.filter(l => l !== name));
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
    // Source language only shows in promo and settled; selector has it inline, picker hides it
    const showSourceLang = !isTransient && panelState !== "selector" && panelState !== "picker";

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
                                    size="large"
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
                                            + Add
                                        </Button>
                                    )}
                                </Box>

                                {/* ── Language rows: filled slots + trailing multi-select (non-edit) ── */}
                                <Box sx={langRowsContainerSx}>
                                    {filledLangs.map((lang) => (
                                        <Box key={lang} sx={slotRowSx}>
                                            <Autocomplete
                                                value={LANGUAGE_OPTIONS.find(l => l.name === lang) ?? null}
                                                onChange={(_, newValue) => {
                                                    if (newValue) {
                                                        handleSwapLang(lang, newValue.name);
                                                    }
                                                    else {
                                                        handleRemoveLang(lang);
                                                    }
                                                }}
                                                options={LANGUAGE_OPTIONS.filter(l => l.name === lang || !filledLangs.includes(l.name))}
                                                getOptionLabel={(opt) => opt.name}
                                                isOptionEqualToValue={(opt, val) => opt.name === val.name}
                                                popupIcon={<SvgIcon sx={autocompleteChevronSx}><FontAwesomeIcon icon={faAngleDown} /></SvgIcon>}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        size="medium"
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <Box sx={flagCircleSmSx}>
                                                                        <Typography sx={{ fontSize: 13, lineHeight: 1 }}>
                                                                            {FLAG_BY_NAME[lang]}
                                                                        </Typography>
                                                                    </Box>
                                                                </InputAdornment>
                                                            )
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
                                        </Box>
                                    ))}

                                    {/* ── Trailing multi-select slot — only in non-edit mode ── */}
                                    {!isEditMode && filledLangs.length < MAX_LANGUAGES && (
                                        <Box sx={slotRowSx}>
                                            <FormControl size="medium" sx={{ flex: 1, minWidth: 0 }}>
                                                <Select
                                                    multiple
                                                    displayEmpty
                                                    value={filledLangs}
                                                    onChange={(e) => {
                                                        const val = e.target.value as string[];
                                                        setSelectedLangs(val.slice(0, MAX_LANGUAGES));
                                                    }}
                                                    IconComponent={() => (
                                                        <SvgIcon sx={selectIconSx}>
                                                            <FontAwesomeIcon icon={faAngleDown} />
                                                        </SvgIcon>
                                                    )}
                                                    renderValue={() => (
                                                        <Typography variant="body1" color="text.disabled" sx={{ fontStyle: "italic" }}>
                                                            Choose language
                                                        </Typography>
                                                    )}
                                                    MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                                                >
                                                    {LANGUAGE_OPTIONS.map(({ name, flag }) => {
                                                        const isChecked = filledLangs.includes(name);
                                                        const isDisabled = !isChecked && filledLangs.length >= MAX_LANGUAGES;
                                                        return (
                                                            <Tooltip
                                                                key={name}
                                                                title={isDisabled ? `You've reached the limit of ${MAX_LANGUAGES} languages` : ""}
                                                                placement="right"
                                                                arrow
                                                            >
                                                                <span>
                                                                    <MenuItem
                                                                        value={name}
                                                                        disabled={isDisabled}
                                                                        sx={multiSelectMenuItemSx}
                                                                    >
                                                                        <Checkbox checked={isChecked} size="medium" color="primary" sx={{ p: "2px", mr: 1 }} />
                                                                        <Typography sx={{ fontSize: 16, lineHeight: 1, mr: 1 }}>{flag}</Typography>
                                                                        <Typography variant="body1">{name}</Typography>
                                                                    </MenuItem>
                                                                </span>
                                                            </Tooltip>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                            <IconButton size="small" color="primary" sx={{ flexShrink: 0 }}>
                                                <SvgIcon sx={iconSmSx}><FontAwesomeIcon icon={faPlay} /></SvgIcon>
                                            </IconButton>
                                        </Box>
                                    )}
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
                                sx={isEditMode && !isRemovingAll ? applyChangesBtnSx : undefined}
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
                                {selectedCount === 0 ? (
                                    /* ── Empty state: invite to pick ── */
                                    <>
                                        <Typography variant="h5" sx={{ textAlign: "center" }}>
                                            Select up to {MAX_LANGUAGES} additional languages
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center" }}>
                                            Choose all at once. You can review their voices before enabling them
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="medium"
                                            color="primary"
                                            fullWidth
                                            onClick={() => setShowPicker(true)}
                                        >
                                            Pick languages
                                        </Button>
                                        <Button
                                            variant="text"
                                            size="large"
                                            color="primary"
                                            fullWidth
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
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
                                                + Add
                                            </Button>
                                        </Box>

                                        <Box sx={langRowsContainerSx}>
                                            {filledLangs.map((lang) => (
                                                <Box key={lang} sx={slotRowSx}>
                                                    <Autocomplete
                                                        value={LANGUAGE_OPTIONS.find(l => l.name === lang) ?? null}
                                                        onChange={(_, newValue) => {
                                                            if (newValue) {
                                                                handleSwapLang(lang, newValue.name);
                                                            }
                                                            else {
                                                                handleRemoveLang(lang);
                                                            }
                                                        }}
                                                        options={LANGUAGE_OPTIONS.filter(l => l.name === lang || !filledLangs.includes(l.name))}
                                                        getOptionLabel={(opt) => opt.name}
                                                        isOptionEqualToValue={(opt, val) => opt.name === val.name}
                                                        popupIcon={<SvgIcon sx={autocompleteChevronSx}><FontAwesomeIcon icon={faAngleDown} /></SvgIcon>}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                size="medium"
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <Box sx={flagCircleSmSx}>
                                                                                <Typography sx={{ fontSize: 13, lineHeight: 1 }}>
                                                                                    {FLAG_BY_NAME[lang]}
                                                                                </Typography>
                                                                            </Box>
                                                                        </InputAdornment>
                                                                    )
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
                                    sx={{ mb: 1.5 }}
                                >
                                    Enable translation
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
                        <Box sx={additionalLangsHeaderSx}>
                            <Typography variant="h5" sx={{ flex: 1 }}>
                                {enabledLangs.length} Additional languages
                            </Typography>
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
                onClose={() => setShowPicker(false)}
                currentLangs={filledLangs}
                onConfirm={handlePickerConfirm}
            />
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
    gap: "4px"
};

// Container for language rows — 8px gap between each slot
const langRowsContainerSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 1
};

// Prevent full-row highlight on checked items in multi-select
const multiSelectMenuItemSx: SxProps<Theme> = {
    "&.Mui-selected": { bgcolor: "transparent" },
    "&.Mui-selected:hover": { bgcolor: "action.hover" }
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

const applyChangesBtnSx: SxProps<Theme> = (theme) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    background: `linear-gradient(135deg, ${(theme as any).palette.brand.gradientMagentaBlue})`,
    "&:hover": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        background: `linear-gradient(135deg, ${(theme as any).palette.brand.gradientMagentaBlue})`,
        opacity: 0.92
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

