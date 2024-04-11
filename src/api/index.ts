import config from "../app/config";
import { Configuration, ConfigurationParameters, ProjectsApi, UsersApi, CompaniesApi } from "../generated/client";

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
    usersApi: new UsersApi(getConfiguration()),
    companiesApi: new CompaniesApi(getConfiguration()),
  };
};
