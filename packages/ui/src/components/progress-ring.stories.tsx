import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressRing, ProgressRingField } from "./progress-ring";

const meta = {
  title: "Status/ProgressRing",
  component: ProgressRing,
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    min: { control: "number" },
    max: { control: "number" },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "xl"],
    },
    tone: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "danger", "info"],
    },
    strokeWidth: { control: "number" },
    showValue: { control: "boolean" },
  },
  args: {
    value: 65,
    size: "md",
    tone: "primary",
    showValue: true,
  },
} satisfies Meta<typeof ProgressRing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 65,
    showValue: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ textAlign: "center" }}>
        <ProgressRing value={75} size="sm" showValue />
        <p style={{ marginTop: 8, fontSize: 12 }}>Small (sm)</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <ProgressRing value={75} size="md" showValue />
        <p style={{ marginTop: 8, fontSize: 12 }}>Medium (md)</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <ProgressRing value={75} size="lg" showValue />
        <p style={{ marginTop: 8, fontSize: 12 }}>Large (lg)</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <ProgressRing value={75} size="xl" showValue />
        <p style={{ marginTop: 8, fontSize: 12 }}>Extra Large (xl)</p>
      </div>
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
      <ProgressRing value={60} tone="primary" showValue />
      <ProgressRing value={60} tone="secondary" showValue />
      <ProgressRing value={60} tone="success" showValue />
      <ProgressRing value={60} tone="warning" showValue />
      <ProgressRing value={60} tone="danger" showValue />
      <ProgressRing value={60} tone="info" showValue />
    </div>
  ),
};

export const CustomFormatting: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <ProgressRing
        value={3}
        max={5}
        size="lg"
        tone="success"
        formatValue={(val) => (
          <span style={{ fontSize: 14, fontWeight: "bold" }}>{val} / 5</span>
        )}
      />
      <ProgressRing
        value={80}
        size="lg"
        tone="info"
        formatValue={(val) => (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 16, fontWeight: "bold" }}>{val}GB</span>
            <span style={{ fontSize: 10, opacity: 0.7 }}>of 100GB</span>
          </div>
        )}
      />
      <ProgressRing value={100} size="lg" tone="success">
        <span style={{ fontSize: 20 }}>✓</span>
      </ProgressRing>
    </div>
  ),
};

export const FieldWrapper: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 320 }}>
      <ProgressRingField
        label="Storage Limit"
        hint="75% of your allocated disk storage used"
        value={75}
        size="lg"
        tone="warning"
        showValue
      />
      <ProgressRingField
        label="Upload Progress"
        error="Upload failed at 45%"
        value={45}
        size="lg"
        tone="danger"
        showValue
      />
    </div>
  ),
};
