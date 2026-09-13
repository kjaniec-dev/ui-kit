import { Button, cn, Input, ToastProvider } from "@kjaniec-dev/ui";
import * as React from "react";
import {
  ChartsSection,
  DataDisplaySections,
  FeedbackSections,
  FormsSections,
  IcoSearch,
  LayoutsSections,
  NavigationSections,
  OverlaysSections,
  PrimitivesSections,
} from "../sections";

export interface ComponentNavItem {
  id: string;
  label: string;
  keywords?: string[];
}

export interface ComponentCategory {
  name: string;
  items: ComponentNavItem[];
}

export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    name: "Foundations",
    items: [
      { id: "buttons", label: "Buttons", keywords: ["button", "fab"] },
      { id: "badges", label: "Badges", keywords: ["badge", "pill", "tag"] },
      {
        id: "avatars-stats",
        label: "Avatars & Stats",
        keywords: ["avatar", "avatargroup", "stat", "counter", "metric"],
      },
      {
        id: "primitives",
        label: "Primitives",
        keywords: ["kbd", "separator", "spinner", "codeblock"],
      },
    ],
  },
  {
    name: "Feedback",
    items: [
      {
        id: "feedback",
        label: "Feedback",
        keywords: [
          "alert",
          "progress",
          "progressring",
          "progressringfield",
          "skeleton",
          "emptystate",
          "errorstate",
          "toast",
        ],
      },
    ],
  },
  {
    name: "Inputs & Forms",
    items: [
      {
        id: "forms",
        label: "Forms",
        keywords: [
          "input",
          "select",
          "textarea",
          "passwordinput",
          "searchinput",
          "field",
          "label",
          "errormessage",
          "combobox",
          "comboboxfield",
          "datepicker",
          "datepickerfield",
          "calendar",
          "rangecalendar",
          "fileupload",
          "dropzone",
        ],
      },
      {
        id: "selection",
        label: "Selection",
        keywords: [
          "checkbox",
          "radio",
          "radiogroup",
          "switch",
          "slider",
          "segmented",
          "togglegroup",
        ],
      },
      { id: "rating", label: "Rating", keywords: ["rating", "star"] },
      { id: "color-picker", label: "ColorPicker", keywords: ["colorpicker", "palette", "swatch"] },
      {
        id: "inpost-geowidget",
        label: "InPost GeoWidget",
        keywords: ["inpost", "geowidget", "paczkomat", "map"],
      },
    ],
  },
  {
    name: "Data Display",
    items: [
      {
        id: "data",
        label: "Table & DataTable",
        keywords: ["table", "datatable", "tabletoolbar", "tablepagination"],
      },
      {
        id: "cards",
        label: "Cards",
        keywords: ["card", "metriccard", "pricingcard", "blogcard", "projectcard"],
      },
      {
        id: "accordion",
        label: "Accordion",
        keywords: ["accordion", "collapse", "faq", "disclosure"],
      },
      {
        id: "timeline-code",
        label: "Timeline & CodeBlock",
        keywords: ["timeline", "activityfeed", "codeblock", "syntax"],
      },
      {
        id: "gallery",
        label: "Image Gallery",
        keywords: ["imagegallery", "gallery", "lightbox", "photos"],
      },
    ],
  },
  {
    name: "Navigation",
    items: [
      {
        id: "navigation",
        label: "Navigation",
        keywords: [
          "tabs",
          "breadcrumb",
          "pagination",
          "bottomnavigation",
          "stepper",
          "dropdownmenu",
          "commandpalette",
        ],
      },
    ],
  },
  {
    name: "Overlays",
    items: [
      {
        id: "overlays",
        label: "Overlays & Dialogs",
        keywords: ["modal", "drawer", "bottomsheet", "confirmdialog", "overlays"],
      },
      {
        id: "popover",
        label: "Popover & Tooltip",
        keywords: ["popover", "tooltip", "hover", "popup"],
      },
      {
        id: "inbox-popover",
        label: "InboxPopover",
        keywords: ["inboxpopover", "inbox", "notifications"],
      },
    ],
  },
  {
    name: "Layouts",
    items: [
      {
        id: "layouts",
        label: "Layouts",
        keywords: [
          "dashboardshell",
          "detailpagelayout",
          "settingslayout",
          "appshell",
          "sectionheader",
          "pageheader",
        ],
      },
    ],
  },
  {
    name: "Data Visualization",
    items: [
      {
        id: "charts",
        label: "Charts",
        keywords: [
          "chart",
          "sparkline",
          "linechart",
          "areachart",
          "barchart",
          "donutchart",
          "wykres",
          "data visualization",
        ],
      },
    ],
  },
];

export interface ComponentsViewProps {
  initialSection?: string;
  onSelectSection?: (id: string) => void;
}

