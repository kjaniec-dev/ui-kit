import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollToTop } from "./scroll-to-top";

describe("ScrollToTop", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    window.scrollY = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render when scrollY is below threshold", () => {
    render(<ScrollToTop threshold={400} />);
    expect(screen.queryByTestId("scroll-to-top-btn")).not.toBeInTheDocument();
  });

  it("renders when scrollY exceeds threshold", () => {
    render(<ScrollToTop threshold={400} />);
    window.scrollY = 500;
    fireEvent.scroll(window);
    expect(screen.getByTestId("scroll-to-top-btn")).toBeInTheDocument();
  });

  it("calls window.scrollTo({ top: 0, behavior: 'smooth' }) when clicked", () => {
    render(<ScrollToTop threshold={400} />);
    window.scrollY = 600;
    fireEvent.scroll(window);

    const btn = screen.getByTestId("scroll-to-top-btn");
    fireEvent.click(btn);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
