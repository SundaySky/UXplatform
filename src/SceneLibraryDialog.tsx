import { useState } from 'react'
import {
  Dialog, DialogTitle, Box, Typography, IconButton, Button, Divider, Tooltip,
} from '@mui/material'
import CloseIcon                   from '@mui/icons-material/Close'
import HelpOutlineIcon             from '@mui/icons-material/HelpOutline'
import TableRowsOutlinedIcon       from '@mui/icons-material/TableRowsOutlined'
import UploadFileOutlinedIcon      from '@mui/icons-material/UploadFileOutlined'
import AddIcon                     from '@mui/icons-material/Add'
import FilterListIcon              from '@mui/icons-material/FilterList'
import KeyboardArrowDownIcon       from '@mui/icons-material/KeyboardArrowDown'
import FaceOutlinedIcon            from '@mui/icons-material/FaceOutlined'
import ArrowBackIosNewIcon         from '@mui/icons-material/ArrowBackIosNew'
import ChevronLeftIcon             from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon            from '@mui/icons-material/ChevronRight'
import StarBorderIcon              from '@mui/icons-material/StarBorder'
import PaletteOutlinedIcon         from '@mui/icons-material/PaletteOutlined'
import PersonOutlinedIcon          from '@mui/icons-material/PersonOutlined'
import PermMediaOutlinedIcon       from '@mui/icons-material/PermMediaOutlined'
import MusicNoteOutlinedIcon       from '@mui/icons-material/MusicNoteOutlined'
import MicOutlinedIcon             from '@mui/icons-material/MicOutlined'
import StorageOutlinedIcon         from '@mui/icons-material/StorageOutlined'
import InputOutlinedIcon           from '@mui/icons-material/InputOutlined'
import AspectRatioOutlinedIcon     from '@mui/icons-material/AspectRatioOutlined'
import LanguageOutlinedIcon        from '@mui/icons-material/LanguageOutlined'
import GridViewOutlinedIcon        from '@mui/icons-material/GridViewOutlined'
import RadioButtonUncheckedIcon    from '@mui/icons-material/RadioButtonUnchecked'
import TableChartOutlinedIcon      from '@mui/icons-material/TableChartOutlined'
import InfoOutlinedIcon            from '@mui/icons-material/InfoOutlined'
import MoreVertIcon                from '@mui/icons-material/MoreVert'
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'

// ─── DS tokens ───────────────────────────────────────────────────────────────
const s = {
  primary:       '#0053E5',
  secondary:     '#03194F',
  textPrimary:   '#323338',
  textSecondary: 'rgba(60,60,72,0.6)',
  divider:       'rgba(0,83,229,0.12)',
  editorBg:      '#F5F5F5',
  activeBg:      'rgba(0,83,229,0.08)',
  activeBorder:  'rgba(0,83,229,0.18)',
  navHover:      'rgba(0,83,229,0.05)',
  canvasBorder:  '#E0E0E0',
}

// ─── Color combination swatches ───────────────────────────────────────────────
const COLOR_COMBOS = [
  { top: '#FFFFFF', bottom: '#0053E5', selected: true  },
  { top: '#111111', bottom: '#111111', selected: false },
  { top: '#03194F', bottom: '#03194F', selected: false },
  { top: '#0D2A6E', bottom: '#0D2A6E', selected: false },
  { top: '#F5F5F5', bottom: '#F5F5F5', selected: false },
]

// ─── Scene template definitions ───────────────────────────────────────────────
const TEMPLATE_SECTIONS = [
  {
    label: 'Single Message with Media',
    templates: [
      { id: 'sml-1', layout: 'media-right',    wave: true  },
      { id: 'sml-2', layout: 'media-left',     wave: true  },
      { id: 'sml-3', layout: 'text-bottom',    wave: true  },
      { id: 'sml-4', layout: 'text-top-right', wave: false },
      { id: 'sml-5', layout: 'card-left',      wave: false },
      { id: 'sml-6', layout: 'media-center',   wave: true  },
      { id: 'sml-7', layout: 'card-center',    wave: false },
      { id: 'sml-8', layout: 'text-left-lg',   wave: true  },
      { id: 'sml-9', layout: 'media-full',     wave: false },
    ],
  },
]

