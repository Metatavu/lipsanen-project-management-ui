import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { handleError, handleErrorWithMessage } from "utils";
import { useApi } from "./use-api";
import {
  Company,
  FindProjectMilestoneRequest,
  ListCompaniesRequest,
  ListTasksRequest,
  ListProjectMilestonesRequest,
  ListProjectsRequest,
  ListUsersRequest,
  Project,
  User,
  ListChangeProposalsRequest,
  ListTaskConnectionsRequest,
  FindTaskRequest,
  ListTaskCommentsRequest,
  ListJobPositionsRequest,
  JobPosition,
  ListNotificationEventsRequest,
} from "generated/client";
import { filesApi } from "api/files";

/**
 * List companies query hook
 *
 * @param {ListCompaniesRequest} params
 */
export const useListCompaniesQuery = (params?: ListCompaniesRequest) => {
  const { companiesApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["companies", params],
    queryFn: async (): Promise<{
      companies: Company[];
      maxResults: number;
    }> => {
      try {
        const [companies, headers] = await companiesApi.listCompaniesWithHeaders(params ?? {});
        return {
          companies: companies,
          maxResults: parseInt(headers.get("X-Total-Count") ?? "0"),
        };
      } catch (error) {
        handleError("Error listing companies", error);
        throw Error(t("errorHandling.errorListingCompanies"), { cause: error });
      }
    },
  });
};

/**
 *List users query hook
 *
 * @param params ListUsersRequest
 */
export const useListUsersQuery = (params?: ListUsersRequest) => {
  const { usersApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["users", params],
    queryFn: async (): Promise<{ users: User[]; maxResults: number }> => {
      try {
        const [users, headers] = await usersApi.listUsersWithHeaders(params ?? {});
        return {
          users: users,
          maxResults: parseInt(headers.get("X-Total-Count") ?? "0"),
        };
      } catch (error) {
        handleError("Error listing users", error);
        throw Error(t("errorHandling.errorListingUsers"), { cause: error });
      }
    },
  });
};

/**
 * Find user query hook
 *
 * @param userId string
 */
export const useFindUserQuery = (userId?: string, includeRoles?: boolean) => {
  const { usersApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      try {
        if (!userId) return null;
        const user = await usersApi.findUser({ userId: userId, includeRoles: includeRoles });
        return user ?? null;
      } catch (error) {
        handleError("Error finding user", error);
        throw Error(t("errorHandling.errorFindingUser"), { cause: error });
      }
    },
    enabled: !!userId,
    placeholderData: () => null,
  });
};

/**
 * Find users query hook
 *
 * @param userIds list of strings
 */
export const useFindUsersQuery = (userIds?: string[]) => {
  const { usersApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["users", userIds],
    queryFn: async () => {
      try {
        if (!userIds?.length) return null;

        const userPromises = userIds.map(async (userId) => usersApi.listUsers({ keycloakId: userId }));

        const userLists = await Promise.all(userPromises);
        return userLists.flat();
      } catch (error) {
        handleError("Error finding multiple users", error);
        throw Error(t("errorHandling.errorFindingMultipleUsers"), {
          cause: error,
        });
      }
    },
    enabled: !!userIds?.length,
    placeholderData: () => null,
  });
};

/**
 * List projects query hook
 *
 * @param params ListProjectsRequest
 */
export const useListProjectsQuery = (params?: ListProjectsRequest) => {
  const { projectsApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["projects", params],
    queryFn: async (): Promise<{ projects: Project[]; maxResults: number }> => {
      try {
        const [projects, headers] = await projectsApi.listProjectsWithHeaders(params ?? {});
        return {
          projects: projects,
          maxResults: parseInt(headers.get("X-Total-Count") ?? "0"),
        };
      } catch (error) {
        handleError("Error listing projects", error);
        throw Error(t("errorHandling.errorListingProjects"), { cause: error });
      }
    },
  });
};

/**
 * Find project query hook
 *
 * @param projectId string
 */
export const useFindProjectQuery = (projectId?: string) => {
  const { projectsApi } = useApi();

  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: () =>
      projectId
        ? projectsApi.findProject({ projectId: projectId }).catch(handleErrorWithMessage("Error finding project"))
        : null,
    enabled: !!projectId,
    placeholderData: () => null,
  });
};

/**
 * List project themes query hook
 *
 * @param projectId string
 */
export const useListProjectThemesQuery = (projectId?: string) => {
  const { projectThemesApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["projects", projectId, "themes"],
    queryFn: async () => {
      if (!projectId) return null;
      try {
        return projectThemesApi.listProjectThemes({ projectId: projectId });
      } catch (error) {
        handleError("Error listing project themes", error);
        throw Error(t("errorHandling.errorListingProjectThemes"), {
          cause: error,
        });
      }
    },
    enabled: !!projectId,
  });
};

/**
 * List project users query hook
 *
 * @param projectId project ID
 */
export const useListProjectUsersQuery = (projectId?: string) => {
  const { usersApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["projects", projectId, "users"],
    queryFn: async () => {
      if (!projectId) return null;
      try {
        const users = await usersApi.listUsers();
        const projectUsers = users.filter((user) => user.projectIds?.includes(projectId));
        return projectUsers;
      } catch (error) {
        handleError("Error listing project users", error);
        throw Error(t("errorHandling.errorListingProjectUsers"), {
          cause: error,
        });
      }
    },
    enabled: !!projectId,
  });
};

/**
 * List logos query hook
 *
 * @param filesPath path to logo files
 */
export const useListLogosQuery = (filesPath: string) =>
  useQuery({
    queryKey: ["logos"],
    queryFn: () => filesApi.listFiles(filesPath).catch(handleErrorWithMessage("Error listing logos")),
  });

