import { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Avatar,
  InputAdornment,
  OutlinedInput,
  Tooltip,
} from '@mui/material'
import ApprovalDialog     from './ApprovalDialog'
import ConfirmationDialog from './ConfirmationDialog'
import ApproveVideoDialog    from './ApproveVideoDialog'
import CancelApprovalDialog  from './CancelApprovalDialog'
import VideoLibraryPage, { type VideoItem } from './VideoLibraryPage'
import StudioPage, { TOTAL_COMMENT_COUNT, INITIAL_THREADS, type CommentThread } from './StudioPage'
import { NotificationBell, type NotificationItem } from './NotificationsPanel'

// MUI icons
import MoreVertIcon              from '@mui/icons-material/MoreVert'
import EditOutlinedIcon          from '@mui/icons-material/EditOutlined'
import CreateOutlinedIcon        from '@mui/icons-material/CreateOutlined'
import CommentOutlinedIcon       from '@mui/icons-material/CommentOutlined'
import ShareOutlinedIcon         from '@mui/icons-material/ShareOutlined'
import BarChartOutlinedIcon      from '@mui/icons-material/BarChartOutlined'
import ArrowBackIcon             from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon         from '@mui/icons-material/ArrowForward'
import CheckCircleOutlineIcon   from '@mui/icons-material/CheckCircleOutline'
import RefreshIcon              from '@mui/icons-material/Refresh'
import SearchIcon                from '@mui/icons-material/Search'
import GroupIcon                 from '@mui/icons-material/Group'
import LinkIcon                  from '@mui/icons-material/Link'
import DescriptionOutlinedIcon   from '@mui/icons-material/DescriptionOutlined'
import HelpOutlineIcon           from '@mui/icons-material/HelpOutline'
import InfoOutlinedIcon          from '@mui/icons-material/InfoOutlined'
import PersonOutlinedIcon        from '@mui/icons-material/PersonOutlined'
import LayersOutlinedIcon        from '@mui/icons-material/LayersOutlined'
import PublicOutlinedIcon        from '@mui/icons-material/PublicOutlined'
import PaletteOutlinedIcon       from '@mui/icons-material/PaletteOutlined'
import PeopleAltOutlinedIcon     from '@mui/icons-material/PeopleAltOutlined'
import MicOutlinedIcon           from '@mui/icons-material/MicOutlined'
import SyncIcon                  from '@mui/icons-material/Sync'
import FileExportIcon            from '@mui/icons-material/DriveFileMoveOutlined'
import ArrowDownwardIcon         from '@mui/icons-material/ArrowDownwardOutlined'
import WarningAmberOutlinedIcon  from '@mui/icons-material/WarningAmberOutlined'
import CloseIcon                 from '@mui/icons-material/Close'
import CheckIcon                 from '@mui/icons-material/Check'

// ─── Figma asset: split-template preview (template left + media right)
const imgVideoPreview = '/thumb.svg'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const t = {
  primaryMain:      '#0053E5',
  primarySelected:  '#0053E51A',
  primaryFocus:     'rgba(0, 83, 229, 0.14)',
  divider:          '#0053E51F',
  textPrimary:      '#323338',
  textSecondary:    '#3C3C48CC',
  actionActive:     '#0000008F',
  infoMain:         '#0176D7',
  errorMain:        '#E62843',
  grey200:          '#EEEEEE',
  bgDefault:        '#F4F7FF',
  bgPaper:          '#FFFFFF',
  labelInfoBg:      '#EFF7FE',
  labelInfoText:    '#284862',
  successMain:      '#118747',
  successLight:     '#E5F7E0',
  successBorder:    'rgba(76, 175, 80, 0.5)',
  warningMain:      '#F46900',
  warningLight:     '#FFF5CE',
  secondaryMain:    '#03194F',
}

// ─── Approver lookup ──────────────────────────────────────────────────────────
const APPROVER_USERS: Record<string, string> = {
  sjohnson:   'Sarah Johnson',
  mchen:      'Michael Chen',
  erodriguez: 'Emma Rodriguez',
  jwilson:    'James Wilson',
}
function formatApproverNames(approvers: string[]): string {
  const names = approvers.map(v => APPROVER_USERS[v] || v)
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

// ─── "Updated" link label (primary blue text, DS: TruffleLink color=Primary) ──
function UpdatedLabel() {
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center',
      bgcolor: t.labelInfoBg, borderRadius: '4px',
      px: '6px', py: '2px', flexShrink: 0,
    }}>
      <Typography sx={{
        fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
        lineHeight: 1.5, color: t.labelInfoText, whiteSpace: 'nowrap',
      }}>
        Updated
      </Typography>
    </Box>
  )
}

