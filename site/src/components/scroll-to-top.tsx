import * as React from "react";

export interface ScrollToTopProps {
  /** Scroll offset in pixels before showing button. Defaults to 400. */
  threshold?: number;
}

export function ScrollToTop({ threshold = 400 }: ScrollToTopProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setVisible(scrollY > threshold);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      data-testid="scroll-to-top-btn"
      className="fixed bottom-20 min-[821px]:bottom-6 right-5 min-[821px]:right-6 z-20 h-10 w-10 rounded-full bg-surface/95 backdrop-blur-md border border-border shadow-kj-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
