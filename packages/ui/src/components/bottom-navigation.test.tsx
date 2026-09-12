import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { BottomNavigation, type BottomNavigationItem } from "./bottom-navigation";

describe("BottomNavigation", () => {
  const HomeIcon = () => <span data-testid="icon-home">HomeIcon</span>;
  const SearchIcon = () => <span data-testid="icon-search">SearchIcon</span>;
  const InboxIcon = () => <span data-testid="icon-inbox">InboxIcon</span>;

  const mockItems: BottomNavigationItem[] = [
    {
      id: "home",
      label: "Home",
      icon: <HomeIcon />,
      href: "/home",
      active: true,
    },
    {
      id: "search",
      label: "Search",
      icon: <SearchIcon />,
      href: "/search",
      active: false,
    },
    {
      id: "inbox",
      label: "Inbox",
      icon: <InboxIcon />,
      badge: 4,
    },
  ];

  describe("rendering and positioning", () => {
    it("renders inside a nav element with default fixed styling", () => {
      const { container } = render(<BottomNavigation items={mockItems} />);
      const nav = container.querySelector("nav");

      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass("fixed", "bottom-0", "left-0", "right-0", "z-40", "backdrop-blur-md");
    });

    it("applies relative positioning when fixed is false", () => {
      const { container } = render(<BottomNavigation items={mockItems} fixed={false} />);
      const nav = container.querySelector("nav");

      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass("relative", "w-full");
      expect(nav).not.toHaveClass("fixed", "bottom-0");
    });
  });

  describe("links vs buttons and accessibility attributes", () => {
    it("renders items with href as anchor links with aria-current on active item", () => {
      render(<BottomNavigation items={mockItems} />);

      const homeLink = screen.getByRole("link", { name: /home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/home");
      expect(homeLink).toHaveAttribute("aria-current", "page");

      const searchLink = screen.getByRole("link", { name: /search/i });
      expect(searchLink).toBeInTheDocument();
      expect(searchLink).toHaveAttribute("href", "/search");
      expect(searchLink).not.toHaveAttribute("aria-current");
    });

    it("renders items without href as buttons with aria-pressed", () => {
      const buttonItems: BottomNavigationItem[] = [
        { id: "active-btn", label: "Feed", icon: <HomeIcon />, active: true },
        { id: "inactive-btn", label: "Explore", icon: <SearchIcon />, active: false },
      ];

      render(<BottomNavigation items={buttonItems} />);

      const activeBtn = screen.getByRole("button", { name: /feed/i });
      expect(activeBtn).toHaveAttribute("type", "button");
      expect(activeBtn).toHaveAttribute("aria-pressed", "true");

      const inactiveBtn = screen.getByRole("button", { name: /explore/i });
      expect(inactiveBtn).toHaveAttribute("type", "button");
      expect(inactiveBtn).toHaveAttribute("aria-pressed", "false");
    });

    it("fires onClick handler when button item is clicked", () => {
      const handleClick = vi.fn();
      const items: BottomNavigationItem[] = [
        { id: "btn", label: "Action", icon: <HomeIcon />, onClick: handleClick },
      ];

      render(<BottomNavigation items={items} />);
      const button = screen.getByRole("button", { name: /action/i });
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("active state styling and indicator dot", () => {
    it("highlights active item and renders the active indicator dot", () => {
      const { container } = render(<BottomNavigation items={mockItems} />);

      const homeLabel = screen.getByText("Home");
      expect(homeLabel).toHaveClass("text-primary", "font-bold");

      const homeIcon = screen.getByTestId("icon-home");
      expect(homeIcon.parentElement).toHaveClass("text-primary", "scale-110");

      const activeDot = container.querySelector(".animate-fade-in.bg-primary");
      expect(activeDot).toBeInTheDocument();
    });

    it("applies muted styling and omits indicator dot for inactive items", () => {
      const items: BottomNavigationItem[] = [
        { id: "inactive", label: "Quiet", icon: <SearchIcon />, active: false },
      ];

      const { container } = render(<BottomNavigation items={items} />);

      const label = screen.getByText("Quiet");
      expect(label).toHaveClass("text-muted-foreground");

      const icon = screen.getByTestId("icon-search");
      expect(icon.parentElement).toHaveClass("text-muted-foreground");

      const activeDot = container.querySelector(".animate-fade-in.bg-primary");
      expect(activeDot).not.toBeInTheDocument();
    });
  });

  describe("label display modes (showLabels)", () => {
    it("shows all labels when showLabels='always' (default)", () => {
      render(<BottomNavigation items={mockItems} />);

      const homeLabel = screen.getByText("Home");
      const searchLabel = screen.getByText("Search");

      expect(homeLabel).toHaveClass("opacity-100", "scale-100", "h-auto");
      expect(searchLabel).toHaveClass("opacity-100", "scale-100", "h-auto");
    });

    it("shows only active label when showLabels='active'", () => {
      render(<BottomNavigation items={mockItems} showLabels="active" />);

      const homeLabel = screen.getByText("Home");
      const searchLabel = screen.getByText("Search");

      expect(homeLabel).toHaveClass("opacity-100", "scale-100", "h-auto");
      expect(searchLabel).toHaveClass("opacity-0", "scale-75", "h-0", "overflow-hidden");
    });

    it("hides all labels when showLabels='never'", () => {
      render(<BottomNavigation items={mockItems} showLabels="never" />);

      const homeLabel = screen.getByText("Home");
      const searchLabel = screen.getByText("Search");

      expect(homeLabel).toHaveClass("opacity-0", "scale-75", "h-0", "overflow-hidden");
      expect(searchLabel).toHaveClass("opacity-0", "scale-75", "h-0", "overflow-hidden");
    });
  });

  describe("badges", () => {
    it("renders numeric and string badges", () => {
      const itemsWithBadges: BottomNavigationItem[] = [
        { id: "1", label: "Inbox", icon: <InboxIcon />, badge: 99 },
        { id: "2", label: "Alerts", icon: <HomeIcon />, badge: "NEW" },
      ];

      render(<BottomNavigation items={itemsWithBadges} />);

      expect(screen.getByText("99")).toBeInTheDocument();
      expect(screen.getByText("NEW")).toBeInTheDocument();
    });

    it("renders badge when value is 0", () => {
      const items: BottomNavigationItem[] = [
        { id: "zero", label: "Cart", icon: <HomeIcon />, badge: 0 },
      ];

      render(<BottomNavigation items={items} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("does not render badge when undefined or null", () => {
      const items: BottomNavigationItem[] = [
        { id: "none", label: "Plain", icon: <HomeIcon />, badge: undefined },
        { id: "nullBadge", label: "Null", icon: <SearchIcon />, badge: null },
      ];

      const { container } = render(<BottomNavigation items={items} />);
      const badgePills = container.querySelectorAll(".min-w-\\[16px\\]");
      expect(badgePills).toHaveLength(0);
    });
  });

  describe("ref forwarding and customization", () => {
    it("forwards ref to the nav element", () => {
      const ref = React.createRef<HTMLElement>();
      render(<BottomNavigation ref={ref} items={mockItems} />);

      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe("NAV");
    });

    it("merges custom className and forwards extra attributes", () => {
      render(
        <BottomNavigation
          items={mockItems}
          className="custom-bottom-nav"
          data-testid="bottom-nav-root"
          aria-label="Application tabs"
        />
      );

      const nav = screen.getByTestId("bottom-nav-root");
      expect(nav).toHaveClass("custom-bottom-nav");
      expect(nav).toHaveAttribute("aria-label", "Application tabs");
    });

    it("has displayName set to 'BottomNavigation'", () => {
      expect(BottomNavigation.displayName).toBe("BottomNavigation");
    });
  });
});
