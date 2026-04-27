import { useState, useEffect } from "react";
import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    Dialog, DialogContent,
    Box, Typography, Button, IconButton, SvgIcon,
    Chip, Tooltip,
    Autocomplete, TextField, Alert,
    Divider, Menu, ToggleButton,
    Checkbox, FormControlLabel, InputAdornment
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faUserPlus, faChevronDown, faCheck, faCircleInfo, faArrowLeft } from "@fortawesome/pro-regular-svg-icons";
import { TruffleDialogTitle, TruffleDialogActions, TruffleToggleButtonGroup, TruffleMenuItem, TruffleAvatar } from "@sundaysky/smartvideo-hub-truffle-component-library";

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

export interface UserGroup {
  id: string
  name: string
  members: User[]
}

export interface PermissionGroup {
  group: UserGroup
  role: UserRole
}

export interface PermissionSettings {
  tab: PermissionTab
  everyoneRole: EveryoneRole
  users: PermissionUser[]
  groups: PermissionGroup[]
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
    id: "ja", initials: "JA", name: "John Appleseed", email: "appleseedj@Sundaysky.com", color: "primary.main"
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

// ─── Groups ───────────────────────────────────────────────────────────────────
export const ALL_GROUPS: UserGroup[] = [
    { id: "legal", name: "Legal", members: ALL_USERS.filter(u => ["kw", "ke", "aj"].includes(u.id)) },
    { id: "marketing", name: "Marketing", members: ALL_USERS.filter(u => ["jq", "bw", "jj"].includes(u.id)) },
    { id: "sales", name: "Sales", members: ALL_USERS.filter(u => ["mr", "ss", "jc"].includes(u.id)) }
];

// ─── Add option union ─────────────────────────────────────────────────────────
type AddOption =
    | { kind: "user"; data: User }
    | { kind: "group"; data: UserGroup }

// ─── User avatar ──────────────────────────────────────────────────────────────
function UserAvatar({ user, size = 32 }: { user: User; size?: number }) {
    return (
        <TruffleAvatar
            text={user.initials}
            size={size <= 32 ? "medium" : "large"}
            sx={{ bgcolor: user.color, borderRadius: "8px", flexShrink: 0 }}
        />
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
            <Typography variant="caption" sx={tooltipTitlePrimarySx}>
                {user.name}{isOwner ? " (You)" : ""}
            </Typography>
            <Typography variant="caption" sx={{ color: (theme: Theme) => alpha(theme.palette.common.white, 0.8), lineHeight: 1.5 }}>
                {role}
            </Typography>
        </Box>
    );
    return (
        <Tooltip title={titleNode} placement="bottom" arrow slotProps={{ tooltip: { sx: navyTooltipSx } }}>
            <Box component="span">
                <UserAvatar user={user} size={size} />
            </Box>
        </Tooltip>
    );
}

// ─── Group avatar with tooltip ────────────────────────────────────────────────
export function GroupAvatarWithTooltip({ group, size = 32 }: { group: UserGroup; size?: number }) {
    const titleNode = (
        <Box>
            <Typography variant="caption" sx={tooltipTitlePrimarySx}>{group.name}</Typography>
            {group.members.map(m => (
                <Typography key={m.id} variant="caption" sx={{ display: "block", color: (theme: Theme) => alpha(theme.palette.common.white, 0.8), lineHeight: 1.5 }}>
                    • {m.name}
                </Typography>
            ))}
            <Typography variant="caption" sx={{ display: "block", color: (theme: Theme) => alpha(theme.palette.common.white, 0.55), lineHeight: 1.5, mt: 0.5 }}>
                Group members are managed by account owners
            </Typography>
        </Box>
    );
    const boxSize = size <= 32 ? 32 : 36;
    return (
        <Tooltip title={titleNode} placement="bottom" arrow slotProps={{ tooltip: { sx: navyTooltipSx } }}>
            <Box sx={{ ...groupIconBoxBaseSx, width: boxSize, height: boxSize }}>
                <SvgIcon sx={groupIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
            </Box>
        </Tooltip>
    );
}

// ─── Users autocomplete (used by AvatarPermissionDialog + WorkflowApprovalStepper) ──
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
            popupIcon={<SvgIcon sx={popupIconSx}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>}
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
                        avatar={<TruffleAvatar text={user.initials} size="small" sx={{ bgcolor: user.color }} />}
                        sx={{
                            bgcolor: user.color,
                            color: "common.white",
                            "& .MuiChip-deleteIcon": { color: "common.white", opacity: 0.7, "&:hover": { opacity: 1 } }
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
                        <Box sx={flexMinWidthSx}>
                            <Typography variant="subtitle2" sx={optionNameSx}>
                                {option.name}
                            </Typography>
                            <Typography variant="caption" sx={optionEmailSx}>
                                {disabledEntry ? disabledEntry.reason : option.email}
                            </Typography>
                        </Box>
                        {selected && <SvgIcon sx={checkIconSx}><FontAwesomeIcon icon={faCheck} /></SvgIcon>}
                    </Box>
                );
                if (disabledEntry) {
                    return (
                        <Tooltip key={key} title={disabledEntry.reason} placement="right"
                            slotProps={{ tooltip: { sx: navyTooltipSx } }}
                            arrow
                        >
                            <Box component="span" sx={displayBlockSx}>{row}</Box>
                        </Tooltip>
                    );
                }
                return row;
            }}
            ListboxProps={{ sx: autocompleteListboxSx }}
            slotProps={{ paper: { sx: autocompletePaperSx } }}
        />
    );
}

