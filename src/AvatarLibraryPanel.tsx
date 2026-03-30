import { useState } from 'react'
import {
  Box, Typography, IconButton, Button, Tooltip,
  Popover, Divider, Badge,
} from '@mui/material'
import CloseIcon              from '@mui/icons-material/Close'
import HelpOutlineIcon        from '@mui/icons-material/HelpOutline'
import AddIcon                from '@mui/icons-material/Add'
import OpenInFullIcon         from '@mui/icons-material/OpenInFull'
import MoreVertIcon           from '@mui/icons-material/MoreVert'
import PersonIcon             from '@mui/icons-material/Person'
import TokenOutlinedIcon      from '@mui/icons-material/TokenOutlined'
import DeleteOutlinedIcon     from '@mui/icons-material/DeleteOutlined'
import SettingsOutlinedIcon   from '@mui/icons-material/SettingsOutlined'
import InfoOutlinedIcon       from '@mui/icons-material/InfoOutlined'
import GroupsIcon             from '@mui/icons-material/Groups'
import PeopleOutlinedIcon     from '@mui/icons-material/PeopleOutlined'
import LockOutlinedIcon       from '@mui/icons-material/LockOutlined'
import KeyboardArrowDownIcon  from '@mui/icons-material/KeyboardArrowDown'
import SwapHorizIcon          from '@mui/icons-material/SwapHoriz'

import AvatarPermissionDialog, {
  type AvatarUsagePermission,
  type AvatarPermissionSettings,
  type AccessRequest,
} from './AvatarPermissionDialog'
import { OWNER_USER } from './ManageAccessDialog'

// ─── Constants ────────────────────────────────────────────────────────────────
const PANEL_WIDTH    = 366
const AVATAR_CREDITS = 340
const AVATARS_LEFT   = 2

const GRADIENT_BETA =
  'linear-gradient(141.73deg, #EB89F1 12.13%, #D47FEF 22.85%, #C175EE 33.17%, ' +
  '#AB6DEC 44.29%, #936BEB 55.41%, #775EE9 66.53%, #5358E7 77.25%, #0053E5 88.37%)'

// ─── Design tokens ────────────────────────────────────────────────────────────
const c = {
  primary:       '#0053E5',
  secondary:     '#03194F',
  secondaryFade: '#7F8CED',
  textPrimary:   'rgba(0,0,0,0.87)',
  textSecondary: 'rgba(60,60,72,0.6)',
  actionActive:  'rgba(0,0,0,0.56)',
  divider:       'rgba(0,83,229,0.12)',
  grey300:       '#CFD6EA',
  errorMain:     '#E62843',
  successMain:   '#118747',
}

const navyTooltipSx = {
  bgcolor: '#03194F', borderRadius: '6px', fontSize: 11,
  maxWidth: 240, whiteSpace: 'pre-line' as const,
  '& .MuiTooltip-arrow': { color: '#03194F' },
}

// ─── Usage permission options ─────────────────────────────────────────────────
const USAGE_OPTIONS: { value: AvatarUsagePermission; label: string }[] = [
  { value: 'everyone', label: 'Everyone in your account' },
  { value: 'specific', label: 'Specific users'           },
  { value: 'private',  label: 'Private (only you)'       },
]

// ─── Mock data ─────────────────────────────────────────────────────────────────
interface AvatarItem {
  id:          string
  name:        string
  img:         string | null
  isCustom?:   boolean
  createdDate?: string
  createdBy?:   string
}

// Requests only on taylor
const MOCK_REQUESTS: Record<string, AccessRequest[]> = {
  taylor: [
    { id: 'eb', initials: 'EB', color: '#7B1FA2', name: 'Eli Bogan',          email: 'bogane@Sundaysky.com' },
    { id: 'ke', initials: 'KE', color: '#0288D1', name: 'Kenton Emard',       email: 'emardk@Sundaysky.com' },
    { id: 'ss', initials: 'SS', color: '#2E7D32', name: 'Shea Streich',       email: 'streichs@Sundaysky.com' },
    { id: 'bw', initials: 'BW', color: '#E65100', name: 'Brigitte Wintheiser', email: 'wintheiserb@Sundaysky.com' },
  ],
}

