import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const buttonToolbarWrapperSx: SxProps<Theme> = (theme) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    bgcolor: "background.paper",
    borderRadius: "8px",
    px: "6px",
    py: "5px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "grey.300",
    boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.15)}`,
    userSelect: "none",
    whiteSpace: "nowrap"
});

export const toolbarDividerSx: SxProps<Theme> = {
    borderColor: "grey.300",
    mx: "2px"
};

export const sizeLabelGroupSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0
};

export const sizeLabelTypographySx: SxProps<Theme> = {
    color: "text.primary",
    letterSpacing: "0.46px"
};

export const sizeToggleGroupSx: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "grey.300",
    borderRadius: "8px",
    overflow: "hidden"
};

export const toolbarDeleteBtnSx: SxProps<Theme> = {
    color: "error.main",
    p: "4px",
    flexShrink: 0
};

export const toolbarMoreBtnSx: SxProps<Theme> = {
    color: "primary.main",
    p: "4px",
    flexShrink: 0
};
