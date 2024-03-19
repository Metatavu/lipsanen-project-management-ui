import { atom } from "jotai";
import { KeycloakProfile, KeycloakTokenParsed } from "keycloak-js";

export type Auth = {
  tokenRaw: string;
  logout: () => void;
  token: KeycloakTokenParsed;
};

export const authAtom = atom<Auth | undefined>(undefined);
export const userProfileAtom = atom<KeycloakProfile | undefined>(undefined);
