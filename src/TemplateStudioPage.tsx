import { useState } from "react";
import {
    Box, AppBar, Toolbar, Typography, SvgIcon, IconButton, Button,
    List, ListSubheader, ListItemButton, ListItemIcon, ListItemText,
    Divider, Accordion, AccordionSummary, AccordionDetails, TextField, Tooltip,
    Popover, MenuList, MenuItem
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPalette, faPaintbrush, faCircleUser, faPhotoFilm, faMusic,
    faWaveformLines, faDatabase, faInputText, faCropSimple, faLanguage,
    faComment, faArrowTurnLeft, faArrowTurnRight, faCloudCheck,
    faChevronDown, faChevronRight, faChevronLeft, faCircleQuestion,
    faMicrophone, faImages, faPlay as faPlayRegular,
    faArrowsRotate, faCheck
} from "@fortawesome/pro-regular-svg-icons";
import { faChevronRight as faChevronRightSolid, faPlay } from "@fortawesome/pro-solid-svg-icons";
import {
    TruffleAvatar, TruffleMenuPanel, combineSxProps
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import { NotificationBell } from "./NotificationsPanel";
import { OWNER_USER } from "./ManageAccessDialog";
import MediaLibraryPanel from "./MediaLibraryPanel";
import AvatarLibraryPanel from "./AvatarLibraryPanel";
import LanguagesPanel, { FLAG_BY_NAME, CODE_BY_NAME, MAX_LANGUAGES } from "./LanguagesPanel";


// ─── Fake scenes ──────────────────────────────────────────────────────────────
const SCENES = ["Intro", "Feature 1", "Feature 2", "CTA"];

// ─── Input Form Builder ───────────────────────────────────────────────────────
const FORM_FIELDS = ["Hero message", "Supporting copy", "CTA text", "Brand color", "Speaker name"];

function InputFormBuilder() {
    const [expanded, setExpanded] = useState<string | false>("Hero message");
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
            <Typography variant="body1" color="text.secondary" sx={formBuilderDescSx}>
                Set default response options for Contributors to customize this template
            </Typography>
            <Divider />
            {FORM_FIELDS.map((field) => (
                <Accordion
                    key={field}
                    expanded={expanded === field}
                    onChange={(_, isExpanded) => setExpanded(isExpanded ? field : false)}
                    disableGutters
                    elevation={0}
                    sx={accordionSx}
                >
                    <AccordionSummary
                        expandIcon={<SvgIcon sx={chevronIconSx}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>}
                        sx={accordionSummarySx}
                    >
                        <Box sx={accordionSummaryContentSx}>
                            <SvgIcon sx={inputFieldIconSx}><FontAwesomeIcon icon={faInputText} /></SvgIcon>
                            <Typography variant="body1" color="text.primary">{field}</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={accordionDetailsSx}>
                        <TextField size="small" fullWidth label="Default value" placeholder="Set a default response for contributors" />
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TemplateStudioPage({
    templateName = "Template name",
    onNavigateToTemplatePage,
    onNavigateToLibrary
}: {
    templateName?: string;
    onNavigateToTemplatePage?: () => void;
    onNavigateToLibrary?: () => void;
}) {
    const [activeNav, setActiveNav] = useState<string | null>(null);
    const [selectedScene, setSelectedScene] = useState(0);
    const [mediaLibOpen, setMediaLibOpen] = useState(false);
    const [avatarLibOpen, setAvatarLibOpen] = useState(false);
    const [langsOpen, setLangsOpen] = useState(false);
    const [mediaFolder, setMediaFolder] = useState<string | null>(null);
    const [enabledLangs, setEnabledLangs] = useState<string[]>([]);
    const [selectedDisplayLang, setSelectedDisplayLang] = useState("English");
    const [langMenuAnchor, setLangMenuAnchor] = useState<HTMLElement | null>(null);

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
                { icon: <SvgIcon fontSize="small"><FontAwesomeIcon icon={faComment} /></SvgIcon>, label: "Comments" }
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
                                        <SvgIcon fontSize="small" sx={{ color: "text.secondary", flexShrink: 0, mt: "1px" }}>
                                            <FontAwesomeIcon icon={faDatabase} />
                                        </SvgIcon>
                                        <Typography variant="body1" color="text.secondary">
                                            Select up to {MAX_LANGUAGES} additional languages to expand your video&apos;s reach
                                        </Typography>
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

                    {/* Scene timeline */}
                    <Box sx={sceneLineupSx}>
                        {/* Play bar */}
                        <Box sx={playBarSx}>
                            <Box sx={playBtnCircleSx}>
                                <SvgIcon sx={{ fontSize: "22px !important", color: "primary.main" }}>
                                    <FontAwesomeIcon icon={faPlay} />
                                </SvgIcon>
                            </Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: "0.4px", ml: 1.5 }}>
                                Scene {selectedScene + 1} / {SCENES.length}
                            </Typography>
                        </Box>

                        {/* Thumbnails row */}
                        <Box sx={thumbnailsRowSx}>
                            {SCENES.map((scene, i) => (
                                <Box
                                    key={scene}
                                    onClick={() => setSelectedScene(i)}
                                    sx={i === selectedScene ? combineSxProps(sceneThumbSx, sceneThumbSelectedSx) : sceneThumbSx}
                                >
                                    <Box sx={sceneThumbImgSx}>
                                        <Box sx={sceneThumbLeftSx}>
                                            <Typography sx={sceneThumbHeadingSx}>HEADING<br />PLACEHOLDER</Typography>
                                        </Box>
                                        <Box sx={sceneThumbRightSx} />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                                        {scene}
                                    </Typography>
                                    {i === 0 && (
                                        <Box sx={scenePlayBadgeSx}>
                                            <SvgIcon sx={scenePlayIconSx}><FontAwesomeIcon icon={faPlayRegular} /></SvgIcon>
                                        </Box>
                                    )}
                                </Box>
                            ))}
                            {/* Add scene */}
                            <Box sx={addSceneOuterSx}>
                                <Box sx={addSceneBtnSx}>
                                    <Typography variant="h4" color="primary.main">+</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Right: Input Form Builder */}
                <Box sx={rightPanelSx}>
                    <InputFormBuilder />
                </Box>
            </Box>

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

// ── Scene lineup — copy from StudioPage ───────────────────────────────────────
const sceneLineupSx: SxProps<Theme> = {
    flexShrink: 0,
    bgcolor: "background.paper",
    borderTop: 1,
    borderTopStyle: "solid",
    borderTopColor: "divider",
    px: 2,
    pt: 0,
    pb: "13px"
};

const playBarSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mb: 1.5
};

const playBtnCircleSx: SxProps<Theme> = {
    width: 36,
    height: 36,
    borderRadius: "50%",
    bgcolor: "other.editorBackground",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
};

const thumbnailsRowSx: SxProps<Theme> = {
    display: "flex",
    gap: "12px",
    overflowX: "auto",
    px: 2,
    pb: "2px"
};

const sceneThumbSx: SxProps<Theme> = {
    position: "relative",
    flexShrink: 0,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
};

const sceneThumbSelectedSx: SxProps<Theme> = {
    "& > *:first-of-type": {
        outline: "2px solid",
        outlineColor: "primary.main",
        borderRadius: "4px"
    }
};

const sceneThumbImgSx: SxProps<Theme> = {
    width: 110,
    height: 62,
    borderRadius: "4px",
    overflow: "hidden",
    display: "flex",
    bgcolor: "common.white"
};

const sceneThumbLeftSx: SxProps<Theme> = {
    width: "50%",
    bgcolor: "common.white",
    p: "4px",
    display: "flex",
    alignItems: "flex-start"
};

const sceneThumbHeadingSx: SxProps<Theme> = {
    fontFamily: "\"Inter\", sans-serif",
    fontWeight: 700,
    fontSize: "5px",
    color: "secondary.main",
    lineHeight: 1.2
};

const sceneThumbRightSx: SxProps<Theme> = { flex: 1, bgcolor: "grey.300" };

const scenePlayBadgeSx: SxProps<Theme> = {
    position: "absolute",
    bottom: 20,
    right: 4,
    bgcolor: "primary.main",
    borderRadius: "50%",
    width: 16,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const scenePlayIconSx: SxProps<Theme> = {
    fontSize: "8px !important",
    width: "8px !important",
    height: "8px !important",
    color: "common.white"
};

const addSceneOuterSx: SxProps<Theme> = {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 62,
    alignSelf: "flex-start"
};

const addSceneBtnSx: SxProps<Theme> = {
    width: 40,
    height: 62,
    border: "2px dashed",
    borderColor: "primary.main",
    borderRadius: "4px",
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
    display: "flex",
    gap: 1,
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
    overflow: "hidden"
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

const formBuilderDescSx: SxProps<Theme> = { px: 2, pb: 1.5, flexShrink: 0 };

const accordionSx: SxProps<Theme> = {
    borderBottom: "1px solid",
    borderColor: "divider",
    "&:before": { display: "none" }
};

const accordionSummarySx: SxProps<Theme> = {
    px: 2,
    minHeight: "44px !important",
    "& .MuiAccordionSummary-content": { my: "10px !important" }
};

const accordionSummaryContentSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    flex: 1
};

const inputFieldIconSx: SxProps<Theme> = {
    fontSize: "14px !important",
    width: "14px !important",
    height: "14px !important",
    color: "action.active",
    flexShrink: 0
};

const chevronIconSx: SxProps<Theme> = {
    fontSize: "14px !important",
    width: "14px !important",
    height: "14px !important"
};

const accordionDetailsSx: SxProps<Theme> = { px: 2, pb: 2 };
