import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

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
        <TimelineItem>
          <div>
            <TimelineSeparator data-testid="separator-0">
              <TimelineDot />
            </TimelineSeparator>
            <TimelineContent data-testid="content-0">
              Nested Content 0
            </TimelineContent>
          </div>
        </TimelineItem>
        <TimelineItem>
          <div>
            <TimelineSeparator data-testid="separator-1">
              <TimelineDot />
            </TimelineSeparator>
            <TimelineContent data-testid="content-1">
              Nested Content 1
            </TimelineContent>
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
});
