import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const ds = {
  textPrimary: '#323338',
}

interface Props {
  open:     boolean
  onClose:  () => void
  onConfirm: () => void   // "Cancel approval & edit video"
}

export default function CancelApprovalDialog({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog
      open={open}
      onClose={(_e, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return
        onClose()
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0px 0px 10px 0px rgba(3,25,79,0.25)',
        },
      }}
    >
      {/* ── Title ────────────────────────────────────────────────────────── */}
      <DialogTitle
        component="div"
        sx={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          pl: '32px', pr: '16px', pt: '20px', pb: '8px', gap: 1,
        }}
      >
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: 20,
          lineHeight: 1.5, color: ds.textPrimary, flex: 1,
        }}>
          Editing will cancel approval
        </Typography>
        <IconButton size="medium" color="default" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <DialogContent sx={{ px: '32px', pt: '0 !important', pb: '8px' }}>
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14,
          lineHeight: 1.5, color: ds.textPrimary, mb: 1.5,
        }}>
          To edit this video, you'll need to cancel the current approval.
        </Typography>
        <Typography sx={{
          fontFamily: '"Open Sans", sans-serif', fontWeight: 400, fontSize: 14,
          lineHeight: 1.5, color: ds.textPrimary,
        }}>
          Any changes will make the shared version outdated, and you'll need to request approval again.
        </Typography>
      </DialogContent>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <DialogActions sx={{ px: '32px', pt: 1, pb: '20px', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          variant="text"
          color="primary"
          size="large"
          onClick={onClose}
          sx={{ fontFamily: '"Open Sans", sans-serif', textTransform: 'none', fontWeight: 500, fontSize: 14 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => { onConfirm(); onClose() }}
          sx={{ fontFamily: '"Open Sans", sans-serif', textTransform: 'none', fontWeight: 500, fontSize: 14, borderRadius: '8px' }}
        >
          Cancel approval &amp; edit video
        </Button>
      </DialogActions>
    </Dialog>
  )
}
