import * as React from "react";
import { ToolCall, type ToolCallStatus } from "@felt-ui/react";

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
    </main>
  );
}
