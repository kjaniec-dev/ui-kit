# FileUpload / Dropzone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `Dropzone` drag-and-drop primitive and a transport-agnostic `FileUpload` control (validation + file-list UI with per-file progress) to `@kjaniec-dev/ui`, plus a `FileUploadField` form wrapper, closing the `FileUpload`/`Dropzone` P1 backlog gap.

**Architecture:** Pure, directly-testable helpers (`file-upload-internals.ts`: `formatBytes`, `matchesAccept`, `generateId`, `validateFiles`) underpin a reusable `Dropzone` primitive (a `<button>` drop region + sibling hidden `<input type="file">`, emitting `File[]`) and a composed `FileUpload` (owns the `UploadItem[]` value, runs validation, renders the dropzone + file rows reusing the existing `Progress` component). `FileUploadField` wraps `FileUpload` in `FormField`, mirroring `DatePickerField`. This is the same primitive-plus-internals-plus-composed pattern shipped for DateRangePicker.

**Tech Stack:** React 19, TypeScript, Tailwind (kj design tokens), native `File`/`FileList`/drag-drop APIs (no upload library, no new dependency), Vitest + `@testing-library/react`, Storybook, the MCP extractor (`npm run mcp:build`).

## Global Constraints

- Design-token classes only (no raw colors). Reuse tokens verified present in `packages/design/src/tailwind.css`: `border-input`, `border-border`, `border-danger`, `bg-surface`, `bg-muted`, `bg-primary`, `bg-primary/5`, `text-foreground`, `text-muted-foreground`, `text-primary`, `text-primary-foreground`, `text-danger`, `text-success`, `ring` (as `focus:ring-ring/30`), `rounded-kj-md`, `rounded-kj-sm`.
- Works in light and dark automatically (tokens handle it) — no theme-specific code.
- Tests import components directly (`from "./dropzone"`, `from "./file-upload"`, `from "./file-upload-internals"`), matching the kit's existing test convention.
- **Transport-agnostic:** the components never perform a network upload. No `fetch`/`XHR`. Progress/status is display-only, driven by the consumer via the `UploadItem[]` value.
- Value type is `UploadItem[]` (rich item objects), controlled/uncontrolled via the `value !== undefined` split used across the kit.
- **No `name` prop / hidden-input form serialization** — files aren't string-serializable; consumers submit via `onChange` + `FormData`. This is deliberate (see spec).
- Component files (`.tsx`) must start with `"use client";`. The pure `.ts` internals file must NOT (it has no React/client code).
- Do not introduce any new npm dependency.
- `formatBytes` is 1024-base with `B`/`KB`/`MB`/`GB`/`TB` labels.
- Commit after each task with a Conventional Commit message ending:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

## File Structure

- Create: `packages/ui/src/components/file-upload-internals.ts` — pure helpers + shared types (`UploadStatus`, `UploadItem`, `FileRejection`).
- Create: `packages/ui/src/components/file-upload-internals.test.ts` — Vitest suite (pure, no rendering).
- Create: `packages/ui/src/components/dropzone.tsx` — `Dropzone` primitive.
- Create: `packages/ui/src/components/dropzone.test.tsx` — Vitest suite.
- Create: `packages/ui/src/components/dropzone.stories.tsx` — Storybook, `title: "Forms/Dropzone"`.
- Create: `packages/ui/src/components/file-upload.tsx` — `FileUpload` + `FileUploadField`.
- Create: `packages/ui/src/components/file-upload.test.tsx` — Vitest suites.
- Create: `packages/ui/src/components/file-upload.stories.tsx` — Storybook, `title: "Forms/FileUpload"`.
- Modify: `packages/ui/src/index.ts` — barrel exports.
- Modify (generated): `packages/mcp/data/components.json` — via `npm run mcp:build`.
- Modify: `site/src/main.tsx` — gallery demo in the Forms section.
- Modify: `docs/BACKLOG.md` — check the `FileUpload`/`Dropzone` item off.

---

## Task 1: `file-upload-internals.ts` (pure helpers + types)

**Files:**
- Create: `packages/ui/src/components/file-upload-internals.ts`
- Test: `packages/ui/src/components/file-upload-internals.test.ts`

