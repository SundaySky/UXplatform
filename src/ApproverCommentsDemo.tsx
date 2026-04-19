import { useState } from "react";
import type { SxProps, Theme } from "@mui/material";
import {
    Dialog, DialogContent, Box, Typography, Stack, Divider,
    FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
    Checkbox, Button,
} from "@mui/material";
import { TruffleDialogTitle } from "@sundaysky/smartvideo-hub-truffle-component-library";
import ApproverComments, {
    type CommentEntry, type CreatorView, type ApproverView, type UpdatedWarning,
} from "./ApproverComments";

type Role = "creator" | "approver";

const SAMPLE_COMMENT_TEXT = `We have a lot of right-to-left "wipe" animations and transitions. Cutting these down will help.

0:19 - we rapidly cycle in 3 video examples in 2 seconds. Not necessary and too fast for viewer to absorb anything. We can just put one up there and let it sit for moment. (And wait a beat before it comes in – let "Transform performance marketing" stay on screen long enough for the viewer to read it.)

1:12 – similar thing, we cycle 2 video examples in 1 second. Just let the Chair ad sit there then zoom out to the others. No need to cram another example in first.`;

const CREATOR_ENTRIES: CommentEntry[] = [
    { id: "c1", author: "[Approver 1]", timestamp: "Mar 23, 12:05 PM", text: SAMPLE_COMMENT_TEXT },
];
const APPROVER_ENTRIES: CommentEntry[] = [
    { id: "a1", author: "You (or approver name)", timestamp: "Mar 23 12:05PM", text: SAMPLE_COMMENT_TEXT },
];
const WARNING: UpdatedWarning = { timestamp: "Today, 2:32 PM", author: "[Creator Name]" };
const FULL_DRAFT_TEXT = "All the comments the approver wrote will show here";

type Preset = {
    key: string;
    label: string;
    role: Role;
    creatorView?: CreatorView;
    approverView?: ApproverView;
    hasEntries: boolean;
    draftText?: string;
};

