import { useState } from "react";
import {
    Box,
    Typography,
    IconButton,
    Button,
    Badge,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Paper,
    SvgIcon,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Menu,
    AppBar,
    Toolbar,
    Link,
    useTheme
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import ApprovalDialog from "./ApprovalDialog";
import ConfirmationDialog from "./ConfirmationDialog";
import ApproveVideoDialog from "./ApproveVideoDialog";
import CancelApprovalDialog from "./CancelApprovalDialog";
import VideoLibraryPage, { type VideoItem, PermAvatarGroup } from "./VideoLibraryPage";
import { INITIAL_USERS } from "./AccountSettingsDialog";
import StudioPage, { TOTAL_COMMENT_COUNT, INITIAL_THREADS } from "./StudioPage";
import { type NotificationItem } from "./NotificationsPanel";
import VideoPermissionDialog, { type VideoPermissionSettings } from "./VideoPermissionDialog";
import { OWNER_USER, type PermissionUser } from "./ManageAccessDialog";

import { Label, AttentionBox, AttentionBoxTitle, AttentionBoxContent, AttentionBoxActions, TruffleLink, TruffleAvatar, Search, TruffleMenuItem, TypographyWithTooltipOnOverflow } from "@sundaysky/smartvideo-hub-truffle-component-library";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEllipsisVertical, faArrowLeft, faArrowRight, faPen, faShareNodes, faChartBar,
    faArrowsRotate, faFolder, faCircleInfo, faLock, faCopy, faLayerGroup, faBoxArchive,
    faTrash, faLink, faFileExport, faArrowDown, faPalette, faUsers, faMicrophone,
    faCircleQuestion, faXmark, faCircleCheck, faCheck, faImages, faKey, faEye, faEdit,
    faGlobe, faTriangleExclamation
} from "@fortawesome/pro-regular-svg-icons";


// ─── Figma asset: split-template preview (template left + media right)
const imgVideoPreview = "/thumb.svg";


// ─── Approver lookup ──────────────────────────────────────────────────────────
const APPROVER_USERS: Record<string, string> = {
    sjohnson:   "Sarah Johnson",
    mchen:      "Michael Chen",
    erodriguez: "Emma Rodriguez",
    jwilson:    "James Wilson"
};
function formatApproverNames(approvers: string[]): string {
    const names = approvers.map(v => APPROVER_USERS[v] || v);
    if (names.length === 0) {
        return "";
    }
    if (names.length === 1) {
        return names[0];
    }
    if (names.length === 2) {
        return `${names[0]} and ${names[1]}`;
    }
    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

// ─── "Updated" link label (primary blue text, DS: TruffleLink color=Primary) ──
function UpdatedLabel() {
    return <Label label="Updated" color="info" size="small" />;
}

// ─── Circular icon avatar ─────────────────────────────────────────────────────
function CircularIconAvatar({ icon }: { icon: React.ReactNode }) {
    return (
        <Box sx={circularIconAvatarSx}>
            {icon}
        </Box>
    );
}

// ─── Video permission strip (video page metadata row) ─────────────────────────
function VideoPermissionStrip({
    settings,
    onManageClick
}: {
  settings?: VideoPermissionSettings
  onManageClick: () => void
}) {
    const s = settings ?? {
        tab: "teams" as const, everyoneRole: "viewer" as const,
        users: [] as PermissionUser[], ownerUsers: [OWNER_USER], noDuplicate: false
    };
    const { tab, everyoneRole, users, ownerUsers } = s;
    const isPrivate = tab === "private";
    const showEveryone = tab === "teams" && everyoneRole !== "restricted";

    const navyTipSx = {
        bgcolor: "secondary.main", borderRadius: "8px", px: 1.5, py: 1,
        "& .MuiTooltip-arrow": { color: "secondary.main" }
    };

    // Mini avatar chip — uses role icon instead of initials
    function AvatarChip({ roleType, label, tip }: { roleType: "owner" | "editor" | "viewer"; label?: string; tip: string }) {
        const roleIcon = roleType === "owner" ? faKey
            : roleType === "editor" ? faEdit
                : faEye;
        return (
            <Tooltip title={tip} placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
                <Box sx={avatarChipOuterSx}>
                    <Box sx={avatarChipIconBoxSx}>
                        <SvgIcon sx={avatarChipRoleIconSx}>
                            <FontAwesomeIcon icon={roleIcon} />
                        </SvgIcon>
                    </Box>
                    {label && (
                        <Typography variant="body2" sx={textSecondaryColorSx}>
                            {label}
                        </Typography>
                    )}
                </Box>
            </Tooltip>
        );
    }

    const rowIcon = isPrivate
        ? <SvgIcon sx={lockIconSuccessSx}><FontAwesomeIcon icon={faLock} /></SvgIcon>
        : <SvgIcon sx={lockIconPrimarySx}><FontAwesomeIcon icon={faLock} /></SvgIcon>;

    return (
        <Box
            onClick={onManageClick}
            sx={permStripRowSx}
        >
            <CircularIconAvatar icon={rowIcon} />

            <Box sx={minWidthZeroSx}>
                {/* Label row */}
                <Typography variant="caption" sx={permStripLabelSx}>
                    {isPrivate ? "Video access — Only you can see this video" : "Video access"}
                </Typography>

                {/* Indicators — all users shown with name, then Everyone at the end */}
                <Box sx={permStripIndicatorsRowSx}>
                    {/* Owner(s) — each with key icon + name + "(Owner)" */}
                    {ownerUsers.slice(0, 3).map((u) => (
                        <AvatarChip
                            key={u.id}
                            roleType="owner"
                            label={`${u.name} (Owner)`}
                            tip={`${u.name}${u.id === OWNER_USER.id ? " (You)" : ""} — Can manage access`}
                        />
                    ))}

                    {/* Specific users — always show with role icon + name regardless of everyoneRole */}
                    {tab === "teams" && users.map(pu => (
                        <AvatarChip
                            key={pu.user.id}
                            roleType={pu.role === "editor" ? "editor" : "viewer"}
                            label={pu.user.name}
                            tip={`${pu.user.name} — Can ${pu.role === "editor" ? "edit" : "view"}`}
                        />
                    ))}

                    {/* Separator before "Everyone" */}
                    {showEveryone && (
                        <Box sx={everyoneSeparatorSx} />
                    )}

                    {/* Everyone indicator — users icon */}
                    {showEveryone && (
                        <Tooltip
                            title={`Everyone in your account — Can ${everyoneRole === "editor" ? "edit" : "view"}`}
                            placement="top" arrow
                            componentsProps={{ tooltip: { sx: navyTipSx } }}
                        >
                            <Box sx={avatarChipOuterSx}>
                                <Box sx={everyoneIconBoxSx}>
                                    <SvgIcon sx={everyoneIconSx}>
                                        <FontAwesomeIcon icon={faUsers} />
                                    </SvgIcon>
                                </Box>
                                <Typography sx={textSecondaryColorSx}>
                  Everyone in your account
                                </Typography>
                            </Box>
                        </Tooltip>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

// ─── Wordmark ─────────────────────────────────────────────────────────────────
function SundaySkyLogo() {
    return (
        <Box sx={logoBoxSx}>
            <Typography variant="caption" sx={logoTypographySx}>
        SUNDAY<Box component="span" sx={logoSkySx}>SKY</Box>
            </Typography>
        </Box>
    );
}

// ─── Left Sidebar (video page) ────────────────────────────────────────────────
function Sidebar({
    effectiveStatus,
    videoTitle,
    onNavigateToLibrary,
    videoPermSettings,
    onManageAccess,
    selectedNav = "edit",
    onNavChange
}: {
  effectiveStatus: "draft" | "pending" | "approved"
  videoTitle: string
  onNavigateToLibrary: () => void
  videoPermSettings?: VideoPermissionSettings
  onManageAccess?: () => void
  selectedNav?: "edit" | "share" | "analyze"
  onNavChange?: (nav: "edit" | "share" | "analyze") => void
}) {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    return (
        <Box sx={sidebarContainerSx}>
            <Box
                onClick={onNavigateToLibrary}
                sx={sidebarLogoClickSx}
            >
                <SundaySkyLogo />
            </Box>

            {/* Back to Video Library */}
            <Box
                onClick={onNavigateToLibrary}
                sx={sidebarBackNavSx}
            >
                <SvgIcon sx={sidebarBackIconSx}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </SvgIcon>
                <Typography variant="body1" noWrap sx={textSecondaryColorSx}>
                    Video Library
                </Typography>
            </Box>

            {/* Video name + options */}
            <Box sx={sidebarTitleRowSx}>
                <TypographyWithTooltipOnOverflow variant="h3" sx={{ color: "text.primary", flex: 1 }}>
                    {videoTitle}
                </TypographyWithTooltipOnOverflow>
                <IconButton size="medium" onClick={e => setMenuAnchor(e.currentTarget)} sx={sidebarMenuIconButtonSx}>
                    <SvgIcon fontSize="small"><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                </IconButton>
                {/* Three-dot menu */}
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    slotProps={{ paper: { sx: menuPaperSx } }}
                >
                    {/* Header */}
                    <Box sx={menuHeaderBoxSx}>
                        <Typography variant="h5" sx={menuHeaderTitleSx}>
                            {videoTitle}
                        </Typography>
                        <Box sx={menuHeaderFolderRowSx}>
                            <SvgIcon sx={menuHeaderFolderIconSx}>
                                <FontAwesomeIcon icon={faFolder} />
                            </SvgIcon>
                            <Typography variant="caption" sx={textSecondaryColorSx}>
                                Shared assets
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={menuDividerSx} />

                    <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                        <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                        Details
                    </TruffleMenuItem>

                    <TruffleMenuItem onClick={() => {
                        setMenuAnchor(null); onManageAccess?.();
                    }}
                    secondaryAction={<PermAvatarGroup settings={videoPermSettings} coloredAvatars={false} />}
                    >
                        <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faLock} /></SvgIcon>
                        Video access
                    </TruffleMenuItem>

                    <Divider sx={menuDividerSx} />

                    <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                        <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faCopy} /></SvgIcon>
                        Duplicate video
                    </TruffleMenuItem>

                    <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                        <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faLayerGroup} /></SvgIcon>
                        Video to template
                    </TruffleMenuItem>

                    <Divider sx={menuDividerSx} />

                    <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                        <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faFolder} /></SvgIcon>
                        Move to folder
                    </TruffleMenuItem>

                    <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                        <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faBoxArchive} /></SvgIcon>
                        Archive
                    </TruffleMenuItem>

                    <TruffleMenuItem error onClick={() => setMenuAnchor(null)}>
                        <SvgIcon sx={menuItemDeleteIconSx}><FontAwesomeIcon icon={faTrash} /></SvgIcon>
                        Delete
                    </TruffleMenuItem>
                </Menu>
            </Box>

            {/* Status chip — "Video/template status bank"
          Figma spec: display:flex, flex-direction:column, justify-content:center,
          align-items:flex-start, padding:1px 0px, width:246px, height:25px         */}
            <Box sx={sidebarStatusChipBoxSx}>
                <Label
                    label={effectiveStatus === "pending" ? "Pending approval" : effectiveStatus === "approved" ? "Approved for sharing" : "Draft"}
                    color={effectiveStatus === "approved" ? "info" : "default"}
                    size="small"
                />
            </Box>

            <Divider sx={sidebarDividerSx} />

            {/* Nav items */}
            <Box sx={sidebarNavBoxSx}>
                <List disablePadding sx={sidebarNavListSx}>
                    <ListItemButton selected={selectedNav === "edit"} onClick={() => onNavChange?.("edit")} sx={{ justifyContent: "space-between" }}>
                        <Box sx={navItemRowSx}>
                            <ListItemIcon sx={navItemIconContainerSx}>
                                <SvgIcon sx={navItemIconSx}>
                                    <FontAwesomeIcon icon={faPen} />
                                </SvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="Edit" primaryTypographyProps={{ variant: "body2", sx: textPrimaryColorSx }} />
                        </Box>
                        <SvgIcon sx={navItemUpdatedIconSx}>
                            <FontAwesomeIcon icon={faArrowsRotate} />
                        </SvgIcon>
                    </ListItemButton>

                    <ListItemButton selected={selectedNav === "share"} onClick={() => onNavChange?.("share")}>
                        <ListItemIcon sx={navItemIconContainerSx}>
                            <SvgIcon sx={navItemIconSx}>
                                <FontAwesomeIcon icon={faShareNodes} />
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary="Share" primaryTypographyProps={{ variant: "body2", sx: textPrimaryColorSx }} />
                    </ListItemButton>

                    <ListItemButton selected={selectedNav === "analyze"} onClick={() => onNavChange?.("analyze")}>
                        <ListItemIcon sx={navItemIconContainerSx}>
                            <SvgIcon sx={navItemIconSx}>
                                <FontAwesomeIcon icon={faChartBar} />
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary="Analyze" primaryTypographyProps={{ variant: "body2", sx: textPrimaryColorSx }} />
                    </ListItemButton>
                </List>
            </Box>

            <Box sx={flexOneSx} />

            {/* User footer */}
            <Divider />
            <Box sx={sidebarFooterRowSx}>
                <Box sx={sidebarFooterUserSx}>
                    <Badge variant="dot" color="error" overlap="circular"
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                        <TruffleAvatar text="MC" size="medium" />
                    </Badge>
                    <Box sx={minWidthZeroSx}>
                        <Typography variant="body1" noWrap sx={textPrimaryColorSx}>
                            Maya Carmel
                        </Typography>
                        <Typography variant="body2" noWrap sx={textSecondaryColorSx}>
                            maya-carmel-playgr...
                        </Typography>
                    </Box>
                </Box>
                <IconButton size="medium" sx={iconButtonActiveColorSx}>
                    <SvgIcon fontSize="small"><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                </IconButton>
            </Box>
        </Box>
    );
}

