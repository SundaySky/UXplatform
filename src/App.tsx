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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material'
import ApprovalDialog     from './ApprovalDialog'
import ConfirmationDialog from './ConfirmationDialog'
import ApproveVideoDialog    from './ApproveVideoDialog'
import CancelApprovalDialog       from './CancelApprovalDialog'
import VideoLibraryPage, { type VideoItem, PermAvatarGroup } from './VideoLibraryPage'
import { INITIAL_USERS } from './AccountSettingsDialog'
import StudioPage, { TOTAL_COMMENT_COUNT, INITIAL_THREADS } from './StudioPage'
import { type NotificationItem } from './NotificationsPanel'
import VideoPermissionDialog, { type VideoPermissionSettings } from './VideoPermissionDialog'
import { OWNER_USER, type PermissionUser } from './ManageAccessDialog'

// MUI icons
import MoreVertIcon              from '@mui/icons-material/MoreVert'
import EditOutlinedIcon          from '@mui/icons-material/EditOutlined'
import CreateOutlinedIcon        from '@mui/icons-material/CreateOutlined'
import AddPhotoAlternateOutlinedIcon  from '@mui/icons-material/AddPhotoAlternateOutlined'
import ShareOutlinedIcon         from '@mui/icons-material/ShareOutlined'
import BarChartOutlinedIcon      from '@mui/icons-material/BarChartOutlined'
import ArrowBackIcon             from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon         from '@mui/icons-material/ArrowForward'
import CheckCircleOutlineIcon   from '@mui/icons-material/CheckCircleOutline'
import RefreshIcon              from '@mui/icons-material/Refresh'
import SearchIcon                from '@mui/icons-material/Search'
import GroupIcon                 from '@mui/icons-material/Group'

import LinkIcon                  from '@mui/icons-material/Link'
import HelpOutlineIcon           from '@mui/icons-material/HelpOutline'
import InfoOutlinedIcon          from '@mui/icons-material/InfoOutlined'
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
import DeleteOutlineIcon         from '@mui/icons-material/DeleteOutline'
import LockOutlinedIcon         from '@mui/icons-material/LockOutlined'
import LockOpenOutlinedIcon     from '@mui/icons-material/LockOpenOutlined'
import LockPersonIcon           from '@mui/icons-material/LockPerson'
import ContentCopyIcon          from '@mui/icons-material/ContentCopy'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import ArchiveOutlinedIcon      from '@mui/icons-material/ArchiveOutlined'
import FolderOutlinedIcon       from '@mui/icons-material/FolderOutlined'
import VpnKeyOutlinedIcon       from '@mui/icons-material/VpnKeyOutlined'
import VisibilityOutlinedIcon   from '@mui/icons-material/VisibilityOutlined'

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

