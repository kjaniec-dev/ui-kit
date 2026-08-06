import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  AppShell,
  AppShellBanner,
  AppShellHeader,
  AppShellMain,
  AppShellFooter,
} from "./app-shell";

describe("AppShell", () => {
  it("renders header, banner, children, and footer via slot props", () => {
    render(
      <AppShell
        banner={<div>Banner Text</div>}
        header={<nav>Nav Links</nav>}
        footer={<footer>Footer Text</footer>}
      >
        <div>Main Content</div>
      </AppShell>
    );

    expect(screen.getByText("Banner Text")).toBeInTheDocument();
    expect(screen.getByText("Nav Links")).toBeInTheDocument();
    expect(screen.getByText("Main Content")).toBeInTheDocument();
    expect(screen.getByText("Footer Text")).toBeInTheDocument();
  });

  it("applies correct max-width classes for contentWidth variants", () => {
    const { container: defaultContainer } = render(
      <AppShell contentWidth="default">Content</AppShell>
    );
    expect(defaultContainer.querySelector("main")).toHaveClass("max-w-7xl");

    const { container: narrowContainer } = render(
      <AppShell contentWidth="narrow">Content</AppShell>
    );
    expect(narrowContainer.querySelector("main")).toHaveClass("max-w-5xl");

    const { container: wideContainer } = render(
      <AppShell contentWidth="wide">Content</AppShell>
    );
    expect(wideContainer.querySelector("main")).toHaveClass("max-w-screen-2xl");

    const { container: fullContainer } = render(
      <AppShell contentWidth="full">Content</AppShell>
    );
    expect(fullContainer.querySelector("main")).toHaveClass("max-w-none");
  });

  it("renders mobile navigation drawer when mobileNav is provided and toggled", () => {
    render(
      <AppShell
        header={<div>Header</div>}
        mobileNav={<div>Mobile Menu Links</div>}
      >
        <div>Page Body</div>
      </AppShell>
    );

    const toggleButton = screen.getByRole("button", { name: /open navigation/i });
    expect(toggleButton).toBeInTheDocument();

    expect(screen.queryByText("Mobile Menu Links")).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText("Mobile Menu Links")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Mobile Navigation" })).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: /close navigation/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText("Mobile Menu Links")).not.toBeInTheDocument();
  });

  it("closes mobile navigation drawer on Escape key press", () => {
    render(
      <AppShell header={<div>Header</div>} mobileNav={<div>Mobile Menu Links</div>}>
        <div>Page Body</div>
      </AppShell>
    );

    const toggleButton = screen.getByRole("button", { name: /open navigation/i });
    fireEvent.click(toggleButton);
    expect(screen.getByRole("dialog", { name: "Mobile Navigation" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Mobile Navigation" })).not.toBeInTheDocument();
  });

  it("calls onClose when closable AppShellBanner close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <AppShellBanner closable onClose={handleClose}>
        Banner Notice
      </AppShellBanner>
    );

    const closeButton = screen.getByRole("button", { name: /close banner/i });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("applies correct variant and position classes for header", () => {
    const { container: glassSticky } = render(
      <AppShellHeader variant="glass" position="sticky">Header</AppShellHeader>
    );
    expect(glassSticky.querySelector("header")).toHaveClass("bg-surface/80", "sticky");

    const { container: solidFixed } = render(
      <AppShellHeader variant="solid" position="fixed">Header</AppShellHeader>
    );
    expect(solidFixed.querySelector("header")).toHaveClass("bg-surface", "fixed");

    const { container: transparentStatic } = render(
      <AppShellHeader variant="transparent" position="static">Header</AppShellHeader>
    );
    expect(transparentStatic.querySelector("header")).toHaveClass("bg-transparent", "relative");
  });

  it("renders compound subcomponents directly or via exports", () => {
    render(
      <AppShell>
        <AppShellBanner variant="accent">Banner Info</AppShellBanner>
        <AppShellHeader>Header Title</AppShellHeader>
        <AppShellMain width="wide">Body Section</AppShellMain>
        <AppShellFooter>Footer Info</AppShellFooter>
      </AppShell>
    );

    expect(screen.getByText("Banner Info")).toBeInTheDocument();
    expect(screen.getByText("Banner Info").parentElement).toHaveClass("bg-secondary");
    expect(screen.getByText("Header Title")).toBeInTheDocument();
    expect(screen.getByText("Body Section")).toBeInTheDocument();
    expect(screen.getByText("Footer Info")).toBeInTheDocument();
  });

  it("renders bottomNav slot when passed to AppShell", () => {
    render(
      <AppShell bottomNav={<nav data-testid="mobile-bottom-nav">Bottom Nav</nav>}>
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByTestId("mobile-bottom-nav")).toBeInTheDocument();
  });

  it("locks body scroll when mobileNav drawer is open", () => {
    render(
      <AppShell header={<div>Header</div>} mobileNav={<div>Mobile Menu Links</div>}>
        <div>Page Body</div>
      </AppShell>
    );

    expect(document.body.style.overflow).toBe("");

    const toggleButton = screen.getByRole("button", { name: /open navigation/i });
    fireEvent.click(toggleButton);
    expect(document.body.style.overflow).toBe("hidden");

    const closeButton = screen.getByRole("button", { name: /close navigation/i });
    fireEvent.click(closeButton);
    expect(document.body.style.overflow).toBe("");
  });
});


