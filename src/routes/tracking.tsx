import { Box, Card, MenuItem, TextField, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { authAtom } from "atoms/auth";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import DelaysList from "components/tracking/delays-list";
import NotificationsList from "components/tracking/notifications-list";
import {
  useFindUserQuery,
  useListChangeProposalsQuery,
  useListJobPositionsQuery,
  useListNotificationEventsQuery,
  useListProjectsQuery,
  useListTasksQuery,
  useListUsersQuery,
} from "hooks/api-queries";
import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Tracking file route
 */
export const Route = createFileRoute("/tracking")({ component: TrackingIndexRoute });

/**
 * Tracking index route component
 */
function TrackingIndexRoute() {
  const [auth] = useAtom(authAtom);
  const { t } = useTranslation();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();

  const listProjectsQuery = useListProjectsQuery();
  const projects = useMemo(() => listProjectsQuery.data?.projects ?? [], [listProjectsQuery.data]);

  const findUserQuery = useFindUserQuery({ userId: auth?.token.userId });
  const user = findUserQuery.data;

  const listUsersQuery = useListUsersQuery();
  const users = useMemo(() => listUsersQuery.data?.users ?? [], [listUsersQuery.data]);

  const listTasksQuery = useListTasksQuery({ projectId: selectedProjectId });
  const tasks = useMemo(() => listTasksQuery.data ?? [], [listTasksQuery.data]);

  const listChangeProposalsQuery = useListChangeProposalsQuery(
    selectedProjectId ? { projectId: selectedProjectId } : {},
  );
  const changeProposals = useMemo(() => listChangeProposalsQuery.data ?? [], [listChangeProposalsQuery.data]);

  const listJobPositionsQuery = useListJobPositionsQuery();
  const jobPositions = useMemo(() => listJobPositionsQuery.data?.jobPositions ?? [], [listJobPositionsQuery.data]);

  const listNotificationEventsQuery = useListNotificationEventsQuery({
    userId: user?.id ?? "",
    projectId: selectedProjectId,
  });
  const notificationEvents = useMemo(() => listNotificationEventsQuery.data ?? [], [listNotificationEventsQuery.data]);

  /**
   * Renders dropdown picker
   */
  const renderDropdownPicker = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: "2rem" }}>
      {/* Label on the left */}
      <Typography variant="h5" sx={{ whiteSpace: "nowrap" }}>
        {t("trackingScreen.selectProject")}
      </Typography>
      <TextField
        select
        fullWidth
        size="medium"
        variant="standard"
        value={selectedProjectId ?? "all"}
        onChange={(event) => setSelectedProjectId(event.target.value === "all" ? undefined : event.target.value)}
      >
        <MenuItem key="all" value="all">
          {t("trackingScreen.allProjects")}
        </MenuItem>
        {projects.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );

  /**
   * Main component render
   */
  return (
    <FlexColumnLayout>
      <Box sx={{ display: "flex", flexDirection: "row", marginBottom: "0rem" }}>
        <Card sx={{ flex: 1, padding: "1rem", backgroundColor: "#fff", boxShadow: "none", marginBottom: "1rem" }}>
          {renderDropdownPicker()}
        </Card>
      </Box>
      {/* Header Component */}
      <Box sx={{ display: "flex", flexDirection: "row", height: "calc(100vh - 136px)", gap: "1rem" }}>
        {/* Notifications Column */}
        <Card sx={{ width: "30%", height: "100%", overflow: "auto", boxShadow: "none", padding: "1rem" }}>
          <NotificationsList
            tasks={tasks}
            notificationEvents={notificationEvents}
            loading={listTasksQuery.isLoading || listNotificationEventsQuery.isLoading}
          />
        </Card>
        {/* Tasks and Delays Column */}
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <Card sx={{ minWidth: 0, overflow: "auto", boxShadow: "none" }}>
            <DelaysList
              users={users}
              tasks={tasks}
              changeProposals={changeProposals}
              jobPositions={jobPositions}
              loading={listChangeProposalsQuery.isLoading || listJobPositionsQuery.isLoading}
            />
          </Card>
        </Box>
      </Box>
    </FlexColumnLayout>
  );
}
