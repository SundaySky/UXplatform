import { useState } from "react";
import {
    Box, Typography, IconButton, SvgIcon, Button, ButtonGroup,
    Paper, Tabs, Tab, Divider, Switch, Menu, MenuItem,
    List, ListItemButton, ListItemIcon, ListItemText, Tooltip
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft, faEllipsisVertical, faPen,
    faCircleQuestion, faSquareList, faEnvelope,
    faCode, faDownload, faFileExport, faEye, faGlobe,
    faUsers, faCircleCheck, faCheck, faChevronDown, faXmark, faComment
} from "@fortawesome/pro-regular-svg-icons";
import {
    TruffleLink, TruffleAvatar, Label, Search, TruffleAlert
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import ApprovalDialog from "../../dialogs/ApprovalDialog";
import ConfirmationDialog from "../../dialogs/ConfirmationDialog";
import ApproveVideoDialog from "../../dialogs/ApproveVideoDialog";
import CancelApprovalDialog from "../../dialogs/CancelApprovalDialog";
import PublishTemplateDialog from "../../dialogs/PublishTemplateDialog";
import CreateTemplateDialog from "../../dialogs/CreateTemplateDialog";
import type { NewTemplateData } from "../../components/AppSidebar";
import { TOTAL_COMMENT_COUNT } from "../Studio/CommentsPanel";

const TEMPLATE_TITLE = "Digital Account Engagement Stylised video";

// Pre-filled template details
const TEMPLATE_DETAILS = {
    name: "Digital Account Engagement",
    aspectRatio: "16:9",
    audience: ["Marketing team", "Customer Success"],
    purpose: ["Engagement", "Retention"],
    description: "Engage digital account holders with personalized video content highlighting key features and driving deeper adoption."
};

const APPROVER_USERS: Record<string, string> = {
    sjohnson:   "Sarah Johnson",
    mchen:      "Michael Chen",
    erodriguez: "Emma Rodriguez",
    jwilson:    "James Wilson"
};

const PHASE_STATUS: Record<number, "draft" | "pending" | "approved"> = {
    0: "draft", 1: "pending", 2: "pending", 3: "approved", 4: "approved"
};

// Renders up to 3 standard Labels; if there are more, shows a "+X" Label
// with a Tooltip listing the overflow items.
function ChipsRowWithOverflow({ items }: { items: string[] }) {
    const visible = items.slice(0, 3);
    const overflow = items.slice(3);
    return (
        <Box sx={chipsRowSx}>
            {visible.map(i => (
                <Label key={i} label={i} variant="standard" size="small" />
            ))}
            {overflow.length > 0 && (
                <Tooltip title={overflow.join(", ")} arrow>
                    <Box component="span">
                        <Label label={`+${overflow.length}`} variant="standard" size="small" />
                    </Box>
                </Tooltip>
            )}
        </Box>
    );
}

// Approval state shape — kept in sync with App.tsx's lifted store.
interface TemplateApprovalStateShape {
    videoPhase: number;
    pageState: "draft" | "pending";
    approvers: string[];
    isPublished: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TemplatePage({
    onNavigateBack,
    onNavigateToStudio,
    onViewComments,
    template,
    onApprovalSubmitted,
    onApprovalCancelled,
    showApproverComments = false,
    approvalState: approvalStateProp,
    onApprovalStateChange
}: {
    onNavigateBack: () => void;
    onNavigateToStudio?: (name?: string) => void;
    /** Navigate to the studio with the comments panel open (used by "View N comments in Studio"). */
    onViewComments?: (name?: string) => void;
    template?: NewTemplateData;
    onApprovalSubmitted?: () => void;
    onApprovalCancelled?: () => void;
    /** When true (e.g. driven by task 7), force the "View N comments in Studio" button. */
    showApproverComments?: boolean;
    /** Controlled approval state lifted to App.tsx so it persists across task switches. */
    approvalState?: TemplateApprovalStateShape;
    onApprovalStateChange?: (patch: Partial<TemplateApprovalStateShape>) => void;
}) {
    // Use user-entered template data when available, falling back to the hardcoded sample
    const details = template ?? TEMPLATE_DETAILS;
    const [activeTab, setActiveTab] = useState(0);
    const [downloadableEnabled, setDownloadableEnabled] = useState(false);
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    // Snackbar shown after the user clicks "Notify me about feedback" in ConfirmationDialog
    const [feedbackSnackbarDate, setFeedbackSnackbarDate] = useState<string | null>(null);

    // ── Approval flow state ────────────────────────────────────────────────
    // Backed by props from App.tsx (lifted so it persists across task switches).
    // Falls back to local state when used outside the app shell.
    const [internalApprovalState, setInternalApprovalState] = useState<TemplateApprovalStateShape>({
        videoPhase: 0,
        pageState: "draft",
        approvers: [],
        isPublished: false
    });
    const approvalState = approvalStateProp ?? internalApprovalState;
    const patchApproval = (patch: Partial<TemplateApprovalStateShape>) => {
        if (onApprovalStateChange) {
            onApprovalStateChange(patch);
        }
        else {
            setInternalApprovalState(prev => ({ ...prev, ...patch }));
        }
    };
    const { videoPhase, pageState, approvers, isPublished } = approvalState;
    const setVideoPhase = (v: number) => patchApproval({ videoPhase: v });
    const setPageState = (s: "draft" | "pending") => patchApproval({ pageState: s });
    const setApprovers = (a: string[]) => patchApproval({ approvers: a });
    const setIsPublished = (v: boolean) => patchApproval({ isPublished: v });

    // Dialog open/close state stays local — these are ephemeral UI, not persistent data.
    const [dialogStep, setDialogStep] = useState<"closed" | "form" | "confirmed">("closed");
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [cancelApprovalDialogOpen, setCancelApprovalDialogOpen] = useState(false);

    const effectiveStatus: "draft" | "pending" | "approved" =
        videoPhase > 0 ? PHASE_STATUS[videoPhase] : pageState;
    const isPending = effectiveStatus === "pending";

    const pendingTooltip = approvers.length > 0
        ? `Pending approval from ${approvers.map(v => APPROVER_USERS[v] || v).join(", ")}`
        : "Pending approval";

    // ── Sidebar status label ───────────────────────────────────────────────
    function statusLabel() {
        if (videoPhase === 4) {
            return <Label label="Approved" color="success" size="small" />;
        }
        if (videoPhase === 3) {
            return <Label label="Ready to approve" color="info" size="small" />;
        }
        // While pending, the template still reads as Draft per design.
        return <Label label="Draft" color="default" size="small" />;
    }

    // Anchor element for the split-button dropdown menu attached to the chevron
    const [pendingMenuAnchor, setPendingMenuAnchor] = useState<HTMLElement | null>(null);

    // ── Action button ──────────────────────────────────────────────────────
    function ActionButton() {
        // Task 7 override: surface the "View N comments in Studio" button
        if (showApproverComments) {
            return (
                <Button
                    variant="contained" size="medium" color="primary"
                    startIcon={<SvgIcon sx={btnIconSx}><FontAwesomeIcon icon={faComment} /></SvgIcon>}
                    onClick={() => (onViewComments ?? onNavigateToStudio)?.(details.name)}
                >
                    View {TOTAL_COMMENT_COUNT} comments in Studio
                </Button>
            );
        }

        // Phase 0 + pending — split button: "Pending approval" + chevron;
        // chevron click drops a menu with "Cancel approval request".
        if (videoPhase === 0 && effectiveStatus === "pending") {
            return (
                <>
                    <Tooltip title={pendingTooltip} placement="top" arrow
                        componentsProps={{ tooltip: { sx: darkTooltipSx }, arrow: { sx: darkTooltipArrowSx } }}
                    >
                        <ButtonGroup variant="outlined" size="medium" color="success">
                            <Button
                                startIcon={<SvgIcon sx={btnIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>}
                            >
                                Pending approval
                            </Button>
                            <Button
                                size="small"
                                aria-label="Open pending approval menu"
                                onClick={(e) => setPendingMenuAnchor(e.currentTarget)}
                                sx={{ px: 1 }}
                            >
                                <SvgIcon sx={btnIconSx}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>
                            </Button>
                        </ButtonGroup>
                    </Tooltip>
                    <Menu
                        anchorEl={pendingMenuAnchor}
                        open={Boolean(pendingMenuAnchor)}
                        onClose={() => setPendingMenuAnchor(null)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        transformOrigin={{ vertical: "top", horizontal: "left" }}
                    >
                        <MenuItem
                            onClick={() => {
                                setPendingMenuAnchor(null);
                                setCancelApprovalDialogOpen(true);
                            }}
                            sx={{ color: "error.main" }}
                        >
                            <SvgIcon sx={{ ...btnIconSx, color: "error.main", mr: 1 }}>
                                <FontAwesomeIcon icon={faXmark} />
                            </SvgIcon>
                            Cancel approval request
                        </MenuItem>
                    </Menu>
                </>
            );
        }

        // Phase 1: 1 of N responded
        if (videoPhase === 1) {
            const total = approvers.length;
            const respondedName = APPROVER_USERS[approvers[0]] ?? "Sarah Johnson";
            const pendingNames = approvers.slice(1).map(k => APPROVER_USERS[k] ?? k);
            return (
                <Tooltip
                    placement="top" arrow
                    title={
                        <Box>
                            <Typography sx={{ color: "common.white", display: "block", mb: "2px" }}>
                                • {respondedName} left feedback
                            </Typography>
                            {pendingNames.map((name, i) => (
                                <Typography key={i} sx={{ color: "common.white", display: "block", mb: "2px" }}>
                                    • {name} hasn&apos;t responded yet
                                </Typography>
                            ))}
                        </Box>
                    }
                    componentsProps={{ tooltip: { sx: darkTooltipSx }, arrow: { sx: darkTooltipArrowSx } }}
                >
                    <Button variant="outlined" size="medium" color="warning"
                        onClick={() => onNavigateToStudio?.(TEMPLATE_TITLE)}
                        startIcon={<SvgIcon sx={btnIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>}
                    >
                        1 of {total} approver{total !== 1 ? "s" : ""} responded
                    </Button>
                </Tooltip>
            );
        }

        // Phase 2: view comments
        if (videoPhase === 2) {
            return (
                <Button variant="contained" size="medium" color="primary"
                    startIcon={<SvgIcon sx={btnIconSx}><FontAwesomeIcon icon={faComment} /></SvgIcon>}
                    onClick={() => (onViewComments ?? onNavigateToStudio)?.(details.name)}
                >
                    View {TOTAL_COMMENT_COUNT} comments in Studio
                </Button>
            );
        }

        // Phase 4: approved — now ready to publish
        if (videoPhase === 4) {
            return (
                <Button
                    variant="contained"
                    color="gradient"
                    size="medium"
                    startIcon={<SvgIcon sx={btnIconSx}><FontAwesomeIcon icon={faCheck} /></SvgIcon>}
                    onClick={() => setPublishDialogOpen(true)}
                >
                    {isPublished ? "Update published template" : "Publish to Amplify"}
                </Button>
            );
        }

        // Phase 3: approved by all, ready to mark as approved
        if (videoPhase === 3) {
            return (
                <Tooltip
                    title="Allows you to publish the template to Amplify"
                    placement="top" arrow
                    componentsProps={{ tooltip: { sx: darkTooltipSx }, arrow: { sx: darkTooltipArrowSx } }}
                >
                    <Button variant="outlined" size="medium" color="primary"
                        startIcon={<SvgIcon sx={btnIconSx}><FontAwesomeIcon icon={faCheck} /></SvgIcon>}
                        onClick={() => setApproveDialogOpen(true)}
                    >
                        Approve
                    </Button>
                </Tooltip>
            );
        }

        // Phase 0 draft — submit for approval
        return (
            <Button variant="contained" size="medium" color="primary"
                startIcon={<SvgIcon sx={btnIconSx}><FontAwesomeIcon icon={faCircleCheck} /></SvgIcon>}
                onClick={() => setDialogStep("form")}
            >
                Submit for approval
            </Button>
        );
    }

    return (
        <Box sx={pageRootSx}>

            {/* ── Left Drawer ─────────────────────────────────────────────────── */}
            <Box sx={drawerSx}>
                {/* Logo area */}
                <Box sx={logoAreaSx}>
                    <Typography variant="h5" color="secondary.main" noWrap>
                        SundaySky
                    </Typography>
                </Box>

                {/* Video details */}
                <Box sx={drawerDetailsSx}>
                    {/* Back link */}
                    <TruffleLink
                        href="#"
                        startIcon={
                            <SvgIcon sx={iconXsSx}>
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </SvgIcon>
                        }
                        onClick={(e) => {
                            e.preventDefault(); onNavigateBack();
                        }}
                        sx={{ color: "text.secondary" }}
                    >
                        Templates Library
                    </TruffleLink>

                    {/* Title row — reflects the template name */}
                    <Box sx={titleRowSx}>
                        <Typography variant="subtitle2" sx={{ flex: 1 }}>
                            {details.name}
                        </Typography>
                        <IconButton size="small" sx={iconBtnSx}>
                            <SvgIcon sx={iconSmSx}>
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                            </SvgIcon>
                        </IconButton>
                    </Box>

                    {/* Status badge */}
                    {statusLabel()}

                    {/* Nav actions */}
                    <List disablePadding sx={navListSx}>
                        <ListItemButton selected sx={navItemSx}>
                            <ListItemIcon sx={navIconSx}>
                                <SvgIcon sx={iconSmSx}>
                                    <FontAwesomeIcon icon={faPen} />
                                </SvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="Edit and Publish" primaryTypographyProps={{ variant: "body1" }} />
                        </ListItemButton>
                        <ListItemButton sx={navItemSx}>
                            <ListItemIcon sx={navIconSx}>
                                <SvgIcon sx={iconSmSx}>
                                    <FontAwesomeIcon icon={faUsers} />
                                </SvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="Analyze" primaryTypographyProps={{ variant: "body1" }} />
                        </ListItemButton>
                    </List>
                </Box>
            </Box>

            {/* ── Main content column (AppBar + content row) ───────────────────── */}
            <Box sx={mainColumnSx}>

                {/* AppBar — matches VideoOverviewPage; no page-title h2 since the template
                    title is shown on the card */}
                <Box sx={appBarSx}>
                    <Box sx={{ flex: 1 }} />
                    <Search
                        size="small"
                        value=""
                        onChange={() => {}}
                        onClear={() => {}}
                        numberOfResults={0}
                        placeholder="Search libraries"
                        sx={appBarSearchSx}
                    />
                </Box>

                {/* Content row */}
                <Box sx={contentRowSx}>

                    {/* ── Center content ────────────────────────────────────────── */}
                    <Box sx={centerContentSx}>
                        <Paper variant="outlined" sx={videoCardPaperSx}>

                            {/* Action bar: Edit (left) | ActionButton (right) */}
                            <Box sx={cardActionBarSx}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="medium"
                                    startIcon={
                                        <SvgIcon sx={iconSmSx}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </SvgIcon>
                                    }
                                    onClick={() => onNavigateToStudio?.(TEMPLATE_TITLE)}
                                >
                                    Edit
                                </Button>
                                <ActionButton />
                            </Box>

                            <Divider />

                            {/* Video thumbnail */}
                            <Box sx={videoThumbWrapperSx}>
                                <Box
                                    component="img"
                                    src="/thumb.svg"
                                    alt="Template preview"
                                    sx={videoThumbImgSx}
                                />
                            </Box>

                            <Divider />

                            {/* Row: Last Edited | Personalization */}
                            <Box sx={metaRowSx}>
                                <Box sx={metaItemSx}>
                                    <TruffleAvatar text="OP" size="large" />
                                    <Box sx={{ ml: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Last Edited
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">—</Typography>
                                    </Box>
                                </Box>
                                <Divider orientation="vertical" flexItem />
                                <Box sx={metaItemSx}>
                                    <TruffleAvatar
                                        icon={
                                            <SvgIcon>
                                                <FontAwesomeIcon icon={faUsers} />
                                            </SvgIcon>
                                        }
                                        size="large"
                                    />
                                    <Box sx={{ ml: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Personalization
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">—</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider />

                            {/* Template details (hover to reveal Edit icon) */}
                            <Box sx={templateDetailsHoverWrapperSx}>
                                <IconButton
                                    size="small"
                                    onClick={() => setEditDialogOpen(true)}
                                    aria-label="Edit template details"
                                    className="template-details-edit-icon"
                                    sx={templateDetailsEditIconSx}
                                >
                                    <SvgIcon sx={iconSmSx}>
                                        <FontAwesomeIcon icon={faPen} />
                                    </SvgIcon>
                                </IconButton>
                                <Box sx={metaDetailRowSx}>
                                    <TruffleAvatar
                                        icon={
                                            <SvgIcon>
                                                <FontAwesomeIcon icon={faSquareList} />
                                            </SvgIcon>
                                        }
                                        size="large"
                                    />
                                    <Box sx={templateDetailsBodySx}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Template details
                                        </Typography>
                                        <Typography variant="subtitle2">
                                            {details.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {details.description}
                                        </Typography>
                                        <Box sx={detailsChipsRowSx}>
                                            <ChipsRowWithOverflow items={details.audience} />
                                            <ChipsRowWithOverflow items={details.purpose} />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider />

                            {/* On-going version */}
                            <Box sx={metaDetailRowSx}>
                                <TruffleAvatar
                                    icon={
                                        <SvgIcon>
                                            <FontAwesomeIcon icon={faFileExport} />
                                        </SvgIcon>
                                    }
                                    size="large"
                                />
                                <Box sx={{ ml: 1.5, flex: 1 }}>
                                    <Typography variant="body1" color="text.primary">
                                        On-going version
                                    </Typography>
                                    {isPending ? (
                                        <Box sx={onGoingDashedLabelSx}>
                                            <Typography variant="caption" color="text.secondary">
                                                Pending approval
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">
                                            —
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                        </Paper>
                    </Box>

                    {/* ── Right Panel ───────────────────────────────────────────── */}
                    <Box sx={rightPanelSx}>

                        {/* Card 1: Review / Publish tabs */}
                        <Paper sx={rightCardSx}>
                            <Tabs
                                value={activeTab}
                                onChange={(_, v) => setActiveTab(v as number)}
                                sx={{ mb: 0.5 }}
                            >
                                <Tab label="Review draft" />
                                <Tab label="View published template" />
                            </Tabs>

                            {activeTab === 0 && (
                                <List disablePadding>
                                    {REVIEW_ITEMS.map(({ icon, label }) => (
                                        <ListItemButton key={label} sx={rightListItemSx}>
                                            <ListItemIcon sx={navIconSx}>
                                                <SvgIcon sx={iconSmSx}>
                                                    <FontAwesomeIcon icon={icon} />
                                                </SvgIcon>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={label}
                                                primaryTypographyProps={{ variant: "body1" }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            )}
                        </Paper>

                        {/* Card 2: Sharing options */}
                        <Paper sx={rightCardSx}>
                            <Box sx={sharingTitleRowSx}>
                                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                                    Set up ways Contributors can share video
                                </Typography>
                                <IconButton size="small" sx={iconBtnSx}>
                                    <SvgIcon sx={iconSmSx}>
                                        <FontAwesomeIcon icon={faCircleQuestion} />
                                    </SvgIcon>
                                </IconButton>
                            </Box>

                            <List disablePadding>
                                {/* Landing Page */}
                                <ListItemButton sx={sharingItemSx}>
                                    <ListItemIcon sx={navIconSx}>
                                        <SvgIcon sx={iconSmSx}>
                                            <FontAwesomeIcon icon={faGlobe} />
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="SundaySky Landing Page"
                                        primaryTypographyProps={{ variant: "body1" }}
                                    />
                                    <Button variant="text" size="small" color="primary" sx={{ flexShrink: 0 }}>
                                        Set up
                                    </Button>
                                </ListItemButton>

                                {/* Embed */}
                                <ListItemButton sx={sharingItemSx}>
                                    <ListItemIcon sx={navIconSx}>
                                        <SvgIcon sx={iconSmSx}>
                                            <FontAwesomeIcon icon={faCode} />
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Embed on your website"
                                        primaryTypographyProps={{ variant: "body1" }}
                                    />
                                    <Button variant="text" size="small" color="primary" sx={{ flexShrink: 0 }}>
                                        Set up
                                    </Button>
                                </ListItemButton>

                                <Divider />

                                {/* Email */}
                                <ListItemButton sx={sharingItemSx}>
                                    <ListItemIcon sx={navIconSx}>
                                        <SvgIcon sx={iconSmSx}>
                                            <FontAwesomeIcon icon={faEnvelope} />
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Email template"
                                        secondary="For use with any provider"
                                        primaryTypographyProps={{ variant: "body1" }}
                                        secondaryTypographyProps={{ variant: "body2" }}
                                    />
                                    <Button variant="text" size="small" color="primary" sx={{ flexShrink: 0 }}>
                                        Set up
                                    </Button>
                                </ListItemButton>

                                <Divider />

                                {/* Downloadable MP4 */}
                                <Box sx={sharingItemSx}>
                                    <ListItemIcon sx={navIconSx}>
                                        <SvgIcon sx={iconSmSx}>
                                            <FontAwesomeIcon icon={faDownload} />
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Downloadable MP4"
                                        secondary="Analytics won't be collected"
                                        primaryTypographyProps={{ variant: "body1" }}
                                        secondaryTypographyProps={{ variant: "body2" }}
                                    />
                                    <Switch
                                        size="small"
                                        checked={downloadableEnabled}
                                        onChange={(e) => setDownloadableEnabled(e.target.checked)}
                                        color="primary"
                                    />
                                </Box>
                            </List>
                        </Paper>

                    </Box>
                </Box>
            </Box>

            {/* ── Dialogs ──────────────────────────────────────────────────────── */}

            {/* Approval flow: step 1 — form */}
            <ApprovalDialog
                open={dialogStep === "form"}
                onClose={() => setDialogStep("closed")}
                onSend={(selectedApprovers) => {
                    setApprovers(selectedApprovers);
                    setPageState("pending");
                    setDialogStep("confirmed");
                    onApprovalSubmitted?.();
                }}
            />

            {/* Approval flow: step 2 — confirmation */}
            <ConfirmationDialog
                open={dialogStep === "confirmed"}
                onClose={() => setDialogStep("closed")}
                approverCount={approvers.length || 1}
                onNotifyFeedback={() => {
                    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    setFeedbackSnackbarDate(today);
                    setTimeout(() => setFeedbackSnackbarDate(null), 6000);
                }}
            />

            {/* Approve template dialog (phase 3 → 4) */}
            <ApproveVideoDialog
                open={approveDialogOpen}
                onClose={() => setApproveDialogOpen(false)}
                onApprove={() => {
                    setApproveDialogOpen(false);
                    setVideoPhase(4);
                }}
            />

            {/* Cancel approval dialog */}
            <CancelApprovalDialog
                open={cancelApprovalDialogOpen}
                onClose={() => setCancelApprovalDialogOpen(false)}
                approverName={approvers.length > 0 ? (APPROVER_USERS[approvers[0]] ?? approvers[0]) : undefined}
                onConfirm={() => {
                    setCancelApprovalDialogOpen(false);
                    setVideoPhase(0);
                    setPageState("draft");
                    setApprovers([]);
                    onApprovalCancelled?.();
                }}
            />

            {/* Publish template dialog — only reachable from phase 4 */}
            <PublishTemplateDialog
                open={publishDialogOpen}
                onClose={() => setPublishDialogOpen(false)}
                onPublish={() => {
                    setIsPublished(true);
                    setPublishDialogOpen(false);
                }}
                onEditDetails={() => {
                    setPublishDialogOpen(false);
                    setEditDialogOpen(true);
                }}
                templateName={details.name}
            />

            {/* Edit template details — pre-filled */}
            <CreateTemplateDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                mode="edit"
                initialName={details.name}
                initialAspectRatio={details.aspectRatio}
                initialAudience={details.audience}
                initialPurpose={details.purpose}
                initialDescription={details.description}
                wasApproved={videoPhase >= 3 || isPublished}
                onSubmit={() => setEditDialogOpen(false)}
            />

            {/* ── Feedback notification snackbar (fixed bottom-center) ──────────── */}
            {feedbackSnackbarDate !== null && (
                <Box sx={feedbackSnackbarWrapperSx}>
                    {/* @ts-expect-error TruffleAlert's typed Pick<HTMLAttributes> incorrectly requires React 18 placeholder/onPointer props; remove when the library switches to Omit. */}
                    <TruffleAlert
                        variant="filled"
                        CloseIconButtonProps={{ onClick: () => setFeedbackSnackbarDate(null) }}
                    >
                        Approval requested on {feedbackSnackbarDate}. You&apos;ll be notified by email when feedback is received.
                    </TruffleAlert>
                </Box>
            )}
        </Box>
    );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const REVIEW_ITEMS = [
    { icon: faEye, label: "Preview as Contributor" },
    { icon: faFileExport, label: "Export script" },
    { icon: faDownload, label: "Download MP4" }
] as const;

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageRootSx: SxProps<Theme> = {
    display: "flex",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    bgcolor: "primary.light"
};

const drawerSx: SxProps<Theme> = {
    width: 266,
    flexShrink: 0,
    height: "100%",
    bgcolor: "background.paper",
    borderRight: "1px solid",
    borderColor: "divider",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    overflowX: "hidden"
};

const logoAreaSx: SxProps<Theme> = {
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderBottom: "1px solid",
    borderColor: "divider",
    px: 2.5
};

const drawerDetailsSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    px: 2.5,
    pt: 3,
    pb: 3
};

const titleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "flex-start",
    gap: 0.5
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
    fontSize: "12px !important",
    width: "12px !important",
    height: "12px !important"
};

const navListSx: SxProps<Theme> = {
    mx: -1
};

const navItemSx: SxProps<Theme> = {
    borderRadius: 1,
    px: 1,
    py: 0.5,
    gap: 0.5
};

const navIconSx: SxProps<Theme> = {
    minWidth: 0,
    mr: 1,
    color: "text.secondary"
};

const mainColumnSx: SxProps<Theme> = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
};

const appBarSx: SxProps<Theme> = {
    height: 56,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    px: 4,
    gap: 2,
    bgcolor: "primary.light"
};

const appBarSearchSx: SxProps<Theme> = {
    minWidth: "183px",
    width: "268px"
};

const contentRowSx: SxProps<Theme> = {
    flex: 1,
    display: "flex",
    overflow: "hidden"
};

const centerContentSx: SxProps<Theme> = {
    flex: 1,
    minWidth: 0,
    overflowY: "auto",
    px: 4,
    py: 3,
    display: "flex",
    flexDirection: "column",
    gap: 2
};

const videoCardPaperSx: SxProps<Theme> = {
    overflow: "hidden",
    px: "10px"
};

const cardActionBarSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    // px:0 so the buttons align with the thumbnail edges (Paper provides the 10px padding)
    px: 0,
    py: 1.5
};

const templateDetailsHoverWrapperSx: SxProps<Theme> = {
    position: "relative",
    "&:hover .template-details-edit-icon": { opacity: 1 }
};

const templateDetailsEditIconSx: SxProps<Theme> = {
    position: "absolute",
    top: 8,
    right: 8,
    opacity: 0,
    transition: "opacity 150ms",
    color: "action.active"
};

const videoThumbWrapperSx: SxProps<Theme> = {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: 1,
    overflow: "hidden",
    bgcolor: "action.hover",
    border: "1px solid",
    borderColor: "divider"
};

const videoThumbImgSx: SxProps<Theme> = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
};

const metaRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center"
};

const metaItemSx: SxProps<Theme> = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    px: 2,
    py: 1.5
};

const metaDetailRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "flex-start",
    px: 2,
    py: 1.5
};

const templateDetailsBodySx: SxProps<Theme> = {
    ml: 1.5,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 1
};

const chipsRowSx: SxProps<Theme> = {
    display: "flex",
    flexWrap: "wrap",
    gap: 0.5
};

const detailsChipsRowSx: SxProps<Theme> = {
    display: "flex",
    flexWrap: "wrap",
    gap: 1,
    alignItems: "center"
};

// Dashed pill for the "On-going version" row — matches the dashedLabel pattern
// used in TemplateCard.tsx and VideoCard.tsx for consistency across cards.
const onGoingDashedLabelSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    border: "1px dashed",
    borderColor: "divider",
    borderRadius: "4px",
    px: 1,
    py: "2px",
    mt: "2px"
};

// Snackbar pinned to the bottom-center of the viewport — matches the
// success-toast pattern used in LanguagesPanel.tsx.
const feedbackSnackbarWrapperSx: SxProps<Theme> = {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: (theme) => theme.zIndex.snackbar
};

const rightPanelSx: SxProps<Theme> = {
    width: 340,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    overflowY: "auto",
    p: 3
};

const rightCardSx: SxProps<Theme> = {
    p: 2,
    flexShrink: 0
};

const rightListItemSx: SxProps<Theme> = {
    borderRadius: 1,
    px: 1,
    py: 1,
    gap: 0.5
};

const sharingTitleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "flex-start",
    gap: 1,
    mb: 1
};

const sharingItemSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    px: 1,
    py: 1,
    borderRadius: 1,
    gap: 0.5
};

const btnIconSx: SxProps<Theme> = {
    fontSize: "14px !important",
    width: "14px !important",
    height: "14px !important"
};

const darkTooltipSx = {
    bgcolor: "secondary.main",
    borderRadius: "8px",
    px: 1.5,
    py: 1
};

const darkTooltipArrowSx = {
    color: "secondary.main"
};
