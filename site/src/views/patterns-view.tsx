import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  Button,
  Card,
  CommandPalette,
  type CommandPaletteItem,
  ConfirmDialog,
  cn,
  DataTable,
  type DataTableColumn,
  DetailPageLayout,
  Drawer,
  Input,
  Label,
  MetricCard,
  ProjectCard,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableWrap,
  ToastProvider,
  useToast,
} from "@kjaniec-dev/ui";
import * as React from "react";
import { HighlightedCode } from "../highlighted-code";

export type PatternKey = "invoice" | "tenant" | "console";
export type ViewMode = "preview" | "code";

export interface PatternsViewProps {
  initialPattern?: string;
}

interface InvoiceItem {
  id: string;
  client: string;
  amount: string;
  numericAmount: number;
  issueDate: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
}

const INVOICE_DATA: InvoiceItem[] = [
  {
    id: "INV-2026-001",
    client: "Acme Corporation",
    amount: "$14,250.00",
    numericAmount: 14250,
    issueDate: "2026-09-01",
    dueDate: "2026-09-15",
    status: "Paid",
  },
  {
    id: "INV-2026-002",
    client: "Globex Logistics",
    amount: "$8,700.00",
    numericAmount: 8700,
    issueDate: "2026-09-03",
    dueDate: "2026-09-17",
    status: "Pending",
  },
  {
    id: "INV-2026-003",
    client: "Soylent Tech Labs",
    amount: "$22,100.00",
    numericAmount: 22100,
    issueDate: "2026-08-20",
    dueDate: "2026-09-05",
    status: "Overdue",
  },
  {
    id: "INV-2026-004",
    client: "Initech Systems",
    amount: "$5,400.00",
    numericAmount: 5400,
    issueDate: "2026-09-06",
    dueDate: "2026-09-20",
    status: "Paid",
  },
  {
    id: "INV-2026-005",
    client: "Umbrella Bio Corp",
    amount: "$19,800.00",
    numericAmount: 19800,
    issueDate: "2026-08-15",
    dueDate: "2026-08-30",
    status: "Overdue",
  },
  {
    id: "INV-2026-006",
    client: "Hooli Cloud Services",
    amount: "$31,500.00",
    numericAmount: 31500,
    issueDate: "2026-09-08",
    dueDate: "2026-09-22",
    status: "Pending",
  },
  {
    id: "INV-2026-007",
    client: "Stark Automations",
    amount: "$26,700.00",
    numericAmount: 26700,
    issueDate: "2026-09-10",
    dueDate: "2026-09-24",
    status: "Paid",
  },
];

const INVOICE_SNIPPET = `import * as React from "react";
import {
  MetricCard,
  TableToolbar,
  DataTable,
  Badge,
  Button,
  Select,
  useToast,
} from "@kjaniec-dev/ui";

export function InvoiceDashboard() {
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedRows, setSelectedRows] = React.useState<Set<React.Key>>(new Set());

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Invoiced"
          value="$128,450.00"
          trend="+12.4%"
          trendDirection="up"
          description="vs. last month ($114,280)"
        />
        <MetricCard
          title="Pending Settlement"
          value="$34,200.00"
          trend="18 invoices"
          trendDirection="neutral"
          description="Scheduled for payout within 15 days"
        />
        <MetricCard
          title="Overdue"
          value="$6,150.00"
          trend="-2.1%"
          trendDirection="down"
          description="3 client accounts requiring immediate reminder"
        />
      </div>

      {/* Toolbar & Multi-Row DataTable */}
      <DataTable
        columns={columns}
        data={filteredInvoices}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        toolbar={
          <TableToolbar
            searchQuery={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search invoices..."
            filters={
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </Select>
            }
            actions={
              selectedRows.size > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={exportCSV}>
                    Export CSV ({selectedRows.size})
                  </Button>
                  <Button variant="secondary" size="sm" onClick={sendReminders}>
                    Send Reminders ({selectedRows.size})
                  </Button>
                </>
              )
            }
          />
        }
      />
    </div>
  );
}`;

