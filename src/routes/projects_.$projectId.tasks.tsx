import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/**
 * Schedule file route
 */
export const Route = createFileRoute("/projects/$projectId/tasks")({
  component: TasksIndexRoute,
});

function TasksIndexRoute() {
  const { t } = useTranslation();
  const { projectId } = Route.useParams();

  return <div>TasksIndexRoute</div>;
}
