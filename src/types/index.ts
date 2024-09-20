import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { ParseRoute, RouteById } from "@tanstack/react-router";
import { Metadata, ProjectStatus, Task, TaskConnectionType, TaskStatus, UserRole } from "generated/client";
import { User } from "generated/client";
import { routeTree } from "generated/router/routeTree.gen";
import { DefaultNamespace, ParseKeys } from "i18next";
import { DateTime, Interval } from "luxon";
import { ReactNode } from "react";

/**
 * Task connection relationships
 */
export enum TaskConnectionRelationship {
  PARENT = "PARENT",
  CHILD = "CHILD",
}

/**
 * Task status colors
 */
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

/**
 * Change proposal scopes
 */
export const ChangeProposalScope = {
  TASK: "TASK",
  ROLE: "ROLE",
  REASON: "REASON",
} as const;

/**
 * Type for the change proposal scope
 */
export type ChangeProposalScope = (typeof ChangeProposalScope)[keyof typeof ChangeProposalScope];

/**
 * Type for the app router
 */
export type AppRouter = typeof routeTree;

/**
 * Type for all route options in the app
 */
export type AppRouteOptions = ParseRoute<AppRouter>["fullPath"];

/**
 * Type for search schema for given route in the app
 *
 * @typeParam RoutePath route path
 */
export type AppRouteSearchSchema<RoutePath extends AppRouteOptions> = RouteById<
  AppRouter,
  RoutePath
>["types"]["fullSearchSchema"];

/**
 * Navigation link type
 */
export type NavigationLink = {
  route: AppRouteOptions;
  labelKey: ParseKeys<DefaultNamespace>;
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  icon?: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
    muiName: string;
  };
};

/**
 * Type for project status label with color
 */
export type ProjectStatusLabel = {
  status: ProjectStatus;
  color: string;
};

/**
 * Type for upload message structure
 */
export type UploadMessage = {
  message: string;
  severity: "error" | "success" | "info" | "warning";
};

/**
 * Removes the optionality of properties specified to type K in the given type T
 */
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
  startDate: DateTime<true> | null;
  endDate: DateTime<true> | null;
}

/**
 * Interface for task form data
 */
export interface TaskFormData {
  name: string;
  milestoneId?: string;
  startDate?: DateTime<true>;
  endDate?: DateTime<true>;
  status: TaskStatus;
  assigneeIds: string[];
  positionId?: string;
  dependentUserId?: string;
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
}

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
}

/**
 * Interface delays by reason view
 */
export interface DelaysByReason {
  id: string;
  reasonText: string;
  taskIds: string[];
  totalTasksDuration: number;
  totalDelayDuration: number;
}

/**
 * Helper type for combining a user and their tasks
 */
export type UserWithTasks = {
  user: User;
  tasks: TaskWithInterval[];
};

/**
 * Helper type for combining a task and its interval
 */
export type TaskWithInterval = {
  task: Task;
  interval: Interval<true>;
};

/**
 * Generic type for combining list query result items with max results
 * @param Name - name of the property containing the listed items
 * @param T - type of the listed items
 */
export type WithMaxResults<Name extends string, T> = { [N in Name]: T[] } & { maxResults: number };

/**
 * Form field type
 *
 * @typeParam FormValues form values type
 */
// biome-ignore lint/complexity/noBannedTypes: empty object needs to be narrowed out
export type FormField<FormValues> = FormValues extends {}
  ? keyof FormValues extends never
    ? never
    : keyof FormValues
  : never;

/**
 * Form field change handler type
 *
 * @typeParam T form values type
 */
export type FormFieldChangeHandler<FormValues> = (
  field: FormField<FormValues>,
) => (event: React.ChangeEvent<HTMLInputElement>) => void;

/**
 * Render filter form function type
 */
export type RenderFilterFormFn<FormValues> = (props: {
  formValues: FormValues;
  onChange: FormFieldChangeHandler<FormValues>;
}) => ReactNode;
