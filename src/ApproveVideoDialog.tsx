import {
    Dialog, DialogContent,
    Button, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { TruffleDialogTitle, TruffleDialogActions } from "@sundaysky/smartvideo-hub-truffle-component-library";

interface Props {
  open: boolean
  onClose: () => void
  onApprove: () => void
}

export default function ApproveVideoDialog({ open, onClose, onApprove }: Props) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <TruffleDialogTitle
                CloseIconButtonProps={{ onClick: onClose }}
                HelpCenterIconButtonProps={{ onClick: () => {} }}
            >
                Approve Video?
            </TruffleDialogTitle>

            <DialogContent sx={contentSx}>
                <Typography variant="subtitle1" color="text.primary">
          You can share this video with viewers after approving.
                </Typography>
            </DialogContent>

            <TruffleDialogActions>
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
                        onApprove(); onClose();
                    }}
                >
          Approve
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const contentSx: SxProps<Theme> = { pt: 1, pb: 2 };
