import { useState } from 'react'
import {
  Box, Typography, Dialog, IconButton,
  Avatar, Button, OutlinedInput, InputAdornment,
  Table, TableBody, TableCell, TableHead, TableRow,
  Tooltip,
} from '@mui/material'
import CloseIcon             from '@mui/icons-material/Close'
import HelpOutlineIcon       from '@mui/icons-material/HelpOutline'
import SearchIcon            from '@mui/icons-material/Search'
import AddIcon               from '@mui/icons-material/Add'
import ArrowDownwardIcon     from '@mui/icons-material/ArrowDownward'
import InfoOutlinedIcon      from '@mui/icons-material/InfoOutlined'
import MoreVertIcon          from '@mui/icons-material/MoreVert'
import PeopleOutlinedIcon    from '@mui/icons-material/PeopleOutlined'
import LockOutlinedIcon      from '@mui/icons-material/LockOutlined'
import SmartToyOutlinedIcon  from '@mui/icons-material/SmartToyOutlined'
import TaskAltOutlinedIcon   from '@mui/icons-material/TaskAltOutlined'
import LockPersonIcon        from '@mui/icons-material/LockPerson'

import { ALL_USERS, OWNER_USER } from './ManageAccessDialog'

// ─── Design tokens ────────────────────────────────────────────────────────────
const c = {
  primary:        '#0053E5',
  secondary:      '#03194F',
  textPrimary:    'rgba(0,0,0,0.87)',
  textSecondary:  'rgba(60,60,72,0.6)',
  actionActive:   'rgba(0,0,0,0.56)',
  grey100:        '#F5F7FB',
  grey300:        '#CFD6EA',
  divider:        'rgba(0,0,0,0.08)',
}

const navyTipSx = {
  bgcolor: '#03194F', borderRadius: '6px', fontSize: 12,
  fontFamily: '"Open Sans", sans-serif',
}

// ─── Mock data ────────────────────────────────────────────────────────────────
interface AccountUser {
  user:         typeof OWNER_USER
  isOwner?:     boolean
  createSpace:  string
  amplifySpace: string
  lastLogin:    string
  createdDate:  string
}

