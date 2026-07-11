# FileUpload / Dropzone — Design

## Summary

Add a `Dropzone` drag-and-drop primitive and a `FileUpload` control (validation + file-list UI with per-file progress) to `@kjaniec-dev/ui`, plus a `FileUploadField` form wrapper. Closes the `FileUpload` / `Dropzone` gap in `docs/BACKLOG.md`'s "New components: common B2B/dashboard gaps" section (the CSV-import / invoice-attachment need behind the README's "Invoice & Accounting Dashboard" pattern).

## Scope

- **Transport-agnostic.** The component never performs a network upload. It handles selection, validation, and the file-list UI, and can *display* per-file progress/status that the consumer drives via the value. This keeps the kit dependency-free and free of a baked-in transport, matching how `DatePicker` used native `Date` rather than a date library. Upload side effects (fetch/XHR/FormData) are the consumer's.
- **Validation in scope:** `accept` (comma-separated glob — `image/*`, `.pdf`, `application/pdf`), `maxSize` (max bytes per file), `maxFiles` (max total count). Rejections are surfaced via an `onReject` callback.
- **Generic file rows only** — icon, name, formatted size, status/progress, remove button. No image thumbnail previews (avoids `URL.createObjectURL`/`revokeObjectURL` lifecycle management in v1).
- **Value type is `UploadItem[]`** — a rich item model (`{ id, file, status?, progress?, error? }`) so per-file status/progress correlates to a rendered row by stable `id`. Controlled/uncontrolled, same split the kit already uses (`value !== undefined` ⇒ controlled).
- **Multiple files by default;** `multiple={false}` caps the list at one file and replaces on a new drop.
- Reuses the existing `Progress` component (`packages/ui/src/components/progress.tsx`) for the per-file upload bar.

## Architecture

Three units, mirroring the `Calendar`/`CalendarGrid` + `DatePicker` extraction pattern shipped for DateRangePicker (a reusable interaction primitive + pure internals + a composed stateful component). Shipping both `Dropzone` and `FileUpload` also matches the backlog's "`FileUpload` / `Dropzone`" naming.

- **`Dropzone`** (`packages/ui/src/components/dropzone.tsx`) — the pure drag-and-drop + click-to-browse interaction, no knowledge of the item list, validation, or progress. A small container holding a focusable `<button type="button">` drop region (dashed border) and, as a **sibling** (not a child — a `<button>` may not contain interactive content like an `<input>`), a visually-hidden `<input type="file">`. Emits `File[]` on drop or picker selection. Usable standalone for custom upload UIs.
- **`file-upload-internals.ts`** (`packages/ui/src/components/file-upload-internals.ts`) — pure, directly unit-testable helpers: `formatBytes`, `matchesAccept`, `generateId`, `validateFiles`. No React. Mirrors `calendar-internals.ts`.
- **`FileUpload`** (`packages/ui/src/components/file-upload.tsx`) — the stateful controller: owns/accepts the `UploadItem[]` value, runs validation on files coming from the `Dropzone`, assigns ids, applies single-mode/`maxFiles` capping, renders the `Dropzone` + the file-list rows (reusing `Progress`), and emits `onChange`/`onReject`.
- **`FileUploadField`** (same file as `FileUpload`) — `React.forwardRef<HTMLButtonElement, FileUploadFieldProps>` wrapping `FormField` + `FileUpload`, mirroring `DatePickerField`'s shape (label/hint/error, ref forwarded to the dropzone button).

## Component API

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

export interface DropzoneProps {
  onFiles: (files: File[]) => void;
  /** Native picker filter hint (also mirrored into FileUpload's JS validation). */
  accept?: string;
  multiple?: boolean;          // default true
  disabled?: boolean;
  className?: string;
  /** Overrides the default drop-region content. */
  children?: React.ReactNode;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean;
}

