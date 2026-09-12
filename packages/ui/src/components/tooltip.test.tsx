import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  it("renders trigger element and tooltip content with role='tooltip'", () => {
    render(<Tooltip content="Helpful information">Hover me</Tooltip>);

    expect(screen.getByText("Hover me")).toBeInTheDocument();
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Helpful information");
  });

  it("sets tabIndex={0} on the trigger wrapper for keyboard focusability", () => {
    render(<Tooltip content="Tooltip message">Focusable trigger</Tooltip>);

    const triggerWrapper = screen.getByText("Focusable trigger").closest("span")!;
    expect(triggerWrapper).toHaveAttribute("tabindex", "0");
  });

  it("applies group and styling classes for hover and focus visibility", () => {
    render(<Tooltip content="Visible on hover">Hover target</Tooltip>);

    const triggerWrapper = screen.getByText("Hover target").closest("span")!;
    expect(triggerWrapper.className).toContain("relative");
    expect(triggerWrapper.className).toContain("inline-flex");
    expect(triggerWrapper.className).toContain("group");

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.className).toContain("opacity-0");
    expect(tooltip.className).toContain("group-hover:opacity-100");
    expect(tooltip.className).toContain("group-focus-visible:opacity-100");
    expect(tooltip.className).toContain("pointer-events-none");
    expect(tooltip.className).toContain("shadow-kj-md");
  });

  it("merges custom className onto the trigger wrapper", () => {
    render(
      <Tooltip content="Styled tooltip" className="custom-tooltip-class">
        <span>Custom Trigger</span>
      </Tooltip>
    );

    const triggerWrapper = screen.getByText("Custom Trigger").parentElement!;
    expect(triggerWrapper).toHaveClass("custom-tooltip-class");
    expect(triggerWrapper).toHaveClass("group");
  });

  it("renders complex ReactNode content and children correctly", () => {
    render(
      <Tooltip
        content={
          <span data-testid="rich-tooltip">
            <strong>Bold</strong> description
          </span>
        }
      >
        <button type="button">Action Button</button>
      </Tooltip>
    );

    expect(screen.getByRole("button", { name: "Action Button" })).toBeInTheDocument();
    expect(screen.getByTestId("rich-tooltip")).toBeInTheDocument();
    expect(screen.getByRole("tooltip")).toContainElement(screen.getByTestId("rich-tooltip"));
  });
});
