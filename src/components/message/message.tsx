"use client";

import * as React from "react";
import { Copy, RotateCcw, Square, Paperclip } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type MessageRole = "user" | "assistant" | "system";

export interface MessageAttachment {
  id?: string;
  name: string;
  /** Size in bytes, rendered human-readable if provided. */
  size?: number;
  type?: string;
}

const ROLE_LABEL: Record<MessageRole, string> = {
  user: "You",
  assistant: "Assistant",
  system: "System",
};

function formatBytes(bytes?: number): string | undefined {
  if (bytes == null) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export interface MessageProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "content"> {
  role: MessageRole;
  /** Author label. Defaults to a role-based label ("You" / "Assistant"). */
  name?: React.ReactNode;
  /** Whether an assistant message is currently streaming in. */
  streaming?: boolean;
  /** Attachments to display with the message. */
  attachments?: MessageAttachment[];
  /** Stop generation (shown while `streaming`). */
  onStop?: () => void;
  /** Regenerate (shown when an assistant message is complete). */
  onRegenerate?: () => void;
  /** Copy the message. */
  onCopy?: () => void;
  children?: React.ReactNode;
}

/**
 * `<Message>` — an accessible chat message with first-class streaming.
 *
 * The body is an ARIA live region (`aria-live="polite"`, `aria-busy` while
 * streaming) so screen readers hear assistant output as it arrives. A
 * reduced-motion-aware caret signals streaming; stop / regenerate / copy are
 * real, labelled buttons. Author and streaming state are exposed to assistive
 * tech, not just shown visually.
 */
export const Message = React.forwardRef<HTMLElement, MessageProps>(
  function Message(
    {
      role,
      name,
      streaming = false,
      attachments,
      onStop,
      onRegenerate,
      onCopy,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const label = name ?? ROLE_LABEL[role];
    const isAssistant = role === "assistant";

    return (
      <article
        ref={ref}
        data-felt="message"
        data-role={role}
        data-streaming={streaming || undefined}
        className={cn("flex flex-col gap-1.5", className)}
        {...rest}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>{label}</span>
          {isAssistant ? (
            <span className="sr-only" role="status" aria-live="polite">
              {streaming ? `${label} is responding.` : ""}
            </span>
          ) : null}
        </div>

        <div
          // Live region: assistant output is announced as it streams in.
          aria-live={isAssistant ? "polite" : undefined}
          aria-atomic={isAssistant ? false : undefined}
          aria-busy={streaming || undefined}
          className={cn(
            "w-fit max-w-[40rem] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
            role === "user" && "bg-primary text-primary-foreground",
            role === "assistant" && "bg-muted text-foreground",
            role === "system" &&
              "border border-dashed border-border bg-transparent text-muted-foreground",
          )}
        >
          {children}
          {streaming ? (
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-pulse bg-current align-baseline motion-reduce:animate-none"
            />
          ) : null}
        </div>

        {attachments && attachments.length > 0 ? (
          <ul
            aria-label="Attachments"
            className="flex flex-wrap gap-1.5"
          >
            {attachments.map((file, i) => {
              const size = formatBytes(file.size);
              return (
                <li
                  key={file.id ?? i}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs text-card-foreground"
                >
                  <Paperclip
                    className="size-3 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="max-w-[12rem] truncate">{file.name}</span>
                  {size ? (
                    <span className="text-muted-foreground">{size}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        {/* Per-message actions. */}
        {onStop || onRegenerate || onCopy ? (
          <div className="flex flex-wrap gap-1">
            {streaming && onStop ? (
              <Button size="sm" variant="ghost" onClick={onStop}>
                <Square />
                Stop
              </Button>
            ) : null}
            {!streaming && onRegenerate ? (
              <Button size="sm" variant="ghost" onClick={onRegenerate}>
                <RotateCcw />
                Regenerate
              </Button>
            ) : null}
            {!streaming && onCopy ? (
              <Button size="sm" variant="ghost" onClick={onCopy}>
                <Copy />
                Copy
              </Button>
            ) : null}
          </div>
        ) : null}
      </article>
    );
  },
);