**Interfaces:**
- Produces: `type UploadStatus = "pending" | "uploading" | "success" | "error"`.
- Produces: `interface UploadItem { id: string; file: File; status?: UploadStatus; progress?: number; error?: string }`.
- Produces: `interface FileRejection { file: File; reason: "type" | "size" | "count" }`.
- Produces: `formatBytes(bytes: number): string`.
- Produces: `matchesAccept(file: File, accept?: string): boolean`.
- Produces: `generateId(): string`.
- Produces: `interface ValidateOptions { accept?: string; maxSize?: number; maxFiles?: number; existingCount?: number; multiple?: boolean }`.
- Produces: `validateFiles(files: File[], opts: ValidateOptions): { accepted: File[]; rejected: FileRejection[] }`.

- [ ] **Step 1: Write the failing test file**

Create `packages/ui/src/components/file-upload-internals.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatBytes, matchesAccept, generateId, validateFiles } from "./file-upload-internals";

function makeFile(name: string, type: string, size: number): File {
  const f = new File(["x"], name, { type });
  // jsdom's File derives size from the blob parts; override to the size we want to test.
  Object.defineProperty(f, "size", { value: size });
  return f;
}

describe("formatBytes", () => {
  it("formats bytes under 1 KB without decimals", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });
  it("formats KB/MB/GB with one decimal, 1024-base", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1.0 GB");
  });
});

describe("matchesAccept", () => {
  const png = makeFile("photo.png", "image/png", 100);
  const pdf = makeFile("doc.PDF", "application/pdf", 100);
  it("accepts everything when accept is empty/undefined", () => {
    expect(matchesAccept(png)).toBe(true);
    expect(matchesAccept(png, "")).toBe(true);
    expect(matchesAccept(png, "  ")).toBe(true);
  });
  it("matches a mime wildcard like image/*", () => {
    expect(matchesAccept(png, "image/*")).toBe(true);
    expect(matchesAccept(pdf, "image/*")).toBe(false);
  });
  it("matches an exact mime type", () => {
    expect(matchesAccept(pdf, "application/pdf")).toBe(true);
    expect(matchesAccept(png, "application/pdf")).toBe(false);
  });
  it("matches an extension token case-insensitively", () => {
    expect(matchesAccept(pdf, ".pdf")).toBe(true); // file is doc.PDF
    expect(matchesAccept(png, ".pdf")).toBe(false);
  });
  it("accepts if ANY comma-separated token matches", () => {
    expect(matchesAccept(pdf, "image/*,.pdf")).toBe(true);
    expect(matchesAccept(png, "image/*,.pdf")).toBe(true);
    expect(matchesAccept(makeFile("a.txt", "text/plain", 10), "image/*,.pdf")).toBe(false);
  });
});

describe("generateId", () => {
  it("returns unique non-empty strings", () => {
    const a = generateId();
    const b = generateId();
    expect(a).toBeTruthy();
    expect(typeof a).toBe("string");
    expect(a).not.toBe(b);
  });
});

describe("validateFiles", () => {
  const png = makeFile("a.png", "image/png", 100);
  const big = makeFile("big.png", "image/png", 5000);
  const pdf = makeFile("b.pdf", "application/pdf", 100);

  it("rejects by type", () => {
    const { accepted, rejected } = validateFiles([pdf], { accept: "image/*" });
    expect(accepted).toEqual([]);
    expect(rejected).toEqual([{ file: pdf, reason: "type" }]);
  });
  it("rejects by size", () => {
    const { accepted, rejected } = validateFiles([big], { maxSize: 1000 });
    expect(accepted).toEqual([]);
    expect(rejected).toEqual([{ file: big, reason: "size" }]);
  });
  it("accepts up to remaining slots and rejects the overflow as count", () => {
    const { accepted, rejected } = validateFiles([png, pdf], { maxFiles: 2, existingCount: 1 });
    expect(accepted).toEqual([png]);
    expect(rejected).toEqual([{ file: pdf, reason: "count" }]);
  });
  it("in single mode accepts only the first valid file, rest are count-rejected", () => {
    const { accepted, rejected } = validateFiles([png, pdf], { multiple: false });
    expect(accepted).toEqual([png]);
    expect(rejected).toEqual([{ file: pdf, reason: "count" }]);
  });
  it("accepts all when within limits", () => {
    const { accepted, rejected } = validateFiles([png, pdf], { accept: "image/*,.pdf", maxSize: 1000, maxFiles: 5 });
    expect(accepted).toEqual([png, pdf]);
    expect(rejected).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/ui -- file-upload-internals`
