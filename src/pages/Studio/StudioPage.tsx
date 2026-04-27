import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import type { SxProps, Theme } from "@mui/material";
import {
    AppBar, Box, Typography, IconButton, Button,
    Badge,
    Snackbar, Alert, Divider, Menu, MenuItem, MenuList, Popover,
    SvgIcon, Toolbar, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader,
    useTheme
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTurnLeft, faArrowTurnRight, faLock, faPalette, faMicrophone, faDatabase, faLanguage, faComment, faCircleInfo, faTableLayout, faEllipsisVertical, faPlus, faListUl, faTableColumns, faXmark, faImage, faChevronDown, faCheck, faArrowsRotate } from "@fortawesome/pro-regular-svg-icons";
import { faChevronLeft, faChevronRight, faCloudCheck } from "@fortawesome/pro-solid-svg-icons";
import { TruffleAvatar, TruffleMenuPanel, combineSxProps } from "@sundaysky/smartvideo-hub-truffle-component-library";
import { NotificationBell, type NotificationItem } from "../../panels/NotificationsPanel";
import MediaLibraryPanel from "../../panels/MediaLibraryPanel";
import AvatarLibraryPanel from "../../panels/AvatarLibraryPanel";
import LanguagesPanel, { FLAG_BY_NAME, CODE_BY_NAME, MAX_LANGUAGES } from "../../panels/LanguagesPanel";
import VideoPermissionDialog, { type VideoPermissionSettings } from "../../dialogs/VideoPermissionDialog";
import { OWNER_USER } from "../../dialogs/ManageAccessDialog";
import SceneLibraryDialog from "../../dialogs/SceneLibraryDialog";

// ─── Local imports for extracted Studio components ──────────────────────────
import PlaceholderToolbar from "./PlaceholderToolbar";
import ButtonPlaceholderToolbar from "./ButtonPlaceholderToolbar";
import BulletPlaceholderToolbar from "./BulletPlaceholderToolbar";
import EditHeadingDialog from "./EditHeadingDialog";
import EditBulletDialog from "./EditBulletDialog";
import CommentsPanel, { type CommentThread } from "./CommentsPanel";
import { SceneThumbnail, PlaceholderIcon, CustomSceneThumbnail } from "./SceneThumbnails";

const IMG_THUMB = "/thumb.svg";
// ─── Per-scene content lookup ─────────────────────────────────────────────────
function sceneContentFor(title?: string): [string, string][] {
    const map: Record<string, [string, string][]> = {
        "Stay Safe During Missile Threats": [
            ["Find Your Nearest Shelter", "Know your safest options before an alert sounds"],
            ["When the Siren Sounds", "Drop, take cover, and protect your head immediately"],
            ["After the All-Clear", "Wait for official confirmation before leaving your shelter"]
        ],
        "Recent TTS Pronunciation Advancements": [
            ["Improved Accuracy", "New models achieve 97% accuracy on complex terminology"],
            ["Natural Voice Flow", "Context-aware prosody creates more human-like speech"],
            ["Try It Yourself", "Access the updated TTS toolkit in your dashboard today"]
        ],
        "Prepare for Winter Fun!": [
            ["Gear Up Together", "Essential equipment for every age and skill level"],
            ["Safety First", "Check conditions and prep your first-aid kit before heading out"],
            ["Make Memories", "Capture the moments that last a lifetime"]
        ],
        "Understanding the American-Israel-Iran Conflict: Peace & Safety": [
            ["Key Players & Interests", "A closer look at the stakeholders shaping the region"],
            ["The Path to De-escalation", "Diplomatic efforts and international frameworks in play"],
            ["What It Means for You", "How regional stability affects global security and daily life"]
        ],
        "Discover Tel Aviv's Scenic Parks": [
            ["Yarkon Park", "3,800 dunams of greenery in the heart of the city"],
            ["Urban Wildlife", "Meet the birds, fish, and flora that call these parks home"],
            ["Plan Your Visit", "Opening hours, facilities, and the best times to explore"]
        ],
        "Onboarding Steps": [
            ["Set Up Your Profile", "Personalise your account and team settings in minutes"],
            ["Explore Key Features", "A guided tour of the tools you'll use every day"],
            ["You're Ready to Go", "Connect with your team and start your first project"]
        ]
    };
    return map[title ?? ""] ?? [
        ["Scene Overview", "Key insights for this section of your video"],
        ["Deeper Dive", "Supporting details and context worth highlighting"],
        ["Key Takeaway", "What your audience should remember most"]
    ];
}

// ─── Studio page ──────────────────────────────────────────────────────────────
interface Props {
  videoTitle: string
  initialHeadingText?: string
  initialSubheadingText?: string
  approverNames: string
  onNavigateToVideoPage: () => void
  onNavigateToLibrary: () => void
  onRequestReapproval: () => void
  onHeadingChange?: (text: string) => void
  onSubheadingChange?: (text: string) => void
  openCommentsOnMount?: boolean
  triggerOpenComments?: number
  notifications?: NotificationItem[]
  initialThreads?: CommentThread[]
  initialPermSettings?: VideoPermissionSettings
  onPermChange?: (s: VideoPermissionSettings) => void
  awaitingApprovers?: boolean
  onEditAttempt?: () => void
  /** Controlled enabledLangs — lifted to App.tsx so selections persist between tasks. */
  enabledLangs?: string[]
  onEnabledLangsChange?: (langs: string[]) => void
  /** Controlled in-progress language selections — also lifted so picks persist. */
  selectedLangs?: string[]
  onSelectedLangsChange?: (langs: string[]) => void
}

