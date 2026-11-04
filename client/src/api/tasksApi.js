// What this file does: every fetch call to the Express API lives here, one function per endpoint.
// When to edit: add a new API call, change headers, or handle auth tokens.

import { API_BASE_URL } from "../constants.js";

// ─── Helper ──────────────────────────────────────────────────────────────────

// Sends a fetch request and throws a readable Error if anything goes wrong.
// Sharing this helper means we don't repeat try/response.ok/json() in every function.
async function sendRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // The server always returns { error: { code, message } } on failure.
  // We extract that message so it can be shown directly in a toast notification.
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data?.error?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return response.json();
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

// Returns all tasks sorted by columnId then orderIndex.
export async function getTasks() {
  return sendRequest("/api/tasks");
}

// Creates a new task. body = { title, description, priority, tags, columnId }
export async function createTask(body) {
  return sendRequest("/api/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Edits content fields. body = { title?, description?, priority?, tags? }
// Only send the fields you want to change – the server does a partial update.
export async function updateTask(id, body) {
  return sendRequest(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// Permanently deletes a task.
export async function deleteTask(id) {
  return sendRequest(`/api/tasks/${id}`, { method: "DELETE" });
}

// Moves a task to a new column and/or position.
// body = { columnId, prevId, nextId, version }
export async function moveTask(id, body) {
  return sendRequest(`/api/tasks/${id}/move`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
