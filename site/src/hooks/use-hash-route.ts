import * as React from "react";

export type TabKey = "overview" | "components" | "patterns" | "tokens" | "mcp";

export interface HashRoute {
  tab: TabKey;
  subRoute: string;
  navigate: (tab: TabKey, subRoute?: string) => void;
}

const VALID_TABS = new Set<TabKey>(["overview", "components", "patterns", "tokens", "mcp"]);

function parseHash(hash: string): { tab: TabKey; subRoute: string } {
  const clean = hash.replace(/^#\/?/, "").trim();
  if (!clean) return { tab: "overview", subRoute: "" };
  const [first, ...rest] = clean.split("/");
  const subRoute = rest.join("/");
  if (VALID_TABS.has(first as TabKey)) {
    return { tab: first as TabKey, subRoute };
  }
  // Legacy anchors or section anchors like #buttons or #data-table
  return { tab: "components", subRoute: first };
}

export function useHashRoute(): HashRoute {
  const [route, setRoute] = React.useState(() =>
    parseHash(typeof window !== "undefined" ? window.location.hash : "")
  );

  React.useEffect(() => {
    const onHashChange = () => {
      const next = parseHash(window.location.hash);
      setRoute((prev) => (prev.tab === next.tab && prev.subRoute === next.subRoute ? prev : next));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = React.useCallback((tab: TabKey, subRoute?: string) => {
    const newHash = subRoute ? `#${tab}/${subRoute}` : `#${tab}`;
    window.location.hash = newHash;
    const next = parseHash(newHash);
    setRoute((prev) => (prev.tab === next.tab && prev.subRoute === next.subRoute ? prev : next));
  }, []);

  return { tab: route.tab, subRoute: route.subRoute, navigate };
}