function CategorySidebar({
  searchQuery,
  setSearchQuery,
  categories,
  activeSection,
  onSelect,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  categories: ComponentCategory[];
  activeSection: string;
  onSelect: (id: string) => void;
}) {
  const totalCount = categories.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <>
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="text-[0.68rem] uppercase tracking-[0.09em] font-semibold text-muted-foreground">
          Components
        </div>
        <span className="text-[0.68rem] px-1.5 py-0.5 rounded-kj-sm bg-muted text-muted-foreground font-mono font-medium">
          {totalCount}
        </span>
      </div>

      <Input
        id="component-search-input"
        aria-label="Filter components"
        placeholder="Filter components... (/)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        leadingIcon={IcoSearch}
      />

      <nav className="flex flex-col gap-4 mt-1" aria-label="Component categories">
        {categories.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No components found for “{searchQuery}”
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.name} className="flex flex-col gap-1">
              <div className="text-[0.7rem] uppercase tracking-[0.08em] font-semibold text-muted-foreground/80 px-2 py-0.5">
                {cat.name}
              </div>
              <div className="flex flex-col gap-0.5">
                {cat.items.map((item) => {
                  const active = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#components/${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState(null, "", `#components/${item.id}`);
                        onSelect(item.id);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-1.5 rounded-kj-sm text-sm font-medium no-underline transition-colors",
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-colors shrink-0",
                          active ? "bg-primary" : "bg-border"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>
    </>
  );
}

export function ComponentsView({
  initialSection,
  onSelectSection,
}: ComponentsViewProps): React.JSX.Element {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeSection, setActiveSection] = React.useState(
    () => initialSection?.replace(/^#/, "") || "buttons"
  );

  React.useEffect(() => {
    if (!initialSection) return;
    const cleanId = initialSection.replace(/^#/, "");
    setActiveSection(cleanId);
    const el = document.getElementById(cleanId);
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [initialSection]);

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const allIds = COMPONENT_CATEGORIES.flatMap((c) => c.items.map((i) => i.id));
    const visibleEntries = new Map<string, IntersectionObserverEntry>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleEntries.set(entry.target.id, entry);
          } else {
            visibleEntries.delete(entry.target.id);
          }
        }

        if (visibleEntries.size > 0) {
          let closestId = "";
          let minDistance = Number.POSITIVE_INFINITY;
          for (const [id, entry] of visibleEntries.entries()) {
            const dist = Math.abs(entry.boundingClientRect.top - 120);
            if (dist < minDistance) {
              minDistance = dist;
              closestId = id;
            }
          }
          if (closestId) {
            setActiveSection(closestId);
          }
        }
      },
      { rootMargin: "-10% 0px -60% 0px" }
    );

    for (const id of allIds) {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    }

    return () => obs.disconnect();
  }, []);

  const filteredCategories = React.useMemo(() => {
    const clean = searchQuery.trim().toLowerCase();
    if (!clean) return COMPONENT_CATEGORIES;

    return COMPONENT_CATEGORIES.map((cat) => {
      const catMatches = cat.name.toLowerCase().includes(clean);
      if (catMatches) {
        return cat;
      }
      const matchingItems = cat.items.filter(
        (item) =>
          item.label.toLowerCase().includes(clean) ||
          item.id.toLowerCase().includes(clean) ||
          item.keywords?.some((kw) => kw.toLowerCase().includes(clean))
      );
      return {
        ...cat,
        items: matchingItems,
      };
    }).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const handleSelect = React.useCallback(
    (id: string) => {
      setActiveSection(id);
      onSelectSection?.(id);
      setSidebarOpen(false);
      const el = document.getElementById(id);
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth" });
      }
    },
    [onSelectSection]
  );

  return (
    <ToastProvider>
      <div className="gallery-layout">
        {/* Desktop sticky sidebar */}
        <aside
          aria-label="Component directory navigation"
          className="sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto bg-surface border-r border-border p-6 max-[820px]:hidden flex flex-col gap-4"
        >
          <CategorySidebar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categories={filteredCategories}
            activeSection={activeSection}
            onSelect={handleSelect}
          />
        </aside>

        {/* Main content */}
        <div className="min-w-0">
          <main className="px-8 max-[820px]:px-5 py-8 max-w-[1040px]">
            {/* Mobile navigation toggle */}
            <div className="hidden max-[820px]:flex sticky top-[57px] z-20 items-center justify-between gap-3 p-3 mb-6 rounded-kj-md border border-border bg-surface/95 backdrop-blur-md shadow-kj-sm">
              <div className="flex items-center gap-2 text-xs min-w-0">
                <span className="text-muted-foreground shrink-0">Section:</span>
                <span className="font-semibold text-foreground capitalize truncate">
                  {activeSection}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open component navigation"
                className="shrink-0"
              >
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1.5 inline"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
                <span>Components</span>
              </Button>
            </div>

            <div className="mb-10 pb-6 border-b border-border">
              <h1 className="text-3xl font-bold tracking-tight text-foreground m-0">
                KJ Product Kit
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-[65ch]">
                Design system &amp; component gallery for personal SaaS apps, dashboards, and
                developer tooling.
              </p>
            </div>

            <PrimitivesSections />
            <FeedbackSections />
            <FormsSections />
            <DataDisplaySections />
            <NavigationSections />
            <OverlaysSections />
            <LayoutsSections />
            <ChartsSection />

            <footer className="text-[0.8rem] text-muted-foreground pt-8 mt-4 border-t border-border">
              Real components from <span className="font-mono">@kjaniec-dev/ui</span>, styled with
              tokens from <span className="font-mono">@kjaniec-dev/design</span>. The same code
              ships in the repo.
            </footer>
          </main>
        </div>

        {/* Mobile floating button to quickly open component drawer from anywhere */}
        <div className="hidden max-[820px]:block fixed bottom-5 right-5 z-20">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Browse components floating shortcut"
            className="shadow-kj-lg flex items-center gap-1.5 rounded-full px-3.5 py-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
            <span className="text-xs font-semibold">Components</span>
          </Button>
        </div>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <aside
              aria-label="Component directory mobile navigation"
              className="w-[280px] h-full overflow-y-auto bg-surface border-r border-border p-6 shadow-kj-lg flex flex-col gap-4 z-10"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-semibold text-sm">Components</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close component navigation"
                >
                  ✕
                </Button>
              </div>
              <CategorySidebar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categories={filteredCategories}
                activeSection={activeSection}
                onSelect={handleSelect}
              />
            </aside>
            <button
              type="button"
              className="flex-1 bg-black/50 border-0 cursor-default"
              aria-label="Dismiss sidebar overlay"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}
      </div>
    </ToastProvider>
  );
}
