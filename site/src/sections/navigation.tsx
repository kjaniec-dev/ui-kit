import * as React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  Pagination,
  BottomNavigation,
  Stepper,
  StepperList,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
  StepperContent,
  useStepper,
  CommandPalette,
  Input,
  Button,
  buttonVariants,
  Kbd,
  useToast,
  cn,
} from "@kjaniec-dev/ui";
import {
  Sec,
  Box,
  Sub,
  Grid,
  IcoChev,
  IcoEdit,
  IcoCopy,
  IcoTrash,
  IcoInfo,
  IcoSearch,
  IcoSun,
  IcoGear,
  IcoPlus,
} from "./primitives";

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

export function NavigationSections() {
  const [tab, setTab] = React.useState("overview");
  const [page, setPage] = React.useState(1);
  const [bottomNavActive, setBottomNavActive] = React.useState("home");
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const { toast } = useToast();

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
      id: "view-docs",
      title: "View documentation",
      subtitle: "Open the product kit documentation",
      category: "System",
      icon: IcoInfo,
      action: () => window.open("./docs/DESIGN.md", "_blank"),
    },
  ];

  return (
    <Sec
      id="navigation"
      title="Navigation"
      desc="Tabs, dropdown menus, accordion, breadcrumbs, pagination and step wizard."
      components={[
        "Tabs",
        "DropdownMenu",
        "Accordion",
        "Breadcrumb",
        "Pagination",
        "BottomNavigation",
        "Stepper",
        "CommandPalette",
      ]}
    >
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
      <div className="mt-8 border-t border-border/60 pt-6">
        <Sub className="mb-2">Command Palette</Sub>
        <p className="text-xs text-muted-foreground mb-4">
          A fast, accessible command palette for keyboard-first navigation and quick actions. Press <Kbd keys={["⌘", "K"]} /> or click below to launch.
        </p>
        <Box className="mb-0">
          <Button
            variant="outline"
            onClick={() => setCmdOpen(true)}
            leadingIcon={
              <span className="font-mono text-xs border border-border px-1.5 py-0.5 rounded bg-subtle">⌘K</span>
            }
          >
            Open Command Palette
          </Button>
        </Box>
        <CommandPalette
          open={cmdOpen}
          onClose={() => setCmdOpen(false)}
          items={cmdItems}
        />
      </div>
    </Sec>
  );
}
