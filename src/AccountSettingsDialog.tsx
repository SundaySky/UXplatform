import React, { useState, useMemo } from "react";
import type { SxProps, Theme } from "@mui/material";
import {
    Box, Typography, Dialog, DialogContent, IconButton, SvgIcon,
    Button, OutlinedInput, Tabs, Tab, Popover,
    Table, TableBody, TableCell, TableHead, TableRow,
    Tooltip, Switch, Divider, Chip, Select,
    MenuItem, Menu, List, ListItemButton, ListItemIcon, ListItemText,
    Autocomplete, TextField
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faArrowDown, faCircleInfo, faUsers, faLock, faCircleCheck, faStamp, faPenToSquare, faTrash, faEllipsis, faXmark, faLayerGroup, faChevronDown, faCheck, faPeopleGroup, faWandMagicSparkles } from "@fortawesome/pro-regular-svg-icons";
import { AttentionBox, AttentionBoxContent, TruffleAvatar, Search, Label, TruffleDialogTitle, TruffleDialogActions } from "@sundaysky/smartvideo-hub-truffle-component-library";

import { ALL_USERS, OWNER_USER } from "./dialogs/ManageAccessDialog";
import type { UserRole, AppVersion } from "./components/TasksPanel";


// ─── Types & mock data ────────────────────────────────────────────────────────
interface AccountUser {
 user: typeof OWNER_USER
 isOwner?: boolean
 createSpace: string
 amplifySpace: string
 jobRole: string
 lastLogin: string
 createdDate: string
 pending?: boolean
 addedAsApprover?: string
}

export const INITIAL_USERS: AccountUser[] = [
    { user: OWNER_USER, isOwner: true, createSpace: "Account owner", amplifySpace: "Contributor", jobRole: "Integrator", lastLogin: "Sep 8, 2022, 10:23 am", createdDate: "Sep 8, 2022, 10:23 am" },
    { user: ALL_USERS[1], createSpace: "Editor", amplifySpace: "Contributor", jobRole: "Data Analyst", lastLogin: "Sep 8, 2022, 10:23 am", createdDate: "Sep 8, 2022, 10:23 am" },
    { user: ALL_USERS[2], createSpace: "Approver", amplifySpace: "No access", jobRole: "Marketing", lastLogin: "Sep 8, 2022, 10:23 am", createdDate: "Sep 8, 2022, 10:23 am" },
    { user: ALL_USERS[3], createSpace: "No access", amplifySpace: "Contributor", jobRole: "Creative Agency", lastLogin: "Sep 8, 2022, 10:23 am", createdDate: "Sep 8, 2022, 10:23 am" },
    { user: ALL_USERS[4], createSpace: "Viewer", amplifySpace: "No access", jobRole: "Marketing", lastLogin: "Sep 8, 2022, 10:23 am", createdDate: "Sep 8, 2022, 10:23 am" },
    { user: ALL_USERS[5], createSpace: "Editor", amplifySpace: "Contributor", jobRole: "Marketing", lastLogin: "Sep 8, 2022, 10:23 am", createdDate: "Sep 8, 2022, 10:23 am" }
];

// ─── Group types & data ───────────────────────────────────────────────────────
type CreatePermission = "Editor" | "Approver" | "Editor and Approver" | "Viewer" | "";
type AmplifyPermission = "Contributor" | "";

interface UserGroup {
    id: string;
    name: string;
    userIds: string[];
    createPermission: CreatePermission;
    amplifyPermission: AmplifyPermission;
    createdAt: string;
}


function findAccountUser(userId: string, accountUsers: AccountUser[]): AccountUser | undefined {
    return accountUsers.find(u => u.user.id === userId);
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
const navIconSx: SxProps<Theme> = { fontSize: 18 };
type NavKey = "users" | "approvals" | "groups"
    | "permissions-ai" | "permissions-view-edit"

const NAV: { key: NavKey; label: string; icon: React.ReactNode }[] = [
    { key: "users", label: "Users", icon: <SvgIcon sx={navIconSx}><FontAwesomeIcon icon={faUsers} /></SvgIcon> },
    { key: "groups", label: "Groups", icon: <SvgIcon sx={navIconSx}><FontAwesomeIcon icon={faPeopleGroup} /></SvgIcon> },
    { key: "approvals", label: "Approvals", icon: <SvgIcon sx={navIconSx}><FontAwesomeIcon icon={faCircleCheck} /></SvgIcon> },
    { key: "permissions-view-edit", label: "Access Defaults", icon: <SvgIcon sx={navIconSx}><FontAwesomeIcon icon={faLock} /></SvgIcon> },
    { key: "permissions-ai", label: "AI features", icon: <SvgIcon sx={navIconSx}><FontAwesomeIcon icon={faWandMagicSparkles} /></SvgIcon> }
];




// ─── Shared user avatar cell ──────────────────────────────────────────────────
function UserCell({ row }: { row: AccountUser }) {
    const showName = row.user.name && row.user.name !== row.user.email;
    return (
        <Box sx={userCellContainerSx}>
            <TruffleAvatar text={row.user.initials} size="medium" sx={userCellAvatarSx} />
            <Box sx={userCellTextBoxSx}>
                {showName && (
                    <Typography variant="subtitle2" sx={userCellNameSx}>
                        {row.user.name}
                    </Typography>
                )}
                <Typography variant="caption" sx={userCellRoleSx}>
                    {row.user.email}
                </Typography>
            </Box>
        </Box>
    );
}

function getUserTypeRoles(row: AccountUser): string {
    const cs = row.createSpace === "Account owner" ? "Editor" : row.createSpace;
    const parts: string[] = [];
    if (cs && cs !== "No access") {
        parts.push(cs);
    }
    if (row.amplifySpace && row.amplifySpace !== "No access") {
        parts.push(row.amplifySpace);
    }
    return parts.join(", ") || "No access";
}

// ─── Seat-count helpers ────────────────────────────────────────────────────────
// Account owner counts as an editor seat; "Editor and Approver" contains "Editor"
function countEditorSeats(users: AccountUser[]): number {
    return users.filter(u => u.createSpace.includes("Editor") || u.createSpace === "Account owner").length;
}
// Users who already have editor access in Create space don't consume a contributor seat
function hasEditorAccess(u: AccountUser): boolean {
    return u.createSpace.includes("Editor") || u.createSpace === "Account owner";
}
function countContributorSeats(users: AccountUser[]): number {
    return users.filter(u => u.amplifySpace === "Contributor" && !hasEditorAccess(u)).length;
}

// Counts users who hold a privileged Create-space role (Editor, Approver, or Account owner).
// Viewer and No-access don't consume a privileged seat.
function countPrivilegedCreateSpaceSeats(users: AccountUser[]): number {
    return users.filter(u =>
        u.createSpace.includes("Editor") ||
 u.createSpace.includes("Approver") ||
 u.createSpace === "Account owner"
    ).length;
}

const MAX_CREATE_SEATS = 5;

// ─── User Type Selector ────────────────────────────────────────────────────────
const CREATE_OPTIONS = [
    { key: "Editor", label: "Editor", description: "Can edit videos and templates. Uses a seat." },
    { key: "Approver", label: "Approver", description: "Can approve videos and leave feedback. Uses a seat." },
    { key: "Viewer", label: "Viewer", description: "Can view videos and templates." }
];

function UserTypeSelector({
    createSelected, amplifyContributor, onCreateChange, onAmplifyChange, editorCount, contributorCount
}: {
    createSelected: string[]
    amplifyContributor: boolean
    onCreateChange: (v: string[]) => void
    onAmplifyChange: (v: boolean) => void
    editorCount: number
    contributorCount: number
}) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const allSelected = [...createSelected, ...(amplifyContributor ? ["Contributor"] : [])];
    const displayText = allSelected.join(", ");

    const toggleCreate = (key: string) => {
        if (key === "Viewer") {
            onCreateChange(createSelected.includes("Viewer") ? [] : ["Viewer"]);
        }
        else {
            const withoutViewer = createSelected.filter(s => s !== "Viewer");
            const updated = withoutViewer.includes(key)
                ? withoutViewer.filter(s => s !== key)
                : [...withoutViewer, key];
            onCreateChange(updated);
        }
    };

    return (
        <>
            <Box onClick={e => setAnchorEl(e.currentTarget)} sx={userTypeSelectorFieldSx}>
                <Typography variant="body1" sx={{ flex: 1, color: displayText ? "text.primary" : "text.secondary" }}>
                    {displayText || "Select user type"}
                </Typography>
                {allSelected.length > 0 && (
                    <IconButton size="small" onClick={e => {
                        e.stopPropagation(); onCreateChange([]); onAmplifyChange(false); 
                    }} sx={{ p: "2px", color: "action.active" }}>
                        <SvgIcon sx={{ fontSize: 14 }}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                    </IconButton>
                )}
                <SvgIcon sx={{ fontSize: 12, color: "action.active" }}><FontAwesomeIcon icon={faChevronDown} /></SvgIcon>
            </Box>
            <Popover
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{ sx: userTypePopoverPaperSx }}
            >
                {/* Create section */}
                <Box sx={userTypeSectionHeaderSx}>
                    <Typography variant="subtitle2" sx={textPrimarySx}>Create</Typography>
                    <Label label={`${editorCount}/${MAX_CREATE_SEATS} seats`} color="info" size="small" startIcon={<SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faUsers} /></SvgIcon>} />
                </Box>
                {CREATE_OPTIONS.map(opt => {
                    const isSelected = createSelected.includes(opt.key);
                    const isDisabled = opt.key === "Viewer" && (createSelected.includes("Editor") || createSelected.includes("Approver"));
                    const optionBox = (
                        <Box
                            key={opt.key}
                            onClick={isDisabled ? undefined : () => toggleCreate(opt.key)}
                            sx={{ ...userTypeOptionSx, cursor: isDisabled ? "not-allowed" : "pointer", opacity: isDisabled ? 0.4 : 1, bgcolor: isSelected ? "primary.light" : "transparent", "&:hover": { bgcolor: isDisabled ? "transparent" : isSelected ? "primary.light" : "action.hover" } }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={textPrimarySx}>{opt.label}</Typography>
                                <Typography variant="body1" sx={textSecondarySx}>{opt.description}</Typography>
                            </Box>
                            {isSelected && <SvgIcon sx={{ fontSize: 14, color: "primary.main", flexShrink: 0 }}><FontAwesomeIcon icon={faCheck} /></SvgIcon>}
                        </Box>
                    );
                    return isDisabled ? (
                        <Tooltip key={opt.key} title="Viewer and Editor can't be selected together" placement="right" arrow>
                            {optionBox}
                        </Tooltip>
                    ) : (
                        <React.Fragment key={opt.key}>{optionBox}</React.Fragment>
                    );
                })}
                <Divider sx={{ my: "4px" }} />
                {/* Amplify section */}
                <Box sx={userTypeSectionHeaderSx}>
                    <Typography variant="subtitle2" sx={textPrimarySx}>Amplify</Typography>
                    <Label label={`${contributorCount}/10 seats`} color="info" size="small" startIcon={<SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faLayerGroup} /></SvgIcon>} />
                </Box>
                <Box
                    onClick={() => onAmplifyChange(!amplifyContributor)}
                    sx={{ ...userTypeOptionSx, cursor: "pointer", bgcolor: amplifyContributor ? "primary.light" : "transparent", "&:hover": { bgcolor: amplifyContributor ? "primary.light" : "action.hover" } }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={textPrimarySx}>Contributor</Typography>
                        <Typography variant="body1" sx={textSecondarySx}>Can access templates made by editors. Uses a seat.</Typography>
                    </Box>
                    {amplifyContributor && <SvgIcon sx={{ fontSize: 14, color: "primary.main", flexShrink: 0 }}><FontAwesomeIcon icon={faCheck} /></SvgIcon>}
                </Box>
            </Popover>
        </>
    );
}

// ─── Add User Dialog ───────────────────────────────────────────────────────
interface InviteRow { email: string; createSpace: string; amplifySpace: string }

function AddUserDialog({ open, onClose, onSend, users, asApprover = false, onEditExistingUser }: {
    open: boolean
    onClose: () => void
    onSend: (rows: InviteRow[]) => void
    users: AccountUser[]
    asApprover?: boolean
    onEditExistingUser?: (user: AccountUser) => void
}) {
    const defaultCreate = asApprover ? ["Approver"] : ["Editor"];
    const defaultAmplify = !asApprover;

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [createSelected, setCreateSelected] = useState<string[]>(defaultCreate);
    const [amplifyContributor, setAmplifyContributor] = useState(defaultAmplify);
    const [validationTimeout, setValidationTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [existingMode, setExistingMode] = useState(false);
    const [existingUser, setExistingUser] = useState<AccountUser | null>(null);

    const editorCount = countEditorSeats(users);
    const contributorCount = countContributorSeats(users);
    const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const newSelectionNeedsASeat = createSelected.includes("Editor") || createSelected.includes("Approver");
    const seatLimitReached = editorCount >= MAX_CREATE_SEATS;
    const seatLimitExceeded = newSelectionNeedsASeat && seatLimitReached;

    React.useEffect(() => {
        if (open) {
            setEmail(""); setEmailError(""); setCreateSelected(defaultCreate);
            setAmplifyContributor(defaultAmplify); setExistingMode(false); setExistingUser(null);
        }
    }, [open, asApprover]);

    const handleEmailChange = (val: string) => {
        setEmail(val); setEmailError("");
        if (validationTimeout) {
            clearTimeout(validationTimeout);
        }
        if (val.trim()) {
            const t = setTimeout(() => {
                if (!isValidEmail(val.trim())) {
                    setEmailError("Enter a valid email address");
                }
                else {
                    const match = users.find(u => u.user.email.toLowerCase() === val.trim().toLowerCase());
                    if (match) {
                        setExistingUser(match); setExistingMode(true); 
                    }
                }
            }, 500);
            setValidationTimeout(t);
        }
    };

    const handleSend = () => {
        if (!email.trim() || emailError) {
            return;
        }
        onSend([{ email: email.trim(), createSpace: createSelected.join(", ") || "No access", amplifySpace: amplifyContributor ? "Contributor" : "No access" }]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: onClose }}>Add user</TruffleDialogTitle>

            {existingMode && existingUser ? (
                <>
                    <DialogContent sx={editUserContentSx}>
                        <OutlinedInput fullWidth disabled value={existingUser.user.email} sx={existingEmailInputSx} />
                        <AttentionBox color="warning" icon={<SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>}>
                            <AttentionBoxContent>
                                <Typography variant="subtitle2" sx={{ color: "text.primary", mb: "4px" }}>This email is already in use in this account.</Typography>
                                <Typography variant="body1" sx={textPrimarySx}>You can edit the user type if necessary.</Typography>
                            </AttentionBoxContent>
                        </AttentionBox>
                    </DialogContent>
                    <TruffleDialogActions>
                        <Button variant="outlined" size="large" onClick={() => setExistingMode(false)}>Cancel</Button>
                        <Button variant="contained" size="large" onClick={() => {
                            onEditExistingUser?.(existingUser); setExistingMode(false);
                        }}>Edit user type</Button>
                    </TruffleDialogActions>
                </>
            ) : (
                <>
                    <DialogContent sx={editUserContentSx}>
                        {seatLimitExceeded && (
                            <AttentionBox color="warning" icon={<SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>} sx={{ mb: "16px" }}>
                                <AttentionBoxContent>
                                    <Typography variant="body1" sx={{ color: "text.primary" }}>
                                        Create seat limit reached. You can still add users with viewer permission to this account.
                                    </Typography>
                                </AttentionBoxContent>
                            </AttentionBox>
                        )}
                        <Box sx={{ mb: "16px" }}>
                            <Typography variant="body2" sx={seatLimitExceeded ? { ...editUserFieldLabelSx, color: "error.main" } : editUserFieldLabelSx}>Email</Typography>
                            <OutlinedInput fullWidth placeholder="user@example.com" value={email} onChange={e => handleEmailChange(e.target.value)} error={!!emailError || seatLimitExceeded} sx={{ height: 40 }} />
                            {emailError && <Typography variant="caption" sx={{ color: "error.light", mt: "4px", display: "block" }}>{emailError}</Typography>}
                            {!emailError && seatLimitExceeded && <Typography variant="caption" sx={{ color: "error.main", mt: "4px", display: "block" }}>Create seats limit reached.</Typography>}
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={editUserFieldLabelSx}>Permission</Typography>
                            <UserTypeSelector createSelected={createSelected} amplifyContributor={amplifyContributor} onCreateChange={setCreateSelected} onAmplifyChange={setAmplifyContributor} editorCount={editorCount} contributorCount={contributorCount} />
                        </Box>
                    </DialogContent>
                    <TruffleDialogActions>
                        <Button variant="text" size="large" onClick={onClose}>Cancel</Button>
                        <Button variant="contained" size="large" onClick={handleSend} disabled={!email.trim() || !!emailError || seatLimitExceeded}>Save</Button>
                    </TruffleDialogActions>
                </>
            )}
        </Dialog>
    );
}

