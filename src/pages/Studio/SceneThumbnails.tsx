import { Box, SvgIcon, Typography, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faImage } from "@fortawesome/pro-regular-svg-icons";
import { ThumbnailActions, ThumbnailActionsIconButton } from "@sundaysky/smartvideo-hub-truffle-component-library";

const IMG_THUMB = "/thumb.svg";

export function SceneThumbnail({ index, selected, headingText, subheadingText, footnoteText, onClick }: { index: number; selected: boolean; headingText?: string; subheadingText?: string; footnoteText?: string; onClick?: () => void }) {
    return (
        <Box sx={sceneThumbnailWrapperSx}>
            <Typography variant="caption" sx={sceneThumbnailLabelSx}>Scene {index + 1}</Typography>
            <ThumbnailActions
                selected={selected}
                showActions="onHover"
                onClick={onClick}
                rightActions={
                    <ThumbnailActionsIconButton size="small">
                        <SvgIcon sx={{ fontSize: "14px !important", width: "14px !important", height: "14px !important" }}><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                    </ThumbnailActionsIconButton>
                }
                sx={sceneThumbnailOuterSx}
                ContentProps={{ sx: sceneThumbnailContentSx }}
            >
                <Box component="img" src={IMG_THUMB} alt="" sx={sceneThumbnailImgSx} />

                {/* Cover left half of SVG — white bg + pink accent line */}
                <Box sx={thumbLeftCoverSx}>
                    {/* Prototype-only scene accent — no real-app theme token */}
                    <Box sx={{ height: 3, bgcolor: "#C084FC", width: "100%" }} />
                </Box>

                {/* Right side — drag media */}
                <Box sx={thumbRightDragAreaSmSx}>
                    <SvgIcon sx={{ fontSize: "22px !important", color: "action.disabled" }}><FontAwesomeIcon icon={faImage} /></SvgIcon>
                    <Typography variant="caption" sx={{ fontSize: 7, color: "action.disabled" }}>
                Drag media here
                    </Typography>
                </Box>

                {/* Heading + sub-heading — flowing column */}
                <Box sx={thumbHeadingColumnSx}>
                    <Typography sx={{ fontFamily: "\"Inter\", sans-serif", fontWeight: 700, fontSize: "9cqw", color: "secondary.main", lineHeight: 1.2, wordBreak: "break-word" }}>
                        {headingText ?? ""}
                    </Typography>
                    <Typography sx={{ fontFamily: "\"Inter\", sans-serif", fontWeight: 400, fontSize: "4cqw", color: "text.primary", lineHeight: 1.4, wordBreak: "break-word", mt: "5%" }}>
                        {subheadingText ?? "Sub-heading Placeholder"}
                    </Typography>
                </Box>

                {/* Footnote */}
                <Box sx={thumbFootnoteBoxSx}>
                    <Typography sx={thumbFootnoteTypographySx}>
                        {footnoteText ?? "Footnote placeholder"}
                    </Typography>
                </Box>
            </ThumbnailActions>
        </Box>
    );
}

