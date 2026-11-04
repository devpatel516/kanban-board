// What this file does: one function per API endpoint. Each function reads the
//   request, talks to MongoDB via the Task model, and sends back JSON.
// When to edit: change business logic for any endpoint (validation, DB query, response).

import { Task } from "../models/Task.js";
import { COLUMNS, PRIORITIES, ORDER_GAP } from "../constants.js";

// ─── Helper ──────────────────────────────────────────────────────────────────

// Creates a standard error object that errorHandler.js knows how to format.
// Using a helper keeps every controller line short and readable.
function makeError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

// ─── GET /api/tasks ───────────────────────────────────────────────────────────

// Returns every task, sorted first by columnId then by orderIndex (ascending).
// The client uses this one big list to populate all three columns at once.
export async function getAllTasks(req, res, next) {
  try {
    const tasks = await Task.find().sort({ columnId: 1, orderIndex: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

// ─── POST /api/tasks ──────────────────────────────────────────────────────────

// Creates a new task and appends it to the END of its column.
// "End" means: max(orderIndex in that column) + ORDER_GAP.
// Example: last card in "todo" has orderIndex 3000 → new card gets 4000.
export async function createTask(req, res, next) {
  try {
    const { title, description, priority, tags, columnId } = req.body;

    // ── Manual validation ─────────────────────────────────────────────────
    // We check these ourselves instead of using a library to keep things simple
    // and so you can see exactly what gets checked and why.

    if (!title || title.trim() === "") {
      return next(makeError("Title is required", 400, "VALIDATION_ERROR"));
    }

    if (title.trim().length > 120) {
      return next(makeError("Title must be 120 characters or fewer", 400, "VALIDATION_ERROR"));
    }

    // priority is optional on create (the model defaults to "Medium"),
    // but if the caller sends one it must be a valid value.
    if (priority && !PRIORITIES.includes(priority)) {
      return next(
        makeError(`Priority must be one of: ${PRIORITIES.join(", ")}`, 400, "VALIDATION_ERROR")
      );
    }

    if (!columnId || !COLUMNS.includes(columnId)) {
      return next(
        makeError(`columnId must be one of: ${COLUMNS.join(", ")}`, 400, "VALIDATION_ERROR")
      );
    }

    // ── Find the highest orderIndex already in this column ────────────────
    // We only look at one document (the last one when sorted descending)
    // so this query is fast even with many tasks.
    const lastTaskInColumn = await Task.findOne({ columnId })
      .sort({ orderIndex: -1 })
      .select("orderIndex");

    // If the column is empty, start at ORDER_GAP (e.g. 1000).
    // Otherwise go one gap above the current last card.
    const newOrderIndex = lastTaskInColumn
      ? lastTaskInColumn.orderIndex + ORDER_GAP
      : ORDER_GAP;

    // ── Create and save ───────────────────────────────────────────────────
    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      priority: priority || "Medium",
      tags: tags || [],
      columnId,
      orderIndex: newOrderIndex,
      version: 0,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

// ─── PATCH /api/tasks/:id ─────────────────────────────────────────────────────

// Edits the content fields of a task: title, description, priority, tags.
// Does NOT change columnId or orderIndex (that is moveTask's job).
export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, priority, tags } = req.body;

    // ── Manual validation ─────────────────────────────────────────────────
    if (title !== undefined) {
      if (title.trim() === "") {
        return next(makeError("Title cannot be empty", 400, "VALIDATION_ERROR"));
      }
      if (title.trim().length > 120) {
        return next(makeError("Title must be 120 characters or fewer", 400, "VALIDATION_ERROR"));
      }
    }

    if (priority !== undefined && !PRIORITIES.includes(priority)) {
      return next(
        makeError(`Priority must be one of: ${PRIORITIES.join(", ")}`, 400, "VALIDATION_ERROR")
      );
    }

    // Build the update object dynamically – only include fields the caller sent.
    // This way a PATCH with just { priority: "High" } doesn't wipe out the title.
    const fieldsToUpdate = {};
    if (title !== undefined)       fieldsToUpdate.title       = title.trim();
    if (description !== undefined) fieldsToUpdate.description = description;
    if (priority !== undefined)    fieldsToUpdate.priority    = priority;
    if (tags !== undefined)        fieldsToUpdate.tags        = tags;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return next(makeError("No valid fields provided to update", 400, "VALIDATION_ERROR"));
    }

    // new: true means Mongoose returns the UPDATED document, not the old one.
    // runValidators: true re-runs the schema validations on the new values.
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return next(makeError("Task not found", 404, "NOT_FOUND"));
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────

// Permanently removes a task from the database.
export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return next(makeError("Task not found", 404, "NOT_FOUND"));
    }

    // 200 with the deleted task so the client knows which card to remove from the UI.
    res.json({ message: "Task deleted", task: deletedTask });
  } catch (error) {
    next(error);
  }
}

// ─── PATCH /api/tasks/:id/move ────────────────────────────────────────────────

// Moves a task to a new column and/or position.
// Body: { columnId, prevId, nextId, version }
//
// orderIndex calculation (fractional insertion):
//   prevId present → fetch its orderIndex as "prev"
//   nextId present → fetch its orderIndex as "next"
//   Both present:  newOrderIndex = (prev + next) / 2    e.g. (1000+2000)/2 = 1500
//   Only prev:     newOrderIndex = prev + ORDER_GAP      e.g. 1000+1000    = 2000
//   Only next:     newOrderIndex = next / 2              e.g. 2000/2       = 1000
//   Neither:       newOrderIndex = ORDER_GAP             e.g. 1000 (column was empty)
//
// version check: if the stored version > client's version, someone else
//   already moved this card → reject with 409 so the client can re-fetch.
export async function moveTask(req, res, next) {
  try {
    const { id } = req.params;
    const { columnId, prevId, nextId, version } = req.body;

    // ── Validate the target column ────────────────────────────────────────
    if (!columnId || !COLUMNS.includes(columnId)) {
      return next(
        makeError(`columnId must be one of: ${COLUMNS.join(", ")}`, 400, "VALIDATION_ERROR")
      );
    }

    // ── Fetch the task to check its current version ───────────────────────
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return next(makeError("Task not found", 404, "NOT_FOUND"));
    }

    // If the stored version is higher than what the client sent, the task was
    // already updated by someone else. Reject to avoid overwriting their change.
    if (version !== undefined && existingTask.version > version) {
      return next(
        makeError(
          "Task was updated by someone else. Please refresh and try again.",
          409,
          "VERSION_CONFLICT"
        )
      );
    }

    // ── Calculate the new orderIndex ──────────────────────────────────────
    let prevOrderIndex = null;
    let nextOrderIndex = null;

    // Look up the neighbour orderIndexes only when IDs are provided.
    if (prevId) {
      const prevTask = await Task.findById(prevId).select("orderIndex");
      if (prevTask) prevOrderIndex = prevTask.orderIndex;
    }
    if (nextId) {
      const nextTask = await Task.findById(nextId).select("orderIndex");
      if (nextTask) nextOrderIndex = nextTask.orderIndex;
    }

    let newOrderIndex;

    if (prevOrderIndex !== null && nextOrderIndex !== null) {
      // Dropped between two cards: pick the midpoint.
      // Example: prev=1000, next=2000 → newOrderIndex = 1500
      newOrderIndex = (prevOrderIndex + nextOrderIndex) / 2;
    } else if (prevOrderIndex !== null) {
      // Dropped at the bottom of the column (nothing below it).
      // Example: prev=3000 → newOrderIndex = 4000
      newOrderIndex = prevOrderIndex + ORDER_GAP;
    } else if (nextOrderIndex !== null) {
      // Dropped at the top of the column (nothing above it).
      // Example: next=2000 → newOrderIndex = 1000
      newOrderIndex = nextOrderIndex / 2;
    } else {
      // Column was completely empty.
      newOrderIndex = ORDER_GAP;
    }

    // ── Atomic update with $set ───────────────────────────────────────────
    // $inc increments the version by 1 so the next caller knows the data changed.
    // Using findOneAndUpdate (not save) keeps this a single round-trip to MongoDB.
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id },
      {
        $set: { columnId, orderIndex: newOrderIndex },
        $inc: { version: 1 },
      },
      { new: true }
    );

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

