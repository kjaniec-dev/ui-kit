import type { Meta } from "@storybook/react-vite";
import * as React from "react";
import { BottomNavigation } from "./bottom-navigation";

const meta = {
  title: "Navigation/BottomNavigation",
  component: BottomNavigation,
} satisfies Meta<typeof BottomNavigation>;

export default meta;

const IconHome = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconSearch = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconInbox = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const IconUser = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PhoneContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto w-[360px] h-[640px] border-[10px] border-slate-800 rounded-[32px] overflow-hidden bg-canvas shadow-xl flex flex-col justify-end">
    <div className="flex-1 p-6 text-foreground">
      <h3 className="text-lg font-bold mb-2">Mobile Screen Simulator</h3>
      <p className="text-sm text-muted-foreground">
        Click components at the bottom of the device preview to switch tabs.
      </p>
    </div>
    {children}
  </div>
);

export const Default = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState("home");

    const navItems = [
      {
        id: "home",
        label: "Home",
        icon: <IconHome />,
        active: activeTab === "home",
        onClick: () => setActiveTab("home"),
      },
      {
        id: "search",
        label: "Search",
        icon: <IconSearch />,
        active: activeTab === "search",
        onClick: () => setActiveTab("search"),
      },
      {
        id: "inbox",
        label: "Inbox",
        icon: <IconInbox />,
        active: activeTab === "inbox",
        badge: 3,
        onClick: () => setActiveTab("inbox"),
      },
      {
        id: "profile",
        label: "Profile",
        icon: <IconUser />,
        active: activeTab === "profile",
        onClick: () => setActiveTab("profile"),
      },
    ];

    return (
      <PhoneContainer>
        <BottomNavigation items={navItems} fixed={false} showLabels="always" />
      </PhoneContainer>
    );
  },
};

export const ActiveLabelsOnly = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState("home");

    const navItems = [
      {
        id: "home",
        label: "Home",
        icon: <IconHome />,
        active: activeTab === "home",
        onClick: () => setActiveTab("home"),
      },
      {
        id: "search",
        label: "Search",
        icon: <IconSearch />,
        active: activeTab === "search",
        onClick: () => setActiveTab("search"),
      },
      {
        id: "inbox",
        label: "Inbox",
        icon: <IconInbox />,
        active: activeTab === "inbox",
        badge: "new",
        onClick: () => setActiveTab("inbox"),
      },
      {
        id: "profile",
        label: "Profile",
        icon: <IconUser />,
        active: activeTab === "profile",
        onClick: () => setActiveTab("profile"),
      },
    ];

    return (
      <PhoneContainer>
        <BottomNavigation items={navItems} fixed={false} showLabels="active" />
      </PhoneContainer>
    );
  },
};

export const IconsOnly = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState("home");

    const navItems = [
      {
        id: "home",
        label: "Home",
        icon: <IconHome />,
        active: activeTab === "home",
        onClick: () => setActiveTab("home"),
      },
      {
        id: "search",
        label: "Search",
        icon: <IconSearch />,
        active: activeTab === "search",
        onClick: () => setActiveTab("search"),
      },
      {
        id: "inbox",
        label: "Inbox",
        icon: <IconInbox />,
        active: activeTab === "inbox",
        badge: 99,
        onClick: () => setActiveTab("inbox"),
      },
      {
        id: "profile",
        label: "Profile",
        icon: <IconUser />,
        active: activeTab === "profile",
        onClick: () => setActiveTab("profile"),
      },
    ];

    return (
      <PhoneContainer>
        <BottomNavigation items={navItems} fixed={false} showLabels="never" />
      </PhoneContainer>
    );
  },
};
