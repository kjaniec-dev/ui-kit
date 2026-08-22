import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { SectionHeader } from "./section-header";

const meta: Meta<typeof SectionHeader> = {
  title: "Components/SectionHeader",
  component: SectionHeader,
  tags: ["autodocs"],
  argTypes: {
    align: {
      control: "radio",
      options: ["left", "center"],
    },
    headingLevel: {
      control: "select",
      options: ["h2", "h3", "h4"],
    },
    divider: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {
  args: {
    kicker: "Features",
    title: "Everything you need to ship faster",
    description:
      "Pre-built components designed with high performance and full accessibility in mind.",
  },
};

export const Centered: Story = {
  args: {
    kicker: "Pricing",
    title: "Simple, transparent pricing",
    description: "No hidden fees. Free forever for open-source projects.",
    align: "center",
  },
};

export const WithActions: Story = {
  args: {
    kicker: "Analytics",
    title: "Performance Metrics",
    description: "Monitor user engagement and response times in real-time.",
    actions: (
      <>
        <Button variant="outline" size="sm">
          Export CSV
        </Button>
        <Button size="sm">View Report</Button>
      </>
    ),
  },
};

export const WithDivider: Story = {
  args: {
    kicker: "Documentation",
    title: "API References",
    description: "Complete API references and integration guides.",
    divider: true,
  },
};

export const CompoundComposition: Story = {
  render: () => (
    <SectionHeader align="center" divider>
      <SectionHeader.Kicker>Custom Section</SectionHeader.Kicker>
      <SectionHeader.Title as="h3">Custom Compound Layout</SectionHeader.Title>
      <SectionHeader.Description>
        Fully customized layout constructed using compound sub-components.
      </SectionHeader.Description>
      <SectionHeader.Actions className="justify-center mt-4">
        <Button variant="secondary" size="sm">
          Learn More
        </Button>
      </SectionHeader.Actions>
    </SectionHeader>
  ),
};
