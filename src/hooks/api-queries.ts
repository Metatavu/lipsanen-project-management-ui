import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { handleError, handleErrorWithMessage } from "utils";
import { useApi } from "./use-api";
import {
  Company,
  ListCompaniesRequest,
  ListProjectMilestonesRequest,
  ListProjectsRequest,
  ListUsersRequest,
  Project,
  User,
} from "generated/client";
import { filesApi } from "api/files";

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

export const useListFilesQuery = () =>
  useQuery({
    queryKey: ["files"],
    queryFn: () => filesApi.listFiles().catch(handleErrorWithMessage("Error listing files")),
  });

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