const TENANT_SNIPPET = `import * as React from "react";
import {
  DetailPageLayout,
  Drawer,
  ConfirmDialog,
  Button,
  Badge,
  TableWrap,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Input,
  useToast,
} from "@kjaniec-dev/ui";

export function TenantPropertyManager() {
  const { toast } = useToast();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <>
      <DetailPageLayout
        title="Horizon Tower - Suite 402"
        description="Commercial lease management, occupancy records, and facility contract terms."
        backLabel="Properties"
        onBackClick={() => toast({ message: "Back to properties" })}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)}>
              Adjust Lease
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              Terminate Lease
            </Button>
          </>
        }
        aside={<PropertyHighlightsCard />}
      >
        <LeaseTermsSummaryCard />
        <OccupantDirectoryTable />
      </DetailPageLayout>

      {/* Lease Modification Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Lease Agreement & Terms"
        description="Adjust commercial terms, renewal dates, and escalation clauses."
      >
        <LeaseAdjustmentForm onSave={() => setDrawerOpen(false)} />
      </Drawer>

      {/* Destructive Action Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          toast({ message: "Lease terminated", tone: "danger" });
        }}
        title="Terminate Commercial Lease"
        description="Are you sure? This begins 60-day turnover and notifies legal counsel."
        confirmLabel="Confirm Termination"
        tone="danger"
      />
    </>
  );
}`;

const CONSOLE_SNIPPET = `import * as React from "react";
import {
  CommandPalette,
  ProjectCard,
  Badge,
  Button,
  useToast,
} from "@kjaniec-dev/ui";

export function ProjectDevConsole() {
  const { toast } = useToast();
  const [cmdOpen, setCmdOpen] = React.useState(false);

  // Global ⌘K shortcut listener
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="space-y-6">
      {/* Service Health Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success" dot>API Gateway: Operational</Badge>
        <Badge variant="success" dot>PostgreSQL: Healthy (99.99%)</Badge>
        <Badge variant="warning" dot>Worker Pool: High Load (84%)</Badge>
      </div>

      {/* Project & Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((svc) => (
          <ProjectCard
            key={svc.title}
            title={svc.title}
            description={svc.description}
            status={svc.status}
            techStack={svc.techStack}
            metrics={svc.metrics}
            updatedAt={svc.updatedAt}
          />
        ))}
      </div>

      {/* Interactive Command Palette */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        items={commandItems}
      />
    </div>
  );
}`;

const PATTERN_CONFIG: Record<
  PatternKey,
  { label: string; description: string; snippet: string; filename: string }
> = {
  invoice: {
    label: "Invoice & Accounting",
    description:
      "Financial operations dashboard featuring metric cards, filtered searchable tables, and multi-row bulk workflows.",
    snippet: INVOICE_SNIPPET,
    filename: "invoice-dashboard.tsx",
  },
  tenant: {
    label: "Tenant & Property",
    description:
      "Commercial real estate administration flow combining master-detail layout, contextual slide-over drawer, and modal guardrails.",
    snippet: TENANT_SNIPPET,
    filename: "tenant-property-manager.tsx",
  },
  console: {
    label: "Project & Dev Console",
    description:
      "Developer platform console featuring global keyboard shortcut command palette, real-time health indicators, and service deployment cards.",
    snippet: CONSOLE_SNIPPET,
    filename: "project-dev-console.tsx",
  },
};

