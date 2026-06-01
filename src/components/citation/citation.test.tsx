import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { Citation, CitationList } from "./citation";

describe("Citation (inline)", () => {
  it("links to the source with an attribution accessible name", () => {
    render(
      <Citation
        index={1}
        title="Refund policy"
        url="https://help.example.com/refunds"
        source="Example Help"
      />,
    );
    const link = screen.getByRole("link", {
      name: "Source 1: Refund policy — Example Help",
    });
    expect(link).toHaveAttribute("href", "https://help.example.com/refunds");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("1");
  });

  it("defaults the source label to the URL hostname", () => {
    render(
      <Citation
        index={2}
        title="Docs"
        url="https://www.example.org/page"
      />,
    );
    expect(
      screen.getByRole("link", { name: "Source 2: Docs — example.org" }),
    ).toBeInTheDocument();
  });

  it("renders a button (not a link) when there is no URL", () => {
    render(<Citation title="Internal note" />);
    expect(
      screen.getByRole("button", { name: "Source: Internal note" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("CitationList", () => {
  it("renders a labelled, numbered sources section", () => {
    render(
      <CitationList
        sources={[
          {
            title: "Refund policy",
            url: "https://help.example.com/refunds",
            snippet: "Refunds are issued within 5 business days.",
          },
          { title: "Terms of service", url: "https://example.com/tos" },
        ]}
      />,
    );

    const region = screen.getByRole("region", { name: "Sources" });
    const items = within(region).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("Refund policy")).toBeInTheDocument();
    expect(
      within(items[0]).getByText("Refunds are issued within 5 business days."),
    ).toBeInTheDocument();
    // Each source links out to view it.
    expect(
      within(items[0]).getByRole("link", { name: /view source/i }),
    ).toHaveAttribute("href", "https://help.example.com/refunds");
  });

  it("accepts a custom section title", () => {
    render(
      <CitationList
        title="References"
        sources={[{ title: "A", url: "https://a.example" }]}
      />,
    );
    expect(
      screen.getByRole("region", { name: "References" }),
    ).toBeInTheDocument();
  });
});
