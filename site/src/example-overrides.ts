// Curated usage snippets for components whose auto-extracted usageSnippet
// is too thin to teach real usage. Keyed by component name in components.json.
export const exampleOverrides: Record<string, string> = {
  Button: `const [saving, setSaving] = React.useState(false);

<div className="flex items-center gap-3">
  <Button loading={saving} onClick={() => setSaving(true)}>
    Save changes
  </Button>
  <Button variant="outline">Cancel</Button>
  <Button variant="danger" size="sm">Delete</Button>
</div>`,

  DataTable: `interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: string;
  paid: boolean;
}

const columns: DataTableColumn<Invoice>[] = [
  { header: "Invoice", accessor: (r) => r.number, sortable: true, sortKey: "number" },
  { header: "Customer", accessor: (r) => r.customer },
  {
    header: "Status",
    accessor: (r) => (
      <Badge variant={r.paid ? "success" : "warning"}>{r.paid ? "Paid" : "Due"}</Badge>
    ),
  },
  { header: "Amount", accessor: (r) => r.amount, align: "right" },
];

const [selected, setSelected] = React.useState<Set<React.Key>>(new Set());

<DataTable
  columns={columns}
  data={invoices}
  getRowKey={(r) => r.id}
  selectedRows={selected}
  onSelectionChange={setSelected}
/>`,

  ToastProvider: `// Wrap the app once:
<ToastProvider>
  <App />
</ToastProvider>

// Then anywhere below it:
const { toast } = useToast();
toast({ message: "Profile updated.", tone: "success" });`,

  CommandPalette: `const items: CommandPaletteItem[] = [
  {
    id: "new-project",
    title: "Create project",
    category: "Actions",
    shortcut: ["⌘", "N"],
    action: () => createProject(),
  },
  {
    id: "goto-settings",
    title: "Go to settings",
    category: "Navigation",
    action: () => navigate("/settings"),
  },
];

<CommandPalette open={open} onClose={() => setOpen(false)} items={items} />`,

  Sparkline: `<Sparkline
  data={[38, 45, 42, 58, 64, 61, 75, 84, 92, 108]}
  variant="area"
  color="chart1"
  height={40}
  showGradient
  showEndDot
/>`,

  LineChart: `const monthlyData = [
  { month: "Jan", revenue: 4200, expenses: 3100 },
  { month: "Feb", revenue: 4800, expenses: 3300 },
  { month: "Mar", revenue: 5600, expenses: 3900 },
  { month: "Apr", revenue: 6400, expenses: 4200 },
];

<LineChart
  data={monthlyData}
  index="month"
  series={[
    { key: "revenue", label: "Revenue", color: "chart1" },
    { key: "expenses", label: "Expenses", color: "chart2" },
  ]}
  curve="smooth"
  height={280}
  valueFormatter={(v) => \`$\${v.toLocaleString()}\`}
/>`,

  AreaChart: `const trafficData = [
  { date: "May 1", organic: 8500, paid: 5200 },
  { date: "May 15", organic: 11200, paid: 6900 },
  { date: "May 31", organic: 15100, paid: 9100 },
];

<AreaChart
  data={trafficData}
  index="date"
  series={[
    { key: "organic", label: "Organic Search", color: "chart1" },
    { key: "paid", label: "Paid Media", color: "chart2" },
  ]}
  curve="smooth"
  height={300}
  valueFormatter={(v) => \`\${(v / 1000).toFixed(1)}k\`}
/>`,

  BarChart: `const departmentSales = [
  { department: "Sales", q1: 145000, q2: 172000 },
  { department: "Marketing", q1: 88000, q2: 104000 },
  { department: "Engineering", q1: 195000, q2: 210000 },
];

<BarChart
  data={departmentSales}
  index="department"
  series={[
    { key: "q1", label: "Q1", color: "chart1" },
    { key: "q2", label: "Q2", color: "chart2" },
  ]}
  type="grouped"
  height={300}
  valueFormatter={(v) => \`$\${(v / 1000).toFixed(0)}k\`}
/>`,

  DonutChart: `const trafficSources = [
  { source: "Organic Search", visitors: 45200 },
  { source: "Direct Traffic", visitors: 28400 },
  { source: "Referral", visitors: 16800 },
  { source: "Social Media", visitors: 9600 },
];

<DonutChart
  data={trafficSources}
  category="source"
  value="visitors"
  size="md"
  centerLabel={
    <div className="text-center">
      <div className="text-2xl font-bold">100k</div>
      <div className="text-xs text-muted-foreground">Visits</div>
    </div>
  }
  valueFormatter={(v) => \`\${v.toLocaleString()} visits\`}
/>`,
};
