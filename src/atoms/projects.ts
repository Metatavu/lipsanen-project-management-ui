import { atom } from "jotai";
import { Project } from "../generated/client";

export const projectsAtom = atom<Project[]>([]);
