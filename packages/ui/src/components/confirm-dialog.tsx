import { Modal, ModalTitle, ModalDescription, ModalActions } from "./modal";
import { Button } from "./button";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary" | "success";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  loading = false,
}: ConfirmDialogProps) {
  const toneButtonVariant = {
    danger: "danger" as const,
    primary: "primary" as const,
    success: "secondary" as const, // standard secondary in our system is teal (success-aligned)
  }[tone];

  return (
    <Modal open={open} onClose={onClose} width={400} showClose={!loading}>
      <ModalTitle>{title}</ModalTitle>
      <ModalDescription>{description}</ModalDescription>
      <ModalActions>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={toneButtonVariant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </ModalActions>
    </Modal>
  );
}
ConfirmDialog.displayName = "ConfirmDialog";