// ─── Add Approver Dialog ───────────────────────────────────────────────────────
function AddApproverDialog({ open, onClose, onAdd, allUsers, existingApproverIds = [], onOpenAddUser }: {
 open: boolean
 onClose: () => void
 onAdd: (email: string, createSpace: string, amplifySpace: string) => void
 allUsers: AccountUser[]
 existingApproverIds?: string[]
 onOpenAddUser?: () => void
}) {
    // Create space seat = Editor or Approver (privileged role)
    const privilegedSeats = countPrivilegedCreateSpaceSeats(allUsers);

    const [inputValue, setInputValue] = useState("");
    const [selectedUser, setSelectedUser] = useState<AccountUser | null>(null);
    const [validationError, setValidationError] = useState("");
    const [seatConfirmOpen, setSeatConfirmOpen] = useState(false);
    const [newUserConfirmOpen, setNewUserConfirmOpen] = useState(false);
    const [validationTimeout, setValidationTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const trimmed = inputValue.trim();
    const isNewEmail = trimmed.length > 0 && !selectedUser &&
 allUsers.every(u => u.user.email.toLowerCase() !== trimmed.toLowerCase());

    // Does the selected existing user already hold a privileged Create-space role?
    const userHasPrivilegedAccess = selectedUser && (
        selectedUser.createSpace.includes("Editor") ||
 selectedUser.createSpace.includes("Approver") ||
 selectedUser.createSpace === "Account owner"
    );
    const userNeedsCreateAccess = !!selectedUser && !userHasPrivilegedAccess;

    // Existing user with no privileged access → adding as Approver uses 1 Create space seat
    const noSeatsForExisting = userNeedsCreateAccess && privilegedSeats >= 10;
    // New email always uses a Create space seat (Approver role)
    const noSeatsForNewEmail = isNewEmail && privilegedSeats >= 10;

    const addDisabled =
 !trimmed ||
 noSeatsForExisting ||
 noSeatsForNewEmail ||
 !!validationError;

    const reset = () => {
        setInputValue("");
        setSelectedUser(null);
        setValidationError("");
        setSeatConfirmOpen(false);
        setNewUserConfirmOpen(false);
        if (validationTimeout) {
            clearTimeout(validationTimeout);
        }
    };

    const performAdd = () => {
        const email = selectedUser ? selectedUser.user.email : trimmed;
        const createSpace = isNewEmail
            ? "Approver"
            : (selectedUser ? selectedUser.createSpace + (userNeedsCreateAccess ? ", Approver" : "") : "Approver");
        onAdd(email, createSpace, "No access");
        reset();
        onClose();
    };

    const handleAddClick = () => {
        if (isNewEmail && !isValidEmail(trimmed)) {
            setValidationError("Enter a valid email address");
            return;
        }
        if (isNewEmail && !noSeatsForNewEmail) {
            // New user - show invitation and seat confirmation
            setNewUserConfirmOpen(true);
        }
        else if (userNeedsCreateAccess && !noSeatsForExisting) {
            // Existing user needing seat - show seat-use confirmation
            setSeatConfirmOpen(true);
        }
        else {
            performAdd();
        }
    };

    React.useEffect(() => {
        if (!open) {
            reset();
        }
        return () => {
            if (validationTimeout) {
                clearTimeout(validationTimeout);
            }
        };
    }, [open]);


    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: 520, borderRadius: "12px", p: 0 } }}>
                <Box sx={dialogBodySx}>

                    {/* Title */}
                    <Box sx={dialogTitleRowMb24Sx}>
                        <Typography variant="h4" sx={textPrimarySx}>
 Add approver
                        </Typography>
                        <IconButton size="small" onClick={onClose} sx={closeIconButtonSx}>
                            <SvgIcon sx={navIconSx}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                        </IconButton>
                    </Box>

                    {/* ── User autocomplete (always visible) ── */}
                    <Box sx={{ mb: "20px" }}>
                        <Typography variant="subtitle2" sx={{ color: "text.primary", mb: "6px" }}>
 Select or add user
                        </Typography>
                        <Autocomplete
                            options={allUsers}
                            value={selectedUser}
                            inputValue={inputValue}
                            freeSolo
                            getOptionLabel={opt => typeof opt === "string" ? opt : opt.user.email}
                            onChange={(_, opt) => {
                                if (opt && typeof opt !== "string") {
                                    setSelectedUser(opt);
                                    setInputValue(opt.user.email);
                                    setValidationError("");
                                }
                                else if (!opt) {
                                    setSelectedUser(null);
                                    setInputValue("");
                                    setValidationError("");
                                }
                            }}
                            onInputChange={(_, value, reason) => {
                                if (reason === "input") {
                                    setInputValue(value);
                                    setSelectedUser(null);
                                    setValidationError("");

                                    // Clear existing timeout
                                    if (validationTimeout) {
                                        clearTimeout(validationTimeout);
                                    }

                                    // Set new timeout to validate after 500ms of inactivity
                                    if (value.trim().length > 0) {
                                        const timeout = setTimeout(() => {
                                            const trimmed = value.trim();
                                            const isNew = trimmed.length > 0 && allUsers.every(u => u.user.email.toLowerCase() !== trimmed.toLowerCase());
                                            if (isNew && !isValidEmail(trimmed)) {
                                                setValidationError("Enter a valid email address");
                                            }
                                        }, 500);
                                        setValidationTimeout(timeout);
                                    }
                                }
                            }}
                            getOptionDisabled={opt => typeof opt !== "string" && existingApproverIds.includes(opt.user.id)}
                            renderOption={(props, opt) => {
                                const disabled = existingApproverIds.includes(opt.user.id);
                                const content = (
                                    <Box component="li" {...props} key={opt.user.id}
                                        sx={{
                                            display: "flex", flexDirection: "column",
                                            alignItems: "flex-start !important",
                                            py: "10px !important", px: "12px !important",
                                            opacity: disabled ? 0.45 : 1,
                                            pointerEvents: disabled ? "none" : "auto"
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ color: "text.primary", lineHeight: 1.4 }}>
                                            {opt.user.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.4 }}>
                                            {opt.user.email}
                                        </Typography>
                                    </Box>
                                );
                                return disabled ? (
                                    <Tooltip key={opt.user.id} title={`${opt.user.name} is already an approver`} placement="right" arrow componentsProps={{ tooltip: { sx: { bgcolor: "secondary.main" } } }}>
                                        <Box component="span" sx={{ display: "block" }}>{content}</Box>
                                    </Tooltip>
                                ) : content;
                            }}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    placeholder="Search by name or enter email..."
                                    size="small"
                                    error={!!validationError}
                                    helperText={validationError}
                                    sx={{
                                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "grey.300" }
                                    }}
                                />
                            )}
                        />
                    </Box>

                    {/* ── New-user mode: invitation note ── */}
                    {isNewEmail && (
                        <Box sx={infoBoxSx}>
                            <SvgIcon sx={infoBoxIconSx}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                            <Typography variant="body1" sx={textPrimarySx}>
 The user will be notified by email and will need to create an account to access SundaySky.
                            </Typography>
                        </Box>
                    )}

                    {/* ── Not-enough-seats warnings ── */}
                    {(noSeatsForExisting || noSeatsForNewEmail) && (
                        <AttentionBox
                            color="warning"
                            icon={<SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>}
                            sx={{ mb: "20px" }}
                        >
                            <AttentionBoxContent>
                                <Typography variant="subtitle2" sx={cardTitleSx}>
             No Create space seats available
                                </Typography>
                                <Typography variant="body1" sx={textPrimarySx}>
             You've reached the Create space seat limit.{" "}
                                    <Box component="span" sx={contactSalesLinkSx}>
                 Contact sales
                                    </Box>{" "}
             to get more seats. (Note: Viewer permission does not consume a Create space seat.)
                                </Typography>
                            </AttentionBoxContent>
                        </AttentionBox>
                    )}

                    {/* ── Actions ── */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Button
                            variant="text"
                            startIcon={<SvgIcon sx={{ fontSize: "14px !important" }}><FontAwesomeIcon icon={faPlus} /></SvgIcon>}
                            onClick={() => {
                                reset(); onClose(); onOpenAddUser?.(); 
                            }}
                            sx={textLinkButtonSx}
                        >
 Add new user
                        </Button>

                        <Box sx={{ display: "flex", gap: "12px" }}>
                            <Button
                                variant="outlined"
                                onClick={onClose}
                                sx={cancelButtonSx}
                            >
 Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleAddClick}
                                disabled={addDisabled}
                                sx={disabledButtonSx}
                            >
 Add approver
                            </Button>
                        </Box>
                    </Box>

                </Box>
            </Dialog>

            {/* ── Seat-use confirmation dialog for existing user ── */}
            {selectedUser && (
                <Dialog
                    open={seatConfirmOpen}
                    onClose={() => setSeatConfirmOpen(false)}
                    maxWidth={false}
                    PaperProps={{ sx: { width: 460, borderRadius: "12px", p: 0 } }}
                >
                    <Box sx={dialogBodySx}>
                        <Box sx={dialogTitleRowMb16Sx}>
                            <Typography variant="h4" sx={textPrimarySx}>
 Use a create access seat for {selectedUser?.user.name}?
                            </Typography>
                            <IconButton size="small" onClick={() => setSeatConfirmOpen(false)} sx={closeIconButtonSx}>
                                <SvgIcon sx={navIconSx}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                            </IconButton>
                        </Box>

                        <Typography variant="body1" sx={{ color: "text.primary", mb: "24px", lineHeight: 1.6 }}>
                            <strong>{selectedUser.user.name}</strong> currently has{" "}
                            <strong>{selectedUser.createSpace === "No access" ? "no access" : "Viewer access"}</strong>{" "}
 to Create access. Adding them as an approver will give them Create access and use{" "}
                            <strong>1 create access seat</strong> ({privilegedSeats + 1}/10 used after this action).
                        </Typography>

                        <Box sx={dialogActionsRowSx}>
                            <Button
                                variant="outlined"
                                onClick={() => setSeatConfirmOpen(false)}
                                sx={cancelButtonSx}
                            >
 Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={performAdd}
                            >
 Use create access seat for {selectedUser?.user.name}
                            </Button>
                        </Box>
                    </Box>
                </Dialog>
            )}

            {/* ── New user invitation confirmation dialog ── */}
            <Dialog
                open={newUserConfirmOpen}
                onClose={() => setNewUserConfirmOpen(false)}
                maxWidth={false}
                PaperProps={{ sx: { width: 460, borderRadius: "12px", p: 0 } }}
            >
                <Box sx={dialogBodySx}>
                    <Box sx={dialogTitleRowMb16Sx}>
                        <Typography variant="h4" sx={textPrimarySx}>
 Add {trimmed} as a new user?
                        </Typography>
                        <IconButton size="small" onClick={() => setNewUserConfirmOpen(false)} sx={closeIconButtonSx}>
                            <SvgIcon sx={navIconSx}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                        </IconButton>
                    </Box>

                    <Typography variant="body1" sx={{ color: "text.primary", mb: "24px", lineHeight: 1.6 }}>
                        <strong>{trimmed}</strong> is not yet a SundaySky user. They will receive an email invitation to SundaySky. Adding them as an approver will use 1 create access seat ({privilegedSeats + 1}/10 used after this action).
                    </Typography>

                    <Box sx={dialogActionsRowSx}>
                        <Button
                            variant="outlined"
                            onClick={() => setNewUserConfirmOpen(false)}
                            sx={cancelButtonSx}
                        >
 Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                performAdd(); setNewUserConfirmOpen(false); 
                            }}
                        >
 Add new user
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </>
    );
}

