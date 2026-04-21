import { useState } from "react";
import type { SxProps, Theme } from "@mui/material";
import {
    AppBar, Badge, Box, Breadcrumbs, Button, Divider, IconButton, MenuItem, Menu,
    SvgIcon, Toolbar, Typography
} from "@mui/material";
import {
    Label, NoOutlineSelect, Search, ThumbnailActions, TruffleAvatar, TruffleIconButton,
    TruffleLink, TruffleMenuItem, TruffleToggleButtonGroup, ToggleIconButton,
    TypographyWithTooltipOnOverflow
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay, faPen, faEllipsisVertical, faBars, faFolder,
    faCopy, faCircleInfo, faLayerGroup, faArrowsRotate,
    faFilm, faUsers, faTriangleExclamation
} from "@fortawesome/pro-regular-svg-icons";
import { faChevronLeft, faChevronRight, faGrip, faArrowUpArrowDown } from "@fortawesome/pro-solid-svg-icons";
import { AppSidebar } from "./VideoLibraryPage";
import { NotificationBell, type NotificationItem } from "./NotificationsPanel";

const IMG_THUMB = "/thumb.svg";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TemplateItem {
    title: string;
    editedBy: string;
    status: "Published" | "Draft";
    personalized?: boolean;
    hasNewDraft?: boolean;
}

// ─── Sample data ──────────────────────────────────────────────────────────────
const RECENT_TEMPLATES: TemplateItem[] = [
    { title: "Motivation", editedBy: "Edited on Jan 21 by you", status: "Published", personalized: true },
    { title: "Nice to see you!", editedBy: "Edited on Jan 15 by you", status: "Published", hasNewDraft: true },
    { title: "Welcome to SundaySky", editedBy: "Edited on Jan 10 by you", status: "Draft", personalized: true },
    { title: "Live Fully in Vietnam", editedBy: "Edited on Dec 30 by you", status: "Published" },
    { title: "Looking forward to talking to you", editedBy: "Edited on Dec 20 by you", status: "Draft" }
];

const ALL_TEMPLATES: TemplateItem[] = [
    { title: "Motivation", editedBy: "Edited on Jan 21 by you", status: "Published", personalized: true },
    { title: "Nice to see you!", editedBy: "Edited on Jan 15 by you", status: "Published", hasNewDraft: true },
    { title: "Welcome to SundaySky", editedBy: "Edited on Jan 10 by you", status: "Draft", personalized: true },
    { title: "Live Fully in Vietnam", editedBy: "Edited on Dec 30 by you", status: "Published" },
    { title: "Looking forward to talking to you", editedBy: "Edited on Dec 20 by you", status: "Draft" }
];

// ─── Dashed label (DS gap: Truffle Label has no dashed-border variant) ─────────
function DashedLabel({ label }: { label: string }) {
    return (
        <Box sx={dashedLabelSx}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
    );
}

