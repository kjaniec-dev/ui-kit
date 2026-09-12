import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricCard } from "./metric-card";

describe("MetricCard", () => {
  it("renders title and string value correctly", () => {
    render(<MetricCard title="Total Sales" value="$48,900" />);

    const title = screen.getByText("Total Sales");
    const value = screen.getByText("$48,900");

    expect(title).toBeInTheDocument();
    expect(title).toHaveClass(
      "text-xs",
      "font-mono",
      "font-semibold",
      "uppercase",
      "text-muted-foreground"
    );

    expect(value).toBeInTheDocument();
    expect(value).toHaveClass("text-3xl", "font-bold", "tracking-tight", "text-foreground");
  });

  it("renders numeric value correctly", () => {
    render(<MetricCard title="Active Subscriptions" value={1420} />);

    expect(screen.getByText("1420")).toBeInTheDocument();
  });

  it("renders icon when provided, and omits icon element when not provided", () => {
    const { rerender } = render(
      <MetricCard title="Server Uptime" value="99.9%" icon={<svg data-testid="server-icon" />} />
    );

    const icon = screen.getByTestId("server-icon");
    expect(icon).toBeInTheDocument();
    expect(icon.parentElement).toHaveClass("text-muted-foreground", "shrink-0");

    rerender(<MetricCard title="Server Uptime" value="99.9%" />);
    expect(screen.queryByTestId("server-icon")).not.toBeInTheDocument();
  });

  it("does not render trend badge when trend is not provided", () => {
    render(<MetricCard title="Conversion" value="3.2%" />);

    expect(screen.queryByText(/%/)).toBeInTheDocument(); // The value itself
    // Verify there is no badge element next to value
    const valElement = screen.getByText("3.2%");
    expect(valElement.nextElementSibling).toBeNull();
  });

  it("renders neutral trend by default when trendDirection is omitted", () => {
    render(<MetricCard title="Page Views" value="84k" trend="0% vs yesterday" />);

    const trendBadge = screen.getByText("0% vs yesterday");
    expect(trendBadge).toBeInTheDocument();
    expect(trendBadge).toHaveClass("text-muted-foreground", "bg-muted", "border-border/20");
  });

  it("renders up trend with success styling when trendDirection is 'up'", () => {
    render(<MetricCard title="MRR" value="$12,000" trend="+18.4%" trendDirection="up" />);

    const trendBadge = screen.getByText("+18.4%");
    expect(trendBadge).toBeInTheDocument();
    expect(trendBadge).toHaveClass("text-success", "bg-success-surface", "border-success/20");
    expect(trendBadge).not.toHaveClass("text-danger");
  });

  it("renders down trend with danger styling when trendDirection is 'down'", () => {
    render(<MetricCard title="Bounce Rate" value="42%" trend="-5.1%" trendDirection="down" />);

    const trendBadge = screen.getByText("-5.1%");
    expect(trendBadge).toBeInTheDocument();
    expect(trendBadge).toHaveClass("text-danger", "bg-danger-surface", "border-danger/20");
    expect(trendBadge).not.toHaveClass("text-success");
  });

  it("renders neutral trend with muted styling when trendDirection is 'neutral'", () => {
    render(<MetricCard title="Latency" value="12ms" trend="flat" trendDirection="neutral" />);

    const trendBadge = screen.getByText("flat");
    expect(trendBadge).toBeInTheDocument();
    expect(trendBadge).toHaveClass("text-muted-foreground", "bg-muted", "border-border/20");
  });

  it("renders description text when provided", () => {
    const { rerender } = render(
      <MetricCard
        title="New Signups"
        value="310"
        description="Compared to the previous 7-day period"
      />
    );

    const desc = screen.getByText("Compared to the previous 7-day period");
    expect(desc).toBeInTheDocument();
    expect(desc.tagName).toBe("P");
    expect(desc).toHaveClass("text-xs", "text-muted-foreground");

    rerender(<MetricCard title="New Signups" value="310" />);
    expect(screen.queryByText("Compared to the previous 7-day period")).not.toBeInTheDocument();
  });

  it("merges custom className with default Card styling", () => {
    render(
      <MetricCard
        title="Deployments"
        value="58"
        className="custom-metric-class border-indigo-500"
        data-testid="metric-container"
      />
    );

    const card = screen.getByTestId("metric-container");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("p-6", "custom-metric-class", "border-indigo-500");
  });

  it("forwards ref to the underlying HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<MetricCard ref={ref} title="Errors" value="0" data-testid="metric-ref" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId("metric-ref"));
  });

  it("forwards arbitrary HTML attributes", () => {
    render(
      <MetricCard
        title="Cache Hit Ratio"
        value="94%"
        id="metric-cache"
        data-testid="metric-attr"
        aria-label="Cache hit metric"
      />
    );

    const card = screen.getByTestId("metric-attr");
    expect(card).toHaveAttribute("id", "metric-cache");
    expect(card).toHaveAttribute("aria-label", "Cache hit metric");
  });

  it("has the correct displayName", () => {
    expect(MetricCard.displayName).toBe("MetricCard");
  });
});