// ─── Edit Permissions Dialog ──────────────────────────────────────────────────
function EditPermissionsDialog({ open, onClose, user, users, onSave }: {
    open: boolean
    onClose: () => void
    user: AccountUser | null
    users: AccountUser[]
    onSave: (createSpace: string, amplifySpace: string) => void
}) {
    const editorCount = countEditorSeats(users);
    const contributorCount = countContributorSeats(users);

    const parseCreate = (cs: string): string[] => {
        if (!cs || cs === "No access" || cs === "Account owner") {
            return [];
        }
        return cs.split(", ").filter(s => ["Editor", "Approver", "Viewer"].includes(s));
    };

    const [createSelected, setCreateSelected] = useState<string[]>(() => parseCreate(user?.createSpace || ""));
    const [amplifyContributor, setAmplifyContributor] = useState(user?.amplifySpace === "Contributor");

    React.useEffect(() => {
        setCreateSelected(parseCreate(user?.createSpace || ""));
        setAmplifyContributor(user?.amplifySpace === "Contributor");
    }, [user, open]);

    const userCurrentlyHasSeat = user && (
        user.createSpace.includes("Editor") || user.createSpace.includes("Approver") || user.createSpace === "Account owner"
    );
    const newSelectionNeedsASeat = createSelected.includes("Editor") || createSelected.includes("Approver");
    const seatLimitReached = editorCount >= MAX_CREATE_SEATS;
    const seatLimitExceeded = newSelectionNeedsASeat && !userCurrentlyHasSeat && seatLimitReached;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: onClose }}>Edit user</TruffleDialogTitle>
            <DialogContent sx={editUserContentSx}>
                {seatLimitExceeded && (
                    <AttentionBox color="warning" icon={<SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>} sx={{ mb: "16px" }}>
                        <AttentionBoxContent>
                            <Typography variant="body1" sx={{ color: "text.primary" }}>
                                Create seat limit reached. You can still add users with viewer permission to this account.
                            </Typography>
                        </AttentionBoxContent>
                    </AttentionBox>
                )}
                <Box sx={{ mb: "16px" }}>
                    <Typography variant="body2" sx={seatLimitExceeded ? { ...editUserFieldLabelSx, color: "error.main" } : editUserFieldLabelSx}>Email</Typography>
                    <OutlinedInput fullWidth disabled value={user?.user.email || ""} error={seatLimitExceeded} sx={{ height: 40 }} />
                    {seatLimitExceeded && <Typography variant="caption" sx={{ color: "error.main", mt: "4px", display: "block" }}>Create seats limit reached.</Typography>}
                </Box>
                <Box>
                    <Typography variant="body2" sx={editUserFieldLabelSx}>User type</Typography>
                    <UserTypeSelector
                        createSelected={createSelected}
                        amplifyContributor={amplifyContributor}
                        onCreateChange={setCreateSelected}
                        onAmplifyChange={setAmplifyContributor}
                        editorCount={editorCount}
                        contributorCount={contributorCount}
                    />
                </Box>
            </DialogContent>
            <TruffleDialogActions>
                <Button variant="text" size="large" onClick={onClose}>Cancel</Button>
                <Button variant="contained" size="large" disabled={seatLimitExceeded} onClick={() => {
                    onSave(createSelected.join(", ") || "No access", amplifyContributor ? "Contributor" : "No access"); onClose();
                }}>Save</Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Delete User Dialog (4 variants) ──────────────────────────────────────────
interface DeleteUserDialogProps {
    open: boolean
    onClose: () => void
    user: AccountUser | null
    onConfirm: () => void
    onDisableApprovals?: () => void
    remainingApproversAfterDelete?: number
    hasPendingApprovals?: boolean
    isContributor?: boolean
    approvalsEnabledInAccount?: boolean
}

function DeleteUserDialog({
    open,
    onClose,
    user,
    onConfirm,
    onDisableApprovals,
    remainingApproversAfterDelete,
    hasPendingApprovals = false,
    isContributor = false,
    approvalsEnabledInAccount = false
}: DeleteUserDialogProps) {
    const [inputValue, setInputValue] = useState("");

    if (!user) {
        return null;
    }

    // Only treat as approver-related if the user IS an approver (prop is explicitly provided)
    const userIsApprover = remainingApproversAfterDelete !== undefined;
    const isLastApprover = userIsApprover && remainingApproversAfterDelete === 0 && approvalsEnabledInAccount;
    const isConfirmed = inputValue === "Delete";

    let dialogTitle = "";
    let primaryButtonText = "";
    const bulletPoints: { text: React.ReactNode; show: boolean }[] = [];

    // Approvals enabled + user is an approver scenarios
    if (approvalsEnabledInAccount && userIsApprover) {
        if (isLastApprover && hasPendingApprovals) {
            // Last approver + pending approvals
            dialogTitle = `Delete ${user.user.name} will disable approvals?`;
            primaryButtonText = "Delete user and disable approvals";
            bulletPoints.push({ text: "All pending approvals assigned to this user will be canceled.", show: true });
            bulletPoints.push({ text: "The user who submitted these approvals will be notified by email.", show: true });
            bulletPoints.push({ text: "This user will lose access to this account.", show: true });
        }
        else if (isLastApprover) {
            // Last approver, no pending approvals
            dialogTitle = `Delete ${user.user.name} and disable approvals?`;
            primaryButtonText = "Delete user and disable approvals";
            bulletPoints.push({ text: "Approvals will be disabled until you enable them again.", show: true });
            bulletPoints.push({ text: "This user will lose access to this account.", show: true });
        }
        else if (hasPendingApprovals) {
            // Not last approver, but has pending approvals
            dialogTitle = `Delete ${user.user.name} and cancel approvals?`;
            primaryButtonText = "Delete user and cancel approvals";
            bulletPoints.push({ text: "All pending approvals assigned to this user will be canceled.", show: true });
            bulletPoints.push({ text: "The user who submitted these approvals will be notified by email.", show: true });
            bulletPoints.push({ text: "This user will lose access to this account.", show: true });
        }
        else {
            // Approver but not last, no pending — regular delete
            dialogTitle = `Delete ${user.user.name}?`;
            primaryButtonText = "Delete user";
            bulletPoints.push({ text: "This user will lose access to this account.", show: true });
        }
    }
    else {
        // Approvals disabled or user is not an approver — regular delete
        dialogTitle = `Delete ${user.user.name}?`;
        primaryButtonText = "Delete user";
        bulletPoints.push({ text: "This user will lose access to this account.", show: true });
    }

    const visibleBulletPoints = bulletPoints.filter(bp => bp.show);

    const bodyContent = (
        <Box>
            {visibleBulletPoints.length > 0 && (
                <Box sx={{ mb: "16px" }}>
                    {visibleBulletPoints.map((bp, idx) => (
                        <Typography key={idx} variant="body1" sx={{ color: "text.primary", mb: idx < visibleBulletPoints.length - 1 ? "8px" : "0px" }}>
                            • {bp.text}
                        </Typography>
                    ))}
                </Box>
            )}
            {isContributor && (
                <Box sx={{ bgcolor: "warning.light", border: 1, borderColor: "warning.main", borderRadius: "8px", p: "12px", mb: "24px", display: "flex", gap: "12px" }}>
                    <SvgIcon sx={{ fontSize: 20, color: "warning.main", flexShrink: 0 }}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                    <Typography variant="body1" sx={{ color: "text.primary" }}>
                        Deleting this user will also delete all Amplify videos and analytics for Contributors. Previously shared links will remain viewable.
                    </Typography>
                </Box>
            )}
        </Box>
    );

    const handleConfirm = () => {
        onConfirm();
        if (isLastApprover) {
            onDisableApprovals?.();
        }
        onClose();
        setInputValue("");
    };

    const handleClose = () => {
        onClose();
        setInputValue("");
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={false}
            PaperProps={{ sx: { width: 440, borderRadius: "12px", p: 0 } }}
        >
            <Box sx={dialogBodySx}>
                <Box sx={dialogTitleRowMb24Sx}>
                    <Typography variant="h4" sx={textPrimarySx}>
                        {dialogTitle}
                    </Typography>
                    <IconButton size="small" onClick={handleClose} sx={closeIconButtonSx}>
                        <SvgIcon sx={navIconSx}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                    </IconButton>
                </Box>

                {bodyContent}

                <OutlinedInput
                    fullWidth
                    placeholder='Type "Delete" to confirm'
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    sx={{ height: 40, mb: "24px" }}
                />

                <Box sx={dialogActionsRowSx}>
                    <Button onClick={handleClose} sx={textCancelButtonSx}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirm}
                        disabled={!isConfirmed}
                    >
                        {primaryButtonText}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}

// ─── Remove Approver Dialog (3 variants) ──────────────────────────────────────
interface RemoveApproverDialogProps {
    open: boolean
    onClose: () => void
    user: AccountUser | null
    onConfirm: () => void
    onDisableApprovals?: () => void
    remainingApproversAfterRemove?: number
    hasPendingApprovals?: boolean
    approvalsEnabledInAccount?: boolean
    pendingCount?: number
}

