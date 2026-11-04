// What this file does: the ONLY custom hook – owns all board state and exposes
//   simple action functions to every component that needs them.
// When to edit: add a new action (duplicate task, archive), change how data loads.

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as tasksApi from "../api/tasksApi.js";
import { ORDER_GAP } from "../constants.js";

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
  async function loadTasks(showLoading = true, reportRefreshError = true) {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await tasksApi.getTasks();
      setTasks(data);
    } catch (err) {
      if (showLoading) {
        setError(err.message);
      } else if (reportRefreshError) {
        toast.error(err.message);
      }
    } finally {
      if (showLoading) setIsLoading(false);
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
    // 1) Save the current list so a failed request can restore exactly what was visible.
    const snapshot = [...tasks];

    // 2) Add a temporary card at the end of the selected column before contacting the server.
    const columnTasks = snapshot.filter((task) => task.columnId === taskData.columnId);
    const lastTask = columnTasks[columnTasks.length - 1];
    const now = new Date().toISOString();
    const optimisticTask = {
      ...taskData,
      _id: `optimistic-${Date.now()}`,
      orderIndex: lastTask ? lastTask.orderIndex + ORDER_GAP : ORDER_GAP,
      version: 0,
      createdAt: now,
      updatedAt: now,
    };
    setTasks([...snapshot, optimisticTask]);

    try {
      // 3) Save the new card on the server.
      await tasksApi.createTask(taskData);
    } catch (err) {
      // 4) Restore the snapshot, explain the failure, then ask the server for its latest list.
      setTasks(snapshot);
      toast.error(err.message);
      await loadTasks(false, false);
      throw err; // re-throw so the modal can catch it and NOT close
    }
    toast.success("Task created!");
    await loadTasks(false);
  }

  // Updates content fields (title, description, priority, tags) of an existing task.
  // Throws on failure so the TaskModal knows to stay open.
  async function editTask(id, taskData) {
    // 1) Save the current list so a failed request can restore exactly what was visible.
    const snapshot = [...tasks];

    // 2) Update only the edited card in the visible list.
    setTasks(snapshot.map((task) => (
      task._id === id ? { ...task, ...taskData } : task
    )));

    try {
      // 3) Save the edit on the server.
      await tasksApi.updateTask(id, taskData);
    } catch (err) {
      // 4) Restore the snapshot, explain the failure, then ask the server for its latest list.
      setTasks(snapshot);
      toast.error(err.message);
      await loadTasks(false, false);
      throw err;
    }
    toast.success("Task updated!");
    await loadTasks(false);
  }

  // Deletes a task immediately and restores it if the server rejects the request.
  async function removeTask(id) {
    // 1) Save the current list so a failed request can restore exactly what was visible.
    const snapshot = [...tasks];

    // 2) Remove the card from the visible list before contacting the server.
    setTasks(snapshot.filter((task) => task._id !== id));

    try {
      // 3) Delete the card on the server.
      await tasksApi.deleteTask(id);
    } catch (err) {
      // 4) Restore the snapshot, explain the failure, then ask the server for its latest list.
      setTasks(snapshot);
      toast.error(err.message);
      await loadTasks(false, false);
      return;
    }
    toast.success("Task deleted");
    await loadTasks(false);
  }

  // Moves a task to a new column and/or position.
  // moveBody = { columnId, prevId, nextId, version }
  // The Column component computes prevId/nextId based on neighbour cards.
  async function moveTask(id, moveBody) {
    // 1) Save the current list so a failed request can restore exactly what was visible.
    const snapshot = [...tasks];
    const movingTask = snapshot.find((task) => task._id === id);
    if (!movingTask) return;

    // 2) Place the card between its destination neighbors in the visible list.
    const remainingTasks = snapshot.filter((task) => task._id !== id);
    const previousTask = remainingTasks.find((task) => task._id === moveBody.prevId);
    const nextTask = remainingTasks.find((task) => task._id === moveBody.nextId);
    const destinationTasks = remainingTasks.filter(
      (task) => task.columnId === moveBody.columnId,
    );
    let insertionIndex = remainingTasks.length;
    if (nextTask) {
      insertionIndex = remainingTasks.findIndex((task) => task._id === nextTask._id);
    } else if (previousTask) {
      insertionIndex = remainingTasks.findIndex((task) => task._id === previousTask._id) + 1;
    }
    let orderIndex = ORDER_GAP;

    // A midpoint keeps fractional ordering, for example 1000 and 2000 produce 1500.
    if (previousTask && nextTask) {
      orderIndex = (previousTask.orderIndex + nextTask.orderIndex) / 2;
    } else if (previousTask) {
      orderIndex = previousTask.orderIndex + ORDER_GAP;
    } else if (nextTask) {
      orderIndex = nextTask.orderIndex - ORDER_GAP;
    } else if (destinationTasks.length > 0) {
      orderIndex = destinationTasks[destinationTasks.length - 1].orderIndex + ORDER_GAP;
    }

    const optimisticTask = {
      ...movingTask,
      columnId: moveBody.columnId,
      orderIndex,
      updatedAt: new Date().toISOString(),
    };
    const optimisticTasks = [...remainingTasks];
    optimisticTasks.splice(insertionIndex, 0, optimisticTask);
    setTasks(optimisticTasks);

    try {
      // 3) Save the new position on the server.
      await tasksApi.moveTask(id, moveBody);
    } catch (err) {
      // 4) Restore the snapshot, explain the failure, then ask the server for its latest list.
      setTasks(snapshot);
      toast.error(err.message);
      await loadTasks(false, false);
      return;
    }
    await loadTasks(false);
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
