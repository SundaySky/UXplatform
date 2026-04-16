import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, IconButton, Typography, Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

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
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
                <Typography variant="h3" color="text.primary">
          Approve Video?
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <IconButton size="small" sx={{ color: "action.active" }}>
                        <HelpOutlineIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <IconButton size="small" onClick={onClose} sx={{ color: "action.active" }}>
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 1, pb: 2 }}>
                <Typography variant="subtitle1" color="text.primary">
          You can share this video with viewers after approving.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1, justifyContent: "flex-end" }}>
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
            </DialogActions>
        </Dialog>
    );
}
