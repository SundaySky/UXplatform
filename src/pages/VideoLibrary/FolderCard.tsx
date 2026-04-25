import { Box, Card, CardContent, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { TypographyWithTooltipOnOverflow } from "@sundaysky/smartvideo-hub-truffle-component-library";

export default function FolderCard({ name, count }: { name: string; count: number }) {
    const src = count > 0 ? "/folders/non-empty-folder.svg" : "/folders/empty-folder.svg";
    return (
        <Card sx={folderCardSx}>
            <CardContent sx={folderCardContentSx}>
                <Box sx={folderCardRowSx}>
                    <Box
                        component="img"
                        src={src}
                        alt={count === 0 ? "Empty folder" : "Folder with media"}
                        sx={folderImgSx}
                    />
                    <Box sx={folderCardTextWrapSx}>
                        <TypographyWithTooltipOnOverflow variant="h5" color="text.primary" sx={folderCardNameSx}>
                            {name}
                        </TypographyWithTooltipOnOverflow>
                        <Typography variant="body1" color="text.primary">
                            {count} {count === 1 ? "item" : "items"}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

const folderCardSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "row",
    gap: "8px",
    p: "8px",
    position: "relative",
    boxShadow: 0,
    textDecoration: "none",
    cursor: "pointer",
    "&:hover": { boxShadow: 24 }
};

const folderCardContentSx: SxProps<Theme> = {
    p: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexGrow: 1,
    "&:last-child": { pb: "8px" }
};

const folderCardRowSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "row",
    gap: "8px"
};

const folderImgSx: SxProps<Theme> = {
    height: "35px",
    width: "auto",
    flexShrink: 0
};

const folderCardTextWrapSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    minWidth: 0
};

const folderCardNameSx: SxProps<Theme> = {
    maxWidth: "163px"
};
