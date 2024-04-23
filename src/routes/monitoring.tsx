import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/monitoring")({ component: MonitoringIndexRoute });

function MonitoringIndexRoute() {
  return <div>Monitoring screen</div>;
}