function InvoicePattern() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedRows, setSelectedRows] = React.useState<Set<React.Key>>(new Set());
  const [sortBy, setSortBy] = React.useState<string | undefined>("dueDate");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc" | undefined>("asc");

  const filteredData = React.useMemo(() => {
    let result = INVOICE_DATA;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.id.toLowerCase().includes(q) ||
          inv.client.toLowerCase().includes(q) ||
          inv.amount.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((inv) => inv.status === statusFilter);
    }

    if (sortBy && sortDirection) {
      result = [...result].sort((a, b) => {
        let valA: string | number = a[sortBy as keyof InvoiceItem];
        let valB: string | number = b[sortBy as keyof InvoiceItem];
        if (sortBy === "amount") {
          valA = a.numericAmount;
          valB = b.numericAmount;
        }
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchQuery, statusFilter, sortBy, sortDirection]);

  const columns: DataTableColumn<InvoiceItem>[] = [
    {
      header: "Invoice ID",
      accessor: (row) => <span className="font-mono font-semibold text-foreground">{row.id}</span>,
      align: "left",
      sortable: true,
      sortKey: "id",
    },
    {
      header: "Client",
      accessor: (row) => <span className="font-medium text-foreground">{row.client}</span>,
      align: "left",
      sortable: true,
      sortKey: "client",
    },
    {
      header: "Amount",
      accessor: (row) => (
        <span className="font-mono font-semibold text-foreground">{row.amount}</span>
      ),
      align: "right",
      sortable: true,
      sortKey: "amount",
    },
    {
      header: "Issue Date",
      accessor: (row) => <span className="font-mono text-muted-foreground">{row.issueDate}</span>,
      align: "left",
      sortable: true,
      sortKey: "issueDate",
    },
    {
      header: "Due Date",
      accessor: (row) => <span className="font-mono text-muted-foreground">{row.dueDate}</span>,
      align: "left",
      sortable: true,
      sortKey: "dueDate",
    },
    {
      header: "Status",
      accessor: (row) => {
        const variant =
          row.status === "Paid" ? "success" : row.status === "Pending" ? "warning" : "danger";
        return (
          <Badge variant={variant} dot>
            {row.status}
          </Badge>
        );
      },
      align: "left",
    },
  ];

  const handleExportCSV = () => {
    toast({
      message: `Exported ${selectedRows.size} invoice${selectedRows.size === 1 ? "" : "s"} to CSV.`,
      tone: "success",
    });
  };

  const handleSendReminders = () => {
    toast({
      message: `Sent reminders for ${selectedRows.size} invoice${selectedRows.size === 1 ? "" : "s"}.`,
      tone: "default",
    });
  };

  const handleNewInvoice = () => {
    toast({
      message: "Initiated new invoice draft dialog.",
      tone: "default",
    });
  };

  return (
    <div className="space-y-6">
      {/* MetricCard Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Invoiced"
          value="$128,450.00"
          trend="+12.4%"
          trendDirection="up"
          description="vs. last month ($114,280)"
        />
        <MetricCard
          title="Pending Settlement"
          value="$34,200.00"
          trend="18 invoices"
          trendDirection="neutral"
          description="Scheduled for payout within 15 days"
        />
        <MetricCard
          title="Overdue"
          value="$6,150.00"
          trend="-2.1%"
          trendDirection="down"
          description="3 accounts requiring action"
        />
      </div>

      {/* Table Section */}
      <div className="bg-surface border border-border rounded-kj-xl p-5 shadow-kj-xs">
        <DataTable
          columns={columns}
          data={filteredData}
          getRowKey={(row) => row.id}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={(key, dir) => {
            setSortBy(key);
            setSortDirection(dir);
          }}
          onRowClick={(row) =>
            toast({
              message: `Opened details for ${row.id} (${row.client})`,
              tone: "default",
            })
          }
          toolbar={
            <TableToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search invoices by ID, client, or amount..."
              filters={
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40 h-9 text-xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </Select>
              }
              actions={
                <div className="flex items-center gap-2">
                  {selectedRows.size > 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        Export CSV ({selectedRows.size})
                      </Button>
                      <Button variant="secondary" size="sm" onClick={handleSendReminders}>
                        Send Reminders ({selectedRows.size})
                      </Button>
                    </>
                  )}
                  <Button variant="primary" size="sm" onClick={handleNewInvoice}>
                    + New Invoice
                  </Button>
                </div>
              }
            />
          }
        />
      </div>
    </div>
  );
}