Expected: FAIL — `Failed to resolve import "./file-upload-internals"` (file does not exist yet).

- [ ] **Step 3: Implement `file-upload-internals.ts`**

Create `packages/ui/src/components/file-upload-internals.ts`:

```ts
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
  const tokens = accept.split(",").map((t) => t.trim()).filter(Boolean);
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test --workspace @kjaniec-dev/ui -- file-upload-internals`
Expected: PASS — all internals tests green.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/file-upload-internals.ts packages/ui/src/components/file-upload-internals.test.ts
git commit -m "feat(ui): add file-upload pure internals (formatBytes, matchesAccept, validateFiles)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `Dropzone` primitive (drag-drop + click-to-browse)

**Files:**
- Create: `packages/ui/src/components/dropzone.tsx`
- Test: `packages/ui/src/components/dropzone.test.tsx`
- Modify: `packages/ui/src/index.ts` (add barrel export)

**Interfaces:**
- Produces: `interface DropzoneProps { onFiles: (files: File[]) => void; accept?: string; multiple?: boolean; disabled?: boolean; className?: string; children?: React.ReactNode; id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean | "true" | "false"; "aria-required"?: boolean }`.
- Produces: `Dropzone` — `forwardRef<HTMLButtonElement, DropzoneProps>`; the ref points at the drop-region `<button>`.
- Consumed by Task 3 (`FileUpload` renders `<Dropzone>` and reads its `onFiles`).

- [ ] **Step 1: Write the failing test file**

Create `packages/ui/src/components/dropzone.test.tsx`:

```tsx
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dropzone } from "./dropzone";

function makeFile(name = "a.png", type = "image/png"): File {
  return new File(["x"], name, { type });
}

describe("Dropzone", () => {
  it("renders the default prompt and a file input", () => {
    const { container } = render(<Dropzone onFiles={() => {}} />);
    expect(screen.getByText(/drag and drop files here/i)).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it("clicking the region opens the file picker", () => {
    const { container } = render(<Dropzone onFiles={() => {}} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});
    fireEvent.click(screen.getByRole("button"));
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("selecting files via the input calls onFiles and resets the input value", () => {
    const onFiles = vi.fn();
    const { container } = render(<Dropzone onFiles={onFiles} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile();
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
    expect(input.value).toBe("");
  });

  it("dropping files calls onFiles with the dropped files", () => {
    const onFiles = vi.fn();
    render(<Dropzone onFiles={onFiles} />);
    const file = makeFile();
    fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [file], types: ["Files"] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it("marks the region drag-active on dragenter and clears it on drop", () => {
    render(<Dropzone onFiles={() => {}} />);
    const zone = screen.getByRole("button");
    fireEvent.dragEnter(zone, { dataTransfer: { files: [], types: ["Files"] } });
    expect(zone.className).toContain("border-primary");
    fireEvent.drop(zone, { dataTransfer: { files: [makeFile()], types: ["Files"] } });
    expect(zone.className).not.toContain("border-primary");
  });

  it("does not open the picker or accept drops when disabled", () => {
    const onFiles = vi.fn();
    const { container } = render(<Dropzone onFiles={onFiles} disabled />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});
    fireEvent.click(screen.getByRole("button"));
    fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [makeFile()], types: ["Files"] } });
    expect(clickSpy).not.toHaveBeenCalled();
    expect(onFiles).not.toHaveBeenCalled();
  });

  it("forwards accept/multiple to the input and its ref to the button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    const { container } = render(<Dropzone ref={ref} onFiles={() => {}} accept=".pdf" multiple={false} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute("accept", ".pdf");
    expect(input).not.toHaveAttribute("multiple");
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("shows a danger border when aria-invalid is set", () => {
    render(<Dropzone onFiles={() => {}} aria-invalid="true" />);
    expect(screen.getByRole("button").className).toContain("border-danger");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/ui -- dropzone.test`
Expected: FAIL — `Failed to resolve import "./dropzone"` (file does not exist yet).

- [ ] **Step 3: Implement `Dropzone`**

Create `packages/ui/src/components/dropzone.tsx`:

```tsx
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
```

- [ ] **Step 4: Add the barrel export**

In `packages/ui/src/index.ts`, add this line after the `date-range-picker` export block (end of file):