// ─── Circular icon avatar ─────────────────────────────────────────────────────
function CircularIconAvatar({ icon }: { icon: React.ReactNode }) {
  return (
    <Box sx={{
      width: 40, height: 40, borderRadius: '50%', bgcolor: t.primaryFocus,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </Box>
  )
}

// ─── Wordmark ─────────────────────────────────────────────────────────────────
function SundaySkyLogo() {
  return (
    <Box sx={{ px: 1, pb: 0.5 }}>
      <Typography sx={{
        fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 13,
        letterSpacing: '0.25em', color: t.textPrimary, textTransform: 'uppercase', lineHeight: 1,
      }}>
        SUNDAY<Box component="span" sx={{ color: t.primaryMain }}>SKY</Box>
      </Typography>
    </Box>
  )
}

// ─── Left Sidebar (video page) ────────────────────────────────────────────────
function Sidebar({
  effectiveStatus,
  videoTitle,
  onNavigateToLibrary,
}: {
  effectiveStatus: 'draft' | 'pending'
  videoTitle: string
  onNavigateToLibrary: () => void
}) {
  return (
    <Box sx={{
      width: 266, flexShrink: 0, display: 'flex', flexDirection: 'column',
      height: '100%', bgcolor: 'background.paper', borderRight: `1px solid ${t.divider}`,
    }}>
      <Box
        onClick={onNavigateToLibrary}
        sx={{ px: 2.5, pt: 2, pb: 0, cursor: 'pointer', '&:hover': { opacity: 0.75 } }}
      >
        <SundaySkyLogo />
      </Box>

      {/* Back to Video Library */}
      <Box
        onClick={onNavigateToLibrary}
        sx={{
          display: 'flex', alignItems: 'center', gap: 0.5,
          px: 2.5, pt: 2, pb: 1, cursor: 'pointer', width: 'fit-content',
          '&:hover': { opacity: 0.75 },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 16, color: t.textSecondary }} />
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14,
          lineHeight: 1.5, color: t.textSecondary,
        }}>
          Video Library
        </Typography>
      </Box>

      {/* Video name + options */}
      <Box sx={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        px: 2.5, pr: 1.5,
      }}>
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 20,
          lineHeight: 1.5, color: t.textPrimary, flex: 1,
        }}>
          {videoTitle}
        </Typography>
        <IconButton size="small" sx={{ mt: 0.3, color: t.actionActive, flexShrink: 0 }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Status chip — "Video/template status bank"
          Figma spec: display:flex, flex-direction:column, justify-content:center,
          align-items:flex-start, padding:1px 0px, width:246px, height:25px         */}
      <Box sx={{
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        alignItems:     'flex-start',
        pl:             '20px',   // 20px left = sidebar px:2.5 (8×2.5)
        pr:             0,
        pt:             '1px',
        pb:             '1px',
        width:          '246px',
        height:         '25px',
      }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'baseline', gap: '2px',
          bgcolor:      t.grey200,
          borderRadius: '4px', px: '6px', pt: '2px', pb: '3px',
        }}>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
            lineHeight: 1.5, color: t.textSecondary,
          }}>
            {effectiveStatus === 'pending' ? 'Pending approval' : 'Draft'}
          </Typography>
        </Box>
      </Box>

      {/* Nav items */}
      <Box sx={{ px: 2, py: 1 }}>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <ListItemButton selected sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <ListItemIcon sx={{ minWidth: 24 }}>
                <CreateOutlinedIcon sx={{ fontSize: 18, color: t.actionActive }} />
              </ListItemIcon>
              <ListItemText primary="Edit" primaryTypographyProps={{
                sx: { fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: t.textPrimary }
              }} />
            </Box>
            <SyncIcon sx={{ fontSize: 14, color: t.infoMain }} />
          </ListItemButton>

          <ListItemButton>
            <ListItemIcon sx={{ minWidth: 24 }}>
              <ShareOutlinedIcon sx={{ fontSize: 18, color: t.actionActive }} />
            </ListItemIcon>
            <ListItemText primary="Share" primaryTypographyProps={{
              sx: { fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: t.textPrimary }
            }} />
          </ListItemButton>

          <ListItemButton>
            <ListItemIcon sx={{ minWidth: 24 }}>
              <BarChartOutlinedIcon sx={{ fontSize: 18, color: t.actionActive }} />
            </ListItemIcon>
            <ListItemText primary="Analyze" primaryTypographyProps={{
              sx: { fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: t.textPrimary }
            }} />
          </ListItemButton>
        </List>
      </Box>

      <Box sx={{ flex: 1 }} />

      {/* User footer */}
      <Divider sx={{ borderColor: t.divider }} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#03194F', fontSize: 11, fontFamily: '"Open Sans", sans-serif' }}>
            MC
          </Avatar>
          <Box>
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 14, lineHeight: 1.3, color: t.textPrimary, display: 'block' }}>
              Maya Carmel
            </Typography>
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12, color: t.textSecondary }}>
              maya-carmel-playgr...
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" sx={{ color: t.actionActive }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  )
}

