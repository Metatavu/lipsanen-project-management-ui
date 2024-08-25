import { Backdrop, CircularProgress } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import TaskDialog from "components/tasks/task-dialog";
import { useFindTaskQuery } from "hooks/api-queries";

export const Route = createFileRoute("/projects/$projectId/tasks/$taskId")({ component: TaskDetailsRoute });

function TaskDetailsRoute() {
  const { projectId, taskId } = Route.useParams();
  const navigate = Route.useNavigate();

  const taskQuery = useFindTaskQuery({ projectId, taskId });
  const task = taskQuery.data;

  if (!task) {
    return (
      <Backdrop open sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <TaskDialog
      open
      onClose={() => navigate({ to: "/projects/$projectId/tasks" })}
      projectId={projectId}
      task={task}
      milestoneId={task.milestoneId}
    />
  );
}
