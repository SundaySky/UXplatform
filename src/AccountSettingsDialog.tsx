import React, { useState } from 'react'
import {
  Box, Typography, Dialog, IconButton,
  Avatar, Button, OutlinedInput, InputAdornment,
  Table, TableBody, TableCell, TableHead, TableRow,
  Tooltip, Switch, Checkbox, Divider,
  Select, MenuItem, FormControl, Menu,
  Autocomplete, TextField,
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
function SeatHeader({ label, iconTooltip, chipTooltip, used, total }: { label: string; iconTooltip?: string; chipTooltip?: string; used: number; total: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, cursor: 'default' }}>{label}</Typography>
      {iconTooltip ? (
        <Tooltip title={iconTooltip} placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
          <InfoOutlinedIcon sx={{ fontSize: 14, color: c.actionActive, cursor: 'default' }} />
        </Tooltip>
      ) : (
        <InfoOutlinedIcon sx={{ fontSize: 14, color: c.actionActive, cursor: 'default' }} />
      )}
      <Tooltip title={chipTooltip || ''} placement="top" arrow disableHoverListener={!chipTooltip} componentsProps={{ tooltip: { sx: navyTipSx } }}>
        <Box sx={{ bgcolor: c.primaryLight, borderRadius: '4px', px: '6px', py: '2px', cursor: 'default' }}>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 11, fontWeight: 600, color: c.primary }}>{used}/{total}</Typography>
        </Box>
      </Tooltip>
    </Box>
  )
}

// ─── Shared: Create Space Multi-Select with Checkboxes ─────────────────────
function CreateSpaceSelector({
  selected, onChange, options, isPermissionDisabled, getDisabledTooltip, lockedOption
}: {
  selected: string[]
  onChange: (permissions: string[]) => void
  options: string[]
  isPermissionDisabled: (permission: string) => boolean
  getDisabledTooltip: (permission: string) => string | null
  lockedOption?: string
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const displayText = selected.length > 0 ? selected.join(', ') : 'No access'

  return (
    <>
      <FormControl fullWidth size="small">
        <Button
          onClick={e => setAnchorEl(e.currentTarget)}
          sx={{
            fontSize: 13,
            fontFamily: '"Open Sans",sans-serif',
            borderRadius: '8px',
            height: 40,
            border: `1px solid ${c.grey300}`,
            color: c.textPrimary,
            backgroundColor: '#fff',
            textAlign: 'left',
            justifyContent: 'flex-start',
            textTransform: 'none',
            '&:hover': { bgcolor: '#fff', borderColor: c.grey300 }
          }}
        >
          {displayText}
        </Button>
      </FormControl>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: '8px', minWidth: 280 } }}
      >
        {options.map(option => {
          const isLocked   = option === lockedOption
          const isDisabled = isLocked || isPermissionDisabled(option)
          const tooltip    = isLocked ? `${option} is required and cannot be removed` : getDisabledTooltip(option)
          const isChecked  = isLocked ? true : selected.includes(option)

          const menuItem = (
            <Box
              key={option}
              onClick={() => {
                if (!isDisabled) {
                  let newSelected: string[]
                  if (option === 'No access') {
                    // "No access" is exclusive — selecting it clears all others
                    newSelected = isChecked ? [] : ['No access']
                  } else {
                    // Selecting any real permission clears "No access" first
                    const withoutNoAccess = selected.filter(p => p !== 'No access')
                    newSelected = isChecked
                      ? withoutNoAccess.filter(p => p !== option)
                      : [...withoutNoAccess, option]
                  }
                  onChange(newSelected)
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                px: '12px',
                py: '10px',
                cursor: isDisabled ? 'default' : 'pointer',
                opacity: isDisabled && !isLocked ? 0.5 : 1,
                '&:hover': { bgcolor: !isDisabled ? c.grey100 : 'transparent' }
              }}
            >
              <Checkbox
                checked={isChecked}
                disabled={isDisabled}
                size="small"
                sx={{ '&.Mui-checked': { color: isLocked ? c.textSecondary : c.primary }, '&.Mui-checked.Mui-disabled': { color: c.textSecondary } }}
              />
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: isDisabled ? c.textSecondary : c.textPrimary }}>
                {option}
              </Typography>
            </Box>
          )

          return isDisabled && tooltip ? (
            <Tooltip key={option} title={tooltip} placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
              <div>{menuItem}</div>
            </Tooltip>
          ) : menuItem
        })}
      </Menu>
    </>
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

