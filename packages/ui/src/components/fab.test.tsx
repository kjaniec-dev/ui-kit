import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Fab, fabVariants } from "./fab";

describe("Fab", () => {
  const defaultIcon = <span data-testid="plus-icon">+</span>;

  describe("rendering & defaults", () => {
    it("renders with default props, icon, and accessible label", () => {
      render(<Fab icon={defaultIcon} label="Add new item" />);
      const button = screen.getByRole("button", { name: "Add new item" });

      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe("BUTTON");
      expect(button).toHaveAttribute("aria-label", "Add new item");
      expect(button).not.toBeDisabled();
      expect(button).not.toHaveAttribute("aria-busy");

      // Default variants: primary, md, bottom-right
      expect(button).toHaveClass(
        "bg-primary",
        "text-primary-foreground",
        "h-14",
        "w-14",
        "fixed",
        "bottom-6",
        "right-6",
        "z-50"
      );

      // Icon wrapper and icon content
      expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
    });

    it("renders svg icon with proper scaling styles on wrapper", () => {
      render(
        <Fab
          icon={<svg data-testid="svg-icon"><path d="" /></svg>}
          label="Action"
        />
      );

      const iconWrapper = screen.getByTestId("svg-icon").parentElement;
      expect(iconWrapper).toHaveClass(
        "[&_svg]:h-[1.35em]",
        "[&_svg]:w-[1.35em]",
        "flex",
        "items-center",
        "justify-center"
      );
    });
  });

  describe("variants", () => {
    it("renders primary variant", () => {
      render(<Fab icon={defaultIcon} label="Primary Fab" variant="primary" />);
      const button = screen.getByRole("button", { name: "Primary Fab" });
      expect(button).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("renders secondary variant", () => {
      render(<Fab icon={defaultIcon} label="Secondary Fab" variant="secondary" />);
      const button = screen.getByRole("button", { name: "Secondary Fab" });
      expect(button).toHaveClass("bg-secondary", "text-secondary-foreground");
    });

    it("renders outline variant", () => {
      render(<Fab icon={defaultIcon} label="Outline Fab" variant="outline" />);
      const button = screen.getByRole("button", { name: "Outline Fab" });
      expect(button).toHaveClass("bg-transparent", "text-foreground", "border-border");
    });

    it("renders danger variant", () => {
      render(<Fab icon={defaultIcon} label="Danger Fab" variant="danger" />);
      const button = screen.getByRole("button", { name: "Danger Fab" });
      expect(button).toHaveClass("bg-danger", "text-white");
    });
  });

  describe("sizes", () => {
    it("renders sm size", () => {
      render(<Fab icon={defaultIcon} label="Small Fab" size="sm" />);
      const button = screen.getByRole("button", { name: "Small Fab" });
      expect(button).toHaveClass("h-10", "w-10", "p-0", "text-sm");
    });

    it("renders md size by default", () => {
      render(<Fab icon={defaultIcon} label="Medium Fab" size="md" />);
      const button = screen.getByRole("button", { name: "Medium Fab" });
      expect(button).toHaveClass("h-14", "w-14", "p-0", "text-base");
    });

    it("renders lg size", () => {
      render(<Fab icon={defaultIcon} label="Large Fab" size="lg" />);
      const button = screen.getByRole("button", { name: "Large Fab" });
      expect(button).toHaveClass("h-16", "w-16", "p-0", "text-lg");
    });
  });

  describe("positions", () => {
    it("renders bottom-right position by default", () => {
      render(<Fab icon={defaultIcon} label="Bottom Right Fab" position="bottom-right" />);
      const button = screen.getByRole("button", { name: "Bottom Right Fab" });
      expect(button).toHaveClass("fixed", "bottom-6", "right-6", "z-50");
    });

    it("renders bottom-left position", () => {
      render(<Fab icon={defaultIcon} label="Bottom Left Fab" position="bottom-left" />);
      const button = screen.getByRole("button", { name: "Bottom Left Fab" });
      expect(button).toHaveClass("fixed", "bottom-6", "left-6", "z-50");
    });

    it("renders bottom-center position", () => {
      render(<Fab icon={defaultIcon} label="Bottom Center Fab" position="bottom-center" />);
      const button = screen.getByRole("button", { name: "Bottom Center Fab" });
      expect(button).toHaveClass("fixed", "bottom-6", "left-1/2", "-translate-x-1/2", "z-50");
    });

    it("renders none position (relative positioning)", () => {
      render(<Fab icon={defaultIcon} label="Inline Fab" position="none" />);
      const button = screen.getByRole("button", { name: "Inline Fab" });
      expect(button).toHaveClass("relative");
      expect(button).not.toHaveClass("fixed");
    });
  });

  describe("mobileOnly", () => {
    it("applies md:hidden class when mobileOnly is true", () => {
      render(<Fab icon={defaultIcon} label="Mobile Only Fab" mobileOnly />);
      const button = screen.getByRole("button", { name: "Mobile Only Fab" });
      expect(button).toHaveClass("md:hidden");
    });

    it("does not apply md:hidden class when mobileOnly is false or omitted", () => {
      render(<Fab icon={defaultIcon} label="All Screens Fab" />);
      const button = screen.getByRole("button", { name: "All Screens Fab" });
      expect(button).not.toHaveClass("md:hidden");
    });
  });

  describe("loading state", () => {
    it("shows loading spinner, sets aria-busy, and hides icon when loading is true", () => {
      const { container } = render(<Fab icon={defaultIcon} label="Loading Fab" loading />);
      const button = screen.getByRole("button", { name: "Loading Fab" });

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(screen.queryByTestId("plus-icon")).toBeNull();

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute("aria-hidden", "true");
      expect(spinner).toHaveClass(
        "h-[1.2em]",
        "w-[1.2em]",
        "rounded-full",
        "border-2",
        "border-current",
        "border-t-transparent"
      );
    });

    it("does not fire onClick when clicked in loading state", () => {
      const handleClick = vi.fn();
      render(<Fab icon={defaultIcon} label="Loading Fab" loading onClick={handleClick} />);
      const button = screen.getByRole("button", { name: "Loading Fab" });

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("disabled state & interactions", () => {
    it("disables button and applies disabled styles when disabled prop is true", () => {
      render(<Fab icon={defaultIcon} label="Disabled Fab" disabled />);
      const button = screen.getByRole("button", { name: "Disabled Fab" });

      expect(button).toBeDisabled();
      expect(button).toHaveClass("disabled:opacity-50", "disabled:pointer-events-none");
    });

    it("does not fire onClick when disabled", () => {
      const handleClick = vi.fn();
      render(<Fab icon={defaultIcon} label="Disabled Fab" disabled onClick={handleClick} />);
      const button = screen.getByRole("button", { name: "Disabled Fab" });

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("fires onClick when active and clicked", () => {
      const handleClick = vi.fn();
      render(<Fab icon={defaultIcon} label="Active Fab" onClick={handleClick} />);
      const button = screen.getByRole("button", { name: "Active Fab" });

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("ref forwarding & HTML attributes", () => {
    it("forwards ref to the HTMLButtonElement", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Fab icon={defaultIcon} label="Ref Fab" ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.getAttribute("aria-label")).toBe("Ref Fab");
    });

    it("merges custom className with default classes", () => {
      render(<Fab icon={defaultIcon} label="Custom Fab" className="custom-fab-shadow uppercase" />);
      const button = screen.getByRole("button", { name: "Custom Fab" });

      expect(button).toHaveClass("custom-fab-shadow", "uppercase", "bg-primary");
    });

    it("forwards standard HTML button attributes such as type and data attributes", () => {
      render(
        <Fab
          icon={defaultIcon}
          label="Submit Fab"
          type="submit"
          id="submit-fab-id"
          data-testid="fab-test"
        />
      );

      const button = screen.getByTestId("fab-test");
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveAttribute("id", "submit-fab-id");
    });
  });

  describe("fabVariants helper function", () => {
    it("returns default classes when called with no arguments", () => {
      const classes = fabVariants();
      expect(classes).toContain("bg-primary");
      expect(classes).toContain("h-14");
      expect(classes).toContain("fixed");
      expect(classes).toContain("bottom-6");
      expect(classes).toContain("right-6");
    });

    it("returns expected classes for specific variant, size, and position combinations", () => {
      const classes = fabVariants({
        variant: "danger",
        size: "sm",
        position: "bottom-left",
      });
      expect(classes).toContain("bg-danger");
      expect(classes).toContain("h-10");
      expect(classes).toContain("left-6");
    });

    it("combines variant classes with additional className", () => {
      const classes = fabVariants({
        variant: "outline",
        position: "none",
        className: "extra-fab-class",
      });
      expect(classes).toContain("bg-transparent");
      expect(classes).toContain("relative");
      expect(classes).toContain("extra-fab-class");
    });
  });
});
