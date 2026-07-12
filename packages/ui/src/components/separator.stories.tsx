import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "Primitives/Separator",
  component: Separator,
};
export default meta;

type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="m-0 text-sm">Above</p>
      <Separator className="my-3" />
      <p className="m-0 text-sm">Below</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-stretch gap-3 h-8">
      <span className="text-sm">Left</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Right</span>
    </div>
  ),
};
