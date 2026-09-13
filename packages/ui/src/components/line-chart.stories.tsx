import type { Meta, StoryObj } from "@storybook/react-vite";
import { AreaChart, LineChart } from "./line-chart";

const monthlyData = [
  { month: "Sty", revenue: 45000, profit: 18000, costs: 27000 },
  { month: "Lut", revenue: 52000, profit: 22000, costs: 30000 },
  { month: "Mar", revenue: 48000, profit: 19000, costs: 29000 },
  { month: "Kwi", revenue: 61000, profit: 26000, costs: 35000 },
  { month: "Maj", revenue: 58000, profit: 24000, costs: 34000 },
  { month: "Cze", revenue: 74000, profit: 33000, costs: 41000 },
  { month: "Lip", revenue: 82000, profit: 39000, costs: 43000 },
  { month: "Sie", revenue: 79000, profit: 36000, costs: 43000 },
  { month: "Wrz", revenue: 88000, profit: 42000, costs: 46000 },
];

const standardSeries = [
  { key: "revenue", label: "Przychód", color: "chart1" as const },
  { key: "profit", label: "Zysk netto", color: "chart2" as const },
  { key: "costs", label: "Koszty", color: "chart4" as const },
];

const meta = {
  title: "Charts/LineChart",
  component: LineChart,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["line", "area"],
    },
    curve: {
      control: "inline-radio",
      options: ["linear", "smooth", "step"],
    },
    showGrid: { control: "boolean" },
    showXAxis: { control: "boolean" },
    showYAxis: { control: "boolean" },
    showLegend: { control: "boolean" },
    showTooltip: { control: "boolean" },
    showDots: { control: "boolean" },
    showGradient: { control: "boolean" },
    strokeWidth: { control: "number" },
    height: { control: "number" },
  },
  args: {
    data: monthlyData,
    index: "month",
    series: standardSeries,
    variant: "line",
    curve: "smooth",
    showGrid: true,
    showXAxis: true,
    showYAxis: true,
    showLegend: true,
    showTooltip: true,
    showDots: false,
    showGradient: true,
    strokeWidth: 2,
    height: 300,
    valueFormatter: (val: number) => `${(val / 1000).toFixed(0)}k PLN`,
  },
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: monthlyData,
    index: "month",
    series: standardSeries,
  },
};

export const AreaVariant: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <AreaChart
        data={monthlyData}
        index="month"
        series={[
          { key: "revenue", label: "Przychód", color: "chart1" },
          { key: "profit", label: "Zysk", color: "chart2" },
        ]}
        curve="smooth"
        valueFormatter={(val) => `${(val / 1000).toFixed(0)}k zł`}
        height={320}
      />
    </div>
  ),
};

export const CurveStyles: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 720 }}>
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          Smooth Curve (Cubic Bézier)
        </h4>
        <LineChart
          data={monthlyData}
          index="month"
          series={standardSeries}
          curve="smooth"
          height={240}
        />
      </div>

      <div>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Linear Polyline</h4>
        <LineChart
          data={monthlyData}
          index="month"
          series={standardSeries}
          curve="linear"
          height={240}
        />
      </div>

      <div>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Step Transitions</h4>
        <LineChart
          data={monthlyData}
          index="month"
          series={standardSeries}
          curve="step"
          height={240}
        />
      </div>
    </div>
  ),
};

export const SingleSeriesWithDots: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <AreaChart
        data={monthlyData}
        index="month"
        series={[{ key: "revenue", label: "Przychód", color: "chart3" }]}
        curve="smooth"
        showDots
        valueFormatter={(v) => `${v.toLocaleString()} zł`}
        height={260}
      />
    </div>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <div style={{ maxWidth: 500, border: "1px dashed var(--kj-border, #e5e7eb)", borderRadius: 8 }}>
      <LineChart
        data={[]}
        index="month"
        series={standardSeries}
        emptyMessage="Brak danych historycznych dla wybranego okresu"
        height={220}
      />
    </div>
  ),
};
