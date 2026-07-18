import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  Button,
  Badge,
  Alert,
  Spinner,
  Progress,
  Input,
  Textarea,
  Label,
  Hint,
  Field,
  Select,
  Checkbox,
  Radio,
  Switch,
  Slider,
  Segmented,
  ToggleGroup,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Stat,
  Avatar,
  AvatarGroup,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  Pagination,
  BottomNavigation,
  Table,
  TableWrap,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tooltip,
  Modal,
  ModalTitle,
  ModalDescription,
  ModalActions,
  ToastProvider,
  useToast,
  buttonVariants,
  MetricCard,
  DataTable,
  FormField,
  ErrorState,
  Skeleton,
  DashboardShell,
  TextField,
  SelectField,
  ComboboxField,
  CheckboxField,
  Calendar,
  DatePickerField,
  RangeCalendar,
  DateRangePickerField,
  Dropzone,
  FileUploadField,
  type UploadItem,
  SettingsLayout,
  DetailPageLayout,
  SectionHeader,
  TableToolbar,
  ConfirmDialog,
  Drawer,
  CommandPalette,
  SidebarNav,
  Fab,
  BottomSheet,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetContent,
  BottomSheetFooter,
  cn,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Kbd,
  CodeBlock,
  Separator,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
  TimelineTime,
  Stepper,
  StepperList,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
  StepperContent,
  useStepper
} from "@kjaniec-dev/ui";
import "./index.css";
import { ExampleTabs } from "./example-tabs";

interface IcoProps {
  s?: number;
  children: React.ReactNode;
}

function Ico(p: IcoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={p.s || 18}
      height={p.s || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {p.children}
    </svg>
  );
}

const IcoPlus = (
  <Ico>
    <path d="M5 12h14M12 5v14" />
  </Ico>
);
const IcoSearch = (
  <Ico>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Ico>
);
const IcoGear = (
  <Ico>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </Ico>
);
const IcoInfo = (
  <Ico>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </Ico>
);
const IcoCheck = (
  <Ico>
    <path d="M20 6 9 17l-5-5" />
  </Ico>
);
const IcoWarn = (
  <Ico>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Ico>
);
const IcoX = (
  <Ico>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6M9 9l6 6" />
  </Ico>
);
const IcoChev = (
  <Ico s={16}>
    <polyline points="6 9 12 15 18 9" />
  </Ico>
);
const IcoEdit = (
  <Ico s={16}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </Ico>
);
const IcoCopy = (
  <Ico s={16}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Ico>
);
const IcoTrash = (
  <Ico s={16}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Ico>
);
const IcoSun = (
  <Ico>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Ico>
);
const IcoMoon = (
  <Ico>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </Ico>
);

interface SecProps {
  id: string;
  title: string;
  desc?: string;
  /** Component names documented in the Props/Code tabs; omit to render children without tabs. */
  components?: string[];
  /** Explicit code snippet override passed through to ExampleTabs. */
  code?: string;
  children: React.ReactNode;
}

function Sec(p: SecProps) {
  return (
    <section id={p.id} className="mb-14 scroll-mt-24">
      <div className="mb-5">
        <h2 className="m-0 text-2xl font-bold tracking-[-0.02em]">{p.title}</h2>
        {p.desc && <p className="mt-1 text-sm text-muted-foreground max-w-[60ch]">{p.desc}</p>}
      </div>
      {p.components ? (
        <ExampleTabs components={p.components} code={p.code}>
          {p.children}
        </ExampleTabs>
      ) : (
        p.children
      )}
    </section>
  );
}

interface BoxProps {
  className?: string;
  children: React.ReactNode;
}

function Box(p: BoxProps) {
  return (
    <div className={cn("bg-card border border-border rounded-kj-xl p-7 shadow-kj-xs mb-5", p.className)}>
      {p.children}
    </div>
  );
}

interface SubProps {
  className?: string;
  children: React.ReactNode;
}

function Sub(p: SubProps) {
  return (
    <p className={cn("text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-3.5 mt-0", p.className)}>
      {p.children}
    </p>
  );
}

interface GridProps {
  children: React.ReactNode;
}

function Grid(p: GridProps) {
  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
      {p.children}
    </div>
  );
}

interface ProjectRow {
  name: string;
  status: "success" | "warning" | "danger" | "info";
  owner: string;
  budget: string;
}

const projectColumns = [
  {
    header: "Project Name",
    accessor: (row: ProjectRow) => <span className="font-semibold">{row.name}</span>,
    align: "left" as const,
    sortable: true,
    sortKey: "name",
  },
  {
    header: "Owner",
    accessor: (row: ProjectRow) => row.owner,
    align: "left" as const,
    sortable: true,
    sortKey: "owner",
  },
  {
    header: "Status",
    accessor: (row: ProjectRow) => {
      const badgeVariant = {
        success: "success" as const,
        warning: "warning" as const,
        danger: "danger" as const,
        info: "info" as const,
      }[row.status];
      return <Badge variant={badgeVariant} dot>{row.status}</Badge>;
    },
    align: "left" as const,
  },
  {
    header: "Budget",
    accessor: (row: ProjectRow) => <span className="font-mono">{row.budget}</span>,
    align: "right" as const,
    sortable: true,
    sortKey: "budget",
  },
];

const sampleProjects: ProjectRow[] = [
  { name: "KJ UI Kit v0.8.0", status: "success", owner: "K. Janiec", budget: "$15,400" },
  { name: "SaaS Dashboard Phase 2", status: "warning", owner: "M. Kowalski", budget: "$8,200" },
  { name: "Database Integration", status: "danger", owner: "J. Nowak", budget: "$22,000" },
  { name: "Marketing Landing Page", status: "info", owner: "A. Zielinski", budget: "$4,500" },
];

