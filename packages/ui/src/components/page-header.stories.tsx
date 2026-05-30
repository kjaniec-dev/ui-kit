import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "./page-header";
import { Button } from "./button";

const meta = {
  title: "Layout/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  argTypes: {
    eyebrow: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    eyebrow: "Portfolio",
    title: "Projects",
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithDescription: Story = {
  args: {
    eyebrow: "About me",
    title: "Who I am",
    description: "Designer and developer building thoughtful digital products.",
  },
};

export const WithActions: Story = {
  render: () => (
    <PageHeader
      eyebrow="Open source"
      title="Projects"
      description="Things I've built and shipped."
      actions={
        <>
          <Button size="sm">View all</Button>
          <Button size="sm" variant="ghost">GitHub</Button>
        </>
      }
    />
  ),
};
