import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineTitle,
  TimelineTime,
} from "./timeline";

describe("Timeline", () => {
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

  it("applies correct layout alignment classes to item and content columns", () => {
    const { container } = render(
      <Timeline align="alternate">
        <TimelineItem>
          <TimelineSeparator data-testid="sep-0">
            <TimelineDot />
          </TimelineSeparator>
          <TimelineContent data-testid="content-0">Item 1</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator data-testid="sep-1">
            <TimelineDot />
          </TimelineSeparator>
          <TimelineContent data-testid="content-1">Item 2</TimelineContent>
        </TimelineItem>
      </Timeline>
    );

    const content0 = container.querySelector('[data-testid="content-0"]') as HTMLElement;
    const content1 = container.querySelector('[data-testid="content-1"]') as HTMLElement;

    // Index 0 (Even) -> right column in desktop, left column in mobile
    expect(content0.className).toContain("md:col-start-3");
    expect(content0.className).toContain("col-start-2");

    // Index 1 (Odd) -> left column in desktop, left column in mobile
    expect(content1.className).toContain("md:col-start-1");
    expect(content1.className).toContain("col-start-2");
  });

  it("hides connector on the last item", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector data-testid="conn-0" />
          </TimelineSeparator>
          <TimelineContent>Content 1</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector data-testid="conn-1" />
          </TimelineSeparator>
          <TimelineContent>Content 2</TimelineContent>
        </TimelineItem>
      </Timeline>
    );

    const conn0 = container.querySelector('[data-testid="conn-0"]') as HTMLElement;
    const conn1 = container.querySelector('[data-testid="conn-1"]') as HTMLElement;

    expect(conn0.className).not.toContain("hidden");
    expect(conn1.className).toContain("hidden");
  });

  it("renders dots with correct size and variant classes", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot size="lg" variant="success" data-testid="dot" />
          </TimelineSeparator>
          <TimelineContent>Content</TimelineContent>
        </TimelineItem>
      </Timeline>
    );

    const dot = container.querySelector('[data-testid="dot"]') as HTMLElement;
    expect(dot.className).toContain("w-8");
    expect(dot.className).toContain("border-success");
  });

  it("renders custom children inside TimelineDot", () => {
    const { getByText } = render(
      <TimelineDot size="lg">
        <span>Check</span>
      </TimelineDot>
    );
    expect(getByText("Check")).toBeDefined();
  });

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
        <TimelineItem>
          <div>
            <TimelineSeparator data-testid="separator-0">
              <TimelineDot />
            </TimelineSeparator>
            <TimelineContent data-testid="content-0">Nested Content 0</TimelineContent>
          </div>
        </TimelineItem>
        <TimelineItem>
          <div>
            <TimelineSeparator data-testid="separator-1">
              <TimelineDot />
            </TimelineSeparator>
            <TimelineContent data-testid="content-1">Nested Content 1</TimelineContent>
          </div>
        </TimelineItem>
      </Timeline>
    );

    const separator0 = container.querySelector('[data-testid="separator-0"]') as HTMLElement;
    const content0 = container.querySelector('[data-testid="content-0"]') as HTMLElement;
    const separator1 = container.querySelector('[data-testid="separator-1"]') as HTMLElement;
    const content1 = container.querySelector('[data-testid="content-1"]') as HTMLElement;

    // Index 0 (Even)
    expect(separator0.className).toContain("md:col-start-2");
    expect(content0.className).toContain("md:col-start-3");

    // Index 1 (Odd)
    expect(separator1.className).toContain("md:col-start-2");
    expect(content1.className).toContain("md:col-start-1");
  });

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
    expect(conn0.className).toContain("hidden");
  });
});
