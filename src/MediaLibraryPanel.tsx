import { useState } from 'react'
import {
  Box, Typography, IconButton, Button, Divider,
  OutlinedInput, InputAdornment, Menu, MenuItem,
  Avatar, Tooltip, InputBase,
} from '@mui/material'
import CloseIcon                    from '@mui/icons-material/Close'
import HelpOutlineIcon              from '@mui/icons-material/HelpOutline'
import FileUploadOutlinedIcon       from '@mui/icons-material/FileUploadOutlined'
import AutoAwesomeOutlinedIcon      from '@mui/icons-material/AutoAwesomeOutlined'
import ExtensionOutlinedIcon        from '@mui/icons-material/ExtensionOutlined'
import CreateNewFolderOutlinedIcon  from '@mui/icons-material/CreateNewFolderOutlined'
import CheckBoxOutlineBlankIcon     from '@mui/icons-material/CheckBoxOutlineBlank'
import GridViewIcon                 from '@mui/icons-material/GridView'
import ViewListIcon                 from '@mui/icons-material/ViewList'
import SearchIcon                   from '@mui/icons-material/Search'
import KeyboardArrowDownIcon        from '@mui/icons-material/KeyboardArrowDown'
import FilterListIcon               from '@mui/icons-material/FilterList'
import ArrowBackIcon                from '@mui/icons-material/ArrowBack'
import FolderRoundedIcon            from '@mui/icons-material/FolderRounded'
import VisibilityOutlinedIcon       from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon    from '@mui/icons-material/VisibilityOffOutlined'
import PermMediaOutlinedIcon        from '@mui/icons-material/PermMediaOutlined'
import OpenInFullIcon               from '@mui/icons-material/OpenInFull'
import MoreVertIcon                 from '@mui/icons-material/MoreVert'
import PeopleAltOutlinedIcon        from '@mui/icons-material/PeopleAltOutlined'
import PeopleOutlinedIcon           from '@mui/icons-material/PeopleOutlined'
import ManageAccountsOutlinedIcon   from '@mui/icons-material/ManageAccountsOutlined'
import EditOutlinedIcon             from '@mui/icons-material/EditOutlined'
import LockOutlinedIcon             from '@mui/icons-material/LockOutlined'

import ManageAccessDialog, {
  type PermissionSettings,
  type ViewPermission,
  type User,
  UserAvatarWithTooltip,
  OWNER_USER,
} from './ManageAccessDialog'

// ─── Constants ────────────────────────────────────────────────────────────────
const PANEL_WIDTH = 366

const GRADIENT_GENERATE =
  'linear-gradient(141.73deg, #EB89F1 12.13%, #D47FEF 22.85%, #C175EE 33.17%, ' +
  '#AB6DEC 44.29%, #936BEB 55.41%, #775EE9 66.53%, #5358E7 77.25%, #0053E5 88.37%)'

// ─── Design tokens ────────────────────────────────────────────────────────────
const c = {
  primary:       '#0053E5',
  primarySel:    'rgba(0,83,229,0.10)',
  secondary:     '#03194F',
  secondaryFade: '#7F8CED',
  textPrimary:   'rgba(0,0,0,0.87)',
  textSecondary: 'rgba(60,60,72,0.8)',
  actionActive:  'rgba(0,0,0,0.56)',
  divider:       'rgba(0,83,229,0.12)',
  grey300:       '#CFD6EA',
  errorMain:     '#E62843',
  warningMain:   '#F46900',
  successMain:   '#118747',
}

// ─── Tooltip sx (navy) ────────────────────────────────────────────────────────
const navyTooltipSx = {
  bgcolor: '#03194F',
  borderRadius: '8px',
  px: 1.5, py: 1,
  maxWidth: 240,
  '& .MuiTooltip-arrow': { color: '#03194F' },
}