// ─── Video preview card ───────────────────────────────────────────────────────
function VideoPreviewCard({
  videoPhase,
  effectiveStatus,
  approvers,
  pendingTooltip,
  onSentForApproval,
  onEdit,
  onApproveVideo,
}: {
  videoPhase:        number
  effectiveStatus:   'draft' | 'pending'
  approvers:         string[]
  pendingTooltip:    string
  onSentForApproval: () => void
  onEdit:            (fromComments?: boolean) => void
  onApproveVideo:    () => void
}) {
  function ActionButton() {
    // ── Phase 0 + pending: after approval dialog sent ─────────────────────
    if (videoPhase === 0 && effectiveStatus === 'pending') {
      return (
        <Tooltip
          title={pendingTooltip}
          placement="top"
          arrow
          componentsProps={{
            tooltip: { sx: { bgcolor: t.secondaryMain, borderRadius: 2, px: '12px', pt: '10px', pb: '12px', fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: '#fff', maxWidth: 320 } },
            arrow:   { sx: { color: t.secondaryMain } },
          }}
        >
          <Button variant="outlined" size="small"
            startIcon={<GroupIcon sx={{ fontSize: '16px !important', color: t.successMain }} />}
            sx={{ bgcolor: t.successLight, borderColor: t.successBorder, color: t.successMain, '&:hover': { bgcolor: t.successLight, borderColor: t.successMain } }}
          >
            Pending approval
          </Button>
        </Tooltip>
      )
    }

    // ── Phase 1: "1 of N approvers responded" — outlined warning + rich tooltip ─
    if (videoPhase === 1) {
      const total        = approvers.length
      const respondedName = APPROVER_USERS[approvers[0]] ?? 'Sarah Johnson'
      const pendingNames  = approvers.slice(1).map(k => APPROVER_USERS[k] ?? k)
      return (
        <Tooltip
          placement="top"
          arrow
          title={
            <Box sx={{ p: '2px' }}>
              <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 12, color: '#fff', lineHeight: 1.6, display: 'block', mb: '2px' }}>
                • {respondedName} commented on Mar 15
              </Typography>
              {pendingNames.map((name, i) => (
                <Typography key={i} sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 12, color: '#fff', lineHeight: 1.6, display: 'block', mb: i === pendingNames.length - 1 ? '8px' : '2px' }}>
                  • {name} hasn't responded yet
                </Typography>
              ))}
              <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                Comments will be available to view once all approvers submit their approval or feedback.
              </Typography>
            </Box>
          }
          componentsProps={{
            tooltip: { sx: { bgcolor: t.secondaryMain, borderRadius: 2, px: '12px', pt: '10px', pb: '12px', maxWidth: 280 } },
            arrow:   { sx: { color: t.secondaryMain } },
          }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<GroupIcon sx={{ fontSize: '16px !important', color: t.warningMain }} />}
            sx={{
              bgcolor: 'rgba(244,105,0,0.06)',
              borderColor: 'rgba(244,105,0,0.5)',
              color: t.warningMain,
              '&:hover': { bgcolor: 'rgba(244,105,0,0.12)', borderColor: t.warningMain },
            }}
          >
            1 of {total} approver{total !== 1 ? 's' : ''} responded
          </Button>
        </Tooltip>
      )
    }

    // ── Phase 2: "View [x] approver comments and edit" — primary + chat icon ──
    if (videoPhase === 2) {
      return (
        <Button variant="contained" size="small" color="primary"
          startIcon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
              <path d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4C169.1 433.1 212.2 448 256 448c141.4 0 256-93.1 256-208S397.4 32 256 32z"/>
            </svg>
          }
          onClick={() => onEdit(true)}
        >
          View {TOTAL_COMMENT_COUNT} approver comments and edit
        </Button>
      )
    }

    // ── Phase 3+: "Approve video" — outlined, checkmark, tooltip ─────────────
    if (videoPhase >= 3) {
      return (
        <Tooltip
          title="Allows you to share the video with viewers"
          placement="top"
          arrow
          componentsProps={{
            tooltip: { sx: { bgcolor: t.secondaryMain, borderRadius: 2, px: '12px', pt: '10px', pb: '12px', fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: '#fff', maxWidth: 320 } },
            arrow:   { sx: { color: t.secondaryMain } },
          }}
        >
          <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<CheckIcon sx={{ fontSize: '16px !important' }} />}
            onClick={onApproveVideo}
            sx={{ borderColor: t.primaryMain, color: t.primaryMain, '&:hover': { bgcolor: t.primarySelected } }}
          >
            Approve
          </Button>
        </Tooltip>
      )
    }

    // ── Phase 0, draft: "Sent for approval" ──────────────────────────────────
    return (
      <Button variant="contained" size="small" color="primary"
        startIcon={<GroupIcon sx={{ fontSize: '16px !important' }} />}
        onClick={onSentForApproval}
      >
        Sent for approval
      </Button>
    )
  }

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, overflow: 'hidden', borderColor: t.divider, bgcolor: 'background.paper' }}
    >
      {/* Action bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditOutlinedIcon sx={{ fontSize: '16px !important' }} />}
          onClick={() => onEdit(false)}
          sx={{
            borderColor: t.divider, color: t.textPrimary,
            '&:hover': { borderColor: t.primaryMain, backgroundColor: t.primarySelected },
          }}
        >
          Edit
        </Button>

        <ActionButton />
      </Box>

      <Divider sx={{ borderColor: t.divider }} />

      {/* Preview — single full-width Figma asset image (matches real app proportions) */}
      <Box
        component="img"
        src={imgVideoPreview}
        alt="Recent TTS Pronunciation Advancements preview"
        sx={{ width: '100%', display: 'block', objectFit: 'cover' }}
      />

      <Divider sx={{ borderColor: t.divider }} />

      {/* Last edited */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
        <Avatar sx={{ width: 28, height: 28, bgcolor: '#03194F', fontSize: 10, fontFamily: '"Open Sans", sans-serif' }}>
          MC
        </Avatar>
        <Box>
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12, lineHeight: 1.5, color: t.textSecondary, display: 'block' }}>
            Last Edited
          </Typography>
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: t.textPrimary }}>
            Mar 12, 1:21 PM
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: t.divider }} />

      {/* Data & Personalization (personalized video — has a data library) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', px: 2, py: 1.5 }}>
        <CircularIconAvatar icon={<LayersOutlinedIcon sx={{ fontSize: 19, color: '#E62843' }} />} />
        <Box>
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12, lineHeight: 1.5, color: t.textSecondary, display: 'block', mb: '1px' }}>
            Data &amp; Personalization
          </Typography>
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: t.textPrimary }}>
            Test library
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: t.divider }} />

      {/* Languages */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', px: 2, py: 1.5 }}>
        <CircularIconAvatar icon={<PublicOutlinedIcon sx={{ fontSize: 19, color: t.actionActive }} />} />
        <Box>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
            lineHeight: 1.5, color: t.textSecondary, display: 'block', mb: '2px',
          }}>
            Languages
          </Typography>
          <Box sx={{
            display: 'inline-flex', alignItems: 'baseline', gap: '4px',
            bgcolor: t.grey200, borderRadius: '4px', px: '6px', pt: '2px', pb: '3px',
          }}>
            <Box component="span" sx={{ fontSize: 12, lineHeight: 1 }}>🇺🇸</Box>
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12, lineHeight: 1.5, color: t.textSecondary }}>
              English
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

