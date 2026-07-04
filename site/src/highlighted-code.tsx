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
