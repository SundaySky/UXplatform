import { useEffect, useState } from "react";
import {
    Box, Dialog, DialogContent, Divider, IconButton, Switch, SvgIcon, TextField, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion, faXmark } from "@fortawesome/pro-regular-svg-icons";

export default function EditHeadingDialog({ open, title, currentText, onClose }: {
  open: boolean
  title?: string
  currentText: string
  onClose: (newText: string) => void
}) {
    const [text, setText] = useState(currentText);
    const [byAudience, setByAudience] = useState(false);

    useEffect(() => {
        if (open) {
            setText(currentText);
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleClose = () => onClose(text);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={false}
            PaperProps={{
                elevation: 8,
                sx: editHeadingDialogPaperSx
            }}
        >
            {/* Header */}
            <Box sx={dialogHeaderRowSx}>
                <Typography variant="h2" sx={{ color: "text.primary" }}>
                    {title ?? "Heading"}
                </Typography>
                <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
                    <SvgIcon sx={{ fontSize: "18px !important", width: "18px !important", height: "18px !important" }}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                </IconButton>
            </Box>

            <DialogContent sx={editHeadingDialogContentSx}>
                {/* Message by audience toggle */}
                <Box sx={audienceToggleRowSx}>
                    <Switch
                        checked={byAudience}
                        onChange={e => setByAudience(e.target.checked)}
                        size="small"
                    />
                    <Typography variant="body1" sx={{ color: "text.primary" }}>
            Message by audience
                    </Typography>
                    <Tooltip title="Personalize the heading text per viewer" placement="top" arrow>
                        <SvgIcon sx={{ fontSize: "16px !important", color: "text.secondary", cursor: "default" }}><FontAwesomeIcon icon={faCircleQuestion} /></SvgIcon>
                    </Tooltip>
                </Box>

                {/* Text input with formatting bar */}
                <Box sx={textInputBorderBoxSx}>
                    {/* Text area */}
                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        autoFocus
                        value={text}
                        onChange={e => setText(e.target.value)}
                        variant="standard"
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                px: 1.5, pt: 1.5, pb: 1,
                                fontWeight: 700,
                                fontSize: 15,
                                color: "text.primary",
                                alignItems: "flex-start"
                            }
                        }}
                    />

                    {/* Divider + format buttons */}
                    <Divider />
                    <Box sx={formatButtonRowSx}>
                        <Box sx={formatBoldBtnSx}>
                            <Typography sx={{ fontFamily: "serif", fontWeight: 700, fontSize: 18, color: "primary.main", lineHeight: 1 }}>
                B
                            </Typography>
                        </Box>
                        <Box sx={formatItalicBtnSx}>
                            <Typography sx={{ fontFamily: "serif", fontStyle: "italic", fontSize: 18, color: "text.primary", lineHeight: 1 }}>
                I
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Personalize hint */}
                <Typography
                    variant="caption"
                    component="span"
                    sx={personalizeHintSx}
                >
          Enter text and personalize using {"{"}
                </Typography>
            </DialogContent>
        </Dialog>
    );
}

const editHeadingDialogPaperSx: SxProps<Theme> = {
    width: 480,
    borderRadius: "16px",
    overflow: "hidden"
};

const editHeadingDialogContentSx: SxProps<Theme> = {
    px: 3,
    pt: 0,
    pb: 3
};

const dialogHeaderRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 3,
    pt: 3,
    pb: 2
};

const audienceToggleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 2.5
};

const textInputBorderBoxSx: SxProps<Theme> = {
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "primary.main",
    borderRadius: "8px",
    overflow: "hidden"
};

const formatButtonRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    px: 1,
    py: 0.75
};

const formatBoldBtnSx: SxProps<Theme> = {
    px: 1,
    py: 0.5,
    borderRadius: "6px",
    bgcolor: "action.selected",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
};

const formatItalicBtnSx: SxProps<Theme> = {
    px: 1,
    py: 0.5,
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    "&:hover": { bgcolor: "action.hover" }
};

const personalizeHintSx: SxProps<Theme> = {
    color: "primary.main",
    cursor: "pointer",
    mt: 1,
    display: "inline-block",
    "&:hover": { textDecoration: "underline" }
};
