import type { Meta } from "@storybook/react";
import { ErrorState } from "./error-state";

const meta = {
  title: "Status/ErrorState",
  component: ErrorState,
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorState>;

export default meta;

export const Basic = {
  args: {
    title: "Connection Timeout",
    message: "The server took too long to respond. Please check your network and try again.",
  },
};

export const WithRetry = {
  render: () => (
    <ErrorState
      title="Failed to Load Invoices"
      message="We encountered a temporary database error while retrieving your billing records."
      onRetry={() => alert("Retrying...")}
      retryLabel="Reload Invoices"
    />
  ),
};
