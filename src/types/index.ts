import { RegisteredRouter, RoutePaths } from "@tanstack/react-router";
import { ProjectStatus } from "generated/client";
import { DefaultNamespace, ParseKeys } from "i18next";

export type NavigationLink = {
  route: RoutePaths<RegisteredRouter["routeTree"]>;
  labelKey: ParseKeys<DefaultNamespace>;
};

export type ProjectStatusLabel = {
  status: ProjectStatus;
  color: string;
};

export type UploadMessage = {
  message: string;
  severity: "error" | "success" | "info" | "warning";
};
/**
 * Interface for options type
 */
export interface CompanyOptionType {
  inputValue?: string;
  name: string;
}

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
