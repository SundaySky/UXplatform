import { useCallback, useState } from "react";
import {
    AppBar, Badge, Box, Button, Divider, IconButton, ListItemIcon, ListItemText,
    MenuItem, Popover, SvgIcon, Toolbar, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
    Search, ToggleIconButton, TruffleAvatar, TruffleToggleButtonGroup
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars, faFolderPlus, faGear, faCircleQuestion,
    faRightFromBracket, faShield, faArrowUpRightFromSquare
} from "@fortawesome/pro-regular-svg-icons";
import { faChevronLeft, faChevronRight, faGrip, faArrowUpArrowDown } from "@fortawesome/pro-solid-svg-icons";
import AccountSettingsDialog from "../../AccountSettingsDialog";
import AppSidebar from "../../components/AppSidebar";
import type { NewTemplateData } from "../../components/AppSidebar";
import { NotificationBell, type NotificationItem } from "../../panels/NotificationsPanel";
import type { UserRole } from "../../components/TasksPanel";
import { type VideoPermissionSettings } from "../../dialogs/VideoPermissionDialog";
import VideoCard from "./VideoCard";
import FolderCard from "./FolderCard";
import VideoTableView from "./VideoTableView";
import { resolveStatuses, type LiveVideoState, type VideoItem } from "./types";

const RECENT_VIDEOS: VideoItem[] = [
    { title: "Stay Safe During Missile Threats", subtitle: "Essential Safety Protocols", editedBy: "Edited in the past 7 days by you", statuses: ["Draft"], personalized: false },
    { title: "Recent TTS Pronunciation Advancements", subtitle: "Explore New Tools for Enhanced Communication", editedBy: "Edited in the past 7 days by you", statuses: ["Draft"], personalized: true },
    { title: "Prepare for Winter Fun!", subtitle: "Family Bonding through Home Prep", editedBy: "Edited in the past 7 days by you", statuses: ["Draft"], personalized: false },
    { title: "Understanding the American-Israel-Iran Conflict: Peace & Safety", subtitle: undefined, editedBy: "Edited in the past month by you", statuses: ["Draft"], personalized: false },
    { title: "Discover Tel Aviv's Scenic Parks", subtitle: "Urban Oasis Awaits", editedBy: "Edited in the past month by you", statuses: ["Approved for sharing"], personalized: true }
];

export const ALL_VIDEOS: VideoItem[] = [
    { title: "Prepare for Winter Fun!", subtitle: "Family Bonding through Home Prep", editedBy: "Edited in the past month", statuses: ["Approved for sharing"], personalized: true },
    { title: "Stay Safe During Missile Threats", subtitle: "Essential Safety Protocols", editedBy: "Edited on Nov 4, 2025", statuses: ["Downloaded for Sharing"], personalized: false },
    { title: "Doc-to-vid test", subtitle: undefined, editedBy: "Edited on Jan 12", statuses: ["Downloaded"], personalized: true },
    { title: "Testing recording what will happen when the video name is really really long", subtitle: undefined, editedBy: "Edited on Jul 9, 2025", statuses: ["Downloaded"], personalized: false },
    { title: "Recording", subtitle: undefined, editedBy: "Edited on Nov 11, 2025", statuses: ["Downloaded"], personalized: false },
    { title: "Template editor", subtitle: undefined, editedBy: "Edited on Jul 10, 2025", statuses: ["Approved for sharing"], personalized: true },
    { title: "Editor template test", subtitle: undefined, editedBy: "Edited on Apr 29, 2025", statuses: ["Approved for sharing"], personalized: false },
    { title: "Onboarding Steps", subtitle: undefined, editedBy: "Edited on Oct 16, 2025", statuses: ["Downloaded"], personalized: false }
];

const FOLDERS = [
    { name: "Announcements", count: 3 },
    { name: "Old campaigns", count: 0 },
    { name: "Sales", count: 1 },
    { name: "Onboarding videos Se...", count: 0 },
    { name: "Copilot drafts", count: 3 },
    { name: "Archive", count: 0 }
];