// ─── Video permission strip (video page metadata row) ─────────────────────────
function VideoPermissionStrip({
  settings,
  onManageClick,
}: {
  settings?: VideoPermissionSettings
  onManageClick: () => void
}) {
  const s = settings ?? {
    tab: 'teams' as const, everyoneRole: 'viewer' as const,
    users: [] as PermissionUser[], ownerUsers: [OWNER_USER], noDuplicate: false,
  }
  const { tab, everyoneRole, users, ownerUsers } = s
  const isPrivate   = tab === 'private'
  const showEveryone = tab === 'teams' && everyoneRole !== 'restricted'

  const navyTipSx = {
    bgcolor: '#03194F', borderRadius: '8px', px: 1.5, py: 1,
    '& .MuiTooltip-arrow': { color: '#03194F' },
  }

  // Mini avatar chip — uses role icon instead of initials; primary/light bg with blue icon
  function AvatarChip({ roleType, label, tip }: { roleType: 'owner' | 'editor' | 'viewer'; label?: string; tip: string }) {
    const RoleIcon = roleType === 'owner'
      ? VpnKeyOutlinedIcon
      : roleType === 'editor'
        ? EditOutlinedIcon
        : VisibilityOutlinedIcon
    return (
      <Tooltip title={tip} placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'baseline', gap: '5px', flexShrink: 0,
          bgcolor: t.grey200, borderRadius: '4px', px: '6px', pt: '2px', pb: '3px',
        }}>
          <Box sx={{
            width: 16, height: 16, borderRadius: '3px', bgcolor: 'rgba(0,83,229,0.12)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, alignSelf: 'center',
          }}>
            <RoleIcon sx={{ fontSize: 10, color: 'rgba(0,0,0,0.87)' }} />
          </Box>
          {label && (
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12, lineHeight: 1.5, color: t.textSecondary }}>
              {label}
            </Typography>
          )}
        </Box>
      </Tooltip>
    )
  }

  const rowIcon = isPrivate
    ? <LockOutlinedIcon     sx={{ fontSize: 19, color: '#118747' }} />
    : <LockOpenOutlinedIcon sx={{ fontSize: 19, color: t.primaryMain }} />

  return (
    <Box
      onClick={onManageClick}
      sx={{
        display: 'flex', alignItems: 'flex-start', gap: '6px', px: 2, py: 1.5,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'rgba(0,83,229,0.04)' },
      }}
    >
      <CircularIconAvatar icon={rowIcon} />

      <Box sx={{ minWidth: 0 }}>
        {/* Label row */}
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
          lineHeight: 1.5, color: t.textSecondary, display: 'block', mb: '4px',
        }}>
          {isPrivate ? 'Video permission — Only you can see this video' : 'Video permission'}
        </Typography>

        {/* Indicators — all users shown with name, then Everyone at the end */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {/* Owner(s) — each with key icon + name + "(Owner)" */}
          {ownerUsers.slice(0, 3).map((u) => (
            <AvatarChip
              key={u.id}
              roleType="owner"
              label={`${u.name} (Owner)`}
              tip={`${u.name}${u.id === OWNER_USER.id ? ' (You)' : ''} — Can manage access`}
            />
          ))}

          {/* Specific users — always show with role icon + name regardless of everyoneRole */}
          {tab === 'teams' && users.map(pu => (
            <AvatarChip
              key={pu.user.id}
              roleType={pu.role === 'editor' ? 'editor' : 'viewer'}
              label={pu.user.name}
              tip={`${pu.user.name} — Can ${pu.role === 'editor' ? 'edit' : 'view'}`}
            />
          ))}

          {/* Separator before "Everyone" */}
          {showEveryone && (
            <Box sx={{ width: '1px', height: 16, bgcolor: t.divider, flexShrink: 0 }} />
          )}

          {/* Everyone indicator — users icon */}
          {showEveryone && (
            <Tooltip
              title={`Everyone in your account — Can ${everyoneRole === 'editor' ? 'edit' : 'view'}`}
              placement="top" arrow
              componentsProps={{ tooltip: { sx: navyTipSx } }}
            >
              <Box sx={{
                display: 'inline-flex', alignItems: 'baseline', gap: '5px', flexShrink: 0,
                bgcolor: t.grey200, borderRadius: '4px', px: '6px', pt: '2px', pb: '3px',
              }}>
                <Box sx={{
                  width: 16, height: 16, borderRadius: '3px', bgcolor: 'rgba(0,83,229,0.10)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, alignSelf: 'center',
                }}>
                  <PeopleAltOutlinedIcon sx={{ fontSize: 11, color: 'rgba(0,0,0,0.87)' }} />
                </Box>
                <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12, lineHeight: 1.5, color: t.textSecondary }}>
                  Everyone in your account
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>
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
  videoPermSettings,
  onManageAccess,
}: {
  effectiveStatus: 'draft' | 'pending' | 'approved'
  videoTitle: string
  onNavigateToLibrary: () => void
  videoPermSettings?: VideoPermissionSettings
  onManageAccess?: () => void
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  return (
    <Box sx={{
      width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column',
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
        <IconButton size="small" onClick={e => setMenuAnchor(e.currentTarget)} sx={{ mt: 0.3, color: t.actionActive, flexShrink: 0 }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        {/* Three-dot menu — mirrors library VideoCard menu (minus "Video Page") */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { borderRadius: '10px', minWidth: 256, boxShadow: '0px 4px 20px rgba(3,25,79,0.15)', mt: '4px', py: '4px' } }}
        >
          {/* Header: video name + location */}
          <Box sx={{ px: '16px', pt: '10px', pb: '8px' }}>
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 14, color: t.textPrimary, lineHeight: 1.4, mb: '4px' }}>
              {videoTitle}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FolderOutlinedIcon sx={{ fontSize: 13, color: t.textSecondary }} />
              <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 12, color: t.textSecondary, lineHeight: 1.4 }}>
                Shared assets
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: '4px', borderColor: t.divider }} />

          <MenuItem onClick={() => setMenuAnchor(null)} sx={{ gap: '4px', py: '8px', px: '16px' }}>
            <ListItemIcon sx={{ minWidth: 'unset', color: t.actionActive }}><InfoOutlinedIcon sx={{ fontSize: 16 }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: t.textPrimary }}>Details</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => { setMenuAnchor(null); onManageAccess?.() }} sx={{ gap: '4px', py: '8px', px: '16px' }}>
            <ListItemIcon sx={{ minWidth: 'unset', color: t.actionActive }}><LockPersonIcon sx={{ fontSize: 16 }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: t.textPrimary }}>Permissions</ListItemText>
            <PermAvatarGroup settings={videoPermSettings} coloredAvatars={false} />
          </MenuItem>

          <Divider sx={{ my: '4px', borderColor: t.divider }} />

          <MenuItem onClick={() => setMenuAnchor(null)} sx={{ gap: '4px', py: '8px', px: '16px' }}>
            <ListItemIcon sx={{ minWidth: 'unset', color: t.actionActive }}><ContentCopyIcon sx={{ fontSize: 16 }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: t.textPrimary }}>Duplicate video</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => setMenuAnchor(null)} sx={{ gap: '4px', py: '8px', px: '16px' }}>
            <ListItemIcon sx={{ minWidth: 'unset', color: t.actionActive }}><DashboardCustomizeOutlinedIcon sx={{ fontSize: 16 }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: t.textPrimary }}>Video to template</ListItemText>
          </MenuItem>

          <Divider sx={{ my: '4px', borderColor: t.divider }} />

          <MenuItem onClick={() => setMenuAnchor(null)} sx={{ gap: '4px', py: '8px', px: '16px' }}>
            <ListItemIcon sx={{ minWidth: 'unset', color: t.actionActive }}><FolderOutlinedIcon sx={{ fontSize: 16 }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: t.textPrimary }}>Move to folder</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => setMenuAnchor(null)} sx={{ gap: '4px', py: '8px', px: '16px' }}>
            <ListItemIcon sx={{ minWidth: 'unset', color: t.actionActive }}><ArchiveOutlinedIcon sx={{ fontSize: 16 }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: t.textPrimary }}>Archive</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => setMenuAnchor(null)} sx={{ gap: '4px', py: '8px', px: '16px' }}>
            <ListItemIcon sx={{ minWidth: 'unset', color: t.errorMain }}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: t.errorMain }}>Delete</ListItemText>
          </MenuItem>
        </Menu>
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
        width:          '280px',
        height:         '25px',
      }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'baseline', gap: '2px',
          bgcolor: effectiveStatus === 'approved' ? '#EFF7FE' : t.grey200,
          borderRadius: '4px', px: '6px', pt: '2px', pb: '3px',
        }}>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12,
            lineHeight: 1.5, color: effectiveStatus === 'approved' ? '#284862' : t.textSecondary,
          }}>
            {effectiveStatus === 'pending' ? 'Pending approval' : effectiveStatus === 'approved' ? 'Approved for sharing' : 'Draft'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: t.divider, mx: 2.5, my: 1 }} />

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
  headingText,
  subheadingText,
  videoTitle,
  onSentForApproval,
  onEdit,
  onApproveVideo,
  videoPermSettings,
  onManageAccess,
  approvalsEnabled = false,
}: {
  videoPhase:          number
  effectiveStatus:     'draft' | 'pending' | 'approved'
  approvers:           string[]
  pendingTooltip:      string
  headingText?:        string
  subheadingText?:     string
  videoTitle?:         string
  onSentForApproval:   () => void
  onEdit:              (fromComments?: boolean) => void
  onApproveVideo:      () => void
  videoPermSettings?:  VideoPermissionSettings
  onManageAccess:      () => void
  approvalsEnabled?:   boolean
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
                • {respondedName} left feedback on Mar 15
              </Typography>
              {pendingNames.map((name, i) => (
                <Typography key={i} sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 12, color: '#fff', lineHeight: 1.6, display: 'block', mb: i === pendingNames.length - 1 ? '8px' : '2px' }}>
                  • {name} hasn't responded yet
                </Typography>
              ))}
              <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 12, color: '#fff', lineHeight: 1.6, display: 'block' }}>
                Comments will be available once all approvers have responded.
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
            onClick={() => onEdit(true)}
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
          View {TOTAL_COMMENT_COUNT} comments in Studio
        </Button>
      )
    }

    // ── Phase 4: "Approved" status — green button, disabled ──────────────────
    if (videoPhase === 4) {
      return (
        <Button
          variant="contained"
          size="small"
          startIcon={<CheckIcon sx={{ fontSize: '16px !important' }} />}
          sx={{
            fontFamily: '"Open Sans", sans-serif',
            fontWeight: 600,
            bgcolor: '#D4EDDA',
            color: '#155724',
            '&:hover': { bgcolor: '#C3E6CB' },
            boxShadow: 'none',
            textTransform: 'none',
            fontSize: 14
          }}
          disabled
        >
          Approved
        </Button>
      )
    }

    // ── Phase 3: "Approve video" — outlined, checkmark, tooltip ─────────────
    if (videoPhase === 3) {
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
            variant="contained"
            size="small"
            color="primary"
            startIcon={<CheckIcon sx={{ fontSize: '16px !important' }} />}
            onClick={onApproveVideo}
          >
            Approve for sharing
          </Button>
        </Tooltip>
      )
    }

    // ── Phase 0, draft: button depends on approvalsEnabled ───────────────────
    if (!approvalsEnabled) {
      // When approvals are OFF: show "Approve for sharing"
      return (
        <Button variant="contained" size="small" color="primary"
          startIcon={<CheckIcon sx={{ fontSize: '16px !important' }} />}
          onClick={onApproveVideo}
        >
          Approve for sharing
        </Button>
      )
    }

    // When approvals are ON: show "Submit for approval"
    return (
      <Button variant="contained" size="small" color="primary"
        startIcon={
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            {/* Photo frame */}
            <rect x="1" y="2" width="15" height="12" rx="2"
              fill="none" stroke="currentColor" strokeWidth="1.5"/>
            {/* Sun */}
            <circle cx="4.5" cy="5.5" r="1.5" fill="currentColor"/>
            {/* Mountains — two peaks, clipped inside frame */}
            <path d="M1.5 13.5 L5.5 7.5 L9 11 L11.5 8.5 L15.5 13.5 Z" fill="currentColor"/>
            {/* Badge — white circle */}
            <circle cx="18.5" cy="18.5" r="5.5" fill="white"/>
            {/* Check — primary blue */}
            <path d="M15.5 18.5 L17.5 21 L22 15.5"
              stroke="#0053E5" strokeWidth="2.2" fill="none"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        }
        onClick={onSentForApproval}
      >
        Submit for approval
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
          color="primary"
          startIcon={<EditOutlinedIcon sx={{ fontSize: '16px !important' }} />}
          onClick={() => onEdit(false)}
        >
          Edit
        </Button>

        <ActionButton />
      </Box>

      <Divider sx={{ borderColor: t.divider }} />

      {/* Preview — first scene with heading/sub-heading overlaid */}
      <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <Box component="img" src={imgVideoPreview} alt={videoTitle ?? 'Video preview'}
          sx={{ width: '100%', display: 'block', objectFit: 'cover' }} />

        {/* Left half — white bg + pink accent line */}
        <Box sx={{ position: 'absolute', inset: 0, width: '50%', bgcolor: '#fff', pointerEvents: 'none' }}>
          <Box sx={{ height: 5, bgcolor: '#C084FC', width: '100%' }} />
        </Box>

        {/* Right half — drag media */}
        <Box sx={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%',
          background: 'repeating-linear-gradient(-45deg,#EBEBEF 0px,#EBEBEF 10px,#E2E2E7 10px,#E2E2E7 20px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '6px', pointerEvents: 'none',
        }}>
          <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 36, color: '#BDBDBD' }} />
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 11, color: '#BDBDBD' }}>
            Drag media here
          </Typography>
        </Box>

        {/* Text overlays — flowing column */}
        <Box sx={{
          position: 'absolute', left: '4%', top: '20%', width: '43%',
          containerType: 'inline-size', pointerEvents: 'none',
          display: 'flex', flexDirection: 'column',
        }}>
          <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '9cqw', color: '#03194F', lineHeight: 1.2, wordBreak: 'break-word' }}>
            {headingText ?? videoTitle ?? ''}
          </Typography>
          <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '4cqw', color: 'rgba(0,0,0,0.7)', lineHeight: 1.4, wordBreak: 'break-word', mt: '6%' }}>
            {subheadingText ?? 'Sub-heading Placeholder'}
          </Typography>
        </Box>

        {/* Footnote */}
        <Box sx={{ position: 'absolute', left: '4%', width: '43%', bottom: '5%', containerType: 'inline-size', pointerEvents: 'none' }}>
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: '2.5cqw', letterSpacing: '0.4px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.66 }}>
            Footnote placeholder
          </Typography>
        </Box>
      </Box>

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

      {/* Video permission strip */}
      <VideoPermissionStrip
        settings={videoPermSettings}
        onManageClick={onManageAccess}
      />

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 340, flexShrink: 0 }}>

      {/* ── 1. Review options ──────────────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: t.divider, bgcolor: t.bgPaper, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', height: 30, minHeight: 30 }}>
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 14, lineHeight: 1.5, color: t.textPrimary, whiteSpace: 'nowrap' }}>
            Send video for review (single version)
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
            Approval request sent to the approver. You can also share the video using the link.
          </Typography>

          {/* Share video using link */}
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', mt: '4px', cursor: 'pointer' }}>
            <LinkIcon sx={{ fontSize: 14, color: t.warningMain }} />
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: t.warningMain, textDecoration: 'underline' }}>
              Share video using link
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
  { id: 2, label: ["You want to check and review any response to your approval request.", "You also realized the opening scene heading is missing 2026 and you want to add it at the end of the heading."], done: false },
  { id: 3, label: "Sarah mentioned she submitted feedback for your approval", done: false },
  { id: 4, label: "After completing all changes and receiving approval, the video is ready to go live.", done: false },
  { id: 5, label: "You are creating a video for a top-secret new product launching later this year. You and Eli Bogan are the only persons authorized to edit this video. No one else can view or access the video or its assets.", done: false },
  { id: 6, label: "The privacy team at your company is concerned that employees might misuse the CEO, Chris's avatar to create deepfake content. They've asked you to ensure that other users in the organization cannot access or use this avatar.", done: false },
  { id: 7, label: "You're preparing a video for approval, and your boss told you that Michelle Cohen from Legal needs to approve it.", done: false },
  { id: 8, label: "Jarvis is no longer with the company", done: false },
]

