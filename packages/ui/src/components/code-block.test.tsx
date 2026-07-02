import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CodeBlock } from "./code-block";

describe("CodeBlock", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("renders the code text", () => {
    render(<CodeBlock code="<Button>Hi</Button>" />);
    expect(screen.getByText("<Button>Hi</Button>")).toBeInTheDocument();
  });

  it("shows the filename in the header", () => {
    render(<CodeBlock code="x" filename="example.tsx" />);
    expect(screen.getByText("example.tsx")).toBeInTheDocument();
  });

  it("shows the language label when no filename is given", () => {
    render(<CodeBlock code="x" language="tsx" />);
    expect(screen.getByText("tsx")).toBeInTheDocument();
  });

  it("copies the code and flips the button label", async () => {
    render(<CodeBlock code="copy me" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("copy me");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument()
    );
  });

  it("hides the copy button when copyable is false", () => {
    render(<CodeBlock code="x" copyable={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
