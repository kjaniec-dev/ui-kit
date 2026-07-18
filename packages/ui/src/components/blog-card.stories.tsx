import type { Meta, StoryObj } from "@storybook/react";
import { BlogCard } from "./blog-card";

const meta: Meta<typeof BlogCard> = {
  title: "Components/BlogCard",
  component: BlogCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BlogCard>;

export const Vertical: Story = {
  args: {
    title: "Building Scalable Monorepos with Turborepo & Vitest",
    description: "A practical guide to structuring React component libraries in a modern monorepo.",
    category: "Architecture",
    readTime: "6 min read",
    publishedAt: "Jul 18, 2026",
    coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    coverAlt: "Code editor background",
    author: {
      name: "Krystian Janiec",
      role: "Staff Engineer",
    },
    href: "#",
  },
};

export const Horizontal: Story = {
  args: {
    title: "Design Tokens & Dark Mode Best Practices",
    description: "How to maintain consistent CSS variables across light and dark themes.",
    category: "Design System",
    readTime: "4 min read",
    publishedAt: "Jul 15, 2026",
    orientation: "horizontal",
    coverUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    coverAlt: "Design workspace",
    author: {
      name: "Krystian Janiec",
      role: "Lead Designer",
    },
    href: "#",
  },
};