const NAV = [
  ["buttons", "Buttons"],
  ["badges", "Badges"],
  ["feedback", "Feedback"],
  ["forms", "Forms"],
  ["selection", "Selection"],
  ["cards", "Cards"],
  ["navigation", "Navigation"],
  ["data", "Table"],
  ["overlays", "Overlays"],
  ["primitives", "Primitives"],
  ["layouts", "Layouts"],
];

function StepperDemo() {
  const stepper = useStepper({ stepsCount: 3 });

  return (
    <div className="mt-8 border-t border-border/60 pt-6">
      <Sub className="mb-2">Stepper / Interactive Multi-Step Wizard</Sub>
      <p className="text-xs text-muted-foreground mb-4">
        An interactive multi-step progress indicator and form wizard supporting step completion, active indicators, titles, descriptions, and content panels using <code>useStepper</code>.
      </p>
      <Box className="mb-0">
        <Stepper value={stepper.activeStep} onValueChange={stepper.setStep}>
          <StepperList>
            <StepperItem value={0}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col text-left">
                  <StepperTitle>Account</StepperTitle>
                  <StepperDescription>User details</StepperDescription>
                </div>
              </StepperTrigger>
            </StepperItem>
            <StepperSeparator />
            <StepperItem value={1}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col text-left">
                  <StepperTitle>Shipping</StepperTitle>
                  <StepperDescription>Delivery address</StepperDescription>
                </div>
              </StepperTrigger>
            </StepperItem>
            <StepperSeparator />
            <StepperItem value={2}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col text-left">
                  <StepperTitle>Payment</StepperTitle>
                  <StepperDescription>Billing info</StepperDescription>
                </div>
              </StepperTrigger>
            </StepperItem>
          </StepperList>

          <div className="mt-6 p-5 border border-border rounded-kj-lg bg-surface min-h-[120px] flex flex-col justify-between">
            <StepperContent value={0}>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Step 1: Account Setup</h4>
                <p className="text-xs text-muted-foreground">Enter your contact email and password to create an account.</p>
                <div className="pt-2 max-w-xs">
                  <Input placeholder="email@company.com" />
                </div>
              </div>
            </StepperContent>

            <StepperContent value={1}>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Step 2: Shipping Address</h4>
                <p className="text-xs text-muted-foreground">Specify the physical delivery location for your package.</p>
                <div className="pt-2 max-w-xs">
                  <Input placeholder="123 Main St, City, Country" />
                </div>
              </div>
            </StepperContent>

            <StepperContent value={2}>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Step 3: Payment Details</h4>
                <p className="text-xs text-muted-foreground">Review your checkout total and enter payment details.</p>
                <div className="pt-2 max-w-xs">
                  <Input placeholder="Card number: •••• •••• •••• 4242" />
                </div>
              </div>
            </StepperContent>

            <div className="flex items-center justify-between pt-4 border-t border-border/60 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={stepper.prevStep}
                disabled={stepper.isFirstStep}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stepper.reset}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={stepper.isLastStep ? () => alert("Wizard completed!") : stepper.nextStep}
                >
                  {stepper.isLastStep ? "Complete" : "Next Step"}
                </Button>
              </div>
            </div>
          </div>
        </Stepper>
      </Box>
    </div>
  );
}

