import { Box, SvgIcon, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAlarmClock, faAlignLeft, faCopy, faEllipsisH, faEraser, faEye, faPaintbrush, faPen, faPlus, faT, faTrash
} from "@fortawesome/pro-regular-svg-icons";

// Floating text-placeholder toolbar (Figma DS node 22171-65559)
export default function PlaceholderToolbar({ onEditClick, onDelete }: { onEditClick: () => void; onDelete?: () => void }) {
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
            <Pill icon={<SvgIcon sx={{ fontSize: "14px !important", width: "14px !important", height: "14px !important" }}><FontAwesomeIcon icon={faPen} /></SvgIcon>} label="Edit" onClick={onEditClick} />

            {/* Zoom — single bordered box */}
            <Box sx={pillZoomBoxSx}>
                <Box sx={pillZoomClickableSx}>
                    <SvgIcon sx={{ fontSize: "12px !important", width: "12px !important", height: "12px !important" }}><FontAwesomeIcon icon={faEraser} /></SvgIcon>
                </Box>
                <Typography variant="caption" sx={{ color: "primary.main", mx: "3px", minWidth: 28, textAlign: "center" }}>
          100%
                </Typography>
                <Box sx={pillZoomClickableSx}>
                    <SvgIcon sx={{ fontSize: "12px !important", width: "12px !important", height: "12px !important" }}><FontAwesomeIcon icon={faPlus} /></SvgIcon>
                </Box>
            </Box>

            <Pill icon={<SvgIcon sx={{ fontSize: "14px !important", width: "14px !important", height: "14px !important" }}><FontAwesomeIcon icon={faT} /></SvgIcon>} label="Style" />
            <Pill icon={<SvgIcon sx={{ fontSize: "14px !important", width: "14px !important", height: "14px !important" }}><FontAwesomeIcon icon={faAlignLeft} /></SvgIcon>} label="Align" />
            <Pill icon={<SvgIcon sx={{ fontSize: "14px !important", width: "14px !important", height: "14px !important" }}><FontAwesomeIcon icon={faPaintbrush} /></SvgIcon>} label="Color" />
            <Pill icon={<SvgIcon sx={{ fontSize: "14px !important", width: "14px !important", height: "14px !important" }}><FontAwesomeIcon icon={faAlarmClock} /></SvgIcon>} label="Timing" />
            <Pill icon={<SvgIcon sx={{ fontSize: "14px !important", width: "14px !important", height: "14px !important" }}><FontAwesomeIcon icon={faCopy} /></SvgIcon>} label="Copy" />
            <Pill icon={<SvgIcon sx={{ fontSize: "14px !important", width: "14px !important", height: "14px !important" }}><FontAwesomeIcon icon={faEye} /></SvgIcon>} />
            <Pill icon={<SvgIcon sx={{ fontSize: "16px !important", width: "16px !important", height: "16px !important" }}><FontAwesomeIcon icon={faEllipsisH} /></SvgIcon>} />
            {onDelete && (
                <Pill icon={<SvgIcon sx={{ fontSize: "14px !important", width: "14px !important", height: "14px !important" }}><FontAwesomeIcon icon={faTrash} /></SvgIcon>} onClick={onDelete} />
            )}
        </Box>
    );
}

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

const pillZoomClickableSx: SxProps<Theme> = {
    display: "flex",
    cursor: "pointer",
    "&:hover": { opacity: 0.6 }
};
