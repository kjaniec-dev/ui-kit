import type { Meta, StoryObj } from "@storybook/react";
import { PricingCard } from "./pricing-card";

const meta: Meta<typeof PricingCard> = {
  title: "Components/PricingCard",
  component: PricingCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PricingCard>;

export const Default: Story = {
  args: {
    name: "Starter Plan",
    price: "$19",
    period: "/ month",
    description: "Perfect for indie hackers and small projects.",
    features: [
      { text: "Up to 5 projects", included: true },
      { text: "Community support", included: true },
      { text: "Custom domain", included: false },
    ],
    ctaText: "Start Free Trial",
  },
};

export const Featured: Story = {
  args: {
    name: "Pro Plan",
    price: "$49",
    period: "/ month",
    popular: true,
    description: "For growing teams building SaaS products.",
    features: [
      { text: "Unlimited projects", included: true },
      { text: "Priority support", included: true },
      { text: "Custom domain & SSL", included: true },
      { text: "Dedicated SLA", included: false },
    ],
    ctaText: "Upgrade to Pro",
  },
};