// ─── Seat-count helpers ────────────────────────────────────────────────────────
// Account owner counts as an editor seat; "Editor and Approver" contains "Editor"
function countEditorSeats(users: AccountUser[]): number {
  return users.filter(u => u.createSpace.includes('Editor') || u.createSpace === 'Account owner').length
}
// Users who already have editor access in Create space don't consume a contributor seat
function hasEditorAccess(u: AccountUser): boolean {
  return u.createSpace.includes('Editor') || u.createSpace === 'Account owner'
}
function countContributorSeats(users: AccountUser[]): number {
  return users.filter(u => u.amplifySpace === 'Contributor' && !hasEditorAccess(u)).length
}

// Counts users who hold a privileged Create-space role (Editor, Approver, or Account owner).
// Viewer and No-access don't consume a privileged seat.
function countPrivilegedCreateSpaceSeats(users: AccountUser[]): number {
  return users.filter(u =>
    u.createSpace.includes('Editor') ||
    u.createSpace.includes('Approver') ||
    u.createSpace === 'Account owner'
  ).length
}

// ─── Add User Dialog ───────────────────────────────────────────────────────
interface InviteRow { email: string; createSpace: string; amplifySpace: string }

function AddUserDialog({ open, onClose, onSend, users, asApprover = false }: {
  open: boolean
  onClose: () => void
  onSend: (rows: InviteRow[]) => void
  users: AccountUser[]
  asApprover?: boolean
}) {
  const defaultRow = asApprover
    ? { email: '', createSpace: 'Approver', createSpaceSelected: ['Approver'], amplifySpace: 'No access' }
    : { email: '', createSpace: 'Editor',   createSpaceSelected: ['Editor'],   amplifySpace: 'Contributor' }

  const [rows, setRows]         = useState<(InviteRow & { createSpaceSelected: string[] })[]>([defaultRow])
  const [noSeatsOpen, setNoSeatsOpen] = useState(false)
  const editorCount      = countEditorSeats(users)
  const contributorCount = countContributorSeats(users)

  // Reset rows when dialog opens with a different mode
  React.useEffect(() => {
    if (open) setRows([defaultRow])
  }, [open, asApprover])

  // Pending seats from rows being configured in this dialog
  const pendingEditorRows = rows.filter(r =>
    r.email.trim() !== '' && r.createSpaceSelected.includes('Editor')
  )
  const pendingContribRows = rows.filter(r =>
    r.email.trim() !== '' &&
    r.amplifySpace === 'Contributor' &&
    !r.createSpaceSelected.includes('Editor')
  )
  const displayEditorCount      = editorCount      + pendingEditorRows.length
  const displayContributorCount = contributorCount + pendingContribRows.length

  const updateRow = (i: number, field: keyof InviteRow, val: string) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  function handleSend() {
    const valid = rows.filter(r => r.email.trim())
    if (!valid.length) return
    const newEditors  = valid.filter(r => r.createSpaceSelected.includes('Editor')).length
    const newContribs = valid.filter(r => r.amplifySpace === 'Contributor' && !r.createSpaceSelected.includes('Editor')).length
    if (editorCount + newEditors > 10 || contributorCount + newContribs > 10) {
      setNoSeatsOpen(true)
      return
    }
    onSend(valid.map(({ createSpaceSelected, ...r }) => r))
    setRows([defaultRow])
  }

  const createSpaceOptions = ['Viewer', 'Approver', 'Editor', 'No access']
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
          <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: '24px', mb: '20px', pb: '20px', borderBottom: `1px solid ${c.grey300}` }}>
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
              <SeatHeader label="Create space" chipTooltip="Number of editors out of the allowed editor seats" used={displayEditorCount} total={10} />
              <Box sx={{ mt: '12px' }}>
                <CreateSpaceSelector
                  selected={row.createSpaceSelected}
                  onChange={(selected) => {
                    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, createSpaceSelected: selected, createSpace: selected.join(', ') || 'No access' } : r))
                  }}
                  options={createSpaceOptions}
                  isPermissionDisabled={(option) => isPermissionDisabled(option, row.createSpaceSelected)}
                  getDisabledTooltip={(option) => getDisabledTooltip(option, row.createSpaceSelected)}
                  lockedOption={asApprover ? 'Approver' : undefined}
                />
              </Box>
            </Box>
            <Box>
              <SeatHeader label="Amplify space" chipTooltip="Number of contributors out of the allowed contributor seats" used={displayContributorCount} total={10} />
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
            variant="contained"
            onClick={handleSend}
            disabled={!rows.some(r => r.email.trim())}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' }, '&:disabled': { bgcolor: c.grey300, boxShadow: 'none' } }}
          >
            Add users
          </Button>
        </Box>
      </Box>

      {/* No seats dialog */}
      <Dialog open={noSeatsOpen} onClose={() => setNoSeatsOpen(false)} maxWidth={false} PaperProps={{ sx: { width: 440, borderRadius: '12px', p: 0 } }}>
        <Box sx={{ px: '24px', py: '20px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '16px' }}>
            <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>No seats available</Typography>
            <IconButton size="small" onClick={() => setNoSeatsOpen(false)} sx={{ color: c.actionActive }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
          </Box>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textPrimary, mb: '24px', lineHeight: 1.6 }}>
            You've reached your seat limit and can't add more users with the selected permissions.
            Contact sales to increase your plan and get more seats.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="outlined" onClick={() => setNoSeatsOpen(false)} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary, borderColor: c.grey300 }}>
              Close
            </Button>
            <Button variant="contained" sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}>
              Contact sales
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Dialog>
  )
}

