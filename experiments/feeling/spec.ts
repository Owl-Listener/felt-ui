/**
 * felt-ui — a specification for how things should feel, written so an agent
 * can act on it. The missing translation from emotion to the concrete
 * decisions that produce it.
 *
 * `resolve(target)` turns a point in feeling-space into implementation
 * decisions (token overrides, motion, copy guidance). `critique(observed,
 * target)` is the return path: does a rendered design actually match its
 * target, and where does it drift?
 *
 * The bindings below are opinionated and contestable — that's the point. They
 * are explicit (and overridable) instead of trapped in a designer's head.
 */

/* -------------------------------------------------------------------------- */
/*  1. A vocabulary of feeling                                                */
/* -------------------------------------------------------------------------- */

/** Each dimension is a spectrum from -1 to +1. A coordinate system for feeling. */
export type Dimension =
  | "warmth" // cool ↔ warm
  | "energy" // calm ↔ lively
  | "density" // airy ↔ packed
  | "weight" // light ↔ heavy
  | "pace" // slow ↔ snappy
  | "playfulness" // serious ↔ playful
  | "formality"; // casual ↔ formal

export type FeelingTarget = Partial<Record<Dimension, number>>;

export const DIMENSIONS: Dimension[] = [
  "warmth",
  "energy",
  "density",
  "weight",
  "pace",
  "playfulness",
  "formality",
];

/** Named presets — a feeling target you can point at by name. */
export const PRESETS: Record<string, FeelingTarget> = {
  // The "average of the training data": neutral everything. The slop default.
  neutral: {},
  calm: {
    warmth: 0.5,
    energy: -0.7,
    density: -0.5,
    weight: -0.4,
    pace: -0.7,
    playfulness: -0.4,
    formality: 0.2,
  },
  "calm-clinical-trust": {
    warmth: -0.1,
    energy: -0.6,
    density: -0.3,
    weight: -0.2,
    pace: -0.5,
    playfulness: -0.7,
    formality: 0.7,
  },
};

/* -------------------------------------------------------------------------- */
/*  2. The decisions a feeling resolves into                                  */
/* -------------------------------------------------------------------------- */

export interface Decisions {
  /** The fully-specified point in feeling-space (defaults filled to 0). */
  target: Record<Dimension, number>;
  /** CSS custom-property overrides — the levers the agent applies to tokens. */
  tokens: Record<string, string>;
  motion: {
    /** CSS easing curve. */
    easing: string;
    durationMs: number;
    /** How far things travel / scale when they move. */
    amplitude: "none" | "subtle" | "moderate" | "lively";
  };
  copy: {
    /** A one-line tone instruction an agent can condition generation on. */
    tone: string;
    /** Concrete do/don't guidance. */
    guidance: string[];
  };
  /** Bindings the current component architecture can't yet honor (be honest). */
  notes: string[];
}

/* -------------------------------------------------------------------------- */
/*  3. Bindings — feeling → real levers                                       */
/* -------------------------------------------------------------------------- */

