import { useState } from "react";
import type {
    SelectChangeEvent } from "@mui/material";
import {
    Dialog, DialogContent, DialogActions,
    TextField, FormControl, Select, MenuItem,
    Button, Box, Chip, Typography, Avatar
} from "@mui/material";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import { TruffleDialogTitle } from "@sundaysky/smartvideo-hub-truffle-component-library";


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
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: "0px 0px 10px 0px rgba(3, 25, 79, 0.25)",
                    overflow: "hidden"
                }
            }}
        >
            {/* ── Title ─────────────────────────────────────────────────────────── */}
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: handleClose }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <PersonAddOutlinedIcon sx={{ fontSize: 22, color: "action.active" }} />
                    Add an approver
                </Box>
            </TruffleDialogTitle>

            {/* ── Content ───────────────────────────────────────────────────────── */}
            <DialogContent sx={{ px: "32px", pt: "0 !important", pb: "8px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                    {/* ── Current approvers ─────────────────────────────────────────── */}
                    {existingUsers.length > 0 && (
                        <Box>
                            <Typography variant="body1" color="text.primary" sx={{ mb: "8px" }}>
                Current approvers
                            </Typography>

                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {existingUsers.map(user => (
                                    <Chip
                                        key={user.value}
                                        avatar={
                                            <Avatar sx={{ bgcolor: user.color, width: 24, height: 24 }}>
                                                <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1, fontSize: 10 }}>
                                                    {user.initials}
                                                </Typography>
                                            </Avatar>
                                        }
                                        label={user.label}
                                        size="small"
                                        sx={{
                                            bgcolor: "action.hover",
                                            border: 1, borderColor: "divider",
                                            color: "text.primary",
                                            height: 32,
                                            "& .MuiChip-avatar": { ml: "6px" }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* ── Divider between sections ───────────────────────────────────── */}
                    {existingUsers.length > 0 && (
                        <Box sx={{ borderTop: 1, borderColor: "divider", mx: "-32px" }} />
                    )}

                    {/* ── New approver Select ────────────────────────────────────────── */}
                    <Box>
                        <Typography variant="body1" color="text.primary" sx={{ mb: "6px" }}>
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
                                            : <Typography variant="body1" sx={{
                                                color: "action.disabled", fontStyle: "italic"
                                            }}>
                          Select approver
                                            </Typography>
                                    }
                                    sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" } }}
                                >
                                    {availableUsers.map(u => (
                                        <MenuItem
                                            key={u.value}
                                            value={u.value}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <Avatar sx={{ bgcolor: u.color, width: 28, height: 28 }}>
                                                    <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1, fontSize: 10 }}>
                                                        {u.initials}
                                                    </Typography>
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.4 }}>
                                                        {u.label}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
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
                            <Typography variant="body1" sx={{
                                color: "text.secondary", fontStyle: "italic"
                            }}>
                All available approvers have already been added.
                            </Typography>
                        )}
                    </Box>

                    {/* ── Optional message ──────────────────────────────────────────── */}
                    {availableUsers.length > 0 && (
                        <Box>
                            <Typography variant="body1" color="text.primary" sx={{ mb: "6px" }}>
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
                                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" }
                                }}
                            />
                        </Box>
                    )}

                </Box>
            </DialogContent>

            {/* ── Actions ───────────────────────────────────────────────────────── */}
            <DialogActions sx={{
                display: "flex", justifyContent: "flex-end",
                px: "32px", pt: 1, pb: "20px", gap: 1
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
    );
}
