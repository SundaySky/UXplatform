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

export const INITIAL_USERS: AccountUser[] = [
  { user: OWNER_USER,    isOwner: true, createSpace: 'Account owner', amplifySpace: 'Contributor', jobRole: 'Integrator',      lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[1],               createSpace: 'Editor',          amplifySpace: 'Contributor',   jobRole: 'Data Analyst',    lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[2],               createSpace: 'Editor',          amplifySpace: 'No access',     jobRole: 'Marketing',       lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[3],               createSpace: 'No access',       amplifySpace: 'Contributor',   jobRole: 'Creative Agency', lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[4],               createSpace: 'Viewer',          amplifySpace: 'No access',     jobRole: 'Marketing',       lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[5],               createSpace: 'Editor',              amplifySpace: 'Contributor', jobRole: 'Marketing', lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
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

  // Permission descriptions
  const permissionDescriptions: Record<string, string> = {
    'Account owner': 'Can edit, add users and change permissions',
    'Editor': 'Can edit videos and templates. Uses a seat.',
    'Approver': 'Can approve videos and templates and leave feedback. Uses a seat.',
    'Viewer': 'Has access to videos and template content with no option to share or edit.',
    'No access': 'Cannot view or edit videos and templates.'
  }

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
        PaperProps={{ sx: { borderRadius: '8px', minWidth: 320 } }}
      >
        {options.map(option => {
          const isLocked   = option === lockedOption
          const isDisabled = isLocked || isPermissionDisabled(option)
          const tooltip    = isLocked ? `${option} is required and cannot be removed` : getDisabledTooltip(option)
          const isChecked  = isLocked ? true : selected.includes(option)
          const description = permissionDescriptions[option] || ''

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
                alignItems: 'flex-start',
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
                sx={{ '&.Mui-checked': { color: isLocked ? c.textSecondary : c.primary }, '&.Mui-checked.Mui-disabled': { color: c.textSecondary }, mt: '2px', flexShrink: 0 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: isDisabled ? c.textSecondary : c.textPrimary }}>
                  {option}
                </Typography>
                {description && (
                  <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary, mt: '2px', lineHeight: 1.4 }}>
                    {description}
                  </Typography>
                )}
              </Box>
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

function AddUserDialog({ open, onClose, onSend, users, asApprover = false, onEditExistingUser }: {
  open: boolean
  onClose: () => void
  onSend: (rows: InviteRow[]) => void
  users: AccountUser[]
  asApprover?: boolean
  onEditExistingUser?: (user: AccountUser) => void
}) {
  const defaultRow = asApprover
    ? { email: '', createSpace: 'Approver', createSpaceSelected: ['Approver'], amplifySpace: 'No access' }
    : { email: '', createSpace: 'Editor',   createSpaceSelected: ['Editor'],   amplifySpace: 'Contributor' }

  const [rows, setRows]         = useState<(InviteRow & { createSpaceSelected: string[], emailError?: string })[]>([defaultRow])
  const [noSeatsOpen, setNoSeatsOpen] = useState(false)
  const [validationTimeouts, setValidationTimeouts] = useState<Record<number, ReturnType<typeof setTimeout>>>({})
  const [dialogMode, setDialogMode] = useState<'add' | 'existing'>('add')
  const [existingUser, setExistingUser] = useState<AccountUser | null>(null)

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  const contributorCount       = countContributorSeats(users)
  // Create space seat = Editor OR Approver (not Viewer, not No access)
  const createSpaceSeatsUsed   = countPrivilegedCreateSpaceSeats(users)

  // Reset rows when dialog opens with a different mode, and cleanup timeouts
  React.useEffect(() => {
    if (open) {
      setRows([defaultRow])
      setValidationTimeouts({})
    }
    return () => {
      // Clean up all timeouts
      Object.values(validationTimeouts).forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [open, asApprover])

  // Pending rows that would consume a Create space seat (Editor or Approver)
  const pendingCreateRows = rows.filter(r =>
    r.email.trim() !== '' &&
    (r.createSpaceSelected.includes('Editor') || r.createSpaceSelected.includes('Approver'))
  )
  // Pending contributor rows (Contributor in Amplify, not an Editor)
  const pendingContribRows = rows.filter(r =>
    r.email.trim() !== '' &&
    r.amplifySpace === 'Contributor' &&
    !r.createSpaceSelected.includes('Editor')
  )
  const displayCreateSpaceCount = createSpaceSeatsUsed + pendingCreateRows.length
  const displayContributorCount = contributorCount     + pendingContribRows.length

  const updateRow = (i: number, field: string, val: string) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

    // Handle email field validation with delay
    if (field === 'email') {
      // Clear existing timeout for this row
      if (validationTimeouts[i]) {
        clearTimeout(validationTimeouts[i])
      }

      // Clear error immediately while typing
      setRows(prev => prev.map((r, idx) => idx === i ? { ...r, emailError: '' } : r))

      // Set new timeout to validate after 500ms
      if (val.trim().length > 0) {
        const timeout = setTimeout(() => {
          const trimmedEmail = val.trim()
          const isValid = isValidEmail(trimmedEmail)

          if (!isValid) {
            setRows(prevRows =>
              prevRows.map((row, idx) => {
                if (idx !== i) return row
                return {
                  ...row,
                  emailError: 'Enter a valid email address'
                }
              })
            )
          } else {
            // Check if email matches an existing user
            const existingMatch = users.find(u => u.user.email.toLowerCase() === trimmedEmail.toLowerCase())
            if (existingMatch) {
              setExistingUser(existingMatch)
              setDialogMode('existing')
            } else {
              setRows(prevRows =>
                prevRows.map((row, idx) => {
                  if (idx !== i) return row
                  return { ...row, emailError: '' }
                })
              )
            }
          }
        }, 500)
        setValidationTimeouts(prev => ({ ...prev, [i]: timeout }))
      }
    }
  }

  function handleSend() {
    const valid = rows.filter(r => r.email.trim())
    if (!valid.length) return

    const newCreateSeats = valid.filter(r =>
      r.createSpaceSelected.includes('Editor') || r.createSpaceSelected.includes('Approver')
    ).length
    const newContribs    = valid.filter(r =>
      r.amplifySpace === 'Contributor' && !r.createSpaceSelected.includes('Editor')
    ).length
    if (createSpaceSeatsUsed + newCreateSeats > 10 || contributorCount + newContribs > 10) {
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
    if (permission === 'Viewer' && selected.includes('Editor')) return "Viewer and Editor can't be selected together"
    if (permission === 'Viewer' && selected.includes('Approver')) return "Viewer and Approver can't be selected together"
    if (permission === 'Editor' && selected.includes('Viewer')) return "Editor and Viewer can't be selected together"
    if (permission === 'Approver' && selected.includes('Viewer')) return "Approver and Viewer can't be selected together"
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: dialogMode === 'existing' ? 500 : 520, borderRadius: '12px', p: 0 } }}>
      <Box sx={{ px: '24px', py: '20px' }}>
        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: dialogMode === 'existing' ? '16px' : '24px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>
            {dialogMode === 'existing' ? 'Add user' : 'Add users'}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>

        {dialogMode === 'existing' && existingUser ? (
          <>
            {/* Existing user dialog content */}
            <OutlinedInput
              fullWidth
              disabled
              value={existingUser.user.email}
              placeholder="user@example.com"
              sx={{ fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px', height: 40, mb: '16px', '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 } }}
            />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px', bgcolor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', px: '14px', py: '12px', mb: '24px' }}>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: '#D97706', mt: '1px', flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, fontWeight: 600, mb: '4px' }}>
                  This email is already in use in this account.
                </Typography>
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                  You can edit the user type if necessary.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button
                variant="outlined"
                onClick={() => setDialogMode('add')}
                sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary, borderColor: c.grey300 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (existingUser) {
                    onEditExistingUser?.(existingUser)
                    setDialogMode('add')
                  }
                }}
                sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
              >
                Edit user type
              </Button>
            </Box>
          </>
        ) : (
          <>
            {/* Add users dialog content */}
            {/* Rows */}
        {rows.map((row, i) => (
          <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: '24px', mb: '20px', pb: '20px', borderBottom: `1px solid ${c.grey300}` }}>
            <Box>
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, fontWeight: 600, color: c.textSecondary, mb: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</Typography>
              <OutlinedInput
                placeholder="user@example.com"
                value={row.email}
                onChange={e => updateRow(i, 'email', e.target.value)}
                error={!!row.emailError}
                fullWidth
                sx={{ fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px', height: 40, '& .MuiOutlinedInput-notchedOutline': { borderColor: row.emailError ? '#F87171' : c.grey300 } }}
              />
              {row.emailError && (
                <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: '#F87171', mt: '4px' }}>
                  {row.emailError}
                </Typography>
              )}
            </Box>
            <Box>
              <SeatHeader label="Create access" chipTooltip="Number of Create access seats used (Editor or Approver roles)" used={displayCreateSpaceCount} total={10} />
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
                <Select value={row.amplifySpace} onChange={e => updateRow(i, 'amplifySpace', e.target.value as string)} renderValue={v => v as string} sx={selectSx}>
                  {amplifySpaceOptions.map(o => (
                    <MenuItem key={o} value={o} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, py: '12px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary }}>
                          {o}
                        </Typography>
                        {o === 'Contributor' && (
                          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary }}>
                            Can access templates made by editors
                          </Typography>
                        )}
                        {o === 'No access' && (
                          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary }}>
                            Cannot access any templates or contributors features
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        ))}

        {/* Info box */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', bgcolor: c.primaryLight, borderRadius: '8px', px: '14px', py: '12px', mb: '20px' }}>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: c.primary, mt: '1px', flexShrink: 0 }} />
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
            The user will receive an email invitation and will need to create an account to get access.
          </Typography>
        </Box>

        {/* Seat warning */}
        {(displayCreateSpaceCount > 10 || displayContributorCount > 10) && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', bgcolor: '#FFF8E7', border: '1px solid #FFD54F', borderRadius: '8px', px: '14px', py: '12px', mb: '20px' }}>
            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#F59E0B', mt: '1px', flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, mb: '2px' }}>
                No seats available
              </Typography>
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                You've reached your seat limit.{' '}
                <Box component="span" sx={{ color: c.primary, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                  Contact sales
                </Box>{' '}
                to get more seats. (Note: Viewer permission does not consume a Create space seat.)
              </Typography>
            </Box>
          </Box>
        )}

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
                disabled={!rows.some(r => r.email.trim()) || displayCreateSpaceCount > 10 || displayContributorCount > 10 || rows.some(r => r.emailError)}
                sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: c.grey300, color: '#fff', boxShadow: 'none' } }}
              >
                Add users
              </Button>
            </Box>
          </>
        )}
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
  // Create space seat = Editor or Approver (privileged role)
  const privilegedSeats         = countPrivilegedCreateSpaceSeats(allUsers)

  const [inputValue,         setInputValue]         = useState('')
  const [selectedUser,       setSelectedUser]       = useState<AccountUser | null>(null)
  const [validationError,    setValidationError]    = useState('')
  const [seatConfirmOpen,    setSeatConfirmOpen]    = useState(false)
  const [newUserConfirmOpen, setNewUserConfirmOpen] = useState(false)
  const [validationTimeout,  setValidationTimeout]  = useState<ReturnType<typeof setTimeout> | null>(null)

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const trimmed    = inputValue.trim()
  const isNewEmail = trimmed.length > 0 && !selectedUser &&
    allUsers.every(u => u.user.email.toLowerCase() !== trimmed.toLowerCase())

  // Does the selected existing user already hold a privileged Create-space role?
  const userHasPrivilegedAccess = selectedUser && (
    selectedUser.createSpace.includes('Editor') ||
    selectedUser.createSpace.includes('Approver') ||
    selectedUser.createSpace === 'Account owner'
  )
  const userNeedsCreateAccess = !!selectedUser && !userHasPrivilegedAccess

  // Existing user with no privileged access → adding as Approver uses 1 Create space seat
  const noSeatsForExisting = userNeedsCreateAccess && privilegedSeats >= 10
  // New email always uses a Create space seat (Approver role)
  const noSeatsForNewEmail = isNewEmail && privilegedSeats >= 10

  const addDisabled =
    !trimmed ||
    noSeatsForExisting ||
    noSeatsForNewEmail ||
    !!validationError

  const reset = () => {
    setInputValue('')
    setSelectedUser(null)
    setValidationError('')
    setSeatConfirmOpen(false)
    setNewUserConfirmOpen(false)
    if (validationTimeout) clearTimeout(validationTimeout)
  }

  const performAdd = () => {
    const email       = selectedUser ? selectedUser.user.email : trimmed
    const createSpace = isNewEmail
      ? 'Approver'
      : (selectedUser ? selectedUser.createSpace + (userNeedsCreateAccess ? ', Approver' : '') : 'Approver')
    onAdd(email, createSpace, 'No access')
    reset()
    onClose()
  }

  const handleAddClick = () => {
    if (isNewEmail && !isValidEmail(trimmed)) {
      setValidationError('Enter a valid email address')
      return
    }
    if (isNewEmail && !noSeatsForNewEmail) {
      // New user - show invitation and seat confirmation
      setNewUserConfirmOpen(true)
    } else if (userNeedsCreateAccess && !noSeatsForExisting) {
      // Existing user needing seat - show seat-use confirmation
      setSeatConfirmOpen(true)
    } else {
      performAdd()
    }
  }

  React.useEffect(() => {
    if (!open) {
      reset()
    }
    return () => {
      if (validationTimeout) clearTimeout(validationTimeout)
    }
  }, [open])

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

                  // Clear existing timeout
                  if (validationTimeout) clearTimeout(validationTimeout)

                  // Set new timeout to validate after 500ms of inactivity
                  if (value.trim().length > 0) {
                    const timeout = setTimeout(() => {
                      const trimmed = value.trim()
                      const isNew = trimmed.length > 0 && allUsers.every(u => u.user.email.toLowerCase() !== trimmed.toLowerCase())
                      if (isNew && !isValidEmail(trimmed)) {
                        setValidationError('Enter a valid email address')
                      }
                    }, 500)
                    setValidationTimeout(timeout)
                  }
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

          {/* ── New-user mode: invitation note ── */}
          {isNewEmail && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', bgcolor: c.primaryLight, borderRadius: '8px', px: '14px', py: '12px', mb: '20px' }}>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: c.primary, mt: '1px', flexShrink: 0 }} />
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                The user will be notified by email and will need to create an account to access SundaySky.
              </Typography>
            </Box>
          )}

          {/* ── Not-enough-seats warnings ── */}
          {(noSeatsForExisting || noSeatsForNewEmail) && (
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
                  to get more seats. (Note: Viewer permission does not consume a Create space seat.)
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

      {/* ── Seat-use confirmation dialog for existing user ── */}
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

      {/* ── New user invitation confirmation dialog ── */}
      <Dialog
        open={newUserConfirmOpen}
        onClose={() => setNewUserConfirmOpen(false)}
        maxWidth={false}
        PaperProps={{ sx: { width: 460, borderRadius: '12px', p: 0 } }}
      >
        <Box sx={{ px: '24px', py: '20px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '16px' }}>
            <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>
              Add new approver
            </Typography>
            <IconButton size="small" onClick={() => setNewUserConfirmOpen(false)} sx={{ color: c.actionActive }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textPrimary, mb: '16px', lineHeight: 1.6 }}>
            <strong>{trimmed}</strong> will receive an email invitation and will need to create an account to get access.
          </Typography>

          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textPrimary, mb: '24px', lineHeight: 1.6 }}>
            Adding them as an approver will use <strong>1 Create space seat</strong> ({privilegedSeats + 1}/10 used after this action).
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button
              variant="outlined"
              onClick={() => setNewUserConfirmOpen(false)}
              sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary, borderColor: c.grey300 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => { performAdd(); setNewUserConfirmOpen(false) }}
              sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
            >
              Add approver
            </Button>
          </Box>
        </Box>
      </Dialog>
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
  const privilegedSeats = countPrivilegedCreateSpaceSeats(users)
  const editorCount = countEditorSeats(users)
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

  // Check if current user has privileged access
  const userCurrentlyHasPrivilegedAccess = user && (
    user.createSpace.includes('Editor') ||
    user.createSpace.includes('Approver') ||
    user.createSpace === 'Account owner'
  )
  // Check if new permission would require privileged access
  const newPermissionIsPrivileged = createSpaceSelected.includes('Editor') ||
    createSpaceSelected.includes('Approver') ||
    createSpaceSelected.includes('Account owner')
  // Show warning if upgrading from non-privileged to privileged and no seats available
  const noSeatsForUpgrade = !userCurrentlyHasPrivilegedAccess && newPermissionIsPrivileged && privilegedSeats >= 10

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
    // Normalize: handle both ', ' and ' and ' as separators
    const parsed = initial
      ? initial.split(/,\s*|\s+and\s+/).map(s => s.trim()).filter(Boolean)
      : ['Viewer']
    setCreateSpaceSelected(parsed)
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
            Edit access for {user?.user.name}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>

        {/* Create space section */}
        <Box sx={{ mb: '24px' }}>
          <SeatHeader label="Create access" iconTooltip="Access to the Create workspace, including video and template editing, analytics, and AI features." chipTooltip="Number of editors out of the allowed editor seats" used={editorCount} total={10} />
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
        <Box sx={{ mb: '24px' }}>
          <SeatHeader label="Amplify access" iconTooltip="Access to published templates and analytics for sent videos. Users with Create editor access don't require a contributor seat." chipTooltip="Number of contributors out of the allowed contributor seats" used={contributorCount} total={10} />
          <FormControl fullWidth size="small" sx={{ mt: '6px' }}>
            <Select value={amplifySpace} onChange={e => setAmplifySpace(e.target.value as string)} renderValue={v => v as string} sx={selectSx}>
              {amplifySpaceOptions.map(o => (
                <MenuItem key={o} value={o} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, py: '12px' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary }}>
                      {o}
                    </Typography>
                    {o === 'Contributor' && (
                      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary }}>
                        Can access templates and analytics. Uses a seat unless they have Create editor or approver access.
                      </Typography>
                    )}
                    {o === 'No access' && (
                      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary }}>
                        Cannot access templates or contributor features.
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* No seats warning */}
        {noSeatsForUpgrade && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', bgcolor: '#FFF8E7', border: '1px solid #FFD54F', borderRadius: '8px', px: '14px', py: '12px', mb: '20px' }}>
            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#F59E0B', mt: '1px', flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, fontWeight: 600, mb: '2px' }}>
                No seats available
              </Typography>
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                You've reached your seat limit.{' '}
                <Box component="span" sx={{ color: c.primary, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                  Contact sales
                </Box>{' '}
                to get more seats. (Note: Viewer permission does not consume a Create space seat.)
              </Typography>
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button onClick={onClose} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={noSeatsForUpgrade}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: c.grey300, color: '#fff', boxShadow: 'none' } }}
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


