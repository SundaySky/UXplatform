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
import VisibilityOutlinedIcon      from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon   from '@mui/icons-material/VisibilityOffOutlined'
import PeopleOutlinedIcon          from '@mui/icons-material/PeopleOutlined'
import EditOutlinedIcon            from '@mui/icons-material/EditOutlined'
import CheckIcon                   from '@mui/icons-material/Check'
import InfoOutlinedIcon            from '@mui/icons-material/InfoOutlined'
import ManageAccountsOutlinedIcon  from '@mui/icons-material/ManageAccountsOutlined'
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
const VIEW_OPTIONS: {
  value: ViewPermission
  label: string
  Icon: React.ElementType
  iconColor: string
  bgColor: string
}[] = [
  { value: 'everyone', label: 'Everyone in your account', Icon: VisibilityOutlinedIcon, iconColor: c.primary,     bgColor: 'rgba(0,83,229,0.10)' },
  { value: 'editors',  label: 'Users who can manage access', Icon: EditOutlinedIcon,        iconColor: c.warningMain, bgColor: 'rgba(244,105,0,0.10)' },
  { value: 'specific', label: 'Specific users',           Icon: PeopleOutlinedIcon,      iconColor: c.warningMain, bgColor: 'rgba(244,105,0,0.10)' },
  { value: 'private',  label: 'Private (only you)',       Icon: VisibilityOffOutlinedIcon, iconColor: c.successMain, bgColor: 'rgba(17,135,71,0.10)' },
]

function getViewOption(v: ViewPermission) {
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
function UsersAutocomplete({
  value,
  onChange,
  placeholder,
  excludeIds = [],
  error,
  helperText,
}: {
  value:       User[]
  onChange:    (v: User[]) => void
  placeholder?: string
  excludeIds?: string[]
  error?:      boolean
  helperText?: string
}) {
  const options = ALL_USERS.filter(u => !excludeIds.includes(u.id))

  return (
    <Autocomplete<User, true>
      multiple
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      options={options}
      getOptionLabel={u => u.name}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
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
      renderOption={(props, option, { selected }) => (
        <Box
          component="li"
          {...props}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, cursor: 'pointer' }}
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
              {option.email}
            </Typography>
          </Box>
          {selected && <CheckIcon sx={{ color: c.primary, fontSize: 18, flexShrink: 0 }} />}
        </Box>
      )}
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
}: {
  open:             boolean
  onClose:          () => void
  itemType:         'media' | 'folder'
  onSave:           (s: PermissionSettings) => void
  initialSettings?: PermissionSettings
}) {
  const defaultSettings: PermissionSettings = {
    viewPermission: 'everyone',
    viewUsers:      [],
    manageUsers:    [OWNER_USER],
  }

  const [viewPermission, setViewPermission] = useState<ViewPermission>(
    initialSettings?.viewPermission ?? 'everyone'
  )
  const [viewUsers,       setViewUsers]       = useState<User[]>(initialSettings?.viewUsers   ?? [])
  const [manageUsers,     setManageUsers]     = useState<User[]>(initialSettings?.manageUsers ?? [OWNER_USER])
  const [viewUsersError,  setViewUsersError]  = useState(false)

  // Reset local state whenever dialog opens
  useEffect(() => {
    if (open) {
      const s = initialSettings ?? defaultSettings
      setViewPermission(s.viewPermission)
      setViewUsers(s.viewUsers)
      setManageUsers(s.manageUsers.length ? s.manageUsers : [OWNER_USER])
      setViewUsersError(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Clear error when permission changes away from specific or users are added
  useEffect(() => {
    if (viewPermission !== 'specific' || viewUsers.length > 0) {
      setViewUsersError(false)
    }
  }, [viewPermission, viewUsers])

  const opt = getViewOption(viewPermission)

  const showSpecificPicker = viewPermission === 'specific'
  const showManageSection  = viewPermission !== 'private'
  const showFolderAllAlert = itemType === 'folder' && (viewPermission === 'specific' || viewPermission === 'editors')
  const showPrivateAlert   = viewPermission === 'private'

  function handleSave() {
    if (viewPermission === 'specific' && viewUsers.length === 0) {
      setViewUsersError(true)
      return
    }
    onSave({ viewPermission, viewUsers, manageUsers })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          <IconButton size="medium" onClick={onClose} sx={{ color: 'rgba(0,0,0,0.54)' }}>
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
          onClick={onClose}
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
    </Dialog>
  )
}
