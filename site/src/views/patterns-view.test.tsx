import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PatternsView } from "./patterns-view";

describe("PatternsView", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders 3 B2B pattern selectors", () => {
    render(<PatternsView />);
    expect(screen.getByRole("tab", { name: /Invoice & Accounting/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Tenant & Property/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Project & Dev Console/i })).toBeInTheDocument();
  });

  it("renders the heading with KJ Product Kit branding", () => {
    render(<PatternsView />);
    expect(
      screen.getByRole("heading", { level: 1, name: /B2B Product Patterns/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/KJ Product Kit/i).length).toBeGreaterThan(0);
  });

  it("defaults to Invoice & Accounting pattern", () => {
    render(<PatternsView />);
    // MetricCard summary metrics
    expect(screen.getByText(/Total Invoiced/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Settlement/i)).toBeInTheDocument();
    expect(screen.getByText("$6,150.00")).toBeInTheDocument();

    // Table search
    expect(screen.getByPlaceholderText(/Search invoices/i)).toBeInTheDocument();

    // Invoices table rows
    expect(screen.getByText("INV-2026-001")).toBeInTheDocument();
    expect(screen.getByText("Acme Corporation")).toBeInTheDocument();
  });

  it("honors initialPattern prop", () => {
    render(<PatternsView initialPattern="tenant" />);
    expect(screen.getByRole("heading", { name: /Horizon Tower - Suite 402/i })).toBeInTheDocument();
    expect(screen.queryByText(/Total Invoiced/i)).not.toBeInTheDocument();

    const { unmount } = render(<PatternsView initialPattern="console" />);
    expect(
      screen.getByRole("heading", { name: /Cloud Services & Microservices/i })
    ).toBeInTheDocument();
    unmount();
  });

  it("allows switching between patterns via tab bar", () => {
    render(<PatternsView />);
    expect(screen.getByText(/Total Invoiced/i)).toBeInTheDocument();

    // Switch to Tenant & Property
    fireEvent.click(screen.getByRole("tab", { name: /Tenant & Property/i }));
    expect(screen.getByRole("heading", { name: /Horizon Tower - Suite 402/i })).toBeInTheDocument();
    expect(screen.queryByText(/Total Invoiced/i)).not.toBeInTheDocument();

    // Switch to Project & Dev Console
    fireEvent.click(screen.getByRole("tab", { name: /Project & Dev Console/i }));
    expect(
      screen.getByRole("heading", { name: /Cloud Services & Microservices/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/API Gateway: Operational/i)).toBeInTheDocument();

    // Switch back to Invoice
    fireEvent.click(screen.getByRole("tab", { name: /Invoice & Accounting/i }));
    expect(screen.getByText(/Total Invoiced/i)).toBeInTheDocument();
  });

  it("toggles between Live Preview and Source Code views", () => {
    render(<PatternsView />);
    // Live preview search input by default
    expect(screen.getByPlaceholderText(/Search invoices/i)).toBeInTheDocument();

    // Toggle to Source Code
    const codeBtn = screen.getByRole("tab", { name: /Source Code|Code/i });
    fireEvent.click(codeBtn);

    // Code container should be visible with filename
    expect(screen.getAllByText(/invoice-dashboard.tsx/i).length).toBeGreaterThan(0);
    expect(screen.queryByPlaceholderText(/Search invoices/i)).not.toBeInTheDocument();

    // Toggle back to Live Preview
    const previewBtn = screen.getByRole("tab", { name: /Live Preview|Preview/i });
    fireEvent.click(previewBtn);
    expect(screen.getByPlaceholderText(/Search invoices/i)).toBeInTheDocument();
  });

  it("supports searching and filtering in the Invoice pattern", () => {
    render(<PatternsView initialPattern="invoice" />);
    expect(screen.getByText("Acme Corporation")).toBeInTheDocument();
    expect(screen.getByText("Globex Logistics")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search invoices/i);
    fireEvent.change(searchInput, { target: { value: "Globex" } });

    expect(screen.queryByText("Acme Corporation")).not.toBeInTheDocument();
    expect(screen.getByText("Globex Logistics")).toBeInTheDocument();
  });

  it("handles row selection and bulk actions in Invoice pattern", async () => {
    render(<PatternsView initialPattern="invoice" />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(1);

    // Select first row checkbox
    fireEvent.click(checkboxes[1]);

    const exportBtn = screen.getByRole("button", { name: /Export CSV/i });
    const remindersBtn = screen.getByRole("button", { name: /Send Reminders/i });
    expect(exportBtn).toBeInTheDocument();
    expect(remindersBtn).toBeInTheDocument();

    fireEvent.click(exportBtn);
    await waitFor(() => {
      expect(screen.getByText(/Exported 1 invoice/i)).toBeInTheDocument();
    });

    fireEvent.click(remindersBtn);
    await waitFor(() => {
      expect(screen.getByText(/Sent reminders for 1 invoice/i)).toBeInTheDocument();
    });
  });

  it("supports interactive drawer and confirm dialog in Tenant pattern", async () => {
    render(<PatternsView initialPattern="tenant" />);
    expect(screen.getByRole("heading", { name: /Horizon Tower - Suite 402/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Commercial Lease Agreement/i })
    ).toBeInTheDocument();

    // Open Lease Details Drawer
    const drawerBtn = screen.getByRole("button", { name: /Adjust Lease/i });
    fireEvent.click(drawerBtn);

    expect(screen.getByRole("dialog", { name: /Lease Agreement & Terms/i })).toBeInTheDocument();
    expect(screen.getByText(/Monthly Escalation Rate/i)).toBeInTheDocument();

    // Save adjustments in drawer
    const saveAdjustmentsBtn = screen.getByRole("button", { name: /Save Adjustments/i });
    fireEvent.click(saveAdjustmentsBtn);

    await waitFor(() => {
      expect(screen.getByText(/Lease adjustments saved/i)).toBeInTheDocument();
    });

    // Open Terminate Lease ConfirmDialog
    const terminateBtn = screen.getByRole("button", { name: /Terminate Lease/i });
    fireEvent.click(terminateBtn);

    expect(screen.getByRole("dialog", { name: /Terminate Commercial Lease/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to terminate this commercial lease/i)
    ).toBeInTheDocument();

    // Click Confirm button
    const confirmBtn = screen.getByRole("button", { name: /Confirm Termination/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Lease termination initiated/i)).toBeInTheDocument();
    });
  });

  it("supports CommandPalette and ProjectCard grid in Dev Console pattern", async () => {
    render(<PatternsView initialPattern="console" />);

    // Health pills
    expect(screen.getByText(/API Gateway: Operational/i)).toBeInTheDocument();
    expect(screen.getByText(/PostgreSQL Primary: Healthy/i)).toBeInTheDocument();
    expect(screen.getByText(/Redis Cluster: Operational/i)).toBeInTheDocument();

    // Project cards
    expect(screen.getByText("auth-service")).toBeInTheDocument();
    expect(screen.getByText("billing-pipeline")).toBeInTheDocument();
    expect(screen.getByText("notification-worker")).toBeInTheDocument();

    // Command palette trigger button
    const cmdBtn = screen.getByRole("button", { name: /Open Command Palette|⌘K/i });
    fireEvent.click(cmdBtn);

    expect(screen.getByRole("dialog", { name: /Command Palette/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type a command/i)).toBeInTheDocument();

    // Close palette with Escape
    fireEvent.keyDown(document, { key: "Escape" });
  });

  it("opens CommandPalette on keyboard shortcut (Cmd+K / Ctrl+K)", () => {
    render(<PatternsView initialPattern="console" />);
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.getByRole("dialog", { name: /Command Palette/i })).toBeInTheDocument();
  });
});
