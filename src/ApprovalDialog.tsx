import { useState } from "react";
import type { SelectChangeEvent, SxProps, Theme } from "@mui/material";
import {
    Dialog, DialogContent,
    TextField, FormControl, Select, MenuItem,
    Button, IconButton, Box, Stack, Alert, Typography, SvgIcon
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faTriangleExclamation, faCircleInfo } from "@fortawesome/pro-regular-svg-icons";
import { TruffleDialogTitle, TruffleDialogActions, TruffleAccordion, TruffleAccordionSummary, TruffleAccordionDetails, AttentionBox, AttentionBoxTitle, AttentionBoxContent } from "@sundaysky/smartvideo-hub-truffle-component-library";

const DEFAULT_USERS = [
    { value: "sjohnson", label: "Sarah Johnson (sjohnson@company.com)" },
    { value: "mchen", label: "Michael Chen (mchen@company.com)" },
    { value: "erodriguez", label: "Emma Rodriguez (erodriguez@company.com)" },
    { value: "jwilson", label: "James Wilson (jwilson@company.com)" }
];

type Logic = "AND" | "OR"
interface ApproverRow { value: string; logic: Logic }

interface Props {
  open: boolean
  onClose: () => void
  onSend: (approvers: string[]) => void
  availableApprovers?: { value: string; label: string }[]
}

