// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BarChart } from "./bar-chart";

afterEach(() => {
  cleanup();
});

const sampleData = [
  { category: "Styczeń", sales: 200, returns: 20 },
  { category: "Luty", sales: 300, returns: 35 },
];

const sampleSeries = [
  { key: "sales", label: "Sprzedaż", color: "chart1" as const },
  { key: "returns", label: "Zwroty", color: "chart5" as const },
];

describe("BarChart", () => {
  it("renders grouped bar chart with SVG rect elements and legend", () => {
    const { container } = render(
      <BarChart
        data={sampleData}
        index="category"
        series={sampleSeries}
        type="grouped"
        aria-label="Sprzedaż Miesięczna"
      />
    );
    expect(screen.getByRole("img", { name: "Sprzedaż Miesięczna" })).toBeInTheDocument();
    expect(screen.getByText("Sprzedaż")).toBeInTheDocument();
    expect(screen.getByText("Styczeń")).toBeInTheDocument();
    const rects = container.querySelectorAll("rect.chart-bar");
    expect(rects).toHaveLength(4); // 2 categories * 2 series
  });

  it("renders stacked bars accurately", () => {
    const { container } = render(
      <BarChart data={sampleData} index="category" series={sampleSeries} type="stacked" />
    );
    const rects = container.querySelectorAll("rect.chart-bar");
    expect(rects).toHaveLength(4);
  });

  it("shows tooltip on bar hover", () => {
    const { container } = render(
      <BarChart data={sampleData} index="category" series={sampleSeries} showTooltip />
    );
    const bar = container.querySelector("rect.chart-bar");
    expect(bar).toBeInTheDocument();
    if (bar) {
      fireEvent.mouseEnter(bar);
      expect(container.querySelector(".chart-tooltip")).toBeInTheDocument();
    }
  });

  it("hides tooltip on bar mouse leave", () => {
    const { container } = render(
      <BarChart data={sampleData} index="category" series={sampleSeries} showTooltip />
    );
    const bar = container.querySelector("rect.chart-bar");
    expect(bar).toBeInTheDocument();
    if (bar) {
      fireEvent.mouseEnter(bar);
      expect(container.querySelector(".chart-tooltip")).toBeInTheDocument();
      fireEvent.mouseLeave(bar);
      expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();
    }
  });

  it("renders horizontal layout with inverted category and value axes", () => {
    const { container } = render(
      <BarChart data={sampleData} index="category" series={sampleSeries} layout="horizontal" />
    );
    const rects = container.querySelectorAll("rect.chart-bar");
    expect(rects).toHaveLength(4);
    // In horizontal layout, categories appear on Y-axis
    expect(container.querySelector(".chart-y-axis")).toBeInTheDocument();
    expect(container.querySelector(".chart-x-axis")).toBeInTheDocument();
    expect(screen.getByText("Styczeń")).toBeInTheDocument();
  });

  it("renders empty message fallback when data is empty", () => {
    render(
      <BarChart
        data={[]}
        index="category"
        series={sampleSeries}
        emptyMessage="Brak danych do wyświetlenia"
      />
    );
    expect(screen.getByText("Brak danych do wyświetlenia")).toBeInTheDocument();
  });

  it("supports interactive series toggling via legend click", () => {
    const { container } = render(
      <BarChart data={sampleData} index="category" series={sampleSeries} />
    );
    expect(container.querySelectorAll("rect.chart-bar")).toHaveLength(4);

    const legendButton = screen.getByRole("button", { name: /Sprzedaż/i });
    expect(legendButton).toBeInTheDocument();

    // Toggle off "sales"
    fireEvent.click(legendButton);
    expect(container.querySelectorAll("rect.chart-bar")).toHaveLength(2);

    // Toggle on "sales"
    fireEvent.click(legendButton);
    expect(container.querySelectorAll("rect.chart-bar")).toHaveLength(4);
  });

  it("preserves original series color when previous series is toggled off", () => {
    const uncoloredSeries = [
      { key: "sales", label: "Sprzedaż" },
      { key: "returns", label: "Zwroty" },
    ];
    const { container } = render(
      <BarChart data={sampleData} index="category" series={uncoloredSeries} />
    );
    const barsBefore = container.querySelectorAll("rect.chart-bar");
    expect(barsBefore[0]).toHaveAttribute("fill", "var(--kj-chart1, #a84f08)");
    expect(barsBefore[1]).toHaveAttribute("fill", "var(--kj-chart2, #0f746d)");

    // Toggle off "sales" (series 0)
    const salesBtn = screen.getByRole("button", { name: /Sprzedaż/i });
    fireEvent.click(salesBtn);

    // Remaining series (returns) should still have chart2, NOT change to chart1
    const barsAfter = container.querySelectorAll("rect.chart-bar");
    expect(barsAfter).toHaveLength(2);
    expect(barsAfter[0]).toHaveAttribute("fill", "var(--kj-chart2, #0f746d)");
  });

  it("applies custom valueFormatter to axis and tooltip", () => {
    const { container } = render(
      <BarChart
        data={sampleData}
        index="category"
        series={sampleSeries}
        valueFormatter={(val) => `${val} szt.`}
        showTooltip
      />
    );
    expect(screen.getAllByText(/szt\./).length).toBeGreaterThan(0);

    const bar = container.querySelector("rect.chart-bar");
    if (bar) {
      fireEvent.mouseEnter(bar);
      const tooltip = container.querySelector(".chart-tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("200 szt.");
    }
  });

  it("formats X-axis ticks with indexFormatter exactly once without double-formatting", () => {
    let callCount = 0;
    const customIndexFormatter = (val: unknown) => {
      callCount++;
      return `Miesiąc: ${val}`;
    };
    render(
      <BarChart
        data={sampleData}
        index="category"
        series={sampleSeries}
        indexFormatter={customIndexFormatter}
      />
    );
    expect(callCount).toBe(sampleData.length);
    expect(screen.getByText("Miesiąc: Styczeń")).toBeInTheDocument();
    expect(screen.queryByText("Miesiąc: Miesiąc: Styczeń")).not.toBeInTheDocument();
  });

  it("applies radius prop to rect rx and ry", () => {
    const { container } = render(
      <BarChart data={sampleData} index="category" series={sampleSeries} radius={6} />
    );
    const bar = container.querySelector("rect.chart-bar");
    expect(bar).toHaveAttribute("rx", "6");
    expect(bar).toHaveAttribute("ry", "6");
  });

  it("renders accessible table with sr-only class when caption is provided", () => {
    render(
      <BarChart
        data={sampleData}
        index="category"
        series={sampleSeries}
        caption="Raport sprzedaży miesięcznej"
      />
    );
    const table = screen.getByRole("table");
    expect(table).toHaveClass("sr-only");
    expect(screen.getByText("Raport sprzedaży miesięcznej")).toBeInTheDocument();
  });

  it("respects showGrid, showXAxis, showYAxis, and showLegend options", () => {
    const { container } = render(
      <BarChart
        data={sampleData}
        index="category"
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

  it("supports touch events for tooltip interaction", () => {
    const { container } = render(
      <BarChart data={sampleData} index="category" series={sampleSeries} showTooltip />
    );
    const bar = container.querySelector("rect.chart-bar");
    if (bar) {
      fireEvent.touchStart(bar);
      expect(container.querySelector(".chart-tooltip")).toBeInTheDocument();
      fireEvent.touchEnd(bar);
      expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();
    }
  });

  it("handles single data point gracefully", () => {
    const { container } = render(
      <BarChart
        data={[{ category: "Styczeń", sales: 150 }]}
        index="category"
        series={[{ key: "sales", label: "Sprzedaż" }]}
      />
    );
    const rects = container.querySelectorAll("rect.chart-bar");
    expect(rects).toHaveLength(1);
    expect(screen.getByText("Styczeń")).toBeInTheDocument();
  });
});
