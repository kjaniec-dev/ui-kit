import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button, buttonVariants } from "./button";

describe("Button", () => {
  it("renders with default props and text content", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("h-10");
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveAttribute("aria-busy");
  });

  describe("variants", () => {
    it("renders primary variant by default", () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole("button", { name: "Primary" });
      expect(button).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("renders secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button", { name: "Secondary" });
      expect(button).toHaveClass("bg-secondary", "text-secondary-foreground");
    });

    it("renders outline variant", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole("button", { name: "Outline" });
      expect(button).toHaveClass("bg-transparent", "border-border");
    });

    it("renders ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button", { name: "Ghost" });
      expect(button).toHaveClass("bg-transparent", "hover:bg-muted");
    });

    it("renders danger variant", () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole("button", { name: "Danger" });
      expect(button).toHaveClass("bg-danger", "text-white");
    });

    it("exports buttonVariants cva function producing valid classes", () => {
      const classes = buttonVariants({ variant: "danger", size: "lg" });
      expect(classes).toContain("bg-danger");
      expect(classes).toContain("h-12");
    });
  });

  describe("sizes", () => {
    it("renders sm size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button", { name: "Small" });
      expect(button).toHaveClass("h-8", "px-3");
    });

    it("renders md size by default", () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole("button", { name: "Medium" });
      expect(button).toHaveClass("h-10", "px-[1.1rem]");
    });

    it("renders lg size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button", { name: "Large" });
      expect(button).toHaveClass("h-12", "px-6");
    });

    it("renders icon size", () => {
      render(
        <Button size="icon" aria-label="Icon Action">
          <span>★</span>
        </Button>
      );
      const button = screen.getByRole("button", { name: "Icon Action" });
      expect(button).toHaveClass("h-10", "w-10", "p-0");
    });

    it("renders icon-sm size", () => {
      render(
        <Button size="icon-sm" aria-label="Small Icon Action">
          <span>★</span>
        </Button>
      );
      const button = screen.getByRole("button", { name: "Small Icon Action" });
      expect(button).toHaveClass("h-8", "w-8", "p-0");
    });
  });

  describe("icons", () => {
    it("renders leadingIcon before children", () => {
      render(
        <Button leadingIcon={<span data-testid="lead-icon">→</span>}>
          Next
        </Button>
      );
      const icon = screen.getByTestId("lead-icon");
      expect(icon).toBeInTheDocument();
      const button = screen.getByRole("button", { name: /Next/i });
      expect(button).toContainElement(icon);
    });

    it("renders trailingIcon after children", () => {
      render(
        <Button trailingIcon={<span data-testid="trail-icon">←</span>}>
          Back
        </Button>
      );
      const icon = screen.getByTestId("trail-icon");
      expect(icon).toBeInTheDocument();
      const button = screen.getByRole("button", { name: /Back/i });
      expect(button).toContainElement(icon);
    });

    it("renders both leading and trailing icons simultaneously", () => {
      render(
        <Button
          leadingIcon={<span data-testid="lead">1</span>}
          trailingIcon={<span data-testid="trail">2</span>}
        >
          Center
        </Button>
      );
      expect(screen.getByTestId("lead")).toBeInTheDocument();
      expect(screen.getByTestId("trail")).toBeInTheDocument();
      expect(screen.getByText("Center")).toBeInTheDocument();
    });
  });

  describe("interactions and events", () => {
    it("fires onClick when clicked", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      const button = screen.getByRole("button", { name: "Click" });
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not fire onClick when disabled", () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole("button", { name: "Disabled" });
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("disables button and sets aria-busy when loading is true", () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Button loading onClick={handleClick}>
          Saving
        </Button>
      );
      const button = screen.getByRole("button", { name: "Saving" });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toHaveClass("relative");

      // Verify spinner is rendered
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute("aria-hidden", "true");

      // Verify content wrapper has invisible class
      const contentWrapper = container.querySelector(".invisible");
      expect(contentWrapper).toBeInTheDocument();
      expect(contentWrapper).toHaveTextContent("Saving");

      // Interaction blocked
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("does not render spinner when loading is false", () => {
      const { container } = render(<Button loading={false}>Ready</Button>);
      const button = screen.getByRole("button", { name: "Ready" });
      expect(button).not.toBeDisabled();
      expect(button).not.toHaveAttribute("aria-busy");
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe("ref and HTML attributes", () => {
    it("forwards ref to the underlying HTML button element", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe("Ref Button");
    });

    it("supports type attribute e.g. submit and reset", () => {
      render(<Button type="submit">Submit Form</Button>);
      const button = screen.getByRole("button", { name: "Submit Form" });
      expect(button).toHaveAttribute("type", "submit");
    });

    it("merges custom className with default styles", () => {
      render(<Button className="custom-test-class my-4">Styled</Button>);
      const button = screen.getByRole("button", { name: "Styled" });
      expect(button).toHaveClass("custom-test-class", "my-4", "bg-primary");
    });
  });
});
