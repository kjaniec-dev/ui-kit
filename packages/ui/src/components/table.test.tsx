import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  TableWrap,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table";

describe("TableWrap", () => {
  it("renders a div with default wrapper styling", () => {
    render(<TableWrap data-testid="table-wrap">Content</TableWrap>);
    const wrap = screen.getByTestId("table-wrap");

    expect(wrap.tagName).toBe("DIV");
    expect(wrap).toHaveClass(
      "w-full",
      "max-w-full",
      "overflow-x-auto",
      "border",
      "border-border",
      "rounded-kj-lg"
    );
    expect(wrap).toHaveTextContent("Content");
  });

  it("merges custom className onto wrapper", () => {
    render(
      <TableWrap className="custom-wrap shadow-md" data-testid="table-wrap">
        Content
      </TableWrap>
    );
    const wrap = screen.getByTestId("table-wrap");

    expect(wrap).toHaveClass("custom-wrap", "shadow-md", "overflow-x-auto");
  });

  it("forwards ref to HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<TableWrap ref={ref} data-testid="table-wrap" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId("table-wrap"));
  });

  it("passes standard HTML attributes", () => {
    render(
      <TableWrap id="my-table-wrap" role="region" aria-label="Data view" data-testid="table-wrap" />
    );
    const wrap = screen.getByTestId("table-wrap");

    expect(wrap).toHaveAttribute("id", "my-table-wrap");
    expect(wrap).toHaveAttribute("role", "region");
    expect(wrap).toHaveAttribute("aria-label", "Data view");
  });

  it("has the correct displayName", () => {
    expect(TableWrap.displayName).toBe("TableWrap");
  });
});

describe("Table", () => {
  it("renders a table element with default styles", () => {
    render(
      <Table data-testid="table-root">
        <tbody>
          <tr>
            <td>Data</td>
          </tr>
        </tbody>
      </Table>
    );
    const table = screen.getByTestId("table-root");

    expect(table.tagName).toBe("TABLE");
    expect(table).toHaveClass("w-full", "border-collapse", "text-[0.85rem]");
    expect(table).toHaveTextContent("Data");
  });

  it("merges custom className onto table element", () => {
    render(
      <Table className="custom-table select-none" data-testid="table-root">
        <tbody>
          <tr>
            <td>Data</td>
          </tr>
        </tbody>
      </Table>
    );
    const table = screen.getByTestId("table-root");

    expect(table).toHaveClass("custom-table", "select-none", "w-full");
  });

  it("forwards ref to HTMLTableElement", () => {
    const ref = createRef<HTMLTableElement>();
    render(
      <Table ref={ref} data-testid="table-root">
        <tbody>
          <tr>
            <td>Data</td>
          </tr>
        </tbody>
      </Table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableElement);
    expect(ref.current).toBe(screen.getByTestId("table-root"));
  });

  it("passes HTML attributes to table element", () => {
    render(
      <Table summary="User activity" aria-label="Users" data-testid="table-root">
        <tbody>
          <tr>
            <td>Data</td>
          </tr>
        </tbody>
      </Table>
    );
    const table = screen.getByTestId("table-root");

    expect(table).toHaveAttribute("summary", "User activity");
    expect(table).toHaveAttribute("aria-label", "Users");
  });

  it("has the correct displayName", () => {
    expect(Table.displayName).toBe("Table");
  });
});

