import {
    Dialog, DialogContent, DialogActions,
    Button, Box, Typography
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { TruffleDialogTitle } from "@sundaysky/smartvideo-hub-truffle-component-library";

interface Props {
  open: boolean
  onClose: () => void
  approverCount: number
}

export default function ConfirmationDialog({ open, onClose, approverCount }: Props) {
    const isMulti = approverCount > 1;

    return (
        <Dialog
            open={open}
            onClose={(_e, reason) => {
                // Only allow closing via the explicit Close / X buttons — not backdrop or Escape
                if (reason === "backdropClick" || reason === "escapeKeyDown") {
                    return;
                }
                onClose();
            }}
            onClick={e => e.stopPropagation()}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow:    "0px 0px 10px 0px rgba(3, 25, 79, 0.25)",
                    overflow:     "hidden"
                }
            }}
        >
            {/* ── Title ──────────────────────────────────────────────────────────── */}
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: onClose }}>
                {isMulti
                    ? "Approval request sent. You'll be notified by email when approvers respond."
                    : "Approval request sent, you'll be notified when the approver respond"}
            </TruffleDialogTitle>

            {/* ── Content ────────────────────────────────────────────────────────── */}
            <DialogContent sx={{ px: "32px", pt: "0 !important", pb: "8px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {isMulti && (
                        <Typography variant="body1" color="text.primary">
              Comments will be available once everyone has responded.
                        </Typography>
                    )}
                    <Typography variant="body1" color="text.primary">
            You can also share the video using the link.
                    </Typography>
                </Box>
            </DialogContent>

            {/* ── Actions: Share video using link (text/left) · Close (contained/right) ─── */}
            <DialogActions sx={{
                display: "flex", justifyContent: "flex-end",
                px: "32px", pt: 1, pb: "20px", gap: 1
            }}>
                {/* DS: Size=Large, Color=Primary, Variant=Text */}
                <Button variant="text" color="primary" size="large" startIcon={<LinkIcon />}>
          Share video using link
                </Button>
                {/* DS: Size=Large, Color=Primary, Variant=Contained */}
                <Button variant="contained" color="primary" size="large" onClick={onClose}>
          Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
