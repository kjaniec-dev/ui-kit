import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./alert";

const InfoIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

const meta = {
  title: "Status/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["info", "success", "warning", "danger"] },
    title: { control: "text" },
    children: { control: "text" },
  },
  args: {
    variant: "info",
    icon: InfoIcon,
    title: "New version available",
    children: "Version 0.2.0 adds navigation components and charts.",
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
      <Alert variant="info" icon={InfoIcon} title="Information">
        A short informational message for the user.
      </Alert>
      <Alert variant="success" icon={InfoIcon} title="Success">
        The operation completed successfully.
      </Alert>
      <Alert variant="warning" icon={InfoIcon} title="Warning">
        You are approaching your resource limit.
      </Alert>
      <Alert variant="danger" icon={InfoIcon} title="Error">
        Something went wrong — please try again.
      </Alert>
    </div>
  ),
};
