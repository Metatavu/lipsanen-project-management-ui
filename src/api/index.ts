import config from "../app/config";
import {
  Configuration,
  ConfigurationParameters,
  ProjectsApi,
  UsersApi,
  CompaniesApi,
  ProjectThemesApi,
  ProjectMilestonesApi,
  TasksApi,
  ChangeProposalsApi,
  TaskConnectionsApi,
  JobPositionsApi,
  NotificationsApi,
  NotificationEventsApi
} from "../generated/client";

type ConfigConstructor<T> = new (_params: ConfigurationParameters) => T;

const getConfigurationFactory =
  <T>(ConfigConstructor: ConfigConstructor<T>, basePath: string, accessToken?: string) =>
  () => {
    return new ConfigConstructor({
      basePath: basePath,
      accessToken: accessToken,
    });
  };

export const getApiClient = (accessToken?: string) => {
  const getConfiguration = getConfigurationFactory(Configuration, config.api.baseUrl, accessToken);

  return {
    projectsApi: new ProjectsApi(getConfiguration()),
    projectThemesApi: new ProjectThemesApi(getConfiguration()),
    usersApi: new UsersApi(getConfiguration()),
    companiesApi: new CompaniesApi(getConfiguration()),
    projectMilestonesApi: new ProjectMilestonesApi(getConfiguration()),
    tasksApi: new TasksApi(getConfiguration()),
    changeProposalsApi: new ChangeProposalsApi(getConfiguration()),
    taskConnectionsApi: new TaskConnectionsApi(getConfiguration()),
    jobPositionsApi: new JobPositionsApi(getConfiguration()),
    notificationsApi: new NotificationsApi(getConfiguration()),
    NotificationEventsApi: new NotificationEventsApi(getConfiguration()),
  };
};
