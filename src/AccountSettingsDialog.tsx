import React, { useState } from 'react'
import {
  Box, Typography, Dialog, IconButton,
  Avatar, Button, OutlinedInput, InputAdornment,
  Table, TableBody, TableCell, TableHead, TableRow,
  Tooltip, Switch, Checkbox, FormControlLabel,
  Select, MenuItem, FormControl,
} from '@mui/material'
import CloseIcon              from '@mui/icons-material/Close'
import HelpOutlineIcon        from '@mui/icons-material/HelpOutline'
import SearchIcon             from '@mui/icons-material/Search'
import AddIcon                from '@mui/icons-material/Add'
import ArrowDownwardIcon      from '@mui/icons-material/ArrowDownward'
import InfoOutlinedIcon       from '@mui/icons-material/InfoOutlined'
import PeopleOutlinedIcon     from '@mui/icons-material/PeopleOutlined'
import LockOutlinedIcon       from '@mui/icons-material/LockOutlined'
import TaskAltOutlinedIcon    from '@mui/icons-material/TaskAltOutlined'
import LockPersonIcon         from '@mui/icons-material/LockPerson'
import ApprovalOutlinedIcon   from '@mui/icons-material/ApprovalOutlined'
import EditOutlinedIcon       from '@mui/icons-material/EditOutlined'
import DeleteOutlinedIcon     from '@mui/icons-material/DeleteOutlined'
import MoreHorizIcon          from '@mui/icons-material/MoreHoriz'

import { ALL_USERS, OWNER_USER } from './ManageAccessDialog'

// ─── Design tokens ────────────────────────────────────────────────────────────
const c = {
  primary:       '#0053E5',
  secondary:     '#03194F',
  textPrimary:   'rgba(0,0,0,0.87)',
  textSecondary: 'rgba(60,60,72,0.6)',
  actionActive:  'rgba(0,0,0,0.56)',
  grey100:       '#F5F7FB',
  grey300:       '#CFD6EA',
  divider:       'rgba(0,0,0,0.08)',
  primaryLight:  'rgba(0,83,229,0.08)',
}
const navyTipSx = { bgcolor: '#03194F', borderRadius: '6px', fontSize: 12, fontFamily: '"Open Sans",sans-serif' }

// ─── Types & mock data ────────────────────────────────────────────────────────
interface AccountUser {
  user:         typeof OWNER_USER
  isOwner?:     boolean
  createSpace:  string
  amplifySpace: string
  jobRole:      string
  lastLogin:    string
  createdDate:  string
  pending?:     boolean
  addedAsApprover?: string
}

const INITIAL_USERS: AccountUser[] = [
  { user: OWNER_USER,    isOwner: true, createSpace: 'Account owner', amplifySpace: 'Contributor', jobRole: 'Integrator',      lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[1],               createSpace: 'Editor',          amplifySpace: 'Contributor',   jobRole: 'Data Analyst',    lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[2],               createSpace: 'Editor',          amplifySpace: 'No access',     jobRole: 'Marketing',       lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[3],               createSpace: 'No access',       amplifySpace: 'Contributor',   jobRole: 'Creative Agency', lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[4],               createSpace: 'Viewer',          amplifySpace: 'No access',     jobRole: 'Marketing',       lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[5],               createSpace: 'Editor and Approver', amplifySpace: 'Contributor', jobRole: 'Marketing', lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
]

// ─── Nav ──────────────────────────────────────────────────────────────────────
type NavKey = 'users' | 'permissions' | 'approvals' | 'access'
const NAV: { key: NavKey; label: string; icon: React.ReactNode }[] = [
  { key: 'users',       label: 'Users',       icon: <PeopleOutlinedIcon   sx={{ fontSize: 18 }} /> },
  { key: 'permissions', label: 'Permissions', icon: <LockOutlinedIcon     sx={{ fontSize: 18 }} /> },
  { key: 'approvals',   label: 'Approvals',   icon: <TaskAltOutlinedIcon  sx={{ fontSize: 18 }} /> },
  { key: 'access',      label: 'Access',      icon: <LockPersonIcon       sx={{ fontSize: 18 }} /> },
]

// ─── Shared: column header with ⓘ tooltip + seat badge ───────────────────────
function SeatHeader({ label, tooltip, used, total }: { label: string; tooltip: string; used: number; total: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary }}>{label}</Typography>
      <Tooltip title={tooltip} placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
        <InfoOutlinedIcon sx={{ fontSize: 14, color: c.actionActive, cursor: 'default' }} />
      </Tooltip>
      <Box sx={{ bgcolor: c.primaryLight, borderRadius: '4px', px: '6px', py: '2px' }}>
        <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 11, fontWeight: 600, color: c.primary }}>{used}/{total}</Typography>
      </Box>
    </Box>
  )
}

// ─── Shared user avatar cell ──────────────────────────────────────────────────
function UserCell({ row }: { row: AccountUser }) {
  return (
    <Tooltip title={row.user.email} placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'default' }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: c.secondary, fontSize: 11, fontFamily: '"Inter",sans-serif', fontWeight: 600, flexShrink: 0, borderRadius: '8px' }}>
          {row.user.initials}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.user.name}
          </Typography>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.jobRole}
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  )
}

// ─── Add User Dialog ───────────────────────────────────────────────────────
interface InviteRow { email: string; createSpace: string; amplifySpace: string }