// ─── Right panel ──────────────────────────────────────────────────────────────
// Layout per Figma 19047:29100 (top → bottom):
//   1. Review options
//   2. Account libraries updated
//   3. Approval in progress AttentionBox (pending state only)
function ReviewOptionsPanel({ isPending }: { isPending: boolean }) {
  const [attentionDismissed, setAttentionDismissed] = useState(false)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 280, flexShrink: 0 }}>

      {/* ── 1. Review options ──────────────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: t.divider, bgcolor: t.bgPaper, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', height: 30, minHeight: 30 }}>
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 14, lineHeight: 1.5, color: t.textPrimary, whiteSpace: 'nowrap' }}>
            Review options
          </Typography>
          <Tooltip title="Options for reviewing this video">
            <InfoOutlinedIcon sx={{ fontSize: 16, color: t.actionActive, cursor: 'pointer' }} />
          </Tooltip>
        </Box>
        <List disablePadding>
          {[
            { icon: <LinkIcon sx={{ fontSize: 16, color: t.actionActive }} />,          label: 'Get a Preview Link' },
            { icon: <FileExportIcon sx={{ fontSize: 16, color: t.actionActive }} />,    label: 'Export a script' },
            { icon: <ArrowDownwardIcon sx={{ fontSize: 16, color: t.actionActive }} />, label: 'Download a draft' },
          ].map(({ icon, label }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', px: 1, py: '4px', gap: 1, borderRadius: 1, cursor: 'pointer', '&:hover': { bgcolor: t.primarySelected } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 16, pr: 1 }}>{icon}</Box>
              <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: t.textPrimary, letterSpacing: '0.15px' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </List>
      </Paper>

      {/* ── 2. Account libraries updated ──────────────────────────────────── */}
      <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: t.divider, bgcolor: t.bgPaper, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 30, minHeight: 30 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SyncIcon sx={{ fontSize: 16, color: t.infoMain }} />
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 14, lineHeight: 1.5, color: t.textPrimary }}>
              Account libraries updated
            </Typography>
          </Box>
          <Tooltip title="About account library updates">
            <HelpOutlineIcon sx={{ fontSize: 16, color: t.actionActive, cursor: 'pointer' }} />
          </Tooltip>
        </Box>
        <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: t.textSecondary }}>
          Review this version before approving and sharing to ensure any changes affecting this video are acceptable.
        </Typography>
        <List disablePadding>
          {[
            { icon: <PaletteOutlinedIcon sx={{ fontSize: 16, color: t.actionActive }} />,   label: '"<brand name>"' },
            { icon: <PeopleAltOutlinedIcon sx={{ fontSize: 16, color: t.actionActive }} />, label: '"<data library name>"' },
            { icon: <MicOutlinedIcon sx={{ fontSize: 16, color: t.actionActive }} />,       label: 'Word pronunciation' },
          ].map(({ icon, label }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', px: 1, py: '4px', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 16, pr: 1, height: 24 }}>{icon}</Box>
              <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12, lineHeight: 1.66, color: t.textSecondary, letterSpacing: '0.4px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </Typography>
              <UpdatedLabel />
            </Box>
          ))}
        </List>
      </Paper>

      {/* ── 3. Approval in progress AttentionBox (pending only, bottom) ───── */}
      {/* Figma: bg warning/light #FFF5CE, p-16, rounded-8, gap-4 */}
      {isPending && !attentionDismissed && (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2, border: 'none', bgcolor: t.warningLight, p: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}
        >
          {/* Title row: icon + title + help + close */}
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 32 }}>
            {/* exclamation-triangle 18px warning/main */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pr: 1, flexShrink: 0 }}>
              <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: t.warningMain }} />
            </Box>
            {/* Title text */}
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 14, lineHeight: 1.5, color: t.textPrimary, flex: 1, pr: '4px' }}>
              Approval in progress
            </Typography>
            {/* circle-question icon button */}
            <IconButton size="small" sx={{ p: '8px', color: t.actionActive }}>
              <HelpOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
            {/* x-mark / close icon button */}
            <IconButton size="small" sx={{ p: '8px', color: t.actionActive }} onClick={() => setAttentionDismissed(true)}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Body text */}
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: t.textPrimary }}>
            Approval requests were sent to the approvers' email addresses. You can also share the link below if you prefer to send it another way.
          </Typography>

          {/* Copy share link */}
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', mt: '4px', cursor: 'pointer' }}>
            <LinkIcon sx={{ fontSize: 14, color: t.warningMain }} />
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: t.warningMain, textDecoration: 'underline' }}>
              Copy share link
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  )
}

