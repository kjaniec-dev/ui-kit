import * as React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ToastProvider, useToast, type ToastOptions } from "./toast";

afterEach(() => {
  vi.useRealTimers();
});

function ConsumerComponent({
  onReady,
}: {
  onReady?: (toast: (opts: ToastOptions) => void) => void;
}) {
  const { toast } = useToast();
  React.useEffect(() => {
    onReady?.(toast);
  }, [toast, onReady]);

  return (
    <div>
      <button onClick={() => toast({ message: "Default toast" })}>Show Default</button>
      <button onClick={() => toast({ message: "Success toast", tone: "success" })}>
        Show Success
      </button>
      <button onClick={() => toast({ message: "Danger toast", tone: "danger" })}>
        Show Danger
      </button>
      <button onClick={() => toast({ message: "Sticky toast", duration: 0 })}>Show Sticky</button>
    </div>
  );
}

describe("Toast", () => {
  describe("useToast outside provider", () => {
    it("throws an error when useToast is used outside <ToastProvider>", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      try {
        expect(() => render(<ConsumerComponent />)).toThrow(
          "useToast must be used within <ToastProvider>"
        );
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe("rendering and tones", () => {
    it("renders children within ToastProvider", () => {
      render(
        <ToastProvider>
          <div>App Content</div>
        </ToastProvider>
      );
      expect(screen.getByText("App Content")).toBeInTheDocument();
    });

    it("displays a toast with default tone and primary border", () => {
      render(
        <ToastProvider>
          <ConsumerComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByRole("button", { name: "Show Default" }));
      const toastEl = screen.getByRole("status");
      expect(toastEl).toBeInTheDocument();
      expect(toastEl).toHaveTextContent("Default toast");
      expect(toastEl.className).toContain("border-l-primary");
      expect(toastEl.className).toContain("animate-[kjtoastin_.25s_ease]");
    });

    it("displays a success toast with success border", () => {
      render(
        <ToastProvider>
          <ConsumerComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByRole("button", { name: "Show Success" }));
      const toastEl = screen.getByRole("status");
      expect(toastEl).toBeInTheDocument();
      expect(toastEl).toHaveTextContent("Success toast");
      expect(toastEl.className).toContain("border-l-success");
    });

    it("displays a danger toast with danger border", () => {
      render(
        <ToastProvider>
          <ConsumerComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByRole("button", { name: "Show Danger" }));
      const toastEl = screen.getByRole("status");
      expect(toastEl).toBeInTheDocument();
      expect(toastEl).toHaveTextContent("Danger toast");
      expect(toastEl.className).toContain("border-l-danger");
    });

    it("renders rich ReactNode content in toast message", () => {
      let toastFn: (opts: ToastOptions) => void = () => {};
      render(
        <ToastProvider>
          <ConsumerComponent onReady={(fn) => (toastFn = fn)} />
        </ToastProvider>
      );

      act(() => {
        toastFn({
          message: (
            <span data-testid="rich-message">
              File uploaded <strong>successfully</strong>
            </span>
          ),
        });
      });

      expect(screen.getByTestId("rich-message")).toBeInTheDocument();
      expect(screen.getByText("successfully")).toBeInTheDocument();
    });
  });

  describe("manual dismissal", () => {
    it("dismisses toast when clicking the dismiss notification button", () => {
      vi.useFakeTimers();
      render(
        <ToastProvider>
          <ConsumerComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByRole("button", { name: "Show Default" }));
      const toastEl = screen.getByRole("status");
      expect(toastEl).toBeInTheDocument();

      const dismissBtn = screen.getByRole("button", { name: "Dismiss notification" });
      fireEvent.click(dismissBtn);

      // Immediately marks toast as leaving
      expect(toastEl.className).toContain("animate-[kjtoastout_.25s_ease_forwards]");

      // After 250ms removal delay, removed from DOM
      act(() => {
        vi.advanceTimersByTime(250);
      });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  describe("auto-dismiss timers", () => {
    it("auto-dismisses after default 3200ms plus 250ms animation", () => {
      vi.useFakeTimers();
      render(
        <ToastProvider>
          <ConsumerComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByRole("button", { name: "Show Default" }));
      const toastEl = screen.getByRole("status");
      expect(toastEl).toBeInTheDocument();

      // Before 3200ms, still visible and not leaving
      act(() => {
        vi.advanceTimersByTime(3100);
      });
      expect(toastEl.className).not.toContain("animate-[kjtoastout");
      expect(toastEl).toBeInTheDocument();

      // At 3200ms, begins leaving
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(toastEl.className).toContain("animate-[kjtoastout_.25s_ease_forwards]");

      // After 250ms exit animation, removed completely
      act(() => {
        vi.advanceTimersByTime(250);
      });
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("auto-dismisses after custom duration", () => {
      vi.useFakeTimers();
      let toastFn: (opts: ToastOptions) => void = () => {};
      render(
        <ToastProvider>
          <ConsumerComponent onReady={(fn) => (toastFn = fn)} />
        </ToastProvider>
      );

      act(() => {
        toastFn({ message: "Quick toast", duration: 1000 });
      });

      expect(screen.getByText("Quick toast")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole("status").className).toContain("animate-[kjtoastout");

      act(() => {
        vi.advanceTimersByTime(250);
      });
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("does not auto-dismiss when duration is 0", () => {
      vi.useFakeTimers();
      render(
        <ToastProvider>
          <ConsumerComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByRole("button", { name: "Show Sticky" }));
      expect(screen.getByText("Sticky toast")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      const toastEl = screen.getByRole("status");
      expect(toastEl).toBeInTheDocument();
      expect(toastEl.className).not.toContain("animate-[kjtoastout");
    });
  });

  describe("multiple toasts stacking", () => {
    it("renders multiple toasts and dismisses each independently", () => {
      vi.useFakeTimers();
      render(
        <ToastProvider>
          <ConsumerComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByRole("button", { name: "Show Default" }));
      fireEvent.click(screen.getByRole("button", { name: "Show Success" }));
      fireEvent.click(screen.getByRole("button", { name: "Show Danger" }));

      const toasts = screen.getAllByRole("status");
      expect(toasts).toHaveLength(3);
      expect(screen.getByText("Default toast")).toBeInTheDocument();
      expect(screen.getByText("Success toast")).toBeInTheDocument();
      expect(screen.getByText("Danger toast")).toBeInTheDocument();

      // Dismiss second toast (Success)
      const dismissButtons = screen.getAllByRole("button", { name: "Dismiss notification" });
      fireEvent.click(dismissButtons[1]);

      act(() => {
        vi.advanceTimersByTime(250);
      });

      expect(screen.queryByText("Success toast")).not.toBeInTheDocument();
      expect(screen.getByText("Default toast")).toBeInTheDocument();
      expect(screen.getByText("Danger toast")).toBeInTheDocument();
    });
  });
});
