import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton,
  Select, MenuItem, Chip, Avatar, Tooltip,
  Autocomplete, TextField, Collapse, Alert,
  Divider,
} from '@mui/material'
import CloseIcon                   from '@mui/icons-material/Close'
import HelpOutlineIcon             from '@mui/icons-material/HelpOutline'
import GroupsIcon                  from '@mui/icons-material/Groups'
import ManageAccountsIcon          from '@mui/icons-material/ManageAccounts'
import LockOutlinedIcon            from '@mui/icons-material/LockOutlined'
import PeopleOutlinedIcon          from '@mui/icons-material/PeopleOutlined'
import PersonOutlinedIcon          from '@mui/icons-material/PersonOutlined'
import CheckIcon                   from '@mui/icons-material/Check'
import InfoOutlinedIcon            from '@mui/icons-material/InfoOutlined'
import KeyboardArrowDownIcon       from '@mui/icons-material/KeyboardArrowDown'

// ─── Types ────────────────────────────────────────────────────────────────────
export type ViewPermission = 'everyone' | 'editors' | 'specific' | 'private'

export interface User {
  id:       string
  initials: string
  name:     string
  email:    string
  color:    string
}

export interface PermissionSettings {
  viewPermission: ViewPermission
  viewUsers:      User[]   // used when viewPermission === 'specific'
  manageUsers:    User[]   // who can manage access
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
const c = {
  primary:       '#0053E5',
  secondary:     '#03194F',
  textPrimary:   'rgba(0,0,0,0.87)',
  textSecondary: 'rgba(60,60,72,0.8)',
  divider:       'rgba(0,83,229,0.12)',
  grey300:       '#CFD6EA',
  errorMain:     '#E62843',
  successMain:   '#118747',
  warningMain:   '#F46900',
}

const navyTooltipSx = {
  bgcolor: '#03194F',
  borderRadius: '8px',
  px: 1.5, py: 1,
  maxWidth: 260,
  '& .MuiTooltip-arrow': { color: '#03194F' },
}

// ─── Users ─────────────────────────────────────────────────────────────────────
export const OWNER_USER: User = {
  id: 'ja', initials: 'JA', name: 'Johan Appleseed', email: 'appleseedj@Sundaysky.com', color: '#0053E5',
}

export const ALL_USERS: User[] = [
  OWNER_USER,
  { id: 'jq', initials: 'JQ', name: 'Jarvis Quindarius',    email: 'theoj@Sundaysky.com',        color: '#7B1FA2' },
  { id: 'kw', initials: 'KW', name: 'Klara Brightlingstone', email: 'wintherl@Sundaysky.com',     color: '#E65100' },
  { id: 'mr', initials: 'MR', name: 'Mckayla Runolfsson',   email: 'runolfsson_m@Sundaysky.com', color: '#1565C0' },
  { id: 'eb', initials: 'EB', name: 'Eli Bogan',             email: 'bogane@Sundaysky.com',       color: '#2E7D32' },
  { id: 'ke', initials: 'KE', name: 'Kenton Emard',          email: 'emardk@Sundaysky.com',       color: '#AD1457' },
  { id: 'ss', initials: 'SS', name: 'Shea Streich',          email: 'streichs@Sundaysky.com',     color: '#00695C' },
  { id: 'bw', initials: 'BW', name: 'Brigitte Wintheiser',   email: 'wintheiserb@Sundaysky.com',  color: '#4527A0' },
  { id: 'aj', initials: 'AJ', name: 'Adrianna Jast',         email: 'jasta@Sundaysky.com',        color: '#558B2F' },
  { id: 'jj', initials: 'JJ', name: 'Jayson Jerde',          email: 'jerdej@Sundaysky.com',       color: '#0277BD' },
  { id: 'jc', initials: 'JC', name: 'Jeramy Crona',          email: 'cronaj@Sundaysky.com',       color: '#6D4C41' },
]

// ─── View permission options ──────────────────────────────────────────────────
export const VIEW_OPTIONS: {
  value: ViewPermission
  label: string
  Icon: React.ElementType
  iconColor: string
  bgColor: string
}[] = [
  { value: 'everyone', label: 'Everyone in your account',  Icon: GroupsIcon,          iconColor: c.primary,     bgColor: 'rgba(0,83,229,0.10)' },
  { value: 'specific', label: 'Specific users',            Icon: PeopleOutlinedIcon,  iconColor: c.warningMain, bgColor: 'rgba(244,105,0,0.10)' },
  { value: 'editors',  label: 'Who can manage access',    Icon: ManageAccountsIcon,  iconColor: c.primary,     bgColor: 'rgba(0,83,229,0.10)'  },
  { value: 'private',  label: 'Private (only you)',        Icon: LockOutlinedIcon,    iconColor: c.successMain, bgColor: 'rgba(17,135,71,0.10)' },
]

export function getViewOption(v: ViewPermission) {
  return VIEW_OPTIONS.find(o => o.value === v) ?? VIEW_OPTIONS[0]
}

// ─── User avatar helper ───────────────────────────────────────────────────────
function UserAvatar({ user, size = 32 }: { user: User; size?: number }) {
  return (
    <Avatar
      variant="rounded"
      sx={{
        width: size, height: size,
        bgcolor: user.color,
        fontSize: size < 28 ? 10 : 12,
        fontFamily: '"Inter", sans-serif',
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {user.initials}
    </Avatar>
  )
}

// ─── User avatar with tooltip ─────────────────────────────────────────────────
export function UserAvatarWithTooltip({
  user,
  role = 'Can manage access, delete, and rename.',
  size = 32,
}: {
  user: User
  role?: string
  size?: number
}) {
  const isOwner = user.id === 'ja'
  const titleNode = (
    <Box>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.5 }}>
        {user.name}{isOwner ? ' (You)' : ''}
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
        {role}
      </Typography>
    </Box>
  )
  return (
    <Tooltip title={titleNode} placement="bottom" arrow componentsProps={{ tooltip: { sx: navyTooltipSx } }}>
      <span>
        <UserAvatar user={user} size={size} />
      </span>
    </Tooltip>
  )
}

// ─── Users autocomplete ───────────────────────────────────────────────────────
export function UsersAutocomplete({
  value,
  onChange,
  placeholder,
  excludeIds = [],
  disabledUsers = [],
  error,
  helperText,
}: {
  value:          User[]
  onChange:       (v: User[]) => void
  placeholder?:   string
  excludeIds?:    string[]
  disabledUsers?: { id: string; reason: string }[]
  error?:         boolean
  helperText?:    string
}) {
  const options = ALL_USERS.filter(u => !excludeIds.includes(u.id))

  return (
    <Autocomplete<User, true>
      multiple
      value={value}
      onChange={(_, newValue) => {
        // Filter out any disabled users that slipped through
        onChange(newValue.filter(u => !disabledUsers.find(d => d.id === u.id)))
      }}
      options={options}
      getOptionLabel={u => u.name}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      getOptionDisabled={option => !!disabledUsers.find(d => d.id === option.id)}
      disableCloseOnSelect
      popupIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
      renderInput={params => (
        <TextField
          {...params}
          placeholder={value.length === 0 ? placeholder : ''}
          size="medium"
          error={error}
          helperText={helperText}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': { borderColor: error ? c.errorMain : c.grey300 },
            '& .MuiInputBase-root': { borderRadius: '8px', flexWrap: 'wrap', gap: '4px', p: '8px 12px' },
            '& .MuiFormHelperText-root': { fontFamily: '"Open Sans", sans-serif', fontSize: 12 },
          }}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((user, index) => (
          <Chip
            {...getTagProps({ index })}
            key={user.id}
            label={user.name}
            size="small"
            avatar={
              <Avatar sx={{ bgcolor: user.color, fontSize: '9px !important', fontWeight: 600 }}>
                {user.initials}
              </Avatar>
            }
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontSize: 12,
              bgcolor: 'rgba(0,0,0,0.06)',
              '& .MuiChip-label': { px: '6px' },
              height: 24,
            }}
          />
        ))
      }
      renderOption={(props, option, { selected }) => {
        const { key, ...listProps } = props as typeof props & { key: string }
        const disabledEntry = disabledUsers.find(d => d.id === option.id)
        const row = (
          <Box
            key={key}
            component="li"
            {...listProps}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1,
              cursor: disabledEntry ? 'not-allowed' : 'pointer',
              opacity: disabledEntry ? 0.45 : 1,
            }}
          >
            <UserAvatar user={option} size={36} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 500,
                fontSize: 14, color: c.textPrimary, lineHeight: 1.4,
              }}>
                {option.name}
              </Typography>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                fontSize: 12, color: c.textSecondary, lineHeight: 1.3,
              }}>
                {disabledEntry ? disabledEntry.reason : option.email}
              </Typography>
            </Box>
            {selected && <CheckIcon sx={{ color: c.primary, fontSize: 18, flexShrink: 0 }} />}
          </Box>
        )

        if (disabledEntry) {
          return (
            <Tooltip
              key={key}
              title={disabledEntry.reason}
              placement="right"
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: '#03194F', borderRadius: '8px', px: 1.5, py: 1,
                    fontSize: 12, color: '#fff',
                    '& .MuiTooltip-arrow': { color: '#03194F' },
                  },
                },
              }}
              arrow
            >
              <span style={{ display: 'block' }}>{row}</span>
            </Tooltip>
          )
        }
        return row
      }}
      ListboxProps={{
        sx: {
          p: '4px',
          maxHeight: 240,
          '& .MuiAutocomplete-option': {
            borderRadius: '6px',
            '&.Mui-focused': { bgcolor: `rgba(0,83,229,0.06)` },
            '&[aria-selected="true"]': { bgcolor: `rgba(0,83,229,0.08) !important` },
          },
        },
      }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '8px',
            boxShadow: '0px 0px 10px rgba(3,25,79,0.18)',
            mt: '4px',
          },
        },
      }}
    />
  )
}

