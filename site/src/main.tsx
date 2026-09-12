import { cn, ToastProvider } from "@kjaniec-dev/ui";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { SiteHeader } from "./components/site-header";
import { type TabKey, useHashRoute } from "./hooks/use-hash-route";
import "./index.css";
import { ComponentsView } from "./views/components-view";
import { McpView } from "./views/mcp-view";
import { OverviewView } from "./views/overview-view";
import { PatternsView } from "./views/patterns-view";
import { TokensView } from "./views/tokens-view";

const TABS: { id: TabKey; label: string; badge?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "components", label: "Components" },
  { id: "patterns", label: "Patterns" },
  { id: "tokens", label: "Tokens" },
  { id: "mcp", label: "MCP", badge: "AI" },
];

export function App(): React.JSX.Element {
  const [dark, setDark] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { tab, subRoute, navigate } = useHashRoute();
  const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.9.3";

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteHeader
          activeTab={tab}
          onSelectTab={(newTab) => {
            navigate(newTab);
            setMobileMenuOpen(false);
          }}
          dark={dark}
          onToggleDark={() => setDark((d) => !d)}
          showMobileMenuButton={true}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
        />

        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            data-testid="mobile-nav-menu"
            className="min-[821px]:hidden border-b border-border bg-surface px-4 py-3 flex flex-col gap-1 shadow-kj-md"
          >
            {TABS.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    navigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-kj-sm text-sm font-medium transition-colors cursor-pointer border-0 text-left",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  )}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[0.62rem] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex-1">
          {tab === "overview" && <OverviewView onNavigate={navigate} />}
          {tab === "components" && <ComponentsView initialSection={subRoute} />}
          {tab === "patterns" && <PatternsView initialPattern={subRoute} />}
          {tab === "tokens" && <TokensView />}
          {tab === "mcp" && <McpView />}
        </div>

        <footer className="border-t border-border py-8 px-6 text-xs text-muted-foreground bg-surface/50">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">KJ Product Kit</span>
              <span>·</span>
              <a
                href="https://github.com/kjaniec-dev/ui-kit"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                v{version}
              </a>
            </div>
            <p className="m-0 text-center sm:text-right">
              © {new Date().getFullYear()} KJ Product Kit. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
