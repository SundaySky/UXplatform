import { useState } from "react";
import {
    Dialog, DialogContent, TextField,
    Typography, SvgIcon,
    Box, ToggleButton, Chip, Autocomplete
    , Button } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
    TruffleDialogTitle, TruffleDialogActions, TruffleToggleButtonGroup
} from "@sundaysky/smartvideo-hub-truffle-component-library";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/pro-regular-svg-icons";
import type { SyntheticEvent } from "react";

const AUDIENCES = [
    "All contributors",
    "Marketing team",
    "Sales team",
    "Customer Success",
    "HR team",
    "Finance team"
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
    onSubmit
}: Props) {
    const [name, setName] = useState(initialName);
    const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
    const [audience, setAudience] = useState<string[]>(initialAudience);
    const [purpose, setPurpose] = useState<string[]>(initialPurpose);
    const [description, setDescription] = useState(initialDescription);

    const isCreate = mode === "create";
    const canSubmit = name.trim().length > 0;

    const handleClose = () => {
        setName(initialName);
        setAspectRatio(initialAspectRatio);
        setAudience(initialAudience);
        setPurpose(initialPurpose);
        setDescription(initialDescription);
        onClose();
    };

    const handleSubmit = () => {
        if (!canSubmit) {
            return;
        }
        onSubmit?.({ name, aspectRatio, audience, purpose, description });
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <TruffleDialogTitle CloseIconButtonProps={{ onClick: handleClose }}>
                {isCreate ? "Create new template" : "Edit template details"}
            </TruffleDialogTitle>

            <DialogContent sx={contentSx}>
                {/* Template name */}
                <TextField
                    label="Template name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                {/* Aspect ratio */}
                <Box sx={fieldGroupSx}>
                    <Typography variant="subtitle1" color="text.primary">
                        Aspect ratio
                    </Typography>
                    <TruffleToggleButtonGroup
                        value={aspectRatio}
                        exclusive
                        color="standard"
                        onChange={(_e, val) => {
                            if (val) {
                                setAspectRatio(val);
                            }
                        }}
                        variant="outlined"
                        sx={toggleGroupSx}
                    >
                        <ToggleButton value="16:9" sx={toggleBtnSx}>16:9</ToggleButton>
                        <ToggleButton value="9:16" sx={toggleBtnSx}>9:16</ToggleButton>
                        <ToggleButton value="4:5" sx={toggleBtnSx}>4:5</ToggleButton>
                    </TruffleToggleButtonGroup>
                </Box>

                {/* Section: Help contributors navigate Amplify */}
                <Box sx={sectionHeaderSx}>
                    <Typography variant="subtitle1" color="text.primary">
                        Help contributors navigate Amplify
                    </Typography>
                    <SvgIcon sx={infoIconSx}>
                        <FontAwesomeIcon icon={faCircleInfo} />
                    </SvgIcon>
                </Box>

                {/* Template target audience */}
                <Autocomplete
                    multiple
                    freeSolo
                    options={AUDIENCES}
                    value={audience}
                    onChange={(_e: SyntheticEvent, val: string[]) => setAudience(val)}
                    renderTags={(value, getTagProps) => (
                        <Box sx={chipRowSx}>
                            {value.map((val, index) => (
                                <Chip label={val} size="small" {...getTagProps({ index })} />
                            ))}
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Template target audience"
                            placeholder={audience.length === 0 ? "Select or type to add" : ""}
                        />
                    )}
                />

                {/* Template purpose */}
                <Autocomplete
                    multiple
                    freeSolo
                    options={PURPOSES}
                    value={purpose}
                    onChange={(_e: SyntheticEvent, val: string[]) => setPurpose(val)}
                    renderTags={(value, getTagProps) => (
                        <Box sx={chipRowSx}>
                            {value.map((val, index) => (
                                <Chip label={val} size="small" {...getTagProps({ index })} />
                            ))}
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Template purpose"
                            placeholder={purpose.length === 0 ? "Select or type to add" : ""}
                        />
                    )}
                />

                {/* Template description */}
                <TextField
                    label="Template description"
                    multiline
                    rows={3}
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
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
                    {isCreate ? "Create new template" : "Update"}
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
    flexDirection: "column",
    gap: 1
};

const toggleGroupSx: SxProps<Theme> = {
    width: "100%"
};

const toggleBtnSx: SxProps<Theme> = {
    flex: 1
};

const sectionHeaderSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    borderTop: "1px solid",
    borderColor: "divider",
    pt: 1,
    mt: -1
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
