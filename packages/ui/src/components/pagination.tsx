import { cn } from "../lib/cn";
import { Button } from "./button";

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** How many numbered buttons to show around the edges. Default 5. */
  siblingCount?: number;
  className?: string;
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** Builds a compact page list with ellipses, e.g. [1,2,3,'…',9]. */
function paginate(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return range(1, pageCount);
  const left = Math.max(2, page - 1);
  const right = Math.min(pageCount - 1, page + 1);
  const items: (number | "…")[] = [1];
  if (left > 2) items.push("…");
  items.push(...range(left, right));
  if (right < pageCount - 1) items.push("…");
  items.push(pageCount);
  return items;
}

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points={dir === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
  </svg>
);

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  const items = paginate(page, pageCount);
  return (
    <nav aria-label="Paginacja" className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Previous"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <Chevron dir="left" />
      </Button>
      {items.map((it, i) =>
        it === "…" ? (
          <span key={`e${i}`} className="px-1 text-muted-foreground select-none">
            …
          </span>
        ) : (
          <Button
            key={it}
            variant={it === page ? "primary" : "ghost"}
            size="icon-sm"
            aria-current={it === page ? "page" : undefined}
            onClick={() => onPageChange(it)}
          >
            {it}
          </Button>
        )
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Next"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <Chevron dir="right" />
      </Button>
    </nav>
  );
}