describe("TableHeader", () => {
  it("renders a thead element", () => {
    render(
      <table>
        <TableHeader data-testid="table-header">
          <tr>
            <th>Header</th>
          </tr>
        </TableHeader>
      </table>
    );
    const header = screen.getByTestId("table-header");

    expect(header.tagName).toBe("THEAD");
    expect(header).toHaveTextContent("Header");
  });

  it("applies custom className", () => {
    render(
      <table>
        <TableHeader className="custom-thead" data-testid="table-header">
          <tr>
            <th>Header</th>
          </tr>
        </TableHeader>
      </table>
    );
    const header = screen.getByTestId("table-header");

    expect(header).toHaveClass("custom-thead");
  });

  it("forwards ref to HTMLTableSectionElement", () => {
    const ref = createRef<HTMLTableSectionElement>();
    render(
      <table>
        <TableHeader ref={ref} data-testid="table-header">
          <tr>
            <th>Header</th>
          </tr>
        </TableHeader>
      </table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
    expect(ref.current).toBe(screen.getByTestId("table-header"));
  });

  it("passes HTML attributes", () => {
    render(
      <table>
        <TableHeader id="users-header" data-testid="table-header">
          <tr>
            <th>Header</th>
          </tr>
        </TableHeader>
      </table>
    );
    const header = screen.getByTestId("table-header");

    expect(header).toHaveAttribute("id", "users-header");
  });

  it("has the correct displayName", () => {
    expect(TableHeader.displayName).toBe("TableHeader");
  });
});

describe("TableBody", () => {
  it("renders a tbody element", () => {
    render(
      <table>
        <TableBody data-testid="table-body">
          <tr>
            <td>Body Row</td>
          </tr>
        </TableBody>
      </table>
    );
    const body = screen.getByTestId("table-body");

    expect(body.tagName).toBe("TBODY");
    expect(body).toHaveTextContent("Body Row");
  });

  it("applies custom className", () => {
    render(
      <table>
        <TableBody className="custom-tbody divide-y" data-testid="table-body">
          <tr>
            <td>Body Row</td>
          </tr>
        </TableBody>
      </table>
    );
    const body = screen.getByTestId("table-body");

    expect(body).toHaveClass("custom-tbody", "divide-y");
  });

  it("forwards ref to HTMLTableSectionElement", () => {
    const ref = createRef<HTMLTableSectionElement>();
    render(
      <table>
        <TableBody ref={ref} data-testid="table-body">
          <tr>
            <td>Body Row</td>
          </tr>
        </TableBody>
      </table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
    expect(ref.current).toBe(screen.getByTestId("table-body"));
  });

  it("passes HTML attributes", () => {
    render(
      <table>
        <TableBody id="users-body" data-testid="table-body">
          <tr>
            <td>Body Row</td>
          </tr>
        </TableBody>
      </table>
    );
    const body = screen.getByTestId("table-body");

    expect(body).toHaveAttribute("id", "users-body");
  });

  it("has the correct displayName", () => {
    expect(TableBody.displayName).toBe("TableBody");
  });
});

describe("TableRow", () => {
  it("renders a tr element with default styling", () => {
    render(
      <table>
        <tbody>
          <TableRow data-testid="table-row">
            <td>Row Data</td>
          </TableRow>
        </tbody>
      </table>
    );
    const row = screen.getByTestId("table-row");

    expect(row.tagName).toBe("TR");
    expect(row).toHaveClass("transition-colors", "hover:bg-muted/50");
    expect(row).toHaveTextContent("Row Data");
  });

  it("merges custom className onto row", () => {
    render(
      <table>
        <tbody>
          <TableRow className="custom-row cursor-pointer bg-primary/5" data-testid="table-row">
            <td>Row Data</td>
          </TableRow>
        </tbody>
      </table>
    );
    const row = screen.getByTestId("table-row");

    expect(row).toHaveClass("custom-row", "cursor-pointer", "bg-primary/5", "transition-colors");
  });

  it("handles click events and passes HTML attributes", () => {
    const handleClick = vi.fn();
    render(
      <table>
        <tbody>
          <TableRow
            data-testid="table-row"
            data-state="selected"
            aria-selected={true}
            onClick={handleClick}
          >
            <td>Row Data</td>
          </TableRow>
        </tbody>
      </table>
    );
    const row = screen.getByTestId("table-row");

    expect(row).toHaveAttribute("data-state", "selected");
    expect(row).toHaveAttribute("aria-selected", "true");

    fireEvent.click(row);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("forwards ref to HTMLTableRowElement", () => {
    const ref = createRef<HTMLTableRowElement>();
    render(
      <table>
        <tbody>
          <TableRow ref={ref} data-testid="table-row">
            <td>Row Data</td>
          </TableRow>
        </tbody>
      </table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableRowElement);
    expect(ref.current).toBe(screen.getByTestId("table-row"));
  });

  it("has the correct displayName", () => {
    expect(TableRow.displayName).toBe("TableRow");
  });
});

describe("TableHead", () => {
  it("renders a th element with left alignment by default", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead data-testid="table-head">Column 1</TableHead>
          </tr>
        </thead>
      </table>
    );
    const head = screen.getByTestId("table-head");

    expect(head.tagName).toBe("TH");
    expect(head).toHaveClass(
      "px-4",
      "py-3",
      "bg-muted",
      "border-b",
      "border-border",
      "text-[0.72rem]",
      "font-semibold",
      "uppercase",
      "tracking-[0.05em]",
      "text-muted-foreground",
      "text-left"
    );
    expect(head).not.toHaveClass("text-right");
    expect(head).toHaveTextContent("Column 1");
  });

  it("applies text-right alignment when numeric is true", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead numeric data-testid="table-head-numeric">
              Amount
            </TableHead>
          </tr>
        </thead>
      </table>
    );
    const head = screen.getByTestId("table-head-numeric");

    expect(head).toHaveClass("text-right");
    expect(head).not.toHaveClass("text-left");
  });

  it("applies text-left alignment when numeric is explicitly false", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead numeric={false} data-testid="table-head-non-numeric">
              Name
            </TableHead>
          </tr>
        </thead>
      </table>
    );
    const head = screen.getByTestId("table-head-non-numeric");

    expect(head).toHaveClass("text-left");
    expect(head).not.toHaveClass("text-right");
  });

  it("merges custom className onto header cell", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead className="w-32 cursor-pointer select-none" data-testid="table-head">
              Sortable
            </TableHead>
          </tr>
        </thead>
      </table>
    );
    const head = screen.getByTestId("table-head");

    expect(head).toHaveClass("w-32", "cursor-pointer", "select-none", "bg-muted");
  });

  it("forwards ref to HTMLTableCellElement", () => {
    const ref = createRef<HTMLTableCellElement>();
    render(
      <table>
        <thead>
          <tr>
            <TableHead ref={ref} data-testid="table-head">
              Header
            </TableHead>
          </tr>
        </thead>
      </table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableCellElement);
    expect(ref.current).toBe(screen.getByTestId("table-head"));
  });

  it("passes th attributes such as scope, colSpan, and aria-sort", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead scope="col" colSpan={2} aria-sort="ascending" data-testid="table-head">
              Header
            </TableHead>
          </tr>
        </thead>
      </table>
    );
    const head = screen.getByTestId("table-head");

    expect(head).toHaveAttribute("scope", "col");
    expect(head).toHaveAttribute("colSpan", "2");
    expect(head).toHaveAttribute("aria-sort", "ascending");
  });

  it("has the correct displayName", () => {
    expect(TableHead.displayName).toBe("TableHead");
  });
});

