# Sprint 5: Data Visualization Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a lightweight, zero-dependency, WCAG AA compliant Data Visualization component family (`Sparkline`, `LineChart`, `AreaChart`, `BarChart`, `DonutChart`) in `@kjaniec-dev/ui`, styled using the `--kj-chart1`–`--kj-chart6` color palette, and showcase it in `site/`.

**Architecture:** A modular geometry engine (`chart-math.ts`) calculates scales, Bézier/cubic curve commands, bar geometry, and arc paths. Shared primitives (`chart-primitives.tsx`) handle responsive SVG layout, background grids, axes, HTML overlay tooltips, interactive legends, and hidden semantic tables (`sr-only`) for screen reader a11y. High-level components (`Sparkline`, `LineChart`, `AreaChart`, `BarChart`, `DonutChart`) provide clean, Tremor/Recharts-like tabular APIs.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Vitest, `@testing-library/react`, Storybook 10.

**Spec:** [`docs/superpowers/specs/2026-09-13-sprint-5-data-visualization-design.md`](file:///Volumes/kjdisk/projects/kj-product-kit-starter/docs/superpowers/specs/2026-09-13-sprint-5-data-visualization-design.md)

## Global Constraints
- Zero external runtime dependencies added to `packages/ui` (use native React + SVG math + Tailwind CSS tokens).
- Color series must default to `--kj-chart1` through `--kj-chart6` (with `var(--kj-chartN)` CSS variable support and fallback).
- Dostępność (a11y): SVG elements must have `role="img"`, accessible `aria-label`, and render a hidden semantic `table.sr-only` for screen readers.
- Code style: Must pass Biome lint (`npm run lint`) and TypeScript typecheck (`npm run typecheck`) with zero warnings/errors.
- TDD: Every component must have a comprehensive Vitest `.test.tsx` test suite verifying rendering, edge cases (empty data, zeros), formatting, and interaction.

---

### Task 1: Geometry Math Engine (`chart-math.ts` + `chart-math.test.ts`)

**Files:**
- Create: `packages/ui/src/components/chart-math.ts`
- Create: `packages/ui/src/components/chart-math.test.ts`

**Interfaces:**
- Produces:
  - `getNiceScale(min: number, max: number, tickCount?: number): { min: number; max: number; ticks: number[] }`
  - `linearScale(val: number, domain: [number, number], range: [number, number]): number`
  - `generateLinePath(points: Array<{ x: number; y: number }>, curve?: "linear" | "smooth" | "step"): string`
  - `generateAreaPath(points: Array<{ x: number; y: number }>, baselineY: number, curve?: "linear" | "smooth" | "step"): string`
  - `calculateBarLayout(options: BarLayoutOptions): BarRect[]`
  - `calculateDonutSegments(slices: DonutSliceInput[], options: DonutOptions): DonutSegment[]`

- [ ] **Step 1: Write unit tests for geometry math engine (`chart-math.test.ts`)**

```typescript
import { describe, expect, it } from "vitest";
import {
  calculateBarLayout,
  calculateDonutSegments,
  generateAreaPath,
  generateLinePath,
  getNiceScale,
  linearScale,
} from "./chart-math";

describe("chart-math", () => {
  describe("getNiceScale", () => {
    it("generates clean round ticks for standard ranges", () => {
      const scale = getNiceScale(0, 95, 5);
      expect(scale.min).toBe(0);
      expect(scale.max).toBe(100);
      expect(scale.ticks).toEqual([0, 20, 40, 60, 80, 100]);
    });

    it("handles identical min and max gracefully", () => {
      const scale = getNiceScale(50, 50, 4);
      expect(scale.min).toBeLessThanOrEqual(50);
      expect(scale.max).toBeGreaterThanOrEqual(50);
      expect(scale.ticks.length).toBeGreaterThan(1);
    });

    it("handles all-zero input", () => {
      const scale = getNiceScale(0, 0, 4);
      expect(scale.min).toBe(0);
      expect(scale.max).toBe(1);
      expect(scale.ticks).toContain(0);
    });
  });

  describe("linearScale", () => {
    it("maps domain values to range accurately", () => {
      expect(linearScale(50, [0, 100], [0, 200])).toBe(100);
      expect(linearScale(0, [0, 100], [200, 0])).toBe(200);
      expect(linearScale(100, [0, 100], [200, 0])).toBe(0);
    });
  });

  describe("generateLinePath & generateAreaPath", () => {
    const points = [
      { x: 0, y: 100 },
      { x: 50, y: 50 },
      { x: 100, y: 80 },
    ];

    it("generates linear SVG path", () => {
      const path = generateLinePath(points, "linear");
      expect(path).toBe("M 0 100 L 50 50 L 100 80");
    });

    it("generates smooth SVG path without NaN", () => {
      const path = generateLinePath(points, "smooth");
      expect(path).toContain("M 0 100");
      expect(path).toContain("C");
      expect(path).not.toContain("NaN");
    });

    it("generates area path closed to baseline", () => {
      const path = generateAreaPath(points, 200, "linear");
      expect(path).toBe("M 0 100 L 50 50 L 100 80 L 100 200 L 0 200 Z");
    });

    it("returns empty string for empty points array", () => {
      expect(generateLinePath([])).toBe("");
      expect(generateAreaPath([], 100)).toBe("");
    });
  });

  describe("calculateBarLayout", () => {
    it("calculates grouped bar rectangles correctly", () => {
      const bars = calculateBarLayout({
        dataCount: 2,
        seriesCount: 2,
        plotWidth: 200,
        plotHeight: 100,
        yDomain: [0, 100],
        data: [
          { group: 0, seriesIndex: 0, value: 50 },
          { group: 0, seriesIndex: 1, value: 80 },
          { group: 1, seriesIndex: 0, value: 30 },
          { group: 1, seriesIndex: 1, value: 60 },
        ],
        mode: "grouped",
      });
      expect(bars).toHaveLength(4);
      expect(bars[0].width).toBeGreaterThan(0);
      expect(bars[0].height).toBe(50);
      expect(bars[1].height).toBe(80);
    });
  });

  describe("calculateDonutSegments", () => {
    it("calculates donut arc slices totaling 360 degrees", () => {
      const segments = calculateDonutSegments(
        [
          { label: "A", value: 30 },
          { label: "B", value: 70 },
        ],
        { cx: 100, cy: 100, innerRadius: 40, outerRadius: 80 }
      );
      expect(segments).toHaveLength(2);
      expect(segments[0].percentage).toBe(30);
      expect(segments[1].percentage).toBe(70);
      expect(segments[0].path).toContain("M");
      expect(segments[0].path).toContain("A");
      expect(segments[0].path).toContain("Z");
    });
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test packages/ui/src/components/chart-math.test.ts`
Expected: FAIL with missing module `./chart-math`.

- [ ] **Step 3: Implement geometry calculations in `chart-math.ts`**

Create `packages/ui/src/components/chart-math.ts` implementing `getNiceScale`, `linearScale`, `generateLinePath`, `generateAreaPath`, `calculateBarLayout`, and `calculateDonutSegments`.

- [ ] **Step 4: Run test to verify all pass**

Run: `npm test packages/ui/src/components/chart-math.test.ts`
Expected: PASS (all tests green).

- [ ] **Step 5: Commit Task 1**

```bash
git add packages/ui/src/components/chart-math.ts packages/ui/src/components/chart-math.test.ts
git commit -m "feat(ui): implement pure math geometry engine for data visualization"
```

---

### Task 2: Shared Chart Primitives & A11y Table (`chart-primitives.tsx`)

**Files:**
- Create: `packages/ui/src/components/chart-primitives.tsx`
- Create: `packages/ui/src/components/chart-primitives.test.tsx`

**Interfaces:**
- Consumes: `chart-math.ts`
- Produces:
  - `ChartContainer`: responsive container with `svg viewBox` and `relative` positioning for overlays.
  - `ChartGrid`: background horizontal & vertical dashed reference lines.
  - `ChartXAxis` & `ChartYAxis`: SVG text labels with `valueFormatter`.
  - `ChartTooltip`: absolute floating HTML tooltip card with series indicators and crosshair line.
  - `ChartLegend`: list of series labels with colored indicator dots and optional click-toggle.
  - `ChartA11yTable`: hidden semantic table (`sr-only`) with `<caption>`, `<thead>`, `<tbody>`.
  - `CHART_COLOR_VARS`: color token map for `chart1`–`chart6`.

- [ ] **Step 1: Write tests for primitives (`chart-primitives.test.tsx`)**

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ChartA11yTable,
  ChartContainer,
  ChartGrid,
  ChartLegend,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
} from "./chart-primitives";

