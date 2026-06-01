import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { Message } from "./message";
import { Composer } from "./composer";

describe("Message", () => {
  it("labels the author and renders content", () => {
    render(<Message role="assistant">Hello there.</Message>);
    expect(screen.getByText("Assistant")).toBeInTheDocument();
    expect(screen.getByText("Hello there.")).toBeInTheDocument();
  });

  it("exposes the assistant body as a polite live region while streaming", () => {
    const { rerender } = render(
      <Message role="assistant" streaming>
        Thinking
      </Message>,
    );
    const body = screen.getByText("Thinking").closest("[aria-live]");
    expect(body).toHaveAttribute("aria-live", "polite");
    expect(body).toHaveAttribute("aria-busy", "true");

    // Once complete, aria-busy is gone.
    rerender(<Message role="assistant">Done</Message>);
    expect(screen.getByText("Done").closest("[aria-live]")).not.toHaveAttribute(
      "aria-busy",
    );
  });

  it("shows Stop while streaming and Regenerate/Copy when complete", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    const onRegenerate = vi.fn();

    const { rerender } = render(
      <Message role="assistant" streaming onStop={onStop} onRegenerate={onRegenerate}>
        …
      </Message>,
    );
    expect(screen.queryByRole("button", { name: /regenerate/i })).toBeNull();
    await user.click(screen.getByRole("button", { name: /stop/i }));
    expect(onStop).toHaveBeenCalledTimes(1);

    rerender(
      <Message role="assistant" onStop={onStop} onRegenerate={onRegenerate}>
        Final answer
      </Message>,
    );
    expect(screen.queryByRole("button", { name: /stop/i })).toBeNull();
    await user.click(screen.getByRole("button", { name: /regenerate/i }));
    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it("lists attachments accessibly", () => {
    render(
      <Message role="user" attachments={[{ name: "receipt.pdf", size: 2048 }]}>
        Here's the file
      </Message>,
    );
    const list = screen.getByRole("list", { name: "Attachments" });
    expect(within(list).getByText("receipt.pdf")).toBeInTheDocument();
    expect(within(list).getByText("2 KB")).toBeInTheDocument();
  });
});

describe("Composer", () => {
  it("submits on Enter and clears (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Composer onSubmit={onSubmit} />);

    const input = screen.getByRole("textbox", { name: "Message" });
    await user.type(input, "hello world");
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledWith("hello world");
    expect(input).toHaveValue("");
  });

  it("inserts a newline on Shift+Enter without submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Composer onSubmit={onSubmit} />);

    const input = screen.getByRole("textbox", { name: "Message" });
    await user.type(input, "line one");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(input, "line two");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(input).toHaveValue("line one\nline two");
  });

  it("disables send when empty and enables it with text", async () => {
    const user = userEvent.setup();
    render(<Composer />);
    const send = screen.getByRole("button", { name: "Send" });
    expect(send).toBeDisabled();

    await user.type(screen.getByRole("textbox", { name: "Message" }), "hi");
    expect(send).toBeEnabled();
  });

  it("becomes a Stop button while streaming", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    render(<Composer streaming onStop={onStop} />);

    expect(screen.queryByRole("button", { name: "Send" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Stop generating" }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("removes an attachment", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Composer
        attachments={[{ name: "a.png" }]}
        onRemoveAttachment={onRemove}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Remove a.png" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
