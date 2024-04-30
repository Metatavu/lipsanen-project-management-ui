/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from "./../../routes/__root"
import { Route as UsersImport } from "./../../routes/users"
import { Route as SettingsImport } from "./../../routes/settings"
import { Route as ProjectsImport } from "./../../routes/projects"
import { Route as ProjectTemplatesImport } from "./../../routes/project-templates"
import { Route as MonitoringImport } from "./../../routes/monitoring"
import { Route as IndexImport } from "./../../routes/index"
import { Route as ProjectsProjectIdTrackingImport } from "./../../routes/projects_.$projectId.tracking"
import { Route as ProjectsProjectIdScheduleImport } from "./../../routes/projects_.$projectId.schedule"

// Create/Update Routes

const UsersRoute = UsersImport.update({
  path: "/users",
  getParentRoute: () => rootRoute,
} as any)

const SettingsRoute = SettingsImport.update({
  path: "/settings",
  getParentRoute: () => rootRoute,
} as any)

const ProjectsRoute = ProjectsImport.update({
  path: "/projects",
  getParentRoute: () => rootRoute,
} as any)

const ProjectTemplatesRoute = ProjectTemplatesImport.update({
  path: "/project-templates",
  getParentRoute: () => rootRoute,
} as any)

const MonitoringRoute = MonitoringImport.update({
  path: "/monitoring",
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: "/",
  getParentRoute: () => rootRoute,
} as any)

const ProjectsProjectIdTrackingRoute = ProjectsProjectIdTrackingImport.update({
  path: "/projects/$projectId/tracking",
  getParentRoute: () => rootRoute,
} as any)

const ProjectsProjectIdScheduleRoute = ProjectsProjectIdScheduleImport.update({
  path: "/projects/$projectId/schedule",
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    "/monitoring": {
      preLoaderRoute: typeof MonitoringImport
      parentRoute: typeof rootRoute
    }
    "/project-templates": {
      preLoaderRoute: typeof ProjectTemplatesImport
      parentRoute: typeof rootRoute
    }
    "/projects": {
      preLoaderRoute: typeof ProjectsImport
      parentRoute: typeof rootRoute
    }
    "/settings": {
      preLoaderRoute: typeof SettingsImport
      parentRoute: typeof rootRoute
    }
    "/users": {
      preLoaderRoute: typeof UsersImport
      parentRoute: typeof rootRoute
    }
    "/projects/$projectId/schedule": {
      preLoaderRoute: typeof ProjectsProjectIdScheduleImport
      parentRoute: typeof rootRoute
    }
    "/projects/$projectId/tracking": {
      preLoaderRoute: typeof ProjectsProjectIdTrackingImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  MonitoringRoute,
  ProjectTemplatesRoute,
  ProjectsRoute,
  SettingsRoute,
  UsersRoute,
  ProjectsProjectIdScheduleRoute,
  ProjectsProjectIdTrackingRoute,
])

/* prettier-ignore-end */
