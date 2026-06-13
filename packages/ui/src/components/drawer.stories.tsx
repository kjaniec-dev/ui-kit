import type { Meta } from "@storybook/react";
import * as React from "react";
import { Drawer } from "./drawer";
import { Button } from "./button";
import { TextField } from "./input";
import { CheckboxField } from "./checkbox";

const meta = {
  title: "Overlays/Drawer",
  component: Drawer,
} satisfies Meta<typeof Drawer>;

export default meta;

export const Default = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open Right Drawer</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Edit Configuration"
          description="Manage property options and backup intervals."
        >
          <div className="space-y-6">
            <TextField label="Connection String" defaultValue="postgresql://db.kjaniec.dev:5432" />
            <CheckboxField label="Enable auto-backups daily" defaultChecked />
            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => setOpen(false)}>Save Changes</Button>
            </div>
          </div>
        </Drawer>
      </div>
    );
  },
};
