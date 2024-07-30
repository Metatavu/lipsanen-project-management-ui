import React from 'react';
import {
  Avatar,
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
  Switch,
} from '@mui/material';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { FlexColumnLayout } from 'components/generic/flex-column-layout';
import ProgressBadge from 'components/generic/progress-badge';
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useApi } from 'hooks/use-api';
import { useQueryClient } from '@tanstack/react-query';
import { useFindUserQuery, useListNotificationEventsQuery, useListUsersQuery } from 'hooks/api-queries';
import { useAtom } from 'jotai';

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
  const { t } = useTranslation();
  const { projectId } = Route.useParams();
  const { notificationsApi } = useApi();
  const queryClient = useQueryClient();

  const users = useListUsersQuery().data?.users;

  const listNotificationEventsQuery = useListNotificationEventsQuery({ userId: "", projectId: projectId });
  const notificationEvents = listNotificationEventsQuery.data;

  console.log("Notification events are", notificationEvents);

  const renderNotificationsColumn = () => (
    <Card sx={{ width: "25%", height: "100%", overflow: "auto", boxShadow: "none" }}>
      <Typography component="h2" variant="h6" sx={{ padding: "1rem" }}>
        Notifikaatiot
      </Typography>
      <Box sx={{ padding: "1rem" }}>
        {/* Replace with actual notification components */}
        <Typography>Perustukset / Lohko 2</Typography>
        <Typography>Lorem ipsum dolor sit amet consectetur.</Typography>
        <Typography>Perustukset / Lohko 2</Typography>
        <Typography>Lorem ipsum dolor sit amet consectetur.</Typography>
      </Box>
    </Card>
  );

  const renderTasksColumn = () => (
    <Card sx={{ flex: 1, minWidth: 0, overflow: "auto", boxShadow: "none" }}>
      <Typography component="h2" variant="h6" sx={{ padding: "1rem" }}>
        Omat tehtäväni
      </Typography>
      <Box sx={{ padding: "1rem" }}>
        <TableContainer>
          <Table style={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell>Tekijä</TableCell>
                <TableCell>Tehtävä</TableCell>
                <TableCell>Valmis arvio</TableCell>
                <TableCell>Tila</TableCell>
                <TableCell>Valmius</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Replace with actual task data */}
              <TableRow>
                <TableCell>Seppo Suunnittelija</TableCell>
                <TableCell>Perustuseleikkaukset</TableCell>
                <TableCell>20.10.2023</TableCell>
                <TableCell>Alioitettu</TableCell>
                <TableCell>
                  <ProgressBadge progress={75} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );

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
          {renderTasksColumn()}
          {/* Delays Column */}
          {renderDelaysColumn()}
        </Box>
      </Box>
    </FlexColumnLayout>
  );
}
