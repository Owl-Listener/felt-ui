import * as React from "react";
import {
  CircleSlash,
  CloudOff,
  Hand,
  ScrollText,
  ShieldAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type RefusalCategory =
  | "safety"
  | "capability"
  | "policy"
  | "unavailable";

const CATEGORY_ICON: Record<RefusalCategory, typeof Hand> = {
  safety: ShieldAlert,
  capability: CircleSlash,
  policy: ScrollText,
  unavailable: CloudOff,
};

export interface RefusalAction {
  label: string;
  /** Render the action as a link instead of a button. */
  href?: string;
  onClick?: () => void;
}

export interface RefusalProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** The decline, stated plainly and kindly. Default "I can't help with that". */
  title?: React.ReactNode;
  /** Why — honest and brief. Also accepted as `children`. */
  reason?: React.ReactNode;
  /** Tunes the icon; refusals stay visually calm regardless. */
  category?: RefusalCategory;
  /**
   * Ways forward, so this isn't a dead end. The first is emphasized as the
   * suggested next step.
   */
  actions?: RefusalAction[];
  children?: React.ReactNode;
}

/**
 * `<Refusal>` — decline gracefully, not a dead end.
 *
 * States the decline plainly, explains why, and offers ways forward. Styled
 * calm (neutral, not an error alarm) because a refusal isn't a failure.
 * Accessible by default: a labelled region with a heading, a polite live
 * announcement, and real buttons/links for the next steps.
 */
export const Refusal = React.forwardRef<HTMLElement, RefusalProps>(
  function Refusal(
    {
      title = "I can't help with that",
      reason,
      category,
      actions,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const titleId = React.useId();
    const Icon = category ? CATEGORY_ICON[category] : Hand;
    const body = reason ?? children;

    return (
      <section
        ref={ref}
        role="group"
        aria-labelledby={titleId}
        data-felt="refusal"
        data-category={category}
        className={cn(
          "flex w-full max-w-xl gap-3 rounded-lg border border-border bg-muted/40 p-4 text-card-foreground",
          className,
        )}
        {...rest}
      >
        <span
          className="sr-only"
          role="status"
          aria-live="polite"
        >
          Request declined.
        </span>

        <span
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>

        <div className="flex min-w-0 flex-col gap-1.5">
          <h3
            id={titleId}
            className="text-sm font-semibold leading-snug tracking-tight"
          >
            {title}
          </h3>
          {body ? (
            <div className="text-sm leading-relaxed text-muted-foreground">
              {body}
            </div>
          ) : null}

          {actions && actions.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-2">
              {actions.map((action, i) =>
                action.href ? (
                  <Button
                    key={i}
                    asChild
                    size="sm"
                    variant={i === 0 ? "default" : "outline"}
                  >
                    <a href={action.href}>{action.label}</a>
                  </Button>
                ) : (
                  <Button
                    key={i}
                    size="sm"
                    variant={i === 0 ? "default" : "outline"}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ),
              )}
            </div>
          ) : null}
        </div>
      </section>
    );
  },
);
