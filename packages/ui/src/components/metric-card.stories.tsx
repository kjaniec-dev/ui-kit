import type { Meta, StoryObj } from "@storybook/react";
import { MetricCard } from "./metric-card";

const meta = {
  title: "Layout/MetricCard",
  component: MetricCard,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    value: { control: "text" },
    trend: { control: "text" },
    trendDirection: {
      control: "select",
      options: ["up", "down", "neutral"],
    },
    description: { control: "text" },
  },
  args: {
    title: "Monthly Recurring Revenue",
    value: "$14,892.40",
    trend: "+12.4%",
    trendDirection: "up",
    description: "Compared to $13,240.00 last month",
  },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Growth: Story = {};

export const Shrinkage: Story = {
  args: {
    title: "Churn Rate",
    value: "4.82%",
    trend: "-0.9%",
    trendDirection: "down",
    description: "Industry benchmark is 5.0%",
  },
};

export const Neutral: Story = {
  args: {
    title: "Active Sessions",
    value: "2,948",
    trend: "0.0%",
    trendDirection: "neutral",
    description: "Updated 5 minutes ago",
  },
};

export const GridDemo: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
      <MetricCard
        title="Revenue"
        value="$48,259.00"
        trend="+8.2%"
        trendDirection="up"
        description="Total sales this quarter"
      />
      <MetricCard
        title="Conversion Rate"
        value="2.42%"
        trend="-0.1%"
        trendDirection="down"
        description="Compared to 2.52% last week"
      />
      <MetricCard
        title="API Requests"
        value="1.2M"
        trend="+24.1%"
        trendDirection="up"
        description="Scale limit: 2.0M requests"
      />
    </div>
  ),
};
