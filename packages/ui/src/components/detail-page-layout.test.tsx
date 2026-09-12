import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DetailPageLayout } from "./detail-page-layout";

describe("DetailPageLayout", () => {
  it("renders title in an h1 heading", () => {
    render(
      <DetailPageLayout title="Project Details">
        <div>Content</div>
      </DetailPageLayout>
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Project Details" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("text-2xl", "font-bold", "tracking-tight", "text-foreground");
  });

  it("renders description when provided", () => {
    render(
      <DetailPageLayout
        title="Project Details"
        description="Detailed analytics and deployment status."
      >
        <div>Content</div>
      </DetailPageLayout>
    );

    const description = screen.getByText("Detailed analytics and deployment status.");
    expect(description).toBeInTheDocument();
    expect(description.tagName).toBe("P");
    expect(description).toHaveClass("text-sm", "text-muted-foreground");
  });

  it("does not render description paragraph when omitted", () => {
    render(
      <DetailPageLayout title="Project Details">
        <div>Content</div>
      </DetailPageLayout>
    );

    const headerTextContainer = screen.getByRole("heading", { level: 1 }).parentElement;
    expect(headerTextContainer?.querySelector("p")).toBeNull();
  });

  describe("back navigation", () => {
    it("does not render back navigation when neither backHref nor onBackClick is provided", () => {
      render(
        <DetailPageLayout title="Project Details">
          <div>Content</div>
        </DetailPageLayout>
      );

      expect(screen.queryByRole("link", { name: /back/i })).toBeNull();
      expect(screen.queryByRole("button", { name: /back/i })).toBeNull();
    });

    it("renders back link when backHref is provided with default label", () => {
      render(
        <DetailPageLayout title="Project Details" backHref="/projects">
          <div>Content</div>
        </DetailPageLayout>
      );

      const link = screen.getByRole("link", { name: /back/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/projects");
      expect(link).toHaveTextContent("Back");
    });

    it("renders back link with custom backLabel", () => {
      render(
        <DetailPageLayout
          title="Project Details"
          backHref="/projects"
          backLabel="Back to Projects"
        >
          <div>Content</div>
        </DetailPageLayout>
      );

      const link = screen.getByRole("link", { name: "Back to Projects" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/projects");
      expect(link).toHaveTextContent("Back to Projects");
    });

    it("renders back button when onBackClick is provided with default label", () => {
      const handleBack = vi.fn();
      render(
        <DetailPageLayout title="Project Details" onBackClick={handleBack}>
          <div>Content</div>
        </DetailPageLayout>
      );

      const button = screen.getByRole("button", { name: "Back" });
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(handleBack).toHaveBeenCalledTimes(1);
    });

    it("renders back button with custom backLabel and handles clicks", () => {
      const handleBack = vi.fn();
      render(
        <DetailPageLayout
          title="Project Details"
          onBackClick={handleBack}
          backLabel="Return to Dashboard"
        >
          <div>Content</div>
        </DetailPageLayout>
      );

      const button = screen.getByRole("button", { name: "Return to Dashboard" });
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(handleBack).toHaveBeenCalledTimes(1);
    });

    it("prioritizes backHref link over onBackClick when both are provided", () => {
      const handleBack = vi.fn();
      render(
        <DetailPageLayout
          title="Project Details"
          backHref="/dashboard"
          onBackClick={handleBack}
        >
          <div>Content</div>
        </DetailPageLayout>
      );

      const link = screen.getByRole("link", { name: /back/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/dashboard");
      expect(screen.queryByRole("button", { name: /back/i })).toBeNull();
    });
  });

  describe("actions slot", () => {
    it("renders actions slot when provided", () => {
      render(
        <DetailPageLayout
          title="Project Details"
          actions={
            <div data-testid="page-actions">
              <button type="button">Edit</button>
              <button type="button">Delete</button>
            </div>
          }
        >
          <div>Content</div>
        </DetailPageLayout>
      );

      expect(screen.getByTestId("page-actions")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });

    it("does not render actions wrapper when actions prop is omitted", () => {
      const { container } = render(
        <DetailPageLayout title="Project Details">
          <div>Content</div>
        </DetailPageLayout>
      );

      expect(container.querySelector(".flex.items-center.gap-2.shrink-0")).toBeNull();
    });
  });

  describe("aside slot and layout grid", () => {
    it("spans 3 columns when aside is omitted", () => {
      render(
        <DetailPageLayout title="Project Details">
          <div data-testid="page-children">Main Content</div>
        </DetailPageLayout>
      );

      const contentWrapper = screen.getByTestId("page-children").parentElement;
      expect(contentWrapper).toHaveClass("lg:col-span-3", "space-y-6");
      expect(screen.queryByRole("complementary")).toBeNull();
    });

    it("spans 2 columns and renders aside element when aside is provided", () => {
      const { container } = render(
        <DetailPageLayout
          title="Project Details"
          aside={<div data-testid="aside-content">Meta Info</div>}
        >
          <div data-testid="page-children">Main Content</div>
        </DetailPageLayout>
      );

      const contentWrapper = screen.getByTestId("page-children").parentElement;
      expect(contentWrapper).toHaveClass("lg:col-span-2", "space-y-6");
      expect(contentWrapper).not.toHaveClass("lg:col-span-3");

      const aside = container.querySelector("aside");
      expect(aside).toBeInTheDocument();
      expect(aside).toHaveClass(
        "space-y-6",
        "lg:col-span-1",
        "bg-surface",
        "border",
        "border-border",
        "rounded-kj-xl",
        "p-6",
        "shadow-kj-xs"
      );
      expect(screen.getByTestId("aside-content")).toBeInTheDocument();
    });
  });

  describe("attributes, ref and displayName", () => {
    it("merges custom className onto root element", () => {
      const { container } = render(
        <DetailPageLayout className="custom-detail-page border-b" title="Details">
          <div>Content</div>
        </DetailPageLayout>
      );

      const root = container.firstElementChild;
      expect(root).toHaveClass("custom-detail-page", "border-b", "space-y-6", "w-full");
    });

    it("forwards ref to root HTMLDivElement", () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <DetailPageLayout ref={ref} data-testid="detail-root" title="Details">
          <div>Content</div>
        </DetailPageLayout>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toBe(screen.getByTestId("detail-root"));
    });

    it("passes through standard HTML attributes to root element", () => {
      render(
        <DetailPageLayout
          id="detail-page-id"
          data-testid="detail-root"
          aria-label="Detail Page Container"
          title="Details"
        >
          <div>Content</div>
        </DetailPageLayout>
      );

      const root = screen.getByTestId("detail-root");
      expect(root).toHaveAttribute("id", "detail-page-id");
      expect(root).toHaveAttribute("aria-label", "Detail Page Container");
    });

    it("has the correct displayName", () => {
      expect(DetailPageLayout.displayName).toBe("DetailPageLayout");
    });
  });
});
