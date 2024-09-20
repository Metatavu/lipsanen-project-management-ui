import { ProjectStatus } from "generated/client";
import { z } from "zod";

/**
 * Zod schema for users search values
 */
export const usersSearchSchema = z.object({
  projectId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  jobPositionId: z.string().uuid().optional(),
});

/**
 * Users search schema
 */
export type UsersSearchSchema = z.infer<typeof usersSearchSchema>;

/**
 * Zod schema for tasks search values
 */
export const tasksSearchSchema = z.object({
  milestoneId: z.string().uuid().optional(),
});

/**
 * Tasks search schema
 */
export type TasksSearchSchema = z.infer<typeof tasksSearchSchema>;

/**
 * Zod schema for projects search values
 */
export const projectsSearchSchema = z.object({
  status: z.nativeEnum(ProjectStatus).optional(),
});

/**
 * Projects search schema
 */
export type ProjectsSearchSchema = z.infer<typeof projectsSearchSchema>;