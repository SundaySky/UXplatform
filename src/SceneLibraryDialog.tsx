import { useState } from 'react'
import {
  Dialog, Box, Typography, IconButton, Button, Divider,
} from '@mui/material'
import CloseIcon                   from '@mui/icons-material/Close'
import HelpOutlineIcon             from '@mui/icons-material/HelpOutline'
import TableRowsOutlinedIcon       from '@mui/icons-material/TableRowsOutlined'
import UploadFileOutlinedIcon      from '@mui/icons-material/UploadFileOutlined'
import AddIcon                     from '@mui/icons-material/Add'
import FilterListIcon              from '@mui/icons-material/FilterList'
import KeyboardArrowDownIcon       from '@mui/icons-material/KeyboardArrowDown'
import PaletteOutlinedIcon         from '@mui/icons-material/PaletteOutlined'

// ─── DS tokens ───────────────────────────────────────────────────────────────
const s = {
  primary:       '#0053E5',
  secondary:     '#03194F',
  textPrimary:   '#03194F',
  textSecondary: 'rgba(3,25,79,0.5)',
  divider:       '#E6E9F0',
  activeBg:      'rgba(0,83,229,0.08)',
  activeBorder:  'rgba(0,83,229,0.18)',
  sidebarBg:     '#F5F6FA',
}

// ─── Color combination swatches ──────────────────────────────────────────────
const COLOR_COMBOS = [
  { a: '#03194F', b: '#8B9FCC', selected: true  },
  { a: '#111111', b: '#333333', selected: false },
  { a: '#1B2A4A', b: '#2E4A80', selected: false },
  { a: '#7B5EA7', b: '#B48FD8', selected: false },
  { a: '#D0D5E0', b: '#EFF1F5', selected: false },
]

// ─── Scene template definitions ───────────────────────────────────────────────
const TEMPLATES = [
  { id: 't1',  layout: 'left-text-right-media',   accent: 'tr' },
  { id: 't2',  layout: 'left-text-right-media-2',  accent: 'tl' },
  { id: 't3',  layout: 'left-text-right-media-3',  accent: 'play' },
  { id: 't4',  layout: 'right-text-left-media',    accent: 'none' },
  { id: 't5',  layout: 'left-text-right-media-4',  accent: 'arrow' },
  { id: 't6',  layout: 'logo-center',              accent: 'none' },
  { id: 't7',  layout: 'logo-top-media',           accent: 'none' },
  { id: 't8',  layout: 'right-text-bold',          accent: 'none' },
  { id: 't9',  layout: 'centered-full-media',      accent: 'none' },
]