```ts
export { Dropzone, type DropzoneProps } from "./components/dropzone";
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test --workspace @kjaniec-dev/ui -- dropzone.test`
Expected: PASS — all `Dropzone` tests green.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/dropzone.tsx packages/ui/src/components/dropzone.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add Dropzone primitive (drag-drop + click-to-browse)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `FileUpload` (validation + file rows) + `FileUploadField`

**Files:**
- Create: `packages/ui/src/components/file-upload.tsx`
- Test: `packages/ui/src/components/file-upload.test.tsx`
- Modify: `packages/ui/src/index.ts` (add barrel export)

**Interfaces:**
- Consumes: `Dropzone` from Task 2; `Progress` from `./progress`; `formatBytes`, `generateId`, `validateFiles`, `UploadItem`, `UploadStatus`, `FileRejection` from Task 1's `./file-upload-internals`; `FormField` from `./form-field`.
- Produces: `interface FileUploadProps { value?: UploadItem[]; defaultValue?: UploadItem[]; onChange?: (items: UploadItem[]) => void; onReject?: (rejections: FileRejection[]) => void; accept?: string; maxSize?: number; maxFiles?: number; multiple?: boolean; disabled?: boolean; error?: boolean; required?: boolean; className?: string; id?: string; "aria-describedby"?: string }`.
- Produces: `FileUpload` — `forwardRef<HTMLButtonElement, FileUploadProps>`; the ref points at the dropzone button.
- Produces: `type FileUploadFieldProps = Omit<FileUploadProps, "error"> & { label: string; hint?: string; error?: string }`; `FileUploadField` component. Re-exports the `UploadItem`, `UploadStatus`, `FileRejection` types.

- [ ] **Step 1: Write the failing test file**

Create `packages/ui/src/components/file-upload.test.tsx`:

