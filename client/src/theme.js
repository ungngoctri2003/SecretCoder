import { alpha, createTheme } from '@mui/material/styles';

const INK = '#1c2433';

const lightShadows = [
  'none',
  '0 1px 2px rgba(28, 36, 51, 0.05)',
  '0 2px 8px rgba(28, 36, 51, 0.07)',
  '0 4px 16px rgba(28, 36, 51, 0.08)',
  '0 8px 24px rgba(28, 36, 51, 0.1)',
  '0 12px 32px rgba(28, 36, 51, 0.11)',
  '0 16px 40px rgba(28, 36, 51, 0.12)',
  '0 20px 48px rgba(28, 36, 51, 0.13)',
  '0 24px 56px rgba(28, 36, 51, 0.14)',
  '0 28px 64px rgba(28, 36, 51, 0.15)',
  '0 32px 72px rgba(28, 36, 51, 0.16)',
  '0 36px 80px rgba(28, 36, 51, 0.17)',
  '0 40px 88px rgba(28, 36, 51, 0.18)',
  '0 44px 96px rgba(28, 36, 51, 0.19)',
  '0 48px 104px rgba(28, 36, 51, 0.2)',
  '0 52px 112px rgba(28, 36, 51, 0.2)',
  '0 56px 120px rgba(28, 36, 51, 0.2)',
  '0 60px 128px rgba(28, 36, 51, 0.2)',
  '0 64px 136px rgba(28, 36, 51, 0.2)',
  '0 68px 144px rgba(28, 36, 51, 0.2)',
  '0 72px 152px rgba(28, 36, 51, 0.2)',
  '0 76px 160px rgba(28, 36, 51, 0.2)',
  '0 80px 168px rgba(28, 36, 51, 0.2)',
  '0 84px 176px rgba(28, 36, 51, 0.2)',
  '0 88px 184px rgba(28, 36, 51, 0.2)',
];

const darkShadows = [
  'none',
  '0 1px 2px rgba(0, 0, 0, 0.35)',
  '0 2px 8px rgba(0, 0, 0, 0.4)',
  '0 4px 16px rgba(0, 0, 0, 0.45)',
  '0 8px 24px rgba(0, 0, 0, 0.5)',
  '0 12px 32px rgba(0, 0, 0, 0.5)',
  '0 16px 40px rgba(0, 0, 0, 0.5)',
  '0 20px 48px rgba(0, 0, 0, 0.5)',
  '0 24px 56px rgba(0, 0, 0, 0.5)',
  '0 28px 64px rgba(0, 0, 0, 0.5)',
  '0 32px 72px rgba(0, 0, 0, 0.5)',
  '0 36px 80px rgba(0, 0, 0, 0.5)',
  '0 40px 88px rgba(0, 0, 0, 0.5)',
  '0 44px 96px rgba(0, 0, 0, 0.5)',
  '0 48px 104px rgba(0, 0, 0, 0.5)',
  '0 52px 112px rgba(0, 0, 0, 0.5)',
  '0 56px 120px rgba(0, 0, 0, 0.5)',
  '0 60px 128px rgba(0, 0, 0, 0.5)',
  '0 64px 136px rgba(0, 0, 0, 0.5)',
  '0 68px 144px rgba(0, 0, 0, 0.5)',
  '0 72px 152px rgba(0, 0, 0, 0.5)',
  '0 76px 160px rgba(0, 0, 0, 0.5)',
  '0 80px 168px rgba(0, 0, 0, 0.5)',
  '0 84px 176px rgba(0, 0, 0, 0.5)',
  '0 88px 184px rgba(0, 0, 0, 0.5)',
];

const shared = {
  cssVariables: true,
  typography: {
    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    h1: { fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 800 },
    h2: { fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 700 },
    h6: { fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          scrollbarColor:
            theme.palette.mode === 'light'
              ? `${alpha('#354056', 0.35)} transparent`
              : `${alpha('#e8eaef', 0.3)} transparent`,
        },
        '::selection': {
          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.22 : 0.35),
          color: theme.palette.mode === 'light' ? INK : theme.palette.text.primary,
        },
      }),
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation0: ({ theme }) => ({
          boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, theme.palette.mode === 'light' ? 0.06 : 0.35)}`,
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          overflow: 'hidden',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius * 1.25,
          boxShadow: theme.shadows[4],
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 700,
          fontSize: '0.8125rem',
          letterSpacing: '0.02em',
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.04) : theme.palette.action.hover,
          borderBottom: `2px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        sizeSmall: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 52,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 52,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: 'transparent',
          borderRadius: theme.shape.borderRadius,
          '&:hover': { backgroundColor: 'transparent' },
          '&.Mui-focused': { backgroundColor: 'transparent' },
          '&.Mui-error': { backgroundColor: 'transparent' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
            borderColor: theme.palette.primary.main,
          },
        }),
        input: ({ theme }) => ({
          '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px transparent inset',
            WebkitTextFillColor: theme.palette.text.primary,
            caretColor: theme.palette.text.primary,
            borderRadius: 'inherit',
            transition: 'background-color 99999s ease-out 0s',
          },
          '&:-webkit-autofill:hover': {
            WebkitBoxShadow: '0 0 0 1000px transparent inset',
          },
          '&:-webkit-autofill:focus': {
            WebkitBoxShadow: '0 0 0 1000px transparent inset',
          },
          '&:-webkit-autofill:active': {
            WebkitBoxShadow: '0 0 0 1000px transparent inset',
          },
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
};

/**
 * @param {'light' | 'dark'} mode
 */
export function createAppTheme(mode) {
  const isLight = mode === 'light';
  return createTheme({
    ...shared,
    palette: isLight
      ? {
          mode: 'light',
          neutral: {
            main: '#5c6578',
            contrastText: '#f4f6f9',
          },
          primary: {
            main: '#e8872a',
            dark: '#c47322',
            light: '#f0a04d',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#354056',
            dark: '#252d3d',
            light: '#4a5568',
            contrastText: '#f4f6f9',
          },
          error: { main: '#d32f2f' },
          warning: { main: '#ed6c02' },
          info: { main: '#0288d1' },
          success: { main: '#2e7d32' },
          background: {
            default: '#eef1f5',
            paper: '#ffffff',
          },
          text: {
            primary: INK,
            secondary: '#5a6272',
          },
          divider: '#dce3ea',
          action: {
            hover: alpha(INK, 0.06),
            selected: alpha('#e8872a', 0.12),
            focus: alpha('#e8872a', 0.24),
          },
        }
      : {
          mode: 'dark',
          neutral: {
            main: '#2a3142',
            contrastText: '#e8eaef',
          },
          primary: {
            main: '#e8872a',
            dark: '#c47322',
            light: '#f0a04d',
            contrastText: '#0f1218',
          },
          secondary: {
            main: '#8b9ab3',
            dark: '#6b7a90',
            light: '#a8b3c4',
            contrastText: '#0f1218',
          },
          error: { main: '#f44336' },
          warning: { main: '#ffa726' },
          info: { main: '#29b6f6' },
          success: { main: '#66bb6a' },
          background: {
            default: '#0f1218',
            paper: '#181c24',
          },
          text: {
            primary: '#e8eaef',
            secondary: '#9aa3b2',
          },
          divider: '#2a3140',
          action: {
            hover: alpha('#ffffff', 0.08),
            selected: alpha('#e8872a', 0.16),
            focus: alpha('#e8872a', 0.24),
          },
        },
    shadows: isLight ? lightShadows : darkShadows,
  });
}

/** @deprecated Prefer createAppTheme + ColorModeProvider; kept for one-off use */
export const appTheme = createAppTheme('light');
