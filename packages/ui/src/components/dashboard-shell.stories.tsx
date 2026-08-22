import type { Meta } from "@storybook/react-vite";
import { DashboardShell } from "./dashboard-shell";
import { PageHeader } from "./page-header";
import { Button } from "./button";

const meta = {
  title: "Layout/DashboardShell",
  component: DashboardShell,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DashboardShell>;

export default meta;

export const Default = {
  render: () => (
    <DashboardShell
      sidebar={
        <div className="p-6 flex flex-col gap-6 h-full bg-subtle">
          <div className="font-bold text-lg tracking-tight text-primary">KJ Product Kit</div>
          <nav className="flex flex-col gap-2">
            <a
              href="#"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Projects
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Invoices
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Settings
            </a>
          </nav>
        </div>
      }
      topbar={
        <div className="w-full flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Workspace / Personal</span>
          <Button size="sm" variant="ghost">
            Profile
          </Button>
        </div>
      }
    >
      <PageHeader
        eyebrow="B2B SaaS"
        title="Dashboard Shell"
        description="The shell structure renders a responsive frame container with a sticky sidebar, topbar, and main canvas."
        actions={<Button size="sm">New Project</Button>}
      />
      <div className="border border-dashed border-border rounded-kj-lg h-96 grid place-items-center bg-surface">
        <span className="text-sm text-muted-foreground">Main Content Canvas Area</span>
      </div>
    </DashboardShell>
  ),
};
