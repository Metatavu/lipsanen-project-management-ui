/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from "./../../routes/__root"
import { Route as UsersImport } from "./../../routes/users"
import { Route as SettingsImport } from "./../../routes/settings"
import { Route as RolesImport } from "./../../routes/roles"
import { Route as ProjectsImport } from "./../../routes/projects"
import { Route as ProjectTemplatesImport } from "./../../routes/project-templates"
import { Route as MonitoringImport } from "./../../routes/monitoring"
import { Route as IndexImport } from "./../../routes/index"
import { Route as ProjectsProjectIdUsersImport } from "./../../routes/projects_.$projectId.users"
import { Route as ProjectsProjectIdTrackingImport } from "./../../routes/projects_.$projectId.tracking"
import { Route as ProjectsProjectIdTasksImport } from "./../../routes/projects_.$projectId.tasks"
import { Route as ProjectsProjectIdScheduleImport } from "./../../routes/projects_.$projectId.schedule"
import { Route as ProjectsProjectIdTasksNewImport } from "./../../routes/projects_.$projectId.tasks.new"
import { Route as ProjectsProjectIdTasksTaskIdImport } from "./../../routes/projects_.$projectId.tasks.$taskId"
import { Route as ProjectsProjectIdScheduleMilestoneIdTasksImport } from "./../../routes/projects_.$projectId.schedule_.$milestoneId.tasks"

// Create/Update Routes

const UsersRoute = UsersImport.update({
  path: "/users",
  getParentRoute: () => rootRoute,
} as any)

const SettingsRoute = SettingsImport.update({
  path: "/settings",
  getParentRoute: () => rootRoute,
} as any)

