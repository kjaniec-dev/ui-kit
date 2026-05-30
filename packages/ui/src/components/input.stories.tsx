import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Input, Textarea } from "./input";
import { Field, Label, Hint } from "./field";
import { Select } from "./select";

const SearchIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const meta = {
  title: "Forms/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: { placeholder: "Wpisz tekst…" },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithLabelAndHint: Story = {
  render: () => (
    <Field>
      <Label required>Full name</Label>
      <Input placeholder="Jane Doe" />
      <Hint>This is how your team will see you.</Hint>
    </Field>
  ),
};

export const LeadingIcon: Story = {
  args: { leadingIcon: SearchIcon, placeholder: "Search projects…" },
};

export const LiveValidation: Story = {
  render: () => {
    const [email, setEmail] = React.useState("");
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    const err = email.length > 0 && !ok;
    return (
      <Field>
        <Label required>E-mail</Label>
        <Input type="email" placeholder="jane@company.com" value={email} error={err} onChange={(e) => setEmail(e.target.value)} />
        <Hint error={err}>{!email ? "We'll use it to sign you in." : ok ? "Looks good ✓" : "Enter a valid email address."}</Hint>
      </Field>
    );
  },
};

export const ErrorState: Story = {
  args: { error: true, defaultValue: "nie-tak" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "workspace-id-8842" },
};

export const TextareaField: Story = {
  render: () => (
    <Field>
      <Label>Project description</Label>
      <Textarea placeholder="What is this project about?" />
    </Field>
  ),
};

export const SelectField: Story = {
  render: () => (
    <Field>
      <Label>Role</Label>
      <Select>
        <option>Administrator</option>
        <option>Editor</option>
        <option>View only</option>
      </Select>
    </Field>
  ),
};
