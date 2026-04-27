import {
    Dialog, DialogContent, SvgIcon,
    Button, Box, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes } from "@fortawesome/pro-regular-svg-icons/faShareNodes";
import { TruffleDialogTitle, TruffleDialogActions } from "@sundaysky/smartvideo-hub-truffle-component-library";

interface Props {
  open: boolean
  onClose: () => void
  /** Kept for backwards-compat with existing consumers; no longer used. */
  approverCount?: number
  /** Fired when the user clicks "Notify me about feedback" — used to show a snackbar. */
  onNotifyFeedback?: () => void
}

export default function ConfirmationDialog({ open, onClose, onNotifyFeedback }: Props) {
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
            {/* ── Title (multiline so it doesn't truncate) ──────────────────────── */}
            <TruffleDialogTitle multiline CloseIconButtonProps={{ onClick: onClose }}>
                A link to the video has been emailed to the approver
            </TruffleDialogTitle>

            {/* ── Content ────────────────────────────────────────────────────────── */}
            <DialogContent sx={contentSx}>
                <Box sx={contentBodySx}>
                    <Typography variant="body1" color="text.primary">
                        You&apos;ll be notified by email when feedback is received.
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                        You can also share the video using the approval link below.
                    </Typography>
                </Box>
            </DialogContent>

            {/* ── Actions ─────────────────────────────────────────────────────────── */}
            <TruffleDialogActions>
                <Button variant="text" color="primary" size="large" startIcon={<SvgIcon><FontAwesomeIcon icon={faShareNodes} /></SvgIcon>}>
                    Share approval link
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => {
                        onNotifyFeedback?.();
                        onClose();
                    }}
                >
                    Notify me about feedback
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const contentSx: SxProps<Theme> = { px: "32px", pt: "0 !important", pb: "8px" };
const contentBodySx: SxProps<Theme> = { display: "flex", flexDirection: "column", gap: 2 };