function AddUserDialog({ open, onClose, onSend }: {
  open: boolean
  onClose: () => void
  onSend: (rows: InviteRow[]) => void
}) {
  const [rows, setRows] = useState<(InviteRow & { createSpaceSelected: string[] })[]>([{ email: '', createSpace: 'Editor', createSpaceSelected: ['Editor'], amplifySpace: 'Contributor' }])

  const updateRow = (i: number, field: keyof InviteRow, val: string) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  const toggleCreateSpacePermission = (i: number, permission: string) => {
    setRows(prev => prev.map((r, idx) => {
      if (idx !== i) return r
      const selected = r.createSpaceSelected.includes(permission)
        ? r.createSpaceSelected.filter(p => p !== permission)
        : [...r.createSpaceSelected, permission]
      return { ...r, createSpaceSelected: selected, createSpace: selected.join(', ') || 'No access' }
    }))
  }

  function handleSend() {
    const valid = rows.filter(r => r.email.trim())
    if (valid.length) {
      onSend(valid.map(({ createSpaceSelected, ...r }) => r))
      setRows([{ email: '', createSpace: 'Editor', createSpaceSelected: ['Editor'], amplifySpace: 'Contributor' }])
    }
  }

  const createSpaceOptions = ['Account owner', 'Viewer', 'Approver', 'Editor', 'No access']
  const amplifySpaceOptions = ['Contributor', 'No access']
  const selectSx = {
    fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 },
    height: 40,
  }

  const isPermissionDisabled = (permission: string, selected: string[]) => {
    if (permission === 'Viewer' && (selected.includes('Editor') || selected.includes('Approver'))) return true
    if (permission === 'Editor' && selected.includes('Viewer')) return true
    if (permission === 'Approver' && selected.includes('Viewer')) return true
    return false
  }

  const getDisabledTooltip = (permission: string, selected: string[]): string | null => {
    if (permission === 'Viewer' && selected.includes('Editor')) return 'Viewer cannot be combined with Editor'
    if (permission === 'Viewer' && selected.includes('Approver')) return 'Viewer cannot be combined with Approver'
    if (permission === 'Editor' && selected.includes('Viewer')) return 'Editor cannot be combined with Viewer'
    if (permission === 'Approver' && selected.includes('Viewer')) return 'Approver cannot be combined with Viewer'
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: 520, borderRadius: '12px', p: 0 } }}>
      <Box sx={{ px: '24px', py: '20px' }}>
        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '24px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>Add users</Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>

        {/* Rows */}
        {rows.map((row, i) => (
          <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mb: '20px', pb: '20px', borderBottom: `1px solid ${c.grey300}` }}>
            <Box>
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, fontWeight: 600, color: c.textSecondary, mb: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</Typography>
              <OutlinedInput
                placeholder="user@example.com"
                value={row.email}
                onChange={e => updateRow(i, 'email', e.target.value)}
                fullWidth
                sx={{ fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px', height: 40, '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 } }}
              />
            </Box>
            <Box>
              <SeatHeader label="Create space" tooltip="Assigned editor seats compared to total editor seats" used={4} total={10} />
              <Box sx={{ mt: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {createSpaceOptions.map(option => {
                  const isDisabled = isPermissionDisabled(option, row.createSpaceSelected)
                  const tooltip = getDisabledTooltip(option, row.createSpaceSelected)
                  const checkbox = (
                    <FormControlLabel
                      key={option}
                      control={
                        <Checkbox
                          checked={row.createSpaceSelected.includes(option)}
                          onChange={() => toggleCreateSpacePermission(i, option)}
                          disabled={isDisabled}
                          size="small"
                          sx={{ '&.Mui-checked': { color: c.primary } }}
                        />
                      }
                      label={<Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: isDisabled ? c.textSecondary : c.textPrimary }}>{option}</Typography>}
                      sx={{ m: 0 }}
                    />
                  )
                  return isDisabled ? (
                    <Tooltip key={option} title={tooltip} placement="right" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
                      <div>{checkbox}</div>
                    </Tooltip>
                  ) : checkbox
                })}
              </Box>
            </Box>
            <Box>
              <SeatHeader label="Amplify space" tooltip="Assigned contributor only seats compared to total contributor seats" used={4} total={10} />
              <FormControl fullWidth size="small" sx={{ mt: '6px' }}>
                <Select value={row.amplifySpace} onChange={e => updateRow(i, 'amplifySpace', e.target.value as string)} sx={selectSx}>
                  {amplifySpaceOptions.map(o => <MenuItem key={o} value={o} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13 }}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>
        ))}

        {/* Info box */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', bgcolor: c.primaryLight, borderRadius: '8px', px: '14px', py: '12px', mb: '24px' }}>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: c.primary, mt: '1px', flexShrink: 0 }} />
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
            The user will receive an email invitation and will need to create an account to get access.
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary, borderColor: c.grey300 }}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={handleSend}
            disabled={!rows.some(r => r.email.trim())}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', color: c.primary, borderColor: c.primary, '&:hover': { bgcolor: 'rgba(0,83,229,0.04)', borderColor: c.primary }, '&:disabled': { color: c.grey300, borderColor: c.grey300 } }}
          >
            Add users
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