type SessionState = 'idle' | 'active' | 'survey' | 'complete'

function TasksPanel({ onTaskDone }: { onTaskDone?: (taskIdx: number) => void }) {
  const [tasks,       setTasks]       = useState<Task[]>(INITIAL_TASKS)
  const [session,     setSession]     = useState<SessionState>('active')   // auto-start
  const [currentIdx,  setCurrentIdx]  = useState(0)
  const [surveyStep,  setSurveyStep]  = useState<1 | 2>(1)
  const [surveyQ1,    setSurveyQ1]    = useState<number | null>(null)
  const [surveyQ2,    setSurveyQ2]    = useState<number | null>(null)
  const [surveyWhy1,  setSurveyWhy1]  = useState('')
  const [surveyWhy2,  setSurveyWhy2]  = useState('')
  const [pendingNext, setPendingNext] = useState<number | null>(null) // idx to go to after survey

  const doneCount = tasks.filter(t => t.done).length

// Clear resets ALL session state and restarts from task 1
  const clearSession = () => {
    setTasks(INITIAL_TASKS.map(t => ({ ...t, done: false })))
    setCurrentIdx(0)
    setSession('active')
    setSurveyStep(1); setSurveyQ1(null); setSurveyQ2(null); setSurveyWhy1(''); setSurveyWhy2(''); setPendingNext(null)
  }

  const markDone = () => {
    const updated = tasks.map((task, i) => i === currentIdx ? { ...task, done: true } : task)
    setTasks(updated)
    onTaskDone?.(currentIdx)
    const allDone = updated.every(t => t.done)
    if (allDone) {
      setPendingNext(null)
    } else {
      let next = currentIdx + 1
      while (next < updated.length && updated[next].done) next++
      setPendingNext(next < updated.length ? next : null)
    }
    setSurveyStep(1); setSurveyQ1(null); setSurveyQ2(null); setSurveyWhy1(''); setSurveyWhy2('')
    setSession('survey')
  }

  const advanceSurvey = () => {
    if (surveyStep === 1) {
      setSurveyStep(2)
      setSurveyQ2(null); setSurveyWhy2('')
    } else {
      submitSurvey()
    }
  }

  const submitSurvey = () => {
    if (pendingNext !== null) {
      setCurrentIdx(pendingNext)
      setSession('active')
    } else {
      setSession('complete')
    }
    setSurveyStep(1); setSurveyQ1(null); setSurveyQ2(null); setSurveyWhy1(''); setSurveyWhy2(''); setPendingNext(null)
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

      {/* ── Survey dialog ─────────────────────────────────────────────────── */}
      {(() => {
        const isQ1 = surveyStep === 1
        const qLabel = isQ1
          ? 'Overall, how easy or difficult was this task?'
          : 'How confident are you that you completed the task correctly?'
        const qValue = isQ1 ? surveyQ1 : surveyQ2
        const setQ    = isQ1 ? setSurveyQ1 : setSurveyQ2
        const qWhy   = isQ1 ? surveyWhy1 : surveyWhy2
        const setWhy = isQ1 ? setSurveyWhy1 : setSurveyWhy2
        return (
          <Dialog
            open={session === 'survey'}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}
          >
            <DialogTitle sx={{ pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 12, color: t.textSecondary }}>
                Question {surveyStep} of 2
              </Typography>
              <IconButton size="small" onClick={submitSurvey} sx={{ color: 'rgba(0,0,0,0.56)', mr: -1 }}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 14, color: '#323338', lineHeight: 1.5 }}>
                {qLabel}
              </Typography>

              {/* 7-point scale */}
              <Box sx={{ display: 'flex', gap: '4px' }}>
                {[1,2,3,4,5,6,7].map(n => (
                  <Box
                    key={n}
                    onClick={() => setQ(n)}
                    sx={{
                      flex: 1, height: 36, borderRadius: '6px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1.5px solid ${qValue === n ? t.primaryMain : '#E0E0E0'}`,
                      bgcolor: qValue === n ? t.primaryMain : '#FFFFFF',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: t.primaryMain, bgcolor: qValue === n ? t.primaryMain : '#EEF3FD' },
                    }}
                  >
                    <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 13, color: qValue === n ? '#FFFFFF' : '#323338' }}>
                      {n}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '-8px' }}>
                <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 11, color: t.textSecondary }}>Very Difficult</Typography>
                <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 11, color: t.textSecondary }}>Very Easy</Typography>
              </Box>

              {/* Why */}
              <TextField
                label="Why?"
                placeholder="Tell us more (optional)"
                multiline
                rows={2}
                size="small"
                value={qWhy}
                onChange={e => setWhy(e.target.value)}
                sx={{ '& .MuiInputBase-root': { fontFamily: '"Open Sans", sans-serif', fontSize: 13 } }}
              />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, pt: 0.5 }}>
              <Button
                fullWidth
                variant="contained"
                disabled={qValue === null}
                onClick={advanceSurvey}
                sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 13, textTransform: 'none', borderRadius: '8px' }}
              >
                {surveyStep === 1 ? 'Next' : pendingNext !== null ? 'Next task' : 'Finish'}
              </Button>
            </DialogActions>
          </Dialog>
        )
      })()}

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
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pb: 2, display: 'flex', flexDirection: 'column' }}>

            {/* Task card — fixed min-height so button doesn't shift between tasks */}
            <Box sx={{
              bgcolor: currentTask.done ? '#E5F7E0' : '#FFFFFF',
              border: `1px solid ${currentTask.done ? t.successMain : '#E0E0E0'}`,
              borderRadius: '10px', p: 2, mt: '10px',
              height: 300,
              overflow: 'hidden',
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

            {/* I'm done */}
            <Button
              fullWidth
              variant="contained"
              disabled={currentTask.done}
              onClick={markDone}
              sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
                fontSize: 13, textTransform: 'none', borderRadius: '8px', mt: '10px',
                bgcolor: currentTask.done ? t.successMain : t.primaryMain,
                '&:hover': { bgcolor: currentTask.done ? t.successMain : '#0042BB' },
                '&.Mui-disabled': { bgcolor: '#E5F7E0', color: t.successMain },
              }}
            >
              {currentTask.done ? '✓  Done' : "I'm done"}
            </Button>

            {/* Dot navigation */}
            <Box
              className="task-nav"
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: '2px', mt: '4px',
                '&:hover .task-nav-arrow': { opacity: 1 },
              }}
            >
              <IconButton
                className="task-nav-arrow"
                size="small"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(i => i - 1)}
                sx={{ color: t.actionActive, opacity: 0, transition: 'opacity 0.15s' }}
              >
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
              <IconButton
                className="task-nav-arrow"
                size="small"
                disabled={currentIdx === tasks.length - 1}
                onClick={() => setCurrentIdx(i => i + 1)}
                sx={{ color: t.actionActive, opacity: 0, transition: 'opacity 0.15s' }}
              >
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
// Phase 3 = task 3 done: "Approve for sharing", Approved for sharing
// Phase 4 = task 4 done: Approved for sharing
const PHASE_STATUS: Record<number, 'draft' | 'pending' | 'approved'> = { 0: 'draft', 1: 'pending', 2: 'pending', 3: 'approved', 4: 'approved' }

