import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatePicker, DatePickerField } from "./date-picker";

const displayFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const fullDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });

describe("DatePicker", () => {
  it("renders the placeholder when nothing is selected", () => {
    render(<DatePicker placeholder="Pick a date" />);
    expect(screen.getByRole("button", { name: "Pick a date" })).toBeInTheDocument();
  });

  it("opens the calendar panel on trigger click", () => {
    render(<DatePicker />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("selecting a day closes the panel, updates the trigger, and fires onChange", () => {
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    const today = new Date();
    fireEvent.click(screen.getByRole("gridcell", { name: fullDateFormat.format(today) }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: displayFormat.format(today) })).toBeInTheDocument();
  });

  it("reflects a controlled value on the trigger", () => {
    render(<DatePicker value={new Date(2026, 6, 15)} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: displayFormat.format(new Date(2026, 6, 15)) })).toBeInTheDocument();
  });

  it("closes on Escape when focus is still on the trigger (real-world open path)", () => {
    // Opening via click/keyboard never auto-focuses into the grid (roving
    // tabindex only moves focus on actual arrow-key navigation), so focus
    // stays on the trigger. Firing Escape anywhere but the focused element
    // wouldn't reproduce a real keydown, since the event only bubbles
    // through the focused element's own ancestors — the panel div is a
    // sibling of the trigger, not an ancestor.
    render(<DatePicker />);
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    // jsdom's fireEvent.click does not move focus the way a real browser
    // click does, so set focus explicitly to reproduce the real-world
    // post-open state (focus remains on the trigger).
    trigger.focus();
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(trigger).toHaveFocus();
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape and returns focus to the trigger when focus is inside the grid", () => {
    render(<DatePicker />);
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("grid"), { key: "Escape" });
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("does not open when disabled", () => {
    render(<DatePicker disabled />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("sets aria-invalid and aria-required on the trigger", () => {
    render(<DatePicker error required />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-required", "true");
  });

  it("forwards its ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<DatePicker ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("closes on outside click", () => {
    render(<DatePicker />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});

describe("DatePickerField", () => {
  it("associates the label with the trigger", () => {
    render(<DatePickerField label="Due date" />);
    expect(screen.getByLabelText("Due date")).toHaveAttribute("aria-haspopup", "grid");
  });

  it("shows the hint and links it via aria-describedby", () => {
    render(<DatePickerField label="Due date" hint="Choose a weekday" />);
    const trigger = screen.getByLabelText("Due date");
    expect(screen.getByText("Choose a weekday")).toBeInTheDocument();
    expect(trigger.getAttribute("aria-describedby")).toContain(screen.getByText("Choose a weekday").id);
  });

  it("shows the error, hides the hint, and marks the trigger invalid", () => {
    render(<DatePickerField label="Due date" hint="Choose a weekday" error="Required" />);
    const trigger = screen.getByLabelText("Due date");
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("Choose a weekday")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger.getAttribute("aria-describedby")).toContain(screen.getByText("Required").id);
  });

  it("marks the field required", () => {
    render(<DatePickerField label="Due date" required />);
    expect(screen.getByLabelText(/Due date/)).toHaveAttribute("aria-required", "true");
  });

  it("forwards its ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<DatePickerField label="Due date" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
