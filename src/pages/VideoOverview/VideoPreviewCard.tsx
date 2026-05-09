import { useLayoutEffect, useRef, useState } from "react";
import { Box, Button, Divider, Paper, SvgIcon, Tooltip, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleCheck, faFileExport, faGlobe, faImages, faPen, faUsers } from "@fortawesome/pro-regular-svg-icons";
import { TruffleAvatar } from "@sundaysky/smartvideo-hub-truffle-component-library";
import { TOTAL_COMMENT_COUNT } from "../Studio/CommentsPanel";
import { FLAG_BY_NAME } from "../../panels/LanguagesPanel";

const imgVideoPreview = "/thumb.svg";

const APPROVER_USERS: Record<string, string> = {
    sjohnson:   "Sarah Johnson",
    mchen:      "Michael Chen",
    erodriguez: "Emma Rodriguez",
    jwilson:    "James Wilson"
};

function CircularIconAvatar({ icon }: { icon: React.ReactNode }) {
    return (
        <Box sx={circularIconAvatarSx}>
            {icon}
        </Box>
    );
}

// Renders up to 2 lines of language chips. When chips can't all fit in 2
// lines, the trailing ones collapse into a "+N" chip whose tooltip lists the
// hidden languages. Measurement uses a hidden ghost row of all chips so each
// chip's natural width is known regardless of which chips are currently shown.
const CHIP_MAX_LINES = 2;
const CHIP_GAP = 4;