const CUSTOM_AVATARS: AvatarItem[] = [
  { id: 'adam',   name: 'Adam',       img: null, isCustom: true, createdDate: 'Dec 29, 2025', createdBy: 'You' },
  { id: 'chris',  name: 'Chris (CEO)',img: null, isCustom: true, createdDate: 'Jan 5, 2026',  createdBy: 'You' },
  { id: 'taylor', name: 'Taylor',     img: null, isCustom: true, createdDate: 'Feb 12, 2026', createdBy: 'You' },
  { id: 'jordan', name: 'Jordan',     img: null, isCustom: true, createdDate: 'Mar 1, 2026',  createdBy: 'You' },
]

const STOCK_AVATARS: AvatarItem[] = [
  { id: 's-sofia',   name: 'Sofia',   img: null },
  { id: 's-marcus',  name: 'Marcus',  img: null },
  { id: 's-yuki',    name: 'Yuki',    img: null },
  { id: 's-priya',   name: 'Priya',   img: null },
  { id: 's-leo',     name: 'Leo',     img: null },
  { id: 's-elena',   name: 'Elena',   img: null },
  { id: 's-omar',    name: 'Omar',    img: null },
  { id: 's-zoe',     name: 'Zoe',     img: null },
  { id: 's-daniel',  name: 'Daniel',  img: null },
  { id: 's-aisha',   name: 'Aisha',   img: null },
  { id: 's-jake',    name: 'Jake',    img: null },
  { id: 's-mei',     name: 'Mei',     img: null },
]

// ─── Permission icon with correct color baked in ──────────────────────────
function PermissionIcon({ perm, size = 16 }: { perm: AvatarUsagePermission; size?: number }) {
  const sx = { fontSize: size }
  if (perm === 'everyone') return <GroupsIcon         sx={{ ...sx, color: c.primary }} />
  if (perm === 'specific') return <PeopleOutlinedIcon sx={{ ...sx, color: '#F46900' }} />
  return <LockOutlinedIcon sx={{ ...sx, color: c.successMain }} />
}

function permLabel(perm: AvatarUsagePermission) {
  return USAGE_OPTIONS.find(o => o.value === perm)?.label ?? 'Everyone in your account'
}

// ─── Rounded-square avatar chip (for options menu) ─────────────────────────
function AvatarChip({
  initials,
  tooltip,
}: {
  initials: string
  tooltip:  string
}) {
  return (
    <Tooltip title={tooltip} placement="top" arrow componentsProps={{ tooltip: { sx: navyTooltipSx } }}>
      <Box sx={{
        width: 28, height: 28,
        bgcolor: 'rgba(0,83,229,0.12)',
        borderRadius: '6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'default', flexShrink: 0,
      }}>
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 700,
          fontSize: 10, color: c.textPrimary, lineHeight: 1,
        }}>
          {initials}
        </Typography>
      </Box>
    </Tooltip>
  )
}

