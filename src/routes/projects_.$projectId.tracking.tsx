import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { FlexColumnLayout } from 'components/generic/flex-column-layout';
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useApi } from 'hooks/use-api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useListMilestoneTasksQuery, useListNotificationEventsQuery, useListProjectMilestonesQuery, useListUsersQuery } from 'hooks/api-queries';
import { NotificationEvent, UpdateNotificationEventRequest } from 'generated/client';
import TaskList from 'components/tasks/task-list';

/**
 * Tracking file route
 */
export const Route = createFileRoute("/projects/$projectId/tracking")({
  component: TrackingIndexRoute,
});

// TODO: Finalise tracking screen

/**
 * Tracking index route component
 */
function TrackingIndexRoute() {
  const { t } = useTranslation();
  const { projectId } = Route.useParams();
  const { NotificationEventsApi } = useApi();
  const queryClient = useQueryClient();

  const users = useListUsersQuery().data?.users || [];
  const milestones = useListProjectMilestonesQuery({ projectId }).data ?? [];

  // Find user daniil.kings@gmail.com
  const testUser = users?.find(user => user.email === "daniil.kings@gmail.com");
  const testMilestone = milestones[0];

  const listTasksQuery = useListMilestoneTasksQuery({ projectId, milestoneId: testMilestone?.id ?? "" });
  const tasks = listTasksQuery.data || [];
  const testUserTasks = tasks.filter(task => (task.assigneeIds ?? []).includes(testUser?.id ?? ""));

  const listNotificationEventsQuery = useListNotificationEventsQuery({ userId: testUser?.id ?? "", projectId: projectId });
  const notificationEvents = listNotificationEventsQuery.data || [];

  const updateNotificationEvent = useMutation({
    mutationFn: (params: UpdateNotificationEventRequest) => NotificationEventsApi.updateNotificationEvent(params) ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationEvents"] });
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingNotificationEvent"), error),
  });

  const onNotificationEventRead = (notificationEvent: NotificationEvent) => {
    if (notificationEvent.read || !notificationEvent.id) return;
    
    updateNotificationEvent.mutate({
      notificationEventId: notificationEvent.id,
      notificationEvent: {
        ...notificationEvent,
        read: true
      }
    });
  };
  
  const renderNotificationCard = (notificationEvent: NotificationEvent) => {
    return (
      <Card 
        sx={{ 
          width: '100%', 
          marginBottom: '1rem', 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px', 
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '0.5rem 1rem', 
          backgroundColor: '#f5f9ff' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentOutlinedIcon sx={{ marginRight: '0.5rem' }} />
            <Typography variant="subtitle1" fontWeight="bold">
              {tasks.find(task => task.id === notificationEvent.notification.taskId)?.name ?? "Perustukset / Lohko 2"}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!notificationEvent.read && (
              <Tooltip title="Merkitse luetuksi">
                <Box sx={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3f51b5', marginRight: '0.5rem' }} />
              </Tooltip>
            )}
            <Tooltip title="Poista">
              <Box sx={{ cursor: 'pointer' }}>
                <Typography variant="h6">×</Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ padding: '1rem' }}>
          <Typography variant="body2" color="textSecondary" sx={{ marginBottom: '0.5rem' }}>
            {notificationEvent.notification.message ?? "Lorem ipsum dolor sit amet consectetur. Id dictum etiam velit interdum."}
          </Typography>
          <Typography variant="body2" color="textSecondary">
          {notificationEvent.metadata?.createdAt
            ? `${notificationEvent.metadata.createdAt.toLocaleDateString('en-GB').replace(/\//g, ".")} - ${notificationEvent.metadata.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : ""}
          </Typography>
        </Box>
      </Card>
    );
  };
  
  const renderNotificationsColumn = () => {
    return (
      <Card sx={{ width: "30%", height: "100%", overflow: "auto", boxShadow: "none", padding: "1rem" }}>
        <Typography component="h2" variant="h6" sx={{ padding: "0 0 1rem 0", borderBottom: '1px solid #e0e0e0' }}>
          Notifikaatiot
        </Typography>
        <Box sx={{ padding: "0 1rem" }}>
          {notificationEvents.map((notificationEvent) => renderNotificationCard(notificationEvent))}
        </Box>
      </Card>
    );
  };

  const renderDelaysColumn = () => (
    <Card sx={{ flex: 1, minWidth: 0, overflow: "auto", boxShadow: "none" }}>
      <Typography component="h2" variant="h6" sx={{ padding: "1rem" }}>
        Projektin myöhästymiset
      </Typography>
      <Box sx={{ padding: "1rem" }}>
        <TableContainer>
          <Table style={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell>Myöhästynyt tehtävä</TableCell>
                <TableCell>Tekijä</TableCell>
                <TableCell>Myöhästymisen syy</TableCell>
                <TableCell>Aiheuttanut myöhästymisiä kpl</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Replace with actual delay data */}
              <TableRow>
                <TableCell>Myöhästynyt esimerkkitehtävä 1</TableCell>
                <TableCell>Seppo Suunnittelija</TableCell>
                <TableCell>Ennakoimaton syy</TableCell>
                <TableCell>0</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
  
  return (
    <FlexColumnLayout>
      {/* Header Component */}
      <Card sx={{ width: '100%', padding: '1rem', backgroundColor: '#fff', boxShadow: "none", marginBottom: "1rem" }}>
        <Typography component="h1" variant="h4">
          Esimerkki-projekti
        </Typography>
      </Card>
      <Box sx={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 136px)', gap: '2rem' }}>
        {/* Notifications Column */}
        {renderNotificationsColumn()}
        {/* Tasks and Delays Column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', overflow: 'auto' }}>
          {/* Tasks Column */}
          {/* {renderTasksColumn()} */}
          <TaskList user={testUser!} tasks={testUserTasks} loading={listTasksQuery.isLoading} />
          {/* Delays Column */}
          {renderDelaysColumn()}
        </Box>
      </Box>
    </FlexColumnLayout>
  );
}
