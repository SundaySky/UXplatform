import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button, IconButton,
    Alert, Divider, Menu, MenuItem,
    ToggleButton, ToggleButtonGroup, Checkbox, Tooltip,
    Autocomplete, TextField, Chip,
    InputAdornment
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import NoAccountsIcon from "@mui/icons-material/NoAccounts";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import type { SxProps, Theme } from "@mui/material";

import {
    type PermissionTab,
    type EveryoneRole,
    type UserRole,
    type PermissionUser,
    type User,
    OWNER_USER,
    ALL_USERS
} from "./ManageAccessDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
export type { PermissionTab, EveryoneRole, UserRole, PermissionUser };

export interface VideoPermissionSettings {
  tab: PermissionTab
  everyoneRole: EveryoneRole
  users: PermissionUser[]
  ownerUsers: User[]
  noDuplicate: boolean
}

// ─── VideoAccessBar ───────────────────────────────────────────────────────────
export function VideoAccessBar({
    settings,
    onManageAccess,
    onChangePermission
}: {
  settings?: VideoPermissionSettings
  onManageAccess: () => void
  onChangePermission?: () => void
}) {
    const s = settings ?? {
        tab:          "teams" as const,
        everyoneRole: "viewer" as const,
        users:        [] as PermissionUser[],
        ownerUsers:   [OWNER_USER],
        noDuplicate:  false
    };
    const { tab, everyoneRole, users, ownerUsers } = s;

    const permLabel = tab === "private" ? "Only me" : "Teams and people";
    const PermIconComp = tab === "private" ? LockOutlinedIcon : GroupsIcon;
    const permColor = tab === "private" ? "success.main" : "primary.main";

    const showEveryone = tab === "teams" && everyoneRole !== "restricted";
    const rightUsers = tab === "teams" && everyoneRole === "restricted" ? users : [];

    const UserChip = ({ bg, initials, tip }: { bg: string; initials: string; tip: React.ReactNode }) => (
        <Tooltip title={tip} placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}>
            <Box sx={{ width: 32, height: 32, borderRadius: "6px", bgcolor: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "common.white", lineHeight: 1 }}>
                    {initials}
                </Typography>
            </Box>
        </Tooltip>
    );

    const TipContent = ({ name, desc }: { name: string; desc: string }) => (
        <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "common.white", lineHeight: 1.4 }}>{name}</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>{desc}</Typography>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Visible [icon] [label] ▾ */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Typography variant="caption" sx={{ fontWeight: 500, fontSize: 13, color: "text.primary" }}>
          Visible
                </Typography>
                <Box
                    onClick={onChangePermission}
                    sx={{
                        display: "flex", alignItems: "center", gap: "4px",
                        cursor: onChangePermission ? "pointer" : "default",
                        "&:hover": onChangePermission ? { opacity: 0.75 } : {}
                    }}
                >
                    <PermIconComp sx={{ fontSize: 15, color: permColor }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 13, color: "text.primary" }}>
                        {permLabel}
                    </Typography>
                    {onChangePermission && <KeyboardArrowDownIcon sx={{ fontSize: 14, color: "text.primary" }} />}
                </Box>
            </Box>

            {/* Avatar row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                {ownerUsers.map(owner => (
                    <UserChip
                        key={owner.id}
                        bg={owner.color}
                        initials={owner.initials}
                        tip={<TipContent name={`${owner.name}${owner.id === OWNER_USER.id ? " (You)" : ""}`} desc="Can manage access, delete, and rename." />}
                    />
                ))}

                {(showEveryone || rightUsers.length > 0) && (
                    <Box sx={{ width: "1px", height: 24, bgcolor: "grey.300", mx: "2px", flexShrink: 0 }} />
                )}

                {showEveryone && (
                    <Tooltip
                        title={<Typography variant="caption" sx={{ color: "common.white", lineHeight: 1.4 }}>Everyone in your account can {everyoneRole === "editor" ? "edit" : "view"}</Typography>}
                        placement="top" arrow componentsProps={{ tooltip: { sx: navyTipSx } }}
                    >
                        <Box sx={{ width: 32, height: 32, borderRadius: "6px", bgcolor: "rgba(0,83,229,0.10)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>
                            <GroupsIcon sx={{ fontSize: 18, color: "primary.main" }} />
                        </Box>
                    </Tooltip>
                )}

                {rightUsers.map((pu, i) => (
                    <UserChip
                        key={pu.user.id + i}
                        bg={pu.user.color}
                        initials={pu.user.initials}
                        tip={<TipContent name={pu.user.name} desc={pu.role === "editor" ? "Can edit the video" : "Can view the video"} />}
                    />
                ))}
            </Box>

            {/* Manage access button */}
            <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<SettingsOutlinedIcon sx={{ fontSize: 15 }} />}
                onClick={onManageAccess}
                sx={{
                    borderColor: "grey.300",
                    color: "text.primary",
                    py: "6px",
                    "&:hover": { borderColor: "primary.main", bgcolor: "rgba(0,83,229,0.04)" }
                }}
            >
        Manage access
            </Button>
        </Box>
    );
}

