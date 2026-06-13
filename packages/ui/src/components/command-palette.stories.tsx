import type { Meta } from "@storybook/react";
import * as React from "react";
import { CommandPalette } from "./command-palette";
import { Button } from "./button";

const meta = {
  title: "Overlays/CommandPalette",
  component: CommandPalette,
} satisfies Meta<typeof CommandPalette>;

export default meta;

export const Default = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    const items = [
      {
        id: "new",
        title: "Create new record",
        category: "Actions",
        shortcut: ["⌘", "N"],
        action: () => alert("New action"),
      },
      {
        id: "settings",
        title: "Go to settings",
        category: "Navigation",
        action: () => alert("Go to settings"),
      },
      {
        id: "support",
        title: "Contact support",
        category: "Help",
        action: () => alert("Contact support"),
      },
    ];

    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open Command Palette (⌘K)</Button>
        <CommandPalette open={open} onClose={() => setOpen(false)} items={items} />
      </div>
    );
  },
};
