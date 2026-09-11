import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useHashRoute } from "./use-hash-route";

describe("useHashRoute", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  it("defaults to overview tab when hash is empty", () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.tab).toBe("overview");
    expect(result.current.subRoute).toBe("");
  });

  it("parses hash with tab and subRoute", () => {
    window.location.hash = "#components/buttons";
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.tab).toBe("components");
    expect(result.current.subRoute).toBe("buttons");
  });

  it("updates state on navigate", () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      result.current.navigate("mcp");
    });
    expect(window.location.hash).toBe("#mcp");
    expect(result.current.tab).toBe("mcp");
  });

  it("navigates with subRoute", () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      result.current.navigate("components", "card");
    });
    expect(window.location.hash).toBe("#components/card");
    expect(result.current.tab).toBe("components");
    expect(result.current.subRoute).toBe("card");
  });

  it("handles legacy anchors by routing to components tab", () => {
    window.location.hash = "#buttons";
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.tab).toBe("components");
    expect(result.current.subRoute).toBe("buttons");
  });

  it("responds to hashchange events", () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.tab).toBe("overview");

    act(() => {
      window.location.hash = "#tokens";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(result.current.tab).toBe("tokens");
  });
});