function TenantPattern() {
  const { toast } = useToast();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [escalationRate, setEscalationRate] = React.useState("3.5%");
  const [parkingStalls, setParkingStalls] = React.useState("6 dedicated bays");

  const handleSaveAdjustments = () => {
    setDrawerOpen(false);
    toast({
      message: `Lease adjustments saved for Suite 402 (${escalationRate} escalation, ${parkingStalls}).`,
      tone: "success",
    });
  };

  const handleConfirmTermination = () => {
    setConfirmOpen(false);
    toast({
      message: "Lease termination initiated for Suite 402. Turnover notices dispatched.",
      tone: "danger",
    });
  };

  return (
    <div>
      <DetailPageLayout
        title="Horizon Tower - Suite 402"
        description="Commercial lease agreement, occupant directory, and facility inspection records."
        backLabel="Properties"
        onBackClick={() =>
          toast({ message: "Navigating to Properties directory", tone: "default" })
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)}>
              Adjust Lease
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              Terminate Lease
            </Button>
          </div>
        }
        aside={
          <div className="space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="font-semibold text-sm text-foreground">Property Highlights</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Asset #HZ-402 · Metro District</p>
            </div>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Building Type</dt>
                <dd className="font-medium text-foreground">Grade A Commercial</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Floor & Wing</dt>
                <dd className="font-medium text-foreground">Level 4 · East Wing</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Usable Area</dt>
                <dd className="font-mono font-medium text-foreground">3,450 sq. ft.</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Base Monthly Rent</dt>
                <dd className="font-mono font-semibold text-foreground">$13,800.00 / mo</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Security Deposit</dt>
                <dd className="font-mono text-foreground">$27,600.00 (Escrow)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Primary Tenant</dt>
                <dd className="font-medium text-foreground">Apex Logistics Ltd</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Account Officer</dt>
                <dd className="font-medium text-foreground">Marcus Vance</dd>
              </div>
            </dl>
          </div>
        }
      >
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-2">
          <BreadcrumbItem href="#properties">Properties</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem href="#horizon-tower">Horizon Tower</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem current>Suite 402</BreadcrumbItem>
        </Breadcrumb>

        {/* Commercial Lease Card */}
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Commercial Lease Agreement</h2>
                <Badge variant="success" dot>
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Contract Ref: <span className="font-mono">LSE-2024-HZ402</span> · Executed Oct 1,
                2024
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(true)}>
              View Lease Terms →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-muted/40 rounded-kj-md">
              <div className="text-muted-foreground font-medium">Lease Term</div>
              <div className="text-sm font-semibold text-foreground mt-1">36 Months</div>
              <div className="text-[0.72rem] text-muted-foreground mt-0.5">
                Oct 1, 2024 – Sep 30, 2027
              </div>
            </div>
            <div className="p-3 bg-muted/40 rounded-kj-md">
              <div className="text-muted-foreground font-medium">Escalation Policy</div>
              <div className="text-sm font-semibold text-foreground mt-1">
                {escalationRate} / yr
              </div>
              <div className="text-[0.72rem] text-muted-foreground mt-0.5">
                Anniversary adjustments
              </div>
            </div>
            <div className="p-3 bg-muted/40 rounded-kj-md">
              <div className="text-muted-foreground font-medium">Notice of Non-Renewal</div>
              <div className="text-sm font-semibold text-foreground mt-1">90 Calendar Days</div>
              <div className="text-[0.72rem] text-muted-foreground mt-0.5">
                Prior to lease end date
              </div>
            </div>
          </div>
        </Card>

        {/* Occupant Directory Table */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-foreground">Registered Occupants & Keycards</h3>
              <p className="text-xs text-muted-foreground">
                Authorized personnel with active facility access badges.
              </p>
            </div>
            <Badge variant="neutral">4 Badges Active</Badge>
          </div>

          <TableWrap>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Occupant</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Access Zone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Marcus Sterling</TableCell>
                  <TableCell className="text-muted-foreground">Managing Director</TableCell>
                  <TableCell className="font-mono text-xs">m.sterling@apexlogistics.io</TableCell>
                  <TableCell>24/7 All Zones + Parking</TableCell>
                  <TableCell>
                    <Badge variant="success" dot>
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Elena Rostova</TableCell>
                  <TableCell className="text-muted-foreground">Head of Operations</TableCell>
                  <TableCell className="font-mono text-xs">e.rostova@apexlogistics.io</TableCell>
                  <TableCell>Suite 402 + Freight Dock</TableCell>
                  <TableCell>
                    <Badge variant="success" dot>
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Devon Zhao</TableCell>
                  <TableCell className="text-muted-foreground">Lead Architect</TableCell>
                  <TableCell className="font-mono text-xs">d.zhao@apexlogistics.io</TableCell>
                  <TableCell>Suite 402 + Server Room</TableCell>
                  <TableCell>
                    <Badge variant="success" dot>
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Chloe Bennett</TableCell>
                  <TableCell className="text-muted-foreground">Office Manager</TableCell>
                  <TableCell className="font-mono text-xs">c.bennett@apexlogistics.io</TableCell>
                  <TableCell>Suite 402 Business Hours</TableCell>
                  <TableCell>
                    <Badge variant="success" dot>
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableWrap>
        </Card>
      </DetailPageLayout>

      {/* Interactive Lease Adjustment Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Lease Agreement & Terms"
        description="Adjust commercial terms, renewal notice periods, and parking stall quotas."
      >
        <div className="space-y-5 pt-2">
          <div>
            <Label htmlFor="escalation-rate">Monthly Escalation Rate</Label>
            <Input
              id="escalation-rate"
              value={escalationRate}
              onChange={(e) => setEscalationRate(e.target.value)}
              className="mt-1"
            />
            <p className="text-[0.72rem] text-muted-foreground mt-1">
              Applied automatically at each 12-month anniversary.
            </p>
          </div>

          <div>
            <Label htmlFor="parking-stalls">Allocated Parking Stalls</Label>
            <Input
              id="parking-stalls"
              value={parkingStalls}
              onChange={(e) => setParkingStalls(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="renewal-notice">Renewal Option Notice</Label>
            <Input id="renewal-notice" defaultValue="90 calendar days" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="maintenance-escrow">Maintenance & Utility Escrow</Label>
            <Input id="maintenance-escrow" defaultValue="$1,850.00 / month" className="mt-1" />
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveAdjustments}>
              Save Adjustments
            </Button>
          </div>
        </div>
      </Drawer>

      {/* ConfirmDialog for Lease Termination */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmTermination}
        title="Terminate Commercial Lease"
        description="Are you sure you want to terminate this commercial lease? This action will notify tenant counsel, lock keycard provisioning, and trigger the 60-day facility turnover schedule. This action cannot be undone."
        confirmLabel="Confirm Termination"
        cancelLabel="Cancel"
        tone="danger"
      />
    </div>
  );
}

