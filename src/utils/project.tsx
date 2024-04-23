import { Chip } from "@mui/material";
import { ProjectStatus } from "generated/client";

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
   * Formats status text to start with a capital letter and the rest in lowercase
   *
   * @param status project status
   */
  export const formatStatusText = (status: ProjectStatus) =>
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  /**
   * Renders project status element
   *
   * TODO: Once Project status is implemented in the API - add the status logic support
   *
   * @param status project status
   */
  export const renderStatusElement = (status: ProjectStatus) => (
    <Chip
      size="small"
      sx={{ backgroundColor: projectStatusColors[status], color: "white" }}
      label={formatStatusText(status)}
    />
  );
}

export default ProjectUtils;
