import { useState, useEffect } from "react";
import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    Box, Typography, IconButton, Button, Dialog,
    DialogContent, SvgIcon,
    Avatar, Tooltip, Alert, Divider, Menu,
    ToggleButton,
    Autocomplete, TextField, Chip
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faUserPlus, faChevronDown, faCircleInfo, faCircleCheck, faCircleMinus, faEye, faArrowLeft } from "@fortawesome/pro-regular-svg-icons";
import { TruffleDialogTitle, TruffleDialogActions, TruffleToggleButtonGroup, TruffleMenuItem } from "@sundaysky/smartvideo-hub-truffle-component-library";

import {
    type User,
    type PermissionTab,
    type PermissionUser,
    type UserRole,
    type UserGroup,
    type PermissionGroup,
    OWNER_USER,
    ALL_USERS,
    ALL_GROUPS
} from "./ManageAccessDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AvatarUsagePermission = "everyone" | "specific" | "private"

export interface AccessRequest {
  id: string
  initials: string
  color: string
  name: string
  email: string
}

export interface AvatarPermissionSettings {
  usagePermission: AvatarUsagePermission
  specificUsers: User[]
  specificGroups: PermissionGroup[]
  approverUsers: User[]
  everyoneRole: "editor" | "viewer" | "restricted"
}

// ─── Add option union ─────────────────────────────────────────────────────────
type AddOption =
    | { kind: "user"; data: User }
    | { kind: "group"; data: UserGroup }

// ─── Internal helpers ─────────────────────────────────────────────────────────
function toTab(perm: AvatarUsagePermission): PermissionTab {
    return perm === "private" ? "private" : "teams";
}
function toEveryoneRestricted(perm: AvatarUsagePermission): boolean {
    return perm === "specific";
}
function toExternalPerm(tab: PermissionTab, restricted: boolean): AvatarUsagePermission {
    if (tab === "private") {
        return "private";
    }
    return restricted ? "specific" : "everyone";
}

function RoleButton({ label, onClick }: { label: string; onClick: (e: React.MouseEvent<HTMLElement>) => void }) {
    return (
        <Chip
            size="small"
            label={label}
            deleteIcon={<SvgIcon sx={{ fontSize: 12 }}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>}
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
  onRoleClick?: (e: React.MouseEvent<HTMLElement>) => void
}) {
    const tooltipContent = (
        <Box>
            <Typography variant="caption" sx={tipContentNameSx}>{name}</Typography>
            <Typography variant="caption" sx={{ color: (theme: Theme) => alpha(theme.palette.common.white, 0.85), lineHeight: 1.4 }}>
                {roleLabel.toLowerCase()}
            </Typography>
        </Box>
    );
    return (
        <Box sx={personRowSx}>
            <Tooltip title={tooltipContent} placement="bottom" arrow slotProps={{ tooltip: { sx: navyTooltipSx } }}>
                <Box sx={{ cursor: "default" }}>
                    {avatar}
                </Box>
            </Tooltip>
            <Box sx={personRowInnerSx}>
                <Typography variant="subtitle2" sx={personNameSx}>
                    {name}
                </Typography>
                <Typography variant="caption" sx={personEmailSx}>
                    {email}
                </Typography>
            </Box>
            {onRoleClick && <RoleButton label={roleLabel} onClick={onRoleClick} />}
        </Box>
    );
}

