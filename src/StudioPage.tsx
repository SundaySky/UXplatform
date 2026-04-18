import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { SxProps, Theme } from "@mui/material";
import {
    AppBar, Box, Typography, IconButton, Button,
    Badge, Dialog, DialogContent,
    TextField, Snackbar, Alert, Divider, Switch, Menu, MenuItem,
    SvgIcon, Toolbar, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader,
    useTheme
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTurnLeft, faArrowTurnRight, faLock, faPalette, faCircleUser, faPhotoFilm, faMusic, faMicrophone, faDatabase, faInputText, faCropSimple, faLanguage, faComment, faPen, faEye, faAlignLeft, faCopy, faPaintbrush, faAlarmClock, faTrash, faEllipsisH, faCircleInfo, faTableLayout, faEllipsisVertical, faPlus, faT, faEraser, faCircleQuestion, faListUl, faTableColumns, faXmark, faImage, faChevronDown } from "@fortawesome/pro-regular-svg-icons";
import { faChevronLeft, faChevronRight, faPlay, faCloudCheck } from "@fortawesome/pro-solid-svg-icons";
import { TruffleAvatar, TruffleDialogTitle, TruffleDialogActions, ThumbnailActions, ThumbnailActionsIconButton } from "@sundaysky/smartvideo-hub-truffle-component-library";
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
                <Typography variant="caption" sx={{ color: "primary.main", whiteSpace: "nowrap", lineHeight: 1 }}>
                    {label}
                </Typography>
            )}
        </Box>
    );

    return (
        <Box
            onMouseDown={e => e.stopPropagation()}
            sx={placeholderToolbarWrapperSx}
        >
            <Pill icon={<SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faPen} /></SvgIcon>} label="Edit" onClick={onEditClick} />

            {/* Zoom — single bordered box */}
            <Box sx={pillZoomBoxSx}>
                <Box sx={pillZoomClickableSx}>
                    <SvgIcon sx={{ fontSize: 12 }}><FontAwesomeIcon icon={faEraser} /></SvgIcon>
                </Box>
                <Typography variant="caption" sx={{ color: "primary.main", mx: "3px", minWidth: 28, textAlign: "center" }}>
          100%
                </Typography>
                <Box sx={pillZoomClickableSx}>
                    <SvgIcon sx={{ fontSize: 12 }}><FontAwesomeIcon icon={faPlus} /></SvgIcon>
                </Box>
            </Box>

            <Pill icon={<SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faT} /></SvgIcon>} label="Style" />
            <Pill icon={<SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faAlignLeft} /></SvgIcon>} label="Align" />
            <Pill icon={<SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faPaintbrush} /></SvgIcon>} label="Color" />
            <Pill icon={<SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faAlarmClock} /></SvgIcon>} label="Timing" />
            <Pill icon={<SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faCopy} /></SvgIcon>} label="Copy" />
            <Pill icon={<SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faEye} /></SvgIcon>} />
            <Pill icon={<SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faEllipsisH} /></SvgIcon>} />
            {onDelete && (
                <Pill icon={<SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faTrash} /></SvgIcon>} onClick={onDelete} />
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
            sx={buttonToolbarWrapperSx}
        >
            {/* Edit */}
            <ActionBtn icon={<SvgIcon sx={{ fontSize: 13, color: "primary.main" }}><FontAwesomeIcon icon={faPen} /></SvgIcon>} label="Edit" />

            <Divider orientation="vertical" flexItem sx={toolbarDividerSx} />

            {/* Size label + S / M / L / XL toggle */}
            <Box sx={sizeLabelGroupSx}>
                <Typography variant="caption" sx={sizeLabelTypographySx}>
          Size
                </Typography>
                <Box sx={sizeToggleGroupSx}>
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

            <Divider orientation="vertical" flexItem sx={toolbarDividerSx} />

            {/* Timing (disabled) */}
            <ActionBtn
                icon={<SvgIcon sx={{ fontSize: 13, color: "text.disabled" }}><FontAwesomeIcon icon={faAlarmClock} /></SvgIcon>}
                label="Timing"
                disabled
            />

            <Divider orientation="vertical" flexItem sx={toolbarDividerSx} />

            {/* Copy */}
            <ActionBtn icon={<SvgIcon sx={{ fontSize: 13, color: "primary.main" }}><FontAwesomeIcon icon={faCopy} /></SvgIcon>} label="Copy" />

            {/* Delete */}
            <IconButton size="small" onClick={onDelete} sx={toolbarDeleteBtnSx}>
                <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faTrash} /></SvgIcon>
            </IconButton>

            {/* More */}
            <IconButton size="small" sx={toolbarMoreBtnSx}>
                <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faEllipsisH} /></SvgIcon>
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
        <Box sx={dropdownBtnSx}>
            <Typography variant="h6" sx={{ color: "primary.main", lineHeight: 1.5 }}>
                {label}
            </Typography>
            <SvgIcon sx={{ fontSize: 16, color: "primary.main" }}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>
        </Box>
    );

    return (
        <Box
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            sx={buttonToolbarWrapperSx}
        >
            {/* Edit */}
            <ActionBtn icon={<SvgIcon sx={{ fontSize: 13, color: "primary.main" }}><FontAwesomeIcon icon={faPen} /></SvgIcon>} label="Edit" onClick={onEditClick} />

            <Divider orientation="vertical" flexItem sx={toolbarDividerSx} />

            {/* Icon size label + S / M / L / XL toggle */}
            <Box sx={sizeLabelGroupSx}>
                <Typography variant="caption" sx={sizeLabelTypographySx}>
          Icon size
                </Typography>
                <Box sx={sizeToggleGroupSx}>
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

            <Divider orientation="vertical" flexItem sx={toolbarDividerSx} />

            {/* Bullet formatting dropdown */}
            <DropdownBtn label="Bullet formatting" />

            {/* Text formatting dropdown */}
            <DropdownBtn label="Text formatting" />

            <Divider orientation="vertical" flexItem sx={toolbarDividerSx} />

            {/* Timing (enabled, blue star) */}
            <ActionBtn icon={<SvgIcon sx={{ fontSize: 13, color: "primary.main" }}><FontAwesomeIcon icon={faAlarmClock} /></SvgIcon>} label="Timing" />

            <Divider orientation="vertical" flexItem sx={toolbarDividerSx} />

            {/* Delete */}
            <IconButton size="small" onClick={onDelete} sx={toolbarDeleteBtnSx}>
                <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faTrash} /></SvgIcon>
            </IconButton>

            {/* More */}
            <IconButton size="small" onClick={(e) => onOptionsMenuClick?.(e.currentTarget)} sx={toolbarMoreBtnSx}>
                <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faEllipsisH} /></SvgIcon>
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
                sx: editHeadingDialogPaperSx
            }}
        >
            {/* Header */}
            <Box sx={dialogHeaderRowSx}>
                <Typography variant="h2" sx={{ color: "text.primary" }}>
                    {title ?? "Heading"}
                </Typography>
                <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
                    <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
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
                        <SvgIcon sx={{ fontSize: 16, color: "text.secondary", cursor: "default" }}><FontAwesomeIcon icon={faCircleQuestion} /></SvgIcon>
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
                    <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
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
                            <SvgIcon sx={{ fontSize: 16, color: "text.secondary", cursor: "default" }}><FontAwesomeIcon icon={faCircleQuestion} /></SvgIcon>
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

