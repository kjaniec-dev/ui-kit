import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useInPostScript } from "./use-inpost-script";

describe("useInPostScript", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  it("injects script and link tags into document head", async () => {
    const { result } = renderHook(() => useInPostScript({ sandbox: false }));

    expect(result.current.isLoaded).toBe(false);

    const scriptTag = document.querySelector('script[src*="sdk-for-javascript.js"]');
    const linkTag = document.querySelector('link[href*="easypack.css"]');

    expect(scriptTag).not.toBeNull();
    expect(linkTag).not.toBeNull();

    // Simulate script load event
    scriptTag?.dispatchEvent(new Event("load"));

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
  });
});
