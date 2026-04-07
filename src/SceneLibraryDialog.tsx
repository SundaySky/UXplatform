import { useState } from 'react'
import {
  Dialog, DialogTitle, Box, Typography, IconButton, Button, Divider,
} from '@mui/material'
import CloseIcon          from '@mui/icons-material/Close'
import HelpOutlineIcon    from '@mui/icons-material/HelpOutline'
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import AddIcon            from '@mui/icons-material/Add'
import FilterListIcon     from '@mui/icons-material/FilterList'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import FaceOutlinedIcon   from '@mui/icons-material/FaceOutlined'

// ─── DS tokens ───────────────────────────────────────────────────────────────
const s = {
  primary:       '#0053E5',
  textPrimary:   '#323338',
  textSecondary: 'rgba(60,60,72,0.6)',
  divider:       'rgba(0,83,229,0.12)',
  editorBg:      '#F5F5F5',
  activeBg:      'rgba(0,83,229,0.08)',
  activeBorder:  'rgba(0,83,229,0.18)',
  navHover:      'rgba(0,83,229,0.05)',
}

// ─── Color combination swatches ───────────────────────────────────────────────
const COLOR_COMBOS = [
  { top: '#FFFFFF', bottom: '#0053E5', selected: true },
  { top: '#111111', bottom: '#111111', selected: false },
  { top: '#03194F', bottom: '#03194F', selected: false },
  { top: '#0D2A6E', bottom: '#0D2A6E', selected: false },
  { top: '#F5F5F5', bottom: '#F5F5F5', selected: false },
]

// ─── Scene template definitions ───────────────────────────────────────────────
// Each item defines how elements are laid out in the 80×56 preview thumbnail
const TEMPLATE_SECTIONS = [
  {
    label: 'Single Message with Media',
    templates: [
      { id: 'sml-1', layout: 'media-right',   wave: true,  textSide: 'left'  },
      { id: 'sml-2', layout: 'media-left',    wave: true,  textSide: 'right' },
      { id: 'sml-3', layout: 'text-bottom',   wave: true,  textSide: 'center' },
      { id: 'sml-4', layout: 'text-top-right', wave: false, textSide: 'right' },
      { id: 'sml-5', layout: 'card-left',     wave: false, textSide: 'left' },
      { id: 'sml-6', layout: 'media-center',  wave: true,  textSide: 'left' },
      { id: 'sml-7', layout: 'card-center',   wave: false, textSide: 'center' },
      { id: 'sml-8', layout: 'text-left-lg',  wave: true,  textSide: 'right' },
      { id: 'sml-9', layout: 'media-full',    wave: false, textSide: 'left' },
    ],
  },
]

