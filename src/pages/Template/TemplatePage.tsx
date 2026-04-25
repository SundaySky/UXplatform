import { useState } from "react";
import {
    Box, Typography, IconButton, SvgIcon, Button,
    Paper, Tabs, Tab, Divider, Switch,
    List, ListItemButton, ListItemIcon, ListItemText, Tooltip
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft, faEllipsisVertical, faPen,
    faCircleQuestion, faSquareList, faEnvelope,
    faCode, faDownload, faFileExport, faEye, faGlobe,
    faUsers, faCircleCheck, faCheck, faCircle, faCircleDot, faComment
} from "@fortawesome/pro-regular-svg-icons";
import {
    TruffleLink, TruffleAvatar, Label
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import ApprovalDialog from "../../dialogs/ApprovalDialog";
import ConfirmationDialog from "../../dialogs/ConfirmationDialog";
import ApproveVideoDialog from "../../dialogs/ApproveVideoDialog";
import CancelApprovalDialog from "../../dialogs/CancelApprovalDialog";
import PublishTemplateDialog from "../../dialogs/PublishTemplateDialog";
import CreateTemplateDialog from "../../dialogs/CreateTemplateDialog";
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function TemplatePage({
    onNavigateBack,
    onNavigateToStudio
}: {
    onNavigateBack: () => void;
    onNavigateToStudio?: (name?: string) => void;
}) {
    const [activeTab, setActiveTab] = useState(0);
    const [downloadableEnabled, setDownloadableEnabled] = useState(false);
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    // ── Approval flow state ────────────────────────────────────────────────
    const [videoPhase, setVideoPhase] = useState(0);
    const [pageState, setPageState] = useState<"draft" | "pending">("draft");
    const [approvers, setApprovers] = useState<string[]>([]);
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
        if (isPending) {
            return <Label label="In review" color="warning" size="small" />;
        }
        return <Label label="Draft" color="default" size="small" />;
    }

    // ── Action button ──────────────────────────────────────────────────────
    function ActionButton() {
        // Phase 0 + pending
        if (videoPhase === 0 && effectiveStatus === "pending") {
            return (
                <Tooltip title={pendingTooltip} placement="top" arrow
                    componentsProps={{ tooltip: { sx: darkTooltipSx }, arrow: { sx: darkTooltipArrowSx } }}
                >
                    <Button variant="outlined" size="medium" color="success"
                        startIcon={<SvgIcon sx={btnIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>}
                    >
                        Pending approval
                    </Button>
                </Tooltip>
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
                    startIcon={<SvgIcon sx={btnIconSx}><FontAwesomeIcon icon={faCircleQuestion} /></SvgIcon>}
                    onClick={() => onNavigateToStudio?.(TEMPLATE_TITLE)}
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

    // ── Approval progress step state ──────────────────────────────────────
    function getStepState(stepIndex: number): "completed" | "active" | "future" {
        const currentStep =
            videoPhase === 4 ? 3 :
                videoPhase === 3 ? 2 :
                    (videoPhase === 1 || videoPhase === 2 || (videoPhase === 0 && pageState === "pending")) ? 1 :
                        0;
        if (stepIndex < currentStep) {
            return "completed";
        }
        if (stepIndex === currentStep) {
            return "active";
        }
        return "future";
    }

    const hasComments = videoPhase === 1 || videoPhase === 2;

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

                    {/* Title row */}
                    <Box sx={titleRowSx}>
                        <Typography variant="subtitle2" sx={{ flex: 1 }}>
                            {TEMPLATE_TITLE}
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
                        <ListItemButton sx={navItemSx}>
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

                {/* AppBar */}
                <Box sx={appBarSx}>
                    <Typography variant="subtitle2" color="secondary.main">
                        Template Page
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton size="small" sx={iconBtnSx}>
                            <SvgIcon sx={iconSmSx}>
                                <FontAwesomeIcon icon={faGlobe} />
                            </SvgIcon>
                        </IconButton>
                        <Typography variant="body1" color="text.secondary">
                            Website
                        </Typography>
                        <IconButton size="small" sx={iconBtnSx}>
                            <SvgIcon sx={iconSmSx}>
                                <FontAwesomeIcon icon={faCircleQuestion} />
                            </SvgIcon>
                        </IconButton>
                    </Box>
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

                            {/* Template details */}
                            <Box sx={metaDetailRowSx}>
                                <TruffleAvatar
                                    icon={
                                        <SvgIcon>
                                            <FontAwesomeIcon icon={faSquareList} />
                                        </SvgIcon>
                                    }
                                    size="large"
                                />
                                <Box sx={{ ml: 1.5, flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Template details
                                    </Typography>
                                    <Typography variant="body1" noWrap>
                                        {TEMPLATE_TITLE}
                                    </Typography>
                                    <Box sx={tagsRowSx}>
                                        {TEMPLATE_DETAILS.purpose.map(p => (
                                            <Typography key={p} variant="caption" color="text.secondary">{p}</Typography>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>

                            <Divider />

                            {/* Approval progress */}
                            <Box sx={approvalProgressSx}>
                                {APPROVAL_STEPS.map((step, i) => {
                                    const state = getStepState(i);
                                    const isCompleted = state === "completed";
                                    const isActive = state === "active";
                                    return (
                                        <Box key={step.key} sx={stepRowSx}>
                                            <SvgIcon sx={isCompleted ? stepIconCompletedSx : isActive ? stepIconActiveSx : stepIconFutureSx}>
                                                <FontAwesomeIcon icon={isCompleted ? faCircleCheck : isActive ? faCircleDot : faCircle} />
                                            </SvgIcon>
                                            <Typography
                                                variant="body1"
                                                color={isActive ? "text.primary" : isCompleted ? "text.secondary" : "text.disabled"}
                                            >
                                                {step.label}
                                            </Typography>
                                            {step.showComments && hasComments && (
                                                <Box sx={commentChipSx}>
                                                    <SvgIcon sx={commentChipIconSx}>
                                                        <FontAwesomeIcon icon={faComment} />
                                                    </SvgIcon>
                                                    <Typography variant="caption" color="primary.main">
                                                        {TOTAL_COMMENT_COUNT} comments
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    );
                                })}
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
                }}
            />

            {/* Approval flow: step 2 — confirmation */}
            <ConfirmationDialog
                open={dialogStep === "confirmed"}
                onClose={() => setDialogStep("closed")}
                approverCount={approvers.length || 1}
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
                onConfirm={() => {
                    setCancelApprovalDialogOpen(false);
                    setVideoPhase(0);
                    setPageState("draft");
                    setApprovers([]);
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
                templateName={TEMPLATE_TITLE}
            />

            {/* Edit template details — pre-filled */}
            <CreateTemplateDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                mode="edit"
                initialName={TEMPLATE_DETAILS.name}
                initialAspectRatio={TEMPLATE_DETAILS.aspectRatio}
                initialAudience={TEMPLATE_DETAILS.audience}
                initialPurpose={TEMPLATE_DETAILS.purpose}
                initialDescription={TEMPLATE_DETAILS.description}
                onSubmit={() => setEditDialogOpen(false)}
            />
        </Box>
    );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const APPROVAL_STEPS = [
    { key: "draft", label: "New version draft", showComments: false },
    { key: "pending", label: "Pending approval", showComments: true },
    { key: "granted", label: "Approval granted", showComments: false },
    { key: "sharing", label: "Approve for sharing", showComments: false }
] as const;

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
    bgcolor: "other.editorBackground"
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
    justifyContent: "space-between",
    px: 4,
    bgcolor: "other.editorBackground",
    borderBottom: "1px solid",
    borderColor: "divider"
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
    overflow: "hidden"
};

const cardActionBarSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 2,
    py: 1.5
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

const tagsRowSx: SxProps<Theme> = {
    display: "flex",
    flexWrap: "wrap",
    gap: 1,
    mt: 0.75
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

const approvalProgressSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    px: 2,
    py: 2
};

const stepRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1.5
};

const stepIconCompletedSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "success.main",
    flexShrink: 0
};

const stepIconActiveSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "primary.main",
    flexShrink: 0
};

const stepIconFutureSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "text.disabled",
    flexShrink: 0
};

const commentChipSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    px: 1,
    py: 0.25,
    borderRadius: "100px",
    border: "1px solid",
    borderColor: "primary.main",
    bgcolor: "action.selected",
    ml: 0.5
};

const commentChipIconSx: SxProps<Theme> = {
    fontSize: "12px !important",
    width: "12px !important",
    height: "12px !important",
    color: "primary.main"
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
