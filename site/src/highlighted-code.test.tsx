import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HighlightedCode } from "./highlighted-code";

const SNIPPET = 'import { Button } from "@kjaniec-dev/ui";';

describe("HighlightedCode", () => {
  beforeEach(() => {
    // jsdom has no navigator.clipboard; define a mock so the Copy button renders.
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it("renders plain code immediately, then swaps in shiki markup", async () => {
    const { container } = render(<HighlightedCode code={SNIPPET} language="tsx" />);
    // First paint: plain fallback, before the async highlighter resolves.
    expect(container.textContent).toContain(SNIPPET);
    expect(container.querySelector("pre.shiki")).toBeNull();
    // Shiki init downloads grammars in-process; allow more than waitFor's 1s default.
    await waitFor(
      () => expect(container.querySelector("pre.shiki")).not.toBeNull(),
      { timeout: 10000 }
    );
    expect(container.innerHTML).toContain("var(--kj-primary)");
    // Highlighted or not, the snippet text is unchanged.
    expect(container.textContent).toContain(SNIPPET);
  });

  it("copies the raw snippet text, not HTML", async () => {
    const { getByRole } = render(<HighlightedCode code={SNIPPET} language="tsx" />);
    fireEvent.click(getByRole("button", { name: "Copy" }));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(SNIPPET)
    );
  });

  it("shows the filename over the language in the header", () => {
    const { getByText } = render(
      <HighlightedCode code={SNIPPET} language="tsx" filename="button.tsx" />
    );
    expect(getByText("button.tsx")).toBeTruthy();
  });
});
