import "@testing-library/jest-dom/vitest";

// jsdom does not implement scrollIntoView; stub it so components that scroll
// active items into view (e.g. CommandPalette) can render in tests.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
