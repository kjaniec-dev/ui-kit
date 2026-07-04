import { describe, expect, it } from "vitest";
import { getHighlighter } from "./highlighter";

describe("getHighlighter", () => {
  it("returns the same highlighter instance on repeated calls", async () => {
    const [a, b] = await Promise.all([getHighlighter(), getHighlighter()]);
    expect(a).toBe(b);
  });

  it("highlights tsx with kj design-token colors", async () => {
    const h = await getHighlighter();
    const html = h.codeToHtml('import { Button } from "@kjaniec-dev/ui";', {
      lang: "tsx",
      theme: "kj",
    });
    // keyword (import/from) → primary, string → secondary; colors are CSS
    // variable references, never hex, so the site theme toggle recolors them.
    expect(html).toContain("var(--kj-primary)");
    expect(html).toContain("var(--kj-secondary)");
    expect(html).not.toMatch(/color:#[0-9a-fA-F]{3,8}/);
  });
});
