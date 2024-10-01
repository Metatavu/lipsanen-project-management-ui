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
  styled,
} from "@mui/material";
import { useMatches, useNavigate, useParams } from "@tanstack/react-router";
import logo from "assets/lipsanen-logo.svg";
import { useFindUserQuery, useListNotificationEventsQuery } from "hooks/api-queries";
import { useAtom } from "jotai";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NavigationLink } from "types";
import { getNthSlugFromPathName } from "utils";
import { authAtom } from "../../atoms/auth";

const ADMIN_ROLE = "admin";
const PROJECT_OWNER_ROLE = "project-owner";
const USER_ROLE = "user";

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

  const findUserQuery = useFindUserQuery({ userId: auth?.token.userId });
  const listNotificationEventsQuery = useListNotificationEventsQuery({
    userId: findUserQuery.data?.id ?? "",
  });

  const unreadNotificationEventsCount = useMemo(() => {
    const notificationEvents = listNotificationEventsQuery.data || [];
    return notificationEvents.filter((event) => !event.read).length;
  }, [listNotificationEventsQuery.data]);

  const accountMenuState = usePopupState({ variant: "popover", popupId: "accountMenu" });

  const routeLinks: NavigationLink[] = [
    { route: "/projects", labelKey: "projects" },
    { route: "/tracking", labelKey: "tracking" },
    { route: "/project-templates", labelKey: "projectTemplates" },
    { route: "/users", labelKey: "users" },
    ...(auth?.roles.includes(ADMIN_ROLE) || auth?.roles.includes(PROJECT_OWNER_ROLE)
      ? ([{ route: "/roles", labelKey: "roles" }] as NavigationLink[])
      : []),
    { route: "/settings", labelKey: "settingsScreen.title" },
  ];

  const projectRouteLinks: NavigationLink[] = [
    { route: "/projects", labelKey: "back", icon: ArrowBackIcon },
    { route: "/projects/$projectId/tracking", labelKey: "trackingScreen.title" },
    { route: "/projects/$projectId/schedule", labelKey: "scheduleScreen.title" },
    { route: "/projects/$projectId/users", labelKey: "users" },
    { route: "/projects/$projectId/tasks", labelKey: "tasksScreen.title" },
  ];

  const isProjectRoute = location.pathname.includes("projects/") && location.pathname.split("projects/")[1] !== "";

  const { activeLinks, slug } = isProjectRoute
    ? { activeLinks: projectRouteLinks, slug: 2 }
    : { activeLinks: routeLinks, slug: 0 };

  const selectedRouteIndex = activeLinks.findIndex(
    (link) => getNthSlugFromPathName(link.route, slug) === getNthSlugFromPathName(location.pathname, slug),
  );

  return (
    <AppBar position="static" sx={{ height: "48px", backgroundColor: "primary.dark" }}>
      <Toolbar variant="dense">
        <img src={logo} alt="VP-Kuljetus logo" height={16} />

        <Stack direction="row" gap={3} sx={{ ml: 3, flexGrow: 1 }}>
          <Tabs value={selectedRouteIndex}>
            {activeLinks.map(({ route, labelKey }, routeIndex) => (
              <Tab
                sx={{ color: "white" }}
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
          <IconButton color="inherit">
            <NotificationBadge badgeContent={unreadNotificationEventsCount} color="warning">
              {listNotificationEventsQuery.isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <NotificationsNoneOutlinedIcon />
              )}
            </NotificationBadge>
          </IconButton>
          <IconButton color="inherit" {...bindTrigger(accountMenuState)}>
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