// ─── Template card ────────────────────────────────────────────────────────────
function TemplateCard({ template, onClick }: { template: TemplateItem; onClick?: () => void }) {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const openMenu = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setMenuAnchor(e.currentTarget);
    };

    return (
        <Box sx={templateCardSx}>
            <ThumbnailActions
                ContentProps={{ sx: thumbContentSx }}
                showActions="onHover"
                leftActions={
                    <Box sx={thumbLeftActionsSx}>
                        <TruffleIconButton
                            size="small"
                            color="white"
                            variant="contained"
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                        >
                            <FontAwesomeIcon icon={faPlay} />
                        </TruffleIconButton>
                        <Button
                            variant="contained"
                            color="white"
                            size="small"
                            startIcon={<FontAwesomeIcon icon={faPen} />}
                        >
                            Edit
                        </Button>
                    </Box>
                }
                onClick={onClick}
                sx={thumbnailActionsSx}
            >
                <Box component="img" src={IMG_THUMB} alt="" sx={thumbImgSx} />
                {/* Status labels overlaid at bottom-left of thumbnail */}
                <Box sx={thumbnailLabelsOverlaySx}>
                    <Label
                        label={template.status}
                        color={template.status === "Published" ? "success" : "default"}
                        size="small"
                        startIcon={
                            <SvgIcon sx={labelIconSx}>
                                <FontAwesomeIcon icon={template.status === "Published" ? faArrowsRotate : faFilm} />
                            </SvgIcon>
                        }
                    />
                    {template.personalized && (
                        <Label
                            label="Personalized"
                            size="small"
                            variant="outlined"
                            startIcon={
                                <SvgIcon sx={labelIconSx}>
                                    <FontAwesomeIcon icon={faUsers} />
                                </SvgIcon>
                            }
                            sx={{ bgcolor: "background.paper" }}
                        />
                    )}
                </Box>
            </ThumbnailActions>

            {/* Card body */}
            <Box sx={cardBodySx}>
                <Box sx={cardTitleRowSx}>
                    <TypographyWithTooltipOnOverflow variant="h5" multiline sx={cardTitleSx}>
                        {template.title}
                    </TypographyWithTooltipOnOverflow>
                    <TruffleIconButton
                        size="small"
                        onClick={openMenu}
                        sx={threeDotsBtnSx}
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                    >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </TruffleIconButton>
                </Box>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {template.editedBy}
                </Typography>
                {/* Always rendered to keep all cards the same height */}
                <Box sx={{ visibility: template.hasNewDraft ? "visible" : "hidden" }}>
                    <DashedLabel label="New version draft" />
                </Box>
            </Box>

            {/* Context menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                onClick={(e) => e.stopPropagation()}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: menuPaperSx } }}
            >
                <Box sx={menuHeaderSx} onClick={(e) => e.stopPropagation()}>
                    <Typography variant="h5" sx={menuTitleSx}>{template.title}</Typography>
                    <Box sx={menuTagsRowSx}>
                        <Label label="Purpose" color="info" size="small" />
                        <Label label="Long purpose label" color="default" size="small" />
                        <Label label="+2" color="default" size="small" />
                    </Box>
                    <Box sx={menuLocationSx}>
                        <SvgIcon sx={menuFolderIconSx}>
                            <FontAwesomeIcon icon={faFolder} />
                        </SvgIcon>
                        <Typography variant="caption" color="text.secondary">
                            Template library
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={menuDividerSx} />
                <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                    <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                    Details
                </TruffleMenuItem>
                <TruffleMenuItem onClick={() => {
                    setMenuAnchor(null); onClick?.(); 
                }}>
                    <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faLayerGroup} /></SvgIcon>
                    Template Page
                </TruffleMenuItem>
                <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                    <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faCopy} /></SvgIcon>
                    Duplicate
                </TruffleMenuItem>
            </Menu>
        </Box>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TemplateLibraryPage({
    onNavigateBack,
    onNavigateToTemplate,
    notifications
}: {
    onNavigateBack?: () => void;
    onNavigateToTemplate?: () => void;
    notifications?: NotificationItem[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortValue, setSortValue] = useState("lastEdited");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    return (
        <Box sx={pageRootSx}>
            <AppSidebar
                selectedNav="Template Library"
                onVideoLibraryClick={onNavigateBack}
            />

            <Box sx={mainColumnSx}>
                {/* AppBar */}
                <AppBar position="sticky" color="inherit" elevation={0} sx={appBarSx}>
                    <Toolbar variant="dense" sx={toolbarSx}>
                        <Box sx={appBarRightSx}>
                            <Search
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onClear={() => setSearchQuery("")}
                                numberOfResults={0}
                                placeholder="Search libraries"
                                sx={searchSx}
                            />
                            <NotificationBell notifications={notifications} />
                            <Divider orientation="vertical" flexItem sx={appBarDividerSx} />
                            <Box sx={userMenuTriggerSx}>
                                <Badge
                                    variant="dot"
                                    color="error"
                                    overlap="circular"
                                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                >
                                    <TruffleAvatar text="MC" size="medium" />
                                </Badge>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Box sx={pageContentSx}>
                    {/* Title row */}
                    <Box sx={titleRowSx}>
                        <Breadcrumbs>
                            <Typography variant="h1" color="secondary.main">
                                Amplify Template Library
                            </Typography>
                        </Breadcrumbs>
                        <TruffleLink
                            href="#"
                            startIcon={
                                <SvgIcon sx={howToIconSx}>
                                    <FontAwesomeIcon icon={faTriangleExclamation} />
                                </SvgIcon>
                            }
                        >
                            How to create a template
                        </TruffleLink>
                    </Box>

                    {/* ── Recent ── */}
                    <Box sx={sectionBoxSx}>
                        <Typography variant="h2" color="text.primary">Recent</Typography>
                        <Box sx={recentScrollRowSx}>
                            <Box sx={recentScrollContainerSx}>
                                {RECENT_TEMPLATES.map((t, i) => (
                                    <Box key={t.title + i} sx={recentCardSlotSx}>
                                        <TemplateCard template={t} onClick={onNavigateToTemplate} />
                                    </Box>
                                ))}
                            </Box>
                            <IconButton color="primary" size="medium" sx={chevronBtnLeftSx}>
                                <SvgIcon><FontAwesomeIcon icon={faChevronLeft} /></SvgIcon>
                            </IconButton>
                            <IconButton color="primary" size="medium" sx={chevronBtnRightSx}>
                                <SvgIcon><FontAwesomeIcon icon={faChevronRight} /></SvgIcon>
                            </IconButton>
                        </Box>
                    </Box>

                    {/* ── Sort + View action bar ── */}
                    <Box sx={actionBarSx}>
                        <Box sx={sortViewRowSx}>
                            <Typography variant="caption" color="text.secondary">Sort</Typography>
                            <NoOutlineSelect
                                value={sortValue}
                                onChange={(e) => setSortValue(e.target.value as string)}
                            >
                                <MenuItem value="lastEdited">Last edited</MenuItem>
                                <MenuItem value="created">Created</MenuItem>
                                <MenuItem value="name">Name</MenuItem>
                            </NoOutlineSelect>
                            <TruffleIconButton
                                size="small"
                                placeholder={undefined}
                                onPointerEnterCapture={undefined}
                                onPointerLeaveCapture={undefined}
                            >
                                <FontAwesomeIcon icon={faArrowUpArrowDown} />
                            </TruffleIconButton>
                            <Typography variant="caption" color="text.secondary">View as</Typography>
                            <TruffleToggleButtonGroup
                                value={viewMode}
                                exclusive
                                onChange={(_e, val) => {
                                    if (val) {
                                        setViewMode(val);
                                    } 
                                }}
                                variant="outlined"
                            >
                                <ToggleIconButton value="grid" icon={<FontAwesomeIcon icon={faGrip} />} />
                                <ToggleIconButton value="list" icon={<FontAwesomeIcon icon={faBars} />} />
                            </TruffleToggleButtonGroup>
                        </Box>
                    </Box>

                    {/* ── Templates ── */}
                    <Typography variant="h2" color="text.primary" sx={templatesSectionHeadingSx}>
                        Templates ({ALL_TEMPLATES.length})
                    </Typography>
                    <Box sx={templatesGridSx}>
                        {ALL_TEMPLATES.map((t, i) => (
                            <TemplateCard key={t.title + i} template={t} onClick={onNavigateToTemplate} />
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageRootSx: SxProps<Theme> = {
    display: "flex",
    height: "100%",
    bgcolor: "background.default",
    overflow: "hidden"
};

const mainColumnSx: SxProps<Theme> = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0
};

const appBarSx: SxProps<Theme> = {
    flexShrink: 0,
    bgcolor: "background.paper",
    color: "primary.main",
    boxShadow: (theme) => `inset 0 -1px 0 ${theme.palette.divider}`
};

const toolbarSx: SxProps<Theme> = {
    justifyContent: "flex-end",
    px: 4,
    gap: 2
};

const appBarRightSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1.5
};

const searchSx: SxProps<Theme> = (theme) => ({
    minWidth: "183px",
    [theme.breakpoints.up("xs")]: { width: "183px" },
    [theme.breakpoints.up(820)]: { width: "268px" }
});

const appBarDividerSx: SxProps<Theme> = {
    height: 20,
    alignSelf: "center",
    borderColor: "divider"
};

const userMenuTriggerSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    height: 40,
    border: 1,
    borderColor: "divider",
    borderRadius: "20px",
    p: "4px",
    cursor: "pointer",
    "&:hover": { bgcolor: "action.hover" }
};

const pageContentSx: SxProps<Theme> = {
    flex: 1,
    overflow: "auto",
    px: 4,
    py: 3
};

const titleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    pt: 4,
    mb: 3
};

