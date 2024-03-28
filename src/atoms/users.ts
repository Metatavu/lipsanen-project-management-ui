import { atom } from "jotai";
import { User } from "../generated/client";

export const usersAtom = atom<User[]>([]);
