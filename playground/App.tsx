import * as React from "react";
import {
  Citation,
  CitationList,
  Composer,
  Confidence,
  Message,
  Plan,
  Refusal,
  ToolCall,
  type PlanStep,
  type ToolCallStatus,
} from "@felt-ui/react";

/**
 * Live demo mirroring the reference example: an irreversible refund.
 * Approve → guard → "running" → resolves to done or failed.
 */
function RefundDemo() {
  const [status, setStatus] = React.useState<ToolCallStatus>("proposed");
  const [error, setError] = React.useState<string | undefined>();

  const runRefund = React.useCallback(() => {
    setError(undefined);
    setStatus("running");
    // Simulate an async side effect that sometimes fails.
    window.setTimeout(() => {
      const ok = Math.random() > 0.35;
      setStatus(ok ? "done" : "failed");
      if (!ok) setError("Payment gateway timed out. No charge was made.");
    }, 1400);
  }, []);

  const reset = React.useCallback(() => {
    setError(undefined);
    setStatus("proposed");
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <ToolCall
        name="Issue refund"
        description="Refund this order back to the original payment method."
        args={{
          order: "#48213",
          amount: "$129.00",
          customer: "j.lee@example.com",
        }}
        reversible={false}
        status={status}
        error={error}
        onApprove={runRefund}
        onDeny={reset}
        onRetry={runRefund}
      />
      {status !== "proposed" ? (
        <button
          onClick={reset}
          className="self-start text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Reset demo
        </button>
      ) : null}
    </div>
  );
}

function ReversibleDemo() {
  const [status, setStatus] = React.useState<ToolCallStatus>("proposed");
  return (
    <ToolCall
      name="Draft reply"
      description="Generate a draft you can edit before sending."
      args={{ to: "support@example.com", tone: "friendly" }}
      reversible
      status={status}
      onApprove={() => setStatus("done")}
      onDeny={() => setStatus("proposed")}
    />
  );
}

const PLAN_TITLES = [
  "Look up order #48213",
  "Verify refund eligibility",
  "Issue refund to original card",
  "Email the customer a receipt",
];

/** Live plan that advances a step every ~1.2s, then settles. */
function PlanDemo() {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (active >= PLAN_TITLES.length) return;
    const t = window.setTimeout(() => setActive((a) => a + 1), 1200);
    return () => window.clearTimeout(t);
  }, [active]);

  const steps: PlanStep[] = PLAN_TITLES.map((title, i) => ({
    id: String(i),
    title,
    status: i < active ? "done" : i === active ? "active" : "pending",
  }));

  return (
    <div className="flex flex-col gap-3">
      <Plan title="Processing refund" steps={steps} />
      <button
        onClick={() => setActive(0)}
        className="self-start text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Replay
      </button>
    </div>
  );
}

type ChatTurn = { id: number; role: "user" | "assistant"; text: string };

const ASSISTANT_REPLY =
  "Sure — I can refund order #48213 for $129.00 back to the original card. It usually lands within five business days.";

/** A tiny chat: send a message, watch a streamed reply, stop or regenerate. */
function ChatDemo() {
  const [turns, setTurns] = React.useState<ChatTurn[]>([
    { id: 0, role: "assistant", text: "Hi! How can I help with your order?" },
  ]);
  const [streamingId, setStreamingId] = React.useState<number | null>(null);
  const nextId = React.useRef(1);
  const timer = React.useRef<number | null>(null);

  const stream = React.useCallback((id: number, full: string) => {
    let i = 0;
    setStreamingId(id);
    const tick = () => {
      i += 2;
      setTurns((prev) =>
        prev.map((t) => (t.id === id ? { ...t, text: full.slice(0, i) } : t)),
      );
      if (i < full.length) {
        timer.current = window.setTimeout(tick, 40);
      } else {
        setStreamingId(null);
      }
    };
    tick();
  }, []);

  const send = React.useCallback(
    (value: string) => {
      const userId = nextId.current++;
      const botId = nextId.current++;
      setTurns((prev) => [
        ...prev,
        { id: userId, role: "user", text: value },
        { id: botId, role: "assistant", text: "" },
      ]);
      stream(botId, ASSISTANT_REPLY);
    },
    [stream],
  );

  const stop = React.useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setStreamingId(null);
  }, []);

  const regenerate = React.useCallback(
    (id: number) => {
      setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, text: "" } : t)));
      stream(id, ASSISTANT_REPLY);
    },
    [stream],
  );

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-4">
        {turns.map((t) => (
          <Message
            key={t.id}
            role={t.role}
            streaming={streamingId === t.id}
            onStop={streamingId === t.id ? stop : undefined}
            onRegenerate={
              t.role === "assistant" && streamingId === null && t.text
                ? () => regenerate(t.id)
                : undefined
            }
          >
            {t.text}
          </Message>
        ))}
      </div>
      <Composer
        streaming={streamingId !== null}
        onStop={stop}
        onSubmit={send}
        onAttach={() => {}}
        placeholder="Ask about your order…"
      />
    </div>
  );
}

export default function App() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Felt UI</h1>
          <p className="text-sm text-muted-foreground">
            Trust primitives for AI products — <code>&lt;ToolCall&gt;</code>
          </p>
        </div>
        <button
          onClick={() => setDark((d) => !d)}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
        >
          {dark ? "Light" : "Dark"}
        </button>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Irreversible action (with guard)
        </h2>
        <RefundDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Reversible action
        </h2>
        <ReversibleDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Plan visibility (live per-step status)
        </h2>
        <PlanDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Source attribution
        </h2>
        <p className="max-w-xl text-sm leading-relaxed">
          Refunds are issued back to the original payment method within five
          business days
          <Citation
            index={1}
            title="Refund policy"
            url="https://help.example.com/refunds"
            source="Example Help Center"
            snippet="Approved refunds are returned to the original payment method within 5 business days."
          />{" "}
          and a confirmation email is sent automatically
          <Citation
            index={2}
            title="Notifications &amp; receipts"
            url="https://help.example.com/receipts"
            snippet="Customers receive an emailed receipt for every refund."
          />
          .
        </p>
        <CitationList
          sources={[
            {
              title: "Refund policy",
              url: "https://help.example.com/refunds",
              source: "Example Help Center",
              snippet:
                "Approved refunds are returned to the original payment method within 5 business days.",
            },
            {
              title: "Notifications & receipts",
              url: "https://help.example.com/receipts",
              snippet: "Customers receive an emailed receipt for every refund.",
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Calibrated confidence
        </h2>
        <div className="flex flex-col gap-4">
          <Confidence value={0.92} caption="Grounded in 3 cited sources." />
          <Confidence value={0.64} caption="Some sources disagree." />
          <Confidence
            value={0.28}
            caption="Thin evidence — verify before relying on this."
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Graceful refusal
        </h2>
        <Refusal
          category="policy"
          title="I can't issue a refund above $500"
          reason="Refunds over $500 need a manager's approval before they can be processed."
          actions={[
            { label: "Send to a manager", onClick: () => {} },
            { label: "Refund $500 instead", onClick: () => {} },
          ]}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Streaming chat (Message + Composer)
        </h2>
        <ChatDemo />
      </section>
    </main>
  );
}
