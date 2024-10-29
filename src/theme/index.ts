import { createTheme } from "@mui/material";
import { ChangeProposalStatus, ProjectStatus } from "generated/client";

/**
 * Extend theme with custom variables in here
 */
declare module "@mui/material/styles" {
  interface Palette {
    companyDefault: {
      lipsanenLipaBetoniOy: string;
      rakennusAhola: string;
      moduls: string;
      hbPorras: string;
    };
    projectStatus: {
      [Status in ProjectStatus]: string;
    };
    changeProposalStatus: {
      [Status in ChangeProposalStatus]: string;
    };
  }

  interface PaletteOptions {
    companyDefault?: {
      lipsanenLipaBetoniOy?: string;
      rakennusAhola?: string;
      moduls?: string;
      hbPorras?: string;
    };
    projectStatus?: {
      [Status in ProjectStatus]+?: string;
    };
    changeProposalStatus?: {
      [Status in ChangeProposalStatus]+?: string;
    };
  }
}

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: "Noto Sans",
    },
    button: {
      fontWeight: 600,
      textTransform: "initial",
    },
  },
  palette: {
    background: {
      default: "#ECEFF1",
      paper: "#FFFFFF",
    },
    primary: {
      main: "#0079BF",
      dark: "#00599D",
    },
    companyDefault: {
      lipsanenLipaBetoniOy: "#0079BF",
      rakennusAhola: "#19559E",
      moduls: "#00173A",
      hbPorras: "#75d1ff",
    },
    projectStatus: {
      INITIATION: "#293d96",
      PLANNING: "#742996",
      DESIGN: "#849629",
      PROCUREMENT: "#966e29",
      CONSTRUCTION: "#299646",
      INSPECTION: "#29967d",
      COMPLETION: "#5c5651",
    },
    changeProposalStatus: {
      APPROVED: "#0079BF",
      PENDING: "#757575",
      REJECTED: "#d32f2f",
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
            "&:hover:not(.Mui-disabled)": {
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
