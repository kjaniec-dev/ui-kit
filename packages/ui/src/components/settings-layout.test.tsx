import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsLayout } from "./settings-layout";

describe("SettingsLayout", () => {
  it("renders title in an h1 heading", () => {
    render(
      <SettingsLayout
        title="Account Settings"
        sidebar={<nav>Sidebar Nav</nav>}
      >
        <div>Settings Content</div>
      </SettingsLayout>
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Account Settings" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("text-2xl", "font-bold", "tracking-tight", "text-foreground");
  });

  it("renders description text in a paragraph", () => {
    render(
      <SettingsLayout
        description="Manage your profile and security settings."
        sidebar={<nav>Sidebar Nav</nav>}
      >
        <div>Settings Content</div>
      </SettingsLayout>
    );

    const description = screen.getByText("Manage your profile and security settings.");
    expect(description).toBeInTheDocument();
    expect(description.tagName).toBe("P");
    expect(description).toHaveClass("text-sm", "text-muted-foreground", "mt-1");
  });

  it("renders both title and description in the header section", () => {
    const { container } = render(
      <SettingsLayout
        title="Preferences"
        description="Customize your experience."
        sidebar={<nav>Sidebar Nav</nav>}
      >
        <div>Settings Content</div>
      </SettingsLayout>
    );

    const header = container.querySelector(".border-b.border-border.pb-4");
    expect(header).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Preferences" })).toBeInTheDocument();
    expect(screen.getByText("Customize your experience.")).toBeInTheDocument();
  });

  it("renders only title when description is omitted", () => {
    const { container } = render(
      <SettingsLayout title="Notifications" sidebar={<nav>Sidebar Nav</nav>}>
        <div>Settings Content</div>
      </SettingsLayout>
    );

    expect(screen.getByRole("heading", { level: 1, name: "Notifications" })).toBeInTheDocument();
    const header = container.querySelector(".border-b.border-border.pb-4");
    expect(header?.querySelector("p")).toBeNull();
  });

  it("renders only description when title is omitted", () => {
    const { container } = render(
      <SettingsLayout description="Only description provided." sidebar={<nav>Sidebar Nav</nav>}>
        <div>Settings Content</div>
      </SettingsLayout>
    );

    expect(screen.getByText("Only description provided.")).toBeInTheDocument();
    const header = container.querySelector(".border-b.border-border.pb-4");
    expect(header?.querySelector("h1")).toBeNull();
  });

  it("does not render header container when neither title nor description is provided", () => {
    const { container } = render(
      <SettingsLayout sidebar={<nav>Sidebar Nav</nav>}>
        <div>Settings Content</div>
      </SettingsLayout>
    );

    const header = container.querySelector(".border-b.border-border.pb-4");
    expect(header).toBeNull();
  });

  it("renders sidebar inside aside and nav elements with expected classes", () => {
    const { container } = render(
      <SettingsLayout
        sidebar={<ul data-testid="sidebar-items"><li>Item 1</li></ul>}
      >
        <div>Settings Content</div>
      </SettingsLayout>
    );

    const aside = container.querySelector("aside");
    expect(aside).toBeInTheDocument();
    expect(aside).toHaveClass("lg:w-1/4", "shrink-0");

    const nav = aside?.querySelector("nav");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass(
      "flex",
      "flex-row",
      "lg:flex-col",
      "gap-1",
      "overflow-x-auto",
      "lg:overflow-x-visible",
      "pb-2",
      "lg:pb-0"
    );

    expect(screen.getByTestId("sidebar-items")).toBeInTheDocument();
  });

  it("renders children in the main content area with max-w-3xl", () => {
    render(
      <SettingsLayout sidebar={<nav>Sidebar Nav</nav>}>
        <div data-testid="main-content">Profile Form Content</div>
      </SettingsLayout>
    );

    const content = screen.getByTestId("main-content");
    expect(content).toBeInTheDocument();
    expect(content.parentElement).toHaveClass("flex-1", "max-w-3xl");
  });

  it("merges custom className onto root container", () => {
    const { container } = render(
      <SettingsLayout
        className="custom-settings-layout bg-background"
        sidebar={<nav>Sidebar Nav</nav>}
      >
        <div>Settings Content</div>
      </SettingsLayout>
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("custom-settings-layout", "bg-background", "space-y-6", "w-full");
  });

  it("forwards ref to the root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <SettingsLayout
        ref={ref}
        data-testid="settings-root"
        sidebar={<nav>Sidebar Nav</nav>}
      >
        <div>Settings Content</div>
      </SettingsLayout>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId("settings-root"));
  });

  it("passes through standard HTML attributes to the root element", () => {
    render(
      <SettingsLayout
        id="settings-page"
        aria-label="Account Settings Container"
        data-testid="settings-root"
        sidebar={<nav>Sidebar Nav</nav>}
      >
        <div>Settings Content</div>
      </SettingsLayout>
    );

    const root = screen.getByTestId("settings-root");
    expect(root).toHaveAttribute("id", "settings-page");
    expect(root).toHaveAttribute("aria-label", "Account Settings Container");
  });

  it("has the correct displayName", () => {
    expect(SettingsLayout.displayName).toBe("SettingsLayout");
  });
});
