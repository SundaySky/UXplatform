import { useMemo, useState } from "react";
import {
    Dialog, DialogContent, TextField,
    Typography, SvgIcon, FormLabel,
    Box, ToggleButton, Chip, Autocomplete
    , Button } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    TruffleDialogTitle, TruffleDialogActions, TruffleToggleButtonGroup,
    AttentionBox, AttentionBoxContent
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faTriangleExclamation } from "@fortawesome/pro-regular-svg-icons";
import type { SyntheticEvent } from "react";

// Sectioned audience options for the "Who can view and edit" dropdown.
// Order matters — MUI Autocomplete groups consecutive options that share a
// groupBy result, so the array order drives section order.
type AudienceOption = {
    value: string;
    label: string;
    category: "all" | "groups" | "users";
};

const AUDIENCE_GROUPS = ["Sales", "Marketing", "Legal"];

const AUDIENCE_USERS = [
    { name: "Sarah Johnson", email: "sjohnson@company.com" },
    { name: "Michael Chen", email: "mchen@company.com" },
    { name: "Emma Rodriguez", email: "erodriguez@company.com" },
    { name: "James Wilson", email: "jwilson@company.com" }
];

const AUDIENCE_OPTIONS: AudienceOption[] = [
    { value: "All contributors", label: "All contributors", category: "all" },
    ...AUDIENCE_GROUPS.map(g => ({ value: g, label: g, category: "groups" as const })),
    ...AUDIENCE_USERS.map(u => ({ value: u.name, label: `${u.name} (${u.email})`, category: "users" as const }))
];

const PURPOSES = [
    "Onboarding",
    "Engagement",
    "Retention",
    "Acquisition",
    "Education",
    "Sales enablement",
    "Other"
];

interface Props {
    open: boolean;
    onClose: () => void;
    /** "create" shows "Create new template"; "edit" shows "Update" */
    mode?: "create" | "edit";
    initialName?: string;
    initialAspectRatio?: string;
    initialAudience?: string[];
    initialPurpose?: string[];
    initialDescription?: string;
    /** When true (template was already approved), the edit-mode primary button
     *  becomes "Submit for approval" instead of "Update", since any change
     *  invalidates the prior approval. */
    wasApproved?: boolean;
    onSubmit?: (data: {
        name: string;
        aspectRatio: string;
        audience: string[];
        purpose: string[];
        description: string;
    }) => void;
}

