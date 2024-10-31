import { User } from "generated/client";
import { atom } from "jotai";
import { KeycloakProfile, KeycloakTokenParsed } from "keycloak-js";

/**
 * Add custom properties to the KeycloakTokenParsed interface
 */
declare module "keycloak-js" {
  interface KeycloakTokenParsed {
    userId?: string;
  }
}

export type Auth = {
  tokenRaw: string;
  logout: () => void;
  token: KeycloakTokenParsed;
  roles: string[];
};

export const authAtom = atom<Auth | undefined>(undefined);
export const userProfileAtom = atom<KeycloakProfile | undefined>(undefined);
export const apiUserAtom = atom<User | undefined>(undefined);
