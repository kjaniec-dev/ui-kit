import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomSheet } from "./bottom-sheet";

describe("BottomSheet", () => {
  it("renders children when open", () => {
    render(
      <BottomSheet open={true} onClose={() => {}}>
        <div>Sheet Content</div>
      </BottomSheet>
    );
    expect(screen.getByText("Sheet Content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <BottomSheet open={false} onClose={() => {}}>
        <div>Sheet Content</div>
      </BottomSheet>
    );
    expect(screen.queryByText("Sheet Content")).toBeNull();
  });
});
