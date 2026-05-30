"use client";

// @kjaniec-dev/ui — barrel export
// React component library built on the @kjaniec-dev/design token system.

export { cn } from "./lib/cn";

export { Button, buttonVariants, type ButtonProps } from "./components/button";
export { Badge, badgeVariants, type BadgeProps } from "./components/badge";
export { Alert, type AlertProps } from "./components/alert";
export { Spinner, type SpinnerProps } from "./components/spinner";
export { Progress, type ProgressProps } from "./components/progress";

export { Input, Textarea, type InputProps, type TextareaProps } from "./components/input";
export { Label, Hint, Field, type LabelProps, type HintProps } from "./components/field";
export { Select, type SelectProps } from "./components/select";

export { Checkbox, Radio, type CheckboxProps, type RadioProps } from "./components/checkbox";
export { Switch, type SwitchProps } from "./components/switch";
export { Slider, sliderThumbCSS, type SliderProps } from "./components/slider";
export { Segmented, type SegmentedProps, type SegmentedOption } from "./components/segmented";

export {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  type CardProps,
} from "./components/card";
export { Stat, type StatProps } from "./components/stat";
export { Avatar, AvatarGroup, type AvatarProps } from "./components/avatar";

export {
  Tabs, TabsList, TabsTrigger, TabsContent,
  type TabsProps, type TabsTriggerProps, type TabsContentProps,
} from "./components/tabs";
export {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  type AccordionProps, type AccordionItemProps,
} from "./components/accordion";
export {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  type DropdownMenuContentProps, type DropdownMenuItemProps,
} from "./components/dropdown-menu";
export {
  Breadcrumb, BreadcrumbItem, BreadcrumbSeparator,
  type BreadcrumbItemProps,
} from "./components/breadcrumb";
export { Pagination, type PaginationProps } from "./components/pagination";

export {
  Table, TableWrap, TableHeader, TableBody, TableRow, TableHead, TableCell,
  type TableCellProps,
} from "./components/table";
export { Tooltip, type TooltipProps } from "./components/tooltip";
export {
  Modal, ModalTitle, ModalDescription, ModalActions,
  type ModalProps,
} from "./components/modal";
export {
  ToastProvider, useToast,
  type ToastOptions, type ToastTone,
} from "./components/toast";
export { PageHeader, type PageHeaderProps } from "./components/page-header";
