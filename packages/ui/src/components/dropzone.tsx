"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface DropzoneProps {
  onFiles: (files: File[]) => void;
  /** Native picker filter hint. Real enforcement lives in FileUpload's validation. */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  /** Overrides the default drop-region content. */
  children?: React.ReactNode;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean;
}

export const Dropzone = React.forwardRef<HTMLButtonElement, DropzoneProps>(
  function Dropzone(
    {
      onFiles,
      accept,
      multiple = true,
      disabled = false,
      className,
      children,
      id,
      "aria-describedby": describedBy,
      "aria-invalid": ariaInvalid,
      "aria-required": ariaRequired,
    },
    ref
  ) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = React.useState(false);
    // dragenter/dragleave fire as the pointer crosses child elements; count
    // them so the highlight only clears when the pointer truly leaves.
    const dragCounter = React.useRef(0);
    const invalid = ariaInvalid === true || ariaInvalid === "true";

    const openPicker = () => {
      if (!disabled) inputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) onFiles(files);
      // Reset so re-selecting the same file fires change again.
      e.target.value = "";
    };

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      dragCounter.current += 1;
      setDragActive(true);
    };
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setDragActive(false);
      }
    };
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setDragActive(false);
      if (disabled) return;
      const files = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
      if (files.length > 0) onFiles(files);
    };

    return (
      <div className={cn("w-full", className)}>
        <button
          ref={ref}
          type="button"
          id={id}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          data-drag-active={dragActive || undefined}
          onClick={openPicker}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "w-full flex flex-col items-center justify-center gap-2 rounded-kj-md border-2 border-dashed px-6 py-8 text-center text-sm transition-colors",
            "focus:outline-none focus:ring-[3px] focus:ring-ring/30",
            disabled
              ? "border-input bg-muted text-muted-foreground cursor-not-allowed"
              : dragActive
                ? "border-primary bg-primary/5 text-foreground cursor-pointer"
                : invalid
                  ? "border-danger bg-surface text-muted-foreground hover:text-foreground cursor-pointer"
                  : "border-input bg-surface text-muted-foreground hover:border-primary hover:text-foreground cursor-pointer"
          )}
        >
          {children ?? (
            <>
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M7 9l5-5 5 5" />
                <path d="M20 16v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3" />
              </svg>
              <span>
                <span className="font-medium text-foreground">Drag and drop files here</span>, or click to browse
              </span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    );
  }
);
Dropzone.displayName = "Dropzone";