// ─── Approvals Section ────────────────────────────────────────────────────────
function ApprovalsSection({ users, approverIds, enabled, onToggle, onSetApprovers, onAddUsers, onPermissionsChanged, pendingApprovalsCount = 0, onTurnOffBlocked, videoStates = {} }: {
  users:          AccountUser[]
  approverIds:    Set<string>
  enabled:        boolean
  onToggle:       (v: boolean) => void
  onSetApprovers: (ids: string[]) => void
  onAddUsers:     (rows: InviteRow[], asApprover: boolean) => void
  onPermissionsChanged?: (userId: string, createSpace: string, amplifySpace: string) => void
  pendingApprovalsCount?: number
  onTurnOffBlocked?: () => void
  videoStates?: Record<string, { sentApprovers?: string[]; sentAt?: string }>
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
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false)
  const [lastApproverDialogOpen, setLastApproverDialogOpen] = useState(false)
  const [lastApproverPendingVideos, setLastApproverPendingVideos] = useState<{ title: string; sentAt?: string; approverNames: string[] }[]>([])
  const [cannotRemoveApproverPendingOpen, setCannotRemoveApproverPendingOpen] = useState(false)
  const [approverPendingVideos, setApproverPendingVideos] = useState<{ title: string; sentAt?: string; sentBy: string }[]>([])
  const [approverToRemovePending, setApproverToRemovePending] = useState<AccountUser | null>(null)

  // Initialize approverIds from users with Approver role when section loads
  // This ensures approvers show even when the feature is initially disabled
  React.useEffect(() => {
    if (approverIds.size === 0) {
      const usersWithApproverRole = users.filter(u => u.createSpace.includes('Approver')).map(u => u.user.id)
      if (usersWithApproverRole.length > 0) {
        onSetApprovers(usersWithApproverRole)
      }
    }
  }, [])

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
    // Merge new IDs with existing ones so no existing approver is lost
    onSetApprovers([...Array.from(approverIds), ...trulyNew])
  }

  function handleToggle(v: boolean) {
    if (v) {
      onToggle(true)
    } else if (pendingApprovalsCount > 0) {
      onTurnOffBlocked?.()  // notify parent to show Cannot Turn Off dialog
      // Do NOT call onToggle(false) — keep it ON
    } else if (!v && approverIds.size > 0) {
      setToggleConfirmOpen(true)
    } else {
      onToggle(false)
    }
  }

  const isLastApprover = enabled && approverIds.size === 1 && approverMenuUser && approverIds.has(approverMenuUser.user.id)

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
            onChange={e => handleToggle(e.target.checked)}
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
                        <SeatHeader label="Create access" iconTooltip="Access to the Create workspace, including video and template editing, analytics, and AI features." chipTooltip="Number of editors out of the allowed editor seats" used={editorCount} total={10} />
                      </TableCell>
                      <TableCell sx={{ ...headCellSx }}>
                        <SeatHeader label="Amplify access" iconTooltip="Access to published templates and analytics for sent videos. Users with Create editor access don't require a contributor seat." chipTooltip="Number of contributors out of the allowed contributor seats" used={contributorCount} total={10} />
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
                  onClick={() => {
                    setApproverMenuAnchor(null)
                    if (!approverMenuUser) return

                    // Get videos where this approver has pending approvals
                    const pendingVideos = Object.entries(videoStates)
                      .filter(([_, state]) => state.sentApprovers?.includes(approverMenuUser.user.id))
                      .map(([title, state]) => {
                        // Get the user who requested this approval (first approver in the list)
                        const sentByUserId = state.sentApprovers?.[0]
                        const sentByUser = sentByUserId ? users.find(u => u.user.id === sentByUserId) : null
                        return {
                          title,
                          sentAt: state.sentAt,
                          sentBy: sentByUser?.user.name || 'Unknown'
                        }
                      })

                    if (isLastApprover) {
                      // Check for pending approvals for this last approver
                      const approverNames = (videoStates[Object.keys(videoStates)[0]]?.sentApprovers || [])
                        .map(id => {
                          const approver = users.find(u => u.user.id === id)
                          return approver?.user.name || id
                        })

                      setLastApproverPendingVideos(
                        pendingVideos.map(v => ({ ...v, approverNames }))
                      )
                      setLastApproverDialogOpen(true)
                    } else if (pendingVideos.length > 0) {
                      // If has pending approvals (but not last approver), show blocking dialog
                      setApproverPendingVideos(pendingVideos)
                      setApproverToRemovePending(approverMenuUser)
                      setCannotRemoveApproverPendingOpen(true)
                    } else {
                      // No pending approvals — show regular confirmation
                      setApproverToRemove(approverMenuUser)
                      setRemoveApproverOpen(true)
                    }
                  }}
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
            // Determine new permission based on current role
            let newCreateSpace = existingUser.createSpace

            if (existingUser.createSpace === 'Viewer') {
              // Viewer → Approver
              newCreateSpace = 'Approver'
            } else if (existingUser.createSpace === 'No access') {
              // No access → Approver
              newCreateSpace = 'Approver'
            } else if (existingUser.createSpace === 'Account owner') {
              // Account owner → Account owner, Approver (if not already)
              if (!newCreateSpace.includes('Approver')) {
                newCreateSpace = 'Account owner, Approver'
              }
            } else if (existingUser.createSpace === 'Editor') {
              // Editor → Editor and Approver (if not already)
              if (!newCreateSpace.includes('Approver')) {
                newCreateSpace = 'Editor and Approver'
              }
            } else if (existingUser.createSpace.includes('Editor')) {
              // Editor and Approver or similar → add Approver if not already there
              if (!newCreateSpace.includes('Approver')) {
                newCreateSpace = existingUser.createSpace + ', Approver'
              }
            }

            // Update permission if it changed
            if (newCreateSpace !== existingUser.createSpace) {
              onPermissionsChanged?.(existingUser.user.id, newCreateSpace, existingUser.amplifySpace)
            }

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
        onEditExistingUser={() => {
          // For approvals, we don't need to edit the user - just acknowledge
          setInviteOpen(false)
        }}
      />

      {/* Remove Approver Dialog */}
      <RemoveApproverDialog
        open={removeApproverOpen}
        onClose={() => setRemoveApproverOpen(false)}
        userName={approverToRemove?.user.name || ''}
        onConfirm={() => {
          if (approverToRemove) {
            // Never remove pending users from approverIds — keep them as approvers
            if (!approverToRemove.pending) {
              // Remove from approvers only if not pending
              const newApproverIds = [...approverIds].filter(id => id !== approverToRemove.user.id)
              onSetApprovers(newApproverIds)

              // If Approver was the only permission, downgrade to Viewer
              if (approverToRemove.createSpace === 'Approver') {
                onPermissionsChanged?.(approverToRemove.user.id, 'Viewer', approverToRemove.amplifySpace)
              }
            }
            setRemoveApproverOpen(false)
          }
        }}
      />

      {/* Cannot Remove Approver with Pending Approvals Dialog */}
      <Dialog
        open={cannotRemoveApproverPendingOpen}
        onClose={() => setCannotRemoveApproverPendingOpen(false)}
        maxWidth={false}
        PaperProps={{ sx: { width: 500, borderRadius: '12px', p: 0 } }}
      >
        <Box sx={{ px: '24px', pt: '20px', pb: '8px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary, mb: '8px' }}>
            Cannot remove this approver
          </Typography>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textSecondary, mb: '16px', lineHeight: 1.6 }}>
            <strong>{approverToRemovePending?.user.name}</strong> has pending approvals and cannot be removed until the approval process is completed or cancelled for the following {approverPendingVideos.length > 1 ? 'videos' : 'video'}:
          </Typography>
          {approverPendingVideos.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mb: '20px' }}>
              {approverPendingVideos.map(v => (
                <Box
                  key={v.title}
                  onClick={() => window.open(`/?videoTitle=${encodeURIComponent(v.title)}`, '_blank')}
                  sx={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    bgcolor: '#FAFBFD',
                    borderRadius: '8px',
                    p: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#F0F3FB',
                      boxShadow: '0 2px 8px rgba(0, 83, 229, 0.15)',
                    },
                  }}
                >
                  <Box sx={{ width: 64, height: 48, borderRadius: '6px', bgcolor: '#E8ECF4', flexShrink: 0, border: `1px solid ${c.grey300}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/thumb.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontWeight: 600, fontSize: 13, color: c.textPrimary, mb: '2px' }}>
                      {v.title}
                    </Typography>
                    {v.sentAt && (
                      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary, mb: '4px' }}>
                        Sent for approval: {v.sentAt}
                      </Typography>
                    )}
                    {v.sentBy && (
                      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary, mb: '4px' }}>
                        Requested by: {v.sentBy}
                      </Typography>
                    )}
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: '#F46900', mt: '2px' }}>
                      Awaiting approval
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: '24px', py: '16px', borderTop: `1px solid ${c.grey300}` }}>
          <Button
            variant="contained"
            onClick={() => setCannotRemoveApproverPendingOpen(false)}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
          >
            Got it
          </Button>
        </Box>
      </Dialog>

      {/* Toggle OFF confirmation dialog */}
      <Dialog
        open={toggleConfirmOpen}
        onClose={() => setToggleConfirmOpen(false)}
        maxWidth={false}
        PaperProps={{ sx: { width: 460, borderRadius: '12px', p: 0 } }}
      >
        <Box sx={{ px: '24px', py: '20px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary, mb: '12px' }}>
            Turn off approvals?
          </Typography>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textSecondary, mb: '24px', lineHeight: 1.6 }}>
            You have {approverIds.size} approver{approverIds.size !== 1 ? 's' : ''} set. Turning off approvals will disable the requirement for approvals from specific users for videos and templates.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button
              variant="outlined"
              onClick={() => setToggleConfirmOpen(false)}
              sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary, borderColor: c.grey300 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => { onToggle(false); setToggleConfirmOpen(false) }}
              sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
            >
              Turn off
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Last Approver Dialog */}
      <Dialog
        open={lastApproverDialogOpen}
        onClose={() => setLastApproverDialogOpen(false)}
        maxWidth={false}
        PaperProps={{ sx: { width: 500, borderRadius: '12px', p: 0 } }}
      >
        <Box sx={{ px: '24px', pt: '20px', pb: '8px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary, mb: '8px' }}>
            Cannot remove approver
          </Typography>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textSecondary, mb: '16px', lineHeight: 1.6 }}>
            <strong>{approverMenuUser?.user.name}</strong> is the only approver in your account{lastApproverPendingVideos.length > 0 ? ' and has pending approvals' : ''}.
            <br/><br/>
            To remove them, you must first:
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Add another approver to your account</li>
              {lastApproverPendingVideos.length > 0 && <li>Cancel or complete the pending approval process</li>}
            </ul>
          </Typography>
          {lastApproverPendingVideos.length > 0 && (
            <>
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary, mb: '8px', fontWeight: 600 }}>
                Pending approvals:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mb: '20px' }}>
                {lastApproverPendingVideos.map(v => (
                  <Box
                    key={v.title}
                    onClick={() => window.open(`/?videoTitle=${encodeURIComponent(v.title)}`, '_blank')}
                    sx={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      bgcolor: '#FAFBFD',
                      borderRadius: '8px',
                      p: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: '#F0F3FB',
                        boxShadow: '0 2px 8px rgba(0, 83, 229, 0.15)',
                      },
                    }}
                  >
                    <Box sx={{ width: 64, height: 48, borderRadius: '6px', bgcolor: '#E8ECF4', flexShrink: 0, border: `1px solid ${c.grey300}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/thumb.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontWeight: 600, fontSize: 13, color: c.textPrimary, mb: '2px' }}>
                        {v.title}
                      </Typography>
                      {v.sentAt && (
                        <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary, mb: '4px' }}>
                          Sent for approval: {v.sentAt}
                        </Typography>
                      )}
                      {v.approverNames.length > 0 && (
                        <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary, mb: '4px' }}>
                          By: {v.approverNames.join(', ')}
                        </Typography>
                      )}
                      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: '#F46900', mt: '2px' }}>
                        Awaiting approval
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: '24px', py: '16px', borderTop: `1px solid ${c.grey300}` }}>
          <Button
            variant="contained"
            onClick={() => setLastApproverDialogOpen(false)}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
          >
            Got it
          </Button>
        </Box>
      </Dialog>

    </Box>
  )
}

