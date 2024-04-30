import { createFileRoute } from "@tanstack/react-router";

/**
 * Tracking file route
 */
export const Route = createFileRoute("/projects/$projectId/tracking")({
  component: TrackingIndexRoute,
});

/**
 * Tracking index route component
 */
function TrackingIndexRoute() {
  return <div>Tracking screen</div>;
}