// ─── Video preview card ───────────────────────────────────────────────────────
function VideoPreviewCard({
    videoPhase,
    effectiveStatus,
    approvers,
    pendingTooltip,
    headingText,
    subheadingText,
    videoTitle,
    onSentForApproval,
    onEdit,
    onApproveVideo,
    videoPermSettings,
    onManageAccess,
    approvalsEnabled = false
}: {
  videoPhase: number
  effectiveStatus: "draft" | "pending" | "approved"
  approvers: string[]
  pendingTooltip: string
  headingText?: string
  subheadingText?: string
  videoTitle?: string
  onSentForApproval: () => void
  onEdit: (fromComments?: boolean) => void
  onApproveVideo: () => void
  videoPermSettings?: VideoPermissionSettings
  onManageAccess: () => void
  approvalsEnabled?: boolean
}) {
    function ActionButton() {
    // ── Phase 0 + pending: after approval dialog sent ─────────────────────
        if (videoPhase === 0 && effectiveStatus === "pending") {
            return (
                <Tooltip title={pendingTooltip} placement="top" arrow
                    componentsProps={{
                        tooltip: { sx: darkTooltipSx },
                        arrow:   { sx: darkTooltipArrowSx }
                    }}
                >
                    <Button variant="outlined" size="small" color="success"
                        startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>}
                    >
                        Pending approval
                    </Button>
                </Tooltip>
            );
        }

        // ── Phase 1: "1 of N approvers responded" — outlined warning + rich tooltip ─
        if (videoPhase === 1) {
            const total = approvers.length;
            const respondedName = APPROVER_USERS[approvers[0]] ?? "Sarah Johnson";
            const pendingNames = approvers.slice(1).map(k => APPROVER_USERS[k] ?? k);
            return (
                <Tooltip
                    placement="top"
                    arrow
                    title={
                        <Box sx={tooltipContentBoxSx}>
                            <Typography sx={tooltipTextWithMbSx}>
                • {respondedName} left feedback on Mar 15
                            </Typography>
                            {pendingNames.map((name, i) => (
                                <Typography key={i} sx={{ color: "common.white", display: "block", mb: i === pendingNames.length - 1 ? "8px" : "2px" }}>
                  • {name} hasn't responded yet
                                </Typography>
                            ))}
                            <Typography sx={tooltipTextBlockSx}>
                Comments will be available once all approvers have responded.
                            </Typography>
                        </Box>
                    }
                    componentsProps={{
                        tooltip: { sx: darkTooltipPhase1Sx },
                        arrow:   { sx: darkTooltipArrowSx }
                    }}
                >
                    <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        onClick={() => onEdit(true)}
                        startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>}
                    >
                        1 of {total} approver{total !== 1 ? "s" : ""} responded
                    </Button>
                </Tooltip>
            );
        }

        // ── Phase 2: "View [x] approver comments and edit" — primary + chat icon ──
        if (videoPhase === 2) {
            return (
                <Button variant="contained" size="small" color="primary"
                    startIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
                            <path d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4C169.1 433.1 212.2 448 256 448c141.4 0 256-93.1 256-208S397.4 32 256 32z" />
                        </svg>
                    }
                    onClick={() => onEdit(true)}
                >
          View {TOTAL_COMMENT_COUNT} comments in Studio
                </Button>
            );
        }

        // ── Phase 4: already approved, no changes — text variant, success ────────
        if (videoPhase === 4) {
            return (
                <Button
                    variant="text"
                    size="large"
                    color="success"
                    startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faCheck} /></SvgIcon>}
                    data-tracking-id="tracking-id-video-page-edit-tab-approve-version-btn"
                    disabled
                    sx={approveSuccessBgSx}
                >
                    Approved
                </Button>
            );
        }

        // ── Phase 3: video ready for approval — outlined primary ────────────────
        if (videoPhase === 3) {
            return (
                <Tooltip
                    title="Allows you to share the video with viewers"
                    placement="top"
                    arrow
                    componentsProps={{
                        tooltip: { sx: darkTooltipSx },
                        arrow:   { sx: darkTooltipArrowSx }
                    }}
                >
                    <Button
                        variant="outlined"
                        size="large"
                        color="primary"
                        startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faCheck} /></SvgIcon>}
                        onClick={onApproveVideo}
                        data-tracking-id="tracking-id-video-page-edit-tab-approve-version-btn"
                    >
                        Approve
                    </Button>
                </Tooltip>
            );
        }

        // ── Phase 0, draft: button depends on approvalsEnabled ───────────────────
        if (!approvalsEnabled) {
            // When approvals are OFF: show "Approve"
            return (
                <Button variant="outlined" size="large" color="primary"
                    startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faCheck} /></SvgIcon>}
                    onClick={onApproveVideo}
                    data-tracking-id="tracking-id-video-page-edit-tab-approve-version-btn"
                >
                    Approve
                </Button>
            );
        }

        // When approvals are ON: show "Submit for approval"
        return (
            <Button variant="contained" size="small" color="primary"
                startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faCircleCheck} /></SvgIcon>}
                onClick={onSentForApproval}
            >
                Submit for approval
            </Button>
        );
    }

    return (
        <Paper
            variant="outlined"
            sx={videoPreviewCardPaperSx}
        >
            {/* Action bar */}
            <Box sx={cardActionBarSx}>
                <Button
                    variant="outlined"
                    size="large"
                    color="primary"
                    startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faPen} /></SvgIcon>}
                    onClick={() => onEdit(false)}
                >
                    Edit
                </Button>

                <ActionButton />
            </Box>

            <Divider sx={dividerSx} />

            {/* Preview — first scene with heading/sub-heading overlaid */}
            <Box sx={previewContainerSx}>
                <Box component="img" src={imgVideoPreview} alt={videoTitle ?? "Video preview"}
                    sx={previewImgSx} />

                {/* Left half — white bg + accent line */}
                <Box sx={previewLeftHalfSx}>
                    <Box sx={previewAccentLineSx} />
                </Box>

                {/* Right half — drag media */}
                <Box sx={previewRightHalfSx}>
                    <SvgIcon sx={previewDragIconSx}>
                        <FontAwesomeIcon icon={faImages} />
                    </SvgIcon>
                    <Typography variant="caption" sx={previewDragTextSx}>
                        Drag media here
                    </Typography>
                </Box>

                {/* Text overlays — canvas-specific cqw units */}
                <Box sx={previewTextOverlaySx}>
                    <Typography sx={previewHeadingTypographySx}>
                        {headingText ?? videoTitle ?? ""}
                    </Typography>
                    <Typography sx={previewSubheadingTypographySx}>
                        {subheadingText ?? "Sub-heading Placeholder"}
                    </Typography>
                </Box>

                {/* Footnote */}
                <Box sx={previewFootnoteBoxSx}>
                    <Typography sx={previewFootnoteTypographySx}>
                        Footnote placeholder
                    </Typography>
                </Box>
            </Box>

            <Divider sx={dividerSx} />

            {/* Last edited */}
            <Box sx={cardMetaRowSx}>
                <TruffleAvatar text="MC" size="small" />
                <Box>
                    <Typography variant="caption" sx={captionBlockSx}>
            Last Edited
                    </Typography>
                    <Typography variant="body1" sx={textPrimaryColorSx}>
            Mar 12, 1:21 PM
                    </Typography>
                </Box>
            </Box>

            <Divider sx={dividerSx} />

            {/* Video permission strip */}
            <VideoPermissionStrip
                settings={videoPermSettings}
                onManageClick={onManageAccess}
            />

            <Divider sx={dividerSx} />

            {/* Data & Personalization (personalized video — has a data library) */}
            <Box sx={cardMetaRowSx}>
                <CircularIconAvatar icon={<SvgIcon sx={dataPersonalizationIconSx}><FontAwesomeIcon icon={faLayerGroup} /></SvgIcon>} />
                <Box>
                    <Typography variant="caption" sx={captionBlockWithMbSx}>
            Data &amp; Personalization
                    </Typography>
                    <Typography variant="body1" sx={textPrimaryColorSx}>
            Test library
                    </Typography>
                </Box>
            </Box>

            <Divider sx={dividerSx} />

            {/* Languages */}
            <Box sx={cardMetaRowSx}>
                <CircularIconAvatar icon={<SvgIcon sx={globeIconSx}><FontAwesomeIcon icon={faGlobe} /></SvgIcon>} />
                <Box>
                    <Typography variant="caption" sx={captionBlockWithMb2Sx}>
            Languages
                    </Typography>
                    <Box sx={languageChipSx}>
                        <Box component="span" sx={languageFlagSx}>🇺🇸</Box>
                        <Typography variant="caption" sx={textSecondaryColorSx}>
              English
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}

