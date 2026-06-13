import type { Meta } from "@storybook/react";
import { SettingsLayout } from "./settings-layout";
import { Card } from "./card";
import { Button } from "./button";
import { TextField } from "./input";

const meta = {
  title: "Layout/SettingsLayout",
  component: SettingsLayout,
} satisfies Meta<typeof SettingsLayout>;

export default meta;

export const Default = {
  render: () => (
    <SettingsLayout
      title="Profile Settings"
      description="Customize how your profile appears to other members."
      sidebar={
        <div className="flex flex-row lg:flex-col gap-1 w-full">
          <Button variant="ghost" size="sm" className="justify-start bg-primary/10 text-primary">General</Button>
          <Button variant="ghost" size="sm" className="justify-start text-muted-foreground">Team</Button>
          <Button variant="ghost" size="sm" className="justify-start text-muted-foreground">Billing</Button>
        </div>
      }
    >
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TextField label="First Name" defaultValue="John" />
          <TextField label="Last Name" defaultValue="Doe" />
        </div>
        <TextField label="Email Address" defaultValue="john.doe@gmail.com" />
        <div className="flex justify-end pt-2">
          <Button size="sm">Save profile</Button>
        </div>
      </Card>
    </SettingsLayout>
  ),
};
