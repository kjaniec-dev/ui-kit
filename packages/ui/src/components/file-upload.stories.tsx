import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileUpload, FileUploadField } from "./file-upload";
import type { UploadItem } from "./file-upload-internals";

const meta = {
  title: "Forms/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [items, setItems] = React.useState<UploadItem[]>([]);
    return (
      <div style={{ maxWidth: 420 }}>
        <FileUpload value={items} onChange={setItems} accept="image/*,.pdf" maxSize={5 * 1024 * 1024} />
      </div>
    );
  },
};

export const WithProgressStates: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <FileUpload
        value={[
          { id: "1", file: new File(["x"], "invoice.pdf", { type: "application/pdf" }), status: "uploading", progress: 62 },
          { id: "2", file: new File(["x"], "receipt.png", { type: "image/png" }), status: "success" },
          { id: "3", file: new File(["x"], "broken.png", { type: "image/png" }), status: "error", error: "Server rejected" },
        ]}
        onChange={() => {}}
      />
    </div>
  ),
};

export const Field: Story = {
  render: () => {
    const [items, setItems] = React.useState<UploadItem[]>([]);
    return (
      <div style={{ maxWidth: 420 }}>
        <FileUploadField
          label="Attachments"
          hint="PDF or images, up to 5 MB each."
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
          value={items}
          onChange={setItems}
        />
      </div>
    );
  },
};
