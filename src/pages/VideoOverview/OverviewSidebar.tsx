import { useState } from "react";
import {
    Badge, Box, Divider, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu, SvgIcon, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft, faBoxArchive, faChartBar, faCircleInfo, faCopy, faEllipsisVertical, faFolder,
    faLayerGroup, faLock, faPen, faShareNodes, faTrash
} from "@fortawesome/pro-regular-svg-icons";
import {
    Label, TruffleAvatar, TruffleMenuItem, TypographyWithTooltipOnOverflow
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import { type VideoPermissionSettings } from "../../dialogs/VideoPermissionDialog";
import PermAvatarGroup from "../../components/PermAvatarGroup";

export default function OverviewSidebar({
    effectiveStatus,
    videoTitle,
    onNavigateToLibrary,
    videoPermSettings,
    onManageAccess,
    selectedNav = "edit",
    onNavChange
}: {
  effectiveStatus: "draft" | "pending" | "approved"
  videoTitle: string
  onNavigateToLibrary: () => void
  videoPermSettings?: VideoPermissionSettings
  onManageAccess?: () => void
  selectedNav?: "edit" | "share" | "analyze"
  onNavChange?: (nav: "edit" | "share" | "analyze") => void
}) {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    return (
        <Box sx={sidebarContainerSx}>
            <Box
                onClick={onNavigateToLibrary}
                sx={sidebarLogoClickSx}
            >
                <Box component="img" src="/sundaysky.svg" alt="sundaysky-logo" sx={sidebarLogoImgSx} />
            </Box>

            {/* Back to Video Library */}
            <Box
                onClick={onNavigateToLibrary}
                sx={sidebarBackNavSx}
            >
                <SvgIcon sx={sidebarBackIconSx}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </SvgIcon>
                <Typography variant="body1" noWrap sx={textSecondaryColorSx}>
                    Video Library
                </Typography>
            </Box>

            {/* Video name + options */}
            <Box sx={sidebarTitleRowSx}>
                <TypographyWithTooltipOnOverflow variant="h3" multiline={true} sx={sidebarTitleTextSx}>
                    {videoTitle}
                </TypographyWithTooltipOnOverflow>
                <IconButton size="medium" onClick={e => setMenuAnchor(e.currentTarget)} sx={sidebarMenuIconButtonSx}>
                    <SvgIcon fontSize="small"><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                </IconButton>
                {/* Three-dot menu */}
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    slotProps={{ paper: { sx: menuPaperSx } }}
                >
                    {/* Header */}
                    <Box sx={menuHeaderBoxSx}>
                        <Typography variant="h5" sx={menuHeaderTitleSx}>
                            {videoTitle}
                        </Typography>
                        <Box sx={menuHeaderFolderRowSx}>
                            <SvgIcon sx={menuHeaderFolderIconSx}>
                                <FontAwesomeIcon icon={faFolder} />
                            </SvgIcon>
                            <Typography variant="caption" sx={textSecondaryColorSx}>
                                Shared assets
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={menuDividerSx} />

                    <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                        <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                        Details
                    </TruffleMenuItem>

                    <TruffleMenuItem onClick={() => {
                        setMenuAnchor(null); onManageAccess?.();
                    }}
                    secondaryAction={<PermAvatarGroup settings={videoPermSettings} coloredAvatars={false} />}
                    >
                        <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faLock} /></SvgIcon>
                        Video access
                    </TruffleMenuItem>

                    <Divider sx={menuDividerSx} />

                    <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                        <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faCopy} /></SvgIcon>
                        Duplicate video
                    </TruffleMenuItem>

                    <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                        <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faLayerGroup} /></SvgIcon>
                        Video to template
                    </TruffleMenuItem>

                    <Divider sx={menuDividerSx} />

                    <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                        <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faFolder} /></SvgIcon>
                        Move to folder
                    </TruffleMenuItem>

                    <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                        <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faBoxArchive} /></SvgIcon>
                        Archive
                    </TruffleMenuItem>

                    <TruffleMenuItem error onClick={() => setMenuAnchor(null)}>
                        <SvgIcon sx={menuItemDeleteIconSx}><FontAwesomeIcon icon={faTrash} /></SvgIcon>
                        Delete
                    </TruffleMenuItem>
                </Menu>
            </Box>

            {/* Status chip */}
            <Box sx={sidebarStatusChipBoxSx}>
                <Label
                    label={effectiveStatus === "pending" ? "Pending approval" : effectiveStatus === "approved" ? "Approved for sharing" : "Draft"}
                    color={effectiveStatus === "approved" ? "info" : "default"}
                    size="small"
                />
            </Box>

            {/* Nav items */}
            <Box sx={sidebarNavBoxSx}>
                <List disablePadding sx={sidebarNavListSx}>
                    <ListItemButton selected={selectedNav === "edit"} onClick={() => onNavChange?.("edit")}>
                        <ListItemIcon sx={navItemIconContainerSx}>
                            <SvgIcon sx={navItemIconSx}>
                                <FontAwesomeIcon icon={faPen} />
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary="Edit" primaryTypographyProps={{ variant: "body2", sx: textPrimaryColorSx }} />
                    </ListItemButton>

                    <ListItemButton selected={selectedNav === "share"} onClick={() => onNavChange?.("share")}>
                        <ListItemIcon sx={navItemIconContainerSx}>
                            <SvgIcon sx={navItemIconSx}>
                                <FontAwesomeIcon icon={faShareNodes} />
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary="Share" primaryTypographyProps={{ variant: "body2", sx: textPrimaryColorSx }} />
                    </ListItemButton>

                    <ListItemButton selected={selectedNav === "analyze"} onClick={() => onNavChange?.("analyze")}>
                        <ListItemIcon sx={navItemIconContainerSx}>
                            <SvgIcon sx={navItemIconSx}>
                                <FontAwesomeIcon icon={faChartBar} />
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary="Analyze" primaryTypographyProps={{ variant: "body2", sx: textPrimaryColorSx }} />
                    </ListItemButton>
                </List>
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* User footer */}
            <Divider />
            <Box sx={sidebarFooterRowSx}>
                <Box sx={sidebarFooterUserSx}>
                    <Badge variant="dot" color="error" overlap="circular"
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                        <TruffleAvatar text="MC" size="medium" />
                    </Badge>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body1" noWrap sx={textPrimaryColorSx}>
                            Maya Carmel
                        </Typography>
                        <Typography variant="body2" noWrap sx={textSecondaryColorSx}>
                            maya-carmel-playgr...
                        </Typography>
                    </Box>
                </Box>
                <IconButton size="medium" sx={iconButtonActiveColorSx}>
                    <SvgIcon fontSize="small"><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                </IconButton>
            </Box>
        </Box>
    );
}

