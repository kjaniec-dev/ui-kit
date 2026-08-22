import type { Meta } from "@storybook/react-vite";
import { DataTable, type DataTableColumn } from "./data-table";
import { Badge } from "./badge";
import { Button } from "./button";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "suspended" | "pending";
}

const sampleData: UserRow[] = [
  { id: "1", name: "John Doe", email: "john.doe@gmail.com", role: "Owner", status: "active" },
  {
    id: "2",
    name: "Alice Kovalsky",
    email: "alice@example.com",
    role: "Administrator",
    status: "active",
  },
  { id: "3", name: "Bob Peterson", email: "bob@example.com", role: "Member", status: "pending" },
  {
    id: "4",
    name: "Charlie Adams",
    email: "charlie@example.com",
    role: "Member",
    status: "suspended",
  },
];

const columns: DataTableColumn<UserRow>[] = [
  {
    header: "Name",
    accessor: (row) => <span className="font-semibold">{row.name}</span>,
  },
  {
    header: "Email",
    accessor: (row) => <span className="text-muted-foreground">{row.email}</span>,
  },
  {
    header: "Role",
    accessor: (row) => <span>{row.role}</span>,
  },
  {
    header: "Status",
    accessor: (row) => {
      const variant = {
        active: "success",
        suspended: "danger",
        pending: "warning",
      }[row.status] as "success" | "danger" | "warning";

      return <Badge variant={variant}>{row.status}</Badge>;
    },
  },
];

const meta = {
  title: "Data/DataTable",
  component: DataTable,
  tags: ["autodocs"],
} satisfies Meta<typeof DataTable>;

export default meta;

export const Default = {
  render: () => <DataTable columns={columns} data={sampleData} />,
};

export const LoadingEmpty = {
  render: () => <DataTable columns={columns} data={[]} loading />,
};

export const LoadingOverlay = {
  render: () => <DataTable columns={columns} data={sampleData} loading />,
};

export const Empty = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      emptyTitle="No members found"
      emptyDescription="Try inviting a new member using their email address."
      emptyAction={<Button size="sm">Invite Member</Button>}
    />
  ),
};

export const ErrorState = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      error="Failed to load member directory. Check your connection or retry."
    />
  ),
};
