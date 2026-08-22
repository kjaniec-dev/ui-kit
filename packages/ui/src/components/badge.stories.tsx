import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta = {
  title: "Status/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["neutral", "primary", "secondary", "success", "warning", "danger", "info", "solid"],
    },
    dot: { control: "boolean" },
    children: { control: "text" },
  },
  args: { variant: "primary", children: "Badge" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success" dot>
        Active
      </Badge>
      <Badge variant="warning" dot>
        Pending
      </Badge>
      <Badge variant="danger" dot>
        Error
      </Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="solid">Solid</Badge>
    </div>
  ),
};

export const WithStatusDot: Story = {
  args: { variant: "success", dot: true, children: "Active" },
};