// ─── Realistic thumbnail component ────────────────────────────────────────────
function TemplateThumbnail({ id, layout, selected, onClick }: {
  id: string; layout: string; accent?: string; selected: boolean; onClick: () => void
}) {
  const W = 280, H = 157
  const stripe = (x: number, y: number, w: number, h: number) => {
    const lines = []
    const step = 14
    for (let i = -h; i < w + h; i += step) {
      lines.push(
        <line key={i}
          x1={x + i} y1={y + h}
          x2={x + i + h} y2={y}
          stroke="#C8CEDA" strokeWidth="1"
          clipPath={`url(#clip-${id}-media)`} />
      )
    }
    return lines
  }

  const logoEl = (lx: number, ly: number, dark?: boolean) => (
    <g>
      <rect x={lx} y={ly} width={7} height={7} rx="1" fill={dark ? '#FFFFFF' : '#7B8EC8'} opacity="0.9" />
      <rect x={lx + 9} y={ly + 1} width={24} height={2.5} rx="1" fill={dark ? '#FFFFFF' : '#7B8EC8'} opacity="0.7" />
      <rect x={lx + 9} y={ly + 4} width={18} height={2} rx="1" fill={dark ? '#FFFFFF' : '#7B8EC8'} opacity="0.45" />
    </g>
  )

  const headingEl = (hx: number, hy: number, lw: number, large?: boolean, dark?: boolean) => {
    const fill = dark ? '#03194F' : '#03194F'
    const lh = large ? 8 : 5.5
    const sh = large ? 5 : 3.5
    return (
      <g>
        <rect x={hx} y={hy}       width={lw * 0.9} height={lh}   rx="1" fill={fill} opacity="0.85" />
        <rect x={hx} y={hy+lh+2}  width={lw * 0.7} height={lh}   rx="1" fill={fill} opacity="0.85" />
        <rect x={hx} y={hy+lh*2+5} width={lw * 0.75} height={sh} rx="1" fill={fill} opacity="0.45" />
      </g>
    )
  }

  const footnote = (fy: number) => (
    <rect x={8} y={fy} width={60} height={2} rx="1" fill="#03194F" opacity="0.2" />
  )

  let content: React.ReactNode

  if (layout === 'left-text-right-media') {
    const mx = 118, my = 8, mw = W - mx - 8, mh = H - 16
    content = (
      <>
        {/* Accent triangle top-right */}
        <polygon points={`${W},0 ${W},${H*0.55} ${W-26},0`} fill="#A78BD4" opacity="0.85" />
        {/* Media */}
        <rect x={mx} y={my} width={mw} height={mh} rx="3" fill="#E2E5EE" />
        {stripe(mx, my, mw, mh)}
        <clipPath id={`clip-${id}-media`}><rect x={mx} y={my} width={mw} height={mh} rx="3" /></clipPath>
        {/* Text */}
        {logoEl(8, 7)}
        {headingEl(8, 30, 100, true)}
        {footnote(H - 10)}
        {/* Dots */}
        <circle cx={40} cy={H-18} r="1.5" fill="#03194F" opacity="0.3" />
        <circle cx={46} cy={H-18} r="1.5" fill="#03194F" opacity="0.3" />
        <circle cx={52} cy={H-18} r="1.5" fill="#03194F" opacity="0.3" />
      </>
    )
  } else if (layout === 'left-text-right-media-2') {
    const mx = 118, my = 8, mw = W - mx - 8, mh = H - 16
    content = (
      <>
        {/* Accent triangle top-left */}
        <polygon points={`0,0 ${W*0.28},0 0,${H*0.6}`} fill="#A78BCA" opacity="0.75" />
        {/* Media */}
        <rect x={mx} y={my} width={mw} height={mh} rx="3" fill="#E2E5EE" />
        {stripe(mx, my, mw, mh)}
        <clipPath id={`clip-${id}-media`}><rect x={mx} y={my} width={mw} height={mh} rx="3" /></clipPath>
        {/* Logo top-right */}
        {logoEl(W - 42, 7)}
        {headingEl(18, 40, 90, true)}
        {footnote(H - 10)}
        <circle cx={40} cy={H-18} r="1.5" fill="#03194F" opacity="0.3" />
        <circle cx={46} cy={H-18} r="1.5" fill="#03194F" opacity="0.3" />
        <circle cx={52} cy={H-18} r="1.5" fill="#03194F" opacity="0.3" />
      </>
    )
  } else if (layout === 'left-text-right-media-3') {
    const mx = 118, my = 8, mw = W - mx - 8, mh = H - 16
    content = (
      <>
        {/* Play arrow on left */}
        <polygon points={`8,${H/2 - 8} 8,${H/2 + 8} 22,${H/2}`} fill="#03194F" opacity="0.7" />
        {/* Media */}
        <rect x={mx} y={my} width={mw} height={mh} rx="3" fill="#E2E5EE" />
        {stripe(mx, my, mw, mh)}
        <clipPath id={`clip-${id}-media`}><rect x={mx} y={my} width={mw} height={mh} rx="3" /></clipPath>
        {logoEl(W - 42, 7)}
        {headingEl(28, 35, 80, true)}
        {footnote(H - 10)}
      </>
    )
  } else if (layout === 'right-text-left-media') {
    const mx = W - 110, my = 8, mw = 98, mh = H - 16
    content = (
      <>
        {/* Media left */}
        <rect x={8} y={my} width={mw - 10} height={mh} rx="3" fill="#E2E5EE" />
        {stripe(8, my, mw - 10, mh)}
        <clipPath id={`clip-${id}-media`}><rect x={8} y={my} width={mw - 10} height={mh} rx="3" /></clipPath>
        {/* Play arrow on left of media */}
        <polygon points={`14,${H/2-6} 14,${H/2+6} 24,${H/2}`} fill="#03194F" opacity="0.6" />
        {logoEl(mx, H - 14)}
        {headingEl(mx, 20, 88, true)}
        {/* Accent dashed border right */}
        <rect x={mx - 4} y={4} width={W - mx} height={H - 8} rx="3" fill="none" stroke="#B0B8CC" strokeWidth="1" strokeDasharray="3 3" />
        {footnote(H - 10)}
      </>
    )
  } else if (layout === 'left-text-right-media-4') {
    const mx = 110, my = 8, mw = W - mx - 8, mh = H - 16
    content = (
      <>
        {/* Violet splash top-left */}
        <ellipse cx={10} cy={10} rx={55} ry={45} fill="#B89DD8" opacity="0.35" />
        {/* Media */}
        <rect x={mx} y={my} width={mw} height={mh} rx="3" fill="#E2E5EE" />
        {stripe(mx, my, mw, mh)}
        <clipPath id={`clip-${id}-media`}><rect x={mx} y={my} width={mw} height={mh} rx="3" /></clipPath>
        {/* Arrow right edge */}
        <polygon points={`${W-4},${H/2-7} ${W-4},${H/2+7} ${W+3},${H/2}`} fill="#03194F" opacity="0.55" />
        {logoEl(mx / 2 - 20, H - 14)}
        {headingEl(14, 28, 86, true)}
        {footnote(H - 10)}
      </>
    )
  } else if (layout === 'logo-center') {
    const mx = W - 120, my = 40, mw = 110, mh = H - 55
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
    )
  } else if (layout === 'logo-top-media') {
    const mx = 118, my = 28, mw = W - mx - 8, mh = H - 36
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
    )
  } else if (layout === 'right-text-bold') {
    const mx = 8, my = 8, mw = 95, mh = H - 16
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
        <polygon points={`${mx+mw-4},${H/2-6} ${mx+mw-4},${H/2+6} ${mx+mw+5},${H/2}`} fill="#03194F" opacity="0.5" />
      </>
    )
  } else {
    // centered-full-media
    const mw = W - 60, mh = 80
    content = (
      <>
        {headingEl(W/2 - 60, 8, 120, false)}
        <rect x={30} y={40} width={mw} height={mh} rx="3" fill="#E2E5EE" />
        {stripe(30, 40, mw, mh)}
        <clipPath id={`clip-${id}-media`}><rect x={30} y={40} width={mw} height={mh} rx="3" /></clipPath>
        {logoEl(W/2 - 18, H - 14)}
        {/* Accent triangle bottom-right */}
        <polygon points={`${W},${H*0.55} ${W},${H} ${W - 28},${H}`} fill="#7EC8C8" opacity="0.6" />
        {/* Dashed left border */}
        <rect x={4} y={4} width={22} height={H - 8} rx="3" fill="none" stroke="#B0B8CC" strokeWidth="1" strokeDasharray="3 3" />
        {/* Dashed right border */}
        <rect x={W - 26} y={4} width={22} height={H - 8} rx="3" fill="none" stroke="#B0B8CC" strokeWidth="1" strokeDasharray="3 3" />
      </>
    )
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer', borderRadius: '10px', overflow: 'hidden',
        border: selected ? `2px solid ${s.primary}` : '2px solid transparent',
        boxShadow: selected ? `0 0 0 3px rgba(0,83,229,0.15)` : '0 1px 4px rgba(3,25,79,0.1)',
        transition: 'all 0.15s',
        '&:hover': { border: `2px solid rgba(0,83,229,0.5)`, boxShadow: '0 2px 8px rgba(3,25,79,0.15)' },
      }}
    >
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <rect width={W} height={H} fill="#ECEEF4" />
        {content}
      </svg>
    </Box>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  open:       boolean
  onClose:    () => void
  onAddScene: (templateId: string) => void
}

