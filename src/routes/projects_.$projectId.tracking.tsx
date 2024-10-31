import { Box, Card, Stack, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { authAtom } from "atoms/auth";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import TaskList from "components/tasks/task-list";
import DelaysList from "components/tracking/delays-list";
import NotificationsList from "components/tracking/notifications-list";
import {
  useFindProjectQuery,
  useFindUserQuery,
  useListChangeProposalsQuery,
  useListJobPositionsQuery,
  useListNotificationEventsQuery,
  useListTasksQuery,
  useListUsersQuery,
} from "hooks/api-queries";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Tracking file route
 */
export const Route = createFileRoute("/projects/$projectId/tracking")({
  component: TrackingIndexRoute,
});

/**
 * Tracking index route component
 */
function TrackingIndexRoute() {
  const [auth] = useAtom(authAtom);
  const { projectId } = Route.useParams();
  const { t } = useTranslation();

  const findUserQuery = useFindUserQuery({ userId: auth?.token.sub });
  const user = findUserQuery.data;

  const listUsersQuery = useListUsersQuery({ projectId });
  const users = useMemo(() => listUsersQuery.data?.users ?? [], [listUsersQuery.data]);

  const listTasksQuery = useListTasksQuery({ projectId: projectId });
  const tasks = useMemo(() => listTasksQuery.data ?? [], [listTasksQuery.data]);

  const listChangeProposalsQuery = useListChangeProposalsQuery({ projectId: projectId });
  const changeProposals = useMemo(() => listChangeProposalsQuery.data ?? [], [listChangeProposalsQuery.data]);

  const listJobPositionsQuery = useListJobPositionsQuery();
  const jobPositions = useMemo(() => listJobPositionsQuery.data?.jobPositions ?? [], [listJobPositionsQuery.data]);

  const listNotificationEventsQuery = useListNotificationEventsQuery({ userId: user?.id, projectId: projectId });
  const notificationEvents = useMemo(() => listNotificationEventsQuery.data ?? [], [listNotificationEventsQuery.data]);

  const findProjectQuery = useFindProjectQuery(projectId);
  const project = useMemo(() => findProjectQuery.data, [findProjectQuery.data]);

  return (
    <FlexColumnLayout>
      <Box sx={{ display: "flex", flexDirection: "row", marginBottom: "0rem" }}>
        <Card sx={{ flex: 1, padding: "1rem", backgroundColor: "#fff", boxShadow: "none", marginBottom: "1rem" }}>
          <Typography component="h1" variant="h5">
            {project?.name ?? ""}
          </Typography>
        </Card>
      </Box>
      {/* Header Component */}
      <Box sx={{ display: "flex", flexDirection: "row", height: "calc(100vh - 136px)", gap: "2rem" }}>
        {/* Notifications Column */}
        <Card sx={{ width: "30%", height: "100%", overflow: "auto", boxShadow: "none", padding: "1rem" }}>
          <NotificationsList
            tasks={tasks}
            notificationEvents={notificationEvents}
            loading={listTasksQuery.isLoading || listNotificationEventsQuery.isLoading}
          />
        </Card>
        {/* Tasks and Delays Column */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            overflow: "auto",
            justifyContent: "space-between",
          }}
        >
          {/* Tasks Column */}
          <Card sx={{ flex: 1, minWidth: 0, overflow: "auto", boxShadow: "none" }}>
            <Stack height="100%" p={2} minHeight={0}>
              <Typography component="h2" variant="h6" mb={2}>
                {t("trackingScreen.tasksList.title")}
              </Typography>
              <TaskList projectId={projectId} user={user} readOnly />
            </Stack>
          </Card>
          {/* Delays Column */}
          <Card sx={{ flex: 1, minWidth: 0, overflow: "auto", boxShadow: "none" }}>
            <DelaysList
              users={users}
              tasks={tasks}
              changeProposals={changeProposals}
              jobPositions={jobPositions}
              loading={
                listTasksQuery.isLoading || listChangeProposalsQuery.isLoading || listJobPositionsQuery.isLoading
              }
            />
          </Card>
        </Box>
      </Box>
    </FlexColumnLayout>
  );
}
