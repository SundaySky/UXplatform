import { useState } from "react";
import {
    Box, Button, List, ListItemButton, ListItemIcon, ListItemText, Menu, SvgIcon, ToggleButton, ToggleButtonGroup
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faAnalytics, faFilm, faLayerGroup, faLightbulbOn, faPhotoFilm } from "@fortawesome/pro-regular-svg-icons";
import { Label, TruffleMenuItem } from "@sundaysky/smartvideo-hub-truffle-component-library";
import CreateTemplateDialog from "../dialogs/CreateTemplateDialog";

const IMG_LOGO = "/newNavLogo.svg";
const IMG_NAV_VIDEOS = "/videos-nav.svg";
const IMG_NAV_TEMPLATE = "/left-panel-template.svg";

type NavIcon = { kind: "fa"; icon: IconDefinition } | { kind: "img"; src: string };
const NAV_ITEMS: { icon: NavIcon; label: string }[] = [
    { icon: { kind: "img", src: IMG_NAV_VIDEOS }, label: "Video Library" },
    { icon: { kind: "img", src: IMG_NAV_TEMPLATE }, label: "Template Library" },
    { icon: { kind: "fa", icon: faPhotoFilm }, label: "Media" },
    { icon: { kind: "fa", icon: faLightbulbOn }, label: "Inspiration Gallery" },
    { icon: { kind: "fa", icon: faAnalytics }, label: "Analytics" }
];