// ─── Users Section ────────────────────────────────────────────────────────────
function UsersSection({
  users,
  onInviteUser,
  onUserDeleted,
  onPermissionsChanged,
  approvalsEnabled = false,
  approverIds = new Set(),
  videoStates = {}
}: {
  users: AccountUser[]
  onInviteUser: (rows: InviteRow[]) => void
  onUserDeleted?: (userId: string) => void
  onPermissionsChanged?: (userId: string, createSpace: string, amplifySpace: string) => void
  approvalsEnabled?: boolean
  approverIds?: Set<string>
  videoStates?: Record<string, { sentApprovers?: string[]; sentAt?: string }>
}) {
  const [search, setSearch]     = useState('')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [dialogMode, setDialogMode] = useState<'closed' | 'add' | 'edit'>('closed')
  const [editingUser, setEditingUser] = useState<AccountUser | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<AccountUser | null>(null)
  const [cannotRemoveApproverOpen, setCannotRemoveApproverOpen] = useState(false)
  const [soleApproverWarningOpen, setSoleApproverWarningOpen] = useState(false)
  const [pendingApprovalDeleteOpen, setPendingApprovalDeleteOpen] = useState(false)
  const [pendingVideosForUser, setPendingVideosForUser] = useState<{ title: string; sentAt?: string; otherApprovers: string[] }[]>([])
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
            onClick={() => setDialogMode('add')}
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
                            <IconButton size="small" onClick={() => { setEditingUser(row); setDialogMode('edit') }} sx={{ color: c.primary, '&:hover': { bgcolor: 'rgba(0,83,229,0.1)' }, p: '4px' }}>
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
                            <IconButton size="small" onClick={() => { setEditingUser(row); setDialogMode('edit') }} sx={{ color: c.primary, '&:hover': { bgcolor: 'rgba(0,83,229,0.1)' }, p: '4px' }}>
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
        open={dialogMode === 'add'}
        onClose={() => setDialogMode('closed')}
        onSend={rows => { onInviteUser(rows); setDialogMode('closed') }}
        users={usersList}
        onEditExistingUser={(user) => {
          setEditingUser(user)
          setDialogMode('edit')
        }}
      />

      {/* Edit Permissions Dialog */}
      <EditPermissionsDialog
        open={dialogMode === 'edit'}
        onClose={() => setDialogMode('closed')}
        user={editingUser}
        users={usersList}
        onSave={(createSpace, amplifySpace) => {
          if (editingUser) {
            setUsersList(prev => prev.map(u => u.user.id === editingUser.user.id ? { ...u, createSpace, amplifySpace } : u))
            onPermissionsChanged?.(editingUser.user.id, createSpace, amplifySpace)
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
            onUserDeleted?.(userToDelete.user.id)
          }
        }}
      />

      {/* Cannot Remove Only Approver Dialog */}
      <Dialog
        open={cannotRemoveApproverOpen}
        onClose={() => setCannotRemoveApproverOpen(false)}
        maxWidth={false}
        PaperProps={{ sx: { width: 460, borderRadius: '12px', p: 0 } }}
      >
        <Box sx={{ px: '24px', py: '20px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary, mb: '12px' }}>
            Cannot remove this user
          </Typography>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textSecondary, mb: '24px', lineHeight: 1.6 }}>
            <strong>{userToDelete?.user.name}</strong> is currently the only approver in your account. To remove this user, you must either:
          </Typography>
          <Box sx={{ bgcolor: c.primaryLight, borderRadius: '8px', px: '14px', py: '12px', mb: '24px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                • <strong>Turn off</strong> the "Require approvals from specific users for videos and templates" setting
              </Typography>
              <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                • <strong>Add another approver</strong> first, then remove this user
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button
              variant="outlined"
              onClick={() => setCannotRemoveApproverOpen(false)}
              sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary, borderColor: c.grey300 }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Sole Approver Warning — Cannot Remove */}
      <Dialog
        open={soleApproverWarningOpen}
        onClose={() => setSoleApproverWarningOpen(false)}
        maxWidth={false}
        PaperProps={{ sx: { width: 500, borderRadius: '12px', p: 0 } }}
      >
        <Box sx={{ px: '24px', pt: '20px', pb: '8px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary, mb: '8px' }}>
            Cannot remove this user
          </Typography>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textSecondary, mb: '16px', lineHeight: 1.6 }}>
            <strong>{userToDelete?.user.name}</strong> is the only approver on a video currently awaiting approval. To remove this user, first stop the approval process for the following {pendingVideosForUser.filter(v => v.otherApprovers.length === 0).length > 1 ? 'videos' : 'video'}:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mb: '20px' }}>
            {pendingVideosForUser.filter(v => v.otherApprovers.length === 0).map(v => (
              <Box key={v.title} sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start', bgcolor: '#FAFBFD', borderRadius: '8px', p: '12px' }}>
                <Box sx={{ width: 64, height: 48, borderRadius: '6px', bgcolor: '#E8ECF4', flexShrink: 0, border: `1px solid ${c.grey300}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/thumb.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontWeight: 600, fontSize: 13, color: c.textPrimary, mb: '2px' }}>
                    {v.title}
                  </Typography>
                  {v.sentAt && (
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary }}>
                      Sent for approval: {v.sentAt}
                    </Typography>
                  )}
                  <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: '#F46900', mt: '2px' }}>
                    Awaiting approval
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: '24px', py: '16px', borderTop: `1px solid ${c.grey300}` }}>
          <Button
            variant="contained"
            onClick={() => setSoleApproverWarningOpen(false)}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
          >
            Got it
          </Button>
        </Box>
      </Dialog>

      {/* Pending Approvals Delete Warning */}
      <Dialog
        open={pendingApprovalDeleteOpen}
        onClose={() => setPendingApprovalDeleteOpen(false)}
        maxWidth={false}
        PaperProps={{ sx: { width: 500, borderRadius: '12px', p: 0 } }}
      >
        <Box sx={{ px: '24px', pt: '20px', pb: '8px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary, mb: '8px' }}>
            Cannot remove this user
          </Typography>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textSecondary, mb: '16px', lineHeight: 1.6 }}>
            <strong>{userToDelete?.user.name}</strong> has pending approvals and cannot be removed until the approval process is completed or cancelled for the following {pendingVideosForUser.length > 1 ? 'videos' : 'video'}:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mb: '20px' }}>
            {pendingVideosForUser.map(v => (
              <Box key={v.title} sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start', bgcolor: '#FAFBFD', borderRadius: '8px', p: '12px' }}>
                <Box sx={{ width: 64, height: 48, borderRadius: '6px', bgcolor: '#E8ECF4', flexShrink: 0, border: `1px solid ${c.grey300}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/thumb.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontWeight: 600, fontSize: 13, color: c.textPrimary, mb: '2px' }}>
                    {v.title}
                  </Typography>
                  {v.sentAt && (
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary }}>
                      Sent for approval: {v.sentAt}
                    </Typography>
                  )}
                  <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: '#F46900', mt: '2px' }}>
                    Awaiting approval
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: '24px', py: '16px', borderTop: `1px solid ${c.grey300}` }}>
          <Button
            variant="contained"
            onClick={() => setPendingApprovalDeleteOpen(false)}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
          >
            Got it
          </Button>
        </Box>
      </Dialog>

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
            onClick={() => { setEditingUser(userMenuUser); setDialogMode('edit'); setUserMenuAnchor(null) }}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, px: '16px', py: '8px', gap: '10px' }}
          >
            <EditOutlinedIcon sx={{ fontSize: 16, color: c.actionActive }} />
            Edit access
          </MenuItem>,
          <MenuItem
            key="remove"
            onClick={() => {
              if (userMenuUser) {
                setUserMenuAnchor(null)
                setUserToDelete(userMenuUser)

                // Get videos where this user is an approver and approval is pending
                const pendingVideos = Object.entries(videoStates)
                  .filter(([_, state]) => state.sentApprovers?.includes(userMenuUser.user.id))
                  .map(([title, state]) => ({
                    title,
                    sentAt: state.sentAt,
                    otherApprovers: (state.sentApprovers || []).filter(id => id !== userMenuUser.user.id)
                  }))

                if (pendingVideos.length > 0) {
                  const isSoleOnAny = pendingVideos.some(v => v.otherApprovers.length === 0)
                  setPendingVideosForUser(pendingVideos)
                  if (isSoleOnAny) {
                    setSoleApproverWarningOpen(true)
                  } else {
                    setPendingApprovalDeleteOpen(true)
                  }
                } else {
                  // No pending approvals — check normal approver rules
                  const isOnlyApprover = approvalsEnabled && approverIds.size === 1 && approverIds.has(userMenuUser.user.id)
                  if (isOnlyApprover) {
                    setCannotRemoveApproverOpen(true)
                  } else {
                    setDeleteOpen(true)
                  }
                }
              }
            }}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: '#E53935', px: '16px', py: '8px', gap: '10px' }}
          >
            <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
            Remove user
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
interface VideoStateForApprovals {
  sentApprovers?: string[]
  sentAt?: string
}

