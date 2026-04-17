import { useState } from "react";
import type { SxProps, Theme } from "@mui/material";
import {
    Dialog, Box, Typography, IconButton, Button, Divider, SvgIcon
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTableRows, faFileArrowUp, faPlus, faFilter, faChevronDown, faPalette, faXmark, faCircleQuestion } from "@fortawesome/pro-regular-svg-icons";


// ─── Color combination swatches ──────────────────────────────────────────────
const COLOR_COMBOS = [
    { a: "#03194F", b: "#8B9FCC", selected: true },
    { a: "#111111", b: "#333333", selected: false },
    { a: "#1B2A4A", b: "#2E4A80", selected: false },
    { a: "#7B5EA7", b: "#B48FD8", selected: false },
    { a: "#D0D5E0", b: "#EFF1F5", selected: false }
];

// ─── Scene template definitions ───────────────────────────────────────────────
const TEMPLATES = [
    { id: "t1", layout: "left-text-right-media", accent: "tr" },
    { id: "t2", layout: "left-text-right-media-2", accent: "tl" },
    { id: "t3", layout: "left-text-right-media-3", accent: "play" },
    { id: "t4", layout: "right-text-left-media", accent: "none" },
    { id: "t5", layout: "left-text-right-media-4", accent: "arrow" },
    { id: "t6", layout: "logo-center", accent: "none" },
    { id: "t7", layout: "logo-top-media", accent: "none" },
    { id: "t8", layout: "right-text-bold", accent: "none" },
    { id: "t9", layout: "centered-full-media", accent: "none" }
];

