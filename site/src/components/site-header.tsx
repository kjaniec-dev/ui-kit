import { Button, cn } from "@kjaniec-dev/ui";
import type { TabKey } from "../hooks/use-hash-route";

export interface SiteHeaderProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  dark: boolean;
  onToggleDark: () => void;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  showMobileMenuButton?: boolean;
}

const TABS: { id: TabKey; label: string; badge?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "components", label: "Components" },
  { id: "patterns", label: "Patterns" },
  { id: "tokens", label: "Tokens" },
  { id: "mcp", label: "MCP", badge: "AI" },
];

export function SiteHeader({
  activeTab,
  onSelectTab,
  dark,
  onToggleDark,
  mobileMenuOpen,
  onToggleMobileMenu,
  showMobileMenuButton = false,
}: SiteHeaderProps) {
  const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.9.3";

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 max-[820px]:px-4 py-3 border-b border-border transition-colors"
      style={{
        background: "color-mix(in oklch, var(--kj-background) 85%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-4">
        {showMobileMenuButton && onToggleMobileMenu && (
          <button
            type="button"
            className="hidden max-[820px]:flex items-center justify-center h-8 w-8 rounded-kj-sm hover:bg-muted transition-colors cursor-pointer border-0 bg-transparent text-foreground"
            onClick={onToggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        )}

        <button
          type="button"
          onClick={() => onSelectTab("overview")}
          className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 text-left text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="grid place-items-center h-8 w-8 rounded-kj-md bg-primary text-primary-foreground font-bold font-mono text-sm shadow-kj-glow">
            KJ
          </div>
          <div>
            <div className="font-bold text-sm leading-tight text-foreground flex items-center gap-1.5">
              <span>KJ Product Kit</span>
              <span className="text-[0.68rem] px-1.5 py-0.5 rounded-kj-sm bg-muted text-muted-foreground font-mono font-medium">
                v{version}
              </span>
            </div>
            <div className="text-[0.68rem] text-muted-foreground hidden sm:block">
              React 19 · Tailwind 4 Design System
            </div>
          </div>
        </button>
      </div>

      <nav className="flex items-center gap-1 max-[820px]:hidden">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-kj-sm text-sm font-medium transition-colors cursor-pointer border-0",
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[0.62rem] uppercase font-bold tracking-wider px-1 py-[1px] rounded bg-primary text-primary-foreground">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <a
          href="https://github.com/kjaniec-dev/ui-kit"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-kj-sm hover:bg-muted transition-colors no-underline"
        >
          <span>GitHub</span>
          <span className="text-[0.7rem]">↗</span>
        </a>
        <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={onToggleDark}>
          {dark ? (
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </Button>
      </div>
    </header>
  );
}
