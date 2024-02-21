import { RegisteredRouter, RoutePaths } from "@tanstack/react-router";
import { DefaultNamespace, ParseKeys } from "i18next";

export type NavigationLink = {
  route: RoutePaths<RegisteredRouter["routeTree"]>;
  labelKey: ParseKeys<DefaultNamespace>;
};
