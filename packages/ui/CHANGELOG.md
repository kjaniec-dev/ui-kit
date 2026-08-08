# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.2] - 2026-08-08

### Added
- `AppShell` mobile bottom navigation bar (`bottomNav` slot) and body scroll locking when mobile navigation menu is open.
- `Stepper` responsive vertical auto-stacking on narrow viewports.

### Fixed
- `InboxPopover` responsive alignment, positioning, and max-width bounds on mobile devices.
- Responsive card grid layouts across showcase layout demos.
- MCP components metadata generation and CI linter fixes.

## [0.9.0] - 2026-07-21

### Added
- `ProgressRing` & `ProgressRingField` components (SVG circular progress with 4 size presets, 6 tone colors, center content slot, and form field wrapper).
- `ImageGallery` component with responsive thumbnail grid, `maxVisible` overflow counter (`+N`), and interactive Modal lightbox with keyboard navigation (`←`, `→`, `Esc`).
- Storybook stories for `ProgressRing` and `ImageGallery`.
- Vitest unit tests for `@kjaniec-dev/ui-mcp` extractor.
- `CHANGELOG.md` files across `@kjaniec-dev/ui` and `@kjaniec-dev/design`.

## [0.8.0] - 2026-07-20

### Added
- ColorPicker component suite (`ColorPicker`, `ColorPickerField`, `ColorPickerSwatch`).
- Showcase site modularization (`site/src/main.tsx`).

### Changed
- ESLint configuration migrated to ESLint v9 Flat Config.

## [0.7.0] - 2026-07-11

### Added
- Rating suite (`Rating`, `RatingField`, `RatingSummary`).
- `InboxPopover` and `NotificationCenter` components.
- `MetricCard` component.
- `DataTable` selection & custom toolbar capabilities.
- `FileUpload` and `Dropzone` components.
- `DatePicker` and `DateRangePicker` components.
- `Combobox` component.

## [0.6.0] - 2026-07-05

### Added
- `Timeline` and `ActivityFeed` components.
- `Stepper` and `Wizard` components.
- `ToggleGroup` component.
- `Separator` component.

## [0.5.0] - 2026-06-28

### Added
- B2B showcase components (`AppShell`, `SectionHeader`, `BlogCard`, `ProjectCard`, `PricingCard`).

## [0.4.0] - 2026-06-20

### Added
- Navigation & overlay components (`Tabs`, `Breadcrumb`, `Pagination`, `BottomNavigation`, `DropdownMenu`, `CommandPalette`, `Modal`, `Drawer`, `ConfirmDialog`, `BottomSheet`).

## [0.3.0] - 2026-06-12

### Added
- Form control components (`Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Slider`, `Segmented`).

## [0.2.0] - 2026-06-05

### Added
- Data display & feedback primitives (`Card`, `Stat`, `Table`, `Badge`, `Alert`, `Progress`, `Spinner`, `Skeleton`, `ErrorState`).

## [0.1.0] - 2026-05-28

### Added
- Initial release of `@kjaniec-dev/ui` component library.