// ─── Tasks panel ─────────────────────────────────────────────────────────────
// One task at a time · I'm done · navigate · start / clear session
interface Task { id: number; label: string | string[]; done: boolean }

const INITIAL_TASKS: Task[] = [
  { id: 1, label: "You've finished a draft video and need formal approval, by Sarah and Emma from the Legal team, before it can be shared.", done: false },
  { id: 2, label: ["You want to see if there's any response to your approval request.", "You also realized the opening scene title is missing your company name."], done: false },
  { id: 3, label: "Sarah told you she already submitted feedback.", done: false },
  { id: 4, label: "After completing all changes and receiving approval, the video is ready to go live.", done: false },
]

type SessionState = 'idle' | 'active' | 'complete'

function TasksPanel({ onTaskDone }: { onTaskDone?: (taskIdx: number) => void }) {
  const [tasks,       setTasks]       = useState<Task[]>(INITIAL_TASKS)
  const [session,     setSession]     = useState<SessionState>('active')   // auto-start
  const [currentIdx,  setCurrentIdx]  = useState(0)

  const doneCount = tasks.filter(t => t.done).length

  const startSession = () => {
    setTasks(INITIAL_TASKS.map(t => ({ ...t, done: false })))
    setCurrentIdx(0)
    setSession('active')
  }

  // Clear resets ALL session state and restarts from task 1
  const clearSession = () => {
    setTasks(INITIAL_TASKS.map(t => ({ ...t, done: false })))
    setCurrentIdx(0)
    setSession('active')
  }

  const markDone = () => {
    const updated = tasks.map((task, i) => i === currentIdx ? { ...task, done: true } : task)
    setTasks(updated)
    // Notify parent so it can update phase + navigate to library
    onTaskDone?.(currentIdx)
    const allDone = updated.every(t => t.done)
    if (allDone) { setSession('complete'); return }
    // Advance to the next undone task (wraps forward)
    let next = currentIdx + 1
    while (next < updated.length && updated[next].done) next++
    if (next < updated.length) setCurrentIdx(next)
  }

  const currentTask = tasks[currentIdx]

  return (
    <Box sx={{
      width: 250, flexShrink: 0, bgcolor: '#F5F5F5',
      borderLeft: '1px solid #E0E0E0',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Box sx={{
        px: 2, pt: 2, pb: 1.5, borderBottom: '1px solid #E0E0E0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <Box>
          <Typography sx={{
            fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 14,
            color: t.textPrimary, lineHeight: 1.4,
          }}>
            Tasks
          </Typography>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 11,
            color: t.textSecondary, mt: '2px',
          }}>
            {doneCount} / {tasks.length} done
          </Typography>
        </Box>
        <Tooltip title="Restart — resets all tasks">
          <IconButton size="small" onClick={clearSession} sx={{ color: t.textSecondary }}>
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── All done state ────────────────────────────────────────────────── */}
      {session === 'complete' && (
        <Box sx={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2, px: 2.5,
        }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 48, color: t.successMain }} />
          <Typography sx={{
            fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 14,
            color: t.textPrimary, textAlign: 'center',
          }}>
            All tasks complete!
          </Typography>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
            color: t.textSecondary, textAlign: 'center', lineHeight: 1.5,
          }}>
            Great work. Click restart to run through again.
          </Typography>
          <Button
            size="small" variant="outlined" onClick={clearSession}
            startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
            sx={{ fontFamily: '"Open Sans", sans-serif', textTransform: 'none', borderRadius: '20px', fontSize: 12 }}
          >
            Restart
          </Button>
        </Box>
      )}

      {/* ── Active task ───────────────────────────────────────────────────── */}
      {session === 'active' && currentTask && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Progress bar */}
          <Box sx={{ px: 2, pt: 1.5, pb: 1, flexShrink: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '6px' }}>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 11,
                color: t.textSecondary, letterSpacing: '0.5px', textTransform: 'uppercase',
              }}>
                Task {currentIdx + 1} of {tasks.length}
              </Typography>
              <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 11, color: t.textSecondary }}>
                {doneCount} done
              </Typography>
            </Box>
            <Box sx={{ height: 4, bgcolor: '#E0E0E0', borderRadius: 2 }}>
              <Box sx={{
                height: '100%', bgcolor: t.primaryMain, borderRadius: 2,
                width: `${(doneCount / tasks.length) * 100}%`,
                transition: 'width 0.3s ease',
              }} />
            </Box>
          </Box>

          {/* Scrollable content: task card + button + dots nav */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Task card */}
            <Box sx={{
              bgcolor: currentTask.done ? '#E5F7E0' : '#FFFFFF',
              border: `1px solid ${currentTask.done ? t.successMain : '#E0E0E0'}`,
              borderRadius: '10px', p: 2,
              display: 'flex', flexDirection: 'column', gap: '8px',
              transition: 'background-color 0.2s, border-color 0.2s',
            }}>
              {currentTask.done && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 16, color: t.successMain }} />
                  <Typography sx={{
                    fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 11,
                    color: t.successMain, letterSpacing: '0.3px',
                  }}>
                    Done
                  </Typography>
                </Box>
              )}
              {(Array.isArray(currentTask.label) ? currentTask.label : [currentTask.label]).map((para, i) => (
                <Typography key={i} sx={{
                  fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 13,
                  lineHeight: 1.5, mt: i > 0 ? '8px' : 0,
                  color: currentTask.done ? t.textSecondary : t.textPrimary,
                  textDecoration: currentTask.done ? 'line-through' : 'none',
                }}>
                  {para}
                </Typography>
              ))}
            </Box>

            {/* I'm done — right below the task card */}
            <Button
              fullWidth
              variant="contained"
              disabled={currentTask.done}
              onClick={markDone}
              sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
                fontSize: 13, textTransform: 'none', borderRadius: '8px',
                bgcolor: currentTask.done ? t.successMain : t.primaryMain,
                '&:hover': { bgcolor: currentTask.done ? t.successMain : '#0042BB' },
                '&.Mui-disabled': { bgcolor: '#E5F7E0', color: t.successMain },
              }}
            >
              {currentTask.done ? '✓  Done' : "I'm done"}
            </Button>

            {/* Dot navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: '2px' }}>
              <IconButton size="small" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)} sx={{ color: t.actionActive }}>
                <ArrowBackIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Box sx={{ display: 'flex', gap: '5px' }}>
                {tasks.map((task, i) => (
                  <Box
                    key={task.id}
                    onClick={() => setCurrentIdx(i)}
                    sx={{
                      width: i === currentIdx ? 16 : 6, height: 6, borderRadius: 3,
                      bgcolor: task.done ? t.successMain : i === currentIdx ? t.primaryMain : '#BDBDBD',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  />
                ))}
              </Box>
              <IconButton size="small" disabled={currentIdx === tasks.length - 1} onClick={() => setCurrentIdx(i => i + 1)} sx={{ color: t.actionActive }}>
                <ArrowForwardIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
// Phase 0 = initial draft
// Phase 1 = task 1 done: "1 of 2 approvers responded", Pending approval
// Phase 2 = task 2 done: "View 10 approver comments and edit", Pending approval
// Phase 3 = task 3 done: "Approve video", Draft
// Phase 4 = task 4 done: complete
const PHASE_STATUS: Record<number, 'draft' | 'pending'> = { 0: 'draft', 1: 'pending', 2: 'pending', 3: 'draft', 4: 'draft' }

// Per-video state — each video has its own phase, pageState, sentApprovers, and commentsCleared flag
type VideoState = { phase: number; pageState: 'draft' | 'pending'; sentApprovers: string[]; commentsCleared?: boolean }
const DEFAULT_VIDEO_STATE: VideoState = { phase: 0, pageState: 'draft', sentApprovers: [] }

export default function App() {
  const [currentPage,    setCurrentPage]    = useState<'video' | 'library' | 'studio'>('library')
  const [selectedVideo,  setSelectedVideo]  = useState<VideoItem | null>(null)
  const [videoStates,    setVideoStates]    = useState<Record<string, VideoState>>({})
  const [dialogStep,     setDialogStep]     = useState<'closed' | 'form' | 'confirmed'>('closed')
  const [approveDialogOpen,        setApproveDialogOpen]        = useState(false)
  const [cancelApprovalDialogOpen, setCancelApprovalDialogOpen] = useState(false)
  const [openCommentsOnStudio,  setOpenCommentsOnStudio]  = useState(false)
  const [openCommentsCounter,   setOpenCommentsCounter]   = useState(0)

  // Derive current video's state from the map (defaults to fresh draft)
  const currentKey = selectedVideo?.title || 'Stay Safe During Missile Threats'
  const currentVState: VideoState = videoStates[currentKey] ?? DEFAULT_VIDEO_STATE
  const videoPhase     = currentVState.phase
  const pageState      = currentVState.pageState
  const sentApprovers  = currentVState.sentApprovers

  // Helper to partially update a video's state entry
  function updateVideoState(key: string, patch: Partial<VideoState>) {
    setVideoStates(prev => ({
      ...prev,
      [key]: { ...(prev[key] ?? DEFAULT_VIDEO_STATE), ...patch },
    }))
  }

  // Phase drives status; also allow the approval dialog to flip phase-0 to pending
  const effectiveStatus: 'draft' | 'pending' =
    videoPhase > 0 ? PHASE_STATUS[videoPhase] : pageState
  const isPending = effectiveStatus === 'pending'

  // ── Phase-based notifications ────────────────────────────────────────────────
  const videoTitleForNotif  = selectedVideo?.title ?? 'Stay Safe During Missile Threats'
  const approver1Name       = sentApprovers.length > 0 ? (APPROVER_USERS[sentApprovers[0]] ?? 'Sarah Johnson') : 'Sarah Johnson'
  const pendingApprovers    = sentApprovers.slice(1)
  const pendingApproversStr = pendingApprovers.length > 0
    ? formatApproverNames(pendingApprovers)
    : 'remaining approvers'
  const allApproversStr     = sentApprovers.length > 0
    ? formatApproverNames(sentApprovers)
    : 'Sarah Johnson and Emma Rodriguez'

  const notifications: NotificationItem[] = []

  if (videoPhase >= 3) {
    notifications.push({
      id: 3,
      iconColor: '#045E2D',
      parts: [
        { text: `"${videoTitleForNotif}"` },
        { text: ` was approved by ${allApproversStr}. You can now ` },
        { text: 'approve it >', isLink: true },
      ],
      date: 'Mar 17, 9:05 AM',
      unread: videoPhase === 3,
      onLinkClick: () => setCurrentPage('video'),
    })
  }

  if (videoPhase >= 2) {
    notifications.push({
      id: 2,
      iconColor: '#F46900',
      parts: [
        { text: `${allApproversStr} have reviewed "${videoTitleForNotif}". There are ${TOTAL_COMMENT_COUNT} comments. ` },
        { text: 'View them now', isLink: true },
      ],
      date: 'Mar 16, 10:14 AM',
      unread: videoPhase === 2,
      onLinkClick: () => {
        setOpenCommentsOnStudio(true)
        setOpenCommentsCounter(c => c + 1)
        setCurrentPage('studio')
      },
    })
  }

  if (videoPhase >= 1) {
    notifications.push({
      id: 1,
      iconColor: '#F46900',
      parts: [
        { text: `${approver1Name} reviewed "${videoTitleForNotif}". Waiting for ${pendingApproversStr}'s approval.` },
      ],
      date: 'Mar 15, 3:42 PM',
      unread: videoPhase === 1,
    })
  }

  const handleSelectVideo = (video: VideoItem) => {
    setSelectedVideo(video)
    setDialogStep('closed')
    setCurrentPage('video')
    // Initialise video state if it hasn't been set yet
    setVideoStates(prev => {
      if (prev[video.title]) return prev
      return {
        ...prev,
        [video.title]: { phase: 0, pageState: 'draft', sentApprovers: [] },
      }
    })
  }

  const handleApprovalSend = (approvers: string[]) => {
    updateVideoState(currentKey, { sentApprovers: approvers, pageState: 'pending' })
    setDialogStep('confirmed')
  }

  const handleConfirmationClose = () => {
    setDialogStep('closed')
  }

  // Tooltip text on "Pending approval" button
  const pendingTooltip = sentApprovers.length > 0
    ? `Sent for approval on Mar 15 by <Sender> to ${formatApproverNames(sentApprovers)}`
    : 'Sent for approval on Mar 15 by <Sender>'

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Main app area ───────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {currentPage === 'library' ? (
          <VideoLibraryPage onSelectVideo={handleSelectVideo} notifications={notifications} videoStates={videoStates} />

        ) : currentPage === 'studio' ? (
          /* ── Studio / Editor page ─────────────────────────────────────────── */
          <StudioPage
            videoTitle={selectedVideo?.title ?? 'Video'}
            approverNames={sentApprovers.length > 0 ? formatApproverNames(sentApprovers) : 'Sarah Johnson and Emma Rodriguez'}
            onNavigateToVideoPage={() => setCurrentPage('video')}
            onNavigateToLibrary={() => setCurrentPage('library')}
            onRequestReapproval={() => updateVideoState(currentKey, { phase: 0, pageState: 'pending' })}
            openCommentsOnMount={openCommentsOnStudio}
            triggerOpenComments={openCommentsCounter}
            notifications={notifications}
            initialThreads={videoPhase >= 1 ? INITIAL_THREADS : []}
          />

        ) : (
          /* ── Video page ───────────────────────────────────────────────────── */
          <Box sx={{ display: 'flex', width: '100%', height: '100%', bgcolor: t.bgDefault, overflow: 'hidden' }}>
            <Sidebar
              effectiveStatus={effectiveStatus}
              videoTitle={selectedVideo?.title ?? 'Video'}
              onNavigateToLibrary={() => setCurrentPage('library')}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, py: 2 }}>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 28, lineHeight: 1.5, color: t.textPrimary }}>
                  Video Page
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <OutlinedInput
                    placeholder="Search Video Library"
                    size="small"
                    startAdornment={
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: t.textSecondary }} />
                      </InputAdornment>
                    }
                    sx={{ width: 240, bgcolor: 'background.paper', fontSize: 14, fontFamily: '"Open Sans", sans-serif' }}
                  />
                </Box>
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Box sx={{
                  maxWidth: 900, mx: 'auto',
                  px: 4, pb: 4, pt: 2,
                  display: 'flex', gap: 3, alignItems: 'flex-start',
                }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <VideoPreviewCard
                      videoPhase={videoPhase}
                      effectiveStatus={effectiveStatus}
                      approvers={sentApprovers.length > 0 ? sentApprovers : ['sjohnson', 'erodriguez']}
                      pendingTooltip={pendingTooltip}
                      onSentForApproval={() => setDialogStep('form')}
                      onEdit={(fromComments?: boolean) => {
                        if (isPending && !fromComments) {
                          setCancelApprovalDialogOpen(true)
                        } else {
                          setOpenCommentsOnStudio(fromComments ?? false)
                          setCurrentPage('studio')
                        }
                      }}
                      onApproveVideo={() => setApproveDialogOpen(true)}
                    />
                  </Box>
                  <ReviewOptionsPanel isPending={effectiveStatus === 'pending'} />
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Tasks panel — always visible, outside the app ──────────────────── */}
      <TasksPanel
        onTaskDone={(idx) => {
          const key = currentKey || 'Stay Safe During Missile Threats'
          updateVideoState(key, { phase: idx + 1 })
          setCurrentPage('library')
        }}
      />

      {/* ── Dialogs ────────────────────────────────────────────────────────── */}
      <ApprovalDialog
        open={dialogStep === 'form'}
        onClose={() => setDialogStep('closed')}
        onSend={handleApprovalSend}
      />
      <ConfirmationDialog
        open={dialogStep === 'confirmed'}
        onClose={handleConfirmationClose}
        approverCount={sentApprovers.length}
      />
      <ApproveVideoDialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        onApprove={() => updateVideoState(currentKey, { phase: 4 })}
      />
      <CancelApprovalDialog
        open={cancelApprovalDialogOpen}
        onClose={() => setCancelApprovalDialogOpen(false)}
        onConfirm={() => {
          // Reset this video to draft + clear all approval state
          updateVideoState(currentKey, { phase: 0, pageState: 'draft', sentApprovers: [] })
          setOpenCommentsOnStudio(false)
          setCurrentPage('studio')
        }}
      />
    </Box>
  )
}
