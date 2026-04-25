import { Box, Divider, IconButton, SvgIcon, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlarmClock, faChevronDown, faEllipsisH, faPen, faTrash } from "@fortawesome/pro-regular-svg-icons";
import {
    buttonToolbarWrapperSx,
    sizeLabelGroupSx,
    sizeLabelTypographySx,
    sizeToggleGroupSx,
    toolbarDeleteBtnSx,
    toolbarDividerSx,
    toolbarMoreBtnSx
} from "./placeholderToolbarStyles";

// Bullet-placeholder toolbar (Figma node 26110-118643)
export default function BulletPlaceholderToolbar({
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
            <SvgIcon sx={{ fontSize: "16px !important", color: "primary.main" }}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>
        </Box>
    );

    return (
        <Box
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            sx={buttonToolbarWrapperSx}
        >
            {/* Edit */}
            <ActionBtn icon={<SvgIcon sx={{ fontSize: "13px !important", color: "primary.main" }}><FontAwesomeIcon icon={faPen} /></SvgIcon>} label="Edit" onClick={onEditClick} />

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
            <ActionBtn icon={<SvgIcon sx={{ fontSize: "13px !important", color: "primary.main" }}><FontAwesomeIcon icon={faAlarmClock} /></SvgIcon>} label="Timing" />

            <Divider orientation="vertical" flexItem sx={toolbarDividerSx} />

            {/* Delete */}
            <IconButton size="small" onClick={onDelete} sx={toolbarDeleteBtnSx}>
                <SvgIcon sx={{ fontSize: "18px !important", width: "18px !important", height: "18px !important" }}><FontAwesomeIcon icon={faTrash} /></SvgIcon>
            </IconButton>

            {/* More */}
            <IconButton size="small" onClick={(e) => onOptionsMenuClick?.(e.currentTarget)} sx={toolbarMoreBtnSx}>
                <SvgIcon sx={{ fontSize: "18px !important", width: "18px !important", height: "18px !important" }}><FontAwesomeIcon icon={faEllipsisH} /></SvgIcon>
            </IconButton>
        </Box>
    );
}

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
