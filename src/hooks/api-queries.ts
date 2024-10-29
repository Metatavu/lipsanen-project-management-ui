import { useQuery } from "@tanstack/react-query";
import { filesApi } from "api/files";
import {
  Company,
  FindAttachmentRequest,
  FindProjectMilestoneRequest,
  FindTaskRequest,
  FindUserRequest,
  JobPosition,
  ListAttachmentsRequest,
  ListChangeProposalsRequest,
  ListCompaniesRequest,
  ListJobPositionsRequest,
  ListNotificationEventsRequest,
  ListProjectMilestonesRequest,
  ListProjectsRequest,
  ListTaskCommentsRequest,
  ListTaskConnectionsRequest,
  ListTasksRequest,
  ListUsersRequest,
  Project,
  User,
} from "generated/client";
import { useTranslation } from "react-i18next";
import { WithMaxResults } from "types";
import { useSetError } from "utils/error-handling";
import { useApi } from "./use-api";

const ONE_MINUTE = 1000 * 60;
const FIVE_MINUTES = ONE_MINUTE * 5;

/**
 * List companies query hook
 *
 * @param {ListCompaniesRequest} params
 */
export const useListCompaniesQuery = (params: ListCompaniesRequest = {}) => {
  const { first, max } = params;
  const { companiesApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["companies", { first, max }],
    queryFn: async (): Promise<WithMaxResults<"companies", Company>> => {
      try {
        const [companies, headers] = await companiesApi.listCompaniesWithHeaders(params);
        return {
          companies: companies,
          maxResults: parseInt(headers.get("X-Total-Count") ?? "0"),
        };
      } catch (error) {
        setError(t("errorHandling.errorListingCompanies"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingCompanies"), { cause: error });
      }
    },
    staleTime: FIVE_MINUTES,
  });
};

/**
 *List users query hook
 *
 * @param params ListUsersRequest
 */
export const useListUsersQuery = (params: ListUsersRequest = {}) => {
  const { first, max, companyId, includeRoles, jobPositionId, projectId } = params;
  const { usersApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["users", { first, max, companyId, includeRoles, jobPositionId, projectId }],
    queryFn: async (): Promise<WithMaxResults<"users", User>> => {
      try {
        const [users, headers] = await usersApi.listUsersWithHeaders(params);
        return {
          users: users,
          maxResults: parseInt(headers.get("X-Total-Count") ?? "0"),
        };
      } catch (error) {
        setError(t("errorHandling.errorListingUsers"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingUsers"), { cause: error });
      }
    },
    staleTime: FIVE_MINUTES,
  });
};

/**
 * Find user query hook
 *
 * @param params FindUserRequest
 */
export const useFindUserQuery = (params: Partial<FindUserRequest>) => {
  const { userId, includeRoles } = params;
  const { usersApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["users", userId, { includeRoles }],
    queryFn: async () => {
      try {
        return await usersApi.findUser(params as FindUserRequest);
      } catch (error) {
        setError(t("errorHandling.errorFindingUser"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorFindingUser"), { cause: error });
      }
    },
    enabled: !!userId,
    placeholderData: () => undefined,
    staleTime: FIVE_MINUTES,
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
  const setError = useSetError();

  return useQuery({
    queryKey: ["users", userIds],
    queryFn: async () => {
      try {
        if (!userIds?.length) return null;

        const userPromises = userIds.map((userId) => usersApi.findUser({ userId: userId }));

        const userLists = await Promise.all(userPromises);
        return userLists.flat();
      } catch (error) {
        setError(t("errorHandling.errorFindingMultipleUsers"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorFindingMultipleUsers"), {
          cause: error,
        });
      }
    },
    enabled: !!userIds?.length,
    placeholderData: () => null,
    staleTime: FIVE_MINUTES,
  });
};

/**
 * List projects query hook
 *
 * @param params ListProjectsRequest
 */
export const useListProjectsQuery = (params: ListProjectsRequest = {}) => {
  const { first, max } = params;
  const { projectsApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["projects", { first, max }],
    queryFn: async (): Promise<WithMaxResults<"projects", Project>> => {
      try {
        const [projects, headers] = await projectsApi.listProjectsWithHeaders(params);

        return {
          projects: projects,
          maxResults: parseInt(headers.get("X-Total-Count") ?? "0"),
        };
      } catch (error) {
        setError(t("errorHandling.errorListingProjects"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingProjects"), { cause: error });
      }
    },
    staleTime: FIVE_MINUTES,
  });
};

/**
 * Find project query hook
 *
 * @param projectId string
 */
export const useFindProjectQuery = (projectId?: string) => {
  const { projectsApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      if (!projectId) return null;

      try {
        return projectsApi.findProject({ projectId: projectId });
      } catch (error) {
        setError(t("errorHandling.errorFindingProject"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorFindingProject"), { cause: error });
      }
    },
    enabled: !!projectId,
    placeholderData: () => null,
    staleTime: FIVE_MINUTES,
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
  const setError = useSetError();

  return useQuery({
    queryKey: ["projects", projectId, "themes"],
    queryFn: async () => {
      if (!projectId) return null;
      try {
        return await projectThemesApi.listProjectThemes({ projectId: projectId });
      } catch (error) {
        setError(t("errorHandling.errorListingProjectThemes"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingProjectThemes"), {
          cause: error,
        });
      }
    },
    enabled: !!projectId,
    staleTime: FIVE_MINUTES,
  });
};

/**
 * List files query hook
 *
 * @param path path to files
 */
export const useListFilesQuery = (path: string) => {
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      try {
        return await filesApi.listFiles(path);
      } catch (error) {
        setError("Error listing logos", error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingFiles"), {
          cause: error,
        });
      }
    },
    staleTime: FIVE_MINUTES,
  });
};

/**
 * List attachments query hook
 *
 * @param params request params
 */
export const useListAttachmentsQuery = (params: ListAttachmentsRequest = {}) => {
  const { attachmentsApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["attachments", params],
    queryFn: async () => {
      try {
        return await attachmentsApi.listAttachments(params);
      } catch (error) {
        setError("Error listing attachments", error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingAttachments"), {
          cause: error,
        });
      }
    },
    staleTime: FIVE_MINUTES,
  });
};

/**
 * Find attachment query hook
 *
 * @param params request params
 */
export const useFindAttachmentQuery = ({ attachmentId }: FindAttachmentRequest) => {
  const { attachmentsApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["attachments", attachmentId],
    queryFn: async () => {
      try {
        return await attachmentsApi.findAttachment({ attachmentId });
      } catch (error) {
        setError("Error finding attachment", error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorFindingAttachment"), {
          cause: error,
        });
      }
    },
    staleTime: FIVE_MINUTES,
  });
};