// ─── RoleButton — outlined style matching design system ───────────────────────
function RoleButton({ label, onClick }: { label: string; onClick: (e: React.MouseEvent<HTMLElement>) => void }) {
    return (
        <Button
            size="small"
            endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 14, ml: "-6px" }} />}
            onClick={e => {
                e.stopPropagation(); onClick(e);
            }}
            sx={{
                color: "text.primary",
                bgcolor: "background.paper",
                border: 1,
                borderColor: "grey.300",
                px: "10px", py: "4px",
                minWidth: 0, whiteSpace: "nowrap", flexShrink: 0,
                "&:hover": { bgcolor: "rgba(0,83,229,0.04)", borderColor: "primary.main" }
            }}
        >
            {label}
        </Button>
    );
}

function PersonRow({
    avatar, name, email, roleLabel, onRoleClick
}: {
  avatar: React.ReactNode
  name: string
  email: string
  roleLabel: string
  onRoleClick: (e: React.MouseEvent<HTMLElement>) => void
}) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", px: "16px", py: "10px" }}>
            {avatar}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ color: "text.primary", lineHeight: 1.3 }}>
                    {name}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.3 }}>
                    {email}
                </Typography>
            </Box>
            <RoleButton label={roleLabel} onClick={onRoleClick} />
        </Box>
    );
}