function RemoveApproverDialog({
    open,
    onClose,
    user,
    onConfirm,
    onDisableApprovals,
    remainingApproversAfterRemove = 0,
    hasPendingApprovals = false,
    approvalsEnabledInAccount = false,
    pendingCount = 1
}: RemoveApproverDialogProps) {
    if (!user) {
        return null;
    }

    const isLastApproverWithPending = remainingApproversAfterRemove === 0 && hasPendingApprovals && approvalsEnabledInAccount;
    const isLastApprover = remainingApproversAfterRemove === 0 && approvalsEnabledInAccount;

    let dialogTitle = "";
    let bodyLines: string[] = [];
    let primaryBtnText = "Remove approver permission";
    let secondaryBtnText = "Keep approver role";

    // Scenario 3: Last approver with pending approvals
    if (isLastApproverWithPending) {
        dialogTitle = `Removing ${user.user.name} approver permission will disable approvals for all the account`;
        bodyLines = [
            `All ${pendingCount} pending ${pendingCount === 1 ? "approval" : "approvals"} assigned to this user will be canceled.`,
            "The user who submitted these approvals will be notified by email."
        ];
        primaryBtnText = "Disable approvals";
        secondaryBtnText = "Keep approver permission";
    }
    // Scenario 2: Last approver (but no pending approvals)
    else if (isLastApprover) {
        dialogTitle = `Removing ${user.user.name} approver permission will disable approvals`;
        bodyLines = ["Approvals must have at least 1 approver."];
        primaryBtnText = "Disable approvals";
        secondaryBtnText = "Keep approver permission";
    }
    // Scenario 1: Has pending approvals (but not last approver)
    else if (hasPendingApprovals) {
        dialogTitle = `Removing ${user.user.name} approver permission will cancel all ${pendingCount} pending ${pendingCount === 1 ? "approval" : "approvals"}`;
        bodyLines = ["The user who submitted these approvals will be notified by email."];
        primaryBtnText = `Cancel ${pendingCount} pending ${pendingCount === 1 ? "approval" : "approvals"}`;
    }
    // Default: Just removing approver role
    else {
        dialogTitle = `Remove ${user.user.name} from approver role?`;
    }

    const handleConfirm = () => {
        if (isLastApproverWithPending || isLastApprover) {
            onConfirm();
            onDisableApprovals?.();
        }
        else {
            onConfirm();
        }
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <TruffleDialogTitle multiline CloseIconButtonProps={{ onClick: onClose }}>
                {dialogTitle}
            </TruffleDialogTitle>
            {bodyLines.length > 0 && (
                <DialogContent sx={removeApproverContentSx}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {bodyLines.map((line, i) => (
                            <Typography key={i} variant="body1" color="text.primary">
                                {line}
                            </Typography>
                        ))}
                    </Box>
                </DialogContent>
            )}
            <TruffleDialogActions>
                <Button variant="text" size="large" onClick={onClose}>
                    {secondaryBtnText}
                </Button>
                <Button variant="contained" size="large" color="error" onClick={handleConfirm}>
                    {primaryBtnText}
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}


// ─── Approvals Section ────────────────────────────────────────────────────────
function ApprovalsSection({ users, approverIds, enabled, onToggle, onSetApprovers, onAddUsers, onPermissionsChanged, onUserDeleted, pendingApprovalsCount, userRole = "account-owner" }: {
 users: AccountUser[]
 approverIds: Set<string>
 enabled: boolean
 onToggle: (v: boolean) => void
 onSetApprovers: (ids: string[]) => void
 onAddUsers: (rows: InviteRow[], asApprover: boolean) => void
 onPermissionsChanged?: (userId: string, createSpace: string, amplifySpace: string) => void
 pendingApprovalsCount?: number
 videoStates?: Record<string, { sentApprovers?: string[]; sentAt?: string }>
 onUserDeleted?: (userId: string) => void
 userRole?: UserRole
}) {
    const [search, setSearch] = useState("");
    const [addApproverDialogOpen, setAddApproverDialogOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteAsApprover, setInviteAsApprover] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<AccountUser | null>(null);
    const [disableConfirmOpen, setDisableConfirmOpen] = useState(false);


    const approvers = users.filter(u => u.createSpace.includes("Approver"));
    const filtered = search
        ? approvers.filter(r => r.user.name.toLowerCase().includes(search.toLowerCase()) || r.user.email.toLowerCase().includes(search.toLowerCase()))
        : approvers;

    const headCellSx = { color: "text.primary", borderBottom: 1, borderBottomColor: "grey.300", py: "10px", px: "16px", whiteSpace: "nowrap" as const, bgcolor: "background.paper", position: "sticky", top: 0, zIndex: 3 };
    const bodyCellSx = { color: "text.primary", borderBottom: 1, borderBottomColor: "grey.300", py: "10px", px: "16px" };

    function handleAddApprovers(newIds: string[]) {
        const trulyNew = newIds.filter(id => !approverIds.has(id));
        // Merge new IDs with existing ones so no existing approver is lost
        onSetApprovers([...Array.from(approverIds), ...trulyNew]);
    }

    function handleToggle(v: boolean) {
        if (!v && (pendingApprovalsCount ?? 0) > 0) {
            setDisableConfirmOpen(true);
        }
        else {
            onToggle(v);
        }
    }

    return (
        <Box sx={sectionContainerSx}>
            <Typography variant="h3" sx={{ color: "text.primary", mb: "16px", flexShrink: 0 }}>
 Approvals
            </Typography>

            {/* Toggle row */}
            <Box sx={approvalToggleContainerSx}>
                <Box sx={approvalToggleInnerSx}>
                    <SvgIcon sx={approvalStampIconSx}><FontAwesomeIcon icon={faStamp} /></SvgIcon>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ color: "text.primary" }}>
                            {userRole === "account-owner" ? "Enable video approvals" : "Video approvals"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: "2px" }}>
                            {userRole === "account-owner"
                                ? "Only approvers can approve videos. Assign approver permissions in the Users tab."
                                : enabled
                                    ? "Only approvers can approve videos. Ask your account owner to add or remove approvers"
                                    : "Only approvers can approve videos. Ask your account owner to enable approvals"}
                        </Typography>
                    </Box>
                    {userRole === "account-owner" ? (
                        <Tooltip
                            title={approvers.length === 0 ? "Add at least one user with approver permission to enable approvals." : ""}
                            placement="top"
                            arrow
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Switch
                                    checked={enabled}
                                    onChange={e => handleToggle(e.target.checked)}
                                    disabled={approvers.length === 0}
                                    sx={switchSx}
                                />
                            </Box>
                        </Tooltip>
                    ) : (
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {enabled && (
                                <Label label="Enabled" color="success" size="medium" />
                            )}
                            {!enabled && (
                                <Label label="Disabled" color="default" size="medium" />
                            )}
                        </Box>
                    )}
                </Box>

                {enabled && (
                    <Box sx={{ px: "16px", pb: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {/* Search */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                            <Search
                                placeholder="Search..."
                                size="small"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onClear={() => setSearch("")}
                                numberOfResults={0}
                                sx={{ width: 200 }}
                            />
                        </Box>

                        {/* Approvers table */}
                        <Box sx={approversTableContainerSx}>
                            <Table size="small" sx={tableFullWidthSx}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ ...headCellSx, width: 220, position: "sticky", left: 0, zIndex: 4 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                                                    User <SvgIcon sx={{ fontSize: 14, color: "action.active" }}><FontAwesomeIcon icon={faArrowDown} /></SvgIcon>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={headCellSx}>
                                            <Typography variant="subtitle2" sx={textPrimarySx}>Permission</Typography>
                                        </TableCell>
                                        <TableCell sx={headCellSx}>
                                            <Typography variant="subtitle2" sx={textPrimarySx}>Job role</Typography>
                                        </TableCell>
                                        <TableCell sx={{ ...headCellSx, width: 160 }}>
                                            <Typography variant="subtitle2" sx={textPrimarySx}>Last login</Typography>
                                        </TableCell>
                                        <TableCell sx={{ ...headCellSx, width: 160 }}>
                                            <Typography variant="subtitle2" sx={textPrimarySx}>Creation date</Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map(row => {
                                        return (
                                            <TableRow key={row.user.id}>
                                                <TableCell sx={{ ...bodyCellSx, position: "sticky", left: 0, zIndex: 1, bgcolor: "background.paper" }}>
                                                    <UserCell row={row} />
                                                </TableCell>
                                                <TableCell sx={bodyCellSx}>
                                                    <Box sx={userTypeCellSx}>
                                                        {row.isOwner && <Label label="Account owner" color="info" size="small" />}
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                            <Typography variant="body1" sx={textPrimarySx}>
                                                                {getUserTypeRoles(row)}
                                                            </Typography>
                                                            {row.isOwner && (
                                                                <Tooltip title="Account owners have full access to the account" placement="top" arrow componentsProps={{ tooltip: { sx: { bgcolor: "secondary.main" } } }}>
                                                                    <SvgIcon sx={{ fontSize: 14, color: "action.active" }}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={bodyCellSx}>
                                                    <Typography variant="body1" sx={textPrimarySx}>{row.jobRole}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ ...bodyCellSx, width: 160 }}>
                                                    <Typography variant="body1" sx={{ color: row.pending ? "text.secondary" : "text.primary", fontStyle: row.pending ? "italic" : "normal", whiteSpace: "nowrap" }}>
                                                        {row.pending ? "Pending" : row.lastLogin}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ ...bodyCellSx, width: 160 }}>
                                                    <Typography variant="body1" sx={{ color: "text.primary", whiteSpace: "nowrap" }}>
                                                        {row.createdDate}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
                )}

            </Box>

            {/* Add Approver Dialog */}
            <AddApproverDialog
                open={addApproverDialogOpen}
                onClose={() => setAddApproverDialogOpen(false)}
                allUsers={users}
                existingApproverIds={Array.from(approverIds)}
                onOpenAddUser={() => {
                    setInviteAsApprover(true); setInviteOpen(true); 
                }}
                onAdd={(email, createSpace, amplifySpace) => {
                    // Find if user exists
                    const existingUser = users.find(u => u.user.email === email);
                    if (existingUser) {
                        // Determine new permission based on current role
                        let newCreateSpace = existingUser.createSpace;

                        if (existingUser.createSpace === "Viewer") {
                            // Viewer → Approver
                            newCreateSpace = "Approver";
                        }
                        else if (existingUser.createSpace === "No access") {
                            // No access → Approver
                            newCreateSpace = "Approver";
                        }
                        else if (existingUser.createSpace === "Account owner") {
                            // Account owner → Account owner, Approver (if not already)
                            if (!newCreateSpace.includes("Approver")) {
                                newCreateSpace = "Account owner, Approver";
                            }
                        }
                        else if (existingUser.createSpace === "Editor") {
                            // Editor → Editor and Approver (if not already)
                            if (!newCreateSpace.includes("Approver")) {
                                newCreateSpace = "Editor and Approver";
                            }
                        }
                        else if (existingUser.createSpace.includes("Editor")) {
                            // Editor and Approver or similar → add Approver if not already there
                            if (!newCreateSpace.includes("Approver")) {
                                newCreateSpace = existingUser.createSpace + ", Approver";
                            }
                        }

                        // Update permission if it changed
                        if (newCreateSpace !== existingUser.createSpace) {
                            onPermissionsChanged?.(existingUser.user.id, newCreateSpace, existingUser.amplifySpace);
                        }

                        // Add existing user as approver
                        handleAddApprovers([existingUser.user.id]);
                    }
                    else {
                        // Invite new user as approver
                        onAddUsers([{ email, createSpace, amplifySpace }], true);
                    }
                }}
            />

            {/* Add User Dialog */}
            <AddUserDialog
                open={inviteOpen}
                onClose={() => {
                    setInviteOpen(false); setInviteAsApprover(false); 
                }}
                onSend={rows => {
                    onAddUsers(rows, true); setInviteOpen(false); setInviteAsApprover(false); 
                }}
                users={users}
                asApprover={inviteAsApprover}
                onEditExistingUser={() => {
                    // For approvals, we don't need to edit the user - just acknowledge
                    setInviteOpen(false);
                }}
            />


            {/* Delete User Dialog */}
            <DeleteUserDialog
                open={deleteOpen}
                onClose={() => {
                    setDeleteOpen(false);
                    setUserToDelete(null);
                }}
                user={userToDelete}
                remainingApproversAfterDelete={userToDelete ? Array.from(approverIds).filter(id => id !== userToDelete.user.id).length : 0}
                hasPendingApprovals={!!userToDelete?.addedAsApprover}
                isContributor={userToDelete?.amplifySpace === "Contributor"}
                approvalsEnabledInAccount={enabled}
                onConfirm={() => {
                    if (userToDelete) {
                        const newApprovers = Array.from(approverIds).filter(id => id !== userToDelete.user.id);
                        onSetApprovers(newApprovers);
                        // Disable approvals if no approvers left
                        if (newApprovers.length === 0 && enabled) {
                            onToggle(false);
                        }
                        onUserDeleted?.(userToDelete.user.id);
                    }
                }}
                onDisableApprovals={() => {
                    onToggle(false);
                }}
            />

            {/* Disable Approvals Confirmation (when pending approvals exist) */}
            <Dialog
                open={disableConfirmOpen}
                onClose={() => setDisableConfirmOpen(false)}
                maxWidth={false}
                PaperProps={{ sx: { width: 480, borderRadius: "12px", p: 0 } }}
            >
                <Box sx={dialogBodySx}>
                    <Typography variant="h4" sx={dialogTitleSx}>
                        Cancel all pending approvals?
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.primary", mb: "8px" }}>
                        Disabling approvals will cancel all {pendingApprovalsCount} pending {pendingApprovalsCount === 1 ? "approval" : "approvals"} in this account.
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.primary", mb: "24px" }}>
                        The user who submitted them will be notified by email.
                    </Typography>
                    <Box sx={dialogActionsRowSx}>
                        <Button onClick={() => setDisableConfirmOpen(false)} sx={textCancelButtonSx}>
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                setDisableConfirmOpen(false);
                                onToggle(false);
                            }}
                        >
                            Cancel all pending approvals
                        </Button>
                    </Box>
                </Box>
            </Dialog>

        </Box>
    );
}

