// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DonutChart } from "./donut-chart";

afterEach(() => {
  cleanup();
});

const sampleData = [
  { source: "Organic", visitors: 450 },
  { source: "Direct", visitors: 300 },
  { source: "Referral", visitors: 150 },
];

describe("DonutChart", () => {
  it("renders donut slices with SVG paths and legend", () => {
    const { container } = render(
      <DonutChart data={sampleData} category="source" value="visitors" aria-label="Kanały Ruchu" />
    );
    expect(screen.getByRole("img", { name: "Kanały Ruchu" })).toBeInTheDocument();
    expect(screen.getByText("Organic")).toBeInTheDocument();
    expect(screen.getByText("Direct")).toBeInTheDocument();
    expect(screen.getByText("Referral")).toBeInTheDocument();
    const slices = container.querySelectorAll("path.chart-donut-slice");
    expect(slices).toHaveLength(3);
  });

  it("renders custom center label", () => {
    render(
      <DonutChart
        data={sampleData}
        category="source"
        value="visitors"
        centerLabel={<span data-testid="center-label">900 Users</span>}
      />
    );
    expect(screen.getByTestId("center-label")).toBeInTheDocument();
  });

  it("shows tooltip on slice hover", () => {
    const { container } = render(
      <DonutChart data={sampleData} category="source" value="visitors" showTooltip />
    );
    const slice = container.querySelector("path.chart-donut-slice");
    expect(slice).toBeInTheDocument();
    if (slice) {
      fireEvent.mouseEnter(slice);
      expect(container.querySelector(".chart-tooltip")).toBeInTheDocument();
    }
  });

  it("hides tooltip on slice mouse leave", () => {
    const { container } = render(
      <DonutChart data={sampleData} category="source" value="visitors" showTooltip />
    );
    const slice = container.querySelector("path.chart-donut-slice");
    expect(slice).toBeInTheDocument();
    if (slice) {
      fireEvent.mouseEnter(slice);
      expect(container.querySelector(".chart-tooltip")).toBeInTheDocument();
      fireEvent.mouseLeave(slice);
      expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();
    }
  });

  it("supports touch events for tooltip interaction", () => {
    const { container } = render(
      <DonutChart data={sampleData} category="source" value="visitors" showTooltip />
    );
    const slice = container.querySelector("path.chart-donut-slice");
    expect(slice).toBeInTheDocument();
    if (slice) {
      fireEvent.touchStart(slice);
      expect(container.querySelector(".chart-tooltip")).toBeInTheDocument();
      fireEvent.touchEnd(slice);
      expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();
    }
  });

  it("dims non-hovered slices when a slice is hovered", () => {
    const { container } = render(
      <DonutChart data={sampleData} category="source" value="visitors" showTooltip />
    );
    const slices = container.querySelectorAll("path.chart-donut-slice");
    expect(slices).toHaveLength(3);

    fireEvent.mouseEnter(slices[0]);
    expect(slices[0]).toHaveAttribute("opacity", "1");
    expect(slices[1]).toHaveAttribute("opacity", "0.4");
    expect(slices[2]).toHaveAttribute("opacity", "0.4");

    fireEvent.mouseLeave(slices[0]);
    expect(slices[0]).toHaveAttribute("opacity", "1");
    expect(slices[1]).toHaveAttribute("opacity", "1");
    expect(slices[2]).toHaveAttribute("opacity", "1");
  });

  it("renders predefined sizes: sm (160), md (220), lg (280) and custom numeric size", () => {
    const { container: cSm } = render(
      <DonutChart data={sampleData} category="source" value="visitors" size="sm" />
    );
    const svgSm = cSm.querySelector("svg");
    expect(svgSm).toHaveAttribute("viewBox", "0 0 160 160");

    const { container: cMd } = render(
      <DonutChart data={sampleData} category="source" value="visitors" size="md" />
    );
    const svgMd = cMd.querySelector("svg");
    expect(svgMd).toHaveAttribute("viewBox", "0 0 220 220");

    const { container: cLg } = render(
      <DonutChart data={sampleData} category="source" value="visitors" size="lg" />
    );
    const svgLg = cLg.querySelector("svg");
    expect(svgLg).toHaveAttribute("viewBox", "0 0 280 280");

    const { container: cCustom } = render(
      <DonutChart data={sampleData} category="source" value="visitors" size={320} />
    );
    const svgCustom = cCustom.querySelector("svg");
    expect(svgCustom).toHaveAttribute("viewBox", "0 0 320 320");
  });

  it("supports innerRadius={0} to render a full pie chart", () => {
    const { container } = render(
      <DonutChart data={sampleData} category="source" value="visitors" innerRadius={0} />
    );
    const slices = container.querySelectorAll("path.chart-donut-slice");
    expect(slices).toHaveLength(3);
    // When innerRadius is 0, path ends with "L cx cy Z"
    for (const slice of slices) {
      expect(slice.getAttribute("d")).toContain("Z");
    }
  });

  it("supports custom innerRadius ratio and absolute innerRadius", () => {
    const { container: cRatio } = render(
      <DonutChart data={sampleData} category="source" value="visitors" innerRadius={0.4} />
    );
    expect(cRatio.querySelectorAll("path.chart-donut-slice")).toHaveLength(3);

    const { container: cAbs } = render(
      <DonutChart data={sampleData} category="source" value="visitors" innerRadius={50} />
    );
    expect(cAbs.querySelectorAll("path.chart-donut-slice")).toHaveLength(3);
  });

  it("supports interactive legend toggling to disable and restore slices", () => {
    const { container } = render(
      <DonutChart data={sampleData} category="source" value="visitors" />
    );
    expect(container.querySelectorAll("path.chart-donut-slice")).toHaveLength(3);

    const organicBtn = screen.getByRole("button", { name: /Organic/i });
    expect(organicBtn).toBeInTheDocument();

    // Toggle off Organic
    fireEvent.click(organicBtn);
    expect(organicBtn).toHaveAttribute("aria-pressed", "false");
    // Visible slices with paths
    const activeSlicesAfter = Array.from(
      container.querySelectorAll("path.chart-donut-slice")
    ).filter((s) => s.getAttribute("d") !== "");
    expect(activeSlicesAfter).toHaveLength(2);

    // Toggle back on Organic
    fireEvent.click(organicBtn);
    expect(organicBtn).toHaveAttribute("aria-pressed", "true");
    const activeSlicesRestored = Array.from(
      container.querySelectorAll("path.chart-donut-slice")
    ).filter((s) => s.getAttribute("d") !== "");
    expect(activeSlicesRestored).toHaveLength(3);
  });

  it("preserves original slice colors when preceding slices are toggled off", () => {
    const { container } = render(
      <DonutChart data={sampleData} category="source" value="visitors" />
    );
    const slicesBefore = container.querySelectorAll("path.chart-donut-slice");
    expect(slicesBefore[0]).toHaveAttribute("fill", "var(--kj-chart1, #a84f08)");
    expect(slicesBefore[1]).toHaveAttribute("fill", "var(--kj-chart2, #0f746d)");
    expect(slicesBefore[2]).toHaveAttribute("fill", "var(--kj-chart3, #0284c7)");

    // Toggle off Organic (slice 0)
    const organicBtn = screen.getByRole("button", { name: /Organic/i });
    fireEvent.click(organicBtn);

    // Slice 1 (Direct) should still be chart2, slice 2 (Referral) should still be chart3
    const slicesAfter = container.querySelectorAll("path.chart-donut-slice");
    expect(slicesAfter[1]).toHaveAttribute("fill", "var(--kj-chart2, #0f746d)");
    expect(slicesAfter[2]).toHaveAttribute("fill", "var(--kj-chart3, #0284c7)");
  });

  it("applies custom colors array prop", () => {
    const customColors = ["#ff0000", "#00ff00", "#0000ff"];
    const { container } = render(
      <DonutChart data={sampleData} category="source" value="visitors" colors={customColors} />
    );
    const slices = container.querySelectorAll("path.chart-donut-slice");
    expect(slices[0]).toHaveAttribute("fill", "#ff0000");
    expect(slices[1]).toHaveAttribute("fill", "#00ff00");
    expect(slices[2]).toHaveAttribute("fill", "#0000ff");
  });

  it("applies custom valueFormatter to tooltip and accessible table", () => {
    const { container } = render(
      <DonutChart
        data={sampleData}
        category="source"
        value="visitors"
        valueFormatter={(val) => `${val} odwiedzin`}
        showTooltip
        caption="Statystyki ruchu"
      />
    );
    const slice = container.querySelector("path.chart-donut-slice");
    if (slice) {
      fireEvent.mouseEnter(slice);
      const tooltip = container.querySelector(".chart-tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("450 odwiedzin");
    }
    expect(screen.getByText("450 odwiedzin")).toBeInTheDocument();
  });

  it("renders empty message fallback when data is empty", () => {
    render(
      <DonutChart
        data={[]}
        category="source"
        value="visitors"
        emptyMessage="Brak danych do wyświetlenia"
      />
    );
    expect(screen.getByText("Brak danych do wyświetlenia")).toBeInTheDocument();
  });

  it("handles data where all values are zero safely without crashing", () => {
    const zeroData = [
      { source: "A", visitors: 0 },
      { source: "B", visitors: 0 },
    ];
    const { container } = render(<DonutChart data={zeroData} category="source" value="visitors" />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    const slices = container.querySelectorAll("path.chart-donut-slice");
    expect(slices).toHaveLength(2);
  });

  it("renders accessible table with sr-only class when caption is provided", () => {
    render(
      <DonutChart
        data={sampleData}
        category="source"
        value="visitors"
        caption="Raport kanałów pozyskiwania"
      />
    );
    const table = screen.getByRole("table");
    expect(table).toHaveClass("sr-only");
    expect(screen.getByText("Raport kanałów pozyskiwania")).toBeInTheDocument();
  });

  it("respects showLegend={false} and showTooltip={false}", () => {
    const { container } = render(
      <DonutChart
        data={sampleData}
        category="source"
        value="visitors"
        showLegend={false}
        showTooltip={false}
      />
    );
    expect(container.querySelector(".chart-legend")).not.toBeInTheDocument();
    const slice = container.querySelector("path.chart-donut-slice");
    if (slice) {
      fireEvent.mouseEnter(slice);
      expect(container.querySelector(".chart-tooltip")).not.toBeInTheDocument();
    }
  });
});
