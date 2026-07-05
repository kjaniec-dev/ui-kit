import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Button } from "./button";

const meta = {
  title: "Primitives/Popover",
  component: Popover,
  tags: ["autodocs"],
  args: { children: null },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <div style={{ padding: 120, display: "flex", justifyContent: "center" }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-64">
          <p className="m-0 mb-1 text-sm font-semibold">Quick help</p>
          <p className="m-0 text-sm text-muted-foreground">
            Popovers hold arbitrary content — filters, hints, pickers.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const SidesAndAlignments: Story = {
  render: () => (
    <div style={{ padding: 140, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline">{side}</Button>
          </PopoverTrigger>
          <PopoverContent side={side} align="center" className="w-40">
            <p className="m-0 text-sm">side="{side}"</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};
