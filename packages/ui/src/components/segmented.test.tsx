import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Segmented, type SegmentedOption } from "./segmented";

describe("Segmented", () => {
  const defaultOptions: SegmentedOption<string>[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  describe("rendering and accessibility", () => {
    it("renders a container with role tablist and tab buttons", () => {
      render(
        <Segmented
          options={defaultOptions}
          value="daily"
          onChange={() => {}}
          aria-label="Frequency"
        />
      );

      const tablist = screen.getByRole("tablist", { name: "Frequency" });
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
      expect(tabs.map((t) => t.textContent)).toEqual(["Daily", "Weekly", "Monthly"]);
    });

    it("renders buttons with type button", () => {
      render(<Segmented options={defaultOptions} value="weekly" onChange={() => {}} />);
      const tabs = screen.getAllByRole("tab");
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute("type", "button");
      });
    });

    it("supports ReactNode labels such as icons or badge elements", () => {
      const complexOptions: SegmentedOption<string>[] = [
        {
          value: "grid",
          label: <span data-testid="grid-icon">Grid View</span>,
        },
        {
          value: "list",
          label: <span data-testid="list-icon">List View</span>,
        },
      ];

      render(<Segmented options={complexOptions} value="grid" onChange={() => {}} />);
      expect(screen.getByTestId("grid-icon")).toBeInTheDocument();
      expect(screen.getByTestId("list-icon")).toBeInTheDocument();
    });

    it("handles empty options gracefully", () => {
      render(<Segmented options={[]} value="" onChange={() => {}} aria-label="Empty" />);
      const tablist = screen.getByRole("tablist", { name: "Empty" });
      expect(tablist).toBeInTheDocument();
      expect(screen.queryAllByRole("tab")).toHaveLength(0);
    });
  });

  describe("selection state and styling", () => {
    it("sets aria-selected=true on the active option and aria-selected=false on inactive options", () => {
      render(<Segmented options={defaultOptions} value="weekly" onChange={() => {}} />);

      const dailyTab = screen.getByRole("tab", { name: "Daily" });
      const weeklyTab = screen.getByRole("tab", { name: "Weekly" });
      const monthlyTab = screen.getByRole("tab", { name: "Monthly" });

      expect(dailyTab).toHaveAttribute("aria-selected", "false");
      expect(weeklyTab).toHaveAttribute("aria-selected", "true");
      expect(monthlyTab).toHaveAttribute("aria-selected", "false");
    });

    it("applies active styles to the selected tab and inactive styles to others", () => {
      render(<Segmented options={defaultOptions} value="daily" onChange={() => {}} />);

      const dailyTab = screen.getByRole("tab", { name: "Daily" });
      const weeklyTab = screen.getByRole("tab", { name: "Weekly" });

      expect(dailyTab).toHaveClass("bg-surface", "text-foreground", "shadow-kj-xs");
      expect(weeklyTab).toHaveClass("bg-transparent", "text-muted-foreground");
    });

    it("updates selected tab when value prop changes", () => {
      const { rerender } = render(
        <Segmented options={defaultOptions} value="daily" onChange={() => {}} />
      );

      let dailyTab = screen.getByRole("tab", { name: "Daily" });
      let monthlyTab = screen.getByRole("tab", { name: "Monthly" });
      expect(dailyTab).toHaveAttribute("aria-selected", "true");
      expect(monthlyTab).toHaveAttribute("aria-selected", "false");

      rerender(<Segmented options={defaultOptions} value="monthly" onChange={() => {}} />);

      dailyTab = screen.getByRole("tab", { name: "Daily" });
      monthlyTab = screen.getByRole("tab", { name: "Monthly" });
      expect(dailyTab).toHaveAttribute("aria-selected", "false");
      expect(monthlyTab).toHaveAttribute("aria-selected", "true");
      expect(monthlyTab).toHaveClass("bg-surface", "text-foreground", "shadow-kj-xs");
    });
  });

  describe("interactions", () => {
    it("calls onChange with the selected option value when clicked", () => {
      const handleChange = vi.fn();
      render(<Segmented options={defaultOptions} value="daily" onChange={handleChange} />);

      const monthlyTab = screen.getByRole("tab", { name: "Monthly" });
      fireEvent.click(monthlyTab);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith("monthly");
    });

    it("calls onChange even if clicking the already active option", () => {
      const handleChange = vi.fn();
      render(<Segmented options={defaultOptions} value="daily" onChange={handleChange} />);

      const dailyTab = screen.getByRole("tab", { name: "Daily" });
      fireEvent.click(dailyTab);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith("daily");
    });
  });

  describe("customization and attributes", () => {
    it("merges custom className with container classes", () => {
      render(
        <Segmented
          options={defaultOptions}
          value="daily"
          onChange={() => {}}
          className="custom-segmented-class"
          aria-label="Custom"
        />
      );

      const tablist = screen.getByRole("tablist", { name: "Custom" });
      expect(tablist).toHaveClass("custom-segmented-class");
      expect(tablist).toHaveClass("inline-flex", "bg-muted");
    });

    it("passes aria-label to the tablist container", () => {
      render(
        <Segmented
          options={defaultOptions}
          value="daily"
          onChange={() => {}}
          aria-label="View layout options"
        />
      );

      const container = screen.getByRole("tablist", { name: "View layout options" });
      expect(container).toBeInTheDocument();
    });
  });
});
