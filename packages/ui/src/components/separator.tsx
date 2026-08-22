import { cn } from "../lib/cn";

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  /** Purely visual by default (role="none", hidden from a11y tree). Set false for a semantically meaningful divider. */
  decorative?: boolean;
  className?: string;
}

/** Thin layout divider. Decorative by default; pass decorative={false} for a semantic role="separator". */
export function Separator({
  orientation = "horizontal",
  decorative = true,
  className,
}: SeparatorProps) {
  const semanticProps = decorative
    ? { role: "none" as const, "aria-hidden": true as const }
    : { role: "separator" as const, "aria-orientation": orientation };

  return (
    <div
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
      {...semanticProps}
    />
  );
}
