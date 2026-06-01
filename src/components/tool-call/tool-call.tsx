import * as React from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  ShieldAlert,
  X,
  RotateCcw,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ToolCallStatus = "proposed" | "running" | "done" | "failed";

export type ToolCallArgValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | unknown[];

export interface ToolCallProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Human-readable intent, e.g. "Issue refund". */
  name: string;
  /** Optional one-line clarification of what the action does. */
  description?: React.ReactNode;
  /** Parameters shown to the human BEFORE the action runs. */
  args?: Record<string, ToolCallArgValue>;
  /**
   * Whether the action can be undone. When `false`, approving requires a
   * deliberate second confirmation ("can't be undone" guard). Default `true`.
   */
  reversible?: boolean;
  /** Lifecycle status. Default `"proposed"`. */
  status?: ToolCallStatus;
  /**
   * Called when the human approves. May return a promise; while pending you
   * should set `status="running"`. For irreversible actions this fires only
   * after the confirmation step.
   */
  onApprove?: () => void | Promise<void>;
  /** Called when the human denies/cancels the proposed action. */
  onDeny?: () => void;
  /** Called from the `failed` state's retry affordance. */
  onRetry?: () => void;
  /** Error detail surfaced in the `failed` state. */
  error?: React.ReactNode;
  /** Override the warning copy for irreversible actions. */
  irreversibleWarning?: React.ReactNode;
  approveLabel?: string;
  denyLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  retryLabel?: string;
  /** Extra content rendered below the parameters (e.g. a diff preview). */
  children?: React.ReactNode;
}

let idCounter = 0;
function useStableId(prefix: string, provided?: string) {
  // React 18 useId where available; fall back for older runtimes / tests.
  const reactId = (
    React as unknown as { useId?: () => string }
  ).useId?.();
  const [fallback] = React.useState(() => `${prefix}-${++idCounter}`);
  return provided ?? reactId ?? fallback;
}

function formatArgValue(value: ToolCallArgValue): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

const STATUS_META: Record<
  ToolCallStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  proposed: { label: "Proposed", variant: "secondary" },
  running: { label: "Running", variant: "warning" },
  done: { label: "Done", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
};

function statusSentence(name: string, status: ToolCallStatus): string {
  switch (status) {
    case "proposed":
      return `Action proposed: ${name}. Awaiting your approval.`;
    case "running":
      return `Running action: ${name}.`;
    case "done":
      return `Action completed: ${name}.`;
    case "failed":
      return `Action failed: ${name}.`;
  }
}

/**
 * `<ToolCall>` — a calm action card for agent tool use.
 *
 * Shows intent + parameters BEFORE acting, an approve/deny gate, an optional
 * "can't be undone" guard for irreversible actions, and an honest status
 * lifecycle (proposed → running → done | failed). Accessible by default:
 * labelled region, ARIA live status announcements, focus-managed confirmation,
 * and reduced-motion-friendly indicators.
 */
