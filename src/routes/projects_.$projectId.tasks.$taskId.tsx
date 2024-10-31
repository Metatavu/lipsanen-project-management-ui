import { Backdrop, CircularProgress } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import TaskDialog from "components/tasks/task-dialog";
import { useFindTaskQuery, useListChangeProposalsQuery } from "hooks/api-queries";
import { useMemo } from "react";

/**
 * Task details route
 */
export const Route = createFileRoute("/projects/$projectId/tasks/$taskId")({ component: TaskDetailsRoute });

/**
 * Task details route component
 */
function TaskDetailsRoute() {
  const { projectId, taskId } = Route.useParams();
  const navigate = Route.useNavigate();

  const findTaskQuery = useFindTaskQuery({ taskId });
  const listChangeProposalsQuery = useListChangeProposalsQuery({ projectId });

  const task = useMemo(() => findTaskQuery.data, [findTaskQuery.data]);
  const changeProposals = useMemo(() => listChangeProposalsQuery.data, [listChangeProposalsQuery.data]);

  if (findTaskQuery.isFetching || listChangeProposalsQuery.isFetching) {
    return (
      <Backdrop open sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (!task || !changeProposals) return null;

  /**
   * Main component render
   */
  return (
    <TaskDialog
      open
      onClose={() => navigate({ to: "/projects/$projectId/tasks" })}
      projectId={projectId}
      task={task}
      milestoneId={task.milestoneId}
      changeProposals={changeProposals}
    />
  );
}
