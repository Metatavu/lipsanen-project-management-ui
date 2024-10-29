import { atom } from "jotai";

/**
 * Error handling state
 */
interface ErrorState {
  message: string;
  details?: Error;
}

export const errorAtom = atom<ErrorState | null>(null);
