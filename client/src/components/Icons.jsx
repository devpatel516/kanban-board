// What this file does: provides small, accessible inline icons used throughout the app.
// When to edit: add another icon component here and use its stroke paths.

// This shared frame keeps every icon the same size, weight, and current text color.
function IconFrame({ children, size = 20 }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

// Shows a simple three-column board mark for the product brand.
export function BoardIcon() {
  return (
    <IconFrame>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M9 4v16M15 4v16" />
      <path d="M5.5 8h1M11.5 12h1M17.5 9h1" />
    </IconFrame>
  );
}

// Represents the light theme in theme controls.
export function SunIcon() {
  return (
    <IconFrame size={16}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </IconFrame>
  );
}

// Represents the dark theme in theme controls.
export function MoonIcon() {
  return (
    <IconFrame size={16}>
      <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
    </IconFrame>
  );
}

// Provides a plus sign for create buttons.
export function PlusIcon() {
  return (
    <IconFrame size={16}>
      <path d="M12 5v14M5 12h14" />
    </IconFrame>
  );
}

// Provides a compact card-actions menu icon.
export function KebabIcon() {
  return (
    <IconFrame size={16}>
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </IconFrame>
  );
}

// Closes a dialog or dismisses a small control.
export function XIcon() {
  return (
    <IconFrame size={16}>
      <path d="m6 6 12 12M18 6 6 18" />
    </IconFrame>
  );
}

// Indicates a delete action in card menus.
export function TrashIcon() {
  return (
    <IconFrame size={16}>
      <path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" />
    </IconFrame>
  );
}

// Indicates an edit action in card menus.
export function PencilIcon() {
  return (
    <IconFrame size={16}>
      <path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
    </IconFrame>
  );
}

// Indicates an earlier item or previous navigation step.
export function ChevronUpIcon() {
  return (
    <IconFrame size={16}>
      <path d="m6 14 6-6 6 6" />
    </IconFrame>
  );
}

// Indicates a later item or next navigation step.
export function ChevronDownIcon() {
  return (
    <IconFrame size={16}>
      <path d="m6 10 6 6 6-6" />
    </IconFrame>
  );
}

// Indicates a forward action.
export function ArrowRightIcon() {
  return (
    <IconFrame size={16}>
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </IconFrame>
  );
}

// Illustrates moving cards between columns.
export function DragIcon() {
  return (
    <IconFrame>
      <rect x="4" y="4" width="6" height="16" rx="2" />
      <rect x="14" y="4" width="6" height="16" rx="2" />
      <path d="M7 8h.01M7 12h.01M7 16h.01M17 8h.01M17 12h.01M17 16h.01" />
    </IconFrame>
  );
}

// Illustrates fast, immediate task updates.
export function BoltIcon() {
  return (
    <IconFrame>
      <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" />
    </IconFrame>
  );
}

// Illustrates returning a failed change to its previous state.
export function RollbackIcon() {
  return (
    <IconFrame>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h9a7 7 0 1 1-6.2 10.2" />
    </IconFrame>
  );
}

// Illustrates protection from overlapping updates.
export function ShieldCheckIcon() {
  return (
    <IconFrame>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      <path d="m9 12 2 2 4-4" />
    </IconFrame>
  );
}

// Illustrates switching between light and dark appearances.
export function ThemeIcon() {
  return (
    <IconFrame>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18a9 9 0 0 0 0-18Z" />
    </IconFrame>
  );
}

// Illustrates a layout that adapts to different screen sizes.
export function ScreenIcon() {
  return (
    <IconFrame>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8m-4-4v4" />
    </IconFrame>
  );
}
