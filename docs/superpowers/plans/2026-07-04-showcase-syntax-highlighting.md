# Showcase Syntax Highlighting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Color the code snippets in the showcase site's Code tabs with shiki, using a custom `kj` theme whose token colors are the kit's own `--kj-*` design-token CSS variables.

**Architecture:** Site-only feature (spec: `docs/superpowers/specs/2026-07-04-showcase-syntax-highlighting-design.md`). A lazy singleton highlighter (`site/src/highlighter.ts`) loads a fine-grained shiki bundle (lang `tsx`, JS regex engine, no WASM) on first use. A new `HighlightedCode` component (`site/src/highlighted-code.tsx`) clones the kit `CodeBlock` chrome, renders the snippet plain immediately, and swaps in shiki HTML when the highlighter resolves. `ExampleTabs` swaps `CodeBlock` → `HighlightedCode` in its Code tab. Because the token colors are `var(--kj-*)` references, the site's `.dark` class flip recolors code with zero re-highlighting.

**Tech Stack:** shiki ^4.3.1 (`shiki/core` + `shiki/engine/javascript` + `@shikijs/langs/tsx`), React 18, Vite 5, vitest 4 + jsdom + @testing-library/react (new to `site/`, mirrors `packages/ui`).

## Global Constraints

- `packages/ui` is NOT modified in any way — no files, no deps. Kit stays dependency-free; its `CodeBlock` stays plain.
- All new runtime deps go into `site/package.json` `devDependencies` only (site is a private app; Vite bundles them).
- shiki loads exclusively via dynamic `import()` — it must not enter the site's initial bundle. Static `import type` from shiki is fine (erased at compile).
- Single language: `tsx`. Single theme: `"kj"`. No WASM engine — `createJavaScriptRegexEngine()` only.
- Every `kj`-theme foreground is a `var(--kj-*)` reference from `packages/design/src/theme.css` — never a hex literal — so light/dark flips automatically.
- The Primitives section's `CodeBlock` demo must remain plain (it demos the kit component).
- Dev server already runs on port 5173 (started outside this session — do NOT kill it). After `npm install`, if the browser shows Vite "504 Outdated Optimize Dep" errors, tell the user the dev server needs a restart instead of restarting it yourself.

---

### Task 1: shiki dependency, site test infra, `kj` theme + highlighter singleton

**Files:**
- Modify: `site/package.json` (devDependencies + `test` script)
- Create: `site/vitest.config.ts`
- Create: `site/src/highlighter.ts`
- Test: `site/src/highlighter.test.ts`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `getHighlighter(): Promise<HighlighterCore>` exported from `site/src/highlighter.ts`; theme registered under name `"kj"`; language `"tsx"` loaded. Task 2 calls `(await getHighlighter()).codeToHtml(code, { lang: "tsx", theme: "kj" })`.

- [ ] **Step 1: Install dependencies**

```bash
npm install -D shiki@^4.3.1 @shikijs/langs@^4.3.1 vitest@^4.1.9 jsdom@^29.1.1 @testing-library/react@^16.3.2 --workspace @kjaniec-dev/site
```

Expected: `site/package.json` devDependencies gain the five packages; lockfile updates. Run `npm ls shiki` — resolves without errors.

- [ ] **Step 2: Add `test` script to `site/package.json`**

In the `scripts` block, after `"typecheck": "tsc --noEmit"`, add:

```json
    "test": "vitest run"
```

(Root `npm test` uses `--workspaces --if-present`, so the site suite joins the monorepo test run automatically.)

- [ ] **Step 3: Create `site/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
});
```

- [ ] **Step 4: Write the failing test**

Create `site/src/highlighter.test.ts`:

```typescript
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
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test --workspace @kjaniec-dev/site`
Expected: FAIL — cannot resolve `./highlighter`.

- [ ] **Step 6: Create `site/src/highlighter.ts`**

