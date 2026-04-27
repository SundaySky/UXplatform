import { useState, useEffect } from "react";
import {
    Dialog, DialogContent,
    Box, Typography, Button, IconButton, SvgIcon,
    Alert, Divider, Menu, MenuItem,
    ToggleButton, Checkbox, Tooltip,
    Autocomplete, TextField, Chip,
    InputAdornment
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faUserPlus, faChevronDown, faCircleInfo, faLock, faGear, faUserSlash, faArrowLeft } from "@fortawesome/pro-regular-svg-icons";
import { TruffleDialogTitle, TruffleDialogActions, TruffleMenuItem, TruffleToggleButtonGroup, NoOutlineSelect } from "@sundaysky/smartvideo-hub-truffle-component-library";

import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

import {
    type PermissionTab,
    type EveryoneRole,
    type UserRole,
    type PermissionUser,
    type PermissionGroup,
    type UserGroup,
    type User,
    OWNER_USER,
    ALL_USERS,
    ALL_GROUPS
} from "./ManageAccessDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
export type { PermissionTab, EveryoneRole, UserRole, PermissionUser };

export interface VideoPermissionSettings {
  tab: PermissionTab
  everyoneRole: EveryoneRole
  users: PermissionUser[]
  groups: PermissionGroup[]
  ownerUsers: User[]
  noDuplicate: boolean
}

// ─── Add option union ─────────────────────────────────────────────────────────
type AddOption =
    | { kind: "user"; data: User }
    | { kind: "group"; data: UserGroup }

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
        groups:       [] as PermissionGroup[],
        ownerUsers:   [OWNER_USER],
        noDuplicate:  false
    };
    const { tab, everyoneRole, users, groups, ownerUsers } = s;

    const permLabel = tab === "private" ? "Only me" : "Teams and people";
    const PermIcon = tab === "private" ? faLock : faUsers;
    const permColor = tab === "private" ? "success.main" : "primary.main";

    const showEveryone = tab === "teams" && everyoneRole !== "restricted";
    const restrictedMode = tab === "teams" && everyoneRole === "restricted";

    const UserChip = ({ bg, initials, tip }: { bg: string; initials: string; tip: React.ReactNode }) => (
        <Tooltip title={tip} placement="top" arrow slotProps={{ tooltip: { sx: navyTipSx } }}>
            <Box sx={{ ...userChipBoxSx, bgcolor: bg }}>
                <Typography variant="caption" sx={userChipInitialsSx}>
                    {initials}
                </Typography>
            </Box>
        </Tooltip>
    );

    const TipContent = ({ name, desc }: { name: string; desc: string }) => (
        <Box>
            <Typography variant="caption" sx={tipContentNameSx}>{name}</Typography>
            <Typography variant="caption" sx={{ color: (theme: Theme) => alpha(theme.palette.common.white, 0.85), lineHeight: 1.4 }}>{desc}</Typography>
        </Box>
    );

    const GroupChip = ({ group, desc }: { group: UserGroup; desc: string }) => {
        const tooltipContent = (
            <Box>
                <Typography variant="caption" sx={tipContentNameSx}>{group.name}</Typography>
                {group.members.map(m => (
                    <Typography key={m.id} variant="caption" sx={{ display: "block", color: (theme: Theme) => alpha(theme.palette.common.white, 0.8), lineHeight: 1.4 }}>
                        • {m.name}
                    </Typography>
                ))}
                <Typography variant="caption" sx={{ display: "block", color: (theme: Theme) => alpha(theme.palette.common.white, 0.55), lineHeight: 1.4, mt: 0.5 }}>
                    {desc}
                </Typography>
            </Box>
        );
        return (
            <Tooltip title={tooltipContent} placement="top" arrow slotProps={{ tooltip: { sx: navyTipSx } }}>
                <Box sx={groupChipBoxSx}>
                    <SvgIcon sx={groupChipIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
                </Box>
            </Tooltip>
        );
    };

    return (
        <Box sx={accessBarRootSx}>
            {/* Visible [icon] [label] ▾ + Avatar row */}
            <Box sx={accessBarHeaderRowSx}>
                <Box sx={accessBarVisibleRowSx}>
                    <Typography variant="caption" sx={accessBarVisibleLabelSx}>
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
                        <SvgIcon sx={{ fontSize: 15, color: permColor }}><FontAwesomeIcon icon={PermIcon} /></SvgIcon>
                        <Typography variant="caption" sx={accessBarPermLabelSx}>
                            {permLabel}
                        </Typography>
                        {onChangePermission && <SvgIcon sx={chevronSmallSx}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>}
                    </Box>
                </Box>

                {/* Avatar row - right side */}
                <Box sx={avatarRowSx}>
                    {ownerUsers.map(owner => (
                        <UserChip
                            key={owner.id}
                            bg={owner.color}
                            initials={owner.initials}
                            tip={<TipContent name={`${owner.name}${owner.id === OWNER_USER.id ? " (You)" : ""}`} desc="Can manage access, delete, and rename." />}
                        />
                    ))}

                    {(showEveryone || restrictedMode) && (
                        <Box sx={avatarDividerLineSx} />
                    )}

                    {showEveryone && (
                        <Tooltip
                            title={<Typography variant="caption" sx={everyoneTooltipTextSx}>Everyone in your account can {everyoneRole === "editor" ? "edit" : "view"}</Typography>}
                            placement="top" arrow slotProps={{ tooltip: { sx: navyTipSx } }}
                        >
                            <Box sx={everyoneChipBoxSx}>
                                <SvgIcon sx={everyoneChipIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
                            </Box>
                        </Tooltip>
                    )}

                    {restrictedMode && groups.map(pg => (
                        <GroupChip
                            key={pg.group.id}
                            group={pg.group}
                            desc={pg.role === "editor" ? "Group members can edit the video" : "Group members can view the video"}
                        />
                    ))}

                    {restrictedMode && users.map((pu, i) => (
                        <UserChip
                            key={pu.user.id + i}
                            bg={pu.user.color}
                            initials={pu.user.initials}
                            tip={<TipContent name={pu.user.name} desc={pu.role === "editor" ? "Can edit the video" : "Can view the video"} />}
                        />
                    ))}
                </Box>
            </Box>

            {/* Manage access button */}
            <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<SvgIcon sx={gearIconSx}><FontAwesomeIcon icon={faGear} /></SvgIcon>}
                onClick={onManageAccess}
                sx={manageAccessButtonSx}
            >
                Manage access
            </Button>
        </Box>
    );
}