const textPrimaryColorSx: SxProps<Theme> = { color: "text.primary" };
const textSecondaryColorSx: SxProps<Theme> = { color: "text.secondary" };
const iconButtonActiveColorSx: SxProps<Theme> = { color: "action.active" };
const sidebarContainerSx: SxProps<Theme> = {
    width: 270, flexShrink: 0, display: "flex", flexDirection: "column",
    height: "100%", bgcolor: "background.paper", borderRight: 1, borderColor: "divider",
    pt: 3
};
const sidebarLogoClickSx: SxProps<Theme> = {
    display: "flex", justifyContent: "center", alignItems: "center",
    pt: 0, pb: 1, cursor: "pointer", "&:hover": { opacity: 0.75 }
};
const sidebarLogoImgSx: SxProps<Theme> = {
    width: 130, height: "auto", display: "block"
};
const sidebarBackNavSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: 0.5,
    px: 2.5, pt: 2, pb: 1, cursor: "pointer", width: "fit-content",
    "&:hover": { opacity: 0.75 }
};
const sidebarBackIconSx: SxProps<Theme> = { fontSize: "16px !important", width: "16px !important", height: "16px !important", color: "text.secondary" };
const sidebarTitleRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    px: 2.5, pr: 1.5
};
const sidebarMenuIconButtonSx: SxProps<Theme> = { mt: 0.3, color: "action.active", flexShrink: 0 };
const menuPaperSx: SxProps<Theme> = { minWidth: 256, mt: "4px", py: "4px" };
const menuHeaderBoxSx: SxProps<Theme> = { px: 2, pt: "10px", pb: 1 };
const menuHeaderTitleSx: SxProps<Theme> = { color: "text.primary", mb: "4px" };
const menuHeaderFolderRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "4px" };
const menuHeaderFolderIconSx: SxProps<Theme> = { fontSize: "13px !important", width: "13px !important", height: "13px !important", color: "text.secondary" };
const menuDividerSx: SxProps<Theme> = { my: "4px" };
const menuItemIconSx: SxProps<Theme> = { fontSize: "16px !important", width: "16px !important", height: "16px !important", color: "action.active", mr: 1 };
const menuItemDeleteIconSx: SxProps<Theme> = { fontSize: "16px !important", width: "16px !important", height: "16px !important", mr: 1 };
const sidebarStatusChipBoxSx: SxProps<Theme> = { pl: "20px", py: "1px" };
const sidebarNavBoxSx: SxProps<Theme> = { px: 2, py: 1 };
const sidebarNavListSx: SxProps<Theme> = { display: "flex", flexDirection: "column", gap: "2px" };
const navItemIconContainerSx: SxProps<Theme> = { minWidth: 24 };
const navItemIconSx: SxProps<Theme> = { fontSize: "18px !important", width: "18px !important", height: "18px !important", color: "action.active" };
const sidebarTitleTextSx: SxProps<Theme> = { color: "text.primary", flex: 1, wordBreak: "break-word" };
const sidebarFooterRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 1.5
};
const sidebarFooterUserSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 };
