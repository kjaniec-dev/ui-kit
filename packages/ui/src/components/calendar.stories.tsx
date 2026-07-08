import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar } from "./calendar";

const meta = {
  title: "Forms/Calendar",
  component: Calendar,
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<Date | undefined>(new Date());
    return <Calendar value={value} onChange={setValue} />;
  },
};

export const WithBounds: Story = {
  render: () => {
    const today = new Date();
    const [value, setValue] = React.useState<Date | undefined>(undefined);
    const min = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const max = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return (
      <Calendar
        value={value}
        onChange={setValue}
        min={min}
        max={max}
        disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
      />
    );
  },
};
