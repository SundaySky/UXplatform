import {
    Dialog, DialogContent, DialogActions,
    Button, Typography
} from "@mui/material";
import { TruffleDialogTitle } from "@sundaysky/smartvideo-hub-truffle-component-library";

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void // "Cancel approval & edit video"
}

export default function CancelApprovalDialog({ open, onClose, onConfirm }: Props) {
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
            PaperProps={{
                sx: {
                    borderRadius: "12px",
                    boxShadow: "0px 0px 10px 0px rgba(3,25,79,0.25)"
                }
            }}
        >
            {/* ── Title ────────────────────────────────────────────────────────── */}
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: onClose }}>
                Editing will cancel approval
            </TruffleDialogTitle>

            {/* ── Content ──────────────────────────────────────────────────────── */}
            <DialogContent sx={{ px: "32px", pt: "0 !important", pb: "8px" }}>
                <Typography variant="body1" sx={{ color: "text.primary", mb: 1.5 }}>
          To edit this video, you'll need to cancel the current approval.
                </Typography>
                <Typography variant="body1" color="text.primary">
          Any changes will make the shared version outdated, and you'll need to request approval again.
                </Typography>
            </DialogContent>

            {/* ── Actions ──────────────────────────────────────────────────────── */}
            <DialogActions sx={{ px: "32px", pt: 1, pb: "20px", gap: 1, justifyContent: "flex-end" }}>
                <Button
                    variant="text"
                    color="primary"
                    size="large"
                    onClick={onClose}
                >
          Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => {
                        onConfirm(); onClose();
                    }}
                >
          Cancel approval &amp; edit video
                </Button>
            </DialogActions>
        </Dialog>
    );
}