// ─── Add Approver Dialog ───────────────────────────────────────────────────────
function AddApproverDialog({ open, onClose, onAdd, allUsers, existingApproverIds = [], onOpenAddUser }: {
  open:                 boolean
  onClose:              () => void
  onAdd:                (email: string, createSpace: string, amplifySpace: string) => void
  allUsers:             AccountUser[]
  existingApproverIds?: string[]
  onOpenAddUser?:       () => void
}) {
  const editorCount             = countEditorSeats(allUsers)
  const contributorCount        = countContributorSeats(allUsers)
  const privilegedSeats         = countPrivilegedCreateSpaceSeats(allUsers)

  const [inputValue,          setInputValue]          = useState('')
  const [selectedUser,        setSelectedUser]        = useState<AccountUser | null>(null)
  const [createSpaceSelected, setCreateSpaceSelected] = useState<string[]>(['Approver'])
  const [amplifySpace,        setAmplifySpace]        = useState('No access')
  const [validationError,     setValidationError]     = useState('')
  const [seatConfirmOpen,     setSeatConfirmOpen]     = useState(false)

  const createSpaceOptions  = ['Viewer', 'Approver', 'Editor', 'No access']
  const amplifySpaceOptions = ['Contributor', 'No access']

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const trimmed   = inputValue.trim()
  const isNewEmail = trimmed.length > 0 && !selectedUser &&
    allUsers.every(u => u.user.email.toLowerCase() !== trimmed.toLowerCase())

  // Does the selected existing user already hold a privileged Create-space role?
  const userHasPrivilegedAccess = selectedUser && (
    selectedUser.createSpace.includes('Editor') ||
    selectedUser.createSpace.includes('Approver') ||
    selectedUser.createSpace === 'Account owner'
  )
  const userNeedsCreateAccess = !!selectedUser && !userHasPrivilegedAccess

  // Seat warnings
  const noSeatsForExisting     = userNeedsCreateAccess  && privilegedSeats >= 10
  const newUserEditorSeat      = isNewEmail && createSpaceSelected.includes('Editor')
  const newUserContribSeat     = isNewEmail && amplifySpace === 'Contributor' && !createSpaceSelected.includes('Editor')
  const notEnoughEditorSeats   = newUserEditorSeat  && editorCount    >= 10
  const notEnoughContribSeats  = newUserContribSeat && contributorCount >= 10
  const notEnoughSeats         = notEnoughEditorSeats || notEnoughContribSeats

  // Live seat counts for new-user section (include the pending user)
  const pendingEditorCount  = editorCount    + (newUserEditorSeat  ? 1 : 0)
  const pendingContribCount = contributorCount + (newUserContribSeat ? 1 : 0)

  const addDisabled =
    !trimmed ||
    noSeatsForExisting ||
    notEnoughSeats ||
    (isNewEmail && !isValidEmail(trimmed))

  const isPermissionDisabled = (perm: string) => {
    if (perm === 'Viewer' && (createSpaceSelected.includes('Editor') || createSpaceSelected.includes('Approver'))) return true
    if (perm === 'Editor'   && createSpaceSelected.includes('Viewer')) return true
    if (perm === 'Approver' && createSpaceSelected.includes('Viewer')) return true
    return false
  }
  const getDisabledTooltip = (perm: string): string | null => {
    if (perm === 'Viewer'   && createSpaceSelected.includes('Editor'))   return 'Viewer cannot be combined with Editor'
    if (perm === 'Viewer'   && createSpaceSelected.includes('Approver')) return 'Viewer cannot be combined with Approver'
    if (perm === 'Editor'   && createSpaceSelected.includes('Viewer'))   return 'Editor cannot be combined with Viewer'
    if (perm === 'Approver' && createSpaceSelected.includes('Viewer'))   return 'Approver cannot be combined with Viewer'
    return null
  }

  const reset = () => {
    setInputValue('')
    setSelectedUser(null)
    setCreateSpaceSelected(['Approver'])
    setAmplifySpace('No access')
    setValidationError('')
    setSeatConfirmOpen(false)
  }

  const performAdd = () => {
    const email       = selectedUser ? selectedUser.user.email : trimmed
    const createSpace = isNewEmail
      ? (createSpaceSelected.join(', ') || 'No access')
      : (selectedUser ? selectedUser.createSpace + (userNeedsCreateAccess ? ', Approver' : '') : 'Approver')
    onAdd(email, createSpace, amplifySpace)
    reset()
    onClose()
  }

  const handleAddClick = () => {
    if (isNewEmail && !isValidEmail(trimmed)) {
      setValidationError('Enter a valid email address')
      return
    }
    if (userNeedsCreateAccess && !noSeatsForExisting) {
      // show seat-use confirmation first
      setSeatConfirmOpen(true)
    } else {
      performAdd()
    }
  }

  React.useEffect(() => { if (!open) reset() }, [open])

  const warningSx = {
    display: 'flex', alignItems: 'flex-start', gap: '8px',
    bgcolor: '#FFF8E7', border: '1px solid #FFD54F',
    borderRadius: '8px', px: '14px', py: '12px', mb: '20px',
  }
  const warningIconSx = { fontSize: 16, color: '#F59E0B', mt: '1px', flexShrink: 0 }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: 520, borderRadius: '12px', p: 0 } }}>
        <Box sx={{ px: '24px', py: '20px' }}>

          {/* Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '24px' }}>
            <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>
              Add approver
            </Typography>
            <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* ── User autocomplete (always visible) ── */}
          <Box sx={{ mb: '20px' }}>
            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, mb: '6px' }}>
              Select or add user
            </Typography>
            <Autocomplete
              options={allUsers}
              value={selectedUser}
              inputValue={inputValue}
              freeSolo
              getOptionLabel={opt => typeof opt === 'string' ? opt : opt.user.email}
              onChange={(_, opt) => {
                if (opt && typeof opt !== 'string') {
                  setSelectedUser(opt)
                  setInputValue(opt.user.email)
                  setValidationError('')
                } else if (!opt) {
                  setSelectedUser(null)
                  setInputValue('')
                  setValidationError('')
                }
              }}
              onInputChange={(_, value, reason) => {
                if (reason === 'input') {
                  setInputValue(value)
                  setSelectedUser(null)
                  setValidationError('')
                }
              }}
              getOptionDisabled={opt => typeof opt !== 'string' && existingApproverIds.includes(opt.user.id)}
              renderOption={(props, opt) => {
                const disabled = existingApproverIds.includes(opt.user.id)
                const content  = (
                  <Box component="li" {...props} key={opt.user.id}
                    sx={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'flex-start !important',
                      py: '10px !important', px: '12px !important',
                      opacity: disabled ? 0.45 : 1,
                      pointerEvents: disabled ? 'none' : 'auto',
                    }}
                  >
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, lineHeight: 1.4 }}>
                      {opt.user.name}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary, lineHeight: 1.4 }}>
                      {opt.user.email}
                    </Typography>
                  </Box>
                )
                return disabled ? (
                  <Tooltip key={opt.user.id} title={`${opt.user.name} is already an approver`} placement="right" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
                    <span>{content}</span>
                  </Tooltip>
                ) : content
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  placeholder="Search by name or enter email..."
                  size="small"
                  error={!!validationError}
                  helperText={validationError}
                  sx={{
                    '& .MuiInputBase-input': { fontFamily: '"Open Sans",sans-serif', fontSize: 13 },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 },
                    '& .MuiFormHelperText-root': { fontFamily: '"Open Sans",sans-serif', fontSize: 12 },
                  }}
                />
              )}
            />
          </Box>

          {/* ── New-user mode: space permissions + invitation note ── */}
          {isNewEmail && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', mb: '20px' }}>
              {/* Create space */}
              <Box>
                <SeatHeader
                  label="Create space"
                  chipTooltip="Number of editors out of the allowed editor seats"
                  used={pendingEditorCount}
                  total={10}
                />
                <Box sx={{ mt: '8px' }}>
                  <CreateSpaceSelector
                    selected={createSpaceSelected}
                    onChange={sel => setCreateSpaceSelected(sel)}
                    options={createSpaceOptions}
                    isPermissionDisabled={isPermissionDisabled}
                    getDisabledTooltip={getDisabledTooltip}
                    lockedOption="Approver"
                  />
                </Box>
              </Box>

              {/* Amplify space */}
              <Box>
                <SeatHeader
                  label="Amplify space"
                  iconTooltip="Access to available templates made by editors and analytics for sent videos. Users with editor access in Create space don't use a contributor seat."
                  chipTooltip="Number of contributors out of the allowed contributor seats"
                  used={pendingContribCount}
                  total={10}
                />
                <FormControl fullWidth size="small" sx={{ mt: '8px' }}>
                  <Select
                    value={amplifySpace}
                    onChange={e => setAmplifySpace(e.target.value as string)}
                    sx={{ fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 }, height: 40 }}
                  >
                    {amplifySpaceOptions.map(o => (
                      <MenuItem key={o} value={o} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13 }}>{o}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Invitation info */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', bgcolor: c.primaryLight, borderRadius: '8px', px: '14px', py: '12px' }}>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: c.primary, mt: '1px', flexShrink: 0 }} />
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                  This user will receive an email invitation and will need to create an account to get access.
                </Typography>
              </Box>
            </Box>
          )}

          {/* ── Not-enough-seats warnings ── */}
          {noSeatsForExisting && (
            <Box sx={warningSx}>
              <InfoOutlinedIcon sx={warningIconSx} />
              <Box>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, fontWeight: 600, mb: '2px' }}>
                  No Create space seats available
                </Typography>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                  You've reached the Create space seat limit.{' '}
                  <Box component="span" sx={{ color: c.primary, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                    Contact sales
                  </Box>{' '}
                  to get more seats.
                </Typography>
              </Box>
            </Box>
          )}

          {notEnoughEditorSeats && (
            <Box sx={warningSx}>
              <InfoOutlinedIcon sx={warningIconSx} />
              <Box>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, fontWeight: 600, mb: '2px' }}>
                  No editor seats available
                </Typography>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                  You've reached the editor seat limit.{' '}
                  <Box component="span" sx={{ color: c.primary, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                    Contact sales
                  </Box>{' '}
                  to get more seats.
                </Typography>
              </Box>
            </Box>
          )}

          {notEnoughContribSeats && (
            <Box sx={warningSx}>
              <InfoOutlinedIcon sx={warningIconSx} />
              <Box>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, fontWeight: 600, mb: '2px' }}>
                  No contributor seats available
                </Typography>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                  You've reached the contributor seat limit.{' '}
                  <Box component="span" sx={{ color: c.primary, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                    Contact sales
                  </Box>{' '}
                  to get more seats.
                </Typography>
              </Box>
            </Box>
          )}

          {/* ── Actions ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              variant="text"
              startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
              onClick={() => { reset(); onClose(); onOpenAddUser?.() }}
              sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, textTransform: 'none', color: c.primary, p: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
            >
              Add new user
            </Button>

            <Box sx={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary, borderColor: c.grey300 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddClick}
                disabled={addDisabled}
                sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: c.grey300, color: '#fff', boxShadow: 'none' } }}
              >
                Add approver
              </Button>
            </Box>
          </Box>

        </Box>
      </Dialog>

      {/* ── Seat-use confirmation dialog ── */}
      {selectedUser && (
        <Dialog
          open={seatConfirmOpen}
          onClose={() => setSeatConfirmOpen(false)}
          maxWidth={false}
          PaperProps={{ sx: { width: 460, borderRadius: '12px', p: 0 } }}
        >
          <Box sx={{ px: '24px', py: '20px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '16px' }}>
              <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>
                Use a Create space seat?
              </Typography>
              <IconButton size="small" onClick={() => setSeatConfirmOpen(false)} sx={{ color: c.actionActive }}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textPrimary, mb: '24px', lineHeight: 1.6 }}>
              <strong>{selectedUser.user.name}</strong> currently has{' '}
              <strong>{selectedUser.createSpace === 'No access' ? 'no access' : 'Viewer access'}</strong>{' '}
              to Create space. Adding them as an approver will give them Create space access and use{' '}
              <strong>1 seat</strong> ({privilegedSeats + 1}/10 used after this action).
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button
                variant="outlined"
                onClick={() => setSeatConfirmOpen(false)}
                sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary, borderColor: c.grey300 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={performAdd}
                sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
              >
                Add approver
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}
    </>
  )
}

