# ProgressRing and ImageGallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `ProgressRing` (and `ProgressRingField`) and `ImageGallery` (with Modal lightbox) component suites in `@kjaniec-dev/ui`, complete with unit tests, Storybook stories, showcase demos, and backlog updates.

**Architecture:** SVG-based circular progress calculations for `ProgressRing` and CSS Grid thumbnail layout with Modal-based lightbox for `ImageGallery`. Barrel exported via `packages/ui/src/index.ts`.

**Tech Stack:** React 19, TypeScript, Vitest, Tailwind CSS, Storybook.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `packages/ui/src/components/progress-ring.tsx` | ProgressRing & ProgressRingField component implementations |
| Create | `packages/ui/src/components/progress-ring.test.tsx` | Vitest unit tests for ProgressRing suite |
| Create | `packages/ui/src/components/progress-ring.stories.tsx` | Storybook stories for ProgressRing |
| Create | `packages/ui/src/components/image-gallery.tsx` | ImageGallery & Modal Lightbox component implementations |
| Create | `packages/ui/src/components/image-gallery.test.tsx` | Vitest unit tests for ImageGallery suite |
| Create | `packages/ui/src/components/image-gallery.stories.tsx` | Storybook stories for ImageGallery |
| Modify | `packages/ui/src/index.ts` | Re-export ProgressRing and ImageGallery suites |
| Modify | `site/src/sections/primitives.tsx` | Add ProgressRing demo to Primitives/Feedback showcase section |
| Modify | `site/src/sections/data-display.tsx` | Add ImageGallery demo to Data Display showcase section |
| Modify | `docs/BACKLOG.md` | Mark ProgressRing and ImageGallery as complete (`[x]`) |

---

## Task 1: `ProgressRing` & `ProgressRingField` Implementation (TDD)

**Files:**
- Create: `packages/ui/src/components/progress-ring.tsx`
- Create: `packages/ui/src/components/progress-ring.test.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1.1: Write failing unit test for `ProgressRing`**

Create `packages/ui/src/components/progress-ring.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProgressRing, ProgressRingField } from "./progress-ring";

describe("ProgressRing", () => {
  it("renders with progressbar role and aria attributes", () => {
    render(<ProgressRing value={75} size="md" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeDefined();
    expect(progressbar.getAttribute("aria-valuenow")).toBe("75");
    expect(progressbar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressbar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("displays percentage text when showValue is true", () => {
    render(<ProgressRing value={42} showValue />);
    expect(screen.getByText("42%")).toBeDefined();
  });

  it("renders custom children in center slot", () => {
    render(
      <ProgressRing value={90}>
        <span data-testid="custom-center">Done</span>
      </ProgressRing>
    );
    expect(screen.getByTestId("custom-center")).toBeDefined();
  });

  it("renders ProgressRingField with label and hint", () => {
    render(
      <ProgressRingField
        label="Course Progress"
        hint="Keep up the great work!"
        ringProps={{ value: 80, showValue: true }}
      />
    );
    expect(screen.getByText("Course Progress")).toBeDefined();
    expect(screen.getByText("Keep up the great work!")).toBeDefined();
    expect(screen.getByText("80%")).toBeDefined();
  });
});
```

- [ ] **Step 1.2: Run test to verify failure**

```bash
cd packages/ui && npx vitest run src/components/progress-ring.test.tsx
```

Expected: FAIL (Cannot find module `./progress-ring`)

- [ ] **Step 1.3: Implement `ProgressRing` & `ProgressRingField`**

Create `packages/ui/src/components/progress-ring.tsx`:

```tsx
import * as React from "react";
import { cn } from "@kjaniec-dev/design";

export type ProgressRingSize = "sm" | "md" | "lg" | "xl";
export type ProgressRingTone = "primary" | "secondary" | "success" | "warning" | "danger" | "info";

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  size?: ProgressRingSize;
  tone?: ProgressRingTone;
  showValue?: boolean;
  strokeWidth?: number;
  trackColor?: string;
  indicatorColor?: string;
  children?: React.ReactNode;
}

const SIZE_MAP: Record<ProgressRingSize, { diameter: number; stroke: number; fontSize: string }> = {
  sm: { diameter: 36, stroke: 3, fontSize: "text-[0.65rem]" },
  md: { diameter: 48, stroke: 4, fontSize: "text-xs" },
  lg: { diameter: 72, stroke: 6, fontSize: "text-sm" },
  xl: { diameter: 96, stroke: 8, fontSize: "text-base" },
};

const TONE_COLOR_MAP: Record<ProgressRingTone, string> = {
  primary: "var(--kj-primary)",
  secondary: "var(--kj-secondary)",
  success: "var(--kj-success)",
  warning: "var(--kj-warning)",
  danger: "var(--kj-danger)",
  info: "var(--kj-info)",
};

export const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      value = 0,
      size = "md",
      tone = "primary",
      showValue = false,
      strokeWidth,
      trackColor = "var(--kj-border)",
      indicatorColor,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    const config = SIZE_MAP[size];
    const sw = strokeWidth ?? config.stroke;
    const radius = (config.diameter - sw) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference;
    const activeColor = indicatorColor ?? TONE_COLOR_MAP[tone];

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("relative inline-flex items-center justify-center shrink-0", className)}
        style={{ width: config.diameter, height: config.diameter }}
        {...props}
      >
        <svg
          width={config.diameter}
          height={config.diameter}
          viewBox={`0 0 ${config.diameter} ${config.diameter}`}
          className="-rotate-90"
        >
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={sw}
          />
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke={activeColor}
            strokeWidth={sw}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {(showValue || children) && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center font-medium leading-none text-foreground select-none",
              config.fontSize
            )}
          >
            {children ?? `${Math.round(clampedValue)}%`}
          </div>
        )}
      </div>
    );
  }
);

