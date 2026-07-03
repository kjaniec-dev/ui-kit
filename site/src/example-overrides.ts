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
};
