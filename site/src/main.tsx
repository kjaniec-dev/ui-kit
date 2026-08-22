import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Button, Badge, Input, ToastProvider, cn } from "@kjaniec-dev/ui";
import "./index.css";
import {
  PrimitivesSections,
  FormsSections,
  DataDisplaySections,
  NavigationSections,
  OverlaysSections,
  LayoutsSections,
  IcoSun,
  IcoMoon,
  IcoSearch,
} from "./sections";

const NAV = [
  ["buttons", "Buttons"],
  ["badges", "Badges"],
  ["feedback", "Feedback"],
  ["forms", "Forms"],
  ["selection", "Selection"],
  ["rating", "Rating"],
  ["color-picker", "ColorPicker"],
  ["inpost-geowidget", "InPost GeoWidget"],
  ["cards", "Cards"],
  ["navigation", "Navigation"],
  ["data", "Table"],
  ["overlays", "Overlays"],
  ["inbox-popover", "InboxPopover"],
  ["primitives", "Primitives"],
  ["layouts", "Layouts"],
];

function SidebarContent({
  searchQuery,
  setSearchQuery,
  activeSection,
  onSelectSection,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  activeSection: string;
  onSelectSection: (id: string) => void;
}) {
  const filteredNav = React.useMemo(() => {
    if (!searchQuery) return NAV;
    const clean = searchQuery.toLowerCase();
    return NAV.filter(
      ([id, label]) => id.toLowerCase().includes(clean) || label.toLowerCase().includes(clean)
    );
  }, [searchQuery]);

  return (
    <>
      <div className="flex items-center gap-2.5 px-2 pb-1">
        <div className="grid place-items-center h-9 w-9 rounded-kj-md bg-primary text-primary-foreground font-bold font-mono shadow-kj-glow">
          KJ
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">@kjaniec-dev/ui</div>
          <div className="text-[0.7rem] text-muted-foreground font-mono">React · v0.9.3</div>
        </div>
      </div>
      <Input
        aria-label="Filter sections"
        placeholder="Filter sections..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        leadingIcon={IcoSearch}
      />
      <div className="text-[0.68rem] uppercase tracking-[0.09em] font-semibold text-muted-foreground px-3 pt-2 pb-0.5">
        Components
      </div>
      <nav className="flex flex-col gap-0.5">
        {filteredNav.map(([id, label]) => {
          const active = activeSection === id;
          return (
            <a
              key={id}
              href={"#" + id}
              onClick={() => onSelectSection(id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-kj-sm text-sm font-medium no-underline transition-colors",
                active
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  active ? "bg-primary" : "bg-border"
                )}
              />
              {label}
            </a>
          );
        })}
      </nav>
    </>
  );
}

function Gallery() {
  const [dark, setDark] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeSection, setActiveSection] = React.useState("buttons");

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
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
      <aside className="sticky top-0 self-start h-screen overflow-y-auto bg-surface border-r border-border p-6 max-[820px]:hidden flex flex-col gap-4">
        <SidebarContent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeSection={activeSection}
          onSelectSection={(id) => setActiveSection(id)}
        />
      </aside>

      <div className="min-w-0">
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
              Component demo{" "}
              <span className="text-muted-foreground font-normal">· interactive</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Badge variant="primary" dot>
              50+ components
            </Badge>
            <Button
              variant="outline"
              size="icon"
              aria-label="Theme"
              onClick={() => setDark((d) => !d)}
            >
              {dark ? IcoSun : IcoMoon}
            </Button>
          </div>
        </header>

        <main className="px-8 max-[820px]:px-5 py-10 max-w-[1040px]">
          <div className="mb-10 pb-6 border-b border-border">
            <h1 className="text-3xl font-bold tracking-tight text-foreground m-0">KJ UI Kit</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-[65ch]">
              Design system & component gallery for personal SaaS apps, dashboards, and developer
              tooling.
            </p>
          </div>
          <PrimitivesSections />
          <FormsSections />
          <DataDisplaySections />
          <NavigationSections />
          <OverlaysSections />
          <LayoutsSections />

          <footer className="text-[0.8rem] text-muted-foreground pt-8 mt-4 border-t border-border">
            Real components from <span className="font-mono">@kjaniec-dev/ui</span>, styled with
            tokens from <span className="font-mono">@kjaniec-dev/design</span>. The same code ships
            in the repo.
          </footer>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          role="presentation"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="w-[260px] h-full overflow-y-auto bg-surface border-r border-border p-6 shadow-kj-lg flex flex-col gap-4"
            role="presentation"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeSection={activeSection}
              onSelectSection={(id) => {
                setActiveSection(id);
                setSidebarOpen(false);
              }}
            />
          </aside>
          <div className="flex-1" style={{ background: "rgba(0,0,0,0.5)" }} />
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ToastProvider>
    <Gallery />
  </ToastProvider>
);