function LanguagesChipRow({ langs }: { langs: { name: string; flag: string }[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(langs.length);

    useLayoutEffect(() => {
        const compute = () => {
            const container = containerRef.current;
            const measure = measureRef.current;
            if (!container || !measure) {
                return;
            }
            const containerWidth = container.clientWidth;
            const children = Array.from(measure.children) as HTMLElement[];
            const overflowChip = children[children.length - 1];
            const chipWidths = children.slice(0, -1).map(c => c.offsetWidth);
            const overflowWidth = overflowChip ? overflowChip.offsetWidth : 0;

            // Walk chips and place them in up to CHIP_MAX_LINES, reserving room
            // on the last line for the "+N" chip if any chips would be hidden.
            let line = 0;
            let xInLine = 0;
            let placed = 0;
            for (let i = 0; i < chipWidths.length; i++) {
                const w = chipWidths[i];
                const gapBefore = xInLine > 0 ? CHIP_GAP : 0;
                // If the chip doesn't fit on the current line, try the next.
                if (xInLine + gapBefore + w > containerWidth) {
                    if (line + 1 >= CHIP_MAX_LINES) {
                        break;
                    }
                    line++;
                    xInLine = 0;
                }
                const finalGap = xInLine > 0 ? CHIP_GAP : 0;
                if (xInLine + finalGap + w > containerWidth) {
                    break;
                }
                // On the last allowed line, leave room for "+N" if more chips remain.
                const isLastChip = i === chipWidths.length - 1;
                const isLastLine = line === CHIP_MAX_LINES - 1;
                if (!isLastChip && isLastLine
                    && xInLine + finalGap + w + CHIP_GAP + overflowWidth > containerWidth) {
                    break;
                }
                xInLine += finalGap + w;
                placed++;
            }
            setVisibleCount(placed);
        };
        compute();
        const ro = new ResizeObserver(compute);
        if (containerRef.current) {
            ro.observe(containerRef.current);
        }
        return () => ro.disconnect();
    }, [langs]);

    const hidden = langs.slice(visibleCount);
    const showOverflow = hidden.length > 0;

    return (
        <Box sx={chipRowOuterSx}>
            {/* Hidden measurement row — same content as visible row + overflow chip,
                used only to read each chip's natural width. */}
            <Box ref={measureRef} sx={chipRowMeasureSx} aria-hidden>
                {langs.map(({ name, flag }) => (
                    <Box key={`m-${name}`} sx={languageChipSx}>
                        <Box component="span" sx={languageFlagSx}>{flag}</Box>
                        <Typography variant="caption" sx={textSecondaryColorSx}>{name}</Typography>
                    </Box>
                ))}
                <Box sx={languageChipSx}>
                    <Typography variant="caption" sx={textSecondaryColorSx}>+{langs.length}</Typography>
                </Box>
            </Box>

            {/* Visible row */}
            <Box ref={containerRef} sx={chipRowVisibleSx}>
                {langs.slice(0, visibleCount).map(({ name, flag }) => (
                    <Box key={name} sx={languageChipSx}>
                        <Box component="span" sx={languageFlagSx}>{flag}</Box>
                        <Typography variant="caption" sx={textSecondaryColorSx}>{name}</Typography>
                    </Box>
                ))}
                {showOverflow && (
                    <Tooltip
                        placement="top"
                        arrow
                        componentsProps={{
                            tooltip: { sx: chipOverflowTooltipSx },
                            arrow: { sx: darkTooltipArrowSx }
                        }}
                        title={
                            <Box sx={chipOverflowTooltipGridSx(hidden.length > 5)}>
                                {hidden.map(({ name, flag }) => (
                                    <Box key={name} sx={chipOverflowTooltipItemSx}>
                                        <Box component="span" sx={languageFlagSx}>{flag}</Box>
                                        <Typography variant="caption" sx={chipOverflowTooltipTextSx}>{name}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        }
                    >
                        <Box sx={languageChipSx}>
                            <Typography variant="caption" sx={textSecondaryColorSx}>+{hidden.length}</Typography>
                        </Box>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
}

export default function VideoPreviewCard({
    videoPhase,
    effectiveStatus,
    approvers,
    pendingTooltip,
    headingText,
    subheadingText,
    videoTitle,
    onSentForApproval,
    onEdit,
    onApproveVideo,
    approvalsEnabled = false,
    enabledLangs = []
}: {
  videoPhase: number
  effectiveStatus: "draft" | "pending" | "approved"
  approvers: string[]
  pendingTooltip: string
  headingText?: string
  subheadingText?: string
  videoTitle?: string
  onSentForApproval: () => void
  onEdit: (fromComments?: boolean) => void
  onApproveVideo: () => void
  approvalsEnabled?: boolean
  enabledLangs?: string[]
}) {
    function ActionButton() {
        // Phase 0 + pending: after approval dialog sent
        if (videoPhase === 0 && effectiveStatus === "pending") {
            return (
                <Tooltip title={pendingTooltip} placement="top" arrow
                    componentsProps={{
                        tooltip: { sx: darkTooltipSx },
                        arrow:   { sx: darkTooltipArrowSx }
                    }}
                >
                    <Button variant="outlined" size="small" color="success"
                        startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>}
                    >
                        Pending approval
                    </Button>
                </Tooltip>
            );
        }

        // Phase 1: "1 of N approvers responded"
        if (videoPhase === 1) {
            const total = approvers.length;
            const respondedName = APPROVER_USERS[approvers[0]] ?? "Sarah Johnson";
            const pendingNames = approvers.slice(1).map(k => APPROVER_USERS[k] ?? k);
            return (
                <Tooltip
                    placement="top"
                    arrow
                    title={
                        <Box sx={tooltipContentBoxSx}>
                            <Typography sx={tooltipTextWithMbSx}>
                • {respondedName} left feedback on Mar 15
                            </Typography>
                            {pendingNames.map((name, i) => (
                                <Typography key={i} sx={{ color: "common.white", display: "block", mb: i === pendingNames.length - 1 ? "8px" : "2px" }}>
                  • {name} hasn't responded yet
                                </Typography>
                            ))}
                            <Typography sx={tooltipTextBlockSx}>
                Comments will be available once all approvers have responded.
                            </Typography>
                        </Box>
                    }
                    componentsProps={{
                        tooltip: { sx: darkTooltipPhase1Sx },
                        arrow:   { sx: darkTooltipArrowSx }
                    }}
                >
                    <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        onClick={() => onEdit(true)}
                        startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>}
                    >
                        1 of {total} approver{total !== 1 ? "s" : ""} responded
                    </Button>
                </Tooltip>
            );
        }

        // Phase 2: View comments in Studio
        if (videoPhase === 2) {
            return (
                <Button variant="contained" size="small" color="primary"
                    startIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
                            <path d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4C169.1 433.1 212.2 448 256 448c141.4 0 256-93.1 256-208S397.4 32 256 32z" />
                        </svg>
                    }
                    onClick={() => onEdit(true)}
                >
          View {TOTAL_COMMENT_COUNT} comments in Studio
                </Button>
            );
        }

        // Phase 4: already approved
        if (videoPhase === 4) {
            return (
                <Button
                    variant="text"
                    size="large"
                    color="success"
                    startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faCheck} /></SvgIcon>}
                    data-tracking-id="tracking-id-video-page-edit-tab-approve-version-btn"
                    disabled
                    sx={approveSuccessBgSx}
                >
                    Approved
                </Button>
            );
        }

        // Phase 3: ready for approval
        if (videoPhase === 3) {
            return (
                <Tooltip
                    title="Allows you to share the video with viewers"
                    placement="top"
                    arrow
                    componentsProps={{
                        tooltip: { sx: darkTooltipSx },
                        arrow:   { sx: darkTooltipArrowSx }
                    }}
                >
                    <Button
                        variant="outlined"
                        size="large"
                        color="primary"
                        startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faCheck} /></SvgIcon>}
                        onClick={onApproveVideo}
                        data-tracking-id="tracking-id-video-page-edit-tab-approve-version-btn"
                    >
                        Approve
                    </Button>
                </Tooltip>
            );
        }

        // Phase 0, draft: depends on approvalsEnabled
        if (!approvalsEnabled) {
            return (
                <Button variant="outlined" size="large" color="primary"
                    startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faCheck} /></SvgIcon>}
                    onClick={onApproveVideo}
                    data-tracking-id="tracking-id-video-page-edit-tab-approve-version-btn"
                >
                    Approve
                </Button>
            );
        }

        return (
            <Button variant="contained" size="small" color="primary"
                startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faCircleCheck} /></SvgIcon>}
                onClick={onSentForApproval}
            >
                Submit for approval
            </Button>
        );
    }

    return (
        <Paper variant="outlined" sx={videoPreviewCardPaperSx}>
            {/* Action bar */}
            <Box sx={cardActionBarSx}>
                <Button
                    variant="outlined"
                    size="large"
                    color="primary"
                    startIcon={<SvgIcon sx={buttonStartIconSx}><FontAwesomeIcon icon={faPen} /></SvgIcon>}
                    onClick={() => onEdit(false)}
                >
                    Edit
                </Button>

                <ActionButton />
            </Box>

            <Divider sx={dividerSx} />

            {/* Preview */}
            <Box sx={previewContainerSx}>
                <Box component="img" src={imgVideoPreview} alt={videoTitle ?? "Video preview"}
                    sx={previewImgSx} />

                <Box sx={previewLeftHalfSx}>
                    <Box sx={previewAccentLineSx} />
                </Box>

                <Box sx={previewRightHalfSx}>
                    <SvgIcon sx={previewDragIconSx}>
                        <FontAwesomeIcon icon={faImages} />
                    </SvgIcon>
                    <Typography variant="caption" sx={previewDragTextSx}>
                        Drag media here
                    </Typography>
                </Box>

                <Box sx={previewTextOverlaySx}>
                    <Typography sx={previewHeadingTypographySx}>
                        {headingText ?? videoTitle ?? ""}
                    </Typography>
                    <Typography sx={previewSubheadingTypographySx}>
                        {subheadingText ?? "Sub-heading Placeholder"}
                    </Typography>
                </Box>

                <Box sx={previewFootnoteBoxSx}>
                    <Typography sx={previewFootnoteTypographySx}>
                        Footnote placeholder
                    </Typography>
                </Box>
            </Box>

            <Divider sx={dividerSx} />

            {/* Last edited */}
            <Box sx={cardMetaRowSx}>
                <TruffleAvatar text="MC" size="small" />
                <Box>
                    <Typography variant="caption" sx={captionBlockSx}>
            Last Edited
                    </Typography>
                    <Typography variant="body1" sx={textPrimaryColorSx}>
            Mar 12, 1:21 PM
                    </Typography>
                </Box>
            </Box>

            <Divider sx={dividerSx} />

            {/* Non-personalized */}
            <Box sx={cardMetaRowSx}>
                <CircularIconAvatar icon={<SvgIcon sx={globeIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>} />
                <Typography variant="body1" sx={textPrimaryColorSx}>
                    Non-personalized
                </Typography>
            </Box>

            <Divider sx={dividerSx} />

            {/* Languages */}
            <Box sx={cardMetaRowSx}>
                <CircularIconAvatar icon={<SvgIcon sx={globeIconSx}><FontAwesomeIcon icon={faGlobe} /></SvgIcon>} />
                <Box sx={languagesColumnSx}>
                    <Typography variant="caption" sx={captionBlockWithMb2Sx}>
                        Languages
                    </Typography>
                    <LanguagesChipRow
                        langs={[
                            { name: "English", flag: "🇺🇸" },
                            ...enabledLangs.map(name => ({ name, flag: FLAG_BY_NAME[name] ?? "" }))
                        ]}
                    />
                </Box>
            </Box>

            <Divider sx={dividerSx} />

            {/* In progress version */}
            <Box sx={cardMetaRowSx}>
                <CircularIconAvatar icon={<SvgIcon sx={globeIconSx}><FontAwesomeIcon icon={faFileExport} /></SvgIcon>} />
                <Box>
                    <Typography variant="body1" sx={textPrimaryColorSx}>
                        In progress version
                    </Typography>
                    <Typography variant="caption" sx={textSecondaryColorSx}>
                        New draft version
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
}

const textPrimaryColorSx: SxProps<Theme> = { color: "text.primary" };
const textSecondaryColorSx: SxProps<Theme> = { color: "text.secondary" };
const dividerSx: SxProps<Theme> = { borderColor: "divider" };

const darkTooltipSx = {
    bgcolor: "secondary.main", borderRadius: 2,
    px: "12px", pt: "10px", pb: "12px",
    color: "common.white", maxWidth: 320
};
const darkTooltipPhase1Sx = {
    bgcolor: "secondary.main", borderRadius: 2,
    px: "12px", pt: "10px", pb: "12px", maxWidth: 280
};
const darkTooltipArrowSx = { color: "secondary.main" };

const tooltipContentBoxSx: SxProps<Theme> = { p: "2px" };
const tooltipTextWithMbSx: SxProps<Theme> = { color: "common.white", display: "block", mb: "2px" };
const tooltipTextBlockSx: SxProps<Theme> = { color: "common.white", display: "block" };

const buttonStartIconSx: SxProps<Theme> = { fontSize: "16px !important", width: "16px !important", height: "16px !important" };

const approveSuccessBgSx: SxProps<Theme> = {
    "&.MuiButton-textSuccess": {
        backgroundColor: "rgba(237, 247, 237, 1)"
    }
};

const circularIconAvatarSx: SxProps<Theme> = {
    width: 40, height: 40, borderRadius: "50%", bgcolor: "action.selected",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
};

const videoPreviewCardPaperSx: SxProps<Theme> = {
    borderRadius: 2, overflow: "hidden", borderColor: "divider", bgcolor: "background.paper"
};
const cardActionBarSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5
};
const previewContainerSx: SxProps<Theme> = { position: "relative", width: "100%", overflow: "hidden" };
const previewImgSx: SxProps<Theme> = { width: "100%", display: "block", objectFit: "cover" };
const previewLeftHalfSx: SxProps<Theme> = {
    position: "absolute", inset: 0, width: "50%", bgcolor: "common.white", pointerEvents: "none"
};
const previewAccentLineSx: SxProps<Theme> = { height: 5, bgcolor: "secondary.light", width: "100%" };
const previewRightHalfSx: SxProps<Theme> = {
    position: "absolute", top: 0, right: 0, bottom: 0, width: "50%",
    bgcolor: "grey.200",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: "6px", pointerEvents: "none"
};
const previewDragIconSx: SxProps<Theme> = { fontSize: "36px !important", width: "36px !important", height: "36px !important", color: "grey.500" };
const previewDragTextSx: SxProps<Theme> = { color: "grey.500" };
const previewTextOverlaySx: SxProps<Theme> = {
    position: "absolute", left: "4%", top: "20%", width: "43%",
    containerType: "inline-size", pointerEvents: "none",
    display: "flex", flexDirection: "column"
};
const previewHeadingTypographySx: SxProps<Theme> = {
    fontFamily: "\"Inter\", sans-serif", fontWeight: 700, fontSize: "9cqw",
    color: "secondary.main", lineHeight: 1.2, wordBreak: "break-word"
};
const previewSubheadingTypographySx: SxProps<Theme> = {
    fontFamily: "\"Inter\", sans-serif", fontWeight: 400, fontSize: "4cqw",
    color: "text.secondary", lineHeight: 1.4, wordBreak: "break-word", mt: "6%"
};
const previewFootnoteBoxSx: SxProps<Theme> = {
    position: "absolute", left: "4%", width: "43%", bottom: "5%",
    containerType: "inline-size", pointerEvents: "none"
};
const previewFootnoteTypographySx: SxProps<Theme> = {
    fontFamily: "\"Open Sans\", sans-serif", fontWeight: 400, fontSize: "2.5cqw",
    letterSpacing: "0.4px", color: "text.disabled", lineHeight: 1.66
};
const cardMetaRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5 };
const captionBlockSx: SxProps<Theme> = { color: "text.secondary", display: "block" };
const captionBlockWithMb2Sx: SxProps<Theme> = { color: "text.secondary", display: "block", mb: "2px" };
const globeIconSx: SxProps<Theme> = { fontSize: "19px !important", width: "19px !important", height: "19px !important", color: "action.active" };
const languageChipSx: SxProps<Theme> = {
    display: "inline-flex", alignItems: "baseline", gap: "4px",
    bgcolor: "grey.200", borderRadius: "4px", px: "6px", pt: "2px", pb: "3px",
    flexShrink: 0
};
const languageFlagSx: SxProps<Theme> = { fontSize: 12, lineHeight: 1 };

const languagesColumnSx: SxProps<Theme> = { minWidth: 0, flex: 1 };

const chipRowOuterSx: SxProps<Theme> = { position: "relative", width: "100%" };

const chipRowMeasureSx: SxProps<Theme> = {
    position: "absolute", top: 0, left: 0,
    visibility: "hidden", pointerEvents: "none",
    display: "flex", flexWrap: "nowrap", gap: "4px",
    width: "max-content"
};

const chipRowVisibleSx: SxProps<Theme> = {
    display: "flex", flexWrap: "wrap", gap: "4px",
    maxWidth: "100%"
};

const chipOverflowTooltipSx = {
    bgcolor: "secondary.main",
    borderRadius: 2,
    px: "12px",
    py: "10px",
    color: "common.white",
    maxWidth: 320
};

const chipOverflowTooltipGridSx = (twoCols: boolean): SxProps<Theme> => ({
    display: "grid",
    gridTemplateColumns: twoCols ? "auto auto" : "auto",
    columnGap: 2,
    rowGap: "4px"
});

const chipOverflowTooltipItemSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px"
};

const chipOverflowTooltipTextSx: SxProps<Theme> = {
    color: "common.white",
    whiteSpace: "nowrap"
};
