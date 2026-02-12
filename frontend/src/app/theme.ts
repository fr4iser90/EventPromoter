import { createTheme } from '@mui/material/styles'

export const LAYOUT = {
  headerHeight: 64,
  contentMaxWidth: 1200,
} as const

export const createAppTheme = (darkMode: boolean) =>
  createTheme({
    shape: {
      borderRadius: 12,
    },
    spacing: 8,
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2563eb',
      },
      secondary: {
        main: '#7c3aed',
      },
      background: {
        default: darkMode ? '#0b1220' : '#f6f8fc',
        paper: darkMode ? '#111a2b' : '#ffffff',
      },
    },
    typography: {
      h4: {
        fontWeight: 700,
        letterSpacing: -0.3,
      },
      h6: {
        fontWeight: 650,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
          contained: {
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.22)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 14,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 44,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 3,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
    },
  })
