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

export function ToolCallDemo() {
  const [status, setStatus] = React.useState<ToolCallStatus>("proposed");
  const [error, setError] = React.useState<string>();

  const run = React.useCallback(() => {
    setError(undefined);
    setStatus("running");
    window.setTimeout(() => {
      const ok = Math.random() > 0.35;
      setStatus(ok ? "done" : "failed");
      if (!ok) setError("Payment gateway timed out. No charge was made.");
    }, 1400);
  }, []);

  const reset = () => {
    setError(undefined);
    setStatus("proposed");
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <ToolCall
        name="Issue refund"
        description="Refund this order to the original payment method."
        args={{ order: "#48213", amount: "$129.00", customer: "j.lee@example.com" }}
        reversible={false}
        status={status}
        error={error}
        onApprove={run}
        onDeny={reset}
        onRetry={run}
      />
      {status !== "proposed" ? (
        <button
          onClick={reset}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Reset
        </button>
      ) : null}
    </div>
  );
}

const PLAN_TITLES = [
  "Look up order #48213",
  "Verify refund eligibility",
  "Issue refund to original card",
  "Email the customer a receipt",
];

export function PlanDemo() {
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
    <div className="flex flex-col items-start gap-3">
      <Plan title="Processing refund" steps={steps} />
      <button
        onClick={() => setActive(0)}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Replay
      </button>
    </div>
  );
}

export function ConfidenceDemo() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Confidence value={0.92} caption="Grounded in 3 cited sources." />
      <Confidence value={0.64} caption="Some sources disagree." />
      <Confidence value={0.28} caption="Thin evidence — verify before relying on this." />
    </div>
  );
}

export function CitationDemo() {
  return (
    <div className="flex flex-col gap-3">
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
          title="Notifications & receipts"
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
    </div>
  );
}

export function RefusalDemo() {
  return (
    <Refusal
      category="policy"
      title="I can't issue a refund above $500"
      reason="Refunds over $500 need a manager's approval before they can be processed."
      actions={[
        { label: "Send to a manager", onClick: () => {} },
        { label: "Refund $500 instead", onClick: () => {} },
      ]}
    />
  );
}

type ChatTurn = { id: number; role: "user" | "assistant"; text: string };
const REPLY =
  "Sure — I can refund order #48213 for $129.00 back to the original card. It usually lands within five business days.";

export function ChatDemo() {
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
      if (i < full.length) timer.current = window.setTimeout(tick, 40);
      else setStreamingId(null);
    };
    tick();
  }, []);

  const send = (value: string) => {
    const userId = nextId.current++;
    const botId = nextId.current++;
    setTurns((prev) => [
      ...prev,
      { id: userId, role: "user", text: value },
      { id: botId, role: "assistant", text: "" },
    ]);
    stream(botId, REPLY);
  };

  const stop = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setStreamingId(null);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-4">
        {turns.map((t) => (
          <Message
            key={t.id}
            role={t.role}
            streaming={streamingId === t.id}
            onStop={streamingId === t.id ? stop : undefined}
            onRegenerate={
              t.role === "assistant" && streamingId === null && t.text
                ? () => stream(t.id, REPLY)
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
