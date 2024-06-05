import { Chip } from "@mui/material";
import { ChangeProposalStatus } from "generated/client";

/**
 * Change propsal helper functions
 */
namespace ChangeProposalUtils {
  const changePropsalStatusColors = {
    [ChangeProposalStatus.Approved]: "#0079BF",
    [ChangeProposalStatus.Pending]: "#757575",
    [ChangeProposalStatus.Rejected]: "#d32f2f",
  };

  /**
   * Formats status text to start with a capital letter and the rest in lowercase
   *
   * @param status project status
   */
  export const formatStatusText = (status: string) => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  /**
   * Renders change proposal status element
   *
   * @param status change proposal status
   */
  export const renderStatusElement = (status: ChangeProposalStatus, label: string) => (
    <Chip
      size="small"
      sx={{ backgroundColor: changePropsalStatusColors[status], color: "white" }}
      label={formatStatusText(label)}
    />
  );
}

export default ChangeProposalUtils;
