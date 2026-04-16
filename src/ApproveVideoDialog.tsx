import {
    Dialog, DialogContent,
    Button, Typography
} from "@mui/material";
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
            PaperProps={{
                sx: {
                    borderRadius: "12px",
                    boxShadow: "0px 0px 10px 0px rgba(3,25,79,0.25)"
                }
            }}
        >
            <TruffleDialogTitle
                CloseIconButtonProps={{ onClick: onClose }}
                HelpCenterIconButtonProps={{ onClick: () => {} }}
            >
                Approve Video?
            </TruffleDialogTitle>

            <DialogContent sx={{ pt: 1, pb: 2 }}>
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
