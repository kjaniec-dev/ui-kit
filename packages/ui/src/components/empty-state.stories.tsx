import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "./empty-state";
import { Button } from "./button";

const meta = {
  title: "Status/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    title: "No projects found",
    description:
      "Your workspace does not have any active project files. Get started by creating your first project.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithIcon: Story = {
  args: {
    title: "Database connection failed",
    description:
      "Could not establish connection to the remote cluster. Check your credentials and database status.",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  },
};

export const WithAction: Story = {
  render: () => (
    <EmptyState
      title="No integrations active"
      description="Connect your Slack, GitHub, or Discord channel to start receiving automated notifications."
      icon={
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      }
      action={<Button size="sm">Connect Integration</Button>}
    />
  ),
};
