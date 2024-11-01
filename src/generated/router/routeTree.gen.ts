/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from "./../../routes/__root"
import { Route as UsersImport } from "./../../routes/users"
import { Route as TrackingImport } from "./../../routes/tracking"
import { Route as SettingsImport } from "./../../routes/settings"
import { Route as ProjectsImport } from "./../../routes/projects"
import { Route as ProjectTemplatesImport } from "./../../routes/project-templates"
import { Route as PositionsImport } from "./../../routes/positions"
import { Route as IndexImport } from "./../../routes/index"
import { Route as ProjectsProjectIdImport } from "./../../routes/projects_.$projectId"
import { Route as ProjectsProjectIdUsersImport } from "./../../routes/projects_.$projectId.users"
import { Route as ProjectsProjectIdTrackingImport } from "./../../routes/projects_.$projectId.tracking"
import { Route as ProjectsProjectIdTasksImport } from "./../../routes/projects_.$projectId.tasks"
import { Route as ProjectsProjectIdSettingsImport } from "./../../routes/projects_.$projectId.settings"
import { Route as ProjectsProjectIdScheduleImport } from "./../../routes/projects_.$projectId.schedule"
import { Route as ProjectsProjectIdAttachmentsImport } from "./../../routes/projects_.$projectId.attachments"
import { Route as ProjectsProjectIdTasksNewImport } from "./../../routes/projects_.$projectId.tasks.new"
import { Route as ProjectsProjectIdTasksTaskIdImport } from "./../../routes/projects_.$projectId.tasks.$taskId"
import { Route as ProjectsProjectIdAttachmentsNewImport } from "./../../routes/projects_.$projectId.attachments.new"
import { Route as ProjectsProjectIdAttachmentsAttachmentIdImport } from "./../../routes/projects_.$projectId.attachments.$attachmentId"
import { Route as ProjectsProjectIdScheduleMilestoneIdTasksImport } from "./../../routes/projects_.$projectId.schedule_.$milestoneId.tasks"

// Create/Update Routes

const UsersRoute = UsersImport.update({
  path: "/users",
  getParentRoute: () => rootRoute,
} as any)