const RolesRoute = RolesImport.update({
  path: "/roles",
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

const ProjectsProjectIdUsersRoute = ProjectsProjectIdUsersImport.update({
  path: "/projects/$projectId/users",
  getParentRoute: () => rootRoute,
} as any)

const ProjectsProjectIdTrackingRoute = ProjectsProjectIdTrackingImport.update({
  path: "/projects/$projectId/tracking",
  getParentRoute: () => rootRoute,
} as any)

const ProjectsProjectIdTasksRoute = ProjectsProjectIdTasksImport.update({
  path: "/projects/$projectId/tasks",
  getParentRoute: () => rootRoute,
} as any)

const ProjectsProjectIdScheduleRoute = ProjectsProjectIdScheduleImport.update({
  path: "/projects/$projectId/schedule",
  getParentRoute: () => rootRoute,
} as any)

const ProjectsProjectIdTasksNewRoute = ProjectsProjectIdTasksNewImport.update({
  path: "/new",
  getParentRoute: () => ProjectsProjectIdTasksRoute,
} as any)

const ProjectsProjectIdTasksTaskIdRoute =
  ProjectsProjectIdTasksTaskIdImport.update({
    path: "/$taskId",
    getParentRoute: () => ProjectsProjectIdTasksRoute,
  } as any)

const ProjectsProjectIdScheduleMilestoneIdTasksRoute =
  ProjectsProjectIdScheduleMilestoneIdTasksImport.update({
    path: "/projects/$projectId/schedule/$milestoneId/tasks",
    getParentRoute: () => rootRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/"
      path: "/"
      fullPath: "/"
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    "/monitoring": {
      id: "/monitoring"
      path: "/monitoring"
      fullPath: "/monitoring"
      preLoaderRoute: typeof MonitoringImport
      parentRoute: typeof rootRoute
    }
    "/project-templates": {
      id: "/project-templates"
      path: "/project-templates"
      fullPath: "/project-templates"
      preLoaderRoute: typeof ProjectTemplatesImport
      parentRoute: typeof rootRoute
    }
    "/projects": {
      id: "/projects"
      path: "/projects"
      fullPath: "/projects"
      preLoaderRoute: typeof ProjectsImport
      parentRoute: typeof rootRoute
    }
    "/roles": {
      id: "/roles"
      path: "/roles"
      fullPath: "/roles"
      preLoaderRoute: typeof RolesImport
      parentRoute: typeof rootRoute
    }
    "/settings": {
      id: "/settings"
      path: "/settings"
      fullPath: "/settings"
      preLoaderRoute: typeof SettingsImport
      parentRoute: typeof rootRoute
    }
    "/users": {
      id: "/users"
      path: "/users"
      fullPath: "/users"
      preLoaderRoute: typeof UsersImport
      parentRoute: typeof rootRoute
    }
    "/projects/$projectId/schedule": {
      id: "/projects/$projectId/schedule"
      path: "/projects/$projectId/schedule"
      fullPath: "/projects/$projectId/schedule"
      preLoaderRoute: typeof ProjectsProjectIdScheduleImport
      parentRoute: typeof rootRoute
    }
    "/projects/$projectId/tasks": {
      id: "/projects/$projectId/tasks"
      path: "/projects/$projectId/tasks"
      fullPath: "/projects/$projectId/tasks"
      preLoaderRoute: typeof ProjectsProjectIdTasksImport
      parentRoute: typeof rootRoute
    }
    "/projects/$projectId/tracking": {
      id: "/projects/$projectId/tracking"
      path: "/projects/$projectId/tracking"
      fullPath: "/projects/$projectId/tracking"
      preLoaderRoute: typeof ProjectsProjectIdTrackingImport
      parentRoute: typeof rootRoute
    }
    "/projects/$projectId/users": {
      id: "/projects/$projectId/users"
      path: "/projects/$projectId/users"
      fullPath: "/projects/$projectId/users"
      preLoaderRoute: typeof ProjectsProjectIdUsersImport
      parentRoute: typeof rootRoute
    }
    "/projects/$projectId/tasks/$taskId": {
      id: "/projects/$projectId/tasks/$taskId"
      path: "/$taskId"
      fullPath: "/projects/$projectId/tasks/$taskId"
      preLoaderRoute: typeof ProjectsProjectIdTasksTaskIdImport
      parentRoute: typeof ProjectsProjectIdTasksImport
    }
    "/projects/$projectId/tasks/new": {
      id: "/projects/$projectId/tasks/new"
      path: "/new"
      fullPath: "/projects/$projectId/tasks/new"
      preLoaderRoute: typeof ProjectsProjectIdTasksNewImport
      parentRoute: typeof ProjectsProjectIdTasksImport
    }
    "/projects/$projectId/schedule/$milestoneId/tasks": {
      id: "/projects/$projectId/schedule/$milestoneId/tasks"
      path: "/projects/$projectId/schedule/$milestoneId/tasks"
      fullPath: "/projects/$projectId/schedule/$milestoneId/tasks"
      preLoaderRoute: typeof ProjectsProjectIdScheduleMilestoneIdTasksImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexRoute,
  MonitoringRoute,
  ProjectTemplatesRoute,
  ProjectsRoute,
  RolesRoute,
  SettingsRoute,
  UsersRoute,
  ProjectsProjectIdScheduleRoute,
  ProjectsProjectIdTasksRoute: ProjectsProjectIdTasksRoute.addChildren({
    ProjectsProjectIdTasksTaskIdRoute,
    ProjectsProjectIdTasksNewRoute,
  }),
  ProjectsProjectIdTrackingRoute,
  ProjectsProjectIdUsersRoute,
  ProjectsProjectIdScheduleMilestoneIdTasksRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/monitoring",
        "/project-templates",
        "/projects",
        "/roles",
        "/settings",
        "/users",
        "/projects/$projectId/schedule",
        "/projects/$projectId/tasks",
        "/projects/$projectId/tracking",
        "/projects/$projectId/users",
        "/projects/$projectId/schedule/$milestoneId/tasks"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/monitoring": {
      "filePath": "monitoring.tsx"
    },
    "/project-templates": {
      "filePath": "project-templates.tsx"
    },
    "/projects": {
      "filePath": "projects.tsx"
    },
    "/roles": {
      "filePath": "roles.tsx"
    },
    "/settings": {
      "filePath": "settings.tsx"
    },
    "/users": {
      "filePath": "users.tsx"
    },
    "/projects/$projectId/schedule": {
      "filePath": "projects_.$projectId.schedule.tsx"
    },
    "/projects/$projectId/tasks": {
      "filePath": "projects_.$projectId.tasks.tsx",
      "children": [
        "/projects/$projectId/tasks/$taskId",
        "/projects/$projectId/tasks/new"
      ]
    },
    "/projects/$projectId/tracking": {
      "filePath": "projects_.$projectId.tracking.tsx"
    },
    "/projects/$projectId/users": {
      "filePath": "projects_.$projectId.users.tsx"
    },
    "/projects/$projectId/tasks/$taskId": {
      "filePath": "projects_.$projectId.tasks.$taskId.tsx",
      "parent": "/projects/$projectId/tasks"
    },
    "/projects/$projectId/tasks/new": {
      "filePath": "projects_.$projectId.tasks.new.tsx",
      "parent": "/projects/$projectId/tasks"
    },
    "/projects/$projectId/schedule/$milestoneId/tasks": {
      "filePath": "projects_.$projectId.schedule_.$milestoneId.tasks.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
