import { Badge, Button, Card, cn, ToastProvider, useToast } from "@kjaniec-dev/ui";
import * as React from "react";

// sRGB to OKLCH color space converter
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const expanded =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(expanded, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function hexToOklch(hex: string): string {
  try {
    const [r, g, b] = hexToRgb(hex);
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);
    const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
    const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
    const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);

    const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
    const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

    const C = Math.sqrt(a * a + b_ * b_);
    let H = (Math.atan2(b_, a) * 180) / Math.PI;
    if (H < 0) H += 360;
    return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${H.toFixed(1)})`;
  } catch {
    return "oklch(—)";
  }
}

interface ColorTokenStep {
  step: string;
  hex: string;
  cssVar: string;
  tailwind: string;
}

const AMBER_SCALE: ColorTokenStep[] = [
  { step: "50", hex: "#fffbeb", cssVar: "--kj-primary-50", tailwind: "bg-primary-50" },
  { step: "100", hex: "#fef3c7", cssVar: "--kj-primary-100", tailwind: "bg-primary-100" },
  { step: "200", hex: "#fde68a", cssVar: "--kj-primary-200", tailwind: "bg-primary-200" },
  { step: "300", hex: "#fcd34d", cssVar: "--kj-primary-300", tailwind: "bg-primary-300" },
  { step: "400", hex: "#fbbf24", cssVar: "--kj-primary-400", tailwind: "bg-primary-400" },
  { step: "500", hex: "#f59e0b", cssVar: "--kj-primary-500", tailwind: "bg-primary-500" },
  { step: "600", hex: "#d97706", cssVar: "--kj-primary-600", tailwind: "bg-primary-600" },
  { step: "700", hex: "#b45309", cssVar: "--kj-primary-700", tailwind: "bg-primary-700" },
  { step: "800", hex: "#92400e", cssVar: "--kj-primary-800", tailwind: "bg-primary-800" },
  { step: "900", hex: "#78350f", cssVar: "--kj-primary-900", tailwind: "bg-primary-900" },
  { step: "950", hex: "#451a03", cssVar: "--kj-primary-950", tailwind: "bg-primary-950" },
];

const TEAL_SCALE: ColorTokenStep[] = [
  { step: "50", hex: "#f0fdfa", cssVar: "--kj-secondary-50", tailwind: "bg-secondary-50" },
  { step: "100", hex: "#ccfbf1", cssVar: "--kj-secondary-100", tailwind: "bg-secondary-100" },
  { step: "200", hex: "#99f6e4", cssVar: "--kj-secondary-200", tailwind: "bg-secondary-200" },
  { step: "300", hex: "#5eead4", cssVar: "--kj-secondary-300", tailwind: "bg-secondary-300" },
  { step: "400", hex: "#2dd4bf", cssVar: "--kj-secondary-400", tailwind: "bg-secondary-400" },
  { step: "500", hex: "#14b8a6", cssVar: "--kj-secondary-500", tailwind: "bg-secondary-500" },
  { step: "600", hex: "#0d9488", cssVar: "--kj-secondary-600", tailwind: "bg-secondary-600" },
  { step: "700", hex: "#0f766e", cssVar: "--kj-secondary-700", tailwind: "bg-secondary-700" },
  { step: "800", hex: "#115e59", cssVar: "--kj-secondary-800", tailwind: "bg-secondary-800" },
  { step: "900", hex: "#134e4a", cssVar: "--kj-secondary-900", tailwind: "bg-secondary-900" },
  { step: "950", hex: "#042f2e", cssVar: "--kj-secondary-950", tailwind: "bg-secondary-950" },
];

const ZINC_SCALE: ColorTokenStep[] = [
  { step: "50", hex: "#fafafa", cssVar: "--kj-zinc-50", tailwind: "bg-zinc-50" },
  { step: "100", hex: "#f4f4f5", cssVar: "--kj-zinc-100", tailwind: "bg-zinc-100" },
  { step: "200", hex: "#e4e4e7", cssVar: "--kj-zinc-200", tailwind: "bg-zinc-200" },
  { step: "300", hex: "#d4d4d8", cssVar: "--kj-zinc-300", tailwind: "bg-zinc-300" },
  { step: "400", hex: "#a1a1aa", cssVar: "--kj-zinc-400", tailwind: "bg-zinc-400" },
  { step: "500", hex: "#71717a", cssVar: "--kj-zinc-500", tailwind: "bg-zinc-500" },
  { step: "600", hex: "#52525b", cssVar: "--kj-zinc-600", tailwind: "bg-zinc-600" },
  { step: "700", hex: "#3f3f46", cssVar: "--kj-zinc-700", tailwind: "bg-zinc-700" },
  { step: "800", hex: "#27272a", cssVar: "--kj-zinc-800", tailwind: "bg-zinc-800" },
  { step: "900", hex: "#18181b", cssVar: "--kj-zinc-900", tailwind: "bg-zinc-900" },
  { step: "950", hex: "#09090b", cssVar: "--kj-zinc-950", tailwind: "bg-zinc-950" },
];

interface SemanticToken {
  name: string;
  role: string;
  description: string;
  cssVar: string;
  tailwind: string;
  lightHex: string;
  darkHex: string;
}

const SEMANTIC_TOKENS: SemanticToken[] = [
  {
    name: "Surface",
    role: "Surface",
    description: "Card backgrounds, flyouts, and elevated container planes",
    cssVar: "--kj-surface",
    tailwind: "bg-surface",
    lightHex: "#ffffff",
    darkHex: "#171719",
  },
  {
    name: "Muted",
    role: "Muted",
    description: "Subtle backings, inactive items, and table header rows",
    cssVar: "--kj-muted",
    tailwind: "bg-muted",
    lightHex: "#f5f5f4",
    darkHex: "#202023",
  },
  {
    name: "Border",
    role: "Border",
    description: "Structural divider boundaries and component outlines",
    cssVar: "--kj-border",
    tailwind: "border-border",
    lightHex: "#e7e5e4",
    darkHex: "#2d2d31",
  },
  {
    name: "Success",
    role: "Success",
    description: "Affirmative states, positive balances, and verified checks",
    cssVar: "--kj-success",
    tailwind: "bg-success",
    lightHex: "#047857",
    darkHex: "#34d399",
  },
  {
    name: "Destructive",
    role: "Destructive",
    description: "Destructive actions, error badges, and critical failures",
    cssVar: "--kj-danger",
    tailwind: "bg-danger",
    lightHex: "#be123c",
    darkHex: "#fb7185",
  },
  {
    name: "Info",
    role: "Info",
    description: "Informational advisories, notice badges, and help guides",
    cssVar: "--kj-info",
    tailwind: "bg-info",
    lightHex: "#0369a1",
    darkHex: "#38bdf8",
  },
  {
    name: "Warning",
    role: "Warning",
    description: "Attention prompts, pending review queues, and alert notes",
    cssVar: "--kj-warning",
    tailwind: "bg-warning",
    lightHex: "#a84f08",
    darkHex: "#f5b82e",
  },
];

interface RadiusToken {
  name: string;
  cssVar: string;
  value: string;
  cssClass: string;
  description: string;
}

const RADIUS_TOKENS: RadiusToken[] = [
  {
    name: "rounded-kj-sm",
    cssVar: "--kj-radius-sm",
    value: "0.5rem (8px)",
    cssClass: "rounded-kj-sm",
    description: "Tags, pills, small buttons, and compact controls",
  },
  {
    name: "rounded-kj-md",
    cssVar: "--kj-radius-md",
    value: "0.75rem (12px)",
    cssClass: "rounded-kj-md",
    description: "Default standard for buttons, inputs, selects, and dropdowns",
  },
  {
    name: "rounded-kj-lg",
    cssVar: "--kj-radius-lg",
    value: "1rem (16px)",
    cssClass: "rounded-kj-lg",
    description: "Cards, modals, flyout drawers, and structured containers",
  },
  {
    name: "rounded-kj-full",
    cssVar: "--kj-radius-full",
    value: "9999px",
    cssClass: "rounded-kj-full",
    description: "Avatars, rounded badges, indicator dots, and circular pills",
  },
];

interface ShadowToken {
  name: string;
  cssVar: string;
  value: string;
  cssClass: string;
  description: string;
}

const SHADOW_TOKENS: ShadowToken[] = [
  {
    name: "shadow-kj-sm",
    cssVar: "--kj-shadow-sm",
    value: "0 1px 3px rgb(15 23 42 / 0.08), 0 1px 2px rgb(15 23 42 / 0.04)",
    cssClass: "shadow-kj-sm",
    description: "Subtle resting depth for cards and standard layout blocks",
  },
  {
    name: "shadow-kj-md",
    cssVar: "--kj-shadow-md",
    value: "0 8px 30px rgb(15 23 42 / 0.08)",
    cssClass: "shadow-kj-md",
    description: "Floating context menus, dropdowns, and active tooltips",
  },
  {
    name: "shadow-kj-lg",
    cssVar: "--kj-shadow-lg",
    value: "0 20px 60px rgb(15 23 42 / 0.12)",
    cssClass: "shadow-kj-lg",
    description: "Modal dialogs, command palettes, and slide-in drawers",
  },
  {
    name: "shadow-kj-glow",
    cssVar: "--kj-shadow-glow",
    value: "0 0 0 1px rgb(245 158 11 / 0.16), 0 16px 48px rgb(245 158 11 / 0.18)",
    cssClass: "shadow-kj-glow",
    description: "Primary brand luminescence and focus state accentuation",
  },
];

const TYPOGRAPHY_WEIGHTS = [
  { name: "Regular (400)", weightClass: "font-normal", value: "400" },
  { name: "Medium (500)", weightClass: "font-medium", value: "500" },
  { name: "Semibold (600)", weightClass: "font-semibold", value: "600" },
  { name: "Bold (700)", weightClass: "font-bold", value: "700" },
];

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ColorSwatchCard({
  testId,
  title,
  hex,
  cssVar,
  tailwind,
  isCopied,
  onCopy,
}: {
  testId?: string;
  title: string;
  hex: string;
  cssVar: string;
  tailwind: string;
  isCopied: boolean;
  onCopy: (value: string, label: string) => void;
}) {
  const oklch = React.useMemo(() => hexToOklch(hex), [hex]);

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={() => onCopy(cssVar, title)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-kj-md border border-border bg-surface text-left transition-all duration-150 select-none cursor-pointer p-0 font-sans",
        "hover:border-primary/60 hover:shadow-kj-sm focus:outline-none focus:ring-2 focus:ring-primary/40",
        isCopied && "border-primary ring-2 ring-primary/30"
      )}
    >
      {/* Color Preview Block */}
      <div
        className="relative h-20 w-full border-b border-border/60 transition-transform group-hover:scale-[1.02]"
        style={{ backgroundColor: hex }}
      >
        {isCopied && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] text-white text-xs font-semibold gap-1.5 animate-in fade-in">
            <CheckIcon className="w-4 h-4 text-emerald-300" />
            <span>Copied!</span>
          </div>
        )}
      </div>

      {/* Meta details */}
      <div className="flex flex-col p-3 gap-1 text-xs w-full">
        <div className="flex items-center justify-between gap-1">
          <span className="font-semibold text-foreground text-sm tracking-tight">{title}</span>
          <span className="font-mono text-[0.7rem] text-muted-foreground uppercase">{hex}</span>
        </div>

        <div className="font-mono text-[0.68rem] text-primary truncate font-medium" title={oklch}>
          {oklch}
        </div>

        <div className="mt-1 pt-1.5 border-t border-border/50 flex flex-col gap-0.5 font-mono text-[0.68rem] text-muted-foreground">
          <div className="truncate text-foreground/80 font-medium" title={cssVar}>
            {cssVar}
          </div>
          <div className="truncate text-muted-foreground" title={tailwind}>
            {tailwind}
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between text-[0.65rem] text-muted-foreground pt-1">
          <span className="group-hover:text-primary transition-colors flex items-center gap-1">
            {isCopied ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckIcon /> Copied!
              </span>
            ) : (
              <>
                <CopyIcon /> Click to copy
              </>
            )}
          </span>
        </div>
      </div>
    </button>
  );
}

function TokensContent() {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const timerRef = React.useRef<number | undefined>(undefined);

  const handleCopy = React.useCallback(
    (value: string, label: string) => {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopiedKey(value);
            toast({
              message: `Copied ${label} (${value}) to clipboard`,
              tone: "success",
            });
            if (timerRef.current) {
              window.clearTimeout(timerRef.current);
            }
            timerRef.current = window.setTimeout(() => {
              setCopiedKey(null);
            }, 2000);
          })
          .catch(() => {});
      }
    },
    [toast]
  );

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-[1040px] mx-auto px-6 max-[820px]:px-4 py-10 flex flex-col gap-14">
      {/* Header Section */}
      <header className="flex flex-col gap-4 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary" dot>
            KJ Product Kit &middot; Tokens
          </Badge>
          <Badge variant="neutral">OKLCH Palette</Badge>
          <Badge variant="neutral">Tailwind 4 @theme</Badge>
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground m-0">
            KJ Product Kit Design Tokens
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-[70ch] leading-relaxed">
            Visual design system inspector reading token values across OKLCH perceptual color ramps,
            semantic contextual roles, corner curvature geometry, elevation shadows, and typography.
          </p>
        </div>

        {/* Quick jump navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <a
            href="#colors-primary"
            className="text-xs font-medium text-muted-foreground hover:text-primary px-2.5 py-1 rounded-kj-sm bg-muted/50 hover:bg-muted transition-colors no-underline"
          >
            Amber Scale
          </a>
          <a
            href="#colors-secondary"
            className="text-xs font-medium text-muted-foreground hover:text-primary px-2.5 py-1 rounded-kj-sm bg-muted/50 hover:bg-muted transition-colors no-underline"
          >
            Teal Scale
          </a>
          <a
            href="#colors-zinc"
            className="text-xs font-medium text-muted-foreground hover:text-primary px-2.5 py-1 rounded-kj-sm bg-muted/50 hover:bg-muted transition-colors no-underline"
          >
            Zinc Scale
          </a>
          <a
            href="#semantic-tokens"
            className="text-xs font-medium text-muted-foreground hover:text-primary px-2.5 py-1 rounded-kj-sm bg-muted/50 hover:bg-muted transition-colors no-underline"
          >
            Semantic Roles
          </a>
          <a
            href="#radius-scale"
            className="text-xs font-medium text-muted-foreground hover:text-primary px-2.5 py-1 rounded-kj-sm bg-muted/50 hover:bg-muted transition-colors no-underline"
          >
            Curvature
          </a>
          <a
            href="#shadows-scale"
            className="text-xs font-medium text-muted-foreground hover:text-primary px-2.5 py-1 rounded-kj-sm bg-muted/50 hover:bg-muted transition-colors no-underline"
          >
            Depth &amp; Shadows
          </a>
          <a
            href="#typography-ramp"
            className="text-xs font-medium text-muted-foreground hover:text-primary px-2.5 py-1 rounded-kj-sm bg-muted/50 hover:bg-muted transition-colors no-underline"
          >
            Type Hierarchy
          </a>
        </div>
      </header>

      {/* Section 1: Primary Amber Scale */}
      <section id="colors-primary" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground m-0">Primary Amber</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Brand accent and high-priority actions. Perceptually uniform OKLCH progression from
              step 50 to 950.
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">--kj-primary-*</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {AMBER_SCALE.map((token) => (
            <ColorSwatchCard
              key={token.step}
              testId={`swatch-primary-${token.step}`}
              title={`Amber ${token.step}`}
              hex={token.hex}
              cssVar={token.cssVar}
              tailwind={token.tailwind}
              isCopied={copiedKey === token.cssVar}
              onCopy={handleCopy}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Secondary Teal Scale */}
      <section id="colors-secondary" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground m-0">Secondary Teal</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Support accents, secondary CTA buttons, analytics charts, and telemetry markers.
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">--kj-secondary-*</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {TEAL_SCALE.map((token) => (
            <ColorSwatchCard
              key={token.step}
              testId={`swatch-secondary-${token.step}`}
              title={`Teal ${token.step}`}
              hex={token.hex}
              cssVar={token.cssVar}
              tailwind={token.tailwind}
              isCopied={copiedKey === token.cssVar}
              onCopy={handleCopy}
            />
          ))}
        </div>
      </section>

      {/* Section 3: Zinc / Neutrals Scale */}
      <section id="colors-zinc" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground m-0">Zinc / Neutrals</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Foundation scale for typography contrast, page canvas, cards, subtle borders, and
              controls.
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">--kj-zinc-*</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {ZINC_SCALE.map((token) => (
            <ColorSwatchCard
              key={token.step}
              testId={`swatch-zinc-${token.step}`}
              title={`Zinc ${token.step}`}
              hex={token.hex}
              cssVar={token.cssVar}
              tailwind={token.tailwind}
              isCopied={copiedKey === token.cssVar}
              onCopy={handleCopy}
            />
          ))}
        </div>
      </section>

      {/* Section 4: Semantic Tokens */}
      <section id="semantic-tokens" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground m-0">Semantic Tokens</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Theme-adaptive roles that dynamically shift values between light and dark modes.
            </p>
          </div>
          <Badge variant="neutral">Adaptive Dark Mode</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEMANTIC_TOKENS.map((token) => {
            const isCopied = copiedKey === token.cssVar;
            const lightOklch = hexToOklch(token.lightHex);
            const darkOklch = hexToOklch(token.darkHex);

            return (
              <Card
                key={token.name}
                className={cn(
                  "flex flex-col p-4 gap-3.5 transition-all duration-150 border-border",
                  isCopied && "border-primary ring-2 ring-primary/20"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-foreground m-0">{token.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {token.description}
                    </p>
                  </div>
                  <span className="font-mono text-[0.65rem] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    Token
                  </span>
                </div>

                {/* Dual Color Swatch Bars (Light & Dark) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col gap-1">
                    <div className="text-[0.68rem] font-medium text-muted-foreground">Light</div>
                    <div
                      className="h-10 rounded-kj-sm border border-border shadow-inner"
                      style={{ backgroundColor: token.lightHex }}
                    />
                    <span className="font-mono text-[0.68rem] text-muted-foreground">
                      {token.lightHex}
                    </span>
                    <span
                      className="font-mono text-[0.62rem] text-primary truncate"
                      title={lightOklch}
                    >
                      {lightOklch}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-[0.68rem] font-medium text-muted-foreground">Dark</div>
                    <div
                      className="h-10 rounded-kj-sm border border-border shadow-inner"
                      style={{ backgroundColor: token.darkHex }}
                    />
                    <span className="font-mono text-[0.68rem] text-muted-foreground">
                      {token.darkHex}
                    </span>
                    <span
                      className="font-mono text-[0.62rem] text-primary truncate"
                      title={darkOklch}
                    >
                      {darkOklch}
                    </span>
                  </div>
                </div>

                {/* Metadata & Copy trigger */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                  <div className="flex flex-col text-[0.7rem] text-foreground/80">
                    <span className="font-semibold text-primary">{token.cssVar}</span>
                    <span className="text-muted-foreground text-[0.65rem]">{token.tailwind}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => handleCopy(token.cssVar, token.name)}
                  >
                    {isCopied ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckIcon /> Copied!
                      </span>
                    ) : (
                      <>
                        <CopyIcon /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Section 5: Border Radius Scale */}
      <section id="radius-scale" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground m-0">Border Radius</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Systematic curvature tokens scaling from micro-interactions to pill tags.
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">--kj-radius-*</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RADIUS_TOKENS.map((token) => {
            const isCopied = copiedKey === token.name;

            return (
              <Card
                key={token.name}
                className={cn(
                  "p-4 flex flex-col items-center text-center gap-3 border-border transition-all",
                  isCopied && "border-primary ring-2 ring-primary/20"
                )}
              >
                {/* Visual Curvature Box */}
                <div
                  className={cn(
                    "w-20 h-20 bg-primary/15 border-2 border-primary/40 grid place-items-center transition-transform hover:scale-105",
                    token.cssClass
                  )}
                >
                  <span className="font-mono text-[0.7rem] font-bold text-primary">
                    {token.name.replace("rounded-kj-", "")}
                  </span>
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <div className="font-bold text-sm font-mono text-foreground">{token.name}</div>
                  <div className="text-xs font-mono text-primary font-medium">{token.value}</div>
                  <div className="text-[0.68rem] font-mono text-muted-foreground">
                    {token.cssVar}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-balance">
                    {token.description}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-auto h-7 text-xs gap-1"
                  onClick={() => handleCopy(token.name, token.name)}
                >
                  {isCopied ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckIcon /> Copied!
                    </span>
                  ) : (
                    <>
                      <CopyIcon /> Copy Class
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Section 6: Elevation & Shadows Scale */}
      <section id="shadows-scale" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground m-0">Elevation & Shadows</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Multi-stop ambient light and key shadow layers defining hierarchy and interactive
              depth.
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">--kj-shadow-*</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SHADOW_TOKENS.map((token) => {
            const isCopied = copiedKey === token.name;

            return (
              <Card
                key={token.name}
                className={cn(
                  "p-4 flex flex-col items-center text-center gap-3 border-border transition-all",
                  isCopied && "border-primary ring-2 ring-primary/20"
                )}
              >
                {/* Visual Shadow Box */}
                <div className="py-2">
                  <div
                    className={cn(
                      "w-24 h-16 rounded-kj-md bg-surface border border-border/80 grid place-items-center transition-transform hover:-translate-y-1",
                      token.cssClass
                    )}
                  >
                    <span className="font-mono text-xs font-bold text-foreground">
                      {token.name.replace("shadow-kj-", "")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <div className="font-bold text-sm font-mono text-foreground">{token.name}</div>
                  <div className="text-[0.68rem] font-mono text-muted-foreground">
                    {token.cssVar}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-balance">
                    {token.description}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-auto h-7 text-xs gap-1"
                  onClick={() => handleCopy(token.name, token.name)}
                >
                  {isCopied ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckIcon /> Copied!
                    </span>
                  ) : (
                    <>
                      <CopyIcon /> Copy Class
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Section 7: Typography Ramp */}
      <section id="typography-ramp" className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground m-0">Typography Ramp</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Primary interface typeface and developer monospace stack with balanced font weights
              and proportional size ramps.
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">--kj-font-*</span>
        </div>

        {/* Font Families & Weights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* UI Font Card */}
          <Card className="p-5 flex flex-col gap-4 border-border">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground m-0">UI Font (Inter)</h3>
                <span className="font-mono text-xs text-muted-foreground">var(--kj-font-sans)</span>
              </div>
              <Badge variant="primary">Primary UI</Badge>
            </div>

            <div className="flex flex-col gap-3 font-sans">
              {TYPOGRAPHY_WEIGHTS.map((w) => (
                <div
                  key={w.name}
                  className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-2 rounded-kj-sm hover:bg-muted/40 transition-colors"
                >
                  <span className="text-xs text-muted-foreground font-mono w-32">{w.name}</span>
                  <span className={cn("text-base text-foreground flex-1", w.weightClass)}>
                    The quick brown fox jumps over the lazy dog.
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Code Font Card */}
          <Card className="p-5 flex flex-col gap-4 border-border">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground m-0">
                  Code Font (JetBrains Mono)
                </h3>
                <span className="font-mono text-xs text-muted-foreground">var(--kj-font-mono)</span>
              </div>
              <Badge variant="neutral">Monospace</Badge>
            </div>

            <div className="flex flex-col gap-3 font-mono">
              {TYPOGRAPHY_WEIGHTS.map((w) => (
                <div
                  key={w.name}
                  className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-2 rounded-kj-sm hover:bg-muted/40 transition-colors"
                >
                  <span className="text-xs text-muted-foreground font-mono w-32">{w.name}</span>
                  <span className={cn("text-sm text-foreground flex-1", w.weightClass)}>
                    const kit = new KJProductKit();
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Size Scale Preview */}
        <Card className="p-5 flex flex-col gap-4 border-border">
          <h3 className="text-base font-bold text-foreground m-0">Type Scale Hierarchy</h3>
          <div className="flex flex-col divide-y divide-border/60">
            <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground w-28">
                text-4xl (2.25rem)
              </span>
              <span className="text-4xl font-extrabold text-foreground tracking-tight">
                Hero Display Headline
              </span>
            </div>
            <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground w-28">
                text-3xl (1.875rem)
              </span>
              <span className="text-3xl font-bold text-foreground tracking-tight">
                Section Level 1 Heading
              </span>
            </div>
            <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground w-28">
                text-2xl (1.5rem)
              </span>
              <span className="text-2xl font-bold text-foreground">Card & Modal Title Heading</span>
            </div>
            <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground w-28">
                text-xl (1.25rem)
              </span>
              <span className="text-xl font-semibold text-foreground">
                Subsection & Module Heading
              </span>
            </div>
            <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground w-28">
                text-base (1.0rem)
              </span>
              <span className="text-base text-foreground">
                Body text default for descriptions, tables, and long-form content.
              </span>
            </div>
            <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground w-28">
                text-sm (0.875rem)
              </span>
              <span className="text-sm text-muted-foreground">
                Secondary supporting text, form hints, and table cell meta descriptions.
              </span>
            </div>
            <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground w-28">
                text-xs (0.75rem)
              </span>
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                Timestamp labels, tags, badge caps, and microcopy
              </span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

export function TokensView(): React.JSX.Element {
  return (
    <ToastProvider>
      <TokensContent />
    </ToastProvider>
  );
}
