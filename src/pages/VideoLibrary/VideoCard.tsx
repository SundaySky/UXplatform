import { useRef, useState } from "react";
import {
    Box, Button, Card, CardMedia, Divider, Menu, Skeleton, SvgIcon, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUpRightFromSquare, faBoxArchive, faCircleInfo, faComment, faCopy, faEllipsisVertical, faFolder,
    faLayerGroup, faLock, faPen, faPlay, faShare, faTrash, faUsers
} from "@fortawesome/pro-regular-svg-icons";
import {
    Label, ToggleIconButton, TruffleIconButton, TruffleMenuItem, TypographyWithTooltipOnOverflow
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import VideoPermissionDialog, { type VideoPermissionSettings } from "../../dialogs/VideoPermissionDialog";
import ApprovalDialog from "../../dialogs/ApprovalDialog";
import ConfirmationDialog from "../../dialogs/ConfirmationDialog";
import { TOTAL_COMMENT_COUNT } from "../Studio/CommentsPanel";
import PermAvatarGroup from "../../components/PermAvatarGroup";
import StatusLabel from "./StatusLabel";
import { type LiveVideoState, type VideoItem } from "./types";

const IMG_THUMB = "/thumb.svg";

const APPROVER_NAMES: Record<string, string> = {
    sjohnson:   "Sarah Johnson",
    mchen:      "Michael Chen",
    erodriguez: "Emma Rodriguez",
    jwilson:    "James Wilson"
};

function formatNames(keys: string[]) {
    const names = keys.map(k => APPROVER_NAMES[k] ?? k);
    if (names.length === 0) {
        return "";
    }
    if (names.length === 1) {
        return names[0];
    }
    if (names.length === 2) {
        return `${names[0]} and ${names[1]}`;
    }
    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function VideoThumbnail() {
    const [loaded, setLoaded] = useState(false);
    return (
        <Box sx={thumbnailWrapperSx}>
            {!loaded && <Skeleton variant="rectangular" sx={thumbnailSkeletonSx} />}
            <Box
                component="img"
                src={IMG_THUMB}
                onLoad={() => setLoaded(true)}
                sx={thumbnailImgSx(loaded)}
            />
        </Box>
    );
}

function ApprovalStatusIcon({ state, totalComments }: { state: LiveVideoState; totalComments: number }) {
    const { phase, pageState, sentApprovers } = state;
    if (phase === 0 && pageState === "draft") {
        return null;
    }
    if (phase >= 3) {
        return null;
    }

    let icon: typeof faUsers | typeof faComment;
    let color: string;
    let tip: string;

    if (phase === 0 && pageState === "pending") {
        icon = faUsers;
        color = "success.main";
        const names = sentApprovers.length > 0 ? formatNames(sentApprovers) : "approvers";
        tip = `Awaiting response from ${names}`;
    }
    else if (phase === 1) {
        icon = faUsers;
        color = "warning.main";
        const total = sentApprovers.length;
        const pending = sentApprovers.slice(1);
        const remaining = pending.length > 0 ? formatNames(pending) : "remaining approver";
        tip = `1 of ${total} approver${total !== 1 ? "s" : ""} responded. Waiting for ${remaining}`;
    }
    else if (phase === 2) {
        icon = faComment;
        color = "primary.main";
        tip = `${totalComments} comments from approvers ready to view`;
    }
    else {
        return null;
    }

    return (
        <Box sx={approvalIconContainerSx} title={tip}>
            <SvgIcon sx={{ fontSize: 16, color }}>
                <FontAwesomeIcon icon={icon} />
            </SvgIcon>
        </Box>
    );
}

export default function VideoCard({
    video, onClick, onEdit, liveState, onPermChange, onSubmitForApproval,
    approversList, approvalsEnabled = false
}: {
  video: VideoItem
  onClick?: () => void
  onEdit?: () => void
  liveState?: LiveVideoState
  onPermChange?: (key: string, s: VideoPermissionSettings) => void
  onSubmitForApproval?: (videoKey: string, approvers: string[]) => void
  approversList?: { value: string; label: string }[]
  approvalsEnabled?: boolean
}) {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [videoPermOpen, setVideoPermOpen] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmApprovers, setConfirmApprovers] = useState<string[]>([]);
    const [approvalOpen, setApprovalOpen] = useState(false);
    const savedMenuAnchor = useRef<HTMLElement | null>(null);

    const videoPermSettings = liveState?.permSettings;

    const openMenu = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setMenuAnchor(e.currentTarget);
    };
    const closeMenu = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setMenuAnchor(null);
    };

    return (
        <Card
            onClick={() => {
                if (approvalOpen || confirmationOpen || videoPermOpen) {
                    return;
                }
                onClick?.();
            }}
            sx={videocardSx}
        >
            {/* Thumbnail with hover overlay + hover actions */}
            <CardMedia sx={thumbnailContentPropsSx}>
                <VideoThumbnail />
                <Box className="thumbnail-hover-overlay" sx={thumbnailHoverOverlaySx} />
                <Box className="thumbnail-actions-left" sx={thumbnailActionsLeftSx}>
                    <TruffleIconButton
                        size="small"
                        color="white"
                        variant="contained"
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                    >
                        <FontAwesomeIcon icon={faPlay} />
                    </TruffleIconButton>
                </Box>
                <Box className="thumbnail-actions-right" sx={thumbnailActionsRightSx}>
                    <Button
                        variant="contained"
                        color="white"
                        size="small"
                        startIcon={<FontAwesomeIcon icon={faPen} />}
                        onClick={e => {
                            e.stopPropagation();
                            (onEdit ?? onClick)?.();
                        }}
                    >
                        Edit
                    </Button>
                </Box>
            </CardMedia>

            {/* Card body */}
            <Box sx={cardBodySx}>
                {/* Title + 3-dots */}
                <Box sx={cardTitleRowSx}>
                    <TypographyWithTooltipOnOverflow variant="h5" multiline sx={cardTitleSx}>
                        {video.title}
                    </TypographyWithTooltipOnOverflow>
                    <ToggleIconButton
                        size="small"
                        value="menu"
                        selected={Boolean(menuAnchor)}
                        onClick={openMenu}
                        sx={threeDotsBtnSx}
                        icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
                    />
                </Box>

                {/* Edited by */}
                <Typography variant="body1" noWrap sx={editedByTextSx}>
                    {video.editedBy}
                </Typography>

                {/* Status labels */}
                <Box sx={statusRowSx}>
                    {video.statuses.map(s => <StatusLabel key={s} status={s} />)}
                    {video.personalized && (
                        <Label label="Personalized" color="default" variant="outlined"
                            startIcon={<SvgIcon sx={personalizedLabelIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>}
                        />
                    )}
                    {liveState && <ApprovalStatusIcon state={liveState} totalComments={TOTAL_COMMENT_COUNT} />}
                </Box>
            </Box>

            {/* 3-dots dropdown menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => closeMenu()}
                onClick={e => e.stopPropagation()}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: menuPaperSx } }}
            >
                {/* Header: video name */}
                <Box sx={menuHeaderSx} onClick={e => e.stopPropagation()}>
                    <Typography variant="h5" sx={menuTitleSx}>
                        {video.title}
                    </Typography>
                    <Box sx={menuFolderLabelSx}>
                        <SvgIcon sx={menuFolderIconSx}>
                            <FontAwesomeIcon icon={faFolder} />
                        </SvgIcon>
                        <Typography variant="caption" sx={menuFolderTextSx}>
                            Shared assets
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={menuDividerSx} />

                <TruffleMenuItem onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                    Details
                </TruffleMenuItem>

                <TruffleMenuItem onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></SvgIcon>
                    Video Page
                </TruffleMenuItem>

                <TruffleMenuItem
                    onClick={e => {
                        e.stopPropagation();
                        savedMenuAnchor.current = menuAnchor;
                        setMenuAnchor(null);
                        setVideoPermOpen(true);
                    }}
                    secondaryAction={<PermAvatarGroup settings={videoPermSettings} coloredAvatars={false} size="small" />}
                >
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faLock} /></SvgIcon>
                    Video access
                </TruffleMenuItem>

                <Divider sx={menuDividerSx} />

                <TruffleMenuItem onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faShare} /></SvgIcon>
                    Share video
                </TruffleMenuItem>

                {approvalsEnabled && (
                    <TruffleMenuItem onClick={e => {
                        closeMenu(e);
                        setApprovalOpen(true);
                    }}>
                        <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                        Submit for approval
                    </TruffleMenuItem>
                )}

                <Divider sx={menuDividerSx} />

                <TruffleMenuItem onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faCopy} /></SvgIcon>
                    Duplicate video
                </TruffleMenuItem>

                <TruffleMenuItem onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faLayerGroup} /></SvgIcon>
                    Video to template
                </TruffleMenuItem>

                <Divider sx={menuDividerSx} />

                <TruffleMenuItem onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faFolder} /></SvgIcon>
                    Move to folder
                </TruffleMenuItem>

                <TruffleMenuItem onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconMrSx}><FontAwesomeIcon icon={faBoxArchive} /></SvgIcon>
                    Archive
                </TruffleMenuItem>

                <TruffleMenuItem error onClick={e => closeMenu(e)}>
                    <SvgIcon sx={menuItemIconDeleteSx}><FontAwesomeIcon icon={faTrash} /></SvgIcon>
                    Delete
                </TruffleMenuItem>
            </Menu>

            {/* Per-card permission dialog */}
            <VideoPermissionDialog
                open={videoPermOpen}
                onClose={() => setVideoPermOpen(false)}
                onSave={s => {
                    onPermChange?.(video.title, s);
                    setVideoPermOpen(false);
                    setMenuAnchor(savedMenuAnchor.current);
                }}
                initialSettings={videoPermSettings}
            />

            {/* Submit for approval dialog */}
            <ApprovalDialog
                open={approvalOpen}
                onClose={() => setApprovalOpen(false)}
                onSend={approvers => {
                    setApprovalOpen(false);
                    setConfirmApprovers(approvers);
                    setConfirmationOpen(true);
                    onSubmitForApproval?.(video.title, approvers);
                }}
                availableApprovers={approversList}
            />

            {/* Approval confirmation dialog */}
            <ConfirmationDialog
                open={confirmationOpen}
                onClose={() => setConfirmationOpen(false)}
                approverCount={confirmApprovers.length}
            />
        </Card>
    );
}

