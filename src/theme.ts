import { createTheme } from '@mui/material/styles'

// ─── Exact design tokens from Figma variable defs ────────────────────────────
const tokens = {
  'primary/main':           '#0053E5',
  'primary/light':          '#F4F7FF',
  'primary/contrast':       '#FFFFFF',
  'primary/selected':       '#0053E51A', // rgba(0,83,229,0.10)
  'primary/focus':          '#0053E524', // rgba(0,83,229,0.14)
  'secondary/main':         '#03194F',
  'secondary/contrast':     '#FFFFFF',
  'error/main':             '#E62843',
  'info/main':              '#0176D7',
  'text/primary':           '#323338',
  'text/secondary':         '#3C3C48CC', // rgba(60,60,72,0.80)
  'text/disabled':          '#00000061', // rgba(0,0,0,0.38)
  'action/active':          '#0000008F', // rgba(0,0,0,0.56)
  'divider':                '#0053E51F', // rgba(0,83,229,0.12)
  'grey/200':               '#EEEEEE',
  'grey/300':               '#CFD6EA',   // custom — NOT standard MUI grey
  'background/default':     '#F4F7FF',
  'background/paper':       '#FFFFFF',
  'common/white':           '#FFFFFF',
  'components/alert/info/color':      '#284862',
  'components/alert/info/background': '#EFF7FE',
}

export const theme = createTheme({
  palette: {
    primary: {
      main:         tokens['primary/main'],
      light:        tokens['primary/light'],
      contrastText: tokens['primary/contrast'],
    },
    secondary: {
      main:         tokens['secondary/main'],
      contrastText: tokens['secondary/contrast'],
    },
    error: {
      main: tokens['error/main'],
    },
    info: {
      main: tokens['info/main'],
    },
    background: {
      default: tokens['background/default'],
      paper:   tokens['background/paper'],
    },
    text: {
      primary:  tokens['text/primary'],
      secondary: tokens['text/secondary'],
      disabled: tokens['text/disabled'],
    },
    action: {
      active: tokens['action/active'],
    },
    divider: tokens['divider'],
    grey: {
      200: tokens['grey/200'],
      300: tokens['grey/300'],
    },
  },

  typography: {
    fontFamily: '"Open Sans", sans-serif',
    h1: {
      fontFamily:   '"Inter", sans-serif',
      fontSize:     28,
      fontWeight:   600,
      lineHeight:   1.5,
      letterSpacing: 0,
    },
    h2: {
      fontFamily:   '"Inter", sans-serif',
      fontSize:     24,
      fontWeight:   500,
      lineHeight:   1.5,
      letterSpacing: 0,
    },
    h6: {
      fontFamily:   '"Inter", sans-serif',
      fontSize:     20,
      fontWeight:   600,
      lineHeight:   1.5,
    },
    body1: {
      fontFamily:   '"Open Sans", sans-serif',
      fontSize:     14,
      fontWeight:   400,
      lineHeight:   1.5,
      letterSpacing: 0,
    },
    body2: {
      fontFamily:   '"Open Sans", sans-serif',
      fontSize:     14,
      fontWeight:   300,
      lineHeight:   1.5,
      letterSpacing: 0,
    },
    subtitle2: {
      fontFamily:   '"Open Sans", sans-serif',
      fontSize:     14,
      fontWeight:   500,
      lineHeight:   1.5,
      letterSpacing: 0,
    },
    caption: {
      fontFamily:   '"Open Sans", sans-serif',
      fontSize:     12,
      fontWeight:   400,
      lineHeight:   1.66,
      letterSpacing: 0.4,
    },
    overline: {
      fontFamily:   '"Open Sans", sans-serif',
      fontSize:     12,
      fontWeight:   400,
      lineHeight:   1.5,
      letterSpacing: 0,
    },
    button: {
      fontFamily:      '"Inter", sans-serif',
      fontSize:        14,
      fontWeight:      500,
      lineHeight:      1.5,
      textTransform:   'none',
      letterSpacing:   0,
    },
  },

  shape: {
    borderRadius: 8, // base — all MUI components inherit this
  },

  components: {
    // ── Button ──────────────────────────────────────────────────────────────
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius:    8,
          textTransform:   'none',
          fontFamily:      '"Inter", sans-serif',
          fontWeight:      500,
          fontSize:        14,
          lineHeight:      1.5,
          letterSpacing:   0,
        },
        // Figma "Large"  →  min-h 40px, px 12, py 7
        sizeLarge: {
          minHeight:      40,
          paddingTop:     7,
          paddingBottom:  7,
          paddingLeft:    12,
          paddingRight:   12,
        },
        // Figma "Medium" →  min-h 36px, px 10, py 5
        sizeMedium: {
          minHeight:      36,
          paddingTop:     5,
          paddingBottom:  5,
          paddingLeft:    10,
          paddingRight:   10,
        },
        // Figma "Small"  →  min-h 32px, px 8, py 3.5  (used in the card)
        sizeSmall: {
          minHeight:      32,
          paddingTop:     3.5,
          paddingBottom:  3.5,
          paddingLeft:    8,
          paddingRight:   8,
        },
        // Contained – already gets primary colour from palette
        containedPrimary: {
          backgroundColor: tokens['primary/main'],
          color:           tokens['primary/contrast'],
          '&:hover': {
            backgroundColor: '#0046C2',
          },
        },
        // Outlined — Figma: white bg, grey/300 border, primary/main text
        outlinedPrimary: {
          backgroundColor: tokens['common/white'],
          borderColor:     tokens['grey/300'],
          color:           tokens['primary/main'],
          '&:hover': {
            backgroundColor: tokens['primary/selected'],
            borderColor:     tokens['grey/300'],
          },
        },
      },
    },

    // ── Chip / StatusLabel ───────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontFamily:   '"Open Sans", sans-serif',
          fontSize:     12,
          fontWeight:   400,
          height:       22,
        },
      },
    },

    // ── ListItemButton ───────────────────────────────────────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius:  8,
          paddingTop:    8,
          paddingBottom: 8,
          paddingLeft:   12,
          paddingRight:  12,
          '&.Mui-selected': {
            backgroundColor: tokens['primary/selected'],
            '&:hover': { backgroundColor: tokens['primary/focus'] },
          },
        },
      },
    },

    // ── Paper ────────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },

    // ── Divider ──────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: tokens['divider'],
        },
      },
    },

    // ── OutlinedInput / Search ───────────────────────────────────────────────
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens['divider'],
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens['primary/main'],
          },
        },
      },
    },

    // ── Badge ────────────────────────────────────────────────────────────────
    MuiBadge: {
      styleOverrides: {
        dot: {
          width:        8,
          height:       8,
          borderRadius: '50%',
        },
      },
    },

    // ── Avatar ───────────────────────────────────────────────────────────────
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontFamily:   '"Open Sans", sans-serif',
          fontWeight:   400,
          fontSize:     16,
          lineHeight:   1,
          letterSpacing: 0.14,
        },
      },
    },

    // ── Tooltip ──────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily:   '"Open Sans", sans-serif',
          fontSize:     12,
          fontWeight:   400,
          lineHeight:   '14px',
          letterSpacing: 0,
          borderRadius: 4,
          color:        '#ffffff',
        },
      },
    },
  },
})