const TrackingRoute = TrackingImport.update({
  path: "/tracking",
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

const PositionsRoute = PositionsImport.update({
  path: "/positions",
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: "/",
  getParentRoute: () => rootRoute,
} as any)

const ProjectsProjectIdRoute = ProjectsProjectIdImport.update({
  path: "/projects/$projectId",
  getParentRoute: () => rootRoute,
} as any)

const ProjectsProjectIdUsersRoute = ProjectsProjectIdUsersImport.update({
  path: "/users",
  getParentRoute: () => ProjectsProjectIdRoute,
} as any)

const ProjectsProjectIdTrackingRoute = ProjectsProjectIdTrackingImport.update({
  path: "/tracking",
  getParentRoute: () => ProjectsProjectIdRoute,
} as any)

const ProjectsProjectIdTasksRoute = ProjectsProjectIdTasksImport.update({
  path: "/tasks",
  getParentRoute: () => ProjectsProjectIdRoute,
} as any)

const ProjectsProjectIdSettingsRoute = ProjectsProjectIdSettingsImport.update({
  path: "/settings",
  getParentRoute: () => ProjectsProjectIdRoute,
} as any)

const ProjectsProjectIdScheduleRoute = ProjectsProjectIdScheduleImport.update({
  path: "/schedule",
  getParentRoute: () => ProjectsProjectIdRoute,
} as any)

const ProjectsProjectIdAttachmentsRoute =
  ProjectsProjectIdAttachmentsImport.update({
    path: "/attachments",
    getParentRoute: () => ProjectsProjectIdRoute,
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

const ProjectsProjectIdAttachmentsNewRoute =
  ProjectsProjectIdAttachmentsNewImport.update({
    path: "/new",
    getParentRoute: () => ProjectsProjectIdAttachmentsRoute,
  } as any)

const ProjectsProjectIdAttachmentsAttachmentIdRoute =
  ProjectsProjectIdAttachmentsAttachmentIdImport.update({
    path: "/$attachmentId",
    getParentRoute: () => ProjectsProjectIdAttachmentsRoute,
  } as any)

const ProjectsProjectIdScheduleMilestoneIdTasksRoute =
  ProjectsProjectIdScheduleMilestoneIdTasksImport.update({
    path: "/schedule/$milestoneId/tasks",
    getParentRoute: () => ProjectsProjectIdRoute,
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
    "/positions": {
      id: "/positions"
      path: "/positions"
      fullPath: "/positions"
      preLoaderRoute: typeof PositionsImport
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
    "/settings": {
      id: "/settings"
      path: "/settings"
      fullPath: "/settings"
      preLoaderRoute: typeof SettingsImport
      parentRoute: typeof rootRoute
    }
    "/tracking": {
      id: "/tracking"
      path: "/tracking"
      fullPath: "/tracking"
      preLoaderRoute: typeof TrackingImport
      parentRoute: typeof rootRoute
    }
    "/users": {
      id: "/users"
      path: "/users"
      fullPath: "/users"
      preLoaderRoute: typeof UsersImport
      parentRoute: typeof rootRoute
    }
    "/projects/$projectId": {
      id: "/projects/$projectId"
      path: "/projects/$projectId"
      fullPath: "/projects/$projectId"
      preLoaderRoute: typeof ProjectsProjectIdImport
      parentRoute: typeof rootRoute
    }
    "/projects/$projectId/attachments": {
      id: "/projects/$projectId/attachments"
      path: "/attachments"
      fullPath: "/projects/$projectId/attachments"
      preLoaderRoute: typeof ProjectsProjectIdAttachmentsImport
      parentRoute: typeof ProjectsProjectIdImport
    }
    "/projects/$projectId/schedule": {
      id: "/projects/$projectId/schedule"
      path: "/schedule"
      fullPath: "/projects/$projectId/schedule"
      preLoaderRoute: typeof ProjectsProjectIdScheduleImport
      parentRoute: typeof ProjectsProjectIdImport
    }
    "/projects/$projectId/settings": {
      id: "/projects/$projectId/settings"
      path: "/settings"
      fullPath: "/projects/$projectId/settings"
      preLoaderRoute: typeof ProjectsProjectIdSettingsImport
      parentRoute: typeof ProjectsProjectIdImport
    }
    "/projects/$projectId/tasks": {
      id: "/projects/$projectId/tasks"
      path: "/tasks"
      fullPath: "/projects/$projectId/tasks"
      preLoaderRoute: typeof ProjectsProjectIdTasksImport
      parentRoute: typeof ProjectsProjectIdImport
    }
    "/projects/$projectId/tracking": {
      id: "/projects/$projectId/tracking"
      path: "/tracking"
      fullPath: "/projects/$projectId/tracking"
      preLoaderRoute: typeof ProjectsProjectIdTrackingImport
      parentRoute: typeof ProjectsProjectIdImport
    }
    "/projects/$projectId/users": {
      id: "/projects/$projectId/users"
      path: "/users"
      fullPath: "/projects/$projectId/users"
      preLoaderRoute: typeof ProjectsProjectIdUsersImport
      parentRoute: typeof ProjectsProjectIdImport
    }
    "/projects/$projectId/attachments/$attachmentId": {
      id: "/projects/$projectId/attachments/$attachmentId"
      path: "/$attachmentId"
      fullPath: "/projects/$projectId/attachments/$attachmentId"
      preLoaderRoute: typeof ProjectsProjectIdAttachmentsAttachmentIdImport
      parentRoute: typeof ProjectsProjectIdAttachmentsImport
    }
    "/projects/$projectId/attachments/new": {
      id: "/projects/$projectId/attachments/new"
      path: "/new"
      fullPath: "/projects/$projectId/attachments/new"
      preLoaderRoute: typeof ProjectsProjectIdAttachmentsNewImport
      parentRoute: typeof ProjectsProjectIdAttachmentsImport
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
      path: "/schedule/$milestoneId/tasks"
      fullPath: "/projects/$projectId/schedule/$milestoneId/tasks"
      preLoaderRoute: typeof ProjectsProjectIdScheduleMilestoneIdTasksImport
      parentRoute: typeof ProjectsProjectIdImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexRoute,
  PositionsRoute,
  ProjectTemplatesRoute,
  ProjectsRoute,
  SettingsRoute,
  TrackingRoute,
  UsersRoute,
  ProjectsProjectIdRoute: ProjectsProjectIdRoute.addChildren({
    ProjectsProjectIdAttachmentsRoute:
      ProjectsProjectIdAttachmentsRoute.addChildren({
        ProjectsProjectIdAttachmentsAttachmentIdRoute,
        ProjectsProjectIdAttachmentsNewRoute,
      }),
    ProjectsProjectIdScheduleRoute,
    ProjectsProjectIdSettingsRoute,
    ProjectsProjectIdTasksRoute: ProjectsProjectIdTasksRoute.addChildren({
      ProjectsProjectIdTasksTaskIdRoute,
      ProjectsProjectIdTasksNewRoute,
    }),
    ProjectsProjectIdTrackingRoute,
    ProjectsProjectIdUsersRoute,
    ProjectsProjectIdScheduleMilestoneIdTasksRoute,
  }),
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/positions",
        "/project-templates",
        "/projects",
        "/settings",
        "/tracking",
        "/users",
        "/projects/$projectId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/positions": {
      "filePath": "positions.tsx"
    },
    "/project-templates": {
      "filePath": "project-templates.tsx"
    },
    "/projects": {
      "filePath": "projects.tsx"
    },
    "/settings": {
      "filePath": "settings.tsx"
    },
    "/tracking": {
      "filePath": "tracking.tsx"
    },
    "/users": {
      "filePath": "users.tsx"
    },
    "/projects/$projectId": {
      "filePath": "projects_.$projectId.tsx",
      "children": [
        "/projects/$projectId/attachments",
        "/projects/$projectId/schedule",
        "/projects/$projectId/settings",
        "/projects/$projectId/tasks",
        "/projects/$projectId/tracking",
        "/projects/$projectId/users",
        "/projects/$projectId/schedule/$milestoneId/tasks"
      ]
    },
    "/projects/$projectId/attachments": {
      "filePath": "projects_.$projectId.attachments.tsx",
      "parent": "/projects/$projectId",
      "children": [
        "/projects/$projectId/attachments/$attachmentId",
        "/projects/$projectId/attachments/new"
      ]
    },
    "/projects/$projectId/schedule": {
      "filePath": "projects_.$projectId.schedule.tsx",
      "parent": "/projects/$projectId"
    },
    "/projects/$projectId/settings": {
      "filePath": "projects_.$projectId.settings.tsx",
      "parent": "/projects/$projectId"
    },
    "/projects/$projectId/tasks": {
      "filePath": "projects_.$projectId.tasks.tsx",
      "parent": "/projects/$projectId",
      "children": [
        "/projects/$projectId/tasks/$taskId",
        "/projects/$projectId/tasks/new"
      ]
    },
    "/projects/$projectId/tracking": {
      "filePath": "projects_.$projectId.tracking.tsx",
      "parent": "/projects/$projectId"
    },
    "/projects/$projectId/users": {
      "filePath": "projects_.$projectId.users.tsx",
      "parent": "/projects/$projectId"
    },
    "/projects/$projectId/attachments/$attachmentId": {
      "filePath": "projects_.$projectId.attachments.$attachmentId.tsx",
      "parent": "/projects/$projectId/attachments"
    },
    "/projects/$projectId/attachments/new": {
      "filePath": "projects_.$projectId.attachments.new.tsx",
      "parent": "/projects/$projectId/attachments"
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
      "filePath": "projects_.$projectId.schedule_.$milestoneId.tasks.tsx",
      "parent": "/projects/$projectId"
    }
  }
}
ROUTE_MANIFEST_END */