// ─── Label shared style ───────────────────────────────────────────────────────
const labelSx = {
  fontFamily: '"Open Sans", sans-serif',
  fontWeight: 600,
  fontSize: 14,
  color: c.textPrimary,
  mb: '8px',
  display: 'block',
} as const

// ─── Main Dialog ──────────────────────────────────────────────────────────────
export default function ManageAccessDialog({
  open,
  onClose,
  itemType,
  onSave,
  initialSettings,
  parentVp,
  parentViewUsers: _parentViewUsers = [],
}: {
  open:              boolean
  onClose:           () => void
  itemType:          'media' | 'folder'
  onSave:            (s: PermissionSettings) => void
  initialSettings?:  PermissionSettings
  parentVp?:         ViewPermission
  parentViewUsers?:  User[]
}) {
  const defaultSettings: PermissionSettings = {
    viewPermission: 'everyone',
    viewUsers:      [],
    manageUsers:    [OWNER_USER],
  }

  const [viewPermission,       setViewPermission]       = useState<ViewPermission>(initialSettings?.viewPermission ?? 'everyone')
  const [viewUsers,            setViewUsers]            = useState<User[]>(initialSettings?.viewUsers   ?? [])
  const [manageUsers,          setManageUsers]          = useState<User[]>(initialSettings?.manageUsers ?? [OWNER_USER])
  const [viewUsersError,       setViewUsersError]       = useState(false)
  const [showDiscardConfirm,   setShowDiscardConfirm]   = useState(false)

  // Reset local state whenever dialog opens
  useEffect(() => {
    if (open) {
      const s = initialSettings ?? defaultSettings
      setViewPermission(s.viewPermission)
      setViewUsers(s.viewUsers)
      setManageUsers(s.manageUsers.length ? s.manageUsers : [OWNER_USER])
      setViewUsersError(false)
      setShowDiscardConfirm(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Dirty check — compare current state to what was loaded on open
  const initVp          = initialSettings?.viewPermission ?? 'everyone'
  const initViewUsers   = initialSettings?.viewUsers      ?? []
  const initManageUsers = initialSettings?.manageUsers?.length ? initialSettings.manageUsers : [OWNER_USER]
  function sameIds(a: User[], b: User[]) {
    if (a.length !== b.length) return false
    const bs = new Set(b.map(u => u.id))
    return a.every(u => bs.has(u.id))
  }
  const isDirty = viewPermission !== initVp || !sameIds(viewUsers, initViewUsers) || !sameIds(manageUsers, initManageUsers)

  function handleClose() {
    if (isDirty) { setShowDiscardConfirm(true) } else { onClose() }
  }

  // Clear error when permission changes away from specific or users are added
  useEffect(() => {
    if (viewPermission !== 'specific' || viewUsers.length > 0) {
      setViewUsersError(false)
    }
  }, [viewPermission, viewUsers])

  const showSpecificPicker = viewPermission === 'specific'
  const showManageSection  = viewPermission !== 'private'
  const showFolderAllAlert = itemType === 'folder' && (viewPermission === 'specific' || viewPermission === 'editors')
  const showPrivateAlert   = viewPermission === 'private'

  // Whether a given permission option conflicts with the parent folder
  const wouldConflict = (optVp: ViewPermission): boolean => {
    if (!parentVp || parentVp === 'everyone') return false
    if (optVp === 'private') return false
    if (parentVp === 'private') return true
    if (parentVp === 'editors') return optVp === 'everyone'
    if (parentVp === 'specific') return optVp === 'everyone' || optVp === 'editors'
    return false
  }
  const isCurrentConflict = wouldConflict(viewPermission)

  function handleSave() {
    if (viewPermission === 'specific' && viewUsers.length === 0) {
      setViewUsersError(true)
      return
    }
    onSave({ viewPermission, viewUsers, manageUsers })
    // Closing is the caller's responsibility (parent may need to show a conflict dialog first)
  }

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
      <DialogContent sx={{ p: '20px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Who can view ─────────────────────────────────────────────────── */}
        <Box>
          <Typography sx={labelSx}>
            Who can view this {itemType}
          </Typography>

          {/* Permission select */}
          <Select
            value={viewPermission}
            onChange={e => setViewPermission(e.target.value as ViewPermission)}
            fullWidth
            size="medium"
            IconComponent={KeyboardArrowDownIcon}
            renderValue={v => {
              const o = getViewOption(v as ViewPermission)
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
                  <Typography sx={{
                    fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: c.textPrimary,
                  }}>
                    {o.label}
                  </Typography>
                </Box>
              )
            }}
            sx={{
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: c.grey300 },
              '& .MuiSelect-select': { py: '10px', px: '12px' },
              '& .MuiSelect-icon': { color: 'rgba(0,0,0,0.56)', right: 10 },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '8px',
                  boxShadow: '0px 0px 10px rgba(3,25,79,0.18)',
                  mt: '4px',
                  p: '4px',
                },
              },
            }}
          >
            {VIEW_OPTIONS.map(o => (
              <MenuItem
                key={o.value}
                value={o.value}
                sx={{
                  borderRadius: '6px', py: 1.5, px: 1.5,
                  '&.Mui-selected': { bgcolor: 'rgba(0,83,229,0.08)' },
                  '&:hover': { bgcolor: 'rgba(0,83,229,0.04)' },
                }}
              >
                <Box sx={{
                  width: 32, height: 32, borderRadius: '8px',
                  bgcolor: o.bgColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mr: 1.5, flexShrink: 0,
                }}>
                  <o.Icon sx={{ fontSize: 18, color: o.iconColor }} />
                </Box>
                <Box>
                  <Typography sx={{
                    fontFamily: '"Open Sans", sans-serif', fontSize: 14, color: c.textPrimary,
                  }}>
                    {o.label}
                  </Typography>
                  {wouldConflict(o.value) && (
                    <Typography sx={{
                      fontFamily: '"Open Sans", sans-serif', fontSize: 11,
                      color: c.warningMain, lineHeight: 1.4, mt: '2px',
                    }}>
                      Requires updating the parent folder's permission
                    </Typography>
                  )}
                </Box>
                {viewPermission === o.value && (
                  <CheckIcon sx={{ ml: 'auto', color: c.primary, fontSize: 18 }} />
                )}
              </MenuItem>
            ))}
          </Select>

          {/* Specific users picker */}
          <Collapse in={showSpecificPicker} unmountOnExit>
            <Box sx={{ mt: 1.5 }}>
              <UsersAutocomplete
                value={viewUsers}
                onChange={setViewUsers}
                placeholder="Select from users or groups list or type email address"
                disabledUsers={manageUsers.map(u => ({
                  id: u.id,
                  reason: `${u.name} already has manage access`,
                }))}
                error={viewUsersError}
                helperText={viewUsersError ? 'Select the specific users' : undefined}
              />
            </Box>
          </Collapse>

          {/* Private alert — for folders */}
          <Collapse in={showPrivateAlert} unmountOnExit>
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon fontSize="small" />}
              sx={{
                mt: 1.5, borderRadius: '8px',
                fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                bgcolor: 'rgba(0,83,229,0.06)',
                color: c.textPrimary,
                '& .MuiAlert-icon': { color: c.primary },
              }}
            >
              {itemType === 'folder'
                ? "Only you can view this folder\u2019s media and all the folders inside it"
                : 'Only you can view this media'}
            </Alert>
          </Collapse>

          {/* "All items" alert — for folders with specific/editors */}
          <Collapse in={showFolderAllAlert} unmountOnExit>
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon fontSize="small" />}
              sx={{
                mt: 1.5, borderRadius: '8px',
                fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                bgcolor: 'rgba(0,83,229,0.06)',
                color: c.textPrimary,
                '& .MuiAlert-icon': { color: c.primary },
              }}
            >
              All items in this folder will use these settings
            </Alert>
          </Collapse>

          {/* Parent conflict alert */}
          <Collapse in={isCurrentConflict} unmountOnExit>
            <Alert
              severity="warning"
              icon={<InfoOutlinedIcon fontSize="small" />}
              sx={{
                mt: 1.5, borderRadius: '8px',
                fontFamily: '"Open Sans", sans-serif', fontSize: 13,
                bgcolor: 'rgba(244,105,0,0.08)',
                color: c.textPrimary,
                '& .MuiAlert-icon': { color: c.warningMain },
              }}
            >
              This conflicts with the parent folder's permission. Saving will prompt you to update the parent folder.
            </Alert>
          </Collapse>
        </Box>

        {/* ── Who can manage access ─────────────────────────────────────────── */}
        <Collapse in={showManageSection} unmountOnExit>
          <Box>
            <Typography sx={labelSx}>
              Who can manage access
            </Typography>
            <UsersAutocomplete
              value={manageUsers}
              onChange={v => {
                // Always keep owner in the list
                const hasOwner = v.some(u => u.id === OWNER_USER.id)
                setManageUsers(hasOwner ? v : [OWNER_USER, ...v])
              }}
              placeholder="Add users who can manage access..."
              disabledUsers={viewPermission === 'specific' ? viewUsers.map(u => ({
                id: u.id,
                reason: `${u.name} already has view access`,
              })) : []}
            />
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

      {/* ── Discard changes confirmation ────────────────────────────────────── */}
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
