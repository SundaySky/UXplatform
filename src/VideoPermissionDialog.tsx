import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton,
  Alert, Divider, Menu, MenuItem,
  ToggleButton, ToggleButtonGroup, Checkbox, Tooltip,
} from '@mui/material'
import CloseIcon             from '@mui/icons-material/Close'
import HelpOutlineIcon       from '@mui/icons-material/HelpOutline'
import GroupsIcon            from '@mui/icons-material/Groups'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CheckIcon             from '@mui/icons-material/Check'
import InfoOutlinedIcon      from '@mui/icons-material/InfoOutlined'
import LockOutlinedIcon      from '@mui/icons-material/LockOutlined'
import SettingsOutlinedIcon  from '@mui/icons-material/SettingsOutlined'
import Avatar                from '@mui/material/Avatar'

import {
  type PermissionTab,
  type EveryoneRole,
  type UserRole,
  type PermissionUser,
  type User,
  OWNER_USER,
} from './ManageAccessDialog'

// ─── Types ────────────────────────────────────────────────────────────────────
export type { PermissionTab, EveryoneRole, UserRole, PermissionUser }

export interface VideoPermissionSettings {
  tab:          PermissionTab
  everyoneRole: EveryoneRole
  users:        PermissionUser[]
  ownerUsers:   User[]
  noDuplicate:  boolean
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
const c = {
  primary:       '#0053E5',
  textPrimary:   'rgba(0,0,0,0.87)',
  textSecondary: 'rgba(60,60,72,0.8)',
  divider:       'rgba(0,83,229,0.12)',
  grey300:       '#CFD6EA',
  errorMain:     '#E62843',
  successMain:   '#118747',
}

const navyTipSx = {
  bgcolor: '#03194F',
  borderRadius: '8px',
  px: 1.5, py: 1,
  maxWidth: 240,
  '& .MuiTooltip-arrow': { color: '#03194F' },
}

// ─── VideoAccessBar ───────────────────────────────────────────────────────────
export function VideoAccessBar({
  settings,
  onManageAccess,
  onChangePermission,
}: {
  settings?:           VideoPermissionSettings
  onManageAccess:      () => void
  onChangePermission?: () => void
}) {
  const s = settings ?? {
    tab:          'teams' as const,
    everyoneRole: 'viewer' as const,
    users:        [] as PermissionUser[],
    ownerUsers:   [OWNER_USER],
    noDuplicate:  false,
  }
  const { tab, everyoneRole, users, ownerUsers } = s

  const permLabel    = tab === 'private' ? 'Only me' : 'Teams and people'
  const PermIconComp = tab === 'private' ? LockOutlinedIcon : GroupsIcon
  const permColor    = tab === 'private' ? c.successMain : c.primary

  const showEveryone = tab === 'teams' && everyoneRole !== 'restricted'
  const rightUsers   = tab === 'teams' && everyoneRole === 'restricted' ? users : []

  const UserChip = ({ bg, initials, tip }: { bg: string; initials: string; tip: React.ReactNode }) => (
    <Tooltip title={tip} placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
      <Box sx={{ width: 32, height: 32, borderRadius: '6px', bgcolor: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
        <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 12, color: '#fff', lineHeight: 1 }}>
          {initials}
        </Typography>
      </Box>
    </Tooltip>
  )

  const TipContent = ({ name, desc }: { name: string; desc: string }) => (
    <Box>
      <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#fff', lineHeight: 1.4 }}>{name}</Typography>
      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{desc}</Typography>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Visible [icon] [label] ▾ */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 13, color: c.textPrimary }}>
          Visible
        </Typography>
        <Box
          onClick={onChangePermission}
          sx={{
            display: 'flex', alignItems: 'center', gap: '4px',
            cursor: onChangePermission ? 'pointer' : 'default',
            '&:hover': onChangePermission ? { opacity: 0.75 } : {},
          }}
        >
          <PermIconComp sx={{ fontSize: 15, color: permColor }} />
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 13, color: c.textPrimary }}>
            {permLabel}
          </Typography>
          {onChangePermission && <KeyboardArrowDownIcon sx={{ fontSize: 14, color: c.textPrimary }} />}
        </Box>
      </Box>

      {/* Avatar row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {ownerUsers.map(owner => (
          <UserChip
            key={owner.id}
            bg={owner.color}
            initials={owner.initials}
            tip={<TipContent name={`${owner.name}${owner.id === OWNER_USER.id ? ' (You)' : ''}`} desc="Can manage access, delete, and rename." />}
          />
        ))}

        {(showEveryone || rightUsers.length > 0) && (
          <Box sx={{ width: '1px', height: 24, bgcolor: c.grey300, mx: '2px', flexShrink: 0 }} />
        )}

        {showEveryone && (
          <Tooltip
            title={<Typography sx={{ fontSize: 12, color: '#fff', lineHeight: 1.4 }}>Everyone in your account can {everyoneRole === 'editor' ? 'edit' : 'view'}</Typography>}
            placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}
          >
            <Box sx={{ width: 32, height: 32, borderRadius: '6px', bgcolor: 'rgba(0,83,229,0.10)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
              <GroupsIcon sx={{ fontSize: 18, color: c.primary }} />
            </Box>
          </Tooltip>
        )}

        {rightUsers.map((pu, i) => (
          <UserChip
            key={pu.user.id + i}
            bg={pu.user.color}
            initials={pu.user.initials}
            tip={<TipContent name={pu.user.name} desc={pu.role === 'editor' ? 'Can edit the video' : 'Can view the video'} />}
          />
        ))}
      </Box>

      {/* Manage access button */}
      <Button
        variant="outlined"
        size="small"
        fullWidth
        startIcon={<SettingsOutlinedIcon sx={{ fontSize: 15 }} />}
        onClick={onManageAccess}
        sx={{
          borderRadius: '8px',
          borderColor: c.grey300,
          color: c.textPrimary,
          fontFamily: '"Open Sans", sans-serif',
          fontSize: 13,
          fontWeight: 400,
          textTransform: 'none',
          py: '6px',
          '&:hover': { borderColor: c.primary, bgcolor: 'rgba(0,83,229,0.04)' },
        }}
      >
        Manage access
      </Button>
    </Box>
  )
}

