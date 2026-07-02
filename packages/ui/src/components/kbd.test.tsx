import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Kbd } from "./kbd";

describe("Kbd", () => {
  it("renders children in a single kbd element", () => {
    render(<Kbd>⌘K</Kbd>);
    const el = screen.getByText("⌘K");
    expect(el.tagName).toBe("KBD");
  });

  it("renders one kbd chip per entry in keys", () => {
    const { container } = render(<Kbd keys={["⌘", "Shift", "P"]} />);
    const chips = container.querySelectorAll("kbd");
    expect(chips).toHaveLength(3);
    expect(chips[1].textContent).toBe("Shift");
  });

  it("ignores children when keys is provided", () => {
    render(<Kbd keys={["A"]}>ignored</Kbd>);
    expect(screen.queryByText("ignored")).not.toBeInTheDocument();
  });
});