const IMG_THUMB = "/thumb.svg";


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

// ─── Past comments (history tab) ──────────────────────────────────────────────
interface PastComment { author: string; date: string; text: string }

const PAST_COMMENTS: PastComment[] = [
    { author: "Sarah Johnson", date: "March 2, 2026", text: "Opening scene — please add the company name to the title card and consider a more corporate tone." },
    { author: "Emma Rodriguez", date: "February 24, 2026", text: "Closing scene — a legal disclaimer is required on this screen per compliance review." },
    { author: "Manager", date: "February 12, 2026", text: "Please add a new scene with three bullet points outlining key aspects of the delivery policy." }
];

const DEFAULT_CURRENT_COMMENT: PastComment = {
    author: "Sarah Johnson",
    date: "April 17, 2026",
    text: "The pacing in the middle section feels rushed — can we give viewers more time to absorb the key points before transitioning to the CTA?"
};

// ─── Re-submit warning dialog ─────────────────────────────────────────────────
function UnresolvedWarningDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
    const [explanation, setExplanation] = useState("");
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ zIndex: 1500 }}>
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: onClose }}>
                Re-submit for approval
            </TruffleDialogTitle>
            <DialogContent sx={{ pt: "8px !important" }}>
                <Typography variant="body1" sx={{ color: "text.primary", mb: 2 }}>
          Your video will be sent back to approvers for another review.
                </Typography>
                <Typography sx={{
                    lineHeight: 1.5, color: "text.primary", mb: 1
                }}>
          Describe the changes you made in response to the comments
                </Typography>
                <TextField
                    fullWidth multiline rows={3}
                    placeholder="Describe your changes"
                    value={explanation}
                    onChange={e => setExplanation(e.target.value)}
                    variant="outlined" size="medium"
                    InputProps={{ sx: { letterSpacing: "0.15px" } }}
                />
            </DialogContent>
            <TruffleDialogActions>
                <Button variant="outlined" color="primary" size="large" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="primary" size="large" onClick={onConfirm}>
                    Re-submit
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Comment block (shared by History tab and creator-mode Unresolved tab) ────
function CommentBlock({ comment }: { comment: PastComment }) {
    return (
        <Box>
            <Typography variant="h5" sx={{ color: "text.primary", mb: "4px" }}>
                {comment.author} · {comment.date}
            </Typography>
            <Typography variant="body1" sx={{ color: "text.primary", lineHeight: 1.5 }}>
                {comment.text}
            </Typography>
        </Box>
    );
}

