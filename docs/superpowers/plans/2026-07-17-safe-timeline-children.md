# Timeline Children Filtering and Test Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `Timeline` in `packages/ui/src/components/timeline.tsx` to handle conditional/falsy children safely, fix unused React import in `packages/ui/src/components/timeline.test.tsx`, and add/update unit tests to verify the layout classes and conditional children logic.

**Architecture:**
1. Filter out falsy/invalid children in the `Timeline` rendering code using `React.Children.toArray(children).filter(React.isValidElement)`.
2. Map over the filtered valid children to assign the correct index prop.
3. Remove `import * as React from "react";` from `packages/ui/src/components/timeline.test.tsx`.
4. Update the left-aligned layout test in `packages/ui/src/components/timeline.test.tsx` to assert on specific column classes.
5. Add a test case for conditional falsy children in `packages/ui/src/components/timeline.test.tsx` to verify correct tracking.

**Tech Stack:** React, Vitest, Testing Library, TypeScript, Tailwind CSS

---

### Task 1: Safe Children Filtering in Timeline Component

**Files:**
- Modify: `packages/ui/src/components/timeline.tsx`

- [ ] **Step 1: Update the children mapping in Timeline**
Modify `packages/ui/src/components/timeline.tsx` around line 27-36:
```tsx
    const validChildren = React.Children.toArray(children).filter(React.isValidElement);
    const count = validChildren.length;

    const childrenWithIndex = validChildren.map((child, index) => {
      return React.cloneElement(child as React.ReactElement<any>, {
        index,
      });
    });
```

---

### Task 2: Remove Unused Import and Update/Add Tests in timeline.test.tsx

**Files:**
- Modify: `packages/ui/src/components/timeline.test.tsx`

- [ ] **Step 1: Remove unused import**
Remove `import * as React from "react";` from `packages/ui/src/components/timeline.test.tsx`.

- [ ] **Step 2: Update the left-aligned layout test**
Modify the `renders a semantic list structure with correct classes` test case to:
```tsx
  it("renders a semantic list structure with correct classes for left alignment", () => {
    const { getByRole, getAllByRole, container } = render(
      <Timeline>
        <TimelineItem>
          <TimelineSeparator data-testid="separator">
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent data-testid="content">
            <TimelineTitle>Step 1</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    );

    const list = getByRole("list");
    const items = getAllByRole("listitem");

    expect(list.className).toContain("flex");
    expect(list.className).toContain("flex-col");
    expect(items).toHaveLength(1);

    const item = items[0];
    expect(item.className).toContain("grid-cols-[auto_1fr]");

    const separator = container.querySelector('[data-testid="separator"]') as HTMLElement;
    expect(separator.className).toContain("col-start-1");

    const content = container.querySelector('[data-testid="content"]') as HTMLElement;
    expect(content.className).toContain("col-start-2");
    expect(content.className).toContain("text-left");
  });
```

- [ ] **Step 3: Add new test case for conditional children**
Add the following test:
```tsx
  it("handles conditional null/false children gracefully without breaking isLast", () => {
    const showExtra = false;
    const { container } = render(
      <Timeline>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector data-testid="conn-0" />
          </TimelineSeparator>
          <TimelineContent>Content 1</TimelineContent>
        </TimelineItem>
        {showExtra && (
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector data-testid="conn-extra" />
            </TimelineSeparator>
            <TimelineContent>Extra</TimelineContent>
          </TimelineItem>
        )}
      </Timeline>
    );

    const conn0 = container.querySelector('[data-testid="conn-0"]') as HTMLElement;
    expect(conn0.className).toContain("group-last/timeline-item:hidden");
  });
```

---

### Task 3: Verification and Committing

- [ ] **Step 1: Run workspace typechecks**
Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: PASS

- [ ] **Step 2: Run workspace tests**
Run: `npm run test --workspace @kjaniec-dev/ui`
Expected: PASS

- [ ] **Step 3: Commit changes**
Commit changes with message: `fix(ui): handle conditional children safely in Timeline and fix unused test imports`
