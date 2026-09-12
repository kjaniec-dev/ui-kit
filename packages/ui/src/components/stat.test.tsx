import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stat } from "./stat";

describe("Stat", () => {
  it("renders label and value correctly", () => {
    render(<Stat label="Total Users" value="12,543" />);

    const label = screen.getByText("Total Users");
    const value = screen.getByText("12,543");

    expect(label).toBeInTheDocument();
    expect(label).toHaveClass(
      "text-[0.78rem]",
      "font-semibold",
      "uppercase",
      "text-muted-foreground"
    );

    expect(value).toBeInTheDocument();
    expect(value).toHaveClass("text-[2rem]", "font-bold", "tabular-nums", "leading-none");
  });

  it("renders ReactNode elements for label and value", () => {
    render(
      <Stat
        label={<span data-testid="custom-label">Custom Label</span>}
        value={<strong data-testid="custom-value">99.9%</strong>}
      />
    );

    expect(screen.getByTestId("custom-label")).toBeInTheDocument();
    expect(screen.getByTestId("custom-value")).toBeInTheDocument();
  });

  it("does not render delta when delta is not provided", () => {
    render(<Stat label="Active Projects" value="42" />);

    expect(screen.queryByText(/▲/)).not.toBeInTheDocument();
    expect(screen.queryByText(/▼/)).not.toBeInTheDocument();
  });

  it("renders upward trend with ▲ indicator and success styling by default or when trend is 'up'", () => {
    const { rerender } = render(
      <Stat label="Revenue" value="$84,200" delta="+12.5% vs last month" />
    );

    let deltaElement = screen.getByText(/▲/);
    expect(deltaElement).toBeInTheDocument();
    expect(deltaElement).toHaveTextContent("▲ +12.5% vs last month");
    expect(deltaElement).toHaveClass("text-success");
    expect(deltaElement).not.toHaveClass("text-danger");

    rerender(<Stat label="Revenue" value="$84,200" delta="+15.0%" trend="up" />);
    deltaElement = screen.getByText(/▲/);
    expect(deltaElement).toHaveTextContent("▲ +15.0%");
    expect(deltaElement).toHaveClass("text-success");
    expect(deltaElement).not.toHaveClass("text-danger");
  });

  it("renders downward trend with ▼ indicator and danger styling when trend is 'down'", () => {
    render(<Stat label="Churn Rate" value="2.4%" delta="-0.8%" trend="down" />);

    const deltaElement = screen.getByText(/▼/);
    expect(deltaElement).toBeInTheDocument();
    expect(deltaElement).toHaveTextContent("▼ -0.8%");
    expect(deltaElement).toHaveClass("text-danger");
    expect(deltaElement).not.toHaveClass("text-success");
  });

  it("renders ReactNode delta content", () => {
    render(
      <Stat
        label="Orders"
        value="350"
        delta={<span data-testid="delta-node">+18% new</span>}
        trend="up"
      />
    );

    expect(screen.getByTestId("delta-node")).toBeInTheDocument();
    expect(screen.getByText(/▲/)).toBeInTheDocument();
  });

  it("renders inside a Card component and merges custom className", () => {
    render(
      <Stat
        label="Page Views"
        value="1.2M"
        className="custom-stat-class border-brand"
        data-testid="stat-card"
      />
    );

    const card = screen.getByTestId("stat-card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass(
      "p-[1.35rem]",
      "flex",
      "flex-col",
      "gap-2",
      "custom-stat-class",
      "border-brand"
    );
  });

  it("forwards ref to the underlying HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stat ref={ref} label="Storage" value="512 GB" data-testid="stat-ref" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId("stat-ref"));
  });

  it("forwards arbitrary HTML attributes to the card element", () => {
    render(
      <Stat
        label="Sessions"
        value="8,900"
        id="stat-sessions"
        data-testid="stat-attr"
        aria-label="Sessions statistic"
      />
    );

    const el = screen.getByTestId("stat-attr");
    expect(el).toHaveAttribute("id", "stat-sessions");
    expect(el).toHaveAttribute("aria-label", "Sessions statistic");
  });

  it("has the correct displayName", () => {
    expect(Stat.displayName).toBe("Stat");
  });
});
