"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { Dropzone } from "./dropzone";
import { Progress } from "./progress";
import { FormField } from "./form-field";
import {
  formatBytes,
  generateId,
  validateFiles,
  type UploadItem,
  type UploadStatus,
  type FileRejection,
} from "./file-upload-internals";

export type { UploadItem, UploadStatus, FileRejection };

export interface FileUploadProps {
  value?: UploadItem[];
  defaultValue?: UploadItem[];
  onChange?: (items: UploadItem[]) => void;
  /** Called with files rejected by validation on a given drop/selection. */
  onReject?: (rejections: FileRejection[]) => void;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  /** Visual error state (danger border + aria-invalid on the dropzone). */
  error?: boolean;
  /** aria-required on the dropzone. */
  required?: boolean;
  className?: string;
  id?: string;
  "aria-describedby"?: string;
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export const FileUpload = React.forwardRef<HTMLButtonElement, FileUploadProps>(
  function FileUpload(
    {
      value,
      defaultValue,
      onChange,
      onReject,
      accept,
      maxSize,
      maxFiles,
      multiple = true,
      disabled = false,
      error = false,
      required = false,
      className,
      id,
      "aria-describedby": describedBy,
    },
    ref
  ) {
    const controlled = value !== undefined;
    const [internalItems, setInternalItems] = React.useState<UploadItem[]>(defaultValue ?? []);
    const items = controlled ? (value as UploadItem[]) : internalItems;

    const commit = (next: UploadItem[]) => {
      if (!controlled) setInternalItems(next);
      onChange?.(next);
    };

    const handleFiles = (files: File[]) => {
      const { accepted, rejected } = validateFiles(files, {
        accept,
        maxSize,
        maxFiles,
        existingCount: items.length,
        multiple,
      });
      if (rejected.length > 0) onReject?.(rejected);
      if (accepted.length === 0) return;
      const newItems: UploadItem[] = accepted.map((file) => ({
        id: generateId(),
        file,
        status: "pending",
      }));
      commit(multiple ? [...items, ...newItems] : newItems.slice(0, 1));
    };

    const removeItem = (itemId: string) => {
      commit(items.filter((it) => it.id !== itemId));
    };

    return (
      <div className={cn("w-full flex flex-col gap-3", className)}>
        <Dropzone
          ref={ref}
          onFiles={handleFiles}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error || undefined}
          aria-required={required || undefined}
        />
        {items.length > 0 && (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-kj-md border border-border bg-surface px-3 py-2"
              >
                <FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-foreground">{item.file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(item.file.size)}</span>
                  </div>
                  {item.status === "uploading" && item.progress != null && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress value={item.progress} className="h-1.5" />
                      <span className="shrink-0 text-xs text-muted-foreground">{Math.round(item.progress)}%</span>
                    </div>
                  )}
                  {item.status === "success" && (
                    <span className="mt-0.5 block text-xs text-success">Uploaded</span>
                  )}
                  {item.status === "error" && (
                    <span className="mt-0.5 block text-xs text-danger">{item.error ?? "Upload failed"}</span>
                  )}
                </div>
                {!disabled && (
                  <button
                    type="button"
                    aria-label={`Remove ${item.file.name}`}
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 rounded-kj-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
FileUpload.displayName = "FileUpload";

export interface FileUploadFieldProps extends Omit<FileUploadProps, "error"> {
  label: string;
  hint?: string;
  error?: string;
}

export const FileUploadField = React.forwardRef<HTMLButtonElement, FileUploadFieldProps>(
  function FileUploadField({ label, hint, error, required, className, ...props }, ref) {
    return (
      <FormField label={label} hint={hint} error={error} required={required} className={className}>
        <FileUpload ref={ref} error={!!error} {...props} />
      </FormField>
    );
  }
);
FileUploadField.displayName = "FileUploadField";
