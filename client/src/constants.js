// What this file does: stores every magic value used across the React client.
// When to edit: add a column, change a priority colour class, or update the API URL.

// The three board columns – order = visual left-to-right order.
// id must match the server's columnId values exactly.
export const COLUMNS = [
  { id: "todo",        label: "To Do"       },
  { id: "in-progress", label: "In Progress" },
  { id: "done",        label: "Done"        },
];

// Priority levels that the form <select> displays.
// Order here = order in the dropdown.
export const PRIORITIES = ["Low", "Medium", "High"];

// Maps each priority to its CSS class name for the badge.
// To add a new priority: add an entry here AND add the matching CSS rule in PriorityBadge.css.
export const PRIORITY_STYLES = {
  Low:    "badge--low",
  Medium: "badge--medium",
  High:   "badge--high",
};

// Base URL for every fetch call. Reads from Vite's env system.
// Set VITE_API_URL in client/.env (copy client/.env.example).
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