// ─── Internal UI helpers ───────────────────────────────────────────────────────
function RoleButton({ label, onClick }: { label: string; onClick: (e: React.MouseEvent<HTMLElement>) => void }) {
    return (
        <Chip
            size="small"
            label={label}
            deleteIcon={<SvgIcon sx={roleButtonChevronIconSx}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>}
            onDelete={onClick}
            onClick={e => {
                e.stopPropagation(); onClick(e);
            }}
            sx={roleButtonChipSx}
        />
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
        <Box sx={personRowContainerSx}>
            {avatar}
            <Box sx={flexMinWidthSx}>
                <Typography variant="subtitle2" sx={personNameSx}>
                    {name}
                </Typography>
                <Typography variant="caption" sx={personEmailSx}>
                    {email}
                </Typography>
            </Box>
            <RoleButton label={roleLabel} onClick={onRoleClick} />
        </Box>
    );
}

function GroupRow({
    group, roleLabel, onRoleClick
}: {
  group: UserGroup
  roleLabel: string
  onRoleClick: (e: React.MouseEvent<HTMLElement>) => void
}) {
    const tooltipContent = (
        <Box>
            <Typography variant="caption" sx={tooltipTitlePrimarySx}>{group.name}</Typography>
            {group.members.map(m => (
                <Typography key={m.id} variant="caption" sx={{ display: "block", color: (theme: Theme) => alpha(theme.palette.common.white, 0.8), lineHeight: 1.5 }}>
                    • {m.name}
                </Typography>
            ))}
            <Typography variant="caption" sx={{ display: "block", color: (theme: Theme) => alpha(theme.palette.common.white, 0.55), lineHeight: 1.5, mt: 0.5 }}>
                Group members are managed by account owners
            </Typography>
        </Box>
    );
    return (
        <Box sx={personRowContainerSx}>
            <Tooltip title={tooltipContent} placement="bottom" arrow slotProps={{ tooltip: { sx: navyTooltipSx } }}>
                <Box sx={groupAvatarRowBoxSx}>
                    <SvgIcon sx={groupAvatarRowIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
                </Box>
            </Tooltip>
            <Box sx={flexMinWidthSx}>
                <Typography variant="subtitle2" sx={personNameSx}>{group.name}</Typography>
                <Typography variant="caption" sx={personEmailSx}>{group.members.length} members</Typography>
            </Box>
            <RoleButton label={roleLabel} onClick={onRoleClick} />
        </Box>
    );
}

// ─── Add Users+Groups Autocomplete ────────────────────────────────────────────
function AddUsersAutocomplete({
    value, onChange, excludeIds, excludeGroupIds, addRole, onRoleClick
}: {
  value: AddOption[]
  onChange: (v: AddOption[]) => void
  excludeIds: string[]
  excludeGroupIds: string[]
  addRole: UserRole
  onRoleClick: (e: React.MouseEvent<HTMLElement>) => void
}) {
    const userOptions: AddOption[] = ALL_USERS
        .filter(u => !excludeIds.includes(u.id))
        .map(u => ({ kind: "user", data: u }));
    const groupOptions: AddOption[] = ALL_GROUPS
        .filter(g => !excludeGroupIds.includes(g.id))
        .map(g => ({ kind: "group", data: g }));
    const options: AddOption[] = [...groupOptions, ...userOptions];

    return (
        <Autocomplete<AddOption, true>
            multiple
            value={value}
            onChange={(_, v) => onChange(v)}
            options={options}
            groupBy={opt => opt.kind === "group" ? "User groups" : "Users"}
            getOptionLabel={opt => opt.data.name}
            isOptionEqualToValue={(a, b) => a.kind === b.kind && a.data.id === b.data.id}
            disableCloseOnSelect
            popupIcon={null}
            renderGroup={params => (
                <Box key={params.key}>
                    <Box sx={autocompleteGroupHeaderSx}>
                        <Typography variant="subtitle2" sx={autocompleteGroupLabelSx}>
                            {params.group}
                        </Typography>
                    </Box>
                    {params.children}
                </Box>
            )}
            renderInput={params => (
                <TextField
                    {...params}
                    placeholder={value.length === 0 ? "Add users or groups" : ""}
                    inputProps={{ ...params.inputProps, autoComplete: "new-password" }}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <InputAdornment position="end" sx={addRoleAdornmentSx}>
                                <Button
                                    size="small"
                                    endIcon={<SvgIcon sx={addRoleChevronIconSx}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>}
                                    onClick={e => {
                                        e.stopPropagation(); onRoleClick(e);
                                    }}
                                    sx={addRoleButtonSx}
                                >
                                    {addRole === "editor" ? "Can edit" : "Can view"}
                                </Button>
                            </InputAdornment>
                        )
                    }}
                    sx={addUsersTextFieldSx}
                />
            )}
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((opt, index) => {
                    if (opt.kind === "group") {
                        const g = opt.data as UserGroup;
                        return (
                            <Chip
                                {...getTagProps({ index })}
                                key={g.id}
                                label={g.name}
                                size="small"
                                avatar={
                                    <Box sx={groupChipIconBoxSx}>
                                        <SvgIcon sx={groupChipIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
                                    </Box>
                                }
                                sx={groupChipSx}
                            />
                        );
                    }
                    const u = opt.data as User;
                    return (
                        <Chip
                            {...getTagProps({ index })}
                            key={u.id}
                            label={u.name}
                            size="small"
                            avatar={<TruffleAvatar text={u.initials} size="small" sx={{ bgcolor: u.color }} />}
                            sx={{
                                bgcolor: u.color, color: "common.white",
                                "& .MuiChip-deleteIcon": { color: "common.white", opacity: 0.7, "&:hover": { opacity: 1 } }
                            }}
                        />
                    );
                })
            }
            renderOption={(props, option) => {
                const { key, ...listProps } = props as typeof props & { key: string };
                if (option.kind === "group") {
                    const g = option.data as UserGroup;
                    return (
                        <Box key={key} component="li" {...listProps} sx={optionRowSx}>
                            <Box sx={groupOptionIconBoxSx}>
                                <SvgIcon sx={groupOptionIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
                            </Box>
                            <Box sx={flexMinWidthSx}>
                                <Typography variant="subtitle2" sx={optionNameSx}>{g.name}</Typography>
                                <Typography variant="caption" sx={optionEmailSx}>{g.members.length} members</Typography>
                            </Box>
                        </Box>
                    );
                }
                const u = option.data as User;
                return (
                    <Box key={key} component="li" {...listProps} sx={optionRowSx}>
                        <UserAvatar user={u} size={36} />
                        <Box sx={flexMinWidthSx}>
                            <Typography variant="subtitle2" sx={optionNameSx}>{u.name}</Typography>
                            <Typography variant="caption" sx={optionEmailSx}>{u.email}</Typography>
                        </Box>
                    </Box>
                );
            }}
            ListboxProps={{ sx: autocompleteListboxSx }}
            slotProps={{ paper: { sx: autocompletePaperSx } }}
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
    const dflt: PermissionSettings = { tab: "teams", everyoneRole: "viewer", users: [], groups: [], ownerUsers: [OWNER_USER] };

    // Main view state
    const [tab, setTab] = useState<PermissionTab>(initialSettings?.tab ?? "teams");
    const [everyoneRole, setEveryoneRole] = useState<EveryoneRole>(initialSettings?.everyoneRole ?? "viewer");
    const [users, setUsers] = useState<PermissionUser[]>(initialSettings?.users ?? []);
    const [groups, setGroups] = useState<PermissionGroup[]>(initialSettings?.groups ?? []);
    const [ownerUsers, setOwnerUsers] = useState<User[]>(initialSettings?.ownerUsers ?? [OWNER_USER]);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [menuTarget, setMenuTarget] = useState<"owner" | "everyone" | string | null>(null);
    const [showDiscard, setShowDiscard] = useState(false);

    // Add users/groups sub-view state
    const [addOpen, setAddOpen] = useState(false);
    const [addSelections, setAddSelections] = useState<AddOption[]>([]);
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
            setGroups(s.groups ?? []);
            setOwnerUsers(s.ownerUsers.length ? s.ownerUsers : [OWNER_USER]);
            setMenuAnchor(null);
            setMenuTarget(null);
            setShowDiscard(false);
            setAddOpen(false);
            setAddSelections([]);
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
    function sameGroups(a: PermissionGroup[], b: PermissionGroup[]) {
        if (a.length !== b.length) {
            return false;
        }
        return a.every((pg, i) => pg.group.id === b[i].group.id && pg.role === b[i].role);
    }
    const initS = initialSettings ?? dflt;
    const isDirty =
        tab !== initS.tab ||
        everyoneRole !== initS.everyoneRole ||
        !sameUsers(users, initS.users) ||
        !sameGroups(groups, initS.groups ?? []) ||
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
        onSave({ tab, everyoneRole, users, groups, ownerUsers });
    }

    function handleAdd() {
        if (addSelections.length === 0) {
            return;
        }
        const existingUserIds = new Set([OWNER_USER.id, ...users.map(pu => pu.user.id)]);
        const existingGroupIds = new Set(groups.map(pg => pg.group.id));

        const newUsers = addSelections
            .filter(s => s.kind === "user" && !existingUserIds.has((s.data as User).id))
            .map(s => ({ user: s.data as User, role: addRole }));
        const newGroups = addSelections
            .filter(s => s.kind === "group" && !existingGroupIds.has((s.data as UserGroup).id))
            .map(s => ({ group: s.data as UserGroup, role: addRole }));

        if (newUsers.length > 0) {
            setUsers(prev => [...prev, ...newUsers]);
        }
        if (newGroups.length > 0) {
            setGroups(prev => [...prev, ...newGroups]);
        }

        setAddOpen(false);
        setAddSelections([]);
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
    function changeGroupRole(groupId: string, role: UserRole) {
        setGroups(prev => prev.map(pg => pg.group.id === groupId ? { ...pg, role } : pg));
    }
    function removeGroup(groupId: string) {
        setGroups(prev => prev.filter(pg => pg.group.id !== groupId));
    }

    const menuUser = (menuTarget && menuTarget !== "owner" && menuTarget !== "everyone")
        ? (users.find(pu => pu.user.id === menuTarget) ?? null)
        : null;
    const menuGroup = (menuTarget && menuTarget !== "owner" && menuTarget !== "everyone" && !menuUser)
        ? (groups.find(pg => pg.group.id === menuTarget) ?? null)
        : null;

    const excludeIdsForAdd = [OWNER_USER.id, ...users.map(pu => pu.user.id)];
    const excludeGroupIdsForAdd = groups.map(pg => pg.group.id);

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={false}
                slotProps={{ paper: { sx: dialogPaperSx } }}
            >
                {/* ── Title ────────────────────────────────────────────────────────── */}
                <TruffleDialogTitle
                    CloseIconButtonProps={{ onClick: handleClose }}
                    HelpCenterIconButtonProps={{ onClick: () => {} }}
                >
                    <Box sx={dialogTitleBoxSx}>
                        {addOpen && (
                            <IconButton size="medium" onClick={() => setAddOpen(false)} sx={backButtonSx}>
                                <SvgIcon><FontAwesomeIcon icon={faArrowLeft} /></SvgIcon>
                            </IconButton>
                        )}
                        {addOpen ? "Add users or groups" : "Manage access"}
                    </Box>
                </TruffleDialogTitle>

                <Divider sx={dividerSx} />

                {/* ── Sliding content ───────────────────────────────────────────────── */}
                <DialogContent sx={dialogContentSx}>
                    <Box sx={{
                        display: "flex",
                        transform: addOpen ? "translateX(-50%)" : "translateX(0)",
                        transition: "transform 0.26s cubic-bezier(0.4,0,0.2,1)",
                        width: "200%"
                    }}>
                        {/* ── Panel 1: Manage access ──────────────────────────────────── */}
                        <Box sx={panelSx}>
                            {/* Tab selector */}
                            <TruffleToggleButtonGroup
                                value={tab}
                                exclusive
                                onChange={(_, v) => {
                                    if (v !== null) {
                                        setTab(v as PermissionTab);
                                    }
                                }}
                                variant="outlined"
                                sx={tabGroupSx}
                            >
                                <ToggleButton value="teams" color="primary" selected={tab === "teams"} onClick={() => setTab("teams")}>Teams and people</ToggleButton>
                                <ToggleButton value="private" color="primary" selected={tab === "private"} onClick={() => setTab("private")}>Only me</ToggleButton>
                            </TruffleToggleButtonGroup>

                            {/* Who can access */}
                            <Box>
                                <Typography variant="h5" sx={sectionTitleSx}>
                                    Who can access
                                </Typography>

                                <Box sx={accessListBoxSx}>
                                    {/* Owner row */}
                                    <PersonRow
                                        avatar={<TruffleAvatar text={OWNER_USER.initials} size="large" sx={ownerAvatarSx} />}
                                        name={`${OWNER_USER.name} (You)`}
                                        email={OWNER_USER.email}
                                        roleLabel={ownerRoleLabel}
                                        onRoleClick={e => openMenuFn(e, "owner")}
                                    />

                                    {/* Added groups — teams tab only */}
                                    {tab === "teams" && groups.map(pg => (
                                        <Box key={pg.group.id}>
                                            <Divider />
                                            <GroupRow
                                                group={pg.group}
                                                roleLabel={pg.role === "editor" ? "Can edit" : "Can view"}
                                                onRoleClick={e => openMenuFn(e, pg.group.id)}
                                            />
                                        </Box>
                                    ))}

                                    {/* Added users — teams tab only */}
                                    {tab === "teams" && users.map(pu => (
                                        <Box key={pu.user.id}>
                                            <Divider />
                                            <PersonRow
                                                avatar={<TruffleAvatar text={pu.user.initials} size="large" sx={{ bgcolor: pu.user.color, borderRadius: "8px", flexShrink: 0 }} />}
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
                                            <Box sx={personRowContainerSx}>
                                                <Box sx={everyoneIconBoxSx}>
                                                    <SvgIcon sx={everyoneIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
                                                </Box>
                                                <Box sx={flexMinWidthSx}>
                                                    <Typography variant="subtitle2" sx={everyoneNameSx}>
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
                                    <Alert severity="info" icon={<SvgIcon fontSize="small"><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>}
                                        sx={privateAlertSx}
                                    >
                                        {itemType === "folder"
                                            ? "Only you can view this folder’s media and all the folders inside it"
                                            : "Only you can view this media"}
                                    </Alert>
                                )}
                            </Box>
                        </Box>

                        {/* ── Panel 2: Add users or groups ────────────────────────────── */}
                        <Box sx={addUsersPanelSx}>
                            <AddUsersAutocomplete
                                value={addSelections}
                                onChange={setAddSelections}
                                excludeIds={excludeIdsForAdd}
                                excludeGroupIds={excludeGroupIdsForAdd}
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
                                            sx={checkboxSx}
                                        />
                                    }
                                    label="Allow to duplicate"
                                    sx={allowDuplicateLabelSx}
                                />
                            )}
                        </Box>
                    </Box>
                </DialogContent>

                <Divider sx={dividerSx} />

                {/* ── Actions ───────────────────────────────────────────────────────── */}
                <TruffleDialogActions sx={dialogActionsSx}>
                    {!addOpen ? (
                        <>
                            {tab === "teams" && (
                                <Button
                                    startIcon={<SvgIcon sx={addUserIconSx}><FontAwesomeIcon icon={faUserPlus} /></SvgIcon>}
                                    onClick={() => setAddOpen(true)}
                                    sx={addUserButtonSx}
                                >
                                    Add user and groups
                                </Button>
                            )}
                            <Box sx={flexSpacerSx} />
                            <Button variant="text" size="large" onClick={handleClose}>Cancel</Button>
                            <Button variant="contained" size="large" onClick={handleSave}>Save</Button>
                        </>
                    ) : (
                        <>
                            <FormControlLabel
                                control={<Checkbox checked={addNotify} onChange={e => setAddNotify(e.target.checked)} size="medium" />}
                                label="Notify via email"
                                sx={notifyLabelSx}
                            />
                            <Button variant="text" size="large" onClick={() => setAddOpen(false)}>Cancel</Button>
                            <Button variant="contained" size="large" disabled={addSelections.length === 0} onClick={handleAdd}>
                                Add
                            </Button>
                        </>
                    )}
                </TruffleDialogActions>

                {/* Role dropdown for main view */}
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={closeMenuFn}
                    PaperProps={{ sx: mainMenuPaperSx }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    {/* Owner menu */}
                    {menuTarget === "owner" && [
                        <TruffleMenuItem key="ol" selected disableRipple disabled>
                            {ownerRoleLabel}
                        </TruffleMenuItem>,
                        <TruffleMenuItem key="ms" onClick={closeMenuFn}>
                            Make sole owner
                        </TruffleMenuItem>,
                        <Divider key="d1" sx={menuDividerSx} />,
                        <TruffleMenuItem key="ro" disabled={ownerUsers.length <= 1} onClick={closeMenuFn} error>
                            Remove ownership
                        </TruffleMenuItem>
                    ]}

                    {/* Added user menu */}
                    {menuUser && [
                        <TruffleMenuItem key="ed" selected={menuUser.role === "editor"} onClick={() => {
                            changeUserRole(menuTarget as string, "editor"); closeMenuFn();
                        }}>
                            Can edit
                        </TruffleMenuItem>,
                        <TruffleMenuItem key="vi" selected={menuUser.role === "viewer"} onClick={() => {
                            changeUserRole(menuTarget as string, "viewer"); closeMenuFn();
                        }}>
                            Can view
                        </TruffleMenuItem>,
                        <Divider key="d1" sx={menuDividerSx} />,
                        <TruffleMenuItem key="to" onClick={closeMenuFn}>
                            Transfer ownership
                        </TruffleMenuItem>,
                        <Divider key="d2" sx={menuDividerSx} />,
                        <TruffleMenuItem key="rm" error onClick={() => {
                            removeUser(menuTarget as string); closeMenuFn();
                        }}>
                            Remove permission
                        </TruffleMenuItem>
                    ]}

                    {/* Added group menu */}
                    {menuGroup && [
                        <TruffleMenuItem key="ed" selected={menuGroup.role === "editor"} onClick={() => {
                            changeGroupRole(menuTarget as string, "editor"); closeMenuFn();
                        }}>
                            Can edit
                        </TruffleMenuItem>,
                        <TruffleMenuItem key="vi" selected={menuGroup.role === "viewer"} onClick={() => {
                            changeGroupRole(menuTarget as string, "viewer"); closeMenuFn();
                        }}>
                            Can view
                        </TruffleMenuItem>,
                        <Divider key="d1" sx={menuDividerSx} />,
                        <TruffleMenuItem key="rm" error onClick={() => {
                            removeGroup(menuTarget as string); closeMenuFn();
                        }}>
                            Remove permission
                        </TruffleMenuItem>
                    ]}

                    {/* Everyone menu */}
                    {menuTarget === "everyone" && [
                        <TruffleMenuItem key="ed" selected={everyoneRole === "editor"} onClick={() => {
                            setEveryoneRole("editor"); closeMenuFn();
                        }}>
                            Can edit
                        </TruffleMenuItem>,
                        <TruffleMenuItem key="vi" selected={everyoneRole === "viewer"} onClick={() => {
                            setEveryoneRole("viewer"); closeMenuFn();
                        }}>
                            Can view
                        </TruffleMenuItem>,
                        <Divider key="d1" sx={menuDividerSx} />,
                        <TruffleMenuItem key="re" selected={everyoneRole === "restricted"} onClick={() => {
                            setEveryoneRole("restricted"); closeMenuFn();
                        }}>
                            Restricted
                        </TruffleMenuItem>
                    ]}
                </Menu>

                {/* Role dropdown for add view */}
                <Menu
                    anchorEl={addRoleAnchor}
                    open={Boolean(addRoleAnchor)}
                    onClose={() => setAddRoleAnchor(null)}
                    PaperProps={{ sx: addRoleMenuPaperSx }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    <TruffleMenuItem selected={addRole === "editor"} onClick={() => {
                        setAddRole("editor"); setAddRoleAnchor(null);
                    }}>
                        Can edit
                    </TruffleMenuItem>
                    <TruffleMenuItem selected={addRole === "viewer"} onClick={() => {
                        setAddRole("viewer"); setAddRoleAnchor(null);
                    }}>
                        Can view
                    </TruffleMenuItem>
                </Menu>
            </Dialog>

            {/* Discard confirmation */}
            <Dialog open={showDiscard} onClose={() => setShowDiscard(false)} maxWidth="xs" fullWidth>
                <TruffleDialogTitle CloseIconButtonProps={{ onClick: () => setShowDiscard(false) }}>
                    Discard changes?
                </TruffleDialogTitle>
                <DialogContent sx={discardDialogContentSx}>
                    <Typography variant="body1" sx={discardBodyTextSx}>
                        All your changes will be lost and the permissions will remain unchanged.
                    </Typography>
                </DialogContent>
                <TruffleDialogActions>
                    <Button variant="text" onClick={() => setShowDiscard(false)}>Keep editing</Button>
                    <Button variant="contained" color="error" onClick={() => {
                        setShowDiscard(false); onClose();
                    }}>
                        Discard
                    </Button>
                </TruffleDialogActions>
            </Dialog>
        </>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const tooltipTitlePrimarySx: SxProps<Theme> = {
    fontWeight: 600,
    color: "common.white",
    lineHeight: 1.5,
    display: "block"
};

const popupIconSx: SxProps<Theme> = { fontSize: 18 };

const flexMinWidthSx: SxProps<Theme> = { flex: 1, minWidth: 0 };

const optionNameSx: SxProps<Theme> = { color: "text.primary", lineHeight: 1.4 };

const optionEmailSx: SxProps<Theme> = { color: "text.secondary", lineHeight: 1.3 };

const checkIconSx: SxProps<Theme> = { color: "primary.main", fontSize: 18, flexShrink: 0 };

const displayBlockSx: SxProps<Theme> = { display: "block" };

const autocompleteListboxSx: SxProps<Theme> = {
    p: "4px",
    maxHeight: 240,
    "& .MuiAutocomplete-option": { borderRadius: "6px" }
};

const autocompletePaperSx: SxProps<Theme> = { borderRadius: "8px", mt: "4px" };

const autocompleteGroupHeaderSx: SxProps<Theme> = {
    px: "12px",
    py: "6px",
    bgcolor: "grey.50",
    borderBottom: 1,
    borderColor: "divider"
};

const autocompleteGroupLabelSx: SxProps<Theme> = {
    color: "text.secondary",
    letterSpacing: "0.02em"
};

const groupIconBoxBaseSx: SxProps<Theme> = {
    borderRadius: "8px",
    bgcolor: "grey.100",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    cursor: "default"
};

const groupIconSx: SxProps<Theme> = { fontSize: 18, color: "text.secondary" };

const groupAvatarRowBoxSx: SxProps<Theme> = {
    width: 36,
    height: 36,
    borderRadius: "8px",
    bgcolor: "grey.100",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    cursor: "default"
};

const groupAvatarRowIconSx: SxProps<Theme> = { fontSize: 18, color: "text.secondary" };

const groupChipIconBoxSx: SxProps<Theme> = {
    width: 18,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    bgcolor: "grey.300",
    flexShrink: 0
};

const groupChipIconSx: SxProps<Theme> = { fontSize: 11, color: "text.secondary" };

const groupChipSx: SxProps<Theme> = {
    bgcolor: "grey.200",
    color: "text.primary",
    "& .MuiChip-deleteIcon": { color: "action.disabled", "&:hover": { color: "text.primary" } }
};

const groupOptionIconBoxSx: SxProps<Theme> = {
    width: 36,
    height: 36,
    borderRadius: "8px",
    bgcolor: "grey.100",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
};

const groupOptionIconSx: SxProps<Theme> = { fontSize: 18, color: "text.secondary" };

const roleButtonChevronIconSx: SxProps<Theme> = { fontSize: 12 };

const roleButtonChipSx: SxProps<Theme> = { flexShrink: 0, whiteSpace: "nowrap" };

const personRowContainerSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    px: "16px",
    py: "10px"
};

const personNameSx: SxProps<Theme> = { color: "text.primary", lineHeight: 1.3 };

const personEmailSx: SxProps<Theme> = { color: "text.secondary", lineHeight: 1.3 };

const addRoleAdornmentSx: SxProps<Theme> = { mr: "-2px", flexShrink: 0 };

const addRoleChevronIconSx: SxProps<Theme> = { fontSize: 14, ml: "-6px" };

const addRoleButtonSx: SxProps<Theme> = {
    color: "text.primary",
    bgcolor: "action.hover",
    borderRadius: "20px",
    px: "10px",
    py: "4px",
    minWidth: 0,
    whiteSpace: "nowrap",
    "&:hover": { bgcolor: "action.selected" }
};

const addUsersTextFieldSx: SxProps<Theme> = {
    "& .MuiOutlinedInput-root": { borderRadius: "8px", pr: "8px !important" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "grey.300" },
    "& .MuiInputBase-root": { flexWrap: "wrap", gap: "4px", p: "8px 12px" }
};

const optionRowSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    px: 1.5,
    py: 1
};