```tsx
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileUpload, FileUploadField } from "./file-upload";
import type { UploadItem } from "./file-upload-internals";

function makeFile(name: string, type: string, size: number): File {
  const f = new File(["x"], name, { type });
  Object.defineProperty(f, "size", { value: size });
  return f;
}
const dropzone = () => screen.getByRole("button", { name: /drag and drop files here/i });
const drop = (files: File[]) =>
  fireEvent.drop(dropzone(), { dataTransfer: { files, types: ["Files"] } });

describe("FileUpload", () => {
  it("adds a row with name and formatted size when a valid file is dropped", () => {
    const onChange = vi.fn();
    render(<FileUpload accept="image/*" onChange={onChange} />);
    const file = makeFile("a.png", "image/png", 1024);
    drop([file]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toHaveLength(1);
    expect(onChange.mock.calls[0][0][0].file).toBe(file);
    expect(onChange.mock.calls[0][0][0].status).toBe("pending");
    // Uncontrolled: the row renders from internal state.
    expect(screen.getByText("a.png")).toBeInTheDocument();
    expect(screen.getByText("1.0 KB")).toBeInTheDocument();
  });

  it("rejects a file by type and does not add it", () => {
    const onChange = vi.fn();
    const onReject = vi.fn();
    render(<FileUpload accept="image/*" onChange={onChange} onReject={onReject} />);
    const pdf = makeFile("b.pdf", "application/pdf", 1024);
    drop([pdf]);
    expect(onReject).toHaveBeenCalledWith([{ file: pdf, reason: "type" }]);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByText("b.pdf")).not.toBeInTheDocument();
  });

  it("rejects a file over maxSize", () => {
    const onReject = vi.fn();
    render(<FileUpload maxSize={1000} onReject={onReject} />);
    const big = makeFile("big.png", "image/png", 5000);
    drop([big]);
    expect(onReject).toHaveBeenCalledWith([{ file: big, reason: "size" }]);
  });

  it("removes a row via its remove button", () => {
    const onChange = vi.fn();
    render(<FileUpload onChange={onChange} />);
    drop([makeFile("a.png", "image/png", 1024)]);
    fireEvent.click(screen.getByRole("button", { name: /remove a\.png/i }));
    // Last onChange call is the removal -> empty list.
    expect(onChange.mock.calls.at(-1)![0]).toEqual([]);
    expect(screen.queryByText("a.png")).not.toBeInTheDocument();
  });

  it("renders a controlled value including a progress bar while uploading", () => {
    const items: UploadItem[] = [
      { id: "1", file: makeFile("a.png", "image/png", 2048), status: "uploading", progress: 42 },
    ];
    render(<FileUpload value={items} onChange={() => {}} />);
    expect(screen.getByText("a.png")).toBeInTheDocument();
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("shows success and error states from the controlled value", () => {
    const items: UploadItem[] = [
      { id: "1", file: makeFile("ok.png", "image/png", 10), status: "success" },
      { id: "2", file: makeFile("bad.png", "image/png", 10), status: "error", error: "Server rejected" },
    ];
    render(<FileUpload value={items} onChange={() => {}} />);
    expect(screen.getByText("Uploaded")).toBeInTheDocument();
    expect(screen.getByText("Server rejected")).toBeInTheDocument();
  });

  it("single mode replaces the existing file on a new drop", () => {
    const onChange = vi.fn();
    render(<FileUpload multiple={false} onChange={onChange} />);
    drop([makeFile("first.png", "image/png", 10)]);
    drop([makeFile("second.png", "image/png", 10)]);
    const last = onChange.mock.calls.at(-1)![0];
    expect(last).toHaveLength(1);
    expect(last[0].file.name).toBe("second.png");
  });

  it("hides remove buttons and reflects error/required on the dropzone when disabled/invalid", () => {
    const items: UploadItem[] = [{ id: "1", file: makeFile("a.png", "image/png", 10), status: "pending" }];
    const { rerender } = render(<FileUpload value={items} onChange={() => {}} disabled />);
    expect(screen.queryByRole("button", { name: /remove a\.png/i })).not.toBeInTheDocument();
    rerender(<FileUpload value={items} onChange={() => {}} error required />);
    const zone = dropzone();
    expect(zone).toHaveAttribute("aria-invalid", "true");
    expect(zone).toHaveAttribute("aria-required", "true");
    expect(zone.className).toContain("border-danger");
  });

  it("forwards its ref to the dropzone button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<FileUpload ref={ref} onChange={() => {}} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

describe("FileUploadField", () => {
  it("associates the label with the dropzone button", () => {
    render(<FileUploadField label="Attachments" onChange={() => {}} />);
    // The element the label points at is the dropzone <button>.
    expect(screen.getByLabelText("Attachments").tagName).toBe("BUTTON");
  });

  it("shows the hint and links it via aria-describedby", () => {
    render(<FileUploadField label="Attachments" hint="PDFs only" onChange={() => {}} />);
    const zone = screen.getByLabelText("Attachments");
    expect(screen.getByText("PDFs only")).toBeInTheDocument();
    expect(zone.getAttribute("aria-describedby")).toContain(screen.getByText("PDFs only").id);
  });

  it("shows the error, hides the hint, and marks the dropzone invalid", () => {
    render(<FileUploadField label="Attachments" hint="PDFs only" error="Required" onChange={() => {}} />);
    const zone = screen.getByLabelText("Attachments");
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("PDFs only")).not.toBeInTheDocument();
    expect(zone).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards its ref to the dropzone button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<FileUploadField label="Attachments" ref={ref} onChange={() => {}} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

Note: the first `FileUploadField` test's `aria-haspopup` assertion just documents that the dropzone button is a plain button (no popup) — the meaningful assertion is `.tagName === "BUTTON"`. If `toHaveAttribute("aria-haspopup", null…)` is awkward in your matcher version, replace that line with `expect(screen.getByLabelText("Attachments")).not.toHaveAttribute("aria-haspopup");`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/ui -- file-upload.test`
Expected: FAIL — `Failed to resolve import "./file-upload"` (file does not exist yet).

- [ ] **Step 3: Implement `FileUpload` + `FileUploadField`**

Create `packages/ui/src/components/file-upload.tsx`:

```tsx
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
```

- [ ] **Step 4: Add the barrel export**

In `packages/ui/src/index.ts`, add after the `Dropzone` export from Task 2:

```ts
export {
  FileUpload,
  FileUploadField,
  type FileUploadProps,
  type FileUploadFieldProps,
  type UploadItem,
  type UploadStatus,
  type FileRejection,
} from "./components/file-upload";
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test --workspace @kjaniec-dev/ui -- file-upload.test`
Expected: PASS — both `FileUpload` and `FileUploadField` suites green.

If `getByLabelText("Attachments")` fails to resolve the dropzone button (label→button association), fall back to reading the `<label>`'s `htmlFor` and asserting on `document.getElementById(htmlFor)` — do not change component behavior to make the test pass.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/file-upload.tsx packages/ui/src/components/file-upload.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add FileUpload (validation + file rows) + FileUploadField wrapper

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Stories, MCP data, site gallery, backlog, verification

