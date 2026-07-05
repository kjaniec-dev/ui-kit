import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Modal, ModalTitle, ModalDescription, ModalActions } from "./modal";
import { Tooltip } from "./tooltip";
import { ToastProvider, useToast } from "./toast";
import { Button } from "./button";

const meta = { title: "Overlays/Overview", tags: ["autodocs"] } satisfies Meta;
export default meta;
type Story = StoryObj;

export const ModalStory: Story = {
  name: "Modal",
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalTitle>Delete project “Q3 Launch”?</ModalTitle>
          <ModalDescription>This action cannot be undone. All files and activity history will be permanently deleted.</ModalDescription>
          <ModalActions>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => setOpen(false)}>Delete project</Button>
          </ModalActions>
        </Modal>
      </>
    );
  },
};

export const TooltipStory: Story = {
  name: "Tooltip",
  render: () => (
    <Tooltip content="Contextual tooltip">
      <Button variant="outline">Hover over me</Button>
    </Tooltip>
  ),
};

function ToastDemo() {
  const { toast } = useToast();
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button variant="outline" size="sm" onClick={() => toast({ message: "Changes saved." })}>Info</Button>
      <Button variant="outline" size="sm" onClick={() => toast({ message: "Profile updated.", tone: "success" })}>Success</Button>
      <Button variant="outline" size="sm" onClick={() => toast({ message: "Could not delete.", tone: "danger" })}>Error</Button>
    </div>
  );
}

export const ToastStory: Story = {
  name: "Toast",
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};
