import { describe, it, expect } from "vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders with default rectangular variant and shimmer animation", () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId("skeleton");

    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("relative");
    expect(el).toHaveClass("overflow-hidden");
    expect(el).toHaveClass("bg-muted-foreground/15");
    expect(el).toHaveClass("dark:bg-muted-foreground/20");
    expect(el).toHaveClass("rounded-kj-md");
    expect(el).toHaveClass("after:via-foreground/10");
    expect(el).toHaveClass("after:animate-[kjshimmer_2s_ease-in-out_infinite_alternate]");
  });

  it("renders pulse animation when animation='pulse'", () => {
    render(<Skeleton animation="pulse" data-testid="pulse-skeleton" />);
    const el = screen.getByTestId("pulse-skeleton");

    expect(el).toHaveClass("animate-pulse");
    expect(el).not.toHaveClass("after:animate-[kjshimmer_2s_ease-in-out_infinite_alternate]");
  });

  it("renders static placeholder when animation='none'", () => {
    render(<Skeleton animation="none" data-testid="none-skeleton" />);
    const el = screen.getByTestId("none-skeleton");

    expect(el).not.toHaveClass("animate-pulse");
    expect(el).not.toHaveClass("after:animate-[kjshimmer_2s_ease-in-out_infinite_alternate]");
  });

  it("renders text variant with expected classes", () => {
    render(<Skeleton variant="text" data-testid="text-skeleton" />);
    const el = screen.getByTestId("text-skeleton");

    expect(el).toHaveClass("h-3");
    expect(el).toHaveClass("w-4/5");
    expect(el).toHaveClass("rounded-sm");
    expect(el).toHaveClass("my-1.5");
  });

  it("renders circular variant with rounded-full", () => {
    render(<Skeleton variant="circular" data-testid="circular-skeleton" />);
    const el = screen.getByTestId("circular-skeleton");

    expect(el).toHaveClass("rounded-full");
  });

  it("applies width and height props via inline style", () => {
    render(<Skeleton width={120} height={40} data-testid="sized-skeleton" />);
    const el = screen.getByTestId("sized-skeleton");

    expect(el).toHaveStyle({ width: "120px", height: "40px" });
  });

  it("merges custom className without losing essential classes", () => {
    render(<Skeleton className="custom-class" data-testid="custom-skeleton" />);
    const el = screen.getByTestId("custom-skeleton");

    expect(el).toHaveClass("custom-class");
    expect(el).toHaveClass("after:animate-[kjshimmer_2s_ease-in-out_infinite_alternate]");
  });

  it("forwards ref to the underlying div element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} data-testid="ref-skeleton" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId("ref-skeleton"));
  });
});
