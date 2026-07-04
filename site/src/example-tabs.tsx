import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@kjaniec-dev/ui";
import componentsData from "../../packages/mcp/data/components.json";
import { exampleOverrides } from "./example-overrides";
import { HighlightedCode } from "./highlighted-code";

interface PropDoc {
  name: string;
  type: string;
  optional: boolean;
  defaultValue: string | null;
  description: string;
}

interface ComponentDoc {
  name: string;
  importPath: string;
  description: string;
  props: PropDoc[];
  usageSnippet?: string;
}

const docs = componentsData as unknown as ComponentDoc[];
const byName = new Map(docs.map((d) => [d.name, d]));

interface ExampleTabsProps {
  /** Component names to document, looked up in components.json. Each entry gets a props table and a code snippet. */
  components: string[];
  /** Explicit section-wide snippet; replaces the per-component snippets with a single block. */
  code?: string;
  children: React.ReactNode;
}

export function ExampleTabs({ components, code, children }: ExampleTabsProps) {
  const entries = components
    .map((name) => {
      const doc = byName.get(name);
      if (!doc && import.meta.env.DEV) {
        console.warn(`ExampleTabs: no docs found for "${name}" in components.json`);
      }
      return doc;
    })
    .filter((d): d is ComponentDoc => !!d);

  const primary = entries[0];

  return (
    <Tabs defaultValue="demo">
      <TabsList className="mb-4">
        <TabsTrigger value="demo">Demo</TabsTrigger>
        <TabsTrigger value="props">Props</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="demo">{children}</TabsContent>
      <TabsContent value="props">
        {entries.map((doc) => (
          <div key={doc.name} className="mb-6">
            <p className="text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-2 mt-0">
              {doc.name}
            </p>
            {doc.props.length === 0 ? (
              <p className="text-sm text-muted-foreground m-0">No documented props.</p>
            ) : (
              <div className="overflow-x-auto border border-border rounded-kj-md">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="px-3.5 py-2 font-semibold">Name</th>
                      <th className="px-3.5 py-2 font-semibold">Type</th>
                      <th className="px-3.5 py-2 font-semibold">Default</th>
                      <th className="px-3.5 py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.props.map((p) => (
                      <tr key={p.name} className="border-t border-border align-top">
                        <td className="px-3.5 py-2 font-mono text-[0.8rem] whitespace-nowrap">
                          {p.name}
                          {!p.optional && <span className="text-danger">*</span>}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-[0.8rem] text-muted-foreground">
                          {p.type}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-[0.8rem] text-muted-foreground whitespace-nowrap">
                          {p.defaultValue ?? "—"}
                        </td>
                        <td className="px-3.5 py-2 text-muted-foreground">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </TabsContent>
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
    </Tabs>
  );
}
