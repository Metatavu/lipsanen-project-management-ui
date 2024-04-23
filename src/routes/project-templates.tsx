import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/project-templates")({ component: ProjectTemplatesIndexRoute });

function ProjectTemplatesIndexRoute() {
  return <div>Project templates screen</div>;
}
