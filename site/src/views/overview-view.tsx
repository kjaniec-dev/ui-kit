import {
  Badge,
  Button,
  buttonVariants,
  Card,
  cn,
  MetricCard,
  Segmented,
  ToastProvider,
  useToast,
} from "@kjaniec-dev/ui";
import * as React from "react";
import { GitHubIcon } from "../components/site-header";
import type { TabKey } from "../hooks/use-hash-route";

export interface OverviewViewProps {
  onNavigate: (tab: TabKey, subRoute?: string) => void;
}

type Period = "monthly" | "quarterly" | "annual";

interface MetricData {
  title: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
  description: string;
}

const METRICS_BY_PERIOD: Record<Period, MetricData> = {
  monthly: {
    title: "Monthly Recurring Revenue",
    value: "$48,250",
    trend: "+14.2%",
    trendDirection: "up",
    description: "vs. last month ($42,240)",
  },
  quarterly: {
    title: "Quarterly Revenue",
    value: "$144,750",
    trend: "+18.5%",
    trendDirection: "up",
    description: "vs. last quarter ($122,150)",
  },
  annual: {
    title: "Annual Run Rate",
    value: "$579,000",
    trend: "+24.0%",
    trendDirection: "up",
    description: "projected for FY2026",
  },
};

function TerminalSnippet({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<number | undefined>(undefined);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(command).then(() => {
        setCopied(true);
        window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  React.useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-muted/60 dark:bg-muted/40 border border-border rounded-kj-md font-mono text-sm">
      <div className="flex items-center gap-2 overflow-x-auto min-w-0">
        <span className="text-muted-foreground select-none">$</span>
        <span className="text-foreground select-all whitespace-nowrap">{command}</span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${command}`}
        className="shrink-0 text-xs font-sans font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded bg-surface hover:bg-muted border border-border cursor-pointer flex items-center gap-1.5"
      >
        {copied ? (
          <>
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-success"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Copied</span>
          </>
        ) : (
          <>
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
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}

function OverviewContent({ onNavigate }: OverviewViewProps) {
  const { toast } = useToast();
  const [period, setPeriod] = React.useState<Period>("monthly");
  const metric = METRICS_BY_PERIOD[period];

  return (
    <div className="max-w-[1040px] mx-auto px-6 max-[820px]:px-4 py-12 flex flex-col gap-16">
      {/* Hero Section */}
      <section className="flex flex-col gap-8 text-center sm:text-left">
        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <Badge variant="primary" dot>
            50+ Components &amp; 140+ Variants
          </Badge>
          <Badge variant="neutral">React 19</Badge>
          <Badge variant="neutral">Tailwind 4</Badge>
          <Badge variant="neutral">OKLCH Palette</Badge>
          <Badge variant="secondary">MCP Native</Badge>
          <Badge variant="neutral">TypeScript</Badge>
        </div>

        {/* Title and Tagline */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground m-0">
            KJ Product Kit
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-[70ch] m-0 leading-relaxed">
            React 19 &amp; Tailwind 4 design system for B2B SaaS, dashboards, and developer tooling.
          </p>
        </div>

        {/* Quick actions CTAs */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <Button size="lg" variant="primary" onClick={() => onNavigate("components")}>
            Explore Components →
          </Button>
          <Button size="lg" variant="outline" onClick={() => onNavigate("patterns")}>
            View Patterns →
          </Button>
          <a
            href="https://github.com/kjaniec-dev/ui-kit"
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "no-underline inline-flex items-center gap-2"
            )}
          >
            <GitHubIcon size={18} />
            <span>GitHub</span>
          </a>
        </div>

        {/* Copyable Quickstart Snippets */}
        <div className="flex flex-col gap-2.5 max-w-[640px]">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Quickstart
          </div>
          <TerminalSnippet command="npm install @kjaniec-dev/ui @kjaniec-dev/design" />
          <TerminalSnippet command="npx @kjaniec-dev/ui-mcp" />
        </div>
      </section>

      {/* 3 Value Proposition Feature Cards */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">Core Pillars</h2>
          <p className="text-sm text-muted-foreground m-0">
            Engineered from ground up for high-velocity software engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Tokens */}
          <Card className="p-6 flex flex-col justify-between gap-6 border-border hover:border-primary/50 transition-colors">
            <div className="flex flex-col gap-3">
              <div className="h-10 w-10 rounded-kj-md bg-primary/10 text-primary flex items-center justify-center">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                  <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                  <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                  <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground m-0">Design Tokens &amp; OKLCH</h3>
              <p className="text-sm text-muted-foreground m-0 leading-relaxed">
                Modern perceptual color scales (Amber primary, Teal secondary), adaptive dark mode,
                and Tailwind v4 @theme integration.
              </p>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => onNavigate("tokens")}
              >
                <span>Explore Tokens</span>
                <span>→</span>
              </Button>
            </div>
          </Card>

          {/* Card 2: Patterns */}
          <Card className="p-6 flex flex-col justify-between gap-6 border-border hover:border-primary/50 transition-colors">
            <div className="flex flex-col gap-3">
              <div className="h-10 w-10 rounded-kj-md bg-secondary/10 text-secondary flex items-center justify-center">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground m-0">B2B Product Patterns</h3>
              <p className="text-sm text-muted-foreground m-0 leading-relaxed">
                Pre-composed real-world flows (financial tables, property drawers, command palettes)
                that accelerate SaaS frontend development.
              </p>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => onNavigate("patterns")}
              >
                <span>Explore Patterns</span>
                <span>→</span>
              </Button>
            </div>
          </Card>

          {/* Card 3: MCP */}
          <Card className="p-6 flex flex-col justify-between gap-6 border-border hover:border-primary/50 transition-colors">
            <div className="flex flex-col gap-3">
              <div className="h-10 w-10 rounded-kj-md bg-primary/10 text-primary flex items-center justify-center">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground m-0">AI-Native MCP Server</h3>
              <p className="text-sm text-muted-foreground m-0 leading-relaxed">
                Contextual component docs, props validation, and token schemas exposed to AI coding
                agents to ground UI generation in actual component APIs and reduce hallucinations.
              </p>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => onNavigate("mcp")}
              >
                <span>Explore MCP</span>
                <span>→</span>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Interactive Live Preview */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">
              Interactive Live Demo
            </h2>
            <p className="text-sm text-muted-foreground m-0">
              Test real UI Kit primitives in action with live state and notification triggers.
            </p>
          </div>
          <Badge variant="success" dot>
            Live System
          </Badge>
        </div>

        <Card className="p-6 md:p-8 flex flex-col gap-6 bg-surface border-border shadow-kj-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                View Cadence:
              </span>
              <Segmented<Period>
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "quarterly", label: "Quarterly" },
                  { value: "annual", label: "Annual" },
                ]}
                value={period}
                onChange={setPeriod}
                aria-label="Reporting period"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                toast({
                  message: "Invoice batch generated and queued for settlement.",
                  tone: "success",
                })
              }
            >
              Trigger Action
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              title={metric.title}
              value={metric.value}
              trend={metric.trend}
              trendDirection={metric.trendDirection}
              description={metric.description}
              className="bg-muted/30"
            />
            <MetricCard
              title="Settlement Velocity"
              value="99.4%"
              trend="+0.8%"
              trendDirection="up"
              description="automated clearance without reconciliation delay"
              className="bg-muted/30"
            />
          </div>
        </Card>
      </section>
    </div>
  );
}

export function OverviewView(props: OverviewViewProps) {
  return (
    <ToastProvider>
      <OverviewContent {...props} />
    </ToastProvider>
  );
}
