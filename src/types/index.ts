import { RegisteredRouter, RoutePaths } from "@tanstack/react-router";
import { DefaultNamespace, ParseKeys } from "i18next";

/**
 * Project status enum
 * TODO: Add statuses or remove if replaced with an API specification
 */
export enum ProjectStatus {
  IN_PROGRESS = "In progress",
  READY = "Ready"
}

export type NavigationLink = {
  route: RoutePaths<RegisteredRouter["routeTree"]>;
  labelKey: ParseKeys<DefaultNamespace>;
};

export type ProjectStatusLabel = {
  status: ProjectStatus;
  color: string;
};