**Files:**
- Create: `packages/ui/src/components/dropzone.stories.tsx`
- Create: `packages/ui/src/components/file-upload.stories.tsx`
- Modify (generated): `packages/mcp/data/components.json` (via `npm run mcp:build`)
- Modify: `site/src/main.tsx`
- Modify: `docs/BACKLOG.md`

**Interfaces:**
- Consumes: `Dropzone` from Task 2; `FileUpload`, `FileUploadField`, `UploadItem` from Task 3.

- [ ] **Step 1: Write the Storybook stories**

Create `packages/ui/src/components/dropzone.stories.tsx`:

```tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dropzone } from "./dropzone";

const meta = {
  title: "Forms/Dropzone",
  component: Dropzone,
  tags: ["autodocs"],
} satisfies Meta<typeof Dropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [count, setCount] = React.useState(0);
    return (
      <div style={{ maxWidth: 420 }}>
        <Dropzone onFiles={(files) => setCount((c) => c + files.length)} />
        <p style={{ marginTop: 8, fontSize: 13 }}>{count} file(s) received</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Dropzone onFiles={() => {}} disabled />
    </div>
  ),
};
```

Create `packages/ui/src/components/file-upload.stories.tsx`:

```tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileUpload, FileUploadField } from "./file-upload";
import type { UploadItem } from "./file-upload-internals";

const meta = {
  title: "Forms/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [items, setItems] = React.useState<UploadItem[]>([]);
    return (
      <div style={{ maxWidth: 420 }}>
        <FileUpload value={items} onChange={setItems} accept="image/*,.pdf" maxSize={5 * 1024 * 1024} />
      </div>
    );
  },
};

export const WithProgressStates: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <FileUpload
        value={[
          { id: "1", file: new File(["x"], "invoice.pdf", { type: "application/pdf" }), status: "uploading", progress: 62 },
          { id: "2", file: new File(["x"], "receipt.png", { type: "image/png" }), status: "success" },
          { id: "3", file: new File(["x"], "broken.png", { type: "image/png" }), status: "error", error: "Server rejected" },
        ]}
        onChange={() => {}}
      />
    </div>
  ),
};

export const Field: Story = {
  render: () => {
    const [items, setItems] = React.useState<UploadItem[]>([]);
    return (
      <div style={{ maxWidth: 420 }}>
        <FileUploadField
          label="Attachments"
          hint="PDF or images, up to 5 MB each."
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
          value={items}
          onChange={setItems}
        />
      </div>
    );
  },
};
```

- [ ] **Step 2: Verify Storybook builds the stories**

Run: `npm run build-storybook`
Expected: build succeeds (no errors referencing `dropzone.stories` or `file-upload.stories`).

- [ ] **Step 3: Regenerate the MCP component data**

Run: `npm run mcp:build`
Expected: succeeds and prints `Found N exported React components in index.ts.` (N includes `Dropzone`, `FileUpload`, and `FileUploadField`).

Verify the data now contains them:

Run: `node -e "const c=require('./packages/mcp/data/components.json'); console.log(c.map(x=>x.name).filter(n=>/Dropzone|FileUpload/.test(n)))"`
Expected: `[ 'Dropzone', 'FileUpload', 'FileUploadField' ]`

Note: the pre-existing MCP extractor (`packages/mcp/src/extractor.ts`) doesn't fully resolve intersection prop types (`Omit<X, K> & {...}`) — a known, out-of-scope issue already hit by `ComboboxFieldProps`/`DatePickerFieldProps`/`DateRangePickerFieldProps`; it will likely produce an incomplete prop list for `FileUploadFieldProps` too, and may emit spurious pseudo-component entries for exported types (as it does for `DateRange`). Do not attempt to fix the extractor in this task; just confirm the three real names above appear.

- [ ] **Step 4: Add a Dropzone/FileUpload demo to the site gallery**

In `site/src/main.tsx`:

1. Add the imports. The site imports everything (values and types) from `"@kjaniec-dev/ui"` in one large named-import block (the block that opens with `import {` on line 3 and closes with `} from "@kjaniec-dev/ui";`); `RangeCalendar,` and `DateRangePickerField,` currently sit near the top of it. Add these three lines into that same block (placement within the block does not matter — the inline `type` specifier on the last one is valid TS and needs no separate `import type` line):

```tsx
  Dropzone,
  FileUploadField,
  type UploadItem,
```

