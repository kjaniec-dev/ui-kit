const fs = require("fs");
const path = require("path");

const tokensPath = path.join(__dirname, "tokens.json");
const themeCssPath = path.join(__dirname, "src", "theme.css");
const tailwindCssPath = path.join(__dirname, "src", "tailwind.css");

// Read and parse tokens.json
const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf8"));

// Utility to convert camelCase to kebab-case
function toKebabCase(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}

// Generate CSS Custom Properties
let themeLines = [];
themeLines.push(":root {");
themeLines.push("  color-scheme: light;");

// 1. Semantic Light Colors
const lightColors = tokens.color.semantic.light;
Object.entries(lightColors).forEach(([key, val]) => {
  themeLines.push(`  --kj-${toKebabCase(key)}: ${val.$value};`);
});

// 2. Primary (amber) scale mapping
const amberScale = tokens.color.primitive.amber;
themeLines.push("  /* Primary (amber) scale */");
Object.entries(amberScale).forEach(([weight, val]) => {
  themeLines.push(`  --kj-primary-${weight}: ${val.$value};`);
});

// 3. Secondary (teal) scale mapping
const tealScale = tokens.color.primitive.teal;
themeLines.push("  /* Secondary (teal) scale */");
Object.entries(tealScale).forEach(([weight, val]) => {
  themeLines.push(`  --kj-secondary-${weight}: ${val.$value};`);
});

// 4. Typography Fonts
const fonts = tokens.typography.font;
Object.entries(fonts).forEach(([key, val]) => {
  themeLines.push(`  --kj-font-${toKebabCase(key)}: ${val.$value};`);
});

// 5. Border Radius
const radius = tokens.radius;
Object.entries(radius).forEach(([key, val]) => {
  themeLines.push(`  --kj-radius-${toKebabCase(key)}: ${val.$value};`);
});

// 6. Shadows
const shadow = tokens.shadow;
Object.entries(shadow).forEach(([key, val]) => {
  themeLines.push(`  --kj-shadow-${toKebabCase(key)}: ${val.$value};`);
});

// 7. Density scale
const density = tokens.density;
Object.entries(density).forEach(([key, val]) => {
  themeLines.push(`  --kj-density-${key}: ${val.$value};`);
});
themeLines.push(`  --kj-density: var(--kj-density-default);`);

// 8. Motion tokens
const motion = tokens.motion;
Object.entries(motion.duration).forEach(([key, val]) => {
  themeLines.push(`  --kj-duration-${key}: ${val.$value};`);
});
Object.entries(motion.ease).forEach(([key, val]) => {
  themeLines.push(`  --kj-ease-${key}: ${val.$value};`);
});

themeLines.push("}");
themeLines.push("");

themeLines.push('[data-density="compact"] {');
themeLines.push("  --kj-density: var(--kj-density-compact);");
themeLines.push("}");
themeLines.push('[data-density="comfortable"] {');
themeLines.push("  --kj-density: var(--kj-density-comfortable);");
themeLines.push("}");
themeLines.push("");

// 7. Semantic Dark Colors
themeLines.push(".dark {");
themeLines.push("  color-scheme: dark;");
const darkColors = tokens.color.semantic.dark;
Object.entries(darkColors).forEach(([key, val]) => {
  themeLines.push(`  --kj-${toKebabCase(key)}: ${val.$value};`);
});
themeLines.push("}");
themeLines.push("");

// Add static helper styles
themeLines.push(`html {
  background: var(--kj-background);
  color: var(--kj-foreground);
  font-family: var(--kj-font-sans);
}

.kj-card {
  background: var(--kj-card);
  color: var(--kj-card-foreground);
  border: 1px solid var(--kj-border);
  border-radius: var(--kj-radius-2xl);
  box-shadow: var(--kj-shadow-sm);
}`);

// Write theme.css
fs.writeFileSync(themeCssPath, themeLines.join("\n") + "\n", "utf8");
console.log("Generated src/theme.css");

// Generate tailwind.css
let tailwindLines = [];
tailwindLines.push('@import "./theme.css";');
tailwindLines.push("");
tailwindLines.push("@theme {");

// Map tailwind variables
// Semantic colors
Object.keys(lightColors).forEach((key) => {
  let kebab = toKebabCase(key);
  if (kebab === "bg-surface") {
    // Keep bg-surface as-is to avoid duplicate/conflict with color-surface
  } else if (kebab.startsWith("bg-")) {
    kebab = kebab.substring(3);
  }
  tailwindLines.push(`  --color-${kebab}: var(--kj-${toKebabCase(key)});`);
});

// Primary scale
Object.keys(amberScale).forEach((weight) => {
  tailwindLines.push(`  --color-primary-${weight}: var(--kj-primary-${weight});`);
});

// Secondary scale
Object.keys(tealScale).forEach((weight) => {
  tailwindLines.push(`  --color-secondary-${weight}: var(--kj-secondary-${weight});`);
});

// Fonts
Object.keys(fonts).forEach((key) => {
  const kebab = toKebabCase(key);
  tailwindLines.push(`  --font-${kebab}: var(--kj-font-${kebab});`);
});

// Radius
Object.keys(radius).forEach((key) => {
  const kebab = toKebabCase(key);
  tailwindLines.push(`  --radius-kj-${kebab}: var(--kj-radius-${kebab});`);
});

// Shadows
Object.keys(shadow).forEach((key) => {
  const kebab = toKebabCase(key);
  tailwindLines.push(`  --shadow-kj-${kebab}: var(--kj-shadow-${kebab});`);
});

// Motion Durations
Object.keys(motion.duration).forEach((key) => {
  tailwindLines.push(`  --animate-duration-${key}: var(--kj-duration-${key});`);
});

// Motion Easing
Object.keys(motion.ease).forEach((key) => {
  tailwindLines.push(`  --animate-ease-${key}: var(--kj-ease-${key});`);
});

tailwindLines.push("}");

// Write tailwind.css
fs.writeFileSync(tailwindCssPath, tailwindLines.join("\n") + "\n", "utf8");
console.log("Generated src/tailwind.css");
