<div align="center">

# Felt UI

**The component kit for AI products.** Accessible-by-default React components for the moments
that make an agent feel trustworthy — plans, tool calls, confidence, citations, refusals, and
real streaming.

*shadcn-compatible · inclusive by default · MIT*

**[Live demo & docs →](https://owl-listener.github.io/felt-ui/)**

</div>

---

## Why Felt UI

AI products work, then lose people anyway — generic gray chat boxes that don't show what the
agent is doing, can't be trusted with an action, and exclude anyone using a screen reader.
Felt UI ships the **trust primitives** that fix that, so the engineer who isn't a designer gets
research-backed, accessible AI UX in minutes.

It's not a framework. It's a set of copy-paste components built **on shadcn/ui + Radix +
Tailwind**, so you adopt it without leaving the ecosystem you already use.

## The six primitives

| Component | What it does | Status |
|---|---|---|
| `<Plan>` / `<Steps>` | Show the agent's plan and live status per step. | ✅ Available |
| `<ToolCall>` | Render an action the agent wants to take, with approve / deny and a "can't be undone" guard. | ✅ Available |
| `<Confidence>` | Communicate calibrated uncertainty — how sure the model is. | ✅ Available |
| `<Citation>` | Attribute sources so answers are groundable. | ✅ Available |
| `<Refusal>` | Decline gracefully — a limit, not a dead end. | ✅ Available |
| `<Message>` + `<Composer>` | First-class streaming, stop/regenerate, attachments — accessible to screen readers via live regions. | ✅ Available |

Every primitive is keyboard-operable, screen-reader-friendly, reduced-motion aware, and
themeable.

## Install

Pick your style — copy the source in (you own the code), or use it as a dependency:

```bash
# the felt CLI — copies the component source into your project
npm install @felt-ui/react
npx felt add tool-call

# …or straight through shadcn, no install needed
npx shadcn@latest add https://owl-listener.github.io/felt-ui/r/tool-call.json

# …or just import from the package
npm install @felt-ui/react
```

`felt list` shows what's available; `felt add plan confidence` adds several at once. Peer deps:
`react` and `react-dom` (18 or 19).

### Wire up the theme

Felt themes off shadcn's CSS variables — the ones you already have — plus two it adds for trust
states: `--success` and `--warning`. Drop in the stylesheet, extend the preset, done:

```ts
// app entry
import "@felt-ui/react/styles.css";
```

```ts
// tailwind.config.ts
import feltPreset from "@felt-ui/react/tailwind-preset";

export default {
  presets: [feltPreset],
  content: ["./src/**/*.{ts,tsx}", "./node_modules/@felt-ui/react/dist/**/*.js"],
};
```

> Already on shadcn? You've got most of these. Only `--success` / `--warning` are new — copy
> them from `styles.css` into your own globals if you'd rather keep one source of truth.

## Example

```tsx
import { ToolCall } from "@felt-ui/react"

<ToolCall
  name="Issue refund"
  args={{ order: "#48213", amount: "$129.00", customer: "j.lee@…" }}
  reversible={false}        // surfaces a "can't be undone" guard
  status={status}           // "proposed" | "running" | "done" | "failed"
  onApprove={runRefund}
  onDeny={cancel}
/>
```

Renders a calm, on-brand action card — intent and parameters shown *before* acting, honest
status (including a graceful failed state), keyboard + screen-reader accessible, themed to your
brand.

### The accessibility is the point

You don't pass props to get any of this — it's the floor:

- **It's a real region.** `role="group"` labelled by the action name; parameters render as a
  proper `<dl>`, not a div soup.
- **Screen readers hear the status change.** Lifecycle updates go out on an ARIA live region —
  `polite` normally, `assertive` when it fails.
- **The guard can't be clicked past.** With `reversible={false}`, Approve doesn't fire — it opens
  a focus-managed `role="alertdialog"` that needs a deliberate second yes (and takes `Esc` for
  no).
- **Nobody gets motion-sick.** The running spinner backs off under `prefers-reduced-motion`.
- **Failure stays honest.** Hand it `error` and `onRetry` — it says what broke and offers a way
  forward, not a dead end.

### `<ToolCall>` props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `string` | — | Human-readable intent. Labels the card. |
| `description` | `ReactNode` | — | One-line clarification. |
| `args` | `Record<string, ToolCallArgValue>` | — | Parameters shown before acting. |
| `reversible` | `boolean` | `true` | `false` → "can't be undone" guard. |
| `status` | `"proposed" \| "running" \| "done" \| "failed"` | `"proposed"` | Lifecycle. |
| `onApprove` | `() => void \| Promise<void>` | — | Fires after the guard for irreversible actions. |
| `onDeny` | `() => void` | — | Deny / cancel. |
| `onRetry` | `() => void` | — | Shown in the `failed` state. |
| `error` | `ReactNode` | — | Detail shown when `status="failed"`. |
| `irreversibleWarning` | `ReactNode` | — | Override the guard copy. |
| `approveLabel` / `denyLabel` / `confirmLabel` / `cancelLabel` / `retryLabel` | `string` | — | Button copy overrides. |

You own `status`. Flip it to `"running"` when `onApprove` kicks off, then `"done"` or `"failed"`
when it settles — the card tells the honest story either way.

## Principles

- **Accessible by default.** Accessibility isn't a prop you remember to set; it's the floor.
- **Augment, don't replace.** These components make builders faster; they don't hide the human.
- **Build on the ecosystem.** shadcn-compatible, Radix-powered — extend, don't reinvent.
- **Open.** MIT. Fork it, adapt it, ship it.

## Development

Clone it, build it, hack on it:

```bash
npm install            # install workspace deps
npm run build          # tsup → dist (ESM + CJS + d.ts + styles.css)
npm test               # vitest (accessibility + behavior)
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run registry       # regenerate registry/ from src

# Live demo (quick sandbox)
npm --prefix playground install
npm run playground     # vite dev server with every primitive

# Docs / demo site (deployed to GitHub Pages; also serves the registry at /r)
npm --prefix docs install
npm --prefix docs run dev
```

```
src/
  components/
    tool-call/tool-call.tsx   # the primitive
    ui/{button,badge}.tsx     # shadcn-style internals we build on
  lib/utils.ts                # cn()
  styles/globals.css          # design tokens
  tailwind-preset.ts          # exported Tailwind preset
  index.ts                    # public API
  ../cli/felt.mjs             # the `felt` CLI
registry/                     # shadcn-compatible registry (generated)
playground/                   # quick Vite sandbox
docs/                         # docs/demo site (GitHub Pages) — serves /r registry
```

## Status

🌱 All six trust primitives have landed and are accessible-by-default. Pre-1.0
— APIs may still shift as we dogfood. Star to follow along.

## License

[MIT](./LICENSE)
