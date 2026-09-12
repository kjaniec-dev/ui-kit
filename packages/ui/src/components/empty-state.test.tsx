import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  describe("rendering basics", () => {
    it("renders with required title and default styling", () => {
      render(<EmptyState title="No items found" data-testid="empty-state" />);
      const root = screen.getByTestId("empty-state");

      expect(root.tagName).toBe("DIV");
      expect(root).toHaveClass(
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "text-center",
        "p-8",
        "border",
        "border-dashed",
        "border-border",
        "rounded-kj-lg",
        "bg-muted/20",
        "min-h-[300px]"
      );

      const heading = screen.getByRole("heading", { level: 3, name: "No items found" });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass("text-base", "font-bold", "text-foreground", "mb-1");
    });

    it("does not render icon, description, or action slots when omitted", () => {
      const { container } = render(<EmptyState title="Quiet in here" />);

      expect(container.querySelector("p")).not.toBeInTheDocument();
      expect(container.querySelector(".rounded-full")).not.toBeInTheDocument();
      expect(container.querySelector(".gap-3")).not.toBeInTheDocument();
    });

    it("merges custom className onto root container", () => {
      render(
        <EmptyState
          title="Customized"
          className="custom-empty-class bg-background border-solid"
          data-testid="empty-state"
        />
      );
      const root = screen.getByTestId("empty-state");

      expect(root).toHaveClass("custom-empty-class", "bg-background", "border-solid", "min-h-[300px]");
    });

    it("forwards ref to HTMLDivElement", () => {
      const ref = createRef<HTMLDivElement>();
      render(<EmptyState ref={ref} title="With ref" data-testid="empty-state-ref" />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toBe(screen.getByTestId("empty-state-ref"));
    });

    it("passes standard HTML attributes", () => {
      render(
        <EmptyState
          title="Accessible"
          role="status"
          aria-live="polite"
          data-testid="empty-state"
        />
      );
      const root = screen.getByTestId("empty-state");

      expect(root).toHaveAttribute("role", "status");
      expect(root).toHaveAttribute("aria-live", "polite");
    });

    it("has the correct displayName", () => {
      expect(EmptyState.displayName).toBe("EmptyState");
    });
  });

  describe("icon slot", () => {
    it("renders icon inside circular badge wrapper", () => {
      render(
        <EmptyState
          title="No results"
          icon={<svg data-testid="search-icon" />}
        />
      );

      const icon = screen.getByTestId("search-icon");
      expect(icon).toBeInTheDocument();

      const iconWrapper = icon.parentElement;
      expect(iconWrapper).toHaveClass(
        "flex",
        "h-12",
        "w-12",
        "items-center",
        "justify-center",
        "rounded-full",
        "bg-muted",
        "text-muted-foreground",
        "mb-4"
      );
    });
  });

  describe("description slot", () => {
    it("renders description text in a styled paragraph", () => {
      render(
        <EmptyState
          title="No orders yet"
          description="When customers place orders, they will appear here."
        />
      );

      const desc = screen.getByText("When customers place orders, they will appear here.");
      expect(desc.tagName).toBe("P");
      expect(desc).toHaveClass(
        "text-sm",
        "text-muted-foreground",
        "max-w-sm",
        "mb-6",
        "leading-relaxed"
      );
    });
  });

  describe("action slot", () => {
    it("renders action node and handles interactions", () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="No projects"
          action={
            <button type="button" onClick={handleAction}>
              Create Project
            </button>
          }
        />
      );

      const button = screen.getByRole("button", { name: "Create Project" });
      expect(button).toBeInTheDocument();

      const actionWrapper = button.parentElement;
      expect(actionWrapper).toHaveClass("flex", "items-center", "gap-3");

      fireEvent.click(button);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it("supports multiple actions in slot", () => {
      render(
        <EmptyState
          title="No documents"
          action={
            <>
              <button type="button">Upload File</button>
              <button type="button">Import from Cloud</button>
            </>
          }
        />
      );

      expect(screen.getByRole("button", { name: "Upload File" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Import from Cloud" })).toBeInTheDocument();
    });
  });

  describe("full composite layout", () => {
    it("renders icon, title, description, and action simultaneously", () => {
      const handleCreate = vi.fn();
      render(
        <EmptyState
          icon={<span data-testid="folder-icon">📁</span>}
          title="No repositories found"
          description="Try creating a new repository or adjust your search filter."
          action={
            <button type="button" onClick={handleCreate}>
              New repository
            </button>
          }
          data-testid="full-empty-state"
        />
      );

      expect(screen.getByTestId("full-empty-state")).toBeInTheDocument();
      expect(screen.getByTestId("folder-icon")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3, name: "No repositories found" })).toBeInTheDocument();
      expect(screen.getByText("Try creating a new repository or adjust your search filter.")).toBeInTheDocument();

      const button = screen.getByRole("button", { name: "New repository" });
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(handleCreate).toHaveBeenCalledTimes(1);
    });
  });
});
