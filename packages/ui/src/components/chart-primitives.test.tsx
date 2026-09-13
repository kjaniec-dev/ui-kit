// @vitest-environment jsdom
import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  cleanup();
});
import {
  CHART_COLOR_VARS,
  ChartA11yTable,
  ChartContainer,
  ChartGrid,
  ChartLegend,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
  getChartColor,
  useChartWidth,
} from "./chart-primitives";

describe("Chart Primitives", () => {
  describe("ChartContainer", () => {
    it("renders ChartContainer with SVG and accessible role", () => {
      render(
        <ChartContainer width={400} height={200} aria-label="Test Chart">
          <rect width={100} height={100} />
        </ChartContainer>
      );
      expect(screen.getByRole("img", { name: "Test Chart" })).toBeInTheDocument();
    });

    it("renders with custom viewBox and passes extra container props", () => {
      const { container } = render(
        <ChartContainer
          width={500}
          height={250}
          viewBox="0 0 1000 500"
          className="custom-chart"
          data-testid="chart-wrapper"
          aria-label="Custom ViewBox"
        >
          <circle cx={50} cy={50} r={20} />
        </ChartContainer>
      );
      const wrapper = screen.getByTestId("chart-wrapper");
      expect(wrapper).toHaveClass("custom-chart", "relative");
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("viewBox", "0 0 1000 500");
    });

    it("renders HTML overlay outside the SVG element", () => {
      const { container } = render(
        <ChartContainer
          width={400}
          height={200}
          aria-label="Chart with Overlay"
          overlay={<div className="custom-overlay">Overlay content</div>}
        >
          <rect width={50} height={50} />
        </ChartContainer>
      );
      const svg = container.querySelector("svg");
      const overlay = container.querySelector(".custom-overlay");
      expect(overlay).toBeInTheDocument();
      expect(svg?.contains(overlay)).toBe(false);
    });

    it("automatically places ChartTooltip children outside SVG", () => {
      const { container } = render(
        <ChartContainer width={400} height={200} aria-label="Auto Slot">
          <rect width={50} height={50} />
          <ChartTooltip title="Hover Info" />
        </ChartContainer>
      );
      const svg = container.querySelector("svg");
      const tooltip = container.querySelector(".chart-tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(svg?.contains(tooltip)).toBe(false);
    });

    it("renders plot wrapper with specified height and places flow children below it", () => {
      const { container } = render(
        <ChartContainer height={300} aria-label="Height separation">
          <rect width={50} height={50} />
          <ChartLegend series={[{ key: "s1", label: "Series 1" }]} />
        </ChartContainer>
      );
      const plotWrapper = container.querySelector(".chart-plot-wrapper");
      expect(plotWrapper).toHaveStyle({ height: "300px" });

      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("h-full");
      expect(plotWrapper?.contains(svg)).toBe(true);

      const legend = container.querySelector(".chart-legend");
      expect(legend).toBeInTheDocument();
      expect(plotWrapper?.contains(legend)).toBe(false);
    });

    it("provides fallback and responds to useChartWidth", () => {
      const TestComponent = () => {
        const ref = React.useRef<HTMLDivElement | null>(null);
        const width = useChartWidth(ref, 640);
        return <div ref={ref} data-testid="test-div" data-width={width} />;
      };

      render(<TestComponent />);
      const el = screen.getByTestId("test-div");
      expect(el).toHaveAttribute("data-width", "640");
    });
  });

  describe("ChartGrid", () => {
    it("renders ChartGrid lines", () => {
      const { container } = render(
        <svg>
          <ChartGrid yTicks={[0, 50, 100]} width={300} scaleY={(v) => 100 - v} />
        </svg>
      );
      const lines = container.querySelectorAll("line");
      expect(lines.length).toBe(3);
    });

    it("renders both horizontal and vertical grid lines", () => {
      const { container } = render(
        <svg>
          <ChartGrid
            yTicks={[0, 100]}
            xTicks={[10, 20, 30]}
            width={300}
            height={200}
            scaleY={(v) => 200 - v * 2}
            scaleX={(v) => v * 10}
            strokeDasharray="4 4"
          />
        </svg>
      );
      const lines = container.querySelectorAll("line");
      expect(lines.length).toBe(5); // 2 horizontal + 3 vertical
    });

    it("supports yDomain and yRange with built-in linearScale", () => {
      const { container } = render(
        <svg>
          <ChartGrid yTicks={[0, 50, 100]} width={200} yDomain={[0, 100]} yRange={[100, 0]} />
        </svg>
      );
      const lines = container.querySelectorAll("line");
      expect(lines).toHaveLength(3);
      expect(lines[0]).toHaveAttribute("y1", "100");
      expect(lines[1]).toHaveAttribute("y1", "50");
      expect(lines[2]).toHaveAttribute("y1", "0");
    });

    it("handles empty ticks array safely without rendering lines", () => {
      const { container } = render(
        <svg>
          <ChartGrid yTicks={[]} width={300} />
        </svg>
      );
      expect(container.querySelectorAll("line")).toHaveLength(0);
    });
  });

  describe("ChartXAxis and ChartYAxis", () => {
    it("renders ChartXAxis and ChartYAxis labels", () => {
      render(
        <svg>
          <ChartXAxis
            ticks={[
              { value: "Jan", x: 20 },
              { value: "Feb", x: 80 },
            ]}
            y={150}
          />
          <ChartYAxis
            ticks={[
              { value: 0, y: 100 },
              { value: 100, y: 0 },
            ]}
            x={30}
            formatter={(v) => `${v}%`}
          />
        </svg>
      );
      expect(screen.getByText("Jan")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("supports valueFormatter alias on both axes", () => {
      render(
        <svg>
          <ChartXAxis ticks={[{ value: 1, x: 20 }]} y={100} valueFormatter={(v) => `Q${v}`} />
          <ChartYAxis ticks={[{ value: 250, y: 50 }]} x={10} valueFormatter={(v) => `$${v}`} />
        </svg>
      );
      expect(screen.getByText("Q1")).toBeInTheDocument();
      expect(screen.getByText("$250")).toBeInTheDocument();
    });

    it("applies custom className and anchor properties", () => {
      const { container } = render(
        <svg>
          <ChartXAxis
            ticks={[{ value: "A", x: 10 }]}
            y={50}
            className="custom-x-axis"
            tickClassName="custom-tick"
            textAnchor="start"
          />
        </svg>
      );
      const group = container.querySelector("g");
      expect(group).toHaveClass("custom-x-axis");
      const text = container.querySelector("text");
      expect(text).toHaveClass("custom-tick");
      expect(text).toHaveAttribute("text-anchor", "start");
    });
  });

  describe("ChartTooltip", () => {
    it("renders tooltip with title, items, formatted values, and indicator dots", () => {
      render(
        <ChartTooltip
          title="February 2026"
          x={120}
          y={80}
          items={[
            { label: "Revenue", value: 1200, color: "chart1" },
            { label: "Profit", value: 450, color: "chart2" },
          ]}
          valueFormatter={(v) => `$${v}`}
        />
      );

      expect(screen.getByText("February 2026")).toBeInTheDocument();
      expect(screen.getByText("Revenue")).toBeInTheDocument();
      expect(screen.getByText("$1200")).toBeInTheDocument();
      expect(screen.getByText("Profit")).toBeInTheDocument();
      expect(screen.getByText("$450")).toBeInTheDocument();
    });

    it("renders crosshair line when showCrosshair is true", () => {
      const { container } = render(
        <ChartTooltip title="Point" open showCrosshair crosshairX={150} crosshairHeight={200} />
      );
      const crosshair = container.querySelector(".chart-crosshair");
      expect(crosshair).toBeInTheDocument();
      expect(crosshair).toHaveStyle({ left: "150px", height: "200px" });
    });

    it("renders nothing when open is false", () => {
      const { container } = render(
        <ChartTooltip title="Hidden" open={false} items={[{ label: "Val", value: 10 }]} />
      );
      expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();
    });

    it("renders custom content node directly", () => {
      render(<ChartTooltip content={<div data-testid="custom-tooltip">Custom</div>} />);
      expect(screen.getByTestId("custom-tooltip")).toBeInTheDocument();
    });
  });

  describe("ChartLegend", () => {
    it("renders ChartLegend with series labels", () => {
      render(
        <ChartLegend
          series={[
            { key: "a", label: "Series A", color: "chart1" },
            { key: "b", label: "Series B", color: "chart2" },
          ]}
        />
      );
      expect(screen.getByText("Series A")).toBeInTheDocument();
      expect(screen.getByText("Series B")).toBeInTheDocument();
    });

    it("handles click-toggle when onToggle is provided", () => {
      const handleToggle = vi.fn();
      render(
        <ChartLegend
          series={[
            { key: "a", label: "Series A", color: "chart1" },
            { key: "b", label: "Series B", color: "chart2" },
          ]}
          onToggle={handleToggle}
        />
      );
      const buttonA = screen.getByRole("button", { name: /Series A/i });
      fireEvent.click(buttonA);
      expect(handleToggle).toHaveBeenCalledTimes(1);
      expect(handleToggle).toHaveBeenCalledWith("a");
    });

    it("supports keyboard toggling via Enter and Space keys", () => {
      const handleToggle = vi.fn();
      render(
        <ChartLegend
          series={[{ key: "rev", label: "Revenue", color: "chart1" }]}
          onToggle={handleToggle}
        />
      );
      const btn = screen.getByRole("button", { name: /Revenue/i });
      fireEvent.keyDown(btn, { key: "Enter" });
      expect(handleToggle).toHaveBeenCalledWith("rev");
      fireEvent.keyDown(btn, { key: " " });
      expect(handleToggle).toHaveBeenCalledTimes(2);
    });

    it("styles disabled or hidden series with dimmed opacity", () => {
      render(
        <ChartLegend
          series={[
            { key: "a", label: "Series A", color: "chart1" },
            { key: "b", label: "Series B", color: "chart2" },
          ]}
          disabledSeries={["b"]}
          onToggle={() => {}}
        />
      );
      const buttonB = screen.getByRole("button", { name: /Series B/i });
      expect(buttonB).toHaveAttribute("aria-pressed", "false");
      expect(buttonB.className).toMatch(/opacity/);
    });
  });

  describe("ChartA11yTable", () => {
    it("renders ChartA11yTable with sr-only semantic table", () => {
      render(
        <ChartA11yTable
          caption="Monthly Performance"
          categories={["Jan", "Feb"]}
          series={[{ key: "sales", label: "Sales" }]}
          data={[
            { date: "Jan", sales: 100 },
            { date: "Feb", sales: 150 },
          ]}
          indexKey="date"
        />
      );
      const table = screen.getByRole("table");
      expect(table).toHaveClass("sr-only");
      expect(screen.getByText("Monthly Performance")).toBeInTheDocument();
      expect(screen.getByText("150")).toBeInTheDocument();
    });

    it("renders table with valueFormatter and column headers", () => {
      render(
        <ChartA11yTable
          caption="Yearly Stats"
          series={[
            { key: "q1", label: "Q1" },
            { key: "q2", label: "Q2" },
          ]}
          data={[{ cat: "Alpha", q1: 50, q2: 80 }]}
          index="cat"
          valueFormatter={(v) => `${v}k`}
        />
      );
      expect(screen.getByRole("columnheader", { name: "Q1" })).toBeInTheDocument();
      expect(screen.getByRole("rowheader", { name: "Alpha" })).toBeInTheDocument();
      expect(screen.getByText("50k")).toBeInTheDocument();
      expect(screen.getByText("80k")).toBeInTheDocument();
    });

    it("handles numeric array data gracefully", () => {
      render(
        <ChartA11yTable
          caption="Simple Trend"
          series={[{ key: "val", label: "Trend" }]}
          data={[10, 20, 30]}
        />
      );
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
    });
  });

  describe("CHART_COLOR_VARS and getChartColor", () => {
    it("provides valid CSS variable fallbacks for chart1 through chart6", () => {
      expect(CHART_COLOR_VARS.chart1).toContain("--kj-chart1");
      expect(CHART_COLOR_VARS.chart2).toContain("--kj-chart2");
      expect(CHART_COLOR_VARS.chart3).toContain("--kj-chart3");
      expect(CHART_COLOR_VARS.chart4).toContain("--kj-chart4");
      expect(CHART_COLOR_VARS.chart5).toContain("--kj-chart5");
      expect(CHART_COLOR_VARS.chart6).toContain("--kj-chart6");
    });

    it("resolves token names using getChartColor", () => {
      expect(getChartColor("chart1")).toContain("--kj-chart1");
      expect(getChartColor("chart5")).toContain("--kj-chart5");
    });

    it("returns custom hex or rgb strings unchanged", () => {
      expect(getChartColor("#123456")).toBe("#123456");
      expect(getChartColor("rgba(0,0,0,0.5)")).toBe("rgba(0,0,0,0.5)");
    });

    it("cycles fallback colors when color is omitted", () => {
      expect(getChartColor(undefined, 0)).toContain("--kj-chart1");
      expect(getChartColor(undefined, 1)).toContain("--kj-chart2");
      expect(getChartColor(undefined, 6)).toContain("--kj-chart1");
    });
  });
});
