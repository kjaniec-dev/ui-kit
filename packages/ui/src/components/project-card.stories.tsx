import type { Meta, StoryObj } from "@storybook/react";
import { ProjectCard } from "./project-card";

const meta: Meta<typeof ProjectCard> = {
  title: "Components/ProjectCard",
  component: ProjectCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProjectCard>;

export const Active: Story = {
  args: {
    title: "kj-product-kit",
    description: "Full-stack React & Next.js starter kit with Tailwind CSS tokens and MCP integration.",
    status: { label: "Active", variant: "success" },
    techStack: ["React", "TypeScript", "Tailwind", "Vitest"],
    metrics: [
      { label: "stars", value: 248 },
      { label: "forks", value: 34 },
    ],
    updatedAt: "Updated 2h ago",
    href: "https://github.com",
  },
};
