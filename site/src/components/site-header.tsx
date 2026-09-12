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
  onOpenSearch?: () => void;
  onOpenShortcuts?: () => void;
}

const TABS: { id: TabKey; label: string; badge?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "components", label: "Components" },
  { id: "patterns", label: "Patterns" },
  { id: "tokens", label: "Tokens" },
  { id: "mcp", label: "MCP", badge: "AI" },
];

export function StorybookIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.132 1.487c-.642-.234-1.343.08-1.579.721l-.274.746c-.237.643.078 1.344.72 1.58.643.237 1.344-.078 1.58-.72l.275-.747c.236-.642-.08-1.343-.722-1.58zm3.364 2.879a1.218 1.218 0 00-1.579-.722l-.746.275a1.217 1.217 0 00-.721 1.579c.236.642.937.957 1.579.721l.746-.274a1.219 1.219 0 00.721-1.579zm-7.604 1.233c.007-.03.014-.06.022-.09l-7.798-.002a2.316 2.316 0 00-2.313 2.315v13.568a2.316 2.316 0 002.313 2.316h13.978c1.277 0 2.313-1.037 2.313-2.316V10.74l-.001-.013-1.319-5.128zm-5.074 13.91H5.437V7.896h2.381v11.609zm3.174-8.814h2.158c.951 0 1.547.452 1.547 1.246 0 .559-.313.963-.832 1.155.679.167 1.071.644 1.071 1.339 0 .977-.82 1.535-2.039 1.535h-1.905v-5.275zm1.537 1.405h-.357v.939h.375c.395 0 .638-.179.638-.475 0-.309-.234-.464-.656-.464zm.083 1.944h-.44v1.072h.44c.488 0 .762-.191.762-.536 0-.358-.274-.536-.762-.536z" />
    </svg>
  );
}

export function GitHubIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function SiteHeader({
  activeTab,
  onSelectTab,
  dark,
  onToggleDark,
  mobileMenuOpen,
  onToggleMobileMenu,
  showMobileMenuButton = false,
  onOpenSearch,
  onOpenShortcuts,
}: SiteHeaderProps) {
  const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.9.3";

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-2 lg:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-border transition-colors"
      style={{
        background: "color-mix(in oklch, var(--kj-background) 85%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
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
          <div className="grid place-items-center h-8 w-8 rounded-kj-md bg-primary text-primary-foreground font-bold font-mono text-sm shadow-kj-glow shrink-0">
            KJ
          </div>
          <div>
            <div className="font-bold text-sm leading-tight text-foreground flex items-center gap-1.5 whitespace-nowrap">
              <span>KJ Product Kit</span>
              <span className="hidden lg:inline-block text-[0.68rem] px-1.5 py-0.5 rounded-kj-sm bg-muted text-muted-foreground font-mono font-medium">
                v{version}
              </span>
            </div>
            <div className="text-[0.68rem] text-muted-foreground hidden xl:block whitespace-nowrap">
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
                "flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-kj-sm text-xs xl:text-sm font-medium transition-colors cursor-pointer border-0 whitespace-nowrap",
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

      <div className="flex items-center gap-2 shrink-0">
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center justify-between gap-2 w-36 sm:w-44 md:w-48 lg:w-56 xl:w-64 px-2.5 sm:px-3 py-1.5 rounded-kj-sm text-xs text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-border transition-colors cursor-pointer shadow-xs"
            aria-label="Search documentation"
            title="Search documentation (⌘K)"
          >
            <span className="flex items-center gap-2 min-w-0 truncate">
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
                className="shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="truncate font-sans">
                <span className="hidden sm:inline">Search documentation...</span>
                <span className="sm:hidden">Search...</span>
              </span>
            </span>
            <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-muted-foreground shadow-xs leading-none shrink-0 select-none">
              ⌘K
            </kbd>
          </button>
        )}
        {onOpenShortcuts && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            aria-label="View keyboard shortcuts (?)"
            title="Keyboard shortcuts (?)"
            className="hidden sm:flex items-center justify-center h-8 w-8 rounded-kj-sm text-xs font-mono font-semibold text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors cursor-pointer"
          >
            ?
          </button>
        )}
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
