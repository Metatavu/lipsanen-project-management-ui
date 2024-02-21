import { createFileRoute } from "@tanstack/react-router";

const MonitoringIndexRoute = () => {
  return <div>Monitoring screen</div>;
};

export const Route = createFileRoute("/monitoring")({
  component: MonitoringIndexRoute,
});
