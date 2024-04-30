import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { RegisteredRouter, RoutePaths } from "@tanstack/react-router";
import { ProjectStatus } from "generated/client";
import { DefaultNamespace, ParseKeys } from "i18next";
import { DateTime } from "luxon";

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
/**
 * Interface for options type
 */
export interface CompanyOptionType {
  inputValue?: string;
  name: string;
}

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Interface for milestone form data
 */
export interface MilestoneFormData {
  name: string;
  startDate: DateTime | null;
  endDate: DateTime | null;
}
