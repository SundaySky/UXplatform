import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Box, Typography, IconButton, Button, Avatar,
  Badge, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, Alert, Divider, Checkbox, Switch,
} from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import UndoIcon                    from '@mui/icons-material/Undo'
import RedoIcon                    from '@mui/icons-material/Redo'
import BrandingWatermarkOutlinedIcon from '@mui/icons-material/BrandingWatermarkOutlined'
import PaletteOutlinedIcon         from '@mui/icons-material/PaletteOutlined'
import PersonOutlinedIcon          from '@mui/icons-material/PersonOutlined'
import PermMediaOutlinedIcon       from '@mui/icons-material/PermMediaOutlined'
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'
import MusicNoteOutlinedIcon       from '@mui/icons-material/MusicNoteOutlined'
import MicOutlinedIcon             from '@mui/icons-material/MicOutlined'
import StorageOutlinedIcon         from '@mui/icons-material/StorageOutlined'
import InputOutlinedIcon           from '@mui/icons-material/InputOutlined'
import AspectRatioOutlinedIcon     from '@mui/icons-material/AspectRatioOutlined'
// ImageOutlinedIcon removed — placeholder panel now uses PNGs
import GridViewOutlinedIcon       from '@mui/icons-material/GridViewOutlined'
import InfoOutlinedIcon           from '@mui/icons-material/InfoOutlined'
// SmartButtonOutlinedIcon removed — placeholder panel now uses PNGs
import LanguageOutlinedIcon        from '@mui/icons-material/LanguageOutlined'
import CommentOutlinedIcon         from '@mui/icons-material/CommentOutlined'
import ChevronLeftIcon             from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon            from '@mui/icons-material/ChevronRight'
import PlayArrowIcon               from '@mui/icons-material/PlayArrow'
import AddIcon                     from '@mui/icons-material/Add'
import CloseIcon                   from '@mui/icons-material/Close'
import ArrowForwardIosIcon         from '@mui/icons-material/ArrowForwardIos'
import VisibilityOutlinedIcon      from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon            from '@mui/icons-material/EditOutlined'
import AlignHorizontalLeftIcon     from '@mui/icons-material/AlignHorizontalLeft'
import ContentCopyOutlinedIcon     from '@mui/icons-material/ContentCopyOutlined'
import MoreHorizIcon               from '@mui/icons-material/MoreHoriz'
import RemoveIcon                  from '@mui/icons-material/Remove'
import TitleIcon                   from '@mui/icons-material/Title'
import PaletteIcon                 from '@mui/icons-material/Palette'
import StarBorderIcon              from '@mui/icons-material/StarBorder'
import DeleteOutlinedIcon         from '@mui/icons-material/DeleteOutlined'
import LockPersonIcon             from '@mui/icons-material/LockPerson'
import Tooltip                    from '@mui/material/Tooltip'
import FormatListBulletedIcon     from '@mui/icons-material/FormatListBulleted'
import ViewWeekOutlinedIcon       from '@mui/icons-material/ViewWeekOutlined'
import KeyboardArrowDownIcon      from '@mui/icons-material/KeyboardArrowDown'
import { NotificationBell, type NotificationItem } from './NotificationsPanel'
import MediaLibraryPanel from './MediaLibraryPanel'
import AvatarLibraryPanel from './AvatarLibraryPanel'
import VideoPermissionDialog, { type VideoPermissionSettings } from './VideoPermissionDialog'
import { OWNER_USER } from './ManageAccessDialog'
import SceneLibraryDialog from './SceneLibraryDialog'

// ─── Floating toolbar (matches Figma DS node 22171-65559) ────────────────────
function PlaceholderToolbar({ onEditClick }: { onEditClick: () => void }) {
  const c = '#0053E5'
  const border = '1px solid #E0E0E0' // grey/300

  const Pill = ({ icon, label, onClick }: { icon: React.ReactNode; label?: string; onClick?: () => void }) => (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        px: label ? '10px' : '7px', py: '5px',
        borderRadius: '8px', border,
        cursor: 'pointer', bgcolor: '#fff', color: c,
        transition: 'background 0.15s',
        '&:hover': { bgcolor: 'rgba(0,83,229,0.06)' },
        flexShrink: 0,
      }}
    >
      {icon}
      {label && (
        <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 13, color: c, whiteSpace: 'nowrap', lineHeight: 1 }}>
          {label}
        </Typography>
      )}
    </Box>
  )

  return (
    <Box
      onMouseDown={e => e.stopPropagation()}
      sx={{
        display: 'inline-flex', alignItems: 'center',
        bgcolor: '#fff', borderRadius: '8px',
        px: '8px', py: '6px', gap: '6px',
        boxShadow: '0px 4px 16px rgba(3,25,79,0.18)',
        userSelect: 'none',
      }}
    >
      <Pill icon={<EditOutlinedIcon sx={{ fontSize: 14 }} />} label="Edit" onClick={onEditClick} />

      {/* Zoom — single bordered box */}
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: '2px',
        px: '8px', py: '5px', borderRadius: '8px', border,
        bgcolor: '#fff', color: c, flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', cursor: 'pointer', '&:hover': { opacity: 0.6 } }}>
          <RemoveIcon sx={{ fontSize: 12 }} />
        </Box>
        <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 12, color: c, mx: '3px', minWidth: 28, textAlign: 'center' }}>
          100%
        </Typography>
        <Box sx={{ display: 'flex', cursor: 'pointer', '&:hover': { opacity: 0.6 } }}>
          <AddIcon sx={{ fontSize: 12 }} />
        </Box>
      </Box>

      <Pill icon={<TitleIcon                sx={{ fontSize: 14 }} />} label="Style" />
      <Pill icon={<AlignHorizontalLeftIcon  sx={{ fontSize: 14 }} />} label="Align" />
      <Pill icon={<PaletteIcon              sx={{ fontSize: 14 }} />} label="Color" />
      <Pill icon={<StarBorderIcon           sx={{ fontSize: 14 }} />} label="Timing" />
      <Pill icon={<ContentCopyOutlinedIcon  sx={{ fontSize: 14 }} />} label="Copy" />
      <Pill icon={<VisibilityOutlinedIcon   sx={{ fontSize: 14 }} />} />
      <Pill icon={<MoreHorizIcon            sx={{ fontSize: 16 }} />} />
    </Box>
  )
}

// ─── Button placeholder toolbar (Figma node 23002-12178) ─────────────────────
function ButtonPlaceholderToolbar({
  size, onSizeChange, onDelete,
}: {
  size: 'S' | 'M' | 'L' | 'XL'
  onSizeChange: (s: 'S' | 'M' | 'L' | 'XL') => void
  onDelete: () => void
}) {
  const primary = '#0053E5'
  const border  = '1px solid #CFD6EA'

  const ActionBtn = ({ icon, label, disabled }: { icon: React.ReactNode; label: string; disabled?: boolean }) => (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      px: '8px', py: '3.5px', height: 32, flexShrink: 0,
      borderRadius: '8px',
      border: disabled ? '1px solid #CECFD2' : border,
      bgcolor: '#fff',
      cursor: disabled ? 'default' : 'pointer',
      '&:hover': { bgcolor: disabled ? '#fff' : 'rgba(0,83,229,0.06)' },
    }}>
      {icon}
      <Typography sx={{
        fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
        color: disabled ? 'rgba(50,51,56,0.5)' : primary,
        lineHeight: 1.5,
      }}>
        {label}
      </Typography>
    </Box>
  )

  return (
    <Box
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        bgcolor: '#fff', borderRadius: '8px',
        px: '6px', py: '5px',
        border, boxShadow: '0 2px 8px rgba(3,25,79,0.15)',
        userSelect: 'none', whiteSpace: 'nowrap',
      }}
    >
      {/* Edit */}
      <ActionBtn icon={<EditOutlinedIcon sx={{ fontSize: 13, color: primary }} />} label="Edit" />

      <Divider orientation="vertical" flexItem sx={{ borderColor: '#CFD6EA', mx: '2px' }} />

      {/* Size label + S / M / L / XL toggle */}
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 13,
          color: '#323338', letterSpacing: '0.46px',
        }}>
          Size
        </Typography>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center',
          border, borderRadius: '8px', overflow: 'hidden',
        }}>
          {([ ['S', '80 × 28px'], ['M', '120 × 36px'], ['L', '160 × 44px'], ['XL', '200 × 52px'] ] as const).map(([sz, dims], i, arr) => (
            <Tooltip key={sz} title={dims} placement="top" arrow>
              <Box
                onClick={() => onSizeChange(sz)}
                sx={{
                  px: '10px', py: '4px', cursor: 'pointer',
                  bgcolor: size === sz ? 'rgba(0,83,229,0.1)' : 'transparent',
                  borderRight: i < arr.length - 1 ? '1px solid #CFD6EA' : 'none',
                  fontFamily: '"Inter", sans-serif', fontWeight: size === sz ? 600 : 400, fontSize: 14,
                  color: size === sz ? primary : '#323338',
                  lineHeight: 1.5,
                  '&:hover': { bgcolor: size === sz ? 'rgba(0,83,229,0.12)' : 'rgba(0,0,0,0.04)' },
                }}
              >
                {sz}
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ borderColor: '#CFD6EA', mx: '2px' }} />

      {/* Timing (disabled) */}
      <ActionBtn
        icon={<StarBorderIcon sx={{ fontSize: 13, color: 'rgba(50,51,56,0.5)' }} />}
        label="Timing"
        disabled
      />

      <Divider orientation="vertical" flexItem sx={{ borderColor: '#CFD6EA', mx: '2px' }} />

      {/* Copy */}
      <ActionBtn icon={<ContentCopyOutlinedIcon sx={{ fontSize: 13, color: primary }} />} label="Copy" />

      {/* Delete */}
      <IconButton size="small" onClick={onDelete} sx={{ color: '#F44336', p: '4px', flexShrink: 0 }}>
        <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {/* More */}
      <IconButton size="small" sx={{ color: primary, p: '4px', flexShrink: 0 }}>
        <MoreHorizIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  )
}

