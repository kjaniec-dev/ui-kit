import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker, DatePickerField } from "./date-picker";

const meta = {
  title: "Forms/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<Date | undefined>(undefined);
    return (
      <div style={{ maxWidth: 280 }}>
        <DatePicker value={value} onChange={setValue} />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <DatePicker error placeholder="Required field" />
    </div>
  ),
};

export const Field: Story = {
  render: () => {
    const [value, setValue] = React.useState<Date | undefined>(undefined);
    return (
      <div style={{ maxWidth: 280 }}>
        <DatePickerField
          label="Due date"
          required
          hint="Weekdays only."
          value={value}
          onChange={setValue}
          disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
        />
      </div>
    );
  },
};