// ─── Comments panel ────────────────────────────────────────────────────────────
function CommentsPanel({
    open, onClose, onRequestApproval, awaitingApprovers
}: {
  open: boolean
  onClose: () => void
  onRequestApproval: () => void
  awaitingApprovers?: boolean
}) {
    const [pos, setPos] = useState({ x: 0, y: 80 });
    const [tab, setTab] = useState<"unresolved" | "completed">("unresolved");
    const [warningOpen, setWarningOpen] = useState(false);
    const [panelMode, setPanelMode] = useState<"commenting" | "responding">("commenting");
    const [draftComment, setDraftComment] = useState("");
    const dragging = useRef(false);
    const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

    // Position on open
    useEffect(() => {
        if (open) {
            setPos({ x: Math.max(0, window.innerWidth - 330 - 266), y: 80 });
        }
    }, [open]);

    // Creator sees the current comment to address — carries over any draft typed in commenting mode
    const currentComment: PastComment = draftComment.trim()
        ? { author: DEFAULT_CURRENT_COMMENT.author, date: DEFAULT_CURRENT_COMMENT.date, text: draftComment }
        : DEFAULT_CURRENT_COMMENT;

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

    const handleRequestApproval = () => {
        setWarningOpen(true);
    };

    if (!open) {
        return null;
    }

    return (
        <>
            <Box sx={(theme) => ({
                position: "fixed", left: pos.x, top: pos.y,
                width: 292, minWidth: 260,
                bgcolor: "background.paper", borderRadius: "8px",
                boxShadow: `0px 0px 5px 0px ${alpha(theme.palette.secondary.main, 0.25)}`,
                zIndex: 1300,
                display: "flex", flexDirection: "column",
                resize: "both", overflow: "hidden"
            })}>

                {/* ── Header (drag to move) ─────────────────────────────────────── */}
                <Box onMouseDown={onHeaderMouseDown} sx={commentsPanelHeaderSx}>
                    <Typography variant="subtitle2" sx={{ color: "text.primary" }}>
            Comments
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Switch
                            size="small"
                            checked={panelMode === "responding"}
                            onChange={e => setPanelMode(e.target.checked ? "responding" : "commenting")}
                            onMouseDown={e => e.stopPropagation()}
                        />
                        <IconButton
                            size="small"
                            onClick={onClose}
                            sx={{ color: "text.primary", p: "8px", borderRadius: "8px" }}
                        >
                            <SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                        </IconButton>
                    </Box>
                </Box>

                {/* ── Toggle tab selector (ToggleButtonGroup pill style) ────────── */}
                <Box sx={commentsTabAreaSx}>
                    <Box sx={commentsTabGroupSx}>
                        {[
                            { key: "unresolved", label: "Unresolved" },
                            { key: "completed", label: "History" }
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
                                <Typography variant="body1" sx={{
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

                {/* ── Awaiting all approvers state ──────────────────────────────── */}
                {awaitingApprovers && tab === "unresolved" && (
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: 3 }}>
                        <Typography variant="body1" sx={{
                            color: "text.primary", textAlign: "center"
                        }}>
              1 of 2 approvers responded<br />
              Comments will appear here once all approvers have responded.
                        </Typography>
                    </Box>
                )}

                {/* ── Body content — varies by tab + mode ───────────────────────── */}
                <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: "12px", display: "flex", flexDirection: "column", gap: "16px", ...(awaitingApprovers && tab === "unresolved" ? { display: "none" } : {}) }}>
                    {tab === "unresolved" ? (
                        panelMode === "commenting" ? (
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Add a comment"
                                value={draftComment}
                                onChange={e => setDraftComment(e.target.value)}
                                variant="outlined"
                                size="medium"
                            />
                        ) : (
                            <CommentBlock comment={currentComment} />
                        )
                    ) : (
                        PAST_COMMENTS.map((c, i) => (
                            <CommentBlock key={i} comment={c} />
                        ))
                    )}
                </Box>

                {/* ── Footer ────────────────────────────────────────────────────── */}
                {panelMode === "commenting" ? (
                    <Box sx={commentsCommentingFooterSx}>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="medium"
                            disabled={!draftComment.trim()}
                        >
              Ask for changes
                        </Button>
                        <Button variant="outlined" color="primary" size="medium">
              Approved
                        </Button>
                    </Box>
                ) : (
                    <Box sx={commentsPanelFooterSx}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="medium"
                            onClick={handleRequestApproval}
                        >
              Re-submit
                        </Button>
                    </Box>
                )}
            </Box>

            {/* ── Re-submit warning dialog ──────────────────────────────────────── */}
            <UnresolvedWarningDialog
                open={warningOpen}
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
        <ThumbnailActions
            selected={selected}
            showActions="onHover"
            onClick={onClick}
            label={<Typography variant="caption" sx={sceneThumbnailLabelSx}>Scene {index + 1}</Typography>}
            rightActions={
                <ThumbnailActionsIconButton size="small">
                    <SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                </ThumbnailActionsIconButton>
            }
            sx={sceneThumbnailOuterSx}
            ContentProps={{ sx: sceneThumbnailContentSx }}
        >
            <Box component="img" src={IMG_THUMB} alt="" sx={sceneThumbnailImgSx} />

            {/* Cover left half of SVG — white bg + pink accent line */}
            <Box sx={thumbLeftCoverSx}>
                {/* Prototype-only scene accent — no real-app theme token */}
                <Box sx={{ height: 3, bgcolor: "#C084FC", width: "100%" }} />
            </Box>

            {/* Right side — drag media */}
            <Box sx={thumbRightDragAreaSmSx}>
                <SvgIcon sx={{ fontSize: 22, color: "action.disabled" }}><FontAwesomeIcon icon={faImage} /></SvgIcon>
                <Typography variant="caption" sx={{ fontSize: 7, color: "action.disabled" }}>
            Drag media here
                </Typography>
            </Box>

            {/* Heading + sub-heading — flowing column */}
            <Box sx={thumbHeadingColumnSx}>
                <Typography sx={{ fontFamily: "\"Inter\", sans-serif", fontWeight: 700, fontSize: "9cqw", color: "secondary.main", lineHeight: 1.2, wordBreak: "break-word" }}>
                    {headingText ?? ""}
                </Typography>
                <Typography sx={{ fontFamily: "\"Inter\", sans-serif", fontWeight: 400, fontSize: "4cqw", color: "text.primary", lineHeight: 1.4, wordBreak: "break-word", mt: "5%" }}>
                    {subheadingText ?? "Sub-heading Placeholder"}
                </Typography>
            </Box>

            {/* Footnote */}
            <Box sx={thumbFootnoteBoxSx}>
                <Typography sx={thumbFootnoteTypographySx}>
                    {footnoteText ?? "Footnote placeholder"}
                </Typography>
            </Box>
        </ThumbnailActions>
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
        <Box component="svg" width={d} height={d} viewBox={`0 0 ${d} ${d}`} fill="none" xmlns="http://www.w3.org/2000/svg" sx={{ display: "block", flexShrink: 0 }}>
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
        </Box>
    );
}

