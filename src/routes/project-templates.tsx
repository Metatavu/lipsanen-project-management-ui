import { createFileRoute } from "@tanstack/react-router";

const ProjectTemplatesIndexRoute = () => {
  return <div>Project templates screen</div>;
};

export const Route = createFileRoute("/project-templates")({
  component: ProjectTemplatesIndexRoute,
});
