import { Chip } from "@mui/material";
import { TaskStatus } from "generated/client";
import { Translation } from "react-i18next";
import { TaskStatusColor } from "types";

/**
 * Task utilities
 */
namespace TaskUtils {
  /**
   * Renders task status element
   */
  export const renderStatusElement = (status: TaskStatus) => (
    <Chip
      size="small"
      sx={{ backgroundColor: TaskStatusColor[status], color: "white", width: "100px" }}
      label={<Translation>{(t) => t(`taskStatuses.${status}`)}</Translation>}
    />
  );
}

export default TaskUtils;
