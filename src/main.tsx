import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "generated/router/routeTree.gen";
import "localization/i18n";
import i18n from "localization/i18n";
import { Settings } from "luxon";
import AuthenticationProvider from "providers/authentication-provider";
import ConfirmDialogProvider from "providers/confirm-dialog-provider";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { theme } from "./theme";

// Luxon locale
Settings.defaultLocale = i18n.language;

const router = createRouter({ routeTree });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("No root element in index.html");

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AuthenticationProvider>
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
              <ConfirmDialogProvider>
                <RouterProvider router={router} />
              </ConfirmDialogProvider>
            </LocalizationProvider>
          </AuthenticationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}