/**
 * List task attachments query hook
 */
export const useListTaskAttachmentsQuery = (filesPath: string) =>
  useQuery({
    queryKey: ["taskAttachments"],
    queryFn: () => filesApi.listFiles(filesPath).catch(handleErrorWithMessage("Error listing task attachments")),
  });

/**
 * List project milestones query hook
 *
 * @param params request params
 */
export const useListProjectMilestonesQuery = ({ projectId }: ListProjectMilestonesRequest) => {
  const { projectMilestonesApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["projects", projectId, "milestones"],
    queryFn: async () => {
      try {
        return projectMilestonesApi.listProjectMilestones({ projectId });
      } catch (error) {
        handleError("Error listing project milestones", error);
        throw Error(t("errorHandling.errorListingProjectMilestones"), {
          cause: error,
        });
      }
    },
  });
};

/**
 * Find project milestone query hook
 *
 * @param params request params
 */
export const useFindProjectMilestoneQuery = ({ projectId, milestoneId }: FindProjectMilestoneRequest) => {
  const { projectMilestonesApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["projects", projectId, "milestones", milestoneId],
    queryFn: async () => {
      try {
        return projectMilestonesApi.findProjectMilestone({
          projectId,
          milestoneId,
        });
      } catch (error) {
        handleError("Error finding project milestone", error);
        throw Error(t("errorHandling.errorFindingProjectMilestone"), {
          cause: error,
        });
      }
    },
  });
};

/**
 * List tasks query hook
 *
 * @param params request params
 */
export const useListTasksQuery = ({ projectId, ...filters }: ListTasksRequest) => {
  const { tasksApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["projects", projectId, "tasks", filters],
    queryFn: async () => {
      try {
        return tasksApi.listTasks({ projectId, ...filters });
      } catch (error) {
        handleError("Error listing tasks", error);
        throw Error(t("errorHandling.errorListingTasks"), { cause: error });
      }
    },
  });
};

/**
 * List change proposals query hook
 *
 * @param params request params
 */
export const useListChangeProposalsQuery = ({ projectId, ...filters }: ListChangeProposalsRequest) => {
  const { changeProposalsApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["projects", projectId, "changeProposals", filters],
    queryFn: async () => {
      try {
        return changeProposalsApi.listChangeProposals({
          projectId,
          ...filters,
        });
      } catch (error) {
        handleError("Error listing change proposals", error);
        throw Error(t("errorHandling.errorListingChangeProposals"), {
          cause: error,
        });
      }
    },
  });
};

/**
 * Find task query hook
 *
 * @param params FindTaskRequest
 */
export const useFindTaskQuery = ({ projectId, taskId }: FindTaskRequest) => {
  const { tasksApi: milestoneTasksApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["projects", projectId, "tasks", taskId],
    queryFn: async () => {
      try {
        return milestoneTasksApi.findTask({ projectId, taskId });
      } catch (error) {
        handleError("Error finding milestone task", error);
        throw Error(t("errorHandling.errorFindingMilestoneTask"), {
          cause: error,
        });
      }
    },
  });
};

/**
 * List task connections query hook
 *
 * @param params ListTaskConnectionsRequest
 */
export const useListTaskConnectionsQuery = ({ projectId, ...filters }: ListTaskConnectionsRequest) => {
  const { taskConnectionsApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["projects", projectId, "connections", filters],
    queryFn: async () => {
      try {
        return taskConnectionsApi.listTaskConnections({
          projectId,
          ...filters,
        });
      } catch (error) {
        handleError("Error listing task connections", error);
        throw Error(t("errorHandling.errorListingTaskConnections"), {
          cause: error,
        });
      }
    },
  });
};

/**
 * List task comments query hook
 *
 * @param params ListTaskCommentsRequest
 */
export const useListTaskCommentsQuery = (params: ListTaskCommentsRequest) => {
  const { taskCommentsApi } = useApi();
  const { t } = useTranslation();
  const { projectId, taskId } = params;

  return useQuery({
    queryKey: ["comments", projectId, taskId],
    queryFn: async () => {
      try {
        return taskCommentsApi.listTaskComments({ projectId: projectId, taskId: taskId });
      } catch (error) {
        handleError("Error listing task comments", error);
        throw Error(t("errorHandling.errorListingTaskComments"), { cause: error });
      }
    },
    enabled: !!projectId && !!taskId,
  });
};

/**
 * List job positions query hook
 *
 * @param params request params
 */
export const useListJobPositionsQuery = (params?: ListJobPositionsRequest) => {
  const { jobPositionsApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["jobPositions", params],
    queryFn: async (): Promise<{
      jobPositions: JobPosition[];
      maxResults: number;
    }> => {
      try {
        const [jobPositions, headers] = await jobPositionsApi.listJobPositionsWithHeaders(params ?? {});
        return {
          jobPositions: jobPositions,
          maxResults: parseInt(headers.get("X-Total-Count") ?? "0"),
        };
      } catch (error) {
        handleError("Error listing job positions", error);
        throw Error(t("errorHandling.errorListingJobPositions"), {
          cause: error,
        });
      }
    },
  });
};

/**
 * List notification events query hook
 *
 * @param params ListNotificationEventsRequest
 */
export const useListNotificationEventsQuery = (params: ListNotificationEventsRequest) => {
  const { NotificationEventsApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["notificationEvents", params],
    queryFn: async () => {
      try {
        return NotificationEventsApi.listNotificationEvents(params);
      } catch (error) {
        handleError("Error listing notification events", error);
        throw Error(t("errorHandling.errorListingNotificationEvents"), { cause: error });
      }
    },
  });
};
