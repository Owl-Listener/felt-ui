import * as React from "react";
import { ToolCall } from "@felt-ui/react";

import { resolve } from "../experiments/feeling/spec";

const calm = resolve("calm");

/** Turn a token map into a style object of CSS custom properties. */
function tokenStyle(tokens: Record<string, string>): React.CSSProperties {
  const style: Record<string, string> = {};
  for (const [k, v] of Object.entries(tokens)) {
    // Felt tokens like --felt-leading are unitless / raw; color tokens are HSL
    // triples consumed as hsl(var(--x)) by the components.
    style[k] = v;
  }
  return style as React.CSSProperties;
}

function Panel({
  label,
  tone,
  style,
  children,
}: {
  label: string;
  tone: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-tight">{label}</h2>
        <span className="text-xs text-zinc-400">{tone}</span>
      </div>
      <div
        style={style}
        className="rounded-2xl border border-border bg-background p-6"
      >
        {children}
      </div>
    </div>
  );
}

const ARGS = {
  order: "#48213",
  amount: "$129.00",
  customer: "j.lee@example.com",
};

export default function Feeling() {
  return (
    <div className="min-h-screen bg-zinc-50 px-8 py-12 text-zinc-900">
      <header className="mx-auto mb-10 max-w-5xl">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          felt-ui · the proof
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          One feeling — <span className="text-amber-700">“calm”</span> — driven
          all the way down to its bindings.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          The same real <code>&lt;ToolCall&gt;</code> component, rendered twice.
          On the left, the agent’s default — the average of its training data.
          On the right, the agent asked felt-ui to{" "}
          <code>resolve(&quot;calm&quot;)</code> and applied the decisions it got
          back: token overrides, softer motion, and quieter copy. No component
          code changed between them.
        </p>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:items-start">
        <Panel label="Without felt-ui" tone="neutral · the mean">
          <ToolCall
            name="Issue refund"
            description="Refund this order to the original payment method."
            args={ARGS}
            reversible={false}
            status="proposed"
            onApprove={() => {}}
            onDeny={() => {}}
          />
        </Panel>

        <Panel
          label='With felt-ui — resolve("calm")'
          tone={calm.copy.tone}
          style={{
            ...tokenStyle(calm.tokens),
            lineHeight: "var(--felt-leading)",
            letterSpacing: "var(--felt-tracking)",
          }}
        >
          <ToolCall
            name="Issue refund"
            description="Send this refund back to the original card — whenever you’re ready."
            args={ARGS}
            reversible={false}
            status="proposed"
            approveLabel="Approve refund"
            denyLabel="Not now"
            confirmLabel="Yes, refund it"
            cancelLabel="Hold on"
            irreversibleWarning={
              <>
                <strong>Issue refund</strong> can’t be undone — no rush, take
                your time.
              </>
            }
            onApprove={() => {}}
            onDeny={() => {}}
          />
        </Panel>
      </div>

      {/* The decisions, made legible: feeling → concrete values. */}
      <section className="mx-auto mt-12 max-w-5xl">
        <h3 className="mb-3 text-sm font-semibold tracking-tight">
          What <code>resolve(&quot;calm&quot;)</code> returned
        </h3>
        <div className="grid gap-4 text-xs md:grid-cols-3">
          <Decisions title="Tokens (applied)">
            {Object.entries(calm.tokens).map(([k, v]) => (
              <Row key={k} k={k} v={v} swatch={k.includes("--") && isColor(k)} />
            ))}
          </Decisions>
          <Decisions title="Motion & target">
            <Row k="easing" v={calm.motion.easing} />
            <Row k="duration" v={`${calm.motion.durationMs}ms`} />
            <Row k="amplitude" v={calm.motion.amplitude} />
            <div className="my-2 border-t border-zinc-200" />
            {Object.entries(calm.target).map(([k, v]) => (
              <Row key={k} k={k} v={String(v)} />
            ))}
          </Decisions>
          <Decisions title="Copy guidance">
            <p className="mb-2 font-medium text-zinc-700">
              tone: {calm.copy.tone}
            </p>
            <ul className="flex flex-col gap-1.5 text-zinc-500">
              {calm.copy.guidance.map((g, i) => (
                <li key={i}>• {g}</li>
              ))}
            </ul>
            {calm.notes.length ? (
              <p className="mt-3 text-[11px] italic text-zinc-400">
                {calm.notes.join(" ")}
              </p>
            ) : null}
          </Decisions>
        </div>
      </section>
    </div>
  );
}

function isColor(key: string) {
  return ![
    "--radius",
    "--felt-pace",
    "--felt-leading",
    "--felt-tracking",
  ].includes(key);
}

function Decisions({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="mb-2 font-semibold tracking-tight text-zinc-700">{title}</p>
      <div className="flex flex-col gap-1 font-mono">{children}</div>
    </div>
  );
}

function Row({ k, v, swatch }: { k: string; v: string; swatch?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-zinc-400">{k}</span>
      <span className="flex items-center gap-1.5 text-zinc-700">
        {swatch ? (
          <span
            className="inline-block size-3 rounded-sm border border-zinc-200"
            style={{ background: `hsl(${v})` }}
          />
        ) : null}
        {v}
      </span>
    </div>
  );
}
