import type { Config } from "tailwindcss";

import feltPreset from "../src/tailwind-preset";

export default {
  presets: [feltPreset],
  content: ["./index.html", "./*.{ts,tsx}", "../src/**/*.{ts,tsx}"],
} satisfies Config;
