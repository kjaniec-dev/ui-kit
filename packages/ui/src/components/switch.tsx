import * as React from "react";
import { cn } from "../lib/cn";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return (
      <label htmlFor={inputId} className={cn("inline-flex items-center gap-2.5 cursor-pointer text-sm select-none", className)}>
        <input ref={ref} id={inputId} type="checkbox" role="switch" className="peer sr-only" {...props} />
        <span className="relative h-[1.45rem] w-[2.6rem] shrink-0 rounded-full bg-input transition-colors duration-200 peer-checked:bg-primary peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/35 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-[calc(1.45rem-4px)] after:w-[calc(1.45rem-4px)] after:rounded-full after:bg-white after:shadow-kj-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-[1.15rem]" />
        {label}
      </label>
    );
  }
);
Switch.displayName = "Switch";
