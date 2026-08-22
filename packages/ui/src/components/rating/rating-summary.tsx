"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Rating, type RatingSize, type RatingIconType } from "./rating";
import { Progress } from "../progress";

export interface RatingDistributionItem {
  stars: number;
  count: number;
  percentage: number;
}

export interface RatingSummaryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  average: number;
  totalCount: number;
  distribution: RatingDistributionItem[];
  max?: number;
  size?: RatingSize;
  icon?: RatingIconType | React.ComponentType<{ className?: string }>;
}

export const RatingSummary = React.forwardRef<HTMLDivElement, RatingSummaryProps>(
  (
    { average, totalCount, distribution, max = 5, size = "md", icon = "star", className, ...props },
    ref
  ) => {
    const formattedAverage = Number.isInteger(average) ? average.toString() : average.toFixed(1);

    const formattedTotalCount = totalCount.toLocaleString();

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8 p-4 rounded-xl border bg-card text-card-foreground shadow-sm",
          className
        )}
        {...props}
      >
        {/* Average Score Summary Section */}
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/40 text-center min-w-[140px]">
          <div className="text-4xl font-bold tracking-tight text-foreground">
            {formattedAverage}
          </div>
          <div className="my-1.5">
            <Rating
              value={average}
              max={max}
              size={size}
              icon={icon}
              readOnly
              allowClear={false}
              hoverPreview={false}
            />
          </div>
          <div className="text-xs text-muted-foreground">{formattedTotalCount} total ratings</div>
        </div>

        {/* Distribution Breakdown Progress Bars Section */}
        <div className="flex-1 flex flex-col gap-2.5">
          {distribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-sm">
              <span className="w-12 text-right font-medium text-foreground whitespace-nowrap">
                {item.stars} star
              </span>
              <Progress
                value={item.percentage}
                aria-label={`${item.stars} star ratings: ${item.percentage}%`}
                className="h-2.5 flex-1"
              />
              <span className="w-12 text-right text-xs text-muted-foreground font-mono">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

RatingSummary.displayName = "RatingSummary";