// ─── Right panel ──────────────────────────────────────────────────────────────
// Layout per Figma 19047:29100 (top → bottom):
//   1. Review options
//   2. Account libraries updated
//   3. Approval in progress AttentionBox (pending state only)
function ReviewOptionsPanel({ isPending }: { isPending: boolean }) {
    const [attentionDismissed, setAttentionDismissed] = useState(false);

    return (
        <Box sx={reviewPanelContainerSx}>

            {/* ── 1. Review options ──────────────────────────────────────────────── */}
            <Paper variant="outlined" sx={reviewPaperSx}>
                <Box sx={reviewPanelHeaderRowSx}>
                    <Typography variant="subtitle2" sx={reviewPanelTitleSx}>
                        Send video for review (single version)
                    </Typography>
                    <Tooltip title="Options for reviewing this video">
                        <SvgIcon sx={panelInfoIconSx}>
                            <FontAwesomeIcon icon={faCircleInfo} />
                        </SvgIcon>
                    </Tooltip>
                </Box>
                <List disablePadding dense>
                    {[
                        { icon: faLink, label: "Get a Preview Link" },
                        { icon: faFileExport, label: "Export a script" },
                        { icon: faArrowDown, label: "Download a draft" }
                    ].map(({ icon, label }) => (
                        <ListItemButton key={label} dense sx={reviewListItemButtonSx}>
                            <ListItemIcon sx={reviewListItemIconContainerSx}>
                                <SvgIcon sx={panelListIconSx}>
                                    <FontAwesomeIcon icon={icon} />
                                </SvgIcon>
                            </ListItemIcon>
                            <ListItemText primary={label} primaryTypographyProps={{ variant: "body1" }} />
                        </ListItemButton>
                    ))}
                </List>
            </Paper>

            {/* ── 2. Account libraries updated ──────────────────────────────────── */}
            <Paper variant="outlined" sx={reviewPaperSx}>
                <Box sx={reviewPanelHeader2RowSx}>
                    <Box sx={reviewPanelHeader2InnerSx}>
                        <SvgIcon sx={updatedIconSx}>
                            <FontAwesomeIcon icon={faArrowsRotate} />
                        </SvgIcon>
                        <Typography variant="subtitle2" sx={textPrimaryColorSx}>
                            Account libraries updated
                        </Typography>
                    </Box>
                    <Tooltip title="About account library updates">
                        <SvgIcon sx={panelInfoIconSx}>
                            <FontAwesomeIcon icon={faCircleQuestion} />
                        </SvgIcon>
                    </Tooltip>
                </Box>
                <Typography sx={textSecondaryColorSx}>
          Review this version before approving and sharing to ensure any changes affecting this video are acceptable.
                </Typography>
                <List disablePadding dense>
                    {[
                        { icon: faPalette, label: "\"<brand name>\"" },
                        { icon: faUsers, label: "\"<data library name>\"" },
                        { icon: faMicrophone, label: "Word pronunciation" }
                    ].map(({ icon, label }) => (
                        <Box key={label} sx={reviewLibraryItemRowSx}>
                            <ListItemIcon sx={reviewListItemIconContainerSx}>
                                <SvgIcon sx={panelListIconSx}>
                                    <FontAwesomeIcon icon={icon} />
                                </SvgIcon>
                            </ListItemIcon>
                            <Typography variant="caption" sx={reviewLibraryItemLabelSx}>
                                {label}
                            </Typography>
                            <UpdatedLabel />
                        </Box>
                    ))}
                </List>
            </Paper>

            {/* ── 3. Approval in progress AttentionBox (pending only, bottom) ───── */}
            {isPending && !attentionDismissed && (
                <AttentionBox
                    color="warning"
                    icon={<SvgIcon><FontAwesomeIcon icon={faTriangleExclamation} /></SvgIcon>}
                    CloseIconButtonProps={{ onClick: () => setAttentionDismissed(true) }}
                    HelpCenterIconButtonProps={{ onClick: () => {} }}
                >
                    <AttentionBoxTitle>Approval in progress</AttentionBoxTitle>
                    <AttentionBoxContent>
                        <Typography variant="body1">
                            Approval request sent to the approver. You can also share the video using the link.
                        </Typography>
                    </AttentionBoxContent>
                    <AttentionBoxActions>
                        <TruffleLink startIcon={<SvgIcon sx={truffleLinkIconSx}><FontAwesomeIcon icon={faLink} /></SvgIcon>}>Share video using link</TruffleLink>
                    </AttentionBoxActions>
                </AttentionBox>
            )}
        </Box>
    );
}

// ─── Tasks panel ─────────────────────────────────────────────────────────────
// One task at a time · I'm done · navigate · start / clear session
interface Task { id: number; label: string | string[]; done: boolean }

