# Showcase Syntax Highlighting Design Spec

## 1. Overview
Add syntax highlighting to the code snippets shown in the showcase site's Code tabs (`ExampleTabs`). Highlighting is **site-only**: `packages/ui` stays dependency-free and its `CodeBlock` component is not modified. The site gets its own `HighlightedCode` component powered by shiki, themed with the kit's own design tokens so colors match the brand palette and follow the site's light/dark toggle automatically.

## 2. Decisions (user-approved)
- **Scope**: site-only. `packages/ui/CodeBlock` unchanged (plain). The `CodeBlock` demo in the Primitives section intentionally stays uncolored.
- **Engine**: shiki with a fine-grained bundle — `createHighlighterCore` from `shiki/core`, `createJavaScriptRegexEngine` (no WASM), single language `tsx`, single custom theme. Rejected: prism (inaccurate TSX tokenization), in-kit mini-tokenizer (user declined).
- **Theme**: custom theme named `kj` whose token colors are literal `var(--kj-*)` CSS variable references (shiki "arbitrary color values" feature). One theme serves both modes because the variables themselves flip with the site's `.dark` class — no dual-theme output, no extra CSS.

## 3. Requirements & Behavior
- **Colored output** in every Code tab of `ExampleTabs`, both the per-component snippet list and the section-wide `code` override path.
- **Theme-reactive**: toggling the site theme recolors code instantly (pure CSS variable flip, no re-highlight).
- **Lazy loading**: shiki loads via dynamic `import()` on first render of a `HighlightedCode` — it must not enter the site's initial bundle (~200 kB deferred).
- **Progressive fallback**: until the highlighter resolves, render the snippet as plain `<pre><code>` with identical layout (no layout shift when colors arrive). Highlight failure (import error) leaves the plain rendering in place.
- **Chrome parity**: `HighlightedCode` reproduces the kit `CodeBlock` chrome — rounded border, header with language/filename label, Copy button with "Copied" feedback — using the same Tailwind classes, so the two are visually indistinguishable except for token colors.
- **Copy copies raw text**, never HTML.

## 4. Architecture
New files, both in `site/src/`:

### `highlighter.ts`
Module-level singleton promise so shiki initializes once regardless of how many blocks render:

```typescript
import type { HighlighterCore } from "shiki/core";

let instance: Promise<HighlighterCore> | undefined;

export function getHighlighter(): Promise<HighlighterCore> {
  instance ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, tsx] =
      await Promise.all([
        import("shiki/core"),
        import("shiki/engine/javascript"),
        import("@shikijs/langs/tsx"),
      ]);
    return createHighlighterCore({
      themes: [kjTheme],
      langs: [tsx.default],
      engine: createJavaScriptRegexEngine(),
    });
  })();
  return instance;
}
```

`kjTheme` lives in the same file: a TextMate theme object with `settings[].settings.foreground` values like `"var(--kj-primary)"`, plus `bg`/`fg` set to transparent/`var(--kj-foreground)` so the existing chrome background shows through.

### Theme token mapping (`kj` theme scopes)
| TextMate scope | CSS variable | Effect (light / dark) |
|---|---|---|
| `keyword`, `storage.type`, `storage.modifier` | `--kj-primary` | amber #b45309 / #fbbf24 |
| `string`, `string.template` | `--kj-secondary` | teal #0f766e / #2dd4bf |
| `comment` | `--kj-muted-foreground` | gray |
| `entity.name.function`, `support.class.component` (JSX components) | `--kj-info` | blue #0284c7 / #0ea5e9 |
| `entity.other.attribute-name` (JSX attributes) | `--kj-primary-600` light-leaning amber (`--kj-primary-400` resolves in dark via token flip if added; otherwise single `--kj-warning`) | lighter amber |
| `punctuation`, `meta.brace` | `--kj-muted-foreground` | gray |
| default foreground | `--kj-foreground` | body text |

Exact scope list refined during implementation against real snippets; the variable assignments above are the contract. If `--kj-primary-600` doesn't flip in dark mode (scale variables are static), use a semantic variable that does (e.g. `--kj-warning`) — verify visually.

### `highlighted-code.tsx`
`HighlightedCode({ code, language?, filename?, copyable?, maxHeight?, className? })` — same props as kit `CodeBlock`:
- State: `html: string | null`. `useEffect` calls `getHighlighter().then(h => setHtml(h.codeToHtml(code, { lang: "tsx", theme: "kj" })))`, guarded against unmount; on rejection stays plain.
- Render: chrome copied from `code-block.tsx` (header + Copy button incl. 1.5 s "Copied" reset with timer cleanup). Body: `html === null` → plain `<pre><code>{code}</code></pre>`; otherwise container with `dangerouslySetInnerHTML` (safe: shiki escapes all input). CSS ensures shiki's `<pre>` inherits the same padding/font classes as the plain fallback (no layout shift).

### `example-tabs.tsx` (edit)
Replace both `CodeBlock` usages in the Code tab with `HighlightedCode` (props unchanged). `CodeBlock` import dropped if no longer used. Demo/Props tabs untouched.

## 5. Dependencies
`site/package.json` gains `shiki` (and its `@shikijs/langs` / `@shikijs/engine-javascript` subpackages come with it) as a **devDependency of the site app only**. No workspace package gains a dependency.

## 6. Verification (Playwright)
1. Code tab shows multi-colored tokens (keywords amber, strings teal).
2. Theme toggle flips token colors without reload.
3. Primitives section `CodeBlock` demo remains plain.
4. Copy button still copies raw snippet text.
5. Network/bundle check: shiki chunks load only after a Code tab renders, not on initial page load.
