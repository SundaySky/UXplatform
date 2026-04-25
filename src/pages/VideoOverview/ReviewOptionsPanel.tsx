import { useState } from "react";
import {
    Box, List, ListItemButton, ListItemIcon, ListItemText, Paper, SvgIcon, Tooltip, Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowDown, faArrowsRotate, faCircleInfo, faCircleQuestion, faFileExport, faLink, faMicrophone, faPalette,
    faTriangleExclamation, faUsers
} from "@fortawesome/pro-regular-svg-icons";
import {
    AttentionBox, AttentionBoxActions, AttentionBoxContent, AttentionBoxTitle, Label, TruffleLink
} from "@sundaysky/smartvideo-hub-truffle-component-library";

function UpdatedLabel() {
    return <Label label="Updated" color="info" />;
}

// Layout per Figma 19047:29100 (top → bottom):
//   1. Review options
//   2. Account libraries updated
//   3. Approval in progress AttentionBox (pending state only)
export default function ReviewOptionsPanel({ isPending }: { isPending: boolean }) {
    const [attentionDismissed, setAttentionDismissed] = useState(false);

    return (
        <Box sx={reviewPanelContainerSx}>

            {/* 1. Review options */}
            <Paper variant="outlined" sx={reviewPaperSx}>
                <Box sx={reviewPanelHeaderRowSx}>
                    <Typography variant="subtitle2" sx={reviewPanelTitleSx}>
                        Send video for review (single version)
                    </Typography>
                    <Tooltip title="Options for reviewing this video">
                        <SvgIcon sx={panelInfoIconSx}>
                            <FontAwesomeIcon icon={faCircleInfo} />
                        </SvgIcon>
                    </Tooltip>
                </Box>
                <List disablePadding dense>
                    {[
                        { icon: faLink, label: "Get a Preview Link" },
                        { icon: faFileExport, label: "Export a script" },
                        { icon: faArrowDown, label: "Download a draft" }
                    ].map(({ icon, label }) => (
                        <ListItemButton key={label} dense sx={reviewListItemButtonSx}>
                            <ListItemIcon sx={reviewListItemIconContainerSx}>
                                <SvgIcon sx={panelListIconSx}>
                                    <FontAwesomeIcon icon={icon} />
                                </SvgIcon>
                            </ListItemIcon>
                            <ListItemText primary={label} primaryTypographyProps={{ variant: "body1" }} />
                        </ListItemButton>
                    ))}
                </List>
            </Paper>

            {/* 2. Account libraries updated */}
            <Paper variant="outlined" sx={reviewPaperSx}>
                <Box sx={reviewPanelHeader2RowSx}>
                    <Box sx={reviewPanelHeader2InnerSx}>
                        <SvgIcon sx={updatedIconSx}>
                            <FontAwesomeIcon icon={faArrowsRotate} />
                        </SvgIcon>
                        <Typography variant="subtitle2" sx={textPrimaryColorSx}>
                            Account libraries updated
                        </Typography>
                    </Box>
                    <Tooltip title="About account library updates">
                        <SvgIcon sx={panelInfoIconSx}>
                            <FontAwesomeIcon icon={faCircleQuestion} />
                        </SvgIcon>
                    </Tooltip>
                </Box>
                <Typography sx={textSecondaryColorSx}>
          Review this version before approving and sharing to ensure any changes affecting this video are acceptable.
                </Typography>
                <List disablePadding dense>
                    {[
                        { icon: faPalette, label: "\"<brand name>\"" },
                        { icon: faUsers, label: "\"<data library name>\"" },
                        { icon: faMicrophone, label: "Word pronunciation" }
                    ].map(({ icon, label }) => (
                        <Box key={label} sx={reviewLibraryItemRowSx}>
                            <ListItemIcon sx={reviewListItemIconContainerSx}>
                                <SvgIcon sx={panelListIconSx}>
                                    <FontAwesomeIcon icon={icon} />
                                </SvgIcon>
                            </ListItemIcon>
                            <Typography variant="caption" sx={reviewLibraryItemLabelSx}>
                                {label}
                            </Typography>
                            <UpdatedLabel />
                        </Box>
                    ))}
                </List>
            </Paper>

            {/* 3. Approval in progress AttentionBox */}
            {isPending && !attentionDismissed && (
                <AttentionBox
                    color="warning"
                    icon={<SvgIcon><FontAwesomeIcon icon={faTriangleExclamation} /></SvgIcon>}
                    CloseIconButtonProps={{ onClick: () => setAttentionDismissed(true) }}
                    HelpCenterIconButtonProps={{ onClick: () => {} }}
                >
                    <AttentionBoxTitle>Approval in progress</AttentionBoxTitle>
                    <AttentionBoxContent>
                        <Typography variant="body1">
                            Approval request sent to the approver. You can also share the video using the link.
                        </Typography>
                    </AttentionBoxContent>
                    <AttentionBoxActions>
                        <TruffleLink startIcon={<SvgIcon sx={truffleLinkIconSx}><FontAwesomeIcon icon={faLink} /></SvgIcon>}>Share video using link</TruffleLink>
                    </AttentionBoxActions>
                </AttentionBox>
            )}
        </Box>
    );
}

const textPrimaryColorSx: SxProps<Theme> = { color: "text.primary" };
const textSecondaryColorSx: SxProps<Theme> = { color: "text.secondary" };
const reviewPanelContainerSx: SxProps<Theme> = {
    display: "flex", flexDirection: "column", gap: 2, width: 340, flexShrink: 0
};
const reviewPaperSx: SxProps<Theme> = {
    borderRadius: 2, borderColor: "divider", bgcolor: "background.paper",
    p: 2, display: "flex", flexDirection: "column", gap: 1
};
const reviewPanelHeaderRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "4px", height: 30, minHeight: 30
};
const reviewPanelTitleSx: SxProps<Theme> = { color: "text.primary", whiteSpace: "nowrap" };
const panelInfoIconSx: SxProps<Theme> = { fontSize: "16px !important", width: "16px !important", height: "16px !important", color: "action.active", cursor: "pointer" };
const reviewListItemButtonSx: SxProps<Theme> = { borderRadius: 1, px: 1, py: "4px" };
const reviewListItemIconContainerSx: SxProps<Theme> = { minWidth: 28 };
const panelListIconSx: SxProps<Theme> = { fontSize: "16px !important", width: "16px !important", height: "16px !important", color: "action.active" };
const reviewPanelHeader2RowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", justifyContent: "space-between", height: 30, minHeight: 30
};
const reviewPanelHeader2InnerSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "4px" };
const updatedIconSx: SxProps<Theme> = { fontSize: "16px !important", width: "16px !important", height: "16px !important", color: "info.main" };
const reviewLibraryItemRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", px: 1, py: "4px", gap: 1 };
const reviewLibraryItemLabelSx: SxProps<Theme> = {
    color: "text.secondary", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
};
const truffleLinkIconSx: SxProps<Theme> = { fontSize: "14px !important", width: "14px !important", height: "14px !important" };
