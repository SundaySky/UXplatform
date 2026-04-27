import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { TruffleAlert } from "@sundaysky/smartvideo-hub-truffle-component-library";
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
import { type TemplateItem } from "./pages/TemplateLibrary/TemplateCard";
import type { NewTemplateData } from "./components/AppSidebar";
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

// Plausible details for the sample templates in the library (so the Template page
// shows something coherent when the user clicks a card they didn't create themselves).
const LIBRARY_TEMPLATE_DETAILS: Record<string, NewTemplateData> = {
    "Motivation": {
        name: "Motivation",
        aspectRatio: "16:9",
        audience: ["Marketing team", "Customer Success"],
        purpose: ["Engagement"],
        description: "Inspire and motivate viewers with a personalized message that reinforces their progress and the value of staying engaged."
    },
    "Nice to see you!": {
        name: "Nice to see you!",
        aspectRatio: "16:9",
        audience: ["Customer Success"],
        purpose: ["Onboarding", "Retention"],
        description: "A warm, personalized greeting for returning customers — reminds them what they last did and what's worth checking out next."
    },
    "Welcome to SundaySky": {
        name: "Welcome to SundaySky",
        aspectRatio: "16:9",
        audience: ["All contributors"],
        purpose: ["Onboarding"],
        description: "Personalized welcome video for new users — introduces the platform, the team, and the most useful first steps."
    },
    "Live Fully in Vietnam": {
        name: "Live Fully in Vietnam",
        aspectRatio: "16:9",
        audience: ["Marketing team"],
        purpose: ["Marketing", "Awareness"],
        description: "Awareness-driver for the Vietnam launch — highlights local stories and the lifestyle benefits of the program."
    },
    "Looking forward to talking to you": {
        name: "Looking forward to talking to you",
        aspectRatio: "16:9",
        audience: ["Sales team"],
        purpose: ["Sales"],
        description: "A pre-meeting reminder for prospects — reinforces the meeting agenda and the value the rep will bring to the call."
    }
};

function lookupTemplateData(
    title: string,
    createdByTitle: Record<string, NewTemplateData>
): NewTemplateData {
    if (createdByTitle[title]) {
        return createdByTitle[title];
    }
    if (LIBRARY_TEMPLATE_DETAILS[title]) {
        return LIBRARY_TEMPLATE_DETAILS[title];
    }
    // Generic fallback — title-only template with sensible defaults.
    return {
        name: title,
        aspectRatio: "16:9",
        audience: ["All contributors"],
        purpose: ["General"],
        description: `Template for ${title}.`
    };
}