export default function VideoLibraryPage({
    onSelectVideo,
    onEditVideo,
    onNavigateToTemplate,
    onCreateTemplateFromScratch,
    onTemplateAdded,
    notifications,
    videoStates,
    onPermChange,
    onSubmitForApproval,
    approvalsEnabled = false,
    approverIds = new Set(),
    approversList = [],
    onApprovalsEnabledChange,
    onApproversChange,
    onApproversListChange,
    onCancelUserApprovals,
    onUserDeletionBlocked: parentOnUserDeletionBlocked,
    accountSettingsOpen: externalAccountSettingsOpen = false,
    accountSettingsInitialTab: externalAccountSettingsInitialTab = "users",
    onAccountSettingsOpen,
    userRole
}: {
  onSelectVideo: (v: VideoItem) => void
  onEditVideo?: (v: VideoItem) => void
  onNavigateToTemplate?: () => void
  onCreateTemplateFromScratch?: (name: string) => void
  onTemplateAdded?: (data: NewTemplateData) => void
  notifications?: NotificationItem[]
  videoStates?: Record<string, LiveVideoState>
  onPermChange?: (key: string, s: VideoPermissionSettings) => void
  onSubmitForApproval?: (videoKey: string, approvers: string[]) => void
  approvalsEnabled?: boolean
  approverIds?: Set<string>
  approversList?: { value: string; label: string }[]
  onApprovalsEnabledChange?: (enabled: boolean, hasPendingApprovals?: boolean) => void
  onApproversChange?: (ids: Set<string>) => void
  onApproversListChange?: (approvers: { value: string; label: string }[]) => void
  onCancelUserApprovals?: (userId: string) => void
  onUserDeletionBlocked?: (userId: string, reason: "only-approver" | "pending-approvals") => void
  accountSettingsOpen?: boolean
  accountSettingsInitialTab?: "users" | "permissions" | "approvals" | "access"
  onAccountSettingsOpen?: (open: boolean) => void
  userRole?: UserRole
}) {
    const [_accountSettingsOpen, setAccountSettingsOpen] = useState(false);
    const [_accountSettingsInitialTab, setAccountSettingsInitialTab] = useState<"users" | "permissions" | "approvals" | "access">("users");
    const accountSettingsOpen = externalAccountSettingsOpen ?? _accountSettingsOpen;
    const accountSettingsInitialTab = externalAccountSettingsInitialTab ?? _accountSettingsInitialTab;
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);

    const pendingApprovalsCount = videoStates
        ? Object.values(videoStates).filter(v => v.sentApprovers?.length > 0).length
        : 0;

    const handleApprovalsEnabledChange = useCallback((enabled: boolean, hasPendingApprovals?: boolean) => {
        onApprovalsEnabledChange?.(enabled, hasPendingApprovals && pendingApprovalsCount > 0);
    }, [onApprovalsEnabledChange, pendingApprovalsCount]);

    const handleApproversChange = useCallback((ids: Set<string>) => {
        onApproversChange?.(ids);
    }, [onApproversChange]);

    const handleApproversListChange = useCallback((approvers: { value: string; label: string }[]) => {
        onApproversListChange?.(approvers);
    }, [onApproversListChange]);

    const handleUserDeletionBlocked = useCallback((userId: string, reason: "only-approver" | "pending-approvals") => {
        parentOnUserDeletionBlocked?.(userId, reason);
    }, [parentOnUserDeletionBlocked]);

    return (
        <Box sx={pageRootSx}>
            <AccountSettingsDialog
                open={accountSettingsOpen}
                initialTab={accountSettingsInitialTab}
                onClose={() => {
                    setAccountSettingsOpen(false);
                    setAccountSettingsInitialTab("users");
                    onAccountSettingsOpen?.(false);
                }}
                approvalsEnabled={approvalsEnabled}
                approverIds={approverIds}
                approversList={approversList}
                videoStates={videoStates}
                onApprovalsEnabledChange={handleApprovalsEnabledChange}
                onApproversChange={handleApproversChange}
                onApproversListChange={handleApproversListChange}
                onCancelUserApprovals={onCancelUserApprovals}
                onUserDeletionBlocked={handleUserDeletionBlocked}
                pendingApprovalsCount={pendingApprovalsCount}
                userRole={userRole}
            />
            <AppSidebar onTemplateLibraryClick={onNavigateToTemplate} onTemplateCreated={onCreateTemplateFromScratch} onTemplateAdded={onTemplateAdded} />

            <Box sx={mainColumnSx}>
                {/* AppBar */}
                <AppBar position="sticky" color="inherit" elevation={0} sx={appBarSx}>
                    <Toolbar variant="dense" sx={toolbarSx}>
                        {/* Right: search, bell, user */}
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
                            <Box
                                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                                sx={userMenuTriggerSx}
                            >
                                <Typography variant="body2" color="text.secondary" sx={userMenuAccountNameSx}>
                                    Acme Corp
                                </Typography>
                                <Badge
                                    variant="dot"
                                    color="error"
                                    overlap="circular"
                                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                >
                                    <TruffleAvatar text="MC" size="medium" sx={userAvatarSx} />
                                </Badge>
                            </Box>

                            {/* ── User menu popover ── */}
                            <Popover
                                open={Boolean(userMenuAnchor)}
                                anchorEl={userMenuAnchor}
                                onClose={() => setUserMenuAnchor(null)}
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                transformOrigin={{ vertical: "top", horizontal: "right" }}
                                PaperProps={{ sx: userMenuPaperSx }}
                            >
                                {/* Header */}
                                <Box sx={userMenuHeaderSx}>
                                    <TruffleAvatar text="ND" size="large" sx={userMenuAvatarSx} />
                                    <Box>
                                        <Typography variant="subtitle1">naor.daniel@sundaysky.com</Typography>
                                        <Typography variant="body1" color="text.secondary">Naor playground</Typography>
                                    </Box>
                                </Box>

                                {/* Switch account button */}
                                <Box sx={userMenuSwitchBtnBoxSx}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<FontAwesomeIcon icon={faArrowUpArrowDown} />}
                                    >
                                        Switch to SundaySky Amplify
                                    </Button>
                                </Box>

                                <Divider />

                                {/* Menu items */}
                                <MenuItem onClick={() => {
                                    setUserMenuAnchor(null); setAccountSettingsOpen(true); setAccountSettingsInitialTab("users"); onAccountSettingsOpen?.(true); 
                                }}>
                                    <ListItemIcon><SvgIcon sx={menuIconSx}><FontAwesomeIcon icon={faGear} /></SvgIcon></ListItemIcon>
                                    <ListItemText>Account settings</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => setUserMenuAnchor(null)}>
                                    <ListItemIcon><SvgIcon sx={menuIconSx}><FontAwesomeIcon icon={faCircleQuestion} /></SvgIcon></ListItemIcon>
                                    <ListItemText>
                                        <Box sx={menuItemWithLinkSx}>
                                            Get Help
                                            <SvgIcon sx={externalLinkIconSx}><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></SvgIcon>
                                        </Box>
                                    </ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => setUserMenuAnchor(null)}>
                                    <ListItemIcon><SvgIcon sx={menuIconSx}><FontAwesomeIcon icon={faRightFromBracket} /></SvgIcon></ListItemIcon>
                                    <ListItemText>Sign-Out</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => setUserMenuAnchor(null)}>
                                    <ListItemIcon><SvgIcon sx={menuIconSx}><FontAwesomeIcon icon={faShield} /></SvgIcon></ListItemIcon>
                                    <ListItemText>
                                        <Box sx={menuItemWithLinkSx}>
                                            Privacy Policy
                                            <SvgIcon sx={externalLinkIconSx}><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></SvgIcon>
                                        </Box>
                                    </ListItemText>
                                </MenuItem>
                            </Popover>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Box sx={pageContentSx}>
                    {/* Page title */}
                    <Box sx={breadcrumbBarSx}>
                        <Typography variant="h1" sx={breadcrumbTitleSx}>
                            Video Library
                        </Typography>
                    </Box>
                    {/* View toggle row */}
                    <Box sx={pageTitleRowSx}>
                        <Box sx={viewToggleBoxSx}>
                            <Typography variant="caption" sx={captionSecondaryColorSx}>View as</Typography>
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

                    {/* ── Recent ── */}
                    <Box sx={sectionBoxSx}>
                        <Typography variant="h2" sx={headingPrimaryColorSx}>Recent</Typography>
                        <Box sx={recentScrollRowSx}>
                            {/* Scroll container */}
                            <Box sx={recentScrollContainerSx}>
                                {RECENT_VIDEOS.map((v, i) => (
                                    <Box key={v.title + i} sx={recentCardSlotSx}>
                                        <VideoCard
                                            video={{ ...v, statuses: resolveStatuses(v, videoStates) }}
                                            liveState={videoStates?.[v.title]}
                                            onClick={() => onSelectVideo(v)}
                                            onEdit={() => (onEditVideo ?? onSelectVideo)(v)}
                                            onPermChange={onPermChange}
                                            onSubmitForApproval={onSubmitForApproval}
                                            approversList={approversList}
                                            approvalsEnabled={approvalsEnabled}
                                        />
                                    </Box>
                                ))}
                            </Box>
                            {/* Left chevron — absolute overlay */}
                            <IconButton color="primary" size="medium" sx={chevronBtnLeftSx}>
                                <SvgIcon><FontAwesomeIcon icon={faChevronLeft} /></SvgIcon>
                            </IconButton>
                            {/* Right chevron — absolute overlay */}
                            <IconButton color="primary" size="medium" sx={chevronBtnRightSx}>
                                <SvgIcon><FontAwesomeIcon icon={faChevronRight} /></SvgIcon>
                            </IconButton>
                        </Box>
                    </Box>

                    {/* ── Folders ── */}
                    <Box sx={foldersSectionSx}>
                        <Box sx={sectionHeaderRowSx}>
                            <Typography variant="h2" sx={headingPrimaryColorSx}>
                                Folders ({FOLDERS.length})
                            </Typography>
                            <Button
                                variant="outlined"
                                size="medium"
                                startIcon={<FontAwesomeIcon icon={faFolderPlus} />}
                                onClick={() => {}}
                            >
                                New Folder
                            </Button>
                        </Box>
                        <Box sx={foldersGridSx}>
                            {FOLDERS.map(f => <FolderCard key={f.name} name={f.name} count={f.count} />)}
                        </Box>
                    </Box>

                    {/* ── Videos ── */}
                    <Typography variant="h2" sx={videosSectionHeadingSx}>
                        Videos ({ALL_VIDEOS.length})
                    </Typography>
                    {viewMode === "list" ? (
                        <VideoTableView
                            videos={ALL_VIDEOS}
                            videoStates={videoStates}
                            onSelect={onSelectVideo}
                            onEdit={onEditVideo ?? onSelectVideo}
                        />
                    ) : (
                        <Box sx={videosGridSx}>
                            {ALL_VIDEOS.map((v, i) => (
                                <VideoCard
                                    key={v.title + "-all-" + i}
                                    video={{ ...v, statuses: resolveStatuses(v, videoStates) }}
                                    liveState={videoStates?.[v.title]}
                                    onClick={() => onSelectVideo(v)}
                                    onEdit={() => (onEditVideo ?? onSelectVideo)(v)}
                                    onPermChange={onPermChange}
                                    onSubmitForApproval={onSubmitForApproval}
                                    approversList={approversList}
                                    approvalsEnabled={approvalsEnabled}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

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

const userMenuTriggerSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    height: 40,
    maxWidth: 152,
    border: 1,
    borderColor: "divider",
    borderRadius: "20px",
    p: "4px",
    cursor: "pointer",
    "&:hover": { bgcolor: "action.hover" }
};

const userMenuAccountNameSx: SxProps<Theme> = {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    mx: "4px",
    whiteSpace: "nowrap"
};

const userAvatarSx: SxProps<Theme> = {
    bgcolor: "secondary.main",
    color: "common.white"
};

const pageContentSx: SxProps<Theme> = {
    flex: 1,
    overflow: "auto",
    px: 4,
    pb: 3
};

const breadcrumbBarSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    pt: 4,
    pl: 0
};

const breadcrumbTitleSx: SxProps<Theme> = {
    color: "secondary.main"
};

const pageTitleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    mb: 0
};

const viewToggleBoxSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px"
};

const sectionBoxSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
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

const foldersSectionSx: SxProps<Theme> = {
    mb: 4
};

const sectionHeaderRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    mb: 2
};