// ─── Tiny thumbnail SVG ───────────────────────────────────────────────────────
function TemplateThumbnail({ layout, wave, selected, onClick }: {
  layout: string; wave: boolean; selected: boolean; onClick: () => void
}) {
  const w = 80, h = 56
  const bg = '#F0F0EC'
  const textColor = '#323338'
  const accentLine = '#0053E5'

  type Rect = { x: number; y: number; w: number; h: number }
  let textRect: Rect  = { x: 4,  y: 10, w: 34, h: 26 }
  let mediaRect: Rect = { x: 42, y: 4,  w: 34, h: 40 }
  let showMedia = true

  if (layout === 'media-right')    { textRect = { x: 4, y: 10, w: 34, h: 26 }; mediaRect = { x: 42, y: 4,  w: 34, h: 40 } }
  if (layout === 'media-left')     { textRect = { x: 42, y: 10, w: 34, h: 26 }; mediaRect = { x: 4,  y: 4,  w: 34, h: 40 } }
  if (layout === 'text-bottom')    { textRect = { x: 6, y: 30, w: 56, h: 20 }; mediaRect = { x: 56, y: 4,  w: 20, h: 28 } }
  if (layout === 'text-top-right') { textRect = { x: 44, y: 4, w: 32, h: 20 }; mediaRect = { x: 4,  y: 4,  w: 36, h: 40 } }
  if (layout === 'card-left')      { textRect = { x: 8, y: 10, w: 36, h: 30 }; mediaRect = { x: 50, y: 14, w: 24, h: 24 } }
  if (layout === 'media-center')   { textRect = { x: 4, y: 34, w: 44, h: 16 }; mediaRect = { x: 28, y: 4,  w: 48, h: 32 } }
  if (layout === 'card-center')    { textRect = { x: 20, y: 12, w: 40, h: 26 }; showMedia = false }
  if (layout === 'text-left-lg')   { textRect = { x: 2, y: 4,  w: 40, h: 44 }; mediaRect = { x: 44, y: 8,  w: 32, h: 32 } }
  if (layout === 'media-full')     { textRect = { x: 4, y: 8,  w: 30, h: 20 }; mediaRect = { x: 38, y: 4,  w: 38, h: 44 } }

  const headH = layout === 'text-left-lg' ? 6 : 4

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer', borderRadius: '6px', boxSizing: 'border-box',
        border: selected ? `2px solid ${s.primary}` : '2px solid transparent',
        overflow: 'hidden', flexShrink: 0,
        '&:hover': { border: `2px solid ${s.primary}`, opacity: 0.9 },
        transition: 'border 0.15s',
      }}
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        <rect width={w} height={h} fill={bg} />
        {wave && (
          <path d={`M${w*0.42},0 Q${w*0.52},${h*0.5} ${w*0.44},${h} L${w*0.38},${h} Q${w*0.46},${h*0.5} ${w*0.36},0 Z`}
            fill="none" stroke={accentLine} strokeWidth="0.8" opacity="0.35" />
        )}
        {showMedia && (
          <g>
            <rect x={mediaRect.x} y={mediaRect.y} width={mediaRect.w} height={mediaRect.h} fill="#D0D0C8" rx="2" />
            {Array.from({ length: 8 }).map((_, i) => {
              const step = (mediaRect.w + mediaRect.h) / 7
              return (
                <line key={i}
                  x1={mediaRect.x + i * step - mediaRect.h} y1={mediaRect.y + mediaRect.h}
                  x2={mediaRect.x + i * step} y2={mediaRect.y}
                  stroke="#B8B8B0" strokeWidth="0.8" clipPath={`url(#clip-${layout})`} />
              )
            })}
            <clipPath id={`clip-${layout}`}>
              <rect x={mediaRect.x} y={mediaRect.y} width={mediaRect.w} height={mediaRect.h} rx="2" />
            </clipPath>
            <text x={mediaRect.x + mediaRect.w / 2} y={mediaRect.y + mediaRect.h / 2 + 2}
              textAnchor="middle" fontSize="8" fill="#888" fontFamily="sans-serif">⌗</text>
          </g>
        )}
        <rect x={textRect.x} y={textRect.y} width={textRect.w * 0.8} height={headH} fill={textColor} rx="1" opacity="0.75" />
        <rect x={textRect.x} y={textRect.y + headH + 2} width={textRect.w * 0.6} height={2.5} fill={textColor} rx="1" opacity="0.35" />
        <rect x={textRect.x} y={textRect.y + headH + 6} width={textRect.w * 0.9} height={1.5} fill={textColor} rx="0.5" opacity="0.18" />
        <rect x={textRect.x} y={textRect.y + headH + 9} width={textRect.w * 0.75} height={1.5} fill={textColor} rx="0.5" opacity="0.18" />
        <rect x={4} y={h - 5} width={22} height={1.2} fill={textColor} rx="0.5" opacity="0.18" />
      </svg>
    </Box>
  )
}