export default function App() {
    const theme = useTheme();
    const [currentPage, setCurrentPage] = useState<"video" | "library" | "studio" | "template" | "template-library" | "template-studio">("library");
    const [templateStudioName, setTemplateStudioName] = useState("Template name");
    const [createdTemplates, setCreatedTemplates] = useState<TemplateItem[]>([]);
    // Full form data of every user-created template, keyed by title — used by
    // TemplatePage to show the actual entries the user filled in.
    const [createdTemplateDataByTitle, setCreatedTemplateDataByTitle] = useState<Record<string, NewTemplateData>>({});
    // The template the user is currently viewing on the Template page.
    const [currentTemplateData, setCurrentTemplateData] = useState<NewTemplateData | undefined>(undefined);
    // Current task index in the side TasksPanel — used to drive scenario state
    // (e.g., on task 7 the template page shows "3 comments from approver").
    const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
    // Languages selected by the user — lifted out of Studio/TemplateStudio so
    // selections persist across task switches and page navigations.
    const [enabledLangs, setEnabledLangs] = useState<string[]>([]);
    // In-progress language picks (before "Enable translations" applies them).
    // Also lifted so partial selections survive task switches.
    const [selectedLangs, setSelectedLangs] = useState<string[]>([]);

    // Per-template approval state — lifted out of TemplatePage so approval
    // selections (approvers, phase, etc.) persist across task switches.
    type TemplateApprovalState = {
        videoPhase: number;
        pageState: "draft" | "pending";
        approvers: string[];
        isPublished: boolean;
    };
    const [templateApprovalStates, setTemplateApprovalStates] = useState<Record<string, TemplateApprovalState>>({});

    const getTemplateApprovalState = (title: string | undefined): TemplateApprovalState => {
        if (!title) {
            return { videoPhase: 0, pageState: "draft", approvers: [], isPublished: false };
        }
        return templateApprovalStates[title] ?? { videoPhase: 0, pageState: "draft", approvers: [], isPublished: false };
    };

    const updateTemplateApprovalState = (title: string | undefined, patch: Partial<TemplateApprovalState>) => {
        if (!title) {
            return;
        }
        setTemplateApprovalStates(prev => {
            // Read from `prev` (not the closure) so consecutive batched patches —
            // e.g. setVideoPhase(0), setPageState("draft"), setApprovers([]) called
            // back-to-back in the resubmit flow — all compose correctly instead of
            // clobbering each other off a stale base.
            const existing = prev[title] ?? { videoPhase: 0, pageState: "draft" as const, approvers: [], isPublished: false };
            return {
                ...prev,
                [title]: { ...existing, ...patch }
            };
        });
    };

    const handleTemplateAdded = (data: NewTemplateData) => {
        const newTemplate: TemplateItem = {
            title: data.name,
            editedBy: "Edited just now by you",
            status: "Draft",
            personalized: false,
            purposeLabels: data.purpose
        };
        setCreatedTemplates(prev => [newTemplate, ...prev]);
        setCreatedTemplateDataByTitle(prev => ({ ...prev, [data.name]: data }));
        setCurrentTemplateData(data);
    };

    // Resolves the full data for any template title — user-created first, then
    // hardcoded library defaults, then a generic fallback.
    const resolveTemplateData = (title: string) =>
        lookupTemplateData(title, createdTemplateDataByTitle);

    // Marks the current template's card with "Pending approval" when the user
    // submits it for approval on the Template page.
    const handleTemplateApprovalSubmitted = () => {
        if (!currentTemplateData) {
            return;
        }
        setCreatedTemplates(prev => prev.map(t =>
            t.title === currentTemplateData.name
                ? { ...t, versionStatus: "Pending approval" }
                : t
        ));
    };

    // Clears the pending status when the user cancels the approval request.
    const handleTemplateApprovalCancelled = () => {
        if (!currentTemplateData) {
            return;
        }
        setCreatedTemplates(prev => prev.map(t =>
            t.title === currentTemplateData.name
                ? { ...t, versionStatus: undefined, commentsCount: undefined }
                : t
        ));
    };

    // Track templates that have been resubmitted from the comments panel,
    // so the Template page no longer shows the "View N comments" button
    // and the card hides the comments pill.
    const [resubmittedTemplateNames, setResubmittedTemplateNames] = useState<Set<string>>(new Set());

    // When the user is at task 7 (idx 6 — "Sarah submitted feedback"), surface
    // comments on the current template's card. Uses the same TOTAL_COMMENT_COUNT
    // as the "View N comments in Studio" button so both numbers match.
    // After the user resubmits from the comments panel, we suppress the comments
    // pill on the card even if task 7 is still active.
    useEffect(() => {
        if (!currentTemplateData) {
            return;
        }
        const hasResubmitted = resubmittedTemplateNames.has(currentTemplateData.name);
        const isTaskSeven = currentTaskIdx === 6 && !hasResubmitted;
        setCreatedTemplates(prev => prev.map(t =>
            t.title === currentTemplateData.name
                ? { ...t, commentsCount: isTaskSeven ? TOTAL_COMMENT_COUNT : undefined }
                : t
        ));
    }, [currentTaskIdx, currentTemplateData, resubmittedTemplateNames]);

    // When the user is at task 8 (idx 7 — "ready to go live in Amplify"), the
    // template is fully approved: update its approval state to phase 4 and
    // surface "Approval granted" on the card.
    useEffect(() => {
        if (!currentTemplateData) {
            return;
        }
        if (currentTaskIdx === 7) {
            setCreatedTemplates(prev => prev.map(t =>
                t.title === currentTemplateData.name
                    ? { ...t, versionStatus: "Approval granted", commentsCount: undefined }
                    : t
            ));
            updateTemplateApprovalState(currentTemplateData.name, {
                videoPhase: 4,
                pageState: "draft",
                approvers: ["sjohnson"]
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTaskIdx, currentTemplateData]);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const [videoStates, setVideoStates] = useState<Record<string, VideoState>>({});
    const [dialogStep, setDialogStep] = useState<"closed" | "form" | "confirmed">("closed");
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [cancelApprovalDialogOpen, setCancelApprovalDialogOpen] = useState(false);
    const [openCommentsOnStudio, setOpenCommentsOnStudio] = useState(false);
    const [openCommentsCounter, setOpenCommentsCounter] = useState(0);
    const [openCommentsOnTemplateStudio, setOpenCommentsOnTemplateStudio] = useState(false);
    // Snackbar shown after the user clicks "Resubmit for approval" in the comments panel
    const [resubmittedSnackbarApprover, setResubmittedSnackbarApprover] = useState<string | null>(null);
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
                        onTemplateAdded={handleTemplateAdded}
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
                        enabledLangs={enabledLangs}
                        onEnabledLangsChange={setEnabledLangs}
                        selectedLangs={selectedLangs}
                        onSelectedLangsChange={setSelectedLangs}
                    />

                ) : currentPage === "template-library" ? (
                /* ── Template library ─────────────────────────────────────────────── */
                    <TemplateLibraryPage
                        onNavigateBack={() => setCurrentPage("library")}
                        onNavigateToTemplate={(name) => {
                            const title = name ?? "Template name";
                            setTemplateStudioName(title);
                            setCurrentTemplateData(resolveTemplateData(title));
                            setCurrentPage("template");
                        }}
                        onCreateTemplateFromScratch={(name) => {
                            setTemplateStudioName(name); setCurrentPage("template-studio");
                        }}
                        onTemplateAdded={handleTemplateAdded}
                        createdTemplates={createdTemplates}
                        notifications={notifications}
                    />

                ) : currentPage === "template" ? (
                /* ── Template page ────────────────────────────────────────────────── */
                    <TemplatePage
                        template={currentTemplateData}
                        onNavigateBack={() => setCurrentPage("template-library")}
                        onNavigateToStudio={(name) => {
                            setTemplateStudioName(name ?? "Template name");
                            setOpenCommentsOnTemplateStudio(false);
                            setCurrentPage("template-studio");
                        }}
                        onViewComments={(name) => {
                            setTemplateStudioName(name ?? currentTemplateData?.name ?? "Template name");
                            setOpenCommentsOnTemplateStudio(true);
                            setCurrentPage("template-studio");
                        }}
                        onApprovalSubmitted={handleTemplateApprovalSubmitted}
                        onApprovalCancelled={handleTemplateApprovalCancelled}
                        showApproverComments={currentTaskIdx === 6 && !(currentTemplateData && resubmittedTemplateNames.has(currentTemplateData.name))}
                        approvalState={getTemplateApprovalState(currentTemplateData?.name)}
                        onApprovalStateChange={(patch) => updateTemplateApprovalState(currentTemplateData?.name, patch)}
                    />

                ) : currentPage === "template-studio" ? (
                /* ── Template studio ──────────────────────────────────────────────── */
                    <TemplateStudioPage
                        inputFormBuilderFilled={currentTaskIdx === 6}
                        templateName={templateStudioName}
                        onNavigateToTemplatePage={() => {
                            // Make sure the Template page reflects whichever template is in the studio.
                            setCurrentTemplateData(resolveTemplateData(templateStudioName));
                            setCurrentPage("template");
                        }}
                        onNavigateToLibrary={() => setCurrentPage("library")}
                        enabledLangs={enabledLangs}
                        onEnabledLangsChange={setEnabledLangs}
                        selectedLangs={selectedLangs}
                        onSelectedLangsChange={setSelectedLangs}
                        openCommentsOnMount={openCommentsOnTemplateStudio}
                        onCommentsResubmitted={() => {
                            const title = templateStudioName;
                            // Default approver name when none is tracked yet
                            const approverName = "Sarah Johnson";
                            // 1) Mark as resubmitted so Template page hides the "View N comments" button
                            setResubmittedTemplateNames(prev => {
                                const next = new Set(prev);
                                next.add(title);
                                return next;
                            });
                            // 2) Reset approval state to phase 0 + pending so the page shows
                            //    the "Pending approval" split button.
                            updateTemplateApprovalState(title, {
                                videoPhase: 0,
                                pageState: "pending",
                                approvers: ["sjohnson"]
                            });
                            // 3) Update the card: keep "Pending approval" pill, clear comments count
                            setCreatedTemplates(prev => prev.map(t =>
                                t.title === title
                                    ? { ...t, versionStatus: "Pending approval", commentsCount: undefined }
                                    : t
                            ));
                            // 4) Show success snackbar at bottom of viewport
                            setResubmittedSnackbarApprover(approverName);
                            setTimeout(() => setResubmittedSnackbarApprover(null), 6000);
                        }}
                    />

                ) : (
                /* ── Video page ───────────────────────────────────────────────────── */
                    /* Task 1 (Languages) hides every approval-flow element on the
                       video page: the page renders as a clean draft with the standalone
                       "Approve" button (the variant shown when approvalsEnabled=false).
                       Edit behaves as it always does — opens the studio without the
                       cancel-approval gate. */
                    (() => {
                        const isLanguagesTask = currentTaskIdx === 0;
                        return (
                            <VideoOverviewPage
                                effectiveStatus={isLanguagesTask ? "draft" : effectiveStatus}
                                videoTitle={selectedVideo?.title ?? "Video"}
                                videoPhase={isLanguagesTask ? 0 : videoPhase}
                                isPending={isLanguagesTask ? false : effectiveStatus === "pending" && videoPhase !== 2}
                                approvers={isLanguagesTask ? [] : sentApprovers.length > 0 ? sentApprovers : ["sjohnson", "erodriguez"]}
                                pendingTooltip={pendingTooltip}
                                headingText={currentVState.headingText}
                                subheadingText={currentVState.subheadingText}
                                videoNavTab={videoNavTab}
                                onNavChange={setVideoNavTab}
                                onNavigateToLibrary={() => setCurrentPage("library")}
                                onManageAccess={() => setVideoPermDialogOpen(true)}
                                onSentForApproval={() => setDialogStep("form")}
                                onEdit={(fromComments?: boolean) => {
                                    if (!isLanguagesTask && isPending && videoPhase !== 2 && !fromComments) {
                                        setCancelApprovalDialogOpen(true);
                                    }
                                    else {
                                        setOpenCommentsOnStudio(fromComments ?? false);
                                        setCurrentPage("studio");
                                    }
                                }}
                                onApproveVideo={() => setApproveDialogOpen(true)}
                                approvalsEnabled={isLanguagesTask ? false : approvalsEnabled}
                                videoPermSettings={videoPermSettings}
                            />
                        );
                    })()
                )}
            </Box>

            {/* ── Tasks panel — always visible, outside the app ──────────────────── */}
            <TasksPanel
                onTaskDone={(idx) => {
                    const key = currentKey || "Stay Safe During Missile Threats";
                    updateVideoState(key, { phase: idx + 1 });
                    setCurrentPage("library");
                }}
                onCurrentTaskChange={setCurrentTaskIdx}
            />

            {/* ── Resubmitted-from-comments snackbar (fixed bottom-center) ──────── */}
            {resubmittedSnackbarApprover !== null && (
                <Box sx={resubmittedSnackbarWrapperSx}>
                    {/* @ts-expect-error TruffleAlert's typed Pick<HTMLAttributes> incorrectly requires React 18 placeholder/onPointer props; remove when the library switches to Omit. */}
                    <TruffleAlert
                        severity="success"
                        variant="filled"
                        CloseIconButtonProps={{ onClick: () => setResubmittedSnackbarApprover(null) }}
                    >
                        Video resubmitted to {resubmittedSnackbarApprover} for approval
                    </TruffleAlert>
                </Box>
            )}

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

// Bottom-center toast for the "Video resubmitted to X for approval" snackbar
const resubmittedSnackbarWrapperSx: SxProps<Theme> = {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: (theme) => theme.zIndex.snackbar
};

