// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { PricingCard } from "./pricing-card";

describe("PricingCard", () => {
  it("renders name, price, period, and features", () => {
    render(
      <PricingCard
        name="Pro Plan"
        price="$49"
        period="/ month"
        description="For growing teams"
        features={[
          { text: "Unlimited components", included: true },
          { text: "Dedicated SLA", included: false },
        ]}
      />
    );

    expect(screen.getByText("Pro Plan")).toBeInTheDocument();
    expect(screen.getByText("$49")).toBeInTheDocument();
    expect(screen.getByText("/ month")).toBeInTheDocument();
    expect(screen.getByText("For growing teams")).toBeInTheDocument();
    expect(screen.getByText("Unlimited components")).toBeInTheDocument();
    expect(screen.getByText("Dedicated SLA")).toBeInTheDocument();
  });

  it("renders badge and handles CTA click", () => {
    const handleCta = vi.fn();
    render(
      <PricingCard
        name="Enterprise"
        price={199}
        popular
        badge="Best Value"
        ctaText="Contact Sales"
        onCtaClick={handleCta}
      />
    );

    expect(screen.getByText("Best Value")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Contact Sales" });
    fireEvent.click(button);
    expect(handleCta).toHaveBeenCalledTimes(1);
  });
});
