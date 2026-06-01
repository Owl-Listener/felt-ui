import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { Confidence, getConfidenceLevel } from "./confidence";

describe("getConfidenceLevel", () => {
  it("maps probabilities to bands at the default thresholds", () => {
    expect(getConfidenceLevel(0.2)).toBe("low");
    expect(getConfidenceLevel(0.5)).toBe("medium");
    expect(getConfidenceLevel(0.79)).toBe("medium");
    expect(getConfidenceLevel(0.8)).toBe("high");
    expect(getConfidenceLevel(0.99)).toBe("high");
  });

  it("respects custom thresholds", () => {
    expect(getConfidenceLevel(0.6, { medium: 0.7, high: 0.9 })).toBe("low");
    expect(getConfidenceLevel(0.95, { medium: 0.7, high: 0.9 })).toBe("high");
  });
});

describe("Confidence", () => {
  it("renders an accessible meter with a descriptive value text", () => {
    render(<Confidence value={0.92} />);
    const meter = screen.getByRole("meter", { name: "Confidence" });
    expect(meter).toHaveAttribute("aria-valuenow", "92");
    expect(meter).toHaveAttribute("aria-valuetext", "High confidence, 92%");
  });

  it("conveys the band as text, not colour alone", () => {
    render(<Confidence value={0.3} />);
    expect(screen.getByText("Low confidence")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
  });

  it("clamps out-of-range values", () => {
    render(<Confidence value={1.5} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
  });

  it("supports a qualitative level without a number", () => {
    render(<Confidence level="low" />);
    expect(screen.getByText("Low confidence")).toBeInTheDocument();
    // No percent shown when only a level is given.
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveAttribute(
      "aria-valuetext",
      "Low confidence",
    );
  });

  it("allows a custom label and caption", () => {
    render(
      <Confidence value={0.7} label="Pretty sure" caption="2 of 3 sources agree" />,
    );
    expect(screen.getByText("Pretty sure")).toBeInTheDocument();
    expect(screen.getByText("2 of 3 sources agree")).toBeInTheDocument();
  });
});