2. Add demo state + a simulated-upload effect. Find the `bookingRange`/`inlineRange` state (the two `React.useState<{ start?: Date; end?: Date }>({})` lines) and add directly below them:

```tsx
  const [uploadFiles, setUploadFiles] = React.useState<UploadItem[]>([]);
  const [dropCount, setDropCount] = React.useState(0);
  React.useEffect(() => {
    if (!uploadFiles.some((it) => it.status === "pending" || it.status === "uploading")) return;
    const t = setInterval(() => {
      setUploadFiles((items) =>
        items.map((it) => {
          if (it.status === "success" || it.status === "error") return it;
          const next = (it.progress ?? 0) + 12;
          return next >= 100 ? { ...it, status: "success", progress: 100 } : { ...it, status: "uploading", progress: next };
        })
      );
    }, 400);
    return () => clearInterval(t);
  }, [uploadFiles]);
```

3. Register the components in the Forms section tabs. The Forms `<Sec>` opening tag's `components` array currently ends with `..., "RangeCalendar", "DateRangePicker", "DateRangePickerField", "FormField"]`. Change that array to insert the three new names before `"FormField"`:

```tsx
components={["Input", "TextField", "Textarea", "Select", "SelectField", "Combobox", "ComboboxField", "Calendar", "DatePicker", "DatePickerField", "RangeCalendar", "DateRangePicker", "DateRangePickerField", "Dropzone", "FileUpload", "FileUploadField", "FormField"]}
```

4. Add a demo `<Box>` inside the Forms `<Sec>`. The existing "DateRangePicker / RangeCalendar" `<Box>` ends with its `</Box>` immediately before the `</Sec>` that closes the Forms section. Insert a new `<Box>` between that `</Box>` and `</Sec>`:

```tsx
            <Box>
              <Sub>FileUpload / Dropzone</Sub>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
                <FileUploadField
                  label="Attachments"
                  hint="PDF or images, up to 5 MB each. Uploads are simulated."
                  accept="image/*,.pdf"
                  maxSize={5 * 1024 * 1024}
                  value={uploadFiles}
                  onChange={setUploadFiles}
                />
              </div>
              <div className="mt-5">
                <Sub>Dropzone (standalone)</Sub>
                <Dropzone onFiles={(files) => setDropCount((c) => c + files.length)} />
                <p className="mt-2 text-sm text-muted-foreground">{dropCount} file(s) received</p>
              </div>
            </Box>
```

- [ ] **Step 5: Verify the site builds and typechecks**

Run: `npm run typecheck --workspace @kjaniec-dev/site`
Expected: no errors.

Run: `npm run build --workspace @kjaniec-dev/site`
Expected: build succeeds.

- [ ] **Step 6: Update the backlog**

In `docs/BACKLOG.md`, change:

```markdown
- [ ] `FileUpload` / `Dropzone` — typical admin-panel need (CSV import, invoice attachments — fits the "Invoice & Accounting Dashboard" pattern in README).
```

to:

```markdown
- [x] `FileUpload` / `Dropzone` — transport-agnostic drag-drop + validation (accept/maxSize/maxFiles) + per-file progress rows, standalone `Dropzone` primitive, and `FileUploadField` wrapper shipped (2026-07-11 design doc).
```

- [ ] **Step 7: Full monorepo verification**

Run each and confirm success. Note: `packages/mcp`'s own custom test runner (`tsx src/run-test.ts`) fails with an `EPERM` unix-socket bind error under this sandboxed environment — a known, pre-existing issue unrelated to this feature (already tracked in `docs/BACKLOG.md`'s "Tooling & process" section). Run the two workspaces this feature touches individually rather than the root `npm run test --workspaces`:

```bash
npm run typecheck
npm run test --workspace @kjaniec-dev/ui
npm run test --workspace @kjaniec-dev/site
npm run build
```

Expected: `typecheck` clean across all three workspaces; `@kjaniec-dev/ui` tests all pass (including the new `file-upload-internals`, `dropzone`, and `file-upload` suites); `@kjaniec-dev/site` tests pass; `build` succeeds. If the root `npm run test` is run and only `@kjaniec-dev/ui-mcp` fails with the `EPERM` socket error, that is the known pre-existing issue — not a regression from this work.

- [ ] **Step 8: Visual/functional check in the running site**

Use the `verify` skill (or Playwright MCP) to drive the site:

