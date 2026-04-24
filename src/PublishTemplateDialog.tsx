import {
    Dialog, DialogContent, Typography, Box, Button
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
    TruffleDialogTitle, TruffleDialogActions, TruffleLink
} from "@sundaysky/smartvideo-hub-truffle-component-library";

interface Props {
    open: boolean;
    onClose: () => void;
    contributors?: string[];
    onEditDetails?: () => void;
    onPublish?: () => void;
    /** unused — kept for compatibility with TemplatePage */
    variant?: "simple" | "multi-action";
    templateName?: string;
}

const DEFAULT_CONTRIBUTORS = [
    "Contributor group",
    "Contributor name",
    "Contributor group",
    "Contributor group"
];

export default function PublishTemplateDialog({
    open,
    onClose,
    contributors = DEFAULT_CONTRIBUTORS,
    onEditDetails,
    onPublish,
    variant: _variant,
    templateName: _templateName
}: Props) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <TruffleDialogTitle
                CloseIconButtonProps={{ onClick: onClose }}
                HelpCenterIconButtonProps={{ onClick: () => {} }}
            >
                Publish template?
            </TruffleDialogTitle>

            <DialogContent sx={contentSx}>
                <Typography variant="body1" color="text.primary">
                    Publishing this template to SundaySky Amplify allows the following
                    contributors to customize it and create videos to share:
                </Typography>

                <Box component="ul" sx={bulletListSx}>
                    {contributors.map((c, i) => (
                        <Box component="li" key={i}>
                            <Typography variant="body1" color="text.primary">{c}</Typography>
                        </Box>
                    ))}
                </Box>

                <TruffleLink href="#">Preview template</TruffleLink>
            </DialogContent>

            <TruffleDialogActions>
                <Button variant="text" size="large" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="outlined" size="large" onClick={onEditDetails}>
                    Edit template details
                </Button>
                <Button variant="contained" size="large" onClick={onPublish ?? onClose}>
                    Publish
                </Button>
            </TruffleDialogActions>
        </Dialog>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const contentSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    pt: "8px !important",
    pb: 1
};

const bulletListSx: SxProps<Theme> = {
    m: 0,
    pl: 2.5,
    display: "flex",
    flexDirection: "column",
    gap: 0.5
};
