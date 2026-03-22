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
import MusicNoteOutlinedIcon       from '@mui/icons-material/MusicNoteOutlined'
import MicOutlinedIcon             from '@mui/icons-material/MicOutlined'
import StorageOutlinedIcon         from '@mui/icons-material/StorageOutlined'
import InputOutlinedIcon           from '@mui/icons-material/InputOutlined'
import AspectRatioOutlinedIcon     from '@mui/icons-material/AspectRatioOutlined'
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
import Tooltip                     from '@mui/material/Tooltip'
import { NotificationBell, type NotificationItem } from './NotificationsPanel'

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

// ─── Edit Heading dialog ──────────────────────────────────────────────────────
function EditHeadingDialog({ open, currentText, onClose }: {
  open: boolean
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
          Heading
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
      color: s.textSecondary, px: '12px', pt: '12px', pb: '4px', lineHeight: 1.5,
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
      { text: 'Do we have rights to use this image? Please confirm or replace', checkedNow: false, resolved: false },
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
function UnresolvedWarningDialog({ open, count, onClose }: { open: boolean; count: number; onClose: () => void }) {
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
          There are {count} unresolved {count === 1 ? 'comment' : 'comments'}
        </Typography>
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14,
          lineHeight: 1.5, color: 'rgba(0,0,0,0.87)', mb: 1,
        }}>
          Explain unresolved comments before requesting reapproval
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
        <Button variant="text" color="primary" size="large"
          sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14, textTransform: 'none' }}>
          Copy share link
        </Button>
        <Button variant="contained" color="primary" size="large" onClick={onClose}
          sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14, textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Comments panel ────────────────────────────────────────────────────────────
