import { cleanEnv, url, str } from "envalid";

const env = cleanEnv(import.meta.env, {
  VITE_KEYCLOAK_URL: url(),
  VITE_KEYCLOAK_REALM: str(),
  VITE_KEYCLOAK_CLIENT_ID: str(),
  VITE_API_BASE_URL: url(),
  VITE_CDN_BASE_URL: url(),
  VITE_LAMBDAS_BASE_URL: url(),
});

const config = {
  auth: {
    url: env.VITE_KEYCLOAK_URL,
    realm: env.VITE_KEYCLOAK_REALM,
    clientId: env.VITE_KEYCLOAK_CLIENT_ID,
  },
  api: {
    baseUrl: env.VITE_API_BASE_URL,
  },
  cdnBaseUrl: env.VITE_CDN_BASE_URL,
  lambdasBaseUrl: env.VITE_LAMBDAS_BASE_URL,
} as const;

export default config;