// ─── AvatarCard ───────────────────────────────────────────────────────────────
function AvatarCard({
  avatar,
  anyActive,
  isActive,
  onAdd,
  permSettings,
  requestCount,
  onOpenMenu,
}: {
  avatar:       AvatarItem
  anyActive:    boolean        // any avatar is currently in scene
  isActive:     boolean        // this specific avatar is the active one
  onAdd:        (id: string) => void
  permSettings?: AvatarPermissionSettings
  requestCount?: number
  onOpenMenu?:  (e: React.MouseEvent<HTMLButtonElement>, id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const perm = permSettings?.usagePermission ?? 'everyone'
  const showPermIcon = perm !== 'everyone'

  const permTooltip = perm === 'private'
    ? 'Only you can use this avatar. Everyone else can view it.'
    : 'Only specific users can use this custom avatar. Everyone else can see it.'

  // Button label: if any avatar is active → Replace, otherwise Add (icon already shows +)
  const btnLabel = anyActive ? 'Replace' : 'Add'

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: isActive
          ? `2px solid ${c.primary}`
          : '1px solid rgba(0,0,0,0.10)',
        cursor: 'pointer',
        position: 'relative',
        bgcolor: hovered ? '#fafafa' : '#fff',
        transition: 'box-shadow 0.15s',
        boxShadow: hovered ? '0 2px 8px rgba(3,25,79,0.14)' : 'none',
      }}
    >
      {/* Photo area */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        paddingTop: '115%',
        bgcolor: '#e8eaf0',
        overflow: 'hidden',
      }}>
        {avatar.img ? (
          <Box
            component="img"
            src={avatar.img}
            alt={avatar.name}
            sx={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box sx={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PersonIcon sx={{ fontSize: 52, color: 'rgba(0,0,0,0.18)' }} />
          </Box>
        )}

        {/* Hover overlay — action buttons */}
        {hovered && (
          <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            display: 'flex', alignItems: 'flex-start',
            p: '6px',
            gap: '4px',
          }}>
            {/* + Add / Replace */}
            <Button
              variant="contained"
              size="small"
              startIcon={
                anyActive
                  ? <SwapHorizIcon sx={{ fontSize: '14px !important' }} />
                  : <AddIcon sx={{ fontSize: '14px !important' }} />
              }
              onClick={e => { e.stopPropagation(); onAdd(avatar.id) }}
              sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: 600,
                fontSize: 12,
                textTransform: 'none',
                borderRadius: '6px',
                py: '3px',
                px: '8px',
                minWidth: 0,
                bgcolor: '#fff',
                color: c.secondary,
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                '&:hover': {
                  bgcolor: '#f0f4ff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                },
              }}
            >
              {btnLabel}
            </Button>

            {/* Spacer */}
            <Box sx={{ flex: 1 }} />

            {/* Expand preview */}
            <Tooltip title="Preview" placement="top" arrow
              componentsProps={{ tooltip: { sx: navyTooltipSx } }}
            >
              <IconButton
                size="small"
                onClick={e => e.stopPropagation()}
                sx={{
                  bgcolor: '#fff',
                  color: c.primary,
                  borderRadius: '6px',
                  width: 24, height: 24,
                  p: '4px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                  '&:hover': { bgcolor: '#f0f4ff' },
                }}
              >
                <OpenInFullIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>

            {/* Three-dot options (custom avatars only) */}
            {avatar.isCustom && onOpenMenu && (
              <IconButton
                size="small"
                onClick={e => { e.stopPropagation(); onOpenMenu(e, avatar.id) }}
                sx={{
                  bgcolor: '#fff',
                  color: c.primary,
                  borderRadius: '6px',
                  width: 24, height: 24,
                  p: '4px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                  '&:hover': { bgcolor: '#f0f4ff' },
                }}
              >
                <MoreVertIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>
        )}

        {/* Request count badge */}
        {(requestCount ?? 0) > 0 && (
          <Box sx={{
            position: 'absolute', bottom: 8, left: 8,
            bgcolor: c.errorMain, color: '#fff',
            borderRadius: '10px', px: '8px', py: '2px',
            display: 'flex', alignItems: 'center',
          }}>
            <Typography sx={{
              fontFamily: '"Open Sans", sans-serif', fontSize: 11,
              fontWeight: 600, color: '#fff', lineHeight: 1,
            }}>
              {requestCount} request{requestCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Name label row */}
      <Box sx={{ px: '10px', py: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif',
          fontSize: 12, fontWeight: 400,
          color: c.textPrimary, lineHeight: 1.5,
          flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {avatar.name}
        </Typography>

        {/* Permission icon (custom avatars only, non-everyone) */}
        {showPermIcon && (
          <Tooltip
            title={permTooltip}
            placement="top"
            arrow
            componentsProps={{ tooltip: { sx: navyTooltipSx } }}
          >
            <Box sx={{ display: 'flex', cursor: 'default' }}>
              {perm === 'private'
                ? <LockOutlinedIcon      sx={{ fontSize: 14, color: c.successMain }} />
                : <PeopleOutlinedIcon    sx={{ fontSize: 14, color: '#F46900' }} />}
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

// ─── AvatarGrid ───────────────────────────────────────────────────────────────
function AvatarGrid({
  avatars,
  activeAvatarId,
  onAdd,
  permMap,
  requestsMap,
  onOpenMenu,
}: {
  avatars:       AvatarItem[]
  activeAvatarId: string | null
  onAdd:         (id: string) => void
  permMap?:      Record<string, AvatarPermissionSettings>
  requestsMap?:  Record<string, AccessRequest[]>
  onOpenMenu?:   (e: React.MouseEvent<HTMLButtonElement>, id: string) => void
}) {
  const anyActive = activeAvatarId !== null

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      p: 2,
    }}>
      {avatars.map(av => (
        <AvatarCard
          key={av.id}
          avatar={av}
          anyActive={anyActive}
          isActive={activeAvatarId === av.id}
          onAdd={onAdd}
          permSettings={permMap?.[av.id]}
          requestCount={requestsMap?.[av.id]?.length ?? 0}
          onOpenMenu={onOpenMenu}
        />
      ))}
    </Box>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AvatarLibraryPanel({
  open,
  onClose,
  onTotalRequestsChange,
}: {
  open:                   boolean
  onClose:                () => void
  onTotalRequestsChange?: (count: number) => void
}) {
  const [tab, setTab] = useState<0 | 1 | 2>(0)

  // Track which avatar is currently placed in the scene (single at a time)
  const [activeAvatarId, setActiveAvatarId] = useState<string | null>(null)
  // Accumulate all avatars ever placed (for Used in video tab)
  const [usedAvatarIds, setUsedAvatarIds] = useState<Set<string>>(new Set<string>())

  // Permission settings per custom avatar
  const [permMap, setPermMap] = useState<Record<string, AvatarPermissionSettings>>({})

  // Pending requests per custom avatar
  const [requestsMap, setRequestsMap] = useState<Record<string, AccessRequest[]>>(MOCK_REQUESTS)

  // Context menu — track by position for reliable placement
  const [menuPos,      setMenuPos]      = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [menuAvatarId, setMenuAvatarId] = useState<string | null>(null)

  // Permission dialog
  const [permDialogOpen,     setPermDialogOpen]     = useState(false)
  const [permDialogAvatarId, setPermDialogAvatarId] = useState<string | null>(null)

  const menuAvatar     = CUSTOM_AVATARS.find(a => a.id === menuAvatarId)
  const menuPerm       = menuAvatarId ? (permMap[menuAvatarId]?.usagePermission ?? 'everyone') : 'everyone'
  const menuApprovers  = menuAvatarId ? (permMap[menuAvatarId]?.approverUsers ?? [OWNER_USER]) : [OWNER_USER]
  const menuSpecific   = menuAvatarId ? (permMap[menuAvatarId]?.specificUsers ?? []) : []
  const menuRequests   = menuAvatarId ? (requestsMap[menuAvatarId]?.length ?? 0) : 0

  const permDialogAvatar = CUSTOM_AVATARS.find(a => a.id === permDialogAvatarId)

  // Compute avatars used in video (dynamic, based on usedAvatarIds)
  const usedInVideo: AvatarItem[] = [
    ...CUSTOM_AVATARS.filter(a => usedAvatarIds.has(a.id)),
    ...STOCK_AVATARS.filter(a => usedAvatarIds.has(a.id)),
  ]

  function totalRequests() {
    return Object.values(requestsMap).reduce((n, arr) => n + arr.length, 0)
  }

  function handleAdd(id: string) {
    setActiveAvatarId(id)
    setUsedAvatarIds(prev => new Set([...prev, id]))
  }

  function openMenu(e: React.MouseEvent<HTMLButtonElement>, id: string) {
    const rect = e.currentTarget.getBoundingClientRect()
    // Anchor top-right corner of menu to bottom-right of button
    setMenuPos({ top: rect.bottom + 4, left: rect.right })
    setMenuAvatarId(id)
  }

  function closeMenu() {
    setMenuAvatarId(null)
  }

  function handleOpenPermDialog() {
    setPermDialogAvatarId(menuAvatarId)
    setPermDialogOpen(true)
    // Don't close menu — it stays behind the dialog and re-appears on dialog close
  }

  function handleSavePermissions(s: AvatarPermissionSettings, remaining: AccessRequest[]) {
    if (!permDialogAvatarId) return
    setPermMap(prev => ({ ...prev, [permDialogAvatarId]: s }))
    setRequestsMap(prev => {
      const next = { ...prev, [permDialogAvatarId]: remaining }
      const total = Object.values(next).reduce((n, arr) => n + arr.length, 0)
      onTotalRequestsChange?.(total)
      return next
    })
    setPermDialogOpen(false)
  }

  const tabs: { label: string; beta?: boolean }[] = [
    { label: 'Custom', beta: true },
    { label: 'Stock' },
    { label: 'Used in video' },
  ]

  const total = totalRequests()

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Box sx={{
        width:       open ? PANEL_WIDTH : 0,
        flexShrink:  0,
        overflow:    'hidden',
        transition:  'width 0.26s cubic-bezier(0.4,0,0.2,1)',
        bgcolor:     '#fff',
        borderRight: `1px solid ${c.divider}`,
        display:     'flex',
        height:      '100%',
      }}>
        <Box sx={{
          width:         PANEL_WIDTH,
          flexShrink:    0,
          height:        '100%',
          display:       'flex',
          flexDirection: 'column',
          overflow:      'hidden',
        }}>

          {/* ── Header ───────────────────────────────────────────────── */}
          <Box sx={{
            display: 'flex', alignItems: 'center',
            px: 2, pt: 1.5, pb: 1, flexShrink: 0, gap: '6px',
          }}>
            <Typography sx={{
              fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 20,
              color: c.textPrimary, flex: 1, lineHeight: 1.5,
            }}>
              Avatars
            </Typography>

            {/* Credit badge */}
            <Tooltip title="Avatar credits" placement="bottom" arrow
              componentsProps={{ tooltip: { sx: navyTooltipSx } }}
            >
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: '4px',
                bgcolor: 'rgba(0,83,229,0.08)',
                border: '1px solid rgba(0,83,229,0.18)',
                borderRadius: '12px',
                px: '10px', py: '3px',
                cursor: 'default',
              }}>
                <TokenOutlinedIcon sx={{ fontSize: 13, color: c.primary }} />
                <Typography sx={{
                  fontFamily: '"Open Sans", sans-serif', fontSize: 12,
                  fontWeight: 600, color: c.primary, lineHeight: 1,
                }}>
                  {AVATAR_CREDITS}
                </Typography>
              </Box>
            </Tooltip>

            <IconButton size="small" sx={{ color: c.actionActive }}>
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* ── Tabs (full width) ─────────────────────────────────── */}
          <Box sx={{
            display: 'flex', borderBottom: `1px solid ${c.divider}`,
            flexShrink: 0,
          }}>
            {tabs.map(({ label, beta }, i) => (
              <Box
                key={label}
                onClick={() => setTab(i as 0 | 1 | 2)}
                sx={{
                  flex: 1,
                  py: '8px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  borderBottom: tab === i ? `2px solid ${c.secondary}` : '2px solid transparent',
                  mb: '-1px',
                  userSelect: 'none',
                }}
              >
                <Typography sx={{
                  fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 13,
                  color: tab === i ? c.secondary : c.secondaryFade,
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </Typography>
                {beta && (
                  <Box sx={{
                    background: GRADIENT_BETA, borderRadius: '4px',
                    px: '6px', pt: '1px', pb: '2px',
                  }}>
                    <Typography sx={{
                      fontFamily: '"Open Sans", sans-serif', fontWeight: 500,
                      fontSize: 10, color: '#fff', lineHeight: 1.5,
                    }}>
                      Beta
                    </Typography>
                  </Box>
                )}
                {/* Request badge on Custom tab */}
                {label === 'Custom' && total > 0 && (
                  <Badge
                    badgeContent={total}
                    color="error"
                    sx={{ ml: '4px', '& .MuiBadge-badge': { fontSize: 9, minWidth: 16, height: 16, padding: 0, position: 'relative', transform: 'none' } }}
                  />
                )}
              </Box>
            ))}
          </Box>

          {/* ── Scrollable content ────────────────────────────────── */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>

            {/* Custom tab */}
            {tab === 0 && (
              <Box>
                <Box sx={{ px: 2, pt: 2, pb: 0 }}>
                  <Button
                    variant="outlined" fullWidth
                    startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
                    sx={{
                      justifyContent: 'flex-start',
                      color: c.primary, borderColor: c.grey300,
                      fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
                      textTransform: 'none', borderRadius: '8px', py: '7px',
                      '&:hover': { borderColor: c.primary, bgcolor: 'rgba(0,83,229,0.04)' },
                    }}
                  >
                    <Box sx={{ flex: 1, textAlign: 'left' }}>Create Avatar</Box>
                    <Typography sx={{
                      fontFamily: '"Open Sans", sans-serif', fontSize: 12,
                      color: c.textSecondary, fontWeight: 400,
                    }}>
                      {AVATARS_LEFT} left
                    </Typography>
                  </Button>
                </Box>
                <AvatarGrid
                  avatars={CUSTOM_AVATARS}
                  activeAvatarId={activeAvatarId}
                  onAdd={handleAdd}
                  permMap={permMap}
                  requestsMap={requestsMap}
                  onOpenMenu={openMenu}
                />
              </Box>
            )}

            {/* Stock tab */}
            {tab === 1 && (
              <AvatarGrid
                avatars={STOCK_AVATARS}
                activeAvatarId={activeAvatarId}
                onAdd={handleAdd}
              />
            )}

            {/* Used in video tab — only shows dynamically added avatars */}
            {tab === 2 && (
              usedInVideo.length > 0 ? (
                <AvatarGrid
                  avatars={usedInVideo}
                  activeAvatarId={activeAvatarId}
                  onAdd={handleAdd}
                  permMap={permMap}
                  requestsMap={requestsMap}
                  onOpenMenu={openMenu}
                />
              ) : (
                <Box sx={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  py: 6, px: 4, gap: 1,
                }}>
                  <PersonIcon sx={{ fontSize: 40, color: 'rgba(0,0,0,0.2)' }} />
                  <Typography sx={{
                    fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                    color: c.textSecondary, textAlign: 'center',
                  }}>
                    No avatars are featured in this video yet.
                  </Typography>
                </Box>
              )
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Context menu popover ──────────────────────────────────────────── */}
      <Popover
        open={Boolean(menuAvatarId) && !permDialogOpen}
        anchorReference="anchorPosition"
        anchorPosition={menuPos}
        onClose={closeMenu}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            borderRadius: '10px', minWidth: 260, maxWidth: 310,
            boxShadow: '0 4px 20px rgba(3,25,79,0.18)',
            p: 0, overflow: 'hidden',
          },
        }}
      >
        {menuAvatar && (
          <Box>
            {/* Header */}
            <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
                fontSize: 14, color: c.textPrimary,
              }}>
                {menuAvatar.name}
              </Typography>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontSize: 12,
                color: c.textSecondary, mt: '2px',
              }}>
                Created: {menuAvatar.createdDate}, {menuAvatar.createdBy}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

            {/* Usage access + approver avatars */}
            <Box sx={{ px: 2, py: 1.25 }}>
              {/* Label + clickable permission row → opens dialog */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '10px' }}>
                <Typography sx={{
                  fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                  color: c.textPrimary, fontWeight: 600, flexShrink: 0,
                }}>
                  Usage access:
                </Typography>
                <Box
                  onClick={handleOpenPermDialog}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    flex: 1, cursor: 'pointer', borderRadius: '6px',
                    px: '6px', py: '3px', mx: '-6px',
                    '&:hover': { bgcolor: 'rgba(0,83,229,0.06)' },
                  }}
                >
                  <PermissionIcon perm={menuPerm} size={15} />
                  <Typography sx={{
                    fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                    color: menuPerm === 'everyone' ? c.primary : '#F46900',
                    fontWeight: 500, flex: 1, whiteSpace: 'nowrap',
                  }}>
                    {permLabel(menuPerm)}
                  </Typography>
                  <KeyboardArrowDownIcon sx={{ fontSize: 15, color: c.textSecondary, flexShrink: 0 }} />
                </Box>
              </Box>

              {/* Approver + usage avatars row — two groups separated by a divider */}
              <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {/* Group 1: Approver users (who can allow) */}
                {menuApprovers.map(user => (
                  <AvatarChip
                    key={user.id}
                    initials={user.initials}
                    tooltip={`${user.name} (You)\nCan manage access, delete, and rename.`}
                  />
                ))}

                {/* Vertical divider between the two groups */}
                {(menuPerm === 'everyone' || (menuPerm === 'specific' && menuSpecific.length > 0)) && (
                  <Box sx={{
                    width: '1px', height: 20,
                    bgcolor: 'rgba(0,0,0,0.12)',
                    flexShrink: 0,
                  }} />
                )}

                {/* Group 2: who can use — group icon (everyone) or specific users */}
                {menuPerm === 'everyone' && (
                  <Tooltip
                    title="Everyone in your account can use this custom avatar."
                    placement="top"
                    arrow
                    componentsProps={{ tooltip: { sx: navyTooltipSx } }}
                  >
                    <Box sx={{
                      width: 28, height: 28,
                      bgcolor: 'rgba(0,83,229,0.12)',
                      borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'default',
                    }}>
                      <GroupsIcon sx={{ fontSize: 16, color: c.primary }} />
                    </Box>
                  </Tooltip>
                )}

                {menuPerm === 'specific' && menuSpecific.map(user => (
                  <AvatarChip
                    key={user.id}
                    initials={user.initials}
                    tooltip={`${user.name} can use this avatar.`}
                  />
                ))}
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

            {/* Manage permissions (with request badge) */}
            <Box sx={{ px: 2, py: 1 }}>
              <Button
                variant="outlined" fullWidth size="small"
                startIcon={<SettingsOutlinedIcon sx={{ fontSize: 16 }} />}
                endIcon={
                  menuRequests > 0 ? (
                    <Box sx={{
                      width: 18, height: 18, borderRadius: '50%',
                      bgcolor: c.errorMain, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                      fontFamily: '"Open Sans", sans-serif',
                    }}>
                      {menuRequests}
                    </Box>
                  ) : undefined
                }
                onClick={handleOpenPermDialog}
                sx={{
                  color: c.textPrimary, borderColor: c.grey300,
                  fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 13,
                  textTransform: 'none', borderRadius: '8px', justifyContent: 'flex-start',
                  '&:hover': { borderColor: c.primary, color: c.primary },
                }}
              >
                Manage permissions
              </Button>
            </Box>

            <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

            {/* Details */}
            <Box sx={{ px: 2, pt: 1, pb: '4px' }}>
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  cursor: 'pointer', py: '4px', px: '4px', borderRadius: '6px',
                  color: c.textPrimary,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                }}
                onClick={closeMenu}
              >
                <InfoOutlinedIcon sx={{ fontSize: 18, color: c.actionActive }} />
                <Typography sx={{
                  fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                  fontWeight: 400, color: c.textPrimary,
                }}>
                  Details
                </Typography>
              </Box>
            </Box>

            {/* Delete */}
            <Box sx={{ px: 2, pt: '4px', pb: 1 }}>
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  cursor: 'pointer', py: '4px', px: '4px', borderRadius: '6px',
                  color: c.errorMain,
                  '&:hover': { bgcolor: 'rgba(230,40,67,0.06)' },
                }}
                onClick={closeMenu}
              >
                <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                <Typography sx={{
                  fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                  fontWeight: 400, color: c.errorMain,
                }}>
                  Delete
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Popover>

      {/* ── Avatar permission dialog ────────────────────────────────────── */}
      {permDialogAvatar && (
        <AvatarPermissionDialog
          open={permDialogOpen}
          onClose={() => setPermDialogOpen(false)}
          avatarName={permDialogAvatar.name}
          initialSettings={permMap[permDialogAvatar.id]}
          initialRequests={requestsMap[permDialogAvatar.id] ?? []}
          onSave={handleSavePermissions}
        />
      )}
    </>
  )
}