function CommentsPanel({
  open, onClose, threads, setThreads, approverNames, onRequestApproval,
}: {
  open: boolean
  onClose: () => void
  threads: CommentThread[]
  setThreads: React.Dispatch<React.SetStateAction<CommentThread[]>>
  approverNames: string
  onRequestApproval: () => void
}) {
  const [pos,         setPos]         = useState({ x: 0, y: 80 })
  const [tab,         setTab]         = useState<'unresolved' | 'completed'>('unresolved')
  const [warningOpen, setWarningOpen] = useState(false)
  const dragging  = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })

  // Position on open
  useEffect(() => {
    if (open) setPos({ x: Math.max(0, window.innerWidth - 330), y: 80 })
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
            Approval's comments
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
              { key: 'unresolved', label: `Unresolved (${unresolvedCount})` },
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

        {/* ── Comment threads ───────────────────────────────────────────── */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: '4px', pb: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

        {/* ── Footer: "Resent for approval" — only when there are unresolved comments ── */}
        {unresolvedCount > 0 && (
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
              Resent for approval
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Unresolved warning dialog ─────────────────────────────────────── */}
      <UnresolvedWarningDialog
        open={warningOpen}
        count={unresolvedCount}
        onClose={() => setWarningOpen(false)}
      />
    </>
  )
}

// ─── Scene thumbnail ──────────────────────────────────────────────────────────
function SceneThumbnail({ index, selected }: { index: number; selected: boolean }) {
  return (
    <Box sx={{ width: 140, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
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
      }}>
        <Box component="img" src={IMG_THUMB} alt=""
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </Box>
    </Box>
  )
}

// ─── Studio page ──────────────────────────────────────────────────────────────
interface Props {
  videoTitle:             string
  approverNames:          string
  onNavigateToVideoPage:  () => void
  onNavigateToLibrary:    () => void
  onRequestReapproval:    () => void
  openCommentsOnMount?:   boolean
  triggerOpenComments?:   number
  notifications?:         NotificationItem[]
  initialThreads?:        CommentThread[]
}

export default function StudioPage({ videoTitle, approverNames, onNavigateToVideoPage, onNavigateToLibrary, onRequestReapproval, openCommentsOnMount, triggerOpenComments, notifications, initialThreads }: Props) {
  const [commentsOpen, setCommentsOpen] = useState(() => openCommentsOnMount ?? false)

  // Open comments panel whenever triggerOpenComments counter increments (e.g. from notification link)
  useEffect(() => {
    if (triggerOpenComments && triggerOpenComments > 0) setCommentsOpen(true)
  }, [triggerOpenComments])
  const [activeNav,        setActiveNav]        = useState<string | null>(null)
  const [headingSelected,  setHeadingSelected]  = useState(false)
  const [headingText,      setHeadingText]      = useState(videoTitle)
  const [editHeadingOpen,  setEditHeadingOpen]  = useState(false)
  const [threads,          setThreads]          = useState<CommentThread[]>(initialThreads ?? [])
  const [snackbarMsg,  setSnackbarMsg]  = useState<string | null>(null)

  // Unread = not yet checked or resolved
  const unreadCount = threads.reduce((n, t) => n + t.comments.filter(c => !c.checkedNow && !c.resolved).length, 0)

  const NAV_SECTIONS = [
    {
      section: 'STYLE',
      items: [
        { icon: <BrandingWatermarkOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Brand' },
        { icon: <PaletteOutlinedIcon          sx={{ fontSize: 18 }} />, label: 'Theme' },
        { icon: <PersonOutlinedIcon           sx={{ fontSize: 18 }} />, label: 'Avatar' },
      ],
    },
    {
      section: 'LIBRARIES',
      items: [
        { icon: <PermMediaOutlinedIcon  sx={{ fontSize: 18 }} />, label: 'Media' },
        { icon: <MusicNoteOutlinedIcon  sx={{ fontSize: 18 }} />, label: 'Music' },
        { icon: <MicOutlinedIcon        sx={{ fontSize: 18 }} />, label: 'Voice' },
        { icon: <StorageOutlinedIcon    sx={{ fontSize: 18 }} />, label: 'Data' },
        { icon: <InputOutlinedIcon      sx={{ fontSize: 18 }} />, label: 'Input fields' },
      ],
    },
    {
      section: 'SETTINGS',
      items: [
        { icon: <AspectRatioOutlinedIcon sx={{ fontSize: 18 }} />, label: 'Aspect ratio' },
        { icon: <LanguageOutlinedIcon    sx={{ fontSize: 18 }} />, label: 'Languages' },
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
              <CommentOutlinedIcon sx={{ fontSize: 18 }} />
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
          <Box sx={{ width: 1, height: 20, bgcolor: 'rgba(255,255,255,0.2)', mx: 0.5 }} />
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#BDBDBD', fontSize: 12, fontFamily: '"Open Sans"' }}>
            OP
          </Avatar>
          <NotificationBell dark notifications={notifications} />
          <Box sx={{ width: 1, height: 20, bgcolor: 'rgba(255,255,255,0.2)', mx: 0.5 }} />
          {/* Video Page button */}
          <Button
            size="small"
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: '11px !important' }} />}
            onClick={onNavigateToVideoPage}
            sx={{
              background: GRADIENT_BTN, color: '#fff',
              fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
              textTransform: 'none', borderRadius: '8px', px: 2,
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
          overflowY: 'auto', pt: 1,
          display: 'flex', flexDirection: 'column',
        }}>
          {NAV_SECTIONS.map(({ section, items }) => (
            <Box key={section}>
              <NavSection label={section} />
              {items.map(({ icon, label, onClickOverride }) => (
                <NavItem
                  key={label}
                  icon={icon}
                  label={label}
                  selected={activeNav === label}
                  onClick={() => {
                    setActiveNav(label)
                    if (onClickOverride) onClickOverride()
                  }}
                />
              ))}
            </Box>
          ))}
        </Box>

        {/* Stage */}
        <Box sx={{ flex: 1, bgcolor: s.editorBg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Live preview area */}
          <Box sx={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            px: 6, py: 3, overflow: 'hidden', position: 'relative',
          }}>
            {/* Prev arrow */}
            <IconButton
              disabled
              size="small"
              sx={{ position: 'absolute', left: 16, color: s.actionDisabled }}
            >
              <ChevronLeftIcon />
            </IconButton>

            {/* Canvas */}
            <Box
              onClick={() => setHeadingSelected(false)}
              sx={{
                maxWidth: 680, width: '100%', position: 'relative',
                borderRadius: '8px', overflow: 'visible',
                border: `1px solid ${headingSelected ? '#0053E5' : s.divider}`,
                boxShadow: headingSelected
                  ? '0px 0px 0px 2px rgba(0,83,229,0.20), 0px 2px 12px rgba(3,25,79,0.10)'
                  : '0px 2px 12px rgba(3,25,79,0.10)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
            >
              {/* Image + overlays clipped to canvas shape */}
              <Box sx={{ overflow: 'hidden', borderRadius: '8px', position: 'relative' }}>
                <Box component="img" src={IMG_THUMB} alt={videoTitle}
                  sx={{ width: '100%', display: 'block' }} />

                {/* White cover to hide the SVG's static "HEADING / PLACEHOLDER" text */}
                <Box sx={{
                  position: 'absolute', left: '3%', top: '14%',
                  width: '44%', height: '27%', bgcolor: '#fff',
                }} />

                {/* Video title text — scales with canvas width */}
                <Box sx={{
                  position: 'absolute', left: '3.5%', top: '15%', width: '43%',
                  pointerEvents: 'none', containerType: 'inline-size',
                }}>
                  <Typography sx={{
                    fontFamily: 'sans-serif', fontWeight: 700,
                    fontSize: '10cqw',
                    color: '#1A1A2E', lineHeight: 1.3, wordBreak: 'break-word',
                  }}>
                    {headingText}
                  </Typography>
                </Box>
              </Box>

              {/* Clickable selection overlay */}
              <Box
                onClick={e => { e.stopPropagation(); setHeadingSelected(prev => !prev) }}
                sx={{
                  position: 'absolute', left: '3%', top: '14%',
                  width: '44%', height: '27%',
                  cursor: 'pointer', borderRadius: '4px',
                  border: headingSelected ? '2px solid #0053E5' : '2px solid transparent',
                  bgcolor: headingSelected ? 'rgba(0,83,229,0.06)' : 'transparent',
                  transition: 'background 0.15s, border-color 0.15s',
                  '&:hover': { border: '2px solid #0053E5', bgcolor: 'rgba(0,83,229,0.04)' },
                }}
              />

              {/* Toolbar — floats just above the heading selection box */}
              {headingSelected && (
                <Box sx={{
                  position: 'absolute',
                  left: '50%',
                  top: 'calc(14% - 10px)',
                  transform: 'translate(-50%, -100%)',
                  zIndex: 20,
                  pointerEvents: 'auto',
                }}>
                  <PlaceholderToolbar
                    onEditClick={() => { setEditHeadingOpen(true); setHeadingSelected(false) }}
                  />
                </Box>
              )}
            </Box>

            {/* Next arrow */}
            <IconButton size="small" sx={{ position: 'absolute', right: 16, color: s.primary }}>
              <ChevronRightIcon />
            </IconButton>
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
                Scene 1 / 4
              </Typography>
            </Box>

            {/* Thumbnails row */}
            <Box sx={{
              display: 'flex', gap: '8px', overflowX: 'auto', pb: 0.5,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: s.primaryLight, borderRadius: 2 },
            }}>
              {[0, 1, 2, 3].map(i => (
                <SceneThumbnail key={i} index={i} selected={i === 0} />
              ))}
              {/* Add scene */}
              <Box sx={{
                width: 56, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Box sx={{
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
        currentText={headingText}
        onClose={(newText) => { setHeadingText(newText); setEditHeadingOpen(false) }}
      />

      {/* ── Comments panel — draggable + resizable ────────────────────────── */}
      <CommentsPanel
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        threads={threads}
        setThreads={setThreads}
        approverNames={approverNames}
        onRequestApproval={() => {
          setSnackbarMsg(`Version sent for additional approval by ${approverNames}`)
          onRequestReapproval()
          setCommentsOpen(false)
        }}
      />


      {/* ── Success snackbar ───────────────────────────────────────────────── */}
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