function CustomSceneThumbnail({ index, selected, onClick }: { index: number; selected: boolean; onClick?: () => void }) {
    return (
        <ThumbnailActions
            selected={selected}
            showActions="onHover"
            onClick={onClick}
            label={<Typography variant="caption" sx={sceneThumbnailLabelSx}>Scene {index + 1}</Typography>}
            rightActions={
                <ThumbnailActionsIconButton size="small">
                    <SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                </ThumbnailActionsIconButton>
            }
            sx={sceneThumbnailOuterSx}
            ContentProps={{ sx: { ...sceneThumbnailContentSx, display: "flex", alignItems: "center", justifyContent: "center" } }}
        >
            <PlaceholderIcon size={28} />
        </ThumbnailActions>
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
    const theme = useTheme();
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
  const threads = initialThreads ?? [];
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);
  const [videoPermOpen, setVideoPermOpen] = useState(false);
  const [videoPermSettings, setVideoPermSettings] = useState<VideoPermissionSettings | undefined>(initialPermSettings);

  // Unread = not yet checked or resolved
  const unreadCount = threads.reduce((n, t) => n + t.comments.filter(c => !c.checkedNow && !c.resolved).length, 0);

  const NAV_SECTIONS = [
      {
          section: "STYLE",
          items: [
              { icon: <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faPalette} /></SvgIcon>, label: "Brand" },
              { icon: <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faPaintbrush} /></SvgIcon>, label: "Theme" },
              {
                  icon: (
                      <Badge
                          badgeContent={avatarReqCount > 0 ? avatarReqCount : undefined}
                          color="error"
                          sx={navBadgeSx}
                      >
                          <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faCircleUser} /></SvgIcon>
                      </Badge>
                  ),
                  label: "Avatar"
              }
          ]
      },
      {
          section: "LIBRARIES",
          items: [
              { icon: <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faPhotoFilm} /></SvgIcon>, label: "Media" },
              { icon: <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faMusic} /></SvgIcon>, label: "Music" },
              { icon: <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faMicrophone} /></SvgIcon>, label: "Voice" },
              { icon: <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faDatabase} /></SvgIcon>, label: "Data" },
              { icon: <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faInputText} /></SvgIcon>, label: "Input fields" }
          ]
      },
      {
          section: "SETTINGS",
          items: [
              { icon: <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faCropSimple} /></SvgIcon>, label: "Aspect ratio" },
              { icon: <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faLanguage} /></SvgIcon>, label: "Languages" }
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
                          sx={navBadgeSx}
                      >
                          <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faComment} /></SvgIcon>
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
          <AppBar position="static" color="inherit" elevation={0} sx={studioAppBarSx}>
              <Toolbar variant="dense" disableGutters sx={studioToolbarSx}>
                  {/* Left — logo + video name + save indicator */}
                  <Box sx={studioAppBarLeftSx}>
                      {/* Logo — click to go to library */}
                      <Box onClick={onNavigateToLibrary} sx={studioLogoSx}>
                          <Box component="img" src="" alt="sundaysky-logo" sx={studioLogoImgSx} />
                      </Box>
                      {/* Save indicator */}
                      <SvgIcon sx={{ fontSize: 16, color: "action.disabledBackground" }}>
                          <FontAwesomeIcon icon={faCloudCheck} />
                      </SvgIcon>
                      {/* Video name */}
                      <Typography variant="h4" noWrap sx={{ color: "text.primary" }}>
                          {videoTitle}
                      </Typography>
                      {/* Language badge */}
                      <Box sx={studioLangBadgeSx}>
                          <Typography variant="caption">🇺🇸</Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>EN</Typography>
                      </Box>
                  </Box>

                  {/* Right */}
                  <Box sx={studioAppBarRightSx}>
                      <IconButton size="medium" color="inherit">
                          <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faArrowTurnLeft} /></SvgIcon>
                      </IconButton>
                      <IconButton size="medium" color="inherit">
                          <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faArrowTurnRight} /></SvgIcon>
                      </IconButton>
                      <Divider orientation="vertical" flexItem sx={studioDividerSx} />
                      {/* Manage permissions button */}
                      <Tooltip title="Manage permission" placement="bottom" arrow slotProps={{ tooltip: { sx: studioTooltipSx } }}>
                          <IconButton size="medium" onClick={() => setVideoPermOpen(true)} sx={studioPermBtnSx}>
                              <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faLock} /></SvgIcon>
                          </IconButton>
                      </Tooltip>
                      <TruffleAvatar text={OWNER_USER.initials} size="small" />
                      <NotificationBell dark notifications={notifications} />
                      <Divider orientation="vertical" flexItem sx={studioDividerSx} />
                      {/* Video Page button */}
                      <Button
                          variant="contained"
                          color="gradient"
                          size="medium"
                          endIcon={<SvgIcon sx={{ fontSize: 11 }}><FontAwesomeIcon icon={faChevronRight} /></SvgIcon>}
                          onClick={onNavigateToVideoPage}
                          sx={studioVideoPageBtnSx}
                      >
                          Video Page
                      </Button>
                  </Box>
              </Toolbar>
          </AppBar>

          {/* ── Content ────────────────────────────────────────────────────────── */}
          <Box sx={studioContentAreaSx}>

              {/* Left nav */}
              <Box sx={studioLeftNavSx}>
                  {NAV_SECTIONS.map(({ section, items }) => (
                      <List key={section} dense disablePadding>
                          <ListSubheader disableSticky sx={navSubheaderSx}>
                              <Typography variant="label">{section}</Typography>
                          </ListSubheader>
                          {items.map(({ icon, label, onClickOverride }: { icon: React.ReactNode; label: string; onClickOverride?: () => void }) => (
                              <ListItemButton
                                  key={label}
                                  dense
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
                                  sx={navItemButtonSx}
                              >
                                  <ListItemIcon sx={navItemIconSx}>{icon}</ListItemIcon>
                                  <ListItemText
                                      primary={label}
                                      sx={studioNavItemTextSx}
                                      primaryTypographyProps={{ variant: "body2", color: activeNav === label ? "text.primary" : "text.secondary" }}
                                  />
                              </ListItemButton>
                          ))}
                      </List>
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
              <Box sx={stageContainerSx}>

                  {/* Live preview area */}
                  <Box sx={livePreviewAreaSx}>


                      {/* Prev arrow */}
                      <IconButton
                          disabled={selectedScene === 0 || isToolbarActive}
                          onClick={() => goToScene(selectedScene - 1)}
                          size="medium"
                          color="primary"
                          sx={{ flexShrink: 0, mx: "4px" }}
                      >
                          <SvgIcon><FontAwesomeIcon icon={faChevronLeft} /></SvgIcon>
                      </IconButton>

                      {/* Canvas + right toolbar — inner group aligned at top so toolbar top === canvas top */}
                      <Box sx={canvasAndToolbarGroupSx}>

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
                                      sx={(theme) => ({
                                          position: "absolute", top: 0,
                                          ...(shouldPositionLeft
                                              ? { right: "calc(100% + 8px)", left: "auto" }
                                              : { left: "calc(100% + 8px)", right: "auto" }
                                          ),
                                          zIndex: 40,
                                          bgcolor: "background.paper", borderRadius: "16px",
                                          boxShadow: `0 4px 24px ${alpha(theme.palette.secondary.main, 0.18)}`,
                                          width: 260,
                                          borderWidth: 1, borderStyle: "solid", borderColor: "divider"
                                      })}
                                  >
                                      {/* Header */}
                                      <Box sx={placeholderMenuHeaderSx}>
                                          <Typography variant="h3" sx={{ fontSize: 18, color: "secondary.main" }}>
                      Placeholder
                                          </Typography>
                                          <IconButton size="small" onClick={() => setPlaceholderMenuOpen(false)} sx={{ color: "text.secondary", p: "4px" }}>
                                              <SvgIcon sx={{ fontSize: 20 }}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                                          </IconButton>
                                      </Box>

                                      {/* Items */}
                                      <Box sx={placeholderMenuItemsContainerSx}>
                                          {([
                                              { label: "Heading", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuIconBoxSx}>
                                                      <Box component="img" src="/heading.png" alt="Heading" sx={menuIconImgSx} />
                                                  </Box>
                                              ) },
                                              { label: "Sub heading", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuIconBoxSx}>
                                                      <Box component="img" src="/sub heading.png" alt="Sub heading" sx={menuIconImgSx} />
                                                  </Box>
                                              ) },
                                              { label: "Media", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuIconBoxSx}>
                                                      <Box component="img" src="/media.png" alt="Media" sx={menuIconImgSx} />
                                                  </Box>
                                              ) },
                                              { label: "Vertical bullet point", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuBulletIconBoxSx}>
                                                      <SvgIcon sx={{ fontSize: 22, color: "background.paper" }}><FontAwesomeIcon icon={faListUl} /></SvgIcon>
                                                  </Box>
                                              ) },
                                              { label: "Horizontal bullet point", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuBulletIconBoxSx}>
                                                      <SvgIcon sx={{ fontSize: 22, color: "background.paper" }}><FontAwesomeIcon icon={faTableColumns} /></SvgIcon>
                                                  </Box>
                                              ) },
                                              { label: "Footnote", blue: false, iconEl: (
                                                  <Box sx={placeholderMenuIconBoxSx}>
                                                      <Typography variant="body1" sx={{ fontSize: 22, color: "text.secondary", lineHeight: 1 }}>*</Typography>
                                                  </Box>
                                              ) },
                                              { label: "Logo", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuIconBoxSx}>
                                                      <Box component="img" src="/logo.png" alt="Logo" sx={menuIconImgSx} />
                                                  </Box>
                                              ) },
                                              { label: "Button", blue: true, iconEl: (
                                                  <Box sx={placeholderMenuIconBoxSx}>
                                                      <Box component="img" src="/button.png" alt="Button" sx={menuIconImgSx} />
                                                  </Box>
                                              ) }
                                          ] as { label: string; blue: boolean; iconEl: React.ReactNode }[]).map(({ label, blue, iconEl }) => (
                                              <Box
                                                  key={label}
                                                  onClick={() => {
                                                      addElement(label as PlaceholderType);
                                                      setPlaceholderMenuOpen(false);
                                                  }}
                                                  sx={placeholderMenuItemRowSx}>
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
                                      ? `0px 0px 0px 2px ${alpha(theme.palette.primary.main, 0.2)}, 0px 2px 12px ${alpha(theme.palette.secondary.main, 0.1)}`
                                      : `0px 2px 12px ${alpha(theme.palette.secondary.main, 0.1)}`,
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
                                          <Box sx={(theme) => ({
                                              display: "flex", alignItems: "center", gap: "8px",
                                              px: "12px", py: "8px", borderRadius: "8px",
                                              borderWidth: 2, borderStyle: "dashed", borderColor: isSelected ? "primary.main" : "primary.light",
                                              bgcolor: isSelected ? "action.hover" : "background.paper",
                                              cursor: "grab", userSelect: "none", whiteSpace: "nowrap",
                                              boxShadow: isSelected ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}` : "none",
                                              transition: "all 0.15s"
                                          })}>
                                              {src
                                                  ? <Box component="img" src={src} sx={canvasElIconImgSx} alt={el.type} />
                                                  : <Typography sx={{ fontSize: 16, lineHeight: 1, color: "text.secondary" }}>*</Typography>
                                              }
                                              <Typography variant="h5" sx={{ color: "primary.main" }}>
                                                  {el.type}
                                              </Typography>
                                          </Box>
                                      );
                                  };

                                  return (
                                      <>
                                          {/* ── Clipped scene background (no elements here so nothing clips) ── */}
                                          <Box ref={sceneBoxRef} sx={customSceneBackgroundSx}>
                                              {/* Prototype-only custom-scene accent — no real-app theme token */}
                                              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, bgcolor: "#E040FB", zIndex: 1 }} />

                                              {isEmpty && (
                                                  <Box sx={customSceneEmptyStateSx}>
                                                      <PlaceholderIcon size={52} />
                                                      <Button variant="contained"
                                                          onClick={e => {
                                                              e.stopPropagation(); setPlaceholderMenuOpen(p => !p); setSelectedElId(null); setEditingElId(null);
                                                          }}
                                                          sx={(theme) => ({ px: "16px", py: "8px", bgcolor: "primary.main", boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}` })}
                                                      >Add placeholder</Button>
                                                  </Box>
                                              )}
                                          </Box>

                                          {/* ── Elements overlay — same bounds as scene box, no overflow:hidden ── */}
                                          <Box sx={elementsOverlaySx}>
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
                                                                      border: isSelected ? `2px dashed ${alpha(theme.palette.common.white, 0.7)}` : "2px solid transparent",
                                                                      boxShadow: isSelected ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.35)}` : `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
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
                                                                      boxShadow: isSelected ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.12)}` : "none",
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
                                                                                  <SvgIcon sx={{ fontSize: icoInner, color: "background.paper" }}><FontAwesomeIcon icon={faImage} /></SvgIcon>
                                                                              </Box>
                                                                              <Box sx={(theme) => ({ position: "absolute", top: -badgePx * 0.35, right: -badgePx * 0.35, width: badgePx, height: badgePx, borderRadius: "50%", bgcolor: "grey.500", border: `2px solid ${theme.palette.common.white}`, display: "flex", alignItems: "center", justifyContent: "center" })}>
                                                                                  <SvgIcon sx={{ fontSize: badgePx * 0.65, color: "background.paper" }}><FontAwesomeIcon icon={faPlus} /></SvgIcon>
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
                              {sceneTypes[selectedScene] !== "custom" && <Box sx={regularSceneClipBoxSx}>
                                  <Box component="img" src={IMG_THUMB} alt={videoTitle}
                                      sx={regularSceneImgSx} />

                                  {/* Cover left half of SVG — white bg + pink accent line */}
                                  <Box sx={thumbLeftCoverSx}>
                                      {/* Prototype-only scene accent — no real-app theme token */}
                                      <Box sx={{ height: 5, bgcolor: "#C084FC", width: "100%" }} />
                                  </Box>

                                  {/* Right side — drag media area */}
                                  <Box sx={regularSceneDragAreaSx}>
                                      <Box sx={{ position: "relative", display: "inline-flex" }}>
                                          <SvgIcon sx={{ fontSize: 52, color: "action.disabled" }}><FontAwesomeIcon icon={faImage} /></SvgIcon>
                                      </Box>
                                      <Typography variant="caption" sx={{ color: "action.disabled", letterSpacing: "0.15px" }}>
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
                                          <Box sx={regularSceneHeadingColumnSx}>
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
                                  <Box sx={headingToolbarPositionSx}>
                                      <PlaceholderToolbar onEditClick={() => {
                                          onEditAttempt ? onEditAttempt() : setEditHeadingOpen(true);
                                      }} />
                                  </Box>
                              )}
                              {sceneTypes[selectedScene] !== "custom" && subheadingSelected && (
                                  <Box sx={subheadingToolbarPositionSx}>
                                      <PlaceholderToolbar onEditClick={() => {
                                          onEditAttempt ? onEditAttempt() : setEditSubheadingOpen(true);
                                      }} />
                                  </Box>
                              )}
                              {sceneTypes[selectedScene] !== "custom" && footnoteSelected && (
                                  <Box sx={footnoteToolbarPositionSx}>
                                      <PlaceholderToolbar onEditClick={() => {
                                          onEditAttempt ? onEditAttempt() : setEditFootnoteOpen(true); 
                                      }} />
                                  </Box>
                              )}
                          </Box>

                          {/* Right column: scene action toolbar + next arrow — sibling of canvas in stretch group */}
                          <Box sx={rightColumnSx}>

                              {/* Scene action toolbar — white pill card, top-aligned */}
                              <Box sx={sceneActionToolbarPillSx}>
                                  {/* 1. Layout / grid */}
                                  <Tooltip title="Layout" placement="left" arrow>
                                      <IconButton size="small" onClick={e => e.stopPropagation()}
                                          sx={sceneActionIconBtnSx}>
                                          <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faTableLayout} /></SvgIcon>
                                      </IconButton>
                                  </Tooltip>

                                  {/* 2. Theme / palette */}
                                  <Tooltip title="Theme" placement="left" arrow>
                                      <IconButton size="small" onClick={e => e.stopPropagation()}
                                          sx={sceneActionIconBtnSx}>
                                          <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faPalette} /></SvgIcon>
                                      </IconButton>
                                  </Tooltip>

                                  {/* 3. Add placeholder — active only on custom scenes */}
                                  <Tooltip title={sceneTypes[selectedScene] === "custom" ? "Add placeholder" : ""} placement="left" arrow>
                                      <Box component="span">
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
                                              <PlaceholderIcon size={18} color={placeholderMenuOpen && sceneTypes[selectedScene] === "custom" ? theme.palette.common.white : undefined} />
                                          </IconButton>
                                      </Box>
                                  </Tooltip>

                                  {/* 4. Info */}
                                  <Tooltip title="Info" placement="left" arrow>
                                      <IconButton size="small" onClick={e => e.stopPropagation()}
                                          sx={sceneActionIconBtnSx}>
                                          <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                                      </IconButton>
                                  </Tooltip>

                                  {/* 5. More */}
                                  <Tooltip title="More" placement="left" arrow>
                                      <IconButton size="small" onClick={e => e.stopPropagation()}
                                          sx={sceneActionIconBtnSx}>
                                          <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                                      </IconButton>
                                  </Tooltip>
                              </Box>

                              {/* Next arrow — pushed to bottom by justify-content: space-between */}
                              <IconButton
                                  disabled={selectedScene === SCENE_COUNT - 1 || isToolbarActive}
                                  onClick={() => goToScene(selectedScene + 1)}
                                  size="medium"
                                  color="primary"
                              >
                                  <SvgIcon><FontAwesomeIcon icon={faChevronRight} /></SvgIcon>
                              </IconButton>
                          </Box>

                      </Box>{/* end canvas + toolbar group */}
                  </Box>

                  {/* Narration bar */}
                  <Box sx={narrationBarSx}>
                      <Box sx={narrationAvatarSx}>
                          <SvgIcon sx={{ fontSize: 15, color: "text.secondary" }}><FontAwesomeIcon icon={faMicrophone} /></SvgIcon>
                      </Box>
                      <Typography variant="body1" sx={{ color: "text.secondary", flex: 1 }}>
                          Add narration…
                      </Typography>
                      <Typography variant="body1" sx={{ color: "text.secondary", letterSpacing: "0.4px" }}>
                          ~0:12
                      </Typography>
                  </Box>

                  {/* Scene lineup — dims when toolbar is active */}
                  <Box sx={sceneLineupSx}>
                      {/* Play bar */}
                      <Box sx={{
                          display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5,
                          opacity: isToolbarActive ? 0.38 : 1,
                          pointerEvents: isToolbarActive ? "none" : "auto",
                          transition: "opacity 0.2s"
                      }}>
                          <Box sx={playBtnCircleSx}>
                              <SvgIcon sx={{ fontSize: 22, color: "primary.main" }}><FontAwesomeIcon icon={faPlay} /></SvgIcon>
                          </Box>
                          <Typography variant="caption" sx={{
                              color: "primary.light", letterSpacing: "0.4px", ml: 1.5
                          }}>
                Scene {selectedScene + 1} / {SCENE_COUNT}
                          </Typography>
                      </Box>

                      {/* Thumbnails row — disabled + dimmed when a toolbar/panel is active */}
                      <Box sx={thumbnailsRowWrapperSx}>
                          <Box sx={{
                              display: "flex", gap: "12px", overflowX: "auto",
                              padding: "4px 6px 2px 4px",
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
                              <Box sx={addSceneOuterSx}>
                                  <Box
                                      onClick={() => {
                                          setSceneLibOpen(true); setPlaceholderMenuOpen(false); setSelectedElId(null);
                                      }}
                                      sx={addSceneBtnSx}>
                                      <SvgIcon sx={{ fontSize: 18, color: "primary.main" }}><FontAwesomeIcon icon={faPlus} /></SvgIcon>
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const studioAppBarSx: SxProps<Theme> = {
    flexShrink: 0,
    bgcolor: "background.paper",
    borderBottom: "1px solid",
    borderBottomColor: "divider"
};

const studioToolbarSx: SxProps<Theme> = {
    height: 56,
    px: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
};

const studioAppBarLeftSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 2
};

const studioLogoSx: SxProps<Theme> = {
    width: 56,
    height: 56,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    "&:hover": { opacity: 0.75 }
};

const studioLogoImgSx: SxProps<Theme> = { width: 40, height: 40, objectFit: "contain" };
const menuIconImgSx: SxProps<Theme> = { width: 22, height: 22, objectFit: "contain" };
const canvasElIconImgSx: SxProps<Theme> = { width: 18, height: 18, objectFit: "contain" };

const studioLangBadgeSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    px: "10px",
    py: "4px",
    borderRadius: 1,
    border: "1px solid",
    borderColor: "divider",
    cursor: "pointer"
};

const studioAppBarRightSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    pr: 2
};

const studioDividerSx: SxProps<Theme> = {
    borderColor: "divider",
    mx: 0.5,
    alignSelf: "center",
    height: 20
};

const studioTooltipSx: SxProps<Theme> = {
    bgcolor: "secondary.main",
    borderRadius: 1,
    px: 1.5,
    py: 1,
    "& .MuiTooltip-arrow": { color: "secondary.main" }
};

const studioPermBtnSx: SxProps<Theme> = {
    bgcolor: "secondary.dark",
    borderRadius: 1,
    p: "5px",
    border: "1px solid",
    borderColor: "divider",
    "&:hover": { bgcolor: "secondary.dark" }
};

const studioVideoPageBtnSx: SxProps<Theme> = {
    whiteSpace: "nowrap"
};

const studioLeftNavSx: SxProps<Theme> = {
    width: 150,
    flexShrink: 0,
    bgcolor: "background.paper",
    borderRight: 1,
    borderRightStyle: "solid",
    borderRightColor: "divider",
    overflowY: "auto",
    pt: 2,
    display: "flex",
    flexDirection: "column"
};

const navSubheaderSx: SxProps<Theme> = {
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "text.secondary",
    py: 0.5
};

const navItemButtonSx: SxProps<Theme> = {
    borderRadius: "8px 0 0 8px",
    py: 1
};

const navItemIconSx: SxProps<Theme> = {
    minWidth: 32
};

const studioNavItemTextSx: SxProps<Theme> = {
    "& .MuiListItemText-primary": { whiteSpace: "normal" }
};

const narrationBarSx: SxProps<Theme> = {
    mx: 3,
    mb: 1.5,
    height: 40,
    bgcolor: "background.paper",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    px: 2,
    gap: 1.5,
    flexShrink: 0
};

const narrationAvatarSx: SxProps<Theme> = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    bgcolor: "other.editorBackground",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
};

const studioContentAreaSx: SxProps<Theme> = {
    flex: 1,
    display: "flex",
    overflow: "hidden"
};

// ─── PlaceholderToolbar ───────────────────────────────────────────────────────

const placeholderToolbarWrapperSx: SxProps<Theme> = (theme) => ({
    display: "inline-flex",
    alignItems: "center",
    bgcolor: "background.paper",
    borderRadius: "8px",
    px: "8px",
    py: "6px",
    gap: "6px",
    boxShadow: `0px 4px 16px ${alpha(theme.palette.secondary.main, 0.18)}`,
    userSelect: "none"
});

const pillZoomBoxSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
    px: "8px",
    py: "5px",
    borderRadius: "8px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "grey.400",
    bgcolor: "background.paper",
    color: "primary.main",
    flexShrink: 0
};

// ─── ButtonPlaceholderToolbar / BulletPlaceholderToolbar shared ───────────────

const buttonToolbarWrapperSx: SxProps<Theme> = (theme) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    bgcolor: "background.paper",
    borderRadius: "8px",
    px: "6px",
    py: "5px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "grey.300",
    boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.15)}`,
    userSelect: "none",
    whiteSpace: "nowrap"
});