// ─── Users Section ────────────────────────────────────────────────────────────
function UsersSection({
    users,
    onInviteUser,
    onUserDeleted,
    onPermissionsChanged,
    approvalsEnabled = false,
    onEnableApprovalsRequested,
    onToggleApprovals,
    userRole = "account-owner",
    pendingApprovalsCount = 0,
    videoStates = {}
}: {
 users: AccountUser[]
 onInviteUser: (rows: InviteRow[]) => void
 onUserDeleted?: (userId: string) => void
 onPermissionsChanged?: (userId: string, createSpace: string, amplifySpace: string) => void
 approvalsEnabled?: boolean
 approverIds?: Set<string>
 videoStates?: Record<string, { sentApprovers?: string[]; sentAt?: string }>
 onClose?: () => void
 onEnableApprovalsRequested?: () => void
 onToggleApprovals?: (enabled: boolean) => void
 userRole?: UserRole
 pendingApprovalsCount?: number
}) {
    const [search, setSearch] = useState("");
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [dialogMode, setDialogMode] = useState<"closed" | "add" | "edit">("closed");
    const [editingUser, setEditingUser] = useState<AccountUser | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<AccountUser | null>(null);
    const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
    const [userMenuUser, setUserMenuUser] = useState<AccountUser | null>(null);
    const [usersList, setUsersList] = useState<AccountUser[]>(users);
    const [activeTab, setActiveTab] = useState<"create" | "amplify">("create");
    const [enableApprovalsDialogOpen, setEnableApprovalsDialogOpen] = useState(false);
    const [userWithApproverAdded, setUserWithApproverAdded] = useState<AccountUser | null>(null);
    const [removeApproverOpen, setRemoveApproverOpen] = useState(false);
    const [userToRemoveApprover, setUserToRemoveApprover] = useState<AccountUser | null>(null);
    const [pendingApproverRemoval, setPendingApproverRemoval] = useState<{ user: AccountUser; createSpace: string; amplifySpace: string } | null>(null);

    function getUserPendingApprovals(userId: string) {
        const videoTitles: string[] = [];
        Object.entries(videoStates).forEach(([videoTitle, state]) => {
            if (state.sentApprovers?.includes(userId)) {
                videoTitles.push(videoTitle);
            }
        });
        return videoTitles;
    }

    const filtered = search
        ? usersList.filter(r => r.user.name.toLowerCase().includes(search.toLowerCase()) || r.user.email.toLowerCase().includes(search.toLowerCase()))
        : usersList;

    // Sync usersList with users prop
    React.useEffect(() => {
        setUsersList(users);
    }, [users]);

    const editorCount = countEditorSeats(usersList);
    const contributorCount = countContributorSeats(usersList);
    const seatLimitReached = editorCount >= MAX_CREATE_SEATS;

    const headCellSx = { color: "text.primary", borderBottom: 1, borderBottomColor: "grey.300", py: "10px", px: "16px", whiteSpace: "nowrap" as const, bgcolor: "background.paper", position: "sticky", top: 0, zIndex: 3 };
    const bodyCellSx = { color: "text.primary", borderBottom: 1, borderBottomColor: "grey.300", py: "10px", px: "16px" };

    return (
        <Box sx={sectionContainerSx}>
            {/* Title row */}
            <Box sx={usersTitleRowSx}>
                <Typography variant="h3" sx={textPrimarySx}>Users</Typography>
            </Box>

            {/* Workspace tabs */}
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v as "create" | "amplify")} sx={userTabsSx}>
                <Tab
                    value="create"
                    sx={tabItemSx}
                    label={
                        <Box sx={tabLabelBoxSx}>
                            <Typography variant="subtitle2" component="span">Create</Typography>
                            <Label label={`${editorCount}/${MAX_CREATE_SEATS} seats`} color="info" size="small" startIcon={<SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faUsers} /></SvgIcon>} />
                        </Box>
                    }
                />
                <Tab
                    value="amplify"
                    sx={tabItemSx}
                    label={
                        <Box sx={tabLabelBoxSx}>
                            <Typography variant="subtitle2" component="span">Amplify</Typography>
                            <Label label={`${contributorCount}/10 seats`} color="info" size="small" startIcon={<SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faLayerGroup} /></SvgIcon>} />
                        </Box>
                    }
                />
            </Tabs>

            {/* Toolbar row */}
            <Box sx={usersToolbarRowSx}>
                {userRole === "account-owner" && (
                    <Button
                        size="medium"
                        variant="outlined"
                        startIcon={<SvgIcon sx={{ fontSize: "24px" }}><FontAwesomeIcon icon={faPlus} /></SvgIcon>}
                        onClick={() => setDialogMode("add")}
                        sx={addUserBtnSx}
                    >
                        Add user
                    </Button>
                )}
                <Search
                    placeholder="Search..."
                    size="small"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onClear={() => setSearch("")}
                    numberOfResults={0}
                    sx={{ width: 240 }}
                />
            </Box>

            {/* Seat limit banner */}
            {seatLimitReached && activeTab === "create" && (
                <AttentionBox color="warning" icon={<SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>} sx={{ mb: "16px", flexShrink: 0 }}>
                    <AttentionBoxContent>
                        <Typography variant="body1" sx={{ color: "text.primary" }}>
                            Create seat limit reached. You can still add users with viewer permission to this account.
                        </Typography>
                    </AttentionBoxContent>
                </AttentionBox>
            )}

            {/* Table */}
            <Box sx={usersTableContainerSx}>
                <Table size="small" sx={tableFullWidthSx}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headCellSx, width: 220, position: "sticky", left: 0, zIndex: 4 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                                    User <SvgIcon sx={{ fontSize: 14, color: "action.active" }}><FontAwesomeIcon icon={faArrowDown} /></SvgIcon>
                                </Box>
                            </TableCell>
                            <TableCell sx={headCellSx}>
                                <Typography variant="subtitle2" sx={textPrimarySx}>Permission</Typography>
                            </TableCell>
                            <TableCell sx={headCellSx}>
                                <Typography variant="subtitle2" sx={textPrimarySx}>Job role</Typography>
                            </TableCell>
                            <TableCell sx={{ ...headCellSx, width: 160 }}>
                                <Typography variant="subtitle2" sx={textPrimarySx}>Last login</Typography>
                            </TableCell>
                            <TableCell sx={{ ...headCellSx, width: 160 }}>
                                <Typography variant="subtitle2" sx={textPrimarySx}>Creation date</Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map(row => {
                            const isHovered = hoveredRow === row.user.id;
                            return (
                                <TableRow
                                    key={row.user.id}
                                    onMouseEnter={() => setHoveredRow(row.user.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    sx={{ bgcolor: isHovered ? "grey.100" : "background.paper", transition: "background 0.1s" }}
                                >
                                    <TableCell sx={{ ...bodyCellSx, position: "sticky", left: 0, zIndex: 1, bgcolor: isHovered ? "grey.100" : "background.paper" }}>
                                        <UserCell row={row} />
                                    </TableCell>
                                    <TableCell sx={bodyCellSx}>
                                        <Box sx={userTypeCellSx}>
                                            {row.isOwner && <Label label="Account owner" color="info" size="small" />}
                                            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Typography variant="body1" sx={textPrimarySx}>
                                                    {getUserTypeRoles(row)}
                                                </Typography>
                                                {row.isOwner && (
                                                    <Tooltip title="Account owners have full access to the account" placement="top" arrow componentsProps={{ tooltip: { sx: { bgcolor: "secondary.main" } } }}>
                                                        <SvgIcon sx={{ fontSize: 14, color: "action.active" }}><FontAwesomeIcon icon={faCircleInfo} /></SvgIcon>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={bodyCellSx}>
                                        <Typography variant="body1" sx={textPrimarySx}>{row.jobRole}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellSx, width: 160 }}>
                                        <Typography variant="body1" sx={{ color: row.pending ? "text.secondary" : "text.primary", fontStyle: row.pending ? "italic" : "normal", whiteSpace: "nowrap" }}>
                                            {row.pending ? "Pending" : row.lastLogin}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ ...bodyCellSx, width: 160 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                                            <Typography variant="body1" sx={{ color: "text.primary", whiteSpace: "nowrap" }}>
                                                {row.createdDate}
                                            </Typography>
                                            {(isHovered || userMenuUser?.user.id === row.user.id) && !row.isOwner && userRole === "account-owner" && (
                                                <IconButton
                                                    size="small"
                                                    onClick={e => {
                                                        setUserMenuAnchor(e.currentTarget); setUserMenuUser(row);
                                                    }}
                                                    sx={ellipsisButtonSx}
                                                >
                                                    <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faEllipsis} /></SvgIcon>
                                                </IconButton>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Box>

            <AddUserDialog
                open={dialogMode === "add"}
                onClose={() => setDialogMode("closed")}
                onSend={rows => {
                    onInviteUser(rows); setDialogMode("closed"); 
                }}
                users={usersList}
                onEditExistingUser={(user) => {
                    setEditingUser(user);
                    setDialogMode("edit");
                }}
            />

            {/* Edit Permissions Dialog */}
            <EditPermissionsDialog
                open={dialogMode === "edit"}
                onClose={() => setDialogMode("closed")}
                user={editingUser}
                users={usersList}
                onSave={(createSpace, amplifySpace) => {
                    if (editingUser) {
                        const hadApprover = editingUser.createSpace.includes("Approver");
                        const hasApprover = createSpace.includes("Approver");
                        const becameApprover = !hadApprover && hasApprover;
                        const lostApprover = hadApprover && !hasApprover;

                        // Show remove approver dialog only when needed
                        if (lostApprover) {
                            const remainingAfterRemove = usersList.filter(u => u.user.id !== editingUser.user.id && u.createSpace.includes("Approver")).length;
                            const isLastApprover = remainingAfterRemove === 0 && approvalsEnabled;
                            const hasPending = getUserPendingApprovals(editingUser.user.id).length > 0;

                            if (isLastApprover || hasPending) {
                                setUserToRemoveApprover(editingUser);
                                setPendingApproverRemoval({ user: editingUser, createSpace, amplifySpace });
                                setRemoveApproverOpen(true);
                                setDialogMode("closed");
                                return;
                            }
                            // Not last approver and no pending approvals — just save silently
                        }

                        setUsersList(prev => prev.map(u => u.user.id === editingUser.user.id ? { ...u, createSpace, amplifySpace } : u));
                        onPermissionsChanged?.(editingUser.user.id, createSpace, amplifySpace);

                        // Show enable approvals dialog if user gained approver permission and approvals are disabled
                        if (becameApprover && !approvalsEnabled) {
                            setUserWithApproverAdded(editingUser);
                            setEnableApprovalsDialogOpen(true);
                        }
                    }
                }}
            />

            {/* Delete User Dialog */}
            <DeleteUserDialog
                open={deleteOpen}
                onClose={() => {
                    setDeleteOpen(false);
                    setUserToDelete(null);
                    setUserMenuAnchor(null);
                }}
                user={userToDelete}
                remainingApproversAfterDelete={userToDelete && userToDelete.createSpace.includes("Approver") ? usersList.filter(u => u.user.id !== userToDelete.user.id && u.createSpace.includes("Approver")).length : undefined}
                hasPendingApprovals={userToDelete ? getUserPendingApprovals(userToDelete.user.id).length > 0 : false}
                isContributor={userToDelete?.amplifySpace === "Contributor"}
                approvalsEnabledInAccount={approvalsEnabled}
                onConfirm={() => {
                    if (userToDelete) {
                        setUsersList(prev => prev.filter(u => u.user.id !== userToDelete.user.id));
                        onUserDeleted?.(userToDelete.user.id);
                        setUserMenuAnchor(null);
                    }
                }}
            />

            {/* Remove Approver Dialog */}
            <RemoveApproverDialog
                open={removeApproverOpen}
                onClose={() => {
                    setRemoveApproverOpen(false);
                    setUserToRemoveApprover(null);
                    setPendingApproverRemoval(null);
                }}
                user={userToRemoveApprover}
                remainingApproversAfterRemove={userToRemoveApprover ? usersList.filter(u => u.user.id !== userToRemoveApprover.user.id && u.createSpace.includes("Approver")).length : 0}
                hasPendingApprovals={userToRemoveApprover ? getUserPendingApprovals(userToRemoveApprover.user.id).length > 0 : false}
                approvalsEnabledInAccount={approvalsEnabled}
                pendingCount={userToRemoveApprover ? getUserPendingApprovals(userToRemoveApprover.user.id).length : pendingApprovalsCount}
                onConfirm={() => {
                    if (pendingApproverRemoval) {
                        setUsersList(prev => prev.map(u =>
                            u.user.id === pendingApproverRemoval.user.user.id
                                ? { ...u, createSpace: pendingApproverRemoval.createSpace, amplifySpace: pendingApproverRemoval.amplifySpace }
                                : u
                        ));
                        onPermissionsChanged?.(pendingApproverRemoval.user.user.id, pendingApproverRemoval.createSpace, pendingApproverRemoval.amplifySpace);
                        setRemoveApproverOpen(false);
                        setUserToRemoveApprover(null);
                        setPendingApproverRemoval(null);
                    }
                }}
                onDisableApprovals={() => onToggleApprovals?.(false)}
            />

            {/* Enable Approvals Dialog */}
            <Dialog
                open={enableApprovalsDialogOpen}
                onClose={() => setEnableApprovalsDialogOpen(false)}
                maxWidth={false}
                PaperProps={{ sx: { width: 480, borderRadius: "12px", p: 0 } }}
            >
                <Box sx={dialogBodySx}>
                    <Typography variant="h4" sx={dialogTitleSx}>
                        Enable video approvals?
                    </Typography>
                    <Typography variant="body1" sx={dialogBodyTextSx}>
                        You added approver permission to {userWithApproverAdded?.user.name}.
                        <br />
                        <br />
                        To submit videos for approval, turn on approvals.
                    </Typography>
                    <Box sx={dialogActionsRowSx}>
                        <Button
                            variant="outlined"
                            onClick={() => setEnableApprovalsDialogOpen(false)}
                            sx={cancelButtonSx}
                        >
                            I'll do it later
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setEnableApprovalsDialogOpen(false);
                                onEnableApprovalsRequested?.();
                            }}
                        >
                            Enable approvals
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            {/* Options popup menu */}
            <Menu
                anchorEl={userMenuAnchor}
                open={!!userMenuAnchor}
                onClose={() => setUserMenuAnchor(null)}
                PaperProps={{ sx: contextMenuPaperSx }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                <MenuItem
                    onClick={() => {
                        setEditingUser(userMenuUser); setDialogMode("edit"); setUserMenuAnchor(null); 
                    }}
                    sx={menuItemEditSx}
                >
                    <SvgIcon sx={{ fontSize: 16, color: "action.active" }}><FontAwesomeIcon icon={faPenToSquare} /></SvgIcon>
                    Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (userMenuUser) {
                            setUserMenuAnchor(null);
                            setUserToDelete(userMenuUser);
                            setDeleteOpen(true);
                        }
                    }}
                    sx={menuItemRemoveSx}
                >
                    <SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faTrash} /></SvgIcon>
                    Delete
                </MenuItem>
            </Menu>
        </Box>
    );
}

// ─── GroupDialog (create / edit) ──────────────────────────────────────────────
function GroupDialog({ open, onClose, onSave, mode, group, accountUsers, existingGroups }: {
    open: boolean;
    onClose: () => void;
    onSave: (data: Omit<UserGroup, "id" | "createdAt">) => void;
    mode: "create" | "edit";
    group?: UserGroup;
    accountUsers: AccountUser[];
    existingGroups: UserGroup[];
}) {
    const [name, setName] = useState(group?.name ?? "");
    const [selectedUsers, setSelectedUsers] = useState<typeof ALL_USERS[number][]>([]);
    const [discardOpen, setDiscardOpen] = useState(false);

    React.useEffect(() => {
        if (open) {
            setName(group?.name ?? "");
            if (group) {
                const known = ALL_USERS.filter(u => group.userIds.includes(u.id));
                setSelectedUsers(known);
            }
            else {
                setSelectedUsers([]);
            }
        }
    }, [open, group]);

    const trimmedName = name.trim();
    const isDuplicateName = trimmedName.length > 0 && existingGroups.some(
        g => g.name.toLowerCase() === trimmedName.toLowerCase() && g.id !== group?.id
    );
    const canSave = trimmedName.length > 0 && !isDuplicateName;

    // Detect unsaved changes
    const initialUserIds = group?.userIds ?? [];
    const hasChanges = mode === "create"
        ? trimmedName.length > 0 || selectedUsers.length > 0
        : trimmedName !== (group?.name ?? "") || selectedUsers.some(u => !initialUserIds.includes(u.id)) || initialUserIds.some(id => !selectedUsers.find(u => u.id === id));

    const handleAttemptClose = () => {
        if (hasChanges) {
            setDiscardOpen(true);
        }
        else {
            onClose();
        }
    };

    return (
        <>
            <Dialog open={open} onClose={handleAttemptClose} maxWidth={false}
                PaperProps={{ sx: { width: 540, borderRadius: "12px", p: 0, maxHeight: "90vh", display: "flex", flexDirection: "column" } }}>
                <Box sx={groupDialogScrollSx}>
                    {/* Title */}
                    <Box sx={dialogTitleRowMb24Sx}>
                        <Typography variant="h4" sx={textPrimarySx}>
                            {mode === "create" ? "Create group" : "Edit group"}
                        </Typography>
                        <IconButton size="small" onClick={handleAttemptClose} sx={closeIconButtonSx}>
                            <SvgIcon sx={navIconSx}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                        </IconButton>
                    </Box>

                    {/* Name */}
                    <Box sx={groupFieldWrapSx}>
                        <TextField
                            label="Group name"
                            fullWidth
                            placeholder="e.g. Marketing team"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            error={isDuplicateName}
                            helperText={isDuplicateName ? "A group with this name already exists." : ""}
                        />
                    </Box>

                    {/* Users — existing account users only, no new email invites */}
                    <Box sx={groupFieldWrapSx}>
                        <Autocomplete<typeof ALL_USERS[number], true>
                            multiple
                            options={ALL_USERS}
                            value={selectedUsers}
                            onChange={(_, val) => setSelectedUsers(val)}
                            getOptionLabel={u => u.name}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            disableCloseOnSelect
                            popupIcon={null}
                            renderTags={(tagValue, getTagProps) => (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                    {tagValue.map((user, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={user.id}
                                            label={user.name}
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            )}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    label="Users"
                                    placeholder={selectedUsers.length === 0 ? "Search by name…" : ""}
                                />
                            )}
                            renderOption={(props, option) => {
                                const au = findAccountUser(option.id, accountUsers);
                                return (
                                    <Box component="li" {...props} key={option.id}
                                        sx={{ display: "flex", alignItems: "center", gap: "10px", px: "12px", py: "8px" }}>
                                        <TruffleAvatar text={option.initials} size="small" sx={{ flexShrink: 0 }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={textPrimarySx}>{option.name}</Typography>
                                            <Typography variant="caption" sx={textSecondarySx}>
                                                {option.email}{au ? ` · ${au.createSpace}` : ""}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            }}
                        />
                    </Box>

                    {/* Actions */}
                    <Box sx={dialogActionsRowSx}>
                        <Button variant="outlined" onClick={handleAttemptClose} sx={cancelButtonSx}>Cancel</Button>
                        <Button
                            variant="contained"
                            disabled={!canSave}
                            onClick={() => {
                                onSave({
                                    name: name.trim(),
                                    userIds: selectedUsers.map(u => u.id),
                                    createPermission: "",
                                    amplifyPermission: ""
                                });
                                onClose();
                            }}
                        >
                            {mode === "create" ? "Create group" : "Save changes"}
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            {/* Discard unsaved changes confirmation */}
            <Dialog open={discardOpen} onClose={() => setDiscardOpen(false)} maxWidth={false}
                PaperProps={{ sx: { width: 420, borderRadius: "12px", p: 0 } }}>
                <Box sx={dialogBodySx}>
                    <Typography variant="h4" sx={{ ...textPrimarySx, mb: "8px" }}>
                    Discard changes?
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", mb: "24px", lineHeight: 1.6 }}>
                    You have unsaved changes. If you leave now, your changes will be lost.
                    </Typography>
                    <Box sx={dialogActionsRowSx}>
                        <Button variant="outlined" onClick={() => setDiscardOpen(false)} sx={cancelButtonSx}>
                        Keep editing
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                setDiscardOpen(false); onClose(); 
                            }}
                        >
                        Discard
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </>
    );
}

// ─── RemoveGroupDialog ────────────────────────────────────────────────────────
function RemoveGroupDialog({ open, onClose, group, onConfirm }: {
    open: boolean;
    onClose: () => void;
    group: UserGroup | null;
    onConfirm: (removeUsers: boolean) => void;
}) {
    if (!group) {
        return null;
    }
    return (
        <Dialog open={open} onClose={onClose} maxWidth={false}
            PaperProps={{ sx: { width: 480, borderRadius: "12px", p: 0 } }}>
            <Box sx={dialogBodySx}>
                <Box sx={dialogTitleRowMb16Sx}>
                    <Typography variant="h4" sx={textPrimarySx}>
                        Remove &ldquo;{group.name}&rdquo;?
                    </Typography>
                    <IconButton size="small" onClick={onClose} sx={closeIconButtonSx}>
                        <SvgIcon sx={navIconSx}><FontAwesomeIcon icon={faXmark} /></SvgIcon>
                    </IconButton>
                </Box>
                <Typography variant="body1" sx={{ color: "text.primary", mb: "8px", lineHeight: 1.6 }}>
                    This will remove the <strong>{group.name}</strong> group
                    ({group.userIds.length} {group.userIds.length === 1 ? "user" : "users"}).
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mb: "24px", lineHeight: 1.6 }}>
                    Do you also want to remove the permissions that were assigned to users through this group?
                    If you keep them, users will retain the group&rsquo;s permission individually.
                </Typography>
                <Box sx={removeGroupActionsRowSx}>
                    <Button variant="outlined" onClick={onClose} sx={cancelButtonSx}>Cancel</Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                            onConfirm(false); onClose(); 
                        }}
                    >
                        Keep user permissions
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            onConfirm(true); onClose(); 
                        }}
                    >
                        Remove group &amp; permissions
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}