const dialogPaperSx: SxProps<Theme> = { width: 560, maxWidth: "98vw" };

const dialogTitleBoxSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "4px" };

const backButtonSx: SxProps<Theme> = { color: "action.active", ml: "-8px", mr: "4px" };

const dividerSx: SxProps<Theme> = { borderColor: "divider" };

const dialogContentSx: SxProps<Theme> = { p: 0, overflow: "hidden" };

const panelSx: SxProps<Theme> = {
    width: "50%",
    flexShrink: 0,
    p: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
};

const tabGroupSx: SxProps<Theme> = (theme) => ({
    alignSelf: "flex-start",
    "& .MuiToggleButton-root.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        color: theme.palette.primary.main
    }
});

const sectionTitleSx: SxProps<Theme> = { color: "text.primary", mb: "12px", display: "block" };

const accessListBoxSx: SxProps<Theme> = {
    border: 1,
    borderColor: "divider",
    borderRadius: "10px",
    overflow: "hidden"
};

const ownerAvatarSx: SxProps<Theme> = {
    bgcolor: OWNER_USER.color,
    borderRadius: "8px",
    flexShrink: 0
};

const everyoneIconBoxSx: SxProps<Theme> = {
    width: 36,
    height: 36,
    borderRadius: "8px",
    bgcolor: "primary.light",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
};

