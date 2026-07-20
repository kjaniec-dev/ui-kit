import * as React from "react";
import {
  Button,
  Badge,
  Alert,
  Spinner,
  Progress,
  Avatar,
  AvatarGroup,
  Stat,
  Kbd,
  Separator,
  Fab,
  useToast,
  ErrorState,
  Skeleton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
  TimelineTime,
  CodeBlock,
  cn,
} from "@kjaniec-dev/ui";
import { ExampleTabs } from "../example-tabs";

export interface IcoProps {
  s?: number;
  children: React.ReactNode;
}

export function Ico(p: IcoProps) {
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

export const IcoPlus = (
  <Ico>
    <path d="M5 12h14M12 5v14" />
  </Ico>
);
export const IcoSearch = (
  <Ico>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Ico>
);
export const IcoGear = (
  <Ico>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </Ico>
);
export const IcoInfo = (
  <Ico>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </Ico>
);
export const IcoCheck = (
  <Ico>
    <path d="M20 6 9 17l-5-5" />
  </Ico>
);
export const IcoWarn = (
  <Ico>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Ico>
);
export const IcoX = (
  <Ico>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6M9 9l6 6" />
  </Ico>
);
export const IcoChev = (
  <Ico s={16}>
    <polyline points="6 9 12 15 18 9" />
  </Ico>
);
export const IcoEdit = (
  <Ico s={16}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </Ico>
);
export const IcoCopy = (
  <Ico s={16}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Ico>
);
export const IcoTrash = (
  <Ico s={16}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Ico>
);
export const IcoSun = (
  <Ico>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Ico>
);
export const IcoMoon = (
  <Ico>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </Ico>
);

export interface SecProps {
  id: string;
  title: string;
  desc?: string;
  /** Component names documented in the Props/Code tabs; omit to render children without tabs. */
  components?: string[];
  /** Explicit code snippet override passed through to ExampleTabs. */
  code?: string;
  children: React.ReactNode;
}

export function Sec(p: SecProps) {
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

export interface BoxProps {
  className?: string;
  children: React.ReactNode;
}

export function Box(p: BoxProps) {
  return (
    <div className={cn("bg-card border border-border rounded-kj-xl p-7 shadow-kj-xs mb-5", p.className)}>
      {p.children}
    </div>
  );
}

export interface SubProps {
  className?: string;
  children: React.ReactNode;
}

export function Sub(p: SubProps) {
  return (
    <p className={cn("text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-3.5 mt-0", p.className)}>
      {p.children}
    </p>
  );
}

export interface GridProps {
  children: React.ReactNode;
}

export function Grid(p: GridProps) {
  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
      {p.children}
    </div>
  );
}

export interface CodeProps {
  className?: string;
  children: React.ReactNode;
}

export function Code(p: CodeProps) {
  return (
    <code className={cn("font-mono text-xs bg-muted px-1.5 py-0.5 rounded border border-border", p.className)}>
      {p.children}
    </code>
  );
}

export function PrimitivesSections() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [prog, setProg] = React.useState(42);

  React.useEffect(() => {
    const t = setInterval(() => setProg((p) => (p >= 94 ? 22 : p + 18)), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <>
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

      <Sec id="avatars-stats" title="Avatars & Stats" desc="User avatars, avatar groups, and statistics counters." components={["Avatar", "AvatarGroup", "Stat"]}>
        <Box>
          <Sub>Avatars</Sub>
          <div className="flex items-center gap-4">
            <Avatar size="sm">AK</Avatar>
            <Avatar size="md" tone="primary">MR</Avatar>
            <Avatar size="lg" tone="info">JN</Avatar>
            <AvatarGroup className="ml-4">
              <Avatar size="sm">AK</Avatar>
              <Avatar size="sm" tone="primary">MR</Avatar>
              <Avatar size="sm" tone="info">JN</Avatar>
            </AvatarGroup>
          </div>
        </Box>
        <Box>
          <Sub>Stats</Sub>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            <Stat label="MRR" value="$128.4k" delta="12.3% MoM" trend="up" />
            <Stat label="Active users" value="8,942" delta="4.1% MoM" trend="up" />
            <Stat label="Churn" value="2.8%" delta="0.6% MoM" trend="down" />
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
    </>
  );
}