const INITIAL_TASKS: Task[] = [
    { id: 1, label: "You've finished a draft video and need formal approval, by Sarah and Emma from the Legal team, before it can be shared.", done: false },
    { id: 2, label: ["You want to check and review any response to your approval request.", "You also realized the opening scene heading is missing 2026 and you want to add it at the end of the heading."], done: false },
    { id: 3, label: "Sarah mentioned she submitted feedback for your approval", done: false },
    { id: 4, label: "After completing all changes and receiving approval, the video is ready to go live.", done: false },
    { id: 5, label: "You are creating a video for a top-secret new product launching later this year. You and Eli Bogan are the only persons authorized to edit this video. No one else can view or access the video or its assets.", done: false },
    { id: 6, label: "The privacy team at your company is concerned that employees might misuse the CEO, Chris's avatar to create deepfake content. They've asked you to ensure that other users in the organization cannot access or use this avatar.", done: false },
    { id: 7, label: "You're preparing a video for approval, and your boss told you that Michelle Cohen from Legal needs to approve it.", done: false },
    { id: 8, label: "Jarvis is no longer with the company", done: false }
];

type SessionState = "idle" | "active" | "survey" | "complete"

function TasksPanel({ onTaskDone }: { onTaskDone?: (taskIdx: number) => void }) {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [session, setSession] = useState<SessionState>("active"); // auto-start
    const [currentIdx, setCurrentIdx] = useState(0);
    const [surveyStep, setSurveyStep] = useState<1 | 2>(1);
    const [surveyQ1, setSurveyQ1] = useState<number | null>(null);
    const [surveyQ2, setSurveyQ2] = useState<number | null>(null);
    const [surveyWhy1, setSurveyWhy1] = useState("");
    const [surveyWhy2, setSurveyWhy2] = useState("");
    const [pendingNext, setPendingNext] = useState<number | null>(null); // idx to go to after survey

    const doneCount = tasks.filter(t => t.done).length;

    // Clear resets ALL session state and restarts from task 1
    const clearSession = () => {
        setTasks(INITIAL_TASKS.map(t => ({ ...t, done: false })));
        setCurrentIdx(0);
        setSession("active");
        setSurveyStep(1); setSurveyQ1(null); setSurveyQ2(null); setSurveyWhy1(""); setSurveyWhy2(""); setPendingNext(null);
    };

    const markDone = () => {
        const updated = tasks.map((task, i) => i === currentIdx ? { ...task, done: true } : task);
        setTasks(updated);
        onTaskDone?.(currentIdx);
        const allDone = updated.every(t => t.done);
        if (allDone) {
            setPendingNext(null);
        }
        else {
            let next = currentIdx + 1;
            while (next < updated.length && updated[next].done) {
                next++;
            }
            setPendingNext(next < updated.length ? next : null);
        }
        setSurveyStep(1); setSurveyQ1(null); setSurveyQ2(null); setSurveyWhy1(""); setSurveyWhy2("");
        setSession("survey");
    };

    const advanceSurvey = () => {
        if (surveyStep === 1) {
            setSurveyStep(2);
            setSurveyQ2(null); setSurveyWhy2("");
        }
        else {
            submitSurvey();
        }
    };

    const submitSurvey = () => {
        if (pendingNext !== null) {
            setCurrentIdx(pendingNext);
            setSession("active");
        }
        else {
            setSession("complete");
        }
        setSurveyStep(1); setSurveyQ1(null); setSurveyQ2(null); setSurveyWhy1(""); setSurveyWhy2(""); setPendingNext(null);
    };

    const currentTask = tasks[currentIdx];

    return (
        <Box sx={tasksPanelContainerSx}>
            {/* ── Header ───────────────────────────────────────────────────────── */}
            <Box sx={tasksPanelHeaderSx}>
                <Box>
                    <Typography variant="h5" sx={textPrimaryColorSx}>
            Tasks
                    </Typography>
                    <Typography variant="caption" sx={tasksCounterTypographySx}>
                        {doneCount} / {tasks.length} done
                    </Typography>
                </Box>
                <Tooltip title="Restart — resets all tasks">
                    <IconButton size="small" onClick={clearSession} sx={tasksRestartButtonSx}>
                        <SvgIcon sx={tasksRestartIconSx}><FontAwesomeIcon icon={faArrowsRotate} /></SvgIcon>
                    </IconButton>
                </Tooltip>
            </Box>

            {/* ── All done state ────────────────────────────────────────────────── */}
            {session === "complete" && (
                <Box sx={tasksDoneStateSx}>
                    <SvgIcon sx={tasksDoneIconSx}><FontAwesomeIcon icon={faCircleCheck} /></SvgIcon>
                    <Typography variant="h5" sx={tasksDoneTitleSx}>
            All tasks complete!
                    </Typography>
                    <Typography variant="caption" sx={tasksDoneSubtitleSx}>
            Great work. Click restart to run through again.
                    </Typography>
                    <Button
                        size="small" variant="outlined" onClick={clearSession}
                        startIcon={<SvgIcon sx={tasksRestartSmallIconSx}><FontAwesomeIcon icon={faArrowsRotate} /></SvgIcon>}
                    >
            Restart
                    </Button>
                </Box>
            )}

            {/* ── Survey dialog ─────────────────────────────────────────────────── */}
            {(() => {
                const isQ1 = surveyStep === 1;
                const qLabel = isQ1
                    ? "Overall, how easy or difficult was this task?"
                    : "How confident are you that you completed the task correctly?";
                const qValue = isQ1 ? surveyQ1 : surveyQ2;
                const setQ = isQ1 ? setSurveyQ1 : setSurveyQ2;
                const qWhy = isQ1 ? surveyWhy1 : surveyWhy2;
                const setWhy = isQ1 ? setSurveyWhy1 : setSurveyWhy2;
                return (
                    <Dialog
                        open={session === "survey"}
                        maxWidth="xs"
                        fullWidth
                        slotProps={{ paper: { sx: surveyDialogPaperSx } }}
                    >
                        <DialogTitle sx={surveyDialogTitleSx}>
                            <Typography variant="caption" sx={textSecondaryColorSx}>
                Question {surveyStep} of 2
                            </Typography>
                            <IconButton size="small" onClick={submitSurvey} sx={surveyCloseButtonSx}>
                                <SvgIcon sx={tasksRestartIconSx}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={surveyDialogContentSx}>
                            <Typography variant="h5" sx={textPrimaryColorSx}>
                                {qLabel}
                            </Typography>

                            {/* 7-point scale */}
                            <Box sx={surveyScaleRowSx}>
                                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                    <Box
                                        key={n}
                                        onClick={() => setQ(n)}
                                        sx={{
                                            flex: 1, height: 36, borderRadius: "6px", cursor: "pointer",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            border: `1.5px solid ${qValue === n ? "primary.main" : "grey.400"}`,
                                            bgcolor: qValue === n ? "primary.main" : "background.paper",
                                            transition: "all 0.15s",
                                            "&:hover": { borderColor: "primary.main", bgcolor: qValue === n ? "primary.main" : "primary.light" }
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ color: qValue === n ? "background.paper" : "text.primary" }}>
                                            {n}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={surveyScaleLabelRowSx}>
                                <Typography variant="caption" sx={textSecondaryColorSx}>Very Difficult</Typography>
                                <Typography variant="caption" sx={textSecondaryColorSx}>Very Easy</Typography>
                            </Box>

                            {/* Why */}
                            <TextField
                                label="Why?"
                                placeholder="Tell us more (optional)"
                                multiline
                                rows={2}
                                size="small"
                                value={qWhy}
                                onChange={e => setWhy(e.target.value)}
                            />
                        </DialogContent>

                        <DialogActions sx={surveyDialogActionsSx}>
                            <Button
                                fullWidth
                                variant="contained"
                                disabled={qValue === null}
                                onClick={advanceSurvey}
                            >
                                {surveyStep === 1 ? "Next" : pendingNext !== null ? "Next task" : "Finish"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                );
            })()}

            {/* ── Active task ───────────────────────────────────────────────────── */}
            {session === "active" && currentTask && (
                <Box sx={tasksActiveSessionSx}>

                    {/* Progress bar */}
                    <Box sx={tasksProgressAreaSx}>
                        <Box sx={tasksProgressLabelRowSx}>
                            <Typography sx={tasksProgressLabelTypographySx}>
                Task {currentIdx + 1} of {tasks.length}
                            </Typography>
                            <Typography variant="caption" sx={textSecondaryColorSx}>
                                {doneCount} done
                            </Typography>
                        </Box>
                        <Box sx={tasksProgressTrackSx}>
                            <Box sx={{
                                height: "100%", bgcolor: "primary.main", borderRadius: 2,
                                width: `${(doneCount / tasks.length) * 100}%`,
                                transition: "width 0.3s ease"
                            }} />
                        </Box>
                    </Box>

                    {/* Scrollable content: task card + button + dots nav */}
                    <Box sx={tasksScrollableSx}>

                        {/* Task card — fixed min-height so button doesn't shift between tasks */}
                        <Box sx={{
                            bgcolor: currentTask.done ? "success.light" : "background.paper",
                            border: 1, borderColor: currentTask.done ? "success.main" : "grey.400",
                            borderRadius: "10px", p: 2, mt: "10px",
                            height: 300,
                            overflow: "hidden",
                            display: "flex", flexDirection: "column", gap: "8px",
                            transition: "background-color 0.2s, border-color 0.2s"
                        }}>
                            {currentTask.done && (
                                <Box sx={taskDoneIndicatorRowSx}>
                                    <SvgIcon sx={taskDoneIndicatorIconSx}><FontAwesomeIcon icon={faCircleCheck} /></SvgIcon>
                                    <Typography variant="caption" sx={taskDoneLabelSx}>
                    Done
                                    </Typography>
                                </Box>
                            )}
                            {(Array.isArray(currentTask.label) ? currentTask.label : [currentTask.label]).map((para, i) => (
                                <Typography key={i} variant="body1" sx={{
                                    mt: i > 0 ? "8px" : 0,
                                    color: currentTask.done ? "text.secondary" : "text.primary",
                                    textDecoration: currentTask.done ? "line-through" : "none"
                                }}>
                                    {para}
                                </Typography>
                            ))}
                        </Box>

                        {/* I'm done */}
                        <Button
                            fullWidth
                            variant="contained"
                            color={currentTask.done ? "success" : "primary"}
                            disabled={currentTask.done}
                            onClick={markDone}
                            sx={{ mt: "10px" }}
                        >
                            {currentTask.done ? "✓  Done" : "I'm done"}
                        </Button>

                        {/* Dot navigation */}
                        <Box sx={tasksDotNavRowSx}>
                            <IconButton size="small" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)} sx={iconButtonActiveColorSx}>
                                <SvgIcon sx={tasksRestartIconSx}><FontAwesomeIcon icon={faArrowLeft} /></SvgIcon>
                            </IconButton>
                            <Box sx={tasksDotsSx}>
                                {tasks.map((task, i) => (
                                    <Box
                                        key={task.id}
                                        onClick={() => setCurrentIdx(i)}
                                        sx={{
                                            width: i === currentIdx ? 16 : 6, height: 6, borderRadius: 3,
                                            bgcolor: task.done ? "success.main" : i === currentIdx ? "primary.main" : "grey.500",
                                            cursor: "pointer", transition: "all 0.2s"
                                        }}
                                    />
                                ))}
                            </Box>
                            <IconButton size="small" disabled={currentIdx === tasks.length - 1} onClick={() => setCurrentIdx(i => i + 1)} sx={iconButtonActiveColorSx}>
                                <SvgIcon sx={tasksRestartIconSx}><FontAwesomeIcon icon={faArrowRight} /></SvgIcon>
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
// Phase 0 = initial draft
// Phase 1 = task 1 done: "1 of 2 approvers responded", Pending approval
// Phase 2 = task 2 done: "View 10 approver comments and edit", Pending approval
// Phase 3 = task 3 done: "Approve" button, status "Approved for sharing"
// Phase 4 = task 4 done: Approved for sharing
const PHASE_STATUS: Record<number, "draft" | "pending" | "approved"> = { 0: "draft", 1: "pending", 2: "pending", 3: "approved", 4: "approved" };

// Per-video state — each video has its own phase, pageState, sentApprovers, and commentsCleared flag
type VideoState = { phase: number; pageState: "draft" | "pending"; sentApprovers: string[]; commentsCleared?: boolean; headingText?: string; subheadingText?: string; permSettings?: VideoPermissionSettings; sentAt?: string }
const DEFAULT_VIDEO_STATE: VideoState = { phase: 0, pageState: "draft", sentApprovers: [] };

export default function App() {
    const theme = useTheme();
    const [currentPage, setCurrentPage] = useState<"video" | "library" | "studio">("library");
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const [videoStates, setVideoStates] = useState<Record<string, VideoState>>({});
    const [dialogStep, setDialogStep] = useState<"closed" | "form" | "confirmed">("closed");
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [cancelApprovalDialogOpen, setCancelApprovalDialogOpen] = useState(false);
    const [openCommentsOnStudio, setOpenCommentsOnStudio] = useState(false);
    const [openCommentsCounter, setOpenCommentsCounter] = useState(0);
    const [videoPermDialogOpen, setVideoPermDialogOpen] = useState(false);
    // Approval settings
    const [approvalsEnabled, setApprovalsEnabled] = useState(false);
    const [approverIds, setApproverIds] = useState<Set<string>>(new Set());
    const [approversList, setApproversList] = useState<{ value: string; label: string }[]>(
        () => INITIAL_USERS
            .filter(u => u.createSpace.includes("Approver"))
            .map(u => ({ value: u.user.id, label: `${u.user.name} (${u.user.email})` }))
    );
    const [pendingApprovalsDialogOpen, setPendingApprovalsDialogOpen] = useState(false);
    const [pendingApprovalsWarningReason, setPendingApprovalsWarningReason] = useState<"turn-off" | "delete-user" | null>(null);
    const [approvalsDisabledDialogOpen, setApprovalsDisabledDialogOpen] = useState(false);
    const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
    const [accountSettingsInitialTab, setAccountSettingsInitialTab] = useState<"users" | "permissions" | "approvals" | "access">("users");
    const [videoNavTab, setVideoNavTab] = useState<"edit" | "share" | "analyze">("edit");

    // Derive current video's state from the map (defaults to fresh draft)
    const currentKey = selectedVideo?.title || "Stay Safe During Missile Threats";
    const currentVState: VideoState = videoStates[currentKey] ?? DEFAULT_VIDEO_STATE;
    const videoPhase = currentVState.phase;
    const pageState = currentVState.pageState;
    const sentApprovers = currentVState.sentApprovers;
    const videoPermSettings = currentVState.permSettings;

    // Helper to partially update a video's state entry
    function updateVideoState(key: string, patch: Partial<VideoState>) {
        setVideoStates(prev => ({
            ...prev,
            [key]: { ...(prev[key] ?? DEFAULT_VIDEO_STATE), ...patch }
        }));
    }

    // Phase drives status; also allow the approval dialog to flip phase-0 to pending
    const effectiveStatus: "draft" | "pending" | "approved" =
    videoPhase > 0 ? PHASE_STATUS[videoPhase] : pageState;
    const isPending = effectiveStatus === "pending";

    // ── Phase-based notifications ────────────────────────────────────────────────
    const videoTitleForNotif = selectedVideo?.title ?? "Stay Safe During Missile Threats";
    const approver1Name = sentApprovers.length > 0 ? (APPROVER_USERS[sentApprovers[0]] ?? "Sarah Johnson") : "Sarah Johnson";
    const pendingApprovers = sentApprovers.slice(1);
    const pendingApproversStr = pendingApprovers.length > 0
        ? formatApproverNames(pendingApprovers)
        : "remaining approvers";
    const allApproversStr = sentApprovers.length > 0
        ? formatApproverNames(sentApprovers)
        : "Sarah Johnson and Emma Rodriguez";

    const notifications: NotificationItem[] = [];

    if (videoPhase >= 3) {
        notifications.push({
            id: 3,
            iconColor: theme.palette.success.dark,
            parts: [
                { text: `"${videoTitleForNotif}"` },
                { text: ` was approved by ${allApproversStr}. You can now ` },
                { text: "approve it >", isLink: true }
            ],
            date: "Mar 17, 9:05 AM",
            unread: videoPhase === 3,
            onLinkClick: () => setCurrentPage("video")
        });
    }

    if (videoPhase >= 2) {
        notifications.push({
            id: 2,
            iconColor: theme.palette.warning.main,
            parts: [
                { text: `${allApproversStr} have reviewed "${videoTitleForNotif}". There are ${TOTAL_COMMENT_COUNT} comments. ` },
                { text: "View them now", isLink: true }
            ],
            date: "Mar 16, 10:14 AM",
            unread: videoPhase === 2,
            onLinkClick: () => {
                setOpenCommentsOnStudio(true);
                setOpenCommentsCounter(c => c + 1);
                setCurrentPage("studio");
            }
        });
    }

    if (videoPhase >= 1) {
        notifications.push({
            id: 1,
            iconColor: theme.palette.warning.main,
            parts: [
                { text: `${approver1Name} reviewed "${videoTitleForNotif}". Waiting for ${pendingApproversStr}'s approval.` }
            ],
            date: "Mar 15, 3:42 PM",
            unread: videoPhase === 1
        });
    }

    const handleSelectVideo = (video: VideoItem) => {
        setSelectedVideo(video);
        setDialogStep("closed");
        setCurrentPage("video");
        // Initialise video state if it hasn't been set yet
        setVideoStates(prev => {
            if (prev[video.title]) {
                return prev;
            }
            return {
                ...prev,
                [video.title]: { phase: 0, pageState: "draft", sentApprovers: [] }
            };
        });
    };

    const handleApprovalSend = (approvers: string[]) => {
        updateVideoState(currentKey, { sentApprovers: approvers, pageState: "pending", sentAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) });
        setDialogStep("confirmed");
    };

    const handleConfirmationClose = () => {
        setDialogStep("closed");
    };

    // Tooltip text on "Pending approval" button
    const pendingTooltip = sentApprovers.length > 0
        ? `Sent for approval on Mar 15 by you to ${formatApproverNames(sentApprovers)}`
        : "Sent for approval on Mar 15 by you";

    return (
        <Box sx={appRootSx}>

            {/* ── Main app area ───────────────────────────────────────────────────── */}
            <Box sx={appMainAreaSx}>
                {currentPage === "library" ? (
                    <VideoLibraryPage
                        onSelectVideo={handleSelectVideo}
                        notifications={notifications}
                        videoStates={videoStates}
                        onPermChange={(key, s) => updateVideoState(key, { permSettings: s })}
                        onSubmitForApproval={(key, approvers) => updateVideoState(key, { sentApprovers: approvers, pageState: "pending", sentAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) })}
                        approvalsEnabled={approvalsEnabled}
                        approverIds={approverIds}
                        onApprovalsEnabledChange={(enabled, hasPendingApprovals) => {
                            if (!enabled && hasPendingApprovals) {
                                // Show pending approvals warning dialog
                                setPendingApprovalsWarningReason("turn-off");
                                setPendingApprovalsDialogOpen(true);
                            }
                            else {
                                setApprovalsEnabled(enabled);
                            }
                        }}
                        approversList={approversList}
                        accountSettingsOpen={accountSettingsOpen}
                        accountSettingsInitialTab={accountSettingsInitialTab}
                        onAccountSettingsOpen={(open) => setAccountSettingsOpen(open)}
                        onApproversChange={(ids) => {
                            setApproverIds(ids);
                        }}
                        onApproversListChange={(approvers) => {
                            setApproversList(approvers);
                        }}
                        onUserDeletionBlocked={(_userId, _reason) => {
                            // Show user deletion blocked dialog
                            setPendingApprovalsWarningReason("delete-user");
                            setPendingApprovalsDialogOpen(true);
                        }}
                    />

                ) : currentPage === "studio" ? (
                /* ── Studio / Editor page ─────────────────────────────────────────── */
                    <StudioPage
                        videoTitle={selectedVideo?.title ?? "Video"}
                        initialHeadingText={currentVState.headingText}
                        initialSubheadingText={currentVState.subheadingText}
                        approverNames={sentApprovers.length > 0 ? formatApproverNames(sentApprovers) : "Sarah Johnson and Emma Rodriguez"}
                        onNavigateToVideoPage={() => setCurrentPage("video")}
                        onNavigateToLibrary={() => setCurrentPage("library")}
                        onRequestReapproval={() => updateVideoState(currentKey, { phase: 0, pageState: "pending" })}
                        onHeadingChange={(text) => updateVideoState(currentKey, { headingText: text })}
                        onSubheadingChange={(text) => updateVideoState(currentKey, { subheadingText: text })}
                        openCommentsOnMount={openCommentsOnStudio}
                        triggerOpenComments={openCommentsCounter}
                        notifications={notifications}
                        initialThreads={videoPhase >= 2 ? INITIAL_THREADS : []}
                        initialPermSettings={videoPermSettings}
                        onPermChange={(s) => updateVideoState(currentKey, { permSettings: s })}
                        awaitingApprovers={false}
                        onEditAttempt={videoPhase === 1 ? () => setCancelApprovalDialogOpen(true) : undefined}
                    />

                ) : (
                /* ── Video page ───────────────────────────────────────────────────── */
                    <Box sx={videoPageLayoutSx}>
                        <Sidebar
                            effectiveStatus={effectiveStatus}
                            videoTitle={selectedVideo?.title ?? "Video"}
                            onNavigateToLibrary={() => setCurrentPage("library")}
                            videoPermSettings={videoPermSettings}
                            onManageAccess={() => setVideoPermDialogOpen(true)}
                            selectedNav={videoNavTab}
                            onNavChange={setVideoNavTab}
                        />

                        <Box sx={videoPageContentColumnSx}>
                            {/* AppBar */}
                            <AppBar position="sticky" color="primary" elevation={4}>
                                <Toolbar variant="dense">
                                    <Box sx={flexOneSx} />
                                    <Search
                                        value=""
                                        onChange={() => {}}
                                        onClear={() => {}}
                                        numberOfResults={0}
                                        placeholder="Search Video Library"
                                        sx={{ width: 240 }}
                                    />
                                </Toolbar>
                            </AppBar>

                            {/* Content */}
                            <Box sx={videoPageScrollSx}>
                                {videoNavTab === "share" ? (
                                    <Box sx={shareEmptyStateSx}>
                                        <Box component="img" src="" alt="" sx={shareEmptyIllustrationSx} />
                                        <Typography variant="h2" sx={shareEmptyTitleSx}>
                                            No versions have been approved
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Once a version is approved, it will appear here.{" "}
                                            <Link component="button" variant="body1" onClick={() => setVideoNavTab("edit")}>
                                                Go to Edit
                                            </Link>
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={videoPageInnerSx}>
                                        <Box sx={videoPageCardColumnSx}>
                                            <VideoPreviewCard
                                                videoPhase={videoPhase}
                                                effectiveStatus={effectiveStatus}
                                                approvers={sentApprovers.length > 0 ? sentApprovers : ["sjohnson", "erodriguez"]}
                                                pendingTooltip={pendingTooltip}
                                                headingText={currentVState.headingText}
                                                subheadingText={currentVState.subheadingText}
                                                videoTitle={selectedVideo?.title}
                                                onSentForApproval={() => setDialogStep("form")}
                                                onEdit={(fromComments?: boolean) => {
                                                    if (isPending && videoPhase !== 2 && !fromComments) {
                                                        setCancelApprovalDialogOpen(true);
                                                    }
                                                    else {
                                                        setOpenCommentsOnStudio(fromComments ?? false);
                                                        setCurrentPage("studio");
                                                    }
                                                }}
                                                onApproveVideo={() => setApproveDialogOpen(true)}
                                                videoPermSettings={videoPermSettings}
                                                onManageAccess={() => setVideoPermDialogOpen(true)}
                                                approvalsEnabled={approvalsEnabled}
                                            />
                                        </Box>
                                        <ReviewOptionsPanel isPending={effectiveStatus === "pending" && videoPhase !== 2} />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* ── Tasks panel — always visible, outside the app ──────────────────── */}
            <TasksPanel
                onTaskDone={(idx) => {
                    const key = currentKey || "Stay Safe During Missile Threats";
                    updateVideoState(key, { phase: idx + 1 });
                    setCurrentPage("library");
                }}
            />

            {/* ── Video permission dialog (video page) ───────────────────────────── */}
            <VideoPermissionDialog
                open={videoPermDialogOpen}
                onClose={() => setVideoPermDialogOpen(false)}
                onSave={s => {
                    updateVideoState(currentKey, { permSettings: s }); setVideoPermDialogOpen(false); 
                }}
                initialSettings={videoPermSettings}
            />

            {/* ── Dialogs ────────────────────────────────────────────────────────── */}
            <ApprovalDialog
                open={dialogStep === "form"}
                onClose={() => setDialogStep("closed")}
                onSend={handleApprovalSend}
                availableApprovers={approversList}
            />
            <ConfirmationDialog
                open={dialogStep === "confirmed"}
                onClose={handleConfirmationClose}
                approverCount={sentApprovers.length}
            />
            <ApproveVideoDialog
                open={approveDialogOpen}
                onClose={() => setApproveDialogOpen(false)}
                onApprove={() => updateVideoState(currentKey, { phase: 4 })}
            />
            <CancelApprovalDialog
                open={cancelApprovalDialogOpen}
                onClose={() => setCancelApprovalDialogOpen(false)}
                onConfirm={() => {
                    // Reset this video to draft + clear all approval state
                    updateVideoState(currentKey, { phase: 0, pageState: "draft", sentApprovers: [] });
                    setOpenCommentsOnStudio(false);
                    setCancelApprovalDialogOpen(false);
                    setCurrentPage("studio");
                }}
            />

            {/* Pending Approvals Warning Dialog — when turning off or deleting with pending approvals */}
            <Dialog
                open={pendingApprovalsDialogOpen}
                onClose={() => setPendingApprovalsDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={dialogTitleSx}>
                    {pendingApprovalsWarningReason === "turn-off"
                        ? "Cannot turn off approvals"
                        : "Cannot remove user"}
                </DialogTitle>
                <DialogContent sx={dialogContentTopPaddingSx}>
                    <Typography variant="body1" sx={pendingApprovalsDescriptionSx}>
                        {pendingApprovalsWarningReason === "turn-off"
                            ? `You have ${Object.values(videoStates).filter(v => v.sentApprovers?.length > 0).length} video${
                                Object.values(videoStates).filter(v => v.sentApprovers?.length > 0).length !== 1 ? "s" : ""
                            } awaiting approval. You must remove all pending approvals before turning off the "Require approvals" feature.`
                            : "This user has pending approvals. You must remove all pending approvals or add other approvers before removing this user."}
                    </Typography>

                    {/* List of pending approvals */}
                    <Box sx={pendingApprovalsListBoxSx}>
                        {Object.entries(videoStates)
                            .filter(([_, state]) => state.sentApprovers?.length > 0)
                            .slice(0, 5)
                            .map(([videoTitle, state]) => (
                                <Box key={videoTitle} sx={pendingApprovalItemRowSx}>
                                    <Box sx={pendingApprovalThumbnailSx} />
                                    <Box sx={pendingApprovalItemInfoSx}>
                                        <Typography variant="body1" sx={pendingApprovalItemTitleSx}>
                                            {videoTitle}
                                        </Typography>
                                        <Typography variant="caption" sx={textSecondaryColorSx}>
                      Awaiting approval • {formatApproverNames(state.sentApprovers)}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                    </Box>
                </DialogContent>
                <DialogActions sx={dialogActionsSx}>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setPendingApprovalsDialogOpen(false);
                            // Don't allow the action
                        }}
                    >
            Got it
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Approvals Disabled Dialog */}
            <Dialog
                open={approvalsDisabledDialogOpen}
                onClose={() => setApprovalsDisabledDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={dialogTitleSx}>
          Enable approvals
                </DialogTitle>
                <DialogContent sx={dialogContentTopPaddingSx}>
                    <Typography variant="body1" sx={pendingApprovalsDescriptionSx}>
            To use this feature, set up approvers in Account Settings and turn on "Require approvals from specific users for videos and templates".
                    </Typography>
                </DialogContent>
                <DialogActions sx={dialogActionsSx}>
                    <Button
                        variant="outlined"
                        onClick={() => setApprovalsDisabledDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setApprovalsDisabledDialogOpen(false);
                            setApprovalsEnabled(true);
                            setAccountSettingsInitialTab("approvals");
                            setAccountSettingsOpen(true);
                        }}
                    >
            Set approvers
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

// ── Shared primitives ─────────────────────────────────────────────────────────
const textPrimaryColorSx: SxProps<Theme> = { color: "text.primary" };
const textSecondaryColorSx: SxProps<Theme> = { color: "text.secondary" };
const dividerSx: SxProps<Theme> = { borderColor: "divider" };
const flexOneSx: SxProps<Theme> = { flex: 1 };
const minWidthZeroSx: SxProps<Theme> = { minWidth: 0 };
const iconButtonActiveColorSx: SxProps<Theme> = { color: "action.active" };

// ── Dark tooltip (untyped — MUI componentsProps.tooltip.sx is incompatible with SxProps<Theme>) ──
const darkTooltipSx = {
    bgcolor: "secondary.main", borderRadius: 2,
    px: "12px", pt: "10px", pb: "12px",
    color: "common.white", maxWidth: 320
};
const darkTooltipPhase1Sx = {
    bgcolor: "secondary.main", borderRadius: 2,
    px: "12px", pt: "10px", pb: "12px", maxWidth: 280
};
const darkTooltipArrowSx = { color: "secondary.main" };

// ── Tooltip content ───────────────────────────────────────────────────────────
const tooltipContentBoxSx: SxProps<Theme> = { p: "2px" };
const tooltipTextWithMbSx: SxProps<Theme> = { color: "common.white", display: "block", mb: "2px" };
const tooltipTextBlockSx: SxProps<Theme> = { color: "common.white", display: "block" };

// ── Button start icon ─────────────────────────────────────────────────────────
const buttonStartIconSx: SxProps<Theme> = { fontSize: "16px !important" };

// Approved state bg — kept as-is from real-app PublishButton.tsx:232-235 (design team tint)
const approveSuccessBgSx: SxProps<Theme> = {
    "&.MuiButton-textSuccess": {
        backgroundColor: "rgba(237, 247, 237, 1)"
    }
};

// ── CircularIconAvatar ────────────────────────────────────────────────────────
const circularIconAvatarSx: SxProps<Theme> = {
    width: 40, height: 40, borderRadius: "50%", bgcolor: "action.selected",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
};

// ── AvatarChip (VideoPermissionStrip) ─────────────────────────────────────────
const avatarChipOuterSx: SxProps<Theme> = {
    display: "inline-flex", alignItems: "baseline", gap: "5px", flexShrink: 0,
    bgcolor: "grey.200", borderRadius: "4px", px: "6px", pt: "2px", pb: "3px"
};
const avatarChipIconBoxSx: SxProps<Theme> = {
    width: 16, height: 16, borderRadius: "3px", bgcolor: "divider",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, alignSelf: "center"
};
const avatarChipRoleIconSx: SxProps<Theme> = { fontSize: 10, color: "text.primary" };

// ── Lock icons ────────────────────────────────────────────────────────────────
const lockIconSuccessSx: SxProps<Theme> = { fontSize: 19, color: "success.main" };
const lockIconPrimarySx: SxProps<Theme> = { fontSize: 19, color: "primary.main" };

// ── VideoPermissionStrip ──────────────────────────────────────────────────────
const permStripRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "flex-start", gap: "6px", px: 2, py: 1.5,
    cursor: "pointer",
    "&:hover": { bgcolor: "action.hover" }
};
const permStripLabelSx: SxProps<Theme> = { color: "text.secondary", display: "block", mb: "4px" };
const permStripIndicatorsRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px"
};
const everyoneSeparatorSx: SxProps<Theme> = { width: "1px", height: 16, bgcolor: "divider", flexShrink: 0 };
const everyoneIconBoxSx: SxProps<Theme> = {
    width: 16, height: 16, borderRadius: "3px", bgcolor: "action.selected",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, alignSelf: "center"
};
const everyoneIconSx: SxProps<Theme> = { fontSize: 11, color: "text.primary" };

// ── SundaySkyLogo ─────────────────────────────────────────────────────────────
const logoBoxSx: SxProps<Theme> = { px: 1, pb: 0.5 };
const logoTypographySx: SxProps<Theme> = {
    letterSpacing: "0.25em", color: "text.primary", textTransform: "uppercase", lineHeight: 1
};
const logoSkySx: SxProps<Theme> = { color: "primary.main" };

// ── Sidebar ───────────────────────────────────────────────────────────────────
const sidebarContainerSx: SxProps<Theme> = {
    width: 270, flexShrink: 0, display: "flex", flexDirection: "column",
    height: "100%", bgcolor: "background.paper", borderRight: 1, borderColor: "divider"
};
const sidebarLogoClickSx: SxProps<Theme> = {
    px: 2.5, pt: 2, pb: 0, cursor: "pointer", "&:hover": { opacity: 0.75 }
};
const sidebarBackNavSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: 0.5,
    px: 2.5, pt: 2, pb: 1, cursor: "pointer", width: "fit-content",
    "&:hover": { opacity: 0.75 }
};
const sidebarBackIconSx: SxProps<Theme> = { fontSize: 16, color: "text.secondary" };
const sidebarTitleRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    px: 2.5, pr: 1.5
};
const sidebarMenuIconButtonSx: SxProps<Theme> = { mt: 0.3, color: "action.active", flexShrink: 0 };
const menuPaperSx: SxProps<Theme> = { minWidth: 256, mt: "4px", py: "4px" };
const menuHeaderBoxSx: SxProps<Theme> = { px: 2, pt: "10px", pb: 1 };
const menuHeaderTitleSx: SxProps<Theme> = { color: "text.primary", mb: "4px" };
const menuHeaderFolderRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "4px" };
const menuHeaderFolderIconSx: SxProps<Theme> = { fontSize: 16, width: 16, height: 16, color: "text.secondary" };
const menuDividerSx: SxProps<Theme> = { my: "4px" };
const menuItemIconSx: SxProps<Theme> = { fontSize: 16, width: 16, height: 16, color: "action.active", mr: 1 };
const menuItemDeleteIconSx: SxProps<Theme> = { fontSize: 16, width: 16, height: 16, mr: 1 };
const sidebarStatusChipBoxSx: SxProps<Theme> = { pl: "20px", py: "1px" };
const sidebarDividerSx: SxProps<Theme> = { borderColor: "divider", mx: 2.5, my: 1 };
const sidebarNavBoxSx: SxProps<Theme> = { px: 2, py: 1 };
const sidebarNavListSx: SxProps<Theme> = { display: "flex", flexDirection: "column", gap: "2px" };
const navItemRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "6px", flex: 1 };
const navItemIconContainerSx: SxProps<Theme> = { minWidth: 24 };
const navItemIconSx: SxProps<Theme> = { fontSize: 16, width: 16, height: 16, color: "action.active" };
const navItemUpdatedIconSx: SxProps<Theme> = { fontSize: 14, color: "info.main" };
const sidebarFooterRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 1.5
};
const sidebarFooterUserSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 };

