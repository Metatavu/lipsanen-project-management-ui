import {
  AccountCircle as AccountCircleIcon,
  NotificationsNoneOutlined as NotificationsNoneOutlinedIcon,
} from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  AppBar,
  Badge,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
  createTheme,
  styled,
} from "@mui/material";
import { useMatches, useNavigate, useParams } from "@tanstack/react-router";
import logo from "assets/lipsanen-logo.svg";
import NotificationsList from "components/tracking/notifications-list";
import {
  useFindUserQuery,
  useListNotificationEventsQuery,
  useListProjectThemesQuery,
  useListTasksQuery,
} from "hooks/api-queries";
import { useAtom } from "jotai";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NavigationLink } from "types";
import { getNthSlugFromPathName } from "utils";
import { authAtom } from "../../atoms/auth";
import { theme } from "../../theme";

const ADMIN_ROLE = "admin";
const PROJECT_OWNER_ROLE = "project-owner";

const NotificationBadge = styled(Badge)({
  "& .MuiBadge-badge": {
    right: 2,
    top: 6,
  },
});

const TopNavigation = () => {
  const [auth] = useAtom(authAtom);
  const { t } = useTranslation();
  const navigate = useNavigate();
  useMatches();
  const pathParams = useParams({ strict: false });

  const findProjectThemeQuery = useListProjectThemesQuery(pathParams.projectId);
  const findUserQuery = useFindUserQuery({ userId: auth?.token.sub });
  const listNotificationEventsQuery = useListNotificationEventsQuery(
    {
      userId: findUserQuery.data?.id ?? "",
      readStatus: false,
    },
    10_000,
  );
  const notificationEvents = useMemo(() => listNotificationEventsQuery.data ?? [], [listNotificationEventsQuery.data]);

  const listTasksQuery = useListTasksQuery({});
  const tasks = useMemo(() => listTasksQuery.data ?? [], [listTasksQuery.data]);

  const unreadNotificationEventsCount = useMemo(
    () => (listNotificationEventsQuery.data ?? []).length,
    [listNotificationEventsQuery.data],
  );

  const accountMenuState = usePopupState({ variant: "popover", popupId: "accountMenu" });
  const notificationsListMenuState = usePopupState({ variant: "popover", popupId: "notificationsMenu" });

  const routeLinks: NavigationLink[] = [
    { route: "/projects", labelKey: "projects" },
    { route: "/tracking", labelKey: "tracking" },
    // TODO: Curently unused
    // { route: "/project-templates", labelKey: "projectTemplates" },
    { route: "/users", labelKey: "users" },
    ...(auth?.roles.includes(ADMIN_ROLE) || auth?.roles.includes(PROJECT_OWNER_ROLE)
      ? ([{ route: "/positions", labelKey: "positions" }] as NavigationLink[])
      : []),
    { route: "/settings", labelKey: "settingsScreen.title" },
  ];

  const projectRouteLinks: NavigationLink[] = [
    { route: "/projects", labelKey: "back", icon: ArrowBackIcon },
    { route: "/projects/$projectId/tracking", labelKey: "trackingScreen.title" },
    { route: "/projects/$projectId/schedule", labelKey: "scheduleScreen.title" },
    { route: "/projects/$projectId/users", labelKey: "users" },
    { route: "/projects/$projectId/tasks", labelKey: "tasksScreen.title" },
    { route: "/projects/$projectId/attachments", labelKey: "projectAttachmentsScreen.routeName" },
    { route: "/projects/$projectId/settings", labelKey: "settingsScreen.title" },
  ];

  const isProjectRoute = location.pathname.includes("projects/") && location.pathname.split("projects/")[1] !== "";

  const customProjectTheme = useMemo(() => {
    if (isProjectRoute && pathParams.projectId && findProjectThemeQuery) {
      const themeData = findProjectThemeQuery.data ? findProjectThemeQuery.data.at(0) : null;
      return themeData;
    }
    return null;
  }, [isProjectRoute, pathParams.projectId, findProjectThemeQuery]);

  const updatedTheme = useMemo(() => {
    if (customProjectTheme) {
      const primaryColor = customProjectTheme.themeColor;

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
  }, [customProjectTheme]);

  const { activeLinks, slug } = isProjectRoute
    ? { activeLinks: projectRouteLinks, slug: 2 }
    : { activeLinks: routeLinks, slug: 0 };

  const selectedRouteIndex = activeLinks.findIndex(
    (link) => getNthSlugFromPathName(link.route, slug) === getNthSlugFromPathName(location.pathname, slug),
  );

  return (
    <AppBar
      position="static"
      sx={{ height: "48px", backgroundColor: customProjectTheme ? customProjectTheme?.themeColor : "primary.dark" }}
    >
      <Toolbar variant="dense">
        {customProjectTheme && <img
          src={customProjectTheme?.logoUrl}
          alt="Project logo"
          height={30}
        />
        }
        <Stack direction="row" gap={3} sx={{ ml: 3, flexGrow: 1 }}>
          <Tabs
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: updatedTheme.palette.primary.contrastText,
              },
            }}
            value={selectedRouteIndex === -1 ? false : selectedRouteIndex}
          >
            {activeLinks.map(({ route, labelKey }, routeIndex) => (
              <Tab
                sx={{
                  color: updatedTheme.palette.primary.contrastText,
                  "&.Mui-selected": {
                    color: updatedTheme.palette.primary.contrastText,
                  },
                }}
                key={route}
                label={labelKey !== "back" && t(labelKey)}
                icon={labelKey === "back" ? <ArrowBackIcon /> : undefined}
                value={routeIndex}
                onClick={() => navigate({ to: route, params: pathParams })}
              />
            ))}
          </Tabs>
        </Stack>

        <Stack direction="row" gap={1} sx={{ flexGrow: 0 }}>
          <IconButton
            sx={{
              color: updatedTheme.palette.primary.contrastText,
            }}
            {...bindTrigger(notificationsListMenuState)}
          >
            <NotificationBadge badgeContent={unreadNotificationEventsCount} color="warning">
              {listNotificationEventsQuery.isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <NotificationsNoneOutlinedIcon />
              )}
            </NotificationBadge>
          </IconButton>
          <Menu {...bindMenu(notificationsListMenuState)}>
            <MenuItem>
              <NotificationsList
                tasks={tasks}
                notificationEvents={notificationEvents}
                loading={listTasksQuery.isLoading || listNotificationEventsQuery.isLoading}
                appbarView
              />
            </MenuItem>
          </Menu>
          <IconButton
            sx={{
              color: updatedTheme.palette.primary.contrastText,
            }}
            {...bindTrigger(accountMenuState)}
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu {...bindMenu(accountMenuState)}>
            <MenuItem onClick={auth?.logout}>
              <Typography textAlign="center">{t("logout")}</Typography>
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavigation;
