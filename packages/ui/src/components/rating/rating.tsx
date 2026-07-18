"use client";

import * as React from "react";
import { cn } from "../../lib/cn";

export type RatingSize = "sm" | "md" | "lg" | "xl";

export interface RatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number;
  defaultValue?: number;
  max?: number;
  precision?: number;
  size?: RatingSize;
  color?: string;
  emptyColor?: string;
  allowClear?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  hoverPreview?: boolean;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  name?: string;
  onChange?: (value: number) => void;
}

const sizeClasses: Record<RatingSize, { wrapper: string; star: string; text: string }> = {
  sm: { wrapper: "kj-rating-sm gap-1", star: "w-4 h-4", text: "text-xs" },
  md: { wrapper: "kj-rating-md gap-1.5", star: "w-5 h-5", text: "text-sm" },
  lg: { wrapper: "kj-rating-lg gap-2", star: "w-6 h-6", text: "text-base" },
  xl: { wrapper: "kj-rating-xl gap-2.5", star: "w-8 h-8", text: "text-lg" },
};

function roundToPrecision(value: number, precision: number): number {
  const inv = 1 / precision;
  return Math.round(value * inv) / inv;
}

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value: controlledValue,
      defaultValue = 0,
      max = 5,
      precision = 1,
      size = "md",
      color = "#f59e0b",
      emptyColor = "#e5e7eb",
      allowClear = true,
      disabled = false,
      readOnly = false,
      hoverPreview = false,
      showValue = false,
      showCount = false,
      count,
      name,
      onChange,
      className,
      onKeyDown,
      onMouseLeave,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = React.useState<number>(
      controlledValue ?? defaultValue
    );
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);
    const instanceId = React.useId();

    React.useEffect(() => {
      if (isControlled) {
        setInternalValue(controlledValue);
      }
    }, [isControlled, controlledValue]);

    const currentValue = isControlled ? controlledValue : internalValue;
    const displayValue =
      hoverPreview && hoverValue !== null ? hoverValue : currentValue;

    const handleValueChange = (newValue: number) => {
      if (disabled || readOnly) return;
      const clamped = Math.max(0, Math.min(max, roundToPrecision(newValue, precision)));
      if (!isControlled) {
        setInternalValue(clamped);
      }
      onChange?.(clamped);
    };

    const handleStarClick = (targetValue: number) => {
      if (disabled || readOnly) return;
      let nextValue = targetValue;
      if (allowClear && targetValue === currentValue) {
        nextValue = 0;
      }
      handleValueChange(nextValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled || readOnly) {
        onKeyDown?.(e);
        return;
      }

      let nextVal: number | null = null;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          nextVal = Math.min(max, currentValue + precision);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          nextVal = Math.max(0, currentValue - precision);
          break;
        case "Home":
          nextVal = 0;
          break;
        case "End":
          nextVal = max;
          break;
      }

      if (nextVal !== null) {
        e.preventDefault();
        handleValueChange(nextVal);
      }

      onKeyDown?.(e);
    };

    const handleContainerMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (hoverPreview) {
        setHoverValue(null);
      }
      onMouseLeave?.(e);
    };

    const sizing = sizeClasses[size] || sizeClasses.md;

    return (
      <div
        ref={ref}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuenow={displayValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        onMouseLeave={handleContainerMouseLeave}
        className={cn(
          "inline-flex items-center select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md",
          disabled && "opacity-50 cursor-not-allowed",
          readOnly && "cursor-default",
          !disabled && !readOnly && "cursor-pointer",
          sizing.wrapper,
          className
        )}
        {...props}
      >
        {name && <input type="hidden" name={name} value={currentValue} />}

        <div className="inline-flex items-center gap-0.5">
          {Array.from({ length: max }, (_, index) => {
            const starIndex = index + 1;
            const fillFraction = Math.max(
              0,
              Math.min(1, displayValue - index)
            );
            const gradientId = `rating-grad-${instanceId}-${index}-${Math.round(
              fillFraction * 100
            )}`;

            return (
              <button
                key={index}
                type="button"
                tabIndex={-1}
                data-testid="rating-star"
                aria-label={`${starIndex} of ${max} stars`}
                disabled={disabled}
                onClick={() => handleStarClick(starIndex)}
                onMouseEnter={() => {
                  if (hoverPreview && !disabled && !readOnly) {
                    setHoverValue(starIndex);
                  }
                }}
                className={cn(
                  "p-0.5 focus:outline-none transition-transform active:scale-95 disabled:scale-100",
                  sizing.star
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {fillFraction > 0 && fillFraction < 1 && (
                    <defs>
                      <linearGradient
                        id={gradientId}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset={`${fillFraction * 100}%`} stopColor={color} />
                        <stop
                          offset={`${fillFraction * 100}%`}
                          stopColor={emptyColor}
                        />
                      </linearGradient>
                    </defs>
                  )}
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={
                      fillFraction === 1
                        ? color
                        : fillFraction === 0
                        ? emptyColor
                        : `url(#${gradientId})`
                    }
                    stroke="none"
                  />
                </svg>
              </button>
            );
          })}
        </div>

        {showValue && (
          <span className={cn("font-medium text-foreground ml-1.5", sizing.text)}>
            {displayValue}
          </span>
        )}

        {showCount && count !== undefined && (
          <span
            className={cn(
              "text-muted-foreground ml-1",
              sizing.text
            )}
          >
            ({count})
          </span>
        )}
      </div>
    );
  }
);

Rating.displayName = "Rating";
