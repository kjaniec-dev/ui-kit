import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarGrid, type CalendarCellState } from "./calendar-grid";

const monthLabel = (y: number, m: number) =>
  new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(y, m, 1));
const dayLabel = (y: number, m: number, d: number) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date(y, m, d));

function defaultCellState(_d: Date): CalendarCellState {
  return {};
}

describe("CalendarGrid", () => {
  const July2026 = new Date(2026, 6, 1); // July 2026 has 31 days

  it("renders the grid with the month label and 7 weekday column headers", () => {
    render(
      <CalendarGrid
        viewMonth={July2026}
        initialFocusDate={new Date(2026, 6, 15)}
        isDayDisabled={() => false}
        cellState={defaultCellState}
        onSelectDay={() => {}}
      />
    );

    expect(screen.getByRole("grid", { name: monthLabel(2026, 6) })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(7);
  });

  it("renders 31 interactive gridcells for days in July 2026 and hidden cells for padding days", () => {
    const { container } = render(
      <CalendarGrid
        viewMonth={July2026}
        initialFocusDate={new Date(2026, 6, 15)}
        isDayDisabled={() => false}
        cellState={defaultCellState}
        onSelectDay={() => {}}
      />
    );

    // 31 interactive buttons for in-month days
    const dayButtons = screen.getAllByRole("gridcell").filter((el) => el.tagName === "BUTTON");
    expect(dayButtons).toHaveLength(31);

    // Empty cells for out-of-month padding days (42 total days in 6x7 grid)
    const hiddenCells = container.querySelectorAll('div[role="gridcell"][aria-hidden="true"]');
    expect(hiddenCells).toHaveLength(11); // 42 - 31 = 11
  });

  it("sets roving tabindex (tabIndex=0) on the initialFocusDate", () => {
    render(
      <CalendarGrid
        viewMonth={July2026}
        initialFocusDate={new Date(2026, 6, 15)}
        isDayDisabled={() => false}
        cellState={defaultCellState}
        onSelectDay={() => {}}
      />
    );

    const targetDay = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) });
    expect(targetDay).toHaveAttribute("tabindex", "0");

    const otherDay = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 16) });
    expect(otherDay).toHaveAttribute("tabindex", "-1");
  });

  it("falls back to the first enabled day in the month if initialFocusDate is disabled", () => {
    render(
      <CalendarGrid
        viewMonth={July2026}
        initialFocusDate={new Date(2026, 6, 1)}
        isDayDisabled={(d) => d.getDate() < 5}
        cellState={defaultCellState}
        onSelectDay={() => {}}
      />
    );

    // Days 1-4 disabled, July 5 should get tabIndex=0
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) })).toHaveAttribute(
      "tabindex",
      "0"
    );
  });

  it("falls back to the first enabled day in the month if initialFocusDate is in a different month", () => {
    render(
      <CalendarGrid
        viewMonth={July2026}
        initialFocusDate={new Date(2026, 7, 10)} // August
        isDayDisabled={() => false}
        cellState={defaultCellState}
        onSelectDay={() => {}}
      />
    );

    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 1) })).toHaveAttribute(
      "tabindex",
      "0"
    );
  });

  it("calls onSelectDay and onFocusDay when clicking an enabled day", () => {
    const onSelectDay = vi.fn();
    const onFocusDay = vi.fn();

    render(
      <CalendarGrid
        viewMonth={July2026}
        initialFocusDate={new Date(2026, 6, 1)}
        isDayDisabled={() => false}
        cellState={defaultCellState}
        onSelectDay={onSelectDay}
        onFocusDay={onFocusDay}
      />
    );

    const day10 = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 10) });
    fireEvent.click(day10);

    expect(onSelectDay).toHaveBeenCalledWith(new Date(2026, 6, 10));
    expect(onFocusDay).toHaveBeenCalledWith(new Date(2026, 6, 10));
  });

  it("does not call onSelectDay when clicking a disabled day", () => {
    const onSelectDay = vi.fn();
    const onFocusDay = vi.fn();

    render(
      <CalendarGrid
        viewMonth={July2026}
        initialFocusDate={new Date(2026, 6, 10)}
        isDayDisabled={(d) => d.getDate() === 12}
        cellState={defaultCellState}
        onSelectDay={onSelectDay}
        onFocusDay={onFocusDay}
      />
    );

    const day12 = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 12) });
    expect(day12).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(day12);

    expect(onSelectDay).not.toHaveBeenCalled();
    expect(onFocusDay).not.toHaveBeenCalled();
  });

  it("fires onFocusDay on mouse enter", () => {
    const onFocusDay = vi.fn();

    render(
      <CalendarGrid
        viewMonth={July2026}
        initialFocusDate={new Date(2026, 6, 1)}
        isDayDisabled={() => false}
        cellState={defaultCellState}
        onSelectDay={() => {}}
        onFocusDay={onFocusDay}
      />
    );

    const day20 = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 20) });
    fireEvent.mouseEnter(day20);

    expect(onFocusDay).toHaveBeenCalledWith(new Date(2026, 6, 20));
  });

  describe("keyboard navigation", () => {
    it("moves focus right and left with ArrowRight and ArrowLeft", () => {
      const onFocusDay = vi.fn();
      render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 10)}
          isDayDisabled={() => false}
          cellState={defaultCellState}
          onSelectDay={() => {}}
          onFocusDay={onFocusDay}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowRight" });
      expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 11) })).toHaveAttribute(
        "tabindex",
        "0"
      );
      expect(onFocusDay).toHaveBeenCalledWith(new Date(2026, 6, 11));

      fireEvent.keyDown(grid, { key: "ArrowLeft" });
      expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 10) })).toHaveAttribute(
        "tabindex",
        "0"
      );
      expect(onFocusDay).toHaveBeenCalledWith(new Date(2026, 6, 10));
    });

    it("moves focus down and up by 7 days with ArrowDown and ArrowUp", () => {
      const onFocusDay = vi.fn();
      render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 10)}
          isDayDisabled={() => false}
          cellState={defaultCellState}
          onSelectDay={() => {}}
          onFocusDay={onFocusDay}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowDown" });
      expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 17) })).toHaveAttribute(
        "tabindex",
        "0"
      );
      expect(onFocusDay).toHaveBeenCalledWith(new Date(2026, 6, 17));

      fireEvent.keyDown(grid, { key: "ArrowUp" });
      expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 10) })).toHaveAttribute(
        "tabindex",
        "0"
      );
      expect(onFocusDay).toHaveBeenCalledWith(new Date(2026, 6, 10));
    });

    it("skips disabled days during arrow navigation", () => {
      render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 10)}
          isDayDisabled={(d) => d.getDate() === 11}
          cellState={defaultCellState}
          onSelectDay={() => {}}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowRight" });
      // Skips July 11 to July 12
      expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 12) })).toHaveAttribute(
        "tabindex",
        "0"
      );
    });

    it("moves to the beginning of the week with Home and end of the week with End", () => {
      // July 8, 2026 is a Wednesday. Start of week is Sunday July 5, end of week is Saturday July 11.
      render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 8)}
          isDayDisabled={() => false}
          cellState={defaultCellState}
          onSelectDay={() => {}}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "Home" });
      expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) })).toHaveAttribute(
        "tabindex",
        "0"
      );

      fireEvent.keyDown(grid, { key: "End" });
      expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 11) })).toHaveAttribute(
        "tabindex",
        "0"
      );
    });

    it("moves by a month on PageDown and PageUp", () => {
      const onFocusDayDown = vi.fn();
      const { unmount } = render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 15)}
          isDayDisabled={() => false}
          cellState={defaultCellState}
          onSelectDay={() => {}}
          onFocusDay={onFocusDayDown}
        />
      );

      fireEvent.keyDown(screen.getByRole("grid"), { key: "PageDown" });
      expect(onFocusDayDown).toHaveBeenCalledWith(new Date(2026, 7, 15)); // August 15, 2026
      unmount();

      const onFocusDayUp = vi.fn();
      render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 15)}
          isDayDisabled={() => false}
          cellState={defaultCellState}
          onSelectDay={() => {}}
          onFocusDay={onFocusDayUp}
        />
      );
      fireEvent.keyDown(screen.getByRole("grid"), { key: "PageUp" });
      expect(onFocusDayUp).toHaveBeenCalledWith(new Date(2026, 5, 15)); // June 15, 2026
    });

    it("moves by a year on Shift+PageDown and Shift+PageUp", () => {
      const onFocusDayDown = vi.fn();
      const { unmount } = render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 15)}
          isDayDisabled={() => false}
          cellState={defaultCellState}
          onSelectDay={() => {}}
          onFocusDay={onFocusDayDown}
        />
      );

      fireEvent.keyDown(screen.getByRole("grid"), { key: "PageDown", shiftKey: true });
      expect(onFocusDayDown).toHaveBeenCalledWith(new Date(2027, 6, 15)); // July 15, 2027
      unmount();

      const onFocusDayUp = vi.fn();
      render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 15)}
          isDayDisabled={() => false}
          cellState={defaultCellState}
          onSelectDay={() => {}}
          onFocusDay={onFocusDayUp}
        />
      );
      fireEvent.keyDown(screen.getByRole("grid"), { key: "PageUp", shiftKey: true });
      expect(onFocusDayUp).toHaveBeenCalledWith(new Date(2025, 6, 15)); // July 15, 2025
    });

    it("selects the roving day on Enter and Space", () => {
      const onSelectDay = vi.fn();
      render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 15)}
          isDayDisabled={() => false}
          cellState={defaultCellState}
          onSelectDay={onSelectDay}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "Enter" });
      expect(onSelectDay).toHaveBeenCalledWith(new Date(2026, 6, 15));

      fireEvent.keyDown(grid, { key: " " });
      expect(onSelectDay).toHaveBeenCalledWith(new Date(2026, 6, 15));
    });
  });

  describe("cellState styling", () => {
    it("renders selected day with aria-selected='true' and primary background", () => {
      render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 1)}
          isDayDisabled={() => false}
          cellState={(d) => ({ selected: d.getDate() === 15 })}
          onSelectDay={() => {}}
        />
      );

      const selectedDay = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) });
      expect(selectedDay).toHaveAttribute("aria-selected", "true");
      expect(selectedDay.className).toContain("bg-primary");
      expect(selectedDay.className).toContain("text-primary-foreground");
    });

    it("renders range start and end days with aria-selected='true'", () => {
      render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 1)}
          isDayDisabled={() => false}
          cellState={(d) => ({
            rangeStart: d.getDate() === 10,
            rangeEnd: d.getDate() === 20,
          })}
          onSelectDay={() => {}}
        />
      );

      const startDay = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 10) });
      const endDay = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 20) });
      expect(startDay).toHaveAttribute("aria-selected", "true");
      expect(endDay).toHaveAttribute("aria-selected", "true");
    });

    it("renders inRange days with rounded-none and bg-primary/15 without aria-selected", () => {
      render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 1)}
          isDayDisabled={() => false}
          cellState={(d) => ({
            inRange: d.getDate() > 10 && d.getDate() < 20,
          })}
          onSelectDay={() => {}}
        />
      );

      const inRangeDay = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) });
      expect(inRangeDay).toHaveAttribute("aria-selected", "false");
      expect(inRangeDay.className).toContain("rounded-none");
      expect(inRangeDay.className).toContain("bg-primary/15");
    });

    it("renders today indicator styling when cellState has today=true", () => {
      render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 1)}
          isDayDisabled={() => false}
          cellState={(d) => ({
            today: d.getDate() === 15,
          })}
          onSelectDay={() => {}}
        />
      );

      const todayDay = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) });
      expect(todayDay.className).toContain("ring-1 ring-primary");
    });

    it("renders disabled day with aria-disabled and disabled styles", () => {
      render(
        <CalendarGrid
          viewMonth={July2026}
          initialFocusDate={new Date(2026, 6, 1)}
          isDayDisabled={(d) => d.getDate() === 5}
          cellState={defaultCellState}
          onSelectDay={() => {}}
        />
      );

      const disabledDay = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) });
      expect(disabledDay).toHaveAttribute("aria-disabled", "true");
      expect(disabledDay.className).toContain("opacity-40");
      expect(disabledDay.className).toContain("cursor-not-allowed");
    });
  });

  it("forwards ref to the outer div element and applies custom className", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <CalendarGrid
        ref={ref}
        className="custom-calendar-grid"
        viewMonth={July2026}
        initialFocusDate={new Date(2026, 6, 1)}
        isDayDisabled={() => false}
        cellState={defaultCellState}
        onSelectDay={() => {}}
      />
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("custom-calendar-grid");
  });
});