const videocardSx: SxProps<Theme> = {
    p: 1,
    width: "100%",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    boxShadow: 0,
    transition: "box-shadow 0.15s",
    "& .thumbnail-hover-overlay": { display: "none" },
    "& .thumbnail-actions-left, & .thumbnail-actions-right": { visibility: "hidden" },
    "&:hover": {
        boxShadow: 24,
        "& .thumbnail-hover-overlay": { display: "block" },
        "& .thumbnail-actions-left, & .thumbnail-actions-right": { visibility: "visible" }
    }
};

const thumbnailContentPropsSx: SxProps<Theme> = {
    position: "relative"
};

const thumbnailHoverOverlaySx: SxProps<Theme> = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    bgcolor: "text.disabled"
};

const thumbnailActionsLeftSx: SxProps<Theme> = {
    position: "absolute",
    top: 16,
    left: 16,
    display: "flex",
    gap: "8px"
};

const thumbnailActionsRightSx: SxProps<Theme> = {
    position: "absolute",
    top: 16,
    right: 16,
    display: "flex",
    gap: "8px"
};

const cardBodySx: SxProps<Theme> = {
    pt: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px"
};

const cardTitleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between"
};

const cardTitleSx: SxProps<Theme> = {
    color: "text.primary",
    flex: 1,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: "42px",
    lineHeight: 1.5
};

