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
