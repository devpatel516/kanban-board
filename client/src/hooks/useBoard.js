// What this file does: the ONLY custom hook – owns all board state and exposes
//   simple action functions to every component that needs them.
// When to edit: add a new action (duplicate task, archive), change how data loads.

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as tasksApi from "../api/tasksApi.js";

export function useBoard() {
  // The full flat list of tasks from the server.
  // Components filter this by columnId to populate each column.
  const [tasks, setTasks] = useState([]);

  // True while the initial load (or a reload) is in flight.
  const [isLoading, setIsLoading] = useState(true);

  // Holds an error message string if the initial load fails; null when healthy.
  const [error, setError] = useState(null);

  // ── Load ────────────────────────────────────────────────────────────────────

  // Fetches all tasks from the server and updates state.
  // Called once on mount (via useEffect) and again after every mutation
  // so the board always shows what the database actually contains.
  async function loadTasks() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tasksApi.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Run loadTasks once when the hook is first used (i.e. when Board mounts).
  // The empty array [] means "only run this effect once, not on every render".
  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mutations ───────────────────────────────────────────────────────────────

  // Creates a new task in a column.
  // taskData = { title, description, priority, tags, columnId }
  // Throws on failure so the TaskModal knows to stay open.
  async function addTask(taskData) {
    try {
      await tasksApi.createTask(taskData);
      toast.success("Task created!");
      await loadTasks();
    } catch (err) {
      toast.error(err.message);
      throw err; // re-throw so the modal can catch it and NOT close
    }
  }

  // Updates content fields (title, description, priority, tags) of an existing task.
  // Throws on failure so the TaskModal knows to stay open.
  async function editTask(id, taskData) {
    try {
      await tasksApi.updateTask(id, taskData);
      toast.success("Task updated!");
      await loadTasks();
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  }

  // Permanently deletes a task. Swallows errors – the board stays usable.
  async function removeTask(id) {
    try {
      await tasksApi.deleteTask(id);
      toast.success("Task deleted");
      await loadTasks();
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Moves a task to a new column and/or position.
  // moveBody = { columnId, prevId, nextId, version }
  // The Column component computes prevId/nextId based on neighbour cards.
  async function moveTask(id, moveBody) {
    try {
      await tasksApi.moveTask(id, moveBody);
      await loadTasks();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return {
    tasks,
    isLoading,
    error,
    reload: loadTasks, // exposed so the Board's retry button can re-fetch
    addTask,
    editTask,
    removeTask,
    moveTask,
  };
}
