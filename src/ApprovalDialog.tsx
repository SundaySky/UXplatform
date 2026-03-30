import { useState } from "react";
import type {
    SelectChangeEvent } from "@mui/material";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControl, Select, MenuItem,
    Button, IconButton, Box, Stack, Alert, Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// ─── DS tokens (exact values from Figma variable definitions) ─────────────────
const ds = {
    textPrimary:    "#323338",
    textSecondary:  "rgba(60, 60, 72, 0.8)",
    textDisabled:   "rgba(0, 0, 0, 0.38)",
    actionActive:   "rgba(0, 0, 0, 0.56)",
    divider:        "rgba(0, 83, 229, 0.12)",
    infoMain:       "#0176D7",
    errorMain:      "#E62843",
    labelInfoBg:    "#EFF7FE",
    labelInfoColor: "#284862"
};

const USERS = [
    { value: "sjohnson", label: "Sarah Johnson (sjohnson@company.com)" },
    { value: "mchen", label: "Michael Chen (mchen@company.com)" },
    { value: "erodriguez", label: "Emma Rodriguez (erodriguez@company.com)" },
    { value: "jwilson", label: "James Wilson (jwilson@company.com)" }
];

type Logic = "AND" | "OR"
interface ApproverRow { value: string; logic: Logic }

interface Props {
  open: boolean
  onClose: () => void
  onSend: (approvers: string[]) => void
}

