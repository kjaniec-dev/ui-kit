import type { Meta } from "@storybook/react-vite";
import { Skeleton } from "./skeleton";

const meta = {
  title: "Status/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;

export const Text = {
  render: () => (
    <div style={{ maxWidth: 320 }} className="space-y-2">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="85%" />
    </div>
  ),
};

export const Circular = {
  args: {
    variant: "circular",
    width: 48,
    height: 48,
  },
};

export const Rectangular = {
  args: {
    variant: "rectangular",
    width: 300,
    height: 120,
  },
};

export const CardMockup = {
  render: () => (
    <div style={{ maxWidth: 360 }} className="p-5 border border-border rounded-kj-xl space-y-4 bg-surface">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="text" width="40%" height={10} />
          <Skeleton variant="text" width="25%" height={8} />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="50%" />
      </div>
      <Skeleton variant="rectangular" width="100%" height={160} />
    </div>
  ),
};