describe("TableCell", () => {
  it("renders a td element with default styling", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell data-testid="table-cell">Cell content</TableCell>
          </tr>
        </tbody>
      </table>
    );
    const cell = screen.getByTestId("table-cell");

    expect(cell.tagName).toBe("TD");
    expect(cell).toHaveClass(
      "px-4",
      "py-3",
      "border-b",
      "border-border",
      "[tr:last-child_&]:border-b-0"
    );
    expect(cell).not.toHaveClass("text-right", "tabular-nums");
    expect(cell).toHaveTextContent("Cell content");
  });

  it("applies text-right and tabular-nums when numeric is true", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell numeric data-testid="table-cell-numeric">
              $1,234.56
            </TableCell>
          </tr>
        </tbody>
      </table>
    );
    const cell = screen.getByTestId("table-cell-numeric");

    expect(cell).toHaveClass("text-right", "tabular-nums");
  });

  it("does not apply numeric classes when numeric is explicitly false", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell numeric={false} data-testid="table-cell-regular">
              Standard
            </TableCell>
          </tr>
        </tbody>
      </table>
    );
    const cell = screen.getByTestId("table-cell-regular");

    expect(cell).not.toHaveClass("text-right", "tabular-nums");
  });

  it("merges custom className onto cell", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell className="font-semibold text-primary" data-testid="table-cell">
              Highlighted
            </TableCell>
          </tr>
        </tbody>
      </table>
    );
    const cell = screen.getByTestId("table-cell");

    expect(cell).toHaveClass("font-semibold", "text-primary", "px-4");
  });

  it("forwards ref to HTMLTableCellElement", () => {
    const ref = createRef<HTMLTableCellElement>();
    render(
      <table>
        <tbody>
          <tr>
            <TableCell ref={ref} data-testid="table-cell">
              Ref Cell
            </TableCell>
          </tr>
        </tbody>
      </table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableCellElement);
    expect(ref.current).toBe(screen.getByTestId("table-cell"));
  });

  it("passes td attributes such as colSpan and rowSpan", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell colSpan={3} rowSpan={2} data-testid="table-cell">
              Merged
            </TableCell>
          </tr>
        </tbody>
      </table>
    );
    const cell = screen.getByTestId("table-cell");

    expect(cell).toHaveAttribute("colSpan", "3");
    expect(cell).toHaveAttribute("rowSpan", "2");
  });

  it("has the correct displayName", () => {
    expect(TableCell.displayName).toBe("TableCell");
  });
});

describe("Table full composite integration", () => {
  it("renders a full accessible table with header, body, rows, and cells", () => {
    render(
      <TableWrap data-testid="integration-wrap">
        <Table aria-label="Transactions table">
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead numeric>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono">INV-001</TableCell>
              <TableCell>Acme Corp</TableCell>
              <TableCell numeric>$1,200.00</TableCell>
              <TableCell>Paid</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono">INV-002</TableCell>
              <TableCell>Globex</TableCell>
              <TableCell numeric>$850.50</TableCell>
              <TableCell>Pending</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableWrap>
    );

    expect(screen.getByTestId("integration-wrap")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Transactions table" })).toBeInTheDocument();

    const columnHeaders = screen.getAllByRole("columnheader");
    expect(columnHeaders).toHaveLength(4);
    expect(columnHeaders[0]).toHaveTextContent("Invoice");
    expect(columnHeaders[1]).toHaveTextContent("Customer");
    expect(columnHeaders[2]).toHaveTextContent("Amount");
    expect(columnHeaders[2]).toHaveClass("text-right");
    expect(columnHeaders[3]).toHaveTextContent("Status");

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);

    const cells = screen.getAllByRole("cell");
    expect(cells).toHaveLength(8);
    expect(screen.getByText("INV-001")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("$1,200.00")).toHaveClass("text-right", "tabular-nums");
    expect(screen.getByText("INV-002")).toBeInTheDocument();
    expect(screen.getByText("Globex")).toBeInTheDocument();
    expect(screen.getByText("$850.50")).toHaveClass("text-right", "tabular-nums");
  });
});
