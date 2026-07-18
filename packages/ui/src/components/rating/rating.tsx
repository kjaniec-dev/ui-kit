"use client";

import * as React from "react";
import { cn } from "../../lib/cn";

export type RatingSize = "sm" | "md" | "lg" | "xl";
export type RatingIconType = "star" | "heart" | "flame" | "shield" | "thumb";

export interface RatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number;
  defaultValue?: number;
  max?: number;
  precision?: number;
  size?: RatingSize;
  icon?: RatingIconType | React.ComponentType<{ className?: string }>;
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
  onHoverChange?: (value: number | null) => void;
}

const sizeClasses: Record<RatingSize, { wrapper: string; star: string; text: string }> = {
  sm: { wrapper: "kj-rating-sm gap-1", star: "w-4 h-4", text: "text-xs" },
  md: { wrapper: "kj-rating-md gap-1.5", star: "w-5 h-5", text: "text-sm" },
  lg: { wrapper: "kj-rating-lg gap-2", star: "w-6 h-6", text: "text-base" },
  xl: { wrapper: "kj-rating-xl gap-2.5", star: "w-8 h-8", text: "text-lg" },
};

const iconPaths: Record<RatingIconType, string> = {
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  heart: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  flame: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  shield: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
  thumb: "M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
};

function roundToPrecision(value: number, precision: number): number {
  const inv = 1 / precision;
  return Math.round(value * inv) / inv;
}

function isCssColor(str: string): boolean {
  return str.startsWith("#") || str.startsWith("rgb") || str.startsWith("hsl");
}

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value: controlledValue,
      defaultValue = 0,
      max = 5,
      precision = 1,
      size = "md",
      icon = "star",
      color = "#f59e0b",
      emptyColor = "#e5e7eb",
      allowClear = true,
      disabled = false,
      readOnly = false,
      hoverPreview = true,
      showValue = false,
      showCount = false,
      count,
      name,
      onChange,
      onHoverChange,
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

    const getEventValue = (
      e: React.MouseEvent<HTMLButtonElement>,
      starIndex: number
    ): number => {
      const target = e.currentTarget;
      const width = target.offsetWidth;
      const nativeEv = e.nativeEvent as any;
      const offsetX =
        nativeEv?.offsetX ?? nativeEv?.nativeEvent?.offsetX ?? (e as any).offsetX;

      if (width > 0 && offsetX !== undefined && offsetX !== null) {
        const ratio = Math.max(0.001, Math.min(1, offsetX / width));
        const stepInStar = Math.ceil(ratio / precision) * precision;
        return Math.min(max, Math.max(precision, starIndex - 1 + stepInStar));
      }
      return starIndex;
    };

    const handleStarClick = (
      e: React.MouseEvent<HTMLButtonElement>,
      starIndex: number
    ) => {
      if (disabled || readOnly) return;
      const targetValue = getEventValue(e, starIndex);
      let nextValue = targetValue;
      if (allowClear && targetValue === currentValue) {
        nextValue = 0;
      }
      handleValueChange(nextValue);
    };

    const handleStarMouseMove = (
      e: React.MouseEvent<HTMLButtonElement>,
      starIndex: number
    ) => {
      if (disabled || readOnly) return;
      if (hoverPreview) {
        const hoveredVal = getEventValue(e, starIndex);
        setHoverValue(hoveredVal);
        onHoverChange?.(hoveredVal);
      }
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
        onHoverChange?.(null);
      }
      onMouseLeave?.(e);
    };

    const sizing = sizeClasses[size] || sizeClasses.md;

    return (
      <div
        ref={ref}
        role={readOnly ? "img" : "radiogroup"}
        tabIndex={disabled || readOnly ? -1 : 0}
        aria-valuenow={displayValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        aria-label={
          ariaLabel || (readOnly ? `Rated ${displayValue} out of ${max}` : "Rating")
        }
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

            const CustomIconComponent =
              typeof icon === "function" || typeof icon === "object"
                ? (icon as React.ComponentType<{ className?: string }>)
                : null;
            const builtInIconType =
              typeof icon === "string" ? icon : "star";
            const pathD = iconPaths[builtInIconType] || iconPaths.star;

            return (
              <button
                key={index}
                type="button"
                tabIndex={-1}
                data-testid="rating-star"
                role={readOnly ? undefined : "radio"}
                aria-checked={readOnly ? undefined : displayValue >= starIndex}
                aria-label={`${starIndex} of ${max} stars`}
                disabled={disabled}
                onClick={(e) => handleStarClick(e, starIndex)}
                onMouseMove={(e) => handleStarMouseMove(e, starIndex)}
                onMouseEnter={(e) => handleStarMouseMove(e, starIndex)}
                className={cn(
                  "p-0.5 focus:outline-none transition-transform active:scale-95 disabled:scale-100",
                  sizing.star
                )}
              >
                {CustomIconComponent ? (
                  <CustomIconComponent
                    className={cn(
                      "w-full h-full",
                      fillFraction >= 0.5
                        ? !isCssColor(color) && color
                        : !isCssColor(emptyColor) && emptyColor
                    )}
                  />
                ) : (
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
                          {isCssColor(color) ? (
                            <stop
                              offset={`${fillFraction * 100}%`}
                              stopColor={color}
                            />
                          ) : (
                            <stop
                              offset={`${fillFraction * 100}%`}
                              stopColor="currentColor"
                              className={color}
                            />
                          )}
                          {isCssColor(emptyColor) ? (
                            <stop
                              offset={`${fillFraction * 100}%`}
                              stopColor={emptyColor}
                            />
                          ) : (
                            <stop
                              offset={`${fillFraction * 100}%`}
                              stopColor="currentColor"
                              className={emptyColor}
                            />
                          )}
                        </linearGradient>
                      </defs>
                    )}
                    <path
                      d={pathD}
                      fill={
                        fillFraction === 1
                          ? isCssColor(color)
                            ? color
                            : undefined
                          : fillFraction === 0
                          ? isCssColor(emptyColor)
                            ? emptyColor
                            : undefined
                          : `url(#${gradientId})`
                      }
                      className={
                        fillFraction === 1
                          ? !isCssColor(color)
                            ? color
                            : undefined
                          : fillFraction === 0
                          ? !isCssColor(emptyColor)
                            ? emptyColor
                            : undefined
                          : undefined
                      }
                      stroke="none"
                    />
                  </svg>
                )}
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
          <span className={cn("text-muted-foreground ml-1", sizing.text)}>
            ({count})
          </span>
        )}
      </div>
    );
  }
);

Rating.displayName = "Rating";
