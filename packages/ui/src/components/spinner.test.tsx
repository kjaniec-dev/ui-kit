import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  describe("rendering & accessibility", () => {
    it("renders with default props and accessibility attributes", () => {
      render(<Spinner />);
      const spinner = screen.getByRole("status");

      expect(spinner).toBeInTheDocument();
      expect(spinner.tagName).toBe("SPAN");
      expect(spinner).toHaveAttribute("aria-label", "Loading");
      expect(spinner).toHaveClass(
        "inline-block",
        "rounded-full",
        "border-[2.5px]",
        "border-muted",
        "border-t-primary",
        "animate-spin",
        "align-middle"
      );
    });

    it("has default dimensions of 24px by 24px", () => {
      render(<Spinner data-testid="default-spinner" />);
      const spinner = screen.getByTestId("default-spinner");

      expect(spinner.style.width).toBe("24px");
      expect(spinner.style.height).toBe("24px");
    });

    it("allows overriding aria-label for context-specific descriptions", () => {
      render(<Spinner aria-label="Saving document..." />);
      const spinner = screen.getByRole("status", { name: "Saving document..." });
      expect(spinner).toBeInTheDocument();
    });

    it("allows overriding role attribute", () => {
      render(<Spinner role="progressbar" aria-label="Uploading" />);
      const spinner = screen.getByRole("progressbar", { name: "Uploading" });
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("sizing & styles", () => {
    it("applies custom size via size prop", () => {
      render(<Spinner size={16} data-testid="small-spinner" />);
      const spinner = screen.getByTestId("small-spinner");

      expect(spinner.style.width).toBe("16px");
      expect(spinner.style.height).toBe("16px");
    });

    it("applies large custom size via size prop", () => {
      render(<Spinner size={48} data-testid="large-spinner" />);
      const spinner = screen.getByTestId("large-spinner");

      expect(spinner.style.width).toBe("48px");
      expect(spinner.style.height).toBe("48px");
    });

    it("merges custom style properties", () => {
      render(
        <Spinner
          size={32}
          style={{ opacity: 0.75, margin: "8px" }}
          data-testid="styled-spinner"
        />
      );
      const spinner = screen.getByTestId("styled-spinner");

      expect(spinner.style.width).toBe("32px");
      expect(spinner.style.height).toBe("32px");
      expect(spinner.style.opacity).toBe("0.75");
      expect(spinner.style.margin).toBe("8px");
    });

    it("allows style width and height to take precedence over size prop", () => {
      render(
        <Spinner
          size={20}
          style={{ width: "40px", height: "40px" }}
          data-testid="override-size-spinner"
        />
      );
      const spinner = screen.getByTestId("override-size-spinner");

      expect(spinner.style.width).toBe("40px");
      expect(spinner.style.height).toBe("40px");
    });

    it("merges custom className with default classes", () => {
      render(<Spinner className="border-t-white text-white custom-class" />);
      const spinner = screen.getByRole("status");

      expect(spinner).toHaveClass("custom-class", "border-t-white", "animate-spin");
    });
  });

  describe("ref forwarding & HTML attributes", () => {
    it("forwards ref to the HTMLSpanElement", () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Spinner ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current?.getAttribute("role")).toBe("status");
    });

    it("forwards additional HTML attributes", () => {
      render(
        <Spinner
          id="custom-spinner-id"
          data-testid="spinner-with-props"
          title="Loading content"
        />
      );

      const spinner = screen.getByTestId("spinner-with-props");
      expect(spinner).toHaveAttribute("id", "custom-spinner-id");
      expect(spinner).toHaveAttribute("title", "Loading content");
    });
  });
});
