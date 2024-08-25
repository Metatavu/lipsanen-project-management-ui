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
      consts: "/src/consts",
      generated: "/src/generated",
      hooks: "/src/hooks",
      localization: "/src/localization",
      providers: "/src/providers",
      routes: "/src/routes",
      theme: "/src/theme",
      types: "/src/types",
      utils: "/src/utils",
    },
  },
  optimizeDeps: {
    exclude: ["js-big-decimal"],
  },
});
