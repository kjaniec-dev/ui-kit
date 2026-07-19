import type { Meta, StoryObj } from "@storybook/react";
import { ColorPicker, ColorPickerField } from "./color-picker";

const meta: Meta<typeof ColorPicker> = {
  title: "Components/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: "#3B82F6",
  },
};

export const CustomSwatches: Story = {
  args: {
    defaultValue: "#10B981",
    swatches: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#1E293B"],
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "#6366F1",
    disabled: true,
  },
};

export const FieldWrapper: Story = {
  render: () => (
    <ColorPickerField
      label="Brand Primary Color"
      hint="Choose your main product accent color"
      defaultValue="#3B82F6"
    />
  ),
};