```typescript
import type { HighlighterCore, ThemeRegistrationAny } from "shiki/core";

/**
 * Custom shiki theme mapping TextMate scopes to the kit's design tokens.
 * Every foreground is a var(--kj-*) reference (theme.css), so the site's
 * `.dark` class flip recolors code without re-highlighting.
 */
const kjTheme: ThemeRegistrationAny = {
  name: "kj",
  bg: "transparent",
  fg: "var(--kj-foreground)",
  settings: [
    {
      settings: { foreground: "var(--kj-foreground)", background: "transparent" },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier"],
      settings: { foreground: "var(--kj-primary)" },
    },
    {
      scope: ["string", "string.template", "punctuation.definition.string"],
      settings: { foreground: "var(--kj-secondary)" },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "var(--kj-muted-foreground)", fontStyle: "italic" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "entity.name.tag",
        "support.class.component",
      ],
      settings: { foreground: "var(--kj-info)" },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "var(--kj-warning)" },
    },
    {
      scope: ["constant.numeric", "constant.language"],
      settings: { foreground: "var(--kj-danger)" },
    },
    {
      scope: ["punctuation", "meta.brace"],
      settings: { foreground: "var(--kj-muted-foreground)" },
    },
  ],
};

let instance: Promise<HighlighterCore> | undefined;

/**
 * Lazy singleton. All shiki code loads via dynamic import() on first call,
 * so it stays out of the site's initial bundle; the Code tab is the only
 * caller and TabsContent mounts it only when the tab is active.
 */
export function getHighlighter(): Promise<HighlighterCore> {
  instance ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] =
      await Promise.all([
        import("shiki/core"),
        import("shiki/engine/javascript"),
      ]);
    return createHighlighterCore({
      themes: [kjTheme],
      langs: [import("@shikijs/langs/tsx")],
      engine: createJavaScriptRegexEngine(),
    });
  })();
  return instance;
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test --workspace @kjaniec-dev/site`
Expected: PASS (2 tests). If the hex-literal assertion fails, a scope color leaked from a default — inspect the HTML in the failure output; every color must come from `kjTheme`.

- [ ] **Step 8: Typecheck**

Run: `npm run typecheck --workspace @kjaniec-dev/site`
Expected: clean. (`import type` from `shiki/core` is erased at compile; no runtime static import of shiki exists.)

- [ ] **Step 9: Commit**

```bash
git add site/package.json site/vitest.config.ts site/src/highlighter.ts site/src/highlighter.test.ts package-lock.json
git commit -m "feat(site): add shiki highlighter singleton with kj design-token theme"
```

---

### Task 2: `HighlightedCode` component

**Files:**
- Create: `site/src/highlighted-code.tsx`
- Modify: `site/src/index.css` (append `.hc-body` rules)
- Test: `site/src/highlighted-code.test.tsx`

**Interfaces:**
- Consumes: `getHighlighter(): Promise<HighlighterCore>` from `./highlighter` (Task 1); calls `codeToHtml(code, { lang: "tsx", theme: "kj" })`.
- Produces: `HighlightedCode` React component exported from `site/src/highlighted-code.tsx` with props `{ code: string; language?: string; filename?: string; copyable?: boolean; maxHeight?: number } & React.HTMLAttributes<HTMLDivElement>` — the same surface as the kit `CodeBlock`, so Task 3 swaps them 1:1.

- [ ] **Step 1: Write the failing test**

Create `site/src/highlighted-code.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace @kjaniec-dev/site`
Expected: FAIL — cannot resolve `./highlighted-code`.

- [ ] **Step 3: Create `site/src/highlighted-code.tsx`**

Chrome (border, header, Copy button) intentionally mirrors `packages/ui/src/components/code-block.tsx` so the two are visually identical; body is shiki HTML with a plain `<pre>` fallback until the highlighter resolves.

```tsx
import * as React from "react";
import { getHighlighter } from "./highlighter";

export interface HighlightedCodeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The snippet text to display (and copy). */
  code: string;
  /** Language label shown in the header when no filename is set (e.g. "tsx"). */
  language?: string;
  /** Optional filename label shown in the header; takes precedence over language. */
  filename?: string;
  /** Show the copy-to-clipboard button. */
  copyable?: boolean;
  /** Max height in pixels; content scrolls vertically beyond it. */
  maxHeight?: number;
}

export function HighlightedCode({
  className,
  code,
  language,
  filename,
  copyable = true,
  maxHeight,
  ...props
}: HighlightedCodeProps) {
  const [html, setHtml] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const copyTimer = React.useRef<number | undefined>(undefined);
  const canCopy = copyable && typeof navigator !== "undefined" && !!navigator.clipboard;

  React.useEffect(() => {
    let cancelled = false;
    getHighlighter()
      .then((h) => {
        const out = h.codeToHtml(code, { lang: "tsx", theme: "kj" });
        if (!cancelled) setHtml(out);
      })
      .catch(() => {
        /* highlighter failed to load — the plain rendering stays */
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  React.useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const onCopy = () => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        copyTimer.current = window.setTimeout(() => setCopied(false), 1500);
      },
      () => {
        /* clipboard rejected — keep "Copy" label */
      }
    );
  };

  const label = filename ?? language;
  const bodyStyle = maxHeight ? { maxHeight, overflowY: "auto" as const } : undefined;

  return (
    <div
      className={
        "rounded-kj-md border border-border bg-muted/50 overflow-hidden" +
        (className ? ` ${className}` : "")
      }
      {...props}
    >
      {(label || canCopy) && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2 border-b border-border">
          <span className="text-[0.72rem] font-mono text-muted-foreground">{label}</span>
          {canCopy && (
            <button
              type="button"
              onClick={onCopy}
              className="text-[0.72rem] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      )}
      {html !== null ? (
        // Safe: shiki HTML-escapes all input; the markup is spans + inline styles only.
        <div className="hc-body" style={bodyStyle} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="hc-body" style={bodyStyle}>
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Append `.hc-body` rules to `site/src/index.css`**

Both the plain fallback `<pre>` and shiki's generated `<pre class="shiki kj">` get identical metrics — this is what prevents layout shift when colors arrive. Values copied from the kit CodeBlock's `<pre>` classes (`px-3.5 py-3 text-[0.8rem] leading-relaxed font-mono`).

```css
/* HighlightedCode body — matches the kit CodeBlock <pre> metrics so the
   plain fallback and shiki output render pixel-identical. */
