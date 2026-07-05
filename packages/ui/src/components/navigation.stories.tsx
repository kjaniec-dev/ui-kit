import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "./dropdown-menu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from "./breadcrumb";
import { Pagination } from "./pagination";
import { Button } from "./button";

const meta = { title: "Navigation/Overview", tags: ["autodocs"] } satisfies Meta;
export default meta;
type Story = StoryObj;

export const TabsStory: Story = {
  name: "Tabs",
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">A dashboard with key metrics and quick actions.</TabsContent>
        <TabsContent value="activity">An event timeline: sign-ins, edits and comments.</TabsContent>
        <TabsContent value="settings">Workspace preferences, permissions and integrations.</TabsContent>
      </Tabs>
    </div>
  ),
};

export const AccordionStory: Story = {
  name: "Accordion",
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Accordion type="single" defaultValue={["a"]}>
        <AccordionItem value="a"><AccordionTrigger>How does billing work?</AccordionTrigger><AccordionContent>Monthly or annually — the annual plan includes two months free.</AccordionContent></AccordionItem>
        <AccordionItem value="b"><AccordionTrigger>Can I change my plan later?</AccordionTrigger><AccordionContent>Yes, at any time. The difference is prorated.</AccordionContent></AccordionItem>
        <AccordionItem value="c"><AccordionTrigger>What payment methods are supported?</AccordionTrigger><AccordionContent>Visa, Mastercard and Apple Pay.</AccordionContent></AccordionItem>
      </Accordion>
    </div>
  ),
};

export const DropdownMenuStory: Story = {
  name: "Dropdown menu",
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem danger>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const BreadcrumbStory: Story = {
  name: "Breadcrumb",
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="#">Workspace</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem href="#">Projects</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem current>Q3 Launch</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const PaginationStory: Story = {
  name: "Pagination",
  render: () => {
    const [page, setPage] = React.useState(3);
    return <Pagination page={page} pageCount={9} onPageChange={setPage} />;
  },
};
