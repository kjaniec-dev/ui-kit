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
