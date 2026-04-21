import { useState } from "react";
import {
    Box, Typography, IconButton, SvgIcon, Button,
    Paper, Tabs, Tab, Divider, Switch,
    Chip, List, ListItemButton, ListItemIcon, ListItemText
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft, faEllipsisVertical, faPen, faShareNodes,
    faCircleQuestion, faUser, faSquareList, faEnvelope,
    faCode, faDownload, faFileExport, faEye, faPaperPlane, faGlobe
} from "@fortawesome/pro-regular-svg-icons";
import {
    TruffleLink, TruffleAvatar, Label
} from "@sundaysky/smartvideo-hub-truffle-component-library";

const TEMPLATE_TITLE = "Digital Account Engagement Stylised video";

// ─── Component ────────────────────────────────────────────────────────────────
export default function TemplatePage({
    onNavigateBack
}: {
    onNavigateBack: () => void;
}) {
    const [activeTab, setActiveTab] = useState(0);
    const [downloadableEnabled, setDownloadableEnabled] = useState(false);

    return (
        <Box sx={pageRootSx}>

            {/* ── Left Drawer ─────────────────────────────────────────────────── */}
            <Box sx={drawerSx}>
                {/* Logo area */}
                <Box sx={logoAreaSx}>
                    <Typography variant="h5" color="secondary.main" noWrap>
                        SundaySky
                    </Typography>
                </Box>

                {/* Video details */}
                <Box sx={drawerDetailsSx}>
                    {/* Back link */}
                    <TruffleLink
                        href="#"
                        startIcon={
                            <SvgIcon sx={iconXsSx}>
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </SvgIcon>
                        }
                        onClick={(e) => {
                            e.preventDefault(); onNavigateBack(); 
                        }}
                        sx={{ color: "text.secondary" }}
                    >
                        Templates Library
                    </TruffleLink>

                    {/* Title row */}
                    <Box sx={titleRowSx}>
                        <Typography variant="subtitle2" sx={{ flex: 1 }}>
                            {TEMPLATE_TITLE}
                        </Typography>
                        <IconButton size="small" sx={iconBtnSx}>
                            <SvgIcon sx={iconSmSx}>
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                            </SvgIcon>
                        </IconButton>
                    </Box>

                    {/* Status badge */}
                    <Label label="Draft" color="default" size="small" />

                    {/* Nav actions */}
                    <List disablePadding sx={navListSx}>
                        <ListItemButton sx={navItemSx}>
                            <ListItemIcon sx={navIconSx}>
                                <SvgIcon sx={iconSmSx}>
                                    <FontAwesomeIcon icon={faPen} />
                                </SvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="Edit" primaryTypographyProps={{ variant: "body1" }} />
                        </ListItemButton>
                        <ListItemButton sx={navItemSx}>
                            <ListItemIcon sx={navIconSx}>
                                <SvgIcon sx={iconSmSx}>
                                    <FontAwesomeIcon icon={faShareNodes} />
                                </SvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="Share" primaryTypographyProps={{ variant: "body1" }} />
                        </ListItemButton>
                    </List>
                </Box>
            </Box>

            {/* ── Main content column (AppBar + content row) ───────────────────── */}
            <Box sx={mainColumnSx}>

                {/* AppBar */}
                <Box sx={appBarSx}>
                    <Typography variant="subtitle2" color="secondary.main">
                        Template Page
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton size="small" sx={iconBtnSx}>
                            <SvgIcon sx={iconSmSx}>
                                <FontAwesomeIcon icon={faGlobe} />
                            </SvgIcon>
                        </IconButton>
                        <Typography variant="body1" color="text.secondary">
                            Website
                        </Typography>
                        <IconButton size="small" sx={iconBtnSx}>
                            <SvgIcon sx={iconSmSx}>
                                <FontAwesomeIcon icon={faCircleQuestion} />
                            </SvgIcon>
                        </IconButton>
                    </Box>
                </Box>

                {/* Content row */}
                <Box sx={contentRowSx}>

                    {/* ── Center content ────────────────────────────────────────── */}
                    <Box sx={centerContentSx}>
                        {/* Action buttons */}
                        <Box sx={actionButtonsRowSx}>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={
                                    <SvgIcon sx={iconSmSx}>
                                        <FontAwesomeIcon icon={faPen} />
                                    </SvgIcon>
                                }
                            >
                                Edit
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={
                                    <SvgIcon sx={iconSmSx}>
                                        <FontAwesomeIcon icon={faPaperPlane} />
                                    </SvgIcon>
                                }
                            >
                                Publish to Amplify
                            </Button>
                        </Box>

                        {/* Video thumbnail */}
                        <Box sx={videoThumbWrapperSx}>
                            <Box
                                component="img"
                                src="/thumb.svg"
                                alt="Template preview"
                                sx={videoThumbImgSx}
                            />
                        </Box>

                        {/* Metadata */}
                        <Box sx={metadataSx}>
                            {/* Row 1: Last Edited | Personalization */}
                            <Box sx={metaRowSx}>
                                <Box sx={metaItemSx}>
                                    <TruffleAvatar text="OP" size="large" />
                                    <Box sx={{ ml: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Last Edited
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">—</Typography>
                                    </Box>
                                </Box>
                                <Divider orientation="vertical" flexItem />
                                <Box sx={metaItemSx}>
                                    <TruffleAvatar
                                        icon={
                                            <SvgIcon>
                                                <FontAwesomeIcon icon={faUser} />
                                            </SvgIcon>
                                        }
                                        size="large"
                                    />
                                    <Box sx={{ ml: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Personalization
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">—</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Divider />

                            {/* Template details */}
                            <Box sx={metaDetailRowSx}>
                                <TruffleAvatar
                                    icon={
                                        <SvgIcon>
                                            <FontAwesomeIcon icon={faSquareList} />
                                        </SvgIcon>
                                    }
                                    size="large"
                                />
                                <Box sx={{ ml: 1.5, flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Template details
                                    </Typography>
                                    <Typography variant="body1" noWrap>
                                        {TEMPLATE_TITLE}
                                    </Typography>
                                    <Box sx={tagsRowSx}>
                                        <Chip label="Purpose" size="small" />
                                        <Chip label="Industry" size="small" />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* ── Right Panel ───────────────────────────────────────────── */}
                    <Box sx={rightPanelSx}>

                        {/* Card 1: Review / Publish tabs */}
                        <Paper sx={rightCardSx}>
                            <Tabs
                                value={activeTab}
                                onChange={(_, v) => setActiveTab(v as number)}
                                sx={{ mb: 0.5 }}
                            >
                                <Tab label="Review draft" />
                                <Tab label="View published template" />
                            </Tabs>

                            {activeTab === 0 && (
                                <List disablePadding>
                                    {REVIEW_ITEMS.map(({ icon, label }) => (
                                        <ListItemButton key={label} sx={rightListItemSx}>
                                            <ListItemIcon sx={navIconSx}>
                                                <SvgIcon sx={iconSmSx}>
                                                    <FontAwesomeIcon icon={icon} />
                                                </SvgIcon>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={label}
                                                primaryTypographyProps={{ variant: "body1" }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            )}
                        </Paper>

                        {/* Card 2: Sharing options */}
                        <Paper sx={rightCardSx}>
                            <Box sx={sharingTitleRowSx}>
                                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                                    Set up ways Contributors can share video
                                </Typography>
                                <IconButton size="small" sx={iconBtnSx}>
                                    <SvgIcon sx={iconSmSx}>
                                        <FontAwesomeIcon icon={faCircleQuestion} />
                                    </SvgIcon>
                                </IconButton>
                            </Box>

                            <List disablePadding>
                                {/* Landing Page */}
                                <ListItemButton sx={sharingItemSx}>
                                    <ListItemIcon sx={navIconSx}>
                                        <SvgIcon sx={iconSmSx}>
                                            <FontAwesomeIcon icon={faGlobe} />
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="SundaySky Landing Page"
                                        primaryTypographyProps={{ variant: "body1" }}
                                    />
                                    <Button variant="text" size="small" color="primary" sx={{ flexShrink: 0 }}>
                                        Set up
                                    </Button>
                                </ListItemButton>

                                {/* Embed */}
                                <ListItemButton sx={sharingItemSx}>
                                    <ListItemIcon sx={navIconSx}>
                                        <SvgIcon sx={iconSmSx}>
                                            <FontAwesomeIcon icon={faCode} />
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Embed on your website"
                                        primaryTypographyProps={{ variant: "body1" }}
                                    />
                                    <Button variant="text" size="small" color="primary" sx={{ flexShrink: 0 }}>
                                        Set up
                                    </Button>
                                </ListItemButton>

                                <Divider />

                                {/* Email */}
                                <ListItemButton sx={sharingItemSx}>
                                    <ListItemIcon sx={navIconSx}>
                                        <SvgIcon sx={iconSmSx}>
                                            <FontAwesomeIcon icon={faEnvelope} />
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Email template"
                                        secondary="For use with any provider"
                                        primaryTypographyProps={{ variant: "body1" }}
                                        secondaryTypographyProps={{ variant: "body2" }}
                                    />
                                    <Button variant="text" size="small" color="primary" sx={{ flexShrink: 0 }}>
                                        Set up
                                    </Button>
                                </ListItemButton>

                                <Divider />

                                {/* Downloadable MP4 */}
                                <Box sx={sharingItemSx}>
                                    <ListItemIcon sx={navIconSx}>
                                        <SvgIcon sx={iconSmSx}>
                                            <FontAwesomeIcon icon={faDownload} />
                                        </SvgIcon>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Downloadable MP4"
                                        secondary="Analytics won't be collected"
                                        primaryTypographyProps={{ variant: "body1" }}
                                        secondaryTypographyProps={{ variant: "body2" }}
                                    />
                                    <Switch
                                        size="small"
                                        checked={downloadableEnabled}
                                        onChange={(e) => setDownloadableEnabled(e.target.checked)}
                                        color="primary"
                                    />
                                </Box>
                            </List>
                        </Paper>

                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const REVIEW_ITEMS = [
    { icon: faEye, label: "Preview as Contributor" },
    { icon: faFileExport, label: "Export script" },
    { icon: faDownload, label: "Download MP4" }
] as const;

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageRootSx: SxProps<Theme> = {
    display: "flex",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    bgcolor: "other.editorBackground"
};

const drawerSx: SxProps<Theme> = {
    width: 266,
    flexShrink: 0,
    height: "100%",
    bgcolor: "background.paper",
    borderRight: "1px solid",
    borderColor: "divider",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    overflowX: "hidden"
};

const logoAreaSx: SxProps<Theme> = {
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderBottom: "1px solid",
    borderColor: "divider",
    px: 2.5
};

const drawerDetailsSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    px: 2.5,
    pt: 3,
    pb: 3
};

const titleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "flex-start",
    gap: 0.5
};

const iconBtnSx: SxProps<Theme> = {
    color: "text.secondary",
    p: "4px"
};

const iconSmSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important"
};

const iconXsSx: SxProps<Theme> = {
    fontSize: "12px !important",
    width: "12px !important",
    height: "12px !important"
};

const navListSx: SxProps<Theme> = {
    mx: -1
};

const navItemSx: SxProps<Theme> = {
    borderRadius: 1,
    px: 1,
    py: 0.5,
    gap: 0.5
};

const navIconSx: SxProps<Theme> = {
    minWidth: 0,
    mr: 1,
    color: "text.secondary"
};

const mainColumnSx: SxProps<Theme> = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
};

const appBarSx: SxProps<Theme> = {
    height: 56,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 4,
    bgcolor: "other.editorBackground",
    borderBottom: "1px solid",
    borderColor: "divider"
};

const contentRowSx: SxProps<Theme> = {
    flex: 1,
    display: "flex",
    overflow: "hidden"
};

const centerContentSx: SxProps<Theme> = {
    flex: 1,
    minWidth: 0,
    overflowY: "auto",
    px: 4,
    py: 3,
    display: "flex",
    flexDirection: "column",
    gap: 2
};

const actionButtonsRowSx: SxProps<Theme> = {
    display: "flex",
    gap: 1.5,
    justifyContent: "flex-end"
};

const videoThumbWrapperSx: SxProps<Theme> = {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: 1,
    overflow: "hidden",
    bgcolor: "action.hover",
    border: "1px solid",
    borderColor: "divider"
};

const videoThumbImgSx: SxProps<Theme> = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
};

const metadataSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    bgcolor: "background.paper",
    borderRadius: 1,
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden"
};

const metaRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center"
};

const metaItemSx: SxProps<Theme> = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    px: 2,
    py: 1.5
};

const metaDetailRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "flex-start",
    px: 2,
    py: 1.5
};

const tagsRowSx: SxProps<Theme> = {
    display: "flex",
    flexWrap: "wrap",
    gap: 1,
    mt: 0.75
};

const rightPanelSx: SxProps<Theme> = {
    width: 340,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    overflowY: "auto",
    p: 3
};

const rightCardSx: SxProps<Theme> = {
    p: 2,
    flexShrink: 0
};

const rightListItemSx: SxProps<Theme> = {
    borderRadius: 1,
    px: 1,
    py: 1,
    gap: 0.5
};

const sharingTitleRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "flex-start",
    gap: 1,
    mb: 1
};

const sharingItemSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    px: 1,
    py: 1,
    borderRadius: 1,
    gap: 0.5
};
