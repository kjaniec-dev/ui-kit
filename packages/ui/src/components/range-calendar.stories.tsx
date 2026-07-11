import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RangeCalendar } from "./range-calendar";
import type { DateRange } from "./range-calendar";

const meta = {
  title: "Forms/RangeCalendar",
  component: RangeCalendar,
  tags: ["autodocs"],
} satisfies Meta<typeof RangeCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<DateRange>({});
    return <RangeCalendar value={value} onChange={setValue} />;
  },
};

export const WithBounds: Story = {
  render: () => {
    const today = new Date();
    const [value, setValue] = React.useState<DateRange>({});
    const min = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const max = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());
    return (
      <RangeCalendar
        value={value}
        onChange={setValue}
        min={min}
        max={max}
        disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
      />
    );
  },
};
