// What this file does: connects task URLs to their controller functions.
// When to edit: add an endpoint or change its URL.

import { Router } from "express";
import { moveTask } from "../controllers/taskController.js";

const taskRoutes = Router();

// Applies a task move through the version-checked controller.
taskRoutes.patch("/:id/move", moveTask);

export default taskRoutes;