// ─── Static sample data ───────────────────────────────────────────────────────
const MEDIA_FOLDERS = [
  { name: 'AI Media Assets',      isAi: true  },
  { name: 'Spring camping',       isAi: false },
  { name: 'Marketing department', isAi: false },
]

const MEDIA_ITEMS = [
  { id: 0, name: 'Product launch 2025',  duration: '1:05', bg: '#1E2D3D', added: 'Dec 29, 2025 3:27 PM' },
  { id: 1, name: 'Team intro',           duration: '0:45', bg: '#1A1A2E', added: 'Jan 5, 2026 10:12 AM' },
  { id: 2, name: 'Spring campaign hero', duration: '2:10', bg: '#2E4A2A', added: 'Feb 3, 2026 2:45 PM'  },
  { id: 3, name: 'Marketing highlights', duration: '1:30', bg: '#3A2A1E', added: 'Mar 1, 2026 9:00 AM'  },
]

// ─── Default permissions ──────────────────────────────────────────────────────
const defaultPermissions = (): PermissionSettings => ({
  viewPermission: 'everyone',
  viewUsers:      [],
  manageUsers:    [OWNER_USER],
})

// ─── Menu target type ─────────────────────────────────────────────────────────
interface MenuTarget {
  type:  'media' | 'folder'
  name:  string
  added: string
}

// ─── Helpers for permission display ──────────────────────────────────────────
function visibleLabel(vp: ViewPermission) {
  switch (vp) {
    case 'everyone': return 'Everyone in your account'
    case 'editors':  return 'Editors and owners'
    case 'specific': return 'Specific users'
    case 'private':  return 'Only you'
  }
}

function VisibleIcon({ vp }: { vp: ViewPermission }) {
  const sx = { fontSize: '14px !important' }
  switch (vp) {
    case 'everyone': return <VisibilityOutlinedIcon sx={{ ...sx, color: c.primary }} />
    case 'editors':  return <EditOutlinedIcon       sx={{ ...sx, color: c.warningMain }} />
    case 'specific': return <PeopleOutlinedIcon     sx={{ ...sx, color: c.warningMain }} />
    case 'private':  return <VisibilityOffOutlinedIcon sx={{ ...sx, color: c.successMain }} />
  }
}

// ─── Folder thumbnail ─────────────────────────────────────────────────────────
function FolderThumb({ isAi }: { isAi?: boolean }) {
  return (
    <Box sx={{
      width: '100%', paddingTop: '68%', position: 'relative',
      background: isAi
        ? 'linear-gradient(135deg, #9C27B0 0%, #5C35CC 100%)'
        : '#3F51B5',
      overflow: 'hidden',
    }}>
      <Box sx={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isAi
          ? <AutoAwesomeOutlinedIcon sx={{ color: '#fff', fontSize: 34, opacity: 0.9 }} />
          : <FolderRoundedIcon       sx={{ color: '#fff', fontSize: 38, opacity: 0.9 }} />
        }
      </Box>
    </Box>
  )
}

