import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button, IconButton,
    Chip, Avatar, Tooltip,
    Autocomplete, TextField, Alert,
    Divider, Menu, MenuItem, ToggleButton, ToggleButtonGroup,
    Checkbox, FormControlLabel, InputAdornment
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// ─── Types ────────────────────────────────────────────────────────────────────
export type PermissionTab = "teams" | "private"
export type EveryoneRole = "editor" | "viewer" | "restricted"
export type UserRole = "editor" | "viewer"

export interface User {
  id: string
  initials: string
  name: string
  email: string
  color: string
}

export interface PermissionUser {
  user: User
  role: UserRole
}

export interface PermissionSettings {
  tab: PermissionTab
  everyoneRole: EveryoneRole
  users: PermissionUser[]
  ownerUsers: User[]
}

const navyTooltipSx = {
    bgcolor: "secondary.main",
    borderRadius: "8px",
    px: 1.5, py: 1,
    maxWidth: 260,
    "& .MuiTooltip-arrow": { color: "secondary.main" }
};

// ─── Users ─────────────────────────────────────────────────────────────────────
export const OWNER_USER: User = {
    id: "ja", initials: "JA", name: "John Appleseed", email: "appleseedj@Sundaysky.com", color: "#0053E5"
};

export const ALL_USERS: User[] = [
    OWNER_USER,
    { id: "jq", initials: "JQ", name: "Jarvis Quindarius", email: "theoj@Sundaysky.com", color: "#7B1FA2" },
    { id: "kw", initials: "KW", name: "Klara Brightlingstone", email: "wintherl@Sundaysky.com", color: "#E65100" },
    { id: "mr", initials: "MR", name: "Mckayla Runolfsson", email: "runolfsson_m@Sundaysky.com", color: "#1565C0" },
    { id: "eb", initials: "EB", name: "Eli Bogan", email: "bogane@Sundaysky.com", color: "#2E7D32" },
    { id: "ke", initials: "KE", name: "Kenton Emard", email: "emardk@Sundaysky.com", color: "#AD1457" },
    { id: "ss", initials: "SS", name: "Shea Streich", email: "streichs@Sundaysky.com", color: "#00695C" },
    { id: "bw", initials: "BW", name: "Brigitte Wintheiser", email: "wintheiserb@Sundaysky.com", color: "#4527A0" },
    { id: "aj", initials: "AJ", name: "Adrianna Jast", email: "jasta@Sundaysky.com", color: "#558B2F" },
    { id: "jj", initials: "JJ", name: "Jayson Jerde", email: "jerdej@Sundaysky.com", color: "#0277BD" },
    { id: "jc", initials: "JC", name: "Jeramy Crona", email: "cronaj@Sundaysky.com", color: "#6D4C41" }
];

// ─── User avatar ──────────────────────────────────────────────────────────────
function UserAvatar({ user, size = 32 }: { user: User; size?: number }) {
    return (
        <Avatar
            variant="rounded"
            sx={{
                width: size, height: size,
                bgcolor: user.color,
                flexShrink: 0
            }}
        >
            {user.initials}
        </Avatar>
    );
}

// ─── User avatar with tooltip ─────────────────────────────────────────────────
export function UserAvatarWithTooltip({
    user,
    role = "Can manage access, delete, and rename.",
    size = 32
}: {
  user: User
  role?: string
  size?: number
}) {
    const isOwner = user.id === "ja";
    const titleNode = (
        <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#fff", lineHeight: 1.5 }}>
                {user.name}{isOwner ? " (You)" : ""}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                {role}
            </Typography>
        </Box>
    );
    return (
        <Tooltip title={titleNode} placement="bottom" arrow componentsProps={{ tooltip: { sx: navyTooltipSx } }}>
            <span>
                <UserAvatar user={user} size={size} />
            </span>
        </Tooltip>
    );
}