const clamp = (n: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Map a -1..1 dimension onto a 0..1 mixing factor. */
const unit = (n: number) => (clamp(n) + 1) / 2;
const hsl = (h: number, s: number, l: number) =>
  `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
const round = (n: number, p = 3) => {
  const f = 10 ** p;
  return Math.round(n * f) / f;
};

function fill(target: FeelingTarget): Record<Dimension, number> {
  return DIMENSIONS.reduce(
    (acc, d) => ((acc[d] = clamp(target[d] ?? 0)), acc),
    {} as Record<Dimension, number>,
  );
}

/**
 * Resolve a feeling target (named preset or coordinate) into decisions.
 *
 * This is the function an MCP `resolve(target)` tool would wrap. An agent told
 * "make this feel calm and trustworthy" calls it and gets values, instead of
 * regressing the design to the mean of its training data.
 */
export function resolve(target: FeelingTarget | string): Decisions {
  const t = fill(typeof target === "string" ? (PRESETS[target] ?? {}) : target);

  // Mixing factors.
  const warm = unit(t.warmth); // 0 cool … 1 warm
  const lively = unit(t.energy); // 0 calm … 1 lively
  const packed = unit(t.density); // 0 airy … 1 packed
  const heavy = unit(t.weight); // 0 light … 1 heavy
  const snappy = unit(t.pace); // 0 slow … 1 snappy

  // — Colour temperature: warmth picks the neutral hue; energy sets saturation.
  const neutralHue = t.warmth >= 0 ? 32 : 222;
  const neutralSat = round(lerp(4, 12, warm) + lerp(0, 4, lively)); // calm stays quiet

  // — Contrast: lively = crisp/high-contrast; calm = soft/low-contrast.
  const fgL = round(lerp(28, 12, lively)); // foreground lightness
  const mutedFgL = round(lerp(52, 40, lively));
  const borderL = round(lerp(91, 85, lively));
  const bgL = round(lerp(99, 100, lively)); // calm = warm paper, not stark white
  const cardL = round(lerp(99.5, 100, lively));

  // — Primary: calm desaturates and lifts off pure black.
  const primaryL = round(lerp(34, 10, lively));
  const primarySat = round(lerp(10, 18, lively));

  // — Alarm: low energy softens the destructive red toward muted clay.
  const destSat = round(lerp(46, 72, lively));
  const destL = round(lerp(52, 50, lively));

  // — Radius: calmer / lighter → softer corners.
  const radiusRem = round(lerp(1.15, 0.4, (lively + heavy) / 2), 3);

  // — Density: airy → looser line-height + a touch more letter-spacing.
  const leading = round(lerp(1.7, 1.35, packed), 3);
  const tracking = round(lerp(0.01, -0.01, packed), 4);

  // — Motion: pace drives duration; calm eases out, lively is snappier.
  const durationMs = Math.round(lerp(520, 110, snappy));
  const easing = snappy > 0.6 ? "cubic-bezier(0.4,0,0.2,1)" : "cubic-bezier(0.22,1,0.36,1)";
  const amplitude: Decisions["motion"]["amplitude"] =
    lively > 0.75 ? "lively" : lively > 0.5 ? "moderate" : lively > 0.25 ? "subtle" : "none";

  const tokens: Record<string, string> = {
    "--background": hsl(neutralHue, neutralSat, bgL),
    "--foreground": hsl(neutralHue, neutralSat + 2, fgL),
    "--card": hsl(neutralHue, neutralSat, cardL),
    "--card-foreground": hsl(neutralHue, neutralSat + 2, fgL),
    "--muted": hsl(neutralHue, neutralSat, round(lerp(96, 96, lively))),
    "--muted-foreground": hsl(neutralHue, neutralSat, mutedFgL),
    "--primary": hsl(neutralHue, primarySat, primaryL),
    "--primary-foreground": hsl(neutralHue, neutralSat, round(lerp(98, 99, lively))),
    "--border": hsl(neutralHue, neutralSat, borderL),
    "--input": hsl(neutralHue, neutralSat, borderL),
    "--ring": hsl(neutralHue, primarySat, primaryL),
    "--destructive": hsl(t.warmth >= 0 ? 14 : 0, destSat, destL),
    "--warning": hsl(t.warmth >= 0 ? 36 : 40, round(lerp(60, 92, lively)), 50),
    "--radius": `${radiusRem}rem`,
    // Felt-specific levers (components opt in via var(--felt-*)).
    "--felt-pace": `${durationMs}ms`,
    "--felt-leading": `${leading}`,
    "--felt-tracking": `${tracking}em`,
  };

  // — Copy tone from playfulness / formality / energy.
  const toneWords = [
    t.energy < -0.3 ? "quiet" : t.energy > 0.3 ? "energetic" : "even",
    t.formality > 0.3 ? "precise" : t.formality < -0.3 ? "casual" : "plain",
    t.playfulness > 0.3 ? "playful" : "earnest",
  ];
  const guidance: string[] = [];
  if (t.energy < -0.3)
    guidance.push("Lower urgency: avoid exclamation, deadlines, and alarm words.");
  if (t.pace < -0.3) guidance.push('Reassure there\'s no rush ("whenever you\'re ready").');
  if (t.formality > 0.3) guidance.push("Full sentences; avoid slang and contractions in critical copy.");
  if (t.playfulness < -0.3) guidance.push("No jokes or winks in consequential moments.");
  if (t.warmth > 0.3) guidance.push("Warm, human phrasing over terse system language.");

  const notes: string[] = [];
  if (t.weight !== 0)
    notes.push(
      "weight → font-weight is not yet a token; components use fixed weights. Bind once components read var(--felt-weight).",
    );
  if (t.density !== 0)
    notes.push(
      "density partially applied (line-height/tracking via inherited vars); spacing rhythm needs components to read var(--felt-space).",
    );

  return {
    target: t,
    tokens,
    motion: { easing, durationMs, amplitude },
    copy: { tone: toneWords.join(", "), guidance },
    notes,
  };
}

/* -------------------------------------------------------------------------- */
/*  4. The return path — critique                                             */
/* -------------------------------------------------------------------------- */

/** A coarse reading of a rendered design, in the same coordinate system. */
export type ObservedFeeling = Partial<Record<Dimension, number>>;

export interface Drift {
  dimension: Dimension;
  target: number;
  observed: number;
  delta: number;
  note: string;
}

/**
 * `critique(observed, target)` — does the rendered UI actually match its
 * target? Returns the dimensions that drifted most, with a human note. (The
 * MCP `critique` tool would derive `observed` from the live DOM/computed
 * styles; here it's supplied so the contract is testable.)
 */
export function critique(
  observed: ObservedFeeling,
  target: FeelingTarget | string,
  tolerance = 0.25,
): Drift[] {
  const t = fill(typeof target === "string" ? (PRESETS[target] ?? {}) : target);
  const drifts: Drift[] = [];
  for (const d of DIMENSIONS) {
    if (observed[d] === undefined) continue;
    const o = clamp(observed[d] as number);
    const delta = round(o - t[d]);
    if (Math.abs(delta) > tolerance) {
      drifts.push({
        dimension: d,
        target: t[d],
        observed: o,
        delta,
        note:
          delta > 0
            ? `reads more ${HIGH[d]} than asked`
            : `reads more ${LOW[d]} than asked`,
      });
    }
  }
  return drifts.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

const HIGH: Record<Dimension, string> = {
  warmth: "warm",
  energy: "lively",
  density: "packed",
  weight: "heavy",
  pace: "snappy",
  playfulness: "playful",
  formality: "formal",
};
const LOW: Record<Dimension, string> = {
  warmth: "cool",
  energy: "calm",
  density: "airy",
  weight: "light",
  pace: "slow",
  playfulness: "serious",
  formality: "casual",
};