// ─── White icon button on hover overlay ──────────────────────────────────────
function HoverIconBtn({
  onClick, children,
}: {
  onClick:  (e: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
}) {
  return (
    <IconButton
      size="small"
      onClick={onClick}
      sx={{
        bgcolor: 'rgba(255,255,255,0.92)',
        color: c.secondary,
        boxShadow: '0px 0px 5px rgba(3,25,79,0.25)',
        p: '5px',
        borderRadius: '6px',
        '&:hover': { bgcolor: '#fff', boxShadow: '0px 0px 8px rgba(3,25,79,0.35)' },
      }}
    >
      {children}
    </IconButton>
  )
}

// ─── Permission section inside the three-dot menu ────────────────────────────
function PermissionSection({
  settings,
  onManageAccess,
}: {
  settings:       PermissionSettings
  onManageAccess: () => void
}) {
  const { viewPermission, viewUsers, manageUsers } = settings
  const firstManage = manageUsers[0] ?? OWNER_USER
  const showRightAvatar = viewPermission !== 'private'

  // Right-side avatar:
  // - everyone / editors → group icon
  // - specific → first viewUser or group icon
  // - private → hidden
  const firstViewUser: User | null =
    viewPermission === 'specific' && viewUsers.length > 0 ? viewUsers[0] : null

  const allAccountTooltip = (
    <Typography sx={{ fontSize: 12, color: '#fff', lineHeight: 1.5 }}>
      Everyone in your account can view
    </Typography>
  )

  const editorsTooltip = (
    <Typography sx={{ fontSize: 12, color: '#fff', lineHeight: 1.5 }}>
      All editors and owners can view
    </Typography>
  )

  return (
    <Box sx={{ px: 1, py: 0.75, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Visible row */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
        <Typography sx={{
          fontFamily: '"Inter", sans-serif', fontWeight: 500,
          fontSize: 14, color: c.textPrimary, flexShrink: 0,
        }}>
          Visible
        </Typography>
        <Button
          variant="text"
          size="small"
          startIcon={<VisibleIcon vp={viewPermission} />}
          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '13px !important' }} />}
          sx={{
            color: c.primary,
            fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 13,
            textTransform: 'none', p: '2px 4px', minWidth: 0,
          }}
        >
          {visibleLabel(viewPermission)}
        </Button>
      </Box>

      {/* Avatars row: [manage-access user] | [view indicator] */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* Left: first manage-access user */}
        <UserAvatarWithTooltip
          user={firstManage}
          role="Can manage access, delete, and rename."
          size={32}
        />

        {showRightAvatar && (
          <>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: '8px', borderColor: c.divider, height: 24, alignSelf: 'center' }}
            />

            {/* Right: view permission indicator */}
            {firstViewUser ? (
              /* Specific user */
              <UserAvatarWithTooltip
                user={firstViewUser}
                role="Can view"
                size={32}
              />
            ) : viewPermission === 'editors' ? (
              /* Editors group */
              <Tooltip
                title={editorsTooltip}
                placement="bottom"
                arrow
                componentsProps={{ tooltip: { sx: navyTooltipSx } }}
              >
                <Avatar
                  variant="rounded"
                  sx={{ width: 32, height: 32, bgcolor: c.warningMain, cursor: 'default' }}
                >
                  <EditOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
                </Avatar>
              </Tooltip>
            ) : (
              /* Everyone */
              <Tooltip
                title={allAccountTooltip}
                placement="bottom"
                arrow
                componentsProps={{ tooltip: { sx: navyTooltipSx } }}
              >
                <Avatar
                  variant="rounded"
                  sx={{ width: 32, height: 32, bgcolor: c.secondary, cursor: 'default' }}
                >
                  <PeopleAltOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
                </Avatar>
              </Tooltip>
            )}
          </>
        )}

        {/* Private: only the owner */}
        {!showRightAvatar && viewPermission === 'private' && (
          <>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: '8px', borderColor: c.divider, height: 24, alignSelf: 'center' }}
            />
            <Tooltip
              title={<Typography sx={{ fontSize: 12, color: '#fff' }}>Only you can view</Typography>}
              placement="bottom"
              arrow
              componentsProps={{ tooltip: { sx: navyTooltipSx } }}
            >
              <Avatar
                variant="rounded"
                sx={{ width: 32, height: 32, bgcolor: c.successMain, cursor: 'default' }}
              >
                <LockOutlinedIcon sx={{ fontSize: 16, color: '#fff' }} />
              </Avatar>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Manage access button */}
      <Button
        variant="outlined"
        size="medium"
        startIcon={<ManageAccountsOutlinedIcon sx={{ fontSize: '16px !important' }} />}
        onClick={onManageAccess}
        sx={{
          color: c.textPrimary,
          borderColor: c.grey300,
          fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
          textTransform: 'none', borderRadius: '8px',
          alignSelf: 'flex-start',
          '&:hover': { borderColor: c.primary },
        }}
      >
        Manage access
      </Button>
    </Box>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MediaLibraryPanel({
  open,
  onClose,
  folder,
  onOpenFolder,
  onCloseFolder,
}: {
  open:          boolean
  onClose:       () => void
  folder:        string | null
  onOpenFolder:  (name: string) => void
  onCloseFolder: () => void
}) {
  const [tab,        setTab]        = useState<0 | 1>(0)
  const [viewMode,   setViewMode]   = useState<'grid' | 'list'>('grid')
  const [searchVal,  setSearchVal]  = useState('')

  // Three-dot menu state
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null)
  const [editName,   setEditName]   = useState('')

  // Per-item permission settings
  const [permissions, setPermissions] = useState<Record<string, PermissionSettings>>({})

  // Manage access dialog
  const [manageOpen,  setManageOpen]  = useState(false)
  const [manageKey,   setManageKey]   = useState<string | null>(null)
  const [manageType,  setManageType]  = useState<'media' | 'folder'>('media')

  function getPerms(key: string): PermissionSettings {
    return permissions[key] ?? defaultPermissions()
  }

  function openMenu(
    e: React.MouseEvent<HTMLButtonElement>,
    type: 'media' | 'folder',
    name: string,
    added: string,
  ) {
    e.stopPropagation()
    setMenuAnchor(e.currentTarget)
    setMenuTarget({ type, name, added })
    setEditName(name)
  }

  function closeMenu() {
    setMenuAnchor(null)
    setMenuTarget(null)
  }

  function openManageAccess(key: string, type: 'media' | 'folder') {
    setManageKey(key)
    setManageType(type)
    setManageOpen(true)
    closeMenu()
  }

  function handleSavePermissions(s: PermissionSettings) {
    if (manageKey) {
      setPermissions(prev => ({ ...prev, [manageKey]: s }))
    }
  }

  return (
    <Box sx={{
      width:      open ? PANEL_WIDTH : 0,
      flexShrink: 0,
      overflow:   'hidden',
      transition: 'width 0.26s cubic-bezier(0.4,0,0.2,1)',
      bgcolor:    '#fff',
      borderRight: `1px solid ${c.divider}`,
      display:    'flex',
      height:     '100%',
    }}>
      {/* Fixed-width inner container */}
      <Box sx={{
        width:         PANEL_WIDTH,
        flexShrink:    0,
        height:        '100%',
        display:       'flex',
        flexDirection: 'column',
        overflow:      'hidden',
      }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pt: 1.5, pb: 1, flexShrink: 0 }}>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 20,
            color: c.textPrimary, flex: 1, lineHeight: 1.5,
          }}>
            Media
          </Typography>
          <IconButton size="small" sx={{ color: c.actionActive }}>
            <HelpOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* ── Upload / Generate / Record ──────────────────────────────────── */}
        <Box sx={{ px: 2, pb: 1.5, display: 'flex', gap: '8px', flexShrink: 0 }}>
          <Button
            variant="contained" size="small"
            startIcon={<FileUploadOutlinedIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              flex: 1, bgcolor: c.primary, color: '#fff',
              fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
              textTransform: 'none', borderRadius: '8px',
              '&:hover': { bgcolor: '#0047CC' },
            }}
          >Upload</Button>

          <Button
            variant="contained" size="small"
            startIcon={<AutoAwesomeOutlinedIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              flex: 1, background: GRADIENT_GENERATE, color: '#fff',
              fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
              textTransform: 'none', borderRadius: '8px',
              '&:hover': { opacity: 0.88, background: GRADIENT_GENERATE },
            }}
          >Generate</Button>

          <Box sx={{ flex: 1, position: 'relative' }}>
            <Button
              variant="outlined" size="small" fullWidth
              startIcon={
                <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: c.errorMain, flexShrink: 0 }} />
              }
              sx={{
                color: c.textPrimary, borderColor: c.grey300,
                fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
                textTransform: 'none', borderRadius: '8px',
              }}
            >Record</Button>
            <Box sx={{
              position: 'absolute', top: -5, right: -5,
              background: GRADIENT_GENERATE, borderRadius: '4px',
              px: '5px', pt: '1px', pb: '2px', pointerEvents: 'none',
            }}>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                fontSize: 10, color: '#fff', lineHeight: 1.5,
              }}>New</Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', borderBottom: `1px solid ${c.divider}`, px: 2, flexShrink: 0 }}>
          {['Your Media', 'Stock'].map((label, i) => (
            <Box
              key={label}
              onClick={() => setTab(i as 0 | 1)}
              sx={{
                flex: 1, py: '8px', textAlign: 'center', cursor: 'pointer',
                borderBottom: tab === i ? `2px solid ${c.secondary}` : '2px solid transparent',
                mb: '-1px',
              }}
            >
              <Typography sx={{
                fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
                color: tab === i ? c.secondary : c.secondaryFade,
              }}>{label}</Typography>
            </Box>
          ))}
          <Box sx={{ px: 2, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <ExtensionOutlinedIcon sx={{ fontSize: 16, color: c.actionActive }} />
          </Box>
        </Box>

        {/* ── Actions row ─────────────────────────────────────────────────── */}
        <Box sx={{
          px: 2, pt: 1.5, pb: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton size="small" sx={{
              border: `1px solid ${c.grey300}`, borderRadius: '8px',
              color: c.primary, p: '5px',
            }}>
              <CreateNewFolderOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Button
              variant="outlined" size="small"
              startIcon={<CheckBoxOutlineBlankIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                color: c.textPrimary, borderColor: c.grey300,
                fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
                textTransform: 'none', borderRadius: '8px',
              }}
            >Select</Button>
          </Box>

          <Box sx={{
            display: 'flex', alignItems: 'center',
            border: `1px solid ${c.grey300}`, borderRadius: '8px', p: '2px', gap: '2px',
          }}>
            {(['grid', 'list'] as const).map((mode, i) => (
              <Box
                key={mode}
                onClick={() => setViewMode(mode)}
                sx={{
                  p: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer',
                  bgcolor: viewMode === mode ? c.primarySel : 'transparent',
                  borderRadius: '6px', transition: 'background 0.15s',
                }}
              >
                {i === 0
                  ? <GridViewIcon sx={{ fontSize: 16, color: c.actionActive }} />
                  : <ViewListIcon sx={{ fontSize: 16, color: c.actionActive }} />
                }
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Search ──────────────────────────────────────────────────────── */}
        <Box sx={{ px: 2, pb: 1, flexShrink: 0 }}>
          <OutlinedInput
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Search folder and media"
            size="small" fullWidth
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: c.textSecondary }} />
              </InputAdornment>
            }
            sx={{
              bgcolor: '#fff', fontSize: 14,
              fontFamily: '"Open Sans", sans-serif', borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 },
            }}
          />
        </Box>

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <Box sx={{
          px: 2, pb: 1,
          display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0,
          overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' },
        }}>
          <FilterListIcon sx={{ fontSize: 16, color: c.textSecondary, flexShrink: 0 }} />
          {['Type', 'Source', 'Duration', 'Orientation'].map(f => (
            <Button
              key={f} size="small"
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '13px !important' }} />}
              sx={{
                color: c.textSecondary, border: `1px solid ${c.grey300}`,
                fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 13,
                textTransform: 'none', borderRadius: '8px', py: '2px', px: '8px',
                minWidth: 'auto', flexShrink: 0,
              }}
            >{f}</Button>
          ))}
        </Box>

        {/* ── Scrollable content ───────────────────────────────────────────── */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2 }}>

          {/* Folder strip */}
          {folder && (
            <Box sx={{ mb: 1.5, pt: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <IconButton size="small" onClick={onCloseFolder} sx={{ color: c.actionActive, mr: '4px', p: '4px' }}>
                  <ArrowBackIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Typography sx={{
                  fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
                  fontSize: 14, color: c.textPrimary, lineHeight: 1.5,
                }}>
                  {folder}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: c.divider, mb: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{
                  fontFamily: '"Inter", sans-serif', fontWeight: 500,
                  fontSize: 14, color: c.textPrimary, mr: '4px',
                }}>
                  Visible to:
                </Typography>
                <Button
                  variant="text" size="small"
                  startIcon={<VisibilityOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                  endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '13px !important' }} />}
                  sx={{
                    color: c.primary,
                    fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
                    textTransform: 'none', p: '2px 4px', minWidth: 0,
                  }}
                >
                  All users in SundaySky
                </Button>
              </Box>
            </Box>
          )}

          {/* Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', pb: 2 }}>

            {/* Folder items */}
            {!folder && MEDIA_FOLDERS.map(f => (
              <Box
                key={f.name}
                onClick={() => onOpenFolder(f.name)}
                sx={{
                  display: 'flex', flexDirection: 'column',
                  cursor: 'pointer', borderRadius: '8px', overflow: 'visible',
                  border: `1px solid ${c.grey300}`,
                  transition: 'box-shadow 0.18s', position: 'relative',
                  '&:hover': { boxShadow: '0 2px 10px rgba(3,25,79,0.14)' },
                  '&:hover .hover-overlay': { opacity: 1 },
                  '&:hover .hover-actions': { opacity: 1 },
                }}
              >
                <Box sx={{ borderRadius: '8px 8px 0 0', overflow: 'hidden', position: 'relative' }}>
                  <FolderThumb isAi={f.isAi} />
                  <Box className="hover-overlay" sx={{
                    position: 'absolute', inset: 0,
                    bgcolor: 'rgba(3,25,79,0.38)', opacity: 0,
                    transition: 'opacity 0.18s', pointerEvents: 'none',
                    borderRadius: '8px 8px 0 0',
                  }} />
                </Box>
                <Box className="hover-actions" sx={{
                  position: 'absolute', top: 6, right: 6,
                  display: 'flex', gap: '4px',
                  opacity: 0, transition: 'opacity 0.18s', zIndex: 2,
                }}>
                  <HoverIconBtn onClick={e => openMenu(e, 'folder', f.name, 'Dec 10, 2025 9:00 AM')}>
                    <MoreVertIcon sx={{ fontSize: 14 }} />
                  </HoverIconBtn>
                </Box>
                <Box sx={{ px: 1, py: '6px', overflow: 'hidden' }}>
                  <Typography sx={{
                    fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                    fontSize: 12, color: c.textPrimary, lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {f.name}
                  </Typography>
                </Box>
              </Box>
            ))}

            {/* Media items */}
            {MEDIA_ITEMS.map(item => (
              <Box
                key={item.id}
                sx={{
                  position: 'relative', borderRadius: '8px', overflow: 'visible',
                  cursor: 'pointer', border: `1px solid ${c.grey300}`,
                  transition: 'box-shadow 0.18s',
                  '&:hover': { boxShadow: '0 2px 10px rgba(3,25,79,0.14)' },
                  '&:hover .hover-overlay': { opacity: 1 },
                  '&:hover .hover-actions': { opacity: 1 },
                }}
              >
                <Box sx={{ borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                  <Box sx={{ width: '100%', paddingTop: '68%', bgcolor: item.bg, position: 'relative' }}>
                    <Box sx={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <PermMediaOutlinedIcon sx={{ color: 'rgba(255,255,255,0.22)', fontSize: 26 }} />
                    </Box>
                  </Box>
                  <Box className="hover-overlay" sx={{
                    position: 'absolute', inset: 0,
                    bgcolor: 'rgba(3,25,79,0.38)', opacity: 0,
                    transition: 'opacity 0.18s', pointerEvents: 'none',
                    borderRadius: '8px',
                  }} />
                  <Box sx={{
                    position: 'absolute', bottom: 4, left: 4,
                    bgcolor: 'rgba(0,0,0,0.62)', borderRadius: '4px', px: '4px', py: '1px',
                    pointerEvents: 'none',
                  }}>
                    <Typography sx={{
                      fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                      fontSize: 11, color: '#fff', lineHeight: 1.4,
                    }}>
                      {item.duration}
                    </Typography>
                  </Box>
                </Box>

                <Box className="hover-actions" sx={{
                  position: 'absolute', top: 6, right: 6,
                  display: 'flex', gap: '4px',
                  opacity: 0, transition: 'opacity 0.18s', zIndex: 2,
                }}>
                  <HoverIconBtn onClick={e => e.stopPropagation()}>
                    <OpenInFullIcon sx={{ fontSize: 14 }} />
                  </HoverIconBtn>
                  <HoverIconBtn onClick={e => openMenu(e, 'media', item.name, item.added)}>
                    <MoreVertIcon sx={{ fontSize: 14 }} />
                  </HoverIconBtn>
                </Box>

                <Box sx={{ px: 1, py: '6px' }}>
                  <Typography sx={{
                    fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                    fontSize: 12, color: c.textPrimary, lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.name}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Three-dot menu ─────────────────────────────────────────────────── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        disableAutoFocusItem
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top',    horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              boxShadow: '0px 0px 5px rgba(3,25,79,0.25)',
              borderRadius: '8px', p: '8px', minWidth: 260, mt: '4px',
            },
          },
        }}
      >
        {/* Inline editable name */}
        <Box sx={{ px: 1, pb: '4px' }} onKeyDown={e => e.stopPropagation()}>
          <InputBase
            value={editName}
            onChange={e => setEditName(e.target.value)}
            fullWidth
            sx={{
              fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
              fontSize: 14, color: c.textPrimary,
              '& .MuiInputBase-input': {
                p: '4px 6px', borderRadius: '6px',
                border: '1.5px solid transparent', transition: 'border 0.15s',
                '&:hover': { border: `1.5px solid ${c.grey300}` },
                '&:focus': { border: `1.5px solid ${c.primary}` },
              },
            }}
          />
        </Box>

        {/* Added date */}
        <Box sx={{ px: 1, pb: '8px' }}>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
            fontSize: 12, color: c.textSecondary, lineHeight: 1.5,
          }}>
            Added: {menuTarget?.added ?? ''}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: c.divider, mx: -1 }} />

        {/* Permission section */}
        <PermissionSection
          settings={getPerms(menuTarget?.name ?? '')}
          onManageAccess={() =>
            menuTarget && openManageAccess(menuTarget.name, menuTarget.type)
          }
        />

        <Divider sx={{ borderColor: c.divider, mx: -1 }} />

        {/* Action items */}
        <MenuItem dense onClick={closeMenu} sx={{
          borderRadius: '6px', mt: '4px',
          fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: c.textPrimary,
        }}>
          Details
        </MenuItem>
        <MenuItem dense onClick={closeMenu} sx={{
          borderRadius: '6px',
          fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: c.textPrimary,
        }}>
          Move to folder
        </MenuItem>
        <MenuItem dense onClick={closeMenu} sx={{
          borderRadius: '6px',
          fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: c.errorMain,
          '&:hover': { bgcolor: 'rgba(230,40,67,0.06)' },
        }}>
          Delete
        </MenuItem>
      </Menu>

      {/* ── Manage access dialog ─────────────────────────────────────────────── */}
      <ManageAccessDialog
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        itemType={manageType}
        initialSettings={manageKey ? getPerms(manageKey) : undefined}
        onSave={handleSavePermissions}
      />
    </Box>
  )
}
