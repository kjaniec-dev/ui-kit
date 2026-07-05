import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd } from "./kbd";

const meta = {
  title: "Primitives/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  args: { children: "⌘K", size: "sm" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const KeySequence: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <Kbd keys={["⌘", "K"]} />
      <Kbd keys={["⌘", "Shift", "P"]} size="md" />
      <Kbd>Esc</Kbd>
    </div>
  ),
};
