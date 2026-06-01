import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { Refusal } from "./refusal";

describe("Refusal", () => {
  it("renders a labelled region with a default decline heading", () => {
    render(<Refusal reason="That's outside what I can do." />);
    const region = screen.getByRole("group", {
      name: "I can't help with that",
    });
    expect(region).toBeInTheDocument();
    expect(
      within(region).getByText("That's outside what I can do."),
    ).toBeInTheDocument();
  });

  it("announces the decline politely", () => {
    render(<Refusal />);
    const live = screen.getByRole("status");
    expect(live).toHaveTextContent("Request declined.");
    expect(live).toHaveAttribute("aria-live", "polite");
  });

  it("accepts a custom title and the reason via children", () => {
    render(<Refusal title="That needs a human">Routing you to support.</Refusal>);
    expect(
      screen.getByRole("group", { name: "That needs a human" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Routing you to support.")).toBeInTheDocument();
  });

  it("offers ways forward as actionable buttons", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Refusal
        reason="I can't issue refunds over $500."
        actions={[
          { label: "Escalate to a human", onClick },
          { label: "Rephrase request", onClick: vi.fn() },
        ]}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Escalate to a human" }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders link actions as anchors", () => {
    render(
      <Refusal
        reason="See the policy."
        actions={[{ label: "Read policy", href: "https://example.com/policy" }]}
      />,
    );
    expect(
      screen.getByRole("link", { name: "Read policy" }),
    ).toHaveAttribute("href", "https://example.com/policy");
  });

  it("tags the category for styling/icon selection", () => {
    render(<Refusal category="safety" reason="Not safe." />);
    expect(screen.getByRole("group")).toHaveAttribute(
      "data-category",
      "safety",
    );
  });
});