export default function CreateTemplateDialog({
    open,
    onClose,
    mode = "create",
    initialName = "",
    initialAspectRatio = "16:9",
    initialAudience = [],
    initialPurpose = [],
    initialDescription = "",
    wasApproved = false,
    onSubmit
}: Props) {
    const [name, setName] = useState(initialName);
    const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
    const [audience, setAudience] = useState<string[]>(initialAudience);
    const [audienceInput, setAudienceInput] = useState("");
    const [purpose, setPurpose] = useState<string[]>(initialPurpose);
    const [purposeInput, setPurposeInput] = useState("");
    const [description, setDescription] = useState(initialDescription);

    const isCreate = mode === "create";
    const canSubmit = name.trim().length > 0
        && audience.length > 0
        && (purpose.length > 0 || purposeInput.trim().length > 0)
        && description.trim().length > 0;

    // True when the user has changed any field from its initial value (edit mode only).
    const arraysEqualAsSets = (a: string[], b: string[]) =>
        a.length === b.length && a.every(x => b.includes(x));
    const hasChanges = !isCreate && (
        name !== initialName
        || aspectRatio !== initialAspectRatio
        || !arraysEqualAsSets(audience, initialAudience)
        || !arraysEqualAsSets(purpose, initialPurpose)
        || description !== initialDescription
    );

    // Memoized — prevents MUI Autocomplete from re-mounting / clearing the input
    // on every render due to `value` being a freshly-built array reference.
    const audienceObjects = useMemo(
        () => AUDIENCE_OPTIONS.filter(o => audience.includes(o.value)),
        [audience]
    );

    const handleClose = () => {
        setName(initialName);
        setAspectRatio(initialAspectRatio);
        setAudience(initialAudience);
        setAudienceInput("");
        setPurpose(initialPurpose);
        setPurposeInput("");
        setDescription(initialDescription);
        onClose();
    };

    const handleSubmit = () => {
        if (!canSubmit) {
            return;
        }
        // Auto-commit any pending typed text in the purpose field
        const pending = purposeInput.trim();
        const finalPurpose = pending && !purpose.includes(pending)
            ? [...purpose, pending]
            : purpose;
        onSubmit?.({ name, aspectRatio, audience, purpose: finalPurpose, description });
        handleClose();
    };

    return (
        <Dialog
            open={open}
            onClose={(_e, reason) => {
                if (reason === "backdropClick") {
                    return;
                }
                handleClose();
            }}
            maxWidth="sm"
            fullWidth
        >
            <TruffleDialogTitle
                CloseIconButtonProps={{ onClick: handleClose }}
                HelpCenterIconButtonProps={!isCreate ? { onClick: () => {} } : undefined}
            >
                {isCreate ? "Create new template" : "Update template details"}
            </TruffleDialogTitle>

            <DialogContent sx={contentSx}>
                {/* Template name */}
                <TextField
                    label="Template name"
                    required
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                {/* Aspect ratio + "Help contributors navigate Amplify" section — create only */}
                {isCreate && (
                    <>
                        <Box sx={fieldGroupSx}>
                            <FormLabel required>Aspect ratio</FormLabel>
                            <TruffleToggleButtonGroup
                                value={aspectRatio}
                                exclusive
                                onChange={(_e, val) => {
                                    if (val) {
                                        setAspectRatio(val);
                                    }
                                }}
                                variant="outlined"
                                sx={toggleGroupSx}
                            >
                                <ToggleButton value="16:9" color="primary" selected={aspectRatio === "16:9"} onClick={() => setAspectRatio("16:9")} sx={toggleBtnSx}>16:9</ToggleButton>
                                <ToggleButton value="9:16" color="primary" selected={aspectRatio === "9:16"} onClick={() => setAspectRatio("9:16")} sx={toggleBtnSx}>9:16</ToggleButton>
                                <ToggleButton value="4:5" color="primary" selected={aspectRatio === "4:5"} onClick={() => setAspectRatio("4:5")} sx={toggleBtnSx}>4:5</ToggleButton>
                            </TruffleToggleButtonGroup>
                        </Box>

                        <Box sx={sectionHeaderSx}>
                            <Typography variant="subtitle1" color="text.primary">
                                Help contributors navigate Amplify
                            </Typography>
                            <SvgIcon sx={infoIconSx}>
                                <FontAwesomeIcon icon={faCircleInfo} />
                            </SvgIcon>
                        </Box>
                    </>
                )}

                {/* Who can view and edit */}
                <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={AUDIENCE_OPTIONS}
                    value={audienceObjects}
                    onChange={(_e: SyntheticEvent, vals) => setAudience(vals.map(v => v.value))}
                    isOptionEqualToValue={(a, b) => a.value === b.value}
                    getOptionLabel={(opt) => opt.label}
                    groupBy={(opt) => opt.category}
                    renderGroup={(params) => (
                        <li key={params.key}>
                            {params.group !== "all" && (
                                <Typography variant="caption" color="text.secondary" sx={audienceGroupHeaderSx}>
                                    {params.group === "groups" ? "Groups" : "Users"}
                                </Typography>
                            )}
                            <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>{params.children}</ul>
                        </li>
                    )}
                    inputValue={audienceInput}
                    onInputChange={(_e, val) => setAudienceInput(val)}
                    noOptionsText={
                        audienceInput.trim().length > 0
                            ? `Ask account owner to add this ${(audienceInput.includes(" ") || audienceInput.includes("@")) ? "user" : "group"}`
                            : "No options"
                    }
                    slotProps={{ listbox: { sx: optionHoverSx } }}
                    renderTags={(value, getTagProps) => (
                        <Box sx={chipRowSx}>
                            {value.map((val, index) => (
                                <Chip label={val.value} size="small" sx={chipFullLabelSx} {...getTagProps({ index })} />
                            ))}
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Who can view and edit"
                            required
                            placeholder={audience.length === 0 ? "Select or type to add" : ""}
                        />
                    )}
                />

                {/* Template purpose */}
                <Autocomplete
                    multiple
                    freeSolo
                    disableCloseOnSelect
                    options={PURPOSES}
                    value={purpose}
                    onChange={(_e: SyntheticEvent, val: string[]) => setPurpose(val)}
                    inputValue={purposeInput}
                    onInputChange={(_e, val) => setPurposeInput(val)}
                    slotProps={{ listbox: { sx: optionHoverSx } }}
                    renderTags={(value, getTagProps) => (
                        <Box sx={chipRowSx}>
                            {value.map((val, index) => (
                                <Chip label={val} size="small" sx={chipFullLabelSx} {...getTagProps({ index })} />
                            ))}
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Template purpose"
                            required
                            placeholder={purpose.length === 0 ? "Select or type to add" : ""}
                        />
                    )}
                />

                {/* Template description */}
                <TextField
                    label="Template description"
                    required
                    multiline
                    rows={3}
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {/* Warning shown only in edit mode AFTER the user has actually made changes */}
                {!isCreate && hasChanges && (
                    <AttentionBox color="warning" icon={<SvgIcon sx={{ fontSize: 16 }}><FontAwesomeIcon icon={faTriangleExclamation} /></SvgIcon>}>
                        <AttentionBoxContent>
                            Since you’ve updated the template, additional approval is required.
                        </AttentionBoxContent>
                    </AttentionBox>
                )}
            </DialogContent>

            <TruffleDialogActions>
                <Button variant="text" size="large" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                >
                    {isCreate
                        ? "Create new template"
                        : wasApproved
                            ? "Resubmit for approval"
                            : "Update"}
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const contentSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    pt: "8px !important",
    pb: 1,
    px: "32px"
};

const fieldGroupSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column"
};