export default function StudioPage({ videoTitle, initialHeadingText, initialSubheadingText, approverNames, onNavigateToVideoPage, onNavigateToLibrary, onRequestReapproval, onHeadingChange, onSubheadingChange, openCommentsOnMount, triggerOpenComments, notifications, initialThreads, initialPermSettings, onPermChange, awaitingApprovers, onEditAttempt, enabledLangs: enabledLangsProp, onEnabledLangsChange, selectedLangs, onSelectedLangsChange }: Props) {
    const theme = useTheme();
    const [commentsOpen, setCommentsOpen] = useState(() => openCommentsOnMount ?? false);

    // Open comments panel whenever triggerOpenComments counter increments (e.g. from notification link)
    useEffect(() => {
        if (triggerOpenComments && triggerOpenComments > 0) {
            setCommentsOpen(true);
        }
    }, [triggerOpenComments]);
    const [activeNav, setActiveNav] = useState<string | null>(null);
    const [mediaLibOpen, setMediaLibOpen] = useState(false);
    const [mediaFolder, setMediaFolder] = useState<string | null>(null);
    const [avatarLibOpen, setAvatarLibOpen] = useState(false);
    const [avatarReqCount, setAvatarReqCount] = useState(4); // mock: adam has 4 pending
    const [langsOpen, setLangsOpen] = useState(false);
    // Use the controlled prop if provided (from App.tsx), otherwise fall back to local state
    // so this component still works in isolation.
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
    const [langMenuAnchor, setLangMenuAnchor] = useState<HTMLElement | null>(null);
    const [selectedScene, setSelectedScene] = useState(0);
    const [headingSelected, setHeadingSelected] = useState(false);
    const [headingText, setHeadingText] = useState(initialHeadingText ?? videoTitle);
    const [editHeadingOpen, setEditHeadingOpen] = useState(false);
    const [subheadingSelected, setSubheadingSelected] = useState(false);
    const [subheadingText, setSubheadingText] = useState(initialSubheadingText ?? "Sub-heading Placeholder");
    const [editSubheadingOpen, setEditSubheadingOpen] = useState(false);
    const [footnoteSelected, setFootnoteSelected] = useState(false);
    const [footnoteText, setFootnoteText] = useState("Footnote placeholder");
    const [editFootnoteOpen, setEditFootnoteOpen] = useState(false);
    const [editBulletOpen, setEditBulletOpen] = useState(false);

    const [sceneTypes, setSceneTypes] = useState<("regular" | "custom")[]>(["regular", "regular", "regular", "regular"]);
    const [sceneLibOpen, setSceneLibOpen] = useState(false);
    const [placeholderMenuOpen, setPlaceholderMenuOpen] = useState(false);
  // ── Unified canvas elements ──────────────────────────────────────────────────
  type PlaceholderType =
    | "Heading" | "Sub heading" | "Media" | "Footnote" | "Logo"
    | "Button" | "Vertical bullet point" | "Horizontal bullet point"
  type CanvasEl = {
    id: string; type: PlaceholderType
    x: number; y: number // % of scene dimensions
    width?: number; height?: number // % of scene dimensions (for resizing)
    text?: string // editable label (bullets, text types)
    buttonSize?: "S"|"M"|"L"|"XL"
    bulletIconSize?: "S"|"M"|"L"|"XL"
    bulletTextSize?: number // font size in pixels for bullet text
  }
  const [sceneElements, setSceneElements] = useState<Record<number, CanvasEl[]>>({});
  const [selectedElId, setSelectedElId] = useState<string | null>(null);
  const [editingElId, setEditingElId] = useState<string | null>(null);
  const [bulletMenuAnchor, setBulletMenuAnchor] = useState<HTMLElement | null>(null);

  // Helpers
  const sceneEls = (scene = selectedScene) => sceneElements[scene] ?? [];
  const selectedEl = sceneEls().find(el => el.id === selectedElId) ?? null;

  const addElement = (type: PlaceholderType) => {
      const els = sceneEls();
      const i = els.length % 6;
      const newEl: CanvasEl = {
          id: `el-${Date.now()}`,
          type,
          x: Math.min(85, 25 + i * 10),
          y: Math.min(80, 28 + i * 10),
          ...(type === "Button" ? { buttonSize: "L" } : {}),
          ...(type === "Vertical bullet point" || type === "Horizontal bullet point"
              ? { bulletIconSize: "M", text: "Placeholder" } : {})
      };
      setSceneElements(prev => ({ ...prev, [selectedScene]: [...(prev[selectedScene] ?? []), newEl] }));
      setSelectedElId(newEl.id); // Auto-select newly added element and show toolbar
  };

  const updateEl = (id: string, patch: Partial<CanvasEl>) =>
      setSceneElements(prev => ({
          ...prev,
          [selectedScene]: (prev[selectedScene] ?? []).map(el => el.id === id ? { ...el, ...patch } : el)
      }));

  const deleteEl = (id: string) => {
      setSceneElements(prev => ({
          ...prev,
          [selectedScene]: (prev[selectedScene] ?? []).filter(el => el.id !== id)
      }));
      setSelectedElId(null);
      setEditingElId(null);
  };

  // Helper: Update bullet text and sync font size to all bullets in scene
  const updateBulletText = (id: string, text: string) => {
      // Calculate optimal font size based on text length
      const calcFontSize = (textLen: number): number => {
          if (textLen > 50) {
              return 11;
          }
          if (textLen > 40) {
              return 12;
          }
          return 14;
      };
      const newFontSize = calcFontSize(text.length);

      // Update this bullet and sync font size to all other bullets in scene
      setSceneElements(prev => ({
          ...prev,
          [selectedScene]: (prev[selectedScene] ?? []).map(el => {
              if (el.id === id) {
                  return { ...el, text, bulletTextSize: newFontSize };
              }
              // Sync font size to all other bullets
              if (el.type === "Vertical bullet point" || el.type === "Horizontal bullet point") {
                  return { ...el, bulletTextSize: newFontSize };
              }
              return el;
          })
      }));
  };

  // Drag support
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const sceneBoxRef = useRef<HTMLDivElement | null>(null);
  const selectedElRef = useRef<HTMLDivElement | null>(null);

  // Live preview grid responsive sizing — mirrors real app's MainWorkSpaceContainer logic
  const livePreviewGridRef = useRef<HTMLDivElement | null>(null);
  const [isContainerArLarger, setIsContainerArLarger] = useState(true);
  const [livePreviewWidth, setLivePreviewWidth] = useState(0);

  useLayoutEffect(() => {
      const el = livePreviewGridRef.current;
      if (!el) {
          return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) {
          setIsContainerArLarger(rect.width / rect.height > 16 / 9);
      }
      const observer = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (!entry) {
              return;
          }
          const { width, height } = entry.contentRect;
          setIsContainerArLarger(height > 0 && width / height > 16 / 9);
      });
      observer.observe(el);
      return () => observer.disconnect();
  }, []);

  useEffect(() => {
      const el = canvasRef.current;
      if (!el) {
          return;
      }
      const observer = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (entry) {
              setLivePreviewWidth(entry.contentRect.width);
          }
      });
      observer.observe(el);
      return () => observer.disconnect();
  }, []);
  const dragInfo = useRef<{
    startMX: number; startMY: number; startX: number; startY: number
    moved: boolean; updatePos: (x: number, y: number) => void
        } | null>(null);
  const resizeInfo = useRef<{
    startMX: number; startMY: number; startW: number; startH: number
    moved: boolean; updateSize: (w: number, h: number) => void
        } | null>(null);

  const startDrag = (e: React.MouseEvent, startX: number, startY: number, updatePos: (x: number, y: number) => void) => {
      e.stopPropagation();
      dragInfo.current = { startMX: e.clientX, startMY: e.clientY, startX, startY, moved: false, updatePos };
  };

  const startResize = (e: React.MouseEvent, startW: number, startH: number, updateSize: (w: number, h: number) => void) => {
      e.stopPropagation();
      resizeInfo.current = { startMX: e.clientX, startMY: e.clientY, startW, startH, moved: false, updateSize };
  };

  const onCanvasMouseMove = (e: React.MouseEvent) => {
      if (dragInfo.current && !resizeInfo.current && canvasRef.current) {
          const sceneW = canvasRef.current.clientWidth;
          const sceneH = sceneW * 9 / 16;
          const dx = ((e.clientX - dragInfo.current.startMX) / sceneW) * 100;
          const dy = ((e.clientY - dragInfo.current.startMY) / sceneH) * 100;
          if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
              dragInfo.current.moved = true;
          }
          dragInfo.current.updatePos(
              Math.max(5, Math.min(95, dragInfo.current.startX + dx)),
              Math.max(5, Math.min(95, dragInfo.current.startY + dy))
          );
      }
      if (resizeInfo.current && !dragInfo.current && canvasRef.current) {
          const sceneW = canvasRef.current.clientWidth;
          const sceneH = sceneW * 9 / 16;
          const dw = ((e.clientX - resizeInfo.current.startMX) / sceneW) * 100;
          const dh = ((e.clientY - resizeInfo.current.startMY) / sceneH) * 100;
          if (Math.abs(dw) > 1 || Math.abs(dh) > 1) {
              resizeInfo.current.moved = true;
          }
          resizeInfo.current.updateSize(
              Math.max(15, Math.min(90, resizeInfo.current.startW + dw)),
              Math.max(15, Math.min(90, resizeInfo.current.startH + dh))
          );
      }
  };

  const onCanvasMouseUp = () => {
      dragInfo.current = null; resizeInfo.current = null; 
  };

  // True when any toolbar or panel is open → disables scene navigation
  const isToolbarActive = selectedElId !== null || placeholderMenuOpen;

  const SCENE_COUNT = sceneTypes.length;
  const goToScene = (idx: number) => {
      const next = Math.max(0, Math.min(SCENE_COUNT - 1, idx));
      setSelectedScene(next);
      setHeadingSelected(false);
      setSubheadingSelected(false);
      setFootnoteSelected(false);
      setSelectedElId(null);
      setEditingElId(null);
      if (sceneTypes[next] !== "custom") {
          setPlaceholderMenuOpen(false);
      }
  };
  const [threads, setThreads] = useState<CommentThread[]>(initialThreads ?? []);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);
  const [videoPermOpen, setVideoPermOpen] = useState(false);
  const [videoPermSettings, setVideoPermSettings] = useState<VideoPermissionSettings | undefined>(initialPermSettings);

  // Unread = not yet checked or resolved
  const unreadCount = threads.reduce((n, t) => n + t.comments.filter(c => !c.checkedNow && !c.resolved).length, 0);

  const navImg = (name: string, sel: boolean) => (
      <Box component="img" src={`/icons/${name}-${sel ? "selected" : "idle"}.svg`} sx={{ width: 16, height: 16, display: "block" }} />
  );

  const NAV_SECTIONS = [
      {
          section: "STYLE",
          items: [
              { icon: navImg("brand", false), iconSelected: navImg("brand", true), label: "Brand" },
              { icon: navImg("theme", false), iconSelected: navImg("theme", true), label: "Theme" },
              {
                  icon: (
                      <Badge
                          badgeContent={avatarReqCount > 0 ? avatarReqCount : undefined}
                          color="error"
                          sx={navBadgeSx}
                      >
                          {navImg("avatar", false)}
                      </Badge>
                  ),
                  iconSelected: (
                      <Badge
                          badgeContent={avatarReqCount > 0 ? avatarReqCount : undefined}
                          color="error"
                          sx={navBadgeSx}
                      >
                          {navImg("avatar", true)}
                      </Badge>
                  ),
                  label: "Avatar"
              }
          ]
      },
      {
          section: "LIBRARIES",
          items: [
              { icon: navImg("media", false), iconSelected: navImg("media", true), label: "Media" },
              { icon: navImg("music", false), iconSelected: navImg("music", true), label: "Music" },
              { icon: navImg("voice", false), iconSelected: navImg("voice", true), label: "Voice" },
              { icon: navImg("data", false), iconSelected: navImg("data", true), label: "Data" },
              { icon: navImg("input-fields", false), iconSelected: navImg("input-fields", true), label: "Input fields" }
          ]
      },
      {
          section: "SETTINGS",
          items: [
              { icon: navImg("aspect-ratio", false), iconSelected: navImg("aspect-ratio", true), label: "Aspect ratio" },
              {
                  icon: navImg("languages", false),
                  iconSelected: navImg("languages", true),
                  label: "Languages",
                  onClickOverride: () => {
                      if (activeNav === "Languages" && langsOpen) {
                          setLangsOpen(false);
                          setActiveNav(null);
                      }
                      else {
                          setLangsOpen(true);
                          setMediaLibOpen(false);
                          setAvatarLibOpen(false);
                          setActiveNav("Languages");
                      }
                  }
              }
          ]
      },
      {
          section: "APPROVAL",
          items: [
              {
                  icon: (
                      <Badge
                          badgeContent={unreadCount > 0 ? unreadCount : undefined}
                          color="error"
                          sx={navBadgeSx}
                      >
                          <SvgIcon fontSize="small"><FontAwesomeIcon icon={faComment} /></SvgIcon>
                      </Badge>
                  ),
                  label: "Comments",
                  onClickOverride: () => {
                      setCommentsOpen(true);
                  }
              }
          ]
      }
  ];

  return (
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "hidden" }}>

          {/* ── Appbar ─────────────────────────────────────────────────────────── */}
          <AppBar position="static" color="secondary" elevation={0} sx={studioAppBarSx}>
              <Toolbar variant="dense" disableGutters sx={studioToolbarSx}>
                  {/* Left — logo + video name + save indicator */}
                  <Box sx={studioAppBarLeftSx}>
                      {/* Logo — click to go to library */}
                      <Box onClick={onNavigateToLibrary} sx={studioLogoSx}>
                          <Box component="img" src="/newNavLogo.svg" alt="sundaysky-logo" sx={studioLogoImgSx} />
                      </Box>
                      {/* Save indicator */}
                      <SvgIcon sx={{ color: "primary.light" }}>
                          <FontAwesomeIcon icon={faCloudCheck} fontSize="16px" />
                      </SvgIcon>
                      {/* Video name */}
                      <Typography variant="h4" noWrap sx={{ color: "inherit" }}>
                          {videoTitle}
                      </Typography>
                      {/* Language picker badge */}
                      <Box
                          sx={studioLangBadgeSx}
                          onClick={(e) => setLangMenuAnchor(e.currentTarget)}
                      >
                          <Typography variant="caption">
                              {selectedDisplayLang === "English" ? "🇺🇸" : FLAG_BY_NAME[selectedDisplayLang]}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "inherit" }}>
                              {selectedDisplayLang === "English" ? "EN" : CODE_BY_NAME[selectedDisplayLang]}
                          </Typography>
                          <SvgIcon sx={{ fontSize: "10px !important", width: "10px !important", height: "10px !important", color: "inherit", ml: "2px" }}>
                              <FontAwesomeIcon icon={faChevronDown} />
                          </SvgIcon>
                      </Box>

                      {/* Language dropdown — content differs based on whether languages are enabled */}
                      <Popover
                          anchorEl={langMenuAnchor}
                          open={Boolean(langMenuAnchor)}
                          onClose={() => setLangMenuAnchor(null)}
                          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                          transformOrigin={{ vertical: "top", horizontal: "left" }}
                          slotProps={{ paper: { sx: langDropdownPaperSx } }}
                      >
                          {enabledLangs.length === 0 ? (
                              /* ── No additional languages yet ── */
                              <Box sx={{ p: 1.5 }}>
                                  <Button
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      startIcon={
                                          <SvgIcon sx={{ fontSize: "14px !important", width: "14px !important", height: "14px !important" }}>
                                              <FontAwesomeIcon icon={faArrowsRotate} />
                                          </SvgIcon>
                                      }
                                      onClick={() => {
                                          setLangMenuAnchor(null);
                                          setLangsOpen(true);
                                          setActiveNav("Languages");
                                      }}
                                  >
                                      Change narration source language
                                  </Button>
                                  <Divider sx={{ my: 1.5 }} />
                                  <Box sx={langInfoCardSx}>
                                      <SvgIcon fontSize="small" sx={{ color: "text.secondary", flexShrink: 0, mt: "1px" }}>
                                          <FontAwesomeIcon icon={faDatabase} />
                                      </SvgIcon>
                                      <Box>
                                          <Typography variant="body1" color="text.secondary">
                                              Select up to {MAX_LANGUAGES} additional languages to expand your video&apos;s reach
                                          </Typography>
                                      </Box>
                                  </Box>
                              </Box>
                          ) : (
                              /* ── Languages enabled — show picker list ── */
                              <MenuList sx={{ py: 0.5 }}>
                                  {[{ name: "English", flag: "🇺🇸" }, ...enabledLangs.map(name => ({ name, flag: FLAG_BY_NAME[name] }))].map(({ name, flag }) => (
                                      <MenuItem
                                          key={name}
                                          onClick={() => {
                                              setSelectedDisplayLang(name); setLangMenuAnchor(null); 
                                          }}
                                      >
                                          <Box sx={langMenuItemSx}>
                                              <Box sx={langFlagCircleSx}>
                                                  <Typography sx={{ fontSize: 14, lineHeight: 1 }}>{flag}</Typography>
                                              </Box>
                                              <Typography variant="body1" sx={{ flex: 1 }}>{name}</Typography>
                                              {selectedDisplayLang === name && (
                                                  <>
                                                      <SvgIcon sx={{ fontSize: "12px !important", width: "12px !important", height: "12px !important", color: "text.disabled", mr: 1 }}>
                                                          <FontAwesomeIcon icon={faLanguage} />
                                                      </SvgIcon>
                                                      <SvgIcon sx={{ fontSize: "13px !important", width: "13px !important", height: "13px !important", color: "primary.main" }}>
                                                          <FontAwesomeIcon icon={faCheck} />
                                                      </SvgIcon>
                                                  </>
                                              )}
                                          </Box>
                                      </MenuItem>
                                  ))}
                              </MenuList>
                          )}
                      </Popover>
                  </Box>

                  {/* Right */}
                  <Box sx={studioAppBarRightSx}>
                      <IconButton size="medium" color="inherit">
                          <SvgIcon fontSize="small"><FontAwesomeIcon icon={faArrowTurnLeft} /></SvgIcon>
                      </IconButton>
                      <IconButton size="medium" color="inherit">
                          <SvgIcon fontSize="small"><FontAwesomeIcon icon={faArrowTurnRight} /></SvgIcon>
                      </IconButton>
                      <Divider orientation="vertical" flexItem sx={studioDividerSx} />
                      {/* Manage permissions button */}
                      <Tooltip title="Manage permission" placement="bottom" arrow slotProps={{ tooltip: { sx: studioTooltipSx } }}>
                          <IconButton size="medium" color="inherit" onClick={() => setVideoPermOpen(true)} sx={studioPermBtnSx}>
                              <SvgIcon fontSize="small"><FontAwesomeIcon icon={faLock} /></SvgIcon>
                          </IconButton>
                      </Tooltip>
                      <TruffleAvatar text={OWNER_USER.initials} size="small" />
                      <NotificationBell dark notifications={notifications} />
                      <Divider orientation="vertical" flexItem sx={studioDividerSx} />
                      {/* Video Page button */}
                      <Button
                          variant="contained"
                          color="gradient"
                          size="medium"
                          endIcon={<SvgIcon sx={{ fontSize: "11px !important", width: "11px !important", height: "11px !important" }}><FontAwesomeIcon icon={faChevronRight} /></SvgIcon>}
                          onClick={onNavigateToVideoPage}
                          sx={studioVideoPageBtnSx}
                      >
                          Video Page
                      </Button>
                  </Box>
              </Toolbar>
          </AppBar>

          {/* ── Content ────────────────────────────────────────────────────────── */}
          <Box sx={studioContentAreaSx}>

              {/* Left nav */}
              <TruffleMenuPanel variant="outlined" sx={studioLeftNavSx}>
                  {NAV_SECTIONS.map(({ section, items }) => (
                      <List key={section} disablePadding>
                          <ListSubheader disableSticky sx={navSubheaderSx}>
                              {section}
                          </ListSubheader>
                          {items.map(({ icon, iconSelected, label, onClickOverride }: { icon: React.ReactNode; iconSelected?: React.ReactNode; label: string; onClickOverride?: () => void }) => (
                              <ListItemButton
                                  key={label}
                                  dense
                                  selected={activeNav === label}
                                  onClick={() => {
                                      if (label === "Avatar") {
                                          if (activeNav === "Avatar" && avatarLibOpen) {
                                              setAvatarLibOpen(false);
                                              setActiveNav(null);
                                          }
                                          else {
                                              setAvatarLibOpen(true);
                                              setMediaLibOpen(false);
                                              setActiveNav("Avatar");
                                          }
                                      }
                                      else if (label === "Media") {
                                          if (activeNav === "Media" && mediaLibOpen) {
                                              setMediaLibOpen(false);
                                              setActiveNav(null);
                                          }
                                          else {
                                              setMediaLibOpen(true);
                                              setMediaFolder(null);
                                              setAvatarLibOpen(false);
                                              setActiveNav("Media");
                                          }
                                      }
                                      else {
                                          setActiveNav(label);
                                          setMediaLibOpen(false);
                                          setAvatarLibOpen(false);
                                          if (onClickOverride) {
                                              onClickOverride();
                                          }
                                      }
                                  }}
                              >
                                  <ListItemIcon sx={navItemIconSx}>
                                      {(activeNav === label && iconSelected) ? iconSelected : icon}
                                  </ListItemIcon>
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

              {/* Media Library Panel — slides in between nav and stage */}
              <MediaLibraryPanel
                  open={mediaLibOpen}
                  onClose={() => {
                      setMediaLibOpen(false); setActiveNav(null); 
                  }}
                  folder={mediaFolder}
                  onOpenFolder={name => setMediaFolder(name)}
                  onCloseFolder={() => setMediaFolder(null)}
              />

              {/* Avatar Library Panel — slides in between nav and stage */}
              <AvatarLibraryPanel
                  open={avatarLibOpen}
                  onClose={() => {
                      setAvatarLibOpen(false); setActiveNav(null);
                  }}
                  onTotalRequestsChange={setAvatarReqCount}
              />

              {/* Languages Panel — slides in between nav and stage */}
              <LanguagesPanel
                  open={langsOpen}
                  onClose={() => {
                      setLangsOpen(false); setActiveNav(null);
                  }}
                  enabledLangs={enabledLangs}
                  onEnabledLangsChange={(langs) => {
                      setEnabledLangs(langs);
                      // If the currently displayed lang was removed, fall back to English
                      if (selectedDisplayLang !== "English" && !langs.includes(selectedDisplayLang)) {
                          setSelectedDisplayLang("English");
                      }
                  }}
                  selectedLangs={selectedLangs}
                  onSelectedLangsChange={onSelectedLangsChange}
              />

              {/* Stage */}
              <Box sx={stageContainerSx}>

                  {/* Live preview area — CSS grid mirroring real app's MainWorkSpaceContainer */}
                  <Box ref={livePreviewGridRef} sx={combineSxProps(livePreviewAreaSx, isContainerArLarger ? containerLargerSx : containerSmallerSx)}>

                      {/* Prev arrow */}
                      <IconButton
                          disabled={selectedScene === 0 || isToolbarActive}
                          onClick={() => goToScene(selectedScene - 1)}
                          size="medium"
                          color="primary"
                          sx={prevArrowSx}
                      >
                          <SvgIcon><FontAwesomeIcon icon={faChevronLeft} /></SvgIcon>
                      </IconButton>

                      {/* Canvas + right toolbar — inner group aligned at top so toolbar top === canvas top */}
                      <Box sx={canvasAndToolbarGroupSx}>

                          {/* Placeholder picker panel — floats to the right of canvas, above everything */}
                          {placeholderMenuOpen && (() => {
                              // Calculate available space on the right side of canvas
                              const canvasRect = canvasRef.current?.getBoundingClientRect();
                              const menuWidth = 260;
                              const gap = 8;
                              const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
                              const availableSpaceRight = canvasRect ? viewportWidth - (canvasRect.right + gap) : 0;
                              const shouldPositionLeft = availableSpaceRight < menuWidth;

                              return (
                                  <Box
                                      onClick={e => e.stopPropagation()}
                                      sx={(theme) => ({
                                          position: "absolute", top: 0,
                                          ...(shouldPositionLeft
                                              ? { right: "calc(100% + 8px)", left: "auto" }
                                              : { left: "calc(100% + 8px)", right: "auto" }
                                          ),
                                          zIndex: 40,
                                          bgcolor: "background.paper", borderRadius: "16px",
                                          boxShadow: `0 4px 24px ${alpha(theme.palette.secondary.main, 0.18)}`,
                                          width: 260,
                                          borderWidth: 1, borderStyle: "solid", borderColor: "divider"
                                      })}
                                  >
                                      {/* Header */}
                                      <Box sx={placeholderMenuHeaderSx}>
                                          <Typography variant="h3" sx={{ fontSize: 18, color: "secondary.main" }}>
                      Placeholder
                                          </Typography>
                                          <IconButton size="small" onClick={() => setPlaceholderMenuOpen(false)} sx={{ color: "text.secondary", p: "4px" }}>
                                              <SvgIcon sx={{ fontSize: "20px !important", width: "20px !important", height: "20px !important" }}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                                          </IconButton>
                                      </Box>

                                      {/* Items */}
                                      <Box sx={placeholderMenuItemsContainerSx}>
                                          {([
                                              { label: "Heading", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuIconBoxSx}>
                                                      <Box component="img" src="/heading.png" alt="Heading" sx={menuIconImgSx} />
                                                  </Box>
                                              ) },
                                              { label: "Sub heading", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuIconBoxSx}>
                                                      <Box component="img" src="/sub heading.png" alt="Sub heading" sx={menuIconImgSx} />
                                                  </Box>
                                              ) },
                                              { label: "Media", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuIconBoxSx}>
                                                      <Box component="img" src="/media.png" alt="Media" sx={menuIconImgSx} />
                                                  </Box>
                                              ) },
                                              { label: "Vertical bullet point", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuBulletIconBoxSx}>
                                                      <SvgIcon sx={{ fontSize: "22px !important", color: "background.paper" }}><FontAwesomeIcon icon={faListUl} /></SvgIcon>
                                                  </Box>
                                              ) },
                                              { label: "Horizontal bullet point", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuBulletIconBoxSx}>
                                                      <SvgIcon sx={{ fontSize: "22px !important", color: "background.paper" }}><FontAwesomeIcon icon={faTableColumns} /></SvgIcon>
                                                  </Box>
                                              ) },
                                              { label: "Footnote", blue: false, iconEl: (
                                                  <Box sx={placeholderMenuIconBoxSx}>
                                                      <Typography variant="body1" sx={{ fontSize: 22, color: "text.secondary", lineHeight: 1 }}>*</Typography>
                                                  </Box>
                                              ) },
                                              { label: "Logo", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuIconBoxSx}>
                                                      <Box component="img" src="/logo.png" alt="Logo" sx={menuIconImgSx} />
                                                  </Box>
                                              ) },
                                              { label: "Button", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuIconBoxSx}>
                                                      <Box component="img" src="/button.png" alt="Button" sx={menuIconImgSx} />
                                                  </Box>
                                              ) }
                                          ] as { label: string; blue: boolean; iconEl: React.ReactNode }[]).map(({ label, blue, iconEl }) => (
                                              <Box
                                                  key={label}
                                                  onClick={() => {
                                                      addElement(label as PlaceholderType);
                                                      setPlaceholderMenuOpen(false);
                                                  }}
                                                  sx={placeholderMenuItemRowSx}>
                                                  {iconEl}
                                                  <Typography variant="body1" sx={{ fontSize: 15, color: blue ? "primary.main" : "text.secondary" }}>
                                                      {label}
                                                  </Typography>
                                              </Box>
                                          ))}
                                      </Box>
                                  </Box>
                              );
                          })()}

                          {/* Canvas */}
                          <Box
                              ref={canvasRef}
                              onClick={() => {
                                  setHeadingSelected(false); setSubheadingSelected(false); setFootnoteSelected(false); setPlaceholderMenuOpen(false); setSelectedElId(null); setEditingElId(null);
                              }}
                              onMouseMove={onCanvasMouseMove}
                              onMouseUp={onCanvasMouseUp}
                              onMouseLeave={onCanvasMouseUp}
                              sx={(theme) => ({
                                  width: "100%", height: "100%",
                                  position: "relative",
                                  borderRadius: "8px", overflow: "visible",
                                  border: `1px solid ${headingSelected || subheadingSelected || footnoteSelected ? theme.palette.primary.main : theme.palette.divider}`,
                                  boxShadow: headingSelected || subheadingSelected || footnoteSelected
                                      ? `0px 0px 0px 2px ${alpha(theme.palette.primary.main, 0.2)}, 0px 2px 12px ${alpha(theme.palette.secondary.main, 0.1)}`
                                      : `0px 2px 12px ${alpha(theme.palette.secondary.main, 0.1)}`,
                                  transition: "border-color 0.15s, box-shadow 0.15s"
                              })}
                          >
                              {/* ── Custom scene canvas ──────────────────────────────── */}
                              {sceneTypes[selectedScene] === "custom" && (() => {
                                  const els = sceneEls();
                                  const isEmpty = els.length === 0;

                                  // Icon sizes for bullet elements
                                  const icoContainerPx: Record<string, number> = { S: 28, M: 36, L: 44, XL: 56 };
                                  // Button pill sizes
                                  const btnDims: Record<string, { w: number; h: number; fs: number }> = {
                                      S:{ w:80, h:28, fs:11 }, M:{ w:120, h:36, fs:13 }, L:{ w:160, h:44, fs:14 }, XL:{ w:200, h:52, fs:16 }
                                  };
                                  // Generic placeholder tile visual (Heading, Sub heading, Media, Logo, Footnote)
                                  const GenericTile = ({ el, isSelected }: { el: CanvasEl; isSelected: boolean }) => {
                                      const iconSrc: Record<string, string> = {
                                          Heading: "/heading.png", "Sub heading": "/sub heading.png",
                                          Media: "/media.png", Logo: "/logo.png", Button: "/button.png"
                                      };
                                      const src = iconSrc[el.type];
                                      return (
                                          <Box sx={(theme) => ({
                                              display: "flex", alignItems: "center", gap: "8px",
                                              px: "12px", py: "8px", borderRadius: "8px",
                                              borderWidth: 2, borderStyle: "dashed", borderColor: isSelected ? "primary.main" : "primary.light",
                                              bgcolor: isSelected ? "action.hover" : "background.paper",
                                              cursor: "grab", userSelect: "none", whiteSpace: "nowrap",
                                              boxShadow: isSelected ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}` : "none",
                                              transition: "all 0.15s"
                                          })}>
                                              {src
                                                  ? <Box component="img" src={src} sx={canvasElIconImgSx} alt={el.type} />
                                                  : <Typography sx={{ fontSize: 16, lineHeight: 1, color: "text.secondary" }}>*</Typography>
                                              }
                                              <Typography variant="h5" sx={{ color: "primary.main" }}>
                                                  {el.type}
                                              </Typography>
                                          </Box>
                                      );
                                  };

                                  return (
                                      <>
                                          {/* ── Clipped scene background (no elements here so nothing clips) ── */}
                                          <Box ref={sceneBoxRef} sx={customSceneBackgroundSx}>
                                              {/* Prototype-only custom-scene accent — no real-app theme token */}
                                              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, bgcolor: "#E040FB", zIndex: 1 }} />

                                              {isEmpty && (
                                                  <Box sx={customSceneEmptyStateSx}>
                                                      <PlaceholderIcon size={52} />
                                                      <Button variant="contained"
                                                          onClick={e => {
                                                              e.stopPropagation(); setPlaceholderMenuOpen(p => !p); setSelectedElId(null); setEditingElId(null);
                                                          }}
                                                          sx={(theme) => ({ px: "16px", py: "8px", bgcolor: "primary.main", boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}` })}
                                                      >Add placeholder</Button>
                                                  </Box>
                                              )}
                                          </Box>

                                          {/* ── Elements overlay — same bounds as scene box, no overflow:hidden ── */}
                                          <Box sx={elementsOverlaySx}>
                                              {els.map(el => {
                                                  const isSelected = el.id === selectedElId;
                                                  const isEditing = el.id === editingElId;
                                                  const isBullet = el.type === "Vertical bullet point" || el.type === "Horizontal bullet point";
                                                  const isButton = el.type === "Button";

                                                  // Bullet sizing
                                                  const icoPx = icoContainerPx[el.bulletIconSize ?? "M"];
                                                  const icoInner = icoPx * 0.6;
                                                  const badgePx = Math.max(12, Math.round(icoPx * 0.35));

                                                  return (
                                                      <Box
                                                          key={el.id}
                                                          ref={isSelected ? selectedElRef : undefined}
                                                          sx={{ position: "absolute", left: `${el.x}%`, top: `${el.y}%`, transform: "translate(-50%, -50%)", zIndex: 3, pointerEvents: "auto" }}
                                                          onMouseDown={e => {
                                                              if (isEditing) {
                                                                  return;
                                                              }
                                                              startDrag(e, el.x, el.y, (nx, ny) => updateEl(el.id, { x: nx, y: ny }));
                                                          }}
                                                          onClick={e => {
                                                              e.stopPropagation();
                                                              if (dragInfo.current?.moved) {
                                                                  return;
                                                              }
                                                              setSelectedElId(prev => prev === el.id ? null : el.id);
                                                              setPlaceholderMenuOpen(false);
                                                          }}
                                                      >

                                                          {/* ── Button ─────────────────────────────────── */}
                                                          {isButton && (() => {
                                                              const { w, h, fs } = btnDims[el.buttonSize ?? "L"];
                                                              return (
                                                                  <Box sx={(theme) => ({
                                                                      bgcolor: "primary.main", color: "background.paper", borderRadius: "999px",
                                                                      width: w, height: h,
                                                                      display: "flex", alignItems: "center", justifyContent: "center",
                                                                      fontWeight: 600, fontSize: fs,
                                                                      cursor: "grab", userSelect: "none",
                                                                      border: isSelected ? `2px dashed ${alpha(theme.palette.common.white, 0.7)}` : "2px solid transparent",
                                                                      boxShadow: isSelected ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.35)}` : `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                                                                      outline: isSelected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                                                      outlineOffset: "2px", transition: "outline 0.15s, box-shadow 0.15s", whiteSpace: "nowrap"
                                                                  })}>Button</Box>
                                                              );
                                                          })()}

                                                          {/* ── Bullet (V or H) ────────────────────────── */}
                                                          {isBullet && (() => {
                                                              const isV = el.type === "Vertical bullet point";
                                                              const imgDir = isV ? "row" : "column";
                                                              const elWidth = el.width ?? 200;
                                                              const elHeight = el.height ?? 80;
                                                              const sceneBoxRect = sceneBoxRef.current?.getBoundingClientRect();
                                                              const physicalWidth = sceneBoxRect ? (elWidth / 100) * sceneBoxRect.width : 200;
                                                              // Auto-size text: reduce font size if text is very long
                                                              const calcTextSize = () => {
                                                                  const textLen = (el.text ?? "Placeholder").length;
                                                                  if (textLen > 40) {
                                                                      return Math.max(11, Math.min(14, 14 - (textLen - 40) * 0.1));
                                                                  }
                                                                  return el.bulletTextSize ?? 14;
                                                              };
                                                              const autoTextFs = calcTextSize();
                                                              return (
                                                                  <Box sx={(theme) => ({
                                                                      display: "flex", flexDirection: isV ? "column" : "row",
                                                                      alignItems: "center", gap: isV ? "10px" : "16px",
                                                                      cursor: isEditing ? "default" : "grab", p: "8px", borderRadius: "8px",
                                                                      outline: isSelected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                                                      outlineOffset: "4px",
                                                                      boxShadow: isSelected ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.12)}` : "none",
                                                                      transition: "outline 0.15s, box-shadow 0.15s",
                                                                      position: "relative",
                                                                      width: isSelected ? `${physicalWidth}px` : "auto",
                                                                      maxWidth: `${physicalWidth}px`,
                                                                      minWidth: 80
                                                                  })}>

                                                                      {/* image + text */}
                                                                      <Box sx={{ display: "flex", flexDirection: imgDir, alignItems: "center", gap: "10px" }}>
                                                                          <Box sx={{ position: "relative", flexShrink: 0 }}>
                                                                              <Box sx={{ width: icoPx, height: icoPx, bgcolor: "grey.700", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                                  <SvgIcon sx={{ fontSize: icoInner, color: "background.paper" }}><FontAwesomeIcon icon={faImage} /></SvgIcon>
                                                                              </Box>
                                                                              <Box sx={(theme) => ({ position: "absolute", top: -badgePx * 0.35, right: -badgePx * 0.35, width: badgePx, height: badgePx, borderRadius: "50%", bgcolor: "grey.500", border: `2px solid ${theme.palette.common.white}`, display: "flex", alignItems: "center", justifyContent: "center" })}>
                                                                                  <SvgIcon sx={{ fontSize: badgePx * 0.65, color: "background.paper" }}><FontAwesomeIcon icon={faPlus} /></SvgIcon>
                                                                              </Box>
                                                                          </Box>
                                                                          {isEditing ? (
                                                                              <Box component="input" autoFocus value={el.text ?? ""}
                                                                                  onChange={e => updateBulletText(el.id, (e.target as HTMLInputElement).value)}
                                                                                  onBlur={() => setEditingElId(null)}
                                                                                  onKeyDown={e => {
                                                                                      if (e.key === "Enter" || e.key === "Escape") {
                                                                                          setEditingElId(null);
                                                                                      } 
                                                                                  }}
                                                                                  onClick={e => e.stopPropagation()}
                                                                                  sx={(theme) => ({ fontWeight: 600, fontSize: autoTextFs, color: "secondary.main", border: "none", outline: `2px solid ${theme.palette.primary.main}`, borderRadius: "4px", px: "4px", py: "1px", bgcolor: "action.hover", minWidth: 80, width: `${Math.max(80, (el.text?.length ?? 0) * 8)}px` })}
                                                                              />
                                                                          ) : (
                                                                              <Typography
                                                                                  variant="h5"
                                                                                  onDoubleClick={e => {
                                                                                      e.stopPropagation(); setEditingElId(el.id); setSelectedElId(el.id);
                                                                                  }}
                                                                                  sx={{ fontSize: autoTextFs, color: "secondary.main", whiteSpace: "nowrap", userSelect: "none" }}
                                                                              >{el.text ?? "Placeholder"}</Typography>
                                                                          )}
                                                                      </Box>
                                                                      {/* Resize handle — only show when selected */}
                                                                      {isSelected && (
                                                                          <Box
                                                                              onMouseDown={(e) => startResize(e, elWidth, elHeight, (w, h) => updateEl(el.id, { width: w, height: h }))}
                                                                              sx={(theme) => ({
                                                                                  position: "absolute", bottom: -6, right: -6,
                                                                                  width: 12, height: 12, borderRadius: "50%",
                                                                                  bgcolor: "primary.main", cursor: "se-resize",
                                                                                  border: `2px solid ${theme.palette.common.white}`, boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                                                                                  "&:hover": { boxShadow: `0 0 0 2px ${theme.palette.primary.main}` }
                                                                              })}
                                                                          />
                                                                      )}
                                                                  </Box>
                                                              );
                                                          })()}

                                                          {/* ── Generic (Heading, Sub heading, Media, Logo, Footnote) ── */}
                                                          {!isButton && !isBullet && <GenericTile el={el} isSelected={isSelected} />}
                                                      </Box>
                                                  );
                                              })}
                                          </Box>

                                          {/* ── Portal toolbar — rendered into document.body, immune to all overflow:hidden ── */}
                                          {selectedEl && selectedElRef.current && createPortal((() => {
                                              const elRect = selectedElRef.current!.getBoundingClientRect();
                                              const isBullet = selectedEl.type === "Vertical bullet point" || selectedEl.type === "Horizontal bullet point";
                                              const isButton = selectedEl.type === "Button";
                                              return (
                                                  <Box
                                                      onMouseDown={e => e.stopPropagation()}
                                                      onClick={e => e.stopPropagation()}
                                                      sx={{
                                                          position: "fixed",
                                                          left: elRect.left + elRect.width / 2,
                                                          top: elRect.top - 10,
                                                          transform: "translate(-50%, -100%)",
                                                          zIndex: 9999,
                                                          whiteSpace: "nowrap"
                                                      }}
                                                  >
                                                      {isButton && (
                                                          <ButtonPlaceholderToolbar
                                                              size={selectedEl.buttonSize ?? "L"}
                                                              onSizeChange={sz => updateEl(selectedEl.id, { buttonSize: sz })}
                                                              onDelete={() => deleteEl(selectedEl.id)}
                                                          />
                                                      )}
                                                      {isBullet && (
                                                          <BulletPlaceholderToolbar
                                                              iconSize={selectedEl.bulletIconSize ?? "M"}
                                                              onIconSizeChange={sz => updateEl(selectedEl.id, { bulletIconSize: sz })}
                                                              onDelete={() => deleteEl(selectedEl.id)}
                                                              onEditClick={() => {
                                                                  setEditBulletOpen(true);
                                                              }}
                                                              onOptionsMenuClick={(anchorEl) => setBulletMenuAnchor(anchorEl)}
                                                          />
                                                      )}
                                                      {!isButton && !isBullet && (
                                                          <PlaceholderToolbar onEditClick={() => {}} onDelete={() => deleteEl(selectedEl.id)} />
                                                      )}
                                                  </Box>
                                              );
                                          })(), document.body)}
                                          {/* Bullet options menu */}
                                          <Menu
                                              open={!!bulletMenuAnchor}
                                              anchorEl={bulletMenuAnchor}
                                              onClose={() => setBulletMenuAnchor(null)}
                                              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                              transformOrigin={{ vertical: "top", horizontal: "right" }}
                                          >
                                              <MenuItem onClick={() => {
                                                  // TODO: Implement change order logic (move up/down in list)
                                                  setBulletMenuAnchor(null);
                                              }}>
                      Change order
                                              </MenuItem>
                                              <MenuItem onClick={() => {
                                                  if (selectedEl && (selectedEl.type === "Vertical bullet point" || selectedEl.type === "Horizontal bullet point")) {
                                                      const duplicated: CanvasEl = {
                                                          ...selectedEl,
                                                          id: `el-${Date.now()}`,
                                                          text: selectedEl.text ? `${selectedEl.text} (copy)` : "Placeholder"
                                                      };
                                                      setSceneElements(prev => ({
                                                          ...prev,
                                                          [selectedScene]: [...(prev[selectedScene] ?? []), duplicated]
                                                      }));
                                                      setSelectedElId(duplicated.id);
                                                  }
                                                  setBulletMenuAnchor(null);
                                              }}>
                      Duplicate
                                              </MenuItem>
                                          </Menu>
                                      </>
                                  );
                              })()}
                              {/* Image + overlays clipped to canvas shape — regular scenes only */}
                              {sceneTypes[selectedScene] !== "custom" && <Box sx={regularSceneClipBoxSx}>
                                  <Box component="img" src={IMG_THUMB} alt={videoTitle}
                                      sx={regularSceneImgSx} />

                                  {/* Cover left half of SVG — white bg + pink accent line */}
                                  <Box sx={thumbLeftCoverSx}>
                                      {/* Prototype-only scene accent — no real-app theme token */}
                                      <Box sx={{ height: 5, bgcolor: "#C084FC", width: "100%" }} />
                                  </Box>

                                  {/* Right side — drag media area */}
                                  <Box sx={regularSceneDragAreaSx}>
                                      <Box sx={{ position: "relative", display: "inline-flex" }}>
                                          <SvgIcon sx={{ fontSize: "52px !important", color: "action.disabled" }}><FontAwesomeIcon icon={faImage} /></SvgIcon>
                                      </Box>
                                      <Typography variant="caption" sx={{ color: "action.disabled", letterSpacing: "0.15px" }}>
                    Drag media here
                                      </Typography>
                                  </Box>

                                  {/* Heading + sub-heading — flowing column, scene 0 = video title, others = derived content */}
                                  {(() => {
                                      const derived = sceneContentFor(videoTitle);
                                      const sceneHeadings = [
                                          { h: headingText, s: subheadingText },
                                          { h: derived[0][0], s: derived[0][1] },
                                          { h: derived[1][0], s: derived[1][1] },
                                          { h: derived[2][0], s: derived[2][1] }
                                      ];
                                      const scene = sceneHeadings[selectedScene] ?? sceneHeadings[0];
                                      return (
                                          <Box sx={regularSceneHeadingColumnSx}>
                                              <Box
                                                  onClick={e => {
                                                      e.stopPropagation(); setHeadingSelected(p => !p); setSubheadingSelected(false); setFootnoteSelected(false); 
                                                  }}
                                                  sx={(theme) => ({
                                                      cursor: "pointer", borderRadius: "4px", px: "2px",
                                                      border: headingSelected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                                      bgcolor: headingSelected ? "action.hover" : "transparent",
                                                      "&:hover": { border: `2px solid ${theme.palette.primary.main}`, bgcolor: "action.hover" },
                                                      pointerEvents: selectedScene === 0 ? "auto" : "none"
                                                  })}
                                              >
                                                  <Typography sx={{ fontFamily: "\"Inter\", sans-serif", fontWeight: 700, fontSize: "10cqw", color: "secondary.main", lineHeight: 1.2, wordBreak: "break-word" }}>
                                                      {scene.h}
                                                  </Typography>
                                              </Box>
                                              <Box
                                                  onClick={e => {
                                                      e.stopPropagation(); setSubheadingSelected(p => !p); setHeadingSelected(false); setFootnoteSelected(false); 
                                                  }}
                                                  sx={(theme) => ({
                                                      cursor: "pointer", borderRadius: "4px", px: "2px", mt: "4%",
                                                      border: subheadingSelected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                                      bgcolor: subheadingSelected ? "action.hover" : "transparent",
                                                      "&:hover": { border: `2px solid ${theme.palette.primary.main}`, bgcolor: "action.hover" },
                                                      pointerEvents: selectedScene === 0 ? "auto" : "none"
                                                  })}
                                              >
                                                  <Typography sx={{ fontFamily: "\"Inter\", sans-serif", fontWeight: 400, fontSize: "4.5cqw", color: "text.primary", lineHeight: 1.4, wordBreak: "break-word" }}>
                                                      {scene.s}
                                                  </Typography>
                                              </Box>
                                          </Box>
                                      );
                                  })()}

                                  {/* Footnote — bottom-left, all scenes */}
                                  <Box
                                      onClick={e => {
                                          e.stopPropagation(); setFootnoteSelected(p => !p); setHeadingSelected(false); setSubheadingSelected(false); 
                                      }}
                                      sx={(theme) => ({
                                          position: "absolute", left: "4%", width: "44%", bottom: "5%",
                                          cursor: "pointer", borderRadius: "4px", px: "4px", py: "2px",
                                          border: footnoteSelected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                          bgcolor: footnoteSelected ? "action.hover" : "transparent",
                                          "&:hover": { border: `2px solid ${theme.palette.primary.main}`, bgcolor: "action.hover" },
                                          containerType: "inline-size"
                                      })}
                                  >
                                      <Typography sx={{ fontFamily: "\"Open Sans\", sans-serif", fontWeight: 400, fontSize: "2.5cqw", letterSpacing: "0.4px", color: "text.secondary", lineHeight: 1.66 }}>
                                          {footnoteText}
                                      </Typography>
                                  </Box>
                              </Box>}

                              {/* Toolbars — outside overflow:hidden so they render above the canvas edge */}
                              {sceneTypes[selectedScene] !== "custom" && headingSelected && (
                                  <Box sx={headingToolbarPositionSx}>
                                      <PlaceholderToolbar onEditClick={() => {
                                          onEditAttempt ? onEditAttempt() : setEditHeadingOpen(true);
                                      }} />
                                  </Box>
                              )}
                              {sceneTypes[selectedScene] !== "custom" && subheadingSelected && (
                                  <Box sx={subheadingToolbarPositionSx}>
                                      <PlaceholderToolbar onEditClick={() => {
                                          onEditAttempt ? onEditAttempt() : setEditSubheadingOpen(true);
                                      }} />
                                  </Box>
                              )}
                              {sceneTypes[selectedScene] !== "custom" && footnoteSelected && (
                                  <Box sx={footnoteToolbarPositionSx}>
                                      <PlaceholderToolbar onEditClick={() => {
                                          onEditAttempt ? onEditAttempt() : setEditFootnoteOpen(true); 
                                      }} />
                                  </Box>
                              )}
                          </Box>

                      </Box>{/* end canvas group */}

                      {/* Scene action toolbar — direct grid child in col 3 row 2, top-aligned */}
                      <Box sx={combineSxProps(sceneActionToolbarPillSx, sceneActionToolbarGridSx)}>
                          {/* 1. Layout / grid */}
                          <Tooltip title="Layout" placement="left" arrow>
                              <IconButton size="small" onClick={e => e.stopPropagation()}
                                  sx={sceneActionIconBtnSx}>
                                  <SvgIcon sx={{ fontSize: "18px !important", width: "18px !important", height: "18px !important" }}><FontAwesomeIcon icon={faTableLayout} /></SvgIcon>
                              </IconButton>
                          </Tooltip>

                          {/* 2. Theme / palette */}
                          <Tooltip title="Theme" placement="left" arrow>
                              <IconButton size="small" onClick={e => e.stopPropagation()}
                                  sx={sceneActionIconBtnSx}>
                                  <SvgIcon sx={{ fontSize: "18px !important", width: "18px !important", height: "18px !important" }}><FontAwesomeIcon icon={faPalette} /></SvgIcon>
                              </IconButton>
                          </Tooltip>

                          {/* 3. Add placeholder — active only on custom scenes */}
                          <Tooltip title={sceneTypes[selectedScene] === "custom" ? "Add placeholder" : ""} placement="left" arrow>
                              <Box component="span">
                                  <IconButton
                                      size="small"
                                      disabled={sceneTypes[selectedScene] !== "custom"}
                                      onClick={e => {
                                          e.stopPropagation(); setPlaceholderMenuOpen(p => !p);
                                      }}
                                      sx={{
                                          p: "3px", borderRadius: "6px",
                                          bgcolor: placeholderMenuOpen && sceneTypes[selectedScene] === "custom" ? "primary.main" : "transparent",
                                          color:   placeholderMenuOpen && sceneTypes[selectedScene] === "custom" ? "common.white" : undefined,
                                          "&:hover": { bgcolor: "action.hover" },
                                          "&.Mui-disabled": { opacity: 0.3 }
                                      }}
                                  >
                                      <PlaceholderIcon size={18} color={placeholderMenuOpen && sceneTypes[selectedScene] === "custom" ? theme.palette.common.white : undefined} />
                                  </IconButton>
                              </Box>
                          </Tooltip>

                          {/* 4. Info */}
                          <Tooltip title="Info" placement="left" arrow>
                              <IconButton size="small" onClick={e => e.stopPropagation()}
                                  sx={sceneActionIconBtnSx}>
                                  <SvgIcon sx={{ fontSize: "18px !important", width: "18px !important", height: "18px !important" }}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                              </IconButton>
                          </Tooltip>

                          {/* 5. More */}
                          <Tooltip title="More" placement="left" arrow>
                              <IconButton size="small" onClick={e => e.stopPropagation()}
                                  sx={sceneActionIconBtnSx}>
                                  <SvgIcon sx={{ fontSize: "18px !important", width: "18px !important", height: "18px !important" }}><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                              </IconButton>
                          </Tooltip>
                      </Box>

                      {/* Next arrow — vertical center of canvas row */}
                      <IconButton
                          disabled={selectedScene === SCENE_COUNT - 1 || isToolbarActive}
                          onClick={() => goToScene(selectedScene + 1)}
                          size="medium"
                          color="primary"
                          sx={nextArrowSx}
                      >
                          <SvgIcon><FontAwesomeIcon icon={faChevronRight} /></SvgIcon>
                      </IconButton>

                      {/* Narration bar — spans all 3 cols, justifySelf: center, width tracks canvas */}
                      <Box sx={combineSxProps(narrationBarSx, narrationGridSx, { width: livePreviewWidth ? `min(${livePreviewWidth + 80}px, 100%)` : "100%" })}>
                          <Box sx={narrationAvatarSx}>
                              <SvgIcon sx={{ fontSize: "16px !important", color: "text.secondary" }}><FontAwesomeIcon icon={faMicrophone} /></SvgIcon>
                          </Box>
                          <Typography variant="body1" sx={{ color: "text.primary", flex: 1, textAlign: "start" }} noWrap>
                              Add narration…
                          </Typography>
                          <Typography variant="body1" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                              ~0:12
                          </Typography>
                      </Box>
                  </Box>

                  {/* Scene lineup — dims when toolbar is active */}
                  <Box sx={sceneLineupSx}>
                      {/* Play button: absolutely straddling the top border */}
                      <Box sx={{
                          ...previewPlayBtnWrapperSx,
                          opacity: isToolbarActive ? 0.38 : 1,
                          pointerEvents: isToolbarActive ? "none" : "auto",
                          transition: "opacity 0.2s"
                      }}>
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

                      {/* Control row: scene count on the right */}
                      <Box sx={{
                          display: "flex", flexDirection: "row", alignItems: "center", height: "32px",
                          opacity: isToolbarActive ? 0.38 : 1,
                          pointerEvents: isToolbarActive ? "none" : "auto",
                          transition: "opacity 0.2s"
                      }}>
                          <Box sx={{ flex: 1 }} />
                          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", color: "text.primary" }}>
                              <Typography variant="body2">Scene {selectedScene + 1}/{SCENE_COUNT}</Typography>
                          </Box>
                      </Box>
                      <Divider />

                      {/* Thumbnails row — disabled + dimmed when a toolbar/panel is active */}
                      <Box sx={thumbnailsRowWrapperSx}>
                          <Box sx={{
                              display: "flex", gap: "12px", overflowX: "auto",
                              padding: "4px 6px 2px 4px",
                              opacity: isToolbarActive ? 0.38 : 1,
                              pointerEvents: isToolbarActive ? "none" : "auto",
                              transition: "opacity 0.2s",
                              userSelect: isToolbarActive ? "none" : "auto"
                          }}>
                              {sceneTypes.map((type, i) =>
                                  type === "custom"
                                      ? <CustomSceneThumbnail key={i} index={i} selected={i === selectedScene} onClick={() => goToScene(i)} />
                                      : <SceneThumbnail key={i} index={i} selected={i === selectedScene}
                                          headingText={i === 0 ? headingText : (sceneContentFor(videoTitle)[i - 1]?.[0] ?? "Scene " + (i + 1))}
                                          subheadingText={i === 0 ? subheadingText : (sceneContentFor(videoTitle)[i - 1]?.[1] ?? "")}
                                          footnoteText={footnoteText} onClick={() => goToScene(i)} />
                              )}
                              {/* Add scene */}
                              <Box sx={addSceneOuterSx}>
                                  <Tooltip title="Add Scene" placement="top" arrow>
                                      <Box
                                          onClick={() => {
                                              setSceneLibOpen(true); setPlaceholderMenuOpen(false); setSelectedElId(null);
                                          }}
                                          sx={addSceneBtnSx}>
                                          <Box component="img" src="/icons/plus.svg" sx={{ width: 20, height: 20 }} />
                                      </Box>
                                  </Tooltip>
                              </Box>
                          </Box>
                      </Box>
                  </Box>
              </Box>
          </Box>

          {/* ── Edit Heading dialog ───────────────────────────────────────────── */}
          <EditHeadingDialog
              open={editHeadingOpen}
              title="Heading"
              currentText={headingText}
              onClose={(newText) => {
                  setHeadingText(newText); setEditHeadingOpen(false); onHeadingChange?.(newText); 
              }}
          />
          <EditHeadingDialog
              open={editSubheadingOpen}
              title="Sub-heading"
              currentText={subheadingText}
              onClose={(newText) => {
                  setSubheadingText(newText); setEditSubheadingOpen(false); onSubheadingChange?.(newText); 
              }}
          />
          <EditHeadingDialog
              open={editFootnoteOpen}
              title="Footnote"
              currentText={footnoteText}
              onClose={(newText) => {
                  setFootnoteText(newText); setEditFootnoteOpen(false); 
              }}
          />

          {/* ── Edit Bullet Point dialog ──────────────────────────────────────── */}
          {selectedEl && (selectedEl.type === "Vertical bullet point" || selectedEl.type === "Horizontal bullet point") && (
              <EditBulletDialog
                  open={editBulletOpen}
                  currentText={selectedEl.text ?? "Placeholder"}
                  bulletIconSize={selectedEl.bulletIconSize ?? "M"}
                  onClose={(newText) => {
                      updateBulletText(selectedEl.id, newText);
                      setEditBulletOpen(false);
                  }}
              />
          )}

          {/* ── Scene Library dialog ──────────────────────────────────────────── */}
          <SceneLibraryDialog
              open={sceneLibOpen}
              onClose={() => setSceneLibOpen(false)}
              onAddScene={(templateId) => {
                  const type = templateId === "custom" ? "custom" : "regular";
                  setSceneTypes(prev => {
                      const next: ("regular" | "custom")[] = [...prev, type]; setSelectedScene(next.length - 1); return next; 
                  });
                  setSceneLibOpen(false);
              }}
          />

          {/* ── Comments panel — draggable + resizable ────────────────────────── */}
          <CommentsPanel
              open={commentsOpen}
              onClose={() => setCommentsOpen(false)}
              threads={threads}
              setThreads={setThreads}
              approverNames={approverNames}
              awaitingApprovers={awaitingApprovers}
              onRequestApproval={() => {
                  setSnackbarMsg(`Version sent for additional approval by ${approverNames}`);
                  onRequestReapproval();
                  setCommentsOpen(false);
              }}
          />


          {/* ── Success snackbar ───────────────────────────────────────────────── */}
          {/* ── Video permission dialog ─────────────────────────────────────── */}
          <VideoPermissionDialog
              open={videoPermOpen}
              onClose={() => setVideoPermOpen(false)}
              initialSettings={videoPermSettings}
              onSave={s => {
                  setVideoPermSettings(s); onPermChange?.(s); setVideoPermOpen(false); 
              }}
          />

          <Snackbar
              open={!!snackbarMsg}
              autoHideDuration={5000}
              onClose={() => setSnackbarMsg(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
              <Alert
                  severity="success"
                  onClose={() => setSnackbarMsg(null)}
                  sx={{ width: "100%" }}
              >
                  {snackbarMsg}
              </Alert>
          </Snackbar>
      </Box>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const thumbLeftCoverSx: SxProps<Theme> = {
    position: "absolute",
    inset: 0,
    width: "50%",
    bgcolor: "background.paper",
    pointerEvents: "none"
};

const studioAppBarSx: SxProps<Theme> = {
    flexShrink: 0,
    // bgcolor handled by AppBar color="secondary"
    borderBottom: "1px solid",
    borderBottomColor: (theme) => alpha(theme.palette.common.white, 0.1)
};

const studioToolbarSx: SxProps<Theme> = {
    height: 56,
    pl: "24px",
    pr: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
};

const studioAppBarLeftSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    minWidth: 0
};

const studioLogoSx: SxProps<Theme> = {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": { opacity: 0.75 }
};

const studioLogoImgSx: SxProps<Theme> = { width: 32, height: 32, objectFit: "contain" };
const menuIconImgSx: SxProps<Theme> = { width: 22, height: 22, objectFit: "contain" };
const canvasElIconImgSx: SxProps<Theme> = { width: 18, height: 18, objectFit: "contain" };

const studioLangBadgeSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    px: "10px",
    py: "4px",
    borderRadius: 1,
    border: "1px solid",
    borderColor: (theme) => alpha(theme.palette.common.white, 0.25),
    cursor: "pointer",
    "&:hover": { bgcolor: (theme) => alpha(theme.palette.common.white, 0.08) }
};

const studioAppBarRightSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    pr: 2
};

// Figma node 21003-129682: width 298px, elevation/11 shadow (DROP_SHADOW #03194F40, 5px blur)
const langDropdownPaperSx: SxProps<Theme> = {
    width: 298,
    mt: "4px",
    boxShadow: "0px 0px 5px 0px rgba(3,25,79,0.25)",
    maxHeight: 350,
    overflowY: "auto"
};

const langInfoCardSx: SxProps<Theme> = {
    bgcolor: "primary.light",
    borderRadius: 1,
    p: 1.5,
    display: "flex",
    gap: 1.5,
    alignItems: "flex-start"
};

const langFlagCircleSx: SxProps<Theme> = {
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

const langMenuItemSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    width: "100%"
};

const studioDividerSx: SxProps<Theme> = {
    borderColor: (theme) => alpha(theme.palette.common.white, 0.2),
    mx: 0.5,
    alignSelf: "center",
    height: 20
};

const studioTooltipSx: SxProps<Theme> = {
    bgcolor: "secondary.main",
    borderRadius: 1,
    px: 1.5,
    py: 1,
    "& .MuiTooltip-arrow": { color: "secondary.main" }
};

const studioPermBtnSx: SxProps<Theme> = {
    color: "common.white",
    bgcolor: (theme) => alpha(theme.palette.common.white, 0.1),
    borderRadius: 1,
    p: "5px",
    border: "1px solid",
    borderColor: (theme) => alpha(theme.palette.common.white, 0.2),
    "&:hover": { bgcolor: (theme) => alpha(theme.palette.common.white, 0.18) }
};

const studioVideoPageBtnSx: SxProps<Theme> = {
    whiteSpace: "nowrap"
};

// Layout-only overrides for TruffleMenuPanel — appearance handled by the component
const studioLeftNavSx: SxProps<Theme> = {
    flexShrink: 0,
    overflowY: "auto",
    pt: 0,
    pb: 2,
    px: 2,
    alignSelf: "stretch"
};

const navSubheaderSx: SxProps<Theme> = {
    color: "text.secondary",
    pt: 2
};

const navItemIconSx: SxProps<Theme> = {};

const studioNavItemTextSx: SxProps<Theme> = {
    my: 0
};

const narrationBarSx: SxProps<Theme> = {
    minHeight: 40,
    bgcolor: "background.paper",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    pl: "4px",
    pr: "16px",
    gap: "4px",
    flexShrink: 0
};

const narrationAvatarSx: SxProps<Theme> = {
    width: 32,
    height: 32,
    borderRadius: "50%",
    bgcolor: "primary.light",
    color: "text.secondary",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
};

const studioContentAreaSx: SxProps<Theme> = {
    flex: 1,
    display: "flex",
    overflow: "hidden"
};

// ─── StudioPage — Stage area ──────────────────────────────────────────────────

const stageContainerSx: SxProps<Theme> = {
    flex: 1,
    bgcolor: "other.editorBackground",
    display: "flex",
    flexDirection: "column",
    overflow: "visible"
};

const livePreviewAreaSx: SxProps<Theme> = {
    flex: 1,
    minHeight: 0,
    display: "grid",
    columnGap: "8px",
    rowGap: "16px",
    px: "32px",
    py: "8px",
    overflow: "auto",
    position: "relative",
    isolation: "isolate"
};

// Container is wider than 16:9 — canvas takes max-content (sized by aspect-ratio + row 1fr height),
// rows 1 & 4 collapse to 0
const containerLargerSx: SxProps<Theme> = {
    gridTemplateColumns: "1fr max-content 1fr",
    gridTemplateRows: "0 minmax(250px, 1fr) max-content 0"
};

// Container is taller relative to 16:9 — canvas takes 1fr (full width), height auto from aspect-ratio,
// rows 1 & 4 are 1fr spacers that center canvas vertically
const containerSmallerSx: SxProps<Theme> = {
    gridTemplateColumns: "max-content 1fr max-content",
    gridTemplateRows: "1fr minmax(250px, max-content) max-content 1fr"
};

const canvasAndToolbarGroupSx: SxProps<Theme> = {
    gridColumn: "2",
    gridRow: "2",
    aspectRatio: "16/9",
    position: "relative",
    overflow: "visible"
};

const prevArrowSx: SxProps<Theme> = {
    gridColumn: "1",
    gridRow: "2",
    alignSelf: "center",
    justifySelf: "end",
    flexShrink: 0
};

const nextArrowSx: SxProps<Theme> = {
    gridColumn: "3",
    gridRow: "2",
    alignSelf: "center",
    justifySelf: "start",
    flexShrink: 0
};

const sceneActionToolbarGridSx: SxProps<Theme> = {
    gridColumn: "3",
    gridRow: "2",
    alignSelf: "flex-start",
    justifySelf: "start",
    height: "fit-content"
};

const narrationGridSx: SxProps<Theme> = {
    gridColumn: "1 / 4",
    gridRow: "3",
    justifySelf: "center"
};

// ─── Placeholder picker panel ─────────────────────────────────────────────────

const placeholderMenuHeaderSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: "20px",
    pt: "18px",
    pb: "12px"
};

const placeholderMenuItemsContainerSx: SxProps<Theme> = {
    px: "12px",
    pb: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
};

const placeholderMenuIconBoxSx: SxProps<Theme> = {
    width: 40,
    height: 40,
    bgcolor: "background.paper",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "divider",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const placeholderMenuBulletIconBoxSx: SxProps<Theme> = {
    width: 40,
    height: 40,
    bgcolor: "primary.main",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const placeholderMenuItemRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    px: "8px",
    py: "8px",
    cursor: "pointer",
    borderRadius: "12px",
    bgcolor: "background.paper",
    "&:hover": { bgcolor: "action.hover" },
    transition: "background 0.12s"
};

// ─── Custom scene canvas ──────────────────────────────────────────────────────

const customSceneBackgroundSx: SxProps<Theme> = {
    overflow: "hidden",
    borderRadius: "8px",
    position: "relative",
    width: "100%",
    height: "100%",
    bgcolor: "background.paper"
};

const customSceneEmptyStateSx: SxProps<Theme> = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px"
};

const elementsOverlaySx: SxProps<Theme> = {
    position: "absolute",
    inset: 0,
    borderRadius: "8px",
    overflow: "visible",
    pointerEvents: "none"
};

// ─── Regular scene canvas ─────────────────────────────────────────────────────

const regularSceneClipBoxSx: SxProps<Theme> = {
    overflow: "hidden",
    borderRadius: "8px",
    position: "relative"
};

const regularSceneImgSx: SxProps<Theme> = {
    width: "100%",
    display: "block"
};

const regularSceneDragAreaSx: SxProps<Theme> = (theme) => ({
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "50%",
    background: `repeating-linear-gradient(-45deg, ${theme.palette.grey[200]} 0px, ${theme.palette.grey[200]} 12px, ${theme.palette.grey[300]} 12px, ${theme.palette.grey[300]} 24px)`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    pointerEvents: "none"
});

const regularSceneHeadingColumnSx: SxProps<Theme> = {
    position: "absolute",
    left: "4%",
    top: "20%",
    width: "44%",
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column"
};

// ─── Scene action toolbar + lineup ────────────────────────────────────────────

const sceneActionToolbarPillSx: SxProps<Theme> = {
    width: 32,
    bgcolor: "background.paper",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "divider",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    p: "4px"
};

const sceneActionIconBtnSx: SxProps<Theme> = {
    p: "3px",
    color: "primary.main",
    borderRadius: "6px",
    "&:hover": { bgcolor: "action.hover" }
};

const headingToolbarPositionSx: SxProps<Theme> = {
    position: "absolute",
    left: "25%",
    top: "30%",
    transform: "translate(-50%, -100%)",
    mb: "4px",
    zIndex: 20,
    pointerEvents: "auto"
};

const subheadingToolbarPositionSx: SxProps<Theme> = {
    position: "absolute",
    left: "25%",
    top: "55%",
    transform: "translate(-50%, -100%)",
    mb: "4px",
    zIndex: 20,
    pointerEvents: "auto"
};

const footnoteToolbarPositionSx: SxProps<Theme> = {
    position: "absolute",
    left: "50%",
    bottom: "3%",
    transform: "translate(-50%, -100%)",
    mb: "4px",
    zIndex: 20,
    pointerEvents: "auto"
};

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

const thumbnailsRowWrapperSx: SxProps<Theme> = {
    position: "relative"
};

const addSceneOuterSx: SxProps<Theme> = {
    position: "sticky",
    right: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    bgcolor: "common.white",
    zIndex: 20,
    ml: "2px",
    mt: "2px",
    flexShrink: 0
};

const addSceneBtnSx: SxProps<Theme> = {
    px: "14px",
    display: "flex",
    alignItems: "center",
    height: "92px",
    mt: "22px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    "&:hover": { bgcolor: "action.hover" }
};

// ─── PlaceholderToolbar (Pill zoom controls) ──────────────────────────────────

// ─── Shared toolbar icon buttons ──────────────────────────────────────────────

// ─── Navigation badge ─────────────────────────────────────────────────────────

const navBadgeSx: SxProps<Theme> = {
    "& .MuiBadge-badge": { fontSize: 9, minWidth: 14, height: 14, padding: 0 }
};
