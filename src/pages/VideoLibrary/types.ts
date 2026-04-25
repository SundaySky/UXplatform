import { type VideoPermissionSettings } from "../../dialogs/VideoPermissionDialog";

export interface LiveVideoState {
  phase: number
  pageState: "draft" | "pending"
  sentApprovers: string[]
  headingText?: string
  subheadingText?: string
  permSettings?: VideoPermissionSettings
}

export type StatusKey =
  | "Draft"
  | "Approving version..."
  | "Archived"
  | "In testing"
  | "Approved for sharing"
  | "Downloaded for Sharing"
  | "Downloaded"
  | "Live"
  | "Shared"
  | "Pending approval"

type StatusColor = "default" | "info" | "success" | "error" | "warning";
type StatusVariant = "standard" | "outlined";

export const STATUS_LABEL_MAP: Record<StatusKey, { color: StatusColor; variant?: StatusVariant; tooltip: string }> = {
    "Draft":                  { color: "default", tooltip: "Video is a draft and has not been approved for sharing." },
    "Approving version...":   { color: "default", variant: "outlined", tooltip: "Approval is in progress." },
    "Archived":               { color: "default", variant: "outlined", tooltip: "Video has been archived." },
    "In testing":             { color: "warning", tooltip: "Video is in testing." },
    "Approved for sharing":   { color: "info", tooltip: "Video is finalized and can be shared with viewers." },
    "Downloaded for Sharing": { color: "success", tooltip: "Video has been downloaded for sharing." },
    "Downloaded":             { color: "info", tooltip: "Video has been downloaded." },
    "Live":                   { color: "error", tooltip: "Video has been shared via Landing Page." },
    "Shared":                 { color: "info", tooltip: "Video has been shared." },
    "Pending approval":       { color: "default", tooltip: "Video is awaiting approval." }
};

export interface VideoItem {
  title: string
  subtitle?: string
  editedBy: string
  statuses: StatusKey[]
  personalized: boolean
}

const PHASE_TO_PENDING: Record<number, boolean> = { 0: false, 1: true, 2: true, 3: false, 4: false };

export function resolveStatuses(
    video: VideoItem,
    videoStates?: Record<string, LiveVideoState>
): StatusKey[] {
    const state = videoStates?.[video.title];
    if (!state) {
        return video.statuses;
    }
    const { phase, pageState } = state;
    if (phase >= 3) {
        return ["Approved for sharing"];
    }
    const isPending = phase > 0 ? PHASE_TO_PENDING[phase] : pageState === "pending";
    return [isPending ? "Pending approval" : "Draft"];
}