/**
 * List project milestones query hook
 *
 * @param params request params
 */
export const useListProjectMilestonesQuery = ({ projectId }: ListProjectMilestonesRequest) => {
  const { projectMilestonesApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["projects", projectId, "milestones"],
    queryFn: async () => {
      try {
        return await projectMilestonesApi.listProjectMilestones({ projectId });
      } catch (error) {
        setError(t("errorHandling.errorListingProjectMilestones"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingProjectMilestones"), {
          cause: error,
        });
      }
    },
    enabled: !!projectId,
    staleTime: FIVE_MINUTES,
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
  const setError = useSetError();

  return useQuery({
    queryKey: ["projects", projectId, "milestones", milestoneId],
    queryFn: async () => {
      try {
        return await projectMilestonesApi.findProjectMilestone({ projectId, milestoneId });
      } catch (error) {
        setError(t("errorHandling.errorFindingProjectMilestone"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorFindingProjectMilestone"), {
          cause: error,
        });
      }
    },
    enabled: !!projectId && !!milestoneId,
    staleTime: FIVE_MINUTES,
  });
};

/**
 * List tasks query hook
 *
 * @param params request params
 */
export const useListTasksQuery = ({ projectId, milestoneId, first, max }: ListTasksRequest) => {
  const { tasksApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["tasks", { milestoneId, first, max }],
    queryFn: async () => {
      try {
        return await tasksApi.listTasks({ projectId, milestoneId, first, max });
      } catch (error) {
        setError(t("errorHandling.errorListingTasks"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingTasks"), { cause: error });
      }
    },
    staleTime: ONE_MINUTE,
  });
};

/**
 * List change proposals query hook
 *
 * @param params request params
 */
export const useListChangeProposalsQuery = (params: ListChangeProposalsRequest) => {
  const { projectId, milestoneId, taskId, first, max } = params;
  const { changeProposalsApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["changeProposals", { projectId, milestoneId, taskId, first, max }],
    queryFn: async () => {
      try {
        return await changeProposalsApi.listChangeProposals(params);
      } catch (error) {
        setError(t("errorHandling.errorListingChangeProposals"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingChangeProposals"), {
          cause: error,
        });
      }
    },
    staleTime: ONE_MINUTE,
  });
};

/**
 * Find task query hook
 *
 * @param params FindTaskRequest
 */
export const useFindTaskQuery = ({ taskId }: FindTaskRequest) => {
  const { tasksApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["tasks", taskId],
    queryFn: async () => {
      try {
        return await tasksApi.findTask({ taskId });
      } catch (error) {
        setError(t("errorHandling.errorFindingTask"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorFindingTask"), {
          cause: error,
        });
      }
    },
    enabled: !!taskId,
    staleTime: ONE_MINUTE,
  });
};

