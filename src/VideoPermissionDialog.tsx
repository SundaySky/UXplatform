import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton,
  Select, MenuItem, Collapse, Alert,
  Divider, Checkbox, FormControlLabel,
} from '@mui/material'
import CloseIcon              from '@mui/icons-material/Close'
import HelpOutlineIcon        from '@mui/icons-material/HelpOutline'
import KeyboardArrowDownIcon  from '@mui/icons-material/KeyboardArrowDown'
import InfoOutlinedIcon       from '@mui/icons-material/InfoOutlined'
import ManageAccountsIcon     from '@mui/icons-material/ManageAccounts'
import PersonOutlinedIcon     from '@mui/icons-material/PersonOutlined'
import CreateOutlinedIcon     from '@mui/icons-material/CreateOutlined'

// Composite icon: person + pen side by side (two distinct shapes)
export function UserPenIcon({ sx }: { sx?: { fontSize?: number | string; color?: string; [k: string]: unknown } }) {
  const rawSize = sx?.fontSize ?? 20
  const numSize = typeof rawSize === 'string' ? parseInt(rawSize) : (rawSize as number)
  const color   = (sx?.color as string | undefined) ?? 'inherit'
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '2px', lineHeight: 0 }}>
      <PersonOutlinedIcon sx={{ fontSize: numSize, color }} />
      <CreateOutlinedIcon sx={{ fontSize: Math.round(numSize * 0.72), color }} />
    </Box>
  )
}

import {
  type ViewPermission,
  type User,
  VIEW_OPTIONS,
  UsersAutocomplete,
  OWNER_USER,
} from './ManageAccessDialog'

// ─── Types ────────────────────────────────────────────────────────────────────
export type VideoViewPermission = ViewPermission | 'owners' | 'videoEditors'

export interface VideoPermissionSettings {
  viewPermission: VideoViewPermission
  viewUsers:      User[]
  editUsers:      User[]
  ownerUsers:     User[]
  noDuplicate:    boolean
}

// ─── Video-specific view options (extends shared VIEW_OPTIONS + 'owners') ─────
const c = {
  primary:       '#0053E5',
  textPrimary:   'rgba(0,0,0,0.87)',
  textSecondary: 'rgba(60,60,72,0.8)',
  divider:       'rgba(0,83,229,0.12)',
  grey300:       '#CFD6EA',
  errorMain:     '#E62843',
  warningMain:   '#F46900',
  successMain:   '#118747',
  teal:          '#00897B',
}

const VIDEO_VIEW_OPTIONS: {
  value: VideoViewPermission
  label: string
  Icon: React.ElementType
  iconColor: string
  bgColor: string
}[] = [
  ...VIEW_OPTIONS.filter(o => o.value !== 'private' && o.value !== 'editors'),
  {
    value: 'videoEditors' as const,
    label: 'Video editors',
    Icon: UserPenIcon,
    iconColor: c.teal,
    bgColor: 'rgba(0,137,123,0.10)',
  },
  {
    value: 'owners',
    label: 'Video owners only',
    Icon: ManageAccountsIcon,
    iconColor: c.primary,
    bgColor: 'rgba(0,83,229,0.10)',
  },
  VIEW_OPTIONS.find(o => o.value === 'private')!,
]

