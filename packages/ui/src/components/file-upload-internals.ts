export type UploadStatus = "pending" | "uploading" | "success" | "error";

export interface UploadItem {
  id: string;
  file: File;
  /** Defaults to "pending" when unset. Drives the row's rendering. */
  status?: UploadStatus;
  /** 0–100. Shown as a Progress bar when status === "uploading". */
  progress?: number;
  /** Shown (danger tone) when status === "error". */
  error?: string;
}

export interface FileRejection {
  file: File;
  reason: "type" | "size" | "count";
}

const KB = 1024;

export function formatBytes(bytes: number): string {
  if (bytes < KB) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / KB;
  let unitIndex = 0;
  while (value >= KB && unitIndex < units.length - 1) {
    value /= KB;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function matchesAccept(file: File, accept?: string): boolean {
  if (!accept || accept.trim() === "") return true;
  const tokens = accept
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  return tokens.some((token) => {
    const t = token.toLowerCase();
    if (t.startsWith(".")) return fileName.endsWith(t);
    if (t.endsWith("/*")) return fileType.startsWith(t.slice(0, -1)); // "image/*" -> "image/"
    return fileType === t;
  });
}

let idCounter = 0;
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  idCounter += 1;
  return `file-${Date.now().toString(36)}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface ValidateOptions {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  existingCount?: number;
  multiple?: boolean;
}

export function validateFiles(
  files: File[],
  { accept, maxSize, maxFiles, existingCount = 0, multiple = true }: ValidateOptions
): { accepted: File[]; rejected: FileRejection[] } {
  const accepted: File[] = [];
  const rejected: FileRejection[] = [];
  // Single mode replaces the list, so existing count doesn't consume capacity.
  const effectiveExisting = multiple ? existingCount : 0;

  for (const file of files) {
    if (!matchesAccept(file, accept)) {
      rejected.push({ file, reason: "type" });
      continue;
    }
    if (maxSize != null && file.size > maxSize) {
      rejected.push({ file, reason: "size" });
      continue;
    }
    if (!multiple) {
      // Single mode: first type/size-valid file wins; the rest overflow.
      if (accepted.length === 0) accepted.push(file);
      else rejected.push({ file, reason: "count" });
      continue;
    }
    const capacity = maxFiles != null ? maxFiles - effectiveExisting - accepted.length : Infinity;
    if (capacity <= 0) {
      rejected.push({ file, reason: "count" });
      continue;
    }
    accepted.push(file);
  }

  return { accepted, rejected };
}
