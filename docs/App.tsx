import * as React from "react";

import {
  ToolCallDemo,
  PlanDemo,
  ConfidenceDemo,
  CitationDemo,
  RefusalDemo,
  ChatDemo,
} from "./demos";

const GITHUB = "https://github.com/owl-listener/felt-ui";

type Primitive = {
  id: string;
  name: string;
  tag: string;
  blurb: string;
  demo: React.ReactNode;
  code: string;
  points: string[];
};

const PRIMITIVES: Primitive[] = [
  {
    id: "tool-call",
    name: "ToolCall",
    tag: "<ToolCall>",
    blurb:
      "Show an action before it runs. Approve / deny, with a “can’t be undone” guard for irreversible actions and an honest status lifecycle.",
    demo: <ToolCallDemo />,
    code: `<ToolCall
  name="Issue refund"
  args={{ order: "#48213", amount: "$129.00" }}
  reversible={false}
  status={status}
  onApprove={runRefund}
  onDeny={cancel}
/>`,
    points: [
      "Irreversible actions need a deliberate second confirm (focus-managed alertdialog).",
      "Status announced via ARIA live; failed state is graceful, with retry.",
    ],
  },
  {
    id: "plan",
    name: "Plan / Steps",
    tag: "<Plan> / <Steps>",
    blurb:
      "Make the agent’s plan visible, with live per-step status so people can follow along.",
    demo: <PlanDemo />,
    code: `<Plan
  title="Processing refund"
  steps={[
    { title: "Look up order", status: "done" },
    { title: "Verify eligibility", status: "active" },
    { title: "Issue refund", status: "pending" },
  ]}
/>`,
    points: [
      "Ordered list with status as text + colour — never colour alone.",
      "aria-current on the active step; progress + live announcements.",
    ],
  },
  {
    id: "confidence",
    name: "Confidence",
    tag: "<Confidence>",
    blurb:
      "Communicate calibrated uncertainty, honestly — low confidence reads as caution, not decoration.",
    demo: <ConfidenceDemo />,
    code: `<Confidence value={0.92} caption="Grounded in 3 cited sources." />
<Confidence value={0.28} caption="Thin evidence — verify this." />`,
    points: [
      "role=\"meter\" with a descriptive aria-valuetext (“High confidence, 92%”).",
      "Pass a 0–1 value or a qualitative level; thresholds are configurable.",
    ],
  },
  {
    id: "citation",
    name: "Citation",
    tag: "<Citation>",
    blurb:
      "Attribute sources so answers are groundable — and verifiable without leaving the page.",
    demo: <CitationDemo />,
    code: `Refunds land within five business days
<Citation
  index={1}
  title="Refund policy"
  url="https://help.example.com/refunds"
  snippet="Refunds are returned within 5 business days."
/>.`,
    points: [
      "The marker’s accessible name carries the attribution.",
      "Hover/focus preview shows the source + quoted snippet.",
    ],
  },
  {
    id: "refusal",
    name: "Refusal",
    tag: "<Refusal>",
    blurb:
      "Decline gracefully — a limit, not a dead end. State why, and offer a way forward.",
    demo: <RefusalDemo />,
    code: `<Refusal
  category="policy"
  title="I can't issue a refund above $500"
  reason="Refunds over $500 need a manager's approval."
  actions={[{ label: "Send to a manager", onClick: escalate }]}
/>`,
    points: [
      "Calm, not an error alarm — a refusal isn’t a failure.",
      "Labelled region + polite live announcement; real next-step buttons.",
    ],
  },
  {
    id: "message",
    name: "Message + Composer",
    tag: "<Message> + <Composer>",
    blurb:
      "Accessible streaming with stop / regenerate, and a keyboard-first composer with attachments.",
    demo: <ChatDemo />,
    code: `<Message role="assistant" streaming onStop={stop}>
  {streamedText}
</Message>
<Composer streaming={isStreaming} onStop={stop} onSubmit={send} />`,
    points: [
      "Streamed output is an ARIA live region; reduced-motion-aware caret.",
      "Enter sends, Shift+Enter newline; send becomes Stop while generating.",
    ],
  },
];

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 text-xs leading-relaxed">
      <code>{code}</code>
    </pre>
  );
}

function ThemeToggle() {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
      aria-pressed={dark}
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}

function PrimitiveSection({ p }: { p: Primitive }) {
  return (
    <section
      id={p.id}
      aria-labelledby={`${p.id}-h`}
      className="scroll-mt-20 border-t border-border py-12"
    >
      <h2 id={`${p.id}-h`} className="text-xl font-semibold tracking-tight">
        <code className="text-primary">{p.tag}</code>
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {p.blurb}
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2 md:items-start">
        <div className="rounded-xl border border-border bg-background p-5">
          {p.demo}
        </div>
        <div className="flex flex-col gap-4">
          <CodeBlock code={p.code} />
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {p.points.map((pt, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="text-success">
                  ✓
                </span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <a href="#top" className="font-semibold tracking-tight">
            Felt UI
          </a>
          <nav className="flex items-center gap-4 text-sm">
            <a
              href={GITHUB}
              className="text-muted-foreground hover:text-foreground"
            >
              GitHub
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6" id="top">
        <section className="py-16">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            The component kit for AI products
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight">
            Accessible-by-default React components for the moments that make an
            agent feel{" "}
            <span className="underline decoration-success decoration-4 underline-offset-4">
              trustworthy
            </span>
            .
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Plans, tool calls, confidence, citations, refusals, and real
            streaming — the trust primitives, built on shadcn/ui + Radix +
            Tailwind. Copy-paste, themeable, MIT.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <code className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
              npx felt add tool-call
            </code>
            <a
              href={GITHUB}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              View on GitHub
            </a>
          </div>
          <nav
            aria-label="Primitives"
            className="mt-8 flex flex-wrap gap-2 text-sm"
          >
            {PRIMITIVES.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {p.name}
              </a>
            ))}
          </nav>
        </section>

        {PRIMITIVES.map((p) => (
          <PrimitiveSection key={p.id} p={p} />
        ))}
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-1 px-6 text-sm text-muted-foreground">
          <p>
            Felt UI — MIT licensed.{" "}
            <a href={GITHUB} className="underline underline-offset-4">
              Source on GitHub
            </a>
            .
          </p>
          <p>Accessible by default: keyboard, screen reader, reduced motion.</p>
        </div>
      </footer>
    </div>
  );
}