// ─── Tiny thumbnail SVG ───────────────────────────────────────────────────────
function TemplateThumbnail({ layout, wave, selected, onClick }: {
  layout: string; wave: boolean; textSide?: string; selected: boolean; onClick: () => void
}) {
  const w = 80, h = 56
  const bg = '#F0F0EC'
  const hatch = '#D0D0C8'
  const textColor = '#323338'
  const accentLine = '#0053E5'

  // derive rough layout rects from layout key
  type Rect = { x: number; y: number; w: number; h: number }
  let textRect: Rect = { x: 4, y: 8, w: 32, h: 24 }
  let mediaRect: Rect = { x: 44, y: 4, w: 32, h: 36 }
  let showMedia = true

  if (layout === 'media-right')    { textRect = { x: 4, y: 10, w: 34, h: 26 }; mediaRect = { x: 42, y: 4, w: 34, h: 40 } }
  if (layout === 'media-left')     { textRect = { x: 42, y: 10, w: 34, h: 26 }; mediaRect = { x: 4, y: 4, w: 34, h: 40 } }
  if (layout === 'text-bottom')    { textRect = { x: 6, y: 30, w: 56, h: 20 }; mediaRect = { x: 56, y: 4, w: 20, h: 28 } }
  if (layout === 'text-top-right') { textRect = { x: 44, y: 4, w: 32, h: 20 }; mediaRect = { x: 4, y: 4, w: 36, h: 40 } }
  if (layout === 'card-left')      { textRect = { x: 8, y: 10, w: 36, h: 30 }; mediaRect = { x: 50, y: 14, w: 24, h: 24 } }
  if (layout === 'media-center')   { textRect = { x: 4, y: 34, w: 44, h: 16 }; mediaRect = { x: 28, y: 4, w: 48, h: 32 } }
  if (layout === 'card-center')    { textRect = { x: 20, y: 12, w: 40, h: 26 }; mediaRect = { x: 56, y: 20, w: 20, h: 18 }; showMedia = false }
  if (layout === 'text-left-lg')   { textRect = { x: 2, y: 4, w: 40, h: 44 }; mediaRect = { x: 44, y: 8, w: 32, h: 32 } }
  if (layout === 'media-full')     { textRect = { x: 4, y: 8, w: 30, h: 20 }; mediaRect = { x: 38, y: 4, w: 38, h: 44 } }

  const headH = layout === 'text-left-lg' ? 6 : 4
  const subH  = 2.5

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderRadius: '6px',
        border: selected ? `2px solid ${s.primary}` : '2px solid transparent',
        overflow: 'hidden',
        flexShrink: 0,
        '&:hover': { border: `2px solid ${s.primary}`, opacity: 0.9 },
        transition: 'border 0.15s',
        boxSizing: 'border-box',
      }}
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        {/* background */}
        <rect width={w} height={h} fill={bg} />

        {/* wave / diagonal accent */}
        {wave && (
          <path
            d={`M${w * 0.42},0 Q${w * 0.52},${h * 0.5} ${w * 0.44},${h} L${w * 0.38},${h} Q${w * 0.46},${h * 0.5} ${w * 0.36},0 Z`}
            fill="none" stroke={accentLine} strokeWidth="0.8" opacity="0.35"
          />
        )}

        {/* hatch media area */}
        {showMedia && (
          <g>
            <rect x={mediaRect.x} y={mediaRect.y} width={mediaRect.w} height={mediaRect.h}
              fill={hatch} rx="2" />
            {/* diagonal hatch lines */}
            {Array.from({ length: 8 }).map((_, i) => {
              const step = (mediaRect.w + mediaRect.h) / 7
              return (
                <line key={i}
                  x1={mediaRect.x + i * step - mediaRect.h}
                  y1={mediaRect.y + mediaRect.h}
                  x2={mediaRect.x + i * step}
                  y2={mediaRect.y}
                  stroke="#B8B8B0" strokeWidth="0.8"
                  clipPath={`url(#clip-${layout})`}
                />
              )
            })}
            <clipPath id={`clip-${layout}`}>
              <rect x={mediaRect.x} y={mediaRect.y} width={mediaRect.w} height={mediaRect.h} rx="2" />
            </clipPath>
            {/* image placeholder icon */}
            <text
              x={mediaRect.x + mediaRect.w / 2}
              y={mediaRect.y + mediaRect.h / 2 + 2}
              textAnchor="middle" fontSize="8" fill="#888" fontFamily="sans-serif"
            >⌗</text>
          </g>
        )}

        {/* heading block */}
        <rect x={textRect.x} y={textRect.y} width={textRect.w * 0.8} height={headH} fill={textColor} rx="1" opacity="0.75" />
        {/* subheading block */}
        <rect x={textRect.x} y={textRect.y + headH + 2} width={textRect.w * 0.6} height={subH} fill={textColor} rx="1" opacity="0.35" />
        {/* body text lines */}
        <rect x={textRect.x} y={textRect.y + headH + 6} width={textRect.w * 0.9} height={1.5} fill={textColor} rx="0.5" opacity="0.18" />
        <rect x={textRect.x} y={textRect.y + headH + 9} width={textRect.w * 0.75} height={1.5} fill={textColor} rx="0.5" opacity="0.18" />

        {/* footnote line */}
        <rect x={4} y={h - 5} width={22} height={1.2} fill={textColor} rx="0.5" opacity="0.18" />
      </svg>
    </Box>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  open:    boolean
  onClose: () => void
  onAddScene: (templateId: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SceneLibraryDialog({ open, onClose, onAddScene }: Props) {
  const [nav,      setNav]      = useState<'library' | 'import'>('library')
  const [selected, setSelected] = useState<string | null>(null)
  const [colors,   setColors]   = useState(COLOR_COMBOS)

  const handleAdd = () => {
    if (selected) { onAddScene(selected); setSelected(null) }
  }

  const handleClose = () => { setSelected(null); onClose() }

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => { if (reason === 'backdropClick') return; handleClose() }}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 900, height: 620, maxHeight: '90vh',
          borderRadius: 2,
          boxShadow: '0px 0px 24px 0px rgba(3,25,79,0.18)',
          display: 'flex', flexDirection: 'row',
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <Box sx={{
        width: 188, flexShrink: 0, bgcolor: s.editorBg,
        display: 'flex', flexDirection: 'column',
        borderRight: `1px solid ${s.divider}`,
        py: '12px', px: '8px', gap: '2px',
      }}>
        {/* Nav: Scene library */}
        <Box
          onClick={() => setNav('library')}
          sx={{
            display: 'flex', alignItems: 'center', gap: '10px',
            px: '12px', py: '8px', borderRadius: '8px', cursor: 'pointer',
            bgcolor: nav === 'library' ? s.activeBg : 'transparent',
            border: nav === 'library' ? `1px solid ${s.activeBorder}` : '1px solid transparent',
            '&:hover': { bgcolor: nav === 'library' ? s.activeBg : s.navHover },
          }}
        >
          <TableRowsOutlinedIcon sx={{ fontSize: 18, color: nav === 'library' ? s.primary : s.textSecondary }} />
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: nav === 'library' ? 600 : 400,
            fontSize: 14, color: nav === 'library' ? s.textPrimary : s.textSecondary,
          }}>
            Scene library
          </Typography>
        </Box>

        {/* Nav: Import scene */}
        <Box
          onClick={() => setNav('import')}
          sx={{
            display: 'flex', alignItems: 'center', gap: '10px',
            px: '12px', py: '8px', borderRadius: '8px', cursor: 'pointer',
            bgcolor: nav === 'import' ? s.activeBg : 'transparent',
            border: nav === 'import' ? `1px solid ${s.activeBorder}` : '1px solid transparent',
            '&:hover': { bgcolor: nav === 'import' ? s.activeBg : s.navHover },
          }}
        >
          <UploadFileOutlinedIcon sx={{ fontSize: 18, color: nav === 'import' ? s.primary : s.textSecondary }} />
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: nav === 'import' ? 600 : 400,
            fontSize: 14, color: nav === 'import' ? s.textPrimary : s.textSecondary,
          }}>
            Import scene
          </Typography>
        </Box>

        <Divider sx={{ my: '8px', borderColor: s.divider }} />

        {/* Custom scene button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          sx={{
            mx: '4px',
            fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
            fontSize: 13, textTransform: 'none',
            borderRadius: '8px', borderColor: s.activeBorder,
            color: s.primary,
            justifyContent: 'flex-start',
            px: '10px', py: '6px',
            '&:hover': { bgcolor: s.activeBg, borderColor: s.primary },
          }}
        >
          Custom scene
        </Button>
      </Box>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Title bar */}
        <DialogTitle
          component="div"
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            pl: '28px', pr: '16px', pt: '18px', pb: '14px', flexShrink: 0,
          }}
        >
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 20,
            color: s.textPrimary,
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
        </DialogTitle>

        {nav === 'library' && (
          <>
            {/* Filter + Color combinations row */}
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: '28px', pb: '14px', flexShrink: 0,
            }}>
              {/* Filter pill */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FilterListIcon sx={{ fontSize: 18, color: s.textSecondary }} />
                <Typography sx={{
                  fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: s.textSecondary,
                }}>
                  Filter
                </Typography>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  border: `1px solid ${s.divider}`, borderRadius: '20px',
                  px: '12px', py: '5px', cursor: 'pointer',
                  '&:hover': { bgcolor: s.activeBg },
                }}>
                  <Typography sx={{
                    fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                    color: s.textPrimary, fontWeight: 400,
                  }}>
                    Scene templates
                  </Typography>
                  <KeyboardArrowDownIcon sx={{ fontSize: 16, color: s.textSecondary }} />
                </Box>
              </Box>

              {/* Color combinations */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaceOutlinedIcon sx={{ fontSize: 18, color: s.textSecondary }} />
                  <Typography sx={{
                    fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                    color: s.textSecondary,
                  }}>
                    Color combinations
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: '6px' }}>
                  {colors.map((c, i) => (
                    <Box
                      key={i}
                      onClick={() => setColors(prev => prev.map((cc, j) => ({ ...cc, selected: j === i })))}
                      sx={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: `linear-gradient(180deg, ${c.top} 50%, ${c.bottom} 50%)`,
                        cursor: 'pointer',
                        border: c.selected ? `2.5px solid ${s.primary}` : '2.5px solid transparent',
                        outline: c.selected ? `2px solid white` : 'none',
                        outlineOffset: '-4px',
                        boxSizing: 'border-box',
                        transition: 'border 0.15s',
                        '&:hover': { opacity: 0.85 },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            <Divider sx={{ borderColor: s.divider, mx: '28px', mb: '16px' }} />

            {/* Scrollable template grid */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: '28px', pb: '80px' }}>
              {TEMPLATE_SECTIONS.map(section => (
                <Box key={section.label} sx={{ mb: '24px' }}>
                  <Typography sx={{
                    fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                    fontSize: 14, color: s.textSecondary, mb: '12px',
                  }}>
                    {section.label}
                  </Typography>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px',
                  }}>
                    {section.templates.map(t => (
                      <TemplateThumbnail
                        key={t.id}
                        layout={t.layout}
                        wave={t.wave}
                        textSide={t.textSide}
                        selected={selected === t.id}
                        onClick={() => setSelected(prev => prev === t.id ? null : t.id)}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}

        {nav === 'import' && (
          <Box sx={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2, px: '40px',
          }}>
            <UploadFileOutlinedIcon sx={{ fontSize: 56, color: s.textSecondary, opacity: 0.5 }} />
            <Typography sx={{
              fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
              fontSize: 16, color: s.textPrimary,
            }}>
              Import a custom scene
            </Typography>
            <Typography sx={{
              fontFamily: '"Open Sans", sans-serif', fontSize: 14,
              color: s.textSecondary, textAlign: 'center', maxWidth: 360,
            }}>
              Upload a scene file exported from another project to reuse it here.
            </Typography>
            <Button variant="outlined" startIcon={<UploadFileOutlinedIcon />}
              sx={{ mt: 1, fontFamily: '"Open Sans", sans-serif', textTransform: 'none', borderRadius: '8px' }}
            >
              Browse files
            </Button>
          </Box>
        )}

        {/* ── Sticky footer ─────────────────────────────────────────────── */}
        <Box sx={{
          position: 'absolute', bottom: 0, right: 0,
          width: 'calc(100% - 188px)',
          bgcolor: 'white',
          borderTop: `1px solid ${s.divider}`,
          display: 'flex', justifyContent: 'flex-end', gap: '8px',
          px: '28px', py: '14px',
          zIndex: 1,
        }}>
          <Button
            variant="outlined" size="large"
            onClick={handleClose}
            sx={{ fontFamily: '"Open Sans", sans-serif', textTransform: 'none', borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained" size="large"
            disabled={nav === 'library' && !selected}
            onClick={handleAdd}
            sx={{ fontFamily: '"Open Sans", sans-serif', textTransform: 'none', borderRadius: '8px' }}
          >
            {nav === 'import' ? 'Import' : 'Add scene'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}
