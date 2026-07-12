import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dropzone } from "./dropzone";

const meta = {
  title: "Forms/Dropzone",
  component: Dropzone,
  tags: ["autodocs"],
} satisfies Meta<typeof Dropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onFiles: () => {} },
  render: () => {
    const [count, setCount] = React.useState(0);
    return (
      <div style={{ maxWidth: 420 }}>
        <Dropzone onFiles={(files) => setCount((c) => c + files.length)} />
        <p style={{ marginTop: 8, fontSize: 13 }}>{count} file(s) received</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: { onFiles: () => {} },
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Dropzone onFiles={() => {}} disabled />
    </div>
  ),
};
