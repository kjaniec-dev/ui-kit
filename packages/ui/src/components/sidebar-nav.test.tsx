import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SidebarNav, type SidebarNavGroup } from "./sidebar-nav";

describe("SidebarNav", () => {
  const dummyIcon = <span data-testid="dummy-icon">Icon</span>;

  const mockGroups: SidebarNavGroup[] = [
    {
      title: "Main Navigation",
      items: [
        { id: "home", label: "Home", href: "/home", icon: dummyIcon },
        { id: "explore", label: "Explore", href: "/explore" },
      ],
    },
    {
      title: "Settings & Preferences",
      items: [
        { id: "profile", label: "Profile", href: "/profile", badge: "New" },
        { id: "logout", label: "Log Out" },
      ],
    },
  ];

  describe("group and item rendering", () => {
    it("renders group titles when provided", () => {
      render(<SidebarNav groups={mockGroups} />);

      const heading1 = screen.getByRole("heading", { level: 4, name: "Main Navigation" });
      const heading2 = screen.getByRole("heading", { level: 4, name: "Settings & Preferences" });

      expect(heading1).toBeInTheDocument();
      expect(heading2).toBeInTheDocument();
      expect(heading1).toHaveClass("text-[10px]", "font-bold", "uppercase", "tracking-widest");
    });

    it("omits group heading when title is not provided", () => {
      const groupsWithoutTitle: SidebarNavGroup[] = [
        {
          items: [{ id: "item1", label: "Item 1", href: "/item1" }],
        },
      ];

      render(<SidebarNav groups={groupsWithoutTitle} />);
      expect(screen.queryByRole("heading", { level: 4 })).not.toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    it("renders link items as anchor tags when href is present", () => {
      render(<SidebarNav groups={mockGroups} />);

      const homeLink = screen.getByRole("link", { name: /home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/home");

      const exploreLink = screen.getByRole("link", { name: /explore/i });
      expect(exploreLink).toBeInTheDocument();
      expect(exploreLink).toHaveAttribute("href", "/explore");
    });

    it("renders action items as button elements with type button when href is absent", () => {
      render(<SidebarNav groups={mockGroups} />);

      const logoutBtn = screen.getByRole("button", { name: "Log Out" });
      expect(logoutBtn).toBeInTheDocument();
      expect(logoutBtn).toHaveAttribute("type", "button");
    });

    it("triggers onClick when a button item is clicked", () => {
      const handleLogout = vi.fn();
      const groupsWithAction: SidebarNavGroup[] = [
        {
          items: [{ id: "action", label: "Click Action", onClick: handleLogout }],
        },
      ];

      render(<SidebarNav groups={groupsWithAction} />);
      const button = screen.getByRole("button", { name: "Click Action" });
      fireEvent.click(button);

      expect(handleLogout).toHaveBeenCalledTimes(1);
    });

    it("handles button item click safely when onClick is not provided", () => {
      const groupsWithoutHandler: SidebarNavGroup[] = [
        {
          items: [{ id: "no-op", label: "No Handler" }],
        },
      ];

      render(<SidebarNav groups={groupsWithoutHandler} />);
      const button = screen.getByRole("button", { name: "No Handler" });
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  describe("active state styling", () => {
    it("applies active styles when item.active is true", () => {
      const groups: SidebarNavGroup[] = [
        {
          items: [
            { id: "active-item", label: "Active Item", href: "/active", active: true },
            { id: "inactive-item", label: "Inactive Item", href: "/inactive", active: false },
          ],
        },
      ];

      render(<SidebarNav groups={groups} />);

      const activeEl = screen.getByRole("link", { name: "Active Item" });
      const inactiveEl = screen.getByRole("link", { name: "Inactive Item" });

      expect(activeEl).toHaveClass(
        "bg-primary/10",
        "text-primary",
        "border-primary",
        "rounded-l-none",
        "pl-2.5"
      );
      expect(inactiveEl).toHaveClass(
        "text-muted-foreground",
        "hover:bg-muted",
        "border-transparent"
      );
    });

    it("applies active styles when currentHref matches item.href", () => {
      render(<SidebarNav groups={mockGroups} currentHref="/explore" />);

      const homeLink = screen.getByRole("link", { name: /home/i });
      const exploreLink = screen.getByRole("link", { name: /explore/i });

      expect(exploreLink).toHaveClass("bg-primary/10", "text-primary", "border-primary");
      expect(homeLink).toHaveClass("text-muted-foreground", "border-transparent");
    });

    it("item.active overrides non-matching currentHref", () => {
      const groups: SidebarNavGroup[] = [
        {
          items: [{ id: "force-active", label: "Forced Active", href: "/other", active: true }],
        },
      ];

      render(<SidebarNav groups={groups} currentHref="/home" />);
      const item = screen.getByRole("link", { name: "Forced Active" });
      expect(item).toHaveClass("bg-primary/10", "text-primary", "border-primary");
    });
  });

  describe("icons and badges", () => {
    it("renders icon with active color class when item is active", () => {
      const groups: SidebarNavGroup[] = [
        {
          items: [
            {
              id: "item-with-icon",
              label: "With Icon",
              href: "/item",
              active: true,
              icon: <span data-testid="test-icon">★</span>,
            },
          ],
        },
      ];

      render(<SidebarNav groups={groups} />);
      const icon = screen.getByTestId("test-icon");
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveClass("text-primary");
    });

    it("renders icon with muted color class when item is inactive", () => {
      const groups: SidebarNavGroup[] = [
        {
          items: [
            {
              id: "item-inactive-icon",
              label: "With Icon",
              href: "/item",
              active: false,
              icon: <span data-testid="test-icon">★</span>,
            },
          ],
        },
      ];

      render(<SidebarNav groups={groups} />);
      const icon = screen.getByTestId("test-icon");
      expect(icon.parentElement).toHaveClass(
        "text-muted-foreground",
        "group-hover:text-foreground"
      );
    });

    it("renders text badge correctly", () => {
      render(<SidebarNav groups={mockGroups} />);
      expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("renders custom ReactNode badge", () => {
      const groups: SidebarNavGroup[] = [
        {
          items: [
            {
              id: "item-custom-badge",
              label: "Pro Feature",
              badge: <span data-testid="custom-badge-el">PRO</span>,
            },
          ],
        },
      ];

      render(<SidebarNav groups={groups} />);
      expect(screen.getByTestId("custom-badge-el")).toBeInTheDocument();
      expect(screen.getByText("PRO")).toBeInTheDocument();
    });
  });

  describe("container props and displayName", () => {
    it("merges custom className and passes HTML attributes to container", () => {
      render(
        <SidebarNav
          groups={mockGroups}
          className="custom-sidebar"
          data-testid="sidebar-nav-root"
          aria-label="Main navigation"
        />
      );

      const container = screen.getByTestId("sidebar-nav-root");
      expect(container).toHaveClass("custom-sidebar", "space-y-6", "py-4", "px-3", "w-full");
      expect(container).toHaveAttribute("aria-label", "Main navigation");
    });

    it("has displayName set to 'SidebarNav'", () => {
      expect(SidebarNav.displayName).toBe("SidebarNav");
    });
  });
});
