import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardShell } from "./dashboard-shell";

describe("DashboardShell", () => {
  it("renders children inside main element", () => {
    const { container } = render(
      <DashboardShell>
        <div data-testid="dashboard-content">Dashboard Content</div>
      </DashboardShell>
    );

    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass("flex-1", "p-6", "md:p-8");
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
  });

  describe("contentWidth variants", () => {
    it("applies default contentWidth classes", () => {
      const { container } = render(
        <DashboardShell contentWidth="default">
          <div>Content</div>
        </DashboardShell>
      );
      const main = container.querySelector("main");
      expect(main).toHaveClass("max-w-7xl", "w-full", "mx-auto");
    });

    it("applies wide contentWidth classes", () => {
      const { container } = render(
        <DashboardShell contentWidth="wide">
          <div>Content</div>
        </DashboardShell>
      );
      const main = container.querySelector("main");
      expect(main).toHaveClass("max-w-screen-2xl", "w-full", "mx-auto");
    });

    it("applies full contentWidth classes", () => {
      const { container } = render(
        <DashboardShell contentWidth="full">
          <div>Content</div>
        </DashboardShell>
      );
      const main = container.querySelector("main");
      expect(main).toHaveClass("max-w-none", "w-full");
    });
  });

  describe("sidebar", () => {
    it("renders sidebar when provided with default width", () => {
      const { container } = render(
        <DashboardShell sidebar={<nav data-testid="desktop-sidebar">Sidebar Content</nav>}>
          <div>Content</div>
        </DashboardShell>
      );

      const aside = container.querySelector("aside");
      expect(aside).toBeInTheDocument();
      expect(aside).toHaveClass(
        "border-r",
        "border-border",
        "bg-surface",
        "shrink-0",
        "z-20",
        "w-full",
        "md:flex",
        "md:w-64"
      );
      expect(screen.getByTestId("desktop-sidebar")).toBeInTheDocument();

      const stickyContainer = aside?.firstElementChild;
      expect(stickyContainer).toHaveClass("sticky", "top-0", "w-full", "flex", "flex-col", "h-auto", "md:h-screen");
    });

    it("applies custom sidebarWidth", () => {
      const { container } = render(
        <DashboardShell
          sidebar={<div>Sidebar</div>}
          sidebarWidth="md:w-80"
        >
          <div>Content</div>
        </DashboardShell>
      );

      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("md:w-80");
      expect(aside).not.toHaveClass("md:w-64");
    });

    it("applies hidden md:flex to sidebar when mobileSidebar is also present", () => {
      const { container } = render(
        <DashboardShell
          sidebar={<div>Desktop Sidebar</div>}
          mobileSidebar={<div>Mobile Sidebar</div>}
        >
          <div>Content</div>
        </DashboardShell>
      );

      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("hidden", "md:flex");
      expect(aside).not.toHaveClass("w-full");

      const stickyContainer = aside?.firstElementChild;
      expect(stickyContainer).toHaveClass("h-screen");
    });

    it("does not render sidebar aside when sidebar prop is omitted", () => {
      const { container } = render(
        <DashboardShell>
          <div>Content</div>
        </DashboardShell>
      );

      expect(container.querySelector("aside")).toBeNull();
    });
  });

  describe("topbar", () => {
    it("renders topbar in header with sticky by default", () => {
      const { container } = render(
        <DashboardShell topbar={<div data-testid="header-content">Header Bar</div>}>
          <div>Content</div>
        </DashboardShell>
      );

      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass(
        "h-14",
        "border-b",
        "border-border",
        "bg-surface",
        "flex",
        "items-center",
        "px-6",
        "z-10",
        "shrink-0",
        "gap-4",
        "sticky",
        "top-0"
      );
      expect(screen.getByTestId("header-content")).toBeInTheDocument();
    });

    it("removes sticky top-0 when stickyTopbar is false", () => {
      const { container } = render(
        <DashboardShell topbar={<div>Header Bar</div>} stickyTopbar={false}>
          <div>Content</div>
        </DashboardShell>
      );

      const header = container.querySelector("header");
      expect(header).not.toHaveClass("sticky", "top-0");
    });

    it("does not render header when topbar is omitted", () => {
      const { container } = render(
        <DashboardShell>
          <div>Content</div>
        </DashboardShell>
      );

      expect(container.querySelector("header")).toBeNull();
    });
  });

  describe("mobile navigation drawer", () => {
    it("renders toggle button when mobileSidebar and topbar are provided", () => {
      render(
        <DashboardShell
          topbar={<div>Top</div>}
          mobileSidebar={<div>Mobile Links</div>}
        >
          <div>Content</div>
        </DashboardShell>
      );

      const toggleButton = screen.getByRole("button", { name: "Open navigation" });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveClass("md:hidden");
    });

    it("does not render toggle button when mobileSidebar is omitted", () => {
      render(
        <DashboardShell topbar={<div>Top</div>}>
          <div>Content</div>
        </DashboardShell>
      );

      expect(screen.queryByRole("button", { name: "Open navigation" })).toBeNull();
    });

    it("opens drawer when toggle button is clicked and closes with close button", () => {
      render(
        <DashboardShell
          topbar={<div>Top</div>}
          mobileSidebar={<nav data-testid="mobile-nav-items">Mobile Links</nav>}
        >
          <div>Content</div>
        </DashboardShell>
      );

      expect(screen.queryByTestId("mobile-nav-items")).toBeNull();
      expect(screen.queryByText("Navigation")).toBeNull();

      const openButton = screen.getByRole("button", { name: "Open navigation" });
      fireEvent.click(openButton);

      expect(screen.getByTestId("mobile-nav-items")).toBeInTheDocument();
      expect(screen.getByText("Navigation")).toBeInTheDocument();

      // Drawer close button is the button inside the mobile drawer header
      const drawerAside = screen.getByText("Navigation").closest("aside");
      const closeButton = drawerAside?.querySelector("button");
      expect(closeButton).toBeInTheDocument();

      fireEvent.click(closeButton!);

      expect(screen.queryByTestId("mobile-nav-items")).toBeNull();
      expect(screen.queryByText("Navigation")).toBeNull();
    });

    it("closes drawer when clicking backdrop", () => {
      const { container } = render(
        <DashboardShell
          topbar={<div>Top</div>}
          mobileSidebar={<div data-testid="drawer-body">Drawer Body</div>}
        >
          <div>Content</div>
        </DashboardShell>
      );

      const openButton = screen.getByRole("button", { name: "Open navigation" });
      fireEvent.click(openButton);
      expect(screen.getByTestId("drawer-body")).toBeInTheDocument();

      // Backdrop is the fixed overlay container
      const backdrop = container.querySelector(".fixed.inset-0.z-50");
      expect(backdrop).toBeInTheDocument();

      fireEvent.click(backdrop!);
      expect(screen.queryByTestId("drawer-body")).toBeNull();
    });

    it("does not close drawer when clicking inside the mobile drawer aside", () => {
      render(
        <DashboardShell
          topbar={<div>Top</div>}
          mobileSidebar={<div data-testid="drawer-body">Drawer Body</div>}
        >
          <div>Content</div>
        </DashboardShell>
      );

      const openButton = screen.getByRole("button", { name: "Open navigation" });
      fireEvent.click(openButton);
      expect(screen.getByTestId("drawer-body")).toBeInTheDocument();

      const drawerBody = screen.getByTestId("drawer-body");
      fireEvent.click(drawerBody);

      // Should still be open because of stopPropagation on aside
      expect(screen.getByTestId("drawer-body")).toBeInTheDocument();
    });
  });

  describe("attributes, ref and displayName", () => {
    it("merges custom className onto root container", () => {
      const { container } = render(
        <DashboardShell className="custom-shell border-t">
          <div>Content</div>
        </DashboardShell>
      );

      const root = container.firstElementChild;
      expect(root).toHaveClass("custom-shell", "border-t", "min-h-screen", "bg-canvas");
    });

    it("forwards ref to the root HTMLDivElement", () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <DashboardShell ref={ref} data-testid="dashboard-root">
          <div>Content</div>
        </DashboardShell>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toBe(screen.getByTestId("dashboard-root"));
    });

    it("passes through standard HTML attributes to root container", () => {
      render(
        <DashboardShell
          id="dashboard-container"
          data-testid="dashboard-root"
          aria-label="App Dashboard"
        >
          <div>Content</div>
        </DashboardShell>
      );

      const root = screen.getByTestId("dashboard-root");
      expect(root).toHaveAttribute("id", "dashboard-container");
      expect(root).toHaveAttribute("aria-label", "App Dashboard");
    });

    it("has the correct displayName", () => {
      expect(DashboardShell.displayName).toBe("DashboardShell");
    });
  });
});
