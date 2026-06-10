import * as React from "react";
import { ToolCall } from "@felt-ui/react";

import { resolve, type Decisions } from "../experiments/feeling/spec";

function tokenStyle(d: Decisions): React.CSSProperties {
  const style: Record<string, string> = { ...d.tokens };
  style.lineHeight = "var(--felt-leading)";
  style.letterSpacing = "var(--felt-tracking)";
  return style as React.CSSProperties;
}

const ARGS = { order: "#48213", amount: "$129.00", customer: "j.lee@example.com" };

// Ordered along the energy axis: calm → … → lively.
const FEELINGS = ["calm", "calm-clinical-trust", "neutral", "lively"] as const;

function Cell({ name }: { name: string }) {
  const d = resolve(name);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-mono text-sm font-semibold tracking-tight">
          {name}
        </h2>
        <span className="text-xs text-zinc-400">{d.copy.tone}</span>
      </div>
      <div className="flex flex-wrap gap-1 text-[10px]">
        {Object.entries(d.target)
          .filter(([, v]) => v !== 0)
          .map(([k, v]) => (
            <span
              key={k}
              className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-zinc-500"
            >
              {k} {v > 0 ? "+" : ""}
              {v}
            </span>
          ))}
      </div>
      <div
        style={tokenStyle(d)}
        className="rounded-2xl border border-border bg-background p-6"
      >
        {/* Identical copy across every cell — only the feeling's visual
            bindings (colour, contrast, radius, motion) vary, so the range is
            isolated. */}
        <ToolCall
          name="Issue refund"
          description="Refund this order to the original payment method."
          args={ARGS}
          reversible={false}
          status="proposed"
          onApprove={() => {}}
          onDeny={() => {}}
        />
      </div>
    </div>
  );
}

export default function Gallery() {
  return (
    <div className="min-h-screen bg-zinc-50 px-8 py-12 text-zinc-900">
      <header className="mx-auto mb-10 max-w-5xl">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          felt-ui · the proof, part 2
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          The same component across the feeling space.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          One <code>&lt;ToolCall&gt;</code>, identical copy and props, rendered
          under four points in feeling-space. Only the visual bindings vary —
          proving the coordinate system spans a <em>range</em>, not just one
          “calmer” direction. Each agent would otherwise ship the{" "}
          <code>neutral</code> cell every time.
        </p>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        {FEELINGS.map((f) => (
          <Cell key={f} name={f} />
        ))}
      </div>
    </div>
  );
}
