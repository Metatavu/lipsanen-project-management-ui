import { Chip } from "@mui/material";
import { TaskStatus } from "generated/client";
import { TaskStatusColor } from "types";

/**
 * Task utilities
 */
namespace TaskUtils {
  const taskStatusColors = {
    [TaskStatus.NotStarted]: TaskStatusColor.NOT_STARTED,
    [TaskStatus.InProgress]: TaskStatusColor.IN_PROGRESS,
    [TaskStatus.Done]: TaskStatusColor.DONE,
  };

  /**
   * Formats status text to start with a capital letter and the rest in lowercase
   *
   * @param status task status
   */
  export const formatStatusText = (status: TaskStatus) =>
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, " ");

  /**
   * Renders task status element
   */
  export const renderStatusElement = (status: TaskStatus) => (
    <Chip
      size="small"
      sx={{ backgroundColor: taskStatusColors[status], color: "white", width: "100px" }}
      label={formatStatusText(status)}
    />
  );
}

export default TaskUtils;