function GroupRow({
    group, roleLabel, onRoleClick
}: {
  group: UserGroup
  roleLabel: string
  onRoleClick?: (e: React.MouseEvent<HTMLElement>) => void
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
            <Tooltip title={groupTooltipContent} placement="bottom" arrow slotProps={{ tooltip: { sx: navyTooltipSx } }}>
                <Box sx={groupAvatarBoxSx}>
                    <SvgIcon sx={groupAvatarIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
                </Box>
            </Tooltip>
            <Box sx={personRowInnerSx}>
                <Typography variant="subtitle2" sx={personNameSx}>{group.name}</Typography>
                <Typography variant="caption" sx={personEmailSx}>{group.members.length} members</Typography>
            </Box>
            {onRoleClick && <RoleButton label={roleLabel} onClick={onRoleClick} />}
        </Box>
    );
}

// ─── Inline Add Avatar Users+Groups Autocomplete ──────────────────────────────
function InlineAddAvatarUsersGroups({
    value, onChange, excludeIds, excludeGroupIds
}: {
  value: AddOption[]
  onChange: (v: AddOption[]) => void
  excludeIds: string[]
  excludeGroupIds: string[]
}) {
    const userOptions: AddOption[] = ALL_USERS
        .filter(u => !excludeIds.includes(u.id))
        .map(u => ({ kind: "user", data: u }));
    const groupOptions: AddOption[] = ALL_GROUPS
        .filter(g => !excludeGroupIds.includes(g.id))
        .map(g => ({ kind: "group", data: g }));
    const options: AddOption[] = [...groupOptions, ...userOptions];

    return (
        <Box sx={addUsersContainerSx}>
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
                                avatar={<Avatar sx={tagAvatarSx}>{u.initials}</Avatar>}
                                sx={tagChipSx}
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
                                <Box sx={personRowInnerSx}>
                                    <Typography variant="subtitle2" sx={optionNameSx}>{g.name}</Typography>
                                    <Typography variant="caption" sx={personEmailSx}>{g.members.length} members</Typography>
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
                            <Box sx={personRowInnerSx}>
                                <Typography variant="subtitle2" sx={optionNameSx}>{u.name}</Typography>
                                <Typography variant="caption" sx={personEmailSx}>{u.email}</Typography>
                            </Box>
                        </Box>
                    );
                }}
                ListboxProps={{ sx: listboxSx }}
                slotProps={{ paper: { sx: autocompleteDropdownPaperSx } }}
            />
        </Box>
    );
}

