import { useEffect, useState } from "react";
import {
    Box, Button, Dialog, DialogContent, Divider, IconButton, Switch, SvgIcon, TextField, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowTurnLeft, faCircleQuestion, faEllipsisH, faListUl, faPen, faXmark
} from "@fortawesome/pro-regular-svg-icons";

export default function EditBulletDialog({ open, currentText, bulletIconSize, onClose }: {
  open: boolean
  currentText: string
  bulletIconSize: "S" | "M" | "L" | "XL"
  onClose: (newText: string) => void
}) {
    const [text, setText] = useState(currentText);
    const [byAudience, setByAudience] = useState(false);
    const [dataSource, setDataSource] = useState<"library" | "field">("library");
    const iconSizeMap = { S: 16, M: 20, L: 24, XL: 32 };

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
                sx: editBulletDialogPaperSx
            }}
        >
            {/* Header */}
            <Box sx={dialogHeaderRowSx}>
                <Box sx={dialogHeaderTitleGroupSx}>
                    <Typography variant="h2" sx={{ color: "text.primary" }}>
            Bullet point
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Icon size W{iconSizeMap[bulletIconSize]}x H{iconSizeMap[bulletIconSize]}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
                    <SvgIcon sx={{ fontSize: "18px !important", width: "18px !important", height: "18px !important" }}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                </IconButton>
            </Box>

            <DialogContent sx={editBulletDialogContentSx}>
                {/* Left side */}
                <Box>
                    {/* Message by audience toggle */}
                    <Box sx={bulletAudienceToggleRowSx}>
                        <Switch
                            checked={byAudience}
                            onChange={e => setByAudience(e.target.checked)}
                            size="small"
                        />
                        <Typography variant="body1" sx={{ color: "text.primary" }}>
              Message by audience
                        </Typography>
                        <Tooltip title="Personalize the bullet text per viewer" placement="top" arrow>
                            <SvgIcon sx={{ fontSize: "16px !important", color: "text.secondary", cursor: "default" }}><FontAwesomeIcon icon={faCircleQuestion} /></SvgIcon>
                        </Tooltip>
                    </Box>

                    {/* Data source radio buttons */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                            <Box
                                onClick={() => setDataSource("library")}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer",
                                    p: 1, borderRadius: "8px",
                                    bgcolor: dataSource === "library" ? "action.hover" : "transparent"
                                }}
                            >
                                <Box sx={{
                                    width: 20, height: 20, borderRadius: "50%",
                                    borderWidth: 2, borderStyle: "solid", borderColor: "primary.main",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    bgcolor: dataSource === "library" ? "primary.main" : "transparent"
                                }}>
                                    {dataSource === "library" && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "background.paper" }} />}
                                </Box>
                                <Typography variant="subtitle2" sx={{ color: "text.primary" }}>
                  Upload/From library
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                                onClick={() => setDataSource("field")}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer",
                                    p: 1, borderRadius: "8px",
                                    bgcolor: dataSource === "field" ? "action.hover" : "transparent"
                                }}
                            >
                                <Box sx={{
                                    width: 20, height: 20, borderRadius: "50%", border: 2, borderStyle: "solid", borderColor: "grey.400",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    bgcolor: dataSource === "field" ? "primary.main" : "transparent"
                                }}>
                                    {dataSource === "field" && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "background.paper" }} />}
                                </Box>
                                <Typography variant="subtitle2" sx={{ color: "text.primary" }}>
                  From data field
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Helper text label */}
                    <Typography variant="caption" sx={{ color: "text.primary", mb: 1.5 }}>
            Helper text
                    </Typography>

                    {/* Icon display */}
                    <Box sx={{
                        width: iconSizeMap[bulletIconSize] + 40,
                        height: iconSizeMap[bulletIconSize] + 40,
                        bgcolor: "grey.100", borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderWidth: 1, borderStyle: "solid", borderColor: "grey.400", mb: 2
                    }}>
                        <Box sx={{
                            width: iconSizeMap[bulletIconSize] + 20,
                            height: iconSizeMap[bulletIconSize] + 20,
                            bgcolor: "primary.main", borderRadius: "8px",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <SvgIcon sx={{ fontSize: iconSizeMap[bulletIconSize], color: "background.paper" }}><FontAwesomeIcon icon={faListUl} /></SvgIcon>
                        </Box>
                    </Box>

                    {/* Buttons */}
                    <Box sx={bulletActionButtonsRowSx}>
                        <Button variant="outlined" startIcon={<SvgIcon><FontAwesomeIcon icon={faArrowTurnLeft} /></SvgIcon>} sx={bulletDialogFlexBtnSx}>
              Replace
                        </Button>
                        <Button variant="outlined" startIcon={<SvgIcon><FontAwesomeIcon icon={faPen} /></SvgIcon>} sx={bulletDialogFlexBtnSx}>
              Edit
                        </Button>
                        <IconButton sx={{ color: "primary.main" }}>
                            <SvgIcon><FontAwesomeIcon icon={faEllipsisH} /></SvgIcon>
                        </IconButton>
                    </Box>
                </Box>

                {/* Right side */}
                <Box>
                    {/* Value label */}
                    <Typography variant="caption" sx={{ color: "text.primary", mb: 1 }}>
            Value
                    </Typography>

                    {/* Text input with formatting bar */}
                    <Box sx={textInputBorderBoxSx}>
                        {/* Text area */}
                        <TextField
                            fullWidth
                            multiline
                            minRows={6}
                            autoFocus
                            value={text}
                            onChange={e => setText(e.target.value)}
                            variant="standard"
                            placeholder="Enter text"
                            InputProps={{
                                disableUnderline: true,
                                sx: {
                                    px: 1.5, pt: 1.5, pb: 1,
                                    color: "text.primary",
                                    alignItems: "flex-start"
                                }
                            }}
                        />

                        {/* Divider + format buttons */}
                        <Divider />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.75 }}>
                            <Box sx={{
                                px: 1, py: 0.5, borderRadius: "6px", bgcolor: "action.selected",
                                cursor: "pointer", display: "flex", alignItems: "center"
                            }}>
                                <Typography sx={{ fontFamily: "serif", fontWeight: 700, fontSize: 18, color: "primary.main", lineHeight: 1 }}>
                  B
                                </Typography>
                            </Box>
                            <Box sx={{
                                px: 1, py: 0.5, borderRadius: "6px",
                                cursor: "pointer", display: "flex", alignItems: "center",
                                "&:hover": { bgcolor: "action.hover" }
                            }}>
                                <Typography sx={{ fontFamily: "serif", fontStyle: "italic", fontSize: 18, color: "text.primary", lineHeight: 1 }}>
                  I
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Helper text */}
                    <Typography
                        variant="caption"
                        component="span"
                        sx={{
                            color: "primary.main", cursor: "pointer", mt: 1, display: "inline-block",
                            "&:hover": { textDecoration: "underline" }
                        }}
                    >
            Enter text and personalize using {"{"}
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

const editBulletDialogPaperSx: SxProps<Theme> = {
    width: 1200,
    borderRadius: "16px",
    overflow: "hidden"
};

const dialogHeaderRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 3,
    pt: 3,
    pb: 2
};

const dialogHeaderTitleGroupSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 2
};

const editBulletDialogContentSx: SxProps<Theme> = {
    px: 3,
    pt: 2,
    pb: 3,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 4
};

const bulletAudienceToggleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 3
};

const bulletActionButtonsRowSx: SxProps<Theme> = {
    display: "flex",
    gap: 1
};

const bulletDialogFlexBtnSx: SxProps<Theme> = {
    flex: 1,
    color: "primary.main",
    borderColor: "primary.main"
};

const textInputBorderBoxSx: SxProps<Theme> = {
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "primary.main",
    borderRadius: "8px",
    overflow: "hidden"
};
