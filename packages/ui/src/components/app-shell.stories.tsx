import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShell } from "./app-shell";
import { Button } from "./button";

const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AppShell
      banner={<div>🚀 Announcement: KJ Product Kit v1.0 released!</div>}
      header={
        <div className="w-full flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight">KJ Product Kit</div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <a href="#" className="hover:text-foreground">Features</a>
            <a href="#" className="hover:text-foreground">Docs</a>
            <a href="#" className="hover:text-foreground">Pricing</a>
          </div>
          <Button size="sm">Get Started</Button>
        </div>
      }
      mobileNav={
        <div className="flex flex-col gap-4 text-sm font-medium">
          <a href="#" className="hover:text-foreground">Features</a>
          <a href="#" className="hover:text-foreground">Docs</a>
          <a href="#" className="hover:text-foreground">Pricing</a>
        </div>
      }
      footer={
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>© 2026 KJ Product Kit. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">GitHub</a>
          </div>
        </div>
      }
    >
      <div className="py-12 space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight">Build faster with KJ UI</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          A modern, accessible design system tailored for developer tools, SaaS applications, and developer portfolios.
        </p>
      </div>
    </AppShell>
  ),
};

export const CompoundAPI: Story = {
  render: () => (
    <AppShell>
      <AppShell.Banner variant="accent">
        🔥 Special Offer: 20% off Pro plans this week!
      </AppShell.Banner>
      <AppShell.Header variant="glass" position="sticky">
        <div className="w-full flex items-center justify-between">
          <span className="font-semibold text-lg">My SaaS App</span>
          <Button variant="secondary" size="sm">Sign In</Button>
        </div>
      </AppShell.Header>
      <AppShell.Main width="narrow">
        <div className="py-8 space-y-4">
          <h2 className="text-2xl font-bold">Narrow Content Layout</h2>
          <p className="text-muted-foreground">
            This story demonstrates using the compound subcomponents pattern with narrow content width constraint.
          </p>
        </div>
      </AppShell.Main>
      <AppShell.Footer>
        <div className="text-center text-sm text-muted-foreground">
          Built with AppShell.Footer
        </div>
      </AppShell.Footer>
    </AppShell>
  ),
};

export const HeaderVariants: Story = {
  render: () => (
    <div className="space-y-12 bg-canvas p-4">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Glass Header Variant</h3>
        <AppShell.Header variant="glass" position="static">
          <div className="w-full flex items-center justify-between">
            <span className="font-bold">Glass Header</span>
            <Button size="sm">Action</Button>
          </div>
        </AppShell.Header>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Solid Header Variant</h3>
        <AppShell.Header variant="solid" position="static">
          <div className="w-full flex items-center justify-between">
            <span className="font-bold">Solid Header</span>
            <Button size="sm">Action</Button>
          </div>
        </AppShell.Header>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Transparent Header Variant</h3>
        <AppShell.Header variant="transparent" position="static">
          <div className="w-full flex items-center justify-between">
            <span className="font-bold">Transparent Header</span>
            <Button size="sm">Action</Button>
          </div>
        </AppShell.Header>
      </div>
    </div>
  ),
};