// Custom icon: corner handles + plus — matches the shared design
export function PlaceholderIcon({ size = 28, color }: { size?: number; color?: string }) {
    const theme = useTheme();
    const fill = color ?? theme.palette.primary.main;
    const d = size;
    const corner = d * 0.15; // corner square size
    const gap = d * 0.28; // inset from edge
    const arm = d * 0.12; // half-length of plus arms
    const cx = d / 2;
    return (
        <Box component="svg" width={d} height={d} viewBox={`0 0 ${d} ${d}`} fill="none" xmlns="http://www.w3.org/2000/svg" sx={{ display: "block", flexShrink: 0 }}>
            {/* Corner squares */}
            <rect x={0} y={0} width={corner} height={corner} rx={corner * 0.25} fill={fill} />
            <rect x={d - corner} y={0} width={corner} height={corner} rx={corner * 0.25} fill={fill} />
            <rect x={0} y={d - corner} width={corner} height={corner} rx={corner * 0.25} fill={fill} />
            <rect x={d - corner} y={d - corner} width={corner} height={corner} rx={corner * 0.25} fill={fill} />
            {/* Corner connector lines */}
            <line x1={corner} y1={corner * 0.5} x2={gap} y2={corner * 0.5} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={d - corner} y1={corner * 0.5} x2={d - gap} y2={corner * 0.5} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={corner * 0.5} y1={corner} x2={corner * 0.5} y2={gap} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={corner * 0.5} y1={d - corner} x2={corner * 0.5} y2={d - gap} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={d - corner * 0.5} y1={corner} x2={d - corner * 0.5} y2={gap} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={d - corner * 0.5} y1={d - corner} x2={d - corner * 0.5} y2={d - gap} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={corner} y1={d - corner * 0.5} x2={gap} y2={d - corner * 0.5} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            <line x1={d - corner} y1={d - corner * 0.5} x2={d - gap} y2={d - corner * 0.5} stroke={fill} strokeWidth={corner * 0.4} strokeLinecap="round" />
            {/* Plus sign */}
            <line x1={cx - arm} y1={cx} x2={cx + arm} y2={cx} stroke={fill} strokeWidth={corner * 0.6} strokeLinecap="round" />
            <line x1={cx} y1={cx - arm} x2={cx} y2={cx + arm} stroke={fill} strokeWidth={corner * 0.6} strokeLinecap="round" />
        </Box>
    );
}

export function CustomSceneThumbnail({ index, selected, onClick }: { index: number; selected: boolean; onClick?: () => void }) {
    return (
        <Box sx={sceneThumbnailWrapperSx}>
            <Typography variant="caption" sx={sceneThumbnailLabelSx}>Scene {index + 1}</Typography>
            <ThumbnailActions
                selected={selected}
                showActions="onHover"
                onClick={onClick}
                rightActions={
                    <ThumbnailActionsIconButton size="small">
                        <SvgIcon sx={{ fontSize: "14px !important", width: "14px !important", height: "14px !important" }}><FontAwesomeIcon icon={faEllipsisVertical} /></SvgIcon>
                    </ThumbnailActionsIconButton>
                }
                sx={sceneThumbnailOuterSx}
                ContentProps={{ sx: { ...sceneThumbnailContentSx, display: "flex", alignItems: "center", justifyContent: "center" } }}
            >
                <PlaceholderIcon size={28} />
            </ThumbnailActions>
        </Box>
    );
}

const sceneThumbnailWrapperSx: SxProps<Theme> = {
    width: 156,
    minWidth: 156,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start"
};

const sceneThumbnailOuterSx: SxProps<Theme> = { width: "100%" };

const sceneThumbnailContentSx: SxProps<Theme> = {
    width: "100%", aspectRatio: "16/9",
    bgcolor: "grey.100",
    position: "relative"
};

const sceneThumbnailLabelSx: SxProps<Theme> = {
    color: "text.secondary",
    letterSpacing: "0.4px",
    mb: "4px",
    px: "2px"
};

const sceneThumbnailImgSx: SxProps<Theme> = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
};

const thumbLeftCoverSx: SxProps<Theme> = {
    position: "absolute",
    inset: 0,
    width: "50%",
    bgcolor: "background.paper",
    pointerEvents: "none"
};

const thumbRightDragAreaSmSx: SxProps<Theme> = (theme) => ({
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "50%",
    background: `repeating-linear-gradient(-45deg, ${theme.palette.grey[200]} 0px, ${theme.palette.grey[200]} 6px, ${theme.palette.grey[300]} 6px, ${theme.palette.grey[300]} 12px)`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    pointerEvents: "none"
});

const thumbHeadingColumnSx: SxProps<Theme> = {
    position: "absolute",
    left: "4%",
    top: "18%",
    width: "44%",
    containerType: "inline-size",
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column"
};

const thumbFootnoteBoxSx: SxProps<Theme> = {
    position: "absolute",
    left: "4%",
    width: "44%",
    bottom: "5%",
    containerType: "inline-size",
    pointerEvents: "none"
};

const thumbFootnoteTypographySx: SxProps<Theme> = {
    fontFamily: "\"Open Sans\", sans-serif",
    fontWeight: 400,
    fontSize: "2.5cqw",
    letterSpacing: "0.4px",
    color: "text.secondary",
    lineHeight: 1.66
};
