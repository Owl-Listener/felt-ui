import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { Plan, Step } from "./plan";

describe("Plan", () => {
  it("renders a labelled region with an ordered list of steps", () => {
    render(
      <Plan
        title="Refund workflow"
        steps={[
          { title: "Look up order", status: "done" },
          { title: "Verify eligibility", status: "active" },
          { title: "Issue refund", status: "pending" },
        ]}
      />,
    );

    const region = screen.getByRole("group", { name: "Refund workflow" });
    expect(region).toBeInTheDocument();
    const list = within(region).getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  it("conveys status as text, not colour alone", () => {
    render(
      <Plan
        steps={[
          { title: "Look up order", status: "done" },
          { title: "Issue refund", status: "failed" },
        ]}
      />,
    );

    // Each step carries an sr-only status label.
    expect(screen.getByText("Done:")).toBeInTheDocument();
    expect(screen.getByText("Failed:")).toBeInTheDocument();
  });

  it("marks the active step with aria-current", () => {
    render(
      <Plan
        steps={[
          { title: "One", status: "done" },
          { title: "Two", status: "active" },
          { title: "Three", status: "pending" },
        ]}
      />,
    );

    const current = screen
      .getAllByRole("listitem")
      .find((li) => li.getAttribute("aria-current") === "step");
    expect(current).toHaveTextContent("Two");
  });

  it("summarizes progress", () => {
    render(
      <Plan
        steps={[
          { title: "One", status: "done" },
          { title: "Two", status: "done" },
          { title: "Three", status: "active" },
          { title: "Four", status: "pending" },
        ]}
      />,
    );
    expect(screen.getByText("2 of 4 done")).toBeInTheDocument();
  });

  it("announces an in-progress step politely", () => {
    render(
      <Plan
        steps={[
          { title: "One", status: "done" },
          { title: "Two", status: "active" },
        ]}
      />,
    );
    const live = screen.getByRole("status");
    expect(live).toHaveTextContent("Step 2 of 2 in progress.");
    expect(live).toHaveAttribute("aria-live", "polite");
  });

  it("announces failure assertively", () => {
    render(
      <Plan
        steps={[
          { title: "One", status: "done" },
          { title: "Two", status: "failed" },
        ]}
      />,
    );
    const live = screen.getByRole("status");
    expect(live).toHaveTextContent("Step 2 of 2 failed.");
    expect(live).toHaveAttribute("aria-live", "assertive");
  });

  it("announces completion when all steps settle", () => {
    render(
      <Plan
        steps={[
          { title: "One", status: "done" },
          { title: "Two", status: "skipped" },
        ]}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Plan complete.");
  });

  it("supports composing <Step> children and still computes progress", () => {
    render(
      <Plan title="Composed">
        <Step title="One" status="done" />
        <Step title="Two" status="active" />
      </Plan>,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("1 of 2 done")).toBeInTheDocument();
  });
});
