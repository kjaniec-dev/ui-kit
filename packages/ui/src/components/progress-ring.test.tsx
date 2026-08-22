// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { ProgressRing, ProgressRingField } from "./progress-ring";

describe("ProgressRing", () => {
  it("renders progressbar with correct accessibility attributes", () => {
    render(<ProgressRing value={60} min={0} max={100} aria-label="Upload Progress" />);

    const progressbar = screen.getByRole("progressbar", { name: "Upload Progress" });
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "60");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps value within min and max boundaries", () => {
    const { rerender } = render(<ProgressRing value={150} min={0} max={100} />);
    let progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "100");

    rerender(<ProgressRing value={-20} min={0} max={100} />);
    progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
  });

  it("displays percentage text when showValue is true", () => {
    render(<ProgressRing value={45} showValue />);
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("supports custom formatValue function when showValue is true", () => {
    render(
      <ProgressRing
        value={3}
        max={10}
        showValue
        formatValue={(val, pct) => `${val}/10 (${pct}%)`}
      />
    );
    expect(screen.getByText("3/10 (30%)")).toBeInTheDocument();
  });

  it("renders custom center slot children", () => {
    render(
      <ProgressRing value={80}>
        <span data-testid="custom-center">80% Done</span>
      </ProgressRing>
    );

    expect(screen.getByTestId("custom-center")).toBeInTheDocument();
    expect(screen.getByText("80% Done")).toBeInTheDocument();
  });

  it("applies tone and size classes correctly", () => {
    const { container } = render(<ProgressRing value={50} tone="success" size="lg" />);
    const svgCircle = container.querySelector("svg circle:last-child");
    expect(svgCircle).toHaveClass("text-success");
  });
});

describe("ProgressRingField", () => {
  it("renders label and hint text", () => {
    render(<ProgressRingField label="Disk Space" hint="75% of 1TB used" value={75} showValue />);

    expect(screen.getByText("Disk Space")).toBeInTheDocument();
    expect(screen.getByText("75% of 1TB used")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders error message when error prop is provided", () => {
    render(
      <ProgressRingField
        label="Quota Status"
        hint="Normal usage"
        error="Quota exceeded!"
        value={100}
      />
    );

    expect(screen.getByText("Quota Status")).toBeInTheDocument();
    expect(screen.getByText("Quota exceeded!")).toBeInTheDocument();
    expect(screen.queryByText("Normal usage")).not.toBeInTheDocument();
  });
});
