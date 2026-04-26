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
    const PermIcon = tab === "private" ? faLock : faUsers;
    const permColor = tab === "private" ? "success.main" : "primary.main";

    const showEveryone = tab === "teams" && everyoneRole !== "restricted";
    const rightUsers = tab === "teams" && everyoneRole === "restricted" ? users : [];

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

    return (
        <Box sx={accessBarRootSx}>
            {/* Visible [icon] [label] ▾ */}
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

            {/* Avatar row */}
            <Box sx={avatarRowSx}>
                {ownerUsers.map(owner => (
                    <UserChip
                        key={owner.id}
                        bg={owner.color}
                        initials={owner.initials}
                        tip={<TipContent name={`${owner.name}${owner.id === OWNER_USER.id ? " (You)" : ""}`} desc="Can manage access, delete, and rename." />}
                    />
                ))}

                {(showEveryone || rightUsers.length > 0) && (
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
    return (
        <Box sx={personRowSx}>
            {avatar}
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
        <Box sx={addUsersRootSx}>
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
                    tagValue.map((user, index) => (
                        <Chip
                            {...getTagProps({ index })}
                            key={user.id}
                            label={user.name}
                            size="small"
                            avatar={<Avatar sx={chipAvatarSx}>{user.initials}</Avatar>}
                            sx={chipSx}
                        />
                    ))
                }
                renderOption={(props, option) => {
                    const { key, ...listProps } = props as typeof props & { key: string };
                    return (
                        <Box key={key} component="li" {...listProps} sx={optionRowSx}>
                            <Avatar variant="rounded" sx={optionAvatarSx}>
                                {option.initials}
                            </Avatar>
                            <Box sx={optionInfoSx}>
                                <Typography variant="subtitle2" sx={optionNameSx}>
                                    {option.name}
                                </Typography>
                                <Typography variant="caption" sx={optionEmailSx}>
                                    {option.email}
                                </Typography>
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
                <Button size="small" onClick={onCancel}
                    sx={cancelButtonSx}>
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
                                    setShowAddDialog(false); setAddUsers([]); setAddRoleAnchor(null); 
                                }}
                                sx={backIconButtonSx}
                            >
                                <SvgIcon><FontAwesomeIcon icon={faArrowLeft} /></SvgIcon>
                            </IconButton>
                            Add users
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
                            {/* Who can access label */}
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

                                {/* Only-me state: owner row is already shown above; show info row */}
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

                <Divider sx={dividerSx} />

                {/* ── Actions ────────────────────────────────────────────────────────── */}
                {!showAddDialog && (
                    <TruffleDialogActions sx={dialogActionsSx}>
                        {/* Left side: + Add user button */}
                        {tab === "teams" ? (
                            <Button
                                variant="text"
                                startIcon={<SvgIcon sx={addUserIconSx}><FontAwesomeIcon icon={faUserPlus} /></SvgIcon>}
                                onClick={() => setShowAddDialog(true)}
                            >
                                Add user
                            </Button>
                        ) : <Box />}

                        {/* Right side: Cancel and Save buttons */}
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

                {/* Role dropdown for add-user */}
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

                {/* Role dropdown menu (for existing user rows) */}
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

const userChipBoxSx: SxProps<Theme> = {
    width: 32, height: 32, borderRadius: "6px", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "default"
};

const userChipInitialsSx: SxProps<Theme> = {
    fontWeight: 600, color: "common.white", lineHeight: 1
};

const tipContentNameSx: SxProps<Theme> = {
    fontWeight: 600, color: "common.white", lineHeight: 1.4
};

const accessBarRootSx: SxProps<Theme> = {
    display: "flex", flexDirection: "column", gap: "10px"
};

const accessBarVisibleRowSx: SxProps<Theme> = {
    display: "flex", alignItems: "center", gap: "6px"
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
    display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap"
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
