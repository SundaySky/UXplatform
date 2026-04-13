import { useState } from 'react'
import {
  Box, Typography, Dialog, IconButton,
  Avatar, Button, OutlinedInput, InputAdornment,
  Table, TableBody, TableCell, TableHead, TableRow,
  Tooltip, Switch, Checkbox, Popover,
  Select, MenuItem, FormControl,
} from '@mui/material'
import CloseIcon              from '@mui/icons-material/Close'
import HelpOutlineIcon        from '@mui/icons-material/HelpOutline'
import SearchIcon             from '@mui/icons-material/Search'
import AddIcon                from '@mui/icons-material/Add'
import ArrowDownwardIcon      from '@mui/icons-material/ArrowDownward'
import InfoOutlinedIcon       from '@mui/icons-material/InfoOutlined'
import MoreVertIcon           from '@mui/icons-material/MoreVert'
import PeopleOutlinedIcon     from '@mui/icons-material/PeopleOutlined'
import LockOutlinedIcon       from '@mui/icons-material/LockOutlined'
import SmartToyOutlinedIcon   from '@mui/icons-material/SmartToyOutlined'
import TaskAltOutlinedIcon    from '@mui/icons-material/TaskAltOutlined'
import LockPersonIcon         from '@mui/icons-material/LockPerson'
import ApprovalOutlinedIcon   from '@mui/icons-material/ApprovalOutlined'

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
}

const INITIAL_USERS: AccountUser[] = [
  { user: OWNER_USER,    isOwner: true, createSpace: 'Account owner', amplifySpace: 'Account owner', jobRole: 'Integrator',      lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[1],               createSpace: 'Editor',          amplifySpace: 'Contributor',   jobRole: 'Data Analyst',    lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[2],               createSpace: 'Editor',          amplifySpace: 'No access',     jobRole: 'Marketing',       lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[3],               createSpace: 'No access',       amplifySpace: 'Contributor',   jobRole: 'Creative Agency', lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[4],               createSpace: 'View only',       amplifySpace: 'No access',     jobRole: 'Marketing',       lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[5],               createSpace: 'Builder editor,\nProfessional services', amplifySpace: 'Contributor', jobRole: 'Marketing', lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
]

// ─── Nav ──────────────────────────────────────────────────────────────────────
type NavKey = 'users' | 'permissions' | 'ai' | 'approvals' | 'access'
const NAV: { key: NavKey; label: string; icon: React.ReactNode }[] = [
  { key: 'users',       label: 'Users',       icon: <PeopleOutlinedIcon   sx={{ fontSize: 18 }} /> },
  { key: 'permissions', label: 'Permissions', icon: <LockOutlinedIcon     sx={{ fontSize: 18 }} /> },
  { key: 'ai',          label: 'AI features', icon: <SmartToyOutlinedIcon sx={{ fontSize: 18 }} /> },
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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Avatar sx={{ width: 32, height: 32, bgcolor: c.secondary, fontSize: 11, fontFamily: '"Inter",sans-serif', fontWeight: 600, flexShrink: 0 }}>
        {row.user.initials}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.user.name}
        </Typography>
        <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 12, color: c.textSecondary, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.user.email}
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Invite User Dialog ───────────────────────────────────────────────────────
interface InviteRow { email: string; createSpace: string; amplifySpace: string }