type Nav = 'library' | 'import'

// ─── Component ────────────────────────────────────────────────────────────────
export default function SceneLibraryDialog({ open, onClose, onAddScene }: Props) {
  const [nav,      setNav]      = useState<Nav>('library')
  const [selected, setSelected] = useState<string | null>(null)
  const [colors,   setColors]   = useState(COLOR_COMBOS)

  const handleAdd = () => {
    if (selected) { onAddScene(selected); setSelected(null) }
  }

  const handleClose = () => { setSelected(null); setNav('library'); onClose() }

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => { if (reason === 'backdropClick') return; handleClose() }}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 1380, maxWidth: '97vw', height: 760, maxHeight: '92vh',
          borderRadius: '16px',
          boxShadow: '0px 8px 40px rgba(3,25,79,0.22)',
          display: 'flex', flexDirection: 'row',
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <Box sx={{
        width: 192, flexShrink: 0,
        bgcolor: s.sidebarBg,
        display: 'flex', flexDirection: 'column',
        borderRight: `1px solid ${s.divider}`,
        py: '24px', px: '12px',
      }}>
        {/* "Scenes" title */}
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 700,
          fontSize: 22, color: s.textPrimary,
          px: '8px', pb: '20px',
        }}>
          Scenes
        </Typography>

        {/* Nav items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {([
            { key: 'library' as Nav, icon: <TableRowsOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Scene library' },
            { key: 'import'  as Nav, icon: <UploadFileOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Import scene' },
          ]).map(({ key, icon, label }) => (
            <Box
              key={key}
              onClick={() => setNav(key)}
              sx={{
                display: 'flex', alignItems: 'center', gap: '10px',
                px: '12px', py: '9px', borderRadius: '8px', cursor: 'pointer',
                bgcolor: nav === key ? s.activeBg : 'transparent',
                border: nav === key ? `1px solid ${s.activeBorder}` : '1px solid transparent',
                color: nav === key ? s.primary : s.textSecondary,
                '&:hover': { bgcolor: nav === key ? s.activeBg : 'rgba(0,83,229,0.04)' },
                transition: 'all 0.12s',
              }}
            >
              {icon}
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: nav === key ? 600 : 400, fontSize: 14,
                color: nav === key ? s.textPrimary : s.textSecondary,
              }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: '16px', borderColor: s.divider }} />

        {/* + Custom scene button */}
        <Button
          variant="outlined"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={() => { onAddScene('custom'); handleClose() }}
          sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
            fontSize: 13, textTransform: 'none',
            borderRadius: '8px', borderColor: s.activeBorder,
            color: s.textSecondary, justifyContent: 'flex-start',
            px: '10px', py: '7px', mx: '2px',
            '&:hover': { bgcolor: s.activeBg, borderColor: s.primary, color: s.primary },
          }}
        >
          Custom scene
        </Button>
      </Box>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>

        {/* Title bar */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: '32px', pt: '24px', pb: '16px', flexShrink: 0,
        }}>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 700,
            fontSize: 22, color: s.textPrimary,
          }}>
            {nav === 'library' ? 'Scene library' : 'Import scene'}
          </Typography>
          <Box sx={{ display: 'flex', gap: '4px' }}>
            <IconButton size="small" sx={{ color: s.textSecondary }}>
              <HelpOutlineIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" onClick={handleClose} sx={{ color: s.textSecondary }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* ── Library view ─────────────────────────────────────────────── */}
        {nav === 'library' && (
          <>
            {/* Filter + color combos row */}
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: '32px', pb: '20px', flexShrink: 0,
            }}>
              {/* Left: Filter */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FilterListIcon sx={{ fontSize: 20, color: s.textSecondary }} />
                  <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: s.textSecondary, fontWeight: 400 }}>
                    Filter
                  </Typography>
                </Box>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  border: `1px solid ${s.divider}`, borderRadius: '20px',
                  px: '14px', py: '6px', cursor: 'pointer',
                  '&:hover': { bgcolor: s.activeBg },
                }}>
                  <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 13, color: s.textPrimary }}>
                    Scene templates
                  </Typography>
                  <KeyboardArrowDownIcon sx={{ fontSize: 18, color: s.textSecondary }} />
                </Box>
              </Box>

              {/* Right: Color combinations */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <PaletteOutlinedIcon sx={{ fontSize: 20, color: s.textSecondary }} />
                  <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 13, color: s.textSecondary }}>
                    Color combinations
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {colors.map((c, i) => (
                    <Box
                      key={i}
                      onClick={() => setColors(prev => prev.map((cc, j) => ({ ...cc, selected: j === i })))}
                      sx={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: `linear-gradient(180deg, ${c.a} 50%, ${c.b} 50%)`,
                        cursor: 'pointer',
                        outline: c.selected ? `3px solid ${s.primary}` : '3px solid transparent',
                        outlineOffset: '2px',
                        boxShadow: '0 1px 4px rgba(3,25,79,0.15)',
                        transition: 'all 0.15s',
                        '&:hover': { opacity: 0.85, transform: 'scale(1.05)' },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Template grid — scrollable */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: '32px', pb: '100px' }}>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                fontSize: 14, color: s.textSecondary, mb: '16px',
              }}>
                Single Message with Media
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
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
        {nav === 'import' && (
          <Box sx={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px', px: '40px',
          }}>
            <UploadFileOutlinedIcon sx={{ fontSize: 60, color: s.textSecondary, opacity: 0.4 }} />
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 18, color: s.textPrimary }}>
              Import a custom scene
            </Typography>
            <Typography sx={{
              fontFamily: '"Open Sans", sans-serif', fontSize: 14,
              color: s.textSecondary, textAlign: 'center', maxWidth: 360,
            }}>
              Upload a scene file exported from another project to reuse it here.
            </Typography>
            <Button variant="outlined" startIcon={<UploadFileOutlinedIcon />}
              sx={{ mt: 1, fontFamily: '"Open Sans", sans-serif', textTransform: 'none', borderRadius: '8px' }}>
              Browse files
            </Button>
          </Box>
        )}

        {/* ── Sticky footer ────────────────────────────────────────────── */}
        <Box sx={{
          position: 'absolute', bottom: 0, right: 0,
          width: `calc(100% - 192px)`,
          bgcolor: '#fff',
          borderTop: `1px solid ${s.divider}`,
          display: 'flex', justifyContent: 'flex-end', gap: '10px',
          px: '32px', py: '16px', zIndex: 10,
        }}>
          <Button
            variant="outlined" size="large" onClick={handleClose}
            sx={{ fontFamily: '"Open Sans", sans-serif', textTransform: 'none', borderRadius: '8px', minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained" size="large"
            disabled={nav === 'library' && !selected} onClick={handleAdd}
            sx={{ fontFamily: '"Open Sans", sans-serif', textTransform: 'none', borderRadius: '8px', minWidth: 120 }}
          >
            {nav === 'import' ? 'Import' : 'Add scene'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}
