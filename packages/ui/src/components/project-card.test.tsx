// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
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
});