// ─── Bullet placeholder toolbar (Figma node 26110-118643) ────────────────────
function BulletPlaceholderToolbar({
  iconSize, onIconSizeChange, onDelete,
}: {
  iconSize: 'S' | 'M' | 'L' | 'XL'
  onIconSizeChange: (s: 'S' | 'M' | 'L' | 'XL') => void
  onDelete: () => void
}) {
  const primary = '#0053E5'
  const border  = '1px solid #CFD6EA'

  const ActionBtn = ({
    icon, label, disabled, blue,
  }: { icon: React.ReactNode; label: string; disabled?: boolean; blue?: boolean }) => (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      px: '8px', py: '3.5px', height: 32, flexShrink: 0,
      borderRadius: '8px',
      border: disabled ? '1px solid #CECFD2' : border,
      bgcolor: '#fff',
      cursor: disabled ? 'default' : 'pointer',
      '&:hover': { bgcolor: disabled ? '#fff' : 'rgba(0,83,229,0.06)' },
    }}>
      {icon}
      <Typography sx={{
        fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
        color: disabled ? 'rgba(50,51,56,0.5)' : blue ? primary : primary,
        lineHeight: 1.5,
      }}>
        {label}
      </Typography>
    </Box>
  )

  const DropdownBtn = ({ label }: { label: string }) => (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      px: '8px', py: '3.5px', height: 32, flexShrink: 0,
      borderRadius: '8px', border, bgcolor: '#fff', cursor: 'pointer',
      '&:hover': { bgcolor: 'rgba(0,83,229,0.06)' },
    }}>
      <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14, color: primary, lineHeight: 1.5 }}>
        {label}
      </Typography>
      <KeyboardArrowDownIcon sx={{ fontSize: 16, color: primary }} />
    </Box>
  )

  return (
    <Box
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        bgcolor: '#fff', borderRadius: '8px',
        px: '6px', py: '5px',
        border, boxShadow: '0 2px 8px rgba(3,25,79,0.15)',
        userSelect: 'none', whiteSpace: 'nowrap',
      }}
    >
      {/* Edit */}
      <ActionBtn icon={<EditOutlinedIcon sx={{ fontSize: 13, color: primary }} />} label="Edit" />

      <Divider orientation="vertical" flexItem sx={{ borderColor: '#CFD6EA', mx: '2px' }} />

      {/* Icon size label + S / M / L / XL toggle */}
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 13,
          color: '#323338', letterSpacing: '0.46px',
        }}>
          Icon size
        </Typography>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center',
          border, borderRadius: '8px', overflow: 'hidden',
        }}>
          {([ ['S', '16 × 16px'], ['M', '20 × 20px'], ['L', '24 × 24px'], ['XL', '32 × 32px'] ] as const).map(([sz, dims], i, arr) => (
            <Tooltip key={sz} title={dims} placement="top" arrow>
              <Box
                onClick={() => onIconSizeChange(sz)}
                sx={{
                  px: '10px', py: '4px', cursor: 'pointer',
                  bgcolor: iconSize === sz ? 'rgba(0,83,229,0.1)' : 'transparent',
                  borderRight: i < arr.length - 1 ? '1px solid #CFD6EA' : 'none',
                  fontFamily: '"Inter", sans-serif', fontWeight: iconSize === sz ? 600 : 400, fontSize: 14,
                  color: iconSize === sz ? primary : '#323338',
                  lineHeight: 1.5,
                  '&:hover': { bgcolor: iconSize === sz ? 'rgba(0,83,229,0.12)' : 'rgba(0,0,0,0.04)' },
                }}
              >
                {sz}
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ borderColor: '#CFD6EA', mx: '2px' }} />

      {/* Bullet formatting dropdown */}
      <DropdownBtn label="Bullet formatting" />

      {/* Text formatting dropdown */}
      <DropdownBtn label="Text formatting" />

      <Divider orientation="vertical" flexItem sx={{ borderColor: '#CFD6EA', mx: '2px' }} />

      {/* Timing (enabled, blue star) */}
      <ActionBtn icon={<StarBorderIcon sx={{ fontSize: 13, color: primary }} />} label="Timing" />

      <Divider orientation="vertical" flexItem sx={{ borderColor: '#CFD6EA', mx: '2px' }} />

      {/* Delete */}
      <IconButton size="small" onClick={onDelete} sx={{ color: '#F44336', p: '4px', flexShrink: 0 }}>
        <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {/* More */}
      <IconButton size="small" sx={{ color: primary, p: '4px', flexShrink: 0 }}>
        <MoreHorizIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  )
}

// ─── Edit Heading / Sub-heading dialog ───────────────────────────────────────
function EditHeadingDialog({ open, title, currentText, onClose }: {
  open: boolean
  title?: string
  currentText: string
  onClose: (newText: string) => void
}) {
  const [text,       setText]       = useState(currentText)
  const [byAudience, setByAudience] = useState(false)

  // Re-sync when dialog re-opens with new content
  useEffect(() => { if (open) setText(currentText) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => onClose(text)

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        elevation: 8,
        sx: {
          width: 480, borderRadius: '16px', overflow: 'hidden',
          fontFamily: '"Open Sans", sans-serif',
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 3, pt: 3, pb: 2,
      }}>
        <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 700, fontSize: 22, color: '#1A1A2E' }}>
          {title ?? 'Heading'}
        </Typography>
        <IconButton size="small" onClick={handleClose} sx={{ color: '#888' }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, pt: 0, pb: 3 }}>
        {/* Message by audience toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <Switch
            checked={byAudience}
            onChange={e => setByAudience(e.target.checked)}
            size="small"
          />
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: '#1A1A2E' }}>
            Message by audience
          </Typography>
          <Tooltip title="Personalize the heading text per viewer" placement="top" arrow>
            <HelpOutlineIcon sx={{ fontSize: 16, color: '#888', cursor: 'default' }} />
          </Tooltip>
        </Box>

        {/* Text input with formatting bar */}
        <Box sx={{
          border: '2px solid #0053E5', borderRadius: '8px', overflow: 'hidden',
        }}>
          {/* Text area */}
          <TextField
            fullWidth
            multiline
            minRows={2}
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                px: 1.5, pt: 1.5, pb: 1,
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: 700,
                fontSize: 15,
                color: '#1A1A2E',
                alignItems: 'flex-start',
              },
            }}
          />

          {/* Divider + format buttons */}
          <Divider />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.75 }}>
            <Box sx={{
              px: 1, py: 0.5, borderRadius: '6px', bgcolor: 'rgba(0,83,229,0.10)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}>
              <Typography sx={{ fontFamily: 'serif', fontWeight: 700, fontSize: 18, color: '#0053E5', lineHeight: 1 }}>
                B
              </Typography>
            </Box>
            <Box sx={{
              px: 1, py: 0.5, borderRadius: '6px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              '&:hover': { bgcolor: 'rgba(0,83,229,0.06)' },
            }}>
              <Typography sx={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: 18, color: '#1A1A2E', lineHeight: 1 }}>
                I
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Personalize hint */}
        <Typography
          component="span"
          sx={{
            fontFamily: '"Open Sans", sans-serif', fontSize: 13,
            color: '#0053E5', cursor: 'pointer', mt: 1, display: 'inline-block',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Enter text and personalize using {'{'}
        </Typography>
      </DialogContent>
    </Dialog>
  )
}

const IMG_THUMB = '/thumb.svg'

const GRADIENT_BTN =
  'linear-gradient(146.457deg, rgb(235,137,241) 0%, rgb(0,83,229) 100%)'

// ─── Design tokens ────────────────────────────────────────────────────────────
const s = {
  navy:           '#03194F',
  primary:        '#0053E5',
  primaryLight:   '#8BA2FF',
  divider:        'rgba(0,83,229,0.12)',
  dividerGrey:    '#E0E0E0',
  editorBg:       '#F4F7FF',
  textPrimary:    'rgba(0,0,0,0.87)',
  textSecondary:  'rgba(60,60,72,0.8)',
  actionActive:   'rgba(0,0,0,0.56)',
  actionDisabled: 'rgba(0,0,0,0.38)',
  white:          '#FFFFFF',
  successMain:    '#118747',
}

// ─── Section label ────────────────────────────────────────────────────────────
function NavSection({ label }: { label: string }) {
  return (
    <Typography sx={{
      fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
      letterSpacing: '1px', textTransform: 'uppercase',
      color: s.textSecondary, px: '12px', pb: '8px', lineHeight: 1.5,
      opacity: 0.8,
    }}>
      {label}
    </Typography>
  )
}

// ─── Left nav item ────────────────────────────────────────────────────────────
function NavItem({
  icon, label, selected, onClick,
}: {
  icon: React.ReactNode; label: string; selected?: boolean; onClick?: () => void
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: '8px',
        px: '12px', py: '8px', borderRadius: '8px 0 0 8px',
        cursor: 'pointer',
        bgcolor: selected ? s.divider : 'transparent',
        '&:hover': { bgcolor: selected ? s.divider : 'rgba(0,83,229,0.06)' },
      }}
    >
      <Box sx={{ color: selected ? s.primary : s.actionActive, display: 'flex' }}>
        {icon}
      </Box>
      <Typography sx={{
        fontFamily: '"Open Sans", sans-serif',
        fontWeight: selected ? 500 : 400,
        fontSize: 14, lineHeight: 1.5,
        color: selected ? s.textPrimary : s.textSecondary,
      }}>
        {label}
      </Typography>
    </Box>
  )
}

// ─── Comments panel — draggable + resizable ───────────────────────────────────
// checkedNow = checked this panel session (stays in Unresolved with strikethrough)
// resolved   = resolved in a previous session (shown in Completed tab)
interface CommentItem { text: string; checkedNow: boolean; resolved: boolean }
export interface CommentThread { id: number; author: string; comments: CommentItem[] }

// Export total comment count for use in the "View [x] approver comments" button
export const TOTAL_COMMENT_COUNT = 3 // Sarah: 2 comments + Emma: 1 comment

