# Design System v0.6.0 — Spec

**Date:** 2026-06-12
**Scope:** `@kjaniec-dev/ui` (layouts and forms) and `@kjaniec-dev/design` (surface, chart, and motion tokens)
**Ship as:** single PR → `v0.6.0` bump on all packages

---

## 1. New Design Tokens (design tokens)

Add the following tokens to `packages/design/tokens.json`:

### A. Surface System
Explicit levels of background surfaces and borders to make cards, sidebars, and overlays contrast elegantly:
```json
  "color": {
    "semantic": {
      "light": {
        "bgCanvas": { "$type": "color", "$value": "#f4f4f5" },
        "bgSubtle": { "$type": "color", "$value": "#fafafa" },
        "bgSurface": { "$type": "color", "$value": "#ffffff" },
        "bgElevated": { "$type": "color", "$value": "#ffffff" },
        "bgOverlay": { "$type": "color", "$value": "rgba(9, 9, 11, 0.4)" },
        "borderSubtle": { "$type": "color", "$value": "#f4f4f5" },
        "borderStrong": { "$type": "color", "$value": "#e4e4e7" }
      },
      "dark": {
        "bgCanvas": { "$type": "color", "$value": "#09090b" },
        "bgSubtle": { "$type": "color", "$value": "#121214" },
        "bgSurface": { "$type": "color", "$value": "#18181b" },
        "bgElevated": { "$type": "color", "$value": "#27272a" },
        "bgOverlay": { "$type": "color", "$value": "rgba(9, 9, 11, 0.7)" },
        "borderSubtle": { "$type": "color", "$value": "#1f1f23" },
        "borderStrong": { "$type": "color", "$value": "#27272a" }
      }
    }
  }
```

### B. Chart Visualization Colors
```json
  "color": {
    "semantic": {
      "light": {
        "chart1": { "$type": "color", "$value": "#f59e0b" },
        "chart2": { "$type": "color", "$value": "#14b8a6" },
        "chart3": { "$type": "color", "$value": "#0284c7" }
      },
      "dark": {
        "chart1": { "$type": "color", "$value": "#fbbf24" },
        "chart2": { "$type": "color", "$value": "#2dd4bf" },
        "chart3": { "$type": "color", "$value": "#0ea5e9" }
      }
    }
  }
```

### C. Motion Tokens
```json
  "motion": {
    "duration": {
      "fast": { "$type": "duration", "$value": "120ms" },
      "normal": { "$type": "duration", "$value": "180ms" },
      "slow": { "$type": "duration", "$value": "280ms" }
    },
    "ease": {
      "standard": { "$type": "easing", "$value": "cubic-bezier(0.4, 0, 0.2, 1)" },
      "out": { "$type": "easing", "$value": "cubic-bezier(0, 0, 0.2, 1)" },
      "spring": { "$type": "easing", "$value": "cubic-bezier(0.34, 1.56, 0.64, 1)" }
    }
  }
```

---

## 2. Form System: `FormField`

**Problem:** Standard inputs require linking labels, hints, and error elements together manually via `aria-describedby` and custom IDs. This is highly error-prone. We need a unified wrapper component that handles this automatically.

**New file:** `packages/ui/src/components/form-field.tsx`

**Interface:**
```tsx
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
```

**Markup:**
```tsx
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, hint, error, required, children, ...props }, ref) => {
    const id = React.useId();
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;

    // Try to find the child element and clone it to attach proper aria attributes
    const child = React.Children.only(children) as React.ReactElement;
    const clonedChild = React.cloneElement(child, {
      id: child.props.id ?? id,
      "aria-describedby": cn(
        hint && hintId,
        error && errorId,
        child.props["aria-describedby"]
      ) || undefined,
      "aria-invalid": error ? "true" : undefined,
      required: child.props.required ?? required,
    });

    return (
      <div ref={ref} className={cn("space-y-1.5 w-full", className)} {...props}>
        <Label htmlFor={id} className="flex items-center gap-1">
          {label}
          {required && <span className="text-danger font-bold">*</span>}
        </Label>
        {clonedChild}
        {hint && !error && <Hint id={hintId}>{hint}</Hint>}
        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-danger mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";
```

---

## 3. Application States: `ErrorState` and `Skeleton`

**Problem:** Applications require consistent loading placeholders (skeletons) and fullscreen error states (with retry buttons).

### A. `ErrorState` Component
**New file:** `packages/ui/src/components/error-state.tsx`

**Interface:**
```tsx
export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}
```

**Markup:**
```tsx
export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, title = "Wystąpił błąd", message, onRetry, retryLabel = "Spróbuj ponownie", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-danger/20 rounded-kj-lg bg-danger-surface/20 min-h-[300px]",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-surface border border-danger/30 text-danger mb-4">
        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button size="sm" variant="danger" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
);
ErrorState.displayName = "ErrorState";
```

### B. `Skeleton` Component
**New file:** `packages/ui/src/components/skeleton.tsx`

**Interface:**
```tsx
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}
```

**Markup:**
```tsx
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rectangular", width, height, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "animate-pulse bg-muted/40",
        variant === "text" && "h-3 w-4/5 rounded-sm my-1.5",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-kj-md",
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  )
);
Skeleton.displayName = "Skeleton";
```

---

## 4. Layout Shells: `DashboardShell`

**Problem:** B2B SaaS admin apps need a consistent structural layout shell (collapsible or sticky sidebars, top nav branding header, responsive container padding) to contain dashboard blocks.

**New file:** `packages/ui/src/components/dashboard-shell.tsx`

**Interface:**
```tsx
export interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  children: React.ReactNode;
}
```

**Markup:**
```tsx
export const DashboardShell = React.forwardRef<HTMLDivElement, DashboardShellProps>(
  ({ className, sidebar, topbar, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "min-h-screen bg-canvas text-foreground flex flex-col md:flex-row",
        className
      )}
      {...props}
    >
      {/* Sidebar (sticky desk, scrollable inside) */}
      {sidebar && (
        <aside className="w-full md:w-64 border-r border-border bg-surface shrink-0 z-20">
          <div className="sticky top-0 h-auto md:h-screen flex flex-col">
            {sidebar}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navigation */}
        {topbar && (
          <header className="sticky top-0 h-14 border-b border-border bg-surface flex items-center px-6 z-10 shrink-0">
            {topbar}
          </header>
        )}

        {/* Inner page container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
);
DashboardShell.displayName = "DashboardShell";
```
