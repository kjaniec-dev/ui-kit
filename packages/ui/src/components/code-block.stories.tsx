import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "./code-block";

const sample = `import { Button } from "@kjaniec-dev/ui";

<Button variant="primary" loading={saving}>
  Save changes
</Button>`;

const meta = {
  title: "Primitives/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  args: { code: sample, language: "tsx" },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithFilename: Story = {
  args: { filename: "save-button.tsx" },
};

export const NotCopyable: Story = {
  args: { copyable: false },
};

export const ScrollingMaxHeight: Story = {
  args: {
    code: Array.from({ length: 30 }, (_, i) => `const line${i} = ${i};`).join("\n"),
    maxHeight: 180,
  },
};
