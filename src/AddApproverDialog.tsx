import { useState } from "react";
import type { SelectChangeEvent, SxProps, Theme } from "@mui/material";
import {
    Dialog, DialogContent,
    TextField, FormControl, Select, MenuItem,
    Button, Box, Chip, Typography, SvgIcon
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/pro-regular-svg-icons/faUserPlus";
import { TruffleDialogTitle, TruffleDialogActions, TruffleAvatar } from "@sundaysky/smartvideo-hub-truffle-component-library";


// ─── User list (matches ApprovalDialog) ───────────────────────────────────────
const USERS = [
    { value: "sjohnson", label: "Sarah Johnson", email: "sjohnson@company.com", initials: "SJ", color: "#7B1FA2" },
    { value: "mchen", label: "Michael Chen", email: "mchen@company.com", initials: "MC", color: "#0288D1" },
    { value: "erodriguez", label: "Emma Rodriguez", email: "erodriguez@company.com", initials: "ER", color: "#2E7D32" },
    { value: "jwilson", label: "James Wilson", email: "jwilson@company.com", initials: "JW", color: "#E65100" }
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean
  onClose: () => void
  onAdd: (approver: string) => void
  /** IDs of approvers already in the approval — shown as chips, excluded from Select */
  existingApprovers: string[]
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddApproverDialog({ open, onClose, onAdd, existingApprovers }: Props) {
    const [selected, setSelected] = useState("");
    const [message, setMessage] = useState("");

    const handleClose = () => {
        setSelected("");
        setMessage("");
        onClose();
    };

    const handleAdd = () => {
        if (!selected) {
            return;
        }
        onAdd(selected);
        setSelected("");
        setMessage("");
    };

    const existingUsers = existingApprovers
        .map(id => USERS.find(u => u.value === id))
        .filter(Boolean) as typeof USERS;

    const availableUsers = USERS.filter(u => !existingApprovers.includes(u.value));
    const canAdd = selected !== "";

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (reason === "backdropClick") {
                    return;
                } handleClose(); 
            }}
            onClick={e => e.stopPropagation()}
            maxWidth="sm"
            fullWidth
        >
            {/* ── Title ─────────────────────────────────────────────────────────── */}
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: handleClose }}>
                <Box sx={titleBoxSx}>
                    <SvgIcon sx={titleIconSx}><FontAwesomeIcon icon={faUserPlus} /></SvgIcon>
                    Add an approver
                </Box>
            </TruffleDialogTitle>

            {/* ── Content ───────────────────────────────────────────────────────── */}
            <DialogContent sx={contentSx}>
                <Box sx={contentBodySx}>

                    {/* ── Current approvers ─────────────────────────────────────────── */}
                    {existingUsers.length > 0 && (
                        <Box>
                            <Typography variant="body1" color="text.primary" sx={sectionLabelSx}>
                Current approvers
                            </Typography>

                            <Box sx={chipsRowSx}>
                                {existingUsers.map(user => (
                                    <Chip
                                        key={user.value}
                                        avatar={<TruffleAvatar text={user.initials} size="small" />}
                                        label={user.label}
                                        size="small"
                                        sx={approverChipSx}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* ── Divider between sections ───────────────────────────────────── */}
                    {existingUsers.length > 0 && (
                        <Box sx={sectionDividerSx} />
                    )}

                    {/* ── New approver Select ────────────────────────────────────────── */}
                    <Box>
                        <Typography variant="body1" color="text.primary" sx={sectionLabelSmSx}>
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
                                            ? <Typography variant="body1" color="text.primary">
                                                {USERS.find(u => u.value === val)?.label}
                                            </Typography>
                                            : <Typography variant="body1" sx={placeholderTextSx}>
                          Select approver
                                            </Typography>
                                    }
                                    sx={selectSx}
                                >
                                    {availableUsers.map(u => (
                                        <MenuItem
                                            key={u.value}
                                            value={u.value}
                                        >
                                            <Box sx={optionRowSx}>
                                                <TruffleAvatar text={u.initials} size="small" />
                                                <Box>
                                                    <Typography variant="body1" color="text.primary" sx={optionLineSx}>
                                                        {u.label}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={optionLineSx}>
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
                            <Typography variant="body1" sx={emptyTextSx}>
                All available approvers have already been added.
                            </Typography>
                        )}
                    </Box>

                    {/* ── Optional message ──────────────────────────────────────────── */}
                    {availableUsers.length > 0 && (
                        <Box>
                            <Typography variant="body1" color="text.primary" sx={sectionLabelSmSx}>
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
                                sx={selectSx}
                            />
                        </Box>
                    )}

                </Box>
            </DialogContent>

            {/* ── Actions ───────────────────────────────────────────────────────── */}
            <TruffleDialogActions>
                <Button variant="outlined" color="primary" size="large" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="primary" size="large" disabled={!canAdd} onClick={handleAdd}>
                    Add approver
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const titleBoxSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "10px" };
const titleIconSx: SxProps<Theme> = { fontSize: 22, color: "action.active" };
const contentSx: SxProps<Theme> = { px: "32px", pt: "0 !important", pb: "8px" };
const contentBodySx: SxProps<Theme> = { display: "flex", flexDirection: "column", gap: 2.5 };
const sectionLabelSx: SxProps<Theme> = { mb: "8px" };
const sectionLabelSmSx: SxProps<Theme> = { mb: "6px" };
const chipsRowSx: SxProps<Theme> = { display: "flex", flexWrap: "wrap", gap: "8px" };
const approverChipSx: SxProps<Theme> = {
    bgcolor: "action.hover",
    border: 1, borderColor: "divider",
    color: "text.primary",
    height: 32,
    "& .MuiChip-avatar": { ml: "6px" }
};
const sectionDividerSx: SxProps<Theme> = { borderTop: 1, borderColor: "divider", mx: "-32px" };
const placeholderTextSx: SxProps<Theme> = { color: "action.disabled", fontStyle: "italic" };
const selectSx: SxProps<Theme> = { "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" } };
const optionRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "10px" };
const optionLineSx: SxProps<Theme> = { lineHeight: 1.4 };
const emptyTextSx: SxProps<Theme> = { color: "text.secondary", fontStyle: "italic" };
