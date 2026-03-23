import { useState, useEffect } from 'react'
import {
  Box, Typography, IconButton, Button, Dialog,
  DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, Collapse, Avatar, Tooltip,
} from '@mui/material'
import CloseIcon              from '@mui/icons-material/Close'
import HelpOutlineIcon        from '@mui/icons-material/HelpOutline'
import GroupsIcon             from '@mui/icons-material/Groups'
import PeopleOutlinedIcon     from '@mui/icons-material/PeopleOutlined'
import LockOutlinedIcon       from '@mui/icons-material/LockOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DoNotDisturbOnOutlinedIcon from '@mui/icons-material/DoNotDisturbOnOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import KeyboardArrowDownIcon  from '@mui/icons-material/KeyboardArrowDown'

import {
  type User,
  OWNER_USER,
  UsersAutocomplete,
} from './ManageAccessDialog'

// ─── Types ────────────────────────────────────────────────────────────────────
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
  secondary:     '#03194F',
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

// ─── Permission options ───────────────────────────────────────────────────────
const USAGE_OPTIONS: {
  value: AvatarUsagePermission
  label: string
  icon:  React.ReactNode
  color: string
}[] = [
  {
    value: 'everyone',
    label: 'Everyone in your account',
    icon:  <GroupsIcon sx={{ fontSize: 18 }} />,
    color: c.primary,
  },
  {
    value: 'specific',
    label: 'Specific users',
    icon:  <PeopleOutlinedIcon sx={{ fontSize: 18 }} />,
    color: '#F46900',
  },
  {
    value: 'private',
    label: 'Private (only you)',
    icon:  <LockOutlinedIcon sx={{ fontSize: 18 }} />,
    color: '#118747',
  },
]

