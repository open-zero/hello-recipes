import { createTheme } from '@mui/material/styles';
import { dataDisplayCustomizations } from './dataDisplay';
import { colorSchemes } from './themePrimitives';

const defaultTheme = createTheme();

export const theme = createTheme({
  colorSchemes: colorSchemes,
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  typography: {
    fontFamily: '"Inter Variable", sans-serif',
    fontSize: 16,
    h1: {
      fontFamily: '"Lora Variable", serif',
      fontWeight: 'bold',
      color: 'var(--mui-palette-text-heading)',
      fontSize: 36,
      [defaultTheme.breakpoints.down('sm')]: {
        fontSize: 24,
      },
    },
    h2: {
      fontFamily: '"Lora Variable", serif',
      fontWeight: 'bold',
      fontSize: 24,
      color: 'var(--mui-palette-text-heading)',
      [defaultTheme.breakpoints.down('sm')]: {
        fontSize: 20,
      },
    },
    h3: {
      fontFamily: '"Lora Variable", serif',
      fontWeight: 'bold',
      fontSize: 18,
      color: 'var(--mui-palette-text-heading)',
    },
    h6: {
      fontFamily: '"Lora Variable", serif',
      fontWeight: 'bold',
      fontSize: 16,
      lineHeight: 1.5,
      color: 'var(--mui-palette-text-heading)',
    },
    body1: {
      fontSize: 16,
    },
    body2: {
      fontSize: 13,
    },
    caption: {
      fontSize: 12,
      lineHeight: 1,
      color: 'var(--mui-palette-text-secondary)',
      textTransform: 'none',
      display: 'block',
    },
    button: {
      textTransform: 'none',
      fontSize: 16,
      fontWeight: 'bold',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: '100vmax',
        },
        sizeSmall: {
          fontSize: '0.8rem',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
        },
      },
    },
    MuiDialogTitle: {
      defaultProps: {
        variant: 'h1',
      },
      styleOverrides: {
        root: {
          paddingTop: 24,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.text.heading,
          textDecorationColor: '#a5b4fc',
          ':hover': {
            textDecorationThickness: 2,
          },
          ...theme.applyStyles('dark', {
            textDecorationColor: '#818cf8',
          }),
        }),
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: 24,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          // borderRadius: 4,
          marginTop: '4px',
          // borderRadius: theme.vars.shape.borderRadius,
          border: `1px solid ${theme.vars.palette.grey[200]}`,
          boxShadow:
            'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
          ...theme.applyStyles('dark', {
            border: `1px solid ${theme.vars.palette.grey[800]}`,
            boxShadow:
              'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px',
          }),
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        sizeMedium: {
          '& .MuiSvgIcon-root': {
            fontSize: 22,
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          // borderRadius: 4,
          marginTop: '4px',
          // borderRadius: theme.vars.shape.borderRadius,
          border: `1px solid ${theme.vars.palette.grey[200]}`,
          boxShadow:
            'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
          ...theme.applyStyles('dark', {
            border: `1px solid ${theme.vars.palette.grey[800]}`,
            boxShadow:
              'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px',
          }),
        }),
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 4,
        },
      },
    },
    MuiStack: {
      defaultProps: {
        useFlexGap: true,
      },
    },
    ...dataDisplayCustomizations,
  },
});
