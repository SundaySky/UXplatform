import { useState } from "react";
import type { SelectChangeEvent, SxProps, Theme } from "@mui/material";
import {
    Dialog, DialogContent,
    FormControl, Select, MenuItem,
    Button, Stack, Alert, Typography
} from "@mui/material";
import { TruffleDialogTitle, TruffleDialogActions } from "@sundaysky/smartvideo-hub-truffle-component-library";

const DEFAULT_USERS = [
    { value: "sjohnson", label: "Sarah Johnson (sjohnson@company.com)" },
    { value: "mchen", label: "Michael Chen (mchen@company.com)" },
    { value: "erodriguez", label: "Emma Rodriguez (erodriguez@company.com)" },
    { value: "jwilson", label: "James Wilson (jwilson@company.com)" }
];

interface Props {
  open: boolean
  onClose: () => void
  onSend: (approvers: string[]) => void
  availableApprovers?: { value: string; label: string }[]
}

export default function ApprovalDialog({ open, onClose, onSend, availableApprovers }: Props) {
    const USERS = availableApprovers !== undefined ? availableApprovers : DEFAULT_USERS;
    const [approver, setApprover] = useState("");

    const handleClose = () => {
        setApprover("");
        onClose();
    };

    const handleSend = () => {
        if (!approver) {
            return;
        }
        onSend([approver]);
        setApprover("");
    };

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

                    {/* ── Approver Select (single) ──────────────────────────────────── */}
                    <FormControl variant="outlined" size="medium" fullWidth>
                        <Select
                            displayEmpty
                            value={approver}
                            onChange={(e: SelectChangeEvent) => setApprover(e.target.value)}
                            renderValue={val =>
                                val
                                    ? <Typography variant="body1" color="text.primary">
                                        {USERS.find(u => u.value === val)?.label}
                                    </Typography>
                                    : <Typography variant="body1" sx={placeholderTextSx}>
                                        Select approver
                                    </Typography>
                            }
                        >
                            {USERS.map(u => (
                                <MenuItem key={u.value} value={u.value}>
                                    {u.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                </Stack>
            </DialogContent>

            {/* ── Actions: Cancel + Send for approval ───────────────────────────── */}
            <TruffleDialogActions sx={actionsSx}>
                <Button variant="outlined" color="primary" size="large" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="primary" size="large" onClick={handleSend} disabled={!approver}>
                    Send for approval
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const contentSx: SxProps<Theme> = { px: "32px", pt: "0 !important", pb: "8px" };
const placeholderTextSx: SxProps<Theme> = { color: "text.disabled", fontStyle: "italic" };
const actionsSx: SxProps<Theme> = { justifyContent: "flex-end", gap: 1 };