const toolbarDividerSx: SxProps<Theme> = {
    borderColor: "grey.300",
    mx: "2px"
};

const sizeLabelGroupSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0
};

const sizeLabelTypographySx: SxProps<Theme> = {
    color: "text.primary",
    letterSpacing: "0.46px"
};

const sizeToggleGroupSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "grey.300",
    borderRadius: "8px",
    overflow: "hidden"
};

// ─── EditHeadingDialog ────────────────────────────────────────────────────────

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

// ─── EditBulletDialog ─────────────────────────────────────────────────────────

const editBulletDialogPaperSx: SxProps<Theme> = {
    width: 1200,
    borderRadius: "16px",
    overflow: "hidden"
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

// ─── CommentsPanel ────────────────────────────────────────────────────────────

const commentsPanelHeaderSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 2,
    pt: 1,
    pb: 1,
    cursor: "grab",
    "&:active": { cursor: "grabbing" },
    userSelect: "none",
    flexShrink: 0
};

const commentsTabAreaSx: SxProps<Theme> = {
    px: 2,
    pb: "8px",
    flexShrink: 0
};

const commentsTabGroupSx: SxProps<Theme> = {
    display: "inline-flex",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "grey.300",
    borderRadius: "8px",
    padding: "1px",
    gap: 0
};

