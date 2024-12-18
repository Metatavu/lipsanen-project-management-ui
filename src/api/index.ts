import config from "../app/config";
import {
  AttachmentsApi,
  ChangeProposalsApi,
  CompaniesApi,
  Configuration,
  ConfigurationParameters,
  JobPositionsApi,
  NotificationEventsApi,
  NotificationsApi,
  ProjectMilestonesApi,
  ProjectThemesApi,
  ProjectsApi,
  TaskCommentsApi,
  TaskConnectionsApi,
  TasksApi,
  UsersApi,
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
    taskCommentsApi: new TaskCommentsApi(getConfiguration()),
    jobPositionsApi: new JobPositionsApi(getConfiguration()),
    notificationsApi: new NotificationsApi(getConfiguration()),
    NotificationEventsApi: new NotificationEventsApi(getConfiguration()),
    attachmentsApi: new AttachmentsApi(getConfiguration()),
  };
};
