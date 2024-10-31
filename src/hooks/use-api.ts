import { useAtomValue } from "jotai";
import { apiClientAtom } from "../atoms/api";

export const useApi = () => useAtomValue(apiClientAtom);