// ─── RoleButton ───────────────────────────────────────────────────────────────
function RoleButton({ label, onClick }: { label: string; onClick: (e: React.MouseEvent<HTMLElement>) => void }) {
    return (
        <NoOutlineSelect
            size="small"
            value={label}
            open={false}
            onOpen={(e) => onClick(e as unknown as React.MouseEvent<HTMLElement>)}
            renderValue={() => label}
            onChange={() => {}}
            sx={roleButtonSx}
        >
            <MenuItem value={label}>{label}</MenuItem>
        </NoOutlineSelect>
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
    const tooltipContent = (
        <Box>
            <Typography variant="caption" sx={tipContentNameSx}>{name}</Typography>
            <Typography variant="caption" sx={{ color: (theme: Theme) => alpha(theme.palette.common.white, 0.85), lineHeight: 1.4 }}>
                {roleLabel.includes("own") ? "Can manage access, delete, and rename." : roleLabel.toLowerCase()}
            </Typography>
        </Box>
    );
    return (
        <Box sx={personRowSx}>
            <Tooltip title={tooltipContent} placement="bottom" arrow slotProps={{ tooltip: { sx: navyTipSxDialog } }}>
                <Box sx={{ cursor: "default" }}>
                    {avatar}
                </Box>
            </Tooltip>
            <Box sx={personRowInfoSx}>
                <Typography variant="subtitle2" sx={personRowNameSx}>
                    {name}
                </Typography>
                <Typography variant="caption" sx={personRowEmailSx}>
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
    const groupTooltipContent = (
        <Box>
            <Typography variant="caption" sx={groupTooltipTitleSx}>{group.name}</Typography>
            {group.members.map(m => (
                <Typography key={m.id} variant="caption" sx={{ display: "block", color: (theme: Theme) => alpha(theme.palette.common.white, 0.8), lineHeight: 1.5 }}>
                    • {m.name}
                </Typography>
            ))}
            <Typography variant="caption" sx={{ display: "block", color: (theme: Theme) => alpha(theme.palette.common.white, 0.55), lineHeight: 1.5, mt: 0.5 }}>
                {roleLabel.toLowerCase()} • Group members are managed by account owners
            </Typography>
        </Box>
    );
    return (
        <Box sx={personRowSx}>
            <Tooltip title={groupTooltipContent} placement="bottom" arrow slotProps={{ tooltip: { sx: navyTipSxDialog } }}>
                <Box sx={groupAvatarBoxSx}>
                    <SvgIcon sx={groupAvatarIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
                </Box>
            </Tooltip>
            <Box sx={personRowInfoSx}>
                <Typography variant="subtitle2" sx={personRowNameSx}>{group.name}</Typography>
                <Typography variant="caption" sx={personRowEmailSx}>{group.members.length} members</Typography>
            </Box>
            <RoleButton label={roleLabel} onClick={onRoleClick} />
        </Box>
    );
}

// ─── Inline Add Users+Groups Autocomplete ─────────────────────────────────────
function InlineAddUsersGroups({
    value, onChange, excludeIds, excludeGroupIds, addRole, onRoleClick, onCancel, onAdd, noDuplicate, onNoDuplicateChange, notifyEmail, onNotifyEmailChange
}: {
  value: AddOption[]
  onChange: (v: AddOption[]) => void
  excludeIds: string[]
  excludeGroupIds: string[]
  addRole: UserRole
  onRoleClick: (e: React.MouseEvent<HTMLElement>) => void
  onCancel: () => void
  onAdd: () => void
  noDuplicate?: boolean
  onNoDuplicateChange?: (v: boolean) => void
  notifyEmail?: boolean
  onNotifyEmailChange?: (v: boolean) => void
}) {
    const userOptions: AddOption[] = ALL_USERS
        .filter(u => !excludeIds.includes(u.id))
        .map(u => ({ kind: "user", data: u }));
    const groupOptions: AddOption[] = ALL_GROUPS
        .filter(g => !excludeGroupIds.includes(g.id))
        .map(g => ({ kind: "group", data: g }));
    const options: AddOption[] = [...groupOptions, ...userOptions];

    return (
        <Box sx={addUsersRootSx}>
            <Autocomplete<AddOption, true>
                multiple
                autoFocus
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
                        <Box sx={groupHeaderBoxSx}>
                            <Typography variant="subtitle2" sx={groupHeaderLabelSx}>
                                {params.group}
                            </Typography>
                        </Box>
                        {params.children}
                    </Box>
                )}
                renderInput={params => (
                    <TextField
                        {...params}
                        autoFocus
                        placeholder={value.length === 0 ? "Search users or groups…" : ""}
                        inputProps={{ ...params.inputProps, autoComplete: "new-password" }}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <InputAdornment position="end" sx={inputAdornmentSx}>
                                    <Button
                                        size="small"
                                        endIcon={<SvgIcon sx={roleButtonChevronSx}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>}
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
                        sx={autocompleteTextFieldSx}
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
                                        <Box sx={tagGroupIconBoxSx}>
                                            <SvgIcon sx={tagGroupIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
                                        </Box>
                                    }
                                    sx={groupTagChipSx}
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
                                avatar={<Avatar sx={chipAvatarSx}>{u.initials}</Avatar>}
                                sx={chipSx}
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
                                <Box sx={optionGroupIconBoxSx}>
                                    <SvgIcon sx={optionGroupIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
                                </Box>
                                <Box sx={optionInfoSx}>
                                    <Typography variant="subtitle2" sx={optionNameSx}>{g.name}</Typography>
                                    <Typography variant="caption" sx={optionEmailSx}>{g.members.length} members</Typography>
                                </Box>
                            </Box>
                        );
                    }
                    const u = option.data as User;
                    return (
                        <Box key={key} component="li" {...listProps} sx={optionRowSx}>
                            <Avatar variant="rounded" sx={optionAvatarSx}>
                                {u.initials}
                            </Avatar>
                            <Box sx={optionInfoSx}>
                                <Typography variant="subtitle2" sx={optionNameSx}>{u.name}</Typography>
                                <Typography variant="caption" sx={optionEmailSx}>{u.email}</Typography>
                            </Box>
                        </Box>
                    );
                }}
                ListboxProps={{ sx: listboxSx }}
                slotProps={{ paper: { sx: paperSx } }}
            />

            {/* Allow to duplicate checkbox - only for viewers */}
            {addRole === "viewer" && (
                <Box sx={checkboxWrapperSx}>
                    <Box sx={checkboxRowSx}>
                        <Checkbox
                            checked={!noDuplicate}
                            onChange={e => onNoDuplicateChange?.(e.target.checked ? false : true)}
                            size="small"
                            disableRipple
                            sx={checkboxSx}
                        />
                        <Typography variant="body1" sx={checkboxLabelSx}>
                            Allow to duplicate videos
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Notify via email checkbox */}
            <Box sx={checkboxWrapperSx}>
                <Box sx={checkboxRowSx}>
                    <Checkbox
                        checked={notifyEmail ?? false}
                        onChange={e => onNotifyEmailChange?.(e.target.checked)}
                        size="small"
                        disableRipple
                        sx={checkboxSx}
                    />
                    <Typography variant="body1" sx={checkboxLabelSx}>
                        Notify via email
                    </Typography>
                </Box>
            </Box>

            <Box sx={addUsersActionsRowSx}>
                <Button size="small" onClick={onCancel} sx={cancelButtonSx}>
                    Cancel
                </Button>
                <Button size="small" variant="contained" disabled={value.length === 0} onClick={onAdd}>
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
        tab: "teams", everyoneRole: "viewer", users: [], groups: [], ownerUsers: [OWNER_USER], noDuplicate: false
    };

    const [tab, setTab] = useState<PermissionTab>(initialSettings?.tab ?? "teams");
    const [everyoneRole, setEveryoneRole] = useState<EveryoneRole>(initialSettings?.everyoneRole ?? "viewer");
    const [users, setUsers] = useState<PermissionUser[]>(initialSettings?.users ?? []);
    const [groups, setGroups] = useState<PermissionGroup[]>(initialSettings?.groups ?? []);
    const [ownerUsers, setOwnerUsers] = useState<User[]>(initialSettings?.ownerUsers ?? [OWNER_USER]);
    const [noDuplicate, setNoDuplicate] = useState(initialSettings?.noDuplicate ?? false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [menuTarget, setMenuTarget] = useState<"owner" | "everyone" | string | null>(null);
    const [showDiscard, setShowDiscard] = useState(false);

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [addSelections, setAddSelections] = useState<AddOption[]>([]);
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
            setGroups(s.groups ?? []);
            setOwnerUsers(s.ownerUsers.length ? s.ownerUsers : [OWNER_USER]);
            setNoDuplicate(s.noDuplicate);
            setMenuAnchor(null);
            setMenuTarget(null);
            setShowDiscard(false);
            setShowAddDialog(false);
            setAddSelections([]);
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
        noDuplicate !== initS.noDuplicate ||
        !sameUsers(users, initS.users) ||
        !sameGroups(groups, initS.groups ?? []) ||
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
        onSave({ tab, everyoneRole, users, groups, ownerUsers, noDuplicate });
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

        setShowAddDialog(false);
        setAddSelections([]);
        setAddRole("editor");
    }

    const excludeIdsForAdd = [OWNER_USER.id, ...users.map(pu => pu.user.id)];
    const excludeGroupIdsForAdd = groups.map(pg => pg.group.id);

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

    const EveryoneIcon = everyoneRole === "restricted" ? faUserSlash : faUsers;

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={false}
                onClick={e => e.stopPropagation()}
                PaperProps={{ sx: dialogPaperSx }}
            >
                {/* ── Title ─────────────────────────────────────────────────────────── */}
                {!showAddDialog ? (
                    <TruffleDialogTitle
                        HelpCenterIconButtonProps={{ onClick: () => {} }}
                        CloseIconButtonProps={{ onClick: handleClose }}
                    >
                        Manage video access
                    </TruffleDialogTitle>
                ) : (
                    <TruffleDialogTitle CloseIconButtonProps={{ onClick: handleClose }}>
                        <Box sx={addDialogTitleRowSx}>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setShowAddDialog(false); setAddSelections([]); setAddRoleAnchor(null);
                                }}
                                sx={backIconButtonSx}
                            >
                                <SvgIcon><FontAwesomeIcon icon={faArrowLeft} /></SvgIcon>
                            </IconButton>
                            Add users or groups
                        </Box>
                    </TruffleDialogTitle>
                )}

                <Divider sx={dividerSx} />

                {/* ── Content ────────────────────────────────────────────────────────── */}
                {!showAddDialog ? (
                    <DialogContent sx={mainDialogContentSx}>
                        {/* Tab selector */}
                        <TruffleToggleButtonGroup
                            variant="outlined"
                            exclusive
                            value={tab}
                            sx={toggleButtonGroupSx}
                        >
                            <ToggleButton value="teams" color="primary" selected={tab === "teams"} onClick={() => setTab("teams")} sx={toggleButtonSx}>
                                <SvgIcon sx={toggleButtonIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
                                Teams and people
                            </ToggleButton>
                            <ToggleButton value="private" color="primary" selected={tab === "private"} onClick={() => setTab("private")} sx={toggleButtonSx}>
                                <SvgIcon sx={toggleButtonIconSx}><FontAwesomeIcon icon={faLock} /></SvgIcon>
                                Only me
                            </ToggleButton>
                        </TruffleToggleButtonGroup>

                        {/* Access list */}
                        <Box sx={accessListSx}>
                            <Typography variant="h5" sx={whoCanAccessLabelSx}>
                                Who can access
                            </Typography>

                            <Box sx={accessListBorderSx}>
                                {/* Owner row */}
                                <PersonRow
                                    avatar={
                                        <Avatar variant="rounded" sx={personAvatarSx}>
                                            {OWNER_USER.initials}
                                        </Avatar>
                                    }
                                    name={`${OWNER_USER.name} (You)`}
                                    email={OWNER_USER.email}
                                    roleLabel="Video owner"
                                    onRoleClick={tab === "teams" ? e => openMenuFn(e, "owner") : () => {}}
                                />

                                {/* Group rows — only when teams tab */}
                                {tab === "teams" && groups.map(pg => (
                                    <Box key={pg.group.id}>
                                        <Divider sx={greyDividerSx} />
                                        <GroupRow
                                            group={pg.group}
                                            roleLabel={pg.role === "editor" ? "Can edit" : "Can view"}
                                            onRoleClick={e => openMenuFn(e, pg.group.id)}
                                        />
                                    </Box>
                                ))}

                                {/* Specific users — only when teams tab */}
                                {tab === "teams" && users.map(pu => (
                                    <Box key={pu.user.id}>
                                        <Divider sx={greyDividerSx} />
                                        <PersonRow
                                            avatar={
                                                <Avatar variant="rounded" sx={personAvatarSx}>
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
                                        <Divider sx={greyDividerSx} />
                                        <Box sx={everyoneRowSx}>
                                            <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: everyoneRole === "restricted" ? "action.hover" : "divider", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <SvgIcon sx={{ fontSize: 20, color: everyoneRole === "restricted" ? "text.secondary" : "text.primary" }}><FontAwesomeIcon icon={EveryoneIcon} /></SvgIcon>
                                            </Box>
                                            <Box sx={everyoneRowInfoSx}>
                                                <Typography variant="subtitle2" sx={everyoneRowNameSx}>
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

                                {/* Only-me state */}
                                {tab === "private" && (
                                    <>
                                        <Divider sx={greyDividerSx} />
                                        <Box sx={privateAlertWrapperSx}>
                                            <Alert
                                                severity="info"
                                                icon={<SvgIcon><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>}
                                                sx={privateAlertSx}
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
                    <DialogContent sx={addDialogContentSx}>
                        <InlineAddUsersGroups
                            value={addSelections}
                            onChange={setAddSelections}
                            excludeIds={excludeIdsForAdd}
                            excludeGroupIds={excludeGroupIdsForAdd}
                            addRole={addRole}
                            onRoleClick={e => setAddRoleAnchor(e.currentTarget)}
                            onCancel={() => {
                                setShowAddDialog(false); setAddSelections([]); setAddRoleAnchor(null); setAddNoDuplicate(false); setNotifyViaEmail(true);
                            }}
                            onAdd={handleAdd}
                            noDuplicate={addNoDuplicate}
                            onNoDuplicateChange={setAddNoDuplicate}
                            notifyEmail={notifyViaEmail}
                            onNotifyEmailChange={setNotifyViaEmail}
                        />
                    </DialogContent>
                )}

                <Divider sx={dividerSx} />

                {/* ── Actions ────────────────────────────────────────────────────────── */}
                {!showAddDialog && (
                    <TruffleDialogActions sx={dialogActionsSx}>
                        {tab === "teams" ? (
                            <Button
                                variant="text"
                                startIcon={<SvgIcon sx={addUserIconSx}><FontAwesomeIcon icon={faUserPlus} /></SvgIcon>}
                                onClick={() => setShowAddDialog(true)}
                            >
                                Add user and groups
                            </Button>
                        ) : <Box />}

                        <Box sx={dialogActionsRightSx}>
                            <Button variant="outlined" color="primary" size="large" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="primary" size="large" onClick={handleSave}>
                                Save
                            </Button>
                        </Box>
                    </TruffleDialogActions>
                )}

                {/* Role dropdown for add */}
                <Menu
                    anchorEl={addRoleAnchor}
                    open={Boolean(addRoleAnchor)}
                    onClose={() => setAddRoleAnchor(null)}
                    PaperProps={{ sx: menuPaperSx }}
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

                {/* Role dropdown menu for existing rows */}
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={closeMenuFn}
                    PaperProps={{ sx: menuPaperWideSx }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    {/* Owner menu */}
                    {menuTarget === "owner" && [
                        <TruffleMenuItem key="ol" selected disableRipple disabled>
                            Video owner
                        </TruffleMenuItem>,
                        <TruffleMenuItem key="ms" onClick={closeMenuFn}>
                            Make sole owner
                        </TruffleMenuItem>,
                        <Divider key="d1" sx={menuDividerSx} />,
                        <TruffleMenuItem key="ro" disabled={ownerUsers.length <= 1} onClick={closeMenuFn} error>
                            {ownerUsers.length <= 1 ? "Transfer ownership" : "Remove ownership"}
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
                        ...(menuUser?.role === "viewer" ? [
                            <TruffleMenuItem key="dup" onClick={() => setNoDuplicate(prev => !prev)} sx={menuItemWithCheckboxSx}>
                                <Checkbox checked={!noDuplicate} size="small" disableRipple sx={checkboxSx} />
                                Allow to duplicate
                            </TruffleMenuItem>,
                            <Divider key="d-dup" sx={menuDividerSx} />
                        ] : []),
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
                        ...(everyoneRole === "viewer" ? [
                            <TruffleMenuItem key="dup" onClick={() => setNoDuplicate(prev => !prev)} sx={menuItemWithCheckboxSx}>
                                <Checkbox checked={!noDuplicate} size="small" disableRipple sx={checkboxSx} />
                                Allow to duplicate
                            </TruffleMenuItem>,
                            <Divider key="d-dup" sx={menuDividerSx} />
                        ] : []),
                        <TruffleMenuItem key="re" selected={everyoneRole === "restricted"} onClick={() => {
                            setEveryoneRole("restricted"); closeMenuFn();
                        }}>
                            Restricted
                        </TruffleMenuItem>
                    ]}
                </Menu>
            </Dialog>

            {/* Discard confirmation */}
            <Dialog open={showDiscard} onClose={() => setShowDiscard(false)} maxWidth="xs" fullWidth>
                <TruffleDialogTitle>
                    Discard changes?
                </TruffleDialogTitle>
                <DialogContent sx={discardDialogContentSx}>
                    <Typography variant="body1" sx={discardDialogTextSx}>
                        All your changes will be lost and the permissions will remain unchanged.
                    </Typography>
                </DialogContent>
                <TruffleDialogActions>
                    <Button variant="outlined" color="primary" size="large" onClick={() => setShowDiscard(false)}>
                        Keep editing
                    </Button>
                    <Button variant="contained" color="error" size="large" onClick={() => {
                        setShowDiscard(false); onClose();
                    }}>
                        Discard
                    </Button>
                </TruffleDialogActions>
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

const navyTipSxDialog: SxProps<Theme> = {
    bgcolor: "secondary.main",
    borderRadius: "8px",
    px: 1.5, py: 1,
    maxWidth: 260,
    "& .MuiTooltip-arrow": { color: "secondary.main" }
};

const groupTooltipTitleSx: SxProps<Theme> = {
    fontWeight: 600, color: "common.white", lineHeight: 1.5, display: "block"
};

const userChipBoxSx: SxProps<Theme> = {
    width: 32, height: 32, borderRadius: "6px", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "default"
};

const userChipInitialsSx: SxProps<Theme> = {
    fontWeight: 600, color: "common.white", lineHeight: 1
};

const tipContentNameSx: SxProps<Theme> = {
    fontWeight: 600, color: "common.white", lineHeight: 1.4, display: "block"
};

const groupChipBoxSx: SxProps<Theme> = {
    width: 32, height: 32, borderRadius: "6px", bgcolor: "grey.200",
    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default"
};

const groupChipIconSx: SxProps<Theme> = {
    fontSize: 16, color: "text.secondary"
};

const accessBarRootSx: SxProps<Theme> = {
    display: "flex", flexDirection: "column", gap: "10px"
};

const accessBarHeaderRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px"
};

const accessBarVisibleRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "6px", flex: 1
};

const accessBarVisibleLabelSx: SxProps<Theme> = {
    fontWeight: 500, color: "text.primary"
};

const accessBarPermLabelSx: SxProps<Theme> = {
    fontWeight: 600, color: "text.primary"
};

const chevronSmallSx: SxProps<Theme> = {
    fontSize: 14, color: "text.primary"
};

const avatarRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "6px", flexShrink: 0
};

const avatarDividerLineSx: SxProps<Theme> = {
    width: "1px", height: 24, bgcolor: "grey.300", mx: "2px", flexShrink: 0
};

const everyoneTooltipTextSx: SxProps<Theme> = {
    color: "common.white", lineHeight: 1.4
};

const everyoneChipBoxSx: SxProps<Theme> = {
    width: 32, height: 32, borderRadius: "6px", bgcolor: "primary.light",
    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default"
};

const everyoneChipIconSx: SxProps<Theme> = {
    fontSize: 18, color: "primary.main"
};

const gearIconSx: SxProps<Theme> = {
    fontSize: 15
};

const manageAccessButtonSx: SxProps<Theme> = {
    borderColor: "grey.300",
    color: "text.primary",
    py: "6px",
    "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" }
};

const roleButtonChevronSx: SxProps<Theme> = {
    fontSize: "12px !important"
};

const roleButtonSx: SxProps<Theme> = {
    flexShrink: 0,
    whiteSpace: "nowrap",
    "& .MuiInputBase-root": {
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        "&:hover": { borderColor: "text.secondary" }
    }
};

const personRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "12px", px: "16px", py: "10px"
};

const personRowInfoSx: SxProps<Theme> = {
    flex: 1, minWidth: 0
};

const personRowNameSx: SxProps<Theme> = {
    color: "text.primary", lineHeight: 1.3
};

const personRowEmailSx: SxProps<Theme> = {
    color: "text.secondary", lineHeight: 1.3
};

const groupAvatarBoxSx: SxProps<Theme> = {
    width: 36, height: 36, borderRadius: "8px", bgcolor: "grey.100",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "default"
};

const groupAvatarIconSx: SxProps<Theme> = { fontSize: 18, color: "text.secondary" };

const addUsersRootSx: SxProps<Theme> = {
    display: "flex", flexDirection: "column", gap: "8px"
};

const inputAdornmentSx: SxProps<Theme> = {
    mr: "-2px", flexShrink: 0
};

const addRoleButtonSx: SxProps<Theme> = {
    color: "text.primary",
    bgcolor: "background.paper",
    border: 1,
    borderColor: "grey.300",
    px: "10px", py: "4px",
    minWidth: 0, whiteSpace: "nowrap",
    "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" }
};

const autocompleteTextFieldSx: SxProps<Theme> = {
    "& .MuiOutlinedInput-root": { pr: "8px !important" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "grey.300" },
    "& .MuiInputBase-root": { flexWrap: "wrap", gap: "4px", p: "8px 12px" }
};

const groupHeaderBoxSx: SxProps<Theme> = {
    px: "12px", py: "6px", bgcolor: "grey.50", borderBottom: 1, borderColor: "divider"
};

const groupHeaderLabelSx: SxProps<Theme> = {
    color: "text.secondary", letterSpacing: "0.02em"
};

const tagGroupIconBoxSx: SxProps<Theme> = {
    width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "4px", bgcolor: "grey.300", flexShrink: 0
};

const tagGroupIconSx: SxProps<Theme> = { fontSize: 11, color: "text.secondary" };

const groupTagChipSx: SxProps<Theme> = {
    bgcolor: "grey.100", color: "text.primary", height: 28,
    "& .MuiChip-label": { px: "8px" },
    "& .MuiChip-icon": { ml: "4px" },
    "& .MuiChip-deleteIcon": { color: "text.secondary", mr: "4px", "&:hover": { color: "text.primary" } }
};

const chipAvatarSx: SxProps<Theme> = {
    bgcolor: "divider", fontSize: "9px !important", fontWeight: 600, color: "text.primary"
};

const chipSx: SxProps<Theme> = {
    bgcolor: "divider", color: "text.primary", borderRadius: "20px",
    "& .MuiChip-label": { px: "6px" },
    "& .MuiChip-deleteIcon": { color: "action.disabled", "&:hover": { color: "text.primary" } },
    height: 24
};

const optionRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1
};

const optionGroupIconBoxSx: SxProps<Theme> = {
    width: 36, height: 36, borderRadius: "8px", bgcolor: "grey.100", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center"
};

const optionGroupIconSx: SxProps<Theme> = { fontSize: 18, color: "text.secondary" };

const optionAvatarSx: SxProps<Theme> = {
    width: 36, height: 36, bgcolor: "divider", flexShrink: 0, color: "text.primary"
};

const optionInfoSx: SxProps<Theme> = {
    flex: 1, minWidth: 0
};

const optionNameSx: SxProps<Theme> = {
    color: "text.primary", lineHeight: 1.4
};

const optionEmailSx: SxProps<Theme> = {
    color: "text.secondary", lineHeight: 1.3
};

const listboxSx: SxProps<Theme> = {
    p: "4px", maxHeight: 240,
    "& .MuiAutocomplete-option": { borderRadius: "6px", "&.Mui-focused": { bgcolor: "action.hover" } }
};

const paperSx: SxProps<Theme> = {
    borderRadius: "8px", boxShadow: "0px 0px 10px rgba(3,25,79,0.18)", mt: "4px"
};

const checkboxWrapperSx: SxProps<Theme> = {
    mt: "16px"
};

const checkboxRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: 1
};

