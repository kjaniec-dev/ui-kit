"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  banner?: React.ReactNode;
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  contentWidth?: "default" | "narrow" | "wide" | "full";
  headerPosition?: "sticky" | "fixed" | "static";
  headerVariant?: "glass" | "solid" | "transparent";
  paddedContent?: boolean;
  mobileNav?: React.ReactNode;
  bottomNav?: React.ReactNode;
}

export interface AppShellBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "accent" | "muted";
  closable?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export interface AppShellHeaderProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "glass" | "solid" | "transparent";
  position?: "sticky" | "fixed" | "static";
  bordered?: boolean;
  children?: React.ReactNode;
  mobileNav?: React.ReactNode;
}

export interface AppShellMainProps extends React.HTMLAttributes<HTMLElement> {
  width?: "default" | "narrow" | "wide" | "full";
  padded?: boolean;
  children: React.ReactNode;
}

export interface AppShellFooterProps extends React.HTMLAttributes<HTMLElement> {
  bordered?: boolean;
  children: React.ReactNode;
}

export const AppShellBanner = React.forwardRef<HTMLDivElement, AppShellBannerProps>(
  ({ className, variant = "primary", closable, onClose, children, ...props }, ref) => {
    const variantClass = {
      primary: "bg-primary text-primary-foreground",
      accent: "bg-secondary text-secondary-foreground",
      muted: "bg-surface border-b border-border text-muted-foreground",
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "px-4 py-2 text-sm font-medium text-center flex items-center justify-center relative z-30",
          variantClass,
          className
        )}
        {...props}
      >
        <div className="flex-1">{children}</div>
        {closable && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded opacity-80 hover:opacity-100 transition-opacity ml-2 cursor-pointer"
            aria-label="Close banner"
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
AppShellBanner.displayName = "AppShellBanner";

export const AppShellHeader = React.forwardRef<HTMLElement, AppShellHeaderProps>(
  (
    {
      className,
      variant = "glass",
      position = "sticky",
      bordered = true,
      children,
      mobileNav,
      ...props
    },
    ref
  ) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && mobileOpen) {
          setMobileOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [mobileOpen]);

    React.useEffect(() => {
      if (mobileOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [mobileOpen]);

    const positionClass = {
      sticky: "sticky top-0 z-40",
      fixed: "fixed top-0 left-0 right-0 z-40",
      static: "relative z-40",
    }[position];

    const variantClass = {
      glass: "bg-surface/80 backdrop-blur-md text-foreground",
      solid: "bg-surface text-foreground",
      transparent: "bg-transparent text-foreground",
    }[variant];

    return (
      <>
        <header
          ref={ref}
          className={cn(
            "w-full transition-colors",
            positionClass,
            variantClass,
            bordered && "border-b border-border/60",
            className
          )}
          {...props}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {mobileNav && (
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Open navigation"
              >
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            {children}
          </div>
        </header>

        {mobileNav && mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              aria-hidden="true"
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-overlay backdrop-blur-[2px] transition-opacity duration-300"
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
              className="relative z-10 w-72 h-full bg-surface border-r border-border flex flex-col shadow-kj-lg"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close navigation"
                >
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{mobileNav}</div>
            </aside>
          </div>
        )}
      </>
    );
  }
);
AppShellHeader.displayName = "AppShellHeader";

export const AppShellMain = React.forwardRef<HTMLElement, AppShellMainProps>(
  ({ className, width = "default", padded = true, children, ...props }, ref) => {
    const widthClass = {
      default: "max-w-7xl mx-auto w-full",
      narrow: "max-w-5xl mx-auto w-full",
      wide: "max-w-screen-2xl mx-auto w-full",
      full: "max-w-none w-full",
    }[width];

    return (
      <main
        ref={ref}
        className={cn(
          "flex-1",
          padded && "px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-12",
          widthClass,
          className
        )}
        {...props}
      >
        {children}
      </main>
    );
  }
);
AppShellMain.displayName = "AppShellMain";

export const AppShellFooter = React.forwardRef<HTMLElement, AppShellFooterProps>(
  ({ className, bordered = true, children, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          "w-full bg-surface text-foreground py-12 mt-auto",
          bordered && "border-t border-border",
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </footer>
    );
  }
);
AppShellFooter.displayName = "AppShellFooter";

type AppShellComponent = React.ForwardRefExoticComponent<
  AppShellProps & React.RefAttributes<HTMLDivElement>
> & {
  Banner: typeof AppShellBanner;
  Header: typeof AppShellHeader;
  Main: typeof AppShellMain;
  Footer: typeof AppShellFooter;
};

export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (
    {
      className,
      banner,
      header,
      children,
      footer,
      contentWidth = "default",
      headerPosition = "sticky",
      headerVariant = "glass",
      paddedContent = true,
      mobileNav,
      bottomNav,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen bg-canvas text-foreground flex flex-col antialiased",
          className
        )}
        {...props}
      >
        {banner && <AppShellBanner>{banner}</AppShellBanner>}
        {header && (
          <AppShellHeader variant={headerVariant} position={headerPosition} mobileNav={mobileNav}>
            {header}
          </AppShellHeader>
        )}
        <AppShellMain width={contentWidth} padded={paddedContent}>
          {children}
        </AppShellMain>
        {footer && <AppShellFooter>{footer}</AppShellFooter>}
        {bottomNav && (
          <div className="md:hidden sticky bottom-0 z-30 w-full bg-surface border-t border-border">
            {bottomNav}
          </div>
        )}
      </div>
    );
  }
) as AppShellComponent;

AppShell.displayName = "AppShell";
AppShell.Banner = AppShellBanner;
AppShell.Header = AppShellHeader;
AppShell.Main = AppShellMain;
AppShell.Footer = AppShellFooter;