// ─── Users autocomplete (kept for AvatarPermissionDialog + future "Add user" dialog) ──
export function UsersAutocomplete({
    value,
    onChange,
    placeholder,
    excludeIds = [],
    disabledUsers = [],
    error,
    helperText
}: {
  value: User[]
  onChange: (v: User[]) => void
  placeholder?: string
  excludeIds?: string[]
  disabledUsers?: { id: string; reason: string }[]
  error?: boolean
  helperText?: string
}) {
    const options = ALL_USERS.filter(u => !excludeIds.includes(u.id));

    return (
        <Autocomplete<User, true>
            multiple
            value={value}
            onChange={(_, newValue) => {
                onChange(newValue.filter(u => !disabledUsers.find(d => d.id === u.id)));
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
                    placeholder={value.length === 0 ? placeholder : ""}
                    size="medium"
                    error={error}
                    helperText={helperText}
                    inputProps={{ ...params.inputProps, autoComplete: "new-password" }}
                    sx={{
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: error ? "error.main" : "grey.300" },
                        "& .MuiInputBase-root": { borderRadius: "8px", flexWrap: "wrap", gap: "4px", p: "8px 12px" }
                    }}
                />
            )}
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((user, index) => (
                    <Chip
                        {...getTagProps({ index })}
                        key={user.id}
                        label={`${user.name}${user.id === OWNER_USER.id ? " (You)" : ""}`}
                        size="small"
                        avatar={
                            <Avatar sx={{ bgcolor: user.color, color: "#fff !important" }}>
                                {user.initials}
                            </Avatar>
                        }
                        sx={{
                            bgcolor: user.color,
                            color: "#fff",
                            borderRadius: "20px",
                            "& .MuiChip-label": { px: "6px" },
                            "& .MuiChip-deleteIcon": { color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } },
                            height: 24
                        }}
                    />
                ))
            }
            renderOption={(props, option, { selected }) => {
                const { key, ...listProps } = props as typeof props & { key: string };
                const disabledEntry = disabledUsers.find(d => d.id === option.id);
                const row = (
                    <Box
                        key={key}
                        component="li"
                        {...listProps}
                        sx={{
                            display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1,
                            cursor: disabledEntry ? "not-allowed" : "pointer",
                            opacity: disabledEntry ? 0.45 : 1
                        }}
                    >
                        <UserAvatar user={option} size={36} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ color: "text.primary", lineHeight: 1.4 }}>
                                {option.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.3 }}>
                                {disabledEntry ? disabledEntry.reason : option.email}
                            </Typography>
                        </Box>
                        {selected && <CheckIcon sx={{ color: "primary.main", fontSize: 18, flexShrink: 0 }} />}
                    </Box>
                );
                if (disabledEntry) {
                    return (
                        <Tooltip key={key} title={disabledEntry.reason} placement="right"
                            componentsProps={{ tooltip: { sx: navyTooltipSx } }}
                            arrow
                        >
                            <span style={{ display: "block" }}>{row}</span>
                        </Tooltip>
                    );
                }
                return row;
            }}
            ListboxProps={{ sx: { p: "4px", maxHeight: 240, "& .MuiAutocomplete-option": { borderRadius: "6px" } } }}
            slotProps={{ paper: { sx: { borderRadius: "8px", mt: "4px" } } }}
        />
    );
}

// ─── Internal UI helpers ───────────────────────────────────────────────────────
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
                bgcolor: "rgba(0,0,0,0.06)",
                borderRadius: "20px",
                px: "10px", py: "4px",
                minWidth: 0, whiteSpace: "nowrap", flexShrink: 0,
                "&:hover": { bgcolor: "rgba(0,0,0,0.10)" }
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