// Per-video state — each video has its own phase, pageState, sentApprovers, and commentsCleared flag
type VideoState = { phase: number; pageState: 'draft' | 'pending'; sentApprovers: string[]; commentsCleared?: boolean; headingText?: string; subheadingText?: string; permSettings?: VideoPermissionSettings; sentAt?: string }
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
  const [videoPermDialogOpen,   setVideoPermDialogOpen]   = useState(false)
  // Approval settings
  const [approvalsEnabled, setApprovalsEnabled] = useState(false)
  const [approverIds, setApproverIds] = useState<Set<string>>(new Set())
  const [approversList, setApproversList] = useState<{ value: string; label: string }[]>(
    () => INITIAL_USERS
      .filter(u => u.createSpace.includes('Approver'))
      .map(u => ({ value: u.user.id, label: `${u.user.name} (${u.user.email})` }))
  )
  const [pendingApprovalsDialogOpen, setPendingApprovalsDialogOpen] = useState(false)
  const [pendingApprovalsWarningReason, setPendingApprovalsWarningReason] = useState<'turn-off' | 'delete-user' | null>(null)
  const [approvalsDisabledDialogOpen, setApprovalsDisabledDialogOpen] = useState(false)
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false)
  const [accountSettingsInitialTab, setAccountSettingsInitialTab] = useState<'users' | 'permissions' | 'approvals' | 'access'>('users')

  // Derive current video's state from the map (defaults to fresh draft)
  const currentKey = selectedVideo?.title || 'Stay Safe During Missile Threats'
  const currentVState: VideoState = videoStates[currentKey] ?? DEFAULT_VIDEO_STATE
  const videoPhase        = currentVState.phase
  const pageState         = currentVState.pageState
  const sentApprovers     = currentVState.sentApprovers
  const videoPermSettings = currentVState.permSettings

  // Helper to partially update a video's state entry
  function updateVideoState(key: string, patch: Partial<VideoState>) {
    setVideoStates(prev => ({
      ...prev,
      [key]: { ...(prev[key] ?? DEFAULT_VIDEO_STATE), ...patch },
    }))
  }

  // Phase drives status; also allow the approval dialog to flip phase-0 to pending
  const effectiveStatus: 'draft' | 'pending' | 'approved' =
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
    updateVideoState(currentKey, { sentApprovers: approvers, pageState: 'pending', sentAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) })
    setDialogStep('confirmed')
  }

  const handleConfirmationClose = () => {
    setDialogStep('closed')
  }

  // Tooltip text on "Pending approval" button
  const pendingTooltip = sentApprovers.length > 0
    ? `Sent for approval on Mar 15 by you to ${formatApproverNames(sentApprovers)}`
    : 'Sent for approval on Mar 15 by you'

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Main app area ───────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {currentPage === 'library' ? (
          <VideoLibraryPage
            onSelectVideo={handleSelectVideo}
            notifications={notifications}
            videoStates={videoStates}
            onPermChange={(key, s) => updateVideoState(key, { permSettings: s })}
            onSubmitForApproval={(key, approvers) => updateVideoState(key, { sentApprovers: approvers, pageState: 'pending', sentAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) })}
            approvalsEnabled={approvalsEnabled}
            onApprovalsDisabled={() => setApprovalsDisabledDialogOpen(true)}
            approverIds={approverIds}
            onApprovalsEnabledChange={(enabled, hasPendingApprovals) => {
              if (!enabled && hasPendingApprovals) {
                // Show pending approvals warning dialog
                setPendingApprovalsWarningReason('turn-off')
                setPendingApprovalsDialogOpen(true)
              } else {
                setApprovalsEnabled(enabled)
              }
            }}
            approversList={approversList}
            accountSettingsOpen={accountSettingsOpen}
            accountSettingsInitialTab={accountSettingsInitialTab}
            onAccountSettingsOpen={(open) => setAccountSettingsOpen(open)}
            onApproversChange={(ids) => {
              setApproverIds(ids)
            }}
            onApproversListChange={(approvers) => {
              setApproversList(approvers)
            }}
            onUserDeletionBlocked={(_userId, _reason) => {
              // Show user deletion blocked dialog
              setPendingApprovalsWarningReason('delete-user')
              setPendingApprovalsDialogOpen(true)
            }}
          />

        ) : currentPage === 'studio' ? (
          /* ── Studio / Editor page ─────────────────────────────────────────── */
          <StudioPage
            videoTitle={selectedVideo?.title ?? 'Video'}
            initialHeadingText={currentVState.headingText}
            initialSubheadingText={currentVState.subheadingText}
            approverNames={sentApprovers.length > 0 ? formatApproverNames(sentApprovers) : 'Sarah Johnson and Emma Rodriguez'}
            onNavigateToVideoPage={() => setCurrentPage('video')}
            onNavigateToLibrary={() => setCurrentPage('library')}
            onRequestReapproval={() => updateVideoState(currentKey, { phase: 0, pageState: 'pending' })}
            onHeadingChange={(text) => updateVideoState(currentKey, { headingText: text })}
            onSubheadingChange={(text) => updateVideoState(currentKey, { subheadingText: text })}
            openCommentsOnMount={openCommentsOnStudio}
            triggerOpenComments={openCommentsCounter}
            notifications={notifications}
            initialThreads={videoPhase >= 2 ? INITIAL_THREADS : []}
            initialPermSettings={videoPermSettings}
            onPermChange={(s) => updateVideoState(currentKey, { permSettings: s })}
            awaitingApprovers={false}
            onEditAttempt={videoPhase === 1 ? () => setCancelApprovalDialogOpen(true) : undefined}
          />

        ) : (
          /* ── Video page ───────────────────────────────────────────────────── */
          <Box sx={{ display: 'flex', width: '100%', height: '100%', bgcolor: t.bgDefault, overflow: 'hidden' }}>
            <Sidebar
              effectiveStatus={effectiveStatus}
              videoTitle={selectedVideo?.title ?? 'Video'}
              onNavigateToLibrary={() => setCurrentPage('library')}
              videoPermSettings={videoPermSettings}
              onManageAccess={() => setVideoPermDialogOpen(true)}
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
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <VideoPreviewCard
                      videoPhase={videoPhase}
                      effectiveStatus={effectiveStatus}
                      approvers={sentApprovers.length > 0 ? sentApprovers : ['sjohnson', 'erodriguez']}
                      pendingTooltip={pendingTooltip}
                      headingText={currentVState.headingText}
                      subheadingText={currentVState.subheadingText}
                      videoTitle={selectedVideo?.title}
                      onSentForApproval={() => setDialogStep('form')}
                      onEdit={(fromComments?: boolean) => {
                        if (isPending && videoPhase !== 2 && !fromComments) {
                          setCancelApprovalDialogOpen(true)
                        } else {
                          setOpenCommentsOnStudio(fromComments ?? false)
                          setCurrentPage('studio')
                        }
                      }}
                      onApproveVideo={() => setApproveDialogOpen(true)}
                      videoPermSettings={videoPermSettings}
                      onManageAccess={() => setVideoPermDialogOpen(true)}
                      approvalsEnabled={approvalsEnabled}
                    />
                  </Box>
                  <ReviewOptionsPanel isPending={effectiveStatus === 'pending' && videoPhase !== 2} />
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

      {/* ── Video permission dialog (video page) ───────────────────────────── */}
      <VideoPermissionDialog
        open={videoPermDialogOpen}
        onClose={() => setVideoPermDialogOpen(false)}
        onSave={s => { updateVideoState(currentKey, { permSettings: s }); setVideoPermDialogOpen(false) }}
        initialSettings={videoPermSettings}
      />

      {/* ── Dialogs ────────────────────────────────────────────────────────── */}
      <ApprovalDialog
        open={dialogStep === 'form'}
        onClose={() => setDialogStep('closed')}
        onSend={handleApprovalSend}
        availableApprovers={approversList}
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
          setCancelApprovalDialogOpen(false)
          setCurrentPage('studio')
        }}
      />

      {/* Pending Approvals Warning Dialog — when turning off or deleting with pending approvals */}
      <Dialog
        open={pendingApprovalsDialogOpen}
        onClose={() => setPendingApprovalsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 18, color: t.textPrimary, pb: 1 }}>
          {pendingApprovalsWarningReason === 'turn-off'
            ? 'Cannot turn off approvals'
            : 'Cannot remove user'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: t.textSecondary, mb: 2, lineHeight: 1.6 }}>
            {pendingApprovalsWarningReason === 'turn-off'
              ? `You have ${Object.values(videoStates).filter(v => v.sentApprovers?.length > 0).length} video${
                  Object.values(videoStates).filter(v => v.sentApprovers?.length > 0).length !== 1 ? 's' : ''
                } awaiting approval. You must remove all pending approvals before turning off the "Require approvals" feature.`
              : 'This user has pending approvals. You must remove all pending approvals or add other approvers before removing this user.'}
          </Typography>

          {/* List of pending approvals */}
          <Box sx={{ bgcolor: '#FAFBFD', borderRadius: '8px', p: 2, mb: 2 }}>
            {Object.entries(videoStates)
              .filter(([_, state]) => state.sentApprovers?.length > 0)
              .slice(0, 5)
              .map(([videoTitle, state]) => (
                <Box key={videoTitle} sx={{ display: 'flex', gap: 2, mb: 1.5, alignItems: 'flex-start', '&:last-child': { mb: 0 } }}>
                  <Box sx={{ width: 60, height: 60, borderRadius: '6px', bgcolor: t.bgDefault, flexShrink: 0, border: `1px solid ${t.divider}` }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 13, color: t.textPrimary, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {videoTitle}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 12, color: t.textSecondary }}>
                      Awaiting approval • {formatApproverNames(state.sentApprovers)}
                    </Typography>
                  </Box>
                </Box>
              ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              setPendingApprovalsDialogOpen(false)
              // Don't allow the action
            }}
            sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: t.primaryMain, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approvals Disabled Dialog */}
      <Dialog
        open={approvalsDisabledDialogOpen}
        onClose={() => setApprovalsDisabledDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 18, color: t.textPrimary, pb: 1 }}>
          Enable approvals
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: t.textSecondary, mb: 2, lineHeight: 1.6 }}>
            To use this feature, set up approvers in Account Settings and turn on "Require approvals from specific users for videos and templates".
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setApprovalsDisabledDialogOpen(false)}
            sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, textTransform: 'none', color: t.textPrimary, borderColor: t.divider }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setApprovalsDisabledDialogOpen(false)
              setApprovalsEnabled(true)
              setAccountSettingsInitialTab('approvals')
              setAccountSettingsOpen(true)
            }}
            sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: t.primaryMain, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
          >
            Set approvers
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
