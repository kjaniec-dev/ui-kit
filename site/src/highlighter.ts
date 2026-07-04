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
