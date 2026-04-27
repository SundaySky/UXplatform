import { useState } from "react";
import { Box, Button, Divider, Menu, SvgIcon, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowsRotate, faCircleInfo, faComment, faEllipsisVertical, faFilm, faFolder, faPaste, faPen, faPlay, faUsers
} from "@fortawesome/pro-regular-svg-icons";
import {
    Label, ThumbnailActions, TruffleIconButton, TruffleMenuItem, TypographyWithTooltipOnOverflow
} from "@sundaysky/smartvideo-hub-truffle-component-library";

const IMG_THUMB = "/thumb.svg";

export interface TemplateItem {
    title: string;
    editedBy: string;
    status: "Published" | "Draft";
    personalized?: boolean;
    hasNewDraft?: boolean;
    /** Optional dashed-pill label below the edited line (e.g. "Pending approval"). */
    versionStatus?: string;
    /** Optional comments count rendered as an info pill next to the version status. */
    commentsCount?: number;
    purposeLabels: string[];
}

// Truffle Label has no dashed-border variant
function DashedLabel({ label }: { label: string }) {
    return (
        <Box sx={dashedLabelSx}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
    );
}

export default function TemplateCard({ template, onClick, singleLineTitle = false }: { template: TemplateItem; onClick?: (name: string) => void; singleLineTitle?: boolean }) {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const openMenu = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setMenuAnchor(e.currentTarget);
    };

    return (
        <Box
            sx={templateCardSx}
            onClick={() => onClick?.(template.title)}
            role="button"
            tabIndex={0}
        >
            <ThumbnailActions
                ContentProps={{ sx: thumbContentSx }}
                showActions="onHover"
                leftActions={
                    <Box sx={thumbLeftActionsSx}>
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
                        <Button
                            variant="contained"
                            color="white"
                            size="small"
                            startIcon={<FontAwesomeIcon icon={faPen} />}
                        >
                            Edit
                        </Button>
                    </Box>
                }
                sx={thumbnailActionsSx}
            >
                <Box component="img" src={IMG_THUMB} alt="" sx={thumbImgSx} />
                {/* Status labels overlaid at bottom-left of thumbnail */}
                <Box sx={thumbnailLabelsOverlaySx}>
                    <Label
                        label={template.status}
                        color={template.status === "Published" ? "success" : "default"}
                        size="small"
                        startIcon={
                            <SvgIcon sx={labelIconSx}>
                                <FontAwesomeIcon icon={template.status === "Published" ? faArrowsRotate : faFilm} />
                            </SvgIcon>
                        }
                    />
                    {template.personalized && (
                        <Label
                            label="Personalized"
                            size="small"
                            variant="outlined"
                            startIcon={
                                <SvgIcon sx={labelIconSx}>
                                    <FontAwesomeIcon icon={faUsers} />
                                </SvgIcon>
                            }
                            sx={{ bgcolor: "background.paper" }}
                        />
                    )}
                </Box>
            </ThumbnailActions>

            {/* Card body */}
            <Box sx={cardBodySx}>
                <Box sx={cardTitleRowSx}>
                    <TypographyWithTooltipOnOverflow
                        variant="h5"
                        multiline={!singleLineTitle}
                        sx={singleLineTitle ? cardTitleSingleLineSx : cardTitleSx}
                    >
                        {template.title}
                    </TypographyWithTooltipOnOverflow>
                    <TruffleIconButton
                        size="small"
                        onClick={openMenu}
                        sx={threeDotsBtnSx}
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                    >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </TruffleIconButton>
                </Box>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {template.editedBy}
                </Typography>
                {/* Dashed pill + optional comments info pill.
                    Always rendered (placeholder when empty) to keep card heights aligned. */}
                {(() => {
                    const text = template.versionStatus ?? (template.hasNewDraft ? "New version draft" : null);
                    const comments = template.commentsCount;
                    const showRow = text !== null || (comments !== undefined && comments > 0);
                    return (
                        <Box sx={{ display: "flex", gap: "6px", alignItems: "center", visibility: showRow ? "visible" : "hidden" }}>
                            <DashedLabel label={text ?? "—"} />
                            {comments !== undefined && comments > 0 && (
                                <Label
                                    label={`${comments} comments`}
                                    color="info"
                                    size="small"
                                    startIcon={<SvgIcon sx={labelIconSx}><FontAwesomeIcon icon={faComment} /></SvgIcon>}
                                />
                            )}
                        </Box>
                    );
                })()}
            </Box>

            {/* Context menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                onClick={(e) => e.stopPropagation()}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: menuPaperSx } }}
            >
                <Box sx={menuHeaderSx} onClick={(e) => e.stopPropagation()}>
                    <Typography variant="h5" sx={menuTitleSx}>{template.title}</Typography>
                    <Box sx={menuTagsRowSx}>
                        {template.purposeLabels.map((label) => (
                            <Label key={label} label={label} color="info" size="small" />
                        ))}
                    </Box>
                    <Box sx={menuLocationSx}>
                        <SvgIcon sx={menuFolderIconSx}>
                            <FontAwesomeIcon icon={faFolder} />
                        </SvgIcon>
                        <Typography variant="caption" color="text.secondary">
                            Template library
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={menuDividerSx} />
                <TruffleMenuItem onClick={() => {
                    setMenuAnchor(null); onClick?.(template.title);
                }}>
                    <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                    Details
                </TruffleMenuItem>
                <TruffleMenuItem onClick={() => setMenuAnchor(null)}>
                    <SvgIcon sx={menuItemIconSx}><FontAwesomeIcon icon={faPaste} /></SvgIcon>
                    Duplicate template
                </TruffleMenuItem>
            </Menu>
        </Box>
    );
}

const templateCardSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    p: 1,
    bgcolor: "background.paper",
    borderRadius: 1,
    "&:hover": { boxShadow: 24 },
    transition: "box-shadow 0.15s"
};

const thumbnailActionsSx: SxProps<Theme> = { width: "100%" };
const thumbContentSx: SxProps<Theme> = {
    aspectRatio: "16/9",
    width: "100%",
    overflow: "hidden"
};
const thumbImgSx: SxProps<Theme> = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block"
};
const thumbLeftActionsSx: SxProps<Theme> = {
    display: "flex",
    gap: "4px",
    alignItems: "center"
};
const thumbnailLabelsOverlaySx: SxProps<Theme> = {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
    zIndex: 1
};
const dashedLabelSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    border: "1px dashed",
    borderColor: "divider",
    borderRadius: "4px",
    px: 1,
    py: "2px"
};
const labelIconSx: SxProps<Theme> = {
    fontSize: "12px !important",
    width: "12px !important",
    height: "12px !important"
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
    gap: "6px"
};
const cardTitleSx: SxProps<Theme> = {
    flex: 1,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: "42px",
    lineHeight: 1.5
};

const cardTitleSingleLineSx: SxProps<Theme> = {
    flex: 1,
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: "21px",
    lineHeight: 1.5
};
const threeDotsBtnSx: SxProps<Theme> = {
    mt: "-2px",
    flexShrink: 0
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
const menuTitleSx: SxProps<Theme> = {
    color: "text.primary",
    lineHeight: 1.4,
    mb: "6px"
};
const menuTagsRowSx: SxProps<Theme> = {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
    mb: "6px"
};
const menuLocationSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "4px"
};
const menuFolderIconSx: SxProps<Theme> = {
    fontSize: "13px !important",
    width: "13px !important",
    height: "13px !important",
    color: "text.secondary"
};
const menuDividerSx: SxProps<Theme> = {
    my: "4px"
};
const menuItemIconSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "action.active",
    mr: 1
};
