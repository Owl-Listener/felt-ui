import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "tailwind-preset": "src/tailwind-preset.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Consumers bring their own React; never bundle it.
  external: ["react", "react-dom"],
  // Emit src/styles/globals.css to dist/styles.css for `@felt-ui/react/styles.css`.
  async onSuccess() {
    const { copyFile } = await import("node:fs/promises");
    await copyFile("src/styles/globals.css", "dist/styles.css");
  },
});
