import { defineConfig, type Options } from "tsup";

const shared: Options = {
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  treeshake: true,
  // Consumers bring their own React; never bundle it.
  external: ["react", "react-dom"],
  // The component sources carry per-file "use client" directives (for registry
  // copy-in). esbuild strips inlined directives when bundling — that's expected
  // here, so silence the noise; the banner below restores it on the bundle.
  esbuildOptions(options) {
    options.logOverride = {
      ...options.logOverride,
      "module-level-directive": "silent",
    };
  },
};

export default defineConfig([
  {
    ...shared,
    entry: { index: "src/index.ts" },
    clean: true,
    async onSuccess() {
      const { copyFile, readFile, writeFile } = await import(
        "node:fs/promises"
      );
      // Emit design tokens to dist/styles.css for `@felt-ui/react/styles.css`.
      await copyFile("src/styles/globals.css", "dist/styles.css");
      // Mark the bundled entry as a client boundary (RSC / Next App Router).
      // esbuild strips banner directives, so prepend after the bundle is written.
      for (const file of ["dist/index.js", "dist/index.cjs"]) {
        const code = await readFile(file, "utf8");
        if (!code.startsWith('"use client"')) {
          await writeFile(file, `"use client";\n${code}`);
        }
      }
    },
  },
  {
    ...shared,
    // The Tailwind preset is build-time config — no "use client".
    entry: { "tailwind-preset": "src/tailwind-preset.ts" },
  },
]);
