import type { Meta, StoryObj } from "@storybook/react";
import {
  Table, TableWrap, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "./table";
import { Avatar } from "./avatar";
import { Badge } from "./badge";

const meta = {
  title: "Data/Table",
  component: Table,
  tags: ["autodocs"],
  decorators: [(Story) => <div style={{ maxWidth: 720 }}><Story /></div>],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithStatusAndAvatars: Story = {
  render: () => (
    <TableWrap>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead numeric>Projects</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar size="sm" tone="primary">AK</Avatar>Anna Kowalski</div></TableCell>
            <TableCell>Administrator</TableCell>
            <TableCell><Badge variant="success" dot>Active</Badge></TableCell>
            <TableCell numeric>24</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar size="sm">MR</Avatar>Michael Rutkowski</div></TableCell>
            <TableCell>Editor</TableCell>
            <TableCell><Badge variant="warning" dot>Invited</Badge></TableCell>
            <TableCell numeric>12</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar size="sm" tone="info">JN</Avatar>Julia Nowak</div></TableCell>
            <TableCell>Viewer</TableCell>
            <TableCell><Badge>Inactive</Badge></TableCell>
            <TableCell numeric>3</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableWrap>
  ),
};
