import { TableRow } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import ProjectUtils from "utils/project";
import { useFindProjectQuery } from "hooks/api-queries";
import { mustHaveId } from "utils";
import LoadingTableCell from "components/generic/loading-table-cell";

type UserProjectTableRowProps = {
  projectId: string;
};

const UserProjectTableRow = ({ projectId }: UserProjectTableRowProps) => {
  const findProjectQuery = useFindProjectQuery(projectId);

  const project = findProjectQuery.data ? mustHaveId(findProjectQuery.data) : undefined;

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
        {project?.status && ProjectUtils.renderStatusElement(project.status)}
      </LoadingTableCell>
    </TableRow>
  );
};

export default UserProjectTableRow;
