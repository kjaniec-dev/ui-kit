import * as React from "react";
import { cn } from "../lib/cn";
import { Table, TableWrap, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";
import { Spinner } from "./spinner";
import { Alert } from "./alert";
import { EmptyState } from "./empty-state";

export interface DataTableColumn<T> {
  header: React.ReactNode;
  accessor: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sortKey?: string;
}

export interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;

  // Production-grade features
  getRowKey?: (row: T, index: number) => React.Key;
  onRowClick?: (row: T) => void;
  toolbar?: React.ReactNode;
  pagination?: React.ReactNode;
  selectedRows?: Set<React.Key>;
  onSelectionChange?: (selectedKeys: Set<React.Key>) => void;

  // Sorting props
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (sortKey: string, direction: "asc" | "desc") => void;
}

export function DataTable<T>({
  className,
  columns,
  data,
  loading = false,
  error,
  emptyTitle = "No data available",
  emptyDescription = "There are no records to display at this time.",
  emptyAction,
  getRowKey,
  onRowClick,
  toolbar,
  pagination,
  selectedRows,
  onSelectionChange,
  sortBy,
  sortDirection,
  onSort,
  ...props
}: DataTableProps<T>) {
  const getRowId = React.useCallback(
    (row: T, index: number) => (getRowKey ? getRowKey(row, index) : index),
    [getRowKey]
  );

  const isSelectionActive = selectedRows !== undefined && onSelectionChange !== undefined;

  const allSelected = React.useMemo(() => {
    if (!isSelectionActive || data.length === 0) return false;
    return data.every((row, idx) => selectedRows.has(getRowId(row, idx)));
  }, [isSelectionActive, data, selectedRows, getRowId]);

  const someSelected = React.useMemo(() => {
    if (!isSelectionActive || data.length === 0) return false;
    const selectedCount = data.filter((row, idx) => selectedRows.has(getRowId(row, idx))).length;
    return selectedCount > 0 && selectedCount < data.length;
  }, [isSelectionActive, data, selectedRows, getRowId]);

  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    const checked = e.target.checked;
    const next = new Set<React.Key>(selectedRows);
    data.forEach((row, idx) => {
      const id = getRowId(row, idx);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
    });
    onSelectionChange(next);
  };

  const handleSelectRow = (row: T, idx: number, checked: boolean) => {
    if (!onSelectionChange || !selectedRows) return;
    const id = getRowId(row, idx);
    const next = new Set<React.Key>(selectedRows);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    onSelectionChange(next);
  };

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      {/* Toolbar Slot */}
      {toolbar && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {toolbar}
        </div>
      )}

      <TableWrap className="relative overflow-hidden" {...props}>
        <Table>
          <TableHeader>
            <TableRow>
              {/* Row selection checkbox in header */}
              {isSelectionActive && (
                <TableHead className="w-12 px-4 text-center">
                  <div className="inline-flex items-center justify-center">
                    <input
                      type="checkbox"
                      ref={headerCheckboxRef}
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                  </div>
                </TableHead>
              )}
              {columns.map((col, idx) => {
                const alignClass = {
                  left: "text-left",
                  center: "text-center",
                  right: "text-right",
                }[col.align || "left"];
                const isSortable = col.sortable && onSort && col.sortKey;
                const isSortedActive = sortBy && col.sortKey === sortBy;

                return (
                  <TableHead
                    key={idx}
                    className={cn(
                      alignClass,
                      isSortable && "cursor-pointer select-none hover:bg-muted/30 transition-colors",
                      col.className
                    )}
                    onClick={() => {
                      if (!isSortable || !col.sortKey) return;
                      const nextDirection =
                        isSortedActive && sortDirection === "asc" ? "desc" : "asc";
                      onSort(col.sortKey, nextDirection);
                    }}
                  >
                    <div className={cn("inline-flex items-center gap-1.5", alignClass === "text-right" && "justify-end w-full")}>
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="text-[10px] text-muted-foreground shrink-0 select-none">
                          {isSortedActive ? (
                            sortDirection === "asc" ? "▲" : "▼"
                          ) : (
                            "⇅"
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (isSelectionActive ? 1 : 0)} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Spinner size={32} />
                    <span className="text-sm text-muted-foreground">Loading dataset...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length + (isSelectionActive ? 1 : 0)} className="p-8">
                  <Alert variant="danger" title="Error loading data">
                    {error}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (isSelectionActive ? 1 : 0)} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                    className="border-none bg-transparent rounded-none py-16"
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIdx) => {
                const rowKey = getRowId(row, rowIdx);
                const isSelected = isSelectionActive && selectedRows.has(rowKey);
                return (
                  <TableRow
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-muted/40 transition-colors",
                      isSelected && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    {isSelectionActive && (
                      <TableCell
                        className="w-12 px-4 text-center"
                        onClick={(e) => {
                          // Stop propagation to prevent triggering onRowClick
                          e.stopPropagation();
                        }}
                      >
                        <div className="inline-flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(row, rowIdx, e.target.checked)}
                            className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                          />
                        </div>
                      </TableCell>
                    )}
                    {columns.map((col, colIdx) => {
                      const alignClass = {
                        left: "text-left",
                        center: "text-center",
                        right: "text-right",
                      }[col.align || "left"];
                      return (
                        <TableCell key={colIdx} className={cn(alignClass, col.className)}>
                          {col.accessor(row)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {loading && data.length > 0 && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] grid place-items-center z-10 transition-opacity duration-150">
            <Spinner size={36} />
          </div>
        )}
      </TableWrap>

      {/* Pagination Slot */}
      {pagination && <div className="flex items-center justify-end w-full">{pagination}</div>}
    </div>
  );
}
DataTable.displayName = "DataTable";
