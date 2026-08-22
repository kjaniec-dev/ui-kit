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
    fireEvent.drop(screen.getByRole("button"), {
      dataTransfer: { files: [file], types: ["Files"] },
    });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it("marks the region drag-active on dragenter and clears it on drop", () => {
    render(<Dropzone onFiles={() => {}} />);
    const zone = screen.getByRole("button");
    fireEvent.dragEnter(zone, { dataTransfer: { files: [], types: ["Files"] } });
    expect(zone).toHaveAttribute("data-drag-active", "true");
    fireEvent.drop(zone, { dataTransfer: { files: [makeFile()], types: ["Files"] } });
    expect(zone).not.toHaveAttribute("data-drag-active");
  });

  it("does not open the picker or accept drops when disabled", () => {
    const onFiles = vi.fn();
    const { container } = render(<Dropzone onFiles={onFiles} disabled />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});
    fireEvent.click(screen.getByRole("button"));
    fireEvent.drop(screen.getByRole("button"), {
      dataTransfer: { files: [makeFile()], types: ["Files"] },
    });
    expect(clickSpy).not.toHaveBeenCalled();
    expect(onFiles).not.toHaveBeenCalled();
  });

  it("forwards accept/multiple to the input and its ref to the button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    const { container } = render(
      <Dropzone ref={ref} onFiles={() => {}} accept=".pdf" multiple={false} />
    );
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
