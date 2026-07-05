import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [getAbsolutePath("@storybook/addon-a11y"), getAbsolutePath("@storybook/addon-docs")],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  core: { disableTelemetry: true },

  // Tailwind v4 is a Vite plugin — register it so utility classes are generated.
  viteFinal: async (config) => {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    config.plugins = config.plugins ?? [];
    config.plugins.push(tailwindcss());
    return config;
  }
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
