import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/$projectId/tracking")({
  component: TrackingIndexRoute,
});

function TrackingIndexRoute() {
  return <div>Tracking screen</div>;
}