function getUsageOption(v: AvatarUsagePermission) {
  return USAGE_OPTIONS.find(o => o.value === v) ?? USAGE_OPTIONS[0]
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{
      fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 14,
      color: c.textPrimary, mb: '8px',
    }}>
      {children}
    </Typography>
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
  const defaultApprovers = [OWNER_USER]

  const [usagePerm,    setUsagePerm]    = useState<AvatarUsagePermission>(
    initialSettings?.usagePermission ?? 'everyone'
  )
  const [specificUsers, setSpecificUsers] = useState<User[]>(
    initialSettings?.specificUsers ?? []
  )
  const [approverUsers, setApproverUsers] = useState<User[]>(
    initialSettings?.approverUsers ?? defaultApprovers
  )
  const [requests, setRequests] = useState<AccessRequest[]>(initialRequests)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [showDenyAllConfirm, setShowDenyAllConfirm] = useState(false)

  // Sync when dialog reopens
  useEffect(() => {
    if (open) {
      setUsagePerm(initialSettings?.usagePermission ?? 'everyone')
      setSpecificUsers(initialSettings?.specificUsers ?? [])
      setApproverUsers(initialSettings?.approverUsers ?? defaultApprovers)
      setRequests(initialRequests)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Dirty check
  function sameIds(a: User[], b: User[]) {
    if (a.length !== b.length) return false
    const bs = new Set(b.map(u => u.id))
    return a.every(u => bs.has(u.id))
  }
  const initVp = initialSettings?.usagePermission ?? 'everyone'
  const isDirty =
    usagePerm !== initVp ||
    !sameIds(specificUsers, initialSettings?.specificUsers ?? []) ||
    !sameIds(approverUsers, initialSettings?.approverUsers ?? defaultApprovers)

  function handleClose() {
    if (isDirty) { setShowDiscardConfirm(true); return }
    onClose()
  }

  function handleSave() {
    onSave({ usagePermission: usagePerm, specificUsers, approverUsers }, requests)
  }

  function reqToUser(req: AccessRequest): User {
    return { id: req.id, name: req.name, initials: req.initials, color: req.color, email: req.email }
  }

  function handleApprove(req: AccessRequest) {
    const userToAdd = reqToUser(req)
    setSpecificUsers(prev =>
      prev.find(u => u.id === userToAdd.id) ? prev : [...prev, userToAdd]
    )
    if (usagePerm === 'everyone') setUsagePerm('specific')
    setRequests(prev => prev.filter(r => r.id !== req.id))
  }

  function handleDeny(req: AccessRequest) {
    setRequests(prev => prev.filter(r => r.id !== req.id))
  }

  function handleApproveAll() {
    const newUsers: User[] = requests.map(reqToUser)
    setSpecificUsers(prev => {
      const existingIds = new Set(prev.map(u => u.id))
      return [...prev, ...newUsers.filter(u => !existingIds.has(u.id))]
    })
    if (usagePerm === 'everyone') setUsagePerm('specific')
    setRequests([])
  }

  function handleDenyAll() {
    setRequests([])
    setShowDenyAllConfirm(false)
  }

  const showSpecificPicker = usagePerm === 'specific'
  const showApprovers      = usagePerm !== 'private'
  const approverLabel      = usagePerm === 'specific'
    ? 'Who can approve to use this avatar'
    : 'Who can allow to use this avatar'

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 560, borderRadius: '12px',
            fontFamily: '"Open Sans", sans-serif',
          },
        }}
      >
        <DialogTitle sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          pb: 0, pt: 2.5, px: 3,
        }}>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 700,
            fontSize: 20, color: c.textPrimary, flex: 1,
          }}>
            Manage permissions
          </Typography>
          <IconButton size="small" sx={{ color: 'rgba(0,0,0,0.4)' }}>
            <HelpOutlineIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton size="small" onClick={handleClose} sx={{ color: 'rgba(0,0,0,0.4)' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>

          {/* Who can use this avatar */}
          <Box sx={{ mb: 2.5 }}>
            <SectionLabel>Who can use this avatar</SectionLabel>
            <Select
              value={usagePerm}
              onChange={e => setUsagePerm(e.target.value as AvatarUsagePermission)}
              fullWidth
              size="small"
              IconComponent={KeyboardArrowDownIcon}
              renderValue={val => {
                const o = getUsageOption(val as AvatarUsagePermission)
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: o.color, display: 'flex' }}>{o.icon}</Box>
                    <Typography sx={{
                      fontFamily: '"Open Sans", sans-serif', fontSize: 14,
                      color: c.textPrimary,
                    }}>{o.label}</Typography>
                  </Box>
                )
              }}
              sx={{
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.primary },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.primary },
              }}
            >
              {USAGE_OPTIONS.map(o => (
                <MenuItem key={o.value} value={o.value} sx={{ gap: 1.5 }}>
                  <Box sx={{ color: o.color, display: 'flex' }}>{o.icon}</Box>
                  <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14 }}>
                    {o.label}
                  </Typography>
                </MenuItem>
              ))}
            </Select>

            {/* Specific users picker */}
            <Collapse in={showSpecificPicker} unmountOnExit>
              <Box sx={{ mt: 1 }}>
                <UsersAutocomplete
                  value={specificUsers}
                  onChange={setSpecificUsers}
                  placeholder="Select users or enter an email"
                />
              </Box>
            </Collapse>
          </Box>

          {/* Who can allow/approve */}
          <Collapse in={showApprovers} unmountOnExit>
            <Box sx={{ mb: 2.5 }}>
              <SectionLabel>{approverLabel}</SectionLabel>
              <UsersAutocomplete
                value={approverUsers}
                onChange={v => { if (v.length > 0) setApproverUsers(v) }}
                placeholder="Select users"
              />
            </Box>
          </Collapse>

          {/* Access requests section */}
          <Box sx={{ mb: 1 }}>
            <SectionLabel>
              {`User who requested to use this avatar (${requests.length})`}
            </SectionLabel>

            {requests.length === 0 ? (
              <Box sx={{
                bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.10)',
                px: 2, py: 2.5,
                display: 'flex', alignItems: 'flex-start', gap: 1.5,
              }}>
                <VisibilityOutlinedIcon sx={{ fontSize: 18, color: c.textSecondary, flexShrink: 0, mt: '1px' }} />
                <Typography sx={{
                  fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                  color: c.textSecondary, lineHeight: 1.5,
                }}>
                  {usagePerm === 'private'
                    ? `Only you can use this avatar. You'll see access requests here if the permission changes.`
                    : `Anyone can see this avatar, you'll see user requests here when people ask to use it`}
                </Typography>
              </Box>
            ) : (
              <Box>
                {/* Request list */}
                <Box sx={{
                  border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', overflow: 'hidden',
                }}>
                  {requests.map((req, idx) => (
                    <Box
                      key={req.id}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        px: 2, py: 1.25,
                        borderBottom: idx < requests.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                        bgcolor: '#fff',
                      }}
                    >
                      {/* Initials avatar */}
                      <Avatar sx={{
                        width: 32, height: 32,
                        bgcolor: req.color,
                        fontSize: 11,
                        fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        {req.initials}
                      </Avatar>
                      {/* Name + email */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{
                          fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                          fontWeight: 600, color: c.textPrimary, lineHeight: 1.3,
                        }}>
                          {req.name}
                        </Typography>
                        <Typography sx={{
                          fontFamily: '"Open Sans", sans-serif', fontSize: 12,
                          color: c.textSecondary, lineHeight: 1.4,
                        }}>
                          {req.email}
                        </Typography>
                      </Box>
                      {/* Deny */}
                      <Tooltip title="Deny" placement="top" arrow
                        componentsProps={{ tooltip: { sx: navyTooltipSx } }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleDeny(req)}
                          sx={{ color: c.errorMain, p: '4px', '&:hover': { bgcolor: 'rgba(230,40,67,0.08)' } }}
                        >
                          <DoNotDisturbOnOutlinedIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                      </Tooltip>
                      {/* Approve */}
                      <Tooltip title="Approve" placement="top" arrow
                        componentsProps={{ tooltip: { sx: navyTooltipSx } }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleApprove(req)}
                          sx={{ color: c.successMain, p: '4px', '&:hover': { bgcolor: 'rgba(17,135,71,0.08)' } }}
                        >
                          <CheckCircleOutlineIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>

                {/* Deny all / Allow all */}
                <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
                  <Button
                    variant="outlined" fullWidth size="small"
                    onClick={() => setShowDenyAllConfirm(true)}
                    sx={{
                      color: c.errorMain, borderColor: c.errorMain,
                      fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
                      textTransform: 'none', borderRadius: '8px',
                      '&:hover': { bgcolor: 'rgba(230,40,67,0.06)', borderColor: c.errorMain },
                    }}
                  >
                    Deny all
                  </Button>
                  <Button
                    variant="outlined" fullWidth size="small"
                    onClick={handleApproveAll}
                    sx={{
                      color: c.successMain, borderColor: c.successMain,
                      fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
                      textTransform: 'none', borderRadius: '8px',
                      '&:hover': { bgcolor: 'rgba(17,135,71,0.06)', borderColor: c.successMain },
                    }}
                  >
                    Allow all
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            sx={{
              fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
              color: c.textPrimary, textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              bgcolor: c.primary, color: '#fff',
              fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 14,
              textTransform: 'none', borderRadius: '8px', px: 2.5,
              '&:hover': { bgcolor: '#0047CC' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discard confirmation */}
      <Dialog open={showDiscardConfirm} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Open Sans"', fontWeight: 700, fontSize: 18, pb: 1 }}>
          Discard changes?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: '"Open Sans"', fontSize: 14, color: c.textSecondary }}>
            All your changes will be lost. Are you sure?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowDiscardConfirm(false)}
            sx={{ fontFamily: '"Inter"', textTransform: 'none', color: c.textPrimary }}>
            Stay
          </Button>
          <Button variant="contained" onClick={() => { setShowDiscardConfirm(false); onClose() }}
            sx={{ bgcolor: c.errorMain, fontFamily: '"Inter"', textTransform: 'none', borderRadius: '8px',
              '&:hover': { bgcolor: '#C41E3A' } }}>
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deny all confirmation */}
      <Dialog open={showDenyAllConfirm} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Open Sans"', fontWeight: 700, fontSize: 18, pb: 1 }}>
          Deny all {requests.length} requests?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: '"Open Sans"', fontSize: 14, color: c.textSecondary }}>
            All pending access requests will be denied. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowDenyAllConfirm(false)}
            sx={{ fontFamily: '"Inter"', textTransform: 'none', color: c.textPrimary }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleDenyAll}
            sx={{ bgcolor: c.errorMain, fontFamily: '"Inter"', textTransform: 'none', borderRadius: '8px',
              '&:hover': { bgcolor: '#C41E3A' } }}>
            Deny all
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