export const INITIAL_THREADS: CommentThread[] = [
  {
    id: 1, author: 'Sarah Johnson',
    comments: [
      { text: 'Opening scene - add the name of the company to the title', checkedNow: false, resolved: false },
      { text: 'Opening scene - We may need a different version of this image depending on rights. Can you check and update me?', checkedNow: false, resolved: false },
    ],
  },
  {
    id: 2, author: 'Emma Rodriguez',
    comments: [
      { text: 'Closing scene - A legal disclaimer is required on this screen', checkedNow: false, resolved: false },
    ],
  },
]

// ─── Unresolved warning dialog (Figma node 19050-66136) ───────────────────────
function UnresolvedWarningDialog({ open, count, onClose, onConfirm }: { open: boolean; count: number; onClose: () => void; onConfirm: () => void }) {
  const [explanation, setExplanation] = useState('')
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      sx={{ zIndex: 1500 }}
      PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0px 0px 10px rgba(3,25,79,0.25)' } }}
    >
      <DialogTitle sx={{
        fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 20,
        lineHeight: 1.5, letterSpacing: 0, color: 'rgba(0,0,0,0.87)',
        pb: 1, pr: 6,
      }}>
        Unresolved comments require explanation
        <IconButton onClick={onClose} size="small"
          sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(0,0,0,0.54)' }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14,
          lineHeight: 1.5, color: 'rgba(0,0,0,0.87)', mb: 2,
        }}>
          There are {count} unresolved {count === 1 ? 'comment' : 'comments'}.{' '}
          <Box component="span"
            sx={{ color: '#0053E5', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={onClose}
          >
            View comments
          </Box>
        </Typography>
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14,
          lineHeight: 1.5, color: 'rgba(0,0,0,0.87)', mb: 1,
        }}>
          Explain why you're requesting sign-off again without changes
        </Typography>
        <TextField
          fullWidth multiline rows={3}
          placeholder="Explain unresolved comments"
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          variant="outlined" size="medium"
          InputProps={{ sx: { fontFamily: '"Open Sans", sans-serif', fontSize: 14, letterSpacing: '0.15px' } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: '8px' }}>
        <Button variant="text" color="primary" size="large" onClick={onClose}
          sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" size="large" onClick={onConfirm}
          sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14, textTransform: 'none' }}>
          Send for approvers
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Comments panel ────────────────────────────────────────────────────────────
function CommentsPanel({
  open, onClose, threads, setThreads, onRequestApproval, awaitingApprovers,
}: {
  open: boolean
  onClose: () => void
  threads: CommentThread[]
  setThreads: React.Dispatch<React.SetStateAction<CommentThread[]>>
  approverNames?: string
  onRequestApproval: () => void
  awaitingApprovers?: boolean
}) {
  const [pos,         setPos]         = useState({ x: 0, y: 80 })
  const [tab,         setTab]         = useState<'unresolved' | 'completed'>('unresolved')
  const [warningOpen, setWarningOpen] = useState(false)
  const dragging  = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })

  // Position on open
  useEffect(() => {
    if (open) setPos({ x: Math.max(0, window.innerWidth - 330 - 266), y: 80 })
  }, [open])

  // On close: move checkedNow → resolved (for next session)
  useEffect(() => {
    if (!open) {
      setThreads(prev => prev.map(t => ({
        ...t,
        comments: t.comments.map(c =>
          c.checkedNow ? { ...c, checkedNow: false, resolved: true } : c
        ),
      })))
    }
  }, [open, setThreads])

  // Drag
  const onHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    e.preventDefault()
  }, [pos])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setPos({ x: dragStart.current.px + (e.clientX - dragStart.current.mx), y: dragStart.current.py + (e.clientY - dragStart.current.my) })
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  // Toggle check: stays in Unresolved tab (strikethrough) until panel closes
  const toggleCheck = (threadId: number, idx: number) =>
    setThreads(prev => prev.map(t =>
      t.id === threadId
        ? { ...t, comments: t.comments.map((c, i) => i === idx ? { ...c, checkedNow: !c.checkedNow } : c) }
        : t
    ))

  const unresolvedCount = threads.reduce((n, t) => n + t.comments.filter(c => !c.checkedNow && !c.resolved).length, 0)
  const allAddressed    = threads.every(t => t.comments.every(c => c.checkedNow || c.resolved))

  const handleRequestApproval = () => {
    if (!allAddressed) { setWarningOpen(true); return }
    onRequestApproval()
  }

  if (!open) return null

  return (
    <>
      <Box sx={{
        position: 'fixed', left: pos.x, top: pos.y,
        width: 292, minWidth: 260,
        bgcolor: s.white, borderRadius: '8px',
        boxShadow: '0px 0px 5px 0px rgba(3,25,79,0.25)',
        zIndex: 1300,
        display: 'flex', flexDirection: 'column',
        resize: 'both', overflow: 'hidden',
      }}>

        {/* ── Header (drag to move) ─────────────────────────────────────── */}
        <Box onMouseDown={onHeaderMouseDown} sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, pt: 1, pb: 1,
          cursor: 'grab', '&:active': { cursor: 'grabbing' },
          userSelect: 'none', flexShrink: 0,
        }}>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 16,
            color: s.textPrimary, lineHeight: 1.5,
          }}>
            Comments
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: s.textPrimary, p: '8px', borderRadius: '8px' }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* ── Toggle tab selector (ToggleButtonGroup pill style) ────────── */}
        <Box sx={{ px: 2, pb: '8px', flexShrink: 0 }}>
          <Box sx={{
            display: 'inline-flex',
            border: '1px solid #CFD6EA',
            borderRadius: '8px',
            padding: '1px',
            gap: 0,
          }}>
            {[
              { key: 'unresolved', label: awaitingApprovers ? 'Unresolved' : `Unresolved (${unresolvedCount})` },
              { key: 'completed',  label: 'Completed' },
            ].map(({ key, label }) => (
              <Box
                key={key}
                onClick={() => setTab(key as typeof tab)}
                sx={{
                  px: '6px', py: '4px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  bgcolor: tab === key ? 'rgba(0,83,229,0.1)' : 'transparent',
                  transition: 'background-color 0.15s',
                }}
              >
                <Typography sx={{
                  fontFamily: '"Open Sans", sans-serif',
                  fontWeight: 500, fontSize: 14, lineHeight: 1.5,
                  color: tab === key ? s.textPrimary : s.textSecondary,
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <Divider sx={{ borderColor: '#E0E0E0', flexShrink: 0 }} />

        {/* ── "View version" link — Unresolved tab only, hidden when no comments ── */}
        {tab === 'unresolved' && unresolvedCount > 0 && (
          <Box sx={{
            px: 2, py: '8px', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '4px',
            cursor: 'pointer', '&:hover': { opacity: 0.8 },
          }}>
            <VisibilityOutlinedIcon sx={{ fontSize: 14, color: s.primary }} />
            <Typography sx={{
              fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
              color: s.primary, lineHeight: 1.5,
            }}>
              View version sent for approval
            </Typography>
            <ArrowForwardIosIcon sx={{ fontSize: 11, color: s.primary }} />
          </Box>
        )}

        {/* ── Awaiting all approvers state ──────────────────────────────── */}
        {awaitingApprovers && tab === 'unresolved' && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 3 }}>
            <Typography sx={{
              fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14,
              lineHeight: 1.5, color: s.textPrimary, textAlign: 'center',
            }}>
              1 of 2 approvers responded<br />
              Comments will appear here once all approvers have responded.
            </Typography>
          </Box>
        )}

        {/* ── Comment threads ───────────────────────────────────────────── */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: '4px', pb: '12px', display: 'flex', flexDirection: 'column', gap: '16px', ...( awaitingApprovers && tab === 'unresolved' ? { display: 'none' } : {}) }}>
          {threads.map(thread => {
            const visibleComments = tab === 'unresolved'
              ? thread.comments.filter(c => !c.resolved)
              : thread.comments.filter(c => c.resolved)
            if (visibleComments.length === 0) return null
            return (
              <Box key={thread.id}>
                {/* "By [Approver Name]" label — only when multiple approvers */}
                {threads.length > 1 && (
                  <Typography sx={{
                    fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
                    color: s.textSecondary, lineHeight: 1.5, mb: '8px',
                  }}>
                    By {thread.author}
                  </Typography>
                )}

                {/* Comments with MUI Checkbox */}
                {visibleComments.map((c, visibleIdx) => {
                  const originalIdx = thread.comments.indexOf(c)
                  const isChecked = c.checkedNow || c.resolved
                  return (
                    <Box key={originalIdx}>
                      {visibleIdx > 0 && (
                        <Divider sx={{ my: '8px', borderColor: '#E0E0E0' }} />
                      )}
                      <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onChange={() => tab === 'unresolved' && toggleCheck(thread.id, originalIdx)}
                          disabled={tab === 'completed'}
                          sx={{
                            p: '2px', flexShrink: 0, mt: '1px',
                            color: s.actionActive,
                            '&.Mui-checked': { color: s.primary },
                          }}
                        />
                        <Typography sx={{
                          fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14,
                          color: isChecked ? s.textSecondary : 'rgba(0,0,0,0.87)',
                          lineHeight: 1.5,
                          textDecoration: isChecked ? 'line-through' : 'none',
                          flex: 1,
                        }}>
                          {c.text}
                        </Typography>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            )
          })}

          {/* Empty states */}
          {tab === 'completed' && threads.every(t => t.comments.every(c => !c.resolved)) && (
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 13, color: s.textSecondary, textAlign: 'center', mt: 2 }}>
              No completed comments yet
            </Typography>
          )}
          {tab === 'unresolved' && unresolvedCount === 0 && (
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: s.textSecondary, textAlign: 'center', mt: 3, pb: '50px' }}>
              There are no unresolved comments
            </Typography>
          )}
        </Box>

        {/* ── Footer: "Resend for approval" — hidden when awaiting approvers or no comments yet ── */}
        {!awaitingApprovers && threads.length > 0 && (
          <Box sx={{
            px: 2, py: '12px',
            borderTop: `1px solid ${s.dividerGrey}`,
            flexShrink: 0,
            display: 'flex', justifyContent: 'flex-end',
          }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleRequestApproval}
              sx={{
                fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
                textTransform: 'none', borderRadius: '8px',
                bgcolor: s.primary, '&:hover': { bgcolor: '#0042BB' },
                px: 2,
              }}
            >
              Resend for approval
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Unresolved warning dialog ─────────────────────────────────────── */}
      <UnresolvedWarningDialog
        open={warningOpen}
        count={unresolvedCount}
        onClose={() => setWarningOpen(false)}
        onConfirm={() => { setWarningOpen(false); onRequestApproval() }}
      />
    </>
  )
}

