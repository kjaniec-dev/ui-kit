import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "./breadcrumb";

describe("Breadcrumb", () => {
  describe("Breadcrumb container", () => {
    it("renders a nav element with default aria-label='Breadcrumb'", () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
        </Breadcrumb>
      );

      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();
      expect(nav.tagName).toBe("NAV");
      expect(nav).toHaveClass(
        "flex",
        "items-center",
        "gap-1.5",
        "text-[0.85rem]",
        "text-muted-foreground"
      );
    });

    it("allows overriding aria-label", () => {
      render(
        <Breadcrumb aria-label="Ścieżka powrotu">
          <BreadcrumbItem href="/">Główna</BreadcrumbItem>
        </Breadcrumb>
      );

      expect(screen.getByRole("navigation", { name: "Ścieżka powrotu" })).toBeInTheDocument();
    });

    it("merges custom className and forwards HTML attributes", () => {
      render(
        <Breadcrumb className="custom-breadcrumb-class" data-testid="breadcrumb-root" id="main-nav">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
        </Breadcrumb>
      );

      const nav = screen.getByTestId("breadcrumb-root");
      expect(nav).toHaveClass("custom-breadcrumb-class", "flex");
      expect(nav).toHaveAttribute("id", "main-nav");
    });

    it("forwards ref to the nav element", () => {
      const ref = React.createRef<HTMLElement>();
      render(
        <Breadcrumb ref={ref}>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
        </Breadcrumb>
      );

      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe("NAV");
    });
  });

  describe("BreadcrumbItem", () => {
    it("renders an anchor link by default when current is omitted or false", () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        </Breadcrumb>
      );

      const link = screen.getByRole("link", { name: "Dashboard" });
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "/dashboard");
      expect(link).not.toHaveAttribute("aria-current");
      expect(link).toHaveClass(
        "text-inherit",
        "no-underline",
        "hover:text-foreground",
        "transition-colors"
      );
    });

    it("renders a non-link span with aria-current='page' when current is true", () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem current>Settings</BreadcrumbItem>
        </Breadcrumb>
      );

      expect(screen.queryByRole("link")).toBeNull();
      const currentSpan = screen.getByText("Settings");
      expect(currentSpan.tagName).toBe("SPAN");
      expect(currentSpan).toHaveAttribute("aria-current", "page");
      expect(currentSpan).toHaveClass("text-foreground", "font-semibold");
    });

    it("forwards ref to anchor element when not current", () => {
      const ref = React.createRef<HTMLAnchorElement>();
      render(
        <Breadcrumb>
          <BreadcrumbItem ref={ref} href="/docs">
            Documentation
          </BreadcrumbItem>
        </Breadcrumb>
      );

      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
      expect(ref.current?.getAttribute("href")).toBe("/docs");
    });

    it("merges custom className and handles click handlers on anchor", () => {
      const handleClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
      render(
        <Breadcrumb>
          <BreadcrumbItem
            href="/items"
            className="custom-item-link"
            onClick={handleClick}
          >
            Items
          </BreadcrumbItem>
        </Breadcrumb>
      );

      const link = screen.getByRole("link", { name: "Items" });
      expect(link).toHaveClass("custom-item-link");

      fireEvent.click(link);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("merges custom className on current item", () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem current className="custom-current-class">
            Current Page
          </BreadcrumbItem>
        </Breadcrumb>
      );

      const currentItem = screen.getByText("Current Page");
      expect(currentItem).toHaveClass("custom-current-class", "text-foreground", "font-semibold");
    });
  });

  describe("BreadcrumbSeparator", () => {
    it("renders '/' with aria-hidden='true'", () => {
      const { container } = render(<BreadcrumbSeparator />);
      const separator = container.firstChild as HTMLElement;

      expect(separator).toBeInTheDocument();
      expect(separator.tagName).toBe("SPAN");
      expect(separator).toHaveAttribute("aria-hidden", "true");
      expect(separator).toHaveClass("text-muted-foreground/70");
      expect(separator).toHaveTextContent("/");
    });
  });

  describe("complete breadcrumb trail integration", () => {
    it("renders full hierarchy with accessible navigation landmarks, links, and separators", () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem href="/products">Products</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem current>Laptops</BreadcrumbItem>
        </Breadcrumb>
      );

      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveTextContent("Home");
      expect(links[0]).toHaveAttribute("href", "/");
      expect(links[1]).toHaveTextContent("Products");
      expect(links[1]).toHaveAttribute("href", "/products");

      const currentPage = screen.getByText("Laptops");
      expect(currentPage).toHaveAttribute("aria-current", "page");
      expect(currentPage.tagName).toBe("SPAN");

      const separators = screen.getAllByText("/");
      expect(separators).toHaveLength(2);
      separators.forEach((sep) => {
        expect(sep).toHaveAttribute("aria-hidden", "true");
      });
    });
  });
});