// ─── AvatarPermissionDialog ───────────────────────────────────────────────────
export default function AvatarPermissionDialog({
    open,
    onClose,
    avatarName,
    initialSettings,
    initialRequests = [],
    onSave
}: {
  open: boolean
  onClose: () => void
  avatarName: string
  initialSettings?: AvatarPermissionSettings
  initialRequests?: AccessRequest[]
  onSave: (s: AvatarPermissionSettings, remaining: AccessRequest[]) => void
}) {
    const initPerm = initialSettings?.usagePermission ?? "everyone";

    const [tab, setTab] = useState<PermissionTab>(toTab(initPerm));
    const [restricted, setRestricted] = useState<boolean>(toEveryoneRestricted(initPerm));
    const [everyoneRole, setEveryoneRole] = useState<"editor" | "viewer" | "restricted">(initialSettings?.everyoneRole ?? "viewer");
    const [users, setUsers] = useState<PermissionUser[]>(
        (initialSettings?.specificUsers ?? []).map(u => ({ user: u, role: "viewer" as UserRole }))
    );
    const [groups, setGroups] = useState<PermissionGroup[]>(initialSettings?.specificGroups ?? []);
    const [ownerUsers, setOwnerUsers] = useState<User[]>(initialSettings?.approverUsers ?? [OWNER_USER]);
    const [requests, setRequests] = useState<AccessRequest[]>(initialRequests);
    const [showDiscard, setShowDiscard] = useState(false);
    const [showDenyAll, setShowDenyAll] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [menuTarget, setMenuTarget] = useState<"owner" | "everyone" | string | null>(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [addSelections, setAddSelections] = useState<AddOption[]>([]);

    useEffect(() => {
        if (open) {
            const perm = initialSettings?.usagePermission ?? "everyone";
            setTab(toTab(perm));
            setRestricted(toEveryoneRestricted(perm));
            setEveryoneRole(initialSettings?.everyoneRole ?? "viewer");
            setUsers((initialSettings?.specificUsers ?? []).map(u => ({ user: u, role: "viewer" as UserRole })));
            setGroups(initialSettings?.specificGroups ?? []);
            setOwnerUsers(initialSettings?.approverUsers ?? [OWNER_USER]);
            setRequests(initialRequests);
            setMenuAnchor(null);
            setMenuTarget(null);
            setShowDiscard(false);
            setShowDenyAll(false);
            setShowAddDialog(false);
            setAddSelections([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Auto-set restricted when specific users/groups are added
    useEffect(() => {
        if ((users.length > 0 || groups.length > 0) && !restricted && tab === "teams") {
            setRestricted(true);
        }
    }, [users.length, groups.length, restricted, tab]);

    function sameIds(a: User[], b: User[]) {
        if (a.length !== b.length) {
            return false;
        }
        const bs = new Set(b.map(u => u.id));
        return a.every(u => bs.has(u.id));
    }
    const externalPerm = toExternalPerm(tab, restricted);
    const initSp = initialSettings?.specificUsers ?? [];
    const initAp = initialSettings?.approverUsers ?? [OWNER_USER];
    const initGp = initialSettings?.specificGroups ?? [];
    const isDirty =
        externalPerm !== initPerm ||
        !sameIds(users.map(pu => pu.user), initSp) ||
        !sameIds(ownerUsers, initAp) ||
        groups.length !== initGp.length ||
        !groups.every((pg, i) => pg.group.id === initGp[i]?.group.id);

    function handleClose() {
        if (isDirty) {
            setShowDiscard(true); return; 
        }
        onClose();
    }
    function handleSave() {
        onSave({
            usagePermission: externalPerm,
            specificUsers:   users.map(pu => pu.user),
            specificGroups:  groups,
            approverUsers:   ownerUsers,
            everyoneRole:    everyoneRole
        }, requests);
    }

    function openMenuFn(e: React.MouseEvent<HTMLElement>, target: "owner" | "everyone" | string) {
        setMenuAnchor(e.currentTarget); setMenuTarget(target);
    }
    function closeMenuFn() {
        setMenuAnchor(null); setMenuTarget(null);
    }

    function removeUser(userId: string) {
        setUsers(prev => prev.filter(pu => pu.user.id !== userId));
    }
    function removeGroup(groupId: string) {
        setGroups(prev => prev.filter(pg => pg.group.id !== groupId));
    }

    function reqToUser(req: AccessRequest): User {
        return { id: req.id, name: req.name, initials: req.initials, color: req.color, email: req.email };
    }
    function handleApprove(req: AccessRequest) {
        const u = reqToUser(req);
        setUsers(prev => prev.find(pu => pu.user.id === u.id) ? prev : [...prev, { user: u, role: "viewer" }]);
        setRestricted(true);
        setRequests(prev => prev.filter(r => r.id !== req.id));
    }
    function handleDeny(req: AccessRequest) {
        setRequests(prev => prev.filter(r => r.id !== req.id));
    }
    function handleApproveAll() {
        const newUsers = requests.map(r => ({ user: reqToUser(r), role: "viewer" as UserRole }));
        setUsers(prev => {
            const existingIds = new Set(prev.map(pu => pu.user.id));
            return [...prev, ...newUsers.filter(pu => !existingIds.has(pu.user.id))];
        });
        setRestricted(true);
        setRequests([]);
    }
    function handleDenyAll() {
        setRequests([]); setShowDenyAll(false);
    }

    function handleAddAvatarUsersGroups() {
        if (addSelections.length === 0) {
            return;
        }
        const existingUserIds = new Set([OWNER_USER.id, ...users.map(pu => pu.user.id)]);
        const existingGroupIds = new Set(groups.map(pg => pg.group.id));

        const newUsers = addSelections
            .filter(s => s.kind === "user" && !existingUserIds.has((s.data as User).id))
            .map(s => ({ user: s.data as User, role: "viewer" as UserRole }));
        const newGroups = addSelections
            .filter(s => s.kind === "group" && !existingGroupIds.has((s.data as UserGroup).id))
            .map(s => ({ group: s.data as UserGroup, role: "viewer" as UserRole }));

        if (newUsers.length > 0) {
            setUsers(prev => [...prev, ...newUsers]);
        }
        if (newGroups.length > 0) {
            setGroups(prev => [...prev, ...newGroups]);
        }

        setShowAddDialog(false);
        setAddSelections([]);
    }

    const menuUser = (menuTarget && menuTarget !== "owner" && menuTarget !== "everyone")
        ? (users.find(pu => pu.user.id === menuTarget) ?? null)
        : null;
    const menuGroup = (menuTarget && menuTarget !== "owner" && menuTarget !== "everyone" && !menuUser)
        ? (groups.find(pg => pg.group.id === menuTarget) ?? null)
        : null;

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={false}
                PaperProps={{ sx: dialogPaperSx }}
            >
                {showAddDialog ? (
                    <TruffleDialogTitle CloseIconButtonProps={{ onClick: handleClose }}>
                        <Box sx={titleBackRowSx}>
                            <IconButton size="small" onClick={() => setShowAddDialog(false)} sx={backIconButtonSx}>
                                <SvgIcon><FontAwesomeIcon icon={faArrowLeft} /></SvgIcon>
                            </IconButton>
                            Add users or groups
                        </Box>
                    </TruffleDialogTitle>
                ) : (
                    <TruffleDialogTitle
                        HelpCenterIconButtonProps={{ onClick: () => {} }}
                        CloseIconButtonProps={{ onClick: handleClose }}
                    >
                        {`"${avatarName}" avatar usage access`}
                    </TruffleDialogTitle>
                )}

                <Divider sx={dividerSx} />

                <DialogContent sx={dialogContentSx}>
                    {showAddDialog ? (
                        <InlineAddAvatarUsersGroups
                            value={addSelections}
                            onChange={setAddSelections}
                            excludeIds={[OWNER_USER.id, ...users.map(pu => pu.user.id)]}
                            excludeGroupIds={groups.map(pg => pg.group.id)}
                        />
                    ) : (
                        <>
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
                                <ToggleButton value="teams" color="primary" selected={tab === "teams"} onClick={() => setTab("teams")} sx={toggleButtonSx}>Teams and people</ToggleButton>
                                <ToggleButton value="private" color="primary" selected={tab === "private"} onClick={() => setTab("private")} sx={toggleButtonSx}>Only me</ToggleButton>
                            </TruffleToggleButtonGroup>

                            {/* Who can access */}
                            <Box>
                                <Typography variant="h5" sx={sectionHeadingSx}>
                                    Who can use this avatar
                                </Typography>

                                <Box sx={userListBoxSx}>
                                    {/* Owner row */}
                                    <PersonRow
                                        avatar={
                                            <Avatar variant="rounded" sx={personAvatarSx}>
                                                {OWNER_USER.initials}
                                            </Avatar>
                                        }
                                        name={`${OWNER_USER.name} (You)`}
                                        email={OWNER_USER.email}
                                        roleLabel="Avatar owner"
                                        onRoleClick={tab === "teams" ? (e => openMenuFn(e, "owner")) : undefined}
                                    />

                                    {/* Added groups — teams tab only */}
                                    {tab === "teams" && groups.map(pg => (
                                        <Box key={pg.group.id}>
                                            <Divider />
                                            <GroupRow
                                                group={pg.group}
                                                roleLabel="Can use"
                                                onRoleClick={e => openMenuFn(e, pg.group.id)}
                                            />
                                        </Box>
                                    ))}

                                    {/* Added users — teams tab only */}
                                    {tab === "teams" && users.map(pu => (
                                        <Box key={pu.user.id}>
                                            <Divider />
                                            <PersonRow
                                                avatar={
                                                    <Avatar variant="rounded" sx={personAvatarSx}>
                                                        {pu.user.initials}
                                                    </Avatar>
                                                }
                                                name={pu.user.name}
                                                email={pu.user.email}
                                                roleLabel="Can use"
                                                onRoleClick={e => openMenuFn(e, pu.user.id)}
                                            />
                                        </Box>
                                    ))}

                                    {/* Everyone row — teams tab only */}
                                    {tab === "teams" && (
                                        <>
                                            <Divider />
                                            <Box sx={personRowSx}>
                                                <Box sx={everyoneIconContainerSx}>
                                                    <SvgIcon sx={everyoneIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon>
                                                </Box>
                                                <Box sx={personRowInnerSx}>
                                                    <Typography variant="subtitle2" sx={everyoneNameSx}>
                                                        Everyone in your account
                                                    </Typography>
                                                </Box>
                                                <RoleButton
                                                    label={everyoneRole === "editor" ? "Can use" : everyoneRole === "viewer" ? "Can view" : "Restricted"}
                                                    onClick={e => openMenuFn(e, "everyone")}
                                                />
                                            </Box>
                                        </>
                                    )}
                                </Box>

                                {/* Only me alert */}
                                {tab === "private" && (
                                    <Alert severity="info" icon={<SvgIcon><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>}
                                        sx={privateModeAlertSx}
                                    >
                                        Only you can use this avatar.
                                    </Alert>
                                )}

                                {/* Add user and groups */}
                                {tab === "teams" && (
                                    <Button
                                        startIcon={<SvgIcon sx={addUserIconSx}><FontAwesomeIcon icon={faUserPlus} /></SvgIcon>}
                                        onClick={() => setShowAddDialog(true)}
                                        sx={addUserButtonSx}
                                    >
                                        Add user and groups
                                    </Button>
                                )}
                            </Box>

                            {/* Access requests */}
                            <Box>
                                <Typography variant="h5" sx={sectionHeadingSx}>
                                    {`Users who requested to use this avatar (${requests.length})`}
                                </Typography>

                                {requests.length === 0 ? (
                                    <Box sx={emptyRequestsBoxSx}>
                                        <SvgIcon sx={emptyRequestsIconSx}><FontAwesomeIcon icon={faEye} /></SvgIcon>
                                        <Typography variant="caption" sx={emptyRequestsTextSx}>
                                            {tab === "private"
                                                ? "Only you can use this avatar. You'll see access requests here if the permission changes."
                                                : "You'll see user requests here when people ask to use this avatar"}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Box sx={requestsListBoxSx}>
                                            {requests.map((req, idx) => (
                                                <Box key={req.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.25, borderBottom: idx < requests.length - 1 ? 1 : 0, borderBottomColor: "divider", bgcolor: "background.paper" }}>
                                                    <Avatar sx={requestAvatarSx}>
                                                        {req.initials}
                                                    </Avatar>
                                                    <Box sx={personRowInnerSx}>
                                                        <Typography variant="caption" sx={requestNameSx}>{req.name}</Typography>
                                                        <Typography variant="caption" sx={personEmailSx}>{req.email}</Typography>
                                                    </Box>
                                                    <Tooltip title="Deny" placement="top" arrow slotProps={{ tooltip: { sx: navyTooltipSx } }}>
                                                        <IconButton size="small" onClick={() => handleDeny(req)} sx={denyIconButtonSx}>
                                                            <SvgIcon sx={requestActionIconSx}><FontAwesomeIcon icon={faCircleMinus} /></SvgIcon>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Approve" placement="top" arrow slotProps={{ tooltip: { sx: navyTooltipSx } }}>
                                                        <IconButton size="small" onClick={() => handleApprove(req)} sx={approveIconButtonSx}>
                                                            <SvgIcon sx={requestActionIconSx}><FontAwesomeIcon icon={faCircleCheck} /></SvgIcon>
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            ))}
                                        </Box>
                                        <Box sx={bulkActionsRowSx}>
                                            <Button variant="outlined" fullWidth size="small" onClick={() => setShowDenyAll(true)}
                                                sx={denyAllButtonSx}>
                                                Deny all
                                            </Button>
                                            <Button variant="outlined" fullWidth size="small" onClick={handleApproveAll}
                                                sx={allowAllButtonSx}>
                                                Allow all
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </>
                    )}
                </DialogContent>

                {showAddDialog ? (
                    <TruffleDialogActions>
                        <Button variant="outlined" color="primary" size="large" onClick={() => setShowAddDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" size="large" disabled={addSelections.length === 0} onClick={handleAddAvatarUsersGroups}>
                            Add
                        </Button>
                    </TruffleDialogActions>
                ) : (
                    <TruffleDialogActions>
                        <Button variant="outlined" color="primary" size="large" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" size="large" onClick={handleSave}>
                            Save
                        </Button>
                    </TruffleDialogActions>
                )}

                {/* Role dropdown menu */}
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={closeMenuFn}
                    PaperProps={{ sx: menuPaperSx }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    {menuTarget === "owner" && [
                        <TruffleMenuItem key="ol" selected disableRipple disabled>
                            Avatar owner
                        </TruffleMenuItem>,
                        <TruffleMenuItem key="ms" onClick={closeMenuFn}>
                            Make sole owner
                        </TruffleMenuItem>,
                        <Divider key="d1" sx={menuDividerSx} />,
                        <TruffleMenuItem key="ro" disabled={ownerUsers.length <= 1} onClick={closeMenuFn} error>
                            Remove ownership
                        </TruffleMenuItem>
                    ]}

                    {menuUser && [
                        <TruffleMenuItem key="cu" selected disableRipple disabled>
                            Can use
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

                    {menuGroup && [
                        <TruffleMenuItem key="cu" selected disableRipple disabled>
                            Can use
                        </TruffleMenuItem>,
                        <Divider key="d1" sx={menuDividerSx} />,
                        <TruffleMenuItem key="rm" error onClick={() => {
                            removeGroup(menuTarget as string); closeMenuFn();
                        }}>
                            Remove permission
                        </TruffleMenuItem>
                    ]}

                    {menuTarget === "everyone" && [
                        <TruffleMenuItem key="cu" selected={everyoneRole === "editor"} onClick={() => {
                            setEveryoneRole("editor"); closeMenuFn();
                        }}>
                            Can use
                        </TruffleMenuItem>,
                        <TruffleMenuItem key="cv" selected={everyoneRole === "viewer"} onClick={() => {
                            setEveryoneRole("viewer"); closeMenuFn();
                        }}>
                            Can view
                        </TruffleMenuItem>
                    ]}
                </Menu>
            </Dialog>

            {/* Discard confirmation */}
            <Dialog open={showDiscard} maxWidth="xs" fullWidth>
                <TruffleDialogTitle>Discard changes?</TruffleDialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={dialogBodyTextSx}>
                        All your changes will be lost. Are you sure?
                    </Typography>
                </DialogContent>
                <TruffleDialogActions>
                    <Button variant="outlined" color="primary" size="large" onClick={() => setShowDiscard(false)}>Stay</Button>
                    <Button variant="contained" color="error" size="large" onClick={() => {
                        setShowDiscard(false); onClose();
                    }}>
                        Leave
                    </Button>
                </TruffleDialogActions>
            </Dialog>

            {/* Deny all confirmation */}
            <Dialog open={showDenyAll} maxWidth="xs" fullWidth>
                <TruffleDialogTitle>Deny all {requests.length} requests?</TruffleDialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={dialogBodyTextSx}>
                        All pending access requests will be denied. This cannot be undone.
                    </Typography>
                </DialogContent>
                <TruffleDialogActions>
                    <Button variant="outlined" color="primary" size="large" onClick={() => setShowDenyAll(false)}>Cancel</Button>
                    <Button variant="contained" color="error" size="large" onClick={handleDenyAll}>
                        Deny all
                    </Button>
                </TruffleDialogActions>
            </Dialog>
        </>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const navyTooltipSx = {
    bgcolor: "secondary.main", borderRadius: "8px", px: 1.5, py: 1,
    "& .MuiTooltip-arrow": { color: "secondary.main" }
};

const groupTooltipTitleSx: SxProps<Theme> = {
    fontWeight: 600, color: "common.white", lineHeight: 1.5, display: "block"
};

const tipContentNameSx: SxProps<Theme> = {
    fontWeight: 600, color: "common.white", lineHeight: 1.4, display: "block"
};

const roleButtonChipSx: SxProps<Theme> = {
    flexShrink: 0, whiteSpace: "nowrap"
};

const personRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "12px", px: "16px", py: "10px"
};

const personAvatarSx: SxProps<Theme> = {
    width: 36, height: 36, bgcolor: "primary.light", color: "text.primary", flexShrink: 0
};

const requestAvatarSx: SxProps<Theme> = {
    width: 32, height: 32, bgcolor: "primary.light", color: "text.primary", flexShrink: 0
};

const personRowInnerSx: SxProps<Theme> = {
    flex: 1, minWidth: 0
};

const personNameSx: SxProps<Theme> = {
    color: "text.primary", lineHeight: 1.3
};

const personEmailSx: SxProps<Theme> = {
    color: "text.secondary", lineHeight: 1.3
};

const groupAvatarBoxSx: SxProps<Theme> = {
    width: 36, height: 36, borderRadius: "8px", bgcolor: "grey.100",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "default"
};

const groupAvatarIconSx: SxProps<Theme> = { fontSize: 18, color: "text.secondary" };

const addUsersContainerSx: SxProps<Theme> = {
    display: "flex", flexDirection: "column", gap: "8px"
};

const addUsersTextFieldSx: SxProps<Theme> = {
    "& .MuiOutlinedInput-root": { borderRadius: "8px", pr: "8px !important" },
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

const tagAvatarSx: SxProps<Theme> = {
    bgcolor: "primary.light", fontSize: "9px !important", color: "text.primary"
};

const tagChipSx: SxProps<Theme> = {
    bgcolor: "primary.light", color: "text.primary", borderRadius: "20px",
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
    width: 36, height: 36, bgcolor: "primary.light", flexShrink: 0, color: "text.primary"
};

const optionNameSx: SxProps<Theme> = {
    color: "text.primary", lineHeight: 1.4
};

const listboxSx: SxProps<Theme> = {
    p: "4px", maxHeight: 240,
    "& .MuiAutocomplete-option": { borderRadius: "6px", "&.Mui-focused": { bgcolor: "action.hover" } }
};

const autocompleteDropdownPaperSx: SxProps<Theme> = {
    borderRadius: "8px", boxShadow: "0px 0px 10px rgba(3,25,79,0.18)", mt: "4px"
};

const dialogPaperSx: SxProps<Theme> = {
    width: 560, maxWidth: "98vw", borderRadius: "12px"
};

const titleBackRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: 1
};

const backIconButtonSx: SxProps<Theme> = {
    color: "action.active"
};

const dividerSx: SxProps<Theme> = {
    borderColor: "divider"
};

const dialogContentSx: SxProps<Theme> = {
    p: "24px 28px", display: "flex", flexDirection: "column", gap: "20px"
};

const tabGroupSx: SxProps<Theme> = (theme) => ({
    width: "100%",
    "& .MuiToggleButton-root.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        color: theme.palette.primary.main
    }
});

const toggleButtonSx: SxProps<Theme> = {
    flex: 1
};

const sectionHeadingSx: SxProps<Theme> = {
    color: "text.primary", mb: "12px", display: "block"
};

const userListBoxSx: SxProps<Theme> = {
    border: 1, borderColor: "divider", borderRadius: "10px", overflow: "hidden"
};

const everyoneIconContainerSx: SxProps<Theme> = {
    width: 36, height: 36, borderRadius: "8px", bgcolor: "primary.light",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
};

const everyoneIconSx: SxProps<Theme> = {
    fontSize: 20, color: "primary.main"
};

const everyoneNameSx: SxProps<Theme> = {
    color: "text.primary"
};

const privateModeAlertSx: SxProps<Theme> = {
    mt: 1.5, borderRadius: "8px", bgcolor: "primary.light", color: "text.primary",
    "& .MuiAlert-icon": { color: "primary.main" }
};

const addUserIconSx: SxProps<Theme> = {
    fontSize: 16
};

const addUserButtonSx: SxProps<Theme> = {
    mt: "10px", color: "primary.main", p: "4px 8px", "&:hover": { bgcolor: "action.hover" }
};

const emptyRequestsBoxSx: SxProps<Theme> = {
    bgcolor: "action.hover", borderRadius: "8px", border: 1, borderColor: "divider",
    px: 2, py: 2.5, display: "flex", alignItems: "flex-start", gap: 1.5
};

const emptyRequestsIconSx: SxProps<Theme> = {
    fontSize: 18, color: "text.secondary", flexShrink: 0, mt: "1px"
};

const emptyRequestsTextSx: SxProps<Theme> = {
    color: "text.secondary", lineHeight: 1.5
};

const requestsListBoxSx: SxProps<Theme> = {
    border: 1, borderColor: "divider", borderRadius: "8px", overflow: "hidden"
};

const requestNameSx: SxProps<Theme> = {
    color: "text.primary", lineHeight: 1.3
};

const denyIconButtonSx: SxProps<Theme> = {
    color: "error.main", p: "4px", "&:hover": { bgcolor: "rgba(230,40,67,0.08)" }
};

const approveIconButtonSx: SxProps<Theme> = {
    color: "success.main", p: "4px", "&:hover": { bgcolor: "rgba(17,135,71,0.08)" }
};

const requestActionIconSx: SxProps<Theme> = {
    fontSize: 22
};

const bulkActionsRowSx: SxProps<Theme> = {
    display: "flex", gap: 1.5, mt: 1.5
};

const denyAllButtonSx: SxProps<Theme> = {
    color: "error.main", borderColor: "error.main", borderRadius: "8px",
    "&:hover": { bgcolor: "rgba(230,40,67,0.06)", borderColor: "error.main" }
};

const allowAllButtonSx: SxProps<Theme> = {
    color: "success.main", borderColor: "success.main", borderRadius: "8px",
    "&:hover": { bgcolor: "rgba(17,135,71,0.06)", borderColor: "success.main" }
};

const menuPaperSx: SxProps<Theme> = {
    borderRadius: "10px", boxShadow: "0px 4px 20px rgba(3,25,79,0.18)", minWidth: 210, p: "4px"
};

const menuDividerSx: SxProps<Theme> = {
    my: "4px !important"
};

const dialogBodyTextSx: SxProps<Theme> = {
    color: "text.secondary"
};
