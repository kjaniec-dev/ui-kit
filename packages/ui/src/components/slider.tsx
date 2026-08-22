"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export type SliderProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Range slider styled with the kit's primary token. Thumb styling lives in a
 * scoped <style> tag because pseudo-elements (::-webkit-slider-thumb) can't be
 * expressed as Tailwind utilities.
 */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, style, value, defaultValue, min = 0, max = 100, onChange, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState<number>(Number(defaultValue ?? value ?? 50));
    const isControlled = value !== undefined;
    const currentVal = isControlled ? Number(value) : localValue;

    const numMin = Number(min);
    const numMax = Number(max);
    const percentage = Math.min(
      100,
      Math.max(0, ((currentVal - numMin) / (numMax - numMin)) * 100)
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setLocalValue(Number(e.target.value));
      }
      onChange?.(e);
    };

    return (
      <input
        ref={ref}
        type="range"
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        onChange={handleChange}
        style={{
          background: `linear-gradient(to right, var(--kj-primary) ${percentage}%, var(--kj-border, rgba(120, 120, 128, 0.2)) ${percentage}%)`,
          ...style,
        }}
        className={cn(
          "kj-slider w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary",
          className
        )}
        {...props}
      />
    );
  }
);
Slider.displayName = "Slider";

/** Inject once near the app root (or rely on the package stylesheet). */
export const sliderThumbCSS = `
.kj-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:9999px;background:var(--kj-primary);border:3px solid var(--kj-surface);box-shadow:var(--kj-shadow-sm);cursor:pointer}
.kj-slider::-moz-range-thumb{width:18px;height:18px;border-radius:9999px;background:var(--kj-primary);border:3px solid var(--kj-surface);box-shadow:var(--kj-shadow-sm);cursor:pointer}
`;
