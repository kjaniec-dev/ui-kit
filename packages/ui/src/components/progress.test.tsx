import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "./progress";

describe("Progress", () => {
  it("renders with default props and accessibility attributes", () => {
    render(<Progress />);
    const progressbar = screen.getByRole("progressbar");

    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-label", "Progress");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    expect(progressbar).toHaveClass("h-2", "w-full", "overflow-hidden", "rounded-full", "bg-muted");

    const bar = progressbar.querySelector("span");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveStyle({ width: "0%" });
    expect(bar).toHaveClass("bg-primary");
  });

  it("renders with specified value", () => {
    render(<Progress value={45} />);
    const progressbar = screen.getByRole("progressbar");

    expect(progressbar).toHaveAttribute("aria-valuenow", "45");
    const bar = progressbar.querySelector("span");
    expect(bar).toHaveStyle({ width: "45%" });
  });

  it("clamps values below 0 to 0", () => {
    render(<Progress value={-25} />);
    const progressbar = screen.getByRole("progressbar");

    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
    const bar = progressbar.querySelector("span");
    expect(bar).toHaveStyle({ width: "0%" });
  });

  it("clamps values above 100 to 100", () => {
    render(<Progress value={135} />);
    const progressbar = screen.getByRole("progressbar");

    expect(progressbar).toHaveAttribute("aria-valuenow", "100");
    const bar = progressbar.querySelector("span");
    expect(bar).toHaveStyle({ width: "100%" });
  });

  it("accepts a custom aria-label", () => {
    render(<Progress value={75} aria-label="Upload progress" />);
    const progressbar = screen.getByRole("progressbar", { name: "Upload progress" });

    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "75");
  });

  it("renders primary tone by default and secondary tone when specified", () => {
    const { rerender } = render(<Progress value={50} tone="primary" />);
    let progressbar = screen.getByRole("progressbar");
    let bar = progressbar.querySelector("span");

    expect(bar).toHaveClass("bg-primary");
    expect(bar).not.toHaveClass("bg-secondary");

    rerender(<Progress value={50} tone="secondary" />);
    progressbar = screen.getByRole("progressbar");
    bar = progressbar.querySelector("span");

    expect(bar).toHaveClass("bg-secondary");
    expect(bar).not.toHaveClass("bg-primary");
  });

  it("applies custom barClassName to the inner bar element", () => {
    render(<Progress value={30} barClassName="custom-bar-class duration-1000" />);
    const progressbar = screen.getByRole("progressbar");
    const bar = progressbar.querySelector("span");

    expect(bar).toHaveClass("custom-bar-class", "duration-1000");
  });

  it("merges custom className onto the outer progress container", () => {
    render(<Progress className="custom-progress h-4" />);
    const progressbar = screen.getByRole("progressbar");

    expect(progressbar).toHaveClass("custom-progress", "h-4", "w-full", "rounded-full");
  });

  it("forwards ref to the underlying HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} value={80} data-testid="progress-ref" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId("progress-ref"));
  });

  it("passes arbitrary HTML attributes to the outer container", () => {
    render(<Progress id="my-progress" data-testid="test-progress" title="File Upload" />);
    const progressbar = screen.getByTestId("test-progress");

    expect(progressbar).toHaveAttribute("id", "my-progress");
    expect(progressbar).toHaveAttribute("title", "File Upload");
  });

  it("has the correct displayName", () => {
    expect(Progress.displayName).toBe("Progress");
  });
});
