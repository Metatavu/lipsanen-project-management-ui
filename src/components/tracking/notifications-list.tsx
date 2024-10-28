import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { Box, Card, LinearProgress, Tooltip, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChangeProposalCreatedNotificationData,
  ChangeProposalStatus,
  ChangeProposalStatusChangedNotificationData,
  CommentLeftNotificationData,
  NotificationEvent,
  NotificationType,
  Task,
  TaskAssignedNotificationData,
  TaskStatus,
  TaskStatusChangesNotificationData,
  UpdateNotificationEventRequest,
} from "generated/client";
import { useApi } from "hooks/use-api";
import { useTranslation } from "react-i18next";

/**
 * Component props
 */
interface Props {
  tasks: Task[];
  notificationEvents: NotificationEvent[];
  loading: boolean;
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
const NotificationsList = ({ tasks, notificationEvents, loading }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { NotificationEventsApi } = useApi();

  /**
   * Update notification event
   */
  const updateNotificationEvent = useMutation({
    mutationFn: (params: UpdateNotificationEventRequest) => NotificationEventsApi.updateNotificationEvent(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationEvents"] });
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingNotificationEvent"), error),
  });

  /**
   * Delete notification event mutation
   */
  const deleteNotificationEvent = useMutation({
    mutationFn: (notificationEventId: string) => NotificationEventsApi.deleteNotificationEvent({ notificationEventId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationEvents"] });
    },
    onError: (error) => console.error(t("errorHandling.errorDeletingNotificationEvent"), error),
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
   * Returns typed notification data based on notification type1
   *
   * @param notificationEvent NotificationEvent
   * @returns NotificationDataType
   */
  const getTypedNotificationData = (notificationEvent: NotificationEvent): NotificationDataType => {
    const { notification } = notificationEvent;

    switch (notification.type) {
      case NotificationType.ChangeProposalCreated:
        return notification.notificationData as ChangeProposalCreatedNotificationData;
      case NotificationType.ChangeProposalStatusChanged:
        return notification.notificationData as ChangeProposalStatusChangedNotificationData;
      case NotificationType.CommentLeft:
        return notification.notificationData as CommentLeftNotificationData;
      case NotificationType.TaskAssigned:
        return notification.notificationData as TaskAssignedNotificationData;
      case NotificationType.TaskStatusChanged:
        return notification.notificationData as TaskStatusChangesNotificationData;
    }
  };

  const formatChangeProposalStatus = {
    [ChangeProposalStatus.Pending]: "pending",
    [ChangeProposalStatus.Approved]: "approved",
    [ChangeProposalStatus.Rejected]: "rejected",
  };

  const formatTaskStatus = {
    [TaskStatus.NotStarted]: "not started",
    [TaskStatus.InProgress]: "in progress",
    [TaskStatus.Done]: "done",
    error: "Unknown task status",
  };

  /**
   * Renders notification message based on the notification type
   *
   * @param notificationEvent NotificationDataType
   */
  const renderNotificationMessage = (notificationEvent: NotificationEvent) => {
    const typedNotification = getTypedNotificationData(notificationEvent);

    switch (notificationEvent.notification.type) {
      case NotificationType.ChangeProposalCreated:
        return t("trackingScreen.notificationsList.changeProposalCreatedMessage");
      case NotificationType.ChangeProposalStatusChanged:
        return t("trackingScreen.notificationsList.changeProposalStatusChangedMessage", {
          newStatus:
            formatChangeProposalStatus[(typedNotification as ChangeProposalStatusChangedNotificationData).newStatus],
        });
      case NotificationType.CommentLeft:
        return t("trackingScreen.notificationsList.commentLeftMessage", {
          comment: (typedNotification as CommentLeftNotificationData).comment,
        });
      case NotificationType.TaskAssigned:
        // TODO: Waiting API update to include newlyAssignedUsers in this message
        return t("trackingScreen.notificationsList.taskAssignedMessage", { taskName: typedNotification.taskName });
      case NotificationType.TaskStatusChanged:
        return t("trackingScreen.notificationsList.taskStatusChangedMessage", {
          newStatus: formatTaskStatus[(typedNotification as TaskStatusChangesNotificationData).newStatus || "error"],
        });
      default:
        return "";
    }
  };

  /**
   * Render notification card
   *
   * @param notificationEvent notification event
   */
  const renderNotificationCard = (notificationEvent: NotificationEvent) => {
    const typedNotification = getTypedNotificationData(notificationEvent);

    return (
      <Card
        key={notificationEvent.id}
        sx={{
          width: "100%",
          marginBottom: "1rem",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.5rem 0.5rem",
            backgroundColor: "#f5f9ff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AssignmentOutlinedIcon sx={{ marginRight: "0.5rem" }} />
            <Typography variant="body2" fontWeight="normal">
              {tasks.find((task) => task.id === typedNotification.taskId)?.name ?? t("trackingScreen.tasksList.task")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {!notificationEvent.read && (
              <Tooltip
                title={t("trackingScreen.notificationsList.markRead")}
                onClick={() => onNotificationEventRead(notificationEvent)}
              >
                <Box
                  sx={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#3f51b5",
                    marginRight: "0.5rem",
                  }}
                />
              </Tooltip>
            )}
            <Tooltip
              title={t("trackingScreen.notificationsList.delete")}
              onClick={() => notificationEvent.id && deleteNotificationEvent.mutate(notificationEvent.id)}
            >
              <Box sx={{ cursor: "pointer" }}>
                <Typography variant="h6">×</Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ padding: "1rem" }}>
          <Typography variant="body2" color="textSecondary" sx={{ marginBottom: "0.5rem" }}>
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
    <>
      <Typography component="h2" variant="h6" sx={{ padding: "0 0 1rem 0", borderBottom: "1px solid #e0e0e0" }}>
        {t("trackingScreen.notificationsList.title")}
      </Typography>
      <Box>
        {Object.keys(groupedNotifications).map((date) => (
          <Box key={date} sx={{ position: "relative", marginBottom: "2rem" }}>
            {/* Vertical line */}
            <Box
              sx={{
                position: "absolute",
                left: "1rem",
                top: "2rem",
                height: "100%",
                width: "1px",
                backgroundColor: "black",
              }}
            />

            {/* Notification group */}
            <Box key={date} sx={{ position: "relative" }}>
              <Typography variant="h6" sx={{ marginBottom: "1rem" }}>
                {date}
              </Typography>
              {groupedNotifications[date].map(renderNotificationCard)}
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default NotificationsList;
