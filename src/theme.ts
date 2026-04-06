import { createTheme } from "@mui/material/styles";

/** Dark “garden” palette; used app-wide via ThemeProvider. */
export const gardenTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7dce8c",
      dark: "#4a9e5c",
      light: "#a8e8b4",
    },
    secondary: {
      main: "#c9a227",
    },
    error: {
      main: "#e57373",
    },
    background: {
      default: "#0f1a12",
      paper: "#1a2f1f",
    },
    divider: "#3d5c45",
    text: {
      primary: "#e8f0e9",
      secondary: "#9cb0a0",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitTapHighlightColor: "transparent",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 44,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
      },
    },
  },
});
