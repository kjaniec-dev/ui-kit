import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

const PlusIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M12 5v14" />
  </svg>
);

const meta = {
  title: "Actions/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "outline", "ghost", "danger"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "icon", "icon-sm"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
  args: { variant: "primary", size: "md", children: "Button" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: { leadingIcon: PlusIcon, children: "New project" },
};

export const Loading: Story = {
  args: { loading: true, variant: "secondary", children: "Saving" },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
};