// ── VideoPreviewCard ──────────────────────────────────────────────────────────
const videoPreviewCardPaperSx: SxProps<Theme> = {
    borderRadius: 2, overflow: "hidden", borderColor: "divider", bgcolor: "background.paper"
};
const cardActionBarSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5
};
const previewContainerSx: SxProps<Theme> = { position: "relative", width: "100%", overflow: "hidden" };
const previewImgSx: SxProps<Theme> = { width: "100%", display: "block", objectFit: "cover" };
const previewLeftHalfSx: SxProps<Theme> = {
    position: "absolute", inset: 0, width: "50%", bgcolor: "common.white", pointerEvents: "none"
};
const previewAccentLineSx: SxProps<Theme> = { height: 5, bgcolor: "secondary.light", width: "100%" };
const previewRightHalfSx: SxProps<Theme> = {
    position: "absolute", top: 0, right: 0, bottom: 0, width: "50%",
    bgcolor: "grey.200",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: "6px", pointerEvents: "none"
};
const previewDragIconSx: SxProps<Theme> = { fontSize: 36, color: "grey.500" };
const previewDragTextSx: SxProps<Theme> = { color: "grey.500" };
const previewTextOverlaySx: SxProps<Theme> = {
    position: "absolute", left: "4%", top: "20%", width: "43%",
    containerType: "inline-size", pointerEvents: "none",
    display: "flex", flexDirection: "column"
};
const previewHeadingTypographySx: SxProps<Theme> = {
    fontFamily: "\"Inter\", sans-serif", fontWeight: 700, fontSize: "9cqw",
    color: "secondary.main", lineHeight: 1.2, wordBreak: "break-word"
};
const previewSubheadingTypographySx: SxProps<Theme> = {
    fontFamily: "\"Inter\", sans-serif", fontWeight: 400, fontSize: "4cqw",
    color: "text.secondary", lineHeight: 1.4, wordBreak: "break-word", mt: "6%"
};
const previewFootnoteBoxSx: SxProps<Theme> = {
    position: "absolute", left: "4%", width: "43%", bottom: "5%",
    containerType: "inline-size", pointerEvents: "none"
};
const previewFootnoteTypographySx: SxProps<Theme> = {
    fontFamily: "\"Open Sans\", sans-serif", fontWeight: 400, fontSize: "2.5cqw",
    letterSpacing: "0.4px", color: "text.disabled", lineHeight: 1.66
};
const cardMetaRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5 };
const captionBlockSx: SxProps<Theme> = { color: "text.secondary", display: "block" };
const captionBlockWithMbSx: SxProps<Theme> = { color: "text.secondary", display: "block", mb: "1px" };
const captionBlockWithMb2Sx: SxProps<Theme> = { color: "text.secondary", display: "block", mb: "2px" };
const dataPersonalizationIconSx: SxProps<Theme> = { fontSize: 19, color: "error.main" };
const globeIconSx: SxProps<Theme> = { fontSize: 19, color: "action.active" };
const languageChipSx: SxProps<Theme> = {
    display: "inline-flex", alignItems: "baseline", gap: "4px",
    bgcolor: "grey.200", borderRadius: "4px", px: "6px", pt: "2px", pb: "3px"
};
const languageFlagSx: SxProps<Theme> = { fontSize: 12, lineHeight: 1 };

