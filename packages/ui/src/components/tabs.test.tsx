import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

function Instance({ label }: { label: string }) {
  return (
    <Tabs defaultValue="demo">
      <TabsList aria-label={label}>
        <TabsTrigger value="demo">Demo</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="demo">{label} demo</TabsContent>
      <TabsContent value="code">{label} code</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("keeps DOM ids unique across multiple instances with identical values", () => {
    render(
      <>
        <Instance label="first" />
        <Instance label="second" />
      </>
    );

    const triggers = screen.getAllByRole("tab", { name: "Demo" });
    const panels = screen.getAllByRole("tabpanel");
    expect(triggers).toHaveLength(2);
    expect(panels).toHaveLength(2);
    expect(triggers[0].id).not.toBe(triggers[1].id);
    expect(panels[0].id).not.toBe(panels[1].id);

    // Each trigger must reference its own instance's panel, not the first match in the document.
    expect(triggers[0].getAttribute("aria-controls")).toBe(panels[0].id);
    expect(triggers[1].getAttribute("aria-controls")).toBe(panels[1].id);
    expect(panels[0].getAttribute("aria-labelledby")).toBe(triggers[0].id);
    expect(panels[1].getAttribute("aria-labelledby")).toBe(triggers[1].id);
  });
});
