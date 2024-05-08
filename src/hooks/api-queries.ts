import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { handleError, handleErrorWithMessage } from "utils";
import { useApi } from "./use-api";
import {
  Company,
  ListCompaniesRequest,
  ListMilestoneTasksRequest,
  ListProjectMilestonesRequest,
  ListProjectsRequest,
  ListUsersRequest,
  Project,
  User,
} from "generated/client";
import { filesApi } from "api/files";

/**
 * List companies query hook
 *
 * @param params ListCompaniesRequest
 */
export const useListCompaniesQuery = (params?: ListCompaniesRequest) => {
  const { companiesApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["companies", params],
    queryFn: async (): Promise<{ companies: Company[]; maxResults: number }> => {
      try {
        const [companies, headers] = await companiesApi.listCompaniesWithHeaders(params ?? {});
        return { companies: companies, maxResults: parseInt(headers.get("X-Total-Count") ?? "0") };
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
        return { users: users, maxResults: parseInt(headers.get("X-Total-Count") ?? "0") };
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
export const useFindUserQuery = (userId?: string) => {
  const { usersApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      try {
        if (!userId) return null;
        const user = await usersApi.findUser({ userId: userId });
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
        return { projects: projects, maxResults: parseInt(headers.get("X-Total-Count") ?? "0") };
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
        throw Error(t("errorHandling.errorListingProjectThemes"), { cause: error });
      }
    },
    enabled: !!projectId,
  });
};

/**
 * List project users query hook
 * 
 * @param projectId string
 */
export const useListProjectUsersQuery = (projectId?: string) => {
  const { usersApi} = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["projects", projectId, "users"],
    queryFn: async () => {
      if (!projectId) return null;
      try {
        const users = await usersApi.listUsers();
        const projectUsers = users.filter(user => user.projectIds?.includes(projectId));
        return projectUsers;
      } catch (error) {
        handleError("Error listing project users", error);
        throw Error(t("errorHandling.errorListingProjectUsers"), { cause: error });
      }
    },
    enabled: !!projectId,
  });
};

/**
 * List files query hook
 */
export const useListFilesQuery = () =>
  useQuery({
    queryKey: ["files"],
    queryFn: () => filesApi.listFiles().catch(handleErrorWithMessage("Error listing files")),
  });

/**
 * List project milestones query hook
 *
 * @param params ListProjectMilestonesRequest
 */
export const useListProjectMilestonesQuery = (params: ListProjectMilestonesRequest) => {
  const { projectMilestonesApi } = useApi();
  const { t } = useTranslation();
  const { projectId } = params;

  return useQuery({
    queryKey: ["projectMilestones", projectId],
    queryFn: async () => {
      try {
        return projectMilestonesApi.listProjectMilestones({ projectId: projectId });
      } catch (error) {
        handleError("Error listing project milestones", error);
        throw Error(t("errorHandling.errorListingProjectMilestones"), { cause: error });
      }
    },
    enabled: !!projectId,
  });
};

/**
 * Find project milestone query hook
 * 
 * @param projectId string
 * @param milestoneId string
 */
export const useFindProjectMilestoneQuery = (projectId: string, milestoneId: string) => {
  const { projectMilestonesApi } = useApi();
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["projectMilestones", projectId, milestoneId],
    queryFn: async () => {
      try {
        return projectMilestonesApi.findProjectMilestone({ projectId: projectId, milestoneId: milestoneId });
      } catch (error) {
        handleError("Error finding project milestone", error);
        throw Error(t("errorHandling.errorFindingProjectMilestone"), { cause: error });
      }
    },
    enabled: !!projectId && !!milestoneId,
  });
}

/**
 * List milestone tasks query hook
 * 
 * @param params ListMilestoneTasksRequest
 */
export const useListMilestoneTasksQuery = (params: ListMilestoneTasksRequest) => {
  const { milestoneTasksApi } = useApi();
  const { t } = useTranslation();
  const { projectId, milestoneId } = params;

  return useQuery({
    queryKey: ["milestoneTasks", projectId, milestoneId],
    queryFn: async () => {
      try {
        return milestoneTasksApi.listTasks({ projectId: projectId, milestoneId: milestoneId });
      } catch (error) {
        handleError("Error listing milestone tasks", error);
        throw Error(t("errorHandling.errorListingMilestoneTasks"), { cause: error });
      }
    },
    enabled: !!projectId && !!milestoneId,
  });
};
