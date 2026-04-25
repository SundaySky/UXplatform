import { Box, SvgIcon, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/pro-regular-svg-icons";
import { type VideoPermissionSettings } from "../dialogs/VideoPermissionDialog";
import { OWNER_USER } from "../dialogs/ManageAccessDialog";

export default function PermAvatarGroup({ settings, coloredAvatars = true, size = "default" }: { settings?: VideoPermissionSettings; coloredAvatars?: boolean; size?: "default" | "small" }) {
    const s = settings ?? {
        tab: "teams" as const, everyoneRole: "viewer" as const,
        users: [], ownerUsers: [OWNER_USER], noDuplicate: false
    };
    const { tab, everyoneRole, users, ownerUsers } = s;

    const miniAvatarSx = size === "small" ? miniAvatarSmallSx : miniAvatarBaseSx;
    const iconSz = size === "small" ? { fontSize: 14, width: 14, height: 14 } : everyoneAvatarIconSx;

    const miniAvatar = (key: string, content: React.ReactNode, tip: string, bgColor?: string) => (
        <Box
            key={key}
            title={tip}
            sx={{
                ...miniAvatarSx,
                bgcolor: coloredAvatars && bgColor ? bgColor : "divider",
                color: coloredAvatars && bgColor ? "common.white" : "text.primary"
            }}
        >
            {content}
        </Box>
    );

    if (tab === "private") {
        return (
            <Typography variant="caption" sx={permPrivateLabelSx}>
                Just me
            </Typography>
        );
    }

    return (
        <Box sx={permAvatarGroupSx}>
            {ownerUsers.slice(0, 2).map(u =>
                miniAvatar(u.id,
                    <Typography variant="caption" sx={miniAvatarTextSx}>{u.initials}</Typography>,
                    `${u.name}${u.id === OWNER_USER.id ? " (You)" : ""} — Owner`,
                    u.color
                )
            )}
            {users.filter(pu => pu.role === "editor").slice(0, 2).map(pu =>
                miniAvatar(pu.user.id,
                    <Typography variant="caption" sx={miniAvatarTextSx}>{pu.user.initials}</Typography>,
                    `${pu.user.name} — Can edit`,
                    pu.user.color
                )
            )}
            {users.filter(pu => pu.role === "viewer").slice(0, 1).map(pu =>
                miniAvatar(pu.user.id + "_v",
                    <Typography variant="caption" sx={miniAvatarTextSx}>{pu.user.initials}</Typography>,
                    `${pu.user.name} — Can view`,
                    pu.user.color
                )
            )}
            {everyoneRole !== "restricted" &&
                miniAvatar("everyone",
                    <SvgIcon sx={iconSz}><FontAwesomeIcon icon={faUsers} /></SvgIcon>,
                    `Everyone in your account — Can ${everyoneRole === "editor" ? "edit" : "view"}`
                )
            }
        </Box>
    );
}

const miniAvatarBaseSx: SxProps<Theme> = {
    width: 20,
    height: 20,
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
};

const miniAvatarSmallSx: SxProps<Theme> = {
    width: 16,
    height: 16,
    borderRadius: "2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
};

const miniAvatarTextSx: SxProps<Theme> = {
    lineHeight: 1,
    fontWeight: 600
};

const permAvatarGroupSx: SxProps<Theme> = {
    display: "flex",
    gap: "3px",
    alignItems: "center"
};

const permPrivateLabelSx: SxProps<Theme> = {
    color: "text.secondary",
    lineHeight: 1,
    ml: "4px"
};

const everyoneAvatarIconSx: SxProps<Theme> = {
    fontSize: 12,
    color: "text.primary"
};
