import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { ToolCall } from "./tool-call";

// jsdom doesn't implement rAF in all versions used by focus-return logic.
beforeAll(() => {
  if (!globalThis.requestAnimationFrame) {
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
      setTimeout(() => cb(Date.now()), 0) as unknown as number;
  }
});

describe("ToolCall", () => {
  it("renders intent, parameters, and an accessible labelled region", () => {
    render(
      <ToolCall
        name="Issue refund"
        args={{ order: "#48213", amount: "$129.00" }}
      />,
    );

    const region = screen.getByRole("group", { name: "Issue refund" });
    expect(region).toBeInTheDocument();
    expect(within(region).getByText("#48213")).toBeInTheDocument();
    expect(within(region).getByText("$129.00")).toBeInTheDocument();
  });

  it("announces status changes through a live region", () => {
    const { rerender } = render(<ToolCall name="Run query" status="running" />);
    const live = screen.getByRole("status");
    expect(live).toHaveTextContent(/running action: run query/i);
    expect(live).toHaveAttribute("aria-live", "polite");

    rerender(<ToolCall name="Run query" status="failed" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "assertive");
  });

  it("calls onApprove immediately for reversible actions", async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    render(<ToolCall name="Draft email" reversible onApprove={onApprove} />);

    await user.click(screen.getByRole("button", { name: /approve/i }));
    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it("guards irreversible actions behind a confirmation step", async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    render(
      <ToolCall name="Issue refund" reversible={false} onApprove={onApprove} />,
    );

    // The card warns up front.
    expect(screen.getByText(/can.t be undone/i)).toBeInTheDocument();

    // First click does NOT run — it opens the guard.
    await user.click(screen.getByRole("button", { name: /approve/i }));
    expect(onApprove).not.toHaveBeenCalled();

    const guard = screen.getByRole("alertdialog");
    expect(guard).toBeInTheDocument();
    // Focus is moved into the guard.
    const confirm = within(guard).getByRole("button", { name: /yes, run it/i });
    expect(confirm).toHaveFocus();

    // Confirming runs it.
    await user.click(confirm);
    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it("lets the user cancel the irreversible guard without running", async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    render(
      <ToolCall name="Delete account" reversible={false} onApprove={onApprove} />,
    );

    await user.click(screen.getByRole("button", { name: /approve/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onApprove).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    // Approve affordance is back.
    expect(screen.getByRole("button", { name: /approve/i })).toBeInTheDocument();
  });

  it("dismisses the guard on Escape", async () => {
    const user = userEvent.setup();
    render(<ToolCall name="Wipe cache" reversible={false} onApprove={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /approve/i }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("calls onDeny when denied", async () => {
    const user = userEvent.setup();
    const onDeny = vi.fn();
    render(<ToolCall name="Send invite" onDeny={onDeny} onApprove={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /deny/i }));
    expect(onDeny).toHaveBeenCalledTimes(1);
  });

  it("hides the approve/deny controls once running", () => {
    render(<ToolCall name="Process" status="running" onApprove={vi.fn()} />);
    expect(
      screen.queryByRole("button", { name: /approve/i }),
    ).not.toBeInTheDocument();
  });

  it("surfaces an error and retry in the failed state", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ToolCall
        name="Charge card"
        status="failed"
        error="Gateway timeout"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText("Gateway timeout")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
