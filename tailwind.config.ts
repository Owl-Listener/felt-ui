import type { Config } from "tailwindcss";

import feltPreset from "./src/tailwind-preset";

/**
 * Internal Tailwind config — used to build the playground and to validate the
 * preset during development. Consumers use the published preset instead
 * (see `src/tailwind-preset.ts`).
 */
export default {
  presets: [feltPreset],
  content: ["./src/**/*.{ts,tsx}", "./playground/**/*.{ts,tsx,html}"],
} satisfies Config;