function ConsolePattern() {
  const { toast } = useToast();
  const [commandOpen, setCommandOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commandItems: CommandPaletteItem[] = [
    {
      id: "deploy-prod",
      title: "Deploy Production Release",
      subtitle: "Trigger zero-downtime blue/green deployment pipeline",
      category: "Deployment",
      shortcut: ["⌘", "D"],
      action: () =>
        toast({
          message: "Triggered blue/green deployment for production cluster.",
          tone: "success",
        }),
    },
    {
      id: "restart-db",
      title: "Restart PostgreSQL Replica",
      subtitle: "Perform controlled failover and replica restart",
      category: "Infrastructure",
      action: () =>
        toast({
          message: "Initiating graceful restart of secondary database node.",
          tone: "default",
        }),
    },
    {
      id: "flush-cache",
      title: "Flush Redis Cluster Cache",
      subtitle: "Purge stale session tokens and query cache entries",
      category: "Infrastructure",
      action: () =>
        toast({
          message: "Flushed 24,190 keys across Redis cluster.",
          tone: "default",
        }),
    },
    {
      id: "rotate-creds",
      title: "Rotate API Gateway Credentials",
      subtitle: "Issue new mTLS certs and revoke expired keys",
      category: "Security",
      action: () =>
        toast({
          message: "API Gateway credentials rotated and synced to vault.",
          tone: "success",
        }),
    },
    {
      id: "download-logs",
      title: "Download Audit Logs",
      subtitle: "Export SOC2-compliant tamper-evident event log",
      category: "Compliance",
      action: () =>
        toast({
          message: "Audit logs packaged into gzip archive.",
          tone: "default",
        }),
    },
    {
      id: "scale-worker",
      title: "Scale Worker Cluster to 12 Nodes",
      subtitle: "Increase throughput for overnight batch processing",
      category: "Scaling",
      action: () =>
        toast({
          message: "Worker pool scaled from 6 to 12 nodes.",
          tone: "default",
        }),
    },
  ];

  const services = [
    {
      title: "auth-service",
      description: "JWT session authority, OAuth2 federation, and RBAC token issue pipeline.",
      status: { label: "Deployed", variant: "success" as const },
      techStack: ["Node 22", "TypeScript", "Docker"],
      metrics: [
        { label: "CPU", value: "18%" },
        { label: "RAM", value: "412MB" },
        { label: "RPS", value: "2.4k" },
      ],
      updatedAt: "v2.14.0 · 6m ago",
    },
    {
      title: "billing-pipeline",
      description:
        "Stripe webhook processor, multi-currency ledger reconciliation, and tax calculation engine.",
      status: { label: "Healthy", variant: "success" as const },
      techStack: ["Go 1.23", "PostgreSQL", "Kafka"],
      metrics: [
        { label: "CPU", value: "32%" },
        { label: "Queue", value: "0 msgs" },
        { label: "Latency", value: "8ms" },
      ],
      updatedAt: "v1.8.2 · 22m ago",
    },
    {
      title: "notification-worker",
      description:
        "Transactional email, SMS notifications, and customer webhook dispatch pipeline.",
      status: { label: "High Load", variant: "warning" as const },
      techStack: ["Python 3.12", "Redis", "Celery"],
      metrics: [
        { label: "CPU", value: "74%" },
        { label: "Queue", value: "1.4k" },
        { label: "Errors", value: "0.01%" },
      ],
      updatedAt: "v3.0.1 · 1h ago",
    },
    {
      title: "search-indexer",
      description: "Vector embeddings generation and OpenSearch real-time document indexing.",
      status: { label: "Deployed", variant: "success" as const },
      techStack: ["Rust", "OpenSearch", "Qdrant"],
      metrics: [
        { label: "CPU", value: "22%" },
        { label: "Docs/s", value: "850" },
        { label: "Index", value: "48GB" },
      ],
      updatedAt: "v0.9.5 · 3h ago",
    },
    {
      title: "analytics-aggregator",
      description: "ClickHouse streaming rollup for customer usage metering and billing metrics.",
      status: { label: "Deployed", variant: "success" as const },
      techStack: ["ClickHouse", "Go", "Kafka"],
      metrics: [
        { label: "Ingest", value: "14k/s" },
        { label: "Lag", value: "12ms" },
      ],
      updatedAt: "v1.4.0 · 5h ago",
    },
    {
      title: "docs-portal",
      description: "Developer documentation portal, interactive API specs, and SDK reference.",
      status: { label: "Deployed", variant: "success" as const },
      techStack: ["React 19", "Tailwind 4", "Vite"],
      metrics: [
        { label: "Edge Hit", value: "99.4%" },
        { label: "TTFB", value: "24ms" },
      ],
      updatedAt: "v0.9.3 · 1d ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Console Header with Command Palette Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface border border-border rounded-kj-xl shadow-kj-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Cloud Services & Microservices
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Production cluster health, distributed tracing, and real-time workload orchestration.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setCommandOpen(true)}
          className="font-mono text-xs shrink-0 flex items-center gap-2"
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Open Command Palette</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[0.65rem] border border-border text-muted-foreground">
            ⌘K
          </kbd>
        </Button>
      </div>

      {/* Service Health Pills */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/40 border border-border/80 rounded-kj-lg">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 font-mono">
          Cluster Status:
        </span>
        <Badge variant="success" dot className="text-xs">
          API Gateway: Operational
        </Badge>
        <Badge variant="success" dot className="text-xs">
          PostgreSQL Primary: Healthy (99.99%)
        </Badge>
        <Badge variant="success" dot className="text-xs">
          Redis Cluster: Operational
        </Badge>
        <Badge variant="success" dot className="text-xs">
          Billing Pipeline: Nominal (18ms)
        </Badge>
        <Badge variant="warning" dot className="text-xs">
          Worker Pool: High Load (84%)
        </Badge>
        <Badge variant="success" dot className="text-xs">
          Kafka Broker: Nominal
        </Badge>
      </div>

      {/* Grid of ProjectCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((svc) => (
          <ProjectCard
            key={svc.title}
            title={svc.title}
            description={svc.description}
            status={svc.status}
            techStack={svc.techStack}
            metrics={svc.metrics}
            updatedAt={svc.updatedAt}
            actions={
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  toast({
                    message: `Streaming live logs for ${svc.title}...`,
                    tone: "default",
                  })
                }
                className="text-xs h-7 px-2"
              >
                Logs
              </Button>
            }
          />
        ))}
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        items={commandItems}
        placeholder="Type a command or search actions..."
      />
    </div>
  );
}

function sanitizePattern(pat?: string): PatternKey {
  if (pat === "invoice" || pat === "tenant" || pat === "console") {
    return pat;
  }
  return "invoice";
}

export function PatternsView({ initialPattern }: PatternsViewProps): React.JSX.Element {
  const [activePattern, setActivePattern] = React.useState<PatternKey>(() =>
    sanitizePattern(initialPattern)
  );
  const [viewMode, setViewMode] = React.useState<ViewMode>("preview");

  React.useEffect(() => {
    if (initialPattern) {
      setActivePattern(sanitizePattern(initialPattern));
    }
  }, [initialPattern]);

  const patternConfig = PATTERN_CONFIG[activePattern];

  return (
    <ToastProvider>
      <div className="min-w-0 max-w-[1280px] mx-auto px-6 max-[820px]:px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2 font-mono">
              KJ Product Kit · Patterns
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              B2B Product Patterns
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-[70ch]">
              Production-ready compositions built with KJ Product Kit primitives. Explore real-world
              flows for billing, multi-tenant asset management, and cloud developer consoles.
            </p>
          </div>

          {/* Preview vs. Code Toggle */}
          <div
            role="tablist"
            aria-label="View Mode"
            className="inline-flex items-center bg-muted p-1 rounded-kj-lg border border-border shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "preview"}
              onClick={() => setViewMode("preview")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-kj-md transition-all cursor-pointer border-0",
                viewMode === "preview"
                  ? "bg-surface text-foreground shadow-kj-xs"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Live Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "code"}
              onClick={() => setViewMode("code")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-kj-md transition-all cursor-pointer border-0",
                viewMode === "code"
                  ? "bg-surface text-foreground shadow-kj-xs"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Source Code
            </button>
          </div>
        </div>

        {/* Pattern Selectors Tab Bar */}
        <div
          role="tablist"
          aria-label="B2B Patterns"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {(
            [
              { key: "invoice", label: "Invoice & Accounting", kicker: "Financial Data & Tables" },
              { key: "tenant", label: "Tenant & Property", kicker: "Detail Layout & Drawer" },
              { key: "console", label: "Project & Dev Console", kicker: "CommandPalette & Cards" },
            ] as const
          ).map((item) => {
            const isSelected = activePattern === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActivePattern(item.key)}
                className={cn(
                  "p-4 rounded-kj-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                  isSelected
                    ? "bg-primary/5 border-primary shadow-kj-sm ring-1 ring-primary/20"
                    : "bg-surface border-border hover:bg-muted/50 hover:border-muted-foreground/30 text-foreground"
                )}
              >
                <div>
                  <span
                    className={cn(
                      "text-[0.7rem] uppercase tracking-wider font-mono font-semibold block mb-1",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.kicker}
                  </span>
                  <span className="text-sm font-bold text-foreground block">{item.label}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-block w-2 h-2 rounded-full",
                      isSelected ? "bg-primary" : "bg-border"
                    )}
                  />
                  <span className="text-[0.75rem] text-muted-foreground">
                    {isSelected ? "Active Pattern" : "Select →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pattern Content Area */}
        {viewMode === "preview" ? (
          <div>
            {activePattern === "invoice" && <InvoicePattern />}
            {activePattern === "tenant" && <TenantPattern />}
            {activePattern === "console" && <ConsolePattern />}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{patternConfig.description}</span>
              <span className="font-mono">{patternConfig.filename}</span>
            </div>
            <HighlightedCode
              code={patternConfig.snippet}
              language="tsx"
              filename={patternConfig.filename}
              copyable
            />
          </div>
        )}
      </div>
    </ToastProvider>
  );
}
