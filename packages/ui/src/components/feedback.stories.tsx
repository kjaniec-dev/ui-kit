import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Progress } from "./progress";
import { Spinner } from "./spinner";

const meta = {
  title: "Status/Feedback",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    tone: { control: "inline-radio", options: ["primary", "secondary"] },
  },
  args: { value: 64, tone: "primary" },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProgressBar: Story = {
  render: (args) => (
    <div style={{ width: 360 }}>
      <Progress {...args} />
    </div>
  ),
};

export const ProgressTones: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 360 }}>
      <Progress value={42} tone="primary" />
      <Progress value={68} tone="secondary" />
    </div>
  ),
};

export const Animated: Story = {
  render: () => {
    const [v, setV] = React.useState(20);
    React.useEffect(() => {
      const t = setInterval(() => setV((p) => (p >= 96 ? 20 : p + 12)), 900);
      return () => clearInterval(t);
    }, []);
    return (
      <div style={{ width: 360 }}>
        <Progress value={v} />
      </div>
    );
  },
};

export const Spinners: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <Spinner size={18} />
      <Spinner size={24} />
      <Spinner size={36} />
    </div>
  ),
};