function InviteUserDialog({ open, onClose, onSend }: {
  open: boolean
  onClose: () => void
  onSend: (rows: InviteRow[]) => void
}) {
  const [rows, setRows] = useState<InviteRow[]>([{ email: '', createSpace: 'Viewer', amplifySpace: 'No access' }])

  const updateRow = (i: number, field: keyof InviteRow, val: string) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  function handleSend() {
    const valid = rows.filter(r => r.email.trim())
    if (valid.length) { onSend(valid); setRows([{ email: '', createSpace: 'Viewer', amplifySpace: 'No access' }]) }
  }

  const spaceOptions = ['Account owner', 'Editor', 'Viewer', 'View only', 'No access']
  const selectSx = {
    fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 },
    height: 40,
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: 760, borderRadius: '12px', p: 0 } }}>
      <Box sx={{ px: '24px', py: '20px' }}>
        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '24px' }}>
          <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>Invite user</Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>

        {/* Column headers */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 180px 180px', gap: '12px', mb: '8px', px: '2px' }}>
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary }}>Email</Typography>
          <SeatHeader label="Create space" tooltip="Assigned editor seats compared to total editor seats" used={4} total={10} />
          <SeatHeader label="Amplify space" tooltip="Assigned contributor only seats compared to total contributor seats" used={4} total={10} />
        </Box>

        {/* Rows */}
        {rows.map((row, i) => (
          <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '1fr 180px 180px', gap: '12px', mb: '8px', alignItems: 'center', borderBottom: `1px solid ${c.grey300}`, pb: '8px' }}>
            <OutlinedInput
              placeholder="User@SSKY.com"
              value={row.email}
              onChange={e => updateRow(i, 'email', e.target.value)}
              sx={{ fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px', height: 40, '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 } }}
            />
            <FormControl size="small">
              <Select value={row.createSpace} onChange={e => updateRow(i, 'createSpace', e.target.value as string)} sx={selectSx}>
                {spaceOptions.map(o => <MenuItem key={o} value={o} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13 }}>{o}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small">
              <Select value={row.amplifySpace} onChange={e => updateRow(i, 'amplifySpace', e.target.value as string)} sx={selectSx}>
                {spaceOptions.map(o => <MenuItem key={o} value={o} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13 }}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        ))}

        {/* Add another user */}
        <Button
          startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
          onClick={() => setRows(prev => [...prev, { email: '', createSpace: 'Viewer', amplifySpace: 'No access' }])}
          sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, textTransform: 'none', color: c.primary, px: 0, mb: '20px', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
        >
          Add another user
        </Button>

        {/* Info box */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', bgcolor: c.primaryLight, borderRadius: '8px', px: '14px', py: '12px', mb: '24px' }}>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: c.primary, mt: '1px', flexShrink: 0 }} />
          <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
            The user will receive an email invitation and will need to create an account to get access.
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button onClick={onClose} sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, textTransform: 'none', color: c.textPrimary }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!rows.some(r => r.email.trim())}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
          >
            Send invitation
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

