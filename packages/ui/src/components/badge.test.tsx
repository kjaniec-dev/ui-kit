import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Badge, badgeVariants } from "./badge";

describe("Badge", () => {
  describe("rendering & defaults", () => {
    it("renders with default props and children text", () => {
      render(<Badge>Default Badge</Badge>);
      const badge = screen.getByText("Default Badge");

      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe("SPAN");
      expect(badge).toHaveClass(
        "inline-flex",
        "items-center",
        "gap-1.5",
        "px-2.5",
        "py-0.5",
        "text-xs",
        "font-semibold",
        "leading-snug",
        "rounded-full",
        "border",
        "border-transparent"
      );
      // Default variant is neutral
      expect(badge).toHaveClass("bg-muted", "text-muted-foreground");
    });

    it("renders complex children such as icons and text", () => {
      render(
        <Badge>
          <span data-testid="badge-icon">★</span>
          <span>Featured</span>
        </Badge>
      );

      expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
      expect(screen.getByText("Featured")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("renders neutral variant", () => {
      render(<Badge variant="neutral">Neutral</Badge>);
      const badge = screen.getByText("Neutral");
      expect(badge).toHaveClass("bg-muted", "text-muted-foreground");
    });

    it("renders primary variant", () => {
      render(<Badge variant="primary">Primary</Badge>);
      const badge = screen.getByText("Primary");
      expect(badge).toHaveClass("bg-primary/15", "text-primary-hover", "dark:text-primary");
    });

    it("renders secondary variant", () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText("Secondary");
      expect(badge).toHaveClass("bg-secondary/15", "text-secondary-hover", "dark:text-secondary");
    });

    it("renders success variant", () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText("Success");
      expect(badge).toHaveClass("bg-success-surface", "text-success");
    });

    it("renders warning variant", () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText("Warning");
      expect(badge).toHaveClass("bg-warning-surface", "text-warning");
    });

    it("renders danger variant", () => {
      render(<Badge variant="danger">Danger</Badge>);
      const badge = screen.getByText("Danger");
      expect(badge).toHaveClass("bg-danger-surface", "text-danger");
    });

    it("renders info variant", () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByText("Info");
      expect(badge).toHaveClass("bg-info-surface", "text-info");
    });

    it("renders solid variant", () => {
      render(<Badge variant="solid">Solid</Badge>);
      const badge = screen.getByText("Solid");
      expect(badge).toHaveClass("bg-primary", "text-primary-foreground");
    });
  });

  describe("dot indicator", () => {
    it("does not render dot indicator when dot is omitted or false", () => {
      const { container } = render(<Badge>No Dot</Badge>);
      const dots = container.querySelectorAll(".rounded-full.bg-current");
      expect(dots).toHaveLength(0);
    });

    it("renders leading dot indicator when dot is true", () => {
      const { container } = render(<Badge dot>Active</Badge>);
      const badge = screen.getByText("Active");
      const dot = container.querySelector(".rounded-full.bg-current");

      expect(dot).toBeInTheDocument();
      expect(dot).toHaveClass("h-1.5", "w-1.5", "rounded-full", "bg-current");
      expect(dot).toHaveAttribute("aria-hidden", "true");
      // Verify dot is inside the badge and is the first child
      expect(badge.firstChild).toBe(dot);
    });
  });

  describe("ref forwarding & HTML attributes", () => {
    it("forwards ref to the span element", () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Badge ref={ref}>Ref Badge</Badge>);

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current?.textContent).toBe("Ref Badge");
    });

    it("merges custom className with default classes", () => {
      render(<Badge className="custom-test-class shadow-sm">Custom Class</Badge>);
      const badge = screen.getByText("Custom Class");

      expect(badge).toHaveClass("custom-test-class", "shadow-sm", "bg-muted");
    });

    it("forwards standard HTML attributes and handles event listeners", () => {
      const handleClick = vi.fn();
      render(
        <Badge
          id="badge-test-id"
          data-testid="interactive-badge"
          title="Badge Title"
          aria-label="Accessible Badge"
          onClick={handleClick}
        >
          Clickable
        </Badge>
      );

      const badge = screen.getByTestId("interactive-badge");
      expect(badge).toHaveAttribute("id", "badge-test-id");
      expect(badge).toHaveAttribute("title", "Badge Title");
      expect(badge).toHaveAttribute("aria-label", "Accessible Badge");

      fireEvent.click(badge);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("badgeVariants helper function", () => {
    it("returns default classes when called with no arguments", () => {
      const classes = badgeVariants();
      expect(classes).toContain("bg-muted");
      expect(classes).toContain("text-muted-foreground");
      expect(classes).toContain("inline-flex");
    });

    it("returns appropriate classes when specified variant is provided", () => {
      const classes = badgeVariants({ variant: "danger" });
      expect(classes).toContain("bg-danger-surface");
      expect(classes).toContain("text-danger");
    });

    it("combines variant classes with additional className passed to cva", () => {
      const classes = badgeVariants({ variant: "solid", className: "my-extra-class" });
      expect(classes).toContain("bg-primary");
      expect(classes).toContain("text-primary-foreground");
      expect(classes).toContain("my-extra-class");
    });
  });
});
