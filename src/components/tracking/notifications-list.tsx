import { Circle, Clear } from "@mui/icons-material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { Box, Breadcrumbs, Card, Divider, IconButton, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authAtom } from "atoms/auth";
import { RouterLink } from "components/generic/router-link";
import {
  type ChangeProposalCreatedNotificationData,
  type ChangeProposalStatusChangedNotificationData,
  type CommentLeftNotificationData,
  type NotificationEvent,
  NotificationType,
  type TaskAssignedNotificationData,
  type TaskStatusChangesNotificationData,
  type UpdateNotificationEventRequest,
} from "generated/client";
import { useFindUserQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { useSetError } from "utils/error-handling";

/**
 * Component props
 */
interface Props {
  notificationEvents: NotificationEvent[];
  loading: boolean;
  appbarView?: boolean;
  projectId?: string;
}
/**
 * Notification data type
 */
type NotificationDataType =
  | ChangeProposalCreatedNotificationData
  | ChangeProposalStatusChangedNotificationData
  | CommentLeftNotificationData
  | TaskAssignedNotificationData
  | TaskStatusChangesNotificationData;

/**
 * Notifications list component
 *
 * @param props props
 */
const NotificationsList = ({ projectId, notificationEvents, loading }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { NotificationEventsApi } = useApi();
  const setError = useSetError();
  const [auth] = useAtom(authAtom);

  const findUserQuery = useFindUserQuery({ userId: auth?.token.sub });
  const user = findUserQuery.data;

  /**
   * Update notification event
   */
  const updateNotificationEvent = useMutation({
    mutationFn: (params: UpdateNotificationEventRequest) => NotificationEventsApi.updateNotificationEvent(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationEvents"] });
    },
    onError: (error) => setError(t("errorHandling.errorUpdatingNotificationEvent"), error),
  });

  /**
   * Delete notification event mutation
   */
  const deleteNotificationEvent = useMutation({
    mutationFn: (notificationEventId: string) => NotificationEventsApi.deleteNotificationEvent({ notificationEventId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationEvents"] });
    },
    onError: (error) => setError(t("errorHandling.errorDeletingNotificationEvent"), error),
  });

  /**
   * Return a loading indicator if loading
   */
  if (loading) {
    return (
      <Box sx={{ padding: "1rem" }}>
        <LinearProgress />
      </Box>
    );
  }

  /**
   * Helper function to group notifications by date
   *
   * @param notificationEvents notification events
   */
  const groupNotificationsByDate = (notificationEvents: NotificationEvent[]) => {
    const groups: { [key: string]: NotificationEvent[] } = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const event of notificationEvents) {
      const eventDate = event.metadata?.createdAt ? new Date(event.metadata.createdAt) : null;
      if (!eventDate) continue;

      const dateString = eventDate.toLocaleDateString("en-GB").replace(/\//g, ".");

      if (eventDate.toDateString() === today.toDateString()) {
        const todayLabel = t("trackingScreen.notificationsList.today");
        groups[todayLabel] = groups[todayLabel] || [];
        groups[todayLabel].push(event);
      } else if (eventDate.toDateString() === yesterday.toDateString()) {
        const yesterdayLabel = t("trackingScreen.notificationsList.yesterday");
        groups[yesterdayLabel] = groups[yesterdayLabel] || [];
        groups[yesterdayLabel].push(event);
      } else {
        groups[dateString] = groups[dateString] || [];
        groups[dateString].push(event);
      }
    }

    return groups;
  };

  /**
   * Handle notification event read
   *
   * @param notificationEvent notification event
   */
  const onNotificationEventRead = (notificationEvent: NotificationEvent) => {
    if (notificationEvent.read || !notificationEvent.id) return;

    updateNotificationEvent.mutate({
      notificationEventId: notificationEvent.id,
      notificationEvent: {
        ...notificationEvent,
        read: true,
      },
    });
  };

  /**
   * Renders notification message based on the notification type
   *
   * @param notificationEvent NotificationDataType
   */
  const renderNotificationMessage = (notificationEvent: NotificationEvent) => {
    const typedNotification = notificationEvent.notification.notificationData as NotificationDataType;

    switch (notificationEvent.notification.type) {
      case NotificationType.ChangeProposalCreated:
        return t("trackingScreen.notificationsList.changeProposalCreatedMessage");
      case NotificationType.ChangeProposalStatusChanged: {
        const proposalStatus = (typedNotification as ChangeProposalStatusChangedNotificationData).newStatus;
        if (!proposalStatus) {
          return t("trackingScreen.notificationsList.errorMessage");
        }

        return t("trackingScreen.notificationsList.changeProposalStatusChangedMessage", {
          newStatus: t(`changeProposalStatuses.${proposalStatus}`),
        });
      }
      case NotificationType.CommentLeft:
        return t("trackingScreen.notificationsList.commentLeftMessage", {
          comment: (typedNotification as CommentLeftNotificationData).comment,
        });
      case NotificationType.TaskAssigned: {
        const taskAssignedNotification = typedNotification as TaskAssignedNotificationData;
        const userAssigned = user?.id ? taskAssignedNotification.assigneeIds.includes(user?.id) : false;

        const message = userAssigned
          ? t("trackingScreen.notificationsList.taskAssignedMessage", {
              taskName: taskAssignedNotification.taskName,
            })
          : t("trackingScreen.notificationsList.otherUserAssignedMessage", {
              taskName: taskAssignedNotification.taskName,
              numberOfUsers: taskAssignedNotification.assigneeIds.length,
            });

        return message;
      }
      case NotificationType.TaskStatusChanged: {
        const newStatus = (typedNotification as TaskStatusChangesNotificationData).newStatus;
        if (!newStatus) {
          return t("trackingScreen.notificationsList.errorMessage");
        }

        return t("trackingScreen.notificationsList.taskStatusChangedMessage", {
          newStatus: t(`taskStatuses.${newStatus}`),
        });
      }
      default:
        return t("trackingScreen.notificationsList.errorMessage");
    }
  };

  /**
   * Render notification card
   *
   * @param notificationEvent notification event
   */
  const renderNotificationCard = (notificationEvent: NotificationEvent) => {
    const typedNotification = notificationEvent.notification.notificationData as NotificationDataType;

    return (
      <Card
        key={notificationEvent.id}
        sx={{
          width: "100%",
          marginBottom: "1rem",
          overflow: "hidden",
        }}
        variant="outlined"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" p={1} bgcolor="#f5f9ff">
          <Box display="flex" alignItems="center">
            <AssignmentOutlinedIcon sx={{ marginRight: "0.5rem" }} />
            <Breadcrumbs>
              {!projectId && (
                <RouterLink to="/projects/$projectId/tracking" params={{ projectId: typedNotification.projectId }}>
                  <Typography variant="body2" color="textSecondary">
                    {typedNotification.projectName}
                  </Typography>
                </RouterLink>
              )}
              <RouterLink
                to="/projects/$projectId/schedule/$milestoneId/tasks"
                params={{ projectId: typedNotification.projectId, milestoneId: typedNotification.milestoneId }}
              >
                <Typography variant="body2" color="textSecondary">
                  {typedNotification.milestoneName}
                </Typography>
              </RouterLink>
              <RouterLink
                to="/projects/$projectId/tasks/$taskId"
                params={{ projectId: typedNotification.projectId, taskId: typedNotification.taskId }}
              >
                <Typography variant="body2" color="textSecondary">
                  {typedNotification.taskName}
                </Typography>
              </RouterLink>
            </Breadcrumbs>
          </Box>
          <Box display="flex" alignItems="center" gap={0.25}>
            {!notificationEvent.read && (
              <Tooltip title={t("trackingScreen.notificationsList.markRead")}>
                <IconButton size="small" sx={{ p: 0.75 }} onClick={() => onNotificationEventRead(notificationEvent)}>
                  <Circle sx={{ color: "#3f51b5", width: "12px", height: "12px" }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip
              title={t("trackingScreen.notificationsList.delete")}
              onClick={() => notificationEvent.id && deleteNotificationEvent.mutate(notificationEvent.id)}
            >
              <IconButton
                size="small"
                onClick={() => notificationEvent.id && deleteNotificationEvent.mutate(notificationEvent.id)}
              >
                <Clear sx={{ width: "1rem", height: "1rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box p={2}>
          <Typography variant="body2" color="textPrimary" mb={1}>
            {renderNotificationMessage(notificationEvent)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {notificationEvent.metadata?.createdAt
              ? `${notificationEvent.metadata.createdAt
                  .toLocaleDateString("en-GB")
                  .replace(/\//g, ".")} - ${notificationEvent.metadata.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : ""}
          </Typography>
        </Box>
      </Card>
    );
  };

  /**
   * Group notifications by date
   */
  const groupedNotifications = groupNotificationsByDate(notificationEvents);

  /**
   * Main component render
   */
  return (
    <Box p={1}>
      <Typography component="h2" variant="h6">
        {t("trackingScreen.notificationsList.title")}
      </Typography>
      <Divider variant="fullWidth" sx={{ my: 1 }} />
      {Object.keys(groupedNotifications).map((date) => (
        <Box key={date} position="relative">
          {/* Vertical line */}
          <Box position="absolute" left="1rem" top="2rem" height="calc(100% - 2rem)" width="1px" bgcolor="black" />

          {/* Notification group */}
          <Stack position="relative" spacing={2}>
            <Typography variant="h6">{date}</Typography>
            {groupedNotifications[date].map(renderNotificationCard)}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};

export default NotificationsList;
