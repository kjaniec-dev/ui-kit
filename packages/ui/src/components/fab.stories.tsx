import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fab } from "./fab";

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const meta = {
  title: "Components/Fab",
  component: Fab,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    position: {
      control: "select",
      options: ["bottom-right", "bottom-left", "bottom-center", "none"],
    },
    mobileOnly: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    icon: <PlusIcon />,
    label: "Add Item",
    position: "none",
    variant: "primary",
    size: "md",
  },
} satisfies Meta<typeof Fab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex gap-4 items-center">
      <Fab {...args} variant="primary" label="Primary variant" />
      <Fab {...args} variant="secondary" label="Secondary variant" />
      <Fab {...args} variant="outline" label="Outline variant" />
      <Fab {...args} variant="danger" label="Danger variant" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex gap-4 items-center">
      <Fab {...args} size="sm" label="Small size" />
      <Fab {...args} size="md" label="Medium size" />
      <Fab {...args} size="lg" label="Large size" />
    </div>
  ),
};

export const Floating: Story = {
  render: (args) => (
    <div className="w-[500px] h-[300px] border border-dashed border-gray-300 relative overflow-hidden bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-500">Scrollable or long content in mobile view preview...</p>
      <div className="h-[400px]"></div>
      <Fab {...args} position="bottom-right" className="absolute" />
    </div>
  ),
  args: {
    label: "Floating Add",
    position: "bottom-right",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const MobileOnly: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-2 items-center">
      <p className="text-sm text-gray-500">
        This FAB is visible only on screens smaller than 768px (viewport &lt; md).
      </p>
      <Fab {...args} mobileOnly />
    </div>
  ),
};