// ─── Add Users Autocomplete (with role pill inside input) ─────────────────────
function AddUsersAutocomplete({
    value, onChange, excludeIds, addRole, onRoleClick
}: {
  value: User[]
  onChange: (v: User[]) => void
  excludeIds: string[]
  addRole: UserRole
  onRoleClick: (e: React.MouseEvent<HTMLElement>) => void
}) {
    const options = ALL_USERS.filter(u => !excludeIds.includes(u.id));
    return (
        <Autocomplete<User, true>
            multiple
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
                    placeholder={value.length === 0 ? "Add users" : ""}
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
                                        bgcolor: "rgba(0,0,0,0.06)",
                                        borderRadius: "20px",
                                        px: "10px", py: "4px",
                                        minWidth: 0, whiteSpace: "nowrap",
                                        "&:hover": { bgcolor: "rgba(0,0,0,0.10)" }
                                    }}
                                >
                                    {addRole === "editor" ? "Can edit" : "Can view"}
                                </Button>
                            </InputAdornment>
                        )
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "8px", pr: "8px !important" },
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
                        avatar={<Avatar sx={{ bgcolor: user.color, color: "#fff !important" }}>{user.initials}</Avatar>}
                        sx={{
                            bgcolor: user.color, color: "#fff", borderRadius: "20px",
                            "& .MuiChip-label": { px: "6px" },
                            "& .MuiChip-deleteIcon": { color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } },
                            height: 24
                        }}
                    />
                ))
            }
            renderOption={(props, option) => {
                const { key, ...listProps } = props as typeof props & { key: string };
                return (
                    <Box key={key} component="li" {...listProps} sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1 }}>
                        <UserAvatar user={option} size={36} />
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
            ListboxProps={{ sx: { p: "4px", maxHeight: 240, "& .MuiAutocomplete-option": { borderRadius: "6px" } } }}
            slotProps={{ paper: { sx: { borderRadius: "8px", mt: "4px" } } }}
        />
    );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────
