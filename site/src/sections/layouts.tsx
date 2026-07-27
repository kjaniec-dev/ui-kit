import * as React from "react";
import {
  AppShell,
  DashboardShell,
  SettingsLayout,
  DetailPageLayout,
  SectionHeader,
  TableToolbar,
  SidebarNav,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  Button,
  Badge,
  Avatar,
  TextField,
  Select,
  useToast,
} from "@kjaniec-dev/ui";
import { Sec, Box, Sub, IcoInfo, IcoSearch, IcoPlus, IcoGear } from "./primitives";

export function LayoutsSections() {
  const { toast } = useToast();
  const [tableSearch, setTableSearch] = React.useState("");

  const demoSidebar = (
    <SidebarNav
      groups={[
        {
          title: "Overview",
          items: [
            { id: "dash", label: "Dashboard", active: true, icon: IcoInfo },
            { id: "anal", label: "Analytics", icon: IcoSearch },
          ],
        },
        {
          title: "Management",
          items: [
            { id: "proj", label: "Projects", icon: IcoPlus, badge: <Badge variant="primary">4</Badge> },
            { id: "sett", label: "Settings", icon: IcoGear },
          ],
        },
      ]}
    />
  );

  return (
    <Sec
      id="layouts"
      title="Layouts"
      desc="Full-page shell and page templates for SaaS/B2B products."
      components={[
        "AppShell",
        "DashboardShell",
        "SettingsLayout",
        "DetailPageLayout",
        "SectionHeader",
        "TableToolbar",
        "SidebarNav",
      ]}
    >
      <Tabs defaultValue="appshell">
        <TabsList className="mb-4">
          <TabsTrigger value="appshell">AppShell</TabsTrigger>
          <TabsTrigger value="dashboard">DashboardShell</TabsTrigger>
          <TabsTrigger value="settings">SettingsLayout</TabsTrigger>
          <TabsTrigger value="detail">DetailPageLayout</TabsTrigger>
        </TabsList>

        <TabsContent value="appshell">
          <div className="border border-border rounded-kj-xl overflow-hidden bg-canvas h-[380px] relative">
            <AppShell
              className="h-full"
              banner={
                <div className="flex items-center justify-between text-xs px-4 py-2 bg-primary text-primary-foreground font-medium">
                  <span>🚀 kj-product-kit v0.9.1 is live! Explore new modular layout primitives.</span>
                  <Button variant="outline" size="sm" className="h-7 px-3 text-xs border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/15 font-semibold">
                    Learn more
                  </Button>
                </div>
              }
              header={
                <div className="flex items-center justify-between w-full h-full px-6 bg-surface text-foreground border-b border-border">
                  <div className="font-bold text-sm text-foreground flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
                    <span className="font-semibold tracking-tight text-foreground">ProductKit AppShell</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted font-medium">
                      Documentation
                    </Button>
                    <Button size="sm" variant="primary" className="font-semibold">
                      Get Started
                    </Button>
                  </div>
                </div>
              }
              footer={
                <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground flex justify-between items-center bg-surface">
                  <span>© 2026 kj-product-kit</span>
                  <div className="flex gap-4">
                    <span>Privacy</span>
                    <span>Terms</span>
                    <span>Support</span>
                  </div>
                </div>
              }
            >
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold m-0">Application Workspace</h3>
                  <p className="text-xs text-muted-foreground m-0">
                    A flexible top-level layout wrapper with optional announcement banner, sticky header, main container, and footer.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-3">
                    <div className="text-[10px] text-muted-foreground">Header Variant</div>
                    <div className="text-xs font-semibold mt-1">Glassmorphism</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-[10px] text-muted-foreground">Content Width</div>
                    <div className="text-xs font-semibold mt-1">Default (Max 1280px)</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-[10px] text-muted-foreground">Mobile Nav</div>
                    <div className="text-xs font-semibold mt-1">Drawer Ready</div>
                  </Card>
                </div>
              </div>
            </AppShell>
          </div>
        </TabsContent>

        <TabsContent value="dashboard">
          <div className="border border-border rounded-kj-xl overflow-hidden bg-canvas h-[380px] relative">
            <DashboardShell
              className="h-full min-h-0 [&_aside]:md:h-full [&_aside>div]:md:h-full"
              sidebarWidth="md:w-56"
              sidebar={demoSidebar}
              mobileSidebar={demoSidebar}
              topbar={
                <div className="flex items-center justify-between w-full h-full">
                  <div className="text-xs font-semibold">Overview</div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Admin Portal</span>
                    <Avatar size="sm" tone="primary">KJ</Avatar>
                  </div>
                </div>
              }
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold m-0">Welcome back, Admin</h3>
                    <p className="text-[10px] text-muted-foreground m-0">Here's what is happening today.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-3"><div className="text-[10px] text-muted-foreground">MRR</div><div className="text-sm font-bold">$12.4k</div></Card>
                  <Card className="p-3"><div className="text-[10px] text-muted-foreground">Sales</div><div className="text-sm font-bold">142</div></Card>
                  <Card className="p-3"><div className="text-[10px] text-muted-foreground">Active</div><div className="text-sm font-bold">98%</div></Card>
                </div>
                <Card className="p-3 h-20 flex items-center justify-center text-xs text-muted-foreground">Main Content Workspace</Card>
              </div>
            </DashboardShell>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Box className="bg-canvas border-border">
            <SettingsLayout
              title="Account Settings"
              description="Configure your workspace details and notification preferences."
              sidebar={
                <div className="flex flex-row lg:flex-col gap-1 w-full">
                  <Button variant="ghost" size="sm" className="justify-start text-primary bg-primary/10">Profile</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-muted-foreground">Billing</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-muted-foreground">Team</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-muted-foreground">Security</Button>
                </div>
              }
            >
              <Card className="p-6 space-y-4">
                <h3 className="text-base font-bold m-0">Personal Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  <TextField label="First Name" defaultValue="John" />
                  <TextField label="Last Name" defaultValue="Doe" />
                </div>
                <TextField label="Contact Email" defaultValue="john.doe@gmail.com" hint="We will use this to contact you for billing." />
                <div className="pt-2 flex justify-end">
                  <Button size="sm" onClick={() => toast({ message: "Profile saved successfully", tone: "success" })}>Save Profile</Button>
                </div>
              </Card>
            </SettingsLayout>
          </Box>
        </TabsContent>

        <TabsContent value="detail">
          <Box className="bg-canvas border-border">
            <DetailPageLayout
              title="Database Backup Job #8842"
              description="Triggered by cron schedule, uploaded to AWS S3 bucket."
              backLabel="Back to Backups"
              onBackClick={() => toast({ message: "Back clicked", tone: "default" })}
              actions={
                <>
                  <Button variant="outline" size="sm">Download Logs</Button>
                  <Button variant="secondary" size="sm">Run Again</Button>
                </>
              }
              aside={
                <div className="space-y-4">
                  <h3 className="text-sm font-bold m-0">Run Details</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="success">Completed</Badge></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Started</span><span className="font-semibold">2026-06-13 02:18</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-semibold">4.2 seconds</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Data size</span><span className="font-mono">142.6 MB</span></div>
                  </div>
                </div>
              }
            >
              <Card className="p-6 space-y-3">
                <h3 className="text-base font-bold m-0">Execution Log Output</h3>
                <pre className="text-xs font-mono bg-subtle border border-border p-4 rounded-kj-md overflow-x-auto leading-relaxed text-muted-foreground">
                  {`[02:18:00] Initializing database dump connection...
[02:18:01] Connected to PG instance kj-main-prod.
[02:18:02] Exporting schemas: public, auth, cron...
[02:18:03] Schema export completed. Total tables: 42.
[02:18:04] Uploading gzip archive to s3://kj-backups/prod-8842.tar.gz...
[02:18:04] Upload successful. MD5: 9a38a7c28c8928bc
[02:18:04] Backup job finished successfully.`}
                </pre>
              </Card>
            </DetailPageLayout>
          </Box>
        </TabsContent>
      </Tabs>

      <Box className="mt-10">
        <Sub>Section header</Sub>
        <div className="space-y-8 p-4 bg-canvas rounded-kj-md border border-border">
          <SectionHeader
            kicker="Features"
            title="Everything you need to ship faster"
            description="Pre-built components designed with high performance and full accessibility in mind."
            actions={
              <>
                <Button variant="outline" size="sm">Documentation</Button>
                <Button size="sm">Get Started</Button>
              </>
            }
            divider
          />
          <SectionHeader
            kicker="Pricing"
            title="Simple, transparent pricing"
            description="No hidden fees. Free forever for open-source projects."
            align="center"
          />
        </div>
      </Box>

      <Box className="mt-6">
        <Sub>Table toolbar</Sub>
        <div className="p-4 bg-canvas rounded-kj-md border border-border">
          <TableToolbar
            searchQuery={tableSearch}
            onSearchChange={setTableSearch}
            searchPlaceholder="Search items by name or ID..."
            actions={
              <>
                <Select defaultValue="all" className="w-36 text-xs">
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </Select>
                <Button leadingIcon={IcoPlus}>
                  Add Item
                </Button>
              </>
            }
          />
        </div>
      </Box>
    </Sec>
  );
}