const toggleGroupSx: SxProps<Theme> = (theme) => ({
    width: "100%",
    "& .MuiToggleButton-root.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        color: theme.palette.primary.main
    }
});

const toggleBtnSx: SxProps<Theme> = {
    flex: 1
};

const sectionHeaderSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    pt: "48px"
};

const chipRowSx: SxProps<Theme> = {
    display: "flex",
    flexWrap: "wrap",
    gap: 0.5
};

const infoIconSx: SxProps<Theme> = {
    fontSize: "16px !important",
    width: "16px !important",
    height: "16px !important",
    color: "action.active"
};

// Behavior override (no appearance change): lets selected chips show their full label
// instead of truncating with ellipsis when the parent flexbox can wrap.
const chipFullLabelSx: SxProps<Theme> = {
    "& .MuiChip-label": {
        whiteSpace: "nowrap",
        overflow: "visible",
        textOverflow: "clip"
    }
};

// Hover/keyboard-focus background on dropdown options
const optionHoverSx: SxProps<Theme> = {
    "& .MuiAutocomplete-option:hover, & .MuiAutocomplete-option.Mui-focused": {
        bgcolor: "action.hover"
    }
};

// Section header inside the audience dropdown ("Groups" / "Users")
// — caption typography in text.secondary color.
// Spacing: 20px above (separates from previous section), 2px below
// (tight against the first option in the section).
const audienceGroupHeaderSx: SxProps<Theme> = {
    display: "block",
    px: "8px",
    pt: "20px",
    pb: "2px",
    color: "text.secondary",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
};
