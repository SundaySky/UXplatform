import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, IconButton, Box, Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";

// ─── DS tokens ───────────────────────────────────────────────────────────────
const ds = {
    textPrimary: "#323338",
    divider:     "rgba(0, 83, 229, 0.12)"
};

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
            <DialogTitle
                component="div"
                sx={{
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                    pl: "32px", pr: "22px", pt: "20px", pb: "16px", gap: 1
                }}
            >
                <Typography sx={{
                    fontFamily: "\"Open Sans\", sans-serif", fontWeight: 600, fontSize: 20,
                    lineHeight: 1.5, color: ds.textPrimary, flex: 1
                }}>
                    {isMulti
                        ? "Approval request sent. You'll be notified by email when approvers respond."
                        : "Approval request sent, you'll be notified when the approver respond"}
                </Typography>
                {/* DS: Size=Medium, Color=Default IconButton */}
                <IconButton size="medium" color="default" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* ── Content ────────────────────────────────────────────────────────── */}
            <DialogContent sx={{ px: "32px", pt: "0 !important", pb: "8px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {isMulti && (
                        <Typography sx={{
                            fontFamily: "\"Open Sans\", sans-serif", fontWeight: 400, fontSize: 14,
                            lineHeight: 1.5, color: ds.textPrimary
                        }}>
              Comments will be available once everyone has responded.
                        </Typography>
                    )}
                    <Typography sx={{
                        fontFamily: "\"Open Sans\", sans-serif", fontWeight: 400, fontSize: 14,
                        lineHeight: 1.5, color: ds.textPrimary
                    }}>
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
