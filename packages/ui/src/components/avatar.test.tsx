import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Avatar, AvatarGroup } from "./avatar";

describe("Avatar", () => {
  describe("rendering & fallback", () => {
    it("renders fallback children text (e.g. initials) when src is absent", () => {
      render(<Avatar>JD</Avatar>);
      const avatar = screen.getByText("JD");

      expect(avatar).toBeInTheDocument();
      expect(avatar.tagName).toBe("SPAN");
      expect(avatar).toHaveClass(
        "grid",
        "place-items-center",
        "shrink-0",
        "rounded-full",
        "font-semibold",
        "border-2",
        "border-surface",
        "overflow-hidden"
      );
      // Default size md and default tone secondary
      expect(avatar).toHaveClass("h-9", "w-9", "text-[0.8rem]");
      expect(avatar).toHaveClass("bg-secondary", "text-secondary-foreground");
    });

    it("renders complex children like fallback SVG icons", () => {
      render(
        <Avatar>
          <svg data-testid="fallback-icon" />
        </Avatar>
      );
      expect(screen.getByTestId("fallback-icon")).toBeInTheDocument();
    });
  });

  describe("image rendering", () => {
    it("renders an img element when src is provided", () => {
      render(<Avatar src="https://example.com/user.jpg" alt="Jane Doe">JD</Avatar>);
      const img = screen.getByRole("img", { name: "Jane Doe" });

      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/user.jpg");
      expect(img).toHaveAttribute("alt", "Jane Doe");
      expect(img).toHaveClass("h-full", "w-full", "object-cover");
      // Children (initials) should not be rendered when src is present
      expect(screen.queryByText("JD")).not.toBeInTheDocument();
    });

    it("renders img element when alt is not explicitly provided", () => {
      const { container } = render(<Avatar src="https://example.com/user.jpg" />);
      const img = container.querySelector("img");

      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/user.jpg");
    });
  });

  describe("sizes", () => {
    it("renders sm size with appropriate dimension classes", () => {
      render(<Avatar size="sm">SM</Avatar>);
      const avatar = screen.getByText("SM");
      expect(avatar).toHaveClass("h-7", "w-7", "text-[0.7rem]");
    });

    it("renders md size with appropriate dimension classes", () => {
      render(<Avatar size="md">MD</Avatar>);
      const avatar = screen.getByText("MD");
      expect(avatar).toHaveClass("h-9", "w-9", "text-[0.8rem]");
    });

    it("renders lg size with appropriate dimension classes", () => {
      render(<Avatar size="lg">LG</Avatar>);
      const avatar = screen.getByText("LG");
      expect(avatar).toHaveClass("h-12", "w-12", "text-base");
    });
  });

  describe("tones", () => {
    it("renders secondary tone by default", () => {
      render(<Avatar>SC</Avatar>);
      const avatar = screen.getByText("SC");
      expect(avatar).toHaveClass("bg-secondary", "text-secondary-foreground");
    });

    it("renders primary tone", () => {
      render(<Avatar tone="primary">PR</Avatar>);
      const avatar = screen.getByText("PR");
      expect(avatar).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("renders info tone", () => {
      render(<Avatar tone="info">IN</Avatar>);
      const avatar = screen.getByText("IN");
      expect(avatar).toHaveClass("bg-info", "text-white");
    });

    it("renders muted tone", () => {
      render(<Avatar tone="muted">MU</Avatar>);
      const avatar = screen.getByText("MU");
      expect(avatar).toHaveClass("bg-muted", "text-muted-foreground");
    });
  });

  describe("status indicator", () => {
    it("does not render status indicator when status is false or omitted", () => {
      const { container } = render(<Avatar>NO</Avatar>);
      const statusDot = container.querySelector(".bg-success");
      expect(statusDot).toBeNull();
      // Outer wrapper should not be present
      expect(container.querySelector(".relative.inline-flex")).toBeNull();
    });

    it("renders status indicator dot and relative wrapper when status is true", () => {
      const { container } = render(<Avatar status>ST</Avatar>);
      const wrapper = container.querySelector<HTMLElement>(".relative.inline-flex");
      expect(wrapper).toBeInTheDocument();

      const statusDot = container.querySelector<HTMLElement>(".bg-success");
      expect(statusDot).toBeInTheDocument();
      expect(statusDot).toHaveClass(
        "absolute",
        "-right-px",
        "-bottom-px",
        "h-[0.7rem]",
        "w-[0.7rem]",
        "rounded-full",
        "bg-success",
        "border-2",
        "border-surface"
      );

      // Inner avatar node is inside the wrapper
      const avatar = screen.getByText("ST");
      expect(wrapper).toContainElement(avatar);
      expect(wrapper).toContainElement(statusDot);
    });

    it("renders status indicator with image avatar", () => {
      const { container } = render(
        <Avatar src="https://example.com/user.jpg" alt="Active User" status />
      );
      const img = screen.getByRole("img", { name: "Active User" });
      expect(img).toBeInTheDocument();

      const statusDot = container.querySelector(".bg-success");
      expect(statusDot).toBeInTheDocument();
    });
  });

  describe("ref forwarding & HTML attributes", () => {
    it("forwards ref to the inner avatar span when status is not set", () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Avatar ref={ref}>RF</Avatar>);

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current?.textContent).toBe("RF");
    });

    it("forwards ref to the inner avatar span even when status is true", () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Avatar ref={ref} status>RS</Avatar>);

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current?.textContent).toBe("RS");
      // Verify ref is attached to the avatar node, not the outer wrapper
      expect(ref.current).toHaveClass("grid", "place-items-center");
    });

    it("merges custom className onto avatar element", () => {
      render(<Avatar className="custom-avatar-class ring-2 ring-primary">CA</Avatar>);
      const avatar = screen.getByText("CA");

      expect(avatar).toHaveClass("custom-avatar-class", "ring-2", "ring-primary");
    });

    it("forwards standard HTML attributes and handles events", () => {
      const handleClick = vi.fn();
      render(
        <Avatar
          id="custom-avatar-id"
          data-testid="interactive-avatar"
          title="User Avatar"
          aria-label="User Avatar"
          onClick={handleClick}
        >
          IA
        </Avatar>
      );

      const avatar = screen.getByTestId("interactive-avatar");
      expect(avatar).toHaveAttribute("id", "custom-avatar-id");
      expect(avatar).toHaveAttribute("title", "User Avatar");
      expect(avatar).toHaveAttribute("aria-label", "User Avatar");

      fireEvent.click(avatar);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});

describe("AvatarGroup", () => {
  it("renders a container with default overlapping classes", () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
        <Avatar>C</Avatar>
      </AvatarGroup>
    );

    const group = container.firstChild as HTMLElement;
    expect(group).toBeInTheDocument();
    expect(group.tagName).toBe("DIV");
    expect(group).toHaveClass("flex", "[&>*:not(:first-child)]:-ml-2.5");
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("merges custom className onto group container", () => {
    const { container } = render(
      <AvatarGroup className="custom-group-class my-4">
        <Avatar>A</Avatar>
      </AvatarGroup>
    );

    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("custom-group-class", "my-4", "flex");
  });

  it("forwards ref to container div", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <AvatarGroup ref={ref}>
        <Avatar>A</Avatar>
      </AvatarGroup>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("passes HTML attributes through to container div", () => {
    render(
      <AvatarGroup data-testid="avatar-group-test" role="group" aria-label="Team members">
        <Avatar>A</Avatar>
      </AvatarGroup>
    );

    const group = screen.getByTestId("avatar-group-test");
    expect(group).toHaveAttribute("role", "group");
    expect(group).toHaveAttribute("aria-label", "Team members");
  });
});