// ─── Edit Permissions Dialog ──────────────────────────────────────────────────
function EditPermissionsDialog({ open, onClose, user, users, onSave }: {
  open: boolean
  onClose: () => void
  user: AccountUser | null
  users: AccountUser[]
  onSave: (createSpace: string, amplifySpace: string) => void
}) {
  const editorCount      = countEditorSeats(users)
  const contributorCount = countContributorSeats(users)
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
          <SeatHeader label="Create space" chipTooltip="Number of editors out of the allowed editor seats" used={editorCount} total={10} />
          <Box sx={{ mt: '12px' }}>
            <CreateSpaceSelector
              selected={createSpaceSelected}
              onChange={(selected) => {
                setCreateSpaceSelected(selected)
                setCreateSpace(selected.join(', ') || 'No access')
              }}
              options={createSpaceOptions}
              isPermissionDisabled={isPermissionDisabled}
              getDisabledTooltip={getDisabledTooltip}
            />
          </Box>
        </Box>

        {/* Amplify space section */}
        <Box sx={{ mb: '24px', borderBottom: `1px solid ${c.grey300}`, pb: '12px' }}>
          <SeatHeader label="Amplify space" chipTooltip="Number of contributors out of the allowed contributor seats" used={contributorCount} total={10} />
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
  const [search, setSearch]               = useState('')
  const [addApproverDialogOpen, setAddApproverDialogOpen] = useState(false)
  const [inviteOpen, setInviteOpen]       = useState(false)
  const [inviteAsApprover, setInviteAsApprover] = useState(false)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [removeApproverOpen, setRemoveApproverOpen] = useState(false)
  const [approverToRemove, setApproverToRemove] = useState<AccountUser | null>(null)
  const [approverMenuAnchor, setApproverMenuAnchor] = useState<HTMLElement | null>(null)
  const [approverMenuUser, setApproverMenuUser]     = useState<AccountUser | null>(null)
  const [confirmApproversOpen, setConfirmApproversOpen] = useState(false)
  const [pendingApprovers, setPendingApprovers] = useState<ApproverCreateSpacePermission[]>([])

  const approvers = users.filter(u => approverIds.has(u.user.id))
  const filtered  = search
    ? approvers.filter(r => r.user.name.toLowerCase().includes(search.toLowerCase()) || r.user.email.toLowerCase().includes(search.toLowerCase()))
    : approvers

  const editorCount      = countEditorSeats(users)
  const contributorCount = countContributorSeats(users)

  const headCellSx = { fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`, py: '10px', px: '16px', whiteSpace: 'nowrap' as const, bgcolor: '#fff', position: 'sticky', top: 0, zIndex: 3 }
  const bodyCellSx = { fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`, py: '10px', px: '16px' }

  function handleAddApprovers(newIds: string[]) {
    const trulyNew = newIds.filter(id => !approverIds.has(id))
    const newApproverUsers = users.filter(u => trulyNew.includes(u.user.id))
    const needingCreateAccess = newApproverUsers.filter(u => u.createSpace === 'No access')

    if (needingCreateAccess.length > 0) {
      const pendingPerms: ApproverCreateSpacePermission[] = needingCreateAccess.map(u => ({
        userId: u.user.id,
        userName: u.user.name,
        currentCreateSpace: u.createSpace,
        newCreateSpace: 'Viewer',
      }))
      setPendingApprovers(pendingPerms)
      setConfirmApproversOpen(true)
    } else {
      // Merge new IDs with existing ones so no existing approver is lost
      onSetApprovers([...Array.from(approverIds), ...trulyNew])
    }
  }

  function handleConfirmApproversWithPermissions(permissions: ApproverCreateSpacePermission[]) {
    const allIds = [...Array.from(approverIds), ...permissions.map(p => p.userId)]
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
            Require approvals from specific users for videos and templates
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
                <Table size="small" sx={{ width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...headCellSx, width: 220, position: 'sticky', left: 0, zIndex: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          User <ArrowDownwardIcon sx={{ fontSize: 13, color: c.actionActive }} />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ ...headCellSx }}>
                        <SeatHeader label="Create space" iconTooltip="Access to the video and template editors, analytics, and AI features" chipTooltip="Number of editors out of the allowed editor seats" used={editorCount} total={10} />
                      </TableCell>
                      <TableCell sx={{ ...headCellSx }}>
                        <SeatHeader label="Amplify space" iconTooltip="Access to available templates made by editors and analytics for sent videos. Users with editor access in Create space don't use a contributor seat." chipTooltip="Number of contributors out of the allowed contributor seats" used={contributorCount} total={10} />
                      </TableCell>
                      <TableCell sx={{ ...headCellSx, width: 48, p: 0, position: 'sticky', right: 0, zIndex: 4 }} />
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
                            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.createSpace === 'No access' ? c.textSecondary : c.textPrimary }}>
                              {row.createSpace}
                            </Typography>
                          </TableCell>
                          <TableCell sx={bodyCellSx}>
                            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.amplifySpace === 'No access' ? c.textSecondary : c.textPrimary }}>
                              {row.amplifySpace}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ ...bodyCellSx, px: '4px', width: 48, position: 'sticky', right: 0, zIndex: 2, bgcolor: isHovered ? c.grey100 : '#fff' }}>
                            {(isHovered || approverMenuUser?.user.id === row.user.id) && (
                              <IconButton
                                size="small"
                                onClick={e => { setApproverMenuAnchor(e.currentTarget); setApproverMenuUser(row) }}
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
            )}
            {/* Approver options popup */}
            <Menu
              anchorEl={approverMenuAnchor}
              open={!!approverMenuAnchor}
              onClose={() => setApproverMenuAnchor(null)}
              PaperProps={{ sx: { borderRadius: '10px', minWidth: 240, boxShadow: '0px 4px 20px rgba(3,25,79,0.15)', py: '8px' } }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {approverMenuUser && [
                <Box key="name" sx={{ px: '16px', pt: '4px', pb: '8px' }}>
                  <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 700, color: c.textPrimary }}>
                    {approverMenuUser.user.name}
                  </Typography>
                </Box>,
                <Box key="details" sx={{ px: '16px', pb: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { label: 'Role', value: approverMenuUser.jobRole },
                    { label: 'Email', value: approverMenuUser.user.email },
                    { label: 'Created on', value: approverMenuUser.pending ? '—' : approverMenuUser.createdDate },
                    ...(approverMenuUser.addedAsApprover ? [{ label: 'Approver since', value: approverMenuUser.addedAsApprover }] : []),
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ display: 'flex', gap: '6px' }}>
                      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary, minWidth: 90 }}>{label}:</Typography>
                      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textPrimary }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>,
                <Divider key="divider" sx={{ my: '4px' }} />,
                <MenuItem
                  key="remove"
                  onClick={() => { setApproverToRemove(approverMenuUser); setRemoveApproverOpen(true); setApproverMenuAnchor(null) }}
                  sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: '#E53935', px: '16px', py: '8px', gap: '10px' }}
                >
                  <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                  Remove approver role
                </MenuItem>,
              ]}
            </Menu>
          </Box>
        )}
      </Box>

      {/* Add Approver Dialog */}
      <AddApproverDialog
        open={addApproverDialogOpen}
        onClose={() => setAddApproverDialogOpen(false)}
        allUsers={users}
        existingApproverIds={Array.from(approverIds)}
        onOpenAddUser={() => { setInviteAsApprover(true); setInviteOpen(true) }}
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
        onClose={() => { setInviteOpen(false); setInviteAsApprover(false) }}
        onSend={rows => { onAddUsers(rows, true); setInviteOpen(false); setInviteAsApprover(false) }}
        users={users}
        asApprover={inviteAsApprover}
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
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null)
  const [userMenuUser, setUserMenuUser]     = useState<AccountUser | null>(null)
  const [usersList, setUsersList] = useState<AccountUser[]>(users)

  const filtered = search
    ? usersList.filter(r => r.user.name.toLowerCase().includes(search.toLowerCase()) || r.user.email.toLowerCase().includes(search.toLowerCase()))
    : usersList

  // Sync usersList with users prop
  React.useEffect(() => {
    setUsersList(users)
  }, [users])

  const editorCount      = countEditorSeats(usersList)
  const contributorCount = countContributorSeats(usersList)

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
            variant="outlined"
            onClick={() => setInviteOpen(true)}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontWeight: 600, fontSize: 14, textTransform: 'none', borderRadius: '8px', px: '16px', py: '7px', color: c.primary, borderColor: c.grey300, '&:hover': { bgcolor: c.primaryLight, borderColor: c.primary, boxShadow: 'none' } }}
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
      <Box sx={{ flex: 1, overflowX: 'auto', overflowY: 'auto', borderRadius: '8px', border: `1px solid ${c.grey300}` }}>
        <Table size="small" sx={{ width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headCellSx, width: 220, position: 'sticky', left: 0, zIndex: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  User <ArrowDownwardIcon sx={{ fontSize: 14, color: c.actionActive }} />
                </Box>
              </TableCell>
              <TableCell sx={{ ...headCellSx }}>
                <SeatHeader
                  label="Create space"
                                   iconTooltip="Access to the video and template editors, analytics, and AI features"
                  chipTooltip="Number of editors out of the allowed editor seats"
                  used={editorCount} total={10}
                />
              </TableCell>
              <TableCell sx={{ ...headCellSx }}>
                <SeatHeader
                  label="Amplify space"
                                   iconTooltip="Access to available templates made by editors and analytics for sent videos. Users with editor access in Create space don't use a contributor seat."
                  chipTooltip="Number of contributors out of the allowed contributor seats"
                  used={contributorCount} total={10}
                />
              </TableCell>
              <TableCell sx={{ ...headCellSx, width: 190 }}>Last login</TableCell>
              <TableCell sx={{ ...headCellSx, width: 48, p: 0, position: 'sticky', right: 0, zIndex: 4 }} />
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.createSpace === 'No access' ? c.textSecondary : c.textPrimary, whiteSpace: 'pre-line' }}>
                        {row.createSpace}
                      </Typography>
                      <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isHovered && !row.isOwner && (
                          <Tooltip title="Edit permissions" placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
                            <IconButton size="small" onClick={() => { setEditingUser(row); setEditPermOpen(true) }} sx={{ color: c.primary, '&:hover': { bgcolor: 'rgba(0,83,229,0.1)' }, p: '4px' }}>
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.amplifySpace === 'No access' ? c.textSecondary : c.textPrimary }}>
                        {row.amplifySpace}
                      </Typography>
                      <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isHovered && !row.isOwner && (
                          <Tooltip title="Edit permissions" placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
                            <IconButton size="small" onClick={() => { setEditingUser(row); setEditPermOpen(true) }} sx={{ color: c.primary, '&:hover': { bgcolor: 'rgba(0,83,229,0.1)' }, p: '4px' }}>
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ ...bodyCellSx, width: 190 }}>
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.pending ? c.textSecondary : c.textPrimary, fontStyle: row.pending ? 'italic' : 'normal', whiteSpace: 'nowrap' }}>
                      {row.pending ? 'Pending' : row.lastLogin}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...bodyCellSx, px: '4px', width: 48, position: 'sticky', right: 0, zIndex: 2, bgcolor: isHovered ? c.grey100 : '#fff' }}>
                    {(isHovered || userMenuUser?.user.id === row.user.id) && !row.isOwner && (
                      <IconButton
                        size="small"
                        onClick={e => { setUserMenuAnchor(e.currentTarget); setUserMenuUser(row) }}
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
        users={usersList}
      />

      {/* Edit Permissions Dialog */}
      <EditPermissionsDialog
        open={editPermOpen}
        onClose={() => setEditPermOpen(false)}
        user={editingUser}
        users={usersList}
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

      {/* Options popup menu — media-library style */}
      <Menu
        anchorEl={userMenuAnchor}
        open={!!userMenuAnchor}
        onClose={() => setUserMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: '10px', minWidth: 240, boxShadow: '0px 4px 20px rgba(3,25,79,0.15)', py: '8px' } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User info — non-interactive */}
        {userMenuUser && [
          <Box key="name" sx={{ px: '16px', pt: '4px', pb: '8px' }}>
            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 700, color: c.textPrimary }}>
              {userMenuUser.user.name}
            </Typography>
          </Box>,
          <Box key="details" sx={{ px: '16px', pb: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: 'Role', value: userMenuUser.jobRole },
              { label: 'Email', value: userMenuUser.user.email },
              { label: 'Created on', value: userMenuUser.pending ? '—' : userMenuUser.createdDate },
              ...(userMenuUser.addedAsApprover ? [{ label: 'Approver since', value: userMenuUser.addedAsApprover }] : []),
            ].map(({ label, value }) => (
              <Box key={label} sx={{ display: 'flex', gap: '6px' }}>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary, minWidth: 80 }}>{label}:</Typography>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textPrimary }}>{value}</Typography>
              </Box>
            ))}
          </Box>,
          <Divider key="divider" sx={{ my: '4px' }} />,
          <MenuItem
            key="edit"
            onClick={() => { setEditingUser(userMenuUser); setEditPermOpen(true); setUserMenuAnchor(null) }}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, px: '16px', py: '8px', gap: '10px' }}
          >
            <EditOutlinedIcon sx={{ fontSize: 16, color: c.actionActive }} />
            Edit permissions
          </MenuItem>,
          <MenuItem
            key="remove"
            onClick={() => { setUserToDelete(userMenuUser); setDeleteOpen(true); setUserMenuAnchor(null) }}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: '#E53935', px: '16px', py: '8px', gap: '10px' }}
          >
            <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
            Remove from account
          </MenuItem>,
        ]}
      </Menu>
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
