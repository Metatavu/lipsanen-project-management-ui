import { createTheme } from "@mui/material";

/**
 * Extend theme with custom variables in here
 */
declare module "@mui/material/styles" {
  // interface Theme {
  //   status: {
  //     danger: string;
  //   };
  // }
  // allow configuration using `createTheme`
  // interface ThemeOptions {
  //   status?: {
  //     danger?: string;
  //   };
  // }
}

const theme = createTheme({
  palette: {
    background: {
      default: "#ECEFF1",
      paper: "#FFFFFF",
    },
    primary: {
      main: "#0079BF",
      dark: "#00599D",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "white",
          height: "0.25rem",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          color: "white",
          "&.Mui-selected": {
            color: "white",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          margin: "0.25rem",
          backgroundColor: "white",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          lineHeight: 0,
        },
      },
    },
  },
});

export { theme };