// ── ReviewOptionsPanel ────────────────────────────────────────────────────────
const reviewPanelContainerSx: SxProps<Theme> = {
    display: "flex", flexDirection: "column", gap: 2, width: 340, flexShrink: 0
};
const reviewPaperSx: SxProps<Theme> = {
    borderRadius: 2, borderColor: "divider", bgcolor: "background.paper",
    p: 2, display: "flex", flexDirection: "column", gap: 1
};
const reviewPanelHeaderRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "4px", height: 30, minHeight: 30
};
const reviewPanelTitleSx: SxProps<Theme> = { color: "text.primary", whiteSpace: "nowrap" };
const panelInfoIconSx: SxProps<Theme> = { fontSize: 16, color: "action.active", cursor: "pointer" };
const reviewListItemButtonSx: SxProps<Theme> = { borderRadius: 1, px: 1, py: "4px" };
const reviewListItemIconContainerSx: SxProps<Theme> = { minWidth: 28 };
const panelListIconSx: SxProps<Theme> = { fontSize: 16, color: "action.active" };
const reviewPanelHeader2RowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", justifyContent: "space-between", height: 30, minHeight: 30
};
const reviewPanelHeader2InnerSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "4px" };
const updatedIconSx: SxProps<Theme> = { fontSize: 16, color: "info.main" };
const reviewLibraryItemRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", px: 1, py: "4px", gap: 1 };
const reviewLibraryItemLabelSx: SxProps<Theme> = {
    color: "text.secondary", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
};
const truffleLinkIconSx: SxProps<Theme> = { fontSize: 14 };

