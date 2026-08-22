import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Stat,
  MetricCard,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  TableWrap,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  DataTable,
  TableToolbar,
  Pagination,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
  TimelineTime,
  CodeBlock,
  ProjectCard,
  BlogCard,
  PricingCard,
  ImageGallery,
  type GalleryImage,
  useToast,
} from "@kjaniec-dev/ui";
import { Sec, Box, Sub, Grid, IcoPlus, IcoWarn, IcoGear } from "./primitives";

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
      return (
        <Badge variant={badgeVariant} dot>
          {row.status}
        </Badge>
      );
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

function DataTableDemo() {
  const { toast } = useToast();
  const [tablePage, setTablePage] = React.useState(1);
  const [tableState, setTableState] = React.useState<"default" | "loading" | "empty" | "error">(
    "default"
  );
  const [selectedRows, setSelectedRows] = React.useState<Set<React.Key>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<string | undefined>("name");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc" | undefined>("asc");

  const filteredProjects = React.useMemo(() => {
    let result = sampleProjects;
    if (searchQuery) {
      const cleanSearch = searchQuery.toLowerCase();
      result = sampleProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanSearch) || p.owner.toLowerCase().includes(cleanSearch)
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

  return (
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
        error={
          tableState === "error"
            ? "Could not retrieve project records. Please try again."
            : undefined
        }
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
                    onClick={() => {
                      toast({
                        message: `Deleted ${selectedRows.size} selected projects`,
                        tone: "danger",
                      });
                      setSelectedRows(new Set());
                    }}
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
  );
}

export function DataDisplaySections() {
  return (
    <>
      <Sec
        id="cards"
        title="Cards & stats"
        desc="Cards with content and footer, cover images, metrics, and domain-specific card suites."
        components={[
          "Card",
          "CardHeader",
          "CardTitle",
          "CardDescription",
          "CardContent",
          "CardFooter",
          "Stat",
          "MetricCard",
          "Avatar",
          "ProjectCard",
          "BlogCard",
          "PricingCard",
        ]}
      >
        <Grid>
          <Card>
            <CardHeader>
              <div>
                <Badge variant="primary">Pro</Badge>
              </div>
              <CardTitle>Team Workspace</CardTitle>
              <CardDescription>
                Unlimited projects, roles and activity history for your whole team.
              </CardDescription>
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
        <div
          className="grid gap-5 mt-5"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}
        >
          <Stat label="MRR" value="$128.4k" delta="12.3% MoM" trend="up" />
          <Stat label="Active users" value="8,942" delta="4.1% MoM" trend="up" />
          <Stat label="Churn" value="2.8%" delta="0.6% MoM" trend="down" />
        </div>
        <Sub className="mt-5">Metric Cards (v0.7.0)</Sub>
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}
        >
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
        <Sub className="mt-5">Card Suite (v0.8.0)</Sub>
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}
        >
          <ProjectCard
            title="UI Kit Development"
            description="Design system and reusable component library for React applications."
            status={{ label: "In Progress", variant: "info" }}
            techStack={["React", "TypeScript", "Tailwind"]}
            metrics={[
              { label: "Stars", value: "142" },
              { label: "Forks", value: "28" },
            ]}
          />
          <BlogCard
            title="Building Accessible Design Systems with React & Tailwind"
            description="Learn how to architect accessible, high-performance UI component libraries from scratch."
            category="Engineering"
            readTime="6 min read"
            publishedAt="Jul 18, 2026"
            author={{ name: "K. Janiec" }}
          />
          <PricingCard
            name="Pro Plan"
            price="$29"
            period="/month"
            description="For scaling teams building production B2B apps."
            badge="Popular"
            variant="featured"
            ctaText="Start Free Trial"
            features={[
              { text: "Unlimited projects & components" },
              { text: "Advanced data table & layout suites" },
              { text: "Priority email & Discord support" },
            ]}
          />
        </div>
      </Sec>

      <Sec
        id="data"
        title="Table & data"
        desc="Tables with statuses, avatars, aligned numbers, and interactive DataTables."
        components={["DataTable", "Table", "TableToolbar", "EmptyState", "ErrorState"]}
      >
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
        <Sub className="mt-5">
          DataTable (v0.7.0 with built-in selection, custom toolbar and pagination)
        </Sub>
        <DataTableDemo />
      </Sec>

      <Sec
        id="accordion"
        title="Accordion"
        desc="Collapsible content panels for FAQs and structured disclosure."
        components={["Accordion", "AccordionItem", "AccordionTrigger", "AccordionContent"]}
      >
        <Accordion type="single" defaultValue={["a"]} className="mb-5">
          <AccordionItem value="a">
            <AccordionTrigger>How does billing work?</AccordionTrigger>
            <AccordionContent>
              Billed monthly or annually. The annual plan includes two months free.
            </AccordionContent>
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
      </Sec>

      <Sec
        id="timeline-code"
        title="Timeline & CodeBlock"
        desc="Activity feeds and formatted code displays."
        components={[
          "Timeline",
          "TimelineItem",
          "TimelineSeparator",
          "TimelineConnector",
          "TimelineDot",
          "TimelineContent",
          "TimelineTitle",
          "TimelineTime",
          "CodeBlock",
        ]}
      >
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
                <TimelineDot
                  size="lg"
                  variant="success"
                  className="font-bold text-xs flex items-center justify-center"
                >
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

      <Sec
        id="gallery"
        title="Image Gallery"
        desc="Responsive grid of image thumbnails with interactive lightbox modal, title captions, and keyboard navigation."
        components={["ImageGallery"]}
      >
        <Box>
          <Sub>Default 3-Column Grid with Lightbox</Sub>
          <ImageGallery images={galleryImages} columns={3} aspectRatio="square" />
        </Box>
        <Box>
          <Sub>With Max Visible Overflow Overlay (+3)</Sub>
          <ImageGallery images={galleryImages} columns={4} maxVisible={4} aspectRatio="video" />
        </Box>
      </Sec>
    </>
  );
}

const galleryImages: GalleryImage[] = [
  {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
    thumbnailSrc:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80",
    alt: "Yosemite National Park Valley",
    title: "Yosemite Valley",
    caption: "Beautiful view of El Capitan and Half Dome at sunset",
  },
  {
    src: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1200&auto=format&fit=crop&q=80",
    thumbnailSrc:
      "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=400&auto=format&fit=crop&q=80",
    alt: "Pine tree forest during daytime",
    title: "Misty Forest",
    caption: "Morning fog drifting through a dense pine forest",
  },
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80",
    thumbnailSrc:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&auto=format&fit=crop&q=80",
    alt: "Foggy mountain peak",
    title: "Mountain Heights",
    caption: "Dramatic cloud layers covering distant alpine peaks",
  },
  {
    src: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&auto=format&fit=crop&q=80",
    thumbnailSrc:
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&auto=format&fit=crop&q=80",
    alt: "Mountain landscape with lake",
    title: "Emerald Lake",
    caption: "Crystal clear water reflecting mountain shadows",
  },
  {
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&auto=format&fit=crop&q=80",
    thumbnailSrc:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&auto=format&fit=crop&q=80",
    alt: "Green grass field under blue sky",
    title: "Rolling Hills",
    caption: "Vast green meadow extending towards the horizon",
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&auto=format&fit=crop&q=80",
    thumbnailSrc:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&auto=format&fit=crop&q=80",
    alt: "Sunlight filtering through trees",
    title: "Golden Hour Forest",
    caption: "Warm sunbeams illuminating woodland pathway",
  },
];
