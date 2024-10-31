import { useSetAtom } from "jotai";
import { errorAtom } from "../atoms/error";

/**
 * Set gloabl error state
 */
export const useSetError = () => {
  const setError = useSetAtom(errorAtom);

  return (message: string, error?: Error) => {
    setError({ message, details: error });
  };
};