const everyoneIconSx: SxProps<Theme> = { fontSize: 20, color: "primary.main" };

const everyoneNameSx: SxProps<Theme> = { color: "text.primary" };

const privateAlertSx: SxProps<Theme> = {
    mt: 1.5,
    borderRadius: "8px",
    bgcolor: "primary.light",
    color: "text.primary",
    "& .MuiAlert-icon": { color: "primary.main" }
};

const addUsersPanelSx: SxProps<Theme> = {
    width: "50%",
    flexShrink: 0,
    p: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
};

const checkboxSx: SxProps<Theme> = { "&.Mui-checked": { color: "primary.main" } };

const allowDuplicateLabelSx: SxProps<Theme> = {
    ml: 0,
    "& .MuiFormControlLabel-label": { color: "text.primary" }
};

const dialogActionsSx: SxProps<Theme> = { justifyContent: "space-between" };

const addUserIconSx: SxProps<Theme> = { fontSize: 16 };

const addUserButtonSx: SxProps<Theme> = { color: "primary.main", p: "4px 8px" };

const flexSpacerSx: SxProps<Theme> = { flex: 1 };

const notifyLabelSx: SxProps<Theme> = { mr: "auto" };

const mainMenuPaperSx: SxProps<Theme> = {
    borderRadius: "10px",
    boxShadow: "0px 4px 20px rgba(3,25,79,0.18)",
    minWidth: 210,
    p: "4px"
};

const menuDividerSx: SxProps<Theme> = { my: "4px !important" };

const addRoleMenuPaperSx: SxProps<Theme> = {
    borderRadius: "10px",
    boxShadow: "0px 4px 20px rgba(3,25,79,0.18)",
    minWidth: 160,
    p: "4px"
};

const discardDialogContentSx: SxProps<Theme> = { p: "16px 20px" };

const discardBodyTextSx: SxProps<Theme> = { color: "text.secondary", lineHeight: 1.6 };