const commentsPanelFooterSx: SxProps<Theme> = {
    px: 2,
    py: "12px",
    borderTop: 1,
    borderTopStyle: "solid",
    borderTopColor: "grey.400",
    flexShrink: 0,
    display: "flex",
    justifyContent: "flex-end"
};

const commentsCommentingFooterSx: SxProps<Theme> = {
    px: 2,
    py: "12px",
    borderTop: 1,
    borderTopStyle: "solid",
    borderTopColor: "grey.400",
    flexShrink: 0,
    display: "flex",
    justifyContent: "flex-end",
    gap: 1
};

// ─── SceneThumbnail / CustomSceneThumbnail ────────────────────────────────────

const sceneThumbnailOuterSx: SxProps<Theme> = { width: 156, minWidth: 156, flexShrink: 0 };

const sceneThumbnailContentSx: SxProps<Theme> = {
    width: "100%", aspectRatio: "16/9",
    bgcolor: "grey.100",
    position: "relative"
};

const sceneThumbnailLabelSx: SxProps<Theme> = {
    color: "text.secondary",
    letterSpacing: "0.4px"
};

const sceneThumbnailImgSx: SxProps<Theme> = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
};

const thumbLeftCoverSx: SxProps<Theme> = {
    position: "absolute",
    inset: 0,
    width: "50%",
    bgcolor: "background.paper",
    pointerEvents: "none"
};

