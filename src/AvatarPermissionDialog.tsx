import { useState, useEffect } from 'react'
import {
  Box, Typography, IconButton, Button, Dialog,
  DialogTitle, DialogContent, DialogActions,
  Avatar, Tooltip, Alert, Divider, Menu, MenuItem,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import CloseIcon              from '@mui/icons-material/Close'
import HelpOutlineIcon        from '@mui/icons-material/HelpOutline'
import GroupsIcon             from '@mui/icons-material/Groups'
import PersonAddOutlinedIcon  from '@mui/icons-material/PersonAddOutlined'
import KeyboardArrowDownIcon  from '@mui/icons-material/KeyboardArrowDown'
import CheckIcon              from '@mui/icons-material/Check'
import InfoOutlinedIcon       from '@mui/icons-material/InfoOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DoNotDisturbOnOutlinedIcon from '@mui/icons-material/DoNotDisturbOnOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

import {
  type User,
  type PermissionTab,
  type PermissionUser,
  type UserRole,
  OWNER_USER,
} from './ManageAccessDialog'

// ─── Types (kept for AvatarLibraryPanel compatibility) ────────────────────────
export type AvatarUsagePermission = 'everyone' | 'specific' | 'private'

export interface AccessRequest {
  id:       string
  initials: string
  color:    string
  name:     string
  email:    string
}

export interface AvatarPermissionSettings {
  usagePermission: AvatarUsagePermission
  specificUsers:   User[]
  approverUsers:   User[]
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const c = {
  primary:       '#0053E5',
  textPrimary:   'rgba(0,0,0,0.87)',
  textSecondary: 'rgba(60,60,72,0.6)',
  divider:       'rgba(0,83,229,0.12)',
  grey300:       '#CFD6EA',
  errorMain:     '#E62843',
  successMain:   '#118747',
}

const navyTooltipSx = {
  bgcolor: '#03194F', borderRadius: '8px', px: 1.5, py: 1,
  '& .MuiTooltip-arrow': { color: '#03194F' },
}

// ─── Internal helpers ─────────────────────────────────────────────────────────
function toTab(perm: AvatarUsagePermission): PermissionTab {
  return perm === 'private' ? 'private' : 'teams'
}
function toEveryoneRestricted(perm: AvatarUsagePermission): boolean {
  return perm === 'specific'
}
function toExternalPerm(tab: PermissionTab, restricted: boolean): AvatarUsagePermission {
  if (tab === 'private') return 'private'
  return restricted ? 'specific' : 'everyone'
}

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

// ─── AvatarPermissionDialog ───────────────────────────────────────────────────
export default function AvatarPermissionDialog({
  open,
  onClose,
  avatarName: _avatarName,
  initialSettings,
  initialRequests = [],
  onSave,
}: {
  open:             boolean
  onClose:          () => void
  avatarName:       string
  initialSettings?: AvatarPermissionSettings
  initialRequests?: AccessRequest[]
  onSave:           (s: AvatarPermissionSettings, remaining: AccessRequest[]) => void
}) {
  const initPerm = initialSettings?.usagePermission ?? 'everyone'

  const [tab,        setTab]        = useState<PermissionTab>(toTab(initPerm))
  const [restricted, setRestricted] = useState<boolean>(toEveryoneRestricted(initPerm))
  const [users,      setUsers]      = useState<PermissionUser[]>(
    (initialSettings?.specificUsers ?? []).map(u => ({ user: u, role: 'viewer' as UserRole }))
  )
  const [ownerUsers, setOwnerUsers] = useState<User[]>(initialSettings?.approverUsers ?? [OWNER_USER])
  const [requests,   setRequests]   = useState<AccessRequest[]>(initialRequests)
  const [showDiscard,    setShowDiscard]    = useState(false)
  const [showDenyAll,    setShowDenyAll]    = useState(false)
  const [menuAnchor,     setMenuAnchor]     = useState<null | HTMLElement>(null)
  const [menuTarget,     setMenuTarget]     = useState<'owner' | 'everyone' | string | null>(null)

  useEffect(() => {
    if (open) {
      const perm = initialSettings?.usagePermission ?? 'everyone'
      setTab(toTab(perm))
      setRestricted(toEveryoneRestricted(perm))
      setUsers((initialSettings?.specificUsers ?? []).map(u => ({ user: u, role: 'viewer' as UserRole })))
      setOwnerUsers(initialSettings?.approverUsers ?? [OWNER_USER])
      setRequests(initialRequests)
      setMenuAnchor(null)
      setMenuTarget(null)
      setShowDiscard(false)
      setShowDenyAll(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function sameIds(a: User[], b: User[]) {
    if (a.length !== b.length) return false
    const bs = new Set(b.map(u => u.id))
    return a.every(u => bs.has(u.id))
  }
  const externalPerm = toExternalPerm(tab, restricted)
  const initSp = initialSettings?.specificUsers ?? []
  const initAp = initialSettings?.approverUsers ?? [OWNER_USER]
  const isDirty =
    externalPerm !== initPerm ||
    !sameIds(users.map(pu => pu.user), initSp) ||
    !sameIds(ownerUsers, initAp)

  function handleClose() { if (isDirty) { setShowDiscard(true); return } onClose() }
  function handleSave() {
    onSave({
      usagePermission: externalPerm,
      specificUsers:   users.map(pu => pu.user),
      approverUsers:   ownerUsers,
    }, requests)
  }

  function openMenuFn(e: React.MouseEvent<HTMLElement>, target: 'owner' | 'everyone' | string) {
    setMenuAnchor(e.currentTarget); setMenuTarget(target)
  }
  function closeMenuFn() { setMenuAnchor(null); setMenuTarget(null) }

  function removeUser(userId: string) {
    setUsers(prev => prev.filter(pu => pu.user.id !== userId))
  }

  function reqToUser(req: AccessRequest): User {
    return { id: req.id, name: req.name, initials: req.initials, color: req.color, email: req.email }
  }
  function handleApprove(req: AccessRequest) {
    const u = reqToUser(req)
    setUsers(prev => prev.find(pu => pu.user.id === u.id) ? prev : [...prev, { user: u, role: 'viewer' }])
    setRestricted(true)
    setRequests(prev => prev.filter(r => r.id !== req.id))
  }
  function handleDeny(req: AccessRequest) {
    setRequests(prev => prev.filter(r => r.id !== req.id))
  }
  function handleApproveAll() {
    const newUsers = requests.map(r => ({ user: reqToUser(r), role: 'viewer' as UserRole }))
    setUsers(prev => {
      const existingIds = new Set(prev.map(pu => pu.user.id))
      return [...prev, ...newUsers.filter(pu => !existingIds.has(pu.user.id))]
    })
    setRestricted(true)
    setRequests([])
  }
  function handleDenyAll() { setRequests([]); setShowDenyAll(false) }

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
            <IconButton size="small" sx={{ color: 'rgba(0,0,0,0.4)' }}>
              <HelpOutlineIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" onClick={handleClose} sx={{ color: 'rgba(0,0,0,0.4)' }}>
              <CloseIcon sx={{ fontSize: 20 }} />
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
              Who can use this avatar
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
                roleLabel="Avatar owner"
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
                    roleLabel="Can use"
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
                      label={restricted ? 'Restricted' : 'Can use'}
                      onClick={e => openMenuFn(e, 'everyone')}
                    />
                  </Box>
                </>
              )}
            </Box>

            {/* Only me alert */}
            {tab === 'private' && (
              <Alert severity="info" icon={<InfoOutlinedIcon fontSize="small" />}
                sx={{ mt: 1.5, borderRadius: '8px', fontFamily: '"Open Sans", sans-serif', fontSize: 13, bgcolor: 'rgba(0,83,229,0.06)', color: c.textPrimary, '& .MuiAlert-icon': { color: c.primary } }}
              >
                Only you can use this avatar.
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

          {/* Access requests */}
          <Box>
            <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 14, color: c.textPrimary, mb: '12px', display: 'block' }}>
              {`Users who requested to use this avatar (${requests.length})`}
            </Typography>

            {requests.length === 0 ? (
              <Box sx={{ bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.10)', px: 2, py: 2.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <VisibilityOutlinedIcon sx={{ fontSize: 18, color: c.textSecondary, flexShrink: 0, mt: '1px' }} />
                <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 13, color: c.textSecondary, lineHeight: 1.5 }}>
                  {tab === 'private'
                    ? `Only you can use this avatar. You'll see access requests here if the permission changes.`
                    : `You'll see user requests here when people ask to use this avatar`}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box sx={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
                  {requests.map((req, idx) => (
                    <Box key={req.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, borderBottom: idx < requests.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none', bgcolor: '#fff' }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: req.color, fontSize: 11, fontFamily: '"Open Sans", sans-serif', fontWeight: 600, flexShrink: 0 }}>
                        {req.initials}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, lineHeight: 1.3 }}>{req.name}</Typography>
                        <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 12, color: c.textSecondary, lineHeight: 1.4 }}>{req.email}</Typography>
                      </Box>
                      <Tooltip title="Deny" placement="top" arrow componentsProps={{ tooltip: { sx: navyTooltipSx } }}>
                        <IconButton size="small" onClick={() => handleDeny(req)} sx={{ color: c.errorMain, p: '4px', '&:hover': { bgcolor: 'rgba(230,40,67,0.08)' } }}>
                          <DoNotDisturbOnOutlinedIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve" placement="top" arrow componentsProps={{ tooltip: { sx: navyTooltipSx } }}>
                        <IconButton size="small" onClick={() => handleApprove(req)} sx={{ color: c.successMain, p: '4px', '&:hover': { bgcolor: 'rgba(17,135,71,0.08)' } }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
                  <Button variant="outlined" fullWidth size="small" onClick={() => setShowDenyAll(true)}
                    sx={{ color: c.errorMain, borderColor: c.errorMain, fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 14, textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(230,40,67,0.06)', borderColor: c.errorMain } }}>
                    Deny all
                  </Button>
                  <Button variant="outlined" fullWidth size="small" onClick={handleApproveAll}
                    sx={{ color: c.successMain, borderColor: c.successMain, fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 14, textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(17,135,71,0.06)', borderColor: c.successMain } }}>
                    Allow all
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={handleClose} sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 14, color: c.textPrimary, textTransform: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}
            sx={{ bgcolor: c.primary, color: '#fff', fontFamily: '"Open Sans", sans-serif', fontWeight: 500, fontSize: 14, textTransform: 'none', borderRadius: '8px', px: 2.5, '&:hover': { bgcolor: '#0047CC' } }}>
            Save
          </Button>
        </DialogActions>

        {/* Role dropdown menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenuFn}
          PaperProps={{ sx: { borderRadius: '10px', boxShadow: '0px 4px 20px rgba(3,25,79,0.18)', minWidth: 210, p: '4px' } }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          {menuTarget === 'owner' && [
            <MenuItem key="ol" disableRipple sx={{ ...menuItemSx, cursor: 'default', '&:hover': { bgcolor: 'transparent' } }}>
              <CheckIcon sx={{ fontSize: 16, color: c.primary }} />
              <Typography sx={menuTextSx}>Avatar owner</Typography>
            </MenuItem>,
            <MenuItem key="ms" onClick={closeMenuFn} sx={menuItemSx}>
              <Box sx={{ width: 16 }} /><Typography sx={menuTextSx}>Make sole owner</Typography>
            </MenuItem>,
            <Divider key="d1" sx={{ my: '4px !important' }} />,
            <MenuItem key="ro" disabled={ownerUsers.length <= 1} onClick={closeMenuFn} sx={menuItemSx}>
              <Box sx={{ width: 16 }} /><Typography sx={menuErrSx}>Remove ownership</Typography>
            </MenuItem>,
          ]}

          {menuUser && [
            <MenuItem key="cu" disableRipple sx={{ ...menuItemSx, cursor: 'default', '&:hover': { bgcolor: 'transparent' } }}>
              <CheckIcon sx={{ fontSize: 16, color: c.primary }} />
              <Typography sx={menuTextSx}>Can use</Typography>
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

          {menuTarget === 'everyone' && [
            <MenuItem key="cu" onClick={() => { setRestricted(false); closeMenuFn() }} sx={menuItemSx}>
              {!restricted ? <CheckIcon sx={{ fontSize: 16, color: c.primary }} /> : <Box sx={{ width: 16 }} />}
              <Typography sx={menuTextSx}>Can use</Typography>
            </MenuItem>,
            <Divider key="d1" sx={{ my: '4px !important' }} />,
            <MenuItem key="re" onClick={() => { setRestricted(true); closeMenuFn() }} sx={menuItemSx}>
              {restricted ? <CheckIcon sx={{ fontSize: 16, color: c.primary }} /> : <Box sx={{ width: 16 }} />}
              <Typography sx={menuTextSx}>Restricted</Typography>
            </MenuItem>,
          ]}
        </Menu>
      </Dialog>

      {/* Discard confirmation */}
      <Dialog open={showDiscard} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontFamily: '"Open Sans"', fontWeight: 700, fontSize: 18, pb: 1 }}>
          Discard changes?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: '"Open Sans"', fontSize: 14, color: c.textSecondary }}>
            All your changes will be lost. Are you sure?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowDiscard(false)} sx={{ fontFamily: '"Open Sans"', textTransform: 'none', color: c.textPrimary }}>Stay</Button>
          <Button variant="contained" onClick={() => { setShowDiscard(false); onClose() }}
            sx={{ bgcolor: c.errorMain, fontFamily: '"Open Sans"', textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#C41E3A' } }}>
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deny all confirmation */}
      <Dialog open={showDenyAll} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontFamily: '"Open Sans"', fontWeight: 700, fontSize: 18, pb: 1 }}>
          Deny all {requests.length} requests?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: '"Open Sans"', fontSize: 14, color: c.textSecondary }}>
            All pending access requests will be denied. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowDenyAll(false)} sx={{ fontFamily: '"Open Sans"', textTransform: 'none', color: c.textPrimary }}>Cancel</Button>
          <Button variant="contained" onClick={handleDenyAll}
            sx={{ bgcolor: c.errorMain, fontFamily: '"Open Sans"', textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#C41E3A' } }}>
            Deny all
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
