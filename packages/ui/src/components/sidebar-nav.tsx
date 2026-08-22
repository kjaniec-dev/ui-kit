import * as React from "react";
import { cn } from "../lib/cn";

export interface SidebarNavItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface SidebarNavGroup {
  title?: string;
  items: SidebarNavItem[];
}

export interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  groups: SidebarNavGroup[];
  currentHref?: string;
}

export function SidebarNav({ className, groups, currentHref, ...props }: SidebarNavProps) {
  return (
    <div className={cn("space-y-6 py-4 px-3 w-full", className)} {...props}>
      {groups.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-1.5">
          {group.title && (
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/85">
              {group.title}
            </h4>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive =
                item.active || (item.href && currentHref && currentHref === item.href);
              const content = (
                <>
                  <span className="flex items-center gap-2.5 min-w-0">
                    {item.icon && (
                      <span
                        className={cn(
                          "[&_svg]:h-[1.1rem] [&_svg]:w-[1.1rem] shrink-0",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        {item.icon}
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="shrink-0 flex items-center justify-center">{item.badge}</span>
                  )}
                </>
              );

              const itemClass = cn(
                "group flex items-center justify-between gap-3 px-3 py-2 rounded-kj-md text-[0.85rem] font-semibold select-none cursor-pointer transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none pl-2.5"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
              );

              if (item.href) {
                return (
                  <a key={item.id} href={item.href} className={itemClass}>
                    {content}
                  </a>
                );
              }

              return (
                <button key={item.id} type="button" onClick={item.onClick} className={itemClass}>
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
SidebarNav.displayName = "SidebarNav";
