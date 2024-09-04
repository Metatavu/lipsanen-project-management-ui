import { Box, Card, Typography } from "@mui/material";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import { createFileRoute } from "@tanstack/react-router";
import {
  useFindProjectQuery,
  useFindUserQuery,
  useListChangeProposalsQuery,
  useListJobPositionsQuery,
  useListNotificationEventsQuery,
  useListProjectUsersQuery,
  useListTasksQuery,
} from "hooks/api-queries";
import TaskList from "components/tasks/task-list";
import { useAtom } from "jotai";
import { authAtom } from "atoms/auth";
import DelaysList from "components/tracking/delays-list";
import NotificationsList from "components/tracking/notifications-list";

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

  const findUserQuery = useFindUserQuery(auth?.token.userId ?? "");
  const user = findUserQuery.data;

  const listUsersQuery = useListProjectUsersQuery(projectId);
  const users = listUsersQuery.data || [];

  const listTasksQuery = useListTasksQuery({ projectId: projectId });
  const tasks = listTasksQuery.data || [];
  const userTasks = tasks.filter((task) => (task.assigneeIds ?? []).includes(user?.id ?? ""));

  const listChangeProposalsQuery = useListChangeProposalsQuery({ projectId: projectId });
  const changeProposals = listChangeProposalsQuery.data || [];

  const listJobPositionsQuery = useListJobPositionsQuery();
  const jobPositions = listJobPositionsQuery.data?.jobPositions || [];

  const listNotificationEventsQuery = useListNotificationEventsQuery({ userId: user?.id ?? "", projectId: projectId });
  const notificationEvents = listNotificationEventsQuery.data || [];

  const findProjectQuery = useFindProjectQuery(projectId);
  const project = findProjectQuery.data;

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
            <TaskList user={user} tasks={userTasks} loading={listTasksQuery.isLoading} />
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
