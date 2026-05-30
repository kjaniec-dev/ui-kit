import type { Meta, StoryObj } from "@storybook/react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from "./card";
import { Stat } from "./stat";
import { Avatar, AvatarGroup } from "./avatar";
import { Button } from "./button";
import { Badge } from "./badge";

const meta = {
  title: "Layout/Card",
  component: Card,
  tags: ["autodocs"],
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <Badge variant="primary" className="self-start">Pro</Badge>
        <CardTitle>Team Workspace</CardTitle>
        <CardDescription>Unlimited projects, roles and activity history for your whole team.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button size="sm">Choose plan</Button>
        <Button size="sm" variant="ghost">Details</Button>
      </CardFooter>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Card elevated>
      <CardContent style={{ paddingTop: "1.35rem" }}>
        <CardTitle>Q3 Quarterly Report</CardTitle>
        <CardDescription>A summary of results and key product metrics.</CardDescription>
      </CardContent>
    </Card>
  ),
};

export const AsArticle: Story = {
  render: () => (
    <Card as="article">
      <CardHeader>
        <CardTitle>Semantic Article Card</CardTitle>
        <CardDescription>This card renders as an &lt;article&gt; element.</CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: "0.85rem", color: "var(--kj-muted-foreground)" }}>
          Inspect the DOM — the root element is an article, not a div.
        </p>
      </CardContent>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card interactive>
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>Hover to see the lift effect.</CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: "0.85rem", color: "var(--kj-muted-foreground)" }}>
          This card uses the interactive prop — hover:-translate-y-1 and hover:shadow-kj-md.
        </p>
      </CardContent>
    </Card>
  ),
};

export const Stats: StoryObj = {
  decorators: [(Story) => <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 720 }}><Story /></div>],
  render: () => (
    <>
      <Stat label="MRR" value="$128.4k" delta="12.3% MoM" trend="up" />
      <Stat label="Active users" value="8,942" delta="4.1% MoM" trend="up" />
      <Stat label="Churn" value="2.8%" delta="0.6% MoM" trend="down" />
    </>
  ),
};

export const Avatars: StoryObj = {
  decorators: [(Story) => <div style={{ maxWidth: 720 }}><Story /></div>],
  render: () => (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <Avatar size="sm">SM</Avatar>
      <Avatar>KJ</Avatar>
      <Avatar size="lg" tone="primary">PL</Avatar>
      <Avatar tone="info" status>ON</Avatar>
      <AvatarGroup>
        <Avatar>AK</Avatar>
        <Avatar tone="primary">MR</Avatar>
        <Avatar tone="info">JN</Avatar>
        <Avatar tone="muted">+9</Avatar>
      </AvatarGroup>
    </div>
  ),
};
