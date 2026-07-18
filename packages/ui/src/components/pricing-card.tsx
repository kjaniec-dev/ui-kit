import * as React from "react";
import { cn } from "../lib/cn";
import { Card } from "./card";
import { Button, buttonVariants } from "./button";

export type PricingFeatureItem =
  | string
  | {
      text: string;
      included?: boolean;
      tooltip?: string;
    };

export interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  price: string | number;
  period?: string;
  description?: string;
  features?: PricingFeatureItem[];
  variant?: "default" | "featured" | "outline";
  badge?: string;
  popular?: boolean;
  ctaText?: string;
  onCtaClick?: React.MouseEventHandler<HTMLButtonElement>;
  ctaHref?: string;
  cta?: React.ReactNode;
  disabled?: boolean;
}

export const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      className,
      name,
      price,
      period,
      description,
      features = [],
      variant,
      badge,
      popular = false,
      ctaText = "Get Started",
      onCtaClick,
      ctaHref,
      cta,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const resolvedVariant = variant || (popular ? "featured" : "default");
    const displayBadge = badge || (popular ? "Most Popular" : undefined);

    const isFeatured = resolvedVariant === "featured";

    return (
      <Card
        ref={ref}
        className={cn(
          "relative flex flex-col p-6 transition-all duration-300",
          isFeatured
            ? "border-amber-500/80 shadow-kj-lg ring-1 ring-amber-500/30"
            : resolvedVariant === "outline"
            ? "border-border/80 bg-transparent shadow-none"
            : "border-border shadow-kj-sm",
          className
        )}
        {...props}
      >
        {displayBadge && (
          <div className="absolute -top-3 right-5 rounded-full bg-amber-500 px-3 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-black shadow-sm">
            {displayBadge}
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-xl font-bold tracking-tight text-foreground">{name}</h3>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>

        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-foreground">{price}</span>
          {period && <span className="text-xs font-medium text-muted-foreground">{period}</span>}
        </div>

        {features.length > 0 && (
          <ul className="mb-6 flex flex-1 flex-col gap-2.5 p-0 text-xs list-none">
            {features.map((feature, idx) => {
              const text = typeof feature === "string" ? feature : feature.text;
              const included = typeof feature === "string" ? true : feature.included ?? true;

              return (
                <li key={idx} className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold",
                      included
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground/60"
                    )}
                  >
                    {included ? "✓" : "✕"}
                  </span>
                  <span className={cn(included ? "text-foreground" : "text-muted-foreground line-through opacity-70")}>
                    {text}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-auto pt-2">
          {cta ? (
            cta
          ) : ctaHref ? (
            <a
              href={disabled ? undefined : ctaHref}
              aria-disabled={disabled || undefined}
              className={cn(
                buttonVariants({ variant: isFeatured ? "primary" : "outline" }),
                "w-full justify-center",
                disabled && "pointer-events-none opacity-50"
              )}
            >
              {ctaText}
            </a>
          ) : (
            <Button
              variant={isFeatured ? "primary" : "outline"}
              className="w-full justify-center"
              onClick={onCtaClick}
              disabled={disabled}
            >
              {ctaText}
            </Button>
          )}
        </div>
      </Card>
    );
  }
);
PricingCard.displayName = "PricingCard";