export default function ManageAccessDialog({
    open,
    onClose,
    itemType,
    onSave,
    initialSettings
}: {
  open: boolean
  onClose: () => void
  itemType: "media" | "folder"
  onSave: (s: PermissionSettings) => void
  initialSettings?: PermissionSettings
}) {
    const ownerRoleLabel = itemType === "folder" ? "Folder owner" : "Asset owner";
    const dflt: PermissionSettings = { tab: "teams", everyoneRole: "viewer", users: [], ownerUsers: [OWNER_USER] };

    // Main view state
    const [tab, setTab] = useState<PermissionTab>(initialSettings?.tab ?? "teams");
    const [everyoneRole, setEveryoneRole] = useState<EveryoneRole>(initialSettings?.everyoneRole ?? "viewer");
    const [users, setUsers] = useState<PermissionUser[]>(initialSettings?.users ?? []);
    const [ownerUsers, setOwnerUsers] = useState<User[]>(initialSettings?.ownerUsers ?? [OWNER_USER]);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [menuTarget, setMenuTarget] = useState<"owner" | "everyone" | string | null>(null);
    const [showDiscard, setShowDiscard] = useState(false);

    // Add users sub-view state
    const [addOpen, setAddOpen] = useState(false);
    const [addUsers, setAddUsers] = useState<User[]>([]);
    const [addRole, setAddRole] = useState<UserRole>("editor");
    const [addNotify, setAddNotify] = useState(true);
    const [addAllowDup, setAddAllowDup] = useState(false);
    const [addRoleAnchor, setAddRoleAnchor] = useState<null | HTMLElement>(null);

    useEffect(() => {
        if (open) {
            const s = initialSettings ?? dflt;
            setTab(s.tab);
            setEveryoneRole(s.everyoneRole);
            setUsers(s.users);
            setOwnerUsers(s.ownerUsers.length ? s.ownerUsers : [OWNER_USER]);
            setMenuAnchor(null);
            setMenuTarget(null);
            setShowDiscard(false);
            setAddOpen(false);
            setAddUsers([]);
            setAddRole("editor");
            setAddNotify(true);
            setAddAllowDup(false);
            setAddRoleAnchor(null);
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
    !sameUsers(users, initS.users) ||
    !sameIds(ownerUsers, initS.ownerUsers);

    function handleClose() {
        if (addOpen) {
            setAddOpen(false); return; 
        }
        if (isDirty) {
            setShowDiscard(true);
        }
        else {
            onClose();
        }
    }
    function handleSave() {
        onSave({ tab, everyoneRole, users, ownerUsers }); 
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
        setAddOpen(false);
        setAddUsers([]);
        setAddRole("editor");
        setAddAllowDup(false);
    }

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

    const menuItemSx = { gap: 1.5, py: 0.75, borderRadius: "6px" };
    const menuTextSx = { color: "text.primary" };
    const menuErrSx = { color: "error.main" };

    const excludeIdsForAdd = [OWNER_USER.id, ...users.map(pu => pu.user.id)];

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={false}
                PaperProps={{ sx: { width: 560, maxWidth: "98vw", borderRadius: "12px", boxShadow: "0px 0px 10px rgba(3,25,79,0.25)", overflow: "hidden" } }}
            >
                {/* ── Title ────────────────────────────────────────────────────────── */}
                <DialogTitle sx={{ p: "20px 16px 16px 28px", flexShrink: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {addOpen && (
                            <IconButton size="medium" onClick={() => setAddOpen(false)} sx={{ color: "action.active", ml: "-8px", mr: "4px" }}>
                                <ArrowBackIcon />
                            </IconButton>
                        )}
                        <Typography variant="h3" sx={{ color: "text.primary", lineHeight: 1.5, flex: 1 }}>
                            {addOpen ? "Add users" : "Manage access"}
                        </Typography>
                        <IconButton size="medium" sx={{ color: "action.active" }}>
                            <HelpOutlineIcon />
                        </IconButton>
                        <IconButton size="medium" onClick={handleClose} sx={{ color: "action.active" }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <Divider sx={{ borderColor: "divider" }} />

                {/* ── Sliding content ───────────────────────────────────────────────── */}
                <DialogContent sx={{ p: 0, overflow: "hidden" }}>
                    <Box sx={{
                        display: "flex",
                        transform: addOpen ? "translateX(-50%)" : "translateX(0)",
                        transition: "transform 0.26s cubic-bezier(0.4,0,0.2,1)",
                        width: "200%"
                    }}>
                        {/* ── Panel 1: Manage access ──────────────────────────────────── */}
                        <Box sx={{ width: "50%", flexShrink: 0, p: "24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Tab selector */}
                            <ToggleButtonGroup
                                value={tab}
                                exclusive
                                onChange={(_, v) => {
                                    if (v !== null) {
                                        setTab(v as PermissionTab);
                                    } 
                                }}
                                sx={{
                                    bgcolor: "rgba(0,0,0,0.06)", borderRadius: "10px", p: "3px", alignSelf: "flex-start",
                                    "& .MuiToggleButtonGroup-grouped": { border: "none !important", borderRadius: "8px !important", m: 0 }
                                }}
                            >
                                {(["teams", "private"] as const).map(v => (
                                    <ToggleButton key={v} value={v} sx={{
                                        px: 2, py: 0.75, color: "text.secondary",
                                        "&.Mui-selected": {
                                            bgcolor: "#fff", color: "text.primary",
                                            boxShadow: "0px 1px 4px rgba(0,0,0,0.12)", "&:hover": { bgcolor: "#fff" }
                                        }
                                    }}>
                                        {v === "teams" ? "Teams and people" : "Only me"}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>

                            {/* Who can access */}
                            <Box>
                                <Typography variant="h5" sx={{ color: "text.primary", mb: "12px", display: "block" }}>
                  Who can access
                                </Typography>

                                <Box sx={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: "10px", overflow: "hidden" }}>
                                    {/* Owner row */}
                                    <PersonRow
                                        avatar={
                                            <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: OWNER_USER.color, flexShrink: 0 }}>
                                                {OWNER_USER.initials}
                                            </Avatar>
                                        }
                                        name={`${OWNER_USER.name} (You)`}
                                        email={OWNER_USER.email}
                                        roleLabel={ownerRoleLabel}
                                        onRoleClick={e => openMenuFn(e, "owner")}
                                    />

                                    {/* Added users — teams tab only */}
                                    {tab === "teams" && users.map(pu => (
                                        <Box key={pu.user.id}>
                                            <Divider />
                                            <PersonRow
                                                avatar={
                                                    <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: pu.user.color, flexShrink: 0 }}>
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

                                    {/* Everyone row — teams tab only */}
                                    {tab === "teams" && (
                                        <>
                                            <Divider />
                                            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", px: "16px", py: "10px" }}>
                                                <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "rgba(0,83,229,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <GroupsIcon sx={{ fontSize: 20, color: "primary.main" }} />
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
                                </Box>

                                {/* Only me alert */}
                                {tab === "private" && (
                                    <Alert severity="info" icon={<InfoOutlinedIcon fontSize="small" />}
                                        sx={{ mt: 1.5, borderRadius: "8px", bgcolor: "primary.light", color: "text.primary", "& .MuiAlert-icon": { color: "primary.main" } }}
                                    >
                                        {itemType === "folder"
                                            ? "Only you can view this folder\u2019s media and all the folders inside it"
                                            : "Only you can view this media"}
                                    </Alert>
                                )}
                            </Box>
                        </Box>

                        {/* ── Panel 2: Add users ──────────────────────────────────────── */}
                        <Box sx={{ width: "50%", flexShrink: 0, p: "24px 28px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <AddUsersAutocomplete
                                value={addUsers}
                                onChange={setAddUsers}
                                excludeIds={excludeIdsForAdd}
                                addRole={addRole}
                                onRoleClick={e => setAddRoleAnchor(e.currentTarget)}
                            />
                            {addRole === "viewer" && (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={addAllowDup}
                                            onChange={e => setAddAllowDup(e.target.checked)}
                                            size="small"
                                            sx={{ "&.Mui-checked": { color: "primary.main" } }}
                                        />
                                    }
                                    label="Allow to duplicate"
                                    sx={{ ml: 0, "& .MuiFormControlLabel-label": { color: "text.primary" } }}
                                />
                            )}
                        </Box>
                    </Box>
                </DialogContent>

                <Divider sx={{ borderColor: "divider" }} />

                {/* ── Actions ───────────────────────────────────────────────────────── */}
                <DialogActions sx={{ px: "28px", py: "16px", gap: "8px" }}>
                    {!addOpen ? (
                        <>
                            {/* + Add user on the left (teams tab only) */}
                            {tab === "teams" && (
                                <Button
                                    startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => setAddOpen(true)}
                                    sx={{ color: "primary.main", p: "4px 8px", mr: "auto" }}
                                >
                  Add user
                                </Button>
                            )}
                            <Box sx={{ flex: 1 }} />
                            <Button variant="text" size="large" onClick={handleClose}>
                Cancel
                            </Button>
                            <Button variant="contained" size="large" onClick={handleSave}>
                Save
                            </Button>
                        </>
                    ) : (
                        <>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={addNotify}
                                        onChange={e => setAddNotify(e.target.checked)}
                                        size="medium"
                                        sx={{ "&.Mui-checked": { color: "primary.main" } }}
                                    />
                                }
                                label="Notify via email"
                                sx={{ mr: "auto", "& .MuiFormControlLabel-label": { color: "text.primary" } }}
                            />
                            <Button variant="text" size="large" onClick={() => setAddOpen(false)}>
                Cancel
                            </Button>
                            <Button
                                variant="contained" size="large"
                                disabled={addUsers.length === 0}
                                onClick={handleAddUsers}
                            >
                Add users
                            </Button>
                        </>
                    )}
                </DialogActions>

                {/* Role dropdown for main view */}
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={closeMenuFn}
                    PaperProps={{ sx: { borderRadius: "10px", boxShadow: "0px 4px 20px rgba(3,25,79,0.18)", minWidth: 210, p: "4px" } }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    {/* Owner menu */}
                    {menuTarget === "owner" && [
                        <MenuItem key="ol" disableRipple sx={{ ...menuItemSx, cursor: "default", "&:hover": { bgcolor: "transparent" } }}>
                            <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} />
                            <Typography sx={menuTextSx}>{ownerRoleLabel}</Typography>
                        </MenuItem>,
                        <MenuItem key="ms" onClick={closeMenuFn} sx={menuItemSx}>
                            <Box sx={{ width: 16 }} /><Typography sx={menuTextSx}>Make sole owner</Typography>
                        </MenuItem>,
                        <Divider key="d1" sx={{ my: "4px !important" }} />,
                        <MenuItem key="ro" disabled={ownerUsers.length <= 1} onClick={closeMenuFn} sx={menuItemSx}>
                            <Box sx={{ width: 16 }} /><Typography sx={menuErrSx}>Remove ownership</Typography>
                        </MenuItem>
                    ]}

                    {/* Added user menu */}
                    {menuUser && [
                        <MenuItem key="ed" onClick={() => {
                            changeUserRole(menuTarget as string, "editor"); closeMenuFn(); 
                        }} sx={menuItemSx}>
                            {menuUser.role === "editor" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                            <Typography sx={menuTextSx}>Can edit</Typography>
                        </MenuItem>,
                        <MenuItem key="vi" onClick={() => {
                            changeUserRole(menuTarget as string, "viewer"); closeMenuFn(); 
                        }} sx={menuItemSx}>
                            {menuUser.role === "viewer" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                            <Typography sx={menuTextSx}>Can view</Typography>
                        </MenuItem>,
                        <Divider key="d1" sx={{ my: "4px !important" }} />,
                        <MenuItem key="to" onClick={closeMenuFn} sx={menuItemSx}>
                            <Box sx={{ width: 16 }} /><Typography sx={menuTextSx}>Transfer ownership</Typography>
                        </MenuItem>,
                        <Divider key="d2" sx={{ my: "4px !important" }} />,
                        <MenuItem key="rm" onClick={() => {
                            removeUser(menuTarget as string); closeMenuFn(); 
                        }} sx={menuItemSx}>
                            <Box sx={{ width: 16 }} /><Typography sx={menuErrSx}>Remove permission</Typography>
                        </MenuItem>
                    ]}

                    {/* Everyone menu */}
                    {menuTarget === "everyone" && [
                        <MenuItem key="ed" onClick={() => {
                            setEveryoneRole("editor"); closeMenuFn(); 
                        }} sx={menuItemSx}>
                            {everyoneRole === "editor" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                            <Typography sx={menuTextSx}>Can edit</Typography>
                        </MenuItem>,
                        <MenuItem key="vi" onClick={() => {
                            setEveryoneRole("viewer"); closeMenuFn(); 
                        }} sx={menuItemSx}>
                            {everyoneRole === "viewer" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                            <Typography sx={menuTextSx}>Can view</Typography>
                        </MenuItem>,
                        <Divider key="d1" sx={{ my: "4px !important" }} />,
                        <MenuItem key="re" onClick={() => {
                            setEveryoneRole("restricted"); closeMenuFn(); 
                        }} sx={menuItemSx}>
                            {everyoneRole === "restricted" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                            <Typography sx={menuTextSx}>Restricted</Typography>
                        </MenuItem>
                    ]}
                </Menu>

                {/* Role dropdown for add view */}
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
                        <Typography sx={menuTextSx}>Can edit</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setAddRole("viewer"); setAddRoleAnchor(null); 
                    }} sx={menuItemSx}>
                        {addRole === "viewer" ? <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} /> : <Box sx={{ width: 16 }} />}
                        <Typography sx={menuTextSx}>Can view</Typography>
                    </MenuItem>
                </Menu>
            </Dialog>

            {/* Discard confirmation */}
            <Dialog open={showDiscard} onClose={() => setShowDiscard(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: "8px", boxShadow: "0px 0px 10px rgba(3,25,79,0.25)" } }}
            >
                <DialogTitle sx={{ p: "20px 20px 12px" }}>
                    <Typography variant="h3" sx={{ color: "text.primary" }}>
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
                    <Button variant="text" onClick={() => setShowDiscard(false)}>
            Keep editing
                    </Button>
                    <Button variant="contained" color="error" onClick={() => {
                        setShowDiscard(false); onClose();
                    }}>
            Discard
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
