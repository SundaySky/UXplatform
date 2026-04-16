import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, Select, MenuItem,
  Button, IconButton, Box, Chip, Typography, Avatar,
  SelectChangeEvent,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'

// ─── DS tokens ────────────────────────────────────────────────────────────────
const ds = {
  textPrimary:    '#323338',
  textSecondary:  'rgba(60, 60, 72, 0.6)',
  textDisabled:   'rgba(0, 0, 0, 0.38)',
  actionActive:   'rgba(0, 0, 0, 0.56)',
  divider:        'rgba(0, 83, 229, 0.12)',
  errorMain:      '#E62843',
  successMain:    '#118747',
  chipBg:         'rgba(0, 83, 229, 0.08)',
  chipBorder:     'rgba(0, 83, 229, 0.18)',
}

// ─── User list (matches ApprovalDialog) ───────────────────────────────────────
const USERS = [
  { value: 'sjohnson',   label: 'Sarah Johnson',   email: 'sjohnson@company.com',   initials: 'SJ', color: '#7B1FA2' },
  { value: 'mchen',      label: 'Michael Chen',    email: 'mchen@company.com',      initials: 'MC', color: '#0288D1' },
  { value: 'erodriguez', label: 'Emma Rodriguez',  email: 'erodriguez@company.com', initials: 'ER', color: '#2E7D32' },
  { value: 'jwilson',    label: 'James Wilson',    email: 'jwilson@company.com',    initials: 'JW', color: '#E65100' },
]

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  open:              boolean
  onClose:           () => void
  onAdd:             (approver: string) => void
  /** IDs of approvers already in the approval — shown as chips, excluded from Select */
  existingApprovers: string[]
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddApproverDialog({ open, onClose, onAdd, existingApprovers }: Props) {
  const [selected, setSelected] = useState('')
  const [message,  setMessage]  = useState('')

  const handleClose = () => {
    setSelected('')
    setMessage('')
    onClose()
  }

  const handleAdd = () => {
    if (!selected) return
    onAdd(selected)
    setSelected('')
    setMessage('')
  }

  const existingUsers = existingApprovers
    .map(id => USERS.find(u => u.value === id))
    .filter(Boolean) as typeof USERS

  const availableUsers = USERS.filter(u => !existingApprovers.includes(u.value))
  const canAdd = selected !== ''

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => { if (reason === 'backdropClick') return; handleClose() }}
      onClick={e => e.stopPropagation()}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0px 0px 10px 0px rgba(3, 25, 79, 0.25)',
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <DialogTitle
        component="div"
        sx={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          pl: '32px', pr: '22px', pt: '20px', pb: '16px', gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PersonAddOutlinedIcon sx={{ fontSize: 22, color: ds.actionActive, mt: '2px' }} />
          <Typography sx={{
            fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 20,
            lineHeight: 1.5, color: ds.textPrimary,
          }}>
            Add an approver
          </Typography>
        </Box>
        <IconButton size="medium" color="default" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <DialogContent sx={{ px: '32px', pt: '0 !important', pb: '8px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* ── Current approvers ─────────────────────────────────────────── */}
          {existingUsers.length > 0 && (
            <Box>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                fontSize: 14, lineHeight: 1.5, color: ds.textPrimary, mb: '8px',
              }}>
                Current approvers
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {existingUsers.map(user => (
                  <Chip
                    key={user.value}
                    avatar={
                      <Avatar sx={{ bgcolor: user.color, width: 24, height: 24 }}>
                        <Typography sx={{
                          fontFamily: '"Open Sans", sans-serif',
                          fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1,
                        }}>
                          {user.initials}
                        </Typography>
                      </Avatar>
                    }
                    label={user.label}
                    size="small"
                    sx={{
                      bgcolor: ds.chipBg,
                      border: `1px solid ${ds.chipBorder}`,
                      fontFamily: '"Open Sans", sans-serif',
                      fontSize: 13, fontWeight: 400,
                      color: ds.textPrimary,
                      height: 32,
                      '& .MuiChip-avatar': { ml: '6px' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* ── Divider between sections ───────────────────────────────────── */}
          {existingUsers.length > 0 && (
            <Box sx={{ borderTop: `1px solid ${ds.divider}`, mx: '-32px' }} />
          )}

          {/* ── New approver Select ────────────────────────────────────────── */}
          <Box>
            <Typography sx={{
              fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
              fontSize: 14, lineHeight: 1.5, color: ds.textPrimary, mb: '6px',
            }}>
              Add new approver
            </Typography>

            {availableUsers.length > 0 ? (
              <FormControl variant="outlined" size="medium" fullWidth>
                <Select
                  displayEmpty
                  value={selected}
                  onChange={(e: SelectChangeEvent) => setSelected(e.target.value)}
                  renderValue={val =>
                    val
                      ? <Typography sx={{
                          fontFamily: '"Open Sans", sans-serif', fontSize: 14,
                          fontWeight: 400, color: ds.textPrimary,
                        }}>
                          {USERS.find(u => u.value === val)?.label}
                        </Typography>
                      : <Typography sx={{
                          fontFamily: '"Open Sans", sans-serif', fontSize: 14,
                          fontWeight: 400, color: ds.textDisabled, fontStyle: 'italic',
                        }}>
                          Select approver
                        </Typography>
                  }
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: ds.divider } }}
                >
                  {availableUsers.map(u => (
                    <MenuItem
                      key={u.value}
                      value={u.value}
                      sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, fontWeight: 400 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar sx={{ bgcolor: u.color, width: 28, height: 28 }}>
                          <Typography sx={{
                            fontFamily: '"Open Sans", sans-serif',
                            fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1,
                          }}>
                            {u.initials}
                          </Typography>
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 14, fontWeight: 400, color: ds.textPrimary, lineHeight: 1.4 }}>
                            {u.label}
                          </Typography>
                          <Typography sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: 12, fontWeight: 400, color: ds.textSecondary, lineHeight: 1.4 }}>
                            {u.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              /* All users already added */
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontSize: 14,
                color: ds.textSecondary, fontStyle: 'italic',
              }}>
                All available approvers have already been added.
              </Typography>
            )}
          </Box>

          {/* ── Optional message ──────────────────────────────────────────── */}
          {availableUsers.length > 0 && (
            <Box>
              <Typography sx={{
                fontFamily: '"Open Sans", sans-serif', fontWeight: 400,
                fontSize: 14, lineHeight: 1.5, color: ds.textPrimary, mb: '6px',
              }}>
                Add a message (optional)
              </Typography>
              <TextField
                variant="outlined"
                size="medium"
                multiline
                rows={3}
                fullWidth
                placeholder="Add context for the new approver…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: '"Open Sans", sans-serif',
                    fontWeight: 400, fontSize: 14, lineHeight: 1.5,
                    color: ds.textPrimary,
                  },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: ds.divider },
                }}
              />
            </Box>
          )}

        </Box>
      </DialogContent>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <DialogActions sx={{
        display: 'flex', justifyContent: 'flex-end',
        px: '32px', pt: 1, pb: '20px', gap: 1,
      }}>
        {/* Size=Large · Color=Primary · Variant=Outlined */}
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={handleClose}
        >
          Cancel
        </Button>

        {/* Size=Large · Color=Primary · Variant=Contained — disabled until approver selected */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={!canAdd}
          onClick={handleAdd}
        >
          Add approver
        </Button>
      </DialogActions>
    </Dialog>
  )
}