.hc-body pre {
  margin: 0;
  padding: 0.75rem 0.875rem;
  overflow-x: auto;
  font-family: var(--kj-font-mono);
  font-size: 0.8rem;
  line-height: 1.625;
  color: var(--kj-foreground);
  background: transparent !important;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test --workspace @kjaniec-dev/site`
Expected: PASS (5 tests total: 2 highlighter + 3 component).

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck --workspace @kjaniec-dev/site`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add site/src/highlighted-code.tsx site/src/highlighted-code.test.tsx site/src/index.css
git commit -m "feat(site): add HighlightedCode with CodeBlock chrome and plain fallback"
```

---

### Task 3: Wire into ExampleTabs + browser verification

**Files:**
- Modify: `site/src/example-tabs.tsx` (Code tab only — lines 2 and 96–115)

**Interfaces:**
- Consumes: `HighlightedCode` from `./highlighted-code` (Task 2) — drop-in for the kit `CodeBlock` (`code`, `language` props identical).
- Produces: nothing downstream; this is the integration + verification task.

- [ ] **Step 1: Swap `CodeBlock` → `HighlightedCode` in `site/src/example-tabs.tsx`**

Line 2 — remove `CodeBlock` from the kit import and add the local import:

```tsx
import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@kjaniec-dev/ui";
import { HighlightedCode } from "./highlighted-code";
```

In the `<TabsContent value="code">` block, replace both `<CodeBlock` usages with `<HighlightedCode` (props unchanged):

```tsx
      <TabsContent value="code">
        {code !== undefined ? (
          <HighlightedCode
            code={primary ? `${primary.importPath}\n\n${code}` : code}
            language="tsx"
          />
        ) : (
          entries.map((doc) => (
            <div key={doc.name} className="mb-6">
              <p className="text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-2 mt-0">
                {doc.name}
              </p>
              <HighlightedCode
                code={`${doc.importPath}\n\n${exampleOverrides[doc.name] ?? doc.usageSnippet ?? ""}`}
                language="tsx"
              />
            </div>
          ))
        )}
      </TabsContent>
```

- [ ] **Step 2: Typecheck, test, build**

Run: `npm run typecheck --workspace @kjaniec-dev/site && npm test --workspace @kjaniec-dev/site && npm run build --workspace @kjaniec-dev/site`
Expected: all clean. In the Vite build output, shiki code lands in separate lazy chunks (look for chunk names containing `highlighter`/`core`/`tsx`), NOT in the main `index-*.js`.

- [ ] **Step 3: Browser verification (Playwright MCP against http://localhost:5173)**

Dev server already runs on 5173 (HMR applies the changes). Verify each item; take a screenshot of a colored Code tab for the report:

1. Navigate to `http://localhost:5173`, open any gallery section (e.g. Selection), click the **Code** tab. Assert via evaluate: `document.querySelector("pre.shiki span[style]")` is non-null, and at least two spans in one block have different inline `color` values (multi-color proof).
2. Keyword/string colors: a span containing `import` has style `color:var(--kj-primary)`; a quoted string span has `color:var(--kj-secondary)`.
3. Theme flip: read `getComputedStyle` color of the `import` span, click the site's dark-mode toggle (moon/sun button in the header), re-read — computed color must change (amber #b45309 → #fbbf24) with no reload. Toggle back.
4. Primitives section: the kit `CodeBlock` demo's `<pre>` has NO `shiki` class (stays plain).
5. Copy button in a Code tab still shows "Copied" after click.
6. Lazy load: reload the page, read network requests — no shiki-related module fetched. Click a Code tab, read again — shiki modules appear only now.

Expected: all 6 pass. If Vite shows "504 Outdated Optimize Dep" after the new install, stop and report — the user's dev server needs a manual restart (do not kill it).

- [ ] **Step 4: Full monorepo suite**

Run: `npm run typecheck && npm test && npm run build` (repo root)
Expected: all workspaces green (site suite now included via `--if-present`); ui suite still 28/28.

- [ ] **Step 5: Commit**

```bash
git add site/src/example-tabs.tsx
git commit -m "feat(site): syntax-highlight Code tabs with kj-themed shiki"
```
