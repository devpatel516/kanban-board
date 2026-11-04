// What this file does: connects task URLs to their controller functions.
// When to edit: add an endpoint or change its URL.

import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  moveTask,
  updateTask,
} from "../controllers/taskController.js";
import { requireUser } from "../auth.js";

const taskRoutes = Router();

// All task reads and changes are limited to the signed-in user's board.
taskRoutes.use(requireUser);

// Lists tasks so the client can load every board column.
taskRoutes.get("/", getTasks);

// Creates a task at the end of its column.
taskRoutes.post("/", createTask);

// Updates a task's editable fields.
taskRoutes.patch("/:id", updateTask);

// Deletes a task.
taskRoutes.delete("/:id", deleteTask);

// Applies a task move through the version-checked controller.
taskRoutes.patch("/:id/move", moveTask);

export default taskRoutes;
