import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    Box, Typography, IconButton, Button, Avatar,
    Badge, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Snackbar, Alert, Divider, Checkbox, Switch, Menu, MenuItem,
    useTheme
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import BrandingWatermarkOutlinedIcon from "@mui/icons-material/BrandingWatermarkOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import MicOutlinedIcon from "@mui/icons-material/MicOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import InputOutlinedIcon from "@mui/icons-material/InputOutlined";
import AspectRatioOutlinedIcon from "@mui/icons-material/AspectRatioOutlined";
// ImageOutlinedIcon removed — placeholder panel now uses PNGs
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
// SmartButtonOutlinedIcon removed — placeholder panel now uses PNGs
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AlignHorizontalLeftIcon from "@mui/icons-material/AlignHorizontalLeft";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RemoveIcon from "@mui/icons-material/Remove";
import TitleIcon from "@mui/icons-material/Title";
import PaletteIcon from "@mui/icons-material/Palette";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import Tooltip from "@mui/material/Tooltip";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import ViewWeekOutlinedIcon from "@mui/icons-material/ViewWeekOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { NotificationBell, type NotificationItem } from "./NotificationsPanel";
import MediaLibraryPanel from "./MediaLibraryPanel";
import AvatarLibraryPanel from "./AvatarLibraryPanel";
import VideoPermissionDialog, { type VideoPermissionSettings } from "./VideoPermissionDialog";
import { OWNER_USER } from "./ManageAccessDialog";
import SceneLibraryDialog from "./SceneLibraryDialog";

// ─── Floating toolbar (matches Figma DS node 22171-65559) ────────────────────
function PlaceholderToolbar({ onEditClick, onDelete }: { onEditClick: () => void; onDelete?: () => void }) {
    const Pill = ({ icon, label, onClick }: { icon: React.ReactNode; label?: string; onClick?: () => void }) => (
        <Box
            onClick={onClick}
            sx={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                px: label ? "10px" : "7px", py: "5px",
                borderRadius: "8px",
                borderWidth: 1, borderStyle: "solid", borderColor: "grey.400",
                cursor: "pointer", bgcolor: "background.paper", color: "primary.main",
                transition: "background 0.15s",
                "&:hover": { bgcolor: "action.hover" },
                flexShrink: 0
            }}
        >
            {icon}
            {label && (
                <Typography variant="caption" sx={{ color: "primary.main", whiteSpace: "nowrap", lineHeight: 1, fontSize: 13 }}>
                    {label}
                </Typography>
            )}
        </Box>
    );

    return (
        <Box
            onMouseDown={e => e.stopPropagation()}
            sx={{
                display: "inline-flex", alignItems: "center",
                bgcolor: "background.paper", borderRadius: "8px",
                px: "8px", py: "6px", gap: "6px",
                boxShadow: "0px 4px 16px rgba(3,25,79,0.18)",
                userSelect: "none"
            }}
        >
            <Pill icon={<EditOutlinedIcon sx={{ fontSize: 14 }} />} label="Edit" onClick={onEditClick} />

            {/* Zoom — single bordered box */}
            <Box sx={{
                display: "inline-flex", alignItems: "center", gap: "2px",
                px: "8px", py: "5px", borderRadius: "8px",
                borderWidth: 1, borderStyle: "solid", borderColor: "grey.400",
                bgcolor: "background.paper", color: "primary.main", flexShrink: 0
            }}>
                <Box sx={{ display: "flex", cursor: "pointer", "&:hover": { opacity: 0.6 } }}>
                    <RemoveIcon sx={{ fontSize: 12 }} />
                </Box>
                <Typography variant="caption" sx={{ color: "primary.main", mx: "3px", minWidth: 28, textAlign: "center" }}>
          100%
                </Typography>
                <Box sx={{ display: "flex", cursor: "pointer", "&:hover": { opacity: 0.6 } }}>
                    <AddIcon sx={{ fontSize: 12 }} />
                </Box>
            </Box>

            <Pill icon={<TitleIcon sx={{ fontSize: 14 }} />} label="Style" />
            <Pill icon={<AlignHorizontalLeftIcon sx={{ fontSize: 14 }} />} label="Align" />
            <Pill icon={<PaletteIcon sx={{ fontSize: 14 }} />} label="Color" />
            <Pill icon={<StarBorderIcon sx={{ fontSize: 14 }} />} label="Timing" />
            <Pill icon={<ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />} label="Copy" />
            <Pill icon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />} />
            <Pill icon={<MoreHorizIcon sx={{ fontSize: 16 }} />} />
            {onDelete && (
                <Pill icon={<DeleteOutlinedIcon sx={{ fontSize: 14 }} />} onClick={onDelete} />
            )}
        </Box>
    );
}

// ─── Button placeholder toolbar (Figma node 23002-12178) ─────────────────────
function ButtonPlaceholderToolbar({
    size, onSizeChange, onDelete
}: {
  size: "S" | "M" | "L" | "XL"
  onSizeChange: (s: "S" | "M" | "L" | "XL") => void
  onDelete: () => void
}) {
    const ActionBtn = ({ icon, label, disabled }: { icon: React.ReactNode; label: string; disabled?: boolean }) => (
        <Box sx={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            px: "8px", py: "3.5px", height: 32, flexShrink: 0,
            borderRadius: "8px",
            borderWidth: 1, borderStyle: "solid", borderColor: disabled ? "grey.400" : "grey.300",
            bgcolor: "background.paper",
            cursor: disabled ? "default" : "pointer",
            "&:hover": { bgcolor: disabled ? "background.paper" : "action.hover" }
        }}>
            {icon}
            <Typography variant="h6" sx={{
                color: disabled ? "text.disabled" : "primary.main",
                lineHeight: 1.5
            }}>
                {label}
            </Typography>
        </Box>
    );

    return (
        <Box
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            sx={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                bgcolor: "background.paper", borderRadius: "8px",
                px: "6px", py: "5px",
                borderWidth: 1, borderStyle: "solid", borderColor: "grey.300",
                boxShadow: "0 2px 8px rgba(3,25,79,0.15)",
                userSelect: "none", whiteSpace: "nowrap"
            }}
        >
            {/* Edit */}
            <ActionBtn icon={<EditOutlinedIcon sx={{ fontSize: 13, color: "primary.main" }} />} label="Edit" />

            <Divider orientation="vertical" flexItem sx={{ borderColor: "grey.300", mx: "2px" }} />

            {/* Size label + S / M / L / XL toggle */}
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <Typography variant="caption" sx={{
                    color: "text.primary", letterSpacing: "0.46px", fontSize: 13
                }}>
          Size
                </Typography>
                <Box sx={{
                    display: "inline-flex", alignItems: "center",
                    borderWidth: 1, borderStyle: "solid", borderColor: "grey.300", borderRadius: "8px", overflow: "hidden"
                }}>
                    {([ ["S", "80 × 28px"], ["M", "120 × 36px"], ["L", "160 × 44px"], ["XL", "200 × 52px"] ] as const).map(([sz, dims], i, arr) => (
                        <Tooltip key={sz} title={dims} placement="top" arrow>
                            <Box
                                onClick={() => onSizeChange(sz)}
                                sx={(theme) => ({
                                    px: "10px", py: "4px", cursor: "pointer",
                                    bgcolor: size === sz ? "action.selected" : "transparent",
                                    borderRight: i < arr.length - 1 ? `1px solid ${theme.palette.grey[300]}` : "none",
                                    fontWeight: size === sz ? 600 : 400, fontSize: 14,
                                    color: size === sz ? "primary.main" : "text.primary",
                                    lineHeight: 1.5,
                                    "&:hover": { bgcolor: size === sz ? "divider" : "action.hover" }
                                })}
                            >
                                {sz}
                            </Box>
                        </Tooltip>
                    ))}
                </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: "grey.300", mx: "2px" }} />

            {/* Timing (disabled) */}
            <ActionBtn
                icon={<StarBorderIcon sx={{ fontSize: 13, color: "text.disabled" }} />}
                label="Timing"
                disabled
            />

            <Divider orientation="vertical" flexItem sx={{ borderColor: "grey.300", mx: "2px" }} />

            {/* Copy */}
            <ActionBtn icon={<ContentCopyOutlinedIcon sx={{ fontSize: 13, color: "primary.main" }} />} label="Copy" />

            {/* Delete */}
            <IconButton size="small" onClick={onDelete} sx={{ color: "error.main", p: "4px", flexShrink: 0 }}>
                <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            {/* More */}
            <IconButton size="small" sx={{ color: "primary.main", p: "4px", flexShrink: 0 }}>
                <MoreHorizIcon sx={{ fontSize: 18 }} />
            </IconButton>
        </Box>
    );
}

// ─── Bullet placeholder toolbar (Figma node 26110-118643) ────────────────────
function BulletPlaceholderToolbar({
    iconSize, onIconSizeChange, onDelete, onEditClick, onOptionsMenuClick
}: {
  iconSize: "S" | "M" | "L" | "XL"
  onIconSizeChange: (s: "S" | "M" | "L" | "XL") => void
  onDelete: () => void
  onEditClick: () => void
  onOptionsMenuClick?: (anchorEl: HTMLElement) => void
}) {
    const ActionBtn = ({
        icon, label, disabled, onClick
    }: { icon: React.ReactNode; label: string; disabled?: boolean; blue?: boolean; onClick?: () => void }) => (
        <Box onClick={onClick} sx={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            px: "8px", py: "3.5px", height: 32, flexShrink: 0,
            borderRadius: "8px",
            borderWidth: 1, borderStyle: "solid", borderColor: disabled ? "grey.400" : "grey.300",
            bgcolor: "background.paper",
            cursor: disabled ? "default" : "pointer",
            "&:hover": { bgcolor: disabled ? "background.paper" : "action.hover" }
        }}>
            {icon}
            <Typography variant="h6" sx={{
                color: disabled ? "text.disabled" : "primary.main",
                lineHeight: 1.5
            }}>
                {label}
            </Typography>
        </Box>
    );

    const DropdownBtn = ({ label }: { label: string }) => (
        <Box sx={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            px: "8px", py: "3.5px", height: 32, flexShrink: 0,
            borderRadius: "8px",
            borderWidth: 1, borderStyle: "solid", borderColor: "grey.300",
            bgcolor: "background.paper", cursor: "pointer",
            "&:hover": { bgcolor: "action.hover" }
        }}>
            <Typography variant="h6" sx={{ color: "primary.main", lineHeight: 1.5 }}>
                {label}
            </Typography>
            <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "primary.main" }} />
        </Box>
    );

    return (
        <Box
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            sx={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                bgcolor: "background.paper", borderRadius: "8px",
                px: "6px", py: "5px",
                borderWidth: 1, borderStyle: "solid", borderColor: "grey.300",
                boxShadow: "0 2px 8px rgba(3,25,79,0.15)",
                userSelect: "none", whiteSpace: "nowrap"
            }}
        >
            {/* Edit */}
            <ActionBtn icon={<EditOutlinedIcon sx={{ fontSize: 13, color: "primary.main" }} />} label="Edit" onClick={onEditClick} />

            <Divider orientation="vertical" flexItem sx={{ borderColor: "grey.300", mx: "2px" }} />

            {/* Icon size label + S / M / L / XL toggle */}
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <Typography variant="caption" sx={{
                    color: "text.primary", letterSpacing: "0.46px", fontSize: 13
                }}>
          Icon size
                </Typography>
                <Box sx={{
                    display: "inline-flex", alignItems: "center",
                    borderWidth: 1, borderStyle: "solid", borderColor: "grey.300", borderRadius: "8px", overflow: "hidden"
                }}>
                    {([ ["S", "16 × 16px"], ["M", "20 × 20px"], ["L", "24 × 24px"], ["XL", "32 × 32px"] ] as const).map(([sz, dims], i, arr) => (
                        <Tooltip key={sz} title={dims} placement="top" arrow>
                            <Box
                                onClick={() => onIconSizeChange(sz)}
                                sx={(theme) => ({
                                    px: "10px", py: "4px", cursor: "pointer",
                                    bgcolor: iconSize === sz ? "action.selected" : "transparent",
                                    borderRight: i < arr.length - 1 ? `1px solid ${theme.palette.grey[300]}` : "none",
                                    fontWeight: iconSize === sz ? 600 : 400, fontSize: 14,
                                    color: iconSize === sz ? "primary.main" : "text.primary",
                                    lineHeight: 1.5,
                                    "&:hover": { bgcolor: iconSize === sz ? "divider" : "action.hover" }
                                })}
                            >
                                {sz}
                            </Box>
                        </Tooltip>
                    ))}
                </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: "grey.300", mx: "2px" }} />

            {/* Bullet formatting dropdown */}
            <DropdownBtn label="Bullet formatting" />

            {/* Text formatting dropdown */}
            <DropdownBtn label="Text formatting" />

            <Divider orientation="vertical" flexItem sx={{ borderColor: "grey.300", mx: "2px" }} />

            {/* Timing (enabled, blue star) */}
            <ActionBtn icon={<StarBorderIcon sx={{ fontSize: 13, color: "primary.main" }} />} label="Timing" />

            <Divider orientation="vertical" flexItem sx={{ borderColor: "grey.300", mx: "2px" }} />

            {/* Delete */}
            <IconButton size="small" onClick={onDelete} sx={{ color: "error.main", p: "4px", flexShrink: 0 }}>
                <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            {/* More */}
            <IconButton size="small" onClick={(e) => onOptionsMenuClick?.(e.currentTarget)} sx={{ color: "primary.main", p: "4px", flexShrink: 0 }}>
                <MoreHorizIcon sx={{ fontSize: 18 }} />
            </IconButton>
        </Box>
    );
}