// ─── Add Approver Dialog ───────────────────────────────────────────────────────
function AddApproverDialog({ open, onClose, onAdd, allUsers }: {
  open: boolean
  onClose: () => void
  onAdd: (email: string, createSpace: string, amplifySpace: string) => void
  allUsers: AccountUser[]
}) {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<AccountUser | null>(null)
  const [createSpaceSelected, setCreateSpaceSelected] = useState<string[]>(['Approver'])
  const [createSpace, setCreateSpace] = useState('Approver')
  const [amplifySpace, setAmplifySpace] = useState('No access')
  const [alert, setAlert] = useState('')

  const createSpaceOptions = ['Account owner', 'Viewer', 'Approver', 'Editor', 'No access']
  const amplifySpaceOptions = ['Contributor', 'No access']

  const filteredUsers = search.trim()
    ? allUsers.filter(u => u.user.email.toLowerCase().includes(search.toLowerCase()) || u.user.name.toLowerCase().includes(search.toLowerCase()))
    : []

  const isNewEmail = search.trim() && !filteredUsers.some(u => u.user.email === search.trim())

  const isPermissionDisabled = (permission: string): boolean => {
    if (permission === 'Viewer' && (createSpaceSelected.includes('Editor') || createSpaceSelected.includes('Approver'))) return true
    if (permission === 'Editor' && createSpaceSelected.includes('Viewer')) return true
    if (permission === 'Approver' && createSpaceSelected.includes('Viewer')) return true
    return false
  }

  const getDisabledTooltip = (permission: string): string | null => {
    if (permission === 'Viewer' && createSpaceSelected.includes('Editor')) return 'Viewer cannot be combined with Editor'
    if (permission === 'Viewer' && createSpaceSelected.includes('Approver')) return 'Viewer cannot be combined with Approver'
    if (permission === 'Editor' && createSpaceSelected.includes('Viewer')) return 'Editor cannot be combined with Viewer'
    if (permission === 'Approver' && createSpaceSelected.includes('Viewer')) return 'Approver cannot be combined with Viewer'
    return null
  }

  const toggleCreateSpacePermission = (permission: string) => {
    const selected = createSpaceSelected.includes(permission)
      ? createSpaceSelected.filter(p => p !== permission)
      : [...createSpaceSelected, permission]
    setCreateSpaceSelected(selected)
    setCreateSpace(selected.join(', ') || 'No access')
  }

  const handleSelectUser = (user: AccountUser) => {
    setSelectedUser(user)
    setSearch(user.user.email)

    // Set permissions based on user's current role
    if (user.createSpace === 'Editor') {
      setCreateSpaceSelected(['Editor', 'Approver'])
      setCreateSpace('Editor, Approver')
      setAlert('This user will get permission to access the create space')
    } else if (user.createSpace === 'Viewer') {
      setCreateSpaceSelected(['Approver'])
      setCreateSpace('Approver')
      setAlert('This user will get permission to access the create space')
    } else if (user.createSpace === 'No access') {
      setCreateSpaceSelected(['Approver'])
      setCreateSpace('Approver')
      setAlert('This user will get permission to access the create space')
    } else {
      setCreateSpaceSelected(['Approver'])
      setCreateSpace('Approver')
      setAlert('')
    }
    setAmplifySpace('No access')
  }

  const handleAdd = () => {
    const email = selectedUser ? selectedUser.user.email : search.trim()
    if (!email) return

    onAdd(email, createSpace, amplifySpace)
    setSearch('')
    setSelectedUser(null)
    setCreateSpaceSelected(['Approver'])
    setCreateSpace('Approver')
    setAmplifySpace('No access')
    setAlert('')
    onClose()
  }

  React.useEffect(() => {
    if (!open) {
      setSearch('')
      setSelectedUser(null)
      setCreateSpaceSelected(['Approver'])
      setCreateSpace('Approver')
      setAmplifySpace('No access')
      setAlert('')
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: 520, borderRadius: '12px', p: 0 } }}>
      <Box sx={{ px: '24px', py: '20px' }}>
        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '24px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>Add approver</Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>

        {/* Search input */}
        <Box sx={{ mb: '16px' }}>
          <OutlinedInput
            placeholder="Search user or enter email..."
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setSelectedUser(null)
              if (!e.target.value.trim()) {
                setCreateSpace('Approver')
                setAmplifySpace('No access')
                setAlert('')
              } else if (isNewEmail && e.target.value.trim()) {
                setCreateSpace('Approver')
                setAmplifySpace('No access')
                setAlert('The user will receive an email invitation and will need to create an account to get access.')
              }
            }}
            fullWidth
            sx={{ fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px', height: 40, '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 } }}
          />
        </Box>

        {/* User suggestions */}
        {filteredUsers.length > 0 && (
          <Box sx={{ mb: '16px', border: `1px solid ${c.grey300}`, borderRadius: '8px', maxHeight: 200, overflowY: 'auto' }}>
            {filteredUsers.map(user => (
              <Box
                key={user.user.id}
                onClick={() => handleSelectUser(user)}
                sx={{ p: '10px 12px', borderBottom: `1px solid ${c.grey300}`, cursor: 'pointer', '&:hover': { bgcolor: c.grey100 }, '&:last-child': { borderBottom: 'none' } }}
              >
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary }}>
                  {user.user.name}
                </Typography>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary }}>
                  {user.user.email}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Permissions */}
        <Box sx={{ mb: '20px' }}>
          <Box sx={{ mb: '12px' }}>
            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, fontWeight: 600, color: c.textSecondary, mb: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Create space</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {createSpaceOptions.map(option => {
                const isDisabled = isPermissionDisabled(option)
                const tooltip = getDisabledTooltip(option)
                const checkbox = (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={createSpaceSelected.includes(option)}
                        onChange={() => toggleCreateSpacePermission(option)}
                        disabled={isDisabled}
                        size="small"
                        sx={{ '&.Mui-checked': { color: c.primary } }}
                      />
                    }
                    label={<Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: isDisabled ? c.textSecondary : c.textPrimary }}>{option}</Typography>}
                    sx={{ m: 0 }}
                  />
                )
                return isDisabled ? (
                  <Tooltip key={option} title={tooltip} placement="right" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
                    <div>{checkbox}</div>
                  </Tooltip>
                ) : checkbox
              })}
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, fontWeight: 600, color: c.textSecondary, mb: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amplify space</Typography>
            <FormControl fullWidth size="small">
              <Select value={amplifySpace} onChange={e => setAmplifySpace(e.target.value as string)} sx={{ fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 }, height: 40 }}>
                {amplifySpaceOptions.map(o => <MenuItem key={o} value={o} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13 }}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Alert */}
        {alert && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', bgcolor: c.primaryLight, borderRadius: '8px', px: '14px', py: '12px', mb: '20px' }}>
            <InfoOutlinedIcon sx={{ fontSize: 16, color: c.primary, mt: '1px', flexShrink: 0 }} />
            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
              {alert}
            </Typography>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary, borderColor: c.grey300 }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={handleAdd}
            disabled={!search.trim()}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', color: c.primary, borderColor: c.primary, '&:hover': { bgcolor: 'rgba(0,83,229,0.04)' }, '&:disabled': { color: c.grey300, borderColor: c.grey300 } }}
          >
            Add approver
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

