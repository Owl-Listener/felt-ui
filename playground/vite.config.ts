import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Run Felt UI straight from source for instant feedback.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@felt-ui/react": fileURLToPath(new URL("../src/index.ts", import.meta.url)),
      "@": fileURLToPath(new URL("../src", import.meta.url)),
    },
  },
});
