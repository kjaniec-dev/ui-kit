import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable, type DataTableColumn } from "./data-table";

interface Row {
  id: number;
  name: string;
  age: number;
}

const rows: Row[] = [
  { id: 1, name: "Ada", age: 36 },
  { id: 2, name: "Alan", age: 41 },
  { id: 3, name: "Grace", age: 52 },
];

const columns: DataTableColumn<Row>[] = [
  { header: "Name", accessor: (r) => r.name, sortable: true, sortKey: "name" },
  { header: "Age", accessor: (r) => r.age, align: "right" },
];

const getRowKey = (r: Row) => r.id;

describe("DataTable", () => {
  describe("rendering", () => {
    it("renders column headers and a cell per row", () => {
      render(<DataTable columns={columns} data={rows} getRowKey={getRowKey} />);
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("Ada")).toBeInTheDocument();
      expect(screen.getByText("Grace")).toBeInTheDocument();
      // header row + 3 data rows
      expect(screen.getAllByRole("row")).toHaveLength(4);
    });

    it("renders toolbar and pagination slots", () => {
      render(
        <DataTable
          columns={columns}
          data={rows}
          getRowKey={getRowKey}
          toolbar={<div>my-toolbar</div>}
          pagination={<div>my-pager</div>}
        />
      );
      expect(screen.getByText("my-toolbar")).toBeInTheDocument();
      expect(screen.getByText("my-pager")).toBeInTheDocument();
    });
  });

  describe("state slots", () => {
    it("shows a loading spinner when loading with no data", () => {
      render(<DataTable columns={columns} data={[]} loading />);
      expect(screen.getByText("Loading dataset...")).toBeInTheDocument();
      expect(screen.queryByText("Ada")).not.toBeInTheDocument();
    });

    it("keeps rows visible and overlays a spinner when loading with data", () => {
      render(<DataTable columns={columns} data={rows} getRowKey={getRowKey} loading />);
      expect(screen.getByText("Ada")).toBeInTheDocument();
      expect(screen.queryByText("Loading dataset...")).not.toBeInTheDocument();
    });

    it("renders an error alert instead of rows", () => {
      render(<DataTable columns={columns} data={[]} error="Boom" />);
      expect(screen.getByText("Error loading data")).toBeInTheDocument();
      expect(screen.getByText("Boom")).toBeInTheDocument();
    });

    it("renders an empty state with custom title and description", () => {
      render(
        <DataTable
          columns={columns}
          data={[]}
          emptyTitle="Nothing here"
          emptyDescription="Add a record to begin."
        />
      );
      expect(screen.getByText("Nothing here")).toBeInTheDocument();
      expect(screen.getByText("Add a record to begin.")).toBeInTheDocument();
    });
  });

  describe("row interaction", () => {
    it("calls onRowClick with the clicked row", () => {
      const onRowClick = vi.fn();
      render(
        <DataTable columns={columns} data={rows} getRowKey={getRowKey} onRowClick={onRowClick} />
      );
      fireEvent.click(screen.getByText("Alan"));
      expect(onRowClick).toHaveBeenCalledTimes(1);
      expect(onRowClick).toHaveBeenCalledWith(rows[1]);
    });
  });

  describe("sorting", () => {
    it("marks sortable columns with aria-sort and reflects the active direction", () => {
      const { rerender } = render(
        <DataTable columns={columns} data={rows} getRowKey={getRowKey} onSort={vi.fn()} />
      );
      // sortable but not active
      const nameHeader = screen.getByRole("columnheader", { name: /Name/ });
      expect(nameHeader).toHaveAttribute("aria-sort", "none");
      // non-sortable column exposes no aria-sort
      expect(screen.getByRole("columnheader", { name: /Age/ })).not.toHaveAttribute("aria-sort");

      rerender(
        <DataTable
          columns={columns}
          data={rows}
          getRowKey={getRowKey}
          onSort={vi.fn()}
          sortBy="name"
          sortDirection="asc"
        />
      );
      expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
        "aria-sort",
        "ascending"
      );

      rerender(
        <DataTable
          columns={columns}
          data={rows}
          getRowKey={getRowKey}
          onSort={vi.fn()}
          sortBy="name"
          sortDirection="desc"
        />
      );
      expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
        "aria-sort",
        "descending"
      );
    });

    it("requests ascending sort on first click of an unsorted column", () => {
      const onSort = vi.fn();
      render(<DataTable columns={columns} data={rows} getRowKey={getRowKey} onSort={onSort} />);
      fireEvent.click(screen.getByRole("button", { name: /Name/ }));
      expect(onSort).toHaveBeenCalledWith("name", "asc");
    });

    it("toggles to descending when the active column is already ascending", () => {
      const onSort = vi.fn();
      render(
        <DataTable
          columns={columns}
          data={rows}
          getRowKey={getRowKey}
          onSort={onSort}
          sortBy="name"
          sortDirection="asc"
        />
      );
      fireEvent.click(screen.getByRole("button", { name: /Name/ }));
      expect(onSort).toHaveBeenCalledWith("name", "desc");
    });

    it("renders no sort button when onSort is absent", () => {
      render(<DataTable columns={columns} data={rows} getRowKey={getRowKey} />);
      expect(screen.queryByRole("button", { name: /Name/ })).not.toBeInTheDocument();
    });
  });

  describe("selection", () => {
    function Selectable({ initial = [] as number[] }) {
      const [selected, setSelected] = React.useState<Set<React.Key>>(new Set(initial));
      return (
        <DataTable
          columns={columns}
          data={rows}
          getRowKey={getRowKey}
          selectedRows={selected}
          onSelectionChange={setSelected}
        />
      );
    }

    it("adds a select-all checkbox and one checkbox per row", () => {
      render(<Selectable />);
      expect(screen.getByLabelText("Select all rows")).toBeInTheDocument();
      expect(screen.getByLabelText("Select row 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Select row 3")).toBeInTheDocument();
    });

    it("selects a single row on checkbox change", () => {
      render(<Selectable />);
      fireEvent.click(screen.getByLabelText("Select row 1"));
      expect(screen.getByLabelText("Select row 1")).toBeChecked();
      expect(screen.getByLabelText("Select row 2")).not.toBeChecked();
    });

    it("selects every row via select-all and reflects the checked state", () => {
      render(<Selectable />);
      fireEvent.click(screen.getByLabelText("Select all rows"));
      expect(screen.getByLabelText("Select all rows")).toBeChecked();
      expect(screen.getByLabelText("Select row 1")).toBeChecked();
      expect(screen.getByLabelText("Select row 2")).toBeChecked();
      expect(screen.getByLabelText("Select row 3")).toBeChecked();
    });

    it("marks the header checkbox indeterminate on a partial selection", () => {
      render(<Selectable initial={[1]} />);
      const header = screen.getByLabelText("Select all rows") as HTMLInputElement;
      expect(header.indeterminate).toBe(true);
      expect(header.checked).toBe(false);
    });

    it("does not trigger onRowClick when toggling a row checkbox", () => {
      const onRowClick = vi.fn();
      const [selected, setSelected] = [new Set<React.Key>(), vi.fn()];
      render(
        <DataTable
          columns={columns}
          data={rows}
          getRowKey={getRowKey}
          onRowClick={onRowClick}
          selectedRows={selected}
          onSelectionChange={setSelected}
        />
      );
      fireEvent.click(screen.getByLabelText("Select row 1"));
      expect(setSelected).toHaveBeenCalledTimes(1);
      expect(onRowClick).not.toHaveBeenCalled();
    });
  });
});