// ─── Edit Permissions Dialog ──────────────────────────────────────────────────
function EditPermissionsDialog({ open, onClose, user, onSave }: {
  open: boolean
  onClose: () => void
  user: AccountUser | null
  onSave: (createSpace: string, amplifySpace: string) => void
}) {
  const initialCreateSpace = user?.createSpace || 'Viewer'
  const [createSpaceSelected, setCreateSpaceSelected] = useState<string[]>(initialCreateSpace ? initialCreateSpace.split(', ') : ['Viewer'])
  const [createSpace, setCreateSpace] = useState(initialCreateSpace)
  const [amplifySpace, setAmplifySpace] = useState(user?.amplifySpace || 'No access')

  const createSpaceOptions = ['Account owner', 'Viewer', 'Approver', 'Editor', 'No access']
  const amplifySpaceOptions = ['Contributor', 'No access']
  const selectSx = {
    fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 },
    height: 40,
  }

  const isPermissionDisabled = (permission: string): boolean => {
    if (permission === 'Viewer' && (createSpaceSelected.includes('Editor') || createSpaceSelected.includes('Approver'))) return true
    if (permission === 'Editor' && createSpaceSelected.includes('Viewer')) return true
    if (permission === 'Approver' && createSpaceSelected.includes('Viewer')) return true
    return false
  }

  const getDisabledTooltip = (permission: string): string | null => {
    if (permission === 'Viewer' && createSpaceSelected.includes('Editor')) return 'Viewer cannot be combined with Editor'
    if (permission === 'Viewer' && createSpaceSelected.includes('Approver')) return 'Viewer cannot be combined with Approver'
    if (permission === 'Editor' && createSpaceSelected.includes('Viewer')) return 'Editor cannot be combined with Viewer'
    if (permission === 'Approver' && createSpaceSelected.includes('Viewer')) return 'Approver cannot be combined with Viewer'
    return null
  }

  const toggleCreateSpacePermission = (permission: string) => {
    const selected = createSpaceSelected.includes(permission)
      ? createSpaceSelected.filter(p => p !== permission)
      : [...createSpaceSelected, permission]
    setCreateSpaceSelected(selected)
    setCreateSpace(selected.join(', ') || 'No access')
  }

  React.useEffect(() => {
    const initial = user?.createSpace || 'Viewer'
    setCreateSpaceSelected(initial ? initial.split(', ') : ['Viewer'])
    setCreateSpace(initial)
    setAmplifySpace(user?.amplifySpace || 'No access')
  }, [user, open])

  function handleSave() {
    onSave(createSpace, amplifySpace)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: 600, borderRadius: '12px', p: 0 } }}>
      <Box sx={{ px: '24px', py: '20px' }}>
        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '24px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>
            Edit permissions for {user?.user.name}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>

        {/* Create space section */}
        <Box sx={{ mb: '24px' }}>
          <SeatHeader label="Create space" tooltip="Assigned editor seats compared to total editor seats" used={4} total={10} />
          <Box sx={{ mt: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {createSpaceOptions.map(option => {
              const isDisabled = isPermissionDisabled(option)
              const tooltip = getDisabledTooltip(option)
              const checkbox = (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={createSpaceSelected.includes(option)}
                      onChange={() => toggleCreateSpacePermission(option)}
                      disabled={isDisabled}
                      size="small"
                      sx={{ '&.Mui-checked': { color: c.primary } }}
                    />
                  }
                  label={<Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: isDisabled ? c.textSecondary : c.textPrimary }}>{option}</Typography>}
                  sx={{ m: 0 }}
                />
              )
              return isDisabled ? (
                <Tooltip key={option} title={tooltip} placement="right" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
                  <div>{checkbox}</div>
                </Tooltip>
              ) : checkbox
            })}
          </Box>
        </Box>

        {/* Amplify space section */}
        <Box sx={{ mb: '24px', borderBottom: `1px solid ${c.grey300}`, pb: '12px' }}>
          <SeatHeader label="Amplify space" tooltip="Assigned contributor only seats compared to total contributor seats" used={4} total={10} />
          <FormControl fullWidth size="small" sx={{ mt: '6px' }}>
            <Select value={amplifySpace} onChange={e => setAmplifySpace(e.target.value as string)} sx={selectSx}>
              {amplifySpaceOptions.map(o => <MenuItem key={o} value={o} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13 }}>{o}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button onClick={onClose} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

// ─── Delete User Dialog ────────────────────────────────────────────────────────
function DeleteUserDialog({ open, onClose, userName, onConfirm }: {
  open: boolean
  onClose: () => void
  userName: string
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: 400, borderRadius: '12px', p: 0 } }}>
      <Box sx={{ px: '24px', py: '20px' }}>
        {/* Title */}
        <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary, mb: '12px' }}>
          Remove user
        </Typography>
        <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textSecondary, mb: '24px' }}>
          Are you sure you want to remove <strong>{userName}</strong> from your account?
        </Typography>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button onClick={onClose} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => { onConfirm(); onClose() }}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: '#E53935', boxShadow: 'none', '&:hover': { bgcolor: '#C62828', boxShadow: 'none' } }}
          >
            Remove
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