// ─── Scene thumbnail ──────────────────────────────────────────────────────────
function SceneThumbnail({ index, selected, headingText, subheadingText, footnoteText, onClick }: { index: number; selected: boolean; headingText?: string; subheadingText?: string; footnoteText?: string; onClick?: () => void }) {
  return (
    <Box onClick={onClick} sx={{ width: 140, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', cursor: 'pointer' }}>
      <Typography sx={{
        fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
        color: s.textSecondary, letterSpacing: '0.4px',
      }}>
        Scene {index + 1}
      </Typography>
      <Box sx={{
        width: '100%', aspectRatio: '16/9',
        bgcolor: '#FAFAFA',
        border: `${selected ? 2 : 1}px solid ${selected ? s.primary : s.dividerGrey}`,
        borderRadius: '8px', overflow: 'hidden',
        position: 'relative',
      }}>
        <Box component="img" src={IMG_THUMB} alt=""
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

        {/* Cover left half of SVG — white bg + pink accent line */}
        <Box sx={{ position: 'absolute', inset: 0, width: '50%', bgcolor: '#fff', pointerEvents: 'none' }}>
          <Box sx={{ height: 3, bgcolor: '#C084FC', width: '100%' }} />
        </Box>

        {/* Right side — drag media */}
        <Box sx={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%',
          background: 'repeating-linear-gradient(-45deg, #EBEBEF 0px, #EBEBEF 6px, #E2E2E7 6px, #E2E2E7 12px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '4px', pointerEvents: 'none',
        }}>
          <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 22, color: '#BDBDBD' }} />
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 7, color: '#BDBDBD' }}>
            Drag media here
          </Typography>
        </Box>

        {/* Heading + sub-heading — flowing column */}
        <Box sx={{ position: 'absolute', left: '4%', top: '18%', width: '44%', containerType: 'inline-size', pointerEvents: 'none', display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '9cqw', color: s.navy, lineHeight: 1.2, wordBreak: 'break-word' }}>
            {headingText ?? ''}
          </Typography>
          <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '4cqw', color: s.textPrimary, lineHeight: 1.4, wordBreak: 'break-word', mt: '5%' }}>
            {subheadingText ?? 'Sub-heading Placeholder'}
          </Typography>
        </Box>

        {/* Footnote */}
        <Box sx={{ position: 'absolute', left: '4%', width: '44%', bottom: '5%', containerType: 'inline-size', pointerEvents: 'none' }}>
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: '2.5cqw', letterSpacing: '0.4px', color: s.textSecondary, lineHeight: 1.66 }}>
            {footnoteText ?? 'Footnote placeholder'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

// ─── Custom scene thumbnail ───────────────────────────────────────────────────
// Custom icon: corner handles + plus — matches the shared design
function PlaceholderIcon({ size = 28, color = s.primary }: { size?: number; color?: string }) {
  const d = size
  const corner = d * 0.15   // corner square size
  const gap    = d * 0.28   // inset from edge
  const arm    = d * 0.12   // half-length of plus arms
  const cx     = d / 2
  return (
    <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {/* Corner squares */}
      <rect x={0}            y={0}            width={corner} height={corner} rx={corner * 0.25} fill={color} />
      <rect x={d - corner}   y={0}            width={corner} height={corner} rx={corner * 0.25} fill={color} />
      <rect x={0}            y={d - corner}   width={corner} height={corner} rx={corner * 0.25} fill={color} />
      <rect x={d - corner}   y={d - corner}   width={corner} height={corner} rx={corner * 0.25} fill={color} />
      {/* Corner connector lines */}
      <line x1={corner}    y1={corner * 0.5} x2={gap}        y2={corner * 0.5} stroke={color} strokeWidth={corner * 0.4} strokeLinecap="round" />
      <line x1={d - corner} y1={corner * 0.5} x2={d - gap}   y2={corner * 0.5} stroke={color} strokeWidth={corner * 0.4} strokeLinecap="round" />
      <line x1={corner * 0.5} y1={corner}    x2={corner * 0.5} y2={gap}        stroke={color} strokeWidth={corner * 0.4} strokeLinecap="round" />
      <line x1={corner * 0.5} y1={d - corner} x2={corner * 0.5} y2={d - gap}  stroke={color} strokeWidth={corner * 0.4} strokeLinecap="round" />
      <line x1={d - corner * 0.5} y1={corner}  x2={d - corner * 0.5} y2={gap}       stroke={color} strokeWidth={corner * 0.4} strokeLinecap="round" />
      <line x1={d - corner * 0.5} y1={d - corner} x2={d - corner * 0.5} y2={d - gap} stroke={color} strokeWidth={corner * 0.4} strokeLinecap="round" />
      <line x1={corner}    y1={d - corner * 0.5} x2={gap}        y2={d - corner * 0.5} stroke={color} strokeWidth={corner * 0.4} strokeLinecap="round" />
      <line x1={d - corner} y1={d - corner * 0.5} x2={d - gap}  y2={d - corner * 0.5} stroke={color} strokeWidth={corner * 0.4} strokeLinecap="round" />
      {/* Plus sign */}
      <line x1={cx - arm} y1={cx} x2={cx + arm} y2={cx} stroke={color} strokeWidth={corner * 0.6} strokeLinecap="round" />
      <line x1={cx} y1={cx - arm} x2={cx} y2={cx + arm} stroke={color} strokeWidth={corner * 0.6} strokeLinecap="round" />
    </svg>
  )
}

function CustomSceneThumbnail({ index, selected, onClick }: { index: number; selected: boolean; onClick?: () => void }) {
  return (
    <Box onClick={onClick} sx={{ width: 140, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', cursor: 'pointer' }}>
      <Typography sx={{
        fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
        color: s.textSecondary, letterSpacing: '0.4px',
      }}>
        Scene {index + 1}
      </Typography>
      <Box sx={{
        width: '100%', aspectRatio: '16/9',
        bgcolor: '#FAFAFA',
        border: `${selected ? 2 : 1}px solid ${selected ? s.primary : s.dividerGrey}`,
        borderRadius: '8px', overflow: 'hidden',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <PlaceholderIcon size={28} />
      </Box>
    </Box>
  )
}

// ─── Per-scene content lookup ─────────────────────────────────────────────────
function sceneContentFor(title?: string): [string, string][] {
  const map: Record<string, [string, string][]> = {
    'Stay Safe During Missile Threats': [
      ['Find Your Nearest Shelter', 'Know your safest options before an alert sounds'],
      ['When the Siren Sounds', 'Drop, take cover, and protect your head immediately'],
      ['After the All-Clear', 'Wait for official confirmation before leaving your shelter'],
    ],
    'Recent TTS Pronunciation Advancements': [
      ['Improved Accuracy', 'New models achieve 97% accuracy on complex terminology'],
      ['Natural Voice Flow', 'Context-aware prosody creates more human-like speech'],
      ['Try It Yourself', 'Access the updated TTS toolkit in your dashboard today'],
    ],
    'Prepare for Winter Fun!': [
      ['Gear Up Together', 'Essential equipment for every age and skill level'],
      ['Safety First', 'Check conditions and prep your first-aid kit before heading out'],
      ['Make Memories', 'Capture the moments that last a lifetime'],
    ],
    'Understanding the American-Israel-Iran Conflict: Peace & Safety': [
      ['Key Players & Interests', 'A closer look at the stakeholders shaping the region'],
      ['The Path to De-escalation', 'Diplomatic efforts and international frameworks in play'],
      ['What It Means for You', 'How regional stability affects global security and daily life'],
    ],
    "Discover Tel Aviv's Scenic Parks": [
      ['Yarkon Park', '3,800 dunams of greenery in the heart of the city'],
      ['Urban Wildlife', 'Meet the birds, fish, and flora that call these parks home'],
      ['Plan Your Visit', 'Opening hours, facilities, and the best times to explore'],
    ],
    'Onboarding Steps': [
      ['Set Up Your Profile', 'Personalise your account and team settings in minutes'],
      ['Explore Key Features', 'A guided tour of the tools you\'ll use every day'],
      ['You\'re Ready to Go', 'Connect with your team and start your first project'],
    ],
  }
  return map[title ?? ''] ?? [
    ['Scene Overview', 'Key insights for this section of your video'],
    ['Deeper Dive', 'Supporting details and context worth highlighting'],
    ['Key Takeaway', 'What your audience should remember most'],
  ]
}

// ─── Studio page ──────────────────────────────────────────────────────────────
interface Props {
  videoTitle:               string
  initialHeadingText?:      string
  initialSubheadingText?:   string
  approverNames:            string
  onNavigateToVideoPage:    () => void
  onNavigateToLibrary:      () => void
  onRequestReapproval:      () => void
  onHeadingChange?:         (text: string) => void
  onSubheadingChange?:      (text: string) => void
  openCommentsOnMount?:     boolean
  triggerOpenComments?:     number
  notifications?:           NotificationItem[]
  initialThreads?:          CommentThread[]
  initialPermSettings?:     VideoPermissionSettings
  onPermChange?:            (s: VideoPermissionSettings) => void
  awaitingApprovers?:       boolean
  onEditAttempt?:           () => void
}

export default function StudioPage({ videoTitle, initialHeadingText, initialSubheadingText, approverNames, onNavigateToVideoPage, onNavigateToLibrary, onRequestReapproval, onHeadingChange, onSubheadingChange, openCommentsOnMount, triggerOpenComments, notifications, initialThreads, initialPermSettings, onPermChange, awaitingApprovers, onEditAttempt }: Props) {
  const [commentsOpen, setCommentsOpen] = useState(() => openCommentsOnMount ?? false)

  // Open comments panel whenever triggerOpenComments counter increments (e.g. from notification link)
  useEffect(() => {
    if (triggerOpenComments && triggerOpenComments > 0) setCommentsOpen(true)
  }, [triggerOpenComments])
  const [activeNav,        setActiveNav]        = useState<string | null>(null)
  const [mediaLibOpen,     setMediaLibOpen]     = useState(false)
  const [mediaFolder,      setMediaFolder]      = useState<string | null>(null)
  const [avatarLibOpen,    setAvatarLibOpen]    = useState(false)
  const [avatarReqCount,   setAvatarReqCount]   = useState(4) // mock: adam has 4 pending
  const [selectedScene,    setSelectedScene]    = useState(0)
  const [headingSelected,     setHeadingSelected]     = useState(false)
  const [headingText,         setHeadingText]         = useState(initialHeadingText ?? videoTitle)
  const [editHeadingOpen,     setEditHeadingOpen]     = useState(false)
  const [subheadingSelected,  setSubheadingSelected]  = useState(false)
  const [subheadingText,      setSubheadingText]      = useState(initialSubheadingText ?? 'Sub-heading Placeholder')
  const [editSubheadingOpen,  setEditSubheadingOpen]  = useState(false)
  const [footnoteSelected,    setFootnoteSelected]    = useState(false)
  const [footnoteText,        setFootnoteText]        = useState('Footnote placeholder')
  const [editFootnoteOpen,    setEditFootnoteOpen]    = useState(false)

  const [sceneTypes,       setSceneTypes]       = useState<('regular' | 'custom')[]>(['regular', 'regular', 'regular', 'regular'])
  const [sceneLibOpen,     setSceneLibOpen]     = useState(false)
  const [placeholderMenuOpen, setPlaceholderMenuOpen] = useState(false)
  // Track which placeholder types have been added per scene index
  const [scenePlaceholders, setScenePlaceholders] = useState<Record<number, string[]>>({})
  // Button placeholder selection + size
  const [buttonSelected, setButtonSelected] = useState(false)
  const [buttonSize,     setButtonSize]     = useState<'S'|'M'|'L'|'XL'>('L')
  // Bullet placeholder selection + icon size
  const [bulletSelected,  setBulletSelected]  = useState<'Vertical bullet point' | 'Horizontal bullet point' | null>(null)
  const [bulletIconSize,  setBulletIconSize]  = useState<'S'|'M'|'L'|'XL'>('M')

  // Draggable element positions: keyed by `${sceneIndex}-${label}`, values are % of canvas
  const [elementPositions, setElementPositions] = useState<Record<string, { x: number; y: number }>>({})
  const canvasRef   = useRef<HTMLDivElement | null>(null)
  const dragInfo    = useRef<{ key: string; startMX: number; startMY: number; startX: number; startY: number; moved: boolean } | null>(null)

  const getPos = (scene: number, label: string, defaultX: number, defaultY: number) => {
    const key = `${scene}-${label}`
    return elementPositions[key] ?? { x: defaultX, y: defaultY }
  }

  const startDrag = (e: React.MouseEvent, scene: number, label: string, defaultX: number, defaultY: number) => {
    e.stopPropagation()
    const pos = getPos(scene, label, defaultX, defaultY)
    dragInfo.current = { key: `${scene}-${label}`, startMX: e.clientX, startMY: e.clientY, startX: pos.x, startY: pos.y, moved: false }
  }

  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragInfo.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const dx = ((e.clientX - dragInfo.current.startMX) / rect.width)  * 100
    const dy = ((e.clientY - dragInfo.current.startMY) / rect.height) * 100
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) dragInfo.current.moved = true
    setElementPositions(prev => ({
      ...prev,
      [dragInfo.current!.key]: {
        x: Math.max(5, Math.min(95, dragInfo.current!.startX + dx)),
        y: Math.max(5, Math.min(95, dragInfo.current!.startY + dy)),
      },
    }))
  }

  const onCanvasMouseUp = () => { dragInfo.current = null }
  const SCENE_COUNT = sceneTypes.length
  const goToScene = (idx: number) => {
    const next = Math.max(0, Math.min(SCENE_COUNT - 1, idx))
    setSelectedScene(next)
    setHeadingSelected(false)
    setSubheadingSelected(false)
    setFootnoteSelected(false)
    if (sceneTypes[next] !== 'custom') setPlaceholderMenuOpen(false)
  }
  const [threads,          setThreads]          = useState<CommentThread[]>(initialThreads ?? [])
  const [snackbarMsg,      setSnackbarMsg]      = useState<string | null>(null)
  const [videoPermOpen,     setVideoPermOpen]     = useState(false)
  const [videoPermSettings, setVideoPermSettings] = useState<VideoPermissionSettings | undefined>(initialPermSettings)

  // Unread = not yet checked or resolved
  const unreadCount = threads.reduce((n, t) => n + t.comments.filter(c => !c.checkedNow && !c.resolved).length, 0)

  const NAV_SECTIONS = [
    {
      section: 'STYLE',
      items: [
        { icon: <BrandingWatermarkOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Brand' },
        { icon: <PaletteOutlinedIcon          sx={{ fontSize: 20 }} />, label: 'Theme' },
        {
          icon: (
            <Badge
              badgeContent={avatarReqCount > 0 ? avatarReqCount : undefined}
              color="error"
              sx={{ '& .MuiBadge-badge': { fontSize: 9, minWidth: 14, height: 14, padding: 0 } }}
            >
              <PersonOutlinedIcon sx={{ fontSize: 20 }} />
            </Badge>
          ),
          label: 'Avatar',
        },
      ],
    },
    {
      section: 'LIBRARIES',
      items: [
        { icon: <PermMediaOutlinedIcon  sx={{ fontSize: 20 }} />, label: 'Media' },
        { icon: <MusicNoteOutlinedIcon  sx={{ fontSize: 20 }} />, label: 'Music' },
        { icon: <MicOutlinedIcon        sx={{ fontSize: 20 }} />, label: 'Voice' },
        { icon: <StorageOutlinedIcon    sx={{ fontSize: 20 }} />, label: 'Data' },
        { icon: <InputOutlinedIcon      sx={{ fontSize: 20 }} />, label: 'Input fields' },
      ],
    },
    {
      section: 'SETTINGS',
      items: [
        { icon: <AspectRatioOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Aspect ratio' },
        { icon: <LanguageOutlinedIcon    sx={{ fontSize: 20 }} />, label: 'Languages' },
      ],
    },
    {
      section: 'APPROVAL',
      items: [
        {
          icon: (
            <Badge
              badgeContent={unreadCount > 0 ? unreadCount : undefined}
              color="error"
              sx={{ '& .MuiBadge-badge': { fontSize: 9, minWidth: 14, height: 14, padding: 0 } }}
            >
              <CommentOutlinedIcon sx={{ fontSize: 20 }} />
            </Badge>
          ),
          label: 'Comments',
          onClickOverride: () => { setCommentsOpen(true) },
        },
      ],
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* ── Appbar ─────────────────────────────────────────────────────────── */}
      <Box sx={{
        height: 56, flexShrink: 0, bgcolor: s.navy,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 0, borderBottom: `1px solid rgba(255,255,255,0.08)`,
      }}>
        {/* Left */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Logo — click to go to library */}
          <Box
            onClick={onNavigateToLibrary}
            sx={{
              width: 56, height: 56, flexShrink: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', '&:hover': { opacity: 0.75 },
            }}
          >
            {[{ chars: 'SUN', color: '#fff' }, { chars: 'DAY', color: '#fff' }, { chars: 'SKY', color: '#0053E5' }]
              .map(({ chars, color }) => (
                <Typography key={chars} sx={{
                  fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 9,
                  letterSpacing: '0.22em', lineHeight: 1.4, color, display: 'block',
                }}>
                  {chars}
                </Typography>
              ))}
          </Box>
          {/* Video name */}
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 18,
            color: '#fff', lineHeight: 1.2, letterSpacing: '0.15px',
          }}>
            {videoTitle}
          </Typography>
          {/* Language badge */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: '4px',
            px: '10px', py: '4px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer',
          }}>
            <Typography sx={{ fontSize: 13 }}>🇺🇸</Typography>
            <Typography sx={{
              fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14, color: '#fff',
            }}>
              EN
            </Typography>
          </Box>
        </Box>

        {/* Right */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 2 }}>
          <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <UndoIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <RedoIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box sx={{ width: '1px', height: 20, bgcolor: 'rgba(255,255,255,0.2)', mx: 0.5 }} />
          {/* Manage permissions button */}
          <Tooltip
            title="Manage permission"
            placement="bottom"
            arrow
            componentsProps={{ tooltip: { sx: { bgcolor: '#03194F', borderRadius: '8px', px: 1.5, py: 1, '& .MuiTooltip-arrow': { color: '#03194F' } } } }}
          >
            <IconButton
              size="small"
              onClick={() => setVideoPermOpen(true)}
              sx={{
                bgcolor: '#03194F',
                borderRadius: '8px',
                p: '5px',
                border: '1px solid rgba(255,255,255,0.5)',
                '&:hover': { bgcolor: 'rgba(3,25,79,0.7)' },
              }}
            >
              <LockPersonIcon sx={{ fontSize: 20, color: '#fff' }} />
            </IconButton>
          </Tooltip>
          <Avatar sx={{ width: 32, height: 32, bgcolor: OWNER_USER.color, fontSize: 12, fontFamily: '"Open Sans"', fontWeight: 600 }}>
            {OWNER_USER.initials}
          </Avatar>
          <NotificationBell dark notifications={notifications} />
          <Box sx={{ width: '1px', height: 20, bgcolor: 'rgba(255,255,255,0.2)', mx: 0.5 }} />
          {/* Video Page button */}
          <Button
            size="small"
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: '11px !important' }} />}
            onClick={onNavigateToVideoPage}
            sx={{
              background: GRADIENT_BTN, color: '#fff',
              fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
              textTransform: 'none', borderRadius: '8px', px: 2, whiteSpace: 'nowrap',
              '&:hover': { opacity: 0.88, background: GRADIENT_BTN },
            }}
          >
            Video Page
          </Button>
        </Box>
      </Box>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left nav */}
        <Box sx={{
          width: 180, flexShrink: 0, bgcolor: s.white,
          borderRight: `1px solid ${s.divider}`,
          overflowY: 'auto', pt: '16px',
          display: 'flex', flexDirection: 'column', gap: '24px',
        }}>
          {NAV_SECTIONS.map(({ section, items }) => (
            <Box key={section}>
              <NavSection label={section} />
              {items.map(({ icon, label, onClickOverride }: { icon: React.ReactNode; label: string; onClickOverride?: () => void }) => (
                <NavItem
                  key={label}
                  icon={icon}
                  label={label}
                  selected={activeNav === label}
                  onClick={() => {
                    if (label === 'Avatar') {
                      if (activeNav === 'Avatar' && avatarLibOpen) {
                        setAvatarLibOpen(false)
                        setActiveNav(null)
                      } else {
                        setAvatarLibOpen(true)
                        setMediaLibOpen(false)
                        setActiveNav('Avatar')
                      }
                    } else if (label === 'Media') {
                      if (activeNav === 'Media' && mediaLibOpen) {
                        // Toggle off
                        setMediaLibOpen(false)
                        setActiveNav(null)
                      } else {
                        setMediaLibOpen(true)
                        setMediaFolder(null)
                        setAvatarLibOpen(false)
                        setActiveNav('Media')
                      }
                    } else {
                      setActiveNav(label)
                      setMediaLibOpen(false)
                      setAvatarLibOpen(false)
                      if (onClickOverride) onClickOverride()
                    }
                  }}
                />
              ))}
            </Box>
          ))}
        </Box>

        {/* Media Library Panel — slides in between nav and stage */}
        <MediaLibraryPanel
          open={mediaLibOpen}
          onClose={() => { setMediaLibOpen(false); setActiveNav(null) }}
          folder={mediaFolder}
          onOpenFolder={name => setMediaFolder(name)}
          onCloseFolder={() => setMediaFolder(null)}
        />

        {/* Avatar Library Panel — slides in between nav and stage */}
        <AvatarLibraryPanel
          open={avatarLibOpen}
          onClose={() => { setAvatarLibOpen(false); setActiveNav(null) }}
          onTotalRequestsChange={setAvatarReqCount}
        />

        {/* Stage */}
        <Box sx={{ flex: 1, bgcolor: s.editorBg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Live preview area */}
          <Box sx={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            px: 2, py: 3, overflow: 'hidden', position: 'relative',
          }}>


            {/* Prev arrow */}
            <IconButton
              disabled={selectedScene === 0}
              onClick={() => goToScene(selectedScene - 1)}
              size="small"
              sx={{ flexShrink: 0, color: selectedScene === 0 ? s.actionDisabled : s.primary, mx: '4px' }}
            >
              <ChevronLeftIcon />
            </IconButton>

            {/* Canvas + right toolbar — inner group aligned at top so toolbar top === canvas top */}
            <Box sx={{ flex: 1, maxWidth: 720, display: 'flex', alignItems: 'stretch', gap: '8px', position: 'relative' }}>

              {/* Placeholder picker panel — anchored right edge = toolbar left edge, top = toolbar top */}
              {placeholderMenuOpen && (
                <Box
                  onClick={e => e.stopPropagation()}
                  sx={{
                    position: 'absolute', top: 0, right: 40, zIndex: 30,
                    bgcolor: '#fff', borderRadius: '12px',
                    boxShadow: '0 0 5px rgba(3,25,79,0.25)',
                    width: 232, overflow: 'hidden',
                    border: `1px solid ${s.divider}`,
                  }}
                >
                  {/* Header */}
                  <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: '16px', pt: '14px', pb: '8px',
                  }}>
                    <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 16, color: s.textPrimary }}>
                      Placeholder
                    </Typography>
                    <IconButton size="small" onClick={() => setPlaceholderMenuOpen(false)} sx={{ color: s.textSecondary, p: '2px' }}>
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>

                  {/* Items — each in a bordered rounded card */}
                  <Box sx={{ px: '12px', pb: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {([
                      { src: '/heading.png',     label: 'Heading',                labelColor: s.primary,       iconEl: null },
                      { src: '/sub heading.png', label: 'Sub heading',            labelColor: s.primary,       iconEl: null },
                      { src: '/media.png',       label: 'Media',                  labelColor: s.primary,       iconEl: null },
                      { src: null,               label: 'Vertical bullet point',  labelColor: s.primary,       iconEl: (
                        <Box sx={{ width: 22, height: 22, bgcolor: s.primary, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FormatListBulletedIcon sx={{ fontSize: 14, color: '#fff' }} />
                        </Box>
                      )},
                      { src: null,               label: 'Horizontal bullet point',labelColor: s.primary,       iconEl: (
                        <Box sx={{ width: 22, height: 22, bgcolor: s.primary, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ViewWeekOutlinedIcon sx={{ fontSize: 14, color: '#fff' }} />
                        </Box>
                      )},
                      { src: null,               label: 'Footnote',               labelColor: s.textSecondary, iconEl: null },
                      { src: '/logo.png',        label: 'Logo',                   labelColor: s.primary,       iconEl: null },
                      { src: '/button.png',      label: 'Button',                 labelColor: s.primary,       iconEl: null },
                    ] as { src: string|null; label: string; labelColor: string; iconEl: React.ReactNode }[]).map(({ src, label, labelColor, iconEl }) => (
                      <Box
                        key={label}
                        onClick={() => {
                          setScenePlaceholders(prev => {
                            const existing = prev[selectedScene] ?? []
                            if (existing.includes(label)) return prev
                            return { ...prev, [selectedScene]: [...existing, label] }
                          })
                          setPlaceholderMenuOpen(false)
                        }}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          px: '12px', py: '10px', cursor: 'pointer',
                          borderRadius: '8px',
                          border: `1px solid ${s.divider}`,
                          bgcolor: '#fff',
                          '&:hover': { bgcolor: 'rgba(0,83,229,0.04)', borderColor: 'rgba(0,83,229,0.3)' },
                        }}>
                        <Box sx={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {iconEl
                            ? iconEl
                            : src
                              ? <img src={src} alt={label} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                              : <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 18, color: s.textSecondary, lineHeight: 1 }}>*</Typography>
                          }
                        </Box>
                        <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, color: labelColor }}>
                          {label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

            {/* Canvas */}
            <Box
              ref={canvasRef}
              onClick={() => { setHeadingSelected(false); setSubheadingSelected(false); setFootnoteSelected(false); setPlaceholderMenuOpen(false); setButtonSelected(false); setBulletSelected(null) }}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={onCanvasMouseUp}
              onMouseLeave={onCanvasMouseUp}
              sx={{
                flex: 1, position: 'relative',
                borderRadius: '8px', overflow: 'visible',
                border: `1px solid ${headingSelected || subheadingSelected || footnoteSelected ? '#0053E5' : s.divider}`,
                boxShadow: headingSelected || subheadingSelected || footnoteSelected
                  ? '0px 0px 0px 2px rgba(0,83,229,0.20), 0px 2px 12px rgba(3,25,79,0.10)'
                  : '0px 2px 12px rgba(3,25,79,0.10)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
            >
              {/* ── Custom scene canvas ──────────────────────────────── */}
              {sceneTypes[selectedScene] === 'custom' && (() => {
                const added = scenePlaceholders[selectedScene] ?? []
                const hasButton   = added.includes('Button')
                const hasVBullet  = added.includes('Vertical bullet point')
                const hasHBullet  = added.includes('Horizontal bullet point')

                // Icon container sizes for bullet items (S/M/L/XL)
                const bulletIconContainerPx: Record<string, number> = { S: 28, M: 36, L: 44, XL: 56 }
                const iconContainerPx = bulletIconContainerPx[bulletIconSize]
                const iconInnerPx     = iconContainerPx * 0.6
                const badgePx         = Math.max(12, Math.round(iconContainerPx * 0.35))

                // One bullet row/column item: image-icon + badge + "Placeholder" text
                const BulletItem = ({ direction }: { direction: 'row' | 'column' }) => (
                  <Box sx={{ display: 'flex', flexDirection: direction, alignItems: 'center', gap: direction === 'row' ? '10px' : '6px' }}>
                    {/* Image icon with + badge */}
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                      <Box sx={{
                        width: iconContainerPx, height: iconContainerPx,
                        bgcolor: '#616161', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <AddPhotoAlternateOutlinedIcon sx={{ fontSize: iconInnerPx, color: '#fff' }} />
                      </Box>
                      {/* "+" badge */}
                      <Box sx={{
                        position: 'absolute', top: -badgePx * 0.35, right: -badgePx * 0.35,
                        width: badgePx, height: badgePx, borderRadius: '50%',
                        bgcolor: '#9E9E9E', border: '2px solid #fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <AddIcon sx={{ fontSize: badgePx * 0.65, color: '#fff' }} />
                      </Box>
                    </Box>
                    <Typography sx={{
                      fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
                      fontSize: Math.max(11, Math.round(iconContainerPx * 0.38)),
                      color: '#03194F', whiteSpace: 'nowrap',
                    }}>
                      Placeholder
                    </Typography>
                  </Box>
                )

                return (
                  <Box sx={{ overflow: 'hidden', borderRadius: '8px', position: 'relative', aspectRatio: '16/9', bgcolor: '#FFFFFF' }}>
                    {/* Pink top accent */}
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, bgcolor: '#E040FB', zIndex: 1 }} />

                    {/* Empty state — show when no placeholders added yet */}
                    {added.length === 0 && (
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                        <PlaceholderIcon size={52} />
                        <Button
                          variant="contained"
                          onClick={e => { e.stopPropagation(); setPlaceholderMenuOpen(p => !p) }}
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
                    )}

                    {/* Vertical bullet point placeholder */}
                    {hasVBullet && (() => {
                      const pos = getPos(selectedScene, 'Vertical bullet point', 50, 45)
                      const isSelected = bulletSelected === 'Vertical bullet point'
                      return (
                        <Box
                          sx={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', zIndex: 3 }}
                          onMouseDown={e => startDrag(e, selectedScene, 'Vertical bullet point', 50, 45)}
                          onClick={e => {
                            e.stopPropagation()
                            if (!dragInfo.current?.moved) {
                              setBulletSelected(p => p === 'Vertical bullet point' ? null : 'Vertical bullet point')
                              setButtonSelected(false)
                            }
                          }}
                        >
                          {/* Toolbar above */}
                          {isSelected && (
                            <Box sx={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                              <BulletPlaceholderToolbar
                                iconSize={bulletIconSize}
                                onIconSizeChange={setBulletIconSize}
                                onDelete={() => {
                                  setScenePlaceholders(prev => ({ ...prev, [selectedScene]: (prev[selectedScene] ?? []).filter(p => p !== 'Vertical bullet point') }))
                                  setBulletSelected(null)
                                }}
                              />
                            </Box>
                          )}
                          {/* 3 stacked rows */}
                          <Box sx={{
                            display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'grab',
                            p: '8px', borderRadius: '8px',
                            outline: isSelected ? '2px solid #0053E5' : '2px solid transparent',
                            outlineOffset: '4px',
                            boxShadow: isSelected ? '0 0 0 4px rgba(0,83,229,0.12)' : 'none',
                            transition: 'all 0.15s',
                          }}>
                            {[0, 1, 2].map(i => <BulletItem key={i} direction="row" />)}
                          </Box>
                        </Box>
                      )
                    })()}

                    {/* Horizontal bullet point placeholder */}
                    {hasHBullet && (() => {
                      const pos = getPos(selectedScene, 'Horizontal bullet point', 50, 55)
                      const isSelected = bulletSelected === 'Horizontal bullet point'
                      return (
                        <Box
                          sx={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', zIndex: 3 }}
                          onMouseDown={e => startDrag(e, selectedScene, 'Horizontal bullet point', 50, 55)}
                          onClick={e => {
                            e.stopPropagation()
                            if (!dragInfo.current?.moved) {
                              setBulletSelected(p => p === 'Horizontal bullet point' ? null : 'Horizontal bullet point')
                              setButtonSelected(false)
                            }
                          }}
                        >
                          {/* Toolbar above */}
                          {isSelected && (
                            <Box sx={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                              <BulletPlaceholderToolbar
                                iconSize={bulletIconSize}
                                onIconSizeChange={setBulletIconSize}
                                onDelete={() => {
                                  setScenePlaceholders(prev => ({ ...prev, [selectedScene]: (prev[selectedScene] ?? []).filter(p => p !== 'Horizontal bullet point') }))
                                  setBulletSelected(null)
                                }}
                              />
                            </Box>
                          )}
                          {/* 3 side-by-side columns */}
                          <Box sx={{
                            display: 'flex', flexDirection: 'row', gap: '16px', cursor: 'grab',
                            p: '8px', borderRadius: '8px',
                            outline: isSelected ? '2px solid #0053E5' : '2px solid transparent',
                            outlineOffset: '4px',
                            boxShadow: isSelected ? '0 0 0 4px rgba(0,83,229,0.12)' : 'none',
                            transition: 'all 0.15s',
                          }}>
                            {[0, 1, 2].map(i => <BulletItem key={i} direction="column" />)}
                          </Box>
                        </Box>
                      )
                    })()}

                    {/* Button placeholder — draggable */}
                    {hasButton && (() => {
                      const pos = getPos(selectedScene, 'Button', 50, 80)
                      const dims: Record<string, { w: number; h: number; fs: number }> = {
                        S:  { w:  80, h: 28, fs: 11 },
                        M:  { w: 120, h: 36, fs: 13 },
                        L:  { w: 160, h: 44, fs: 14 },
                        XL: { w: 200, h: 52, fs: 16 },
                      }
                      const { w, h, fs } = dims[buttonSize]
                      return (
                        <Box sx={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', zIndex: 3 }}>
                          {/* Toolbar above button */}
                          {buttonSelected && (
                            <Box sx={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                              <ButtonPlaceholderToolbar
                                size={buttonSize}
                                onSizeChange={setButtonSize}
                                onDelete={() => {
                                  setScenePlaceholders(prev => ({ ...prev, [selectedScene]: (prev[selectedScene] ?? []).filter(p => p !== 'Button') }))
                                  setButtonSelected(false)
                                }}
                              />
                            </Box>
                          )}
                          <Box
                            onMouseDown={e => startDrag(e, selectedScene, 'Button', 50, 80)}
                            onClick={e => {
                              e.stopPropagation()
                              if (!dragInfo.current?.moved) {
                                setButtonSelected(p => !p)
                                setBulletSelected(null)
                              }
                            }}
                            sx={{
                              bgcolor: s.primary, color: '#fff',
                              borderRadius: '6px',
                              width: w, height: h,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: fs,
                              cursor: 'grab', userSelect: 'none',
                              boxShadow: buttonSelected ? '0 0 0 3px rgba(0,83,229,0.25)' : '0 2px 8px rgba(0,83,229,0.30)',
                              outline: buttonSelected ? '2px solid #0053E5' : '2px solid transparent',
                              outlineOffset: '2px',
                              transition: 'outline 0.15s, box-shadow 0.15s',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Button
                          </Box>
                        </Box>
                      )
                    })()}
                  </Box>
                )
              })()}
              {/* Image + overlays clipped to canvas shape — regular scenes only */}
              {sceneTypes[selectedScene] !== 'custom' && <Box sx={{ overflow: 'hidden', borderRadius: '8px', position: 'relative' }}>
                <Box component="img" src={IMG_THUMB} alt={videoTitle}
                  sx={{ width: '100%', display: 'block' }} />

                {/* Cover left half of SVG — white bg + pink accent line */}
                <Box sx={{ position: 'absolute', inset: 0, width: '50%', bgcolor: '#fff', pointerEvents: 'none' }}>
                  <Box sx={{ height: 5, bgcolor: '#C084FC', width: '100%' }} />
                </Box>

                {/* Right side — drag media area */}
                <Box sx={{
                  position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%',
                  background: 'repeating-linear-gradient(-45deg, #EBEBEF 0px, #EBEBEF 12px, #E2E2E7 12px, #E2E2E7 24px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', pointerEvents: 'none',
                }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 52, color: '#BDBDBD' }} />
                  </Box>
                  <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 13, color: '#BDBDBD', letterSpacing: '0.15px' }}>
                    Drag media here
                  </Typography>
                </Box>

                {/* Heading + sub-heading — flowing column, scene 0 = video title, others = derived content */}
                {(() => {
                  const derived = sceneContentFor(videoTitle)
                  const sceneHeadings = [
                    { h: headingText, s: subheadingText },
                    { h: derived[0][0], s: derived[0][1] },
                    { h: derived[1][0], s: derived[1][1] },
                    { h: derived[2][0], s: derived[2][1] },
                  ]
                  const scene = sceneHeadings[selectedScene] ?? sceneHeadings[0]
                  return (
                    <Box sx={{
                      position: 'absolute', left: '4%', top: '20%', width: '44%',
                      containerType: 'inline-size', display: 'flex', flexDirection: 'column',
                    }}>
                      <Box
                        onClick={e => { e.stopPropagation(); setHeadingSelected(p => !p); setSubheadingSelected(false); setFootnoteSelected(false) }}
                        sx={{
                          cursor: 'pointer', borderRadius: '4px', px: '2px',
                          border: headingSelected ? '2px solid #0053E5' : '2px solid transparent',
                          bgcolor: headingSelected ? 'rgba(0,83,229,0.06)' : 'transparent',
                          '&:hover': { border: '2px solid #0053E5', bgcolor: 'rgba(0,83,229,0.04)' },
                          pointerEvents: selectedScene === 0 ? 'auto' : 'none',
                        }}
                      >
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '10cqw', color: s.navy, lineHeight: 1.2, wordBreak: 'break-word' }}>
                          {scene.h}
                        </Typography>
                      </Box>
                      <Box
                        onClick={e => { e.stopPropagation(); setSubheadingSelected(p => !p); setHeadingSelected(false); setFootnoteSelected(false) }}
                        sx={{
                          cursor: 'pointer', borderRadius: '4px', px: '2px', mt: '4%',
                          border: subheadingSelected ? '2px solid #0053E5' : '2px solid transparent',
                          bgcolor: subheadingSelected ? 'rgba(0,83,229,0.06)' : 'transparent',
                          '&:hover': { border: '2px solid #0053E5', bgcolor: 'rgba(0,83,229,0.04)' },
                          pointerEvents: selectedScene === 0 ? 'auto' : 'none',
                        }}
                      >
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '4.5cqw', color: s.textPrimary, lineHeight: 1.4, wordBreak: 'break-word' }}>
                          {scene.s}
                        </Typography>
                      </Box>
                    </Box>
                  )
                })()}

                {/* Footnote — bottom-left, all scenes */}
                <Box
                  onClick={e => { e.stopPropagation(); setFootnoteSelected(p => !p); setHeadingSelected(false); setSubheadingSelected(false) }}
                  sx={{
                    position: 'absolute', left: '4%', width: '44%', bottom: '5%',
                    cursor: 'pointer', borderRadius: '4px', px: '4px', py: '2px',
                    border: footnoteSelected ? '2px solid #0053E5' : '2px solid transparent',
                    bgcolor: footnoteSelected ? 'rgba(0,83,229,0.06)' : 'transparent',
                    '&:hover': { border: '2px solid #0053E5', bgcolor: 'rgba(0,83,229,0.04)' },
                    containerType: 'inline-size',
                  }}
                >
                  <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: '2.5cqw', letterSpacing: '0.4px', color: s.textSecondary, lineHeight: 1.66 }}>
                    {footnoteText}
                  </Typography>
                </Box>
              </Box>}

              {/* Toolbars — outside overflow:hidden so they render above the canvas edge */}
              {sceneTypes[selectedScene] !== 'custom' && headingSelected && (
                <Box sx={{ position: 'absolute', left: '25%', top: '30%', transform: 'translate(-50%, -100%)', mb: '4px', zIndex: 20, pointerEvents: 'auto' }}>
                  <PlaceholderToolbar onEditClick={() => { onEditAttempt ? onEditAttempt() : setEditHeadingOpen(true) }} />
                </Box>
              )}
              {sceneTypes[selectedScene] !== 'custom' && subheadingSelected && (
                <Box sx={{ position: 'absolute', left: '25%', top: '55%', transform: 'translate(-50%, -100%)', mb: '4px', zIndex: 20, pointerEvents: 'auto' }}>
                  <PlaceholderToolbar onEditClick={() => { onEditAttempt ? onEditAttempt() : setEditSubheadingOpen(true) }} />
                </Box>
              )}
              {sceneTypes[selectedScene] !== 'custom' && footnoteSelected && (
                <Box sx={{ position: 'absolute', left: '50%', bottom: '3%', transform: 'translate(-50%, -100%)', mb: '4px', zIndex: 20, pointerEvents: 'auto' }}>
                  <PlaceholderToolbar onEditClick={() => { onEditAttempt ? onEditAttempt() : setEditFootnoteOpen(true) }} />
                </Box>
              )}
            </Box>

            {/* Right column: scene action toolbar + next arrow — sibling of canvas in stretch group */}
            <Box sx={{ width: 32, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>

              {/* Scene action toolbar — white pill card, top-aligned */}
              <Box sx={{
                width: 32,
                bgcolor: '#ffffff',
                border: `1px solid ${s.divider}`,
                borderRadius: '24px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '8px',
                p: '4px',
              }}>
                {/* 1. Layout / grid */}
                <Tooltip title="Layout" placement="left" arrow>
                  <IconButton size="small" onClick={e => e.stopPropagation()}
                    sx={{ p: '3px', color: s.primary, borderRadius: '6px', '&:hover': { bgcolor: 'rgba(0,83,229,0.08)' } }}>
                    <GridViewOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                {/* 2. Theme / palette */}
                <Tooltip title="Theme" placement="left" arrow>
                  <IconButton size="small" onClick={e => e.stopPropagation()}
                    sx={{ p: '3px', color: s.primary, borderRadius: '6px', '&:hover': { bgcolor: 'rgba(0,83,229,0.08)' } }}>
                    <PaletteOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                {/* 3. Add placeholder — active only on custom scenes */}
                <Tooltip title={sceneTypes[selectedScene] === 'custom' ? 'Add placeholder' : ''} placement="left" arrow>
                  <span>
                    <IconButton
                      size="small"
                      disabled={sceneTypes[selectedScene] !== 'custom'}
                      onClick={e => { e.stopPropagation(); setPlaceholderMenuOpen(p => !p) }}
                      sx={{
                        p: '3px', borderRadius: '6px',
                        bgcolor: placeholderMenuOpen && sceneTypes[selectedScene] === 'custom' ? s.primary : 'transparent',
                        color:   placeholderMenuOpen && sceneTypes[selectedScene] === 'custom' ? '#fff' : undefined,
                        '&:hover': { bgcolor: 'rgba(0,83,229,0.08)' },
                        '&.Mui-disabled': { opacity: 0.3 },
                      }}
                    >
                      <PlaceholderIcon size={18} color={placeholderMenuOpen && sceneTypes[selectedScene] === 'custom' ? '#ffffff' : s.primary} />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* 4. Info */}
                <Tooltip title="Info" placement="left" arrow>
                  <IconButton size="small" onClick={e => e.stopPropagation()}
                    sx={{ p: '3px', color: s.primary, borderRadius: '6px', '&:hover': { bgcolor: 'rgba(0,83,229,0.08)' } }}>
                    <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                {/* 5. More */}
                <Tooltip title="More" placement="left" arrow>
                  <IconButton size="small" onClick={e => e.stopPropagation()}
                    sx={{ p: '3px', color: s.primary, borderRadius: '6px', '&:hover': { bgcolor: 'rgba(0,83,229,0.08)' } }}>
                    <MoreHorizIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Next arrow — pushed to bottom by justify-content: space-between */}
              <IconButton
                disabled={selectedScene === SCENE_COUNT - 1}
                onClick={() => goToScene(selectedScene + 1)}
                size="small"
                sx={{ color: selectedScene === SCENE_COUNT - 1 ? s.actionDisabled : s.primary, p: '3px' }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>

            </Box>{/* end canvas + toolbar group */}
          </Box>

          {/* Narration bar */}
          <Box sx={{
            mx: 3, mb: 1.5, height: 40, bgcolor: s.white,
            border: `1px solid ${s.divider}`, borderRadius: '20px',
            display: 'flex', alignItems: 'center', px: 2, gap: 1.5, flexShrink: 0,
          }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: s.editorBg }}>
              <MicOutlinedIcon sx={{ fontSize: 15, color: s.textSecondary }} />
            </Avatar>
            <Typography sx={{
              fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14,
              color: s.textSecondary, flex: 1,
            }}>
              Add narration…
            </Typography>
            <Typography sx={{
              fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
              color: s.textSecondary, letterSpacing: '0.4px',
            }}>
              ~0:12
            </Typography>
          </Box>

          {/* Scene lineup */}
          <Box sx={{
            bgcolor: s.white, borderTop: `1px solid ${s.divider}`,
            px: 2, pt: 1.5, pb: 1.5, flexShrink: 0,
          }}>
            {/* Play bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: '50%',
                bgcolor: s.editorBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <PlayArrowIcon sx={{ fontSize: 22, color: s.primary }} />
              </Box>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
                color: s.primaryLight, letterSpacing: '0.4px', ml: 1.5,
              }}>
                Scene {selectedScene + 1} / {SCENE_COUNT}
              </Typography>
            </Box>

            {/* Thumbnails row */}
            <Box sx={{
              display: 'flex', gap: '8px', overflowX: 'auto', pb: 0.5,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: s.primaryLight, borderRadius: 2 },
            }}>
              {sceneTypes.map((type, i) =>
                type === 'custom'
                  ? <CustomSceneThumbnail key={i} index={i} selected={i === selectedScene} onClick={() => goToScene(i)} />
                  : <SceneThumbnail key={i} index={i} selected={i === selectedScene}
                      headingText={i === 0 ? headingText : (sceneContentFor(videoTitle)[i-1]?.[0] ?? 'Scene ' + (i+1))}
                      subheadingText={i === 0 ? subheadingText : (sceneContentFor(videoTitle)[i-1]?.[1] ?? '')}
                      footnoteText={footnoteText} onClick={() => goToScene(i)} />
              )}
              {/* Add scene */}
              <Box sx={{
                width: 56, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Box
                  onClick={() => setSceneLibOpen(true)}
                  sx={{
                    width: 32, height: 32, borderRadius: '50%',
                    bgcolor: s.editorBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px dashed ${s.primary}`,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0,83,229,0.06)' },
                  }}>
                  <AddIcon sx={{ fontSize: 18, color: s.primary }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Edit Heading dialog ───────────────────────────────────────────── */}
      <EditHeadingDialog
        open={editHeadingOpen}
        title="Heading"
        currentText={headingText}
        onClose={(newText) => { setHeadingText(newText); setEditHeadingOpen(false); onHeadingChange?.(newText) }}
      />
      <EditHeadingDialog
        open={editSubheadingOpen}
        title="Sub-heading"
        currentText={subheadingText}
        onClose={(newText) => { setSubheadingText(newText); setEditSubheadingOpen(false); onSubheadingChange?.(newText) }}
      />
      <EditHeadingDialog
        open={editFootnoteOpen}
        title="Footnote"
        currentText={footnoteText}
        onClose={(newText) => { setFootnoteText(newText); setEditFootnoteOpen(false) }}
      />

      {/* ── Scene Library dialog ──────────────────────────────────────────── */}
      <SceneLibraryDialog
        open={sceneLibOpen}
        onClose={() => setSceneLibOpen(false)}
        onAddScene={(templateId) => {
          const type = templateId === 'custom' ? 'custom' : 'regular'
          setSceneTypes(prev => { const next: ('regular' | 'custom')[] = [...prev, type]; setSelectedScene(next.length - 1); return next })
          setSceneLibOpen(false)
        }}
      />

      {/* ── Comments panel — draggable + resizable ────────────────────────── */}
      <CommentsPanel
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        threads={threads}
        setThreads={setThreads}
        approverNames={approverNames}
        awaitingApprovers={awaitingApprovers}
        onRequestApproval={() => {
          setSnackbarMsg(`Version sent for additional approval by ${approverNames}`)
          onRequestReapproval()
          setCommentsOpen(false)
        }}
      />


      {/* ── Success snackbar ───────────────────────────────────────────────── */}
      {/* ── Video permission dialog ─────────────────────────────────────── */}
      <VideoPermissionDialog
        open={videoPermOpen}
        onClose={() => setVideoPermOpen(false)}
        initialSettings={videoPermSettings}
        onSave={s => { setVideoPermSettings(s); onPermChange?.(s); setVideoPermOpen(false) }}
      />

      <Snackbar
        open={!!snackbarMsg}
        autoHideDuration={5000}
        onClose={() => setSnackbarMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          onClose={() => setSnackbarMsg(null)}
          sx={{ width: '100%', fontFamily: '"Open Sans", sans-serif', fontSize: 14 }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
