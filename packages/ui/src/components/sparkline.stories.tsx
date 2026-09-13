import type { Meta, StoryObj } from "@storybook/react-vite";
import { MetricCard } from "./metric-card";
import { Sparkline } from "./sparkline";

const sampleData = [12, 18, 15, 26, 22, 35, 30, 48, 42, 58];
const trendUpData = [10, 15, 14, 24, 28, 32, 45, 52, 60];
const trendDownData = [65, 58, 60, 48, 42, 38, 30, 24, 18];

const meta = {
  title: "Charts/Sparkline",
  component: Sparkline,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["line", "area", "bar"],
    },
    curve: {
      control: "inline-radio",
      options: ["smooth", "linear"],
    },
    color: {
      control: "select",
      options: ["chart1", "chart2", "chart3", "chart4", "chart5", "chart6"],
    },
    strokeWidth: { control: "number" },
    showEndDot: { control: "boolean" },
    showGradient: { control: "boolean" },
    height: { control: "number" },
    barRadius: { control: "number" },
    barPadding: { control: "number" },
  },
  args: {
    data: sampleData,
    variant: "line",
    curve: "smooth",
    color: "chart1",
    strokeWidth: 2,
    showEndDot: true,
    showGradient: true,
    height: 36,
  },
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: sampleData,
    variant: "line",
    showEndDot: true,
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 360 }}>
      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 6,
            color: "var(--kj-foreground, #111)",
          }}
        >
          Line Variant (with End Dot)
        </p>
        <div
          style={{ border: "1px solid var(--kj-border, #e5e7eb)", borderRadius: 8, padding: 12 }}
        >
          <Sparkline data={sampleData} variant="line" color="chart1" showEndDot height={40} />
        </div>
      </div>

      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 6,
            color: "var(--kj-foreground, #111)",
          }}
        >
          Area Variant (with Gradient)
        </p>
        <div
          style={{ border: "1px solid var(--kj-border, #e5e7eb)", borderRadius: 8, padding: 12 }}
        >
          <Sparkline data={sampleData} variant="area" color="chart2" showGradient height={40} />
        </div>
      </div>

      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 6,
            color: "var(--kj-foreground, #111)",
          }}
        >
          Bar Variant
        </p>
        <div
          style={{ border: "1px solid var(--kj-border, #e5e7eb)", borderRadius: 8, padding: 12 }}
        >
          <Sparkline data={sampleData} variant="bar" color="chart3" height={40} barRadius={2} />
        </div>
      </div>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 640 }}>
      {(["chart1", "chart2", "chart3", "chart4", "chart5", "chart6"] as const).map((c) => (
        <div
          key={c}
          style={{
            border: "1px solid var(--kj-border, #e5e7eb)",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <p
            style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "capitalize" }}
          >
            {c}
          </p>
          <Sparkline data={sampleData} variant="area" color={c} height={36} showEndDot />
        </div>
      ))}
    </div>
  ),
};

export const CurveComparison: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, maxWidth: 500 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Smooth (Cubic Bézier)</p>
        <div
          style={{ border: "1px solid var(--kj-border, #e5e7eb)", borderRadius: 8, padding: 12 }}
        >
          <Sparkline data={sampleData} curve="smooth" color="chart1" height={44} showEndDot />
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Linear (Polyline)</p>
        <div
          style={{ border: "1px solid var(--kj-border, #e5e7eb)", borderRadius: 8, padding: 12 }}
        >
          <Sparkline data={sampleData} curve="linear" color="chart4" height={44} showEndDot />
        </div>
      </div>
    </div>
  ),
};

export const InMetricCards: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 840 }}>
      <div style={{ position: "relative" }}>
        <MetricCard
          title="Revenue"
          value="$48,250"
          trend="+18.2%"
          trendDirection="up"
          description="vs. previous 30 days"
        />
        <div style={{ padding: "0 24px 16px" }}>
          <Sparkline data={trendUpData} variant="area" color="chart2" height={36} showEndDot />
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <MetricCard
          title="Active Users"
          value="1,420"
          trend="+6.4%"
          trendDirection="up"
          description="Daily active sessions"
        />
        <div style={{ padding: "0 24px 16px" }}>
          <Sparkline data={sampleData} variant="bar" color="chart3" height={36} barRadius={2} />
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <MetricCard
          title="Bounce Rate"
          value="24.8%"
          trend="-4.1%"
          trendDirection="down"
          description="Lower is better"
        />
        <div style={{ padding: "0 24px 16px" }}>
          <Sparkline data={trendDownData} variant="line" color="chart5" height={36} showEndDot />
        </div>
      </div>
    </div>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 300,
        border: "1px solid var(--kj-border, #e5e7eb)",
        borderRadius: 8,
        padding: 12,
      }}
    >
      <p style={{ fontSize: 12, color: "var(--kj-muted-foreground, #6b7280)", marginBottom: 8 }}>
        No historical data recorded
      </p>
      <Sparkline data={[]} height={36} aria-label="Empty Trend" />
    </div>
  ),
};