export const ToolCall = React.forwardRef<HTMLElement, ToolCallProps>(
  function ToolCall(
    {
      name,
      description,
      args,
      reversible = true,
      status = "proposed",
      onApprove,
      onDeny,
      onRetry,
      error,
      irreversibleWarning,
      approveLabel = "Approve",
      denyLabel = "Deny",
      confirmLabel = "Yes, run it",
      cancelLabel = "Cancel",
      retryLabel = "Retry",
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const [confirming, setConfirming] = React.useState(false);
    const titleId = useStableId("felt-toolcall-title");
    const descId = useStableId("felt-toolcall-desc");
    const guardId = useStableId("felt-toolcall-guard");

    const approveRef = React.useRef<HTMLButtonElement>(null);
    const confirmRef = React.useRef<HTMLButtonElement>(null);

    // If the status moves on, never leave a stale guard open.
    React.useEffect(() => {
      if (status !== "proposed" && confirming) setConfirming(false);
    }, [status, confirming]);

    // Move focus into the guard when it opens so keyboard + SR users land on it.
    React.useEffect(() => {
      if (confirming) confirmRef.current?.focus();
    }, [confirming]);

    const meta = STATUS_META[status];
    const isProposed = status === "proposed";

    const handleApproveClick = React.useCallback(() => {
      if (!reversible && !confirming) {
        setConfirming(true);
        return;
      }
      void onApprove?.();
    }, [reversible, confirming, onApprove]);

    const cancelConfirm = React.useCallback(() => {
      setConfirming(false);
      // Return focus to the trigger.
      requestAnimationFrame(() => approveRef.current?.focus());
    }, []);

    const handleGuardKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          cancelConfirm();
        }
      },
      [cancelConfirm],
    );

    return (
      <section
        ref={ref}
        role="group"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        data-felt="tool-call"
        data-status={status}
        data-reversible={reversible}
        className={cn(
          "flex w-full max-w-xl flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm",
          status === "failed" && "border-destructive/40",
          className,
        )}
        {...rest}
      >
        {/* Visually-hidden live region: announces lifecycle changes to SR users. */}
        <span
          className="sr-only"
          role="status"
          aria-live={status === "failed" ? "assertive" : "polite"}
        >
          {statusSentence(name, status)}
        </span>

        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3
              id={titleId}
              className="text-sm font-semibold leading-none tracking-tight"
            >
              {name}
            </h3>
            {description ? (
              <p id={descId} className="text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Badge variant={meta.variant} aria-hidden="true">
            {status === "running" ? (
              <Loader2 className="size-3 animate-felt-spin motion-reduce:animate-none" />
            ) : status === "done" ? (
              <Check className="size-3" />
            ) : status === "failed" ? (
              <AlertTriangle className="size-3" />
            ) : null}
            {meta.label}
          </Badge>
        </header>

        {args && Object.keys(args).length > 0 ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-md bg-muted/50 p-3 text-sm">
            {Object.entries(args).map(([key, value]) => (
              <React.Fragment key={key}>
                <dt className="font-medium text-muted-foreground">{key}</dt>
                <dd className="min-w-0 break-words font-mono text-xs leading-5 text-foreground">
                  {formatArgValue(value)}
                </dd>
              </React.Fragment>
            ))}
          </dl>
        ) : null}

        {children}

        {/* Persistent irreversible notice (informational, before approval). */}
        {!reversible && isProposed && !confirming ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-warning">
            <ShieldAlert className="size-3.5 shrink-0" aria-hidden="true" />
            This action can&rsquo;t be undone.
          </p>
        ) : null}

        {status === "failed" && error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        {/* Irreversible confirmation guard. */}
        {confirming ? (
          <div
            role="alertdialog"
            aria-modal="false"
            aria-labelledby={guardId}
            onKeyDown={handleGuardKeyDown}
            className="flex flex-col gap-3 rounded-md border border-warning/50 bg-warning/10 p-3"
          >
            <p
              id={guardId}
              className="flex items-start gap-2 text-sm font-medium text-foreground"
            >
              <ShieldAlert
                className="mt-0.5 size-4 shrink-0 text-warning"
                aria-hidden="true"
              />
              <span>
                {irreversibleWarning ?? (
                  <>
                    <strong>{name}</strong> can&rsquo;t be undone. Run it anyway?
                  </>
                )}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                ref={confirmRef}
                variant="destructive"
                size="sm"
                onClick={() => void onApprove?.()}
              >
                {confirmLabel}
              </Button>
              <Button variant="ghost" size="sm" onClick={cancelConfirm}>
                {cancelLabel}
              </Button>
            </div>
          </div>
        ) : null}

        {/* Action row. */}
        {isProposed && !confirming ? (
          <div className="flex flex-wrap gap-2">
            <Button
              ref={approveRef}
              size="sm"
              variant={reversible ? "default" : "destructive"}
              onClick={handleApproveClick}
              disabled={!onApprove}
            >
              <Check />
              {approveLabel}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDeny?.()}
              disabled={!onDeny}
            >
              <X />
              {denyLabel}
            </Button>
          </div>
        ) : null}

        {status === "failed" && onRetry ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => onRetry()}>
              <RotateCcw />
              {retryLabel}
            </Button>
            {onDeny ? (
              <Button size="sm" variant="ghost" onClick={() => onDeny()}>
                {denyLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </section>
    );
  },
);
