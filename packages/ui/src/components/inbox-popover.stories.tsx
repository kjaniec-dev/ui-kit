import type { Meta, StoryObj } from "@storybook/react";
import {
  InboxPopover,
  InboxTrigger,
  InboxContent,
  useInboxState,
  type NotificationItemData,
} from "./inbox-popover";

const SAMPLE_ITEMS: NotificationItemData[] = [
  {
    id: "1",
    title: (
      <span>
        Deployment <strong>prod-v3.2</strong> succeeded
      </span>
    ),
    icon: (
      <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    timestamp: new Date(Date.now() - 2 * 60_000),
    read: false,
    href: "#",
  },
  {
    id: "2",
    title: (
      <span>
        <strong>KJ</strong> commented on Dashboard PR
      </span>
    ),
    body: '"Looks great, just one nit on line 42..."',
    avatarFallback: "KJ",
    timestamp: new Date(Date.now() - 14 * 60_000),
    read: false,
    href: "#",
  },
  {
    id: "3",
    title: (
      <span>
        Invoice <strong>#1042</strong> paid
      </span>
    ),
    icon: (
      <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    timestamp: new Date(Date.now() - 3_600_000),
    read: true,
    href: "#",
  },
];

function LiveDemo({ initialItems }: { initialItems: NotificationItemData[] }) {
  const { items, unreadCount, markAllRead, dismiss } = useInboxState(initialItems);
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "24px" }}>
      <InboxPopover>
        <InboxTrigger unreadCount={unreadCount} />
        <InboxContent
          items={items}
          onMarkAllRead={markAllRead}
          onDismiss={dismiss}
          viewAllHref="#"
        />
      </InboxPopover>
    </div>
  );
}

const meta: Meta<typeof InboxPopover> = {
  title: "Components/InboxPopover",
  component: InboxPopover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <LiveDemo initialItems={SAMPLE_ITEMS} />,
};

export const Empty: Story = {
  render: () => <LiveDemo initialItems={[]} />,
};

export const AllRead: Story = {
  render: () => <LiveDemo initialItems={SAMPLE_ITEMS.map((i) => ({ ...i, read: true }))} />,
};
