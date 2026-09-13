// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaChart, LineChart } from "./line-chart";

afterEach(() => {
  cleanup();
});

const sampleData = [
  { date: "Jan", sales: 100, profit: 40 },
  { date: "Feb", sales: 140, profit: 60 },
  { date: "Mar", sales: 120, profit: 55 },
];

const sampleSeries = [
  { key: "sales", label: "Sprzedaż", color: "chart1" as const },
  { key: "profit", label: "Zysk", color: "chart2" as const },
];

describe("LineChart & AreaChart", () => {
  it("renders line chart with axes, series paths, and legend", () => {
    const { container } = render(
      <LineChart
        data={sampleData}
        index="date"
        series={sampleSeries}
        aria-label="Wyniki Kwartalne"
      />
    );
    expect(screen.getByRole("img", { name: "Wyniki Kwartalne" })).toBeInTheDocument();
    expect(screen.getByText("Sprzedaż")).toBeInTheDocument();
    expect(screen.getByText("Zysk")).toBeInTheDocument();
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(container.querySelectorAll("path.chart-line")).toHaveLength(2);
  });

  it("shows tooltip on hover over data area", () => {
    const { container } = render(
      <LineChart data={sampleData} index="date" series={sampleSeries} showTooltip />
    );
    const overlay = container.querySelector(".chart-interactive-overlay");
    expect(overlay).toBeInTheDocument();
    if (overlay) {
      fireEvent.mouseMove(overlay, { clientX: 50, clientY: 50 });
      expect(container.querySelector(".chart-tooltip")).toBeInTheDocument();
    }
  });

  it("renders AreaChart with gradient fill paths", () => {
    const { container } = render(
      <AreaChart data={sampleData} index="date" series={sampleSeries} />
    );
    expect(container.querySelectorAll("path.chart-area")).toHaveLength(2);
  });

  it("renders empty message when data is empty", () => {
    render(<LineChart data={[]} index="date" series={sampleSeries} emptyMessage="Brak danych" />);
    expect(screen.getByText("Brak danych")).toBeInTheDocument();
  });

  it("hides tooltip on mouse leave", () => {
    const { container } = render(
      <LineChart data={sampleData} index="date" series={sampleSeries} showTooltip />
    );
    const overlay = container.querySelector(".chart-interactive-overlay");
    expect(overlay).toBeInTheDocument();
    if (overlay) {
      fireEvent.mouseMove(overlay, { clientX: 50, clientY: 50 });
      expect(container.querySelector(".chart-tooltip")).toBeInTheDocument();
      fireEvent.mouseLeave(overlay);
      expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();
    }
  });

  it("supports interactive series toggling via legend click", () => {
    const { container } = render(
      <LineChart data={sampleData} index="date" series={sampleSeries} />
    );
    expect(container.querySelectorAll("path.chart-line")).toHaveLength(2);

    const legendButton = screen.getByRole("button", { name: /Sprzedaż/i });
    expect(legendButton).toBeInTheDocument();

    // Toggle off "sales"
    fireEvent.click(legendButton);
    expect(container.querySelectorAll("path.chart-line")).toHaveLength(1);

    // Toggle on "sales"
    fireEvent.click(legendButton);
    expect(container.querySelectorAll("path.chart-line")).toHaveLength(2);
  });

  it("applies custom valueFormatter to axis and tooltip", () => {
    const { container } = render(
      <LineChart
        data={sampleData}
        index="date"
        series={sampleSeries}
        valueFormatter={(val) => `${val} zł`}
        showTooltip
      />
    );
    // Y-axis tick formatting
    expect(screen.getAllByText(/zł/).length).toBeGreaterThan(0);

    const overlay = container.querySelector(".chart-interactive-overlay");
    if (overlay) {
      fireEvent.mouseMove(overlay, { clientX: 50, clientY: 50 });
      const tooltip = container.querySelector(".chart-tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("100 zł");
    }
  });

  it("renders accessible table with sr-only class", () => {
    render(
      <LineChart data={sampleData} index="date" series={sampleSeries} caption="Tabela sprzedaży" />
    );
    const table = screen.getByRole("table");
    expect(table).toHaveClass("sr-only");
    expect(screen.getByText("Tabela sprzedaży")).toBeInTheDocument();
  });

  it("respects curve types: smooth, linear, and step", () => {
    const { container: smoothContainer } = render(
      <LineChart data={sampleData} index="date" series={sampleSeries} curve="smooth" />
    );
    const smoothPath = smoothContainer.querySelector("path.chart-line");
    expect(smoothPath?.getAttribute("d")).toContain("C");

    const { container: stepContainer } = render(
      <LineChart data={sampleData} index="date" series={sampleSeries} curve="step" />
    );
    const stepPath = stepContainer.querySelector("path.chart-line");
    expect(stepPath?.getAttribute("d")).toContain("H");
  });

  it("respects showGrid, showXAxis, showYAxis, and showLegend options", () => {
    const { container } = render(
      <LineChart
        data={sampleData}
        index="date"
        series={sampleSeries}
        showGrid={false}
        showXAxis={false}
        showYAxis={false}
        showLegend={false}
      />
    );
    expect(container.querySelector(".chart-grid")).not.toBeInTheDocument();
    expect(container.querySelector(".chart-x-axis")).not.toBeInTheDocument();
    expect(container.querySelector(".chart-y-axis")).not.toBeInTheDocument();
    expect(container.querySelector(".chart-legend")).not.toBeInTheDocument();
  });

  it("handles single data point gracefully", () => {
    const { container } = render(
      <LineChart
        data={[{ date: "Jan", sales: 100 }]}
        index="date"
        series={[{ key: "sales", label: "Sprzedaż" }]}
      />
    );
    expect(container.querySelector("path.chart-line")).toBeInTheDocument();
  });

  it("supports touch events for tooltip interaction", () => {
    const { container } = render(
      <LineChart data={sampleData} index="date" series={sampleSeries} showTooltip />
    );
    const overlay = container.querySelector(".chart-interactive-overlay");
    if (overlay) {
      fireEvent.touchStart(overlay, {
        touches: [{ clientX: 50, clientY: 50 }],
      });
      expect(container.querySelector(".chart-tooltip")).toBeInTheDocument();
      fireEvent.touchEnd(overlay);
      expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();
    }
  });
});
