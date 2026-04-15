import { createTheme } from '@mui/material/styles';

/** Hex approximations of the previous OKLCH palette (MUI palette does not support oklch()). */
export const appTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    neutral: {
      main: '#5c6578',
      contrastText: '#f4f6f9',
    },
    primary: {
      main: '#e8872a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#354056',
      contrastText: '#f4f6f9',
    },
    error: { main: '#d32f2f' },
    warning: { main: '#ed6c02' },
    info: { main: '#0288d1' },
    success: { main: '#2e7d32' },
    background: {
      default: '#f7f9fa',
      paper: '#f7f9fa',
    },
    text: {
      primary: '#1c2433',
      secondary: '#5a6272',
    },
    divider: '#dce3ea',
  },
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
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          '&:hover': { backgroundColor: 'transparent' },
          '&.Mui-focused': { backgroundColor: 'transparent' },
          '&.Mui-error': { backgroundColor: 'transparent' },
        },
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
  },
});