// ─── GroupsSection ────────────────────────────────────────────────────────────
function GroupsSection({ accountUsers, groups, onGroupsChange }: {
    accountUsers: AccountUser[];
    groups: UserGroup[];
    onGroupsChange: React.Dispatch<React.SetStateAction<UserGroup[]>>;
}) {
    const [dialogMode, setDialogMode] = useState<"closed" | "create" | "edit">("closed");
    const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [groupToRemove, setGroupToRemove] = useState<UserGroup | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [rowMenuAnchor, setRowMenuAnchor] = useState<HTMLElement | null>(null);
    const [rowMenuGroup, setRowMenuGroup] = useState<UserGroup | null>(null);
    const [search, setSearch] = useState("");

    const isEmpty = groups.length === 0;

    const filteredGroups = search
        ? groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
        : groups;

    function resolveUserName(id: string): string {
        const known = ALL_USERS.find(u => u.id === id);
        return known ? known.name : id; // fall back to email string for new users
    }

    const headCellSx = { color: "text.primary", borderBottom: 1, borderBottomColor: "grey.300", py: "10px", px: "16px", whiteSpace: "nowrap" as const, bgcolor: "background.paper", position: "sticky", top: 0, zIndex: 3 };
    const bodyCellSx = { color: "text.primary", borderBottom: 1, borderBottomColor: "grey.300", py: "10px", px: "16px" };

    function openCreate() {
        setEditingGroup(null);
        setDialogMode("create");
    }

    function handleSave(data: Omit<UserGroup, "id" | "createdAt">) {
        const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        if (dialogMode === "create") {
            onGroupsChange(prev => [...prev, { ...data, id: `group-${Date.now()}`, createdAt: today }]);
        }
        else if (editingGroup) {
            onGroupsChange(prev => prev.map(g => g.id === editingGroup.id ? { ...g, ...data } : g));
        }
    }

    return (
        <Box sx={sectionContainerSx}>
            {/* Title row */}
            <Box sx={usersTitleRowSx}>
                <Typography variant="h3" sx={textPrimarySx}>
                    Groups{groups.length > 0 ? ` (${groups.length})` : ""}
                </Typography>
            </Box>

            {/* Toolbar — only when there are groups */}
            {!isEmpty && (
                <Box sx={usersToolbarRowSx}>
                    <Button
                        variant="outlined"
                        startIcon={<SvgIcon sx={{ fontSize: "16px !important" }}><FontAwesomeIcon icon={faPlus} /></SvgIcon>}
                        onClick={openCreate}
                        sx={addUserBtnSx}
                    >
                        Create group
                    </Button>
                    <Search
                        placeholder="Search groups…"
                        size="small"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onClear={() => setSearch("")}
                        numberOfResults={0}
                        sx={{ width: 240 }}
                    />
                </Box>
            )}

            {isEmpty ? (
                /* ── Empty state ── */
                <Box sx={groupEmptyStateSx}>
                    <Box sx={groupEmptyIconWrapSx}>
                        <SvgIcon sx={groupEmptyIconSx}><FontAwesomeIcon icon={faPeopleGroup} /></SvgIcon>
                    </Box>
                    <Typography variant="h4" sx={{ color: "text.primary", textAlign: "center" }}>
                        No groups yet
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", textAlign: "center", maxWidth: 380, lineHeight: 1.7 }}>
                        Groups let you publish templates for specific users, build approval teams, and control who gets mentioned when creating videos.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<SvgIcon sx={{ fontSize: "16px !important" }}><FontAwesomeIcon icon={faPlus} /></SvgIcon>}
                        onClick={openCreate}
                    >
                        Create your first group
                    </Button>
                </Box>
            ) : (
                /* ── Groups table ── */
                <Box sx={usersTableContainerSx}>
                    <Table size="small" sx={tableFullWidthSx}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={headCellSx}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                                        Name <SvgIcon sx={{ fontSize: 14, color: "action.active" }}><FontAwesomeIcon icon={faArrowDown} /></SvgIcon>
                                    </Box>
                                </TableCell>
                                <TableCell sx={headCellSx}>
                                    <Typography variant="subtitle2" sx={textPrimarySx}>Users</Typography>
                                </TableCell>
                                <TableCell sx={{ ...headCellSx, width: 160 }}>
                                    <Typography variant="subtitle2" sx={textPrimarySx}>Created on</Typography>
                                </TableCell>
                                <TableCell sx={{ ...headCellSx, width: 44 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredGroups.map(group => {
                                const isHovered = hoveredRow === group.id;
                                const isMenuOpen = rowMenuGroup?.id === group.id && Boolean(rowMenuAnchor);
                                const userListTooltip = group.userIds.length > 0 ? (
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                        {group.userIds.map(id => (
                                            <Typography key={id} variant="caption" sx={{ color: "common.white" }}>
                                                {resolveUserName(id)}
                                            </Typography>
                                        ))}
                                    </Box>
                                ) : "";
                                return (
                                    <TableRow
                                        key={group.id}
                                        onMouseEnter={() => setHoveredRow(group.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        sx={{ bgcolor: isHovered ? "grey.100" : "background.paper", transition: "background 0.1s" }}
                                    >
                                        <TableCell sx={bodyCellSx}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <SvgIcon sx={{ fontSize: 16, color: "action.active", flexShrink: 0 }}>
                                                    <FontAwesomeIcon icon={faPeopleGroup} />
                                                </SvgIcon>
                                                <Typography variant="subtitle2" sx={textPrimarySx}>{group.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={bodyCellSx}>
                                            {(() => {
                                                const names = group.userIds.map(id => resolveUserName(id));
                                                const shown = names.slice(0, 2);
                                                const remaining = names.length - shown.length;
                                                const displayText = shown.length > 0
                                                    ? shown.join(", ") + (remaining > 0 ? ` +${remaining}` : "")
                                                    : <Box component="span" sx={textSecondarySx}>No users</Box>;
                                                return (
                                                    <Tooltip
                                                        title={userListTooltip}
                                                        placement="top"
                                                        arrow
                                                        componentsProps={{ tooltip: { sx: { bgcolor: "secondary.main", "& .MuiTooltip-arrow": { color: "secondary.main" } } } }}
                                                    >
                                                        <Typography variant="body1" sx={{ ...textPrimarySx, display: "inline" }}>
                                                            {displayText}
                                                        </Typography>
                                                    </Tooltip>
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell sx={{ ...bodyCellSx, width: 160 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
                                                <Typography variant="body1" sx={{ color: "text.primary", whiteSpace: "nowrap" }}>
                                                    {group.createdAt}
                                                </Typography>
                                                {(isHovered || isMenuOpen) && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={e => {
                                                            setRowMenuAnchor(e.currentTarget); setRowMenuGroup(group); 
                                                        }}
                                                        sx={ellipsisButtonSx}
                                                    >
                                                        <SvgIcon sx={{ fontSize: 18 }}><FontAwesomeIcon icon={faEllipsis} /></SvgIcon>
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ ...bodyCellSx, width: 44 }} />
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Box>
            )}

            {/* Row context menu */}
            <Menu
                anchorEl={rowMenuAnchor}
                open={Boolean(rowMenuAnchor)}
                onClose={() => {
                    setRowMenuAnchor(null); setRowMenuGroup(null); 
                }}
                PaperProps={{ sx: contextMenuPaperSx }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                <MenuItem
                    onClick={() => {
                        setEditingGroup(rowMenuGroup);
                        setDialogMode("edit");
                        setRowMenuAnchor(null);
                        setRowMenuGroup(null);
                    }}
                    sx={menuItemEditSx}
                >
                    <SvgIcon sx={{ fontSize: 16, color: "action.active" }}><FontAwesomeIcon icon={faPenToSquare} /></SvgIcon>
                    Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setGroupToRemove(rowMenuGroup);
                        setRemoveOpen(true);
                        setRowMenuAnchor(null);
                        setRowMenuGroup(null);
                    }}
                    sx={menuItemRemoveSx}
                >
                    <SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faTrash} /></SvgIcon>
                    Remove
                </MenuItem>
            </Menu>

            {/* Create / Edit dialog */}
            <GroupDialog
                open={dialogMode !== "closed"}
                onClose={() => setDialogMode("closed")}
                mode={dialogMode === "edit" ? "edit" : "create"}
                group={editingGroup ?? undefined}
                accountUsers={accountUsers}
                existingGroups={groups}
                onSave={handleSave}
            />

            {/* Remove confirmation */}
            <RemoveGroupDialog
                open={removeOpen}
                onClose={() => setRemoveOpen(false)}
                group={groupToRemove}
                onConfirm={(removeUsers) => {
                    if (groupToRemove) {
                        onGroupsChange(prev => prev.filter(g => g.id !== groupToRemove.id));
                        void removeUsers;
                    }
                }}
            />
        </Box>
    );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────
function PlaceholderSection({ label }: { label: string }) {
    return (
        <Box sx={placeholderContainerSx}>
            <Typography variant="body1" sx={textSecondarySx}>
                {label} settings coming soon
            </Typography>
        </Box>
    );
}

// ─── Viewing & Editing Permissions section ────────────────────────────────────

// Small reusable helpers (only used in this section)
function PermGroup({ title, children }: { title: string; children: React.ReactNode }) {
    const childArray = React.Children.toArray(children);
    return (
        <Box sx={permGroupSx}>
            <Typography variant="h5" sx={permGroupTitleSx}>{title}</Typography>
            <Box sx={permGroupCardSx}>
                {childArray.map((child, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && <Divider />}
                        {child}
                    </React.Fragment>
                ))}
            </Box>
        </Box>
    );
}



function PermRow({
    label,
    fixedLabels = DEFAULT_FIXED_LABELS,
    info
}: {
    label: string;
    fixedLabels?: string[];
    info?: string;
}) {
    const [value, setValue] = React.useState(fixedLabels[0]);
    return (
        <Box sx={permRowSx}>
            <Box sx={permLabelBoxSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Typography variant="body1" sx={textPrimarySx}>{label}</Typography>
                    {info && (
                        <Tooltip title={info} placement="top" arrow componentsProps={{ tooltip: { sx: { bgcolor: "secondary.main" } } }}>
                            <SvgIcon sx={{ fontSize: "12px !important", width: "12px !important", height: "12px !important", color: "action.active", cursor: "help" }}>
                                <FontAwesomeIcon icon={faCircleInfo} />
                            </SvgIcon>
                        </Tooltip>
                    )}
                </Box>
            </Box>
            <Select
                value={value}
                onChange={e => setValue(e.target.value)}
                size="small"
                variant="outlined"
                sx={permSelectSx}
            >
                {fixedLabels.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </Select>
        </Box>
    );
}

type PermOption =
    | { kind: "fixed"; label: string }
    | { kind: "user"; user: typeof ALL_USERS[number] }
    | { kind: "group"; group: UserGroup };

const EDITOR_USER_OPTIONS: PermOption[] = ALL_USERS.map(u => ({ kind: "user" as const, user: u }));

const DEFAULT_FIXED_LABELS = ["Restrict", "Users with editor permission"];

function getPermOptionLabel(opt: PermOption): string {
    if (opt.kind === "fixed") {
        return opt.label;
    }
    if (opt.kind === "user") {
        return opt.user.name || opt.user.email;
    }
    return opt.group.name;
}

function PermRowWithUsers({
    label,
    fixedLabels = DEFAULT_FIXED_LABELS,
    groups = [],
    info
}: {
    label: string;
    fixedLabels?: string[];
    groups?: UserGroup[];
    info?: string;
}) {
    const defaultLabel = fixedLabels[0];
    const groupOptions: PermOption[] = groups.map(g => ({ kind: "group", group: g }));
    const allOptions: PermOption[] = [
        ...fixedLabels.map(l => ({ kind: "fixed" as const, label: l })),
        ...groupOptions,
        ...EDITOR_USER_OPTIONS
    ];

    const [fixedValue, setFixedValue] = React.useState(defaultLabel);
    const [selectedUsers, setSelectedUsers] = React.useState<typeof ALL_USERS[number][]>([]);
    const [selectedGroups, setSelectedGroups] = React.useState<UserGroup[]>([]);
    const [isEditing, setIsEditing] = React.useState(false);

    const hasSelection = selectedUsers.length > 0 || selectedGroups.length > 0;
    const showAsSelect = !isEditing && !hasSelection;

    const autocompleteValue: PermOption[] = hasSelection
        ? [
            ...selectedUsers.map(u => ({ kind: "user" as const, user: u })),
            ...selectedGroups.map(g => ({ kind: "group" as const, group: g }))
        ]
        : [{ kind: "fixed" as const, label: fixedValue }];

    const handleChange = (_e: React.SyntheticEvent, newValue: PermOption[]) => {
        const last = newValue[newValue.length - 1];
        if (!last) {
            setFixedValue(defaultLabel);
            setSelectedUsers([]);
            setSelectedGroups([]);
            setIsEditing(false);
            return;
        }
        if (last.kind === "fixed") {
            setFixedValue(last.label);
            setSelectedUsers([]);
            setSelectedGroups([]);
            setIsEditing(false);
        }
        else {
            setFixedValue("");
            setSelectedUsers(
                newValue
                    .filter((v): v is { kind: "user"; user: typeof ALL_USERS[number] } => v.kind === "user")
                    .map(v => v.user)
            );
            setSelectedGroups(
                newValue
                    .filter((v): v is { kind: "group"; group: UserGroup } => v.kind === "group")
                    .map(v => v.group)
            );
        }
    };

    const labelCol = (
        <Box sx={permLabelBoxSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Typography variant="body1" sx={textPrimarySx}>{label}</Typography>
                {info && (
                    <Tooltip title={info} placement="top" arrow componentsProps={{ tooltip: { sx: { bgcolor: "secondary.main" } } }}>
                        <SvgIcon sx={{ fontSize: "12px !important", width: "12px !important", height: "12px !important", color: "action.active", cursor: "help" }}>
                            <FontAwesomeIcon icon={faCircleInfo} />
                        </SvgIcon>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );

    if (showAsSelect) {
        return (
            <Box sx={permRowSx}>
                {labelCol}
                <Select
                    value={fixedValue}
                    open={false}
                    onOpen={() => setIsEditing(true)}
                    size="small"
                    variant="outlined"
                    sx={permSelectSx}
                >
                    {fixedLabels.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
            </Box>
        );
    }

    return (
        <Box sx={permRowSx}>
            {labelCol}
            <Autocomplete<PermOption, true>
                multiple
                disableCloseOnSelect
                open={isEditing}
                onOpen={() => setIsEditing(true)}
                onClose={() => setIsEditing(false)}
                options={allOptions}
                value={autocompleteValue}
                onChange={handleChange}
                getOptionLabel={getPermOptionLabel}
                isOptionEqualToValue={(a, b) => {
                    if (a.kind !== b.kind) {
                        return false;
                    }
                    if (a.kind === "fixed" && b.kind === "fixed") {
                        return a.label === b.label;
                    }
                    if (a.kind === "user" && b.kind === "user") {
                        return a.user.id === b.user.id;
                    }
                    if (a.kind === "group" && b.kind === "group") {
                        return a.group.id === b.group.id;
                    }
                    return false;
                }}
                groupBy={opt => opt.kind}
                filterOptions={(options, state) => {
                    const input = state.inputValue.toLowerCase();
                    if (!input) {
                        return options;
                    }
                    return options.filter(o =>
                        o.kind === "fixed" ? true :
                            o.kind === "user" ? (o.user.name || "").toLowerCase().includes(input) || o.user.email.toLowerCase().includes(input) :
                                o.kind === "group" ? o.group.name.toLowerCase().includes(input) : false
                    );
                }}
                renderGroup={(params) => (
                    <React.Fragment key={params.key}>
                        {/* Divider + section header for groups and users */}
                        {(params.group === "group" || params.group === "user") && (
                            <Box sx={permDropdownSectionSx}>
                                <Divider />
                                <Typography variant="subtitle2" sx={permDropdownSectionLabelSx}>
                                    {params.group === "group" ? "Groups" : "Specific users"}
                                </Typography>
                            </Box>
                        )}
                        <Box component="ul" sx={permAutocompleteGroupListSx}>
                            {params.children}
                        </Box>
                    </React.Fragment>
                )}
                renderOption={(props, opt) => (
                    <MenuItem {...props} key={getPermOptionLabel(opt)}>
                        {getPermOptionLabel(opt)}
                    </MenuItem>
                )}
                renderTags={(vals, getTagProps) =>
                    vals.map((opt, i) => {
                        if (opt.kind === "fixed") {
                            return (
                                <Typography key={i} variant="body1" sx={permFixedChipSx}>
                                    {getPermOptionLabel(opt)}
                                </Typography>
                            );
                        }
                        return (
                            <Chip
                                label={getPermOptionLabel(opt)}
                                size="small"
                                {...getTagProps({ index: i })}
                            />
                        );
                    })
                }
                size="small"
                renderInput={params => (
                    <TextField {...params} size="small" autoFocus={!hasSelection} />
                )}
                sx={permAutocompleteSx}
            />
        </Box>
    );
}

function ViewEditPermissionsSection({ groups = [] }: { groups?: UserGroup[] }) {

    return (
        <Box sx={sectionContainerSx}>
            <Typography variant="h3" sx={{ color: "text.primary", mb: "12px", flexShrink: 0 }}>
                Access Defaults
            </Typography>

            {/* Explanation */}
            <AttentionBox sx={{ mb: "16px", flexShrink: 0 }}>
                <AttentionBoxContent>
                    These are the default permissions you set as the account owner.
                    Individual owners can still change permissions on their own content.
                </AttentionBoxContent>
            </AttentionBox>

            {/* Scrollable perm groups */}
            <Box sx={permGroupsScrollSx}>
                {/* Videos and templates */}
                <PermGroup title="Videos and templates">
                    <PermRow
                        label="Edit videos and templates"
                        fixedLabels={["All users with editor permissions", "Private to owner"]}
                    />
                    <PermRowWithUsers
                        label="Videos and templates are visible to"
                        fixedLabels={["Everyone in the account", "Restrict"]}
                        groups={groups}
                    />
                </PermGroup>

                {/* Custom avatars */}
                <PermGroup title="Custom avatars">
                    <PermRowWithUsers
                        label="Avatar owner"
                        fixedLabels={["All users with editor permissions", "Private to owner"]}
                        groups={groups}
                        info="Can delete, manage access"
                    />
                    <PermRowWithUsers
                        label="Using a custom avatar in a video"
                        fixedLabels={["Users can ask owners to use", "Users with editor permission"]}
                        groups={groups}
                    />
                </PermGroup>

                {/* Custom voice */}
                <PermGroup title="Custom voice">
                    <PermRowWithUsers
                        label="Custom voice owner"
                        fixedLabels={["All users with editor permissions", "Private to owner"]}
                        groups={groups}
                        info="Can delete, manage access"
                    />
                    <PermRowWithUsers
                        label="Use a custom voice in a video"
                        fixedLabels={["Users can ask owners to use", "Users with editor permission"]}
                        groups={groups}
                    />
                </PermGroup>

                {/* Brand */}
                <PermGroup title="Brand">
                    <PermRowWithUsers
                        label="Brand owner"
                        fixedLabels={["All users with editor permissions", "Private to owner"]}
                        groups={groups}
                        info="Can delete, manage access"
                    />
                    <PermRowWithUsers
                        label="Using a brand in a video"
                        fixedLabels={["Users can ask owners to use", "Users with editor permission"]}
                        groups={groups}
                    />
                </PermGroup>
            </Box>

        </Box>
    );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────
interface VideoStateForApprovals {
 sentApprovers?: string[]
 sentAt?: string
}

interface AccountSettingsDialogProps {
 open: boolean
 onClose: () => void
 approvalsEnabled?: boolean
 approverIds?: Set<string>
 onApprovalsEnabledChange?: (enabled: boolean, hasPendingApprovals?: boolean) => void
 onApproversChange?: (approverIds: Set<string>) => void
 onApproversListChange?: (approvers: { value: string; label: string }[]) => void
 onUserDeletionBlocked?: (userId: string, reason: "only-approver" | "pending-approvals") => void
 onCancelUserApprovals?: (userId: string) => void
 videoStates?: Record<string, VideoStateForApprovals>
 pendingApprovalsCount?: number
 initialTab?: "users" | "permissions" | "approvals" | "access" | "groups" | NavKey
 userRole?: UserRole
 appVersion?: AppVersion
}

const DEFAULT_APPROVER_IDS = new Set<string>();
const DEFAULT_VIDEO_STATES: Record<string, VideoStateForApprovals> = {};

export default function AccountSettingsDialog({
    open,
    onClose,
    approvalsEnabled: externalApprovalsEnabled = false,
    approverIds: externalApproverIds = DEFAULT_APPROVER_IDS,
    onApprovalsEnabledChange,
    onApproversChange,
    onApproversListChange,
    onUserDeletionBlocked,
    onCancelUserApprovals,
    videoStates = DEFAULT_VIDEO_STATES,
    pendingApprovalsCount = 0,
    initialTab = "users",
    userRole = "account-owner",
    appVersion = "v2"
}: AccountSettingsDialogProps) {
    const resolveInitialTab = (t: string): NavKey => {
        if (t === "access" || t === "view-edit-permissions") {
            return "permissions-view-edit";
        }
        if (t === "permissions") {
            return "permissions-ai";
        }
        return t as NavKey;
    };
    const [nav, setNav] = useState<NavKey>(resolveInitialTab(initialTab));

    // Filter NAV based on appVersion
    const filteredNav = useMemo(() => {
        let filtered = NAV;
        if (appVersion === "v2") {
            // Hide Groups and Access Defaults in v2
            filtered = filtered.filter(item => item.key !== "groups" && item.key !== "permissions-view-edit");
            // In v2, change "AI features" to "Permissions" with lock icon
            filtered = filtered.map(item =>
                item.key === "permissions-ai"
                    ? { ...item, label: "Permissions", icon: <SvgIcon sx={navIconSx}><FontAwesomeIcon icon={faLock} /></SvgIcon> }
                    : item
            );
        }
        // v1 shows all tabs with original names
        return filtered;
    }, [appVersion]);
    const [users, setUsers] = useState<AccountUser[]>(INITIAL_USERS);
    const [approverIds, setApproverIds] = useState<Set<string>>(externalApproverIds);
    const [approvalsEnabled, setApprovalsEnabled] = useState(externalApprovalsEnabled);
    const [enableApprovalsPromptOpen, setEnableApprovalsPromptOpen] = useState(false);
    const [groups, setGroups] = useState<UserGroup[]>([]);

    // Sync nav when initialTab changes
    React.useEffect(() => {
        setNav(resolveInitialTab(initialTab));
    }, [initialTab]);

    // Sync external approvals state
    React.useEffect(() => {
        setApprovalsEnabled(externalApprovalsEnabled);
    }, [externalApprovalsEnabled]);

    // Sync external approver IDs - but don't clear if local has content and external is empty
    React.useEffect(() => {
        // Only sync if: (1) external is non-empty, OR (2) both are empty, OR (3) external has content
        // Don't sync if external is empty but local has content (prevents losing locally added approvers)
        if (externalApproverIds.size > 0 || approverIds.size === 0) {
            const externalArray = JSON.stringify(Array.from(externalApproverIds).sort());
            const currentArray = JSON.stringify(Array.from(approverIds).sort());
            if (externalArray !== currentArray) {
                setApproverIds(new Set(externalApproverIds));
            }
        }
        // If external is empty but local has content, don't overwrite local
    }, [externalApproverIds]);

    function handleInviteUser(rows: InviteRow[], asApprover = false) {
        const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const newUsers: AccountUser[] = rows.map((r, i) => ({
            user: { id: `invited-${Date.now()}-${i}`, initials: r.email.slice(0, 2).toUpperCase(), name: r.email, email: r.email, color: "primary.main" },
            createSpace: r.createSpace,
            amplifySpace: r.amplifySpace,
            jobRole: "Pending",
            lastLogin: "Pending",
            createdDate: today,
            pending: true,
            addedAsApprover: asApprover ? today : undefined
        }));
        setUsers(prev => [...prev, ...newUsers]);
        if (asApprover) {
            setApproverIds(prev => {
                const s = new Set(prev); newUsers.forEach(u => s.add(u.user.id)); return s; 
            });
            // Show "Enable request approvals?" prompt if approvals are disabled
            if (!approvalsEnabled) {
                setEnableApprovalsPromptOpen(true);
            }
        }
    }

    function handleSetApprovers(ids: string[]) {
        const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        // Check if any new approvers are being added (not already in approverIds)
        const newApproverAdded = ids.some(id => !approverIds.has(id));

        setUsers(prev => prev.map(u => ({
            ...u,
            addedAsApprover: ids.includes(u.user.id) && !u.addedAsApprover ? today : u.addedAsApprover
        })));
        const newApproverIds = new Set(ids);
        setApproverIds(newApproverIds);
        onApproversChange?.(newApproverIds);

        // Show "Enable request approvals?" prompt if new approvers were added and approvals are disabled
        if (newApproverAdded && !approvalsEnabled) {
            setEnableApprovalsPromptOpen(true);
        }
    }

    const lastApproversListRef = React.useRef<string>("");

    // Whenever the users list or approver IDs change, push the filtered approver list to parent.
    // NOTE: externalApproversList is intentionally excluded from deps — including it creates a circular
    // dependency (effect → onApproversListChange → setApproversList → new externalApproversList ref → effect).
    React.useEffect(() => {
        const computedApprovers = users
            .filter(u => u.createSpace.includes("Approver") || approverIds.has(u.user.id))
            .map(u => ({ value: u.user.id, label: `${u.user.name} (${u.user.email})` }));
        const serialized = JSON.stringify(computedApprovers);
        if (serialized !== lastApproversListRef.current) {
            lastApproversListRef.current = serialized;
            onApproversListChange?.(computedApprovers);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users, approverIds]);

    // Helper function to check if a user has pending approvals
    function getUserPendingApprovals(userId: string) {
        const videoTitles: string[] = [];
        Object.entries(videoStates).forEach(([videoTitle, state]) => {
            if (state.sentApprovers?.includes(userId)) {
                videoTitles.push(videoTitle);
            }
        });
        return videoTitles;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            keepMounted
            PaperProps={{ sx: { width: 1020, maxWidth: "95vw", height: 680, maxHeight: "90vh", borderRadius: "12px", display: "flex", flexDirection: "column", overflow: "hidden", p: 0 } }}
        >
            {/* Title bar */}
            <TruffleDialogTitle
                HelpCenterIconButtonProps={{ onClick: () => {} }}
                CloseIconButtonProps={{
                    onClick: onClose
                }}
            >
 Account settings
            </TruffleDialogTitle>

            {/* Body */}
            <Box sx={dialogFlexBodySx}>
                {/* Sidebar */}
                <List sx={{ ...sidebarSx, gap: "0px" }}>
                    {filteredNav.map(item => (
                        <ListItemButton
                            key={item.key}
                            selected={nav === item.key}
                            onClick={() => setNav(item.key)}
                            disableRipple
                            sx={{
                                px: "12px",
                                py: "0px",
                                borderRadius: "8px",
                                minHeight: "45px",
                                height: "45px",
                                gap: "8px",
                                color: nav === item.key ? "primary.main" : "text.primary",
                                "&:hover": {
                                    bgcolor: "action.hover"
                                },
                                "&.Mui-selected": {
                                    bgcolor: "action.hover",
                                    color: "primary.main",
                                    "& .MuiListItemIcon-root": {
                                        color: "primary.main"
                                    }
                                },
                                "& .MuiListItemIcon-root": {
                                    color: nav === item.key ? "primary.main" : "action.active",
                                    minWidth: 28,
                                    margin: 0,
                                    fontSize: "18px"
                                },
                                "& .MuiListItemText-root": {
                                    margin: 0,
                                    "& .MuiTypography-root": {
                                        lineHeight: 1,
                                        fontSize: "14px"
                                    }
                                }
                            }}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    variant: "body1",
                                    sx: { fontWeight: nav === item.key ? 600 : 400 }
                                }}
                            />
                        </ListItemButton>
                    ))}

                </List>

                {/* Content */}
                <Box sx={contentAreaSx}>
                    {nav === "users" && (
                        <UsersSection
                            users={users}
                            onInviteUser={rows => handleInviteUser(rows, false)}
                            onUserDeleted={(userId) => {
                                const pendingApprovalsForUser = getUserPendingApprovals(userId);
                                if (approvalsEnabled && pendingApprovalsForUser.length > 0) {
                                    // Block deletion if user has ANY pending approvals - they must cancel them first
                                    onUserDeletionBlocked?.(userId, "pending-approvals");
                                    return;
                                }
                                setUsers(prev => prev.filter(u => u.user.id !== userId));
                                setApproverIds(prev => {
                                    const s = new Set(prev); s.delete(userId); return s;
                                });
                            }}
                            onPermissionsChanged={(userId, createSpace, amplifySpace) => {
                                setUsers(prev => prev.map(u =>
                                    u.user.id === userId ? { ...u, createSpace, amplifySpace } : u
                                ));
                                // If user now has Approver role, add to approverIds
                                // Never remove pending users from approverIds — keep them as approvers even if their role changes
                                const userHasApprover = createSpace.includes("Approver");
                                const user = users.find(u => u.user.id === userId);
                                const isPending = user?.pending ?? false;

                                setApproverIds(prev => {
                                    const s = new Set(prev);
                                    if (userHasApprover && !s.has(userId)) {
                                        s.add(userId);
                                    }
                                    else if (!userHasApprover && s.has(userId) && !isPending) {
                                        // Only remove if not pending
                                        s.delete(userId);
                                    }
                                    return s;
                                });
                            }}
                            approvalsEnabled={approvalsEnabled}
                            approverIds={approverIds}
                            videoStates={videoStates}
                            onClose={onClose}
                            onEnableApprovalsRequested={() => {
                                setNav("approvals");
                                setApprovalsEnabled(true);
                                onApprovalsEnabledChange?.(true);
                            }}
                            onToggleApprovals={(enabled) => {
                                setApprovalsEnabled(enabled);
                                onApprovalsEnabledChange?.(enabled);
                            }}
                            userRole={userRole}
                            pendingApprovalsCount={pendingApprovalsCount}
                        />
                    )}
                    {nav === "groups" && (
                        <GroupsSection
                            accountUsers={users}
                            groups={groups}
                            onGroupsChange={setGroups}
                        />
                    )}
                    {nav === "permissions-ai" && <PlaceholderSection label="AI features" />}
                    {/* Keep mounted so state survives tab switches */}
                    <Box sx={{ display: nav === "permissions-view-edit" ? "contents" : "none" }}>
                        <ViewEditPermissionsSection groups={groups} />
                    </Box>
                    {nav === "approvals" && (
                        <ApprovalsSection
                            users={users}
                            approverIds={approverIds}
                            enabled={approvalsEnabled}
                            onToggle={(enabled) => {
                                setApprovalsEnabled(enabled);
                                // Notify parent if approvals are being turned OFF with pending approvals
                                if (!enabled && pendingApprovalsCount > 0) {
                                    onApprovalsEnabledChange?.(enabled, true);
                                }
                                else {
                                    onApprovalsEnabledChange?.(enabled);
                                }
                            }}
                            onSetApprovers={(ids) => {
                                handleSetApprovers(ids);
                            }}
                            onAddUsers={(rows, asApprover) => handleInviteUser(rows, asApprover)}
                            onPermissionsChanged={(userId, createSpace, amplifySpace) => {
                                setUsers(prev => prev.map(u =>
                                    u.user.id === userId ? { ...u, createSpace, amplifySpace } : u
                                ));
                            }}
                            onUserDeleted={(userId) => {
                                setUsers(prev => prev.filter(u => u.user.id !== userId));
                                onCancelUserApprovals?.(userId);
                            }}
                            pendingApprovalsCount={pendingApprovalsCount}
                            videoStates={videoStates}
                            userRole={userRole}
                        />
                    )}
                </Box>
            </Box>

            {/* Enable Request Approvals Prompt */}
            <Dialog
                open={enableApprovalsPromptOpen}
                onClose={() => setEnableApprovalsPromptOpen(false)}
                maxWidth={false}
                PaperProps={{ sx: { width: 480, borderRadius: "12px", p: 0 } }}
            >
                <Box sx={dialogBodySx}>
                    <Typography variant="h4" sx={dialogTitleSx}>
 Enable request approvals?
                    </Typography>
                    <Typography variant="body1" sx={dialogBodyTextSx}>
 Editors will be able to request approvals from users with approval access.
                    </Typography>
                    <Box sx={dialogActionsRowSx}>
                        <Button
                            variant="outlined"
                            onClick={() => setEnableApprovalsPromptOpen(false)}
                            sx={cancelButtonSx}
                        >
 I'll do it later
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setEnableApprovalsPromptOpen(false);
                                setApprovalsEnabled(true);
                                onApprovalsEnabledChange?.(true);
                            }}
                        >
 Enable request approvals for all videos and templates
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </Dialog>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

// General / shared
const textPrimarySx: SxProps<Theme> = { color: "text.primary" };
const textSecondarySx: SxProps<Theme> = { color: "text.secondary" };
// Buttons
const cancelButtonSx: SxProps<Theme> = { color: "text.primary", borderColor: "grey.300" };
const textCancelButtonSx: SxProps<Theme> = { color: "text.primary" };
const disabledButtonSx: SxProps<Theme> = { "&.Mui-disabled": { bgcolor: "grey.300", color: "common.white" } };
const textLinkButtonSx: SxProps<Theme> = { color: "primary.main", p: 0, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } };
const contactSalesLinkSx: SxProps<Theme> = { color: "primary.main", cursor: "pointer", textDecoration: "underline" };
const closeIconButtonSx: SxProps<Theme> = { color: "action.active" };
const ellipsisButtonSx: SxProps<Theme> = { color: "text.primary", p: "4px", "&:hover": { bgcolor: "grey.100" } };

// Icons
const infoBoxIconSx: SxProps<Theme> = { fontSize: 16, color: "primary.main", mt: "1px", flexShrink: 0 };

// SeatHeader
// CreateSpaceSelector

// UserCell
const userCellContainerSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "10px", cursor: "default" };
const userCellAvatarSx: SxProps<Theme> = { bgcolor: "secondary.main", borderRadius: "8px", flexShrink: 0 };
const userCellTextBoxSx: SxProps<Theme> = { minWidth: 0 };
const userCellNameSx: SxProps<Theme> = { color: "text.primary", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const userCellRoleSx: SxProps<Theme> = { color: "text.secondary", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

// Dialogs (shared layout)
const dialogBodySx: SxProps<Theme> = { px: "24px", py: "20px" };
const dialogTitleRowMb16Sx: SxProps<Theme> = { display: "flex", alignItems: "center", justifyContent: "space-between", mb: "16px" };
const dialogTitleRowMb24Sx: SxProps<Theme> = { display: "flex", alignItems: "center", justifyContent: "space-between", mb: "24px" };
const dialogTitleSx: SxProps<Theme> = { color: "text.primary", mb: "12px" };
const dialogBodyTextSx: SxProps<Theme> = { color: "text.secondary", mb: "24px", lineHeight: 1.6 };
const dialogActionsRowSx: SxProps<Theme> = { display: "flex", justifyContent: "flex-end", gap: "12px" };
const dialogFlexBodySx: SxProps<Theme> = { display: "flex", flex: 1, overflow: "hidden" };

// Info box
const infoBoxSx: SxProps<Theme> = { display: "flex", alignItems: "flex-start", gap: "8px", bgcolor: "action.hover", borderRadius: "8px", px: "14px", py: "12px", mb: "20px" };
const existingEmailInputSx: SxProps<Theme> = { height: 40, mb: "16px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "grey.300" } };

// Context menus
const contextMenuPaperSx: SxProps<Theme> = { borderRadius: "10px", minWidth: 240, boxShadow: "0px 4px 20px rgba(3,25,79,0.15)", py: "8px" };
const menuItemEditSx: SxProps<Theme> = { color: "text.primary", px: "16px", py: "8px", gap: "10px" };
const menuItemRemoveSx: SxProps<Theme> = { color: "error.main", px: "16px", py: "8px", gap: "10px" };

// Card
const cardTitleSx: SxProps<Theme> = { color: "text.primary", mb: "2px" };

// Tables
const tableFullWidthSx: SxProps<Theme> = { width: "100%" };
const approversTableContainerSx: SxProps<Theme> = { borderRadius: "8px", border: 1, borderColor: "grey.300", overflow: "auto", maxHeight: 300 };
const usersTableContainerSx: SxProps<Theme> = { flex: 1, overflowX: "auto", overflowY: "auto", borderRadius: "8px", border: 1, borderColor: "grey.300" };

// ApprovalsSection
const sectionContainerSx: SxProps<Theme> = { display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" };
const approvalToggleContainerSx: SxProps<Theme> = { border: 1, borderColor: "grey.300", borderRadius: "10px", overflow: "hidden", flexShrink: 0 };
const approvalToggleInnerSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "12px", px: "16px", py: "14px" };
const approvalStampIconSx: SxProps<Theme> = { fontSize: 22, color: "primary.main", flexShrink: 0 };
const switchSx: SxProps<Theme> = { "& .MuiSwitch-switchBase.Mui-checked": { color: "common.white" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "primary.main" } };

// Main dialog layout
const sidebarSx: SxProps<Theme> = { width: 226, flexShrink: 0, borderRight: 1, borderRightColor: "grey.300", py: "12px", px: "8px", display: "flex", flexDirection: "column", gap: "2px", bgcolor: "grey.50" };
const contentAreaSx: SxProps<Theme> = { flex: 1, overflow: "hidden", px: "24px", py: "20px", display: "flex", flexDirection: "column" };
const placeholderContainerSx: SxProps<Theme> = { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" };

// UsersSection
const usersTitleRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", justifyContent: "space-between", mb: "16px", flexShrink: 0 };
const userTabsSx: SxProps<Theme> = { mb: "16px", minHeight: 42, flexShrink: 0 };
const tabItemSx: SxProps<Theme> = { textTransform: "none", minHeight: 42, py: 0, px: "12px" };
const tabLabelBoxSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "8px" };
const usersToolbarRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", justifyContent: "space-between", mb: "16px", flexShrink: 0 };
const addUserBtnSx: SxProps<Theme> = { color: "primary.main", borderColor: "grey.300", "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" } };
const userTypeCellSx: SxProps<Theme> = { display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" };

// UserTypeSelector
const userTypeSelectorFieldSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "8px", border: 1, borderColor: "grey.300", borderRadius: "4px", px: "12px", height: 40, cursor: "pointer", "&:hover": { borderColor: "primary.main" } };
const userTypePopoverPaperSx: SxProps<Theme> = { borderRadius: "8px", width: 360 };
const userTypeSectionHeaderSx: SxProps<Theme> = { display: "flex", alignItems: "center", justifyContent: "space-between", px: "16px", py: "10px", bgcolor: "background.default" };
const userTypeOptionSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: "12px", px: "16px", py: "10px", transition: "background 0.1s" };

// Edit/Add user dialog fields
const editUserContentSx: SxProps<Theme> = { px: "24px", py: "20px" };
const editUserFieldLabelSx: SxProps<Theme> = { color: "text.secondary", mb: "6px", display: "block" };

// GroupDialog
const groupDialogScrollSx: SxProps<Theme> = { px: "24px", py: "20px", overflowY: "auto", flex: 1 };
const groupFieldWrapSx: SxProps<Theme> = { mb: "20px" };
const removeGroupActionsRowSx: SxProps<Theme> = { display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap" };

// GroupsSection — empty state
const groupEmptyStateSx: SxProps<Theme> = { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", py: 4 };
const groupEmptyIconWrapSx: SxProps<Theme> = { width: 64, height: 64, borderRadius: "16px", bgcolor: "primary.light", display: "flex", alignItems: "center", justifyContent: "center", mb: "4px" };
const groupEmptyIconSx: SxProps<Theme> = { fontSize: "28px !important", width: "28px !important", height: "28px !important", color: "primary.main" };

// ViewEditPermissionsSection
const permGroupSx: SxProps<Theme> = { display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 };
const permGroupTitleSx: SxProps<Theme> = { color: "text.primary" };
const permGroupCardSx: SxProps<Theme> = { border: 1, borderColor: "divider", borderRadius: "10px", overflow: "hidden", bgcolor: "background.paper" };
const permGroupsScrollSx: SxProps<Theme> = { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "48px", pb: "8px" };
const permRowSx: SxProps<Theme> = { display: "flex", alignItems: "center", justifyContent: "flex-start", px: "16px", py: "10px", gap: "16px" };
const permLabelBoxSx: SxProps<Theme> = { display: "flex", flexDirection: "column", gap: "2px", width: 260, flexShrink: 0 };
const permSelectSx: SxProps<Theme> = { flex: 1, minWidth: 180, "& .MuiSelect-select": { py: "4px" } };
const permAutocompleteSx: SxProps<Theme> = { flex: 1 };
const permAutocompleteGroupListSx: SxProps<Theme> = { p: 0, m: 0, listStyle: "none" };
const permDropdownSectionSx: SxProps<Theme> = {};
const permDropdownSectionLabelSx: SxProps<Theme> = { color: "text.secondary", px: 2, display: "block", py: 0.75, bgcolor: (theme) => theme.palette.grey[50] };
const permFixedChipSx: SxProps<Theme> = { color: "text.primary", px: 0.5, lineHeight: 1 };
const removeApproverContentSx: SxProps<Theme> = { px: "32px", pt: "0 !important", pb: "8px" };