const foldersGridSx: SxProps<Theme> = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 1.5
};

const videosGridSx: SxProps<Theme> = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
    rowGap: "24px",
    columnGap: "24px",
    pb: 4
};

const appBarDividerSx: SxProps<Theme> = {
    height: 20,
    alignSelf: "center",
    borderColor: "divider"
};

const headingPrimaryColorSx: SxProps<Theme> = {
    color: "text.primary"
};

const captionSecondaryColorSx: SxProps<Theme> = {
    color: "text.secondary"
};

const videosSectionHeadingSx: SxProps<Theme> = {
    color: "text.primary",
    mb: 2
};

const userMenuPaperSx: SxProps<Theme> = {
    width: 300,
    borderRadius: 2,
    mt: 0.5
};

const userMenuHeaderSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    px: 2,
    py: 2.5
};

const userMenuAvatarSx: SxProps<Theme> = {
    bgcolor: "secondary.main",
    color: "common.white",
    flexShrink: 0
};

const userMenuSwitchBtnBoxSx: SxProps<Theme> = {
    px: 2,
    pb: 2
};

const menuIconSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "text.secondary"
};

const menuItemWithLinkSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 0.75
};

const externalLinkIconSx: SxProps<Theme> = {
    fontSize: "11px !important",
    width: "11px !important",
    height: "11px !important",
    color: "text.disabled"
};
