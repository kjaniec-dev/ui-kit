import * as React from "react";
import { cn } from "../lib/cn";

export type SliderProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Range slider styled with the kit's primary token. Thumb styling lives in a
 * scoped <style> tag because pseudo-elements (::-webkit-slider-thumb) can't be
 * expressed as Tailwind utilities.
 */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      className={cn(
        "kj-slider w-full h-1.5 rounded-full bg-input appearance-none cursor-pointer",
        className
      )}
      {...props}
    />
  )
);
Slider.displayName = "Slider";

/** Inject once near the app root (or rely on the package stylesheet). */
export const sliderThumbCSS = `
.kj-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:9999px;background:var(--kj-primary);border:3px solid var(--kj-surface);box-shadow:var(--kj-shadow-sm);cursor:pointer}
.kj-slider::-moz-range-thumb{width:18px;height:18px;border-radius:9999px;background:var(--kj-primary);border:3px solid var(--kj-surface);box-shadow:var(--kj-shadow-sm);cursor:pointer}
`;
