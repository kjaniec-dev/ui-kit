import * as React from "react";
import type { Preview, Decorator } from "@storybook/react-vite";
import "./styles.css";

/** Applies the `.dark` class to the preview root based on the toolbar toggle. */
const WithTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? "light";
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return (
    <div style={{ padding: "2rem", minHeight: "100vh" }}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [WithTheme],
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: {
        order: [
          "Docs",
          "Actions",
          "Status",
          "Forms",
          "Selection",
          "Layout",
          "Navigation",
          "Data",
          "Overlays",
        ],
      },
    },
    backgrounds: { disabled: true },
  },
  globalTypes: {
    theme: {
      description: "Motyw kolorystyczny",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Jasny", icon: "sun" },
          { value: "dark", title: "Ciemny", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
