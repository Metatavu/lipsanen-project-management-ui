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
    MuiFilledInput: {
      defaultProps: {
        disableUnderline: true,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiFilledInput-root": {
            backgroundColor: "#fff",
            borderRadius: 4,
            "&.Mui-focused": {
              backgroundColor: "#fff",
            },
            "&:hover": {
              backgroundColor: "#f7f7f7",
            },
          },
        },
      },
      defaultProps: {
        variant: "filled",
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          lineHeight: 1,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

export { theme };
