"use client";

import * as React from "react";
import { cn } from "../lib/cn";

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

