import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  describe("rendering & structure", () => {
    it("renders navigation element with default aria-label and styling", () => {
      render(<Pagination page={1} pageCount={5} onPageChange={() => {}} />);

      const nav = screen.getByRole("navigation", { name: "Paginacja" });
      expect(nav).toBeInTheDocument();
      expect(nav.tagName).toBe("NAV");
      expect(nav).toHaveClass("flex", "items-center", "gap-1");
    });

    it("merges custom className into nav", () => {
      render(
        <Pagination
          page={1}
          pageCount={5}
          onPageChange={() => {}}
          className="custom-pagination-class justify-center"
        />
      );

      const nav = screen.getByRole("navigation", { name: "Paginacja" });
      expect(nav).toHaveClass("custom-pagination-class", "justify-center", "flex");
    });

    it("renders Previous and Next icon buttons", () => {
      render(<Pagination page={2} pageCount={5} onPageChange={() => {}} />);

      expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });
  });

  describe("active page & aria-current", () => {
    it("marks current page with aria-current='page'", () => {
      render(<Pagination page={3} pageCount={5} onPageChange={() => {}} />);

      const activeBtn = screen.getByRole("button", { name: "3" });
      expect(activeBtn).toHaveAttribute("aria-current", "page");

      const inactiveBtn = screen.getByRole("button", { name: "2" });
      expect(inactiveBtn).not.toHaveAttribute("aria-current");
    });
  });

  describe("boundary conditions & disabled state", () => {
    it("disables Previous button on first page (page <= 1)", () => {
      const handlePageChange = vi.fn();
      render(<Pagination page={1} pageCount={5} onPageChange={handlePageChange} />);

      const prevBtn = screen.getByRole("button", { name: "Previous" });
      const nextBtn = screen.getByRole("button", { name: "Next" });

      expect(prevBtn).toBeDisabled();
      expect(nextBtn).not.toBeDisabled();

      fireEvent.click(prevBtn);
      expect(handlePageChange).not.toHaveBeenCalled();
    });

    it("disables Next button on last page (page >= pageCount)", () => {
      const handlePageChange = vi.fn();
      render(<Pagination page={5} pageCount={5} onPageChange={handlePageChange} />);

      const prevBtn = screen.getByRole("button", { name: "Previous" });
      const nextBtn = screen.getByRole("button", { name: "Next" });

      expect(prevBtn).not.toBeDisabled();
      expect(nextBtn).toBeDisabled();

      fireEvent.click(nextBtn);
      expect(handlePageChange).not.toHaveBeenCalled();
    });

    it("disables both Previous and Next when pageCount is 1", () => {
      render(<Pagination page={1} pageCount={1} onPageChange={() => {}} />);

      expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    });

    it("enables both navigation buttons on a middle page", () => {
      render(<Pagination page={3} pageCount={5} onPageChange={() => {}} />);

      expect(screen.getByRole("button", { name: "Previous" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
    });
  });

  describe("navigation interactions", () => {
    it("calls onPageChange with specific page number when page button clicked", () => {
      const handlePageChange = vi.fn();
      render(<Pagination page={1} pageCount={5} onPageChange={handlePageChange} />);

      fireEvent.click(screen.getByRole("button", { name: "4" }));
      expect(handlePageChange).toHaveBeenCalledWith(4);
    });

    it("calls onPageChange with page - 1 when Previous button clicked", () => {
      const handlePageChange = vi.fn();
      render(<Pagination page={4} pageCount={5} onPageChange={handlePageChange} />);

      fireEvent.click(screen.getByRole("button", { name: "Previous" }));
      expect(handlePageChange).toHaveBeenCalledWith(3);
    });

    it("calls onPageChange with page + 1 when Next button clicked", () => {
      const handlePageChange = vi.fn();
      render(<Pagination page={2} pageCount={5} onPageChange={handlePageChange} />);

      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(handlePageChange).toHaveBeenCalledWith(3);
    });
  });

  describe("page list generation & ellipsis rendering", () => {
    it("renders all pages without ellipsis when pageCount <= 7", () => {
      render(<Pagination page={3} pageCount={7} onPageChange={() => {}} />);

      for (let i = 1; i <= 7; i++) {
        expect(screen.getByRole("button", { name: String(i) })).toBeInTheDocument();
      }
      expect(screen.queryByText("…")).toBeNull();
    });

    it("renders trailing ellipsis when page is near the beginning (pageCount > 7)", () => {
      render(<Pagination page={1} pageCount={10} onPageChange={() => {}} />);

      // paginate(1, 10) => [1, 2, '…', 10]
      expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();

      const ellipses = screen.getAllByText("…");
      expect(ellipses).toHaveLength(1);
      expect(ellipses[0]).toHaveClass("px-1", "text-muted-foreground", "select-none");
    });

    it("renders leading and trailing ellipses when page is in the middle (pageCount > 7)", () => {
      render(<Pagination page={5} pageCount={10} onPageChange={() => {}} />);

      // paginate(5, 10) => [1, '…', 4, 5, 6, '…', 10]
      expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();

      const ellipses = screen.getAllByText("…");
      expect(ellipses).toHaveLength(2);
    });

    it("renders leading ellipsis when page is near the end (pageCount > 7)", () => {
      render(<Pagination page={10} pageCount={10} onPageChange={() => {}} />);

      // paginate(10, 10) => [1, '…', 9, 10]
      expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "9" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();

      const ellipses = screen.getAllByText("…");
      expect(ellipses).toHaveLength(1);
    });
  });
});
