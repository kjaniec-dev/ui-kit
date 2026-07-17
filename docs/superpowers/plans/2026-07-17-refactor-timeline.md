# Timeline Component Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Timeline component to implement `TimelineItemContext` (removing child-cloning), update `TimelineTime` types and refs to `HTMLTimeElement`, and condition the background color of `TimelineConnector` when it is dashed.

**Architecture:** 
1. Use `TimelineItemContext` to share `isEven` and `align` states from `TimelineItem` down to `TimelineSeparator` and `TimelineContent`.
2. Update `TimelineTime` type and forwardRef to use `HTMLTimeElement` and `React.TimeHTMLAttributes<HTMLTimeElement>`.
3. Update `TimelineConnector` to apply `bg-border` only when not dashed.
4. Add E2E/unit tests verifying correct styles, types, and context-based rendering even when nested.

**Tech Stack:** React, Vitest, Testing Library, TypeScript, Tailwind CSS

---

### Task 1: Add Unit Tests for Timeline (TDD Phase)

**Files:**
- Create: `packages/ui/src/components/timeline.test.tsx`

- [ ] **Step 1: Create unit test file**
Write the following test suite to `packages/ui/src/components/timeline.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineTime,
} from "./timeline";

describe("Timeline Refactoring Tests", () => {
  it("TimelineTime supports the standard dateTime attribute and renders as a time element", () => {
    const { container } = render(
      <TimelineTime dateTime="2026-07-17" data-testid="time">
        July 17, 2026
      </TimelineTime>
    );
    const element = container.querySelector('[data-testid="time"]') as HTMLTimeElement;
    expect(element.tagName.toLowerCase()).toBe("time");
    expect(element.getAttribute("dateTime")).toBe("2026-07-17");
  });

  it("TimelineConnector applies bg-border only when not dashed", () => {
    const { container: containerDashed } = render(
      <TimelineConnector dashed data-testid="dashed-connector" />
    );
    const { container: containerSolid } = render(
      <TimelineConnector data-testid="solid-connector" />
    );

    const dashed = containerDashed.querySelector('[data-testid="dashed-connector"]') as HTMLElement;
    const solid = containerSolid.querySelector('[data-testid="solid-connector"]') as HTMLElement;

    expect(dashed.className).not.toContain("bg-border");
    expect(dashed.className).toContain("border-dashed");

    expect(solid.className).toContain("bg-border");
    expect(solid.className).not.toContain("border-dashed");
  });

  it("TimelineSeparator and TimelineContent resolve context even when nested (nested context check)", () => {
    const { container } = render(
      <Timeline align="alternate">
        <TimelineItem index={1}>
          <div>
            <TimelineSeparator data-testid="separator">
              <TimelineDot />
            </TimelineSeparator>
            <TimelineContent data-testid="content">
              Nested Content
            </TimelineContent>
          </div>
        </TimelineItem>
      </Timeline>
    );

    const separator = container.querySelector('[data-testid="separator"]') as HTMLElement;
    const content = container.querySelector('[data-testid="content"]') as HTMLElement;

    // With context-based resolution, alternate layout with index=1 (odd, so isEven=false)
    // separator: md:col-start-2
    // content: md:col-start-1 (not index=0 which would be md:col-start-3)
    expect(separator.className).toContain("md:col-start-2");
    expect(content.className).toContain("md:col-start-1");
  });
});
```

- [ ] **Step 2: Run tests and watch them fail (Verify RED)**
Run: `npm run test --workspace @kjaniec-dev/ui`
Expected behavior: The new tests should fail because:
1. `TimelineTime` fails type-checking (does not accept `dateTime` on HTMLSpanElement types).
2. `dashed` connector still contains `bg-border`.
3. Nested context test fails to apply alternate classes because the child elements are nested under a `div` and do not receive the cloned props.

---

### Task 2: Implement Refactoring in timeline.tsx (GREEN Phase)

**Files:**
- Modify: `packages/ui/src/components/timeline.tsx`

- [ ] **Step 1: Refactor component code**
Modify `packages/ui/src/components/timeline.tsx` to include `TimelineItemContext` and update component definitions according to the requirements.

- [ ] **Step 2: Verify tests pass**
Run: `npm run test --workspace @kjaniec-dev/ui`
Expected behavior: All tests pass cleanly.

- [ ] **Step 3: Run typechecks**
Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected behavior: TSC compiles successfully with no errors.

---

### Task 3: Commit and Verify

- [ ] **Step 1: Stage and commit the refactored code and test file**
Run:
```bash
git add packages/ui/src/components/timeline.tsx packages/ui/src/components/timeline.test.tsx
git commit -m "refactor(ui): resolve child cloning, time props type, and connector styling issues"
```
