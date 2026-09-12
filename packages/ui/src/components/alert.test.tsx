import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Alert } from "./alert";

describe("Alert", () => {
  describe("rendering & defaults", () => {
    it("renders with role='alert' and default info variant", () => {
      render(<Alert>System notification</Alert>);
      const alert = screen.getByRole("alert");

      expect(alert).toBeInTheDocument();
      expect(alert.tagName).toBe("DIV");
      expect(alert).toHaveTextContent("System notification");
      expect(alert).toHaveClass(
        "flex",
        "gap-3",
        "items-start",
        "p-[0.9rem_1.1rem]",
        "rounded-kj-md",
        "border",
        "text-sm",
        "bg-info-surface",
        "border-info/30"
      );
    });

    it("renders children inside a styled paragraph", () => {
      render(<Alert>Detailed description message</Alert>);
      const message = screen.getByText("Detailed description message");
      expect(message.tagName).toBe("P");
      expect(message).toHaveClass("m-0", "opacity-85");
    });

    it("does not render children paragraph when children is omitted", () => {
      const { container } = render(<Alert title="Only Title" />);
      const textContainer = container.querySelector(".text-foreground");
      expect(textContainer).toBeInTheDocument();
      expect(textContainer?.querySelectorAll("p")).toHaveLength(1);
    });
  });

  describe("variants", () => {
    it("renders info variant classes", () => {
      render(<Alert variant="info">Info note</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("bg-info-surface", "border-info/30");
    });

    it("renders success variant classes", () => {
      render(<Alert variant="success">Success note</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("bg-success-surface", "border-success/30");
    });

    it("renders warning variant classes", () => {
      render(<Alert variant="warning">Warning note</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("bg-warning-surface", "border-warning/30");
    });

    it("renders danger variant classes", () => {
      render(<Alert variant="danger">Danger note</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("bg-danger-surface", "border-danger/30");
    });
  });

  describe("title", () => {
    it("renders title in a bold paragraph", () => {
      render(<Alert title="Update Available">A new version is ready.</Alert>);
      const title = screen.getByText("Update Available");
      expect(title.tagName).toBe("P");
      expect(title).toHaveClass("font-bold", "m-0", "mb-0.5", "text-sm");
      expect(screen.getByText("A new version is ready.")).toBeInTheDocument();
    });

    it("renders ReactNode title", () => {
      render(
        <Alert title={<span data-testid="custom-title">Custom Node Title</span>}>
          Body text
        </Alert>
      );
      expect(screen.getByTestId("custom-title")).toBeInTheDocument();
    });

    it("does not render title element when title is not provided", () => {
      const { container } = render(<Alert>Just text</Alert>);
      const boldTitle = container.querySelector(".font-bold");
      expect(boldTitle).toBeNull();
    });
  });

  describe("icon", () => {
    it("renders icon with matching variant color for info (default)", () => {
      render(
        <Alert icon={<svg data-testid="alert-icon" />}>
          Message with icon
        </Alert>
      );
      const icon = screen.getByTestId("alert-icon");
      expect(icon).toBeInTheDocument();
      const iconWrapper = icon.parentElement;
      expect(iconWrapper).toHaveClass(
        "shrink-0",
        "mt-0.5",
        "[&_svg]:h-[1.15rem]",
        "[&_svg]:w-[1.15rem]",
        "text-info"
      );
    });

    it("renders icon with success color", () => {
      render(
        <Alert variant="success" icon={<svg data-testid="success-icon" />}>
          Success message
        </Alert>
      );
      const iconWrapper = screen.getByTestId("success-icon").parentElement;
      expect(iconWrapper).toHaveClass("text-success");
    });

    it("renders icon with warning color", () => {
      render(
        <Alert variant="warning" icon={<svg data-testid="warning-icon" />}>
          Warning message
        </Alert>
      );
      const iconWrapper = screen.getByTestId("warning-icon").parentElement;
      expect(iconWrapper).toHaveClass("text-warning");
    });

    it("renders icon with danger color", () => {
      render(
        <Alert variant="danger" icon={<svg data-testid="danger-icon" />}>
          Danger message
        </Alert>
      );
      const iconWrapper = screen.getByTestId("danger-icon").parentElement;
      expect(iconWrapper).toHaveClass("text-danger");
    });

    it("does not render icon wrapper when icon is not provided", () => {
      const { container } = render(<Alert>No icon alert</Alert>);
      const iconWrapper = container.querySelector(".shrink-0");
      expect(iconWrapper).toBeNull();
    });
  });

  describe("ref forwarding & HTML attributes", () => {
    it("forwards ref to the root HTMLDivElement", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Alert ref={ref}>Ref alert</Alert>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.getAttribute("role")).toBe("alert");
    });

    it("merges custom className with default classes", () => {
      render(<Alert className="custom-class shadow-lg">Custom</Alert>);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("custom-class", "shadow-lg", "bg-info-surface");
    });

    it("forwards standard HTML attributes and handles click events", () => {
      const handleClick = vi.fn();
      render(
        <Alert
          id="system-alert"
          data-testid="interactive-alert"
          aria-live="polite"
          onClick={handleClick}
        >
          Clickable
        </Alert>
      );

      const alert = screen.getByTestId("interactive-alert");
      expect(alert).toHaveAttribute("id", "system-alert");
      expect(alert).toHaveAttribute("aria-live", "polite");

      fireEvent.click(alert);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
