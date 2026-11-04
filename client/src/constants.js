// What this file does: stores every magic value used across the React client in one place.
// When to edit: add a column, change a priority color, or adjust UI spacing.

// The three board columns – order = left-to-right visual order.
// Each has an id (matches the DB) and a display label.
export const COLUMNS = [
  { id: "todo",        label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "done",        label: "Done" },
];

// Priority levels and the CSS class name for their colored badge.
// To add a new priority: add an entry here AND add the matching CSS class in styles/.
export const PRIORITY_STYLES = {
  Low:    "badge-low",
  Medium: "badge-medium",
  High:   "badge-high",
};

// The base URL for all API calls, pulled from Vite's env system.
// Set VITE_API_URL in .env (copy .env.example and fill it in).
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

