import { Box, Divider, IconButton, SvgIcon, Typography } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlarmClock, faCopy, faEllipsisH, faPen, faTrash } from "@fortawesome/pro-regular-svg-icons";
import {
    buttonToolbarWrapperSx,
    sizeLabelGroupSx,
    sizeLabelTypographySx,
    sizeToggleGroupSx,
    toolbarDeleteBtnSx,
    toolbarDividerSx,
    toolbarMoreBtnSx
} from "./placeholderToolbarStyles";

// Button-placeholder toolbar (Figma node 23002-12178)
export default function ButtonPlaceholderToolbar({
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
            <ActionBtn icon={<SvgIcon sx={{ fontSize: "13px !important", color: "primary.main" }}><FontAwesomeIcon icon={faPen} /></SvgIcon>} label="Edit" />

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
                icon={<SvgIcon sx={{ fontSize: "13px !important", color: "text.disabled" }}><FontAwesomeIcon icon={faAlarmClock} /></SvgIcon>}
                label="Timing"
                disabled
            />

            <Divider orientation="vertical" flexItem sx={toolbarDividerSx} />

            {/* Copy */}
            <ActionBtn icon={<SvgIcon sx={{ fontSize: "13px !important", color: "primary.main" }}><FontAwesomeIcon icon={faCopy} /></SvgIcon>} label="Copy" />

            {/* Delete */}
            <IconButton size="small" onClick={onDelete} sx={toolbarDeleteBtnSx}>
                <SvgIcon sx={{ fontSize: "18px !important", width: "18px !important", height: "18px !important" }}><FontAwesomeIcon icon={faTrash} /></SvgIcon>
            </IconButton>

            {/* More */}
            <IconButton size="small" sx={toolbarMoreBtnSx}>
                <SvgIcon sx={{ fontSize: "18px !important", width: "18px !important", height: "18px !important" }}><FontAwesomeIcon icon={faEllipsisH} /></SvgIcon>
            </IconButton>
        </Box>
    );
}