// ─── Internal UI helpers ───────────────────────────────────────────────────────
function RoleButton({ label, onClick }: { label: string; onClick: (e: React.MouseEvent<HTMLElement>) => void }) {
  return (
    <Button
      size="small"
      endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 14, ml: '-6px' }} />}
      onClick={e => { e.stopPropagation(); onClick(e) }}
      sx={{
        fontFamily: '"Open Sans", sans-serif',
        fontSize: 12, fontWeight: 500,
        color: c.textPrimary,
        textTransform: 'none',
        bgcolor: 'rgba(0,0,0,0.06)',
        borderRadius: '20px',
        px: '10px', py: '4px',
        minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0,
        '&:hover': { bgcolor: 'rgba(0,0,0,0.10)' },
      }}
    >
      {label}
    </Button>
  )
}

function PersonRow({
  avatar, name, email, roleLabel, onRoleClick,
}: {
  avatar:      React.ReactNode
  name:        string
  email:       string
  roleLabel:   string
  onRoleClick: (e: React.MouseEvent<HTMLElement>) => void
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '16px', py: '10px' }}>
      {avatar}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, fontWeight: 500, color: c.textPrimary, lineHeight: 1.3 }}>
          {name}
        </Typography>
        <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 12, color: c.textSecondary, lineHeight: 1.3 }}>
          {email}
        </Typography>
      </Box>
      <RoleButton label={roleLabel} onClick={onRoleClick} />
    </Box>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────
