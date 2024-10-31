import { createFileRoute } from "@tanstack/react-router";
import TaskDialog from "components/tasks/task-dialog";

export const Route = createFileRoute("/projects/$projectId/tasks/new")({
  component: NewTaskRoute,
});

function NewTaskRoute() {
  const { projectId } = Route.useParams();
  const navigate = Route.useNavigate();

  return <TaskDialog open onClose={() => navigate({ to: "/projects/$projectId/tasks" })} projectId={projectId} />;
}
