// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { createRef } from "react";
import { ProjectCard } from "./project-card";

describe("ProjectCard", () => {
  it("renders title, description, status, tech stack and metrics", () => {
    render(
      <ProjectCard
        title="kj-product-kit"
        description="Design system starter kit."
        status={{ label: "Active", variant: "success" }}
        techStack={["React", "TypeScript", "Tailwind"]}
        metrics={[
          { label: "stars", value: 248 },
          { label: "forks", value: 34 },
        ]}
        updatedAt="Updated 2h ago"
      />
    );

    expect(screen.getByText("kj-product-kit")).toBeInTheDocument();
    expect(screen.getByText("Design system starter kit.")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("248")).toBeInTheDocument();
    expect(screen.getByText("Updated 2h ago")).toBeInTheDocument();
  });

  it("renders as link when href is provided", () => {
    render(<ProjectCard title="Link Project" href="https://github.com" target="_blank" />);
    const link = screen.getByRole("link", { name: /Link Project/i });
    expect(link).toHaveAttribute("href", "https://github.com");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("triggers onClick callback when clicked", () => {
    const handleClick = vi.fn();
    render(<ProjectCard title="Clickable Project" onClick={handleClick} />);
    fireEvent.click(screen.getByText("Clickable Project"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders actions node and stops event propagation on click", () => {
    const handleCardClick = vi.fn();
    const handleActionClick = vi.fn();

    render(
      <ProjectCard
        title="Action Project"
        onClick={handleCardClick}
        actions={
          <button type="button" onClick={handleActionClick}>
            Action Button
          </button>
        }
      />
    );

    const actionBtn = screen.getByRole("button", { name: "Action Button" });
    expect(actionBtn).toBeInTheDocument();

    fireEvent.click(actionBtn);
    expect(handleActionClick).toHaveBeenCalledTimes(1);
    expect(handleCardClick).not.toHaveBeenCalled();
  });

  it("forwards ref to the underlying card element", () => {
    const ref = createRef<HTMLElement>();
    render(<ProjectCard ref={ref} title="Ref Project" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toHaveTextContent("Ref Project");
  });
});
