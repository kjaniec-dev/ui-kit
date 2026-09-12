import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "./confirm-dialog";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("ConfirmDialog", () => {
  it("renders open dialog with title, description, and default button labels", () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Delete Item");
    expect(dialog).toHaveAccessibleDescription("Are you sure you want to delete this item?");

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("renders custom confirmLabel and cancelLabel", () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Discard Draft"
        description="Unsaved changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
      />
    );

    expect(screen.getByRole("button", { name: "Keep Editing" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Discard" })).toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", () => {
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onClose={onClose}
        onConfirm={() => {}}
        title="Delete Item"
        description="Are you sure?"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when Confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Delete Item"
        description="Are you sure?"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  describe("tones", () => {
    it("renders primary button variant for tone='primary' (default)", () => {
      render(
        <ConfirmDialog
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Save Changes"
          description="Save all pending changes?"
          tone="primary"
        />
      );

      const confirmButton = screen.getByRole("button", { name: "Confirm" });
      expect(confirmButton.className).toContain("bg-primary");
      expect(confirmButton.className).toContain("text-primary-foreground");
    });

    it("renders danger button variant for tone='danger'", () => {
      render(
        <ConfirmDialog
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Delete Project"
          description="This action cannot be undone."
          tone="danger"
        />
      );

      const confirmButton = screen.getByRole("button", { name: "Confirm" });
      expect(confirmButton.className).toContain("bg-danger");
      expect(confirmButton.className).toContain("text-white");
    });

    it("renders secondary button variant for tone='success'", () => {
      render(
        <ConfirmDialog
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Publish Release"
          description="Ready to publish?"
          tone="success"
        />
      );

      const confirmButton = screen.getByRole("button", { name: "Confirm" });
      expect(confirmButton.className).toContain("bg-secondary");
      expect(confirmButton.className).toContain("text-secondary-foreground");
    });
  });

  describe("loading state", () => {
    it("disables Cancel button, sets loading on Confirm button, and hides close button", () => {
      render(
        <ConfirmDialog
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Deleting"
          description="Please wait..."
          loading={true}
        />
      );

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      expect(cancelButton).toBeDisabled();

      const confirmButton = screen.getByRole("button", { name: "Confirm" });
      expect(confirmButton).toBeDisabled();
      expect(confirmButton).toHaveAttribute("aria-busy", "true");

      expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    });

    it("prevents clicking Confirm or Cancel when loading is true", () => {
      const onClose = vi.fn();
      const onConfirm = vi.fn();

      render(
        <ConfirmDialog
          open={true}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Processing"
          description="Please wait..."
          loading={true}
        />
      );

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      const confirmButton = screen.getByRole("button", { name: "Confirm" });

      fireEvent.click(cancelButton);
      fireEvent.click(confirmButton);

      expect(onClose).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe("closing interactions", () => {
    it("calls onClose when the built-in close button is clicked", () => {
      const onClose = vi.fn();
      render(
        <ConfirmDialog
          open={true}
          onClose={onClose}
          onConfirm={() => {}}
          title="Title"
          description="Desc"
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when pressing Escape", () => {
      const onClose = vi.fn();
      render(
        <ConfirmDialog
          open={true}
          onClose={onClose}
          onConfirm={() => {}}
          title="Title"
          description="Desc"
        />
      );

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when clicking the backdrop", () => {
      const onClose = vi.fn();
      render(
        <ConfirmDialog
          open={true}
          onClose={onClose}
          onConfirm={() => {}}
          title="Title"
          description="Desc"
        />
      );

      const backdrop = screen.getByRole("dialog").parentElement!;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when clicking inside the dialog panel", () => {
      const onClose = vi.fn();
      render(
        <ConfirmDialog
          open={true}
          onClose={onClose}
          onConfirm={() => {}}
          title="Title"
          description="Desc"
        />
      );

      fireEvent.click(screen.getByRole("dialog"));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it("renders closed dialog with hidden backdrop when open=false", () => {
    render(
      <ConfirmDialog
        open={false}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Hidden Dialog"
        description="Not visible"
      />
    );

    const backdrop = screen.getByRole("dialog").parentElement!;
    expect(backdrop.className).toContain("opacity-0");
    expect(backdrop.className).toContain("pointer-events-none");
  });
});
