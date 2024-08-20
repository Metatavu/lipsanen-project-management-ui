import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { RegisteredRouter, RoutePaths } from "@tanstack/react-router";
import { Metadata, ProjectStatus, Task, TaskConnectionType, TaskStatus, UserRole } from "generated/client";
import { DefaultNamespace, ParseKeys } from "i18next";
import { DateTime } from "luxon";

export enum TaskConnectionRelationship {
  PARENT = "PARENT",
  CHILD = "CHILD",
}

export enum TaskStatusColor {
  NOT_STARTED = "#37474F",
  NOT_STARTED_SELECTED = "#546E7A",
  IN_PROGRESS = "#2E7D32",
  IN_PROGRESS_SELECTED = "#388E3C",
  DONE = "#0079BF",
  DONE_SELECTED = "#2196F3",
  OVERDUE = "#D32F2F",
  OVERDUE_SELECTED = "#F44336",
}

export enum ChangeProposalScope {
  TASK = "TASK",
  ROLE = "ROLE",
  REASON = "REASON",
}

export type NavigationLink = {
  route: RoutePaths<RegisteredRouter["routeTree"]>;
  labelKey: ParseKeys<DefaultNamespace>;
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  icon?: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
    muiName: string;
  };
};

export type ProjectStatusLabel = {
  status: ProjectStatus;
  color: string;
};

export type UploadMessage = {
  message: string;
  severity: "error" | "success" | "info" | "warning";
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Interface for options type
 */
export interface CompanyOptionType {
  inputValue?: string;
  name: string;
}

/**
 * Interface for milestone form data
 */
export interface MilestoneFormData {
  name: string;
  startDate: DateTime<true> | DateTime<false> | null;
  endDate: DateTime<true> | DateTime<false> | null;
}

/**
 * Interface for task form data
 */
export interface TaskFormData {
  name: string;
  startDate: DateTime<true> | DateTime<false> | null;
  endDate: DateTime<true> | DateTime<false> | null;
  status: TaskStatus;
  assigneeIds: string[];
  positionId?: string;
  userRole?: UserRole;
  estimatedDuration?: number;
  estimatedReadiness?: number;
  attachmentUrls: string[];
}

/**
 * Interface for task connection table data
 */
export interface TaskConnectionTableData {
  id?: string;
  connectionId: string;
  type: TaskConnectionType;
  hierarchy: TaskConnectionRelationship;
  attachedTask?: Task;
}

/**
 * Interface for icon options
 */
export interface IconOption {
  label: string;
  value: string;
  icon: object;
}

/**
 * Interface delays by task view
 */
export interface DelaysByTask {
  id: string;
  taskId: string;
  metadata: Metadata;
  reason: string;
  endDate: Date;
};

/**
 * Interface delays by role view
 */
export interface DelaysByRole {
  id: string;
  positionName: string;
  taskIds: string[];
  delayedTasksNumber: number;
  delayedTasksPercentage: number;
  totalTasksDuration: number;
  totalDelayDuration: number;
};

/**
 * Interface delays by reason view
 */
export interface DelaysByReason {
  id: string;
  reasonText: string;
  taskIds: string[];
  totalTasksDuration: number;
  totalDelayDuration: number;
};