export default function VideoPermissionDialog({
  open,
  onClose,
  onSave,
  initialSettings,
}: {
  open:             boolean
  onClose:          () => void
  onSave:           (s: VideoPermissionSettings) => void
  initialSettings?: VideoPermissionSettings
}) {
  const dflt: VideoPermissionSettings = {
    tab: 'teams', everyoneRole: 'viewer', users: [], ownerUsers: [OWNER_USER], noDuplicate: false,
  }

  const [tab,          setTab]          = useState<PermissionTab>(initialSettings?.tab ?? 'teams')
  const [everyoneRole, setEveryoneRole] = useState<EveryoneRole>(initialSettings?.everyoneRole ?? 'viewer')
  const [users,        setUsers]        = useState<PermissionUser[]>(initialSettings?.users ?? [])
  const [ownerUsers,   setOwnerUsers]   = useState<User[]>(initialSettings?.ownerUsers ?? [OWNER_USER])
  const [noDuplicate,  setNoDuplicate]  = useState(initialSettings?.noDuplicate ?? false)
  const [menuAnchor,   setMenuAnchor]   = useState<null | HTMLElement>(null)
  const [menuTarget,   setMenuTarget]   = useState<'owner' | 'everyone' | string | null>(null)
  const [showDiscard,  setShowDiscard]  = useState(false)

  useEffect(() => {
    if (open) {
      const s = initialSettings ?? dflt
      setTab(s.tab)
      setEveryoneRole(s.everyoneRole)
      setUsers(s.users)
      setOwnerUsers(s.ownerUsers.length ? s.ownerUsers : [OWNER_USER])
      setNoDuplicate(s.noDuplicate)
      setMenuAnchor(null)
      setMenuTarget(null)
      setShowDiscard(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function sameIds(a: User[], b: User[]) {
    if (a.length !== b.length) return false
    const bs = new Set(b.map(u => u.id))
    return a.every(u => bs.has(u.id))
  }
  function sameUsers(a: PermissionUser[], b: PermissionUser[]) {
    if (a.length !== b.length) return false
    return a.every((pu, i) => pu.user.id === b[i].user.id && pu.role === b[i].role)
  }
  const initS = initialSettings ?? dflt
  const isDirty =
    tab !== initS.tab ||
    everyoneRole !== initS.everyoneRole ||
    noDuplicate !== initS.noDuplicate ||
    !sameUsers(users, initS.users) ||
    !sameIds(ownerUsers, initS.ownerUsers)

  function handleClose() { if (isDirty) setShowDiscard(true); else onClose() }
  function handleSave() { onSave({ tab, everyoneRole, users, ownerUsers, noDuplicate }) }

  function openMenuFn(e: React.MouseEvent<HTMLElement>, target: 'owner' | 'everyone' | string) {
    setMenuAnchor(e.currentTarget); setMenuTarget(target)
  }
  function closeMenuFn() { setMenuAnchor(null); setMenuTarget(null) }

  function changeUserRole(userId: string, role: UserRole) {
    setUsers(prev => prev.map(pu => pu.user.id === userId ? { ...pu, role } : pu))
  }
  function removeUser(userId: string) {
    setUsers(prev => prev.filter(pu => pu.user.id !== userId))
  }

  const menuUser = (menuTarget && menuTarget !== 'owner' && menuTarget !== 'everyone')
    ? (users.find(pu => pu.user.id === menuTarget) ?? null)
    : null

  const menuItemSx = { gap: 1.5, py: 0.75, borderRadius: '6px' }
  const menuTextSx = { fontFamily: '"Open Sans"', fontSize: 14, color: c.textPrimary }
  const menuErrSx  = { fontFamily: '"Open Sans"', fontSize: 14, color: c.errorMain }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{ sx: { width: 560, maxWidth: '98vw', borderRadius: '12px', boxShadow: '0px 0px 10px rgba(3,25,79,0.25)' } }}
      >
        <DialogTitle sx={{ p: '20px 16px 16px 28px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 20, color: c.textPrimary, lineHeight: 1.5, flex: 1 }}>
              Manage access
            </Typography>
            <IconButton size="medium" sx={{ color: 'rgba(0,0,0,0.54)' }}>
              <HelpOutlineIcon />
            </IconButton>
            <IconButton size="medium" onClick={handleClose} sx={{ color: 'rgba(0,0,0,0.54)' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider sx={{ borderColor: c.divider }} />

        <DialogContent sx={{ p: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Tab selector */}
          <ToggleButtonGroup
            value={tab}
            exclusive
            onChange={(_, v) => { if (v !== null) setTab(v as PermissionTab) }}
            sx={{
              bgcolor: 'rgba(0,0,0,0.06)', borderRadius: '10px', p: '3px', alignSelf: 'flex-start',
              '& .MuiToggleButtonGroup-grouped': { border: 'none !important', borderRadius: '8px !important', m: 0 },
            }}
          >
            {(['teams', 'private'] as const).map(v => (
              <ToggleButton key={v} value={v} sx={{
                fontFamily: '"Open Sans", sans-serif', fontSize: 13, fontWeight: 500,
                textTransform: 'none', px: 2, py: 0.75, color: c.textSecondary,
                '&.Mui-selected': {
                  bgcolor: '#fff', color: c.textPrimary, fontWeight: 600,
                  boxShadow: '0px 1px 4px rgba(0,0,0,0.12)', '&:hover': { bgcolor: '#fff' },
                },
              }}>
                {v === 'teams' ? 'Teams and people' : 'Only me'}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Who can access */}
          <Box>
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 14, color: c.textPrimary, mb: '12px', display: 'block' }}>
              Who can access
            </Typography>

            <Box sx={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
              {/* Owner row */}
              <PersonRow
                avatar={
                  <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: OWNER_USER.color, fontSize: 12, fontFamily: '"Inter"', fontWeight: 600, flexShrink: 0 }}>
                    {OWNER_USER.initials}
                  </Avatar>
                }
                name={`${OWNER_USER.name} (You)`}
                email={OWNER_USER.email}
                roleLabel="Video owner"
                onRoleClick={e => openMenuFn(e, 'owner')}
              />

              {/* Added users */}
              {users.map(pu => (
                <Box key={pu.user.id}>
                  <Divider />
                  <PersonRow
                    avatar={
                      <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: pu.user.color, fontSize: 12, fontFamily: '"Inter"', fontWeight: 600, flexShrink: 0 }}>
                        {pu.user.initials}
                      </Avatar>
                    }
                    name={pu.user.name}
                    email={pu.user.email}
                    roleLabel={pu.role === 'editor' ? 'Editor' : 'Viewer'}
                    onRoleClick={e => openMenuFn(e, pu.user.id)}
                  />
                </Box>
              ))}

              {/* Everyone row — teams tab only */}
              {tab === 'teams' && (
                <>
                  <Divider />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '16px', py: '10px' }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(0,83,229,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <GroupsIcon sx={{ fontSize: 20, color: c.primary }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, fontWeight: 500, color: c.textPrimary }}>
                        Everyone in your account
                      </Typography>
                    </Box>
                    <RoleButton
                      label={everyoneRole === 'editor' ? 'Editor' : everyoneRole === 'viewer' ? 'Viewer' : 'Restricted'}
                      onClick={e => openMenuFn(e, 'everyone')}
                    />
                  </Box>
                </>
              )}
            </Box>

            {/* Only me alert */}
            {tab === 'private' && (
              <Alert severity="success" icon={<InfoOutlinedIcon fontSize="small" />}
                sx={{ mt: 1.5, borderRadius: '8px', fontFamily: '"Open Sans", sans-serif', fontSize: 13, bgcolor: 'rgba(17,135,71,0.06)', color: c.textPrimary, '& .MuiAlert-icon': { color: c.successMain } }}
              >
                Only you can see this video.
              </Alert>
            )}

            {/* Add user */}
            {tab === 'teams' && (
              <Button
                startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{ mt: '10px', fontFamily: '"Open Sans", sans-serif', fontSize: 13, fontWeight: 600, color: c.primary, textTransform: 'none', p: '4px 8px', '&:hover': { bgcolor: 'rgba(0,83,229,0.06)' } }}
              >
                Add user
              </Button>
            )}
          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: c.divider }} />
        <DialogActions sx={{ px: '28px', py: '16px', gap: '8px' }}>
          <Button variant="text" size="large" onClick={handleClose}
            sx={{ color: c.primary, fontFamily: '"Open Sans", sans-serif', textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button variant="contained" size="large" onClick={handleSave}
            sx={{ bgcolor: c.primary, fontFamily: '"Open Sans", sans-serif', textTransform: 'none', fontWeight: 600, borderRadius: '8px', boxShadow: 'none', '&:hover': { bgcolor: '#0047CC', boxShadow: 'none' } }}>
            Save
          </Button>
        </DialogActions>

        {/* Role dropdown menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenuFn}
          PaperProps={{ sx: { borderRadius: '10px', boxShadow: '0px 4px 20px rgba(3,25,79,0.18)', minWidth: 230, p: '4px' } }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          {/* Owner menu */}
          {menuTarget === 'owner' && [
            <MenuItem key="ol" disableRipple sx={{ ...menuItemSx, cursor: 'default', '&:hover': { bgcolor: 'transparent' } }}>
              <CheckIcon sx={{ fontSize: 16, color: c.primary }} />
              <Typography sx={menuTextSx}>Video owner</Typography>
            </MenuItem>,
            <MenuItem key="ms" onClick={closeMenuFn} sx={menuItemSx}>
              <Box sx={{ width: 16 }} /><Typography sx={menuTextSx}>Make sole owner</Typography>
            </MenuItem>,
            <Divider key="d1" sx={{ my: '4px !important' }} />,
            <MenuItem key="ro" disabled={ownerUsers.length <= 1} onClick={closeMenuFn} sx={menuItemSx}>
              <Box sx={{ width: 16 }} /><Typography sx={menuErrSx}>Remove ownership</Typography>
            </MenuItem>,
          ]}

          {/* Added user menu */}
          {menuUser && [
            <MenuItem key="ed" onClick={() => { changeUserRole(menuTarget as string, 'editor'); closeMenuFn() }} sx={menuItemSx}>
              {menuUser.role === 'editor' ? <CheckIcon sx={{ fontSize: 16, color: c.primary }} /> : <Box sx={{ width: 16 }} />}
              <Typography sx={menuTextSx}>Editor</Typography>
            </MenuItem>,
            <MenuItem key="vi" onClick={() => { changeUserRole(menuTarget as string, 'viewer'); closeMenuFn() }} sx={menuItemSx}>
              {menuUser.role === 'viewer' ? <CheckIcon sx={{ fontSize: 16, color: c.primary }} /> : <Box sx={{ width: 16 }} />}
              <Typography sx={menuTextSx}>Viewer</Typography>
            </MenuItem>,
            <MenuItem key="dup" onClick={() => setNoDuplicate(prev => !prev)} sx={{ ...menuItemSx, gap: 1 }}>
              <Checkbox checked={!noDuplicate} size="small" disableRipple sx={{ p: 0, '&.Mui-checked': { color: c.primary } }} />
              <Typography sx={menuTextSx}>Allow to duplicate videos</Typography>
            </MenuItem>,
            <Divider key="d1" sx={{ my: '4px !important' }} />,
            <MenuItem key="to" onClick={closeMenuFn} sx={menuItemSx}>
              <Box sx={{ width: 16 }} /><Typography sx={menuTextSx}>Transfer ownership</Typography>
            </MenuItem>,
            <Divider key="d2" sx={{ my: '4px !important' }} />,
            <MenuItem key="rm" onClick={() => { removeUser(menuTarget as string); closeMenuFn() }} sx={menuItemSx}>
              <Box sx={{ width: 16 }} /><Typography sx={menuErrSx}>Remove</Typography>
            </MenuItem>,
          ]}

          {/* Everyone menu */}
          {menuTarget === 'everyone' && [
            <MenuItem key="ed" onClick={() => { setEveryoneRole('editor'); closeMenuFn() }} sx={menuItemSx}>
              {everyoneRole === 'editor' ? <CheckIcon sx={{ fontSize: 16, color: c.primary }} /> : <Box sx={{ width: 16 }} />}
              <Typography sx={menuTextSx}>Editor</Typography>
            </MenuItem>,
            <MenuItem key="vi" onClick={() => { setEveryoneRole('viewer'); closeMenuFn() }} sx={menuItemSx}>
              {everyoneRole === 'viewer' ? <CheckIcon sx={{ fontSize: 16, color: c.primary }} /> : <Box sx={{ width: 16 }} />}
              <Typography sx={menuTextSx}>Viewer</Typography>
            </MenuItem>,
            <MenuItem key="dup" onClick={() => setNoDuplicate(prev => !prev)} sx={{ ...menuItemSx, gap: 1 }}>
              <Checkbox checked={!noDuplicate} size="small" disableRipple sx={{ p: 0, '&.Mui-checked': { color: c.primary } }} />
              <Typography sx={menuTextSx}>Allow to duplicate videos</Typography>
            </MenuItem>,
            <Divider key="d1" sx={{ my: '4px !important' }} />,
            <MenuItem key="re" onClick={() => { setEveryoneRole('restricted'); closeMenuFn() }} sx={menuItemSx}>
              {everyoneRole === 'restricted' ? <CheckIcon sx={{ fontSize: 16, color: c.primary }} /> : <Box sx={{ width: 16 }} />}
              <Typography sx={menuTextSx}>Restricted</Typography>
            </MenuItem>,
          ]}
        </Menu>
      </Dialog>

      {/* Discard confirmation */}
      <Dialog open={showDiscard} onClose={() => setShowDiscard(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0px 0px 10px rgba(3,25,79,0.25)' } }}
      >
        <DialogTitle sx={{ p: '20px 20px 12px' }}>
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 18, color: c.textPrimary }}>
            Discard changes?
          </Typography>
        </DialogTitle>
        <Divider sx={{ borderColor: c.divider }} />
        <DialogContent sx={{ p: '16px 20px' }}>
          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: c.textSecondary, lineHeight: 1.6 }}>
            All your changes will be lost and the permissions will remain unchanged.
          </Typography>
        </DialogContent>
        <Divider sx={{ borderColor: c.divider }} />
        <DialogActions sx={{ px: '20px', py: '12px', gap: '8px' }}>
          <Button variant="text" onClick={() => setShowDiscard(false)}
            sx={{ color: c.primary, textTransform: 'none', fontFamily: '"Open Sans", sans-serif', fontWeight: 600 }}>
            Keep editing
          </Button>
          <Button variant="contained" onClick={() => { setShowDiscard(false); onClose() }}
            sx={{ bgcolor: c.errorMain, textTransform: 'none', fontFamily: '"Open Sans", sans-serif', fontWeight: 600, borderRadius: '8px', boxShadow: 'none', '&:hover': { bgcolor: '#C41E34', boxShadow: 'none' } }}>
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
