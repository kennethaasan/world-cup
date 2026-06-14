import { alpha, createTheme } from '@mui/material/styles';

const fontStack = [
  'Inter',
  'ui-sans-serif',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
].join(',');

export const theme = createTheme({
  typography: {
    fontFamily: fontStack,
    fontSize: 13,
    h1: {
      fontWeight: 900,
      letterSpacing: '-0.08em',
    },
    h5: {
      fontWeight: 850,
      letterSpacing: '-0.04em',
    },
    h6: {
      fontWeight: 850,
      letterSpacing: '-0.03em',
    },
    button: {
      fontWeight: 800,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 22,
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#73f0ff',
      dark: '#0078ff',
    },
    secondary: {
      main: '#ff3d7f',
      light: '#ff8bb3',
      dark: '#c30048',
    },
    success: {
      main: '#35f2a3',
      light: '#7cffc8',
      dark: '#02a86a',
    },
    info: {
      main: '#8ea7ff',
      light: '#c1ceff',
      dark: '#4a66d8',
    },
    error: {
      main: '#ff6b6b',
      light: '#ff9b9b',
      dark: '#d93636',
    },
    warning: {
      main: '#ffd166',
    },
    background: {
      default: '#06101f',
      paper: '#0d1930',
    },
    text: {
      primary: '#f6fbff',
      secondary: '#a9bad2',
    },
    divider: alpha('#dbeafe', 0.14),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          background:
            'radial-gradient(circle at 12% 8%, rgba(0, 212, 255, 0.22), transparent 31rem), radial-gradient(circle at 88% 12%, rgba(255, 61, 127, 0.2), transparent 28rem), radial-gradient(circle at 48% 100%, rgba(53, 242, 163, 0.16), transparent 30rem), linear-gradient(135deg, #06101f 0%, #091b34 50%, #050912 100%)',
          backgroundAttachment: 'fixed',
        },
        '#root': {
          minHeight: '100vh',
        },
        '*': {
          scrollbarColor: `${alpha('#73f0ff', 0.55)} ${alpha('#06101f', 0.65)}`,
        },
        '::selection': {
          background: alpha('#00d4ff', 0.35),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage:
            'linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.035))',
          backdropFilter: 'blur(22px)',
          borderColor: alpha('#dbeafe', 0.16),
          boxShadow: `0 24px 80px ${alpha('#020617', 0.34)}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
        },
        contained: {
          background:
            'linear-gradient(100deg, #00d4ff 0%, #0078ff 48%, #ff3d7f 100%)',
          boxShadow: `0 14px 34px ${alpha('#00d4ff', 0.25)}`,
        },
        outlined: {
          borderColor: alpha('#73f0ff', 0.35),
          backgroundColor: alpha('#06101f', 0.3),
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 800,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled',
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          border: `1px solid ${alpha('#dbeafe', 0.14)}`,
          borderRadius: 18,
          backgroundColor: alpha('#06101f', 0.34),
          overflow: 'hidden',
          '&:hover': {
            backgroundColor: alpha('#06101f', 0.46),
          },
          '&.Mui-focused': {
            backgroundColor: alpha('#06101f', 0.54),
            boxShadow: `0 0 0 3px ${alpha('#00d4ff', 0.16)}`,
          },
          '&::before, &::after': {
            display: 'none',
          },
        },
      },
    },
  },
});
