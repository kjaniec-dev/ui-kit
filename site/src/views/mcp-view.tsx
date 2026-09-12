import { Badge, Button, Card, cn, MetricCard, ToastProvider, useToast } from "@kjaniec-dev/ui";
import * as React from "react";
import { HighlightedCode } from "../highlighted-code";

type ClientType = "cursor" | "claude" | "antigravity";

interface ClientConfig {
  id: ClientType;
  name: string;
  badge: string;
  filename: string;
  description: string;
  snippet: string;
  language: string;
  extraCommand?: string;
}

const CLIENT_CONFIGS: Record<ClientType, ClientConfig> = {
  cursor: {
    id: "cursor",
    name: "Cursor",
    badge: "IDE Integration",
    filename: ".cursor/mcp.json",
    description:
      "Configure in your workspace root at .cursor/mcp.json or via Cursor Settings > Features > MCP.",
    language: "json",
    snippet: JSON.stringify(
      {
        mcpServers: {
          "kj-ui": {
            type: "stdio",
            command: "npx",
            args: ["-y", "@kjaniec-dev/ui-mcp"],
          },
        },
      },
      null,
      2
    ),
  },
  claude: {
    id: "claude",
    name: "Claude Desktop",
    badge: "Desktop App",
    filename: "claude_desktop_config.json",
    description:
      "Add to ~/Library/Application Support/Claude/claude_desktop_config.json (macOS) or %APPDATA%\\Claude\\claude_desktop_config.json (Windows).",
    language: "json",
    snippet: JSON.stringify(
      {
        mcpServers: {
          "kj-ui": {
            command: "npx",
            args: ["-y", "@kjaniec-dev/ui-mcp"],
          },
        },
      },
      null,
      2
    ),
  },
  antigravity: {
    id: "antigravity",
    name: "Antigravity",
    badge: "Agentic CLI & stdio",
    filename: "npx -y @kjaniec-dev/ui-mcp",
    description:
      "Execute directly from your terminal or add to Antigravity MCP settings to empower autonomous coding agents.",
    language: "json",
    extraCommand: "npx -y @kjaniec-dev/ui-mcp",
    snippet: JSON.stringify(
      {
        mcpServers: {
          "kj-ui": {
            type: "stdio",
            command: "npx",
            args: ["-y", "@kjaniec-dev/ui-mcp"],
          },
        },
      },
      null,
      2
    ),
  },
};

interface ToolReference {
  name: string;
  parameters: string;
  returnType: string;
  summary: string;
  description: string;
  exampleCall: string;
}

const MCP_TOOLS: ToolReference[] = [
  {
    name: "list_components",
    parameters: "None",
    returnType: "Array<{ name, description, variants }>",
    summary: "Lists all 140+ components and variants",
    description:
      "Provides component names, descriptions, and variant groups for all available UI components in the design system.",
    exampleCall: "list_components()",
  },
  {
    name: "get_component",
    parameters: "name: string (e.g. 'MetricCard')",
    returnType: "Markdown specification",
    summary: "Detailed props, JSDoc definitions, and story snippets",
    description:
      "Returns full markdown documentation including import statement, complete props table, CVA style variants, and usage example.",
    exampleCall: 'get_component({ name: "MetricCard" })',
  },
  {
    name: "get_tokens",
    parameters: "category?: 'color' | 'radius' | 'shadow' | 'font'",
    returnType: "Array<TokenDefinition>",
    summary: "CSS variables and Tailwind utility maps",
    description:
      "Returns light/dark token values and utility classes for OKLCH colors, border radiuses, box shadows, and typography.",
    exampleCall: 'get_tokens({ category: "color" })',
  },
  {
    name: "search_components",
    parameters: "query: string (e.g. 'stat metric card')",
    returnType: "Array<{ name, description, importPath }>",
    summary: "Fuzzy search for use cases and components",
    description:
      "Searches component names, descriptions, prop names, and story snippets to pinpoint the exact component for your requirement.",
    exampleCall: 'search_components({ query: "stat metric card" })',
  },
];

const SIMULATED_GENERATED_CODE = `import { Badge, Button, Card, MetricCard } from "@kjaniec-dev/ui";

export function RevenueCard() {
  return (
    <Card className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Financial Summary
        </span>
        <Badge variant="success" dot>
          Live Data
        </Badge>
      </div>

      <MetricCard
        title="Monthly Recurring Revenue"
        value="$48,250"
        trend="+14.2%"
        trendDirection="up"
        description="vs. last month ($42,240)"
      />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button variant="outline" size="sm">
          Download CSV
        </Button>
        <Button variant="primary" size="sm">
          View Analytics
        </Button>
      </div>
    </Card>
  );
}`;

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

