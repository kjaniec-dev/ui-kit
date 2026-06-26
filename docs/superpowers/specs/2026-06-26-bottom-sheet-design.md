# BottomSheet Design Spec

## 1. Overview
The `BottomSheet` component is a responsive overlay dialog. On mobile viewports, it slides up from the bottom of the screen (bottom sheet) and includes a decorative drag handle. On desktop viewports, it behaves like a centered modal dialog. 

## 2. Requirements & Behavior
- **Visibility**: Rendered only when `open` is true.
- **Backdrop**: Backdrop overlay with `backdrop-blur` and custom opacity, clicking it closes the sheet.
- **Dismissal**:
  - Backdrop click triggers `onClose()`.
  - Pressing `Escape` triggers `onClose()`.
- **Body Scroll Lock**: When open, standard scroll is disabled on `document.body` by setting its overflow style to `hidden` and restoring it when closed or unmounted.
- **Responsive Layout**:
  - **Mobile**: Slides up from the bottom, spans full width or max-width at bottom. Features a decorative Drag Handle.
  - **Desktop**: Centered modal overlay panel with configurable max-width.
- **Compound Components Pattern**:
  - `BottomSheet` (root container & state provider)
  - `BottomSheetHeader` (header container)
  - `BottomSheetTitle` (accessible title, matches context `titleId`)
  - `BottomSheetDescription` (accessible description, matches context `descId`)
  - `BottomSheetContent` (body content)
  - `BottomSheetFooter` (actions footer)
- **Accessibility**:
  - Main container has `role="dialog"`.
  - `aria-modal="true"`.
  - `aria-labelledby` linked to `BottomSheetTitle` ID.
  - `aria-describedby` linked to `BottomSheetDescription` ID.

## 3. Architecture & Context API
A `BottomSheetContext` will be used to pass dynamic `titleId` and `descId` auto-generated via React's `useId()` hook to the subcomponents so they link correctly for accessibility without requiring the user to pass manual IDs.

```typescript
const BottomSheetContext = React.createContext<{ titleId: string; descId: string } | null>(null);
```
