import ConstructionIcon from "@mui/icons-material/Construction";
import { Chip, TableRow } from "@mui/material";
import LoadingTableCell from "components/generic/loading-table-cell";
import { useFindProjectQuery } from "hooks/api-queries";
import { useTranslation } from "react-i18next";
import { mustHaveId } from "utils";

/**
 * Component properties
 */
type Props = {
  projectId: string;
};

/**
 * User project table row component
 *
 * @param props component properties
 */
const UserProjectTableRow = ({ projectId }: Props) => {
  const { t } = useTranslation();
  const findProjectQuery = useFindProjectQuery(projectId);

  const project = findProjectQuery.data ? mustHaveId(findProjectQuery.data) : undefined;

  /**
   * Main component render
   */
  return (
    <TableRow>
      <LoadingTableCell loading={findProjectQuery.isFetching}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ConstructionIcon fontSize="small" sx={{ color: "rgba(0, 0, 0, 0.5)" }} />
          {project?.name}
        </div>
      </LoadingTableCell>
      <LoadingTableCell loading={findProjectQuery.isFetching}>80%</LoadingTableCell>
      <LoadingTableCell loading={findProjectQuery.isFetching}>
        {project?.status && (
          <Chip
            size="small"
            sx={{ bgcolor: (theme) => theme.palette.projectStatus[project.status], color: "white" }}
            label={t(`projectStatuses.${project.status}`)}
          />
        )}
      </LoadingTableCell>
    </TableRow>
  );
};

export default UserProjectTableRow;
