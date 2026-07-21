# ProgressRing and ImageGallery Design Specification

**Date:** 2026-07-21  
**Status:** Approved  
**Targets:** `@kjaniec-dev/ui`  

---

## 1. Overview & Objectives

This specification covers the design and implementation of two new component suites for `@kjaniec-dev/ui`:

1. **`ProgressRing` & `ProgressRingField`**: Circular progress indicator using SVG `stroke-dashoffset` animations with configurable sizes, color tones, center content slot, and form field wrapper.
2. **`ImageGallery`**: Responsive grid of image thumbnails with configurable columns, aspect ratios, max visible limits with `+N` count overlays, and an interactive Modal lightbox with keyboard navigation (`←`, `→`, `Esc`).

---

## 2. Component Specifications

### 2.1 `ProgressRing` & `ProgressRingField`

**File:** `packages/ui/src/components/progress-ring.tsx`

#### Interfaces & Types

```typescript
export type ProgressRingSize = "sm" | "md" | "lg" | "xl";
export type ProgressRingTone = "primary" | "secondary" | "success" | "warning" | "danger" | "info";

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  size?: ProgressRingSize;
  tone?: ProgressRingTone;
  showValue?: boolean;
  strokeWidth?: number;
  trackColor?: string;
  indicatorColor?: string;
  children?: React.ReactNode;
}

export interface ProgressRingFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  ringProps: ProgressRingProps;
}
```

#### Size Constants
- `sm`: 36px diameter, 3px stroke width
- `md`: 48px diameter, 4px stroke width (default)
- `lg`: 72px diameter, 6px stroke width
- `xl`: 96px diameter, 8px stroke width

#### Behavior & Accessibility
- Uses SVG `<circle>` elements for track and indicator.
- Applies `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}`, and `role="progressbar"`.
- Center label auto-calculates percentage display when `showValue={true}` and no custom `children` is provided.

---

### 2.2 `ImageGallery`

**File:** `packages/ui/src/components/image-gallery.tsx`

#### Interfaces & Types

```typescript
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
```

#### Behavior & Accessibility
- **Thumbnail Grid**: CSS Grid layout with configurable column count and aspect ratio.
- **Max Visible Count Overlay**: If `maxVisible` is specified and `images.length > maxVisible`, the last visible thumbnail displays a dark overlay with `+N` remaining images count.
- **Lightbox Modal**:
  - Clicking any thumbnail opens the lightbox Modal displaying the full-size image, caption, image counter (`Index + 1 of Total`), Previous (`←`) and Next (`→`) buttons.
  - Listens for `ArrowLeft`, `ArrowRight`, and `Escape` keyboard events when open.
  - Implements focus management and ARIA attributes for modal overlays.

---

## 3. Exports & Showcase Integration

- **Barrel Export**: Added to `packages/ui/src/index.ts`.
- **Unit Tests**:
  - `packages/ui/src/components/progress-ring.test.tsx` (value calculations, sizes, tones, field wrapper)
  - `packages/ui/src/components/image-gallery.test.tsx` (grid rendering, maxVisible overlay, modal open/close, prev/next navigation)
- **Storybook**:
  - `packages/ui/src/components/progress-ring.stories.tsx`
  - `packages/ui/src/components/image-gallery.stories.tsx`
- **Showcase Site**:
  - Added interactive demo sections in `site/src/sections/primitives.tsx` or `data-display.tsx`.
- **Backlog**:
  - Update `docs/BACKLOG.md` marking both `- [x]` completed.
