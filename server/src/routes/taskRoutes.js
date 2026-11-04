// What this file does: maps every URL + HTTP method to its controller function.
// When to edit: add a new endpoint or change a URL path.

import { Router } from "express";
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
} from "../controllers/taskController.js";
import { simulateFailure } from "../middleware/simulateFailure.js";

const router = Router();

// GET /api/tasks — fetch all tasks (read-only, no failure simulation needed)
router.get("/", getAllTasks);

// POST /api/tasks — create a new task
// simulateFailure runs first; if the header is set it short-circuits here.
router.post("/", simulateFailure, createTask);

// PATCH /api/tasks/:id/move — move a task to a new column / position
// IMPORTANT: this route MUST be declared before "/:id" below.
// Express matches routes in the order they are defined. If "/:id" came first,
// a request to "/abc123/move" would match "/:id" with id = "abc123" and then
// Express would try to match "/move" as a sub-path, which would 404.
router.patch("/:id/move", simulateFailure, moveTask);

// PATCH /api/tasks/:id — edit a task's content fields (title, description, etc.)
router.patch("/:id", simulateFailure, updateTask);

// DELETE /api/tasks/:id — permanently remove a task
router.delete("/:id", simulateFailure, deleteTask);

export default router;