const howToIconSx: SxProps<Theme> = {
    fontSize: "14px !important",
    width: "14px !important",
    height: "14px !important",
    color: "warning.main"
};

const actionBarSx: SxProps<Theme> = {
    display: "flex",
    justifyContent: "flex-end",
    mb: 2
};

const sortViewRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1
};

const sectionBoxSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    pl: 1,
    mb: 4
};

const recentScrollRowSx: SxProps<Theme> = {
    position: "relative",
    display: "flex",
    flexDirection: "column"
};

const recentScrollContainerSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "row",
    gap: "24px",
    overflow: "auto",
    scrollBehavior: "smooth",
    p: "16px",
    bgcolor: "primary.light",
    flexGrow: 1,
    "&::-webkit-scrollbar-thumb": { visibility: "hidden" }
};

const recentCardSlotSx: SxProps<Theme> = {
    width: "310px",
    flexShrink: 0,
    "&:last-of-type": { mr: "16px" }
};

const chevronBtnLeftSx: SxProps<Theme> = {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1
};

const chevronBtnRightSx: SxProps<Theme> = {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1
};

const templatesSectionHeadingSx: SxProps<Theme> = {
    mb: 2
};

const templatesGridSx: SxProps<Theme> = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
    rowGap: "24px",
    columnGap: "24px",
    pb: 4
};