describe("Chart Primitives", () => {
  it("renders ChartContainer with SVG and accessible role", () => {
    render(
      <ChartContainer width={400} height={200} aria-label="Test Chart">
        <rect width={100} height={100} />
      </ChartContainer>
    );
    expect(screen.getByRole("img", { name: "Test Chart" })).toBeInTheDocument();
  });

  it("renders ChartGrid lines", () => {
    const { container } = render(
      <svg>
        <ChartGrid yTicks={[0, 50, 100]} width={300} scaleY={(v) => 100 - v} />
      </svg>
    );
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBe(3);
  });

  it("renders ChartXAxis and ChartYAxis labels", () => {
    render(
      <svg>
        <ChartXAxis
          ticks={[{ value: "Jan", x: 20 }, { value: "Feb", x: 80 }]}
          y={150}
        />
        <ChartYAxis
          ticks={[{ value: 0, y: 100 }, { value: 100, y: 0 }]}
          x={30}
          formatter={(v) => `${v}%`}
        />
      </svg>
    );
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

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
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test packages/ui/src/components/chart-primitives.test.tsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `chart-primitives.tsx`**

Implement `ChartContainer`, `ChartGrid`, `ChartXAxis`, `ChartYAxis`, `ChartTooltip`, `ChartLegend`, and `ChartA11yTable`. Map color tokens to `var(--kj-chart1)` ... `var(--kj-chart6)`.

- [ ] **Step 4: Run test to verify pass**

Run: `npm test packages/ui/src/components/chart-primitives.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add packages/ui/src/components/chart-primitives.tsx packages/ui/src/components/chart-primitives.test.tsx
git commit -m "feat(ui): add accessible SVG chart primitives and HTML tooltip overlay"
```

---

### Task 3: `Sparkline` Component (`sparkline.tsx`)

**Files:**
- Create: `packages/ui/src/components/sparkline.tsx`
- Create: `packages/ui/src/components/sparkline.test.tsx`
- Create: `packages/ui/src/components/sparkline.stories.tsx`

**Interfaces:**
- Consumes: `chart-math.ts`, `chart-primitives.tsx`
- Produces:
  - `<Sparkline data={[10, 20, 15, 30]} variant="line" | "area" | "bar" color="chart1" height={36} showEndDot />`

- [ ] **Step 1: Write tests for `Sparkline` (`sparkline.test.tsx`)**

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sparkline } from "./sparkline";

describe("Sparkline", () => {
  const data = [10, 25, 18, 40, 32, 55];

  it("renders an SVG line sparkline", () => {
    const { container } = render(<Sparkline data={data} aria-label="Revenue Trend" />);
    expect(screen.getByRole("img", { name: "Revenue Trend" })).toBeInTheDocument();
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
  });

  it("renders area variant with closed polygon fill", () => {
    const { container } = render(<Sparkline data={data} variant="area" />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThanOrEqual(2); // line + area fill
  });

  it("renders bar variant with rect elements", () => {
    const { container } = render(<Sparkline data={data} variant="bar" />);
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBe(data.length);
  });

  it("renders highlight dot on last point when showEndDot is true", () => {
    const { container } = render(<Sparkline data={data} showEndDot />);
    const circle = container.querySelector("circle");
    expect(circle).toBeInTheDocument();
  });

  it("renders fallback when data is empty", () => {
    render(<Sparkline data={[]} aria-label="Empty Trend" />);
    expect(screen.getByRole("img", { name: "Empty Trend" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test packages/ui/src/components/sparkline.test.tsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `sparkline.tsx` and storybook stories `sparkline.stories.tsx`**

Implement `Sparkline` with line, area, and bar modes, smooth curve generation, custom stroke width, gradient fill, and end dot.

- [ ] **Step 4: Run test to verify pass**

Run: `npm test packages/ui/src/components/sparkline.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```bash
git add packages/ui/src/components/sparkline.tsx packages/ui/src/components/sparkline.test.tsx packages/ui/src/components/sparkline.stories.tsx
git commit -m "feat(ui): add compact Sparkline component with line, area, and bar modes"
```

---

### Task 4: `LineChart` and `AreaChart` (`line-chart.tsx`)

**Files:**
- Create: `packages/ui/src/components/line-chart.tsx`
- Create: `packages/ui/src/components/line-chart.test.tsx`
- Create: `packages/ui/src/components/line-chart.stories.tsx`

**Interfaces:**
- Consumes: `chart-math.ts`, `chart-primitives.tsx`
- Produces:
  - `<LineChart data={data} index="date" series={series} />`
  - `<AreaChart data={data} index="date" series={series} />`

- [ ] **Step 1: Write tests for `LineChart` and `AreaChart` (`line-chart.test.tsx`)**

```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AreaChart, LineChart } from "./line-chart";

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
      <LineChart
        data={sampleData}
        index="date"
        series={sampleSeries}
        showTooltip
      />
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
      <AreaChart
        data={sampleData}
        index="date"
        series={sampleSeries}
      />
    );
    expect(container.querySelectorAll("path.chart-area")).toHaveLength(2);
  });

  it("renders empty message when data is empty", () => {
    render(
      <LineChart
        data={[]}
        index="date"
        series={sampleSeries}
        emptyMessage="Brak danych"
      />
    );
    expect(screen.getByText("Brak danych")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test packages/ui/src/components/line-chart.test.tsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `line-chart.tsx` and stories `line-chart.stories.tsx`**

Implement `LineChart`, export `AreaChart` alias, handle auto-scaling, tooltip interaction on mousemove/touch, gradient defs, and accessible hidden table.

- [ ] **Step 4: Run test to verify pass**

Run: `npm test packages/ui/src/components/line-chart.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit Task 4**

```bash
git add packages/ui/src/components/line-chart.tsx packages/ui/src/components/line-chart.test.tsx packages/ui/src/components/line-chart.stories.tsx
git commit -m "feat(ui): add LineChart and AreaChart components with interactive tooltips and a11y"
```

---

### Task 5: `BarChart` Component (`bar-chart.tsx`)

**Files:**
- Create: `packages/ui/src/components/bar-chart.tsx`
- Create: `packages/ui/src/components/bar-chart.test.tsx`
- Create: `packages/ui/src/components/bar-chart.stories.tsx`

**Interfaces:**
- Consumes: `chart-math.ts`, `chart-primitives.tsx`
- Produces:
  - `<BarChart data={data} index="category" series={series} type="grouped" | "stacked" layout="vertical" | "horizontal" />`

- [ ] **Step 1: Write tests for `BarChart` (`bar-chart.test.tsx`)**

```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart } from "./bar-chart";

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
      <BarChart
        data={sampleData}
        index="category"
        series={sampleSeries}
        type="stacked"
      />
    );
    const rects = container.querySelectorAll("rect.chart-bar");
    expect(rects).toHaveLength(4);
  });

  it("shows tooltip on bar hover", () => {
    const { container } = render(
      <BarChart
        data={sampleData}
        index="category"
        series={sampleSeries}
        showTooltip
      />
    );
    const bar = container.querySelector("rect.chart-bar");
    if (bar) {
      fireEvent.mouseEnter(bar);
      expect(container.querySelector(".chart-tooltip")).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test packages/ui/src/components/bar-chart.test.tsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `bar-chart.tsx` and stories `bar-chart.stories.tsx`**

Implement `BarChart` supporting `grouped` and `stacked` modes, `vertical` and `horizontal` orientations, rounded bar corners, tooltips, legend, and accessibility table.

- [ ] **Step 4: Run test to verify pass**

Run: `npm test packages/ui/src/components/bar-chart.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit Task 5**

```bash
git add packages/ui/src/components/bar-chart.tsx packages/ui/src/components/bar-chart.test.tsx packages/ui/src/components/bar-chart.stories.tsx
git commit -m "feat(ui): add BarChart with grouped and stacked modes and responsive orientation"
```

---

### Task 6: `DonutChart` Component (`donut-chart.tsx`)

**Files:**
- Create: `packages/ui/src/components/donut-chart.tsx`
- Create: `packages/ui/src/components/donut-chart.test.tsx`
- Create: `packages/ui/src/components/donut-chart.stories.tsx`

**Interfaces:**
- Consumes: `chart-math.ts`, `chart-primitives.tsx`
- Produces:
  - `<DonutChart data={data} category="name" value="amount" centerLabel={...} size="md" />`

- [ ] **Step 1: Write tests for `DonutChart` (`donut-chart.test.tsx`)**

```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DonutChart } from "./donut-chart";

const sampleData = [
  { source: "Organic", visitors: 450 },
  { source: "Direct", visitors: 300 },
  { source: "Referral", visitors: 150 },
];

describe("DonutChart", () => {
  it("renders donut slices with SVG paths and legend", () => {
    const { container } = render(
      <DonutChart
        data={sampleData}
        category="source"
        value="visitors"
        aria-label="Kanały Ruchu"
      />
    );
    expect(screen.getByRole("img", { name: "Kanały Ruchu" })).toBeInTheDocument();
    expect(screen.getByText("Organic")).toBeInTheDocument();
    expect(screen.getByText("Direct")).toBeInTheDocument();
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
      <DonutChart
        data={sampleData}
        category="source"
        value="visitors"
        showTooltip
      />
    );
    const slice = container.querySelector("path.chart-donut-slice");
    if (slice) {
      fireEvent.mouseEnter(slice);
      expect(container.querySelector(".chart-tooltip")).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test packages/ui/src/components/donut-chart.test.tsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `donut-chart.tsx` and stories `donut-chart.stories.tsx`**

Implement `DonutChart` with arc slices, center content slot, hover highlights, interactive legend, and a11y table.

- [ ] **Step 4: Run test to verify pass**

Run: `npm test packages/ui/src/components/donut-chart.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit Task 6**

```bash
git add packages/ui/src/components/donut-chart.tsx packages/ui/src/components/donut-chart.test.tsx packages/ui/src/components/donut-chart.stories.tsx
git commit -m "feat(ui): add DonutChart with center label slot and interactive segment slices"
```

---

### Task 7: Package Exports & MCP Extraction

**Files:**
- Modify: `packages/ui/src/index.ts`
- Run extractor: `packages/mcp`

- [ ] **Step 1: Export all chart components and types in `packages/ui/src/index.ts`**

Export `Sparkline`, `LineChart`, `AreaChart`, `BarChart`, `DonutChart`, `ChartContainer`, `ChartGrid`, `ChartXAxis`, `ChartYAxis`, `ChartTooltip`, `ChartLegend`, and their TypeScript props interfaces and types (`ChartSeries`, `ChartColor`, `ChartMargin`).

- [ ] **Step 2: Verify `packages/ui` builds cleanly**

Run: `npm run build --workspace=@kjaniec-dev/ui`
Expected: Code 0, `.d.ts` and `.js` bundles generated without error.

- [ ] **Step 3: Update MCP components data**

Run: `npm run mcp:extract` (or `npm run build --workspace=@kjaniec-dev/mcp`)
Expected: `packages/mcp/data/components.json` updated with the new chart components.

- [ ] **Step 4: Commit Task 7**

```bash
git add packages/ui/src/index.ts packages/mcp/data/components.json
git commit -m "chore(ui): export data visualization components and update MCP catalog"
```

---

### Task 8: Showcase Integration (`site/`)

**Files:**
- Create: `site/src/sections/charts.tsx`
- Modify: `site/src/views/components-view.tsx`
- Modify: `site/src/views/components-view.test.tsx`

- [ ] **Step 1: Create `site/src/sections/charts.tsx` showcasing interactive chart examples**
  - Section 1: KPI Cards with embedded `Sparkline` (Revenue with area sparkline, Active Users with bar sparkline, Conversion with line sparkline).
  - Section 2: `LineChart` & `AreaChart` with time period toggle (7D, 30D, 90D).
  - Section 3: `BarChart` comparing sales by department with grouped / stacked toggle.
  - Section 4: `DonutChart` showing traffic sources breakdown with center summary stat.

- [ ] **Step 2: Register `data-visualization` in `site/src/views/components-view.tsx`**
  - Add to `COMPONENT_CATEGORIES`:
    `{ id: "data-visualization", name: "Data Visualization", count: 4, keywords: ["chart", "sparkline", "line-chart", "area-chart", "bar-chart", "donut-chart", "wykres"] }`
  - Render `<ChartsSection />` in the component view body.

- [ ] **Step 3: Update and run tests in `site/`**

Run: `npm test site/src/views/components-view.test.tsx`
Expected: PASS.

- [ ] **Step 4: Verify full monorepo health**

Run:
1. `npm run lint` -> Biome 0 errors
2. `npm run typecheck` -> TypeScript 0 errors
3. `npm test` -> 100% tests passing across all packages

- [ ] **Step 5: Commit Task 8**

```bash
git add site/src/sections/charts.tsx site/src/views/components-view.tsx site/src/views/components-view.test.tsx
git commit -m "feat(site): add Data Visualization section with interactive charts in showcase"
```