// ─── Edit Heading / Sub-heading dialog ───────────────────────────────────────
function EditHeadingDialog({ open, title, currentText, onClose }: {
  open: boolean
  title?: string
  currentText: string
  onClose: (newText: string) => void
}) {
    const [text, setText] = useState(currentText);
    const [byAudience, setByAudience] = useState(false);

    // Re-sync when dialog re-opens with new content
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
                sx: {
                    width: 480, borderRadius: "16px", overflow: "hidden"
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 3, pt: 3, pb: 2
            }}>
                <Typography variant="h2" sx={{ color: "text.primary" }}>
                    {title ?? "Heading"}
                </Typography>
                <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>

            <DialogContent sx={{ px: 3, pt: 0, pb: 3 }}>
                {/* Message by audience toggle */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                    <Switch
                        checked={byAudience}
                        onChange={e => setByAudience(e.target.checked)}
                        size="small"
                    />
                    <Typography variant="body1" sx={{ color: "text.primary" }}>
            Message by audience
                    </Typography>
                    <Tooltip title="Personalize the heading text per viewer" placement="top" arrow>
                        <HelpOutlineIcon sx={{ fontSize: 16, color: "text.secondary", cursor: "default" }} />
                    </Tooltip>
                </Box>

                {/* Text input with formatting bar */}
                <Box sx={{
                    borderWidth: 2, borderStyle: "solid", borderColor: "primary.main", borderRadius: "8px", overflow: "hidden"
                }}>
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

                {/* Personalize hint */}
                <Typography
                    variant="caption"
                    component="span"
                    sx={{
                        fontSize: 13,
                        color: "primary.main", cursor: "pointer", mt: 1, display: "inline-block",
                        "&:hover": { textDecoration: "underline" }
                    }}
                >
          Enter text and personalize using {"{"}
                </Typography>
            </DialogContent>
        </Dialog>
    );
}

