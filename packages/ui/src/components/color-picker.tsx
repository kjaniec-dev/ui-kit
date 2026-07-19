"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

export const DEFAULT_COLOR_SWATCHES = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#06B6D4", // Sky
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#64748B", // Slate
  "#1E293B", // Charcoal
] as const;

export function isValidHex(hex: string): boolean {
  const trimmed = hex.trim();
  const clean = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(clean);
}

export function normalizeHex(hex: string): string {
  let clean = hex.trim();
  if (!clean.startsWith("#")) clean = `#${clean}`;
  if (/^#[0-9A-Fa-f]{3}$/.test(clean)) {
    clean = `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  return clean.toUpperCase();
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  if (!isValidHex(hex)) return { h: 0, s: 0, l: 0 };
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const normalizedH = ((h % 360) + 360) % 360;
  const sPct = s / 100;
  const lPct = l / 100;

  const c = (1 - Math.abs(2 * lPct - 1)) * sPct;
  const x = c * (1 - Math.abs(((normalizedH / 60) % 2) - 1));
  const m = lPct - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= normalizedH && normalizedH < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= normalizedH && normalizedH < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= normalizedH && normalizedH < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= normalizedH && normalizedH < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= normalizedH && normalizedH < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= normalizedH && normalizedH < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export interface ColorPickerSwatchProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color: string;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ColorPickerSwatch = React.forwardRef<
  HTMLButtonElement,
  ColorPickerSwatchProps
>(({ color, selected = false, size = "md", className, style, ...props }, ref) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      style={{ backgroundColor: color, ...style }}
      className={cn(
        "relative shrink-0 rounded-full border border-border/50 shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center justify-center text-white text-xs font-bold",
        sizeClasses[size],
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
        className
      )}
      {...props}
    >
      {selected && <span aria-hidden="true">✓</span>}
    </button>
  );
});
ColorPickerSwatch.displayName = "ColorPickerSwatch";

export interface ColorPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value" | "defaultValue"> {
  /** Current hex color value (controlled). */
  value?: string;
  /** Initial hex color value (uncontrolled). Defaults to "#3B82F6". */
  defaultValue?: string;
  /** Called when color changes. */
  onChange?: (hex: string) => void;
  /** Array of hex color strings for preset palette. Defaults to DEFAULT_COLOR_SWATCHES. */
  swatches?: readonly string[] | string[];
  /** Whether the picker is disabled. */
  disabled?: boolean;
  /** Whether to show the manual Hex text input inside the popover. Defaults to true. */
  showHexInput?: boolean;
  /** Additional class name for the container. */
  className?: string;
}

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value,
      defaultValue = "#3B82F6",
      onChange,
      swatches = DEFAULT_COLOR_SWATCHES,
      disabled = false,
      showHexInput = true,
      className,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [localColor, setLocalColor] = React.useState<string>(
      normalizeHex(defaultValue)
    );
    const color = isControlled ? normalizeHex(value) : localColor;

    const [hexInputValue, setHexInputValue] = React.useState<string>(color);

    React.useEffect(() => {
      setHexInputValue(color);
    }, [color]);

    const handleColorChange = React.useCallback(
      (newHex: string) => {
        const normalized = normalizeHex(newHex);
        if (!isControlled) {
          setLocalColor(normalized);
        }
        onChange?.(normalized);
      },
      [isControlled, onChange]
    );

    const hsl = React.useMemo(() => hexToHsl(color), [color]);

    const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const h = Number(e.target.value);
      const newHex = hslToHex(h, Math.max(hsl.s, 40), Math.max(hsl.l, 30));
      handleColorChange(newHex);
    };

    const handleHexSubmit = () => {
      if (isValidHex(hexInputValue)) {
        handleColorChange(hexInputValue);
      } else {
        setHexInputValue(color);
      }
    };

    return (
      <div ref={ref} className={cn("inline-block", className)} {...props}>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label={`Select color, current ${color}`}
              className={cn(
                "inline-flex items-center gap-2.5 px-3 py-1.5 rounded-kj-md border border-border bg-surface text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              <span
                style={{ backgroundColor: color }}
                className="w-5 h-5 rounded-full border border-border/50 shadow-sm shrink-0"
              />
              <span className="font-mono text-xs uppercase">{color}</span>
              <svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="text-muted-foreground ml-auto"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-64 p-3.5 space-y-3.5">
            {/* Header Banner */}
            <div className="flex items-center gap-3 p-2 rounded-kj-md bg-muted/40 border border-border">
              <span
                style={{ backgroundColor: color }}
                className="w-8 h-8 rounded-full border border-border/50 shadow-sm shrink-0"
              />
              <div>
                <p className="text-xs text-muted-foreground">Selected Color</p>
                <p className="text-sm font-mono font-bold text-foreground uppercase">{color}</p>
              </div>
            </div>

            {/* Swatches Grid */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">Preset Swatches</p>
              <div className="grid grid-cols-6 gap-2">
                {swatches.map((swatch) => {
                  const normalizedSwatch = normalizeHex(swatch);
                  return (
                    <ColorPickerSwatch
                      key={swatch}
                      color={swatch}
                      selected={normalizedSwatch === color}
                      aria-label={`Select color ${swatch}`}
                      onClick={() => handleColorChange(swatch)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Hue Slider */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">Hue</p>
              <input
                type="range"
                min={0}
                max={360}
                value={hsl.h}
                onChange={handleHueChange}
                aria-label="Hue slider"
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background:
                    "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                }}
              />
            </div>

            {/* Manual Hex Input */}
            {showHexInput && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground">Hex Code</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={hexInputValue}
                    onChange={(e) => setHexInputValue(e.target.value)}
                    onBlur={handleHexSubmit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleHexSubmit();
                    }}
                    placeholder="#000000"
                    className="flex-1 px-2.5 py-1 text-xs font-mono rounded-kj-md border border-border bg-surface text-foreground uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
ColorPicker.displayName = "ColorPicker";


