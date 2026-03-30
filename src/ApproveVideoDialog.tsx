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
                <Typography sx={{
                    fontFamily: "\"Open Sans\", sans-serif", fontWeight: 700, fontSize: 20,
                    color: "#323338", lineHeight: 1.5
                }}>
          Approve Video?
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <IconButton size="small" sx={{ color: "rgba(0,0,0,0.56)" }}>
                        <HelpOutlineIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <IconButton size="small" onClick={onClose} sx={{ color: "rgba(0,0,0,0.56)" }}>
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 1, pb: 2 }}>
                <Typography sx={{
                    fontFamily: "\"Open Sans\", sans-serif", fontWeight: 400, fontSize: 16,
                    color: "#323338", lineHeight: 1.6
                }}>
          You can share this video with viewers after approving.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1, justifyContent: "flex-end" }}>
                <Button
                    variant="text"
                    color="primary"
                    size="large"
                    onClick={onClose}
                    sx={{ fontFamily: "\"Open Sans\", sans-serif", textTransform: "none", fontWeight: 600, fontSize: 15 }}
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
                    sx={{ fontFamily: "\"Open Sans\", sans-serif", textTransform: "none", fontWeight: 600, fontSize: 15, borderRadius: "8px" }}
                >
          Approve
                </Button>
            </DialogActions>
        </Dialog>
    );
}
