import { useState } from "react";
import type { SxProps, Theme } from "@mui/material";
import {
    AppBar, Badge, Box, Breadcrumbs, Button, Divider, IconButton, MenuItem,
    SvgIcon, Toolbar, Typography
} from "@mui/material";
import {
    NoOutlineSelect, Search, TruffleAvatar, TruffleIconButton, TruffleLink, TruffleToggleButtonGroup, ToggleIconButton
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTriangleExclamation } from "@fortawesome/pro-regular-svg-icons";
import { faChevronLeft, faChevronRight, faGrip, faArrowUpArrowDown } from "@fortawesome/pro-solid-svg-icons";
import AppSidebar from "../../components/AppSidebar";
import { NotificationBell, type NotificationItem } from "../../panels/NotificationsPanel";
import TemplateCard, { type TemplateItem } from "./TemplateCard";

// ─── Sample data ──────────────────────────────────────────────────────────────
const RECENT_TEMPLATES: TemplateItem[] = [
    { title: "Motivation", editedBy: "Edited on Jan 21 by you", status: "Published", personalized: true, purposeLabels: ["Engagement"] },
    { title: "Nice to see you!", editedBy: "Edited on Jan 15 by you", status: "Published", hasNewDraft: true, purposeLabels: ["Onboarding", "Retention"] },
    { title: "Welcome to SundaySky", editedBy: "Edited on Jan 10 by you", status: "Draft", personalized: true, purposeLabels: ["Onboarding"] },
    { title: "Live Fully in Vietnam", editedBy: "Edited on Dec 30 by you", status: "Published", purposeLabels: ["Marketing", "Awareness"] },
    { title: "Looking forward to talking to you", editedBy: "Edited on Dec 20 by you", status: "Draft", purposeLabels: ["Sales"] }
];

const ALL_TEMPLATES: TemplateItem[] = [
    { title: "Motivation", editedBy: "Edited on Jan 21 by you", status: "Published", personalized: true, purposeLabels: ["Engagement"] },
    { title: "Nice to see you!", editedBy: "Edited on Jan 15 by you", status: "Published", hasNewDraft: true, purposeLabels: ["Onboarding", "Retention"] },
    { title: "Welcome to SundaySky", editedBy: "Edited on Jan 10 by you", status: "Draft", personalized: true, purposeLabels: ["Onboarding"] },
    { title: "Live Fully in Vietnam", editedBy: "Edited on Dec 30 by you", status: "Published", purposeLabels: ["Marketing", "Awareness"] },
    { title: "Looking forward to talking to you", editedBy: "Edited on Dec 20 by you", status: "Draft", purposeLabels: ["Sales"] }
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TemplateLibraryPage({
    onNavigateBack,
    onNavigateToTemplate,
    onCreateTemplateFromScratch,
    notifications
}: {
    onNavigateBack?: () => void;
    onNavigateToTemplate?: (name?: string) => void;
    onCreateTemplateFromScratch?: (name: string) => void;
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
                onTemplateCreated={onCreateTemplateFromScratch ?? (onNavigateToTemplate as ((name: string) => void) | undefined)}
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
                        <Box sx={titleRowRightSx}>
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
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => onNavigateToTemplate?.("New template")}
                            >
                                Create new template
                            </Button>
                        </Box>
                    </Box>

                    {/* ── Recent ── */}
                    <Box sx={sectionBoxSx}>
                        <Typography variant="h2" color="text.primary">Recent</Typography>
                        <Box sx={recentScrollRowSx}>
                            <Box sx={recentScrollContainerSx}>
                                {RECENT_TEMPLATES.map((t, i) => (
                                    <Box key={t.title + i} sx={recentCardSlotSx}>
                                        <TemplateCard template={t} onClick={(name) => onNavigateToTemplate?.(name)} />
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

const titleRowRightSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 2
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

