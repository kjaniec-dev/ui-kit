import * as React from "react";
import {
  Button,
  Modal,
  ModalTitle,
  ModalDescription,
  ModalActions,
  ConfirmDialog,
  Drawer,
  BottomSheet,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetContent,
  BottomSheetFooter,
  CommandPalette,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  InboxPopover,
  InboxTrigger,
  InboxContent,
  useInboxState,
  type NotificationItemData,
  Card,
  TextField,
  SelectField,
  CheckboxField,
  useToast,
} from "@kjaniec-dev/ui";
import { Sec, Box, Sub, IcoPlus, IcoInfo, IcoSun } from "./primitives";

const INBOX_ITEMS: NotificationItemData[] = [
  {
    id: "i1",
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
    id: "i2",
    title: (
      <span>
        <strong>Alex</strong> approved your PR
      </span>
    ),
    body: '"LGTM 🚀 Merging now."',
    avatarFallback: "AL",
    timestamp: new Date(Date.now() - 20 * 60_000),
    read: false,
    href: "#",
  },
  {
    id: "i3",
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

export const codeInbox = `import { InboxPopover, InboxTrigger, InboxContent, useInboxState } from "@kjaniec-dev/ui";

function NotificationCenter() {
  const { items, unreadCount, markAllRead, dismiss } = useInboxState(initialItems);

  return (
    <InboxPopover>
      <InboxTrigger unreadCount={unreadCount} />
      <InboxContent
        items={items}
        onMarkAllRead={markAllRead}
        onDismiss={dismiss}
        viewAllHref="/notifications"
      />
    </InboxPopover>
  );
}`;

export function InboxDemo() {
  const { items, unreadCount, markAllRead, dismiss } = useInboxState(INBOX_ITEMS);
  return (
    <InboxPopover>
      <InboxTrigger unreadCount={unreadCount} />
      <InboxContent items={items} onMarkAllRead={markAllRead} onDismiss={dismiss} viewAllHref="#" />
    </InboxPopover>
  );
}

export function OverlaysSections() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);

  const cmdItems = [
    {
      id: "create-project",
      title: "Create new project",
      subtitle: "Add a new workspace to your dashboard",
      category: "Projects",
      shortcut: ["⌘", "N"],
      icon: IcoPlus,
      action: () => toast({ message: "Command: Create project selected", tone: "success" }),
    },
    {
      id: "toggle-theme",
      title: "Toggle dark mode",
      subtitle: "Switch between light and dark theme",
      category: "Settings",
      shortcut: ["⌘", "D"],
      icon: IcoSun,
      action: () => {
        document.documentElement.classList.toggle("dark");
      },
    },
    {
      id: "view-docs",
      title: "View documentation",
      subtitle: "Open the product kit documentation",
      category: "System",
      icon: IcoInfo,
      action: () => window.open("./docs/DESIGN.md", "_blank"),
    },
  ];

  return (
    <>
      <Sec
        id="overlays"
        title="Overlays & Dialogs"
        desc="Modals, confirm dialogs, side drawers, command palettes and tooltips."
        components={[
          "Modal",
          "ConfirmDialog",
          "Drawer",
          "CommandPalette",
          "Tooltip",
          "BottomSheet",
          "Fab",
        ]}
      >
        <Box>
          <div className="flex flex-wrap gap-3 items-center">
            <Button onClick={() => setOpen(true)}>Open custom modal</Button>
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              Open Confirm Dialog
            </Button>
            <Button variant="outline" onClick={() => setDrawerOpen(true)}>
              Open Side Drawer
            </Button>
            <Button variant="outline" onClick={() => setBottomSheetOpen(true)}>
              Open Bottom Sheet
            </Button>
            <Button
              variant="outline"
              onClick={() => setCmdOpen(true)}
              leadingIcon={
                <span className="font-mono text-xs border border-border px-1.5 py-0.5 rounded bg-subtle">
                  ⌘K
                </span>
              }
            >
              Open Command Palette
            </Button>
            <Tooltip content="Contextual tooltip">
              <Button variant="ghost">Hover for Tooltip</Button>
            </Tooltip>
          </div>
        </Box>
      </Sec>

      <Sec
        id="inbox-popover"
        title="InboxPopover"
        desc="Bell-triggered notification inbox with unread badge, mark-all-read, and per-item dismiss."
        components={["InboxPopover", "InboxTrigger", "InboxContent", "NotificationItem"]}
        code={codeInbox}
      >
        <Box>
          <div className="flex justify-end">
            <InboxDemo />
          </div>
        </Box>
      </Sec>

      <Sec
        id="popover"
        title="Popover"
        desc="Floating popover panels for contextual content, menus, and controls."
        components={["Popover", "PopoverTrigger", "PopoverContent"]}
        code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent side="bottom" align="start" className="w-64">
    <p className="m-0 mb-1 text-sm font-semibold">Quick help</p>
    <p className="m-0 text-sm text-muted-foreground">
      Popovers hold arbitrary content — filters, hints, pickers.
    </p>
  </PopoverContent>
</Popover>`}
      >
        <Box>
          <Sub>Popover</Sub>
          <div className="flex flex-wrap gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open popover</Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" className="w-64">
                <p className="m-0 mb-1 text-sm font-semibold">Quick help</p>
                <p className="m-0 text-sm text-muted-foreground">
                  Popovers hold arbitrary content — filters, hints, pickers.
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </Box>
      </Sec>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalTitle>Delete project "Q3 Launch"?</ModalTitle>
        <ModalDescription>
          This action cannot be undone. All files and activity history will be permanently deleted.
        </ModalDescription>
        <ModalActions>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setOpen(false);
              toast({ message: "Project deleted.", tone: "danger" });
            }}
          >
            Delete project
          </Button>
        </ModalActions>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete selection?"
        description="Are you sure you want to delete the selected projects? This action is permanent and cannot be undone."
        confirmLabel="Delete selected"
        tone="danger"
        loading={confirmLoading}
        onConfirm={() => {
          setConfirmLoading(true);
          setTimeout(() => {
            setConfirmLoading(false);
            setConfirmOpen(false);
            toast({ message: "Deleted projects successfully", tone: "danger" });
          }, 1500);
        }}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Project Specifications"
        description="Detailed B2B system configurations for the selected workspace."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">
              System Health
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="text-[10px] text-muted-foreground">Uptime</div>
                <div className="text-sm font-bold text-success">99.98%</div>
              </Card>
              <Card className="p-3">
                <div className="text-[10px] text-muted-foreground">API Latency</div>
                <div className="text-sm font-bold">42ms</div>
              </Card>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">
              General Settings
            </h3>
            <TextField
              label="Database URL"
              defaultValue="postgresql://db.kjaniec.dev:5432/main"
              readOnly
            />
            <SelectField label="Backup Frequency" defaultValue="daily">
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </SelectField>
            <CheckboxField label="Enable audit logs mirroring" defaultChecked />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setDrawerOpen(false);
                toast({ message: "Settings saved", tone: "success" });
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Drawer>

      <BottomSheet open={bottomSheetOpen} onClose={() => setBottomSheetOpen(false)}>
        <BottomSheetHeader>
          <BottomSheetTitle>Share this project</BottomSheetTitle>
          <BottomSheetDescription>
            Invite collaborators or copy a shareable link to this workspace.
          </BottomSheetDescription>
        </BottomSheetHeader>
        <BottomSheetContent>
          <div className="space-y-4">
            <TextField
              label="Share link"
              defaultValue="https://app.kjaniec.dev/share/proj-8f3a"
              readOnly
            />
            <SelectField label="Access level" defaultValue="view">
              <option value="view">View only</option>
              <option value="comment">Can comment</option>
              <option value="edit">Can edit</option>
            </SelectField>
            <CheckboxField label="Notify collaborators by email" defaultChecked />
          </div>
        </BottomSheetContent>
        <BottomSheetFooter>
          <Button variant="outline" onClick={() => setBottomSheetOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setBottomSheetOpen(false);
              toast({ message: "Invite link copied!", tone: "success" });
            }}
          >
            Copy &amp; Share
          </Button>
        </BottomSheetFooter>
      </BottomSheet>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} items={cmdItems} />
    </>
  );
}
