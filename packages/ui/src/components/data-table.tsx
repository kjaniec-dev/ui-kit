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
}

export interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
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
  ...props
}: DataTableProps<T>) {
  return (
    <TableWrap className={cn("relative overflow-hidden", className)} {...props}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead key={idx} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Spinner size={32} />
                  <span className="text-sm text-muted-foreground">Loading dataset...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-8">
                <Alert variant="danger" title="Error loading data">
                  {error}
                </Alert>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0">
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                  className="border-none bg-transparent rounded-none py-16"
                />
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx} className={col.className}>
                    {col.accessor(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {loading && data.length > 0 && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] grid place-items-center z-10 transition-opacity duration-150">
          <Spinner size={36} />
        </div>
      )}
    </TableWrap>
  );
}
DataTable.displayName = "DataTable";