// ─── Custom scene left panel section ─────────────────────────────────────────
function NavSection({ label, items }: {
  label: string
  items: { icon: React.ReactNode; text: string }[]
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <Typography sx={{
        fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
        fontSize: 10, color: s.textSecondary, letterSpacing: '0.8px',
        textTransform: 'uppercase', px: '8px', pb: '4px', pt: '8px',
      }}>
        {label}
      </Typography>
      {items.map(({ icon, text }) => (
        <Box key={text} sx={{
          display: 'flex', alignItems: 'center', gap: '8px',
          px: '8px', py: '7px', borderRadius: '6px', cursor: 'pointer',
          '&:hover': { bgcolor: s.activeBg },
        }}>
          <Box sx={{ color: s.textSecondary, display: 'flex', flexShrink: 0 }}>{icon}</Box>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
            fontSize: 13, color: s.textPrimary,
          }}>
            {text}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  open:       boolean
  onClose:    () => void
  onAddScene: (templateId: string) => void
}

type Nav = 'library' | 'import' | 'custom'

// ─── Component ────────────────────────────────────────────────────────────────
export default function SceneLibraryDialog({ open, onClose, onAddScene }: Props) {
  const [nav,      setNav]      = useState<Nav>('library')
  const [selected, setSelected] = useState<string | null>(null)
  const [colors,   setColors]   = useState(COLOR_COMBOS)

  const handleAdd = () => {
    if (nav === 'custom') { onAddScene('custom'); return }
    if (selected) { onAddScene(selected); setSelected(null) }
  }

  const handleClose = () => { setSelected(null); setNav('library'); onClose() }

  const isCustom = nav === 'custom'

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
          position: 'relative',
        },
      }}
    >
      {/* ════════════════════════════════════════════════════════════════════
          CUSTOM SCENE VIEW — full-width, replaces normal layout
      ════════════════════════════════════════════════════════════════════ */}
      {isCustom && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ── Top bar ───────────────────────────────────────────────── */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: '16px', py: '10px', borderBottom: `1px solid ${s.divider}`, flexShrink: 0,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconButton size="small" onClick={() => setNav('library')} sx={{ color: s.textSecondary }}>
                <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
                fontSize: 16, color: s.textPrimary,
              }}>
                Custom scene
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: '4px' }}>
              <IconButton size="small" sx={{ color: s.textSecondary }}>
                <HelpOutlineIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton size="small" onClick={handleClose} sx={{ color: s.textSecondary }}>
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>

          {/* ── Editor row ────────────────────────────────────────────── */}
          <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

            {/* Left tools panel */}
            <Box sx={{
              width: 140, flexShrink: 0, bgcolor: s.secondary,
              display: 'flex', flexDirection: 'column',
              overflowY: 'auto', px: '6px', py: '8px',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
            }}>
              <NavSection label="Style" items={[
                { icon: <StarBorderIcon sx={{ fontSize: 16 }} />,          text: 'Brand'     },
                { icon: <PaletteOutlinedIcon sx={{ fontSize: 16 }} />,     text: 'Theme'     },
                { icon: <PersonOutlinedIcon sx={{ fontSize: 16 }} />,      text: 'Avatar'    },
              ]} />
              <Divider sx={{ my: '6px', borderColor: 'rgba(255,255,255,0.1)' }} />
              <NavSection label="Libraries" items={[
                { icon: <PermMediaOutlinedIcon sx={{ fontSize: 16 }} />,   text: 'Media'         },
                { icon: <MusicNoteOutlinedIcon sx={{ fontSize: 16 }} />,   text: 'Music'         },
                { icon: <MicOutlinedIcon sx={{ fontSize: 16 }} />,         text: 'Voice'         },
                { icon: <StorageOutlinedIcon sx={{ fontSize: 16 }} />,     text: 'Data'          },
                { icon: <InputOutlinedIcon sx={{ fontSize: 16 }} />,       text: 'Input fields'  },
              ]} />
              <Divider sx={{ my: '6px', borderColor: 'rgba(255,255,255,0.1)' }} />
              <NavSection label="Settings" items={[
                { icon: <AspectRatioOutlinedIcon sx={{ fontSize: 16 }} />, text: 'Aspect ratio' },
                { icon: <LanguageOutlinedIcon sx={{ fontSize: 16 }} />,    text: 'Languages'    },
              ]} />
            </Box>

            {/* Left collapse arrow */}
            <Box sx={{
              width: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: s.editorBg, borderRight: `1px solid ${s.canvasBorder}`, cursor: 'pointer',
              '&:hover': { bgcolor: '#eee' },
            }}>
              <ChevronLeftIcon sx={{ fontSize: 14, color: s.textSecondary }} />
            </Box>

            {/* Canvas */}
            <Box sx={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: '#EAEAEA', position: 'relative', overflow: 'hidden',
            }}>
              {/* Scene canvas card */}
              <Box sx={{
                width: '75%', aspectRatio: '16/9', bgcolor: '#FFFFFF',
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Pink/magenta top accent line */}
                <Box sx={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: 4, bgcolor: '#E040FB',
                }} />

                {/* Add placeholder button only */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddPhotoAlternateOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                      fontSize: 14, textTransform: 'none',
                      borderRadius: '8px', px: '16px', py: '8px',
                      bgcolor: s.primary,
                      boxShadow: '0 2px 8px rgba(0,83,229,0.25)',
                    }}
                  >
                    Add placeholder
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Right expand arrow */}
            <Box sx={{
              width: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: s.editorBg, borderLeft: `1px solid ${s.canvasBorder}`, cursor: 'pointer',
              '&:hover': { bgcolor: '#eee' },
            }}>
              <ChevronRightIcon sx={{ fontSize: 14, color: s.textSecondary }} />
            </Box>

            {/* Right tools panel */}
            <Box sx={{
              width: 40, flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '4px', py: '10px',
              bgcolor: s.editorBg, borderLeft: `1px solid ${s.canvasBorder}`,
            }}>
              {[
                { icon: <GridViewOutlinedIcon sx={{ fontSize: 18 }} />,        tip: 'Layout'  },
                { icon: <RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />,    tip: 'Shape'   },
                { icon: <TableChartOutlinedIcon sx={{ fontSize: 18 }} />,      tip: 'Data'    },
                { icon: <InfoOutlinedIcon sx={{ fontSize: 18 }} />,            tip: 'Info'    },
                { icon: <MoreVertIcon sx={{ fontSize: 18 }} />,                tip: 'More'    },
              ].map(({ icon, tip }) => (
                <Tooltip key={tip} title={tip} placement="left" arrow>
                  <IconButton size="small" sx={{ color: s.textSecondary, '&:hover': { color: s.primary } }}>
                    {icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          </Box>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <Box sx={{
            borderTop: `1px solid ${s.divider}`,
            display: 'flex', justifyContent: 'flex-end', gap: '8px',
            px: '28px', py: '14px', flexShrink: 0, bgcolor: '#fff',
          }}>
            <Button variant="outlined" size="large" onClick={handleClose}
              sx={{ fontFamily: '"Open Sans", sans-serif', textTransform: 'none', borderRadius: '8px' }}>
              Cancel
            </Button>
            <Button variant="contained" size="large" onClick={handleAdd}
              sx={{ fontFamily: '"Open Sans", sans-serif', textTransform: 'none', borderRadius: '8px' }}>
              Add scene
            </Button>
          </Box>
        </Box>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          LIBRARY / IMPORT VIEW
      ════════════════════════════════════════════════════════════════════ */}
      {!isCustom && (
        <>
          {/* ── Left sidebar ──────────────────────────────────────────── */}
          <Box sx={{
            width: 188, flexShrink: 0, bgcolor: s.editorBg,
            display: 'flex', flexDirection: 'column',
            borderRight: `1px solid ${s.divider}`,
            py: '12px', px: '8px', gap: '2px',
          }}>
            <Box onClick={() => setNav('library')} sx={{
              display: 'flex', alignItems: 'center', gap: '10px',
              px: '12px', py: '8px', borderRadius: '8px', cursor: 'pointer',
              bgcolor: nav === 'library' ? s.activeBg : 'transparent',
              border: nav === 'library' ? `1px solid ${s.activeBorder}` : '1px solid transparent',
              '&:hover': { bgcolor: nav === 'library' ? s.activeBg : s.navHover },
            }}>
              <TableRowsOutlinedIcon sx={{ fontSize: 18, color: nav === 'library' ? s.primary : s.textSecondary }} />
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: nav === 'library' ? 600 : 400, fontSize: 14,
                color: nav === 'library' ? s.textPrimary : s.textSecondary,
              }}>
                Scene library
              </Typography>
            </Box>

            <Box onClick={() => setNav('import')} sx={{
              display: 'flex', alignItems: 'center', gap: '10px',
              px: '12px', py: '8px', borderRadius: '8px', cursor: 'pointer',
              bgcolor: nav === 'import' ? s.activeBg : 'transparent',
              border: nav === 'import' ? `1px solid ${s.activeBorder}` : '1px solid transparent',
              '&:hover': { bgcolor: nav === 'import' ? s.activeBg : s.navHover },
            }}>
              <UploadFileOutlinedIcon sx={{ fontSize: 18, color: nav === 'import' ? s.primary : s.textSecondary }} />
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: nav === 'import' ? 600 : 400, fontSize: 14,
                color: nav === 'import' ? s.textPrimary : s.textSecondary,
              }}>
                Import scene
              </Typography>
            </Box>

            <Divider sx={{ my: '8px', borderColor: s.divider }} />

            <Button
              variant="outlined" size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => { onAddScene('custom'); handleClose() }}
              sx={{
                mx: '4px',
                fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                fontSize: 13, textTransform: 'none',
                borderRadius: '8px', borderColor: s.activeBorder,
                color: s.primary, justifyContent: 'flex-start',
                px: '10px', py: '6px',
                '&:hover': { bgcolor: s.activeBg, borderColor: s.primary },
              }}
            >
              Custom scene
            </Button>
          </Box>

          {/* ── Main content ────────────────────────────────────────────── */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <DialogTitle component="div" sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              pl: '28px', pr: '16px', pt: '18px', pb: '14px', flexShrink: 0,
            }}>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
                fontSize: 20, color: s.textPrimary,
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

            {/* ── Library view ─────────────────────────────────────────── */}
            {nav === 'library' && (
              <>
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: '28px', pb: '14px', flexShrink: 0,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FilterListIcon sx={{ fontSize: 18, color: s.textSecondary }} />
                    <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: s.textSecondary }}>
                      Filter
                    </Typography>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      border: `1px solid ${s.divider}`, borderRadius: '20px',
                      px: '12px', py: '5px', cursor: 'pointer',
                      '&:hover': { bgcolor: s.activeBg },
                    }}>
                      <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 13, color: s.textPrimary }}>
                        Scene templates
                      </Typography>
                      <KeyboardArrowDownIcon sx={{ fontSize: 16, color: s.textSecondary }} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaceOutlinedIcon sx={{ fontSize: 18, color: s.textSecondary }} />
                      <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 13, color: s.textSecondary }}>
                        Color combinations
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: '6px' }}>
                      {colors.map((c, i) => (
                        <Box key={i} onClick={() => setColors(prev => prev.map((cc, j) => ({ ...cc, selected: j === i })))}
                          sx={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: `linear-gradient(180deg, ${c.top} 50%, ${c.bottom} 50%)`,
                            cursor: 'pointer', boxSizing: 'border-box',
                            border: c.selected ? `2.5px solid ${s.primary}` : '2.5px solid transparent',
                            outline: c.selected ? `2px solid white` : 'none', outlineOffset: '-4px',
                            transition: 'border 0.15s', '&:hover': { opacity: 0.85 },
                          }} />
                      ))}
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: s.divider, mx: '28px', mb: '16px' }} />

                <Box sx={{ flex: 1, overflowY: 'auto', px: '28px', pb: '80px' }}>
                  {TEMPLATE_SECTIONS.map(section => (
                    <Box key={section.label} sx={{ mb: '24px' }}>
                      <Typography sx={{
                        fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                        fontSize: 14, color: s.textSecondary, mb: '12px',
                      }}>
                        {section.label}
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        {section.templates.map(t => (
                          <TemplateThumbnail key={t.id} layout={t.layout} wave={t.wave}
                            selected={selected === t.id}
                            onClick={() => setSelected(prev => prev === t.id ? null : t.id)} />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {/* ── Import view ──────────────────────────────────────────── */}
            {nav === 'import' && (
              <Box sx={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2, px: '40px',
              }}>
                <UploadFileOutlinedIcon sx={{ fontSize: 56, color: s.textSecondary, opacity: 0.5 }} />
                <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 16, color: s.textPrimary }}>
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

            {/* ── Sticky footer ────────────────────────────────────────── */}
            <Box sx={{
              position: 'absolute', bottom: 0, right: 0,
              width: 'calc(100% - 188px)', bgcolor: 'white',
              borderTop: `1px solid ${s.divider}`,
              display: 'flex', justifyContent: 'flex-end', gap: '8px',
              px: '28px', py: '14px', zIndex: 1,
            }}>
              <Button variant="outlined" size="large" onClick={handleClose}
                sx={{ fontFamily: '"Open Sans", sans-serif', textTransform: 'none', borderRadius: '8px' }}>
                Cancel
              </Button>
              <Button variant="contained" size="large"
                disabled={nav === 'library' && !selected} onClick={handleAdd}
                sx={{ fontFamily: '"Open Sans", sans-serif', textTransform: 'none', borderRadius: '8px' }}>
                {nav === 'import' ? 'Import' : 'Add scene'}
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Dialog>
  )
}
