import config from "app/config";
import { apiUserAtom, authAtom, userProfileAtom } from "atoms/auth";
import { useFindUserQuery } from "hooks/api-queries";
import { useAtom, useSetAtom } from "jotai";
import Keycloak from "keycloak-js";
import i18n from "localization/i18n";
import { ReactNode, useCallback, useEffect } from "react";
import { useSetError } from "utils/error-handling";

/**
 * Component properties
 */
type Props = {
  children: ReactNode;
};

const keycloak = new Keycloak(config.auth);

/**
 * Authentication provider component
 *
 * @param props component properties
 */
const AuthenticationProvider = ({ children }: Props) => {
  const [auth, setAuth] = useAtom(authAtom);
  const setUserProfile = useSetAtom(userProfileAtom);
  const setApiUser = useSetAtom(apiUserAtom);
  const setError = useSetError();

  const findApiUserQuery = useFindUserQuery({ userId: auth?.token.sub });

  useEffect(() => {
    if (findApiUserQuery.data) setApiUser(findApiUserQuery.data);
  }, [findApiUserQuery.data, setApiUser]);

  const updateAuthData = useCallback(() => {
    if (!(keycloak.tokenParsed && keycloak.token)) return;

    setAuth({
      token: keycloak.tokenParsed,
      tokenRaw: keycloak.token,
      logout: () => keycloak.logout({ redirectUri: `${window.location.origin}` }),
      roles: keycloak.realmAccess?.roles ?? [],
    });

    setUserProfile(keycloak.profile);
  }, [setAuth, setUserProfile]);

  const clearAuthData = useCallback(() => {
    setAuth(undefined);
    setUserProfile(undefined);
  }, [setAuth, setUserProfile]);

  const initAuth = useCallback(async () => {
    try {
      keycloak.onTokenExpired = () => keycloak.updateToken(5);

      keycloak.onAuthRefreshError = () => keycloak.login();
      keycloak.onAuthRefreshSuccess = () => updateAuthData();

      keycloak.onAuthError = (error) => console.error(error);
      keycloak.onAuthSuccess = async () => {
        try {
          await keycloak.loadUserProfile();
        } catch (error) {
          console.error("Could not load user profile", error);
          setError("Could not load user profile");
        }
        const locale = keycloak.tokenParsed?.locale ?? "fi";
        if (["fi", "en"].includes(locale)) {
          i18n.changeLanguage(locale);
        }

        updateAuthData();
      };

      keycloak.onAuthLogout = () => {
        clearAuthData();
        keycloak.login();
      };

      await keycloak.init({
        onLoad: "login-required",
        checkLoginIframe: false,
      });
    } catch (error) {
      console.error(error);
    }
  }, [clearAuthData, updateAuthData]);

  /**
   * Initializes authentication when component mounts
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (keycloak.authenticated === undefined) initAuth();
  }, []);

  if (!auth) return null;

  return children;
};

export default AuthenticationProvider;