// ─── Realistic thumbnail component ────────────────────────────────────────────
function TemplateThumbnail({ id, layout, selected, onClick }: {
  id: string; layout: string; accent?: string; selected: boolean; onClick: () => void
}) {
    const W = 280; const H = 157;
    const stripe = (x: number, y: number, w: number, h: number) => {
        const lines = [];
        const step = 14;
        for (let i = -h; i < w + h; i += step) {
            lines.push(
                <line key={i}
                    x1={x + i} y1={y + h}
                    x2={x + i + h} y2={y}
                    stroke="#C8CEDA" strokeWidth="1"
                    clipPath={`url(#clip-${id}-media)`} />
            );
        }
        return lines;
    };

    const logoEl = (lx: number, ly: number, dark?: boolean) => (
        <g>
            <rect x={lx} y={ly} width={7} height={7} rx="1" fill={dark ? "#FFFFFF" : "#7B8EC8"} opacity="0.9" />
            <rect x={lx + 9} y={ly + 1} width={24} height={2.5} rx="1" fill={dark ? "#FFFFFF" : "#7B8EC8"} opacity="0.7" />
            <rect x={lx + 9} y={ly + 4} width={18} height={2} rx="1" fill={dark ? "#FFFFFF" : "#7B8EC8"} opacity="0.45" />
        </g>
    );

    const headingEl = (hx: number, hy: number, lw: number, large?: boolean, dark?: boolean) => {
        const fill = dark ? "#03194F" : "#03194F";
        const lh = large ? 8 : 5.5;
        const sh = large ? 5 : 3.5;
        return (
            <g>
                <rect x={hx} y={hy} width={lw * 0.9} height={lh} rx="1" fill={fill} opacity="0.85" />
                <rect x={hx} y={hy + lh + 2} width={lw * 0.7} height={lh} rx="1" fill={fill} opacity="0.85" />
                <rect x={hx} y={hy + lh * 2 + 5} width={lw * 0.75} height={sh} rx="1" fill={fill} opacity="0.45" />
            </g>
        );
    };

    const footnote = (fy: number) => (
        <rect x={8} y={fy} width={60} height={2} rx="1" fill="#03194F" opacity="0.2" />
    );

    let content: React.ReactNode;

    if (layout === "left-text-right-media") {
        const mx = 118; const my = 8; const mw = W - mx - 8; const mh = H - 16;
        content = (
            <>
                {/* Accent triangle top-right */}
                <polygon points={`${W},0 ${W},${H * 0.55} ${W - 26},0`} fill="#A78BD4" opacity="0.85" />
                {/* Media */}
                <rect x={mx} y={my} width={mw} height={mh} rx="3" fill="#E2E5EE" />
                {stripe(mx, my, mw, mh)}
                <clipPath id={`clip-${id}-media`}><rect x={mx} y={my} width={mw} height={mh} rx="3" /></clipPath>
                {/* Text */}
                {logoEl(8, 7)}
                {headingEl(8, 30, 100, true)}
                {footnote(H - 10)}
                {/* Dots */}
                <circle cx={40} cy={H - 18} r="1.5" fill="#03194F" opacity="0.3" />
                <circle cx={46} cy={H - 18} r="1.5" fill="#03194F" opacity="0.3" />
                <circle cx={52} cy={H - 18} r="1.5" fill="#03194F" opacity="0.3" />
            </>
        );
    }
    else if (layout === "left-text-right-media-2") {
        const mx = 118; const my = 8; const mw = W - mx - 8; const mh = H - 16;
        content = (
            <>
                {/* Accent triangle top-left */}
                <polygon points={`0,0 ${W * 0.28},0 0,${H * 0.6}`} fill="#A78BCA" opacity="0.75" />
                {/* Media */}
                <rect x={mx} y={my} width={mw} height={mh} rx="3" fill="#E2E5EE" />
                {stripe(mx, my, mw, mh)}
                <clipPath id={`clip-${id}-media`}><rect x={mx} y={my} width={mw} height={mh} rx="3" /></clipPath>
                {/* Logo top-right */}
                {logoEl(W - 42, 7)}
                {headingEl(18, 40, 90, true)}
                {footnote(H - 10)}
                <circle cx={40} cy={H - 18} r="1.5" fill="#03194F" opacity="0.3" />
                <circle cx={46} cy={H - 18} r="1.5" fill="#03194F" opacity="0.3" />
                <circle cx={52} cy={H - 18} r="1.5" fill="#03194F" opacity="0.3" />
            </>
        );
    }
    else if (layout === "left-text-right-media-3") {
        const mx = 118; const my = 8; const mw = W - mx - 8; const mh = H - 16;
        content = (
            <>
                {/* Play arrow on left */}
                <polygon points={`8,${H / 2 - 8} 8,${H / 2 + 8} 22,${H / 2}`} fill="#03194F" opacity="0.7" />
                {/* Media */}
                <rect x={mx} y={my} width={mw} height={mh} rx="3" fill="#E2E5EE" />
                {stripe(mx, my, mw, mh)}
                <clipPath id={`clip-${id}-media`}><rect x={mx} y={my} width={mw} height={mh} rx="3" /></clipPath>
                {logoEl(W - 42, 7)}
                {headingEl(28, 35, 80, true)}
                {footnote(H - 10)}
            </>
        );
    }
    else if (layout === "right-text-left-media") {
        const mx = W - 110; const my = 8; const mw = 98; const mh = H - 16;
        content = (
            <>
                {/* Media left */}
                <rect x={8} y={my} width={mw - 10} height={mh} rx="3" fill="#E2E5EE" />
                {stripe(8, my, mw - 10, mh)}
                <clipPath id={`clip-${id}-media`}><rect x={8} y={my} width={mw - 10} height={mh} rx="3" /></clipPath>
                {/* Play arrow on left of media */}
                <polygon points={`14,${H / 2 - 6} 14,${H / 2 + 6} 24,${H / 2}`} fill="#03194F" opacity="0.6" />
                {logoEl(mx, H - 14)}
                {headingEl(mx, 20, 88, true)}
                {/* Accent dashed border right */}
                <rect x={mx - 4} y={4} width={W - mx} height={H - 8} rx="3" fill="none" stroke="#B0B8CC" strokeWidth="1" strokeDasharray="3 3" />
                {footnote(H - 10)}
            </>
        );
    }
    else if (layout === "left-text-right-media-4") {
        const mx = 110; const my = 8; const mw = W - mx - 8; const mh = H - 16;
        content = (
            <>
                {/* Violet splash top-left */}
                <ellipse cx={10} cy={10} rx={55} ry={45} fill="#B89DD8" opacity="0.35" />
                {/* Media */}
                <rect x={mx} y={my} width={mw} height={mh} rx="3" fill="#E2E5EE" />
                {stripe(mx, my, mw, mh)}
                <clipPath id={`clip-${id}-media`}><rect x={mx} y={my} width={mw} height={mh} rx="3" /></clipPath>
                {/* Arrow right edge */}
                <polygon points={`${W - 4},${H / 2 - 7} ${W - 4},${H / 2 + 7} ${W + 3},${H / 2}`} fill="#03194F" opacity="0.55" />
                {logoEl(mx / 2 - 20, H - 14)}
                {headingEl(14, 28, 86, true)}
                {footnote(H - 10)}
            </>
        );
    }
    else if (layout === "logo-center") {
        const mx = W - 120; const my = 40; const mw = 110; const mh = H - 55;
        content = (
            <>
                <rect x={mx} y={my} width={mw} height={mh} rx="3" fill="#E2E5EE" />
                {stripe(mx, my, mw, mh)}
                <clipPath id={`clip-${id}-media`}><rect x={mx} y={my} width={mw} height={mh} rx="3" /></clipPath>
                {/* Logo centered top */}
                {logoEl(12, 8)}
                {headingEl(12, 28, 130, false)}
                {/* Dots bottom */}
                <circle cx={20} cy={H - 12} r="1.5" fill="#03194F" opacity="0.3" />
                <circle cx={26} cy={H - 12} r="1.5" fill="#03194F" opacity="0.3" />
                <circle cx={32} cy={H - 12} r="1.5" fill="#03194F" opacity="0.3" />
            </>
        );
    }
    else if (layout === "logo-top-media") {
        const mx = 118; const my = 28; const mw = W - mx - 8; const mh = H - 36;
        content = (
            <>
                {/* Logo + heading top-left */}
                {logoEl(8, 8)}
                {/* Media */}
                <rect x={mx} y={my} width={mw} height={mh} rx="3" fill="#E2E5EE" />
                {stripe(mx, my, mw, mh)}
                <clipPath id={`clip-${id}-media`}><rect x={mx} y={my} width={mw} height={mh} rx="3" /></clipPath>
                {/* Right logo */}
                {logoEl(W - 42, 8)}
                {headingEl(8, 26, 100, false)}
                {footnote(H - 10)}
            </>
        );
    }
    else if (layout === "right-text-bold") {
        const mx = 8; const my = 8; const mw = 95; const mh = H - 16;
        content = (
            <>
                <rect x={mx} y={my} width={mw} height={mh} rx="3" fill="#E2E5EE" />
                {stripe(mx, my, mw, mh)}
                <clipPath id={`clip-${id}-media`}><rect x={mx} y={my} width={mw} height={mh} rx="3" /></clipPath>
                {/* Dashed border right side */}
                <rect x={mx + mw + 2} y={4} width={W - mx - mw - 14} height={H - 8} rx="3" fill="none" stroke="#B0B8CC" strokeWidth="1" strokeDasharray="3 3" />
                {logoEl(8, H - 14)}
                {headingEl(mx + mw + 10, 18, 95, true)}
                {footnote(H - 10)}
                {/* Arrow on left of media */}
                <polygon points={`${mx + mw - 4},${H / 2 - 6} ${mx + mw - 4},${H / 2 + 6} ${mx + mw + 5},${H / 2}`} fill="#03194F" opacity="0.5" />
            </>
        );
    }
    else {
    // centered-full-media
        const mw = W - 60; const mh = 80;
        content = (
            <>
                {headingEl(W / 2 - 60, 8, 120, false)}
                <rect x={30} y={40} width={mw} height={mh} rx="3" fill="#E2E5EE" />
                {stripe(30, 40, mw, mh)}
                <clipPath id={`clip-${id}-media`}><rect x={30} y={40} width={mw} height={mh} rx="3" /></clipPath>
                {logoEl(W / 2 - 18, H - 14)}
                {/* Accent triangle bottom-right */}
                <polygon points={`${W},${H * 0.55} ${W},${H} ${W - 28},${H}`} fill="#7EC8C8" opacity="0.6" />
                {/* Dashed left border */}
                <rect x={4} y={4} width={22} height={H - 8} rx="3" fill="none" stroke="#B0B8CC" strokeWidth="1" strokeDasharray="3 3" />
                {/* Dashed right border */}
                <rect x={W - 26} y={4} width={22} height={H - 8} rx="3" fill="none" stroke="#B0B8CC" strokeWidth="1" strokeDasharray="3 3" />
            </>
        );
    }

    return (
        <Box
            onClick={onClick}
            sx={{
                cursor: "pointer", borderRadius: "10px", overflow: "hidden",
                border: "2px solid",
                borderColor: selected ? "primary.main" : "transparent",
                boxShadow: selected ? "0 0 0 3px rgba(0,83,229,0.15)" : "0 1px 4px rgba(3,25,79,0.1)",
                transition: "all 0.15s",
                "&:hover": { border: "2px solid rgba(0,83,229,0.5)", boxShadow: "0 2px 8px rgba(3,25,79,0.15)" }
            }}
        >
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
                <rect width={W} height={H} fill="#ECEEF4" />
                {content}
            </svg>
        </Box>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean
  onClose: () => void
  onAddScene: (templateId: string) => void
}

type Nav = "library" | "import"

// ─── Component ────────────────────────────────────────────────────────────────
export default function SceneLibraryDialog({ open, onClose, onAddScene }: Props) {
    const [nav, setNav] = useState<Nav>("library");
    const [selected, setSelected] = useState<string | null>(null);
    const [colors, setColors] = useState(COLOR_COMBOS);

    const handleAdd = () => {
        if (selected) {
            onAddScene(selected); setSelected(null); 
        }
    };

    const handleClose = () => {
        setSelected(null); setNav("library"); onClose(); 
    };

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (reason === "backdropClick") {
                    return;
                } handleClose(); 
            }}
            maxWidth={false}
            PaperProps={{ sx: paperSx }}
        >
            {/* ── Left sidebar ─────────────────────────────────────────────────── */}
            <Box sx={sidebarSx}>
                {/* "Scenes" title */}
                <Typography variant="h2" sx={sidebarTitleSx}>
          Scenes
                </Typography>

                {/* Nav items */}
                <Box sx={navListSx}>
                    {([
                        { key: "library" as Nav, icon: <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faTableRows} /></SvgIcon>, label: "Scene library" },
                        { key: "import" as Nav, icon: <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faFileArrowUp} /></SvgIcon>, label: "Import scene" }
                    ]).map(({ key, icon, label }) => (
                        <Box
                            key={key}
                            onClick={() => setNav(key)}
                            sx={{
                                display: "flex", alignItems: "center", gap: "10px",
                                px: "12px", py: "9px", borderRadius: "8px", cursor: "pointer",
                                bgcolor: nav === key ? "primary.light" : "transparent",
                                border: 1,
                                borderColor: nav === key ? "primary.light" : "transparent",
                                color: nav === key ? "primary.main" : "text.secondary",
                                "&:hover": { bgcolor: "primary.light" },
                                transition: "all 0.12s"
                            }}
                        >
                            {icon}
                            <Typography variant="body1" sx={{
                                color: nav === key ? "secondary.main" : "text.secondary"
                            }}>
                                {label}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Divider sx={sidebarDividerSx} />

                {/* + Custom scene button */}
                <Button
                    variant="outlined"
                    startIcon={<SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faPlus} /></SvgIcon>}
                    onClick={() => {
                        onAddScene("custom"); handleClose(); 
                    }}
                    sx={customSceneBtnSx}
                >
          Custom scene
                </Button>
            </Box>

            {/* ── Main content ─────────────────────────────────────────────────── */}
            <Box sx={mainContentSx}>

                {/* Title bar */}
                <Box sx={titleBarSx}>
                    <Typography variant="h2" sx={titleTextSx}>
                        {nav === "library" ? "Scene library" : "Import scene"}
                    </Typography>
                    <Box sx={titleActionsSx}>
                        <IconButton size="small" sx={iconBtnSecondarySx}>
                            <SvgIcon sx={icon20Sx}><FontAwesomeIcon icon={faCircleQuestion} /></SvgIcon>
                        </IconButton>
                        <IconButton size="small" onClick={handleClose} sx={iconBtnSecondarySx}>
                            <SvgIcon sx={icon20Sx}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                        </IconButton>
                    </Box>
                </Box>

                {/* ── Library view ─────────────────────────────────────────────── */}
                {nav === "library" && (
                    <>
                        {/* Filter + color combos row */}
                        <Box sx={filterRowSx}>
                            {/* Left: Filter */}
                            <Box sx={filterLeftSx}>
                                <Box sx={filterLabelBoxSx}>
                                    <SvgIcon sx={icon20SecondarySx}><FontAwesomeIcon icon={faFilter} /></SvgIcon>
                                    <Typography variant="body1" sx={secondaryTextSx}>
                    Filter
                                    </Typography>
                                </Box>
                                <Box sx={filterPillSx}>
                                    <Typography variant="caption" sx={secondaryMainTextSx}>
                    Scene templates
                                    </Typography>
                                    <SvgIcon sx={icon18SecondarySx}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>
                                </Box>
                            </Box>

                            {/* Right: Color combinations */}
                            <Box sx={colorCombosRightSx}>
                                <Box sx={colorCombosLabelSx}>
                                    <SvgIcon sx={icon20SecondarySx}><FontAwesomeIcon icon={faPalette} /></SvgIcon>
                                    <Typography variant="caption" sx={secondaryTextSx}>
                    Color combinations
                                    </Typography>
                                </Box>
                                <Box sx={swatchesRowSx}>
                                    {colors.map((c, i) => (
                                        <Box
                                            key={i}
                                            onClick={() => setColors(prev => prev.map((cc, j) => ({ ...cc, selected: j === i })))}
                                            sx={{
                                                width: 40, height: 40, borderRadius: "50%",
                                                background: `linear-gradient(180deg, ${c.a} 50%, ${c.b} 50%)`,
                                                cursor: "pointer",
                                                outline: c.selected ? "3px solid #0053E5" : "3px solid transparent",
                                                outlineOffset: "2px",
                                                boxShadow: "0 1px 4px rgba(3,25,79,0.15)",
                                                transition: "all 0.15s",
                                                "&:hover": { opacity: 0.85, transform: "scale(1.05)" }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Box>

                        {/* Template grid — scrollable */}
                        <Box sx={templateGridScrollSx}>
                            <Typography variant="body1" sx={sectionLabelSx}>
                Single Message with Media
                            </Typography>
                            <Box sx={templateGridSx}>
                                {TEMPLATES.map(t => (
                                    <TemplateThumbnail
                                        key={t.id}
                                        id={t.id}
                                        layout={t.layout}
                                        accent={t.accent}
                                        selected={selected === t.id}
                                        onClick={() => setSelected(prev => prev === t.id ? null : t.id)}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </>
                )}

                {/* ── Import view ──────────────────────────────────────────────── */}
                {nav === "import" && (
                    <Box sx={importViewSx}>
                        <SvgIcon sx={importIconSx}><FontAwesomeIcon icon={faFileArrowUp} /></SvgIcon>
                        <Typography variant="h4" sx={importTitleSx}>
              Import a custom scene
                        </Typography>
                        <Typography variant="body1" sx={importDescSx}>
              Upload a scene file exported from another project to reuse it here.
                        </Typography>
                        <Button variant="outlined" startIcon={<SvgIcon><FontAwesomeIcon icon={faFileArrowUp} /></SvgIcon>}
                            sx={importBtnSx}>
              Browse files
                        </Button>
                    </Box>
                )}

                {/* ── Sticky footer ────────────────────────────────────────────── */}
                <Box sx={footerSx}>
                    <Button
                        variant="outlined" size="large" onClick={handleClose}
                        sx={footerCancelBtnSx}
                    >
            Cancel
                    </Button>
                    <Button
                        variant="contained" size="large"
                        disabled={nav === "library" && !selected} onClick={handleAdd}
                        sx={footerAddBtnSx}
                    >
                        {nav === "import" ? "Import" : "Add scene"}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const paperSx: SxProps<Theme> = {
    width: 1380, maxWidth: "97vw", height: 760, maxHeight: "92vh",
    borderRadius: "16px",
    boxShadow: "0px 8px 40px rgba(3,25,79,0.22)",
    display: "flex", flexDirection: "row", overflow: "hidden"
};
const sidebarSx: SxProps<Theme> = {
    width: 192, flexShrink: 0, bgcolor: "background.default",
    display: "flex", flexDirection: "column",
    borderRight: 1, borderRightColor: "divider",
    py: "24px", px: "12px"
};
const sidebarTitleSx: SxProps<Theme> = { color: "secondary.main", px: "8px", pb: "20px" };
const navListSx: SxProps<Theme> = { display: "flex", flexDirection: "column", gap: "2px" };
const sidebarDividerSx: SxProps<Theme> = { my: "16px", borderColor: "divider" };
const customSceneBtnSx: SxProps<Theme> = {
    borderRadius: "8px", borderColor: "primary.light",
    color: "text.secondary", justifyContent: "flex-start",
    px: "10px", py: "7px", mx: "2px",
    "&:hover": { bgcolor: "primary.light", borderColor: "primary.main", color: "primary.main" }
};
const mainContentSx: SxProps<Theme> = { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", bgcolor: "background.paper" };
const titleBarSx: SxProps<Theme> = { display: "flex", alignItems: "center", justifyContent: "space-between", px: "32px", pt: "24px", pb: "16px", flexShrink: 0 };
const titleTextSx: SxProps<Theme> = { color: "secondary.main" };
const titleActionsSx: SxProps<Theme> = { display: "flex", gap: "4px" };
const iconBtnSecondarySx: SxProps<Theme> = { color: "text.secondary" };
const icon20Sx: SxProps<Theme> = { fontSize: 20 };
const icon20SecondarySx: SxProps<Theme> = { fontSize: 20, color: "text.secondary" };
const icon18SecondarySx: SxProps<Theme> = { fontSize: 18, color: "text.secondary" };
const filterRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", justifyContent: "space-between", px: "32px", pb: "20px", flexShrink: 0 };
const filterLeftSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "10px" };
const filterLabelBoxSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "6px" };
const secondaryTextSx: SxProps<Theme> = { color: "text.secondary" };
const filterPillSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "6px", border: 1, borderColor: "divider", borderRadius: "20px", px: "14px", py: "6px", cursor: "pointer", "&:hover": { bgcolor: "primary.light" } };
const secondaryMainTextSx: SxProps<Theme> = { color: "secondary.main" };
const colorCombosRightSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "14px" };
const colorCombosLabelSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "7px" };
const swatchesRowSx: SxProps<Theme> = { display: "flex", gap: "8px", alignItems: "center" };
const templateGridScrollSx: SxProps<Theme> = { flex: 1, overflowY: "auto", px: "32px", pb: "100px" };
const sectionLabelSx: SxProps<Theme> = { color: "text.secondary", mb: "16px" };
const templateGridSx: SxProps<Theme> = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" };
const importViewSx: SxProps<Theme> = { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", px: "40px" };
const importIconSx: SxProps<Theme> = { fontSize: 60, color: "text.secondary", opacity: 0.4 };
const importTitleSx: SxProps<Theme> = { color: "secondary.main" };
const importDescSx: SxProps<Theme> = { color: "text.secondary", textAlign: "center", maxWidth: 360 };
const importBtnSx: SxProps<Theme> = { mt: 1, borderRadius: "8px" };
const footerSx: SxProps<Theme> = { position: "absolute", bottom: 0, right: 0, width: "calc(100% - 192px)", bgcolor: "background.paper", borderTop: 1, borderTopColor: "divider", display: "flex", justifyContent: "flex-end", gap: "10px", px: "32px", py: "16px", zIndex: 10 };
const footerCancelBtnSx: SxProps<Theme> = { borderRadius: "8px", minWidth: 100 };
const footerAddBtnSx: SxProps<Theme> = { borderRadius: "8px", minWidth: 120 };
