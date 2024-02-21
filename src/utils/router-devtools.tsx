import { Suspense, lazy } from "react";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

export const RouterDevTools = () => (
  <Suspense>
    <TanStackRouterDevtools position="bottom-right" />
  </Suspense>
);
