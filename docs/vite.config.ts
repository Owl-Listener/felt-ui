import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Deployed to GitHub Pages at https://owl-listener.github.io/felt-ui/.
// Override with DOCS_BASE for other hosts (e.g. "/" for a custom domain).
const base = process.env.DOCS_BASE ?? "/felt-ui/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@felt-ui/react": fileURLToPath(
        new URL("../src/index.ts", import.meta.url),
      ),
      "@": fileURLToPath(new URL("../src", import.meta.url)),
    },
  },
});