const checkboxSx: SxProps<Theme> = {
    p: 0, "&.Mui-checked": { color: "primary.main" }
};

const checkboxLabelSx: SxProps<Theme> = {
    color: "text.primary"
};

const addUsersActionsRowSx: SxProps<Theme> = {
    display: "flex", gap: "8px", justifyContent: "flex-end", mt: "20px"
};

const cancelButtonSx: SxProps<Theme> = {
    color: "text.secondary"
};

const dialogPaperSx: SxProps<Theme> = {
    width: 560, maxWidth: "98vw", borderRadius: "12px", overflow: "hidden"
};

const addDialogTitleRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: 1
};

const backIconButtonSx: SxProps<Theme> = {
    color: "action.active"
};

const dividerSx: SxProps<Theme> = {
    borderColor: "divider"
};

const mainDialogContentSx: SxProps<Theme> = {
    p: "24px 28px", display: "flex", flexDirection: "column", gap: "20px"
};

const toggleButtonGroupSx: SxProps<Theme> = (theme) => ({
    width: "100%",
    "& .MuiToggleButton-root.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        color: theme.palette.primary.main
    }
});

const toggleButtonSx: SxProps<Theme> = {
    flex: 1, gap: "6px"
};

const toggleButtonIconSx: SxProps<Theme> = {
    fontSize: 14
};