function getVideoViewOption(v: VideoViewPermission) {
  return VIDEO_VIEW_OPTIONS.find(o => o.value === v) ?? VIDEO_VIEW_OPTIONS[0]
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
const labelSx = {
  fontFamily: '"Open Sans", sans-serif',
  fontWeight: 600,
  fontSize: 14,
  color: c.textPrimary,
  mb: '8px',
  display: 'block',
} as const

// ─── Component ────────────────────────────────────────────────────────────────
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
  const defaultOwners = [OWNER_USER]

  const [viewPermission,     setViewPermission]     = useState<VideoViewPermission>(initialSettings?.viewPermission ?? 'everyone')
  const [viewUsers,          setViewUsers]          = useState<User[]>(initialSettings?.viewUsers ?? [])
  const [editUsers,          setEditUsers]          = useState<User[]>(initialSettings?.editUsers ?? [])
  const [ownerUsers,         setOwnerUsers]         = useState<User[]>(initialSettings?.ownerUsers ?? defaultOwners)
  const [noDuplicate,        setNoDuplicate]        = useState(initialSettings?.noDuplicate ?? false)
  const [viewUsersError,     setViewUsersError]     = useState(false)
  const [ownerUsersError,    setOwnerUsersError]    = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      const s = initialSettings
      setViewPermission(s?.viewPermission ?? 'everyone')
      setViewUsers(s?.viewUsers ?? [])
      setEditUsers(s?.editUsers ?? [])
      setOwnerUsers(s?.ownerUsers ?? defaultOwners)
      setNoDuplicate(s?.noDuplicate ?? false)
      setViewUsersError(false)
      setOwnerUsersError(false)
      setShowDiscardConfirm(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Clear errors reactively
  useEffect(() => {
    if (viewPermission !== 'specific' || viewUsers.length > 0) setViewUsersError(false)
  }, [viewPermission, viewUsers])

  useEffect(() => {
    if (ownerUsers.length > 0) setOwnerUsersError(false)
  }, [ownerUsers])

  // Dirty check
  function sameIds(a: User[], b: User[]) {
    if (a.length !== b.length) return false
    const bs = new Set(b.map(u => u.id))
    return a.every(u => bs.has(u.id))
  }
  const initVp    = initialSettings?.viewPermission ?? 'everyone'
  const initNoDup = initialSettings?.noDuplicate    ?? false
  const isDirty =
    viewPermission !== initVp ||
    noDuplicate    !== initNoDup ||
    !sameIds(viewUsers,  initialSettings?.viewUsers  ?? []) ||
    !sameIds(editUsers,  initialSettings?.editUsers  ?? []) ||
    !sameIds(ownerUsers, initialSettings?.ownerUsers ?? defaultOwners)

  function handleClose() {
    if (isDirty) { setShowDiscardConfirm(true) } else { onClose() }
  }

  function handleSave() {
    if (viewPermission === 'specific' && viewUsers.length === 0) {
      setViewUsersError(true)
      return
    }
    if (showOwnerSection && ownerUsers.length === 0) {
      setOwnerUsersError(true)
      return
    }
    onSave({ viewPermission, viewUsers, editUsers, ownerUsers, noDuplicate })
  }

  // Show/hide logic
  const showSpecific      = viewPermission === 'specific'
  const showPrivateAlert  = viewPermission === 'private'
  const showEditSection   = viewPermission !== 'private' && viewPermission !== 'owners' && viewPermission !== 'videoEditors'
  const showOwnerSection  = viewPermission !== 'private'
  const showNoDuplicate   = viewPermission !== 'private' && viewPermission !== 'owners' && viewPermission !== 'videoEditors'

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 700,
          maxWidth: '98vw',
          borderRadius: '8px',
          boxShadow: '0px 0px 10px rgba(3,25,79,0.25)',
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <DialogTitle sx={{ p: '20px 16px 12px 28px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
            fontSize: 20, color: c.textPrimary, lineHeight: 1.5, flex: 1,
          }}>
            Manage permissions
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

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <DialogContent sx={{ p: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── GROUP 1: View + Edit ─────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Who can view */}
          <Box>
            <Typography sx={labelSx}>Who can view this video</Typography>

            <Select
              value={viewPermission}
              onChange={e => setViewPermission(e.target.value as VideoViewPermission)}
              fullWidth
              size="medium"
              IconComponent={KeyboardArrowDownIcon}
              renderValue={v => {
                const o = getVideoViewOption(v as VideoViewPermission)
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '8px',
                      bgcolor: o.bgColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <o.Icon sx={{ fontSize: 18, color: o.iconColor }} />
                    </Box>
                    <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: c.textPrimary }}>
                      {o.label}
                    </Typography>
                  </Box>
                )
              }}
              sx={{
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.primary },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.primary },
                '& .MuiSelect-icon': { color: 'rgba(0,0,0,0.54)' },
              }}
            >
              {VIDEO_VIEW_OPTIONS.map(o => (
                <MenuItem key={o.value} value={o.value} sx={{ gap: 1.5, borderRadius: '8px', mx: '4px' }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: '8px',
                    bgcolor: o.bgColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <o.Icon sx={{ fontSize: 18, color: o.iconColor }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: c.textPrimary }}>
                      {o.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>

            {/* Specific user picker */}
            <Collapse in={showSpecific} unmountOnExit>
              <Box sx={{ mt: 1.5 }}>
                <UsersAutocomplete
                  value={viewUsers}
                  onChange={setViewUsers}
                  placeholder="Add people..."
                  error={viewUsersError}
                  helperText={viewUsersError ? 'Add at least one user' : undefined}
                />
              </Box>
            </Collapse>

            {/* Private alert */}
            <Collapse in={showPrivateAlert} unmountOnExit>
              <Alert
                severity="success"
                icon={<InfoOutlinedIcon fontSize="small" />}
                sx={{
                  mt: 1.5, borderRadius: '8px',
                  fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                  bgcolor: 'rgba(17,135,71,0.06)', color: c.textPrimary,
                  '& .MuiAlert-icon': { color: c.successMain },
                }}
              >
                Only you can see this video.
              </Alert>
            </Collapse>

            {/* No duplicate checkbox — hidden for private / owners */}
            <Collapse in={showNoDuplicate} unmountOnExit>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={noDuplicate}
                    onChange={e => setNoDuplicate(e.target.checked)}
                    size="small"
                    sx={{ color: c.grey300, '&.Mui-checked': { color: c.primary } }}
                  />
                }
                label={
                  <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 13, color: c.textPrimary }}>
                    Don't allow to duplicate video for view only
                  </Typography>
                }
                sx={{ mt: 1, ml: '-4px' }}
              />
            </Collapse>
          </Box>

          {/* Who can edit — hidden when private or owners-only */}
          <Collapse in={showEditSection} unmountOnExit>
            <Box>
              <Typography sx={labelSx}>Who can edit this video</Typography>
              <UsersAutocomplete
                value={editUsers}
                onChange={setEditUsers}
                placeholder="Select users, groups, or enter an email"
                excludeIds={viewUsers.map(u => u.id)}
              />
            </Box>
          </Collapse>
        </Box>

        {/* ── Section divider + GROUP 2 — hidden when private ─────────────── */}
        <Collapse in={showOwnerSection} unmountOnExit>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Divider sx={{ borderColor: c.divider }} />

            {/* Video owner */}
            <Box>
              <Typography sx={labelSx}>Video owner</Typography>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontSize: 12,
                color: c.textSecondary, mb: '10px', mt: '-4px',
              }}>
                Can edit the video change permissions, delete and rename
              </Typography>
              <UsersAutocomplete
                value={ownerUsers}
                onChange={setOwnerUsers}
                placeholder="Add video owners..."
                error={ownerUsersError}
                helperText={ownerUsersError ? 'At least one owner is required' : undefined}
              />
            </Box>
          </Box>
        </Collapse>

      </DialogContent>

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <Divider sx={{ borderColor: c.divider }} />
      <DialogActions sx={{ px: '28px', py: '16px', gap: '8px' }}>
        <Button
          variant="text"
          size="large"
          onClick={handleClose}
          sx={{
            color: c.primary,
            fontFamily: '"Open Sans", sans-serif',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          sx={{
            bgcolor: c.primary,
            fontFamily: '"Open Sans", sans-serif',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#0047CC', boxShadow: 'none' },
          }}
        >
          Save
        </Button>
      </DialogActions>

      {/* ── Discard confirmation ────────────────────────────────────────────── */}
      <Dialog
        open={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        maxWidth="xs"
        fullWidth
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
          <Button
            variant="text"
            onClick={() => setShowDiscardConfirm(false)}
            sx={{ color: c.primary, textTransform: 'none', fontFamily: '"Open Sans", sans-serif', fontWeight: 600 }}
          >
            Keep editing
          </Button>
          <Button
            variant="contained"
            onClick={() => { setShowDiscardConfirm(false); onClose() }}
            sx={{
              bgcolor: c.errorMain, textTransform: 'none',
              fontFamily: '"Open Sans", sans-serif', fontWeight: 600,
              borderRadius: '8px', boxShadow: 'none',
              '&:hover': { bgcolor: '#C41E34', boxShadow: 'none' },
            }}
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>

    </Dialog>
  )
}
