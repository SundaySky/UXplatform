import {
    Dialog, DialogContent,
    Button, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { TruffleDialogTitle, TruffleDialogActions } from "@sundaysky/smartvideo-hub-truffle-component-library";

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  /** Name of the approver shown in the body copy. Defaults to "The approver". */
  approverName?: string
}

export default function CancelApprovalDialog({ open, onClose, onConfirm, approverName }: Props) {
    const subject = approverName && approverName.trim().length > 0 ? approverName : "The approver";
    return (
        <Dialog
            open={open}
            onClose={(_e, reason) => {
                if (reason === "backdropClick" || reason === "escapeKeyDown") {
                    return;
                }
                onClose();
            }}
            maxWidth="sm"
            fullWidth
        >
            {/* ── Title ────────────────────────────────────────────────────────── */}
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: onClose }}>
                Cancel approval and resubmit later?
            </TruffleDialogTitle>

            {/* ── Content ──────────────────────────────────────────────────────── */}
            <DialogContent sx={contentSx}>
                <Typography variant="body1" color="text.primary">
                    {subject} will be notified by email that the approval was canceled.
                </Typography>
            </DialogContent>

            {/* ── Actions ──────────────────────────────────────────────────────── */}
            <TruffleDialogActions>
                <Button variant="text" color="primary" size="large" onClick={onClose}>
                    Keep approval
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    size="large"
                    onClick={() => {
                        onConfirm(); onClose();
                    }}
                >
                    Cancel approval
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const contentSx: SxProps<Theme> = { px: "32px", pt: "0 !important", pb: "8px" };
