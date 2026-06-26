# Floating Action Button (FAB) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a reusable `Fab` (Floating Action Button) component in `@kjaniec-dev/ui` package with customizable position, mobile-only display, sizes, variants, loading, and disabled states.

**Architecture:** Create a new React component `Fab` in `packages/ui/src/components/fab.tsx` using `class-variance-authority` (cva) for style variants. Export it in `packages/ui/src/index.ts`. Add Storybook stories in `packages/ui/src/components/fab.stories.tsx` for visual confirmation.

**Tech Stack:** React, Tailwind CSS v4, Class Variance Authority (CVA), Storybook.

---

### Task 1: Create the Fab Component File

**Files:**
- Create: `packages/ui/src/components/fab.tsx`

- [ ] **Step 1: Write the component code**
Create the file with the complete implementation, inheriting button props, accessibility attributes, CVA options, loading spinner, and responsive mobile-only toggling.

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const fabVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "font-sans font-semibold leading-none",
    "rounded-full cursor-pointer shadow-lg",
    "transition-[background-color,color,border-color,box-shadow,transform] duration-150",
    "active:translate-y-px active:shadow-md",
    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45",
    "disabled:opacity-50 disabled:pointer-events-none z-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover border border-transparent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-transparent",
        outline: "bg-transparent text-foreground border border-border hover:bg-muted hover:border-muted-foreground",
        danger: "bg-danger text-white hover:brightness-95 border border-transparent",
      },
      size: {
        sm: "h-10 w-10 p-0 text-sm",
        md: "h-14 w-14 p-0 text-base",
        lg: "h-16 w-16 p-0 text-lg",
      },
      position: {
        "bottom-right": "fixed bottom-6 right-6",
        "bottom-left": "fixed bottom-6 left-6",
        "bottom-center": "fixed bottom-6 left-1/2 -translate-x-1/2",
        none: "relative",
      },
    },
    defaultVariants: { variant: "primary", size: "md", position: "bottom-right" },
  }
);

export interface FabProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  /** Icon rendered inside the button. */
  icon: React.ReactNode;
  
  /** Text label for accessibility (aria-label). */
  label: string;
  
  /** If true, the FAB will only be visible on mobile screens (< 768px). */
  mobileOnly?: boolean;
  
  /** Shows a spinner and disables interaction. */
  loading?: boolean;
}

export const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
  ({ className, variant, size, position, mobileOnly, icon, label, loading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          fabVariants({ variant, size, position }),
          mobileOnly && "md:hidden",
          loading && "relative",
          className
        )}
        disabled={disabled || loading}
        aria-label={label}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden
            className="h-[1.2em] w-[1.2em] rounded-full border-2 border-current border-t-transparent animate-spin"
          />
        ) : (
          <span className="[&_svg]:h-[1.35em] [&_svg]:w-[1.35em] flex items-center justify-center">
            {icon}
          </span>
        )}
      </button>
    );
  }
);
Fab.displayName = "Fab";
```

- [ ] **Step 2: Commit Task 1**

```bash
git add packages/ui/src/components/fab.tsx
git commit -m "feat: add Fab component implementation"
```

---

### Task 2: Create Storybook Stories for Fab

**Files:**
- Create: `packages/ui/src/components/fab.stories.tsx`

- [ ] **Step 1: Write the Storybook stories**
Create stories illustrating all variants, sizes, positioning configurations, loading state, and responsive behaviors.

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Fab } from "./fab";

const meta = {
  title: "Components/Fab",
  component: Fab,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    position: {
      control: "select",
      options: ["bottom-right", "bottom-left", "bottom-center", "none"],
    },
    mobileOnly: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Fab>;

export default meta;
type Story = StoryObj<typeof meta>;

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const Default: Story = {
  args: {
    icon: <PlusIcon />,
    label: "Add Item",
    position: "none",
    variant: "primary",
    size: "md",
  },
};

export const Floating: Story = {
  render: (args) => (
    <div className="w-[500px] h-[300px] border border-dashed border-gray-300 relative overflow-hidden bg-gray-50 p-4">
      <p className="text-sm text-gray-500">Przewijalna lub duża treść widoku mobilnego...</p>
      <div className="h-[400px]"></div>
      <Fab {...args} position="bottom-right" className="absolute" />
    </div>
  ),
  args: {
    icon: <PlusIcon />,
    label: "Floating Add",
    variant: "primary",
    size: "md",
  },
};
```

- [ ] **Step 2: Commit Task 2**

```bash
git add packages/ui/src/components/fab.stories.tsx
git commit -m "feat: add Fab Storybook stories"
```

---

### Task 3: Export Fab Component from the Package Index

**Files:**
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Edit packages/ui/src/index.ts to export Fab**
Open `packages/ui/src/index.ts` and add the barrel exports for `Fab` and `FabProps`.

```diff
 export { SettingsLayout, type SettingsLayoutProps } from "./components/settings-layout";
 export { DetailPageLayout, type DetailPageLayoutProps } from "./components/detail-page-layout";
 export { TableToolbar, type TableToolbarProps } from "./components/table-toolbar";
 export { ConfirmDialog, type ConfirmDialogProps } from "./components/confirm-dialog";
 export { Drawer, type DrawerProps } from "./components/drawer";
 export { CommandPalette, type CommandPaletteItem, type CommandPaletteProps } from "./components/command-palette";
 export { SidebarNav, type SidebarNavItem, type SidebarNavGroup, type SidebarNavProps } from "./components/sidebar-nav";
+export { Fab, type FabProps } from "./components/fab";
```

- [ ] **Step 2: Commit Task 3**

```bash
git add packages/ui/src/index.ts
git commit -m "feat: export Fab component from ui package index"
```

---

### Task 4: Verify the Build and Type Safety

**Files:**
- Run: commands in terminal

- [ ] **Step 1: Check typescript types for the package**
Run the typescript compiler type check to ensure no exports or imports break.
Run: `npm run typecheck --workspace=packages/ui` or in `packages/ui` directory run `npm run typecheck`
Expected: Done / exit 0 with no errors.

- [ ] **Step 2: Build the package**
Run the build script to ensure `tsup` successfully bundles the component.
Run: `npm run build --workspace=packages/ui` or in `packages/ui` directory run `npm run build`
Expected: Successful build, generating output in `dist` folder.