const thumbRightDragAreaSmSx: SxProps<Theme> = (theme) => ({
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "50%",
    background: `repeating-linear-gradient(-45deg, ${theme.palette.grey[200]} 0px, ${theme.palette.grey[200]} 6px, ${theme.palette.grey[300]} 6px, ${theme.palette.grey[300]} 12px)`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    pointerEvents: "none"
});

const thumbHeadingColumnSx: SxProps<Theme> = {
    position: "absolute",
    left: "4%",
    top: "18%",
    width: "44%",
    containerType: "inline-size",
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column"
};

const thumbFootnoteBoxSx: SxProps<Theme> = {
    position: "absolute",
    left: "4%",
    width: "44%",
    bottom: "5%",
    containerType: "inline-size",
    pointerEvents: "none"
};

const thumbFootnoteTypographySx: SxProps<Theme> = {
    fontFamily: "\"Open Sans\", sans-serif",
    fontWeight: 400,
    fontSize: "2.5cqw",
    letterSpacing: "0.4px",
    color: "text.secondary",
    lineHeight: 1.66
};

// ─── StudioPage — Stage area ──────────────────────────────────────────────────

const stageContainerSx: SxProps<Theme> = {
    flex: 1,
    bgcolor: "other.editorBackground",
    display: "flex",
    flexDirection: "column",
    overflow: "visible"
};

