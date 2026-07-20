# Modularization of site/src/main.tsx Design Specification

**Date:** 2026-07-20  
**Status:** Approved  
**Target:** `@kjaniec-dev/site` (`site/src/`)  

---

## 1. Overview & Objectives

Refactor `site/src/main.tsx` (2,112 lines) into a clean, modular structure under `site/src/sections/`. This improves codebase hygiene, reduces context size when adding showcase demos for future components, and keeps `main.tsx` under ~200 lines as a light root application orchestrator.

---

## 2. Directory Structure

```
site/src/
├── sections/
│   ├── primitives.tsx
│   ├── forms.tsx
│   ├── data-display.tsx
│   ├── navigation.tsx
│   ├── overlays.tsx
│   ├── layouts.tsx
│   └── index.ts
└── main.tsx
```

---

## 3. Module Categorization & Contents

### 3.1 `sections/primitives.tsx`
- **Demos**: Basic button variants, badges, alerts, spinners, progress bars, avatars, stat cards, kbd elements, separators.
- **Components**: `PrimitivesSections`

### 3.2 `sections/forms.tsx`
- **Demos**: Inputs, textareas, selects, checkboxes, switches, sliders, date pickers, range pickers, dropzone file uploads, rating suite, color pickers.
- **Components**: `FormsSections`

### 3.3 `sections/data-display.tsx`
- **Demos**: Cards, tables, data-table, accordions, timelines, code blocks, project cards, blog cards, pricing cards.
- **Components**: `DataDisplaySections`

### 3.4 `sections/navigation.tsx`
- **Demos**: Tabs, breadcrumbs, pagination, bottom navigation, dropdown menus, command palettes, steppers.
- **Components**: `NavigationSections`

### 3.5 `sections/overlays.tsx`
- **Demos**: Modals, drawers, bottom sheets, confirm dialogs, tooltips, popovers, inbox popovers.
- **Components**: `OverlaysSections`

### 3.6 `sections/layouts.tsx`
- **Demos**: AppShell, DashboardShell, SettingsLayout, DetailPageLayout, SectionHeader, TableToolbar.
- **Components**: `LayoutsSections`

### 3.7 `sections/index.ts`
- Re-exports all 6 category section components.

---

## 4. Root Orchestrator (`main.tsx`)

`main.tsx` retains:
- App state (sidebar open, search query, dark/light theme toggle).
- Top navigation bar & sidebar drawer.
- Section renderers calling `<PrimitivesSections />`, `<FormsSections />`, `<DataDisplaySections />`, `<NavigationSections />`, `<OverlaysSections />`, `<LayoutsSections />`.

---

## 5. Verification & Backlog Update

1. Build site: `npm run build --workspace=site`
2. Test site: `npm test`
3. Update `docs/BACKLOG.md`: mark `- [x] Split site/src/main.tsx`