export default function ApprovalDialog({ open, onClose, onSend }: Props) {
    const [comment, setComment] = useState("");
    const [approvers, setApprovers] = useState<ApproverRow[]>([{ value: "", logic: "AND" }]);

    const handleClose = () => {
        setComment("");
        setApprovers([{ value: "", logic: "AND" }]);
        onClose();
    };

    const update = (i: number, patch: Partial<ApproverRow>) =>
        setApprovers(prev => prev.map((a, idx) => idx === i ? { ...a, ...patch } : a));

    const addApprover = () =>
        setApprovers(prev => [...prev, { value: "", logic: "AND" }]);

    const removeApprover = (i: number) =>
        setApprovers(prev => prev.filter((_, idx) => idx !== i));

    const handleSend = () => {
        const selected = approvers.map(a => a.value).filter(Boolean);
        onSend(selected);
        setComment("");
        setApprovers([{ value: "", logic: "AND" }]);
    };

    const hasMultiple = approvers.length > 1;
    const hasAtLeastOne = approvers.some(a => a.value !== "");

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
            {/* ── Title: Open Sans SemiBold 20px, pl-32 pr-22 pt-20 pb-16 ──────────── */}
            <DialogTitle
                component="div"
                sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                    pl: "32px", pr: "22px", pt: "20px", pb: "16px", gap: 1 }}
            >
                <Typography sx={{
                    fontFamily: "\"Open Sans\", sans-serif", fontWeight: 600, fontSize: 20,
                    lineHeight: 1.5, color: ds.textPrimary, flex: 1
                }}>
          Ask an approver to approve this video
                </Typography>
                {/* DS: Size=Medium, Color=Default IconButton */}
                <IconButton size="medium" color="default" onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* ── Content ──────────────────────────────────────────────────────────── */}
            <DialogContent sx={{ px: "32px", pt: "0 !important", pb: "8px" }}>
                <Stack direction="column" spacing={2}>

                    {/* Info banner — DS alert info tokens */}
                    <Alert
                        severity="info"
                        sx={{
                            bgcolor: ds.labelInfoBg,
                            color:   ds.labelInfoColor,
                            borderRadius: 2,
                            "& .MuiAlert-icon":    { color: ds.infoMain },
                            "& .MuiAlert-message": {
                                fontFamily: "\"Open Sans\", sans-serif",
                                fontWeight: 400, fontSize: 14, lineHeight: 1.5
                            }
                        }}
                    >
            Approvers will be notified by email and will need to log in to SundaySky
                    </Alert>

                    {/* ── Comment field
               Figma: label is a Typography node ABOVE the field, not floating.
               TextField uses variant="outlined" size="medium" — no label prop.   */}
                    <Box>
                        {/* Label: typography/body1 — Open Sans Regular 14px */}
                        <Typography sx={{
                            fontFamily: "\"Open Sans\", sans-serif", fontWeight: 400,
                            fontSize: 14, lineHeight: 1.5, color: ds.textPrimary, mb: "6px"
                        }}>
              Add a comment for approvers (optional)
                        </Typography>
                        <TextField
                            variant="outlined"
                            size="medium"
                            multiline
                            rows={3}
                            fullWidth
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            sx={{
                                "& .MuiInputBase-input": {
                                    fontFamily: "\"Open Sans\", sans-serif",
                                    fontWeight: 400, fontSize: 14, lineHeight: 1.5,
                                    color: ds.textPrimary
                                },
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: ds.divider }
                            }}
                        />
                    </Box>

                    {/* ── Approver rows ────────────────────────────────────────────────────
               Layout rules:
               • 1 approver  → Select full width, no AND/OR, no delete icon
               • 2+ approvers → Select flex:1, AND/OR same size=medium, delete icon (error/red)
               The approver Select always matches the comment field width as flex container.  */}
                    {approvers.map((approver, i) => {
                        const isLast = i === approvers.length - 1;
                        const showLogic = hasMultiple && !isLast;
                        const showDelete = hasMultiple;

                        return (
                            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>

                                {/* Approver Select — size="medium" outlined, displayEmpty placeholder */}
                                <FormControl variant="outlined" size="medium" sx={{ flex: 1, minWidth: 0 }}>
                                    <Select
                                        displayEmpty
                                        value={approver.value}
                                        onChange={(e: SelectChangeEvent) => update(i, { value: e.target.value })}
                                        renderValue={val =>
                                            val
                                                ? <Typography sx={{ fontFamily: "\"Open Sans\", sans-serif", fontSize: 14, fontWeight: 400, color: ds.textPrimary }}>
                                                    {USERS.find(u => u.value === val)?.label}
                                                </Typography>
                                                : <Typography sx={{ fontFamily: "\"Open Sans\", sans-serif", fontSize: 14, fontWeight: 400, color: ds.textDisabled, fontStyle: "italic" }}>
                            Select approver {i + 1}
                                                </Typography>
                                        }
                                        sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: ds.divider } }}
                                    >
                                        {USERS.map(u => {
                                            const takenByOther = approvers.some((a, idx) => idx !== i && a.value === u.value);
                                            return (
                                                <MenuItem key={u.value} value={u.value} disabled={takenByOther}
                                                    sx={{ fontFamily: "\"Open Sans\", sans-serif", fontSize: 14, fontWeight: 400,
                                                        ...(takenByOther && { opacity: 0.4 }) }}>
                                                    {u.label}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>

                                {/* AND/OR — only between rows, size="medium" matches approver Select height */}
                                {showLogic && (
                                    <FormControl variant="outlined" size="medium" sx={{ minWidth: 80, flexShrink: 0 }}>
                                        <Select
                                            value={approver.logic}
                                            onChange={(e: SelectChangeEvent) => update(i, { logic: e.target.value as Logic })}
                                            sx={{
                                                fontFamily: "\"Open Sans\", sans-serif", fontWeight: 400, fontSize: 14,
                                                color: ds.textPrimary,
                                                "& .MuiOutlinedInput-notchedOutline": { borderColor: ds.divider }
                                            }}
                                        >
                                            <MenuItem value="AND" sx={{ fontFamily: "\"Open Sans\", sans-serif", fontSize: 14 }}>AND</MenuItem>
                                            <MenuItem value="OR" sx={{ fontFamily: "\"Open Sans\", sans-serif", fontSize: 14 }}>OR</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}

                                {/* Delete — DS: Size=Medium IconButton, color=error (#E62843) */}
                                {showDelete
                                    ? <IconButton
                                        size="medium"
                                        onClick={() => removeApprover(i)}
                                        aria-label={`Remove approver ${i + 1}`}
                                        sx={{ color: ds.errorMain, flexShrink: 0 }}
                                    >
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                    : /* spacer keeps layout stable when no delete button */
                                    <Box sx={{ width: 40, flexShrink: 0 }} />
                                }

                            </Box>
                        );
                    })}

                </Stack>
            </DialogContent>

            {/* ── Actions: "+ Add an approver" (text/left) · Cancel + Send (right) ─── */}
            <DialogActions sx={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                px: "32px", pt: 1, pb: "20px"
            }}>
                {/* DS: Size=Large, Color=Primary, Variant=Text */}
                <Button variant="text" color="primary" size="large" startIcon={<AddIcon />}
                    onClick={addApprover}>
          Add an approver
                </Button>

                <Box sx={{ display: "flex", gap: 1 }}>
                    {/* DS: Size=Large, Color=Primary, Variant=Outlined */}
                    <Button variant="outlined" color="primary" size="large" onClick={handleClose}>
            Cancel
                    </Button>
                    {/* DS: Size=Large, Color=Primary, Variant=Contained — disabled until ≥1 approver selected */}
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleSend}
                        disabled={!hasAtLeastOne}
                    >
            Send for approval
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
