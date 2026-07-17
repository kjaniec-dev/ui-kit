import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
  TimelineTime,
} from "./timeline";
import { Card } from "./card";

const meta = {
  title: "Display/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  decorators: [(Story) => <div style={{ maxWidth: 500, padding: 24 }}><Story /></div>],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MinimalLog: Story = {
  render: () => (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="sm" variant="success" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <TimelineTitle>Database Migrated</TimelineTitle>
            <TimelineTime>5m ago</TimelineTime>
          </div>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="sm" variant="primary" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <TimelineTitle>Server Started</TimelineTitle>
            <TimelineTime>15m ago</TimelineTime>
          </div>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="sm" />
        </TimelineSeparator>
        <TimelineContent>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <TimelineTitle>Code Repository Created</TimelineTitle>
            <TimelineTime>1h ago</TimelineTime>
          </div>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const RichFeed: Story = {
  render: () => (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="lg" variant="primary">
            <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>JD</span>
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>John Doe</span>
            <span style={{ color: "var(--kj-muted-foreground)", fontSize: "0.875rem" }}>pushed commit</span>
            <code style={{ fontSize: "0.75rem", background: "var(--kj-muted)", padding: "2px 4px", borderRadius: 4 }}>e1cdb7b</code>
            <TimelineTime style={{ marginLeft: "auto" }}>10m ago</TimelineTime>
          </div>
          <Card style={{ marginTop: 8 }}>
            <div style={{ padding: 12, fontSize: "0.8125rem", color: "var(--kj-muted-foreground)" }}>
              feat(ui): add new separator divider style configuration options
            </div>
          </Card>
        </TimelineContent>
      </TimelineItem>
      
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="lg" variant="success">
            ✓
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <TimelineTitle>Production Release v1.2.0</TimelineTitle>
            <TimelineTime>Yesterday</TimelineTime>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.8125rem", color: "var(--kj-muted-foreground)" }}>
            Automatically deployed to server cluster via GitHub Actions.
          </p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const Alternating: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 800, padding: 24 }}><Story /></div>],
  render: () => (
    <Timeline align="alternate">
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="md" variant="primary" />
          <TimelineConnector dashed />
        </TimelineSeparator>
        <TimelineContent>
          <TimelineTitle>Project Kickoff</TimelineTitle>
          <TimelineTime>Jan 2026</TimelineTime>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.8125rem", color: "var(--kj-muted-foreground)" }}>
            Initial brainstorming, specification documentation, and team sync.
          </p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="md" variant="secondary" />
          <TimelineConnector dashed />
        </TimelineSeparator>
        <TimelineContent>
          <TimelineTitle>Alpha Testing</TimelineTitle>
          <TimelineTime>Mar 2026</TimelineTime>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.8125rem", color: "var(--kj-muted-foreground)" }}>
            Internal release to design system team and selected SaaS developers.
          </p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="md" variant="success" />
        </TimelineSeparator>
        <TimelineContent>
          <TimelineTitle>General Availability</TimelineTitle>
          <TimelineTime>Jul 2026</TimelineTime>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.8125rem", color: "var(--kj-muted-foreground)" }}>
            Published components to npm registry, integrated showcase app shell, full documentation complete.
          </p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};
