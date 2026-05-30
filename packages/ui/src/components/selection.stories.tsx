import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Checkbox, Radio } from "./checkbox";
import { Switch } from "./switch";
import { Slider } from "./slider";
import { Segmented } from "./segmented";

const meta = {
  title: "Selection/Controls",
  component: Checkbox,
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Checkboxes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Checkbox defaultChecked label="Email notifications" />
      <Checkbox label="Weekly report" />
      <Checkbox disabled label="Unavailable option" />
    </div>
  ),
};

export const Radios: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Radio name="plan" defaultChecked label="Monthly plan" />
      <Radio name="plan" label="Annual plan" />
      <Radio name="plan" label="Lifetime plan" />
    </div>
  ),
};

export const Switches: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Switch defaultChecked label="Dark mode for new users" />
      <Switch label="Automatic backups" />
    </div>
  ),
};

export const SliderControl: Story = {
  render: () => {
    const [v, setV] = React.useState(65);
    return (
      <div style={{ width: 320 }}>
        <Slider min={0} max={100} value={v} onChange={(e) => setV(Number(e.target.value))} />
        <p style={{ marginTop: 8, fontSize: 13, color: "var(--kj-muted-foreground)" }}>Value: {v}</p>
      </div>
    );
  },
};

export const SegmentedControl: Story = {
  render: () => {
    const [v, setV] = React.useState("week");
    return (
      <Segmented
        value={v}
        onChange={setV}
        options={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ]}
      />
    );
  },
};