type CopiedTarget = "config" | "command" | null;

function McpContent() {
  const [activeClient, setActiveClient] = React.useState<ClientType>("cursor");
  const [copiedTarget, setCopiedTarget] = React.useState<CopiedTarget>(null);
  const copyTimer = React.useRef<number | undefined>(undefined);
  const { toast } = useToast();

  const currentConfig = CLIENT_CONFIGS[activeClient];

  React.useEffect(() => {
    return () => {
      if (copyTimer.current) {
        window.clearTimeout(copyTimer.current);
      }
    };
  }, []);

  const handleCopy = React.useCallback(
    (textToCopy: string, target: "config" | "command", label: string) => {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            setCopiedTarget(target);
            toast({
              message:
                target === "config"
                  ? `Copied ${label} configuration to clipboard`
                  : `Copied ${label} to clipboard`,
              tone: "success",
            });
            if (copyTimer.current) {
              window.clearTimeout(copyTimer.current);
            }
            copyTimer.current = window.setTimeout(() => setCopiedTarget(null), 2000);
          })
          .catch(() => {
            /* clipboard failed */
          });
      }
    },
    [toast]
  );

  return (
    <div className="max-w-[1040px] mx-auto px-6 max-[820px]:px-4 py-10 flex flex-col gap-14 font-sans text-foreground">
      {/* Hero / Overview Header */}
      <header className="flex flex-col gap-4 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary" dot>
            KJ Product Kit · MCP
          </Badge>
          <Badge variant="neutral">@kjaniec-dev/ui-mcp</Badge>
          <Badge variant="neutral">Model Context Protocol</Badge>
          <Badge variant="neutral">stdio / JSON-RPC</Badge>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground m-0">
            Model Context Protocol (MCP) Guide
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-[75ch] leading-relaxed">
            Connect AI coding assistants directly to the KJ Product Kit design system. With{" "}
            <code className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-primary">
              @kjaniec-dev/ui-mcp
            </code>
            , agents access real React prop schemas, CVA variants, and OKLCH design tokens for
            zero-hallucination, design-token-aware UI generation.
          </p>
        </div>

        {/* Value Props Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <Card className="p-4 border-border bg-surface/70 flex flex-col gap-1.5 shadow-kj-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Agentic Context
            </span>
            <span className="text-sm font-medium text-foreground">
              Direct Knowledge of 140+ Components
            </span>
            <p className="text-xs text-muted-foreground m-0 leading-relaxed">
              Provides real imports, TypeScript signatures, and storybook usage snippets without
              hallucinations.
            </p>
          </Card>

          <Card className="p-4 border-border bg-surface/70 flex flex-col gap-1.5 shadow-kj-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Design-Token Aware
            </span>
            <span className="text-sm font-medium text-foreground">
              OKLCH &amp; Tailwind 4 Ready
            </span>
            <p className="text-xs text-muted-foreground m-0 leading-relaxed">
              Agents query semantic tokens (<code className="font-mono">--kj-*</code>) and mapped
              Tailwind utility classes directly.
            </p>
          </Card>

          <Card className="p-4 border-border bg-surface/70 flex flex-col gap-1.5 shadow-kj-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Instant Setup
            </span>
            <span className="text-sm font-medium text-foreground">Zero-Config stdio Execution</span>
            <p className="text-xs text-muted-foreground m-0 leading-relaxed">
              Run dynamically with <code className="font-mono">npx -y @kjaniec-dev/ui-mcp</code> in
              any MCP-compliant environment.
            </p>
          </Card>
        </div>
      </header>

      {/* 1-Click Configurations Section */}
      <section className="flex flex-col gap-6" aria-labelledby="configurations-heading">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Setup</Badge>
            <h2 id="configurations-heading" className="text-2xl font-bold tracking-tight m-0">
              1-Click Client Configurations
            </h2>
          </div>
          <p className="text-sm text-muted-foreground m-0">
            Select your agent environment to copy its turnkey configuration snippet into your
            project or client settings.
          </p>
        </div>

        <Card className="border-border bg-surface shadow-kj-sm overflow-hidden flex flex-col">
          {/* Client Tab Bar */}
          <div
            role="tablist"
            aria-label="MCP Client Selector"
            className="flex items-center border-b border-border bg-muted/40 px-3 pt-2 gap-2 overflow-x-auto"
          >
            {(Object.keys(CLIENT_CONFIGS) as ClientType[]).map((key) => {
              const cfg = CLIENT_CONFIGS[key];
              const isActive = activeClient === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`tab-${key}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${key}`}
                  onClick={() => {
                    setActiveClient(key);
                    setCopiedTarget(null);
                  }}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-kj-md transition-colors cursor-pointer border-b-2 flex items-center gap-2 -mb-[1px]",
                    isActive
                      ? "bg-surface border-primary text-foreground font-semibold shadow-xs"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <span>{cfg.name}</span>
                  <Badge variant={isActive ? "primary" : "neutral"}>{cfg.badge}</Badge>
                </button>
              );
            })}
          </div>

          {/* Active Config Panel */}
          <div
            id={`panel-${currentConfig.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${currentConfig.id}`}
            className="p-6 flex flex-col gap-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Target Configuration File
                  </span>
                </div>
                <div className="font-mono text-sm text-foreground font-semibold flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-muted/80 border border-border">
                    {currentConfig.filename}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground m-0 pt-0.5">
                  {currentConfig.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCopy(currentConfig.snippet, "config", currentConfig.name)}
                  className="cursor-pointer flex items-center gap-1.5"
                >
                  {copiedTarget === "config" ? (
                    <>
                      <CheckIcon className="w-4 h-4 text-primary-foreground" />
                      <span>Copied Config!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      <span>Copy Configuration</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick CLI command for Antigravity or generic runners */}
            {currentConfig.extraCommand && (
              <div className="flex flex-col gap-1.5 p-3 rounded-kj-md bg-muted/30 border border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Direct CLI Execution
                </span>
                <div className="flex items-center justify-between gap-2 font-mono text-xs text-foreground bg-muted/60 px-3 py-2 rounded border border-border/80">
                  <span>$ {currentConfig.extraCommand}</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(currentConfig.extraCommand!, "command", "CLI command")
                    }
                    className="text-[0.72rem] font-sans font-medium text-primary hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    {copiedTarget === "command" ? "Copied!" : "Copy Command"}
                  </button>
                </div>
              </div>
            )}

            {/* Code Block */}
            <div className="flex flex-col gap-1.5">
              <HighlightedCode
                code={currentConfig.snippet}
                language={currentConfig.language}
                filename={currentConfig.filename}
              />
            </div>
          </div>
        </Card>
      </section>

      {/* Tool Catalog Reference Section */}
      <section className="flex flex-col gap-6" aria-labelledby="tools-heading">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary">MCP Tools</Badge>
            <h2 id="tools-heading" className="text-2xl font-bold tracking-tight m-0">
              Tool Catalog Reference
            </h2>
          </div>
          <p className="text-sm text-muted-foreground m-0 max-w-[80ch]">
            The <code className="font-mono text-xs font-semibold">@kjaniec-dev/ui-mcp</code> server
            exposes 4 core tools and resources providing real-time introspection into 140+
            components and variants across the KJ Product Kit library.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MCP_TOOLS.map((tool) => (
            <Card
              key={tool.name}
              className="p-5 border-border bg-surface flex flex-col justify-between gap-4 shadow-kj-sm hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-primary">{tool.name}</span>
                    <Badge variant="neutral">Tool</Badge>
                  </div>
                </div>

                <div className="text-sm font-medium text-foreground leading-snug">
                  {tool.summary}
                </div>

                <p className="text-xs text-muted-foreground m-0 leading-relaxed">
                  {tool.description}
                </p>

                <div className="flex flex-col gap-1 text-xs pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-muted-foreground uppercase text-[0.68rem] tracking-wider shrink-0 w-20">
                      Parameters:
                    </span>
                    <code className="font-mono text-[0.72rem] text-foreground bg-muted/60 px-1.5 py-0.5 rounded break-all">
                      {tool.parameters}
                    </code>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-muted-foreground uppercase text-[0.68rem] tracking-wider shrink-0 w-20">
                      Returns:
                    </span>
                    <span className="font-mono text-[0.72rem] text-muted-foreground truncate">
                      {tool.returnType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex flex-col gap-1 font-mono text-xs">
                <span className="text-[0.68rem] font-semibold text-muted-foreground uppercase tracking-wider">
                  Agent Call Signature
                </span>
                <code className="bg-muted/40 border border-border/70 text-foreground px-2.5 py-1.5 rounded-kj-sm text-[0.75rem] overflow-x-auto">
                  {tool.exampleCall}
                </code>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Interactive AI Simulation Section */}
      <section className="flex flex-col gap-6" aria-labelledby="simulation-heading">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary">AI Dialogue</Badge>
            <h2 id="simulation-heading" className="text-2xl font-bold tracking-tight m-0">
              Simulated Agent Dialogue
            </h2>
          </div>
          <p className="text-sm text-muted-foreground m-0 max-w-[80ch]">
            An end-to-end trace showing how an autonomous agent queries the KJ Product Kit MCP
            server to retrieve exact prop definitions and produce compliant JSX.
          </p>
        </div>

        {/* Dialogue Stream Card */}
        <Card className="border-border bg-surface shadow-kj-sm overflow-hidden flex flex-col divide-y divide-border">
          {/* Step 1: User Prompt */}
          <div className="p-6 flex flex-col gap-3 bg-muted/10">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs font-mono">
                U
              </div>
              <span className="font-semibold text-sm text-foreground">User Prompt</span>
              <Badge variant="neutral">Requirement</Badge>
            </div>
            <div className="pl-9 text-sm text-foreground leading-relaxed bg-surface p-3.5 rounded-kj-md border border-border">
              “Build a responsive monthly recurring revenue stat card displaying an upward trend
              badge and a quick action button using KJ Product Kit.”
            </div>
          </div>

          {/* Step 2: Agent Thinking & MCP Tool Call */}
          <div className="p-6 flex flex-col gap-4 bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-secondary/20 text-secondary-600 dark:text-secondary-400 flex items-center justify-center font-bold text-xs font-mono">
                AI
              </div>
              <span className="font-semibold text-sm text-foreground">
                Agent Reasoning &amp; MCP Tool Call
              </span>
              <Badge variant="primary">Tool Execution</Badge>
            </div>

            <div className="pl-9 flex flex-col gap-3">
              <p className="text-xs text-muted-foreground m-0">
                Agent searches for available stat cards and retrieves the exact prop schema:
              </p>

              <div className="rounded-kj-md border border-border bg-surface p-3 font-mono text-xs flex flex-col gap-2">
                <div className="flex items-center justify-between text-muted-foreground border-b border-border/60 pb-1">
                  <span>
                    Call: <strong className="text-primary">get_component</strong>
                  </span>
                  <span>MCP Request</span>
                </div>
                <pre className="text-foreground m-0">{`{\n  "name": "MetricCard"\n}`}</pre>
              </div>

              <div className="rounded-kj-md border border-border bg-surface/80 p-3 font-mono text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-muted-foreground border-b border-border/60 pb-1">
                  <span>Server Response: props schema</span>
                  <span className="text-success font-semibold">• 200 OK</span>
                </div>
                <div className="text-muted-foreground text-[0.7rem] leading-relaxed">
                  Props: <code className="text-foreground">title: string</code>,{" "}
                  <code className="text-foreground">value: string</code>,{" "}
                  <code className="text-foreground">
                    trend?: string, trendDirection?: 'up'|'down'|'neutral'
                  </code>
                  , <code className="text-foreground">description?: string</code>. Pair with{" "}
                  <code className="text-foreground">Card</code>,{" "}
                  <code className="text-foreground">Badge</code>, and{" "}
                  <code className="text-foreground">Button</code>.
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Generated Compliant JSX */}
          <div className="p-6 flex flex-col gap-4 bg-muted/10">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-success/20 text-success flex items-center justify-center font-bold text-xs font-mono">
                ✓
              </div>
              <span className="font-semibold text-sm text-foreground">Generated Compliant JSX</span>
              <Badge variant="success">Zero Hallucinations</Badge>
            </div>

            <div className="pl-9 flex flex-col gap-4">
              <p className="text-xs text-muted-foreground m-0">
                The agent generates type-safe, token-compliant code ready to drop into the project:
              </p>

              <HighlightedCode
                code={SIMULATED_GENERATED_CODE}
                language="tsx"
                filename="revenue-card.tsx"
              />

              {/* Live Preview Render */}
              <div className="mt-2 flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Live Preview Output
                </span>
                <div className="p-6 rounded-kj-md border border-border bg-background flex items-center justify-center">
                  <div className="w-full max-w-sm">
                    <Card className="p-6 flex flex-col gap-4 shadow-kj-sm bg-surface">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Financial Summary
                        </span>
                        <Badge variant="success" dot>
                          Live Data
                        </Badge>
                      </div>

                      <MetricCard
                        title="Monthly Recurring Revenue"
                        value="$48,250"
                        trend="+14.2%"
                        trendDirection="up"
                        description="vs. last month ($42,240)"
                      />

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                        <Button variant="outline" size="sm">
                          Download CSV
                        </Button>
                        <Button variant="primary" size="sm">
                          View Analytics
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

export function McpView(): React.JSX.Element {
  return (
    <ToastProvider>
      <McpContent />
    </ToastProvider>
  );
}
