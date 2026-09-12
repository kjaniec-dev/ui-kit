import { Badge, Button, cn, Input } from "@kjaniec-dev/ui";
import * as React from "react";

export interface PropDoc {
  name: string;
  type: string;
  optional: boolean;
  defaultValue: string | null;
  description: string;
}

export interface CvaDoc {
  variants?: Record<string, string[]>;
  defaultVariants?: Record<string, string>;
}

export interface ComponentDoc {
  name: string;
  importPath: string;
  description: string;
  props: PropDoc[];
  cva?: CvaDoc | null;
  usageSnippet?: string;
}

export interface PropsTableProps {
  doc: ComponentDoc;
  className?: string;
}

export function PropsTable({ doc, className }: PropsTableProps) {
  const [copied, setCopied] = React.useState(false);
  const [filter, setFilter] = React.useState("");

  const handleCopy = () => {
    navigator.clipboard?.writeText(doc.importPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredProps = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return doc.props;
    return doc.props.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [doc.props, filter]);

  const hasVariants = doc.cva?.variants && Object.keys(doc.cva.variants).length > 0;

  return (
    <div className={cn("space-y-4 mb-8", className)}>
      {/* Component Header & Import */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border">
        <div>
          <h4 className="text-base font-bold text-foreground m-0 flex items-center gap-2">
            {doc.name}
            <span className="text-xs font-normal text-muted-foreground font-mono">
              ({doc.props.length} {doc.props.length === 1 ? "prop" : "props"})
            </span>
          </h4>
          {doc.description && (
            <p className="text-xs text-muted-foreground mt-0.5 mb-0 leading-relaxed">
              {doc.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <code className="text-xs font-mono bg-muted/60 text-muted-foreground px-2 py-1 rounded border border-border/80 truncate max-w-[280px]">
            {doc.importPath}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs font-medium"
            aria-label={`Copy import statement for ${doc.name}`}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      {/* CVA Variants Section */}
      {hasVariants && (
        <div className="bg-muted/30 border border-border/70 rounded-kj-md p-3 space-y-2">
          <div className="text-[0.68rem] uppercase tracking-wider font-semibold text-muted-foreground">
            CVA Style Variants
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(doc.cva!.variants!).map(([variantKey, options]) => {
              const defaultVal = doc.cva?.defaultVariants?.[variantKey];
              return (
                <div key={variantKey} className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-mono font-medium text-foreground min-w-[70px]">
                    {variantKey}:
                  </span>
                  {options.map((opt) => {
                    const isDefault = defaultVal === opt;
                    return (
                      <Badge
                        key={opt}
                        variant={isDefault ? "primary" : "neutral"}
                        className={cn(
                          "font-mono text-[0.7rem] px-1.5 py-0.5",
                          isDefault && "font-semibold"
                        )}
                      >
                        {opt}
                        {isDefault && " (default)"}
                      </Badge>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Props Filter if > 4 props */}
      {doc.props.length > 4 && (
        <div className="flex items-center justify-between gap-3">
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={`Filter ${doc.name} props...`}
            aria-label={`Filter ${doc.name} props`}
            className="h-8 text-xs max-w-xs"
          />
          {filter && (
            <span className="text-xs text-muted-foreground">
              Showing {filteredProps.length} of {doc.props.length}
            </span>
          )}
        </div>
      )}

      {/* Props Table */}
      {doc.props.length === 0 ? (
        <p className="text-sm text-muted-foreground m-0 italic">No documented props.</p>
      ) : filteredProps.length === 0 ? (
        <p className="text-xs text-muted-foreground m-0 p-4 border border-dashed border-border rounded-kj-md text-center">
          No props match "{filter}".
        </p>
      ) : (
        <div className="overflow-x-auto border border-border rounded-kj-md shadow-kj-xs">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50 text-left border-b border-border">
                <th className="px-3.5 py-2 font-semibold text-xs text-foreground w-[160px]">
                  Prop
                </th>
                <th className="px-3.5 py-2 font-semibold text-xs text-foreground">Type</th>
                <th className="px-3.5 py-2 font-semibold text-xs text-foreground w-[120px]">
                  Default
                </th>
                <th className="px-3.5 py-2 font-semibold text-xs text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredProps.map((p) => (
                <tr
                  key={p.name}
                  className="border-t border-border/80 hover:bg-muted/20 transition-colors align-top"
                >
                  <td className="px-3.5 py-2.5 font-mono text-[0.8rem] whitespace-nowrap">
                    <span className="font-semibold text-foreground">{p.name}</span>
                    {!p.optional && (
                      <span
                        className="text-danger ml-1 font-bold text-xs"
                        title="Required prop"
                      >
                        *
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-[0.78rem] text-muted-foreground break-all">
                    {p.type}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-[0.78rem] text-muted-foreground whitespace-nowrap">
                    {p.defaultValue !== null ? (
                      <code className="bg-muted/70 px-1 py-0.5 rounded text-foreground">
                        {p.defaultValue}
                      </code>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 text-xs text-muted-foreground leading-relaxed">
                    {p.description || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
