import { JobPosition, User } from "generated/client";

/**
 * User utility functions
 */
namespace UserUtils {
  /**
   * Get user job position
   *
   * @param jobPositions all job positions
   * @param user user
   * @returns job position of user if found
   */
  export const getUserJobPosition = (jobPositions: JobPosition[] = [], user?: User) =>
    jobPositions.find((position) => user?.jobPositionId === position.id);
}

export default UserUtils;