export interface FileUploadProps {
  value?: UploadItem[];
  defaultValue?: UploadItem[];
  onChange?: (items: UploadItem[]) => void;
  /** Called with files rejected by validation on a given drop/selection. */
  onReject?: (rejections: FileRejection[]) => void;
  accept?: string;
  maxSize?: number;            // bytes per file
  maxFiles?: number;           // total count cap
  multiple?: boolean;          // default true
  disabled?: boolean;
  error?: boolean;             // visual error state + aria-invalid on the dropzone
  required?: boolean;          // aria-required on the dropzone
  className?: string;
  id?: string;
  "aria-describedby"?: string;
}

export interface FileUploadFieldProps extends Omit<FileUploadProps, "error"> {
  label: string;
  hint?: string;
  error?: string;              // string message; overrides the boolean error state
}
```

Note: there is intentionally **no `name` prop / hidden-input form serialization** (see Error handling / edge cases). `FileUpload` forwards `id`/`aria-describedby`/`aria-invalid`/`aria-required` onto the dropzone button so `FormField` integration works the same way it does for `DatePickerField`.

## `Dropzone` behavior

- Renders a container `<div>` holding a `<button type="button">` region (an icon and default text "Drag and drop files here, or click to browse", overridable via `children`) and a sibling visually-hidden `<input type="file">` (the `accept`/`multiple`/`disabled` attributes are forwarded to the input). The button and input are siblings because a `<button>` cannot legally contain an `<input>`.
- **Click / Enter / Space** on the button opens the native file picker (programmatic `inputRef.current.click()`). Using a real `<button>` gives keyboard activation and focus for free.
- **Drop:** the drag/drop handlers live on the visible `<button>` region. `onDragOver`/`onDragEnter` call `e.preventDefault()` (required for the drop event to fire) and set the drag-active state; `onDrop` calls `e.preventDefault()`, reads `e.dataTransfer.files`, and calls `onFiles(Array.from(files))`.
- **Picker change:** the input's `onChange` calls `onFiles(Array.from(e.target.files))`, then resets `e.target.value = ""` so selecting the same file again re-fires `change`.
- **Drag-active highlight** (`border-primary bg-primary/5`) is tracked with a **drag-counter ref**: increment on `dragenter`, decrement on `dragleave`, active when the counter `> 0`, reset to 0 on `drop`. This avoids the well-known bug where `dragleave` fires as the pointer crosses child elements and prematurely clears the highlight.
- `disabled`: the button is `disabled`, drag handlers are no-ops, and no picker opens.
- ARIA: the button carries any forwarded `aria-*`; when `disabled`, it's natively disabled. Drag-active is a visual affordance only (not announced).

## `FileUpload` behavior

- Controlled/uncontrolled over `items` (`value !== undefined` ⇒ controlled), same pattern as `Calendar`/`Combobox`.
- **On files from `Dropzone`:** call `validateFiles(files, { accept, maxSize, maxFiles, existingCount, multiple })` → `{ accepted, rejected }`.
  - Accepted files each become `{ id: generateId(), file, status: "pending" }`.
  - In single mode (`multiple === false`), the list is replaced by just the first accepted file.
  - `maxFiles`: accept files up to the remaining slots (`maxFiles - existingCount`), rejecting the overflow with reason `"count"` (friendlier than rejecting the whole drop).
  - Rejected files are passed to `onReject(rejections)`.
  - The resulting list is committed via `onChange` (and stored in internal state when uncontrolled).
- **Rendering:** the `Dropzone` (forwarding `accept`/`multiple`/`disabled` and the `aria-*`/`id`), then a list of item rows below it. Each row:
  - A generic file/document icon.
  - `file.name` (truncated with ellipsis) and `formatBytes(file.size)`.
  - If `status === "uploading"` and `progress != null`: a `<Progress value={progress} />` bar (and the numeric percent).
  - If `status === "success"`: a success indicator ("Uploaded" / check icon).
  - If `status === "error"`: an error indicator with the `error` message (danger tokens).
  - A remove button (X) that commits `onChange` with that item filtered out by `id`. Removing is allowed regardless of status (a consumer can treat it as cancel).
- `disabled` disables the dropzone and the remove buttons. `error` applies the danger border to the dropzone and sets `aria-invalid`.

## `file-upload-internals.ts` helpers

- **`formatBytes(bytes: number): string`** — 1024-base, e.g. `"512 B"`, `"1.4 KB"`, `"2.0 MB"`, `"1.2 GB"`. One decimal place for KB and up, no decimal for bytes.
- **`matchesAccept(file: File, accept?: string): boolean`** — `accept` empty/undefined ⇒ `true`. Otherwise split on commas and trim; a token matches if: it starts with `.` and equals the file's extension (case-insensitive on `file.name`); or ends with `/*` and its prefix matches `file.type`'s type (`image/*` matches `image/png`); or exactly equals `file.type`. Any token matching ⇒ accepted.
- **`generateId(): string`** — `crypto.randomUUID()` when available, otherwise a module-level counter + `Math.random()` fallback (covers non-secure contexts / older test envs).
- **`validateFiles(files, opts): { accepted: File[]; rejected: FileRejection[] }`** — applies, in order per file: type (`matchesAccept`), size (`maxSize`), then count (remaining slots against `maxFiles`, accounting for `existingCount` and single mode). Encapsulates all reject reasons so it can be unit-tested without rendering.

## Error handling / edge cases

- **No native-form serialization / hidden input.** Unlike `DatePicker` (which serialized a date to a hidden `<input>` for native form POST), `File` objects aren't meaningfully string-serializable. Consumers read files via `onChange` and submit them with `FormData`/fetch. This is an explicit non-goal, not an oversight.
- **No deduplication** of identical files (same name/size) in v1 — each drop appends and each accepted file gets its own `id`. A consumer that wants dedup can filter in its `onChange` handler.
- **Same-file re-selection** works because the `Dropzone` resets the input's `value` after every `change`.
- **Controlled items the component didn't create** keep their consumer-supplied `id`; only files newly accepted from a drop get a `generateId()` id.
- **`maxFiles` with a partial drop** accepts up to the remaining slots and rejects the rest as `"count"`, rather than rejecting the entire drop.
- **Single mode** ignores `maxFiles` semantics beyond "one" — a new accepted file always replaces the current one.
- Size/type validation reads `file.size` / `file.type`; a browser that reports an empty `file.type` (occasionally the case for some extensions) will fail a MIME-only `accept` but pass an extension-based one — documented, and the reason extension tokens are supported.

## Testing

- **`file-upload-internals.test.ts`** (pure, no rendering): `formatBytes` at B/KB/MB/GB boundaries; `matchesAccept` for extension tokens, `mime/*` prefix tokens, exact-MIME tokens, empty accept, and case-insensitivity; `validateFiles` producing `"type"`, `"size"`, and `"count"` rejections, partial-count acceptance, and single-mode behavior.
- **`dropzone.test.tsx`**: renders default content; clicking the region triggers the hidden input's click (spy); `fireEvent.drop` with a `dataTransfer.files` stub calls `onFiles` with the dropped files; dragenter/dragover toggles the active class and dragleave/drop clears it; `disabled` prevents `onFiles` and the picker; the input's `value` is reset after a `change`.
- **`file-upload.test.tsx`**: dropping valid files adds rows showing name + formatted size; a file rejected by type/size/count fires `onReject` with the right reason and is not added; the remove button removes that row by `id`; a controlled `value` renders the provided items, including a `Progress` bar when `status === "uploading"`; single mode replaces the existing file on a new drop; `disabled`/`error`/`required` are reflected on the dropzone region.
- **`FileUploadField` tests** (same file or a `describe` block): label associates with the dropzone button; `hint`/`error` integrate with `FormField` the way `DatePickerField` does; ref forwards to the dropzone button.

Tests construct files with `new File(["…"], "name.ext", { type: "mime" })` and simulate drops with `fireEvent.drop(zone, { dataTransfer: { files: [file], types: ["Files"] } })`.

## Non-goals (this iteration)

- Performing the actual network upload / any transport (fetch, XHR, chunked, resumable).
- Image thumbnail previews.
- Native `<form>` submission / hidden-input serialization of files.
- Drag-to-reorder, folder uploads (`webkitdirectory`), or paste-to-upload.
- Deduplication of identical files.
- A built-in "retry failed upload" affordance (a consumer can re-drive status via the controlled value).