const livePreviewAreaSx: SxProps<Theme> = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    px: 2,
    py: 3,
    overflow: "visible",
    position: "relative"
};

const canvasAndToolbarGroupSx: SxProps<Theme> = {
    flex: 1,
    maxWidth: 720,
    display: "flex",
    alignItems: "stretch",
    gap: "8px",
    position: "relative",
    overflow: "visible"
};

// ─── Placeholder picker panel ─────────────────────────────────────────────────

const placeholderMenuHeaderSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: "20px",
    pt: "18px",
    pb: "12px"
};

const placeholderMenuItemsContainerSx: SxProps<Theme> = {
    px: "12px",
    pb: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
};

const placeholderMenuIconBoxSx: SxProps<Theme> = {
    width: 40,
    height: 40,
    bgcolor: "background.paper",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "divider",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const placeholderMenuBulletIconBoxSx: SxProps<Theme> = {
    width: 40,
    height: 40,
    bgcolor: "primary.main",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const placeholderMenuItemRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    px: "8px",
    py: "8px",
    cursor: "pointer",
    borderRadius: "12px",
    bgcolor: "background.paper",
    "&:hover": { bgcolor: "action.hover" },
    transition: "background 0.12s"
};

// ─── Custom scene canvas ──────────────────────────────────────────────────────

const customSceneBackgroundSx: SxProps<Theme> = {
    overflow: "hidden",
    borderRadius: "8px",
    position: "relative",
    aspectRatio: "16/9",
    bgcolor: "background.paper"
};

const customSceneEmptyStateSx: SxProps<Theme> = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px"
};

const elementsOverlaySx: SxProps<Theme> = {
    position: "absolute",
    inset: 0,
    borderRadius: "8px",
    overflow: "visible",
    pointerEvents: "none"
};

// ─── Regular scene canvas ─────────────────────────────────────────────────────

const regularSceneClipBoxSx: SxProps<Theme> = {
    overflow: "hidden",
    borderRadius: "8px",
    position: "relative"
};

const regularSceneImgSx: SxProps<Theme> = {
    width: "100%",
    display: "block"
};

const regularSceneDragAreaSx: SxProps<Theme> = (theme) => ({
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "50%",
    background: `repeating-linear-gradient(-45deg, ${theme.palette.grey[200]} 0px, ${theme.palette.grey[200]} 12px, ${theme.palette.grey[300]} 12px, ${theme.palette.grey[300]} 24px)`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    pointerEvents: "none"
});

const regularSceneHeadingColumnSx: SxProps<Theme> = {
    position: "absolute",
    left: "4%",
    top: "20%",
    width: "44%",
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column"
};

// ─── Scene action toolbar + lineup ────────────────────────────────────────────

const rightColumnSx: SxProps<Theme> = {
    width: 32,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between"
};

const sceneActionToolbarPillSx: SxProps<Theme> = {
    width: 32,
    bgcolor: "background.paper",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "divider",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    p: "4px"
};

const sceneActionIconBtnSx: SxProps<Theme> = {
    p: "3px",
    color: "primary.main",
    borderRadius: "6px",
    "&:hover": { bgcolor: "action.hover" }
};

const headingToolbarPositionSx: SxProps<Theme> = {
    position: "absolute",
    left: "25%",
    top: "30%",
    transform: "translate(-50%, -100%)",
    mb: "4px",
    zIndex: 20,
    pointerEvents: "auto"
};

const subheadingToolbarPositionSx: SxProps<Theme> = {
    position: "absolute",
    left: "25%",
    top: "55%",
    transform: "translate(-50%, -100%)",
    mb: "4px",
    zIndex: 20,
    pointerEvents: "auto"
};

const footnoteToolbarPositionSx: SxProps<Theme> = {
    position: "absolute",
    left: "50%",
    bottom: "3%",
    transform: "translate(-50%, -100%)",
    mb: "4px",
    zIndex: 20,
    pointerEvents: "auto"
};

const sceneLineupSx: SxProps<Theme> = {
    bgcolor: "background.paper",
    borderTop: 1,
    borderTopStyle: "solid",
    borderTopColor: "divider",
    px: 2,
    pt: 0,
    pb: "13px",
    flexShrink: 0,
    position: "relative"
};

const playBtnCircleSx: SxProps<Theme> = {
    width: 40,
    height: 40,
    borderRadius: "50%",
    bgcolor: "other.editorBackground",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
};

const thumbnailsRowWrapperSx: SxProps<Theme> = {
    position: "relative"
};

const addSceneOuterSx: SxProps<Theme> = {
    width: 56,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const addSceneBtnSx: SxProps<Theme> = {
    width: 32,
    height: 32,
    borderRadius: "50%",
    bgcolor: "other.editorBackground",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: "primary.main",
    cursor: "pointer",
    "&:hover": { bgcolor: "action.hover" }
};

// ─── PlaceholderToolbar (Pill zoom controls) ──────────────────────────────────

const pillZoomClickableSx: SxProps<Theme> = {
    display: "flex",
    cursor: "pointer",
    "&:hover": { opacity: 0.6 }
};

// ─── BulletPlaceholderToolbar (DropdownBtn) ───────────────────────────────────

const dropdownBtnSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    px: "8px",
    py: "3.5px",
    height: 32,
    flexShrink: 0,
    borderRadius: "8px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "grey.300",
    bgcolor: "background.paper",
    cursor: "pointer",
    "&:hover": { bgcolor: "action.hover" }
};

// ─── Shared toolbar icon buttons ──────────────────────────────────────────────

const toolbarDeleteBtnSx: SxProps<Theme> = {
    color: "error.main",
    p: "4px",
    flexShrink: 0
};

const toolbarMoreBtnSx: SxProps<Theme> = {
    color: "primary.main",
    p: "4px",
    flexShrink: 0
};

// ─── Navigation badge ─────────────────────────────────────────────────────────

const navBadgeSx: SxProps<Theme> = {
    "& .MuiBadge-badge": { fontSize: 9, minWidth: 14, height: 14, padding: 0 }
};
