import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleGroup } from "./toggle-group";

const meta = {
  title: "Selection/ToggleGroup",
  component: ToggleGroup,
} satisfies Meta<typeof ToggleGroup>;
export default meta;

type Story = StoryObj<Meta<typeof ToggleGroup>>;

const options = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(["bold"]);
    return (
      <ToggleGroup
        options={options}
        value={value}
        onChange={setValue}
        aria-label="Text formatting"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <ToggleGroup
      options={options}
      value={["bold", "italic"]}
      onChange={() => {}}
      disabled
      aria-label="Text formatting"
    />
  ),
};
