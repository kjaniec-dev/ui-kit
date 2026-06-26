import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Sanity Check", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });

  it("should have jest-dom matchers working", () => {
    render(<div>Hello World</div>);
    const element = screen.getByText("Hello World");
    expect(element).toBeInTheDocument();
  });
});
