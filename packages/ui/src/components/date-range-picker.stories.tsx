import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateRangePicker, DateRangePickerField } from "./date-range-picker";
import type { DateRange } from "./range-calendar";

const meta = {
  title: "Forms/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<DateRange>({});
    return (
      <div style={{ maxWidth: 280 }}>
        <DateRangePicker value={value} onChange={setValue} />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <DateRangePicker error placeholder="Required field" />
    </div>
  ),
};

export const Field: Story = {
  render: () => {
    const [value, setValue] = React.useState<DateRange>({});
    return (
      <div style={{ maxWidth: 280 }}>
        <DateRangePickerField
          label="Booking dates"
          required
          hint="Weekends are disabled."
          value={value}
          onChange={setValue}
          disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
        />
      </div>
    );
  },
};
