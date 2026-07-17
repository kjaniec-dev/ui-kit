# Timeline / ActivityFeed — Design

## Summary

Add a `Timeline` / `ActivityFeed` component system to `@kjaniec-dev/ui`. Closes the `Timeline` / `ActivityFeed` item in `docs/BACKLOG.md`'s "New components: common B2B/dashboard gaps" section. This component is highly requested for SaaS dashboards, audit logs, event histories, and marketing roadmap/company history pages.

## Scope

- **Compound API design**: Provide modular subcomponents (`Timeline`, `TimelineItem`, `TimelineSeparator`, `TimelineDot`, `TimelineConnector`, `TimelineContent`, `TimelineTitle`, `TimelineTime`) that can be combined dynamically.
- **Flexible alignments**: Support left-aligned (default, standard dashboard logs), right-aligned, and alternating tracks.
- **Responsive design**: The alternating track layout automatically collapses to a clean left-aligned track on mobile devices (`max-md:` screen sizes).
- **Customizable dots**: The `TimelineDot` supports rendering simple color-coded dots, custom status icons, images, or user initials (avatars).
- **Connector control**: Automatically terminate the vertical track connector at the last item (using a `group-last:hidden` styling or equivalent DOM control) so it doesn't leak into empty space below the final dot.
- No new external npm dependencies. Demos and stories will use inline SVG icons or standard text.

## Architecture

The system consists of stateless/presentational React components. To share layout rules (specifically `align`) down the component tree without prop drilling, we use a lightweight `TimelineContext`.

- **`Timeline`** (`packages/ui/src/components/timeline.tsx`)
  - Root container that sets up the `TimelineContext` and wraps items in a semantic list structure (`role="list"`).
- **`TimelineItem`**
  - Renders a list item (`role="listitem"`). It queries `align` from context and sets up the CSS Grid structure (2 columns for left/right, 3 columns for alternating). It has the `group` class to enable `group-last:hidden` targeting on the connector.
- **`TimelineSeparator`**
  - Grid column wrapper for the track line and the marker dot.
- **`TimelineDot`**
  - Renders the marker point. Supports size variants (`sm`, `md`, `lg`) and theme color variants (`default`, `primary`, `secondary`, `success`, `warning`, `danger`).
- **`TimelineConnector`**
  - Renders the vertical track line. Hidden automatically in the last item.
- **`TimelineContent`**
  - Wrapper for the event body (header, description, cards, action buttons).

## Component API

```tsx
import * as React from "react";

export type TimelineAlign = "left" | "right" | "alternate";
export type TimelineDotVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
export type TimelineDotSize = "sm" | "md" | "lg";

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: TimelineAlign; // default "left"
}

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface TimelineConnectorProps extends React.HTMLAttributes<HTMLDivElement> {
  dashed?: boolean;
}

export interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TimelineDotVariant; // default "default"
  size?: TimelineDotSize; // default "md"
}

export interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface TimelineTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface TimelineTimeProps extends React.HTMLAttributes<HTMLSpanElement> {}
```

## Styling & Layout Mechanics (CSS Grid)

- **`Timeline`**: `flex flex-col gap-6 w-full`
- **`TimelineItem`**:
  - Base: `grid w-full gap-4 items-start`
  - Alignment variations:
    - `align="left"`: `grid-cols-[auto_1fr]`
    - `align="right"`: `grid-cols-[1fr_auto] text-right`
    - `align="alternate"`: `md:grid-cols-[1fr_auto_1fr] grid-cols-[auto_1fr] max-md:gap-4`
      - For alternating, we use Tailwind classes or index checks to position content. Inside alternating:
        - Odd items: Content is in the first column, Separator is in the second, empty spacer `<div>` in the third. On mobile, the first column becomes empty/hidden or shifts to 2 columns.
        - Even items: Spacer `<div>` is in the first column, Separator is in the second, Content is in the third.
        - To make this simple and robust, we can use flex direction reversing or a pure CSS class solution:
          - We can use CSS grid column rules. Inside alternating, the separator is always in column 2 on desktop (`md:col-start-2`), content is in column 1 for odd items (`md:col-start-1 md:text-right`) and column 3 for even items (`md:col-start-3`). On mobile, it falls back to 2 columns `grid-cols-[auto_1fr]` with separator in column 1 and content in column 2.
- **`TimelineSeparator`**: `flex flex-col items-center justify-self-center h-full min-h-[40px]`
- **`TimelineConnector`**: `w-0.5 grow bg-border group-last:hidden`
  - If `dashed` is true: `w-0 border-l border-dashed border-border group-last:hidden`
- **`TimelineDot`**:
  - Sizes:
    - `sm`: `w-2 h-2 rounded-full`
    - `md`: `w-3 h-3 rounded-full`
    - `lg`: `w-8 h-8 rounded-full flex items-center justify-center border-2` (perfect for icons/initials)
  - Color Variants (Zinc base theme):
    - `default`: `bg-muted border-border text-muted-foreground`
    - `primary`: `bg-primary/10 border-primary text-primary`
    - `secondary`: `bg-secondary/10 border-secondary text-secondary`
    - `success`: `bg-success-surface border-success text-success`
    - `warning`: `bg-warning-surface border-warning text-warning`
    - `danger`: `bg-danger-surface border-danger text-danger`

## Accessibility (A11y)

- Renders a semantic list container (`role="list"` or `<ol>`) of item nodes (`role="listitem"` or `<li>`).
- The `TimelineTime` uses the semantic `<time>` tag under the hood for clean machine-readable date/time markers.
- Contrast ratios for the colored dots and connectors conform to WCAG AA requirements.

## Testing

- **`timeline.test.tsx`**
  - Renders simple left-aligned timeline correctly.
  - Alternating layout switches classes for odd/even items.
  - Connector is hidden on the final item of the timeline.
  - `TimelineDot` renders appropriate classes for `size` and `variant` props.
  - Custom icons/children inside `TimelineDot` render successfully.

## Non-goals (this iteration)

- Interactive timeline expansion (e.g. accordion-style collapse). Consumers can achieve this by embedding the `Accordion` or a custom state disclosure inside `TimelineContent`.
- Dynamic scrolling animation triggers. This is a layout primitive; visual entrance effects are the responsibility of the consumer using standard CSS view transitions or scroll animation utilities.
