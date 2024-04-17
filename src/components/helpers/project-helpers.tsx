import { ProjectStatus } from "generated/client";

/**
 * Project helper functions
 */
namespace ProjectHelpers {
  /**
   * Assigns a color to a project status
   * 
   * TODO: modify project statuses according to the API specification
   * 
   * @param status project status
   */
  const assignStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Initiation:
        return "#293d96";
      case ProjectStatus.Planning:
        return "#742996";
      case ProjectStatus.Design:
        return "#849629";
      case ProjectStatus.Procurement:
        return "#966e29";
      case ProjectStatus.Construction:
        return "#299646";
      case ProjectStatus.Inspection:
        return "#29967d";
      case ProjectStatus.Completion:
        return "#5c5651";
      default:
        return "#0d0c0c";
  }
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
  export const renderStatusElement = (status: ProjectStatus) => {
    const color = assignStatusColor(status);

    return (
      <div style={{ backgroundColor: color, borderRadius: 10, display: "flex", justifyContent: "center", maxWidth: 100 }}>
        <p style={{ paddingInline: 5, color: "white", margin: 0 }}>
          {formatStatusText(status)}
        </p>
      </div>
    );
  };
}

export default ProjectHelpers;