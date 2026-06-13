import type { Meta } from "@storybook/react";
import * as React from "react";
import { ConfirmDialog } from "./confirm-dialog";
import { Button } from "./button";

const meta = {
  title: "Overlays/ConfirmDialog",
  component: ConfirmDialog,
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

export const Default = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Trigger Confirm Dialog</Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          title="Delete Workspace?"
          description="This action cannot be undone. All database records and configs will be deleted."
          confirmLabel="Delete Workspace"
          tone="danger"
          loading={loading}
          onConfirm={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setOpen(false);
            }, 1000);
          }}
        />
      </div>
    );
  },
};
