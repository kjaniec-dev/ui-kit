import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Combobox, ComboboxField } from "./combobox";

const meta = {
  title: "Forms/Combobox",
  component: Combobox,
  tags: ["autodocs"],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "solid", label: "SolidStart", disabled: true },
];

export const Single: Story = {
  args: { options: frameworks },
  render: () => {
    const [value, setValue] = React.useState("");
    return (
      <div style={{ maxWidth: 320 }}>
        <Combobox
          options={frameworks}
          value={value}
          onChange={setValue}
          placeholder="Select a framework…"
        />
      </div>
    );
  },
};

export const Multiple: Story = {
  args: { options: frameworks },
  render: () => {
    const [value, setValue] = React.useState<string[]>(["next", "astro"]);
    return (
      <div style={{ maxWidth: 380 }}>
        <Combobox
          options={frameworks}
          multiple
          value={value}
          onChange={setValue}
          placeholder="Select frameworks…"
        />
      </div>
    );
  },
};

export const WithError: Story = {
  args: { options: frameworks },
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Combobox options={frameworks} error placeholder="Required field" />
    </div>
  ),
};

export const Field: Story = {
  args: { options: frameworks },
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <ComboboxField
        options={frameworks}
        label="Primary framework"
        required
        hint="You can change this later."
      />
    </div>
  ),
};
