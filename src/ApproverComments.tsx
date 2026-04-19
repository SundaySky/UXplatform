import type { SxProps, Theme } from "@mui/material";
import {
    Stack, Box, Typography, TextField, Button,
    ToggleButton, Divider, SvgIcon,
} from "@mui/material";
import {
    TruffleToggleButtonGroup,
    AttentionBox, AttentionBoxContent,
    Label,
    combineSxProps,
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/pro-regular-svg-icons";

// ── Public API ────────────────────────────────────────────────────────────────

export type CommentEntry = {
    id: string;
    author: string;
    timestamp: string;
    text: string;
};

export type UpdatedWarning = {
    timestamp: string;
    author: string;
};

export type CreatorView = "unresolved" | "history";
export type ApproverView = "decision" | "comments" | "history";

type BaseProps = { sx?: SxProps<Theme> };

type CreatorProps = BaseProps & {
    role: "creator";
    view?: CreatorView;
    onViewChange?: (view: CreatorView) => void;
    entries?: CommentEntry[];
};

type ApproverProps = BaseProps & {
    role: "approver";
    view?: ApproverView;
    onViewChange?: (view: ApproverView) => void;
    entries?: CommentEntry[];
    updatedWarning?: UpdatedWarning;
    draftText?: string;
    onDraftChange?: (text: string) => void;
    onApprove?: () => void;
    onSendComments?: () => void;
};

export type ApproverCommentsProps = CreatorProps | ApproverProps;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ApproverComments(props: ApproverCommentsProps) {
    const rootSx = props.sx ? combineSxProps(containerSx, props.sx) : containerSx;

    if (props.role === "creator") {
        const view = props.view ?? "unresolved";
        const entries = props.entries ?? [];
        const showEmpty = view === "unresolved" && entries.length === 0;

        return (
            <Box sx={rootSx}>
                <TabsBar
                    value={view}
                    options={creatorTabs}
                    onChange={v => props.onViewChange?.(v as CreatorView)}
                />
                {showEmpty ? <CreatorEmptyState /> : <CommentList entries={entries} />}
            </Box>
        );
    }

    const view = props.view ?? "decision";
    const entries = props.entries ?? [];

    if (view === "decision") {
        return (
            <Stack sx={combineSxProps(rootSx, decisionContainerSx)} spacing={2}>
                {props.updatedWarning && <UpdatedWarningBox warning={props.updatedWarning} />}
                <Stack spacing={1}>
                    <Button variant="contained" color="primary" size="large" fullWidth onClick={props.onApprove}>
                        Approve video
                    </Button>
                    <Button variant="outlined" color="primary" size="large" fullWidth onClick={props.onSendComments}>
                        Send comments
                    </Button>
                </Stack>
            </Stack>
        );
    }

    return (
        <Box sx={rootSx}>
            <TabsBar
                value={view}
                options={approverTabs}
                onChange={v => props.onViewChange?.(v as ApproverView)}
            />
            {view === "comments" && (
                <Stack spacing={1.5}>
                    {props.updatedWarning && <UpdatedWarningBox warning={props.updatedWarning} />}
                    <Box>
                        <Typography variant="h6" sx={fieldLabelSx}>Comments</Typography>
                        <TextField
                            variant="outlined"
                            multiline
                            rows={10}
                            fullWidth
                            value={props.draftText ?? ""}
                            onChange={e => props.onDraftChange?.(e.target.value)}
                            placeholder="Type comments or paste a link to an external document."
                        />
                    </Box>
                </Stack>
            )}
            {view === "history" && <CommentList entries={entries} />}
        </Box>
    );
}

// ── Internal parts ────────────────────────────────────────────────────────────

type TabOption<V extends string> = { value: V; label: string };

const creatorTabs: TabOption<CreatorView>[] = [
    { value: "unresolved", label: "Unresolved" },
    { value: "history", label: "History" },
];

const approverTabs: TabOption<ApproverView>[] = [
    { value: "comments", label: "Comments" },
    { value: "history", label: "History" },
];

function TabsBar<V extends string>({
    value, options, onChange,
}: {
    value: V;
    options: TabOption<V>[];
    onChange: (v: V) => void;
}) {
    return (
        <Box sx={tabsBarSx}>
            <TruffleToggleButtonGroup
                value={value}
                exclusive
                size="small"
                onChange={(_, v) => {
                    if (v !== null) {
                        onChange(v as V);
                    }
                }}
            >
                {options.map(opt => (
                    <ToggleButton key={opt.value} value={opt.value}>{opt.label}</ToggleButton>
                ))}
            </TruffleToggleButtonGroup>
            <Divider sx={tabsDividerSx} />
        </Box>
    );
}

function UpdatedWarningBox({ warning }: { warning: UpdatedWarning }) {
    return (
        <AttentionBox
            color="warning"
            icon={<SvgIcon sx={warningIconSx}><FontAwesomeIcon icon={faTriangleExclamation} /></SvgIcon>}
        >
            <AttentionBoxContent>
                This video has been updated since the first approval request ({warning.timestamp} by {warning.author}).
            </AttentionBoxContent>
        </AttentionBox>
    );
}

function CreatorEmptyState() {
    return (
        <Box sx={emptyStateSx}>
            <Typography variant="body1">
                There are no unresolved comments for this video.
            </Typography>
            <Typography variant="body1" sx={emptyStateLineSx}>
                If you request approval, you&apos;ll be notified by email when feedback is available.
            </Typography>
        </Box>
    );
}

function CommentList({ entries }: { entries: CommentEntry[] }) {
    if (entries.length === 0) {
        return null;
    }
    return (
        <Stack spacing={2}>
            {entries.map(entry => (
                <Stack key={entry.id} spacing={1}>
                    <Box>
                        <Label
                            label={`By ${entry.author}, ${entry.timestamp}`}
                            color="info"
                            size="small"
                        />
                    </Box>
                    <Typography variant="body1" sx={commentTextSx}>
                        {entry.text}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const containerSx: SxProps<Theme> = {
    width: 260,
    display: "flex",
    flexDirection: "column",
};

const tabsBarSx: SxProps<Theme> = {
    mb: 1.5,
};

const tabsDividerSx: SxProps<Theme> = {
    mt: 1,
};

const decisionContainerSx: SxProps<Theme> = {
    pt: 2,
};

const fieldLabelSx: SxProps<Theme> = {
    color: "text.primary",
    mb: 0.75,
};

const warningIconSx: SxProps<Theme> = {
    color: "warning.main",
    fontSize: 16,
};

const emptyStateSx: SxProps<Theme> = {
    py: 3,
};

const emptyStateLineSx: SxProps<Theme> = {
    mt: 2,
};

const commentTextSx: SxProps<Theme> = {
    color: "text.primary",
    whiteSpace: "pre-wrap",
};
