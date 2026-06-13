import * as React from "react";
import { cn } from "../lib/cn";

export interface CommandPaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  shortcut?: string[];
  action: () => void;
  icon?: React.ReactNode;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: CommandPaletteItem[];
  placeholder?: string;
}

export function CommandPalette({ open, onClose, items, placeholder = "Type a command or search..." }: CommandPaletteProps) {
  const [search, setSearch] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Reset state on open/close
  React.useEffect(() => {
    if (open) {
      setSearch("");
      setActiveIndex(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  // Filter items
  const filteredItems = React.useMemo(() => {
    if (!search) return items;
    const cleanSearch = search.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(cleanSearch) ||
        item.subtitle?.toLowerCase().includes(cleanSearch) ||
        item.category?.toLowerCase().includes(cleanSearch)
    );
  }, [search, items]);

  // Reset active index when filter changes
  React.useEffect(() => {
    setActiveIndex(0);
  }, [filteredItems]);

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (filteredItems.length === 0 ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[activeIndex]) {
          filteredItems[activeIndex].action();
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredItems, activeIndex, onClose]);

  // Scroll active item into view
  React.useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  if (!open) return null;

  // Group filtered items by category
  const groups: { [key: string]: typeof filteredItems } = {};
  filteredItems.forEach((item) => {
    const cat = item.category || "General";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });

  // Flat list index calculation for grouping
  let absoluteItemIndex = 0;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[100] grid place-items-start justify-center p-6 md:p-24 backdrop-blur-[3px] bg-[color-mix(in_oklch,#09090b_60%,transparent)]"
    >
      <div
        ref={containerRef}
        className="w-[95vw] max-w-lg bg-surface border border-border rounded-kj-xl shadow-kj-lg flex flex-col overflow-hidden max-h-[500px]"
      >
        {/* Search Input */}
        <div className="p-4 border-b border-border flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 text-muted-foreground shrink-0 ml-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 font-sans text-[0.95rem] bg-transparent text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-0"
            autoFocus
          />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 min-h-[150px]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No results found for "{search}"
            </div>
          ) : (
            <div ref={listRef} className="space-y-4">
              {Object.entries(groups).map(([cat, itemsInCat]) => (
                <div key={cat} className="space-y-1">
                  <div className="px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </div>
                  {itemsInCat.map((item) => {
                    const currentIdx = absoluteItemIndex++;
                    const isActive = currentIdx === activeIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        className={cn(
                          "flex items-center justify-between gap-3 px-3 py-2.5 rounded-kj-md cursor-pointer select-none transition-colors",
                          isActive ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.icon && <span className="text-muted-foreground [&_svg]:h-[1.1rem] [&_svg]:w-[1.1rem]">{item.icon}</span>}
                          <div className="min-w-0 flex flex-col">
                            <span className={cn("text-[0.85rem] font-semibold", isActive ? "text-primary" : "text-foreground")}>
                              {item.title}
                            </span>
                            {item.subtitle && <span className="text-[0.75rem] text-muted-foreground truncate">{item.subtitle}</span>}
                          </div>
                        </div>
                        {item.shortcut && (
                          <div className="flex items-center gap-1">
                            {item.shortcut.map((sc, scIdx) => (
                              <kbd
                                key={scIdx}
                                className="px-1.5 py-0.5 rounded border border-border bg-subtle text-[10px] font-mono leading-none shadow-kj-xs text-muted-foreground"
                              >
                                {sc}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-border bg-subtle flex items-center justify-between text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="font-mono text-[9px] px-1 border rounded bg-surface">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="font-mono text-[9px] px-1 border rounded bg-surface">Enter</kbd> Select</span>
          </div>
          <div>
            <kbd className="font-mono text-[9px] px-1 border rounded bg-surface">Esc</kbd> Close
          </div>
        </div>
      </div>
    </div>
  );
}
CommandPalette.displayName = "CommandPalette";
