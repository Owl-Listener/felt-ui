import type { Config } from "tailwindcss";

/**
 * Felt UI Tailwind preset.
 *
 * Maps the shadcn/ui CSS-variable design tokens to Tailwind colors so Felt
 * components theme automatically. Consumers extend it:
 *
 *   // tailwind.config.ts
 *   import feltPreset from "@felt-ui/react/tailwind-preset";
 *   export default {
 *     presets: [feltPreset],
 *     content: ["./src/**\/*.{ts,tsx}", "./node_modules/@felt-ui/react/dist/**\/*.js"],
 *   };
 *
 * The actual token values live in `@felt-ui/react/styles.css` (or your own
 * shadcn globals.css). This preset only wires the variables into utilities.
 */
const preset = {
  darkMode: ["class"],
  content: [],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Felt-specific semantic tokens for trust states.
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "felt-spin": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "felt-spin": "felt-spin 1s linear infinite",
      },
    },
  },
} satisfies Partial<Config>;

export default preset;
