"use client";

import * as React from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { ExternalLink, Quote } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CitationSource {
  /** Stable key. Falls back to the index. */
  id?: string;
  title: string;
  url?: string;
  /** Publisher / site label. Defaults to the URL's hostname. */
  source?: string;
  /** A quoted supporting passage. */
  snippet?: string;
}

/** Best-effort hostname for a URL, for the default source label. */
function hostnameOf(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

/* -------------------------------------------------------------------------- */
/*  Inline citation marker                                                    */
/* -------------------------------------------------------------------------- */

export interface CitationProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: string;
  url?: string;
  source?: string;
  snippet?: string;
  /** Marker contents — defaults to `index` (e.g. `[1]`) or a quote glyph. */
  index?: number;
  /** Delay (ms) before the preview opens on hover. Default `120`. */
  openDelay?: number;
  children?: React.ReactNode;
}

/**
 * `<Citation>` — inline source attribution you can verify.
 *
 * Renders a compact marker that links to the source (new tab, safe `rel`).
 * Its accessible name carries the attribution — `"Source 1: Title — publisher"` —
 * so screen-reader and keyboard users get it without the hover preview. On
 * hover or focus, a Radix HoverCard reveals the title, source, and a quoted
 * snippet, letting people check the ground truth without leaving the page.
 */
export const Citation = React.forwardRef<HTMLAnchorElement, CitationProps>(
  function Citation(
    {
      title,
      url,
      source,
      snippet,
      index,
      openDelay = 120,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const label = source ?? hostnameOf(url);
    const markerContent =
      children ??
      (typeof index === "number" ? (
        index
      ) : (
        <Quote className="size-3" aria-hidden="true" />
      ));
    const accessibleName = `Source${
      typeof index === "number" ? ` ${index}` : ""
    }: ${title}${label ? ` — ${label}` : ""}`;

    const markerClass = cn(
      "inline-flex min-w-[1.25rem] items-center justify-center gap-0.5 rounded-[0.3rem] border border-border bg-muted px-1 align-baseline text-[0.7em] font-medium leading-[1.4] text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
      className,
    );

    return (
      <HoverCard.Root openDelay={openDelay} closeDelay={80}>
        <HoverCard.Trigger asChild>
          {url ? (
            <a
              ref={ref}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={accessibleName}
              data-felt="citation"
              className={markerClass}
              {...rest}
            >
              {markerContent}
            </a>
          ) : (
            <button
              ref={ref as React.Ref<HTMLButtonElement>}
              type="button"
              aria-label={accessibleName}
              data-felt="citation"
              className={cn(markerClass, "cursor-help")}
              {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
            >
              {markerContent}
            </button>
          )}
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content
            side="top"
            align="start"
            sideOffset={6}
            collisionPadding={8}
            className="z-50 w-72 rounded-md border border-border bg-card p-3 text-card-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=top]:slide-in-from-bottom-1 motion-reduce:animate-none"
          >
            <CitationCard
              source={{ title, url, source: label, snippet }}
              showIndex={typeof index === "number" ? index : undefined}
            />
            <HoverCard.Arrow className="fill-border" />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*  Shared source card                                                        */
/* -------------------------------------------------------------------------- */

function CitationCard({
  source,
  showIndex,
}: {
  source: CitationSource;
  showIndex?: number;
}) {
  const label = source.source ?? hostnameOf(source.url);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1.5">
        {typeof showIndex === "number" ? (
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {showIndex}.
          </span>
        ) : null}
        <span className="text-sm font-semibold leading-snug">
          {source.title}
        </span>
      </div>
      {label ? (
        <span className="text-xs text-muted-foreground">{label}</span>
      ) : null}
      {source.snippet ? (
        <blockquote className="border-l-2 border-border pl-2 text-xs italic text-muted-foreground">
          {source.snippet}
        </blockquote>
      ) : null}
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          View source
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Citation list                                                             */
/* -------------------------------------------------------------------------- */

export interface CitationListProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  sources: CitationSource[];
  /** Heading for the section. Default `"Sources"`. */
  title?: React.ReactNode;
}

/**
 * `<CitationList>` — an explicit, numbered "Sources" section. An accessible
 * ordered list of source cards; pairs with inline `<Citation index={n}>`
 * markers that reference the same list.
 */
export const CitationList = React.forwardRef<HTMLElement, CitationListProps>(
  function CitationList({ sources, title = "Sources", className, ...rest }, ref) {
    const titleId = React.useId();
    return (
      <section
        ref={ref}
        aria-labelledby={titleId}
        data-felt="citation-list"
        className={cn(
          "flex w-full max-w-xl flex-col gap-2 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm",
          className,
        )}
        {...rest}
      >
        <h3
          id={titleId}
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {title}
        </h3>
        <ol role="list" className="flex flex-col gap-3">
          {sources.map((s, i) => (
            <li key={s.id ?? i}>
              <CitationCard source={s} showIndex={i + 1} />
            </li>
          ))}
        </ol>
      </section>
    );
  },
);