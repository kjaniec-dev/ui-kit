import type { Meta, StoryObj } from "@storybook/react-vite";
import { DonutChart } from "./donut-chart";

const trafficSourcesData = [
  { source: "Organic Search", visitors: 4850 },
  { source: "Direct Traffic", visitors: 3120 },
  { source: "Referral", visitors: 1640 },
  { source: "Social Media", visitors: 1210 },
  { source: "Email Campaign", visitors: 780 },
];

const budgetData = [
  { category: "Badania i Rozwój", amount: 45000 },
  { category: "Marketing", amount: 32000 },
  { category: "Operacje", amount: 24000 },
  { category: "Wynagrodzenia", amount: 68000 },
  { category: "Infrastruktura", amount: 15000 },
];

const meta = {
  title: "Charts/DonutChart",
  component: DonutChart,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    innerRadius: {
      control: { type: "range", min: 0, max: 0.9, step: 0.05 },
    },
    showLegend: { control: "boolean" },
    showTooltip: { control: "boolean" },
    showA11yTable: { control: "boolean" },
  },
  args: {
    data: trafficSourcesData,
    category: "source",
    value: "visitors",
    size: "md",
    innerRadius: 0.65,
    showLegend: true,
    showTooltip: true,
    valueFormatter: (val: number) => `${val.toLocaleString()} wizyt`,
  },
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: trafficSourcesData,
    category: "source",
    value: "visitors",
  },
};

export const WithCenterLabel: Story = {
  render: (args) => {
    const total = trafficSourcesData.reduce((acc, item) => acc + item.visitors, 0);
    return (
      <div className="flex justify-center p-4">
        <DonutChart
          {...args}
          centerLabel={
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {(total / 1000).toFixed(1)}k
              </span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Wizyt
              </span>
            </div>
          }
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end justify-center gap-10 p-4">
      <div className="flex flex-col items-center">
        <span className="mb-3 text-xs font-semibold text-muted-foreground uppercase">
          Small (160px)
        </span>
        <DonutChart
          data={trafficSourcesData.slice(0, 3)}
          category="source"
          value="visitors"
          size="sm"
          centerLabel={<span className="text-xs font-bold">SM</span>}
        />
      </div>
      <div className="flex flex-col items-center">
        <span className="mb-3 text-xs font-semibold text-muted-foreground uppercase">
          Medium (220px)
        </span>
        <DonutChart
          data={trafficSourcesData.slice(0, 3)}
          category="source"
          value="visitors"
          size="md"
          centerLabel={<span className="text-sm font-bold">MD</span>}
        />
      </div>
      <div className="flex flex-col items-center">
        <span className="mb-3 text-xs font-semibold text-muted-foreground uppercase">
          Large (280px)
        </span>
        <DonutChart
          data={trafficSourcesData.slice(0, 3)}
          category="source"
          value="visitors"
          size="lg"
          centerLabel={<span className="text-base font-bold">LG</span>}
        />
      </div>
    </div>
  ),
};

export const PieChart: Story = {
  args: {
    data: trafficSourcesData,
    category: "source",
    value: "visitors",
    innerRadius: 0,
    ariaLabel: "Wykres kołowy kanałów ruchu",
  },
};

export const ThinRing: Story = {
  args: {
    data: budgetData,
    category: "category",
    value: "amount",
    innerRadius: 0.85,
    valueFormatter: (val: number) => `${val.toLocaleString()} PLN`,
    centerLabel: (
      <div className="text-center leading-tight">
        <div className="text-lg font-bold">184k</div>
        <div className="text-[10px] text-muted-foreground">Budżet</div>
      </div>
    ),
  },
};

export const CustomColors: Story = {
  args: {
    data: budgetData,
    category: "category",
    value: "amount",
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"],
    valueFormatter: (val: number) => `${(val / 1000).toFixed(0)}k PLN`,
  },
};

export const EmptyState: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 360,
        margin: "0 auto",
        border: "1px dashed var(--kj-border, #e5e7eb)",
        borderRadius: 8,
      }}
    >
      <DonutChart
        data={[]}
        category="source"
        value="visitors"
        emptyMessage="Brak zarejestrowanych konwersji w tym okresie"
      />
    </div>
  ),
};
