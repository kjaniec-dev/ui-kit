# KJ Product Kit

Personal design system for KJ apps, portfolio, dashboards and SaaS tools.

## Visual language

- **Modern SaaS / developer-first:** Premium, restrained, and purposeful.
- **Warm neutral base:** `#FAFAF9` in Light mode (warm zinc/stone nuance) and `#0C0C0D` in Dark mode for deep, eye-friendly elevation layering without harsh black holes.
- **Amber / Honey-gold primary accent:** `#A84F08` (Light) and `#F5B82E` (Dark) for warm, focused CTAs and active states.
- **Teal / Alpine-mint secondary accent:** `#0F746D` (Light) and `#38C6B7` (Dark) for secondary highlights and interactive accents.
- **Accessible Status Palette (WCAG AA):** Light mode uses rich 700-level text tokens (`#047857` Success, `#A84F08` Warning, `#BE123C` Danger, `#0369A1` Info) guaranteeing >= 4.5:1 contrast on surface tints.
- **Form Accessibility:** Dedicated `--kj-control-border` / `--color-control-border` token (`#A1A1AA` Light / `#3F3F46` Dark) meeting WCAG 1.4.11 (>= 3:1 non-text contrast) for inputs, selects, and checkboxes.
- **Categorical Data Visualization (Charts):** 6 distinct chart colors (`chart1` through `chart6`) decoupled from brand action tokens.
- **Subtle borders over heavy shadows:** Crisp, clean structural boundaries with rounded-xl / rounded-2xl cards.

## Color Palette Reference

| Token / Role | Light | Dark | Purpose |
| :--- | :--- | :--- | :--- |
| `background` | `#FAFAF9` | `#0C0C0D` | Canvas / page background |
| `surface` / `card` | `#FFFFFF` | `#171719` | Cards, panels, elevated sections |
| `bgElevated` | `#FFFFFF` | `#202023` | Popovers, dropdowns, modals |
| `foreground` | `#18181B` | `#F5F5F4` | Primary high-contrast text |
| `mutedForeground` | `#5F5F68` | `#A7A7B0` | Secondary and helper text |
| `border` | `#E7E5E4` | `#2D2D31` | Cards and structural dividers |
| `controlBorder` | `#A1A1AA` | `#3F3F46` | Form inputs, checkboxes, toggles (WCAG 1.4.11) |
| `primary` | `#A84F08` | `#F5B82E` | Primary buttons, active tabs, focus rings |
| `secondary` | `#0F746D` | `#38C6B7` | Secondary badges, accents, interactive links |
| `success` | `#047857` | `#34D399` | Success badges, alerts, positive metrics |
| `warning` | `#A84F08` | `#F5B82E` | Warning badges, alerts, caution indicators |
| `danger` | `#BE123C` | `#FB7185` | Error states, destructive buttons, alerts |
| `info` | `#0369A1` | `#38BDF8` | Informational messages, tips |

### Chart Palette (Data Visualization)

- `chart1`: Amber (`#A84F08` Light / `#F5B82E` Dark)
- `chart2`: Teal (`#0F746D` Light / `#38C6B7` Dark)
- `chart3`: Sky (`#0284C7` Light / `#38BDF8` Dark)
- `chart4`: Violet (`#7C3AED` Light / `#A78BFA` Dark)
- `chart5`: Rose (`#E11D48` Light / `#FB7185` Dark)
- `chart6`: Lime (`#65A30D` Light / `#A3E635` Dark)

## Agent rules

When implementing UI:

- Use KJ tokens and CSS variables (`--kj-*` or Tailwind `--color-*`).
- Use amber for primary CTAs and active states.
- Use teal for secondary highlights and supporting interactive accents.
- Use `--kj-control-border` or `border-control-border` for inputs and interactive form controls.
- Prefer rounded-xl / rounded-2xl cards.
- Use subtle borders over heavy shadows.
- Keep whitespace generous.
- Avoid loud gradients except in hero sections.
- All UI should work seamlessly in both light and dark mode.
- Do not introduce a new UI library unless explicitly requested.
