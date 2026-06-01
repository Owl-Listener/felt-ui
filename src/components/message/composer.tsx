import * as React from "react";
import { ArrowUp, Paperclip, Square, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { MessageAttachment } from "./message";

export interface ComposerProps
  extends Omit<
    React.FormHTMLAttributes<HTMLFormElement>,
    "onSubmit" | "onChange"
  > {
  /** Controlled value. Omit for uncontrolled use. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed text on submit (Enter or the send button). */
  onSubmit?: (value: string) => void;
  placeholder?: string;
  /** Accessible label for the textarea. Default "Message". */
  label?: string;
  disabled?: boolean;
  /**
   * When true, the send button becomes a Stop button (calls `onStop`) — the
   * assistant is generating.
   */
  streaming?: boolean;
  onStop?: () => void;
  /** Show the attach button + wire it to a hidden file input. */
  onAttach?: (files: FileList) => void;
  /** Current attachments, rendered as removable chips. */
  attachments?: MessageAttachment[];
  onRemoveAttachment?: (attachment: MessageAttachment, index: number) => void;
  sendLabel?: string;
}

/**
 * `<Composer>` — an accessible message input.
 *
 * Enter submits, Shift+Enter inserts a newline. While `streaming`, the send
 * affordance becomes a labelled Stop button. Attachments are real list items
 * with remove buttons, and the hidden file input is driven by a labelled
 * trigger. Controlled or uncontrolled.
 */
export const Composer = React.forwardRef<HTMLFormElement, ComposerProps>(
  function Composer(
    {
      value,
      defaultValue = "",
      onValueChange,
      onSubmit,
      placeholder = "Send a message…",
      label = "Message",
      disabled = false,
      streaming = false,
      onStop,
      onAttach,
      attachments,
      onRemoveAttachment,
      sendLabel = "Send",
      className,
      ...rest
    },
    ref,
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const text = isControlled ? value : internal;
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const setText = React.useCallback(
      (next: string) => {
        if (!isControlled) setInternal(next);
        onValueChange?.(next);
      },
      [isControlled, onValueChange],
    );

    const hasAttachments = !!attachments && attachments.length > 0;
    const canSend = (text.trim().length > 0 || hasAttachments) && !disabled;

    const submit = React.useCallback(() => {
      if (!canSend) return;
      onSubmit?.(text.trim());
      if (!isControlled) setInternal("");
    }, [canSend, onSubmit, text, isControlled]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        submit();
      }
    };

    return (
      <form
        ref={ref}
        data-felt="composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={cn(
          "flex flex-col gap-2 rounded-xl border border-input bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          className,
        )}
        {...rest}
      >
        {hasAttachments ? (
          <ul
            aria-label="Attachments"
            className="flex flex-wrap gap-1.5 px-1 pt-1"
          >
            {attachments!.map((file, i) => (
              <li
                key={file.id ?? i}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-xs"
              >
                <Paperclip
                  className="size-3 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="max-w-[12rem] truncate">{file.name}</span>
                {onRemoveAttachment ? (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(file, i)}
                    aria-label={`Remove ${file.name}`}
                    className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        <textarea
          aria-label={label}
          rows={1}
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-48 min-h-[2.5rem] w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />

        <div className="flex items-center justify-between gap-2">
          {onAttach ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => {
                  if (e.target.files?.length) onAttach(e.target.files);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={disabled}
                aria-label="Attach files"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip />
              </Button>
            </>
          ) : (
            <span />
          )}

          {streaming ? (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={onStop}
              aria-label="Stop generating"
            >
              <Square />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!canSend}
              aria-label={sendLabel}
            >
              <ArrowUp />
            </Button>
          )}
        </div>
      </form>
    );
  },
);
