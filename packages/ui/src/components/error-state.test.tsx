import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  describe("rendering basics", () => {
    it("renders default title, message, and danger icon when only message is provided", () => {
      render(
        <ErrorState
          message="Nie udało się załadować danych."
          data-testid="error-state"
        />
      );

      const root = screen.getByTestId("error-state");
      expect(root.tagName).toBe("DIV");
      expect(root).toHaveClass(
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "text-center",
        "p-8",
        "border",
        "border-danger/25",
        "rounded-kj-lg",
        "bg-danger-surface/20",
        "min-h-[300px]"
      );

      // Default title
      const title = screen.getByRole("heading", { level: 3, name: "Wystąpił błąd" });
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("text-base", "font-bold", "text-foreground", "mb-1");

      // Message
      const message = screen.getByText("Nie udało się załadować danych.");
      expect(message.tagName).toBe("P");
      expect(message).toHaveClass(
        "text-sm",
        "text-muted-foreground",
        "max-w-sm",
        "mb-6",
        "leading-relaxed"
      );

      // Danger icon badge container
      const iconWrapper = root.querySelector(".rounded-full.bg-danger-surface");
      expect(iconWrapper).toBeInTheDocument();
      expect(iconWrapper).toHaveClass(
        "h-12",
        "w-12",
        "border",
        "border-danger/30",
        "text-danger"
      );

      // No retry button by default
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders custom title when provided", () => {
      render(
        <ErrorState
          title="Błąd serwera"
          message="Serwer tymczasowo niedostępny."
        />
      );

      const title = screen.getByRole("heading", { level: 3, name: "Błąd serwera" });
      expect(title).toBeInTheDocument();
      expect(screen.queryByText("Wystąpił błąd")).not.toBeInTheDocument();
    });

    it("merges custom className onto container", () => {
      render(
        <ErrorState
          message="Error message"
          className="custom-error-class shadow-sm"
          data-testid="error-state"
        />
      );
      const root = screen.getByTestId("error-state");

      expect(root).toHaveClass("custom-error-class", "shadow-sm", "min-h-[300px]");
    });

    it("forwards ref to HTMLDivElement", () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <ErrorState
          ref={ref}
          message="Error message"
          data-testid="error-state-ref"
        />
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toBe(screen.getByTestId("error-state-ref"));
    });

    it("passes standard HTML attributes", () => {
      render(
        <ErrorState
          message="Critical error"
          role="alert"
          aria-live="assertive"
          data-testid="error-state"
        />
      );
      const root = screen.getByTestId("error-state");

      expect(root).toHaveAttribute("role", "alert");
      expect(root).toHaveAttribute("aria-live", "assertive");
    });

    it("has the correct displayName", () => {
      expect(ErrorState.displayName).toBe("ErrorState");
    });
  });

  describe("retry action", () => {
    it("renders default retry button when onRetry is provided", () => {
      const handleRetry = vi.fn();
      render(
        <ErrorState
          message="Brak połączenia z siecią."
          onRetry={handleRetry}
        />
      );

      const button = screen.getByRole("button", { name: "Spróbuj ponownie" });
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it("renders custom retryLabel when provided", () => {
      const handleRetry = vi.fn();
      render(
        <ErrorState
          title="Connection Timed Out"
          message="Failed to contact auth service."
          onRetry={handleRetry}
          retryLabel="Retry Connection"
        />
      );

      const button = screen.getByRole("button", { name: "Retry Connection" });
      expect(button).toBeInTheDocument();
      expect(screen.queryByText("Spróbuj ponownie")).not.toBeInTheDocument();

      fireEvent.click(button);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });
});
