import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import ApprovalDialog from "./dialogs/ApprovalDialog";
import ConfirmationDialog from "./dialogs/ConfirmationDialog";
import ApproveVideoDialog from "./dialogs/ApproveVideoDialog";
import CancelApprovalDialog from "./dialogs/CancelApprovalDialog";
import VideoLibraryPage from "./pages/VideoLibrary/VideoLibraryPage";
import { type VideoItem } from "./pages/VideoLibrary/types";
import { INITIAL_USERS } from "./AccountSettingsDialog";
import StudioPage from "./pages/Studio/StudioPage";
import { INITIAL_THREADS, TOTAL_COMMENT_COUNT } from "./pages/Studio/CommentsPanel";
import TemplatePage from "./pages/Template/TemplatePage";
import TemplateLibraryPage from "./pages/TemplateLibrary/TemplateLibraryPage";
import TemplateStudioPage from "./pages/TemplateStudio/TemplateStudioPage";
import { type NotificationItem } from "./panels/NotificationsPanel";
import VideoPermissionDialog, { type VideoPermissionSettings } from "./dialogs/VideoPermissionDialog";
import VideoOverviewPage from "./pages/VideoOverview/VideoOverviewPage";
import TasksPanel from "./components/TasksPanel";

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
    const [currentPage, setCurrentPage] = useState<"video" | "library" | "studio" | "template" | "template-library" | "template-studio">("library");
    const [templateStudioName, setTemplateStudioName] = useState("Template name");
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

    const navigateToVideoFor = (video: VideoItem, page: "video" | "studio") => {
        setSelectedVideo(video);
        setDialogStep("closed");
        setCurrentPage(page);
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
    const handleSelectVideo = (video: VideoItem) => navigateToVideoFor(video, "video");
    const handleEditVideo = (video: VideoItem) => navigateToVideoFor(video, "studio");

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
                        onEditVideo={handleEditVideo}
                        onNavigateToTemplate={() => setCurrentPage("template-library")}
                        onCreateTemplateFromScratch={(name) => {
                            setTemplateStudioName(name); setCurrentPage("template-studio"); 
                        }}
                        notifications={notifications}
                        videoStates={videoStates}
                        onPermChange={(key, s) => updateVideoState(key, { permSettings: s })}
                        onSubmitForApproval={(key, approvers) => updateVideoState(key, { sentApprovers: approvers, pageState: "pending", sentAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) })}
                        approvalsEnabled={approvalsEnabled}
                        approverIds={approverIds}
                        onApprovalsEnabledChange={(enabled) => {
                            setApprovalsEnabled(enabled);
                            if (!enabled) {
                                setVideoStates(prev => Object.fromEntries(
                                    Object.entries(prev).map(([k, v]) =>
                                        v.sentApprovers?.length > 0
                                            ? [k, { ...v, sentApprovers: [], pageState: "draft" as const }]
                                            : [k, v]
                                    )
                                ));
                            }
                        }}
                        onCancelUserApprovals={(userId) => {
                            setVideoStates(prev => Object.fromEntries(
                                Object.entries(prev).map(([k, v]) =>
                                    v.sentApprovers?.includes(userId)
                                        ? [k, { ...v, sentApprovers: [], pageState: "draft" as const }]
                                        : [k, v]
                                )
                            ));
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
                        onUserDeletionBlocked={() => {
                            // User deletion blocked - dialog removed
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

                ) : currentPage === "template-library" ? (
                /* ── Template library ─────────────────────────────────────────────── */
                    <TemplateLibraryPage
                        onNavigateBack={() => setCurrentPage("library")}
                        onNavigateToTemplate={(name) => {
                            setTemplateStudioName(name ?? "Template name");
                            setCurrentPage("template-studio");
                        }}
                        onCreateTemplateFromScratch={(name) => {
                            setTemplateStudioName(name); setCurrentPage("template-studio"); 
                        }}
                        notifications={notifications}
                    />

                ) : currentPage === "template" ? (
                /* ── Template page ────────────────────────────────────────────────── */
                    <TemplatePage
                        onNavigateBack={() => setCurrentPage("template-library")}
                        onNavigateToStudio={(name) => {
                            setTemplateStudioName(name ?? "Template name");
                            setCurrentPage("template-studio");
                        }}
                    />

                ) : currentPage === "template-studio" ? (
                /* ── Template studio ──────────────────────────────────────────────── */
                    <TemplateStudioPage
                        templateName={templateStudioName}
                        onNavigateToTemplatePage={() => setCurrentPage("template")}
                        onNavigateToLibrary={() => setCurrentPage("library")}
                    />

                ) : (
                /* ── Video page ───────────────────────────────────────────────────── */
                    <VideoOverviewPage
                        effectiveStatus={effectiveStatus}
                        videoTitle={selectedVideo?.title ?? "Video"}
                        videoPhase={videoPhase}
                        isPending={effectiveStatus === "pending" && videoPhase !== 2}
                        approvers={sentApprovers.length > 0 ? sentApprovers : ["sjohnson", "erodriguez"]}
                        pendingTooltip={pendingTooltip}
                        headingText={currentVState.headingText}
                        subheadingText={currentVState.subheadingText}
                        videoNavTab={videoNavTab}
                        onNavChange={setVideoNavTab}
                        onNavigateToLibrary={() => setCurrentPage("library")}
                        onManageAccess={() => setVideoPermDialogOpen(true)}
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
                        approvalsEnabled={approvalsEnabled}
                        videoPermSettings={videoPermSettings}
                    />
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

const appRootSx: SxProps<Theme> = { display: "flex", height: "100vh", overflow: "hidden" };
const appMainAreaSx: SxProps<Theme> = { flex: 1, display: "flex", overflow: "hidden" };

const dialogTitleSx: SxProps<Theme> = { color: "text.primary", pb: 1 };
const dialogContentTopPaddingSx: SxProps<Theme> = { pt: 2 };
const pendingApprovalsDescriptionSx: SxProps<Theme> = { color: "text.secondary", mb: 2 };
const dialogActionsSx: SxProps<Theme> = { px: 3, py: 2 };

