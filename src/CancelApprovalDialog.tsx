import {
    Dialog, DialogContent,
    Button, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { TruffleDialogTitle, TruffleDialogActions } from "@sundaysky/smartvideo-hub-truffle-component-library";

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
        >
            {/* ── Title ────────────────────────────────────────────────────────── */}
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: onClose }}>
                Editing will cancel approval
            </TruffleDialogTitle>

            {/* ── Content ──────────────────────────────────────────────────────── */}
            <DialogContent sx={contentSx}>
                <Typography variant="body1" sx={firstParaSx}>
          To edit this video, you'll need to cancel the current approval.
                </Typography>
                <Typography variant="body1" color="text.primary">
          Any changes will make the shared version outdated, and you'll need to request approval again.
                </Typography>
            </DialogContent>

            {/* ── Actions ──────────────────────────────────────────────────────── */}
            <TruffleDialogActions>
                <Button variant="text" color="primary" size="large" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="primary" size="large" onClick={() => {
                    onConfirm(); onClose(); 
                }}>
                    Cancel approval &amp; edit video
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const contentSx: SxProps<Theme> = { px: "32px", pt: "0 !important", pb: "8px" };
const firstParaSx: SxProps<Theme> = { color: "text.primary", mb: 1.5 };