// ── TasksPanel ────────────────────────────────────────────────────────────────
const tasksPanelContainerSx: SxProps<Theme> = {
    width: 250, flexShrink: 0, bgcolor: "grey.100",
    borderLeft: 1, borderLeftColor: "grey.400",
    display: "flex", flexDirection: "column", height: "100%"
};
const tasksPanelHeaderSx: SxProps<Theme> = {
    px: 2, pt: 2, pb: 1.5, borderBottom: 1, borderBottomColor: "grey.400",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexShrink: 0
};
const tasksCounterTypographySx: SxProps<Theme> = { color: "text.secondary", mt: "2px" };
const tasksRestartButtonSx: SxProps<Theme> = { color: "text.secondary" };
const tasksRestartIconSx: SxProps<Theme> = { fontSize: 18 };
const tasksDoneStateSx: SxProps<Theme> = {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 2, px: 2.5
};
const tasksDoneIconSx: SxProps<Theme> = { fontSize: 48, color: "success.main" };
const tasksDoneTitleSx: SxProps<Theme> = { color: "text.primary", textAlign: "center" };
const tasksDoneSubtitleSx: SxProps<Theme> = { color: "text.secondary", textAlign: "center" };
const tasksRestartSmallIconSx: SxProps<Theme> = { fontSize: 14 };
const surveyDialogPaperSx: SxProps<Theme> = { p: 1 };
const surveyDialogTitleSx: SxProps<Theme> = {
    pb: 0.5, display: "flex", alignItems: "center", justifyContent: "space-between"
};
const surveyCloseButtonSx: SxProps<Theme> = { color: "action.active", mr: -1 };
const surveyDialogContentSx: SxProps<Theme> = { pt: 1.5, display: "flex", flexDirection: "column", gap: 2 };
const surveyScaleRowSx: SxProps<Theme> = { display: "flex", gap: "4px" };
const surveyScaleLabelRowSx: SxProps<Theme> = { display: "flex", justifyContent: "space-between", mt: "-8px" };
const surveyDialogActionsSx: SxProps<Theme> = { px: 3, pb: 2.5, pt: 0.5 };
const tasksActiveSessionSx: SxProps<Theme> = { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" };
const tasksProgressAreaSx: SxProps<Theme> = { px: 2, pt: 1.5, pb: 1, flexShrink: 0 };
const tasksProgressLabelRowSx: SxProps<Theme> = { display: "flex", justifyContent: "space-between", mb: "6px" };
const tasksProgressLabelTypographySx: SxProps<Theme> = {
    color: "text.secondary", letterSpacing: "0.5px", textTransform: "uppercase"
};
const tasksProgressTrackSx: SxProps<Theme> = { height: 4, bgcolor: "grey.400", borderRadius: 2 };
const tasksScrollableSx: SxProps<Theme> = {
    flex: 1, overflowY: "auto", px: 2, pb: 2, display: "flex", flexDirection: "column"
};
const taskDoneIndicatorRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "6px" };
const taskDoneIndicatorIconSx: SxProps<Theme> = { fontSize: 16, color: "success.main" };
const taskDoneLabelSx: SxProps<Theme> = { color: "success.main", letterSpacing: "0.3px" };
const tasksDotNavRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", justifyContent: "space-between", pt: "2px", mt: "4px"
};
const tasksDotsSx: SxProps<Theme> = { display: "flex", gap: "5px" };