const threeDotsBtnSx: SxProps<Theme> = {
    mt: "-2px",
    ml: "4px",
    flexShrink: 0
};

const statusRowSx: SxProps<Theme> = {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center"
};

const approvalIconContainerSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    cursor: "default"
};

const editedByTextSx: SxProps<Theme> = {
    color: "text.secondary"
};

const personalizedLabelIconSx: SxProps<Theme> = {
    fontSize: "12px !important",
    width: "12px !important",
    height: "12px !important"
};

const menuPaperSx: SxProps<Theme> = {
    minWidth: 256,
    mt: "4px",
    py: "4px"
};

const menuHeaderSx: SxProps<Theme> = {
    px: 2,
    pt: "10px",
    pb: 1
};

const menuFolderLabelSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "4px"
};

const menuTitleSx: SxProps<Theme> = {
    color: "text.primary",
    lineHeight: 1.4,
    mb: "4px"
};

const menuFolderIconSx: SxProps<Theme> = {
    fontSize: "13px !important",
    width: "13px !important",
    height: "13px !important",
    color: "text.secondary"
};

const menuFolderTextSx: SxProps<Theme> = {
    color: "text.secondary",
    lineHeight: 1.4
};

const menuDividerSx: SxProps<Theme> = {
    my: "4px"
};

const menuItemIconMrSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "action.active",
    mr: 1
};

const menuItemIconDeleteSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    mr: 1
};

const thumbnailWrapperSx: SxProps<Theme> = {
    position: "relative"
};

const thumbnailSkeletonSx: SxProps<Theme> = {
    width: "100%",
    height: "auto",
    aspectRatio: "16/9"
};

const thumbnailImgSx = (loaded: boolean): SxProps<Theme> => ({
    display: loaded ? "block" : "none",
    width: "100%",
    objectFit: "contain",
    aspectRatio: "16/9",
    outline: (theme: Theme) => `1px solid ${theme.palette.grey[300]}`
});