const PRESETS: Preset[] = [
    { key: "c-unresolved-filled", label: "(C) Unresolved — free text",           role: "creator",  creatorView: "unresolved", hasEntries: true  },
    { key: "c-unresolved-empty",  label: "(C) Unresolved — no comments yet",     role: "creator",  creatorView: "unresolved", hasEntries: false },
    { key: "c-history",           label: "(C) History — free text",              role: "creator",  creatorView: "history",    hasEntries: true  },
    { key: "a-decision",          label: "(A) Approve or comments",              role: "approver", approverView: "decision",  hasEntries: false },
    { key: "a-comments-empty",    label: "(A) Empty comments",                   role: "approver", approverView: "comments",  hasEntries: false, draftText: "" },
    { key: "a-comments-full",     label: "(A) Full comments",                    role: "approver", approverView: "comments",  hasEntries: false, draftText: FULL_DRAFT_TEXT },
    { key: "a-history",           label: "(A) History comments",                 role: "approver", approverView: "history",   hasEntries: true  },
];

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function ApproverCommentsDemo({ open, onClose }: Props) {
    const [role, setRole] = useState<Role>("creator");
    const [creatorView, setCreatorView] = useState<CreatorView>("unresolved");
    const [approverView, setApproverView] = useState<ApproverView>("decision");
    const [hasEntries, setHasEntries] = useState(true);
    const [showWarning, setShowWarning] = useState(true);
    const [draftText, setDraftText] = useState("");

    const applyPreset = (p: Preset) => {
        setRole(p.role);
        if (p.creatorView) {
            setCreatorView(p.creatorView);
        }
        if (p.approverView) {
            setApproverView(p.approverView);
        }
        setHasEntries(p.hasEntries);
        if (p.draftText !== undefined) {
            setDraftText(p.draftText);
        }
    };

    const entries = hasEntries
        ? (role === "creator" ? CREATOR_ENTRIES : APPROVER_ENTRIES)
        : [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: onClose }}>
                ApproverComments — demo
            </TruffleDialogTitle>

            <DialogContent sx={dialogContentSx}>
                <Box sx={layoutSx}>

                    {/* ── Controls panel (left) ────────────────────────────── */}
                    <Stack sx={controlsSx} spacing={2}>

                        <Box>
                            <Typography variant="h6" sx={sectionTitleSx}>Presets</Typography>
                            <Stack spacing={0.75}>
                                {PRESETS.map(p => (
                                    <Button
                                        key={p.key}
                                        variant="outlined"
                                        size="small"
                                        onClick={() => applyPreset(p)}
                                        sx={presetBtnSx}
                                    >
                                        {p.label}
                                    </Button>
                                ))}
                            </Stack>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="h6" sx={sectionTitleSx}>Custom</Typography>

                            <FormControl sx={formGroupSx}>
                                <FormLabel>Role</FormLabel>
                                <RadioGroup
                                    value={role}
                                    onChange={e => setRole(e.target.value as Role)}
                                >
                                    <FormControlLabel value="creator" control={<Radio size="small" />} label="Creator" />
                                    <FormControlLabel value="approver" control={<Radio size="small" />} label="Approver" />
                                </RadioGroup>
                            </FormControl>

                            <FormControl sx={formGroupSx}>
                                <FormLabel>View</FormLabel>
                                {role === "creator" ? (
                                    <RadioGroup
                                        value={creatorView}
                                        onChange={e => setCreatorView(e.target.value as CreatorView)}
                                    >
                                        <FormControlLabel value="unresolved" control={<Radio size="small" />} label="Unresolved" />
                                        <FormControlLabel value="history" control={<Radio size="small" />} label="History" />
                                    </RadioGroup>
                                ) : (
                                    <RadioGroup
                                        value={approverView}
                                        onChange={e => setApproverView(e.target.value as ApproverView)}
                                    >
                                        <FormControlLabel value="decision" control={<Radio size="small" />} label="Decision" />
                                        <FormControlLabel value="comments" control={<Radio size="small" />} label="Comments" />
                                        <FormControlLabel value="history"  control={<Radio size="small" />} label="History"  />
                                    </RadioGroup>
                                )}
                            </FormControl>

                            <FormControlLabel
                                control={<Checkbox size="small" checked={hasEntries} onChange={e => setHasEntries(e.target.checked)} />}
                                label="Has entries"
                            />
                            {role === "approver" && (
                                <FormControlLabel
                                    control={<Checkbox size="small" checked={showWarning} onChange={e => setShowWarning(e.target.checked)} />}
                                    label={"Show \"updated since\" warning"}
                                />
                            )}
                        </Box>
                    </Stack>

                    {/* ── Preview (right) ──────────────────────────────────── */}
                    <Box sx={previewSx}>
                        {role === "creator" ? (
                            <ApproverComments
                                role="creator"
                                view={creatorView}
                                onViewChange={setCreatorView}
                                entries={entries}
                            />
                        ) : (
                            <ApproverComments
                                role="approver"
                                view={approverView}
                                onViewChange={setApproverView}
                                entries={entries}
                                updatedWarning={showWarning ? WARNING : undefined}
                                draftText={draftText}
                                onDraftChange={setDraftText}
                                onApprove={() => setApproverView("history")}
                                onSendComments={() => setApproverView("comments")}
                            />
                        )}
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const dialogContentSx: SxProps<Theme> = {
    p: "0 !important",
};
const layoutSx: SxProps<Theme> = {
    display: "flex",
    minHeight: 520,
};
const controlsSx: SxProps<Theme> = {
    width: 280,
    flexShrink: 0,
    borderRight: "1px solid",
    borderColor: "divider",
    p: 2,
    overflowY: "auto",
};
const previewSx: SxProps<Theme> = {
    flex: 1,
    p: 3,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    bgcolor: "primary.light",
    overflowY: "auto",
};
const sectionTitleSx: SxProps<Theme> = {
    color: "text.primary",
    mb: 1,
};
const formGroupSx: SxProps<Theme> = {
    mb: 1,
    display: "block",
};
const presetBtnSx: SxProps<Theme> = {
    justifyContent: "flex-start",
};