// ── App root ──────────────────────────────────────────────────────────────────
const appRootSx: SxProps<Theme> = { display: "flex", height: "100vh", overflow: "hidden" };
const appMainAreaSx: SxProps<Theme> = { flex: 1, display: "flex", overflow: "hidden" };
const videoPageLayoutSx: SxProps<Theme> = {
    display: "flex", width: "100%", height: "100%", bgcolor: "background.default", overflow: "hidden"
};
const videoPageContentColumnSx: SxProps<Theme> = { display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" };
const videoPageScrollSx: SxProps<Theme> = { flex: 1, overflow: "auto" };
const videoPageInnerSx: SxProps<Theme> = {
    maxWidth: 900, mx: "auto",
    px: 4, pb: 4, pt: 2,
    display: "flex", gap: 3, alignItems: "flex-start"
};
const videoPageCardColumnSx: SxProps<Theme> = { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 };

// ── Pending approvals dialog ──────────────────────────────────────────────────
const dialogTitleSx: SxProps<Theme> = { color: "text.primary", pb: 1 };
const dialogContentTopPaddingSx: SxProps<Theme> = { pt: 2 };
const pendingApprovalsDescriptionSx: SxProps<Theme> = { color: "text.secondary", mb: 2 };
const pendingApprovalsListBoxSx: SxProps<Theme> = { bgcolor: "grey.100", borderRadius: "8px", p: 2, mb: 2 };
const pendingApprovalItemRowSx: SxProps<Theme> = {
    display: "flex", gap: 2, mb: 1.5, alignItems: "flex-start", "&:last-child": { mb: 0 }
};
const pendingApprovalThumbnailSx: SxProps<Theme> = {
    width: 60, height: 60, borderRadius: "6px", bgcolor: "primary.light", flexShrink: 0, border: 1, borderColor: "divider"
};
const pendingApprovalItemInfoSx: SxProps<Theme> = { flex: 1, minWidth: 0 };
const pendingApprovalItemTitleSx: SxProps<Theme> = {
    color: "text.primary", mb: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
};
const dialogActionsSx: SxProps<Theme> = { px: 3, py: 2 };

const shareEmptyStateSx: SxProps<Theme> = {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    flex: 1, gap: 2, py: 8, textAlign: "center"
};
const shareEmptyIllustrationSx: SxProps<Theme> = { width: 120, height: 120, opacity: 0.3 };
const shareEmptyTitleSx: SxProps<Theme> = { color: "text.primary" };

