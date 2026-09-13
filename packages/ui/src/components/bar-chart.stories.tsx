import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart } from "./bar-chart";

const monthlyData = [
  { month: "Sty", revenue: 45000, expenses: 27000 },
  { month: "Lut", revenue: 52000, expenses: 30000 },
  { month: "Mar", revenue: 48000, expenses: 29000 },
  { month: "Kwi", revenue: 61000, expenses: 35000 },
  { month: "Maj", revenue: 58000, expenses: 34000 },
  { month: "Cze", revenue: 74000, expenses: 41000 },
];

const categoryData = [
  { product: "Elektronika", q1: 120, q2: 150, q3: 180 },
  { product: "Odzież", q1: 90, q2: 110, q3: 130 },
  { product: "Książki", q1: 60, q2: 75, q3: 85 },
  { product: "Dom i Ogród", q1: 80, q2: 95, q3: 115 },
];

const standardSeries = [
  { key: "revenue", label: "Przychód", color: "chart1" as const },
  { key: "expenses", label: "Koszty", color: "chart4" as const },
];

const quarterlySeries = [
  { key: "q1", label: "Q1", color: "chart2" as const },
  { key: "q2", label: "Q2", color: "chart3" as const },
  { key: "q3", label: "Q3", color: "chart5" as const },
];

const meta = {
  title: "Charts/BarChart",
  component: BarChart,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["grouped", "stacked"],
    },
    layout: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
    },
    radius: { control: "number" },
    showGrid: { control: "boolean" },
    showXAxis: { control: "boolean" },
    showYAxis: { control: "boolean" },
    showLegend: { control: "boolean" },
    showTooltip: { control: "boolean" },
    height: { control: "number" },
  },
  args: {
    data: monthlyData,
    index: "month",
    series: standardSeries,
    type: "grouped",
    layout: "vertical",
    radius: 4,
    showGrid: true,
    showXAxis: true,
    showYAxis: true,
    showLegend: true,
    showTooltip: true,
    height: 300,
    valueFormatter: (val: number) => `${(val / 1000).toFixed(0)}k PLN`,
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: monthlyData,
    index: "month",
    series: standardSeries,
  },
};

export const Stacked: Story = {
  args: {
    data: monthlyData,
    index: "month",
    series: standardSeries,
    type: "stacked",
  },
};

export const Horizontal: Story = {
  args: {
    data: categoryData,
    index: "product",
    series: quarterlySeries,
    layout: "horizontal",
    valueFormatter: (val: number) => `${val} szt.`,
    height: 320,
  },
};

export const HorizontalStacked: Story = {
  args: {
    data: categoryData,
    index: "product",
    series: quarterlySeries,
    layout: "horizontal",
    type: "stacked",
    valueFormatter: (val: number) => `${val} szt.`,
    height: 320,
  },
};

export const CustomRadius: Story = {
  args: {
    data: monthlyData,
    index: "month",
    series: standardSeries,
    radius: 8,
  },
};

export const EmptyState: Story = {
  render: () => (
    <div style={{ maxWidth: 500, border: "1px dashed var(--kj-border, #e5e7eb)", borderRadius: 8 }}>
      <BarChart
        data={[]}
        index="month"
        series={standardSeries}
        emptyMessage="Brak danych historycznych dla wybranego okresu"
        height={220}
      />
    </div>
  ),
};
