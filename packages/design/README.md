# @kjaniec-dev/design

Design tokens, theme configuration, and Tailwind CSS `@theme` bridge for the **KJ Product Kit**.

This package serves as the **source of truth** for all visual properties (colors, typography, spacing, border radii, shadows) used across the component library and any consumer applications.

---

## 1. How it Works

The design tokens are defined in a structured JSON schema and compiled into CSS assets for consumption:

*   **`tokens.json` (Source of Truth):** Contains token values for layout variables, light theme colors, dark theme colors, border radii, and box shadows.
*   **`build-tokens.js` (Compiler):** A build script that parses the tokens JSON and generates:
    *   `src/theme.css`: Declares raw CSS custom properties (`--kj-*`). It maps variables under the `:root` pseudo-class and overrides them for the `.dark` selector (automatic dark mode).
    *   `src/tailwind.css`: Contains Tailwind CSS `@theme` mapping directives, hooking the token values directly into the Tailwind v4 compilation pipeline.

---

## 2. Compile Tokens

To rebuild the theme stylesheets after modifying `tokens.json`, run:

```bash
npm run build
```

*Note: The compile step runs automatically inside the `prepublishOnly` hook before publishing the package to npm.*

---

## 3. Usage in Applications

### Installation
Install the design tokens package alongside the companion React components library:

```bash
npm install @kjaniec-dev/design @kjaniec-dev/ui
```

### Stylesheet Setup
Import the Tailwind theme bridge at the top of your global CSS stylesheet (Vite, Next.js, etc.):

```css
@import "tailwindcss";
@import "@kjaniec-dev/design/tailwind.css";
@import "@kjaniec-dev/ui/ui.css";
```

Once imported, you can use any of the design kit theme mappings natively in your HTML or component class lists (e.g., `bg-primary`, `text-primary-foreground`, `rounded-kj-md`, `shadow-kj-sm`).

---

## 4. Theme Configuration

Colors and typography variables are declared semantically:
*   **Primary/Secondary/Success/Warning/Danger/Info:** Brand colors with automated hover and surface variants.
*   **Canvas & Surface:** Background tokens used for page layouts and card/panel elements.
*   **Border & Ring:** Layout boundary and focus indicator styles.

### Dark Mode
Dark mode is activated simply by adding the `.dark` class to an ancestor container (e.g. `<html>` or `<body>`):

```html
<html class="dark">
  <body class="bg-canvas text-foreground">
    <!-- Everything here automatically switches to dark-theme tokens -->
  </body>
</html>
```
