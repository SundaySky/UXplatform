import {
    Box, IconButton, SvgIcon, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faEllipsisVertical, faPen } from "@fortawesome/pro-regular-svg-icons";
import { Label, TypographyWithTooltipOnOverflow } from "@sundaysky/smartvideo-hub-truffle-component-library";
import { resolveStatuses, STATUS_LABEL_MAP, type LiveVideoState, type StatusKey, type VideoItem } from "./types";

const IMG_THUMB = "/thumb.svg";
const TABLE_COLUMNS = ["Name", "Last Approved", "Last Edited", "Creation Date", "Actions"] as const;

export default function VideoTableView({ videos, videoStates, onSelect, onEdit }: {
    videos: VideoItem[];
    videoStates?: Record<string, LiveVideoState>;
    onSelect: (v: VideoItem) => void;
    onEdit: (v: VideoItem) => void;
}) {
    return (
        <TableContainer>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        {TABLE_COLUMNS.map(col => (
                            <TableCell key={col} sx={tableHeadCellSx}>
                                <Box sx={tableHeadCellInnerSx}>
                                    <Typography variant="subtitle1">{col}</Typography>
                                    {col !== "Actions" && (
                                        <SvgIcon sx={tableSortIconSx}><FontAwesomeIcon icon={faArrowDown} /></SvgIcon>
                                    )}
                                </Box>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {videos.map((v, i) => {
                        const statuses = resolveStatuses(v, videoStates);
                        return (
                            <TableRow key={v.title + i} hover onClick={() => onSelect(v)} sx={tableRowSx}>
                                {/* Name */}
                                <TableCell sx={tableNameCellSx}>
                                    <Box sx={tableNameCellInnerSx}>
                                        <Box component="img" src={IMG_THUMB} alt="" sx={tableThumbSx} />
                                        <Box>
                                            <TypographyWithTooltipOnOverflow variant="h5" sx={tableVideoTitleSx}>
                                                {v.title}
                                            </TypographyWithTooltipOnOverflow>
                                            {statuses.map(s => <Label key={s} label={s} color={STATUS_LABEL_MAP[s as StatusKey]?.color ?? "default"} sx={tableLabelSx} />)}
                                        </Box>
                                    </Box>
                                </TableCell>
                                {/* Last Approved */}
                                <TableCell>
                                    <Typography variant="body1" color="text.secondary">—</Typography>
                                </TableCell>
                                {/* Last Edited */}
                                <TableCell>
                                    <Typography variant="body1" color="text.secondary">{v.editedBy}</Typography>
                                </TableCell>
                                {/* Creation Date */}
                                <TableCell>
                                    <Typography variant="body1" color="text.secondary">—</Typography>
                                </TableCell>
                                {/* Actions */}
                                <TableCell sx={tableActionsCellSx}>
                                    <Box sx={tableActionsBoxSx}>
                                        <IconButton size="medium" onClick={e => {
                                            e.stopPropagation(); onEdit(v);
                                        }}>
                                            <SvgIcon sx={tableActionIconSx}><FontAwesomeIcon icon={faPen} /></SvgIcon>
                                        </IconButton>
                                        <IconButton size="medium" onClick={e => e.stopPropagation()}>
                                            <SvgIcon sx={tableActionIconSx}><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

const tableHeadCellSx: SxProps<Theme> = { bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" };
const tableHeadCellInnerSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "4px" };
const tableSortIconSx: SxProps<Theme> = { fontSize: "12px !important", width: "12px !important", height: "12px !important", color: "action.active" };
const tableRowSx: SxProps<Theme> = { cursor: "pointer" };
const tableNameCellSx: SxProps<Theme> = { maxWidth: 360 };
const tableNameCellInnerSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: 1.5 };
const tableThumbSx: SxProps<Theme> = { width: 64, height: 36, objectFit: "cover", borderRadius: "4px", flexShrink: 0 };
const tableVideoTitleSx: SxProps<Theme> = { mb: "2px" };
const tableLabelSx: SxProps<Theme> = { mt: "2px" };
const tableActionsCellSx: SxProps<Theme> = { width: 96 };
const tableActionsBoxSx: SxProps<Theme> = { display: "flex", alignItems: "center" };
const tableActionIconSx: SxProps<Theme> = { fontSize: "16px !important", width: "16px !important", height: "16px !important" };
