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

  /**
   * Save task connections visible setting to local storage
   * 
   * @param visible boolean
   */
  export const saveTaskConnectionsVisibleSetting = (visible: boolean) => {
    localStorage.setItem("taskConnectionsVisible", JSON.stringify(visible));
  };

  /**
   * Get task connections visible setting from local storage
   */
  export const getTaskConnectionsVisibleSetting = () => {
    const savedSetting = localStorage.getItem("taskConnectionsVisible");
    return savedSetting ? JSON.parse(savedSetting) : false;
  };
}

export default ChartHelpers;