const accessListSx: SxProps<Theme> = {
    display: "flex", flexDirection: "column", gap: "16px"
};

const whoCanAccessLabelSx: SxProps<Theme> = {
    color: "text.secondary", letterSpacing: "0.02em"
};

const accessListBorderSx: SxProps<Theme> = {
    border: 1, borderColor: "grey.300", borderRadius: "10px", overflow: "hidden"
};

const personAvatarSx: SxProps<Theme> = {
    width: 36, height: 36, bgcolor: "divider", flexShrink: 0, color: "text.primary"
};

const greyDividerSx: SxProps<Theme> = {
    borderColor: "grey.300"
};

const everyoneRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "12px", px: "16px", py: "10px"
};

const everyoneRowInfoSx: SxProps<Theme> = {
    flex: 1, minWidth: 0
};

const everyoneRowNameSx: SxProps<Theme> = {
    color: "text.primary"
};

const privateAlertWrapperSx: SxProps<Theme> = {
    px: "16px", py: "10px"
};

const privateAlertSx: SxProps<Theme> = {
    bgcolor: "primary.light",
    color: "text.primary",
    p: "6px 12px"
};

const addDialogContentSx: SxProps<Theme> = {
    p: "24px 28px", display: "flex", flexDirection: "column"
};

const dialogActionsSx: SxProps<Theme> = {
    justifyContent: "space-between"
};

const addUserIconSx: SxProps<Theme> = {
    fontSize: 16
};

const dialogActionsRightSx: SxProps<Theme> = {
    display: "flex", gap: 1
};

const menuPaperSx: SxProps<Theme> = {
    borderRadius: "10px", boxShadow: "0px 4px 20px rgba(3,25,79,0.18)", minWidth: 160, p: "4px"
};

const menuPaperWideSx: SxProps<Theme> = {
    borderRadius: "10px", boxShadow: "0px 4px 20px rgba(3,25,79,0.18)", minWidth: 230, p: "4px"
};

const menuDividerSx: SxProps<Theme> = {
    my: "4px !important"
};

const menuItemWithCheckboxSx: SxProps<Theme> = {
    gap: 1
};

const discardDialogContentSx: SxProps<Theme> = {
    p: "16px 20px"
};

const discardDialogTextSx: SxProps<Theme> = {
    color: "text.secondary", lineHeight: 1.6
};
