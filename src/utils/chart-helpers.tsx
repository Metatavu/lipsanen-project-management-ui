import { Task, Milestone } from "generated/client";
import { TaskStatusColor } from "types";

namespace ChartHelpers {
  /**
   * Get task color based on task status
   */
  export const getTaskColorBasedOnStatus = (task: Task) => {
    switch (task.status) {
      case "IN_PROGRESS":
        return TaskStatusColor.IN_PROGRESS;
      case "DONE":
        return TaskStatusColor.DONE;
      default:
        return TaskStatusColor.NOT_STARTED;
    }
  };

  /**
   * Get task selected color based on task status
   */
  export const getTaskSelectedColorBasedOnStatus = (task: Task) => {
    switch (task.status) {
      case "IN_PROGRESS":
        return TaskStatusColor.IN_PROGRESS_SELECTED;
      case "DONE":
        return TaskStatusColor.DONE_SELECTED;
      default:
        return TaskStatusColor.NOT_STARTED_SELECTED;
    }
  };

  /**
   * Get milestone color based on readiness
   */
  export const getMilestoneColorBasedOnReadiness = (milestone: Milestone) => {
    const readiness = milestone.estimatedReadiness ?? 0;
    if (readiness > 99) {
      return TaskStatusColor.DONE;
    }
    if (readiness > 0) {
      return TaskStatusColor.IN_PROGRESS;
    }
    return TaskStatusColor.NOT_STARTED;
  };

  /**
   * Get milestone selected color based on readiness
   */
  export const getMilestoneSelectedColorBasedOnReadiness = (milestone: Milestone) => {
    const readiness = milestone.estimatedReadiness ?? 0;
    if (readiness > 99) {
      return TaskStatusColor.DONE_SELECTED;
    }
    if (readiness > 0) {
      return TaskStatusColor.IN_PROGRESS_SELECTED;
    }
    return TaskStatusColor.NOT_STARTED_SELECTED;
  };
}

export default ChartHelpers;