interface AccountSettingsDialogProps {
  open: boolean
  onClose: () => void
  approvalsEnabled?: boolean
  approverIds?: Set<string>
  approversList?: { value: string; label: string }[]
  onApprovalsEnabledChange?: (enabled: boolean, hasPendingApprovals?: boolean) => void
  onApproversChange?: (approverIds: Set<string>) => void
  onApproversListChange?: (approvers: { value: string; label: string }[]) => void
  onUserDeletionBlocked?: (userId: string, reason: 'only-approver' | 'pending-approvals') => void
  videoStates?: Record<string, VideoStateForApprovals>
  pendingApprovalsCount?: number
  initialTab?: 'users' | 'permissions' | 'approvals' | 'access'
}

export default function AccountSettingsDialog({
  open,
  onClose,
  approvalsEnabled: externalApprovalsEnabled = false,
  approverIds: externalApproverIds = new Set(),
  approversList: externalApproversList = [],
  onApprovalsEnabledChange,
  onApproversChange,
  onApproversListChange,
  onUserDeletionBlocked,
  videoStates = {},
  pendingApprovalsCount = 0,
  initialTab = 'users',
}: AccountSettingsDialogProps) {
  const [nav, setNav]                   = useState<NavKey>(initialTab)
  const [users, setUsers]               = useState<AccountUser[]>(INITIAL_USERS)
  const [approverIds, setApproverIds]   = useState<Set<string>>(externalApproverIds)
  const [approvalsEnabled, setApprovalsEnabled] = useState(externalApprovalsEnabled)
  const [noApproversConfirmOpen, setNoApproversConfirmOpen] = useState(false)
  const [pendingNav, setPendingNav] = useState<NavKey | null>(null)

  // Sync nav when initialTab changes
  React.useEffect(() => {
    setNav(initialTab)
  }, [initialTab])

  // Sync external approvals state
  React.useEffect(() => {
    setApprovalsEnabled(externalApprovalsEnabled)
  }, [externalApprovalsEnabled])

  // Sync external approver IDs - but don't clear if local has content and external is empty
  React.useEffect(() => {
    // Only sync if: (1) external is non-empty, OR (2) both are empty, OR (3) external has content
    // Don't sync if external is empty but local has content (prevents losing locally added approvers)
    if (externalApproverIds.size > 0 || approverIds.size === 0) {
      const externalArray = JSON.stringify(Array.from(externalApproverIds).sort())
      const currentArray = JSON.stringify(Array.from(approverIds).sort())
      if (externalArray !== currentArray) {
        setApproverIds(new Set(externalApproverIds))
      }
    }
    // If external is empty but local has content, don't overwrite local
  }, [externalApproverIds])

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
    const newApproverIds = new Set(ids)
    setApproverIds(newApproverIds)
    onApproversChange?.(newApproverIds)
  }

  // Whenever the users list or approver IDs change, push the filtered approver list to parent
  // Include both users with Approver role AND users in the approverIds set to ensure consistency
  // Also use external approversList as a source for users not in local users list (e.g., invited users)
  React.useEffect(() => {
    const usersWithApproverRole = users
      .filter(u => u.createSpace.includes('Approver') || approverIds.has(u.user.id))
      .map(u => ({ value: u.user.id, label: `${u.user.name} (${u.user.email})` }))

    // Add any approvers from external list that aren't already in the local list
    const localIds = new Set(usersWithApproverRole.map(u => u.value))
    const externalApprovers = externalApproversList.filter(u => !localIds.has(u.value))

    const allApprovers = [...usersWithApproverRole, ...externalApprovers]
    onApproversListChange?.(allApprovers)
  }, [users, approverIds, externalApproversList])

  // Helper function to check if a user has pending approvals
  function getUserPendingApprovals(userId: string) {
    const videoTitles: string[] = []
    Object.entries(videoStates).forEach(([videoTitle, state]) => {
      if (state.sentApprovers?.includes(userId)) {
        videoTitles.push(videoTitle)
      }
    })
    return videoTitles
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
          <IconButton size="small" onClick={() => {
            // Check if approvals are enabled but no approvers set
            if (approvalsEnabled && approverIds.size === 0) {
              setNoApproversConfirmOpen(true)
            } else {
              onClose()
            }
          }} sx={{ color: c.actionActive }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Box sx={{ width: 176, flexShrink: 0, borderRight: `1px solid ${c.grey300}`, py: '12px', px: '8px', display: 'flex', flexDirection: 'column', gap: '2px', bgcolor: '#FAFBFD' }}>
          {NAV.map(item => (
            <Box
              key={item.key}
              onClick={() => {
                // Check if approvals are enabled but no approvers set when leaving the Approvals tab
                if (nav === 'approvals' && approvalsEnabled && approverIds.size === 0 && item.key !== 'approvals') {
                  setPendingNav(item.key)
                  setNoApproversConfirmOpen(true)
                } else {
                  setNav(item.key)
                }
              }}
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
          {nav === 'users'       && (
          <UsersSection
            users={users}
            onInviteUser={rows => handleInviteUser(rows, false)}
            onUserDeleted={(userId) => {
              const pendingApprovalsForUser = getUserPendingApprovals(userId)
              if (approvalsEnabled && pendingApprovalsForUser.length > 0) {
                // Block deletion if user has ANY pending approvals - they must cancel them first
                onUserDeletionBlocked?.(userId, 'pending-approvals')
                return
              }
              setUsers(prev => prev.filter(u => u.user.id !== userId))
              setApproverIds(prev => { const s = new Set(prev); s.delete(userId); return s })
            }}
            onPermissionsChanged={(userId, createSpace, amplifySpace) => {
              setUsers(prev => prev.map(u =>
                u.user.id === userId ? { ...u, createSpace, amplifySpace } : u
              ))
              // If user now has Approver role, add to approverIds
              // Never remove pending users from approverIds — keep them as approvers even if their role changes
              const userHasApprover = createSpace.includes('Approver')
              const user = users.find(u => u.user.id === userId)
              const isPending = user?.pending ?? false

              setApproverIds(prev => {
                const s = new Set(prev)
                if (userHasApprover && !s.has(userId)) {
                  s.add(userId)
                } else if (!userHasApprover && s.has(userId) && !isPending) {
                  // Only remove if not pending
                  s.delete(userId)
                }
                return s
              })
            }}
            approvalsEnabled={approvalsEnabled}
            approverIds={approverIds}
            videoStates={videoStates}
          />
        )}
          {nav === 'permissions' && <PlaceholderSection label="Permissions" />}
          {nav === 'approvals'   && (
            <ApprovalsSection
              users={users}
              approverIds={approverIds}
              enabled={approvalsEnabled}
              onToggle={(enabled) => {
                setApprovalsEnabled(enabled)
                // Notify parent if approvals are being turned OFF with pending approvals
                if (!enabled && pendingApprovalsCount > 0) {
                  onApprovalsEnabledChange?.(enabled, true)
                } else {
                  onApprovalsEnabledChange?.(enabled)
                }
              }}
              onSetApprovers={(ids) => {
                handleSetApprovers(ids)
              }}
              onAddUsers={(rows, asApprover) => handleInviteUser(rows, asApprover)}
              onPermissionsChanged={(userId, createSpace, amplifySpace) => {
                setUsers(prev => prev.map(u =>
                  u.user.id === userId ? { ...u, createSpace, amplifySpace } : u
                ))
              }}
              pendingApprovalsCount={pendingApprovalsCount}
              onTurnOffBlocked={() => {
                onApprovalsEnabledChange?.(false, true)
                // do NOT call setApprovalsEnabled(false) — keep it ON
              }}
              videoStates={videoStates}
            />
          )}
          {nav === 'access'      && <PlaceholderSection label="Access" />}
        </Box>
      </Box>

      {/* No Approvers Warning Dialog */}
      <Dialog
        open={noApproversConfirmOpen}
        onClose={() => setNoApproversConfirmOpen(false)}
        maxWidth={false}
        PaperProps={{ sx: { width: 480, borderRadius: '12px', p: 0 } }}
      >
        <Box sx={{ px: '24px', py: '20px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary, mb: '12px' }}>
            Approvals feature requires approvers
          </Typography>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, color: c.textSecondary, mb: '24px', lineHeight: 1.6 }}>
            You've enabled "Require approvals from specific users for videos and templates" but haven't added any approvers yet. You must add at least one approver to keep this feature enabled, or turn it off.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setNoApproversConfirmOpen(false)
                // Disable approvals
                setApprovalsEnabled(false)
                onApprovalsEnabledChange?.(false)
                setPendingNav(null)
                // Navigate to pending tab if set
                if (pendingNav) {
                  setNav(pendingNav)
                }
              }}
              sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary, borderColor: c.grey300 }}
            >
              Disable approvals
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setNoApproversConfirmOpen(false)
                setPendingNav(null)
                // Stay on approvals tab and focus the add approver button
                setNav('approvals')
                // The AddApproverDialog will be opened via ApprovalsSection state
              }}
              sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
            >
              Add approvers
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Dialog>
  )
}