// ─── Add Approvers Popover ────────────────────────────────────────────────────
function AddApproversPopover({ anchorEl, onClose, allUsers, approverIds, onAdd, onInviteClick }: {
  anchorEl:    HTMLElement | null
  onClose:     () => void
  allUsers:    AccountUser[]
  approverIds: Set<string>
  onAdd:       (ids: string[]) => void
  onInviteClick: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(approverIds))
  const [search, setSearch]     = useState('')

  const toggle = (id: string) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const filtered = search
    ? allUsers.filter(r => r.user.name.toLowerCase().includes(search.toLowerCase()) || r.user.email.toLowerCase().includes(search.toLowerCase()))
    : allUsers

  const newCount = [...selected].filter(id => !approverIds.has(id)).length

  const headCellSx = { fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`, py: '8px', px: '12px' }
  const bodyCellSx = { fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`, py: '6px', px: '12px' }

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{ sx: { width: 420, borderRadius: '10px', boxShadow: '0 4px 20px rgba(3,25,79,0.18)', mt: '4px', overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '16px', py: '12px', borderBottom: `1px solid ${c.grey300}` }}>
        <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 15, color: c.textPrimary }}>Add approvers</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
      </Box>

      {/* Invite + Search */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '12px', py: '10px', borderBottom: `1px solid ${c.grey300}` }}>
        <Button
          startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
          onClick={() => { onClose(); onInviteClick() }}
          sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 500, textTransform: 'none', color: c.primary, border: `1px solid ${c.grey300}`, borderRadius: '8px', px: '10px', py: '5px', whiteSpace: 'nowrap', flexShrink: 0, '&:hover': { bgcolor: c.primaryLight, borderColor: c.primary } }}
        >
          Invite user
        </Button>
        <OutlinedInput
          placeholder="Search..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          startAdornment={<InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: c.actionActive }} /></InputAdornment>}
          sx={{ flex: 1, fontSize: 13, fontFamily: '"Open Sans",sans-serif', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 } }}
        />
      </Box>

      {/* Table */}
      <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headCellSx, width: 40, px: '8px' }} />
              <TableCell sx={{ ...headCellSx }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  User <ArrowDownwardIcon sx={{ fontSize: 13, color: c.actionActive }} />
                </Box>
              </TableCell>
              <TableCell sx={{ ...headCellSx, width: 120 }}>Job role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(row => {
              const checked = selected.has(row.user.id)
              return (
                <TableRow
                  key={row.user.id}
                  onClick={() => toggle(row.user.id)}
                  sx={{ cursor: 'pointer', bgcolor: checked ? 'rgba(0,83,229,0.06)' : 'transparent', '&:hover': { bgcolor: checked ? 'rgba(0,83,229,0.09)' : c.grey100 } }}
                >
                  <TableCell sx={{ ...bodyCellSx, px: '8px' }}>
                    <Checkbox
                      checked={checked}
                      size="small"
                      sx={{ p: '2px', color: c.grey300, '&.Mui-checked': { color: c.primary } }}
                    />
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: c.secondary, fontSize: 10, fontFamily: '"Inter",sans-serif', fontWeight: 600, flexShrink: 0 }}>
                        {row.user.initials}
                      </Avatar>
                      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.user.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ ...bodyCellSx, color: c.textSecondary }}>{row.jobRole}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Box>

      {/* Add button */}
      <Box sx={{ p: '12px', borderTop: `1px solid ${c.grey300}` }}>
        <Button
          fullWidth
          variant="contained"
          disabled={newCount === 0}
          onClick={() => { onAdd([...selected]); onClose() }}
          sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', py: '9px', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' }, '&:disabled': { bgcolor: c.grey300 } }}
        >
          {newCount > 0 ? `Add ${newCount} approver${newCount > 1 ? 's' : ''}` : 'Add approvers'}
        </Button>
      </Box>
    </Popover>
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
  const [addAnchor, setAddAnchor]   = useState<HTMLElement | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const approvers = users.filter(u => approverIds.has(u.user.id))
  const filtered  = search
    ? approvers.filter(r => r.user.name.toLowerCase().includes(search.toLowerCase()) || r.user.email.toLowerCase().includes(search.toLowerCase()))
    : approvers

  const headCellSx = { fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`, py: '10px', px: '16px', whiteSpace: 'nowrap' as const, bgcolor: '#fff' }
  const bodyCellSx = { fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`, py: '10px', px: '16px' }

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
                variant="contained"
                onClick={e => setAddAnchor(e.currentTarget)}
                sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'none', borderRadius: '8px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
              >
                Add approvers
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
                  Add approvers to change this permission
                </Typography>
              </Box>
            ) : (
              <Box sx={{ borderRadius: '8px', border: `1px solid ${c.grey300}`, overflow: 'auto', maxHeight: 300 }}>
                <Table size="small" sx={{ tableLayout: 'fixed', minWidth: 700 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...headCellSx, width: 240, position: 'sticky', left: 0, zIndex: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          User <ArrowDownwardIcon sx={{ fontSize: 13, color: c.actionActive }} />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ ...headCellSx, width: 180 }}>
                        <SeatHeader label="Create space" tooltip="Assigned editor seats compared to total editor seats" used={5} total={10} />
                      </TableCell>
                      <TableCell sx={{ ...headCellSx, width: 180 }}>
                        <SeatHeader label="Amplify space" tooltip="Assigned contributor only seats compared to total contributor seats" used={4} total={10} />
                      </TableCell>
                      <TableCell sx={{ ...headCellSx }}>Last login</TableCell>
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
                            <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.pending ? c.textSecondary : c.textPrimary, fontStyle: row.pending ? 'italic' : 'normal' }}>
                              {row.pending ? 'Pending' : row.lastLogin}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ ...bodyCellSx, px: '4px', width: 48 }}>
                            {isHovered && (
                              <Tooltip title="More options" placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
                                <IconButton size="small" sx={{ color: c.actionActive, '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}>
                                  <MoreVertIcon sx={{ fontSize: 18 }} />
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

      {/* Add Approvers Popover */}
      <AddApproversPopover
        anchorEl={addAnchor}
        onClose={() => setAddAnchor(null)}
        allUsers={users}
        approverIds={approverIds}
        onAdd={ids => onSetApprovers(ids)}
        onInviteClick={() => setInviteOpen(true)}
      />

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSend={rows => { onAddUsers(rows, true); setInviteOpen(false) }}
      />
    </Box>
  )
}

// ─── Users Section ────────────────────────────────────────────────────────────
function UsersSection({ users, onInviteUser }: { users: AccountUser[]; onInviteUser: (rows: InviteRow[]) => void }) {
  const [search, setSearch]     = useState('')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const filtered = search
    ? users.filter(r => r.user.name.toLowerCase().includes(search.toLowerCase()) || r.user.email.toLowerCase().includes(search.toLowerCase()))
    : users

  const headCellSx = { fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`, py: '10px', px: '16px', whiteSpace: 'nowrap' as const, bgcolor: '#fff' }
  const bodyCellSx = { fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`, py: '10px', px: '16px' }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Title row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '20px', flexShrink: 0 }}>
        <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 20, color: c.textPrimary }}>
          Users ({users.length})
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
            variant="contained"
            onClick={() => setInviteOpen(true)}
            sx={{ fontFamily: '"Open Sans",sans-serif', fontWeight: 600, fontSize: 14, textTransform: 'none', borderRadius: '8px', px: '16px', py: '7px', bgcolor: c.primary, boxShadow: 'none', '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' } }}
          >
            Invite user
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
        <Table size="small" sx={{ tableLayout: 'fixed', minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headCellSx, width: 260, position: 'sticky', left: 0, zIndex: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  User <ArrowDownwardIcon sx={{ fontSize: 14, color: c.actionActive }} />
                </Box>
              </TableCell>
              <TableCell sx={{ ...headCellSx, width: 200 }}>
                <SeatHeader label="Create space" tooltip="Assigned editor seats compared to total editor seats" used={5} total={10} />
              </TableCell>
              <TableCell sx={{ ...headCellSx, width: 200 }}>
                <SeatHeader label="Amplify space" tooltip="Assigned contributor only seats compared to total contributor seats" used={4} total={10} />
              </TableCell>
              <TableCell sx={{ ...headCellSx, width: 200 }}>Last login</TableCell>
              <TableCell sx={{ ...headCellSx, width: 200 }}>Creation date</TableCell>
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
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.amplifySpace === 'No access' ? c.textSecondary : c.textPrimary }}>
                      {row.amplifySpace}
                    </Typography>
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.pending ? c.textSecondary : c.textPrimary, fontStyle: row.pending ? 'italic' : 'normal' }}>
                      {row.pending ? 'Pending' : row.lastLogin}
                    </Typography>
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                      {row.pending ? '—' : row.createdDate}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...bodyCellSx, px: '4px', width: 48 }}>
                    {isHovered && (
                      <Tooltip title="More options" placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
                        <IconButton size="small" sx={{ color: c.actionActive, '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}>
                          <MoreVertIcon sx={{ fontSize: 18 }} />
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

      <InviteUserDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSend={rows => { onInviteUser(rows); setInviteOpen(false) }}
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
    const newUsers: AccountUser[] = rows.map((r, i) => ({
      user: { id: `invited-${Date.now()}-${i}`, initials: r.email.slice(0, 2).toUpperCase(), name: r.email, email: r.email, color: '#0053E5' },
      createSpace:  r.createSpace,
      amplifySpace: r.amplifySpace,
      jobRole:      'Pending',
      lastLogin:    'Pending',
      createdDate:  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      pending:      true,
    }))
    setUsers(prev => [...prev, ...newUsers])
    if (asApprover) {
      setApproverIds(prev => { const s = new Set(prev); newUsers.forEach(u => s.add(u.user.id)); return s })
    }
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
          {nav === 'ai'          && <PlaceholderSection label="AI features" />}
          {nav === 'approvals'   && (
            <ApprovalsSection
              users={users}
              approverIds={approverIds}
              enabled={approvalsEnabled}
              onToggle={setApprovalsEnabled}
              onSetApprovers={ids => setApproverIds(new Set(ids))}
              onAddUsers={(rows, asApprover) => handleInviteUser(rows, asApprover)}
            />
          )}
          {nav === 'access'      && <PlaceholderSection label="Access" />}
        </Box>
      </Box>
    </Dialog>
  )
}