export default function AppSidebar({
    onTemplateLibraryClick,
    onVideoLibraryClick,
    onTemplateCreated,
    selectedNav = "Video Library"
}: {
    onTemplateLibraryClick?: () => void;
    onVideoLibraryClick?: () => void;
    onTemplateCreated?: (name: string) => void;
    selectedNav?: string;
}) {
    const [createMenuAnchor, setCreateMenuAnchor] = useState<HTMLElement | null>(null);
    const [createType, setCreateType] = useState<"video" | "template">("video");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    return (
        <Box sx={sidebarSx}>
            {/* Logo area */}
            <Box sx={sidebarLogoBoxSx}>
                <Box component="img" src={IMG_LOGO} alt="SundaySky" sx={sidebarLogoImgSx} />
            </Box>

            {/* Create button */}
            <Button
                variant="contained"
                color="gradient"
                size="large"
                sx={createButtonSx}
                onClick={e => setCreateMenuAnchor(e.currentTarget)}
            >
                Create
            </Button>

            {/* Create dropdown menu */}
            <Menu
                anchorEl={createMenuAnchor}
                open={Boolean(createMenuAnchor)}
                onClose={() => setCreateMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                slotProps={{ paper: { elevation: 11, sx: createMenuPaperSx } }}
            >
                <Box sx={createMenuInnerSx}>
                    <ToggleButtonGroup
                        value={createType}
                        exclusive
                        onChange={(_e, val) => {
                            if (val) {
                                setCreateType(val);
                            }
                        }}
                        fullWidth
                        sx={createTypeToggleGroupSx}
                    >
                        <ToggleButton value="video" sx={createTypeToggleBtnSx}>
                            <SvgIcon sx={createTypeToggleIconSx}><FontAwesomeIcon icon={faFilm} /></SvgIcon>
                            Video
                        </ToggleButton>
                        <ToggleButton value="template" sx={createTypeToggleBtnSx}>
                            <SvgIcon sx={createTypeToggleIconSx}><FontAwesomeIcon icon={faLayerGroup} /></SvgIcon>
                            Template
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {createType === "video" ? (
                        <>
                            <TruffleMenuItem onClick={() => setCreateMenuAnchor(null)}>+ From scratch</TruffleMenuItem>
                            <TruffleMenuItem onClick={() => setCreateMenuAnchor(null)}>Write a prompt</TruffleMenuItem>
                            <TruffleMenuItem onClick={() => setCreateMenuAnchor(null)}>Upload a document</TruffleMenuItem>
                            <TruffleMenuItem
                                onClick={() => setCreateMenuAnchor(null)}
                                secondaryAction={<Label label="Coming soon" color="default" size="small" />}
                            >
                                Use script
                            </TruffleMenuItem>
                            <TruffleMenuItem onClick={() => setCreateMenuAnchor(null)}>Get inspired</TruffleMenuItem>
                        </>
                    ) : (
                        <>
                            <TruffleMenuItem onClick={() => {
                                setCreateMenuAnchor(null); setCreateDialogOpen(true);
                            }}>+ From scratch</TruffleMenuItem>
                            <TruffleMenuItem
                                onClick={() => setCreateMenuAnchor(null)}
                                secondaryAction={<Label label="Coming soon" color="default" size="small" />}
                            >
                                Get inspired
                            </TruffleMenuItem>
                        </>
                    )}
                </Box>
            </Menu>

            <CreateTemplateDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                mode="create"
                onSubmit={(data) => {
                    setCreateDialogOpen(false);
                    onTemplateCreated?.(data.name || "New template");
                }}
            />

            {/* Nav items */}
            <List disablePadding sx={sidebarListSx}>
                {NAV_ITEMS.map(({ icon, label }) => (
                    <ListItemButton
                        key={label}
                        selected={label === selectedNav}
                        sx={navItemButtonSx}
                        onClick={
                            label === "Template Library" ? onTemplateLibraryClick :
                                label === "Video Library" ? onVideoLibraryClick :
                                    undefined
                        }
                    >
                        <Box sx={navItemContentSx}>
                            <ListItemIcon sx={navItemIconSx}>
                                {icon.kind === "img"
                                    ? <Box component="img" src={icon.src} alt="" sx={navItemImgSx} />
                                    : <SvgIcon sx={navItemIconSvgSx}>
                                        <FontAwesomeIcon icon={icon.icon} />
                                    </SvgIcon>
                                }
                            </ListItemIcon>
                            <ListItemText
                                primary={label}
                                sx={navItemTextRootSx}
                                primaryTypographyProps={{
                                    variant: "body1",
                                    sx: navItemTextSx
                                }}
                            />
                        </Box>
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
}

const sidebarSx: SxProps<Theme> = (theme) => ({
    width: "112px",
    flexShrink: 0,
    background: `linear-gradient(to top, ${(theme.palette as unknown as { brand: { gradientBlackBlue: string } }).brand.gradientBlackBlue})`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    overflow: "hidden"
});

const sidebarLogoBoxSx: SxProps<Theme> = {
    py: "24px",
    px: "25px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    cursor: "pointer",
    "&:hover": { opacity: 0.8 }
};

const sidebarLogoImgSx: SxProps<Theme> = {
    width: "auto",
    height: 62,
    display: "block"
};

const createButtonSx: SxProps<Theme> = {
    mt: "10px",
    mb: "24px",
    width: "80px"
};

const sidebarListSx: SxProps<Theme> = {
    width: "100%"
};

const navItemButtonSx: SxProps<Theme> = (theme) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    px: "4px",
    py: "12px",
    width: "100%",
    "&.Mui-selected": {
        bgcolor: alpha(theme.palette.secondary.dark, 0.25)
    },
    "&:hover": {
        bgcolor: alpha(theme.palette.common.white, theme.palette.action.hoverOpacity),
        "&.Mui-selected": {
            bgcolor: alpha(theme.palette.common.white,
                theme.palette.action.hoverOpacity + theme.palette.action.selectedOpacity)
        }
    }
});

const navItemContentSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    width: "100%"
};

const navItemIconSx: SxProps<Theme> = {
    minWidth: "unset",
    justifyContent: "center",
    color: "common.white"
};

const navItemTextRootSx: SxProps<Theme> = {
    "& .MuiListItemText-primary": {
        color: "common.white",
        whiteSpace: "normal"
    }
};

const navItemTextSx: SxProps<Theme> = {
    textAlign: "center",
    lineHeight: 1.3,
    wordBreak: "break-word"
};

const navItemIconSvgSx: SxProps<Theme> = {
    fontSize: 24,
    color: "inherit"
};

const navItemImgSx: SxProps<Theme> = {
    width: 24,
    height: 24,
    display: "block"
};

const createMenuPaperSx: SxProps<Theme> = {
    minWidth: 262,
    borderRadius: "8px"
};

const createMenuInnerSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    p: 1
};

const createTypeToggleGroupSx: SxProps<Theme> = {
    mb: 1
};

const createTypeToggleBtnSx: SxProps<Theme> = {
    gap: "6px",
    textTransform: "none",
    flex: 1
};

const createTypeToggleIconSx: SxProps<Theme> = {
    fontSize: "14px !important",
    width: "14px !important",
    height: "14px !important"
};
