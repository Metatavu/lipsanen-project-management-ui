import { Box } from "@mui/material";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import ErrorHandler from "components/generic/error-handler";
import TopNavigation from "components/layout/top-navigation";
import { _DefaultNamespace } from "react-i18next/TransWithoutContext";
import { RouterDevTools } from "utils/router-devtools";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Box sx={{ width: "100dvw", height: "100dvh", display: "flex", flexDirection: "column" }}>
        <TopNavigation />
        <main style={{ flex: 1, overflow: "hidden" }}>
          <ErrorHandler />
          <Outlet />
        </main>
      </Box>
      <RouterDevTools />
    </>
  );
}