// ─── Remove Approver Dialog ────────────────────────────────────────────────────
function RemoveApproverDialog({ open, onClose, userName, onConfirm }: {
  open: boolean
  onClose: () => void
  userName: string
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: 400, borderRadius: '12px', p: 0 } }}>
      <Box sx={{ px: '24px', py: '20px' }}>
        {/* Title */}
        <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary, mb: '12px' }}>
          Remove approver
        </Typography>
        <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textSecondary, mb: '24px' }}>
          Are you sure you want to remove <strong>{userName}</strong> as an approver?
        </Typography>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button onClick={onClose} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => { onConfirm(); onClose() }}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: '#E53935', boxShadow: 'none', '&:hover': { bgcolor: '#C62828', boxShadow: 'none' } }}
          >
            Remove
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

// ─── User Details Dialog ──────────────────────────────────────────────────────
function UserDetailsDialog({ open, onClose, user, onEdit, onRemove }: {
  open: boolean
  onClose: () => void
  user: AccountUser | null
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: 400, borderRadius: '12px', p: 0 } }}>
      <Box sx={{ px: '24px', py: '20px' }}>
        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '24px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>
            User details
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>

        {/* User info */}
        {user && (
          <Box sx={{ mb: '24px', pb: '24px', borderBottom: `1px solid ${c.grey300}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '16px' }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: c.secondary, fontSize: 12, fontFamily: '"Inter",sans-serif', fontWeight: 600, borderRadius: '8px' }}>
                {user.user.initials}
              </Avatar>
              <Box>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, color: c.textPrimary }}>
                  {user.user.name}
                </Typography>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary }}>
                  {user.jobRole}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', fontSize: 13, fontFamily: '"Open Sans",sans-serif', color: c.textSecondary }}>
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: c.textSecondary, mb: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</Typography>
                <Typography sx={{ color: c.textPrimary }}>{user.user.email}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: c.textSecondary, mb: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Creation date</Typography>
                <Typography sx={{ color: c.textPrimary }}>{user.pending ? '—' : user.createdDate}</Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button
            onClick={() => { onRemove(); onClose() }}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: '#E53935', '&:hover': { bgcolor: 'rgba(229,57,53,0.1)' } }}
          >
            Remove
          </Button>
          <Button
            variant="contained"
            onClick={() => { onEdit(); onClose() }}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', py: '9px', px: '16px', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
          >
            Edit permissions
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

// ─── Confirm Approvers Dialog ──────────────────────────────────────────────────
interface ApproverCreateSpacePermission {
  userId: string
  userName: string
  currentCreateSpace: string
  newCreateSpace: string
}

function ConfirmApproversDialog({ open, onClose, approversNeedingAccess, onConfirm }: {
  open: boolean
  onClose: () => void
  approversNeedingAccess: ApproverCreateSpacePermission[]
  onConfirm: (permissions: ApproverCreateSpacePermission[]) => void
}) {
  const [permissions, setPermissions] = useState<ApproverCreateSpacePermission[]>(approversNeedingAccess)

  const updatePermission = (userId: string, newCreateSpace: string) => {
    setPermissions(prev => prev.map(p => p.userId === userId ? { ...p, newCreateSpace } : p))
  }

  // Dynamic title based on number of users
  const titleSuffix = approversNeedingAccess.length === 1
    ? `to ${approversNeedingAccess[0].userName}`
    : `to ${approversNeedingAccess.length} approvers`

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: 600, borderRadius: '12px', p: 0 } }}>
      <Box sx={{ px: '24px', py: '20px' }}>
        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '24px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>
            Grant Create space access {titleSuffix}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>

        {/* Column headers */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', mb: '8px', px: '2px' }}>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary }}>
            User
          </Typography>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary }}>
            Create space
          </Typography>
        </Box>

        {/* Permission rows */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0px', borderBottom: `1px solid ${c.grey300}`, pb: '12px', mb: '24px', maxHeight: 400, overflowY: 'auto' }}>
          {permissions.map((perm) => (
            <Box key={perm.userId} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center', py: '12px', borderTop: `1px solid ${c.grey300}`, '&:first-of-type': { borderTopColor: 'transparent' } }}>
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                {perm.userName}
              </Typography>
              <FormControl size="small" fullWidth>
                <Select value={perm.newCreateSpace} onChange={e => updatePermission(perm.userId, e.target.value as string)} sx={{ fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px', height: 40, '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 } }}>
                  <MenuItem value="Viewer" sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13 }}>Viewer</MenuItem>
                  <MenuItem value="No access" sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13 }}>No access</MenuItem>
                </Select>
              </FormControl>
            </Box>
          ))}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button onClick={onClose} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => { onConfirm(permissions); onClose() }}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
          >
            Confirm
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

// ─── Approvals Section ────────────────────────────────────────────────────────
function ApprovalsSection({ users, approverIds, enabled, onToggle, onSetApprovers, onAddUsers }: {
  users:          AccountUser[]
  approverIds:    Set<string>
  enabled:        boolean
  onToggle:       (v: boolean) => void
  onSetApprovers: (ids: string[]) => void
  onAddUsers:     (rows: InviteRow[], asApprover: boolean) => void
}) {
  const [search, setSearch]         = useState('')
  const [addApproverDialogOpen, setAddApproverDialogOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [removeApproverOpen, setRemoveApproverOpen] = useState(false)
  const [approverToRemove, setApproverToRemove] = useState<AccountUser | null>(null)
  const [confirmApproversOpen, setConfirmApproversOpen] = useState(false)
  const [pendingApprovers, setPendingApprovers] = useState<ApproverCreateSpacePermission[]>([])

  const approvers = users.filter(u => approverIds.has(u.user.id))
  const filtered  = search
    ? approvers.filter(r => r.user.name.toLowerCase().includes(search.toLowerCase()) || r.user.email.toLowerCase().includes(search.toLowerCase()))
    : approvers

  const headCellSx = { fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`, py: '10px', px: '16px', whiteSpace: 'nowrap' as const, bgcolor: '#fff', position: 'sticky', top: 0, zIndex: 3 }
  const bodyCellSx = { fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`, py: '10px', px: '16px' }

  function handleAddApprovers(ids: string[]) {
    const newApproverIds = ids.filter(id => !approverIds.has(id))
    const newApproverUsers = users.filter(u => newApproverIds.includes(u.user.id))
    const needingCreateAccess = newApproverUsers.filter(u => u.createSpace === 'No access')

    if (needingCreateAccess.length > 0) {
      // Show confirmation dialog for users needing Create space access
      const pendingPerms: ApproverCreateSpacePermission[] = needingCreateAccess.map(u => ({
        userId: u.user.id,
        userName: u.user.name,
        currentCreateSpace: u.createSpace,
        newCreateSpace: 'Viewer',
      }))
      setPendingApprovers(pendingPerms)
      setConfirmApproversOpen(true)
    } else {
      // Directly add approvers if no Create space access needed
      onSetApprovers(ids)
    }
  }

  function handleConfirmApproversWithPermissions(permissions: ApproverCreateSpacePermission[]) {
    // For now, just confirm the approvers (in a real app, would update the user permissions)
    const allIds = [...approverIds, ...permissions.map(p => p.userId)]
    onSetApprovers(allIds)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 20, color: c.textPrimary, mb: '16px', flexShrink: 0 }}>
        Approvals
      </Typography>

      {/* Toggle row */}
      <Box sx={{ border: `1px solid ${c.grey300}`, borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '16px', py: '14px' }}>
          <ApprovalOutlinedIcon sx={{ fontSize: 22, color: c.primary, flexShrink: 0 }} />
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textPrimary, flex: 1 }}>
            Only specific users can approve videos and template
          </Typography>
          <Switch
            checked={enabled}
            onChange={e => onToggle(e.target.checked)}
            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#fff' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: c.primary } }}
          />
        </Box>

        {enabled && (
          <Box sx={{ px: '16px', pb: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Add approvers + Search */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
                variant={approvers.length > 0 ? 'outlined' : 'contained'}
                onClick={() => setAddApproverDialogOpen(true)}
                sx={{
                  fontFamily: '"Open Sans",sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '8px',
                  ...(approvers.length > 0
                    ? { color: c.primary, borderColor: c.grey300, '&:hover': { bgcolor: c.primaryLight, borderColor: c.primary } }
                    : { bgcolor: c.primary, boxShadow: 'none', color: '#fff', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }
                  )
                }}
              >
                Add approver
              </Button>
              <OutlinedInput
                placeholder="Search..."
                size="small"
                value={search}
                onChange={e => setSearch(e.target.value)}
                startAdornment={<InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: c.actionActive }} /></InputAdornment>}
                sx={{ width: 200, fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 } }}
              />
            </Box>

            {/* Approvers table or empty state */}
            {approvers.length === 0 ? (
              <Box sx={{ bgcolor: c.grey100, borderRadius: '8px', py: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textSecondary }}>
                  Add approver to change this permission
                </Typography>
              </Box>
            ) : (
              <Box sx={{ borderRadius: '8px', border: `1px solid ${c.grey300}`, overflow: 'auto', maxHeight: 300 }}>
                <Table size="small" sx={{ tableLayout: 'fixed', minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...headCellSx, width: 240, position: 'sticky', left: 0, zIndex: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          User <ArrowDownwardIcon sx={{ fontSize: 13, color: c.actionActive }} />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ ...headCellSx, width: 150 }}>
                        <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary }}>Role</Typography>
                      </TableCell>
                      <TableCell sx={{ ...headCellSx, width: 180 }}>
                        <SeatHeader label="Create space" tooltip="Assigned editor seats compared to total editor seats" used={5} total={10} />
                      </TableCell>
                      <TableCell sx={{ ...headCellSx, width: 180 }}>
                        <SeatHeader label="Amplify space" tooltip="Assigned contributor only seats compared to total contributor seats" used={4} total={10} />
                      </TableCell>
                      <TableCell sx={{ ...headCellSx, width: 160 }}>Added as approver</TableCell>
                      <TableCell sx={{ ...headCellSx, width: 48, p: 0 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map(row => {
                      const isHovered = hoveredRow === row.user.id
                      return (
                        <TableRow
                          key={row.user.id}
                          onMouseEnter={() => setHoveredRow(row.user.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          sx={{ bgcolor: isHovered ? c.grey100 : '#fff', transition: 'background 0.1s' }}
                        >
                          <TableCell sx={{ ...bodyCellSx, position: 'sticky', left: 0, zIndex: 1, bgcolor: isHovered ? c.grey100 : '#fff' }}>
                            <UserCell row={row} />
                          </TableCell>
                          <TableCell sx={bodyCellSx}>
                            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                              {row.jobRole}
                            </Typography>
                          </TableCell>
                          <TableCell sx={bodyCellSx}>
                            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.createSpace === 'No access' ? c.textSecondary : c.textPrimary }}>
                              {row.createSpace}
                            </Typography>
                          </TableCell>
                          <TableCell sx={bodyCellSx}>
                            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.amplifySpace === 'No access' ? c.textSecondary : c.textPrimary }}>
                              {row.amplifySpace}
                            </Typography>
                          </TableCell>
                          <TableCell sx={bodyCellSx}>
                            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                              {row.addedAsApprover || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ ...bodyCellSx, px: '4px', width: 48 }}>
                            {isHovered && (
                              <Tooltip title="Remove approver" placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
                                <IconButton
                                  size="small"
                                  onClick={() => { setApproverToRemove(row); setRemoveApproverOpen(true) }}
                                  sx={{ color: '#E53935', '&:hover': { bgcolor: 'rgba(229,57,53,0.1)' } }}
                                >
                                  <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Add Approver Dialog */}
      <AddApproverDialog
        open={addApproverDialogOpen}
        onClose={() => setAddApproverDialogOpen(false)}
        allUsers={users}
        onAdd={(email, createSpace, amplifySpace) => {
          // Find if user exists
          const existingUser = users.find(u => u.user.email === email)
          if (existingUser) {
            // Add existing user as approver
            handleAddApprovers([existingUser.user.id])
          } else {
            // Invite new user as approver
            onAddUsers([{ email, createSpace, amplifySpace }], true)
          }
        }}
      />

      {/* Add User Dialog */}
      <AddUserDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSend={rows => { onAddUsers(rows, true); setInviteOpen(false) }}
      />

      {/* Remove Approver Dialog */}
      <RemoveApproverDialog
        open={removeApproverOpen}
        onClose={() => setRemoveApproverOpen(false)}
        userName={approverToRemove?.user.name || ''}
        onConfirm={() => {
          if (approverToRemove) {
            onSetApprovers([...approverIds].filter(id => id !== approverToRemove.user.id))
          }
        }}
      />

      {/* Confirm Approvers Dialog */}
      <ConfirmApproversDialog
        open={confirmApproversOpen}
        onClose={() => { setConfirmApproversOpen(false); setPendingApprovers([]) }}
        approversNeedingAccess={pendingApprovers}
        onConfirm={handleConfirmApproversWithPermissions}
      />
    </Box>
  )
}

// ─── Users Section ────────────────────────────────────────────────────────────
function UsersSection({ users, onInviteUser }: { users: AccountUser[]; onInviteUser: (rows: InviteRow[]) => void }) {
  const [search, setSearch]     = useState('')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editPermOpen, setEditPermOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AccountUser | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<AccountUser | null>(null)
  const [userDetailsOpen, setUserDetailsOpen] = useState(false)
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<AccountUser | null>(null)
  const [usersList, setUsersList] = useState<AccountUser[]>(users)

  const filtered = search
    ? usersList.filter(r => r.user.name.toLowerCase().includes(search.toLowerCase()) || r.user.email.toLowerCase().includes(search.toLowerCase()))
    : usersList

  // Sync usersList with users prop
  React.useEffect(() => {
    setUsersList(users)
  }, [users])

  const headCellSx = { fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`, py: '10px', px: '16px', whiteSpace: 'nowrap' as const, bgcolor: '#fff', position: 'sticky', top: 0, zIndex: 3 }
  const bodyCellSx = { fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`, py: '10px', px: '16px' }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Title row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '20px', flexShrink: 0 }}>
        <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 20, color: c.textPrimary }}>
          Users ({usersList.length})
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
            variant="contained"
            onClick={() => setInviteOpen(true)}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontWeight: 600, fontSize: 14, textTransform: 'none', borderRadius: '8px', px: '16px', py: '7px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
          >
            Add user
          </Button>
          <OutlinedInput
            placeholder="Search..."
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            startAdornment={<InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: c.actionActive }} /></InputAdornment>}
            sx={{ width: 220, fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 } }}
          />
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ flex: 1, overflowX: 'auto', overflowY: 'auto', borderRadius: '8px', border: `1px solid ${c.grey300}`, maxWidth: 850 }}>
        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%', minWidth: 850 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headCellSx, width: 230, position: 'sticky', left: 0, zIndex: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  User <ArrowDownwardIcon sx={{ fontSize: 14, color: c.actionActive }} />
                </Box>
              </TableCell>
              <TableCell sx={{ ...headCellSx, width: '25%' }}>
                <SeatHeader label="Create space" tooltip="Assigned editor seats compared to total editor seats" used={5} total={10} />
              </TableCell>
              <TableCell sx={{ ...headCellSx, width: '25%' }}>
                <SeatHeader label="Amplify space" tooltip="Assigned contributor only seats compared to total contributor seats" used={4} total={10} />
              </TableCell>
              <TableCell sx={{ ...headCellSx, width: '25%' }}>Last login</TableCell>
              <TableCell sx={{ ...headCellSx, width: 48, p: 0 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(row => {
              const isHovered = hoveredRow === row.user.id
              return (
                <TableRow
                  key={row.user.id}
                  onMouseEnter={() => setHoveredRow(row.user.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  sx={{ bgcolor: isHovered ? c.grey100 : '#fff', transition: 'background 0.1s' }}
                >
                  <TableCell sx={{ ...bodyCellSx, position: 'sticky', left: 0, zIndex: 1, bgcolor: isHovered ? c.grey100 : '#fff' }}>
                    <UserCell row={row} />
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.createSpace === 'No access' ? c.textSecondary : c.textPrimary, whiteSpace: 'pre-line' }}>
                      {row.createSpace}
                    </Typography>
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.amplifySpace === 'No access' ? c.textSecondary : c.textPrimary }}>
                        {row.amplifySpace}
                      </Typography>
                      <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isHovered && !row.isOwner && (
                          <Tooltip title="Edit permissions" placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
                            <IconButton
                              size="small"
                              onClick={() => { setEditingUser(row); setEditPermOpen(true) }}
                              sx={{ color: c.primary, '&:hover': { bgcolor: 'rgba(0,83,229,0.1)' }, p: '4px' }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.pending ? c.textSecondary : c.textPrimary, fontStyle: row.pending ? 'italic' : 'normal' }}>
                      {row.pending ? 'Pending' : row.lastLogin}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...bodyCellSx, px: '4px', width: 48 }}>
                    {isHovered && !row.isOwner && (
                      <IconButton
                        size="small"
                        onClick={() => { setSelectedUserForDetails(row); setUserDetailsOpen(true) }}
                        sx={{ color: c.textPrimary, p: '4px', '&:hover': { bgcolor: c.grey100 } }}
                      >
                        <MoreHorizIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Box>

      <AddUserDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSend={rows => { onInviteUser(rows); setInviteOpen(false) }}
      />

      {/* Edit Permissions Dialog */}
      <EditPermissionsDialog
        open={editPermOpen}
        onClose={() => setEditPermOpen(false)}
        user={editingUser}
        onSave={(createSpace, amplifySpace) => {
          if (editingUser) {
            setUsersList(prev => prev.map(u => u.user.id === editingUser.user.id ? { ...u, createSpace, amplifySpace } : u))
          }
        }}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        userName={userToDelete?.user.name || ''}
        onConfirm={() => {
          if (userToDelete) {
            setUsersList(prev => prev.filter(u => u.user.id !== userToDelete.user.id))
          }
        }}
      />

      {/* User Details Dialog */}
      <UserDetailsDialog
        open={userDetailsOpen}
        onClose={() => setUserDetailsOpen(false)}
        user={selectedUserForDetails}
        onEdit={() => { setEditingUser(selectedUserForDetails); setEditPermOpen(true) }}
        onRemove={() => { setUserToDelete(selectedUserForDetails); setDeleteOpen(true) }}
      />
    </Box>
  )
}

// ─── Placeholder ──────────────────────────────────────────────────────────────
function PlaceholderSection({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textSecondary }}>
        {label} settings coming soon
      </Typography>
    </Box>
  )
}

// ─── Main dialog ──────────────────────────────────────────────────────────────
export default function AccountSettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [nav, setNav]                   = useState<NavKey>('users')
  const [users, setUsers]               = useState<AccountUser[]>(INITIAL_USERS)
  const [approverIds, setApproverIds]   = useState<Set<string>>(new Set())
  const [approvalsEnabled, setApprovalsEnabled] = useState(false)

  function handleInviteUser(rows: InviteRow[], asApprover = false) {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const newUsers: AccountUser[] = rows.map((r, i) => ({
      user: { id: `invited-${Date.now()}-${i}`, initials: r.email.slice(0, 2).toUpperCase(), name: r.email, email: r.email, color: '#0053E5' },
      createSpace:  r.createSpace,
      amplifySpace: r.amplifySpace,
      jobRole:      'Pending',
      lastLogin:    'Pending',
      createdDate:  today,
      pending:      true,
      addedAsApprover: asApprover ? today : undefined,
    }))
    setUsers(prev => [...prev, ...newUsers])
    if (asApprover) {
      setApproverIds(prev => { const s = new Set(prev); newUsers.forEach(u => s.add(u.user.id)); return s })
    }
  }

  function handleSetApprovers(ids: string[]) {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    setUsers(prev => prev.map(u => ({
      ...u,
      addedAsApprover: ids.includes(u.user.id) && !u.addedAsApprover ? today : u.addedAsApprover,
    })))
    setApproverIds(new Set(ids))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{ sx: { width: 1020, maxWidth: '95vw', height: 680, maxHeight: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0 } }}
    >
      {/* Title bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '24px', py: '14px', borderBottom: `1px solid ${c.grey300}`, flexShrink: 0 }}>
        <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>Account settings</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <IconButton size="small" sx={{ color: c.actionActive }}><HelpOutlineIcon sx={{ fontSize: 18 }} /></IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Box sx={{ width: 176, flexShrink: 0, borderRight: `1px solid ${c.grey300}`, py: '12px', px: '8px', display: 'flex', flexDirection: 'column', gap: '2px', bgcolor: '#FAFBFD' }}>
          {NAV.map(item => (
            <Box
              key={item.key}
              onClick={() => setNav(item.key)}
              sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '12px', py: '8px', borderRadius: '8px', cursor: 'pointer', bgcolor: nav === item.key ? c.primaryLight : 'transparent', color: nav === item.key ? c.primary : c.textPrimary, '&:hover': { bgcolor: nav === item.key ? c.primaryLight : 'rgba(0,0,0,0.04)' } }}
            >
              <Box sx={{ color: nav === item.key ? c.primary : c.actionActive, display: 'flex', flexShrink: 0 }}>{item.icon}</Box>
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: nav === item.key ? 600 : 400, color: 'inherit' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'hidden', px: '24px', py: '20px', display: 'flex', flexDirection: 'column' }}>
          {nav === 'users'       && <UsersSection users={users} onInviteUser={rows => handleInviteUser(rows, false)} />}
          {nav === 'permissions' && <PlaceholderSection label="Permissions" />}
          {nav === 'approvals'   && (
            <ApprovalsSection
              users={users}
              approverIds={approverIds}
              enabled={approvalsEnabled}
              onToggle={setApprovalsEnabled}
              onSetApprovers={handleSetApprovers}
              onAddUsers={(rows, asApprover) => handleInviteUser(rows, asApprover)}
            />
          )}
          {nav === 'access'      && <PlaceholderSection label="Access" />}
        </Box>
      </Box>
    </Dialog>
  )
}