const USERS: AccountUser[] = [
  { user: OWNER_USER,    isOwner: true, createSpace: 'Account owner',                    amplifySpace: 'Account owner', lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[1],               createSpace: 'Editor',                             amplifySpace: 'Contributor',   lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[2],               createSpace: 'Editor',                             amplifySpace: 'No access',     lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[3],               createSpace: 'No access',                          amplifySpace: 'Contributor',   lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[4],               createSpace: 'View only',                          amplifySpace: 'No access',     lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
  { user: ALL_USERS[5],               createSpace: 'Builder editor,\nProfessional services', amplifySpace: 'Contributor', lastLogin: 'Sep 8, 2022, 10:23 am', createdDate: 'Sep 8, 2022, 10:23 am' },
]

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
type NavKey = 'users' | 'permissions' | 'ai' | 'approvals' | 'access'
const NAV: { key: NavKey; label: string; icon: React.ReactNode }[] = [
  { key: 'users',       label: 'Users',       icon: <PeopleOutlinedIcon   sx={{ fontSize: 18 }} /> },
  { key: 'permissions', label: 'Permissions', icon: <LockOutlinedIcon     sx={{ fontSize: 18 }} /> },
  { key: 'ai',          label: 'AI features', icon: <SmartToyOutlinedIcon sx={{ fontSize: 18 }} /> },
  { key: 'approvals',   label: 'Approvals',   icon: <TaskAltOutlinedIcon  sx={{ fontSize: 18 }} /> },
  { key: 'access',      label: 'Access',      icon: <LockPersonIcon       sx={{ fontSize: 18 }} /> },
]

// ─── Column header with ⓘ + seat badge ──────────────────────────────────────
function SeatHeader({ label, tooltip, used, total }: { label: string; tooltip: string; used: number; total: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary }}>
        {label}
      </Typography>
      <Tooltip title={tooltip} placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
        <InfoOutlinedIcon sx={{ fontSize: 14, color: c.actionActive, cursor: 'default' }} />
      </Tooltip>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', bgcolor: 'rgba(0,83,229,0.08)', borderRadius: '4px', px: '6px', py: '2px' }}>
        <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 11, fontWeight: 600, color: c.primary }}>
          {used}/{total}
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Users section ────────────────────────────────────────────────────────────
function UsersSection() {
  const [search, setSearch]     = useState('')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const filtered = search
    ? USERS.filter(r =>
        r.user.name.toLowerCase().includes(search.toLowerCase()) ||
        r.user.email.toLowerCase().includes(search.toLowerCase())
      )
    : USERS

  const headCellSx = {
    fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600,
    color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`,
    py: '10px', px: '16px', whiteSpace: 'nowrap' as const, bgcolor: '#fff',
  }
  const bodyCellSx = {
    fontFamily: '"Open Sans",sans-serif', fontSize: 13,
    color: c.textPrimary, borderBottom: `1px solid ${c.grey300}`,
    py: '10px', px: '16px',
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Title row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '20px', flexShrink: 0 }}>
        <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 20, color: c.textPrimary }}>
          Users ({USERS.length})
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
            variant="contained"
            sx={{
              fontFamily: '"Open Sans",sans-serif', fontWeight: 600, fontSize: 14,
              textTransform: 'none', borderRadius: '8px', px: '16px', py: '7px',
              bgcolor: c.primary, boxShadow: 'none',
              '&:hover': { bgcolor: '#0047C8', boxShadow: 'none' },
            }}
          >
            Invite user
          </Button>
          <OutlinedInput
            placeholder="Search..."
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: c.actionActive }} />
              </InputAdornment>
            }
            sx={{
              width: 220, fontSize: 13, fontFamily: '"Open Sans",sans-serif',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 },
            }}
          />
        </Box>
      </Box>

      {/* Scrollable table */}
      <Box sx={{ flex: 1, overflowX: 'auto', overflowY: 'auto', borderRadius: '8px', border: `1px solid ${c.grey300}` }}>
        <Table size="small" sx={{ tableLayout: 'fixed', minWidth: 900 }}>
          <TableHead>
            <TableRow>
              {/* Sticky user column */}
              <TableCell sx={{ ...headCellSx, width: 260, position: 'sticky', left: 0, zIndex: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, fontWeight: 600, color: c.textPrimary }}>
                    User
                  </Typography>
                  <ArrowDownwardIcon sx={{ fontSize: 14, color: c.actionActive }} />
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
              {/* Space for hover actions */}
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
                  {/* User — sticky */}
                  <TableCell sx={{ ...bodyCellSx, position: 'sticky', left: 0, zIndex: 1, bgcolor: isHovered ? c.grey100 : '#fff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar sx={{
                        width: 32, height: 32, bgcolor: c.secondary,
                        fontSize: 11, fontFamily: '"Inter",sans-serif',
                        fontWeight: 600, flexShrink: 0,
                      }}>
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
                  </TableCell>

                  {/* Create space */}
                  <TableCell sx={bodyCellSx}>
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.createSpace === 'No access' ? c.textSecondary : c.textPrimary, whiteSpace: 'pre-line' }}>
                      {row.createSpace}
                    </Typography>
                  </TableCell>

                  {/* Amplify space */}
                  <TableCell sx={bodyCellSx}>
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: row.amplifySpace === 'No access' ? c.textSecondary : c.textPrimary }}>
                      {row.amplifySpace}
                    </Typography>
                  </TableCell>

                  {/* Last login */}
                  <TableCell sx={bodyCellSx}>
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                      {row.lastLogin}
                    </Typography>
                  </TableCell>

                  {/* Creation date */}
                  <TableCell sx={bodyCellSx}>
                    <Typography sx={{ fontFamily: '"Open Sans",sans-serif', fontSize: 13, color: c.textPrimary }}>
                      {row.createdDate}
                    </Typography>
                  </TableCell>

                  {/* Hover actions */}
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
    </Box>
  )
}

// ─── Placeholder section ──────────────────────────────────────────────────────
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
  const [nav, setNav] = useState<NavKey>('users')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 1020, maxWidth: '95vw', height: 680, maxHeight: '90vh',
          borderRadius: '12px', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', p: 0,
        },
      }}
    >
      {/* ── Title bar ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: '24px', py: '14px', borderBottom: `1px solid ${c.grey300}`, flexShrink: 0,
      }}>
        <Typography sx={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 18, color: c.textPrimary }}>
          Account settings
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <IconButton size="small" sx={{ color: c.actionActive }}>
            <HelpOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: c.actionActive }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Body: sidebar + content ── */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <Box sx={{
          width: 176, flexShrink: 0, borderRight: `1px solid ${c.grey300}`,
          py: '12px', px: '8px', display: 'flex', flexDirection: 'column', gap: '2px',
          bgcolor: '#FAFBFD',
        }}>
          {NAV.map(item => (
            <Box
              key={item.key}
              onClick={() => setNav(item.key)}
              sx={{
                display: 'flex', alignItems: 'center', gap: '8px',
                px: '12px', py: '8px', borderRadius: '8px', cursor: 'pointer',
                bgcolor: nav === item.key ? 'rgba(0,83,229,0.08)' : 'transparent',
                color: nav === item.key ? c.primary : c.textPrimary,
                '&:hover': {
                  bgcolor: nav === item.key ? 'rgba(0,83,229,0.08)' : 'rgba(0,0,0,0.04)',
                },
              }}
            >
              <Box sx={{ color: nav === item.key ? c.primary : c.actionActive, display: 'flex', flexShrink: 0 }}>
                {item.icon}
              </Box>
              <Typography sx={{
                fontFamily: '"Open Sans",sans-serif', fontSize: 14,
                fontWeight: nav === item.key ? 600 : 400,
                color: 'inherit',
              }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'hidden', px: '24px', py: '20px', display: 'flex', flexDirection: 'column' }}>
          {nav === 'users'       && <UsersSection />}
          {nav === 'permissions' && <PlaceholderSection label="Permissions" />}
          {nav === 'ai'          && <PlaceholderSection label="AI features" />}
          {nav === 'approvals'   && <PlaceholderSection label="Approvals" />}
          {nav === 'access'      && <PlaceholderSection label="Access" />}
        </Box>
      </Box>
    </Dialog>
  )
}
