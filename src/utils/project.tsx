import { Chip } from "@mui/material";
import { ProjectStatus } from "generated/client";
import { useTranslation } from "react-i18next";

/**
 * Project helper functions
 */
namespace ProjectUtils {
  // TODO: modify project statuses according to the API specification
  const projectStatusColors = {
    [ProjectStatus.Initiation]: "#293d96",
    [ProjectStatus.Planning]: "#742996",
    [ProjectStatus.Design]: "#849629",
    [ProjectStatus.Procurement]: "#966e29",
    [ProjectStatus.Construction]: "#299646",
    [ProjectStatus.Inspection]: "#29967d",
    [ProjectStatus.Completion]: "#5c5651",
  };

  /**
   * Renders project status element
   *
   * TODO: Once Project status is implemented in the API - add the status logic support
   *
   * @param status project status
   */
  export const renderStatusElement = (status: ProjectStatus) => {
    const { t } = useTranslation();

    return (
      <Chip
        size="small"
        sx={{ backgroundColor: projectStatusColors[status], color: "white" }}
        label={t(`projectStatuses.${status}`)}
      />
    );
  };
}

export default ProjectUtils;
