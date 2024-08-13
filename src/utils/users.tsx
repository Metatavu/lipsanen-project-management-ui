import { renderMdiIconifyIconWithBackground } from "components/generic/mdi-icon-with-background";
import { DEFAULT_USER_ICON } from "constants/index";
import { JobPosition, User } from "generated/client";
import { theme } from "theme";

/**
 * Users helper functions
 */
namespace UsersUtils {
  /**
   * Gets job position icon for a user
   *
   * @param projectUsers list of Users
   * @param userId string
   * @param jobPositions list of JobPositions
   */
  export const getUserIcon = (projectUsers: User[], userId?: string, jobPositions?: JobPosition[]) => {
    const user = projectUsers.find((user) => user.keycloakId === userId);
    const usersJobPosition = jobPositions?.find((position) => user?.jobPositionId === position.id);
    const usersIconName = usersJobPosition?.iconName ?? DEFAULT_USER_ICON;
    const usersIconColor = usersJobPosition?.color ?? theme.palette.primary.main;

    return renderMdiIconifyIconWithBackground(usersIconName, usersIconColor);
  };
}

export default UsersUtils;