// ─── Edit Bullet Point dialog ───────────────────────────────────────────────────
function EditBulletDialog({ open, currentText, bulletIconSize, onClose }: {
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
                sx: {
                    width: 1200, borderRadius: "16px", overflow: "hidden"
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 3, pt: 3, pb: 2
            }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h2" sx={{ color: "text.primary" }}>
            Bullet point
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Icon size W{iconSizeMap[bulletIconSize]}x H{iconSizeMap[bulletIconSize]}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>

            <DialogContent sx={{ px: 3, pt: 2, pb: 3, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {/* Left side */}
                <Box>
                    {/* Message by audience toggle */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                        <Switch
                            checked={byAudience}
                            onChange={e => setByAudience(e.target.checked)}
                            size="small"
                        />
                        <Typography variant="body1" sx={{ color: "text.primary" }}>
              Message by audience
                        </Typography>
                        <Tooltip title="Personalize the bullet text per viewer" placement="top" arrow>
                            <HelpOutlineIcon sx={{ fontSize: 16, color: "text.secondary", cursor: "default" }} />
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
                    <Typography variant="caption" sx={{ color: "text.primary", mb: 1.5, fontSize: 13 }}>
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
                            <FormatListBulletedIcon sx={{ fontSize: iconSizeMap[bulletIconSize], color: "background.paper" }} />
                        </Box>
                    </Box>

                    {/* Buttons */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button variant="outlined" startIcon={<UndoIcon />} sx={{ flex: 1, color: "primary.main", borderColor: "primary.main" }}>
              Replace
                        </Button>
                        <Button variant="outlined" startIcon={<EditOutlinedIcon />} sx={{ flex: 1, color: "primary.main", borderColor: "primary.main" }}>
              Edit
                        </Button>
                        <IconButton sx={{ color: "primary.main" }}>
                            <MoreHorizIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* Right side */}
                <Box>
                    {/* Value label */}
                    <Typography variant="caption" sx={{ color: "text.primary", mb: 1, fontSize: 13 }}>
            Value
                    </Typography>

                    {/* Text input with formatting bar */}
                    <Box sx={{
                        borderWidth: 2, borderStyle: "solid", borderColor: "primary.main", borderRadius: "8px", overflow: "hidden"
                    }}>
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
                            fontSize: 13,
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

const IMG_THUMB = "/thumb.svg";

const GRADIENT_BTN =
  "linear-gradient(146.457deg, rgb(235,137,241) 0%, rgb(0,83,229) 100%)";

// Design tokens removed — all colors now use MUI theme palette paths

// ─── Section label ────────────────────────────────────────────────────────────
function NavSection({ label }: { label: string }) {
    return (
        <Typography variant="caption" sx={{
            letterSpacing: "1px", textTransform: "uppercase",
            color: "text.secondary", px: "12px", pb: "8px", lineHeight: 1.5,
            opacity: 0.8
        }}>
            {label}
        </Typography>
    );
}

// ─── Left nav item ────────────────────────────────────────────────────────────
function NavItem({
    icon, label, selected, onClick
}: {
  icon: React.ReactNode; label: string; selected?: boolean; onClick?: () => void
}) {
    return (
        <Box
            onClick={onClick}
            sx={{
                display: "flex", alignItems: "center", gap: "8px",
                px: "12px", py: "8px", borderRadius: "8px 0 0 8px",
                cursor: "pointer",
                bgcolor: selected ? "divider" : "transparent",
                "&:hover": { bgcolor: selected ? "divider" : "action.hover" }
            }}
        >
            <Box sx={{ color: selected ? "primary.main" : "action.active", display: "flex" }}>
                {icon}
            </Box>
            <Typography variant={selected ? "subtitle2" : "body1"} sx={{
                lineHeight: 1.5,
                color: selected ? "text.primary" : "text.secondary"
            }}>
                {label}
            </Typography>
        </Box>
    );
}

// ─── Comments panel — draggable + resizable ───────────────────────────────────
// checkedNow = checked this panel session (stays in Unresolved with strikethrough)
// resolved   = resolved in a previous session (shown in Completed tab)
interface CommentItem { text: string; checkedNow: boolean; resolved: boolean }
export interface CommentThread { id: number; author: string; comments: CommentItem[] }

// Export total comment count for use in the "View [x] approver comments" button
export const TOTAL_COMMENT_COUNT = 4; // Sarah: 2 comments + Emma: 1 comment + Manager: 1 comment

export const INITIAL_THREADS: CommentThread[] = [
    {
        id: 1, author: "Sarah Johnson",
        comments: [
            { text: "Opening scene - add the name of the company to the title", checkedNow: false, resolved: false },
            { text: "Opening scene - We may need a different version of this image depending on rights. Can you check and update me?", checkedNow: false, resolved: false }
        ]
    },
    {
        id: 2, author: "Emma Rodriguez",
        comments: [
            { text: "Closing scene - A legal disclaimer is required on this screen", checkedNow: false, resolved: false }
        ]
    },
    {
        id: 3, author: "Manager",
        comments: [
            { text: "Your manager has asked you to create a new scene in the video. In this scene, include three bullet points that clearly communicate key aspects of the delivery policy. Please come up with short, clear statements for each bullet. For example: Fast delivery within 3–5 business days, Free shipping on orders over $50, Easy returns within 30 days (don't change the bullet icon for now).", checkedNow: false, resolved: false }
        ]
    }
];

// ─── Unresolved warning dialog (Figma node 19050-66136) ───────────────────────
function UnresolvedWarningDialog({ open, count, onClose, onConfirm }: { open: boolean; count: number; onClose: () => void; onConfirm: () => void }) {
    const [explanation, setExplanation] = useState("");
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            sx={{ zIndex: 1500 }}
            PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0px 0px 10px rgba(3,25,79,0.25)" } }}
        >
            <DialogTitle sx={{
                lineHeight: 1.5, letterSpacing: 0, color: "text.primary",
                pb: 1, pr: 6
            }}>
        Unresolved comments require explanation
                <IconButton onClick={onClose} size="small"
                    sx={{ position: "absolute", top: 12, right: 12, color: "action.active" }}>
                    <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: "8px !important" }}>
                <Typography sx={{
                    lineHeight: 1.5, color: "text.primary", mb: 2
                }}>
          There are {count} unresolved {count === 1 ? "comment" : "comments"}.{" "}
                    <Box component="span"
                        sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                        onClick={onClose}
                    >
            View comments
                    </Box>
                </Typography>
                <Typography sx={{
                    lineHeight: 1.5, color: "text.primary", mb: 1
                }}>
          Explain why you're requesting sign-off again without changes
                </Typography>
                <TextField
                    fullWidth multiline rows={3}
                    placeholder="Explain unresolved comments"
                    value={explanation}
                    onChange={e => setExplanation(e.target.value)}
                    variant="outlined" size="medium"
                    InputProps={{ sx: { letterSpacing: "0.15px" } }}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: "8px" }}>
                <Button variant="text" color="primary" size="large" onClick={onClose}>
          Cancel
                </Button>
                <Button variant="contained" color="primary" size="large" onClick={onConfirm}>
          Send for approvers
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Comments panel ────────────────────────────────────────────────────────────
function CommentsPanel({
    open, onClose, threads, setThreads, onRequestApproval, awaitingApprovers
}: {
  open: boolean
  onClose: () => void
  threads: CommentThread[]
  setThreads: React.Dispatch<React.SetStateAction<CommentThread[]>>
  approverNames?: string
  onRequestApproval: () => void
  awaitingApprovers?: boolean
}) {
    const [pos, setPos] = useState({ x: 0, y: 80 });
    const [tab, setTab] = useState<"unresolved" | "completed">("unresolved");
    const [warningOpen, setWarningOpen] = useState(false);
    const dragging = useRef(false);
    const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

    // Position on open
    useEffect(() => {
        if (open) {
            setPos({ x: Math.max(0, window.innerWidth - 330 - 266), y: 80 });
        }
    }, [open]);

    // On close: move checkedNow → resolved (for next session)
    useEffect(() => {
        if (!open) {
            setThreads(prev => prev.map(t => ({
                ...t,
                comments: t.comments.map(c =>
                    c.checkedNow ? { ...c, checkedNow: false, resolved: true } : c
                )
            })));
        }
    }, [open, setThreads]);

    // Drag
    const onHeaderMouseDown = useCallback((e: React.MouseEvent) => {
        dragging.current = true;
        dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
        e.preventDefault();
    }, [pos]);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!dragging.current) {
                return;
            }
            setPos({ x: dragStart.current.px + (e.clientX - dragStart.current.mx), y: dragStart.current.py + (e.clientY - dragStart.current.my) });
        };
        const onUp = () => {
            dragging.current = false; 
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); 
        };
    }, []);

    // Toggle check: stays in Unresolved tab (strikethrough) until panel closes
    const toggleCheck = (threadId: number, idx: number) =>
        setThreads(prev => prev.map(t =>
            t.id === threadId
                ? { ...t, comments: t.comments.map((c, i) => i === idx ? { ...c, checkedNow: !c.checkedNow } : c) }
                : t
        ));

    const unresolvedCount = threads.reduce((n, t) => n + t.comments.filter(c => !c.checkedNow && !c.resolved).length, 0);
    const allAddressed = threads.every(t => t.comments.every(c => c.checkedNow || c.resolved));

    const handleRequestApproval = () => {
        if (!allAddressed) {
            setWarningOpen(true); return; 
        }
        onRequestApproval();
    };

    if (!open) {
        return null;
    }

    return (
        <>
            <Box sx={{
                position: "fixed", left: pos.x, top: pos.y,
                width: 292, minWidth: 260,
                bgcolor: "background.paper", borderRadius: "8px",
                boxShadow: "0px 0px 5px 0px rgba(3,25,79,0.25)",
                zIndex: 1300,
                display: "flex", flexDirection: "column",
                resize: "both", overflow: "hidden"
            }}>

                {/* ── Header (drag to move) ─────────────────────────────────────── */}
                <Box onMouseDown={onHeaderMouseDown} sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    px: 2, pt: 1, pb: 1,
                    cursor: "grab", "&:active": { cursor: "grabbing" },
                    userSelect: "none", flexShrink: 0
                }}>
                    <Typography sx={{
                        color: "text.primary", lineHeight: 1.5
                    }}>
            Comments
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={onClose}
                        sx={{ color: "text.primary", p: "8px", borderRadius: "8px" }}
                    >
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>

                {/* ── Toggle tab selector (ToggleButtonGroup pill style) ────────── */}
                <Box sx={{ px: 2, pb: "8px", flexShrink: 0 }}>
                    <Box sx={{
                        display: "inline-flex",
                        borderWidth: 1, borderStyle: "solid", borderColor: "grey.300",
                        borderRadius: "8px",
                        padding: "1px",
                        gap: 0
                    }}>
                        {[
                            { key: "unresolved", label: awaitingApprovers ? "Unresolved" : `Unresolved (${unresolvedCount})` },
                            { key: "completed", label: "Completed" }
                        ].map(({ key, label }) => (
                            <Box
                                key={key}
                                onClick={() => setTab(key as typeof tab)}
                                sx={{
                                    px: "6px", py: "4px",
                                    borderRadius: "7px",
                                    cursor: "pointer",
                                    bgcolor: tab === key ? "action.selected" : "transparent",
                                    transition: "background-color 0.15s"
                                }}
                            >
                                <Typography sx={{
                                                                        lineHeight: 1.5,
                                    color: tab === key ? "text.primary" : "text.secondary",
                                    whiteSpace: "nowrap"
                                }}>
                                    {label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* ── Divider ───────────────────────────────────────────────────── */}
                <Divider sx={{ borderColor: "grey.400", flexShrink: 0 }} />

                {/* ── "View version" link — Unresolved tab only, hidden when no comments ── */}
                {tab === "unresolved" && unresolvedCount > 0 && (
                    <Box sx={{
                        px: 2, py: "8px", flexShrink: 0,
                        display: "flex", alignItems: "center", gap: "4px",
                        cursor: "pointer", "&:hover": { opacity: 0.8 }
                    }}>
                        <VisibilityOutlinedIcon sx={{ fontSize: 14, color: "primary.main" }} />
                        <Typography sx={{
                            color: "primary.main", lineHeight: 1.5
                        }}>
              View version sent for approval
                        </Typography>
                        <ArrowForwardIosIcon sx={{ fontSize: 11, color: "primary.main" }} />
                    </Box>
                )}

                {/* ── Awaiting all approvers state ──────────────────────────────── */}
                {awaitingApprovers && tab === "unresolved" && (
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: 3 }}>
                        <Typography sx={{
                            lineHeight: 1.5, color: "text.primary", textAlign: "center"
                        }}>
              1 of 2 approvers responded<br />
              Comments will appear here once all approvers have responded.
                        </Typography>
                    </Box>
                )}

                {/* ── Comment threads ───────────────────────────────────────────── */}
                <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: "4px", pb: "12px", display: "flex", flexDirection: "column", gap: "16px", ...(awaitingApprovers && tab === "unresolved" ? { display: "none" } : {}) }}>
                    {threads.map(thread => {
                        const visibleComments = tab === "unresolved"
                            ? thread.comments.filter(c => !c.resolved)
                            : thread.comments.filter(c => c.resolved);
                        if (visibleComments.length === 0) {
                            return null;
                        }
                        return (
                            <Box key={thread.id}>
                                {/* "By [Approver Name]" label — only when multiple approvers */}
                                {threads.length > 1 && (
                                    <Typography sx={{
                                        color: "text.secondary", lineHeight: 1.5, mb: "8px"
                                    }}>
                    By {thread.author}
                                    </Typography>
                                )}

                                {/* Comments with MUI Checkbox */}
                                {visibleComments.map((c, visibleIdx) => {
                                    const originalIdx = thread.comments.indexOf(c);
                                    const isChecked = c.checkedNow || c.resolved;
                                    return (
                                        <Box key={originalIdx}>
                                            {visibleIdx > 0 && (
                                                <Divider sx={{ my: "8px", borderColor: "grey.400" }} />
                                            )}
                                            <Box sx={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                                                <Checkbox
                                                    size="small"
                                                    checked={isChecked}
                                                    onChange={() => tab === "unresolved" && toggleCheck(thread.id, originalIdx)}
                                                    disabled={tab === "completed"}
                                                    sx={{
                                                        p: "2px", flexShrink: 0, mt: "1px",
                                                        color: "action.active",
                                                        "&.Mui-checked": { color: "primary.main" }
                                                    }}
                                                />
                                                <Typography sx={{
                                                    color: isChecked ? "text.secondary" : "text.primary",
                                                    lineHeight: 1.5,
                                                    textDecoration: isChecked ? "line-through" : "none",
                                                    flex: 1
                                                }}>
                                                    {c.text}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        );
                    })}

                    {/* Empty states */}
                    {tab === "completed" && threads.every(t => t.comments.every(c => !c.resolved)) && (
                        <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", mt: 2 }}>
              No completed comments yet
                        </Typography>
                    )}
                    {tab === "unresolved" && unresolvedCount === 0 && (
                        <Typography variant="body1" sx={{ color: "text.secondary", textAlign: "center", mt: 3, pb: "50px" }}>
              There are no unresolved comments
                        </Typography>
                    )}
                </Box>

                {/* ── Footer: "Resend for approval" — hidden when awaiting approvers or no comments yet ── */}
                {!awaitingApprovers && threads.length > 0 && (
                    <Box sx={{
                        px: 2, py: "12px",
                        borderTop: 1, borderTopStyle: "solid", borderTopColor: "grey.400",
                        flexShrink: 0,
                        display: "flex", justifyContent: "flex-end"
                    }}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleRequestApproval}
                            sx={{
                                bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" },
                                px: 2
                            }}
                        >
              Resend for approval
                        </Button>
                    </Box>
                )}
            </Box>

            {/* ── Unresolved warning dialog ─────────────────────────────────────── */}
            <UnresolvedWarningDialog
                open={warningOpen}
                count={unresolvedCount}
                onClose={() => setWarningOpen(false)}
                onConfirm={() => {
                    setWarningOpen(false); onRequestApproval(); 
                }}
            />
        </>
    );
}

// ─── Scene thumbnail ──────────────────────────────────────────────────────────
function SceneThumbnail({ index, selected, headingText, subheadingText, footnoteText, onClick }: { index: number; selected: boolean; headingText?: string; subheadingText?: string; footnoteText?: string; onClick?: () => void }) {
    return (
        <Box onClick={onClick} sx={{ width: 140, flexShrink: 0, display: "flex", flexDirection: "column", gap: "4px", alignItems: "center", cursor: "pointer" }}>
            <Typography sx={{
                color: "text.secondary", letterSpacing: "0.4px"
            }}>
        Scene {index + 1}
            </Typography>
            <Box sx={{
                width: "100%", aspectRatio: "16/9",
                bgcolor: "grey.100",
                borderWidth: selected ? 2 : 1, borderStyle: "solid", borderColor: selected ? "primary.main" : "grey.400",
                borderRadius: "8px", overflow: "hidden",
                position: "relative"
            }}>
                <Box component="img" src={IMG_THUMB} alt=""
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

                {/* Cover left half of SVG — white bg + pink accent line */}
                <Box sx={{ position: "absolute", inset: 0, width: "50%", bgcolor: "background.paper", pointerEvents: "none" }}>
                    <Box sx={{ height: 3, bgcolor: "#C084FC", width: "100%" }} />
                </Box>

                {/* Right side — drag media */}
                <Box sx={{
                    position: "absolute", top: 0, right: 0, bottom: 0, width: "50%",
                    background: "repeating-linear-gradient(-45deg, #EBEBEF 0px, #EBEBEF 6px, #E2E2E7 6px, #E2E2E7 12px)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: "4px", pointerEvents: "none"
                }}>
                    <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 22, color: "action.disabled" }} />
                    <Typography variant="caption" sx={{ fontSize: 7, color: "action.disabled" }}>
            Drag media here
                    </Typography>
                </Box>

                {/* Heading + sub-heading — flowing column */}
                <Box sx={{ position: "absolute", left: "4%", top: "18%", width: "44%", containerType: "inline-size", pointerEvents: "none", display: "flex", flexDirection: "column" }}>
                    <Typography sx={{ fontFamily: "\"Inter\", sans-serif", fontWeight: 700, fontSize: "9cqw", color: "secondary.main", lineHeight: 1.2, wordBreak: "break-word" }}>
                        {headingText ?? ""}
                    </Typography>
                    <Typography sx={{ fontFamily: "\"Inter\", sans-serif", fontWeight: 400, fontSize: "4cqw", color: "text.primary", lineHeight: 1.4, wordBreak: "break-word", mt: "5%" }}>
                        {subheadingText ?? "Sub-heading Placeholder"}
                    </Typography>
                </Box>

                {/* Footnote */}
                <Box sx={{ position: "absolute", left: "4%", width: "44%", bottom: "5%", containerType: "inline-size", pointerEvents: "none" }}>
                    <Typography sx={{ fontFamily: "\"Open Sans\", sans-serif", fontWeight: 400, fontSize: "2.5cqw", letterSpacing: "0.4px", color: "text.secondary", lineHeight: 1.66 }}>
                        {footnoteText ?? "Footnote placeholder"}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

// ─── Custom scene thumbnail ───────────────────────────────────────────────────
// Custom icon: corner handles + plus — matches the shared design
function PlaceholderIcon({ size = 28, color }: { size?: number; color?: string }) {
    const theme = useTheme();
    const fill = color ?? theme.palette.primary.main;
    const d = size;
    const corner = d * 0.15; // corner square size
    const gap = d * 0.28; // inset from edge
    const arm = d * 0.12; // half-length of plus arms
    const cx = d / 2;
    return (
        <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", flexShrink: 0 }}>
            {/* Corner squares */}
            <rect x={0} y={0} width={corner} height={corner} rx={corner * 0.25} fill={fill} />
            <rect x={d - corner} y={0} width={corner} height={corner} rx={corner * 0.25} fill={fill} />
            <rect x={0} y={d - corner} width={corner} height={corner} rx={corner * 0.25} fill={fill} />
            <rect x={d - corner} y={d - corner} width={corner} height={corner} rx={corner * 0.25} fill={fill} />
            {/* Corner connector lines */}
            <line x1={corner} y1={corner * 0.5} x2={gap} y2={corner * 0.5} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={d - corner} y1={corner * 0.5} x2={d - gap} y2={corner * 0.5} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={corner * 0.5} y1={corner} x2={corner * 0.5} y2={gap} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={corner * 0.5} y1={d - corner} x2={corner * 0.5} y2={d - gap} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={d - corner * 0.5} y1={corner} x2={d - corner * 0.5} y2={gap} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={d - corner * 0.5} y1={d - corner} x2={d - corner * 0.5} y2={d - gap} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={corner} y1={d - corner * 0.5} x2={gap} y2={d - corner * 0.5} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={d - corner} y1={d - corner * 0.5} x2={d - gap} y2={d - corner * 0.5} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            {/* Plus sign */}
            <line x1={cx - arm} y1={cx} x2={cx + arm} y2={cx} stroke={fill} strokeWidth={corner * 0.6} strokeLinecap="round" />
            <line x1={cx} y1={cx - arm} x2={cx} y2={cx + arm} stroke={fill} strokeWidth={corner * 0.6} strokeLinecap="round" />
        </svg>
    );
}

function CustomSceneThumbnail({ index, selected, onClick }: { index: number; selected: boolean; onClick?: () => void }) {
    return (
        <Box onClick={onClick} sx={{ width: 140, flexShrink: 0, display: "flex", flexDirection: "column", gap: "4px", alignItems: "center", cursor: "pointer" }}>
            <Typography sx={{
                color: "text.secondary", letterSpacing: "0.4px"
            }}>
        Scene {index + 1}
            </Typography>
            <Box sx={{
                width: "100%", aspectRatio: "16/9",
                bgcolor: "grey.100",
                borderWidth: selected ? 2 : 1, borderStyle: "solid", borderColor: selected ? "primary.main" : "grey.400",
                borderRadius: "8px", overflow: "hidden",
                position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center"
            }}>
                <PlaceholderIcon size={28} />
            </Box>
        </Box>
    );
}

// ─── Per-scene content lookup ─────────────────────────────────────────────────
function sceneContentFor(title?: string): [string, string][] {
    const map: Record<string, [string, string][]> = {
        "Stay Safe During Missile Threats": [
            ["Find Your Nearest Shelter", "Know your safest options before an alert sounds"],
            ["When the Siren Sounds", "Drop, take cover, and protect your head immediately"],
            ["After the All-Clear", "Wait for official confirmation before leaving your shelter"]
        ],
        "Recent TTS Pronunciation Advancements": [
            ["Improved Accuracy", "New models achieve 97% accuracy on complex terminology"],
            ["Natural Voice Flow", "Context-aware prosody creates more human-like speech"],
            ["Try It Yourself", "Access the updated TTS toolkit in your dashboard today"]
        ],
        "Prepare for Winter Fun!": [
            ["Gear Up Together", "Essential equipment for every age and skill level"],
            ["Safety First", "Check conditions and prep your first-aid kit before heading out"],
            ["Make Memories", "Capture the moments that last a lifetime"]
        ],
        "Understanding the American-Israel-Iran Conflict: Peace & Safety": [
            ["Key Players & Interests", "A closer look at the stakeholders shaping the region"],
            ["The Path to De-escalation", "Diplomatic efforts and international frameworks in play"],
            ["What It Means for You", "How regional stability affects global security and daily life"]
        ],
        "Discover Tel Aviv's Scenic Parks": [
            ["Yarkon Park", "3,800 dunams of greenery in the heart of the city"],
            ["Urban Wildlife", "Meet the birds, fish, and flora that call these parks home"],
            ["Plan Your Visit", "Opening hours, facilities, and the best times to explore"]
        ],
        "Onboarding Steps": [
            ["Set Up Your Profile", "Personalise your account and team settings in minutes"],
            ["Explore Key Features", "A guided tour of the tools you'll use every day"],
            ["You're Ready to Go", "Connect with your team and start your first project"]
        ]
    };
    return map[title ?? ""] ?? [
        ["Scene Overview", "Key insights for this section of your video"],
        ["Deeper Dive", "Supporting details and context worth highlighting"],
        ["Key Takeaway", "What your audience should remember most"]
    ];
}

// ─── Studio page ──────────────────────────────────────────────────────────────
interface Props {
  videoTitle: string
  initialHeadingText?: string
  initialSubheadingText?: string
  approverNames: string
  onNavigateToVideoPage: () => void
  onNavigateToLibrary: () => void
  onRequestReapproval: () => void
  onHeadingChange?: (text: string) => void
  onSubheadingChange?: (text: string) => void
  openCommentsOnMount?: boolean
  triggerOpenComments?: number
  notifications?: NotificationItem[]
  initialThreads?: CommentThread[]
  initialPermSettings?: VideoPermissionSettings
  onPermChange?: (s: VideoPermissionSettings) => void
  awaitingApprovers?: boolean
  onEditAttempt?: () => void
}

export default function StudioPage({ videoTitle, initialHeadingText, initialSubheadingText, approverNames, onNavigateToVideoPage, onNavigateToLibrary, onRequestReapproval, onHeadingChange, onSubheadingChange, openCommentsOnMount, triggerOpenComments, notifications, initialThreads, initialPermSettings, onPermChange, awaitingApprovers, onEditAttempt }: Props) {
    const [commentsOpen, setCommentsOpen] = useState(() => openCommentsOnMount ?? false);

    // Open comments panel whenever triggerOpenComments counter increments (e.g. from notification link)
    useEffect(() => {
        if (triggerOpenComments && triggerOpenComments > 0) {
            setCommentsOpen(true);
        }
    }, [triggerOpenComments]);
    const [activeNav, setActiveNav] = useState<string | null>(null);
    const [mediaLibOpen, setMediaLibOpen] = useState(false);
    const [mediaFolder, setMediaFolder] = useState<string | null>(null);
    const [avatarLibOpen, setAvatarLibOpen] = useState(false);
    const [avatarReqCount, setAvatarReqCount] = useState(4); // mock: adam has 4 pending
    const [selectedScene, setSelectedScene] = useState(0);
    const [headingSelected, setHeadingSelected] = useState(false);
    const [headingText, setHeadingText] = useState(initialHeadingText ?? videoTitle);
    const [editHeadingOpen, setEditHeadingOpen] = useState(false);
    const [subheadingSelected, setSubheadingSelected] = useState(false);
    const [subheadingText, setSubheadingText] = useState(initialSubheadingText ?? "Sub-heading Placeholder");
    const [editSubheadingOpen, setEditSubheadingOpen] = useState(false);
    const [footnoteSelected, setFootnoteSelected] = useState(false);
    const [footnoteText, setFootnoteText] = useState("Footnote placeholder");
    const [editFootnoteOpen, setEditFootnoteOpen] = useState(false);
    const [editBulletOpen, setEditBulletOpen] = useState(false);

    const [sceneTypes, setSceneTypes] = useState<("regular" | "custom")[]>(["regular", "regular", "regular", "regular"]);
    const [sceneLibOpen, setSceneLibOpen] = useState(false);
    const [placeholderMenuOpen, setPlaceholderMenuOpen] = useState(false);
  // ── Unified canvas elements ──────────────────────────────────────────────────
  type PlaceholderType =
    | "Heading" | "Sub heading" | "Media" | "Footnote" | "Logo"
    | "Button" | "Vertical bullet point" | "Horizontal bullet point"
  type CanvasEl = {
    id: string; type: PlaceholderType
    x: number; y: number // % of scene dimensions
    width?: number; height?: number // % of scene dimensions (for resizing)
    text?: string // editable label (bullets, text types)
    buttonSize?: "S"|"M"|"L"|"XL"
    bulletIconSize?: "S"|"M"|"L"|"XL"
    bulletTextSize?: number // font size in pixels for bullet text
  }
  const [sceneElements, setSceneElements] = useState<Record<number, CanvasEl[]>>({});
  const [selectedElId, setSelectedElId] = useState<string | null>(null);
  const [editingElId, setEditingElId] = useState<string | null>(null);
  const [bulletMenuAnchor, setBulletMenuAnchor] = useState<HTMLElement | null>(null);

  // Helpers
  const sceneEls = (scene = selectedScene) => sceneElements[scene] ?? [];
  const selectedEl = sceneEls().find(el => el.id === selectedElId) ?? null;

  const addElement = (type: PlaceholderType) => {
      const els = sceneEls();
      const i = els.length % 6;
      const newEl: CanvasEl = {
          id: `el-${Date.now()}`,
          type,
          x: Math.min(85, 25 + i * 10),
          y: Math.min(80, 28 + i * 10),
          ...(type === "Button" ? { buttonSize: "L" } : {}),
          ...(type === "Vertical bullet point" || type === "Horizontal bullet point"
              ? { bulletIconSize: "M", text: "Placeholder" } : {})
      };
      setSceneElements(prev => ({ ...prev, [selectedScene]: [...(prev[selectedScene] ?? []), newEl] }));
      setSelectedElId(newEl.id); // Auto-select newly added element and show toolbar
  };

  const updateEl = (id: string, patch: Partial<CanvasEl>) =>
      setSceneElements(prev => ({
          ...prev,
          [selectedScene]: (prev[selectedScene] ?? []).map(el => el.id === id ? { ...el, ...patch } : el)
      }));

  const deleteEl = (id: string) => {
      setSceneElements(prev => ({
          ...prev,
          [selectedScene]: (prev[selectedScene] ?? []).filter(el => el.id !== id)
      }));
      setSelectedElId(null);
      setEditingElId(null);
  };

  // Helper: Update bullet text and sync font size to all bullets in scene
  const updateBulletText = (id: string, text: string) => {
      // Calculate optimal font size based on text length
      const calcFontSize = (textLen: number): number => {
          if (textLen > 50) {
              return 11;
          }
          if (textLen > 40) {
              return 12;
          }
          return 14;
      };
      const newFontSize = calcFontSize(text.length);

      // Update this bullet and sync font size to all other bullets in scene
      setSceneElements(prev => ({
          ...prev,
          [selectedScene]: (prev[selectedScene] ?? []).map(el => {
              if (el.id === id) {
                  return { ...el, text, bulletTextSize: newFontSize };
              }
              // Sync font size to all other bullets
              if (el.type === "Vertical bullet point" || el.type === "Horizontal bullet point") {
                  return { ...el, bulletTextSize: newFontSize };
              }
              return el;
          })
      }));
  };

  // Drag support
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const sceneBoxRef = useRef<HTMLDivElement | null>(null);
  const selectedElRef = useRef<HTMLDivElement | null>(null);
  const dragInfo = useRef<{
    startMX: number; startMY: number; startX: number; startY: number
    moved: boolean; updatePos: (x: number, y: number) => void
        } | null>(null);
  const resizeInfo = useRef<{
    startMX: number; startMY: number; startW: number; startH: number
    moved: boolean; updateSize: (w: number, h: number) => void
        } | null>(null);

  const startDrag = (e: React.MouseEvent, startX: number, startY: number, updatePos: (x: number, y: number) => void) => {
      e.stopPropagation();
      dragInfo.current = { startMX: e.clientX, startMY: e.clientY, startX, startY, moved: false, updatePos };
  };

  const startResize = (e: React.MouseEvent, startW: number, startH: number, updateSize: (w: number, h: number) => void) => {
      e.stopPropagation();
      resizeInfo.current = { startMX: e.clientX, startMY: e.clientY, startW, startH, moved: false, updateSize };
  };

  const onCanvasMouseMove = (e: React.MouseEvent) => {
      if (dragInfo.current && !resizeInfo.current && canvasRef.current) {
          const sceneW = canvasRef.current.clientWidth;
          const sceneH = sceneW * 9 / 16;
          const dx = ((e.clientX - dragInfo.current.startMX) / sceneW) * 100;
          const dy = ((e.clientY - dragInfo.current.startMY) / sceneH) * 100;
          if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
              dragInfo.current.moved = true;
          }
          dragInfo.current.updatePos(
              Math.max(5, Math.min(95, dragInfo.current.startX + dx)),
              Math.max(5, Math.min(95, dragInfo.current.startY + dy))
          );
      }
      if (resizeInfo.current && !dragInfo.current && canvasRef.current) {
          const sceneW = canvasRef.current.clientWidth;
          const sceneH = sceneW * 9 / 16;
          const dw = ((e.clientX - resizeInfo.current.startMX) / sceneW) * 100;
          const dh = ((e.clientY - resizeInfo.current.startMY) / sceneH) * 100;
          if (Math.abs(dw) > 1 || Math.abs(dh) > 1) {
              resizeInfo.current.moved = true;
          }
          resizeInfo.current.updateSize(
              Math.max(15, Math.min(90, resizeInfo.current.startW + dw)),
              Math.max(15, Math.min(90, resizeInfo.current.startH + dh))
          );
      }
  };

  const onCanvasMouseUp = () => {
      dragInfo.current = null; resizeInfo.current = null; 
  };

  // True when any toolbar or panel is open → disables scene navigation
  const isToolbarActive = selectedElId !== null || placeholderMenuOpen;

  const SCENE_COUNT = sceneTypes.length;
  const goToScene = (idx: number) => {
      const next = Math.max(0, Math.min(SCENE_COUNT - 1, idx));
      setSelectedScene(next);
      setHeadingSelected(false);
      setSubheadingSelected(false);
      setFootnoteSelected(false);
      setSelectedElId(null);
      setEditingElId(null);
      if (sceneTypes[next] !== "custom") {
          setPlaceholderMenuOpen(false);
      }
  };
  const [threads, setThreads] = useState<CommentThread[]>(initialThreads ?? []);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);
  const [videoPermOpen, setVideoPermOpen] = useState(false);
  const [videoPermSettings, setVideoPermSettings] = useState<VideoPermissionSettings | undefined>(initialPermSettings);

  // Unread = not yet checked or resolved
  const unreadCount = threads.reduce((n, t) => n + t.comments.filter(c => !c.checkedNow && !c.resolved).length, 0);

  const NAV_SECTIONS = [
      {
          section: "STYLE",
          items: [
              { icon: <BrandingWatermarkOutlinedIcon sx={{ fontSize: 20 }} />, label: "Brand" },
              { icon: <PaletteOutlinedIcon sx={{ fontSize: 20 }} />, label: "Theme" },
              {
                  icon: (
                      <Badge
                          badgeContent={avatarReqCount > 0 ? avatarReqCount : undefined}
                          color="error"
                          sx={{ "& .MuiBadge-badge": { fontSize: 9, minWidth: 14, height: 14, padding: 0 } }}
                      >
                          <PersonOutlinedIcon sx={{ fontSize: 20 }} />
                      </Badge>
                  ),
                  label: "Avatar"
              }
          ]
      },
      {
          section: "LIBRARIES",
          items: [
              { icon: <PermMediaOutlinedIcon sx={{ fontSize: 20 }} />, label: "Media" },
              { icon: <MusicNoteOutlinedIcon sx={{ fontSize: 20 }} />, label: "Music" },
              { icon: <MicOutlinedIcon sx={{ fontSize: 20 }} />, label: "Voice" },
              { icon: <StorageOutlinedIcon sx={{ fontSize: 20 }} />, label: "Data" },
              { icon: <InputOutlinedIcon sx={{ fontSize: 20 }} />, label: "Input fields" }
          ]
      },
      {
          section: "SETTINGS",
          items: [
              { icon: <AspectRatioOutlinedIcon sx={{ fontSize: 20 }} />, label: "Aspect ratio" },
              { icon: <LanguageOutlinedIcon sx={{ fontSize: 20 }} />, label: "Languages" }
          ]
      },
      {
          section: "APPROVAL",
          items: [
              {
                  icon: (
                      <Badge
                          badgeContent={unreadCount > 0 ? unreadCount : undefined}
                          color="error"
                          sx={{ "& .MuiBadge-badge": { fontSize: 9, minWidth: 14, height: 14, padding: 0 } }}
                      >
                          <CommentOutlinedIcon sx={{ fontSize: 20 }} />
                      </Badge>
                  ),
                  label: "Comments",
                  onClickOverride: () => {
                      setCommentsOpen(true); 
                  }
              }
          ]
      }
  ];

  return (
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "hidden" }}>

          {/* ── Appbar ─────────────────────────────────────────────────────────── */}
          <Box sx={{
              height: 56, flexShrink: 0, bgcolor: "secondary.main",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              px: 0, borderBottom: "1px solid rgba(255,255,255,0.08)"
          }}>
              {/* Left */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {/* Logo — click to go to library */}
                  <Box
                      onClick={onNavigateToLibrary}
                      sx={{
                          width: 56, height: 56, flexShrink: 0,
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          cursor: "pointer", "&:hover": { opacity: 0.75 }
                      }}
                  >
                      {[{ chars: "SUN", color: "background.paper" }, { chars: "DAY", color: "background.paper" }, { chars: "SKY", color: "primary.main" }]
                          .map(({ chars, color }) => (
                              <Typography key={chars} variant="caption" sx={{
                                  fontSize: 9,
                                  letterSpacing: "0.22em", lineHeight: 1.4, color, display: "block"
                              }}>
                                  {chars}
                              </Typography>
                          ))}
                  </Box>
                  {/* Video name */}
                  <Typography sx={{
                      color: "background.paper", lineHeight: 1.2, letterSpacing: "0.15px"
                  }}>
                      {videoTitle}
                  </Typography>
                  {/* Language badge */}
                  <Box sx={{
                      display: "flex", alignItems: "center", gap: "4px",
                      px: "10px", py: "4px", borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer"
                  }}>
                      <Typography sx={{ fontSize: 13 }}>🇺🇸</Typography>
                      <Typography sx={{
                          color: "background.paper"
                      }}>
              EN
                      </Typography>
                  </Box>
              </Box>

              {/* Right */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 2 }}>
                  <IconButton size="small" sx={{ color: "rgba(255,255,255,0.7)" }}>
                      <UndoIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" sx={{ color: "rgba(255,255,255,0.7)" }}>
                      <RedoIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Box sx={{ width: "1px", height: 20, bgcolor: "rgba(255,255,255,0.2)", mx: 0.5 }} />
                  {/* Manage permissions button */}
                  <Tooltip
                      title="Manage permission"
                      placement="bottom"
                      arrow
                      componentsProps={{ tooltip: { sx: { bgcolor: "secondary.main", borderRadius: "8px", px: 1.5, py: 1, "& .MuiTooltip-arrow": { color: "secondary.main" } } } }}
                  >
                      <IconButton
                          size="small"
                          onClick={() => setVideoPermOpen(true)}
                          sx={{
                              bgcolor: "secondary.main",
                              borderRadius: "8px",
                              p: "5px",
                              border: "1px solid rgba(255,255,255,0.5)",
                              "&:hover": { bgcolor: "rgba(3,25,79,0.7)" }
                          }}
                      >
                          <LockPersonIcon sx={{ fontSize: 20, color: "background.paper" }} />
                      </IconButton>
                  </Tooltip>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: OWNER_USER.color, fontSize: 12 }}>
                      {OWNER_USER.initials}
                  </Avatar>
                  <NotificationBell dark notifications={notifications} />
                  <Box sx={{ width: "1px", height: 20, bgcolor: "rgba(255,255,255,0.2)", mx: 0.5 }} />
                  {/* Video Page button */}
                  <Button
                      size="small"
                      endIcon={<ArrowForwardIosIcon sx={{ fontSize: "11px !important" }} />}
                      onClick={onNavigateToVideoPage}
                      sx={{
                          background: GRADIENT_BTN, color: "background.paper",
                          px: 2, whiteSpace: "nowrap",
                          "&:hover": { opacity: 0.88, background: GRADIENT_BTN }
                      }}
                  >
            Video Page
                  </Button>
              </Box>
          </Box>

          {/* ── Content ────────────────────────────────────────────────────────── */}
          <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>

              {/* Left nav */}
              <Box sx={{
                  width: 180, flexShrink: 0, bgcolor: "background.paper",
                  borderRight: 1, borderRightStyle: "solid", borderRightColor: "divider",
                  overflowY: "auto", pt: "16px",
                  display: "flex", flexDirection: "column", gap: "24px"
              }}>
                  {NAV_SECTIONS.map(({ section, items }) => (
                      <Box key={section}>
                          <NavSection label={section} />
                          {items.map(({ icon, label, onClickOverride }: { icon: React.ReactNode; label: string; onClickOverride?: () => void }) => (
                              <NavItem
                                  key={label}
                                  icon={icon}
                                  label={label}
                                  selected={activeNav === label}
                                  onClick={() => {
                                      if (label === "Avatar") {
                                          if (activeNav === "Avatar" && avatarLibOpen) {
                                              setAvatarLibOpen(false);
                                              setActiveNav(null);
                                          }
                                          else {
                                              setAvatarLibOpen(true);
                                              setMediaLibOpen(false);
                                              setActiveNav("Avatar");
                                          }
                                      }
                                      else if (label === "Media") {
                                          if (activeNav === "Media" && mediaLibOpen) {
                                              // Toggle off
                                              setMediaLibOpen(false);
                                              setActiveNav(null);
                                          }
                                          else {
                                              setMediaLibOpen(true);
                                              setMediaFolder(null);
                                              setAvatarLibOpen(false);
                                              setActiveNav("Media");
                                          }
                                      }
                                      else {
                                          setActiveNav(label);
                                          setMediaLibOpen(false);
                                          setAvatarLibOpen(false);
                                          if (onClickOverride) {
                                              onClickOverride();
                                          }
                                      }
                                  }}
                              />
                          ))}
                      </Box>
                  ))}
              </Box>

              {/* Media Library Panel — slides in between nav and stage */}
              <MediaLibraryPanel
                  open={mediaLibOpen}
                  onClose={() => {
                      setMediaLibOpen(false); setActiveNav(null); 
                  }}
                  folder={mediaFolder}
                  onOpenFolder={name => setMediaFolder(name)}
                  onCloseFolder={() => setMediaFolder(null)}
              />

              {/* Avatar Library Panel — slides in between nav and stage */}
              <AvatarLibraryPanel
                  open={avatarLibOpen}
                  onClose={() => {
                      setAvatarLibOpen(false); setActiveNav(null); 
                  }}
                  onTotalRequestsChange={setAvatarReqCount}
              />

              {/* Stage */}
              <Box sx={{ flex: 1, bgcolor: "other.editorBackground", display: "flex", flexDirection: "column", overflow: "visible" }}>

                  {/* Live preview area */}
                  <Box sx={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                      px: 2, py: 3, overflow: "visible", position: "relative"
                  }}>


                      {/* Prev arrow */}
                      <IconButton
                          disabled={selectedScene === 0 || isToolbarActive}
                          onClick={() => goToScene(selectedScene - 1)}
                          size="small"
                          sx={{ flexShrink: 0, color: (selectedScene === 0 || isToolbarActive) ? "action.disabled" : "primary.main", mx: "4px" }}
                      >
                          <ChevronLeftIcon />
                      </IconButton>

                      {/* Canvas + right toolbar — inner group aligned at top so toolbar top === canvas top */}
                      <Box sx={{ flex: 1, maxWidth: 720, display: "flex", alignItems: "stretch", gap: "8px", position: "relative", overflow: "visible" }}>

                          {/* Placeholder picker panel — floats to the right of canvas, above everything */}
                          {placeholderMenuOpen && (() => {
                              // Calculate available space on the right side of canvas
                              const canvasRect = canvasRef.current?.getBoundingClientRect();
                              const menuWidth = 260;
                              const gap = 8;
                              const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
                              const availableSpaceRight = canvasRect ? viewportWidth - (canvasRect.right + gap) : 0;
                              const shouldPositionLeft = availableSpaceRight < menuWidth;

                              return (
                                  <Box
                                      onClick={e => e.stopPropagation()}
                                      sx={{
                                          position: "absolute", top: 0,
                                          ...(shouldPositionLeft
                                              ? { right: "calc(100% + 8px)", left: "auto" }
                                              : { left: "calc(100% + 8px)", right: "auto" }
                                          ),
                                          zIndex: 40,
                                          bgcolor: "background.paper", borderRadius: "16px",
                                          boxShadow: "0 4px 24px rgba(3,25,79,0.18)",
                                          width: 260,
                                          borderWidth: 1, borderStyle: "solid", borderColor: "divider"
                                      }}
                                  >
                                      {/* Header */}
                                      <Box sx={{
                                          display: "flex", alignItems: "center", justifyContent: "space-between",
                                          px: "20px", pt: "18px", pb: "12px"
                                      }}>
                                          <Typography variant="h3" sx={{ fontSize: 18, color: "secondary.main" }}>
                      Placeholder
                                          </Typography>
                                          <IconButton size="small" onClick={() => setPlaceholderMenuOpen(false)} sx={{ color: "text.secondary", p: "4px" }}>
                                              <CloseIcon sx={{ fontSize: 20 }} />
                                          </IconButton>
                                      </Box>

                                      {/* Items */}
                                      <Box sx={{ px: "12px", pb: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                                          {([
                                              { label: "Heading", blue: true, iconEl: (
                                                  <Box sx={{ width: 40, height: 40, bgcolor: "background.paper", borderWidth: "1.5px", borderStyle: "solid", borderColor: "divider", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                      <img src="/heading.png" alt="Heading" style={{ width: 22, height: 22, objectFit: "contain" }} />
                                                  </Box>
                                              ) },
                                              { label: "Sub heading", blue: true, iconEl: (
                                                  <Box sx={{ width: 40, height: 40, bgcolor: "background.paper", borderWidth: "1.5px", borderStyle: "solid", borderColor: "divider", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                      <img src="/sub heading.png" alt="Sub heading" style={{ width: 22, height: 22, objectFit: "contain" }} />
                                                  </Box>
                                              ) },
                                              { label: "Media", blue: true, iconEl: (
                                                  <Box sx={{ width: 40, height: 40, bgcolor: "background.paper", borderWidth: "1.5px", borderStyle: "solid", borderColor: "divider", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                      <img src="/media.png" alt="Media" style={{ width: 22, height: 22, objectFit: "contain" }} />
                                                  </Box>
                                              ) },
                                              { label: "Vertical bullet point", blue: true, iconEl: (
                                                  <Box sx={{ width: 40, height: 40, bgcolor: "primary.main", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                      <FormatListBulletedIcon sx={{ fontSize: 22, color: "background.paper" }} />
                                                  </Box>
                                              ) },
                                              { label: "Horizontal bullet point", blue: true, iconEl: (
                                                  <Box sx={{ width: 40, height: 40, bgcolor: "primary.main", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                      <ViewWeekOutlinedIcon sx={{ fontSize: 22, color: "background.paper" }} />
                                                  </Box>
                                              ) },
                                              { label: "Footnote", blue: false, iconEl: (
                                                  <Box sx={{ width: 40, height: 40, bgcolor: "background.paper", borderWidth: "1.5px", borderStyle: "solid", borderColor: "divider", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                      <Typography variant="body1" sx={{ fontSize: 22, color: "text.secondary", lineHeight: 1 }}>*</Typography>
                                                  </Box>
                                              ) },
                                              { label: "Logo", blue: true, iconEl: (
                                                  <Box sx={{ width: 40, height: 40, bgcolor: "background.paper", borderWidth: "1.5px", borderStyle: "solid", borderColor: "divider", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                      <img src="/logo.png" alt="Logo" style={{ width: 22, height: 22, objectFit: "contain" }} />
                                                  </Box>
                                              ) },
                                              { label: "Button", blue: true, iconEl: (
                                                  <Box sx={{ width: 40, height: 40, bgcolor: "background.paper", borderWidth: "1.5px", borderStyle: "solid", borderColor: "divider", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                      <img src="/button.png" alt="Button" style={{ width: 22, height: 22, objectFit: "contain" }} />
                                                  </Box>
                                              ) }
                                          ] as { label: string; blue: boolean; iconEl: React.ReactNode }[]).map(({ label, blue, iconEl }) => (
                                              <Box
                                                  key={label}
                                                  onClick={() => {
                                                      addElement(label as PlaceholderType);
                                                      setPlaceholderMenuOpen(false);
                                                  }}
                                                  sx={{
                                                      display: "flex", alignItems: "center", gap: "14px",
                                                      px: "8px", py: "8px", cursor: "pointer",
                                                      borderRadius: "12px",
                                                      bgcolor: "background.paper",
                                                      "&:hover": { bgcolor: "action.hover" },
                                                      transition: "background 0.12s"
                                                  }}>
                                                  {iconEl}
                                                  <Typography variant="body1" sx={{ fontSize: 15, color: blue ? "primary.main" : "text.secondary" }}>
                                                      {label}
                                                  </Typography>
                                              </Box>
                                          ))}
                                      </Box>
                                  </Box>
                              );
                          })()}

                          {/* Canvas */}
                          <Box
                              ref={canvasRef}
                              onClick={() => {
                                  setHeadingSelected(false); setSubheadingSelected(false); setFootnoteSelected(false); setPlaceholderMenuOpen(false); setSelectedElId(null); setEditingElId(null); 
                              }}
                              onMouseMove={onCanvasMouseMove}
                              onMouseUp={onCanvasMouseUp}
                              onMouseLeave={onCanvasMouseUp}
                              sx={(theme) => ({
                                  flex: 1, position: "relative",
                                  borderRadius: "8px", overflow: "visible",
                                  border: `1px solid ${headingSelected || subheadingSelected || footnoteSelected ? theme.palette.primary.main : theme.palette.divider}`,
                                  boxShadow: headingSelected || subheadingSelected || footnoteSelected
                                      ? "0px 0px 0px 2px rgba(0,83,229,0.20), 0px 2px 12px rgba(3,25,79,0.10)"
                                      : "0px 2px 12px rgba(3,25,79,0.10)",
                                  transition: "border-color 0.15s, box-shadow 0.15s"
                              })}
                          >
                              {/* ── Custom scene canvas ──────────────────────────────── */}
                              {sceneTypes[selectedScene] === "custom" && (() => {
                                  const els = sceneEls();
                                  const isEmpty = els.length === 0;

                                  // Icon sizes for bullet elements
                                  const icoContainerPx: Record<string, number> = { S: 28, M: 36, L: 44, XL: 56 };
                                  // Button pill sizes
                                  const btnDims: Record<string, { w: number; h: number; fs: number }> = {
                                      S:{ w:80, h:28, fs:11 }, M:{ w:120, h:36, fs:13 }, L:{ w:160, h:44, fs:14 }, XL:{ w:200, h:52, fs:16 }
                                  };
                                  // Generic placeholder tile visual (Heading, Sub heading, Media, Logo, Footnote)
                                  const GenericTile = ({ el, isSelected }: { el: CanvasEl; isSelected: boolean }) => {
                                      const iconSrc: Record<string, string> = {
                                          Heading: "/heading.png", "Sub heading": "/sub heading.png",
                                          Media: "/media.png", Logo: "/logo.png", Button: "/button.png"
                                      };
                                      const src = iconSrc[el.type];
                                      return (
                                          <Box sx={{
                                              display: "flex", alignItems: "center", gap: "8px",
                                              px: "12px", py: "8px", borderRadius: "8px",
                                              borderWidth: 2, borderStyle: "dashed", borderColor: isSelected ? "primary.main" : "rgba(0,83,229,0.3)",
                                              bgcolor: isSelected ? "action.hover" : "rgba(255,255,255,0.85)",
                                              cursor: "grab", userSelect: "none", whiteSpace: "nowrap",
                                              boxShadow: isSelected ? "0 0 0 3px rgba(0,83,229,0.12)" : "none",
                                              transition: "all 0.15s"
                                          }}>
                                              {src
                                                  ? <img src={src} style={{ width: 18, height: 18, objectFit: "contain" }} alt={el.type} />
                                                  : <Typography sx={{ fontSize: 16, lineHeight: 1, color: "text.secondary" }}>*</Typography>
                                              }
                                              <Typography variant="h5" sx={{ fontSize: 13, color: "primary.main" }}>
                                                  {el.type}
                                              </Typography>
                                          </Box>
                                      );
                                  };

                                  return (
                                      <>
                                          {/* ── Clipped scene background (no elements here so nothing clips) ── */}
                                          <Box ref={sceneBoxRef} sx={{ overflow: "hidden", borderRadius: "8px", position: "relative", aspectRatio: "16/9", bgcolor: "background.paper" }}>
                                              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, bgcolor: "#E040FB", zIndex: 1 }} />

                                              {isEmpty && (
                                                  <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                                                      <PlaceholderIcon size={52} />
                                                      <Button variant="contained"
                                                          onClick={e => {
                                                              e.stopPropagation(); setPlaceholderMenuOpen(p => !p); setSelectedElId(null); setEditingElId(null); 
                                                          }}
                                                          sx={{ px: "16px", py: "8px", bgcolor: "primary.main", boxShadow: "0 2px 8px rgba(0,83,229,0.25)" }}
                                                      >Add placeholder</Button>
                                                  </Box>
                                              )}
                                          </Box>

                                          {/* ── Elements overlay — same bounds as scene box, no overflow:hidden ── */}
                                          <Box sx={{ position: "absolute", inset: 0, borderRadius: "8px", overflow: "visible", pointerEvents: "none" }}>
                                              {els.map(el => {
                                                  const isSelected = el.id === selectedElId;
                                                  const isEditing = el.id === editingElId;
                                                  const isBullet = el.type === "Vertical bullet point" || el.type === "Horizontal bullet point";
                                                  const isButton = el.type === "Button";

                                                  // Bullet sizing
                                                  const icoPx = icoContainerPx[el.bulletIconSize ?? "M"];
                                                  const icoInner = icoPx * 0.6;
                                                  const badgePx = Math.max(12, Math.round(icoPx * 0.35));

                                                  return (
                                                      <Box
                                                          key={el.id}
                                                          ref={isSelected ? selectedElRef : undefined}
                                                          sx={{ position: "absolute", left: `${el.x}%`, top: `${el.y}%`, transform: "translate(-50%, -50%)", zIndex: 3, pointerEvents: "auto" }}
                                                          onMouseDown={e => {
                                                              if (isEditing) {
                                                                  return;
                                                              }
                                                              startDrag(e, el.x, el.y, (nx, ny) => updateEl(el.id, { x: nx, y: ny }));
                                                          }}
                                                          onClick={e => {
                                                              e.stopPropagation();
                                                              if (dragInfo.current?.moved) {
                                                                  return;
                                                              }
                                                              setSelectedElId(prev => prev === el.id ? null : el.id);
                                                              setPlaceholderMenuOpen(false);
                                                          }}
                                                      >

                                                          {/* ── Button ─────────────────────────────────── */}
                                                          {isButton && (() => {
                                                              const { w, h, fs } = btnDims[el.buttonSize ?? "L"];
                                                              return (
                                                                  <Box sx={(theme) => ({
                                                                      bgcolor: "primary.main", color: "background.paper", borderRadius: "999px",
                                                                      width: w, height: h,
                                                                      display: "flex", alignItems: "center", justifyContent: "center",
                                                                      fontWeight: 600, fontSize: fs,
                                                                      cursor: "grab", userSelect: "none",
                                                                      border: isSelected ? "2px dashed rgba(255,255,255,0.7)" : "2px solid transparent",
                                                                      boxShadow: isSelected ? `0 0 0 3px rgba(0,83,229,0.35)` : `0 2px 8px rgba(0,83,229,0.30)`,
                                                                      outline: isSelected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                                                      outlineOffset: "2px", transition: "outline 0.15s, box-shadow 0.15s", whiteSpace: "nowrap"
                                                                  })}>Button</Box>
                                                              );
                                                          })()}

                                                          {/* ── Bullet (V or H) ────────────────────────── */}
                                                          {isBullet && (() => {
                                                              const isV = el.type === "Vertical bullet point";
                                                              const imgDir = isV ? "row" : "column";
                                                              const elWidth = el.width ?? 200;
                                                              const elHeight = el.height ?? 80;
                                                              const sceneBoxRect = sceneBoxRef.current?.getBoundingClientRect();
                                                              const physicalWidth = sceneBoxRect ? (elWidth / 100) * sceneBoxRect.width : 200;
                                                              // Auto-size text: reduce font size if text is very long
                                                              const calcTextSize = () => {
                                                                  const textLen = (el.text ?? "Placeholder").length;
                                                                  if (textLen > 40) {
                                                                      return Math.max(11, Math.min(14, 14 - (textLen - 40) * 0.1));
                                                                  }
                                                                  return el.bulletTextSize ?? 14;
                                                              };
                                                              const autoTextFs = calcTextSize();
                                                              return (
                                                                  <Box sx={(theme) => ({
                                                                      display: "flex", flexDirection: isV ? "column" : "row",
                                                                      alignItems: "center", gap: isV ? "10px" : "16px",
                                                                      cursor: isEditing ? "default" : "grab", p: "8px", borderRadius: "8px",
                                                                      outline: isSelected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                                                      outlineOffset: "4px",
                                                                      boxShadow: isSelected ? "0 0 0 4px rgba(0,83,229,0.12)" : "none",
                                                                      transition: "outline 0.15s, box-shadow 0.15s",
                                                                      position: "relative",
                                                                      width: isSelected ? `${physicalWidth}px` : "auto",
                                                                      maxWidth: `${physicalWidth}px`,
                                                                      minWidth: 80
                                                                  })}>

                                                                      {/* image + text */}
                                                                      <Box sx={{ display: "flex", flexDirection: imgDir, alignItems: "center", gap: "10px" }}>
                                                                          <Box sx={{ position: "relative", flexShrink: 0 }}>
                                                                              <Box sx={{ width: icoPx, height: icoPx, bgcolor: "grey.700", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                                  <AddPhotoAlternateOutlinedIcon sx={{ fontSize: icoInner, color: "background.paper" }} />
                                                                              </Box>
                                                                              <Box sx={(theme) => ({ position: "absolute", top: -badgePx * 0.35, right: -badgePx * 0.35, width: badgePx, height: badgePx, borderRadius: "50%", bgcolor: "grey.500", border: `2px solid ${theme.palette.common.white}`, display: "flex", alignItems: "center", justifyContent: "center" })}>
                                                                                  <AddIcon sx={{ fontSize: badgePx * 0.65, color: "background.paper" }} />
                                                                              </Box>
                                                                          </Box>
                                                                          {isEditing ? (
                                                                              <Box component="input" autoFocus value={el.text ?? ""}
                                                                                  onChange={e => updateBulletText(el.id, (e.target as HTMLInputElement).value)}
                                                                                  onBlur={() => setEditingElId(null)}
                                                                                  onKeyDown={e => {
                                                                                      if (e.key === "Enter" || e.key === "Escape") {
                                                                                          setEditingElId(null);
                                                                                      } 
                                                                                  }}
                                                                                  onClick={e => e.stopPropagation()}
                                                                                  sx={(theme) => ({ fontWeight: 600, fontSize: autoTextFs, color: "secondary.main", border: "none", outline: `2px solid ${theme.palette.primary.main}`, borderRadius: "4px", px: "4px", py: "1px", bgcolor: "action.hover", minWidth: 80, width: `${Math.max(80, (el.text?.length ?? 0) * 8)}px` })}
                                                                              />
                                                                          ) : (
                                                                              <Typography
                                                                                  variant="h5"
                                                                                  onDoubleClick={e => {
                                                                                      e.stopPropagation(); setEditingElId(el.id); setSelectedElId(el.id);
                                                                                  }}
                                                                                  sx={{ fontSize: autoTextFs, color: "secondary.main", whiteSpace: "nowrap", userSelect: "none" }}
                                                                              >{el.text ?? "Placeholder"}</Typography>
                                                                          )}
                                                                      </Box>
                                                                      {/* Resize handle — only show when selected */}
                                                                      {isSelected && (
                                                                          <Box
                                                                              onMouseDown={(e) => startResize(e, elWidth, elHeight, (w, h) => updateEl(el.id, { width: w, height: h }))}
                                                                              sx={(theme) => ({
                                                                                  position: "absolute", bottom: -6, right: -6,
                                                                                  width: 12, height: 12, borderRadius: "50%",
                                                                                  bgcolor: "primary.main", cursor: "se-resize",
                                                                                  border: `2px solid ${theme.palette.common.white}`, boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                                                                                  "&:hover": { boxShadow: `0 0 0 2px ${theme.palette.primary.main}` }
                                                                              })}
                                                                          />
                                                                      )}
                                                                  </Box>
                                                              );
                                                          })()}

                                                          {/* ── Generic (Heading, Sub heading, Media, Logo, Footnote) ── */}
                                                          {!isButton && !isBullet && <GenericTile el={el} isSelected={isSelected} />}
                                                      </Box>
                                                  );
                                              })}
                                          </Box>

                                          {/* ── Portal toolbar — rendered into document.body, immune to all overflow:hidden ── */}
                                          {selectedEl && selectedElRef.current && createPortal((() => {
                                              const elRect = selectedElRef.current!.getBoundingClientRect();
                                              const isBullet = selectedEl.type === "Vertical bullet point" || selectedEl.type === "Horizontal bullet point";
                                              const isButton = selectedEl.type === "Button";
                                              return (
                                                  <Box
                                                      onMouseDown={e => e.stopPropagation()}
                                                      onClick={e => e.stopPropagation()}
                                                      sx={{
                                                          position: "fixed",
                                                          left: elRect.left + elRect.width / 2,
                                                          top: elRect.top - 10,
                                                          transform: "translate(-50%, -100%)",
                                                          zIndex: 9999,
                                                          whiteSpace: "nowrap"
                                                      }}
                                                  >
                                                      {isButton && (
                                                          <ButtonPlaceholderToolbar
                                                              size={selectedEl.buttonSize ?? "L"}
                                                              onSizeChange={sz => updateEl(selectedEl.id, { buttonSize: sz })}
                                                              onDelete={() => deleteEl(selectedEl.id)}
                                                          />
                                                      )}
                                                      {isBullet && (
                                                          <BulletPlaceholderToolbar
                                                              iconSize={selectedEl.bulletIconSize ?? "M"}
                                                              onIconSizeChange={sz => updateEl(selectedEl.id, { bulletIconSize: sz })}
                                                              onDelete={() => deleteEl(selectedEl.id)}
                                                              onEditClick={() => {
                                                                  setEditBulletOpen(true);
                                                              }}
                                                              onOptionsMenuClick={(anchorEl) => setBulletMenuAnchor(anchorEl)}
                                                          />
                                                      )}
                                                      {!isButton && !isBullet && (
                                                          <PlaceholderToolbar onEditClick={() => {}} onDelete={() => deleteEl(selectedEl.id)} />
                                                      )}
                                                  </Box>
                                              );
                                          })(), document.body)}
                                          {/* Bullet options menu */}
                                          <Menu
                                              open={!!bulletMenuAnchor}
                                              anchorEl={bulletMenuAnchor}
                                              onClose={() => setBulletMenuAnchor(null)}
                                              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                              transformOrigin={{ vertical: "top", horizontal: "right" }}
                                          >
                                              <MenuItem onClick={() => {
                                                  // TODO: Implement change order logic (move up/down in list)
                                                  setBulletMenuAnchor(null);
                                              }}>
                      Change order
                                              </MenuItem>
                                              <MenuItem onClick={() => {
                                                  if (selectedEl && (selectedEl.type === "Vertical bullet point" || selectedEl.type === "Horizontal bullet point")) {
                                                      const duplicated: CanvasEl = {
                                                          ...selectedEl,
                                                          id: `el-${Date.now()}`,
                                                          text: selectedEl.text ? `${selectedEl.text} (copy)` : "Placeholder"
                                                      };
                                                      setSceneElements(prev => ({
                                                          ...prev,
                                                          [selectedScene]: [...(prev[selectedScene] ?? []), duplicated]
                                                      }));
                                                      setSelectedElId(duplicated.id);
                                                  }
                                                  setBulletMenuAnchor(null);
                                              }}>
                      Duplicate
                                              </MenuItem>
                                          </Menu>
                                      </>
                                  );
                              })()}
                              {/* Image + overlays clipped to canvas shape — regular scenes only */}
                              {sceneTypes[selectedScene] !== "custom" && <Box sx={{ overflow: "hidden", borderRadius: "8px", position: "relative" }}>
                                  <Box component="img" src={IMG_THUMB} alt={videoTitle}
                                      sx={{ width: "100%", display: "block" }} />

                                  {/* Cover left half of SVG — white bg + pink accent line */}
                                  <Box sx={{ position: "absolute", inset: 0, width: "50%", bgcolor: "background.paper", pointerEvents: "none" }}>
                                      <Box sx={{ height: 5, bgcolor: "#C084FC", width: "100%" }} />
                                  </Box>

                                  {/* Right side — drag media area */}
                                  <Box sx={{
                                      position: "absolute", top: 0, right: 0, bottom: 0, width: "50%",
                                      background: "repeating-linear-gradient(-45deg, #EBEBEF 0px, #EBEBEF 12px, #E2E2E7 12px, #E2E2E7 24px)",
                                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                      gap: "8px", pointerEvents: "none"
                                  }}>
                                      <Box sx={{ position: "relative", display: "inline-flex" }}>
                                          <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 52, color: "action.disabled" }} />
                                      </Box>
                                      <Typography variant="caption" sx={{ fontSize: 13, color: "action.disabled", letterSpacing: "0.15px" }}>
                    Drag media here
                                      </Typography>
                                  </Box>

                                  {/* Heading + sub-heading — flowing column, scene 0 = video title, others = derived content */}
                                  {(() => {
                                      const derived = sceneContentFor(videoTitle);
                                      const sceneHeadings = [
                                          { h: headingText, s: subheadingText },
                                          { h: derived[0][0], s: derived[0][1] },
                                          { h: derived[1][0], s: derived[1][1] },
                                          { h: derived[2][0], s: derived[2][1] }
                                      ];
                                      const scene = sceneHeadings[selectedScene] ?? sceneHeadings[0];
                                      return (
                                          <Box sx={{
                                              position: "absolute", left: "4%", top: "20%", width: "44%",
                                              containerType: "inline-size", display: "flex", flexDirection: "column"
                                          }}>
                                              <Box
                                                  onClick={e => {
                                                      e.stopPropagation(); setHeadingSelected(p => !p); setSubheadingSelected(false); setFootnoteSelected(false); 
                                                  }}
                                                  sx={(theme) => ({
                                                      cursor: "pointer", borderRadius: "4px", px: "2px",
                                                      border: headingSelected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                                      bgcolor: headingSelected ? "action.hover" : "transparent",
                                                      "&:hover": { border: `2px solid ${theme.palette.primary.main}`, bgcolor: "action.hover" },
                                                      pointerEvents: selectedScene === 0 ? "auto" : "none"
                                                  })}
                                              >
                                                  <Typography sx={{ fontFamily: "\"Inter\", sans-serif", fontWeight: 700, fontSize: "10cqw", color: "secondary.main", lineHeight: 1.2, wordBreak: "break-word" }}>
                                                      {scene.h}
                                                  </Typography>
                                              </Box>
                                              <Box
                                                  onClick={e => {
                                                      e.stopPropagation(); setSubheadingSelected(p => !p); setHeadingSelected(false); setFootnoteSelected(false); 
                                                  }}
                                                  sx={(theme) => ({
                                                      cursor: "pointer", borderRadius: "4px", px: "2px", mt: "4%",
                                                      border: subheadingSelected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                                      bgcolor: subheadingSelected ? "action.hover" : "transparent",
                                                      "&:hover": { border: `2px solid ${theme.palette.primary.main}`, bgcolor: "action.hover" },
                                                      pointerEvents: selectedScene === 0 ? "auto" : "none"
                                                  })}
                                              >
                                                  <Typography sx={{ fontFamily: "\"Inter\", sans-serif", fontWeight: 400, fontSize: "4.5cqw", color: "text.primary", lineHeight: 1.4, wordBreak: "break-word" }}>
                                                      {scene.s}
                                                  </Typography>
                                              </Box>
                                          </Box>
                                      );
                                  })()}

                                  {/* Footnote — bottom-left, all scenes */}
                                  <Box
                                      onClick={e => {
                                          e.stopPropagation(); setFootnoteSelected(p => !p); setHeadingSelected(false); setSubheadingSelected(false); 
                                      }}
                                      sx={(theme) => ({
                                          position: "absolute", left: "4%", width: "44%", bottom: "5%",
                                          cursor: "pointer", borderRadius: "4px", px: "4px", py: "2px",
                                          border: footnoteSelected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                          bgcolor: footnoteSelected ? "action.hover" : "transparent",
                                          "&:hover": { border: `2px solid ${theme.palette.primary.main}`, bgcolor: "action.hover" },
                                          containerType: "inline-size"
                                      })}
                                  >
                                      <Typography sx={{ fontFamily: "\"Open Sans\", sans-serif", fontWeight: 400, fontSize: "2.5cqw", letterSpacing: "0.4px", color: "text.secondary", lineHeight: 1.66 }}>
                                          {footnoteText}
                                      </Typography>
                                  </Box>
                              </Box>}

                              {/* Toolbars — outside overflow:hidden so they render above the canvas edge */}
                              {sceneTypes[selectedScene] !== "custom" && headingSelected && (
                                  <Box sx={{ position: "absolute", left: "25%", top: "30%", transform: "translate(-50%, -100%)", mb: "4px", zIndex: 20, pointerEvents: "auto" }}>
                                      <PlaceholderToolbar onEditClick={() => {
                                          onEditAttempt ? onEditAttempt() : setEditHeadingOpen(true); 
                                      }} />
                                  </Box>
                              )}
                              {sceneTypes[selectedScene] !== "custom" && subheadingSelected && (
                                  <Box sx={{ position: "absolute", left: "25%", top: "55%", transform: "translate(-50%, -100%)", mb: "4px", zIndex: 20, pointerEvents: "auto" }}>
                                      <PlaceholderToolbar onEditClick={() => {
                                          onEditAttempt ? onEditAttempt() : setEditSubheadingOpen(true); 
                                      }} />
                                  </Box>
                              )}
                              {sceneTypes[selectedScene] !== "custom" && footnoteSelected && (
                                  <Box sx={{ position: "absolute", left: "50%", bottom: "3%", transform: "translate(-50%, -100%)", mb: "4px", zIndex: 20, pointerEvents: "auto" }}>
                                      <PlaceholderToolbar onEditClick={() => {
                                          onEditAttempt ? onEditAttempt() : setEditFootnoteOpen(true); 
                                      }} />
                                  </Box>
                              )}
                          </Box>

                          {/* Right column: scene action toolbar + next arrow — sibling of canvas in stretch group */}
                          <Box sx={{ width: 32, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>

                              {/* Scene action toolbar — white pill card, top-aligned */}
                              <Box sx={{
                                  width: 32,
                                  bgcolor: "background.paper",
                                  borderWidth: 1, borderStyle: "solid", borderColor: "divider",
                                  borderRadius: "24px",
                                  display: "flex", flexDirection: "column",
                                  alignItems: "center", gap: "8px",
                                  p: "4px"
                              }}>
                                  {/* 1. Layout / grid */}
                                  <Tooltip title="Layout" placement="left" arrow>
                                      <IconButton size="small" onClick={e => e.stopPropagation()}
                                          sx={{ p: "3px", color: "primary.main", borderRadius: "6px", "&:hover": { bgcolor: "action.hover" } }}>
                                          <GridViewOutlinedIcon sx={{ fontSize: 18 }} />
                                      </IconButton>
                                  </Tooltip>

                                  {/* 2. Theme / palette */}
                                  <Tooltip title="Theme" placement="left" arrow>
                                      <IconButton size="small" onClick={e => e.stopPropagation()}
                                          sx={{ p: "3px", color: "primary.main", borderRadius: "6px", "&:hover": { bgcolor: "action.hover" } }}>
                                          <PaletteOutlinedIcon sx={{ fontSize: 18 }} />
                                      </IconButton>
                                  </Tooltip>

                                  {/* 3. Add placeholder — active only on custom scenes */}
                                  <Tooltip title={sceneTypes[selectedScene] === "custom" ? "Add placeholder" : ""} placement="left" arrow>
                                      <span>
                                          <IconButton
                                              size="small"
                                              disabled={sceneTypes[selectedScene] !== "custom"}
                                              onClick={e => {
                                                  e.stopPropagation(); setPlaceholderMenuOpen(p => !p); 
                                              }}
                                              sx={{
                                                  p: "3px", borderRadius: "6px",
                                                  bgcolor: placeholderMenuOpen && sceneTypes[selectedScene] === "custom" ? "primary.main" : "transparent",
                                                  color:   placeholderMenuOpen && sceneTypes[selectedScene] === "custom" ? "common.white" : undefined,
                                                  "&:hover": { bgcolor: "action.hover" },
                                                  "&.Mui-disabled": { opacity: 0.3 }
                                              }}
                                          >
                                              <PlaceholderIcon size={18} color={placeholderMenuOpen && sceneTypes[selectedScene] === "custom" ? "#fff" : undefined} />
                                          </IconButton>
                                      </span>
                                  </Tooltip>

                                  {/* 4. Info */}
                                  <Tooltip title="Info" placement="left" arrow>
                                      <IconButton size="small" onClick={e => e.stopPropagation()}
                                          sx={{ p: "3px", color: "primary.main", borderRadius: "6px", "&:hover": { bgcolor: "action.hover" } }}>
                                          <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                                      </IconButton>
                                  </Tooltip>

                                  {/* 5. More */}
                                  <Tooltip title="More" placement="left" arrow>
                                      <IconButton size="small" onClick={e => e.stopPropagation()}
                                          sx={{ p: "3px", color: "primary.main", borderRadius: "6px", "&:hover": { bgcolor: "action.hover" } }}>
                                          <MoreHorizIcon sx={{ fontSize: 18 }} />
                                      </IconButton>
                                  </Tooltip>
                              </Box>

                              {/* Next arrow — pushed to bottom by justify-content: space-between */}
                              <IconButton
                                  disabled={selectedScene === SCENE_COUNT - 1 || isToolbarActive}
                                  onClick={() => goToScene(selectedScene + 1)}
                                  size="small"
                                  sx={{ color: (selectedScene === SCENE_COUNT - 1 || isToolbarActive) ? "action.disabled" : "primary.main", p: "3px" }}
                              >
                                  <ChevronRightIcon />
                              </IconButton>
                          </Box>

                      </Box>{/* end canvas + toolbar group */}
                  </Box>

                  {/* Narration bar */}
                  <Box sx={{
                      mx: 3, mb: 1.5, height: 40, bgcolor: "background.paper",
                      borderWidth: 1, borderStyle: "solid", borderColor: "divider", borderRadius: "20px",
                      display: "flex", alignItems: "center", px: 2, gap: 1.5, flexShrink: 0
                  }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: "other.editorBackground" }}>
                          <MicOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                      </Avatar>
                      <Typography sx={{
                          color: "text.secondary", flex: 1
                      }}>
              Add narration…
                      </Typography>
                      <Typography sx={{
                          color: "text.secondary", letterSpacing: "0.4px"
                      }}>
              ~0:12
                      </Typography>
                  </Box>

                  {/* Scene lineup — dims when toolbar is active */}
                  <Box sx={{
                      bgcolor: "background.paper", borderTop: 1, borderTopStyle: "solid", borderTopColor: "divider",
                      px: 2, pt: 1.5, pb: 1.5, flexShrink: 0,
                      position: "relative"
                  }}>
                      {/* Play bar */}
                      <Box sx={{
                          display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5,
                          opacity: isToolbarActive ? 0.38 : 1,
                          pointerEvents: isToolbarActive ? "none" : "auto",
                          transition: "opacity 0.2s"
                      }}>
                          <Box sx={{
                              width: 40, height: 40, borderRadius: "50%",
                              bgcolor: "other.editorBackground",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer"
                          }}>
                              <PlayArrowIcon sx={{ fontSize: 22, color: "primary.main" }} />
                          </Box>
                          <Typography variant="caption" sx={{
                              color: "#8BA2FF", letterSpacing: "0.4px", ml: 1.5
                          }}>
                Scene {selectedScene + 1} / {SCENE_COUNT}
                          </Typography>
                      </Box>

                      {/* Thumbnails row — disabled + dimmed when a toolbar/panel is active */}
                      <Box sx={{ position: "relative" }}>
                          <Box sx={{
                              display: "flex", gap: "8px", overflowX: "auto", pb: 0.5,
                              "&::-webkit-scrollbar": { height: 4 },
                              "&::-webkit-scrollbar-thumb": { bgcolor: "#8BA2FF", borderRadius: 2 },
                              opacity: isToolbarActive ? 0.38 : 1,
                              pointerEvents: isToolbarActive ? "none" : "auto",
                              transition: "opacity 0.2s",
                              userSelect: isToolbarActive ? "none" : "auto"
                          }}>
                              {sceneTypes.map((type, i) =>
                                  type === "custom"
                                      ? <CustomSceneThumbnail key={i} index={i} selected={i === selectedScene} onClick={() => goToScene(i)} />
                                      : <SceneThumbnail key={i} index={i} selected={i === selectedScene}
                                          headingText={i === 0 ? headingText : (sceneContentFor(videoTitle)[i - 1]?.[0] ?? "Scene " + (i + 1))}
                                          subheadingText={i === 0 ? subheadingText : (sceneContentFor(videoTitle)[i - 1]?.[1] ?? "")}
                                          footnoteText={footnoteText} onClick={() => goToScene(i)} />
                              )}
                              {/* Add scene */}
                              <Box sx={{
                                  width: 56, flexShrink: 0,
                                  display: "flex", alignItems: "center", justifyContent: "center"
                              }}>
                                  <Box
                                      onClick={() => {
                                          setSceneLibOpen(true); setPlaceholderMenuOpen(false); setSelectedElId(null); 
                                      }}
                                      sx={{
                                          width: 32, height: 32, borderRadius: "50%",
                                          bgcolor: "other.editorBackground",
                                          display: "flex", alignItems: "center", justifyContent: "center",
                                          borderWidth: "1.5px", borderStyle: "dashed", borderColor: "primary.main",
                                          cursor: "pointer",
                                          "&:hover": { bgcolor: "action.hover" }
                                      }}>
                                      <AddIcon sx={{ fontSize: 18, color: "primary.main" }} />
                                  </Box>
                              </Box>
                          </Box>
                      </Box>
                  </Box>
              </Box>
          </Box>

          {/* ── Edit Heading dialog ───────────────────────────────────────────── */}
          <EditHeadingDialog
              open={editHeadingOpen}
              title="Heading"
              currentText={headingText}
              onClose={(newText) => {
                  setHeadingText(newText); setEditHeadingOpen(false); onHeadingChange?.(newText); 
              }}
          />
          <EditHeadingDialog
              open={editSubheadingOpen}
              title="Sub-heading"
              currentText={subheadingText}
              onClose={(newText) => {
                  setSubheadingText(newText); setEditSubheadingOpen(false); onSubheadingChange?.(newText); 
              }}
          />
          <EditHeadingDialog
              open={editFootnoteOpen}
              title="Footnote"
              currentText={footnoteText}
              onClose={(newText) => {
                  setFootnoteText(newText); setEditFootnoteOpen(false); 
              }}
          />

          {/* ── Edit Bullet Point dialog ──────────────────────────────────────── */}
          {selectedEl && (selectedEl.type === "Vertical bullet point" || selectedEl.type === "Horizontal bullet point") && (
              <EditBulletDialog
                  open={editBulletOpen}
                  currentText={selectedEl.text ?? "Placeholder"}
                  bulletIconSize={selectedEl.bulletIconSize ?? "M"}
                  onClose={(newText) => {
                      updateBulletText(selectedEl.id, newText);
                      setEditBulletOpen(false);
                  }}
              />
          )}

          {/* ── Scene Library dialog ──────────────────────────────────────────── */}
          <SceneLibraryDialog
              open={sceneLibOpen}
              onClose={() => setSceneLibOpen(false)}
              onAddScene={(templateId) => {
                  const type = templateId === "custom" ? "custom" : "regular";
                  setSceneTypes(prev => {
                      const next: ("regular" | "custom")[] = [...prev, type]; setSelectedScene(next.length - 1); return next; 
                  });
                  setSceneLibOpen(false);
              }}
          />

          {/* ── Comments panel — draggable + resizable ────────────────────────── */}
          <CommentsPanel
              open={commentsOpen}
              onClose={() => setCommentsOpen(false)}
              threads={threads}
              setThreads={setThreads}
              approverNames={approverNames}
              awaitingApprovers={awaitingApprovers}
              onRequestApproval={() => {
                  setSnackbarMsg(`Version sent for additional approval by ${approverNames}`);
                  onRequestReapproval();
                  setCommentsOpen(false);
              }}
          />


          {/* ── Success snackbar ───────────────────────────────────────────────── */}
          {/* ── Video permission dialog ─────────────────────────────────────── */}
          <VideoPermissionDialog
              open={videoPermOpen}
              onClose={() => setVideoPermOpen(false)}
              initialSettings={videoPermSettings}
              onSave={s => {
                  setVideoPermSettings(s); onPermChange?.(s); setVideoPermOpen(false); 
              }}
          />

          <Snackbar
              open={!!snackbarMsg}
              autoHideDuration={5000}
              onClose={() => setSnackbarMsg(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
              <Alert
                  severity="success"
                  onClose={() => setSnackbarMsg(null)}
                  sx={{ width: "100%" }}
              >
                  {snackbarMsg}
              </Alert>
          </Snackbar>
      </Box>
  );
}