// ─── Template card styles ─────────────────────────────────────────────────────

const templateCardSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    p: 1,
    bgcolor: "background.paper",
    borderRadius: 1,
    "&:hover": { boxShadow: 24 },
    transition: "box-shadow 0.15s"
};

const thumbnailActionsSx: SxProps<Theme> = {
    width: "100%"
};

const thumbContentSx: SxProps<Theme> = {
    aspectRatio: "16/9",
    width: "100%",
    overflow: "hidden"
};

const thumbImgSx: SxProps<Theme> = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block"
};

const thumbLeftActionsSx: SxProps<Theme> = {
    display: "flex",
    gap: "4px",
    alignItems: "center"
};

const thumbnailLabelsOverlaySx: SxProps<Theme> = {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
    zIndex: 1
};

const dashedLabelSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    border: "1px dashed",
    borderColor: "divider",
    borderRadius: "4px",
    px: 1,
    py: "2px"
};

const labelIconSx: SxProps<Theme> = {
    fontSize: "12px !important",
    width: "12px !important",
    height: "12px !important"
};

const cardBodySx: SxProps<Theme> = {
    pt: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px"
};

const cardTitleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "flex-start",
    gap: "6px"
};

const cardTitleSx: SxProps<Theme> = {
    flex: 1,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: "42px",
    lineHeight: 1.5
};

const threeDotsBtnSx: SxProps<Theme> = {
    mt: "-2px",
    flexShrink: 0
};

// ─── Card menu styles ─────────────────────────────────────────────────────────

const menuPaperSx: SxProps<Theme> = {
    minWidth: 256,
    mt: "4px",
    py: "4px"
};

const menuHeaderSx: SxProps<Theme> = {
    px: 2,
    pt: "10px",
    pb: 1
};

const menuTitleSx: SxProps<Theme> = {
    color: "text.primary",
    lineHeight: 1.4,
    mb: "6px"
};

const menuTagsRowSx: SxProps<Theme> = {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
    mb: "6px"
};

const menuLocationSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "4px"
};

const menuFolderIconSx: SxProps<Theme> = {
    fontSize: "13px !important",
    width: "13px !important",
    height: "13px !important",
    color: "text.secondary"
};

const menuDividerSx: SxProps<Theme> = {
    my: "4px"
};

const menuItemIconSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "action.active",
    mr: 1
};

