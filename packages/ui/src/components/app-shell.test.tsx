import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AppShell } from "./app-shell";

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

    const closeButton = screen.getByRole("button", { name: /close navigation/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText("Mobile Menu Links")).not.toBeInTheDocument();
  });

  it("renders compound subcomponents correctly", () => {
    render(
      <AppShell>
        <AppShell.Banner>Banner Info</AppShell.Banner>
        <AppShell.Header>Header Title</AppShell.Header>
        <AppShell.Main width="wide">Body Section</AppShell.Main>
        <AppShell.Footer>Footer Info</AppShell.Footer>
      </AppShell>
    );

    expect(screen.getByText("Banner Info")).toBeInTheDocument();
    expect(screen.getByText("Header Title")).toBeInTheDocument();
    expect(screen.getByText("Body Section")).toBeInTheDocument();
    expect(screen.getByText("Footer Info")).toBeInTheDocument();
  });
});
