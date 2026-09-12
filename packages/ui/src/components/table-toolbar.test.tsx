import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TableToolbar } from "./table-toolbar";

describe("TableToolbar", () => {
  describe("rendering basics", () => {
    it("renders root container with default layout classes", () => {
      render(<TableToolbar data-testid="toolbar-root" />);
      const toolbar = screen.getByTestId("toolbar-root");

      expect(toolbar.tagName).toBe("DIV");
      expect(toolbar).toHaveClass(
        "flex",
        "flex-col",
        "sm:flex-row",
        "items-stretch",
        "sm:items-center",
        "justify-between",
        "gap-3",
        "w-full",
        "pb-1"
      );
    });

    it("does not render search input when onSearchChange is not provided", () => {
      render(<TableToolbar searchQuery="foo" data-testid="toolbar" />);
      expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    });

    it("does not render filters or actions containers when omitted", () => {
      const { container } = render(<TableToolbar data-testid="toolbar" />);
      // Only the root toolbar and the inner left-aligned wrapper are rendered
      expect(container.querySelectorAll(".shrink-0.justify-end")).toHaveLength(0);
    });

    it("merges custom className onto root container", () => {
      render(
        <TableToolbar className="custom-toolbar border-b border-border mb-4" data-testid="toolbar" />
      );
      const toolbar = screen.getByTestId("toolbar");

      expect(toolbar).toHaveClass(
        "custom-toolbar",
        "border-b",
        "border-border",
        "mb-4",
        "flex"
      );
    });

    it("forwards ref to HTMLDivElement", () => {
      const ref = createRef<HTMLDivElement>();
      render(<TableToolbar ref={ref} data-testid="toolbar-ref" />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toBe(screen.getByTestId("toolbar-ref"));
    });

    it("passes standard HTML attributes", () => {
      render(
        <TableToolbar
          id="table-toolbar"
          role="toolbar"
          aria-label="Table controls"
          data-testid="toolbar"
        />
      );
      const toolbar = screen.getByTestId("toolbar");

      expect(toolbar).toHaveAttribute("id", "table-toolbar");
      expect(toolbar).toHaveAttribute("role", "toolbar");
      expect(toolbar).toHaveAttribute("aria-label", "Table controls");
    });

    it("has the correct displayName", () => {
      expect(TableToolbar.displayName).toBe("TableToolbar");
    });
  });

  describe("search input", () => {
    it("renders search input when onSearchChange is provided", () => {
      const handleSearch = vi.fn();
      render(<TableToolbar onSearchChange={handleSearch} />);

      const searchInput = screen.getByRole("searchbox");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("type", "search");
      expect(searchInput).toHaveAttribute("placeholder", "Search...");
    });

    it("renders custom search placeholder", () => {
      const handleSearch = vi.fn();
      render(
        <TableToolbar
          onSearchChange={handleSearch}
          searchPlaceholder="Filter customers by name..."
        />
      );

      const searchInput = screen.getByPlaceholderText("Filter customers by name...");
      expect(searchInput).toBeInTheDocument();
    });

    it("displays the provided searchQuery as input value", () => {
      const handleSearch = vi.fn();
      render(<TableToolbar onSearchChange={handleSearch} searchQuery="Initial query" />);

      const searchInput = screen.getByRole("searchbox") as HTMLInputElement;
      expect(searchInput.value).toBe("Initial query");
    });

    it("calls onSearchChange callback when typing into the search input", () => {
      const handleSearch = vi.fn();
      render(<TableToolbar onSearchChange={handleSearch} searchQuery="" />);

      const searchInput = screen.getByRole("searchbox");
      fireEvent.change(searchInput, { target: { value: "Ada Lovelace" } });

      expect(handleSearch).toHaveBeenCalledTimes(1);
      expect(handleSearch).toHaveBeenCalledWith("Ada Lovelace");
    });

    it("renders leading search icon inside search input", () => {
      const handleSearch = vi.fn();
      const { container } = render(<TableToolbar onSearchChange={handleSearch} />);

      const svgIcon = container.querySelector("svg.h-4.w-4");
      expect(svgIcon).toBeInTheDocument();
    });
  });

  describe("filters and actions slots", () => {
    it("renders filters slot inside left wrapper", () => {
      render(
        <TableToolbar
          filters={
            <div data-testid="status-filters">
              <button type="button">Active</button>
              <button type="button">Archived</button>
            </div>
          }
        />
      );

      const filters = screen.getByTestId("status-filters");
      expect(filters).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Active" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Archived" })).toBeInTheDocument();

      // Parent container should have flex alignment
      expect(filters.parentElement).toHaveClass("flex", "items-center", "gap-2");
    });

    it("renders actions slot inside right-aligned container", () => {
      render(
        <TableToolbar
          actions={
            <div data-testid="action-buttons">
              <button type="button">Export CSV</button>
              <button type="button">Add Member</button>
            </div>
          }
        />
      );

      const actions = screen.getByTestId("action-buttons");
      expect(actions).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add Member" })).toBeInTheDocument();

      expect(actions.parentElement).toHaveClass(
        "flex",
        "items-center",
        "gap-2",
        "shrink-0",
        "justify-end"
      );
    });

    it("allows clicking buttons inside filters and actions slots", () => {
      const handleFilterClick = vi.fn();
      const handleActionClick = vi.fn();

      render(
        <TableToolbar
          filters={
            <button type="button" onClick={handleFilterClick}>
              Filter by Role
            </button>
          }
          actions={
            <button type="button" onClick={handleActionClick}>
              Create New
            </button>
          }
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Filter by Role" }));
      expect(handleFilterClick).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole("button", { name: "Create New" }));
      expect(handleActionClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("complete composition", () => {
    it("renders search, filters, and actions concurrently", () => {
      const handleSearch = vi.fn();

      render(
        <TableToolbar
          searchQuery="prod"
          onSearchChange={handleSearch}
          searchPlaceholder="Search products..."
          filters={<span data-testid="category-badge">Category: All</span>}
          actions={<button type="button">New Product</button>}
          data-testid="full-toolbar"
        />
      );

      expect(screen.getByTestId("full-toolbar")).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText("Search products...");
      expect(searchInput).toBeInTheDocument();
      expect((searchInput as HTMLInputElement).value).toBe("prod");

      expect(screen.getByTestId("category-badge")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "New Product" })).toBeInTheDocument();
    });
  });
});
