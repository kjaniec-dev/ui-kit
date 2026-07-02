"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The snippet text to display. */
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

export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ className, code, language, filename, copyable = true, maxHeight, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);
    const canCopy = copyable && typeof navigator !== "undefined" && !!navigator.clipboard;

    const onCopy = () => {
      navigator.clipboard.writeText(code).then(
        () => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        },
        () => {
          /* clipboard rejected — keep "Copy" label */
        }
      );
    };

    const label = filename ?? language;

    return (
      <div
        ref={ref}
        className={cn("rounded-kj-md border border-border bg-muted/50 overflow-hidden", className)}
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
        <pre
          className="m-0 px-3.5 py-3 overflow-x-auto text-[0.8rem] leading-relaxed font-mono text-foreground"
          style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
        >
          <code>{code}</code>
        </pre>
      </div>
    );
  }
);
CodeBlock.displayName = "CodeBlock";
