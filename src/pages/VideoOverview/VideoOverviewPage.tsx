import { AppBar, Box, Link, Toolbar, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Search } from "@sundaysky/smartvideo-hub-truffle-component-library";
import { type VideoPermissionSettings } from "../../dialogs/VideoPermissionDialog";
import OverviewSidebar from "./OverviewSidebar";
import VideoPreviewCard from "./VideoPreviewCard";
import ReviewOptionsPanel from "./ReviewOptionsPanel";

export default function VideoOverviewPage({
    effectiveStatus,
    videoTitle,
    videoPhase,
    isPending,
    approvers,
    pendingTooltip,
    headingText,
    subheadingText,
    videoNavTab,
    onNavChange,
    onNavigateToLibrary,
    onManageAccess,
    onSentForApproval,
    onEdit,
    onApproveVideo,
    approvalsEnabled = false,
    videoPermSettings,
    enabledLangs = []
}: {
  effectiveStatus: "draft" | "pending" | "approved"
  videoTitle: string
  videoPhase: number
  isPending: boolean
  approvers: string[]
  pendingTooltip: string
  headingText?: string
  subheadingText?: string
  videoNavTab: "edit" | "share" | "analyze"
  onNavChange: (nav: "edit" | "share" | "analyze") => void
  onNavigateToLibrary: () => void
  onManageAccess: () => void
  onSentForApproval: () => void
  onEdit: (fromComments?: boolean) => void
  onApproveVideo: () => void
  approvalsEnabled?: boolean
  videoPermSettings?: VideoPermissionSettings
  enabledLangs?: string[]
}) {
    return (
        <Box sx={videoPageLayoutSx}>
            <OverviewSidebar
                effectiveStatus={effectiveStatus}
                videoTitle={videoTitle}
                onNavigateToLibrary={onNavigateToLibrary}
                videoPermSettings={videoPermSettings}
                onManageAccess={onManageAccess}
                selectedNav={videoNavTab}
                onNavChange={onNavChange}
            />

            <Box sx={videoPageContentColumnSx}>
                {/* AppBar */}
                <AppBar position="static" color="transparent" elevation={0} sx={videoPageAppBarSx}>
                    <Toolbar sx={videoPageToolbarSx}>
                        <Typography variant="h2" color="text.primary">Video Page</Typography>
                        <Box sx={{ flex: 1 }} />
                        <Search
                            size="small"
                            value=""
                            onChange={() => {}}
                            onClear={() => {}}
                            numberOfResults={0}
                            placeholder="Search libraries"
                            sx={videoPageSearchSx}
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
                                <Link component="button" variant="body1" onClick={() => onNavChange("edit")}>
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
                                    approvers={approvers}
                                    pendingTooltip={pendingTooltip}
                                    headingText={headingText}
                                    subheadingText={subheadingText}
                                    videoTitle={videoTitle}
                                    onSentForApproval={onSentForApproval}
                                    onEdit={onEdit}
                                    onApproveVideo={onApproveVideo}
                                    approvalsEnabled={approvalsEnabled}
                                    enabledLangs={enabledLangs}
                                />
                            </Box>
                            <ReviewOptionsPanel isPending={isPending} />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

const videoPageLayoutSx: SxProps<Theme> = {
    display: "flex", width: "100%", height: "100%", bgcolor: "primary.light", overflow: "hidden"
};
const videoPageContentColumnSx: SxProps<Theme> = { display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" };
const videoPageAppBarSx: SxProps<Theme> = {
    bgcolor: "primary.light",
    height: "56px",
    borderBottom: 1,
    borderBottomColor: "transparent"
};
const videoPageToolbarSx: SxProps<Theme> = {
    minHeight: "56px !important",
    height: "56px",
    px: 3,
    gap: 1
};
const videoPageSearchSx: SxProps<Theme> = {
    width: 268,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    backgroundColor: (theme: any) => alpha(theme.palette.white.main, 0.75)
};
const videoPageScrollSx: SxProps<Theme> = { flex: 1, overflow: "auto" };
const videoPageInnerSx: SxProps<Theme> = {
    maxWidth: 900, mx: "auto",
    px: 4, pb: 4, pt: 2,
    display: "flex", gap: 3, alignItems: "flex-start"
};
const videoPageCardColumnSx: SxProps<Theme> = { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 };

const shareEmptyStateSx: SxProps<Theme> = {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    flex: 1, gap: 2, py: 8, textAlign: "center"
};
const shareEmptyIllustrationSx: SxProps<Theme> = { width: 120, height: 120, opacity: 0.3 };
const shareEmptyTitleSx: SxProps<Theme> = { color: "text.primary" };