/**
 * List task connections query hook
 *
 * @param params ListTaskConnectionsRequest
 */
export const useListTaskConnectionsQuery = (params: ListTaskConnectionsRequest) => {
  const { projectId, taskId, connectionRole } = params;
  const { taskConnectionsApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["projects", projectId, "connections", { taskId, connectionRole }],
    queryFn: async () => {
      try {
        return await taskConnectionsApi.listTaskConnections(params);
      } catch (error) {
        setError(t("errorHandling.errorListingTaskConnections"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingTaskConnections"), { cause: error });
      }
    },
    enabled: !!projectId,
    staleTime: ONE_MINUTE,
  });
};

/**
 * List task comments query hook
 *
 * @param params ListTaskCommentsRequest
 */
export const useListTaskCommentsQuery = (params: ListTaskCommentsRequest) => {
  const { taskId } = params;
  const { taskCommentsApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["tasks", taskId, "comments"],
    queryFn: async () => {
      try {
        return taskCommentsApi.listTaskComments(params);
      } catch (error) {
        setError(t("errorHandling.errorListingTaskComments"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingTaskComments"), { cause: error });
      }
    },
    enabled: !!taskId,
    staleTime: ONE_MINUTE,
  });
};

/**
 * List job positions query hook
 *
 * @param params request params
 */
export const useListJobPositionsQuery = (params: ListJobPositionsRequest = {}) => {
  const { first, max } = params;
  const { jobPositionsApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["jobPositions", { first, max }],
    queryFn: async (): Promise<WithMaxResults<"jobPositions", JobPosition>> => {
      try {
        const [jobPositions, headers] = await jobPositionsApi.listJobPositionsWithHeaders(params);
        return {
          jobPositions: jobPositions,
          maxResults: parseInt(headers.get("X-Total-Count") ?? "0"),
        };
      } catch (error) {
        setError(t("errorHandling.errorListingJobPositions"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingJobPositions"), { cause: error });
      }
    },
    staleTime: FIVE_MINUTES,
  });
};

/**
 * List notification events query hook
 *
 * @param params ListNotificationEventsRequest
 */
export const useListNotificationEventsQuery = (params: Partial<ListNotificationEventsRequest>) => {
  const { projectId, taskId, userId, readStatus, first, max } = params;
  const { NotificationEventsApi } = useApi();
  const { t } = useTranslation();
  const setError = useSetError();

  return useQuery({
    queryKey: ["notificationEvents", { projectId, taskId, userId, readStatus, first, max }],
    queryFn: async () => {
      try {
        return NotificationEventsApi.listNotificationEvents(params as ListNotificationEventsRequest);
      } catch (error) {
        setError(t("errorHandling.errorListingNotificationEvents"), error instanceof Error ? error : undefined);
        throw Error(t("errorHandling.errorListingNotificationEvents"), { cause: error });
      }
    },
    enabled: !!userId,
    staleTime: 0,
  });
};
