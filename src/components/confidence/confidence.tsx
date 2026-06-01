import * as React from "react";
import { CircleCheck, CircleHelp, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export type ConfidenceLevel = "low" | "medium" | "high";

export interface ConfidenceThresholds {
  /** value ≥ this is at least "medium". Default `0.5`. */
  medium: number;
  /** value ≥ this is "high". Default `0.8`. */
  high: number;
}

const DEFAULT_THRESHOLDS: ConfidenceThresholds = { medium: 0.5, high: 0.8 };

const LEVEL_META: Record<
  ConfidenceLevel,
  {
    label: string;
    tone: string;
    fill: string;
    Icon: typeof CircleCheck;
    representative: number;
  }
> = {
  low: {
    label: "Low confidence",
    tone: "text-destructive",
    fill: "bg-destructive",
    Icon: TriangleAlert,
    representative: 0.33,
  },
  medium: {
    label: "Medium confidence",
    tone: "text-warning",
    fill: "bg-warning",
    Icon: CircleHelp,
    representative: 0.66,
  },
  high: {
    label: "High confidence",
    tone: "text-success",
    fill: "bg-success",
    Icon: CircleCheck,
    representative: 0.92,
  },
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/** Resolve a calibrated probability (0–1) to a qualitative band. */
export function getConfidenceLevel(
  value: number,
  thresholds: ConfidenceThresholds = DEFAULT_THRESHOLDS,
): ConfidenceLevel {
  if (value >= thresholds.high) return "high";
  if (value >= thresholds.medium) return "medium";
  return "low";
}

export interface ConfidenceProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Calibrated probability, 0–1. Drives both the band and the displayed
   * percentage. Provide this OR `level`.
   */
  value?: number;
  /** Qualitative band, when you don't have a number. Provide this OR `value`. */
  level?: ConfidenceLevel;
  /** Override the band → label mapping. */
  label?: React.ReactNode;
  /** Show the numeric percentage. Defaults to `true` when `value` is given. */
  showPercent?: boolean;
  /** Thresholds for mapping `value` → band. */
  thresholds?: ConfidenceThresholds;
  /** A short, honest "why" shown beneath (e.g. "2 of 3 sources agree"). */
  caption?: React.ReactNode;
}

/**
 * `<Confidence>` — communicate calibrated uncertainty, honestly.
 *
 * Pass a `value` (0–1 probability) or a qualitative `level`. Renders an
 * accessible meter (`role="meter"` with `aria-valuetext`) whose band is
 * conveyed by **label + icon + colour**, never colour alone — so low
 * confidence reads as caution, not decoration. Low values surface a cautionary
 * tone rather than a falsely reassuring one.
 */
export const Confidence = React.forwardRef<HTMLDivElement, ConfidenceProps>(
  function Confidence(
    {
      value,
      level: levelProp,
      label,
      showPercent,
      thresholds = DEFAULT_THRESHOLDS,
      caption,
      className,
      ...rest
    },
    ref,
  ) {
    const hasValue = typeof value === "number";
    const v = hasValue ? clamp01(value as number) : undefined;
    const level: ConfidenceLevel =
      levelProp ?? (hasValue ? getConfidenceLevel(v as number, thresholds) : "medium");

    const meta = LEVEL_META[level];
    const { Icon } = meta;

    // Fill ratio: the real value when given, else the band's representative.
    const ratio = hasValue ? (v as number) : meta.representative;
    const pct = Math.round(ratio * 100);
    const resolvedShowPercent = showPercent ?? hasValue;
    const text = label ?? meta.label;

    const valueText = hasValue ? `${meta.label}, ${pct}%` : meta.label;

    return (
      <div
        ref={ref}
        data-felt="confidence"
        data-level={level}
        className={cn("flex w-full max-w-xs flex-col gap-1.5", className)}
        {...rest}
      >
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className={cn("flex items-center gap-1.5 font-medium", meta.tone)}>
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {text}
          </span>
          {resolvedShowPercent ? (
            <span className="tabular-nums text-muted-foreground" aria-hidden="true">
              {pct}%
            </span>
          ) : null}
        </div>

        <div
          role="meter"
          aria-label="Confidence"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={valueText}
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn("h-full rounded-full transition-[width]", meta.fill)}
            style={{ width: `${pct}%` }}
          />
        </div>

        {caption ? (
          <p className="text-xs text-muted-foreground">{caption}</p>
        ) : null}
      </div>
    );
  },
);
