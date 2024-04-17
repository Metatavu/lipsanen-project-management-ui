import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  resolve: {
    alias: {
      app: "/src/app",
      api: "/src/api",
      atoms: "/src/atoms",
      assets: "/src/assets",
      components: "/src/components",
      generated: "/src/generated",
      localization: "/src/localization",
      routes: "/src/routes",
      theme: "/src/theme",
      types: "/src/types",
      utils: "/src/utils",
    },
  },
});