export default function ApprovalDialog({ open, onClose, onSend, availableApprovers }: Props) {
    const USERS = availableApprovers !== undefined ? availableApprovers : DEFAULT_USERS;
    const [comment, setComment] = useState("");
    const [approvers, setApprovers] = useState<ApproverRow[]>([{ value: "", logic: "AND" }]);

    const handleClose = () => {
        setComment("");
        setApprovers([{ value: "", logic: "AND" }]);
        onClose();
    };

    const update = (i: number, patch: Partial<ApproverRow>) =>
        setApprovers(prev => prev.map((a, idx) => idx === i ? { ...a, ...patch } : a));

    const addApprover = () =>
        setApprovers(prev => [...prev, { value: "", logic: "AND" }]);

    const removeApprover = (i: number) =>
        setApprovers(prev => prev.filter((_, idx) => idx !== i));

    const handleSend = () => {
        const selected = approvers.map(a => a.value).filter(Boolean);
        onSend(selected);
        setComment("");
        setApprovers([{ value: "", logic: "AND" }]);
    };

    const hasMultiple = approvers.length > 1;
    const hasAtLeastOne = approvers.some(a => a.value !== "");

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (reason === "backdropClick") {
                    return;
                } handleClose();
            }}
            onClick={e => e.stopPropagation()}
            maxWidth="sm"
            fullWidth
        >
            {/* ── Title ──────────────────────────────────────────────────────────── */}
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: handleClose }}>
                Ask an approver to approve this video
            </TruffleDialogTitle>

            {/* ── Content ──────────────────────────────────────────────────────────── */}
            <DialogContent sx={contentSx}>
                <Stack direction="column" spacing={2}>

                    {/* Info banner — DS alert info tokens */}
                    <Alert severity="info">
            Approvers will be notified by email and will need to log in to SundaySky
                    </Alert>

                    {/* Warnings — collapsible, mirrors real-app ApprovalConfirmationDialog */}
                    <TruffleAccordion divider={false}>
                        <TruffleAccordionSummary
                            icon={<SvgIcon><FontAwesomeIcon icon={faTriangleExclamation} /></SvgIcon>}
                            text={<Typography variant="subtitle2">Warnings</Typography>}
                        />
                        <TruffleAccordionDetails padding="small">
                            <AttentionBox color="warning">
                                <AttentionBoxTitle>Review before sending</AttentionBoxTitle>
                                <AttentionBoxContent>
                                    Approvers will receive the current draft. Any changes you make after sending will not be reflected until you resend.
                                </AttentionBoxContent>
                            </AttentionBox>
                        </TruffleAccordionDetails>
                    </TruffleAccordion>

                    {/* Next (required) — collapsible */}
                    <TruffleAccordion divider={false}>
                        <TruffleAccordionSummary
                            icon={<SvgIcon><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>}
                            text={<Typography variant="subtitle2">Next (required)</Typography>}
                        />
                        <TruffleAccordionDetails padding="small">
                            <AttentionBox color="info">
                                <AttentionBoxTitle>After approvers respond</AttentionBoxTitle>
                                <AttentionBoxContent>
                                    You&apos;ll be notified once each approver has responded. You can view their feedback and approve the video for sharing.
                                </AttentionBoxContent>
                            </AttentionBox>
                        </TruffleAccordionDetails>
                    </TruffleAccordion>

                    {/* ── Comment field
               Figma: label is a Typography node ABOVE the field, not floating.
               TextField uses variant="outlined" size="medium" — no label prop.   */}
                    <Box>
                        {/* Label: typography/body1 — Open Sans Regular 14px */}
                        <Typography variant="body1" sx={commentLabelSx}>
              Add a comment for approvers (optional)
                        </Typography>
                        <TextField
                            variant="outlined"
                            size="medium"
                            multiline
                            rows={3}
                            fullWidth
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                    </Box>

                    {/* ── Approver rows ────────────────────────────────────────────────────
               Layout rules:
               • 1 approver  → Select full width, no AND/OR, no delete icon
               • 2+ approvers → Select flex:1, AND/OR same size=medium, delete icon (error/red)
               The approver Select always matches the comment field width as flex container.  */}
                    {approvers.map((approver, i) => {
                        const isLast = i === approvers.length - 1;
                        const showLogic = hasMultiple && !isLast;
                        const showDelete = hasMultiple;

                        return (
                            <Box key={i} sx={approverRowSx}>

                                {/* Approver Select — size="medium" outlined, displayEmpty placeholder */}
                                <FormControl variant="outlined" size="medium" sx={approverSelectFormSx}>
                                    <Select
                                        displayEmpty
                                        value={approver.value}
                                        onChange={(e: SelectChangeEvent) => update(i, { value: e.target.value })}
                                        renderValue={val =>
                                            val
                                                ? <Typography variant="body1" color="text.primary">
                                                    {USERS.find(u => u.value === val)?.label}
                                                </Typography>
                                                : <Typography variant="body1" sx={placeholderTextSx}>
                            Select approver {i + 1}
                                                </Typography>
                                        }
                                    >
                                        {USERS.map(u => {
                                            const takenByOther = approvers.some((a, idx) => idx !== i && a.value === u.value);
                                            return (
                                                <MenuItem key={u.value} value={u.value} disabled={takenByOther}
                                                    sx={takenByOther ? { opacity: 0.4 } : undefined}>
                                                    {u.label}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>

                                {/* AND/OR — only between rows, size="medium" matches approver Select height */}
                                {showLogic && (
                                    <FormControl variant="outlined" size="medium" sx={logicFormSx}>
                                        <Select
                                            value={approver.logic}
                                            onChange={(e: SelectChangeEvent) => update(i, { logic: e.target.value as Logic })}
                                            sx={logicSelectSx}
                                        >
                                            <MenuItem value="AND">AND</MenuItem>
                                            <MenuItem value="OR">OR</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}

                                {/* Delete — DS: Size=Medium IconButton, color=error (#E62843) */}
                                {showDelete
                                    ? <IconButton
                                        size="medium"
                                        onClick={() => removeApprover(i)}
                                        aria-label={`Remove approver ${i + 1}`}
                                        sx={deleteIconSx}
                                    >
                                        <SvgIcon><FontAwesomeIcon icon={faTrash} /></SvgIcon>
                                    </IconButton>
                                    : /* spacer keeps layout stable when no delete button */
                                    <Box sx={deleteSpacerSx} />
                                }

                            </Box>
                        );
                    })}

                </Stack>
            </DialogContent>

            {/* ── Actions: "+ Add an approver" (text/left) · Cancel + Send (right) ─── */}
            <TruffleDialogActions sx={actionsSx}>
                <Button variant="text" color="primary" size="large"
                    startIcon={<SvgIcon><FontAwesomeIcon icon={faPlus} /></SvgIcon>}
                    onClick={addApprover}>
                    Add an approver
                </Button>
                <Box sx={actionsGroupSx}>
                    <Button variant="outlined" color="primary" size="large" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="primary" size="large" onClick={handleSend} disabled={!hasAtLeastOne}>
                        Send for approval
                    </Button>
                </Box>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const contentSx: SxProps<Theme> = { px: "32px", pt: "0 !important", pb: "8px" };
const commentLabelSx: SxProps<Theme> = { color: "text.primary", mb: "6px" };
const approverRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: 1 };
const approverSelectFormSx: SxProps<Theme> = { flex: 1, minWidth: 0 };
const placeholderTextSx: SxProps<Theme> = { color: "text.disabled", fontStyle: "italic" };
const logicFormSx: SxProps<Theme> = { minWidth: 80, flexShrink: 0 };
const logicSelectSx: SxProps<Theme> = {
    color: "text.primary",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" }
};
const deleteIconSx: SxProps<Theme> = { color: "error.main", flexShrink: 0 };
const deleteSpacerSx: SxProps<Theme> = { width: 40, flexShrink: 0 };
const actionsSx: SxProps<Theme> = { justifyContent: "space-between" };
const actionsGroupSx: SxProps<Theme> = { display: "flex", gap: 1 };
