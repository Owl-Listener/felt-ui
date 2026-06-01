import * as React from "react";
import {
  Circle,
  CircleCheck,
  CircleSlash,
  CircleX,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type StepStatus =
  | "pending"
  | "active"
  | "done"
  | "failed"
  | "skipped";

export interface PlanStep {
  /** Stable key. Falls back to the index if omitted. */
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Default `"pending"`. */
  status?: StepStatus;
}

const STATUS_META: Record<
  StepStatus,
  { srLabel: string; tone: string; Icon: typeof Circle; spin?: boolean }
> = {
  pending: { srLabel: "Pending", tone: "text-muted-foreground", Icon: Circle },
  active: {
    srLabel: "In progress",
    tone: "text-warning",
    Icon: Loader2,
    spin: true,
  },
  done: { srLabel: "Done", tone: "text-success", Icon: CircleCheck },
  failed: { srLabel: "Failed", tone: "text-destructive", Icon: CircleX },
  skipped: {
    srLabel: "Skipped",
    tone: "text-muted-foreground/70",
    Icon: CircleSlash,
  },
};

/* -------------------------------------------------------------------------- */
/*  Step                                                                      */
/* -------------------------------------------------------------------------- */

export interface StepProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Default `"pending"`. */
  status?: StepStatus;
  /** Extra content rendered under the step (e.g. a nested ToolCall). */
  children?: React.ReactNode;
}

/**
 * A single step in a `<Plan>`. Usable on its own inside any `<ol>`, but most
 * builders pass a `steps` array to `<Plan>` instead. Status is conveyed as
 * text (for screen readers) and colour/icon (for sighted users) — never colour
 * alone. The connector line is pure CSS (`last:before:hidden`), so no
 * "is last" bookkeeping is needed.
 */
export const Step = React.forwardRef<HTMLLIElement, StepProps>(function Step(
  { title, description, status = "pending", children, className, ...rest },
  ref,
) {
  const meta = STATUS_META[status];
  const { Icon } = meta;

  return (
    <li
      ref={ref}
      data-felt="plan-step"
      data-status={status}
      aria-current={status === "active" ? "step" : undefined}
      className={cn(
        "relative flex gap-3 pb-5 last:pb-1",
        // Connector line down the marker column; hidden on the last step.
        "before:absolute before:left-[11px] before:top-6 before:h-[calc(100%-1.5rem)] before:w-px before:bg-border before:content-[''] last:before:hidden",
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          "relative z-10 mt-0.5 flex size-[22px] shrink-0 items-center justify-center bg-card",
          meta.tone,
        )}
      >
        <Icon
          className={cn(
            "size-[18px]",
            meta.spin && "animate-felt-spin motion-reduce:animate-none",
          )}
          aria-hidden="true"
        />
      </span>

      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className={cn(
            "text-sm font-medium leading-snug",
            status === "skipped" && "text-muted-foreground line-through",
            status === "pending" && "text-muted-foreground",
          )}
        >
          {/* Status as text, for screen readers and as a visible prefix-free label. */}
          <span className="sr-only">{meta.srLabel}: </span>
          {title}
        </span>
        {description ? (
          <span className="text-sm text-muted-foreground">{description}</span>
        ) : null}
        {children}
      </div>
    </li>
  );
});

/* -------------------------------------------------------------------------- */
/*  Plan                                                                      */
/* -------------------------------------------------------------------------- */

export interface PlanProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  /** Data-driven steps. Omit to compose `<Step>` children instead. */
  steps?: PlanStep[];
  /** Show the "N of M done" progress summary. Default `true`. */
  showProgress?: boolean;
  children?: React.ReactNode;
}

function isStepElement(
  node: React.ReactNode,
): node is React.ReactElement<StepProps> {
  return React.isValidElement(node) && node.type === Step;
}

/** Pull a normalized step list from either the `steps` prop or `<Step>` children. */
function collectSteps(
  steps: PlanStep[] | undefined,
  children: React.ReactNode,
): PlanStep[] {
  if (steps) return steps;
  const out: PlanStep[] = [];
  React.Children.forEach(children, (child) => {
    if (isStepElement(child)) {
      out.push({
        title: child.props.title,
        description: child.props.description,
        status: child.props.status ?? "pending",
      });
    }
  });
  return out;
}

function announce(steps: PlanStep[]): {
  message: string;
  assertive: boolean;
} {
  const total = steps.length;
  const failedIndex = steps.findIndex((s) => s.status === "failed");
  if (failedIndex !== -1) {
    return {
      message: `Step ${failedIndex + 1} of ${total} failed.`,
      assertive: true,
    };
  }
  const activeIndex = steps.findIndex((s) => s.status === "active");
  if (activeIndex !== -1) {
    return {
      message: `Step ${activeIndex + 1} of ${total} in progress.`,
      assertive: false,
    };
  }
  const settled = steps.filter(
    (s) => s.status === "done" || s.status === "skipped",
  ).length;
  if (total > 0 && settled === total) {
    return { message: "Plan complete.", assertive: false };
  }
  return { message: "", assertive: false };
}

/**
 * `<Plan>` — agent plan visibility with live per-step status.
 *
 * Pass a `steps` array (fastest path) or compose `<Step>` children. Renders an
 * accessible ordered list: status is text + colour (never colour alone), the
 * active step carries `aria-current="step"`, progress is summarized, and
 * lifecycle changes are announced via an ARIA live region (assertive on
 * failure). Reduced-motion friendly.
 */
export const Plan = React.forwardRef<HTMLElement, PlanProps>(function Plan(
  { title, steps, showProgress = true, children, className, ...rest },
  ref,
) {
  const titleId = React.useId();
  const resolved = collectSteps(steps, children);
  const total = resolved.length;
  const done = resolved.filter((s) => s.status === "done").length;
  const { message, assertive } = announce(resolved);

  return (
    <section
      ref={ref}
      role="group"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : "Plan"}
      data-felt="plan"
      className={cn(
        "flex w-full max-w-xl flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm",
        className,
      )}
      {...rest}
    >
      <span
        className="sr-only"
        role="status"
        aria-live={assertive ? "assertive" : "polite"}
      >
        {message}
      </span>

      {(title || showProgress) && total > 0 ? (
        <header className="flex items-center justify-between gap-3">
          {title ? (
            <h3
              id={titleId}
              className="text-sm font-semibold leading-none tracking-tight"
            >
              {title}
            </h3>
          ) : (
            <span />
          )}
          {showProgress ? (
            <span
              className="text-xs font-medium text-muted-foreground"
              aria-hidden="true"
            >
              {done} of {total} done
            </span>
          ) : null}
        </header>
      ) : null}

      <ol role="list" className="flex flex-col">
        {steps
          ? steps.map((step, i) => (
              <Step
                key={step.id ?? i}
                title={step.title}
                description={step.description}
                status={step.status ?? "pending"}
              />
            ))
          : children}
      </ol>
    </section>
  );
});
