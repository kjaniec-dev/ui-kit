// @kjaniec-dev/ui — barrel export
// React component library built on the @kjaniec-dev/design token system.

export { cn } from "./lib/cn";

export { Button, buttonVariants, type ButtonProps } from "./components/button";
export { Badge, badgeVariants, type BadgeProps } from "./components/badge";
export { Alert, type AlertProps } from "./components/alert";
export { Spinner, type SpinnerProps } from "./components/spinner";
export { Progress, type ProgressProps } from "./components/progress";

export { Input, Textarea, TextField, type InputProps, type TextareaProps, type TextFieldProps } from "./components/input";
export { Label, Hint, Field, type LabelProps, type HintProps } from "./components/field";
export { Select, SelectField, type SelectProps, type SelectFieldProps } from "./components/select";

export { Checkbox, CheckboxField, Radio, type CheckboxProps, type CheckboxFieldProps, type RadioProps } from "./components/checkbox";
export { Switch, type SwitchProps } from "./components/switch";
export { Slider, sliderThumbCSS, type SliderProps } from "./components/slider";
export { Segmented, type SegmentedProps, type SegmentedOption } from "./components/segmented";
export { ToggleGroup, type ToggleGroupProps, type ToggleGroupOption } from "./components/toggle-group";

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
export { BottomNavigation, type BottomNavigationItem, type BottomNavigationProps } from "./components/bottom-navigation";

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
export {
  SectionHeader,
  type SectionHeaderProps,
  type SectionHeaderAlign,
  type SectionHeaderHeadingLevel,
  type SectionHeaderKickerProps,
  type SectionHeaderTitleProps,
  type SectionHeaderDescriptionProps,
  type SectionHeaderActionsProps,
} from "./components/section-header";
export { EmptyState, type EmptyStateProps } from "./components/empty-state";
export { MetricCard, type MetricCardProps } from "./components/metric-card";
export { DataTable, type DataTableProps, type DataTableColumn } from "./components/data-table";
export { FormField, type FormFieldProps } from "./components/form-field";
export { ErrorState, type ErrorStateProps } from "./components/error-state";
export { Skeleton, type SkeletonProps } from "./components/skeleton";
export { DashboardShell, type DashboardShellProps } from "./components/dashboard-shell";

export { SettingsLayout, type SettingsLayoutProps } from "./components/settings-layout";
export { DetailPageLayout, type DetailPageLayoutProps } from "./components/detail-page-layout";
export { TableToolbar, type TableToolbarProps } from "./components/table-toolbar";
export { ConfirmDialog, type ConfirmDialogProps } from "./components/confirm-dialog";
export { Drawer, type DrawerProps } from "./components/drawer";
export { CommandPalette, type CommandPaletteItem, type CommandPaletteProps } from "./components/command-palette";
export { SidebarNav, type SidebarNavItem, type SidebarNavGroup, type SidebarNavProps } from "./components/sidebar-nav";
export { Fab, type FabProps } from "./components/fab";
export {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetContent,
  BottomSheetFooter,
  type BottomSheetProps,
} from "./components/bottom-sheet";

export { Kbd, type KbdProps } from "./components/kbd";
export { CodeBlock, type CodeBlockProps } from "./components/code-block";
export { Separator, type SeparatorProps } from "./components/separator";
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  type PopoverProps,
  type PopoverContentProps,
} from "./components/popover";
export {
  Combobox,
  ComboboxField,
  type ComboboxOption,
  type ComboboxProps,
  type ComboboxFieldProps,
} from "./components/combobox";

export { Calendar, type CalendarProps } from "./components/calendar";
export {
  DatePicker,
  DatePickerField,
  type DatePickerProps,
  type DatePickerFieldProps,
} from "./components/date-picker";
export { RangeCalendar, type RangeCalendarProps, type DateRange } from "./components/range-calendar";
export {
  DateRangePicker,
  DateRangePickerField,
  type DateRangePickerProps,
  type DateRangePickerFieldProps,
} from "./components/date-range-picker";

export { Dropzone, type DropzoneProps } from "./components/dropzone";

export {
  FileUpload,
  FileUploadField,
  type FileUploadProps,
  type FileUploadFieldProps,
  type UploadItem,
  type UploadStatus,
  type FileRejection,
} from "./components/file-upload";

export {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
  TimelineTime,
  type TimelineProps,
  type TimelineItemProps,
  type TimelineSeparatorProps,
  type TimelineConnectorProps,
  type TimelineDotProps,
  type TimelineContentProps,
  type TimelineAlign,
  type TimelineDotVariant,
  type TimelineDotSize,
} from "./components/timeline";

export {
  Stepper,
  StepperList,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
  StepperContent,
  useStepper,
  type StepperProps,
  type StepperListProps,
  type StepperItemProps,
  type StepperTriggerProps,
  type StepperIndicatorProps,
  type StepperTitleProps,
  type StepperDescriptionProps,
  type StepperSeparatorProps,
  type StepperContentProps,
  type StepperOrientation,
  type UseStepperOptions,
  type UseStepperReturn,
} from "./components/stepper";
export {
  AppShell,
  AppShellBanner,
  AppShellHeader,
  AppShellMain,
  AppShellFooter,
} from "./components/app-shell";
export type {
  AppShellProps,
  AppShellBannerProps,
  AppShellHeaderProps,
  AppShellMainProps,
  AppShellFooterProps,
} from "./components/app-shell";

export { Rating, type RatingProps, type RatingSize, type RatingIconType } from "./components/rating/rating";

