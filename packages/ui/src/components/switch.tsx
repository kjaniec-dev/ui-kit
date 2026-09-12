"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, checked, defaultChecked, onChange, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = React.useState(Boolean(defaultChecked));
    const isChecked = isControlled ? Boolean(checked) : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex items-center gap-2.5 cursor-pointer text-sm select-none",
          className
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          aria-checked={isChecked}
          checked={isControlled ? checked : undefined}
          defaultChecked={!isControlled ? defaultChecked : undefined}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <span className="relative h-[1.45rem] w-[2.6rem] shrink-0 rounded-full bg-input transition-colors duration-200 peer-checked:bg-primary peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/35 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-[calc(1.45rem-4px)] after:w-[calc(1.45rem-4px)] after:rounded-full after:bg-white after:shadow-kj-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-[1.15rem]" />
        {label}
      </label>
    );
  }
);
Switch.displayName = "Switch";