ProgressRing.displayName = "ProgressRing";

export interface ProgressRingFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  ringProps: ProgressRingProps;
  className?: string;
}

export function ProgressRingField({ label, hint, error, ringProps, className }: ProgressRingFieldProps) {
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <ProgressRing {...ringProps} />
      {(label || hint || error) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-semibold text-foreground">{label}</span>}
          {hint && !error && <span className="text-xs text-muted-foreground">{hint}</span>}
          {error && <span className="text-xs text-danger font-medium">{error}</span>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 1.4: Add barrel export to `packages/ui/src/index.ts`**

Export `ProgressRing`, `ProgressRingField`, `ProgressRingProps`, `ProgressRingFieldProps`, `ProgressRingSize`, `ProgressRingTone` in `packages/ui/src/index.ts`.

- [ ] **Step 1.5: Run test to verify it passes**

```bash
cd packages/ui && npx vitest run src/components/progress-ring.test.tsx
```

Expected: PASS (4 tests passed)

- [ ] **Step 1.6: Commit**

```bash
git add packages/ui/src/components/progress-ring.tsx packages/ui/src/components/progress-ring.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add ProgressRing and ProgressRingField component suite"
```

---

## Task 2: `ImageGallery` Implementation (TDD)

**Files:**
- Create: `packages/ui/src/components/image-gallery.tsx`
- Create: `packages/ui/src/components/image-gallery.test.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 2.1: Write failing unit test for `ImageGallery`**

Create `packages/ui/src/components/image-gallery.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ImageGallery } from "./image-gallery";

const SAMPLE_IMAGES = [
  { src: "https://example.com/img1.jpg", alt: "Property Front", caption: "Front entrance of villa" },
  { src: "https://example.com/img2.jpg", alt: "Living Room", caption: "Spacious living room" },
  { src: "https://example.com/img3.jpg", alt: "Kitchen", caption: "Modern kitchen with island" },
  { src: "https://example.com/img4.jpg", alt: "Master Bedroom", caption: "Master bedroom suite" },
];

describe("ImageGallery", () => {
  it("renders thumbnails for provided images", () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBe(4);
    expect(images[0].getAttribute("alt")).toBe("Property Front");
  });

  it("displays overlay count when maxVisible is set and images exceed limit", () => {
    render(<ImageGallery images={SAMPLE_IMAGES} maxVisible={2} />);
    expect(screen.getByText("+2")).toBeDefined();
  });

  it("opens modal lightbox on thumbnail click and allows navigation", () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />);
    const thumbnails = screen.getAllByRole("button");
    fireEvent.click(thumbnails[0]);

    // Modal opens
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("1 of 4")).toBeDefined();
    expect(screen.getByText("Front entrance of villa")).toBeDefined();

    // Click Next button
    const nextButton = screen.getByLabelText("Next image");
    fireEvent.click(nextButton);
    expect(screen.getByText("2 of 4")).toBeDefined();
    expect(screen.getByText("Spacious living room")).toBeDefined();
  });
});
```

- [ ] **Step 2.2: Run test to verify failure**

```bash
cd packages/ui && npx vitest run src/components/image-gallery.test.tsx
```

Expected: FAIL (Cannot find module `./image-gallery`)

- [ ] **Step 2.3: Implement `ImageGallery`**

Create `packages/ui/src/components/image-gallery.tsx`:

```tsx
import * as React from "react";
import { cn } from "@kjaniec-dev/design";
import { Modal } from "./modal";
import { Button } from "./button";

export interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
  title?: string;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4 | 5;
  aspectRatio?: "1/1" | "4/3" | "16/9" | "auto";
  maxVisible?: number;
  className?: string;
  onImageClick?: (image: GalleryImage, index: number) => void;
}

const COLUMN_MAP: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-5",
};

const ASPECT_MAP: Record<string, string> = {
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-video",
  auto: "aspect-auto",
};

export function ImageGallery({
  images,
  columns = 3,
  aspectRatio = "4/3",
  maxVisible,
  className,
  onImageClick,
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const visibleImages = maxVisible ? images.slice(0, maxVisible) : images;
  const remainingCount = maxVisible && images.length > maxVisible ? images.length - maxVisible : 0;

  const handleThumbnailClick = (index: number) => {
    setLightboxIndex(index);
    if (onImageClick) {
      onImageClick(images[index], index);
    }
  };

  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % images.length));
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + images.length) % images.length));
    }
  };

  React.useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, images.length]);

  const activeImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <>
      <div className={cn("grid gap-3", COLUMN_MAP[columns] ?? "grid-cols-3", className)}>
        {visibleImages.map((img, index) => {
          const isLastVisible = index === visibleImages.length - 1 && remainingCount > 0;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "relative group overflow-hidden rounded-kj-lg border border-border bg-subtle p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                ASPECT_MAP[aspectRatio] ?? "aspect-[4/3]"
              )}
            >
              <img
                src={img.src}
                alt={img.alt ?? `Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {isLastVisible && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-semibold text-lg">
                  +{remainingCount}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Modal open={lightboxIndex !== null} onClose={() => setLightboxIndex(null)} className="max-w-4xl p-0 overflow-hidden">
        {activeImage && (
          <div className="relative flex flex-col bg-background">
            <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[75vh] p-4">
              <img
                src={activeImage.src}
                alt={activeImage.alt ?? ""}
                className="max-h-[70vh] max-w-full object-contain mx-auto"
              />

              {/* Prev / Next Controls */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Previous image"
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur"
                  >
                    ‹
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Next image"
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur"
                  >
                    ›
                  </Button>
                </>
              )}
            </div>

            <div className="p-4 flex items-center justify-between border-t border-border bg-card">
              <div>
                {activeImage.title && <h4 className="text-sm font-semibold m-0">{activeImage.title}</h4>}
                {activeImage.caption && <p className="text-xs text-muted-foreground m-0 mt-0.5">{activeImage.caption}</p>}
              </div>
              <span className="text-xs font-mono text-muted-foreground shrink-0 ml-4">
                {lightboxIndex! + 1} of {images.length}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
```

- [ ] **Step 2.4: Add barrel export to `packages/ui/src/index.ts`**

Export `ImageGallery`, `GalleryImage`, `ImageGalleryProps` in `packages/ui/src/index.ts`.

- [ ] **Step 2.5: Run test to verify it passes**

```bash
cd packages/ui && npx vitest run src/components/image-gallery.test.tsx
```

Expected: PASS (3 tests passed)

- [ ] **Step 2.6: Commit**

```bash
git add packages/ui/src/components/image-gallery.tsx packages/ui/src/components/image-gallery.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add ImageGallery component with Modal lightbox"
```

---

## Task 3: Storybook Stories for `ProgressRing` & `ImageGallery`

**Files:**
- Create: `packages/ui/src/components/progress-ring.stories.tsx`
- Create: `packages/ui/src/components/image-gallery.stories.tsx`

- [ ] **Step 3.1: Create `packages/ui/src/components/progress-ring.stories.tsx`**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ProgressRing, ProgressRingField } from "./progress-ring";

const meta: Meta<typeof ProgressRing> = {
  title: "Components/ProgressRing",
  component: ProgressRing,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProgressRing>;

export const Default: Story = {
  args: {
    value: 65,
    size: "md",
    showValue: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <ProgressRing value={25} size="sm" showValue />
      <ProgressRing value={50} size="md" showValue />
      <ProgressRing value={75} size="lg" showValue />
      <ProgressRing value={100} size="xl" showValue />
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <ProgressRing value={80} tone="primary" showValue />
      <ProgressRing value={80} tone="success" showValue />
      <ProgressRing value={80} tone="warning" showValue />
      <ProgressRing value={80} tone="danger" showValue />
      <ProgressRing value={80} tone="info" showValue />
    </div>
  ),
};

export const FieldWrapper: Story = {
  render: () => (
    <ProgressRingField
      label="Course Progress"
      hint="Module 3 of 4 completed"
      ringProps={{ value: 75, tone: "success", showValue: true, size: "lg" }}
    />
  ),
};
```

- [ ] **Step 3.2: Create `packages/ui/src/components/image-gallery.stories.tsx`**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ImageGallery } from "./image-gallery";

const meta: Meta<typeof ImageGallery> = {
  title: "Components/ImageGallery",
  component: ImageGallery,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImageGallery>;

const SAMPLE_IMAGES = [
  { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", alt: "Villa Exterior", title: "Modern Villa", caption: "Luxury villa front elevation" },
  { src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", alt: "Living Room", title: "Open Plan Living", caption: "Spacious living room with natural light" },
  { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", alt: "Kitchen", title: "Gourmet Kitchen", caption: "Marble island with premium appliances" },
  { src: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800", alt: "Pool", title: "Private Pool", caption: "Heated swimming pool with sun deck" },
];

export const Default: Story = {
  args: {
    images: SAMPLE_IMAGES,
    columns: 3,
    aspectRatio: "4/3",
  },
};

export const MaxVisible: Story = {
  args: {
    images: SAMPLE_IMAGES,
    columns: 2,
    maxVisible: 2,
  },
};
```

- [ ] **Step 3.3: Commit Storybook stories**

```bash
git add packages/ui/src/components/progress-ring.stories.tsx packages/ui/src/components/image-gallery.stories.tsx
git commit -m "docs(ui): add Storybook stories for ProgressRing and ImageGallery"
```

---

## Task 4: Showcase Integration, Backlog Update & Monorepo Verification

**Files:**
- Modify: `site/src/sections/primitives.tsx`
- Modify: `site/src/sections/data-display.tsx`
- Modify: `docs/BACKLOG.md`

- [ ] **Step 4.1: Add `ProgressRing` showcase to `site/src/sections/primitives.tsx`**

Add `ProgressRing` and `ProgressRingField` interactive demos under the "Feedback & progress" section in `site/src/sections/primitives.tsx`.

- [ ] **Step 4.2: Add `ImageGallery` showcase to `site/src/sections/data-display.tsx`**

Add `ImageGallery` showcase section under `site/src/sections/data-display.tsx`.

- [ ] **Step 4.3: Mark backlog items as complete in `docs/BACKLOG.md`**

In `docs/BACKLOG.md`:
Change `- [ ] ProgressRing` to `- [x] ProgressRing`.
Change `- [ ] ImageGallery` to `- [x] ImageGallery`.

- [ ] **Step 4.4: Full monorepo verification**

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: All 4 commands succeed with 0 errors.

- [ ] **Step 4.5: Commit**

```bash
git add site/src/sections/primitives.tsx site/src/sections/data-display.tsx docs/BACKLOG.md
git commit -m "chore: showcase ProgressRing and ImageGallery & mark backlog complete"
```
