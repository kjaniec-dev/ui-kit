import type { Meta } from "@storybook/react";
import { FormField } from "./form-field";
import { Input } from "./input";
import { Select } from "./select";

const meta = {
  title: "Forms/FormField",
  component: FormField,
  tags: ["autodocs"],
} satisfies Meta<typeof FormField>;

export default meta;

export const Basic = {
  render: () => (
    <FormField label="Full Name">
      <Input placeholder="John Doe" />
    </FormField>
  ),
};

export const Required = {
  render: () => (
    <FormField label="Email address" required>
      <Input type="email" placeholder="john.doe@gmail.com" />
    </FormField>
  ),
};

export const WithHint = {
  render: () => (
    <FormField label="Password" hint="Must contain at least 8 characters.">
      <Input type="password" placeholder="••••••••" />
    </FormField>
  ),
};

export const WithError = {
  render: () => (
    <FormField
      label="Username"
      hint="Choose a unique public handler."
      error="This username is already taken."
    >
      <Input defaultValue="kjaniec" />
    </FormField>
  ),
};

export const WithSelect = {
  render: () => (
    <FormField label="Target Workspace">
      <Select>
        <option>Personal Portfolio</option>
        <option>B2B Landlord SaaS</option>
        <option>Accounting App</option>
      </Select>
    </FormField>
  ),
};