// ─── Inline Add Users Autocomplete ────────────────────────────────────────────
function InlineAddUsers({
    value, onChange, excludeIds, addRole, onRoleClick, onCancel, onAdd, noDuplicate, onNoDuplicateChange, notifyEmail, onNotifyEmailChange
}: {
  value: User[]
  onChange: (v: User[]) => void
  excludeIds: string[]
  addRole: UserRole
  onRoleClick: (e: React.MouseEvent<HTMLElement>) => void
  onCancel: () => void
  onAdd: () => void
  noDuplicate?: boolean
  onNoDuplicateChange?: (v: boolean) => void
  notifyEmail?: boolean
  onNotifyEmailChange?: (v: boolean) => void
}) {
    const options = ALL_USERS.filter(u => !excludeIds.includes(u.id));
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Autocomplete<User, true>
                multiple
                autoFocus
                value={value}
                onChange={(_, v) => onChange(v)}
                options={options}
                getOptionLabel={u => u.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                disableCloseOnSelect
                popupIcon={null}
                renderInput={params => (
                    <TextField
                        {...params}
                        autoFocus
                        placeholder={value.length === 0 ? "Search users…" : ""}
                        inputProps={{ ...params.inputProps, autoComplete: "new-password" }}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <InputAdornment position="end" sx={{ mr: "-2px", flexShrink: 0 }}>
                                    <Button
                                        size="small"
                                        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 14, ml: "-6px" }} />}
                                        onClick={e => {
                                            e.stopPropagation(); onRoleClick(e);
                                        }}
                                        sx={{
                                            color: "text.primary",
                                            bgcolor: "background.paper",
                                            border: 1,
                                            borderColor: "grey.300",
                                            px: "10px", py: "4px",
                                            minWidth: 0, whiteSpace: "nowrap",
                                            "&:hover": { bgcolor: "rgba(0,83,229,0.04)", borderColor: "primary.main" }
                                        }}
                                    >
                                        {addRole === "editor" ? "Can edit" : "Can view"}
                                    </Button>
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": { pr: "8px !important" },
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "grey.300" },
                            "& .MuiInputBase-root": { flexWrap: "wrap", gap: "4px", p: "8px 12px" }
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
                            avatar={<Avatar sx={{ bgcolor: "divider", fontSize: "9px !important", fontWeight: 600, color: "text.primary" }}>{user.initials}</Avatar>}
                            sx={{
                                bgcolor: "divider", color: "text.primary", borderRadius: "20px",
                                "& .MuiChip-label": { px: "6px" },
                                "& .MuiChip-deleteIcon": { color: "rgba(0,0,0,0.3)", "&:hover": { color: "text.primary" } },
                                height: 24
                            }}
                        />
                    ))
                }
                renderOption={(props, option) => {
                    const { key, ...listProps } = props as typeof props & { key: string };
                    return (
                        <Box key={key} component="li" {...listProps} sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1 }}>
                            <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: "divider", flexShrink: 0, color: "text.primary" }}>
                                {option.initials}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" sx={{ color: "text.primary", lineHeight: 1.4 }}>
                                    {option.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.3 }}>
                                    {option.email}
                                </Typography>
                            </Box>
                        </Box>
                    );
                }}
                ListboxProps={{ sx: { p: "4px", maxHeight: 240, "& .MuiAutocomplete-option": { borderRadius: "6px", "&.Mui-focused": { bgcolor: "action.hover" } } } }}
                slotProps={{ paper: { sx: { borderRadius: "8px", boxShadow: "0px 0px 10px rgba(3,25,79,0.18)", mt: "4px" } } }}
            />

            {/* Allow to duplicate checkbox - only for viewers */}
            {addRole === "viewer" && (
                <Box sx={{ mt: "16px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Checkbox
                            checked={!noDuplicate}
                            onChange={e => onNoDuplicateChange?.(e.target.checked ? false : true)}
                            size="small"
                            disableRipple
                            sx={{ p: 0, "&.Mui-checked": { color: "primary.main" } }}
                        />
                        <Typography variant="body1" sx={{ color: "text.primary" }}>
              Allow to duplicate videos
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Notify via email checkbox */}
            <Box sx={{ mt: "16px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Checkbox
                        checked={notifyEmail ?? false}
                        onChange={e => onNotifyEmailChange?.(e.target.checked)}
                        size="small"
                        disableRipple
                        sx={{ p: 0, "&.Mui-checked": { color: "primary.main" } }}
                    />
                    <Typography variant="body1" sx={{ color: "text.primary" }}>
            Notify via email
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: "flex", gap: "8px", justifyContent: "flex-end", mt: "20px" }}>
                <Button size="small" onClick={onCancel}
                    sx={{ color: "text.secondary" }}>
          Cancel
                </Button>
                <Button size="small" variant="contained" disabled={value.length === 0} onClick={onAdd}
                    sx={{
                        boxShadow: "none",
                        "&:hover": { boxShadow: "none" },
                        "&.Mui-disabled": { bgcolor: "action.disabledBackground", color: "action.disabled" }
                    }}>
          Add
                </Button>
            </Box>
        </Box>
    );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────
export default function VideoPermissionDialog({
    open,
    onClose,
    onSave,
    initialSettings
}: {
  open: boolean
  onClose: () => void
  onSave: (s: VideoPermissionSettings) => void
  initialSettings?: VideoPermissionSettings
}) {
    const dflt: VideoPermissionSettings = {
        tab: "teams", everyoneRole: "viewer", users: [], ownerUsers: [OWNER_USER], noDuplicate: false
    };

    const [tab, setTab] = useState<PermissionTab>(initialSettings?.tab ?? "teams");
    const [everyoneRole, setEveryoneRole] = useState<EveryoneRole>(initialSettings?.everyoneRole ?? "viewer");
    const [users, setUsers] = useState<PermissionUser[]>(initialSettings?.users ?? []);
    const [ownerUsers, setOwnerUsers] = useState<User[]>(initialSettings?.ownerUsers ?? [OWNER_USER]);
    const [noDuplicate, setNoDuplicate] = useState(initialSettings?.noDuplicate ?? false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [menuTarget, setMenuTarget] = useState<"owner" | "everyone" | string | null>(null);
    const [showDiscard, setShowDiscard] = useState(false);

    // Add users dialog state (separate dialog that replaces main content)
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [addUsers, setAddUsers] = useState<User[]>([]);
    const [addRole, setAddRole] = useState<UserRole>("editor");
    const [addRoleAnchor, setAddRoleAnchor] = useState<null | HTMLElement>(null);
    const [addNoDuplicate, setAddNoDuplicate] = useState(false);
    const [notifyViaEmail, setNotifyViaEmail] = useState(true);

    useEffect(() => {
        if (open) {
            const s = initialSettings ?? dflt;
            setTab(s.tab);
            setEveryoneRole(s.everyoneRole);
            setUsers(s.users);
            setOwnerUsers(s.ownerUsers.length ? s.ownerUsers : [OWNER_USER]);
            setNoDuplicate(s.noDuplicate);
            setMenuAnchor(null);
            setMenuTarget(null);
            setShowDiscard(false);
            setShowAddDialog(false);
            setAddUsers([]);
            setAddRole("editor");
            setAddRoleAnchor(null);
            setAddNoDuplicate(false);
            setNotifyViaEmail(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function sameIds(a: User[], b: User[]) {
        if (a.length !== b.length) {
            return false;
        }
        const bs = new Set(b.map(u => u.id));
        return a.every(u => bs.has(u.id));
    }
    function sameUsers(a: PermissionUser[], b: PermissionUser[]) {
        if (a.length !== b.length) {
            return false;
        }
        return a.every((pu, i) => pu.user.id === b[i].user.id && pu.role === b[i].role);
    }
    const initS = initialSettings ?? dflt;
    const isDirty =
    tab !== initS.tab ||
    everyoneRole !== initS.everyoneRole ||
    noDuplicate !== initS.noDuplicate ||
    !sameUsers(users, initS.users) ||
    !sameIds(ownerUsers, initS.ownerUsers);

    function handleClose() {
        if (showAddDialog) {
            setShowAddDialog(false); return;
        }
        if (isDirty) {
            setShowDiscard(true);
        }
        else {
            onClose();
        }
    }
    function handleSave() {
        onSave({ tab, everyoneRole, users, ownerUsers, noDuplicate });
    }

    function handleAddUsers() {
        if (addUsers.length === 0) {
            return;
        }
        const existingIds = new Set([OWNER_USER.id, ...users.map(pu => pu.user.id)]);
        const newOnes = addUsers
            .filter(u => !existingIds.has(u.id))
            .map(u => ({ user: u, role: addRole }));
        if (newOnes.length > 0) {
            setUsers(prev => [...prev, ...newOnes]);
        }
        setShowAddDialog(false);
        setAddUsers([]);
        setAddRole("editor");
    }

    const excludeIdsForAdd = [OWNER_USER.id, ...users.map(pu => pu.user.id)];

    function openMenuFn(e: React.MouseEvent<HTMLElement>, target: "owner" | "everyone" | string) {
        setMenuAnchor(e.currentTarget); setMenuTarget(target);
    }
    function closeMenuFn() {
        setMenuAnchor(null); setMenuTarget(null);
    }

    function changeUserRole(userId: string, role: UserRole) {
        setUsers(prev => prev.map(pu => pu.user.id === userId ? { ...pu, role } : pu));
    }
    function removeUser(userId: string) {
        setUsers(prev => prev.filter(pu => pu.user.id !== userId));
    }

    const menuUser = (menuTarget && menuTarget !== "owner" && menuTarget !== "everyone")
        ? (users.find(pu => pu.user.id === menuTarget) ?? null)
        : null;

    // Everyone row icon: PersonOffIcon when restricted, GroupsIcon otherwise
    const EveryoneIcon = everyoneRole === "restricted" ? NoAccountsIcon : GroupsIcon;

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={false}
                onClick={e => e.stopPropagation()}
                PaperProps={{ sx: { width: 560, maxWidth: "98vw", borderRadius: "12px", boxShadow: "0px 0px 10px rgba(3,25,79,0.25)", overflow: "hidden" } }}
            >
                {/* ── Title ─────────────────────────────────────────────────────────── */}
                {!showAddDialog ? (
                    <DialogTitle sx={{ p: "20px 16px 16px 28px", flexShrink: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Typography variant="h3" sx={{ color: "text.primary", lineHeight: 1.5, flex: 1 }}>
                Manage video access
                            </Typography>
                            <IconButton size="medium" sx={{ color: "action.active" }}>
                                <HelpOutlineIcon />
                            </IconButton>
                            <IconButton size="medium" onClick={handleClose} sx={{ color: "action.active" }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                ) : (
                    <DialogTitle sx={{ p: "20px 16px 16px 28px", flexShrink: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Button
                                size="small"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => {
                                    setShowAddDialog(false); setAddUsers([]); setAddRoleAnchor(null);
                                }}
                                sx={{
                                    color: "text.primary",
                                    p: 0,
                                    minWidth: 0,
                                    "&:hover": { bgcolor: "transparent" }
                                }}
                            />
                            <Typography variant="h3" sx={{ color: "text.primary", lineHeight: 1.5, flex: 1 }}>
                Add users
                            </Typography>
                            <IconButton size="medium" onClick={handleClose} sx={{ color: "action.active" }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                )}

                <Divider sx={{ borderColor: "divider" }} />

                {/* ── Content ────────────────────────────────────────────────────────── */}
                {!showAddDialog ? (
                    <DialogContent sx={{ p: "24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Tab selector — full-width bordered segmented control */}
                        <ToggleButtonGroup
                            value={tab}
                            exclusive
                            onChange={(_, v) => {
                                if (v !== null) {
                                    setTab(v as PermissionTab);
                                }
                            }}
                            fullWidth
                            sx={{
                                border: 1,
                                borderColor: "rgba(0,83,229,0.24)",
                                borderRadius: "8px",
                                overflow: "hidden",
                                "& .MuiToggleButtonGroup-grouped": {
                                    border: "none !important",
                                    borderRadius: "0 !important",
                                    m: 0
                                },
                                "& .MuiToggleButtonGroup-grouped:not(:last-of-type)": {
                                    borderRight: "1px solid rgba(0,83,229,0.24) !important"
                                }
                            }}
                        >
                            {(["teams", "private"] as const).map(v => (
                                <ToggleButton key={v} value={v} sx={{
                                    py: 1, gap: "6px",
                                    color: "text.primary",
                                    bgcolor: "background.paper",
                                    "&.Mui-selected": {
                                        bgcolor: "action.hover",
                                        color: "text.primary",
                                        fontWeight: 600,
                                        "&:hover": { bgcolor: "divider" }
                                    },
                                    "&:hover": { bgcolor: "rgba(0,83,229,0.04)" }
                                }}>
                                    {v === "teams"
                                        ? <GroupsIcon sx={{ fontSize: 18 }} />
                                        : <LockOutlinedIcon sx={{ fontSize: 18 }} />}
                                    {v === "teams" ? "Teams and people" : "Only me"}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>

                        {/* Access list */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {/* Who can access label */}
                            <Typography variant="h5" sx={{ color: "text.secondary", fontSize: 13, letterSpacing: "0.02em" }}>
                Who can access
                            </Typography>

                            <Box sx={{ border: 1, borderColor: "grey.300", borderRadius: "10px", overflow: "hidden" }}>
                                {/* Owner row */}
                                <PersonRow
                                    avatar={
                                        <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: "divider", flexShrink: 0, color: "text.primary" }}>
                                            {OWNER_USER.initials}
                                        </Avatar>
                                    }
                                    name={`${OWNER_USER.name} (You)`}
                                    email={OWNER_USER.email}
                                    roleLabel="Video owner"
                                    onRoleClick={tab === "teams" ? e => openMenuFn(e, "owner") : () => {}}
                                />

                                {/* Specific users — only when teams tab */}
                                {tab === "teams" && users.map(pu => (
                                    <Box key={pu.user.id}>
                                        <Divider sx={{ borderColor: "grey.300" }} />
                                        <PersonRow
                                            avatar={
                                                <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: "divider", flexShrink: 0, color: "text.primary" }}>
                                                    {pu.user.initials}
                                                </Avatar>
                                            }
                                            name={pu.user.name}
                                            email={pu.user.email}
                                            roleLabel={pu.role === "editor" ? "Can edit" : "Can view"}
                                            onRoleClick={e => openMenuFn(e, pu.user.id)}
                                        />
                                    </Box>
                                ))}

                                {/* Everyone row — only when teams tab */}
                                {tab === "teams" && (
                                    <>
                                        <Divider sx={{ borderColor: "grey.300" }} />
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", px: "16px", py: "10px" }}>
                                            <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: everyoneRole === "restricted" ? "action.hover" : "divider", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <EveryoneIcon sx={{ fontSize: 20, color: everyoneRole === "restricted" ? "text.secondary" : "text.primary" }} />
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="subtitle2" sx={{ color: "text.primary" }}>
                          Everyone in your account
                                                </Typography>
                                            </Box>
                                            <RoleButton
                                                label={everyoneRole === "editor" ? "Can edit" : everyoneRole === "viewer" ? "Can view" : "Restricted"}
                                                onClick={e => openMenuFn(e, "everyone")}
                                            />
                                        </Box>
                                    </>
                                )}

                                {/* Only-me state: owner row is already shown above; show info row */}
                                {tab === "private" && (
                                    <>
                                        <Divider sx={{ borderColor: "grey.300" }} />
                                        <Box sx={{ px: "16px", py: "10px" }}>
                                            <Alert
                                                severity="info"
                                                icon={<InfoOutlinedIcon fontSize="small" />}
                                                sx={{
                                                    bgcolor: "rgba(1,118,215,0.06)",
                                                    color: "text.primary",
                                                    "& .MuiAlert-icon": { color: "#0176D7" },
                                                    p: "6px 12px"
                                                }}
                                            >
                        Only you can see this video.
                                            </Alert>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </DialogContent>
                ) : (
                    <DialogContent sx={{ p: "24px 28px", display: "flex", flexDirection: "column" }}>
                        <InlineAddUsers
                            value={addUsers}
                            onChange={setAddUsers}
                            excludeIds={excludeIdsForAdd}
                            addRole={addRole}
                            onRoleClick={e => setAddRoleAnchor(e.currentTarget)}
                            onCancel={() => {
                                setShowAddDialog(false); setAddUsers([]); setAddRoleAnchor(null); setAddNoDuplicate(false); setNotifyViaEmail(true);
                            }}
                            onAdd={handleAddUsers}
                            noDuplicate={addNoDuplicate}
                            onNoDuplicateChange={setAddNoDuplicate}
                            notifyEmail={notifyViaEmail}
                            onNotifyEmailChange={setNotifyViaEmail}
                        />
                    </DialogContent>
                )}

                <Divider sx={{ borderColor: "divider" }} />

                {/* ── Actions ────────────────────────────────────────────────────────── */}
                {!showAddDialog && (
                    <DialogActions sx={{ px: "28px", py: "16px", gap: "8px", justifyContent: "space-between" }}>
                        {/* Left side: + Add user button */}
                        {tab === "teams" && (
                            <Button
                                startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 16 }} />}
                                onClick={() => setShowAddDialog(true)}
                                sx={{
                                    color: "primary.main",
                                    bgcolor: "action.hover",
                                    borderRadius: "100px",
                                    px: "14px", py: "6px",
                                    "&:hover": { bgcolor: "rgba(0,83,229,0.14)" }
                                }}
                            >
                Add user
                            </Button>
                        )}
                        {tab !== "teams" && <Box />}

                        {/* Right side: Cancel and Save buttons */}
                        <Box sx={{ display: "flex", gap: "8px" }}>
                            <Button variant="text" size="large" onClick={handleClose}
                                sx={{ color: "primary.main" }}>
                Cancel
                            </Button>
                            <Button variant="contained" size="large" onClick={handleSave}
                                sx={{ boxShadow: "none", "&:hover": { boxShadow: "none" } }}>
                Save
                            </Button>
                        </Box>
                    </DialogActions>
                )}

                {/* Role dropdown for add-user */}
                <Menu
                    anchorEl={addRoleAnchor}
                    open={Boolean(addRoleAnchor)}
                    onClose={() => setAddRoleAnchor(null)}
                    PaperProps={{ sx: { borderRadius: "10px", boxShadow: "0px 4px 20px rgba(3,25,79,0.18)", minWidth: 160, p: "4px" } }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    <MenuItem onClick={() => {
                        setAddRole("editor"); setAddRoleAnchor(null);
                    }} sx={menuItemSx}>
                        {addRole === "editor" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                        <Typography variant="body1" sx={menuTextSx}>Can edit</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setAddRole("viewer"); setAddRoleAnchor(null);
                    }} sx={menuItemSx}>
                        {addRole === "viewer" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                        <Typography variant="body1" sx={menuTextSx}>Can view</Typography>
                    </MenuItem>
                </Menu>

                {/* Role dropdown menu (for existing user rows) */}
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={closeMenuFn}
                    PaperProps={{ sx: { borderRadius: "10px", boxShadow: "0px 4px 20px rgba(3,25,79,0.18)", minWidth: 230, p: "4px" } }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    {/* Owner menu */}
                    {menuTarget === "owner" && [
                        <MenuItem key="ol" disableRipple sx={{ ...menuItemSx, cursor: "default", "&:hover": { bgcolor: "transparent" } }}>
                            <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} />
                            <Typography variant="body1" sx={menuTextSx}>Video owner</Typography>
                        </MenuItem>,
                        <MenuItem key="ms" onClick={closeMenuFn} sx={menuItemSx}>
                            <Box sx={{ width: 16 }} /><Typography variant="body1" sx={menuTextSx}>Make sole owner</Typography>
                        </MenuItem>,
                        <Divider key="d1" sx={{ my: "4px !important" }} />,
                        <MenuItem key="ro" disabled={ownerUsers.length <= 1} onClick={closeMenuFn} sx={menuItemSx}>
                            <Box sx={{ width: 16 }} /><Typography variant="body1" sx={menuErrSx}>{ownerUsers.length <= 1 ? "Transfer ownership" : "Remove ownership"}</Typography>
                        </MenuItem>
                    ]}

                    {/* Added user menu */}
                    {menuUser && [
                        <MenuItem key="ed" onClick={() => {
                            changeUserRole(menuTarget as string, "editor"); closeMenuFn();
                        }} sx={menuItemSx}>
                            {menuUser.role === "editor" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                            <Typography variant="body1" sx={menuTextSx}>Can edit</Typography>
                        </MenuItem>,
                        <MenuItem key="vi" onClick={() => {
                            changeUserRole(menuTarget as string, "viewer"); closeMenuFn();
                        }} sx={menuItemSx}>
                            {menuUser.role === "viewer" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                            <Typography variant="body1" sx={menuTextSx}>Can view</Typography>
                        </MenuItem>,
                        ...(menuUser?.role === "viewer" ? [
                            <MenuItem key="dup" onClick={() => setNoDuplicate(prev => !prev)} sx={{ ...menuItemSx, gap: 1 }}>
                                <Checkbox checked={!noDuplicate} size="small" disableRipple sx={{ p: 0, "&.Mui-checked": { color: "primary.main" } }} />
                                <Typography variant="body1" sx={menuTextSx}>Allow to duplicate</Typography>
                            </MenuItem>,
                            <Divider key="d-dup" sx={{ my: "4px !important" }} />
                        ] : []),
                        <MenuItem key="to" onClick={closeMenuFn} sx={menuItemSx}>
                            <Box sx={{ width: 16 }} /><Typography variant="body1" sx={menuTextSx}>Transfer ownership</Typography>
                        </MenuItem>,
                        <Divider key="d2" sx={{ my: "4px !important" }} />,
                        <MenuItem key="rm" onClick={() => {
                            removeUser(menuTarget as string); closeMenuFn();
                        }} sx={menuItemSx}>
                            <Box sx={{ width: 16 }} /><Typography variant="body1" sx={menuErrSx}>Remove permission</Typography>
                        </MenuItem>
                    ]}

                    {/* Everyone menu */}
                    {menuTarget === "everyone" && [
                        <MenuItem key="ed" onClick={() => {
                            setEveryoneRole("editor"); closeMenuFn();
                        }} sx={menuItemSx}>
                            {everyoneRole === "editor" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                            <Typography variant="body1" sx={menuTextSx}>Can edit</Typography>
                        </MenuItem>,
                        <MenuItem key="vi" onClick={() => {
                            setEveryoneRole("viewer"); closeMenuFn();
                        }} sx={menuItemSx}>
                            {everyoneRole === "viewer" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                            <Typography variant="body1" sx={menuTextSx}>Can view</Typography>
                        </MenuItem>,
                        ...(everyoneRole === "viewer" ? [
                            <MenuItem key="dup" onClick={() => setNoDuplicate(prev => !prev)} sx={{ ...menuItemSx, gap: 1 }}>
                                <Checkbox checked={!noDuplicate} size="small" disableRipple sx={{ p: 0, "&.Mui-checked": { color: "primary.main" } }} />
                                <Typography variant="body1" sx={menuTextSx}>Allow to duplicate</Typography>
                            </MenuItem>,
                            <Divider key="d-dup" sx={{ my: "4px !important" }} />
                        ] : []),
                        <MenuItem key="re" onClick={() => {
                            setEveryoneRole("restricted"); closeMenuFn();
                        }} sx={menuItemSx}>
                            {everyoneRole === "restricted" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                            <Typography variant="body1" sx={menuTextSx}>Restricted</Typography>
                        </MenuItem>
                    ]}
                </Menu>
            </Dialog>

            {/* Discard confirmation */}
            <Dialog open={showDiscard} onClose={() => setShowDiscard(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: "8px", boxShadow: "0px 0px 10px rgba(3,25,79,0.25)" } }}
            >
                <DialogTitle sx={{ p: "20px 20px 12px" }}>
                    <Typography variant="h3" sx={{ color: "text.primary", fontSize: 18 }}>
            Discard changes?
                    </Typography>
                </DialogTitle>
                <Divider sx={{ borderColor: "divider" }} />
                <DialogContent sx={{ p: "16px 20px" }}>
                    <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
            All your changes will be lost and the permissions will remain unchanged.
                    </Typography>
                </DialogContent>
                <Divider sx={{ borderColor: "divider" }} />
                <DialogActions sx={{ px: "20px", py: "12px", gap: "8px" }}>
                    <Button onClick={() => setShowDiscard(false)}
                        sx={{ color: "primary.main" }}>
            Keep editing
                    </Button>
                    <Button variant="contained" color="error" onClick={() => {
                        setShowDiscard(false); onClose();
                    }}
                    sx={{ boxShadow: "none", "&:hover": { boxShadow: "none" } }}>
            Discard
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const navyTipSx: SxProps<Theme> = {
    bgcolor: "secondary.main",
    borderRadius: "8px",
    px: 1.5, py: 1,
    maxWidth: 240,
    "& .MuiTooltip-arrow": { color: "secondary.main" }
};

const menuItemSx: SxProps<Theme> = { gap: 1.5, py: 0.75, borderRadius: "6px" };

const menuTextSx: SxProps<Theme> = { color: "text.primary" };

const menuErrSx: SxProps<Theme> = { color: "error.main" };
