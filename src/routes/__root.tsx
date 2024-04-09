import { Box } from "@mui/material";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import TopNavigation from "components/layout/top-navigation";
import { _DefaultNamespace } from "react-i18next/TransWithoutContext";
import { RouterDevTools } from "utils/router-devtools";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Box sx={{ width: "100vw", height: "100vh", overflowX: "hidden", display: "flex", flexDirection: "column" }}>
        <TopNavigation />
        <Box component="main" sx={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
      <RouterDevTools />
    </>
  );
}
