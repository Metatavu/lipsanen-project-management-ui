import { ThemeProvider, createTheme } from "@mui/material";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useListProjectThemesQuery } from "hooks/api-queries";
import { useMemo } from "react";
import { theme } from "../theme";

/**
 * Projects layout file route.
 */
export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectsLayoutComponent,
});

/**
 * Projects layout component.
 */
function ProjectsLayoutComponent() {
  const { projectId } = Route.useParams();
  const findProjectThemeQuery = useListProjectThemesQuery(projectId);

  const projectTheme = useMemo(() => {
    const themeData = findProjectThemeQuery.data ? findProjectThemeQuery.data.at(0) : null;
    return themeData;
  }, [findProjectThemeQuery.data]);

  const updatedTheme = useMemo(() => {
    if (projectTheme) {
      const primaryColor = projectTheme.themeColor;

      return createTheme({
        ...theme,
        palette: {
          ...theme.palette,
          primary: theme.palette.augmentColor({
            color: {
              main: primaryColor,
            },
          }),
        },
      });
    }
    return theme;
  }, [projectTheme]);

  return (
    <ThemeProvider theme={updatedTheme}>
      <Outlet />
    </ThemeProvider>
  );
}
