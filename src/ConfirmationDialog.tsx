import {
    Dialog, DialogContent, SvgIcon,
    Button, Box, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/pro-regular-svg-icons/faLink";
import { TruffleDialogTitle, TruffleDialogActions } from "@sundaysky/smartvideo-hub-truffle-component-library";

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
        >
            {/* ── Title ──────────────────────────────────────────────────────────── */}
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: onClose }}>
                {isMulti
                    ? "Approval request sent. You'll be notified by email when approvers respond."
                    : "Approval request sent, you'll be notified when the approver respond"}
            </TruffleDialogTitle>

            {/* ── Content ────────────────────────────────────────────────────────── */}
            <DialogContent sx={contentSx}>
                <Box sx={contentBodySx}>
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
            <TruffleDialogActions>
                <Button variant="text" color="primary" size="large" startIcon={<SvgIcon><FontAwesomeIcon icon={faLink} /></SvgIcon>}>
                    Share video using link
                </Button>
                <Button variant="contained" color="primary" size="large" onClick={onClose}>
                    Close
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const contentSx: SxProps<Theme> = { px: "32px", pt: "0 !important", pb: "8px" };
const contentBodySx: SxProps<Theme> = { display: "flex", flexDirection: "column", gap: 2 };
