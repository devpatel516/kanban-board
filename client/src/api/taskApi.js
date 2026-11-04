// What this file does: sends task requests and stores the shared API failure-test switch.
// When to edit: add an API endpoint or change how requests are sent.

import { API_BASE_URL } from "../constants.js";

// This module value lets the Header change request headers without adding another state system.
export let simulateApiFailure = false;
let authToken = localStorage.getItem("kanban-token") || "";

// Saves the current login token so every task request is tied to one account.
export function setAuthToken(token) {
  authToken = token || "";
  if (authToken) {
    localStorage.setItem("kanban-token", authToken);
  } else {
    localStorage.removeItem("kanban-token");
  }
}

// Reads the saved token while the app checks whether the user is still signed in.
export function getSavedAuthToken() {
  return authToken;
}

// Changes whether every API request asks the server to simulate a failure.
export function setSimulateApiFailure(isEnabled) {
  simulateApiFailure = isEnabled;
}

// Sends a fetch request and throws a readable Error if anything goes wrong.
async function sendRequest(path, options = {}) {
  // Keep the test header on every request, including the reload after a failed mutation.
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (authToken) {
    headers.Authorization = "Bearer " + authToken;
  }
  if (simulateApiFailure) {
    headers["x-simulate-failure"] = "true";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // The server returns { error: { code, message } } on failure.
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data?.error?.message || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// Creates a new account and starts a signed-in session.
export async function signUp(body) {
  return sendRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Signs in an existing account.
export async function logIn(body) {
  return sendRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Checks whether the saved token still belongs to a valid account.
export async function getCurrentUser() {
  return sendRequest("/api/auth/me");
}

// Returns all tasks sorted by columnId then orderIndex.
export async function getTasks() {
  return sendRequest("/api/tasks");
}

// Creates a task. body = { title, description, priority, tags, columnId }
export async function createTask(body) {
  return sendRequest("/api/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Edits content fields. body = { title?, description?, priority?, tags? }
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

// Moves a task. body = { columnId, prevId, nextId, version }
export async function moveTask(id, body) {
  return sendRequest(`/api/tasks/${id}/move`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