1. Start the site: `npm run site:dev` (note the local URL).
2. Open the Forms section, scroll to "FileUpload / Dropzone".
3. Confirm the `FileUploadField` renders a dashed drop region with the "Drag and drop files here, or click to browse" prompt.
4. Drop or select a valid file (an image or PDF) and confirm: a row appears with the file icon, name, and formatted size; the simulated upload advances a progress bar to 100% and then shows "Uploaded".
5. Drop a disallowed file (e.g. a `.txt`) or an oversized file and confirm it is not added (rejected by validation).
6. Click a row's remove (X) button and confirm the row disappears.
7. Drag a file over the region and confirm the border highlights (drag-active state), and that it clears when you drop or drag away.
8. Confirm the standalone `Dropzone` below increments its "N file(s) received" counter on drop.
9. Toggle dark mode and confirm the drop region, file rows, progress bar, and success/error text all read correctly in both themes.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/components/dropzone.stories.tsx packages/ui/src/components/file-upload.stories.tsx packages/mcp/data/components.json site/src/main.tsx docs/BACKLOG.md
git commit -m "feat(ui): showcase Dropzone/FileUpload in Storybook + site, regen MCP data

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**

- Transport-agnostic (no network/upload) → Tasks 2–3 (no `fetch`/`XHR` anywhere; progress is display-only from the `UploadItem` value). ✓
- Reuses the existing `Progress` component → Task 3 (`<Progress value={item.progress} />`). ✓
- Validation: `accept` glob (ext / `mime/*` / exact), `maxSize`, `maxFiles` → Task 1 (`matchesAccept`, `validateFiles`), unit-tested; wired in Task 3 (`handleFiles`). ✓
- Rejections surfaced via `onReject(FileRejection[])` → Task 3, tested (type/size/count). ✓
- Generic file rows (icon, name, size, status, remove), no thumbnails → Task 3 (`FileIcon`, `formatBytes`, no `createObjectURL`). ✓
- Value = `UploadItem[]` with stable `id`, controlled/uncontrolled → Task 1 (types + `generateId`) + Task 3 (`controlled`/`internalItems`). ✓
- Multiple by default; `multiple={false}` caps at 1 and replaces → Task 1 (`validateFiles` single-mode) + Task 3 (`newItems.slice(0,1)`), tested. ✓
- `maxFiles` accepts up to remaining slots, rejects overflow as `"count"` → Task 1, tested. ✓
- `Dropzone` = `<button>` region + sibling hidden `<input type="file">` (not nested — invalid HTML) → Task 2. ✓
- Drag-active highlight via drag-counter ref (survives child dragenter/dragleave) → Task 2, tested (dragenter sets, drop clears). ✓
- Same-file re-selection works (input value reset) → Task 2, tested. ✓
- `formatBytes` 1024-base with B/KB/MB/GB/TB → Task 1, tested at boundaries. ✓
- No `name`/hidden-input form serialization → not implemented anywhere (deliberate). ✓
- `FileUploadField` mirrors `DatePickerField` (`FormField` + `forwardRef` to the dropzone button) → Task 3, tested (label association, hint/error, ref). ✓
- `error`/`required` reflected as `aria-invalid`/`aria-required` (+ danger border) on the dropzone → Task 2 (`invalid` styling) + Task 3, tested. ✓
- Non-goals (real upload, thumbnails, form submission, reorder, folder upload, paste, dedup) → none implemented. ✓
- Definition of done: components, stories, tests, barrel exports, MCP regen, site gallery, backlog, verify → Task 4. ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases"; every code step shows complete code; no "similar to Task N" shortcuts. ✓

**Type consistency:** `UploadItem`, `UploadStatus`, `FileRejection`, `ValidateOptions`, `formatBytes`, `matchesAccept`, `generateId`, `validateFiles` (Task 1) are consumed with identical names/signatures by `FileUpload` (Task 3). `DropzoneProps`/`Dropzone` (Task 2) consumed identically by `FileUpload` (Task 3) and the stories/site (Task 4). `FileUploadProps`/`FileUploadFieldProps`/`FileUpload`/`FileUploadField` (Task 3) consumed identically by the barrel, stories, and site. `Dropzone` forwards its ref to the `<button>` (`HTMLButtonElement`); `FileUpload` forwards its ref through to that same button; `FileUploadField` forwards to `FileUpload` — one consistent `HTMLButtonElement` ref target throughout. ✓

