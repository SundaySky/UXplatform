import { useState } from "react";
import {
    Box, AppBar, Toolbar, Typography, SvgIcon, IconButton, Button,
    List, ListSubheader, ListItemButton, ListItemIcon, ListItemText,
    Divider, Tooltip,
    Popover, MenuList, MenuItem,
    Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPalette, faPaintbrush, faCircleUser, faPhotoFilm, faMusic,
    faWaveformLines, faDatabase, faInputText, faCropSimple, faLanguage,
    faComment, faArrowTurnLeft, faArrowTurnRight, faCloudCheck,
    faChevronDown, faChevronRight, faChevronLeft, faCircleQuestion,
    faMicrophone, faImages, faImage,
    faArrowsRotate, faCheck, faArrowRightToLine, faArrowLeftToLine
} from "@fortawesome/pro-regular-svg-icons";
import { faChevronRight as faChevronRightSolid } from "@fortawesome/pro-solid-svg-icons";
import {
    TruffleAvatar, TruffleMenuPanel, TruffleLink
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import { NotificationBell } from "../../panels/NotificationsPanel";
import { OWNER_USER } from "../../dialogs/ManageAccessDialog";
import MediaLibraryPanel from "../../panels/MediaLibraryPanel";
import AvatarLibraryPanel from "../../panels/AvatarLibraryPanel";
import LanguagesPanel, { FLAG_BY_NAME, CODE_BY_NAME, MAX_LANGUAGES } from "../../panels/LanguagesPanel";
import { SceneThumbnail } from "../Studio/SceneThumbnails";
import CommentsPanel, { INITIAL_THREADS } from "../Studio/CommentsPanel";


// ─── Fake scenes ──────────────────────────────────────────────────────────────
const SCENES = ["Intro", "Feature 1", "Feature 2", "CTA"];

// ─── Input Form Builder ───────────────────────────────────────────────────────
const EMPTY_STATE_BULLETS = [
    "Add Input Fields in the Input Field Library tab",
    "Create personalized video content",
    "Build the Input Form Contributors use to customize the template"
];

// Filled-state input fields shown in task 7 scenario
const FILLED_INPUT_FIELDS: { label: string; type: "text" | "image" }[] = [
    { label: "Customer first name", type: "text" },
    { label: "Your first name", type: "text" },
    { label: "Your phone number where you can be reached", type: "text" },
    { label: "Your full name", type: "text" },
    { label: "Add product image", type: "image" },
    { label: "Add product description", type: "text" }
];

function InputFormBuilder({ filled = false }: { filled?: boolean }) {
    if (filled) {
        return (
            <Box sx={formBuilderRootSx}>
                <Box sx={formBuilderHeaderSx}>
                    <Box sx={formBuilderHeaderLeftSx}>
                        <Typography variant="h5" color="text.primary">Input Form Builder</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TruffleLink href="#" underline="hover" color="primary">
                            Expand all ({FILLED_INPUT_FIELDS.length})
                        </TruffleLink>
                        <Tooltip title="Create an Input Form and set default response options for Contributors to customize this template">
                            <SvgIcon sx={helpIconSx}><FontAwesomeIcon icon={faCircleQuestion} /></SvgIcon>
                        </Tooltip>
                    </Box>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ px: 2, pb: 1.5 }}>
                    Create an Input Form and set default response options for Contributors to customize this template
                </Typography>
                <Box sx={{ px: 1.5, pb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    {FILLED_INPUT_FIELDS.map((field, i) => (
                        <Accordion
                            key={i}
                            disableGutters
                            elevation={0}
                            sx={inputFieldAccordionSx}
                        >
                            <AccordionSummary
                                expandIcon={<SvgIcon sx={chevronIconSx}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>}
                                sx={inputFieldSummarySx}
                            >
                                <Box sx={inputFieldRowSx}>
                                    <SvgIcon sx={inputFieldIconSx}>
                                        <FontAwesomeIcon icon={field.type === "image" ? faImage : faInputText} />
                                    </SvgIcon>
                                    <Typography variant="body1" color="text.primary" sx={{ flex: 1 }}>
                                        {field.label}
                                        <Box component="span" sx={{ color: "primary.main", ml: "4px" }}>*</Box>
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails />
                        </Accordion>
                    ))}
                </Box>
            </Box>
        );
    }
    return (
        <Box sx={formBuilderRootSx}>
            <Box sx={formBuilderHeaderSx}>
                <Box sx={formBuilderHeaderLeftSx}>
                    <Typography variant="h5" color="text.primary">Input Form Builder</Typography>
                    <Tooltip title="Create an Input Form and set default response options for Contributors to customize this template">
                        <SvgIcon sx={helpIconSx}><FontAwesomeIcon icon={faCircleQuestion} /></SvgIcon>
                    </Tooltip>
                </Box>
            </Box>
            <Box sx={emptyStateBodySx}>
                {/* Illustration placeholder — Figma asset not yet shipped to /public */}
                <Box sx={emptyStateIllustrationPlaceholderSx} />
                <Typography variant="subtitle1" color="text.primary" sx={emptyStateTitleSx}>
                    Give Contributors the ability to customize videos
                </Typography>
                <Box sx={emptyStateListSx}>
                    {EMPTY_STATE_BULLETS.map((text, i) => (
                        <Box key={i} sx={emptyStateListItemSx}>
                            <TruffleAvatar size="small" text={String(i + 1)} />
                            <Typography variant="body1" color="text.primary" sx={{ flex: 1 }}>
                                {text}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TemplateStudioPage({
    templateName = "Template name",
    onNavigateToTemplatePage,
    onNavigateToLibrary,
    enabledLangs: enabledLangsProp,
    onEnabledLangsChange,
    selectedLangs,
    onSelectedLangsChange,
    openCommentsOnMount = false,
    onCommentsResubmitted,
    inputFormBuilderFilled = false
}: {
    templateName?: string;
    onNavigateToTemplatePage?: () => void;
    onNavigateToLibrary?: () => void;
    /** Controlled enabledLangs — lifted to App.tsx so selections persist between tasks. */
    enabledLangs?: string[];
    onEnabledLangsChange?: (langs: string[]) => void;
    /** Controlled in-progress language selections — also lifted so picks persist. */
    selectedLangs?: string[];
    onSelectedLangsChange?: (langs: string[]) => void;
    /** When true, render the comments panel open on first mount. */
    openCommentsOnMount?: boolean;
    /** Fired when the user clicks "Resubmit for approval" inside the comments panel. */
    onCommentsResubmitted?: () => void;
    /** When true (e.g. driven by task 7), render the Input Form Builder filled with sample fields. */
    inputFormBuilderFilled?: boolean;
}) {
    const [activeNav, setActiveNav] = useState<string | null>(null);
    const [selectedScene, setSelectedScene] = useState(0);
    const [mediaLibOpen, setMediaLibOpen] = useState(false);
    const [avatarLibOpen, setAvatarLibOpen] = useState(false);
    const [langsOpen, setLangsOpen] = useState(false);
    const [mediaFolder, setMediaFolder] = useState<string | null>(null);
    // Use controlled enabledLangs from App.tsx if provided, else local fallback.
    const [internalEnabledLangs, setInternalEnabledLangs] = useState<string[]>([]);
    const enabledLangs = enabledLangsProp ?? internalEnabledLangs;
    const setEnabledLangs = (langs: string[]) => {
        if (onEnabledLangsChange) {
            onEnabledLangsChange(langs);
        }
        else {
            setInternalEnabledLangs(langs);
        }
    };
    const [selectedDisplayLang, setSelectedDisplayLang] = useState("English");
    const [formBuilderCollapsed, setFormBuilderCollapsed] = useState(false);
    const [langMenuAnchor, setLangMenuAnchor] = useState<HTMLElement | null>(null);
    const [commentsOpen, setCommentsOpen] = useState(openCommentsOnMount);
    const [commentThreads, setCommentThreads] = useState(INITIAL_THREADS);

    const closeAllPanels = () => {
        setMediaLibOpen(false);
        setAvatarLibOpen(false);
        setLangsOpen(false);
    };

    const NAV_SECTIONS = [
        {
            section: "STYLE",
            items: [
                { icon: <SvgIcon fontSize="small"><FontAwesomeIcon icon={faPalette} /></SvgIcon>, label: "Brand" },
                { icon: <SvgIcon fontSize="small"><FontAwesomeIcon icon={faPaintbrush} /></SvgIcon>, label: "Theme" },
                { icon: <SvgIcon fontSize="small"><FontAwesomeIcon icon={faCircleUser} /></SvgIcon>, label: "Avatar", onClickOverride: () => {
                    if (activeNav === "Avatar" && avatarLibOpen) {
                        setAvatarLibOpen(false); setActiveNav(null); 
                    }
                    else {
                        closeAllPanels(); setAvatarLibOpen(true); setActiveNav("Avatar"); 
                    }
                } }
            ]
        },
        {
            section: "LIBRARIES",
            items: [
                { icon: <SvgIcon fontSize="small"><FontAwesomeIcon icon={faPhotoFilm} /></SvgIcon>, label: "Media", onClickOverride: () => {
                    if (activeNav === "Media" && mediaLibOpen) {
                        setMediaLibOpen(false); setActiveNav(null); 
                    }
                    else {
                        closeAllPanels(); setMediaLibOpen(true); setMediaFolder(null); setActiveNav("Media"); 
                    }
                } },
                { icon: <SvgIcon fontSize="small"><FontAwesomeIcon icon={faMusic} /></SvgIcon>, label: "Music" },
                { icon: <SvgIcon fontSize="small"><FontAwesomeIcon icon={faWaveformLines} /></SvgIcon>, label: "Voice" },
                { icon: <SvgIcon fontSize="small"><FontAwesomeIcon icon={faDatabase} /></SvgIcon>, label: "Data" },
                { icon: <SvgIcon fontSize="small"><FontAwesomeIcon icon={faInputText} /></SvgIcon>, label: "Input fields" }
            ]
        },
        {
            section: "SETTINGS",
            items: [
                { icon: <SvgIcon fontSize="small"><FontAwesomeIcon icon={faCropSimple} /></SvgIcon>, label: "Aspect ratio" },
                { icon: <SvgIcon fontSize="small"><FontAwesomeIcon icon={faLanguage} /></SvgIcon>, label: "Languages", onClickOverride: () => {
                    if (activeNav === "Languages" && langsOpen) {
                        setLangsOpen(false); setActiveNav(null); 
                    }
                    else {
                        closeAllPanels(); setLangsOpen(true); setActiveNav("Languages"); 
                    }
                } }
            ]
        },
        {
            section: "APPROVAL",
            items: [
                { icon: <SvgIcon fontSize="small"><FontAwesomeIcon icon={faComment} /></SvgIcon>, label: "Comments", onClickOverride: () => {
                    if (activeNav === "Comments" && commentsOpen) {
                        setCommentsOpen(false); setActiveNav(null);
                    }
                    else {
                        closeAllPanels(); setCommentsOpen(true); setActiveNav("Comments");
                    }
                } }
            ]
        }
    ];

    return (
        <Box sx={pageRootSx}>

            {/* ── AppBar — identical to StudioPage ───────────────────────────── */}
            <AppBar position="static" color="secondary" elevation={0} sx={studioAppBarSx}>
                <Toolbar variant="dense" disableGutters sx={studioToolbarSx}>

                    {/* Left — logo + template name + save indicator + language badge */}
                    <Box sx={studioAppBarLeftSx}>
                        <Box onClick={onNavigateToLibrary} sx={studioLogoClickableSx}>
                            <Box component="img" src="" alt="sundaysky-logo" sx={studioLogoImgSx} />
                        </Box>
                        <SvgIcon sx={cloudCheckIconSx}>
                            <FontAwesomeIcon icon={faCloudCheck} />
                        </SvgIcon>
                        <Typography variant="h4" noWrap sx={{ color: "inherit" }}>
                            {templateName}
                        </Typography>

                        {/* Language picker badge */}
                        <Box sx={studioLangBadgeSx} onClick={(e) => setLangMenuAnchor(e.currentTarget)}>
                            <Typography variant="caption">
                                {selectedDisplayLang === "English" ? "🇺🇸" : FLAG_BY_NAME[selectedDisplayLang]}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "inherit" }}>
                                {selectedDisplayLang === "English" ? "EN" : CODE_BY_NAME[selectedDisplayLang]}
                            </Typography>
                            <SvgIcon sx={langChevronSx}>
                                <FontAwesomeIcon icon={faChevronDown} />
                            </SvgIcon>
                        </Box>

                        <Popover
                            anchorEl={langMenuAnchor}
                            open={Boolean(langMenuAnchor)}
                            onClose={() => setLangMenuAnchor(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                            transformOrigin={{ vertical: "top", horizontal: "left" }}
                            slotProps={{ paper: { sx: langDropdownPaperSx } }}
                        >
                            {enabledLangs.length === 0 ? (
                                <Box sx={{ p: 1.5 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        startIcon={<SvgIcon sx={langBtnIconSx}><FontAwesomeIcon icon={faArrowsRotate} /></SvgIcon>}
                                        onClick={() => {
                                            setLangMenuAnchor(null); setLangsOpen(true); setActiveNav("Languages"); 
                                        }}
                                    >
                                        Change narration source language
                                    </Button>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={langInfoCardSx}>
                                        <SvgIcon fontSize="small" sx={{ color: "primary.main", flexShrink: 0, mt: "1px" }}>
                                            <FontAwesomeIcon icon={faDatabase} />
                                        </SvgIcon>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body1" color="text.primary">
                                                Select up to {MAX_LANGUAGES} additional languages to expand your video&apos;s reach
                                            </Typography>
                                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
                                                <TruffleLink href="#" underline="hover" color="primary">
                                                    Label
                                                </TruffleLink>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <MenuList sx={{ py: 0.5 }}>
                                    {[{ name: "English", flag: "🇺🇸" }, ...enabledLangs.map(name => ({ name, flag: FLAG_BY_NAME[name] }))].map(({ name, flag }) => (
                                        <MenuItem key={name} onClick={() => {
                                            setSelectedDisplayLang(name); setLangMenuAnchor(null); 
                                        }}>
                                            <Box sx={langMenuItemSx}>
                                                <Box sx={langFlagCircleSx}>
                                                    <Typography sx={{ fontSize: 14, lineHeight: 1 }}>{flag}</Typography>
                                                </Box>
                                                <Typography variant="body1" sx={{ flex: 1 }}>{name}</Typography>
                                                {selectedDisplayLang === name && (
                                                    <SvgIcon sx={langCheckSx}>
                                                        <FontAwesomeIcon icon={faCheck} />
                                                    </SvgIcon>
                                                )}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            )}
                        </Popover>
                    </Box>

                    {/* Right — undo/redo + avatar + bell + Template Page button */}
                    <Box sx={studioAppBarRightSx}>
                        <IconButton size="medium" color="inherit">
                            <SvgIcon fontSize="small"><FontAwesomeIcon icon={faArrowTurnLeft} /></SvgIcon>
                        </IconButton>
                        <IconButton size="medium" color="inherit">
                            <SvgIcon fontSize="small"><FontAwesomeIcon icon={faArrowTurnRight} /></SvgIcon>
                        </IconButton>
                        <Divider orientation="vertical" flexItem sx={studioDividerSx} />
                        <TruffleAvatar text={OWNER_USER.initials} size="small" />
                        <NotificationBell dark />
                        <Divider orientation="vertical" flexItem sx={studioDividerSx} />
                        <Button
                            variant="contained"
                            color="gradient"
                            size="medium"
                            endIcon={<SvgIcon sx={chevronRightSmallSx}><FontAwesomeIcon icon={faChevronRightSolid} /></SvgIcon>}
                            onClick={() => onNavigateToTemplatePage?.()}
                            sx={templatePageBtnSx}
                        >
                            Template page
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ── Content area ───────────────────────────────────────────────── */}
            <Box sx={studioContentAreaSx}>

                {/* Left nav — identical to StudioPage */}
                <TruffleMenuPanel variant="outlined" sx={studioLeftNavSx}>
                    {NAV_SECTIONS.map(({ section, items }) => (
                        <List key={section} disablePadding>
                            <ListSubheader disableSticky sx={navSubheaderSx}>
                                {section}
                            </ListSubheader>
                            {items.map(({ icon, label, onClickOverride }: { icon: React.ReactNode; label: string; onClickOverride?: () => void }) => (
                                <ListItemButton
                                    key={label}
                                    dense
                                    selected={activeNav === label}
                                    onClick={() => {
                                        if (onClickOverride) {
                                            onClickOverride();
                                        }
                                        else {
                                            closeAllPanels();
                                            setActiveNav(prev => prev === label ? null : label);
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={navItemIconSx}>{icon}</ListItemIcon>
                                    <ListItemText
                                        primary={label}
                                        sx={studioNavItemTextSx}
                                        primaryTypographyProps={{ variant: "body2", color: activeNav === label ? "text.primary" : "text.secondary" }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    ))}
                </TruffleMenuPanel>

                {/* Media Library Panel */}
                <MediaLibraryPanel
                    open={mediaLibOpen}
                    onClose={() => {
                        setMediaLibOpen(false); setActiveNav(null); 
                    }}
                    folder={mediaFolder}
                    onOpenFolder={name => setMediaFolder(name)}
                    onCloseFolder={() => setMediaFolder(null)}
                />

                {/* Avatar Library Panel */}
                <AvatarLibraryPanel
                    open={avatarLibOpen}
                    onClose={() => {
                        setAvatarLibOpen(false); setActiveNav(null); 
                    }}
                />

                {/* Languages Panel */}
                <LanguagesPanel
                    open={langsOpen}
                    onClose={() => {
                        setLangsOpen(false); setActiveNav(null);
                    }}
                    enabledLangs={enabledLangs}
                    onEnabledLangsChange={(langs) => {
                        setEnabledLangs(langs);
                        if (selectedDisplayLang !== "English" && !langs.includes(selectedDisplayLang)) {
                            setSelectedDisplayLang("English");
                        }
                    }}
                    selectedLangs={selectedLangs}
                    onSelectedLangsChange={onSelectedLangsChange}
                />

                {/* Stage */}
                <Box sx={stageContainerSx}>

                    {/* Live preview area */}
                    <Box sx={livePreviewAreaSx}>

                        {/* Prev arrow */}
                        <IconButton
                            disabled={selectedScene === 0}
                            onClick={() => setSelectedScene(s => Math.max(0, s - 1))}
                            size="medium"
                            color="primary"
                            sx={{ flexShrink: 0, mx: "4px" }}
                        >
                            <SvgIcon><FontAwesomeIcon icon={faChevronLeft} /></SvgIcon>
                        </IconButton>

                        {/* Canvas */}
                        <Box sx={canvasWrapperSx}>
                            <Box sx={canvasSx}>
                                {/* Left template half */}
                                <Box sx={canvasLeftHalfSx}>
                                    <Box sx={canvasAccentLineSx} />
                                    <Box sx={canvasTextOverlaySx}>
                                        <Typography sx={canvasHeadingSx}>
                                            HEADING<br />PLACEHOLDER
                                        </Typography>
                                        <Typography sx={canvasSubheadingSx}>
                                            Sub-heading Placeholder
                                        </Typography>
                                        <Typography sx={canvasFootnoteSx}>
                                            Footnote Placeholder
                                        </Typography>
                                    </Box>
                                </Box>
                                {/* Right media half */}
                                <Box sx={canvasRightHalfSx}>
                                    <SvgIcon sx={dragMediaIconSx}>
                                        <FontAwesomeIcon icon={faImages} />
                                    </SvgIcon>
                                    <Typography variant="caption" sx={{ color: "action.disabled", letterSpacing: "0.15px" }}>
                                        Drag media here
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Next arrow */}
                        <IconButton
                            disabled={selectedScene === SCENES.length - 1}
                            onClick={() => setSelectedScene(s => Math.min(SCENES.length - 1, s + 1))}
                            size="medium"
                            color="primary"
                            sx={{ flexShrink: 0, mx: "4px" }}
                        >
                            <SvgIcon><FontAwesomeIcon icon={faChevronRight} /></SvgIcon>
                        </IconButton>
                    </Box>

                    {/* Narration bar */}
                    <Box sx={narrationBarSx}>
                        <Box sx={narrationAvatarSx}>
                            <SvgIcon sx={{ fontSize: "15px !important", color: "text.secondary" }}>
                                <FontAwesomeIcon icon={faMicrophone} />
                            </SvgIcon>
                        </Box>
                        <Typography variant="body1" sx={{ color: "text.secondary", flex: 1 }}>
                            Add narration…
                        </Typography>
                        <Typography variant="body1" sx={{ color: "text.secondary", letterSpacing: "0.4px" }}>
                            ~0:12
                        </Typography>
                    </Box>

                    {/* Scene timeline — matches Studio page pattern */}
                    <Box sx={sceneLineupSx}>
                        {/* Play button straddling the top border */}
                        <Box sx={previewPlayBtnWrapperSx}>
                            <Tooltip title="Preview video" placement="top" arrow>
                                <span>
                                    <IconButton sx={previewPlayIconSx}>
                                        <Box sx={previewPlayIconContentSx}>
                                            <Box component="img" src="/newNavLogoTriangle.svg" alt="play" sx={previewPlayIconImgSx} />
                                        </Box>
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>

                        {/* Scene N/M counter */}
                        <Box sx={sceneCounterRowSx}>
                            <Box sx={{ flex: 1 }} />
                            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", color: "text.primary" }}>
                                <Typography variant="body2">Scene {selectedScene + 1}/{SCENES.length}</Typography>
                            </Box>
                        </Box>
                        <Divider />

                        {/* Thumbnails row */}
                        <Box sx={{ position: "relative" }}>
                            <Box sx={thumbnailsInnerRowSx}>
                                {SCENES.map((_scene, i) => (
                                    <SceneThumbnail
                                        key={i}
                                        index={i}
                                        selected={i === selectedScene}
                                        onClick={() => setSelectedScene(i)}
                                    />
                                ))}
                                {/* Add scene */}
                                <Box sx={addSceneOuterSx}>
                                    <Tooltip title="Add Scene" placement="top" arrow>
                                        <Box sx={addSceneBtnSx}>
                                            <Box component="img" src="/icons/plus.svg" sx={{ width: 20, height: 20 }} />
                                        </Box>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Right: Input Form Builder */}
                <Box sx={formBuilderWrapperSx}>
                    <Box
                        sx={collapseButtonSx}
                        onClick={() => setFormBuilderCollapsed(c => !c)}
                        role="button"
                        aria-label={formBuilderCollapsed ? "Expand Input Form Builder" : "Collapse Input Form Builder"}
                    >
                        <SvgIcon sx={collapseIconSx}>
                            <FontAwesomeIcon icon={formBuilderCollapsed ? faArrowLeftToLine : faArrowRightToLine} />
                        </SvgIcon>
                    </Box>
                    <Box sx={formBuilderCollapsed
                        ? { ...rightPanelSx, ...rightPanelCollapsedSx } as SxProps<Theme>
                        : rightPanelSx}>
                        <InputFormBuilder filled={inputFormBuilderFilled} />
                    </Box>
                </Box>
            </Box>

            {/* Comments panel — slides over from the right when opened (e.g. from
                the Template page's "View N comments in Studio" button) */}
            <CommentsPanel
                open={commentsOpen}
                onClose={() => setCommentsOpen(false)}
                threads={commentThreads}
                setThreads={setCommentThreads}
                onRequestApproval={() => {
                    // Move all unresolved comments to resolved (they "moved" to History)
                    setCommentThreads(prev => prev.map(t => ({
                        ...t,
                        comments: t.comments.map(c => ({ ...c, resolved: true, checkedNow: false }))
                    })));
                    onCommentsResubmitted?.();
                }}
            />

        </Box>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageRootSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    overflow: "hidden"
};

// ── AppBar — copy from StudioPage ─────────────────────────────────────────────
const studioAppBarSx: SxProps<Theme> = {
    flexShrink: 0,
    borderBottom: "1px solid",
    borderBottomColor: (theme) => alpha(theme.palette.common.white, 0.1)
};

const studioToolbarSx: SxProps<Theme> = {
    height: 56,
    px: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
};

const studioAppBarLeftSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 2
};

const studioLogoClickableSx: SxProps<Theme> = {
    width: 56,
    height: 56,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
};

const studioLogoImgSx: SxProps<Theme> = { width: 40, height: 40, objectFit: "contain" };

const cloudCheckIconSx: SxProps<Theme> = {
    fontSize: "14px !important",
    width: "14px !important",
    height: "14px !important",
    color: (theme) => alpha(theme.palette.common.white, 0.4)
};

const studioAppBarRightSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    pr: 2
};

const studioDividerSx: SxProps<Theme> = {
    borderColor: (theme) => alpha(theme.palette.common.white, 0.2),
    mx: 0.5,
    alignSelf: "center",
    height: 20
};

const chevronRightSmallSx: SxProps<Theme> = {
    fontSize: "11px !important",
    width: "11px !important",
    height: "11px !important"
};

const templatePageBtnSx: SxProps<Theme> = { whiteSpace: "nowrap" };

// ── Content area ──────────────────────────────────────────────────────────────
const studioContentAreaSx: SxProps<Theme> = {
    flex: 1,
    display: "flex",
    overflow: "hidden"
};

// ── Left nav — copy from StudioPage ──────────────────────────────────────────
const studioLeftNavSx: SxProps<Theme> = {
    width: 136,
    flexShrink: 0,
    overflowY: "auto",
    pl: 0,
    pt: 0,
    pb: 0,
    alignSelf: "stretch"
};

const navSubheaderSx: SxProps<Theme> = {
    color: "text.secondary",
    pt: 2
};

const navItemIconSx: SxProps<Theme> = {
    minWidth: "auto"
};

const studioNavItemTextSx: SxProps<Theme> = {
    my: 0,
    "& .MuiListItemText-primary": { whiteSpace: "normal", wordBreak: "break-word" }
};

// ── Stage / canvas area ───────────────────────────────────────────────────────
const stageContainerSx: SxProps<Theme> = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    bgcolor: "other.editorBackground"
};

const livePreviewAreaSx: SxProps<Theme> = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    px: 1,
    py: 2
};

const canvasWrapperSx: SxProps<Theme> = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%"
};

const canvasSx: SxProps<Theme> = (theme) => ({
    width: "100%",
    maxWidth: 720,
    aspectRatio: "16/9",
    bgcolor: "common.white",
    borderRadius: "8px",
    overflow: "hidden",
    display: "flex",
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: `0px 2px 12px ${alpha(theme.palette.secondary.main, 0.1)}`
});

const canvasLeftHalfSx: SxProps<Theme> = {
    width: "50%",
    flexShrink: 0,
    bgcolor: "common.white",
    position: "relative",
    display: "flex",
    flexDirection: "column"
};

const canvasAccentLineSx: SxProps<Theme> = { height: 5, bgcolor: "secondary.light", width: "100%" };

const canvasTextOverlaySx: SxProps<Theme> = {
    p: "5%",
    display: "flex",
    flexDirection: "column",
    gap: "4%",
    flex: 1
};

const canvasHeadingSx: SxProps<Theme> = {
    fontFamily: "\"Inter\", sans-serif",
    fontWeight: 700,
    fontSize: "clamp(10px, 3vw, 28px)",
    color: "secondary.main",
    lineHeight: 1.2
};

const canvasSubheadingSx: SxProps<Theme> = {
    fontFamily: "\"Open Sans\", sans-serif",
    fontWeight: 400,
    fontSize: "clamp(7px, 1.2vw, 14px)",
    color: "text.secondary",
    lineHeight: 1.4
};

const canvasFootnoteSx: SxProps<Theme> = {
    fontFamily: "\"Open Sans\", sans-serif",
    fontWeight: 400,
    fontSize: "clamp(5px, 0.8vw, 10px)",
    color: "text.disabled",
    mt: "auto"
};

const canvasRightHalfSx: SxProps<Theme> = {
    flex: 1,
    bgcolor: "grey.200",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 1
};

const dragMediaIconSx: SxProps<Theme> = {
    fontSize: "36px !important",
    width: "36px !important",
    height: "36px !important",
    color: "action.disabled"
};

// ── Narration bar — copy from StudioPage ──────────────────────────────────────
const narrationBarSx: SxProps<Theme> = {
    mx: 3,
    mb: 1.5,
    height: 40,
    bgcolor: "background.paper",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    px: 2,
    gap: 1.5,
    flexShrink: 0
};

const narrationAvatarSx: SxProps<Theme> = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    bgcolor: "other.editorBackground",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
};

// ── Scene lineup — matches StudioPage.tsx:1878-1947 ───────────────────────────
const sceneLineupSx: SxProps<Theme> = {
    bgcolor: "background.paper",
    borderTop: 1,
    borderTopStyle: "solid",
    borderTopColor: "divider",
    px: 2,
    pt: 0,
    pb: "13px",
    flexShrink: 0,
    position: "relative"
};

const previewPlayBtnWrapperSx: SxProps<Theme> = {
    position: "absolute",
    top: "-24px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const previewPlayIconSx: SxProps<Theme> = (theme: any) => ({
    width: "48px",
    height: "48px",
    color: "other.editorBackground",
    backgroundColor: "primary.dark",
    borderColor: "other.editorBackground",
    borderStyle: "solid",
    borderWidth: "8px",
    borderRadius: "50%",
    padding: "8px 15px",
    mb: "6px",
    transition: "all .25s ease-out",
    position: "relative",
    backgroundClip: "padding-box",
    "&::before": {
        content: "''",
        borderRadius: "32px",
        position: "absolute",
        left: 0, right: 0, top: 0, bottom: 0,
        backgroundImage: `linear-gradient(135deg,${theme.palette.brand.gradientMagentaBlue})`,
        opacity: 1,
        transition: "all .25s ease-out"
    },
    "&:hover": {
        backgroundColor: "primary.dark",
        borderColor: "action.hover",
        transform: "scale(1.1)",
        "&::before": {
            backgroundImage: "none",
            backgroundColor: "primary.dark"
        }
    }
});

const previewPlayIconContentSx: SxProps<Theme> = {
    ml: "4px",
    width: "12px",
    height: "15px",
    backgroundColor: "common.white",
    clipPath: "polygon(0 0, 0 100%, 100% 50%)",
    transition: "all .25s ease-out"
};

const previewPlayIconImgSx: SxProps<Theme> = {
    width: "15px",
    height: "17px",
    transform: "rotate(180deg) scale(2) translateX(-6px)",
    transition: "all .15s .15s ease-out"
};

const sceneCounterRowSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: "32px"
};

const thumbnailsInnerRowSx: SxProps<Theme> = {
    display: "flex",
    gap: "12px",
    overflowX: "auto",
    padding: "4px 6px 2px 4px"
};

const addSceneOuterSx: SxProps<Theme> = {
    position: "sticky",
    right: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: "common.white",
    zIndex: 20,
    ml: "2px"
};

const addSceneBtnSx: SxProps<Theme> = {
    width: 40,
    height: 62,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    "&:hover": { bgcolor: "action.hover" }
};

// ── Language selector styles ──────────────────────────────────────────────────
const studioLangBadgeSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    px: 1,
    py: "4px",
    borderRadius: "6px",
    border: "1px solid",
    borderColor: (theme) => alpha(theme.palette.common.white, 0.2),
    cursor: "pointer",
    color: (theme) => alpha(theme.palette.common.white, 0.85),
    "&:hover": { borderColor: (theme) => alpha(theme.palette.common.white, 0.4) }
};

const langChevronSx: SxProps<Theme> = {
    fontSize: "10px !important",
    width: "10px !important",
    height: "10px !important",
    color: "inherit",
    ml: "2px"
};

const langDropdownPaperSx: SxProps<Theme> = {
    minWidth: 260,
    mt: "4px"
};

const langBtnIconSx: SxProps<Theme> = {
    fontSize: "14px !important",
    width: "14px !important",
    height: "14px !important"
};

const langInfoCardSx: SxProps<Theme> = {
    bgcolor: "primary.light",
    borderRadius: 1,
    p: 1.5,
    display: "flex",
    gap: 1.5,
    alignItems: "flex-start"
};

const langMenuItemSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    width: "100%"
};

const langFlagCircleSx: SxProps<Theme> = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    bgcolor: "action.hover",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
};

const langCheckSx: SxProps<Theme> = {
    fontSize: "13px !important",
    width: "13px !important",
    height: "13px !important",
    color: "primary.main"
};

// ── Right panel ───────────────────────────────────────────────────────────────
const rightPanelSx: SxProps<Theme> = {
    width: 300,
    flexShrink: 0,
    bgcolor: "background.paper",
    borderLeft: "1px solid",
    borderColor: "divider",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: "width 250ms ease"
};

const rightPanelCollapsedSx: SxProps<Theme> = {
    width: 0,
    borderLeft: 0
};

// ── Input Form Builder ─────────────────────────────────────────────────────────
const formBuilderRootSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden"
};

const formBuilderHeaderSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 2,
    pt: 2,
    pb: 1,
    flexShrink: 0
};

const formBuilderHeaderLeftSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1
};

const helpIconSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "action.active",
    cursor: "pointer"
};

// ── Filled-state input field accordions ───────────────────────────────────────
const inputFieldAccordionSx: SxProps<Theme> = {
    bgcolor: "action.hover",
    borderRadius: 1,
    "&:before": { display: "none" }
};

const inputFieldSummarySx: SxProps<Theme> = {
    px: 2,
    minHeight: "48px !important",
    "& .MuiAccordionSummary-content": { my: "8px !important" }
};

const inputFieldRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    flex: 1
};

const inputFieldIconSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "action.active",
    flexShrink: 0
};

const chevronIconSx: SxProps<Theme> = {
    fontSize: "14px !important",
    width: "14px !important",
    height: "14px !important",
    color: "action.active"
};

// ── Empty state ────────────────────────────────────────────────────────────────
const emptyStateBodySx: SxProps<Theme> = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    px: 2,
    py: 4
};

// Placeholder for the Figma illustration asset (Figma node "imgVector1" — not yet
// shipped to /public). Sized to match the Figma design. Replace with <img src=... />
// once the asset is added.
const emptyStateIllustrationPlaceholderSx: SxProps<Theme> = {
    width: 242,
    height: 156,
    bgcolor: "action.hover",
    borderRadius: 2
};

const emptyStateTitleSx: SxProps<Theme> = {
    textAlign: "center"
};

const emptyStateListSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    width: "100%"
};

const emptyStateListItemSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    py: "4px"
};

// ── Collapse button (left-pill IconButton outside the right panel) ────────────
const formBuilderWrapperSx: SxProps<Theme> = {
    position: "relative",
    display: "flex",
    flexShrink: 0
};

const collapseButtonSx: SxProps<Theme> = {
    position: "absolute",
    top: 16,
    left: -32,
    width: 32,
    height: 32,
    bgcolor: "background.paper",
    border: "1px solid",
    borderColor: "divider",
    borderRight: 0,
    borderRadius: "100px 0 0 100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 1,
    "&:hover": { bgcolor: "action.hover" }
};

const collapseIconSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "action.active"
};
