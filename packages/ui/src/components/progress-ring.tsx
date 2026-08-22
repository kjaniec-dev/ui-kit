"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { FormField } from "./form-field";

export type ProgressRingSize = "sm" | "md" | "lg" | "xl";
export type ProgressRingTone = "primary" | "secondary" | "success" | "warning" | "danger" | "info";

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress value. Defaults to 0. */
  value?: number;
  /** Minimum progress value. Defaults to 0. */
  min?: number;
  /** Maximum progress value. Defaults to 100. */
  max?: number;
  /** Preset size of the ring. Defaults to "md". */
  size?: ProgressRingSize;
  /** Override stroke thickness (in px). */
  strokeWidth?: number;
  /** Color tone of the progress indicator. Defaults to "primary". */
  tone?: ProgressRingTone;
  /** Whether to show the percentage text inside the ring center if no children are provided. Defaults to false. */
  showValue?: boolean;
  /** Optional formatter for the center percentage display. */
  formatValue?: (value: number, percentage: number) => React.ReactNode;
  /** Additional CSS class for the background track circle. */
  trackClassName?: string;
  /** Additional CSS class for the progress indicator circle. */
  indicatorClassName?: string;
  /** Custom center content. */
  children?: React.ReactNode;
}

const sizeDimensions: Record<ProgressRingSize, number> = {
  sm: 36,
  md: 64,
  lg: 96,
  xl: 128,
};

const defaultStrokeWidths: Record<ProgressRingSize, number> = {
  sm: 3.5,
  md: 6,
  lg: 8,
  xl: 10,
};

const textSizeClasses: Record<ProgressRingSize, string> = {
  sm: "text-[0.65rem] font-semibold leading-none",
  md: "text-xs font-semibold leading-none",
  lg: "text-base font-bold leading-none",
  xl: "text-xl font-bold leading-none",
};

const toneClasses: Record<ProgressRingTone, string> = {
  primary: "text-primary stroke-current",
  secondary: "text-secondary stroke-current",
  success: "text-success stroke-current",
  warning: "text-warning stroke-current",
  danger: "text-danger stroke-current",
  info: "text-info stroke-current",
};

export const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      className,
      style,
      value = 0,
      min = 0,
      max = 100,
      size = "md",
      strokeWidth,
      tone = "primary",
      showValue = false,
      formatValue,
      trackClassName,
      indicatorClassName,
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const range = max > min ? max - min : 100;
    const clampedValue = Math.max(min, Math.min(max, value));
    const percentage = Math.max(0, Math.min(100, ((clampedValue - min) / range) * 100));

    const dimension = sizeDimensions[size];
    const strokeWidthVal = strokeWidth ?? defaultStrokeWidths[size];
    const radius = Math.max(0, (dimension - strokeWidthVal) / 2);
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const computedAriaLabel = ariaLabel ?? (props["aria-labelledby"] ? undefined : "Progress");

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={computedAriaLabel}
        aria-valuenow={clampedValue}
        aria-valuemin={min}
        aria-valuemax={max}
        className={cn("relative inline-flex items-center justify-center shrink-0", className)}
        style={{ width: dimension, height: dimension, ...style }}
        {...props}
      >
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="-rotate-90 transform"
        >
          {/* Background track circle */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            strokeWidth={strokeWidthVal}
            className={cn("stroke-muted/30 fill-none", trackClassName)}
          />
          {/* Progress indicator circle */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            strokeWidth={strokeWidthVal}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap={percentage === 0 ? "butt" : "round"}
            className={cn(
              "fill-none transition-[stroke-dashoffset,opacity] duration-500 ease-in-out",
              percentage === 0 && "opacity-0",
              toneClasses[tone],
              indicatorClassName
            )}
          />
        </svg>

        {(children || showValue) && (
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center text-center text-foreground p-1",
              textSizeClasses[size]
            )}
          >
            {children ??
              (formatValue
                ? formatValue(clampedValue, Math.round(percentage))
                : `${Math.round(percentage)}%`)}
          </div>
        )}
      </div>
    );
  }
);
ProgressRing.displayName = "ProgressRing";

export interface ProgressRingFieldProps extends ProgressRingProps {
  /** Field label text. */
  label: string;
  /** Helper hint text displayed beneath the control. */
  hint?: string;
  /** Error message displayed beneath the control. */
  error?: string;
  /** Renders a required indicator (*). */
  required?: boolean;
  /** Class name for the outer field wrapper div. */
  fieldClassName?: string;
}

export const ProgressRingField = React.forwardRef<HTMLDivElement, ProgressRingFieldProps>(
  ({ label, hint, error, required, fieldClassName, ...ringProps }, ref) => {
    return (
      <FormField
        label={label}
        hint={hint}
        error={error}
        required={required}
        className={fieldClassName}
      >
        <ProgressRing ref={ref} aria-label={ringProps["aria-label"] ?? label} {...ringProps} />
      </FormField>
    );
  }
);
ProgressRingField.displayName = "ProgressRingField";
