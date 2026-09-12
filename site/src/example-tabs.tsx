import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kjaniec-dev/ui";
import * as React from "react";
import componentsData from "../../packages/mcp/data/components.json";
import { type ComponentDoc, PropsTable } from "./components/props-table";
import { exampleOverrides } from "./example-overrides";
import { HighlightedCode } from "./highlighted-code";

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
        <TabsTrigger value="props">Props & API</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="demo">{children}</TabsContent>
      <TabsContent value="props">
        {entries.map((doc) => (
          <PropsTable key={doc.name} doc={doc} />
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
