import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./accordion";

describe("Accordion", () => {
  function TestAccordion({
    type = "single",
    defaultValue = [],
    className,
  }: {
    type?: "single" | "multiple";
    defaultValue?: string[];
    className?: string;
  }) {
    return (
      <Accordion type={type} defaultValue={defaultValue} className={className}>
        <AccordionItem value="item-1" data-testid="item-1">
          <AccordionTrigger data-testid="trigger-1">Section 1</AccordionTrigger>
          <AccordionContent data-testid="content-1">Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" data-testid="item-2">
          <AccordionTrigger data-testid="trigger-2">Section 2</AccordionTrigger>
          <AccordionContent data-testid="content-2">Content 2</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3" data-testid="item-3">
          <AccordionTrigger data-testid="trigger-3">Section 3</AccordionTrigger>
          <AccordionContent data-testid="content-3">Content 3</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  describe("rendering & defaults", () => {
    it("renders with default container classes and closed state", () => {
      render(<TestAccordion />);

      const trigger1 = screen.getByRole("button", { name: "Section 1" });
      const trigger2 = screen.getByRole("button", { name: "Section 2" });

      expect(trigger1).toBeInTheDocument();
      expect(trigger1).toHaveAttribute("type", "button");
      expect(trigger1).toHaveAttribute("aria-expanded", "false");
      expect(trigger2).toHaveAttribute("aria-expanded", "false");

      const content1 = screen.getByTestId("content-1");
      expect(content1).toHaveClass("[grid-template-rows:0fr]");
    });

    it("renders chevron SVG inside trigger without rotation when closed", () => {
      render(<TestAccordion />);
      const trigger1 = screen.getByRole("button", { name: "Section 1" });
      const svg = trigger1.querySelector("svg");

      expect(svg).toBeInTheDocument();
      expect(svg).not.toHaveClass("rotate-180");
    });

    it("respects defaultValue by opening specified item", () => {
      render(<TestAccordion defaultValue={["item-2"]} />);

      const trigger1 = screen.getByRole("button", { name: "Section 1" });
      const trigger2 = screen.getByRole("button", { name: "Section 2" });
      const content2 = screen.getByTestId("content-2");
      const svg2 = trigger2.querySelector("svg");

      expect(trigger1).toHaveAttribute("aria-expanded", "false");
      expect(trigger2).toHaveAttribute("aria-expanded", "true");
      expect(content2).toHaveClass("[grid-template-rows:1fr]");
      expect(svg2).toHaveClass("rotate-180");
    });
  });

  describe("single type behavior", () => {
    it("expands a collapsed item when trigger is clicked", () => {
      render(<TestAccordion type="single" />);

      const trigger1 = screen.getByRole("button", { name: "Section 1" });
      const content1 = screen.getByTestId("content-1");

      fireEvent.click(trigger1);
      expect(trigger1).toHaveAttribute("aria-expanded", "true");
      expect(content1).toHaveClass("[grid-template-rows:1fr]");
      expect(trigger1.querySelector("svg")).toHaveClass("rotate-180");
    });

    it("collapses an expanded item when clicked again", () => {
      render(<TestAccordion type="single" defaultValue={["item-1"]} />);

      const trigger1 = screen.getByRole("button", { name: "Section 1" });
      const content1 = screen.getByTestId("content-1");

      expect(trigger1).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(trigger1);
      expect(trigger1).toHaveAttribute("aria-expanded", "false");
      expect(content1).toHaveClass("[grid-template-rows:0fr]");
      expect(trigger1.querySelector("svg")).not.toHaveClass("rotate-180");
    });

    it("closes previously open item when opening another item in single mode", () => {
      render(<TestAccordion type="single" defaultValue={["item-1"]} />);

      const trigger1 = screen.getByRole("button", { name: "Section 1" });
      const trigger2 = screen.getByRole("button", { name: "Section 2" });
      const content1 = screen.getByTestId("content-1");
      const content2 = screen.getByTestId("content-2");

      expect(trigger1).toHaveAttribute("aria-expanded", "true");
      expect(trigger2).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(trigger2);

      expect(trigger1).toHaveAttribute("aria-expanded", "false");
      expect(content1).toHaveClass("[grid-template-rows:0fr]");
      expect(trigger2).toHaveAttribute("aria-expanded", "true");
      expect(content2).toHaveClass("[grid-template-rows:1fr]");
    });
  });

  describe("multiple type behavior", () => {
    it("allows multiple items to be opened simultaneously", () => {
      render(<TestAccordion type="multiple" />);

      const trigger1 = screen.getByRole("button", { name: "Section 1" });
      const trigger2 = screen.getByRole("button", { name: "Section 2" });
      const content1 = screen.getByTestId("content-1");
      const content2 = screen.getByTestId("content-2");

      fireEvent.click(trigger1);
      expect(trigger1).toHaveAttribute("aria-expanded", "true");
      expect(content1).toHaveClass("[grid-template-rows:1fr]");

      fireEvent.click(trigger2);
      expect(trigger1).toHaveAttribute("aria-expanded", "true");
      expect(content1).toHaveClass("[grid-template-rows:1fr]");
      expect(trigger2).toHaveAttribute("aria-expanded", "true");
      expect(content2).toHaveClass("[grid-template-rows:1fr]");
    });

    it("toggles individual items independently without affecting others", () => {
      render(<TestAccordion type="multiple" defaultValue={["item-1", "item-2"]} />);

      const trigger1 = screen.getByRole("button", { name: "Section 1" });
      const trigger2 = screen.getByRole("button", { name: "Section 2" });
      const content1 = screen.getByTestId("content-1");
      const content2 = screen.getByTestId("content-2");

      expect(trigger1).toHaveAttribute("aria-expanded", "true");
      expect(trigger2).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(trigger1);
      expect(trigger1).toHaveAttribute("aria-expanded", "false");
      expect(content1).toHaveClass("[grid-template-rows:0fr]");
      expect(trigger2).toHaveAttribute("aria-expanded", "true");
      expect(content2).toHaveClass("[grid-template-rows:1fr]");
    });
  });

  describe("ref forwarding & attributes", () => {
    it("forwards ref to AccordionItem element", () => {
      const itemRef = React.createRef<HTMLDivElement>();
      render(
        <Accordion>
          <AccordionItem ref={itemRef} value="test-item">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(itemRef.current).toBeInstanceOf(HTMLDivElement);
      expect(itemRef.current).toHaveClass("border-t", "border-border");
    });

    it("forwards ref to AccordionTrigger button element", () => {
      const triggerRef = React.createRef<HTMLButtonElement>();
      render(
        <Accordion>
          <AccordionItem value="test-item">
            <AccordionTrigger ref={triggerRef}>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
      expect(triggerRef.current?.getAttribute("type")).toBe("button");
    });

    it("forwards ref to AccordionContent container", () => {
      const contentRef = React.createRef<HTMLDivElement>();
      render(
        <Accordion>
          <AccordionItem value="test-item">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent ref={contentRef}>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
      expect(contentRef.current).toHaveClass("grid");
    });

    it("merges custom classNames across Accordion subcomponents", () => {
      render(
        <Accordion className="custom-accordion">
          <AccordionItem value="custom-item" className="custom-item-class" data-testid="styled-item">
            <AccordionTrigger className="custom-trigger-class">Custom Trigger</AccordionTrigger>
            <AccordionContent className="custom-content-class">
              Custom Inner Content
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByRole("button", { name: "Custom Trigger" });
      const item = screen.getByTestId("styled-item");
      const innerContent = screen.getByText("Custom Inner Content");

      expect(item).toHaveClass("custom-item-class");
      expect(trigger).toHaveClass("custom-trigger-class");
      expect(innerContent).toHaveClass("custom-content-class");
    });
  });
});