function Gallery() {
  const { toast } = useToast();
  const [dark, setDark] = React.useState(false);
  const [tab, setTab] = React.useState("overview");
  const [seg, setSeg] = React.useState("day");
  const [format, setFormat] = React.useState<string[]>(["bold"]);
  const [page, setPage] = React.useState(1);
  const [tablePage, setTablePage] = React.useState(1);
  const [bottomNavActive, setBottomNavActive] = React.useState("home");
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [prog, setProg] = React.useState(42);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("buttons");
  const [tableState, setTableState] = React.useState<"default" | "loading" | "empty" | "error">("default");
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  // New States for v0.7.0 features
  const [selectedRows, setSelectedRows] = React.useState<Set<React.Key>>(new Set());
  const [framework, setFramework] = React.useState("");
  const [stack, setStack] = React.useState<string[]>(["next"]);
  const frameworkOptions = [
    { value: "next", label: "Next.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt", label: "Nuxt" },
  ];
  const [meetingDate, setMeetingDate] = React.useState<Date | undefined>(undefined);
  const [inlineDate, setInlineDate] = React.useState<Date | undefined>(new Date());
  const [bookingRange, setBookingRange] = React.useState<{ start?: Date; end?: Date }>({});
  const [inlineRange, setInlineRange] = React.useState<{ start?: Date; end?: Date }>({});
  const [uploadFiles, setUploadFiles] = React.useState<UploadItem[]>([]);
  const [dropCount, setDropCount] = React.useState(0);
  React.useEffect(() => {
    if (!uploadFiles.some((it) => it.status === "pending" || it.status === "uploading")) return;
    const t = setInterval(() => {
      setUploadFiles((items) =>
        items.map((it) => {
          if (it.status === "success" || it.status === "error") return it;
          const next = (it.progress ?? 0) + 12;
          return next >= 100 ? { ...it, status: "success", progress: 100 } : { ...it, status: "uploading", progress: next };
        })
      );
    }, 400);
    return () => clearInterval(t);
  }, [uploadFiles]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<string | undefined>("name");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc" | undefined>("asc");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredProjects = React.useMemo(() => {
    let result = sampleProjects;
    if (searchQuery) {
      const cleanSearch = searchQuery.toLowerCase();
      result = sampleProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanSearch) ||
          p.owner.toLowerCase().includes(cleanSearch)
      );
    }

    if (sortBy && sortDirection) {
      result = [...result].sort((a, b) => {
        let valA: string | number = a[sortBy as keyof ProjectRow];
        let valB: string | number = b[sortBy as keyof ProjectRow];

        if (sortBy === "budget") {
          valA = parseFloat((valA as string).replace(/[^0-9.-]+/g, ""));
          valB = parseFloat((valB as string).replace(/[^0-9.-]+/g, ""));
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchQuery, sortBy, sortDirection]);

  const itemsPerPage = 2;
  const tablePageCount = React.useMemo(() => {
    return Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  }, [filteredProjects]);

  const activeTablePage = Math.min(tablePage, tablePageCount);

  const paginatedProjects = React.useMemo(() => {
    const start = (activeTablePage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, activeTablePage]);

  const cmdItems = [
    {
      id: "create-project",
      title: "Create new project",
      subtitle: "Add a new workspace to your dashboard",
      category: "Projects",
      shortcut: ["⌘", "N"],
      icon: IcoPlus,
      action: () => toast({ message: "Command: Create project selected", tone: "success" }),
    },
    {
      id: "toggle-theme",
      title: "Toggle dark mode",
      subtitle: "Switch between light and dark theme",
      category: "Settings",
      shortcut: ["⌘", "D"],
      icon: dark ? IcoSun : IcoMoon,
      action: () => setDark((d) => !d),
    },
    {
      id: "view-docs",
      title: "View documentation",
      subtitle: "Open the product kit documentation",
      category: "System",
      icon: IcoInfo,
      action: () => window.open("./docs/DESIGN.md", "_blank"),
    },
  ];

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  React.useEffect(() => {
    const t = setInterval(() => setProg((p) => (p >= 94 ? 22 : p + 18)), 1400);
    return () => clearInterval(t);
  }, []);
  React.useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);
  React.useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    NAV.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="gallery-layout">
      {/* sidebar */}
      <aside className="sticky top-0 self-start h-screen overflow-y-auto bg-surface border-r border-border p-6 max-[820px]:hidden">
        <div className="flex items-center gap-2.5 px-2 pb-5">
          <div className="grid place-items-center h-9 w-9 rounded-kj-md bg-primary text-primary-foreground font-bold font-mono shadow-kj-glow">
            KJ
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">@kjaniec-dev/ui</div>
            <div className="text-[0.7rem] text-muted-foreground font-mono">React · v0.8.0</div>
          </div>
        </div>
        <div className="text-[0.68rem] uppercase tracking-[0.09em] font-semibold text-muted-foreground px-3 pt-3 pb-1.5">
          Components
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map(([id, label]) => {
            const active = activeSection === id;
            return (
              <a
                key={id}
                href={"#" + id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-kj-sm text-sm font-medium no-underline transition-colors",
                  active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full transition-colors", active ? "bg-primary" : "bg-border")} />
                {label}
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        {/* topbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between gap-4 px-8 max-[820px]:px-5 py-4 border-b border-border"
          style={{
            background: "color-mix(in oklch, var(--kj-background) 82%, transparent)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="hidden max-[820px]:flex items-center justify-center h-9 w-9 rounded-kj-sm hover:bg-muted transition-colors cursor-pointer border-0 bg-transparent text-foreground"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Menu"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <div className="text-[0.95rem] font-semibold">
              Component demo <span className="text-muted-foreground font-normal">· interactive</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Badge variant="primary" dot>
              47 components
            </Badge>
            <Button variant="outline" size="icon" aria-label="Theme" onClick={() => setDark((d) => !d)}>
              {dark ? IcoSun : IcoMoon}
            </Button>
          </div>
        </header>

        <main className="px-8 max-[820px]:px-5 py-10 max-w-[1040px]">
          <Sec id="buttons" title="Buttons" desc="Five variants, three sizes, a loading state and icon buttons." components={["Button"]}>
            <Box>
              <Sub>Variants</Sub>
              <div className="flex flex-wrap gap-3 items-center">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div className="h-px bg-border my-5" />
              <Sub>Sizes, icon and states</Sub>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button>Medium</Button>
                <Button size="lg">Large</Button>
                <Button leadingIcon={IcoPlus}>New project</Button>
                <Button variant="outline" size="icon" aria-label="Settings">
                  {IcoGear}
                </Button>
                <Button
                  variant="secondary"
                  loading={loading}
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 1600);
                  }}
                >
                  Save
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </Box>
            <Box>
              <Sub>Floating Action Buttons (FAB)</Sub>
              <div className="flex flex-wrap gap-4 items-center">
                <Fab variant="primary" size="sm" position="none" icon={IcoPlus} label="Primary Small" />
                <Fab variant="secondary" size="md" position="none" icon={IcoGear} label="Secondary Medium" />
                <Fab variant="outline" size="lg" position="none" icon={IcoSearch} label="Outline Large" />
                <Fab variant="danger" size="md" position="none" icon={IcoTrash} label="Danger Medium" />
                <Fab variant="primary" size="md" position="none" loading icon={IcoPlus} label="Loading Medium" />
              </div>
            </Box>
          </Sec>

          <Sec id="badges" title="Badges" desc="Status labels in soft and solid variants." components={["Badge"]}>
            <Box>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge>Neutral</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success" dot>
                  Active
                </Badge>
                <Badge variant="warning" dot>
                  Pending
                </Badge>
                <Badge variant="danger" dot>
                  Error
                </Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="solid">Solid</Badge>
              </div>
            </Box>
          </Sec>

          <Sec id="feedback" title="Feedback & progress" desc="Inline alerts, toasts and progress indicators." components={["Alert", "ToastProvider", "Progress", "Spinner", "Skeleton"]}>
            <Box>
              <Sub>Alerts</Sub>
              <div className="flex flex-col gap-4">
                <Alert variant="info" icon={IcoInfo} title="New version available">
                  Version 0.4.0 adds navigation components and charts.
                </Alert>
                <Alert variant="success" icon={IcoCheck} title="Deployment complete">
                  All tests passed and the build is live in production.
                </Alert>
                <Alert variant="warning" icon={IcoWarn} title="Approaching your limit">
                  You have used 86% of your file storage this month.
                </Alert>
                <Alert variant="danger" icon={IcoX} title="Payment declined">
                  Update your payment method to avoid an interruption.
                </Alert>
              </div>
            </Box>
            <Grid>
              <Box className="mb-0">
                <Sub>Toasts</Sub>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" onClick={() => toast({ message: "Changes saved." })}>
                    Info
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast({ message: "Profile updated.", tone: "success" })}>
                    Success
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast({ message: "Could not delete.", tone: "danger" })}>
                    Error
                  </Button>
                </div>
              </Box>
              <Box className="mb-0">
                <Sub>Progress & spinner</Sub>
                <div className="flex flex-col gap-4">
                  <Progress value={prog} />
                  <Progress value={68} tone="secondary" />
                  <div className="flex items-center gap-3">
                    <Spinner />
                    <span className="text-sm text-muted-foreground">Loading data…</span>
                  </div>
                </div>
              </Box>
            </Grid>
            <Box className="mt-5">
              <Sub>ErrorState & Skeletons</Sub>
              <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
                <ErrorState
                  title="Database Sync Failed"
                  message="We could not sync the latest database tables because of an authentication error."
                  onRetry={() => alert("Retrying sync...")}
                  retryLabel="Retry Sync"
                  className="min-h-[220px] p-5"
                />
                <div className="p-5 border border-border rounded-kj-xl space-y-4 bg-surface flex flex-col justify-between">
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
                  </div>
                  <Skeleton variant="rectangular" width="100%" height={60} />
                </div>
              </div>
            </Box>
          </Sec>

          <Sec id="forms" title="Forms" desc="Fields with labels, leading icons, selects, textareas and live validation." components={["Input", "TextField", "Textarea", "Select", "SelectField", "Combobox", "ComboboxField", "Calendar", "DatePicker", "DatePickerField", "RangeCalendar", "DateRangePicker", "DateRangePickerField", "Dropzone", "FileUpload", "FileUploadField", "FormField"]}>
            <Box>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
                <Field>
                  <Label htmlFor="full-name" required>Full name</Label>
                  <Input id="full-name" placeholder="Jane Doe" />
                  <Hint>This is how your team will see you.</Hint>
                </Field>
                <Field>
                  <Label htmlFor="email" required>E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@company.com"
                    value={email}
                    error={email.length > 0 && !emailOk}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Hint error={email.length > 0 && !emailOk}>
                    {!email ? "We'll use it to sign you in." : emailOk ? "Looks good ✓" : "Enter a valid email address."}
                  </Hint>
                </Field>
                <Field>
                  <Label htmlFor="search">Search</Label>
                  <Input id="search" leadingIcon={IcoSearch} placeholder="Search projects…" />
                </Field>
                <Field>
                  <Label htmlFor="role">Role</Label>
                  <Select id="role">
                    <option>Administrator</option>
                    <option>Editor</option>
                    <option>View only</option>
                  </Select>
                </Field>
                <Field style={{ gridColumn: "1/-1" }}>
                  <Label htmlFor="project-desc">Project description</Label>
                  <Textarea id="project-desc" placeholder="What is this project about?" />
                </Field>
                <Field>
                  <Label htmlFor="disabled-field">Disabled field</Label>
                  <Input id="disabled-field" value="workspace-id-8842" disabled readOnly />
                </Field>
                <Field>
                  <Label htmlFor="error-field">Field with error</Label>
                  <Input id="error-field" value="not-ok" error readOnly />
                  <Hint error>Only lowercase letters and hyphens are allowed.</Hint>
                </Field>
              </div>
            </Box>
            <Box>
              <Sub>FormField (Unified wrapper)</Sub>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
                <FormField
                  label="Email address"
                  required
                  hint="We'll use it to sign you in."
                  error={email.length > 0 && !emailOk ? "Enter a valid email address." : undefined}
                >
                  <Input
                    type="email"
                    placeholder="jane@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormField>
                <FormField label="Target Workspace">
                  <Select>
                    <option>B2B SaaS Portal</option>
                    <option>Developer Dashboard</option>
                    <option>Portfolio Site</option>
                  </Select>
                </FormField>
              </div>
            </Box>
            <Box>
              <Sub>Convenient Field Components (v0.7.0)</Sub>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
                <TextField
                  label="E-mail"
                  required
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={email.length > 0 && !emailOk ? "Enter a valid email address." : undefined}
                  hint="We'll use it to sign you in."
                />
                <SelectField label="Subscription Status" defaultValue="active">
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="past_due">Past Due</option>
                </SelectField>
                <div className="flex items-center pt-5">
                  <CheckboxField
                    label="Accept terms & conditions"
                    hint="You must agree to continue."
                    defaultChecked
                  />
                </div>
              </div>
            </Box>
            <Box>
              <Sub>Combobox (searchable select)</Sub>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
                <ComboboxField
                  label="Primary framework"
                  hint="Type to filter the list."
                  options={frameworkOptions}
                  value={framework}
                  onChange={setFramework}
                  placeholder="Select a framework…"
                />
                <ComboboxField
                  label="Your stack"
                  hint="Pick as many as you like."
                  multiple
                  options={frameworkOptions}
                  value={stack}
                  onChange={setStack}
                  placeholder="Add frameworks…"
                />
              </div>
            </Box>
            <Box>
              <Sub>DatePicker / Calendar</Sub>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
                <DatePickerField
                  label="Meeting date"
                  hint="Weekends are disabled."
                  value={meetingDate}
                  onChange={setMeetingDate}
                  disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
                />
                <div>
                  <Sub>Calendar (standalone)</Sub>
                  <Calendar value={inlineDate} onChange={setInlineDate} />
                </div>
              </div>
            </Box>
            <Box>
              <Sub>DateRangePicker / RangeCalendar</Sub>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
                <DateRangePickerField
                  label="Booking dates"
                  hint="Weekends are disabled."
                  value={bookingRange}
                  onChange={setBookingRange}
                  disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
                />
              </div>
              <div className="mt-5">
                <Sub>RangeCalendar (standalone)</Sub>
                <RangeCalendar value={inlineRange} onChange={setInlineRange} />
              </div>
            </Box>
            <Box>
              <Sub>FileUpload / Dropzone</Sub>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
                <FileUploadField
                  label="Attachments"
                  hint="PDF or images, up to 5 MB each. Uploads are simulated."
                  accept="image/*,.pdf"
                  maxSize={5 * 1024 * 1024}
                  value={uploadFiles}
                  onChange={setUploadFiles}
                />
              </div>
              <div className="mt-5">
                <Sub>Dropzone (standalone)</Sub>
                <Dropzone onFiles={(files) => setDropCount((c) => c + files.length)} />
                <p className="mt-2 text-sm text-muted-foreground">{dropCount} file(s) received</p>
              </div>
            </Box>
          </Sec>

          <Sec id="selection" title="Selection controls" desc="Checkboxes, radios, switches, a slider, a segmented control and a multi-select toggle group." components={["Checkbox", "CheckboxField", "Radio", "Switch", "Slider", "Segmented", "ToggleGroup"]}>
            <Grid>
              <Box className="mb-0">
                <Sub>Checkbox & radio</Sub>
                <div className="flex flex-col gap-3">
                  <Checkbox defaultChecked label="Email notifications" />
                  <Checkbox label="Weekly report" />
                  <div className="h-px bg-border my-1" />
                  <Radio name="plan" defaultChecked label="Monthly plan" />
                  <Radio name="plan" label="Annual plan" />
                </div>
              </Box>
              <Box className="mb-0">
                <Sub>Switches, slider, segments</Sub>
                <div className="flex flex-col gap-4">
                  <Switch defaultChecked label="Dark mode for new users" />
                  <Switch label="Automatic backups" />
                  <Field>
                    <Label htmlFor="volume-field">Volume</Label>
                    <Slider id="volume-field" min={0} max={100} defaultValue={65} />
                  </Field>
                  <Segmented
                    value={seg}
                    onChange={setSeg}
                    options={[
                      { value: "day", label: "Day" },
                      { value: "week", label: "Week" },
                      { value: "month", label: "Month" },
                    ]}
                  />
                  <ToggleGroup
                    value={format}
                    onChange={setFormat}
                    aria-label="Text formatting"
                    options={[
                      { value: "bold", label: <strong>B</strong> },
                      { value: "italic", label: <em>I</em> },
                      { value: "underline", label: <span className="underline">U</span> },
                    ]}
                  />
                </div>
              </Box>
            </Grid>
          </Sec>

          <Sec id="cards" title="Cards & stats" desc="Cards with content and footer, with an image, and metric cards." components={["Card", "CardHeader", "CardTitle", "CardDescription", "CardContent", "CardFooter", "Stat", "MetricCard", "Avatar"]}>
            <Grid>
              <Card>
                <CardHeader>
                  <div>
                    <Badge variant="primary">Pro</Badge>
                  </div>
                  <CardTitle>Team Workspace</CardTitle>
                  <CardDescription>Unlimited projects, roles and activity history for your whole team.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button size="sm">Choose plan</Button>
                  <Button size="sm" variant="ghost">
                    Details
                  </Button>
                </CardFooter>
              </Card>
              <Card elevated>
                <div
                  className="h-[140px] grid place-items-center text-muted-foreground font-mono text-[0.72rem] tracking-wide"
                  style={{ background: "var(--kj-muted)" }}
                >
                  cover image · 16:9
                </div>
                <CardContent className="pt-[1.35rem]">
                  <CardTitle>Q3 Quarterly Report</CardTitle>
                  <CardDescription>A summary of results and key product metrics.</CardDescription>
                  <div className="flex items-center gap-3 mt-4">
                    <AvatarGroup>
                      <Avatar size="sm">AK</Avatar>
                      <Avatar size="sm" tone="primary">
                        MR
                      </Avatar>
                      <Avatar size="sm" tone="info">
                        JN
                      </Avatar>
                    </AvatarGroup>
                    <span className="text-sm text-muted-foreground">+5 contributors</span>
                  </div>
                </CardContent>
              </Card>
            </Grid>
            <div className="grid gap-5 mt-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
              <Stat label="MRR" value="$128.4k" delta="12.3% MoM" trend="up" />
              <Stat label="Active users" value="8,942" delta="4.1% MoM" trend="up" />
              <Stat label="Churn" value="2.8%" delta="0.6% MoM" trend="down" />
            </div>
            <Sub className="mt-5">Metric Cards (v0.7.0)</Sub>
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
              <MetricCard
                title="Active Subscriptions"
                value="1,429"
                trend="+8.2%"
                trendDirection="up"
                description="Compared to last month"
                icon={IcoPlus}
              />
              <MetricCard
                title="Failed Payments"
                value="23"
                trend="-4.1%"
                trendDirection="down"
                description="Action required for 12 accounts"
                icon={IcoWarn}
              />
              <MetricCard
                title="Server Response Time"
                value="142ms"
                trend="Stable"
                trendDirection="neutral"
                description="Avg latency across all zones"
                icon={IcoGear}
              />
            </div>
          </Sec>

          <Sec id="navigation" title="Navigation" desc="Tabs, dropdown menus, accordion, breadcrumbs, pagination and step wizard." components={["Tabs", "DropdownMenu", "Accordion", "Breadcrumb", "Pagination", "BottomNavigation", "Stepper"]}>
            <Grid>
              <Box className="mb-0">
                <Sub>Tabs</Sub>
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">A dashboard with key metrics and quick actions.</TabsContent>
                  <TabsContent value="activity">An event timeline: sign-ins, edits and team comments.</TabsContent>
                  <TabsContent value="settings">Workspace preferences, permissions and integrations.</TabsContent>
                </Tabs>
              </Box>
              <Box className="mb-0">
                <Sub>Dropdown menu</Sub>
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }))}>
                    Actions {IcoChev}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem icon={IcoEdit}>Edit</DropdownMenuItem>
                    <DropdownMenuItem icon={IcoCopy}>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem danger icon={IcoTrash}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Box>
            </Grid>
            <Sub className="mt-5">Accordion</Sub>
            <Accordion type="single" defaultValue={["a"]} className="mb-5">
              <AccordionItem value="a">
                <AccordionTrigger>How does billing work?</AccordionTrigger>
                <AccordionContent>Billed monthly or annually. The annual plan includes two months free.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>Can I change my plan later?</AccordionTrigger>
                <AccordionContent>Yes, at any time. The difference is prorated.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="c">
                <AccordionTrigger>What payment methods are supported?</AccordionTrigger>
                <AccordionContent>Visa, Mastercard and Apple Pay.</AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <Breadcrumb>
                <BreadcrumbItem href="#">Workspace</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem href="#">Projects</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem current>Q3 Launch</BreadcrumbItem>
              </Breadcrumb>
              <Pagination page={page} pageCount={9} onPageChange={setPage} />
            </div>

            <div className="mt-8 border-t border-border/60 pt-6">
              <Sub className="mb-2">Bottom Navigation (Mobile-first)</Sub>
              <p className="text-xs text-muted-foreground mb-4">
                A responsive bottom navigation bar designed for mobile apps, featuring active styling indicators, badge notifications, and glassmorphic styling.
              </p>
              <div className="max-w-[360px] mx-auto border border-border rounded-kj-xl overflow-hidden bg-canvas relative h-[140px] flex flex-col justify-end shadow-kj-sm">
                <div className="flex-1 p-4 flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Mobile App Simulator</span>
                   <span className="text-xs font-semibold text-foreground mt-1.5">Active tab: {bottomNavActive.toUpperCase()}</span>
                </div>
                <BottomNavigation
                  fixed={false}
                  showLabels="always"
                  items={[
                    { id: "home", label: "Home", icon: IcoInfo, active: bottomNavActive === "home", onClick: () => setBottomNavActive("home") },
                    { id: "search", label: "Search", icon: IcoSearch, active: bottomNavActive === "search", onClick: () => setBottomNavActive("search") },
                    { id: "alerts", label: "Alerts", icon: IcoSun, active: bottomNavActive === "alerts", badge: "3", onClick: () => setBottomNavActive("alerts") },
                    { id: "settings", label: "Settings", icon: IcoGear, active: bottomNavActive === "settings", onClick: () => setBottomNavActive("settings") },
                  ]}
                />
              </div>
            </div>
            <StepperDemo />
          </Sec>

          <Sec id="data" title="Table & data" desc="A table with statuses, avatars and aligned numbers." components={["DataTable", "DataTableColumn", "Table", "TableToolbar", "EmptyState", "ErrorState"]}>
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead numeric>Projects</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm" tone="primary">
                          AK
                        </Avatar>
                        Anna Kowalski
                      </div>
                    </TableCell>
                    <TableCell>Administrator</TableCell>
                    <TableCell>
                      <Badge variant="success" dot>
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell numeric>24</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm">MR</Avatar>
                        Michael Rutkowski
                      </div>
                    </TableCell>
                    <TableCell>Editor</TableCell>
                    <TableCell>
                      <Badge variant="warning" dot>
                        Invited
                      </Badge>
                    </TableCell>
                    <TableCell numeric>12</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm" tone="info">
                          JN
                        </Avatar>
                        Julia Nowak
                      </div>
                    </TableCell>
                    <TableCell>Viewer</TableCell>
                    <TableCell>
                      <Badge>Inactive</Badge>
                    </TableCell>
                    <TableCell numeric>3</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableWrap>
            <Sub className="mt-5">DataTable (v0.7.0 with built-in selection, custom toolbar and pagination)</Sub>
            <Box>
              <div className="flex flex-wrap gap-3 mb-4">
                <Button
                  variant={tableState === "default" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTableState("default")}
                >
                  Default
                </Button>
                <Button
                  variant={tableState === "loading" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTableState("loading")}
                >
                  Loading
                </Button>
                <Button
                  variant={tableState === "empty" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTableState("empty")}
                >
                  Empty
                </Button>
                <Button
                  variant={tableState === "error" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTableState("error")}
                >
                  Error
                </Button>
              </div>
              <DataTable
                columns={projectColumns}
                data={tableState === "empty" ? [] : paginatedProjects}
                loading={tableState === "loading"}
                error={tableState === "error" ? "Could not retrieve project records. Please try again." : undefined}
                emptyTitle="No projects found"
                emptyDescription="Get started by creating a new SaaS project."
                emptyAction={<Button size="sm">Create Project</Button>}
                getRowKey={(row) => row.name}
                onRowClick={(row) => toast({ message: `Opened project: ${row.name}`, tone: "default" })}
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={(key, dir) => {
                  setSortBy(key);
                  setSortDirection(dir);
                  toast({ message: `Sorted by ${key} (${dir})`, tone: "default" });
                }}
                toolbar={
                  <TableToolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search projects by name or owner..."
                    actions={
                      <>
                        {selectedRows.size > 0 && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setConfirmOpen(true)}
                          >
                            Delete ({selectedRows.size})
                          </Button>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          leadingIcon={IcoPlus}
                          onClick={() => toast({ message: "Action: Create New Project", tone: "success" })}
                        >
                          New Project
                        </Button>
                      </>
                    }
                  />
                }
                pagination={
                  <Pagination
                    page={activeTablePage}
                    pageCount={tablePageCount}
                    onPageChange={setTablePage}
                  />
                }
              />
            </Box>
          </Sec>

          <Sec id="overlays" title="Overlays & Dialogs" desc="Modals, confirm dialogs, side drawers, command palettes and tooltips." components={["Modal", "ConfirmDialog", "Drawer", "CommandPalette", "Tooltip", "BottomSheet", "Fab"]}>
            <Box>
              <div className="flex flex-wrap gap-3 items-center">
                <Button onClick={() => setOpen(true)}>Open custom modal</Button>
                <Button variant="outline" onClick={() => setConfirmOpen(true)}>Open Confirm Dialog</Button>
                <Button variant="outline" onClick={() => setDrawerOpen(true)}>Open Side Drawer</Button>
                <Button variant="outline" onClick={() => setBottomSheetOpen(true)}>Open Bottom Sheet</Button>
                <Button
                  variant="outline"
                  onClick={() => setCmdOpen(true)}
                  leadingIcon={
                    <span className="font-mono text-xs border border-border px-1.5 py-0.5 rounded bg-subtle">⌘K</span>
                  }
                >
                  Open Command Palette
                </Button>
                <Tooltip content="Contextual tooltip">
                  <Button variant="ghost">Hover for Tooltip</Button>
                </Tooltip>
              </div>
            </Box>
          </Sec>

          <Sec
            id="primitives"
            title="Primitives"
            desc="Popover panels, keyboard hints and code blocks."
            components={["Popover", "PopoverContent", "Kbd", "CodeBlock", "Separator", "Timeline"]}
            code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Filters</Button>
  </PopoverTrigger>
  <PopoverContent side="bottom" align="start" className="w-64">
    Any content here.
  </PopoverContent>
</Popover>`}
          >
            <Box>
              <Sub>Popover</Sub>
              <div className="flex flex-wrap gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open popover</Button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-64">
                    <p className="m-0 mb-1 text-sm font-semibold">Quick help</p>
                    <p className="m-0 text-sm text-muted-foreground">
                      Popovers hold arbitrary content — filters, hints, pickers.
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
            </Box>
            <Box>
              <Sub>Keyboard hints</Sub>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  Command palette <Kbd keys={["⌘", "K"]} />
                </span>
                <span className="inline-flex items-center gap-2">
                  Save <Kbd>⌘S</Kbd>
                </span>
                <span className="inline-flex items-center gap-2">
                  Close <Kbd>Esc</Kbd>
                </span>
              </div>
            </Box>
            <Box>
              <Sub>Separator</Sub>
              <div className="w-64">
                <p className="m-0 text-sm">Above</p>
                <Separator className="my-3" />
                <p className="m-0 text-sm">Below</p>
              </div>
              <div className="mt-4 flex items-stretch gap-3 h-8">
                <span className="text-sm text-muted-foreground">Left</span>
                <Separator orientation="vertical" />
                <span className="text-sm text-muted-foreground">Right</span>
              </div>
            </Box>
            <Box>
              <Sub>Timeline / Activity Feed</Sub>
              <Timeline>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot size="lg" variant="primary" className="font-bold text-xs">
                      AK
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Aleksandra Kowalska</span>
                      <span className="text-xs text-muted-foreground">pushed to main</span>
                      <TimelineTime className="ml-auto">10m ago</TimelineTime>
                    </div>
                    <div className="mt-2 text-xs bg-muted border border-border p-3 rounded-lg font-mono text-muted-foreground">
                      feat(auth): add OAuth provider login options
                    </div>
                  </TimelineContent>
                </TimelineItem>

                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot size="lg" variant="success" className="font-bold text-xs flex items-center justify-center">
                      ✓
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <div className="flex items-center gap-2">
                      <TimelineTitle>Build Succeeded</TimelineTitle>
                      <TimelineTime className="ml-auto">1h ago</TimelineTime>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Compiled assets successfully in 42s.
                    </p>
                  </TimelineContent>
                </TimelineItem>
              </Timeline>
            </Box>
            <Box>
              <Sub>Code block</Sub>
              <CodeBlock
                filename="save-button.tsx"
                code={`import { Button } from "@kjaniec-dev/ui";

<Button variant="primary">Save</Button>`}
              />
            </Box>
          </Sec>

          <Sec id="layouts" title="Layouts" desc="Full-page shell and page templates for SaaS/B2B products." components={["DashboardShell", "SettingsLayout", "DetailPageLayout", "PageHeader", "SectionHeader", "SidebarNav"]}>
            <Tabs defaultValue="dashboard">
              <TabsList className="mb-4">
                <TabsTrigger value="dashboard">DashboardShell</TabsTrigger>
                <TabsTrigger value="settings">SettingsLayout</TabsTrigger>
                <TabsTrigger value="detail">DetailPageLayout</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <div className="border border-border rounded-kj-xl overflow-hidden bg-canvas h-[380px] relative">
                  {(() => {
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
                    );
                  })()}
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

            <Box>
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
          </Sec>

          <footer className="text-[0.8rem] text-muted-foreground pt-8 mt-4 border-t border-border">
            Real components from <span className="font-mono">@kjaniec-dev/ui</span>, styled with tokens from{" "}
            <span className="font-mono">@kjaniec-dev/design</span>. The same code ships in the repo.
          </footer>
        </main>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalTitle>Delete project "Q3 Launch"?</ModalTitle>
        <ModalDescription>
          This action cannot be undone. All files and activity history will be permanently deleted.
        </ModalDescription>
        <ModalActions>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setOpen(false);
              toast({ message: "Project deleted.", tone: "danger" });
            }}
          >
            Delete project
          </Button>
        </ModalActions>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={selectedRows.size > 0 ? `Delete ${selectedRows.size} projects?` : "Delete selection?"}
        description="Are you sure you want to delete the selected projects? This action is permanent and cannot be undone."
        confirmLabel="Delete selected"
        tone="danger"
        loading={confirmLoading}
        onConfirm={() => {
          setConfirmLoading(true);
          setTimeout(() => {
            setConfirmLoading(false);
            setConfirmOpen(false);
            setSelectedRows(new Set());
            toast({ message: "Deleted projects successfully", tone: "danger" });
          }, 1500);
        }}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Project Specifications"
        description="Detailed B2B system configurations for the selected workspace."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Health</h4>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="text-[10px] text-muted-foreground">Uptime</div>
                <div className="text-sm font-bold text-success">99.98%</div>
              </Card>
              <Card className="p-3">
                <div className="text-[10px] text-muted-foreground">API Latency</div>
                <div className="text-sm font-bold">42ms</div>
              </Card>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">General Settings</h4>
            <TextField label="Database URL" defaultValue="postgresql://db.kjaniec.dev:5432/main" readOnly />
            <SelectField label="Backup Frequency" defaultValue="daily">
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </SelectField>
            <CheckboxField label="Enable audit logs mirroring" defaultChecked />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>Close</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setDrawerOpen(false);
                toast({ message: "Settings saved", tone: "success" });
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Drawer>

      <BottomSheet
        open={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
      >
        <BottomSheetHeader>
          <BottomSheetTitle>Share this project</BottomSheetTitle>
          <BottomSheetDescription>
            Invite collaborators or copy a shareable link to this workspace.
          </BottomSheetDescription>
        </BottomSheetHeader>
        <BottomSheetContent>
          <div className="space-y-4">
            <TextField label="Share link" defaultValue="https://app.kjaniec.dev/share/proj-8f3a" readOnly />
            <SelectField label="Access level" defaultValue="view">
              <option value="view">View only</option>
              <option value="comment">Can comment</option>
              <option value="edit">Can edit</option>
            </SelectField>
            <CheckboxField label="Notify collaborators by email" defaultChecked />
          </div>
        </BottomSheetContent>
        <BottomSheetFooter>
          <Button variant="outline" onClick={() => setBottomSheetOpen(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              setBottomSheetOpen(false);
              toast({ message: "Invite link copied!", tone: "success" });
            }}
          >
            Copy &amp; Share
          </Button>
        </BottomSheetFooter>
      </BottomSheet>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        items={cmdItems}
      />

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSidebarOpen(false)}>
          <aside
            className="w-[260px] h-full overflow-y-auto bg-surface border-r border-border p-6 shadow-kj-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 px-2 pb-5">
              <div className="grid place-items-center h-9 w-9 rounded-kj-md bg-primary text-primary-foreground font-bold font-mono shadow-kj-glow">
                KJ
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">@kjaniec-dev/ui</div>
                <div className="text-[0.7rem] text-muted-foreground font-mono">React · v0.8.0</div>
              </div>
            </div>
            <div className="text-[0.68rem] uppercase tracking-[0.09em] font-semibold text-muted-foreground px-3 pt-3 pb-1.5">
              Components
            </div>
            <nav className="flex flex-col gap-0.5">
              {NAV.map(([id, label]) => {
                const active = activeSection === id;
                return (
                  <a
                    key={id}
                    href={"#" + id}
                    onClick={() => {
                      setActiveSection(id);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-kj-sm text-sm font-medium no-underline transition-colors",
                      active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full transition-colors", active ? "bg-primary" : "bg-border")} />
                    {label}
                  </a>
                );
              })}
            </nav>
          </aside>
          <div className="flex-1" style={{ background: "rgba(0,0,0,0.5)" }} />
        </div>
      )}
      <Fab
        mobileOnly
        position="bottom-right"
        icon={IcoPlus}
        label="Floating action"
        onClick={() => toast({ message: "Mobile FAB clicked", tone: "success" })}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ToastProvider>
    <Gallery />
  </ToastProvider>
);
