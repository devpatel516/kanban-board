// What this file does: moves one task between fixed columns using safe fractional ordering.
// When to edit: change how a move is validated, ordered, or saved.

import mongoose from "mongoose";
import { COLUMNS, MIN_GAP, ORDER_GAP } from "../constants.js";
import { Task } from "../models/Task.js";

// Returns tasks sorted for the board's columns and cards.
export async function getTasks(req, res, next) {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ columnId: 1, orderIndex: 1 });
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
}

// Creates a task at the end of its selected column.
export async function createTask(req, res, next) {
  try {
    const { columnId, title, description, priority, tags } = req.body;
    const lastTask = await Task.findOne({ columnId, userId: req.user._id }).sort({ orderIndex: -1 });
    const orderIndex = lastTask ? lastTask.orderIndex + ORDER_GAP : ORDER_GAP;
    const task = await Task.create({
      title,
      description,
      priority,
      tags,
      columnId,
      orderIndex,
      userId: req.user._id,
    });

    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
}

// Updates editable task details without changing its column or ordering.
export async function updateTask(req, res, next) {
  try {
    const { title, description, priority, tags } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, description, priority, tags },
      { new: true, runValidators: true },
    );

    if (!task) {
      return res.status(404).json({
        error: { code: "TASK_NOT_FOUND", message: "Task was not found." },
      });
    }

    return res.json(task);
  } catch (error) {
    return next(error);
  }
}

// Permanently removes one task by its database ID.
export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({
        error: { code: "TASK_NOT_FOUND", message: "Task was not found." },
      });
    }

    return res.json({ message: "Task deleted." });
  } catch (error) {
    return next(error);
  }
}

// Reads the requested neighbors and rejects IDs that no longer belong to the destination column.
async function findMoveNeighbors(prevId, nextId, columnId, userId) {
  const neighborIds = [];
  if (prevId) neighborIds.push(prevId);
  if (nextId) neighborIds.push(nextId);

  const neighbors = await Task.find({
    _id: { $in: neighborIds },
    columnId,
    userId,
  }).select("_id orderIndex").lean();

  if (neighbors.length !== neighborIds.length) return null;

  return {
    previousTask: neighbors.find((task) => String(task._id) === prevId) || null,
    nextTask: neighbors.find((task) => String(task._id) === nextId) || null,
  };
}

// Calculates a clear midpoint or end position from the two neighbors.
function calculateOrderIndex(previousTask, nextTask) {
  if (!previousTask && !nextTask) {
    // Empty column example: no neighbors -> orderIndex 1000.
    return ORDER_GAP;
  }
  if (!previousTask) {
    // Top example: next=2000 -> orderIndex 1000.
    return nextTask.orderIndex - ORDER_GAP;
  }
  if (!nextTask) {
    // Bottom example: prev=3000 -> orderIndex 4000.
    return previousTask.orderIndex + ORDER_GAP;
  }

  // Between example: prev=1000 and next=2000 -> orderIndex 1500.
  return (previousTask.orderIndex + nextTask.orderIndex) / 2;
}

// Renumbers destination cards with a single write so later insertions have room for a midpoint.
async function renumberDestinationColumn(columnId, movingTaskId, userId) {
  const columnTasks = await Task.find({
    columnId,
    userId,
    _id: { $ne: movingTaskId },
  }).sort({ orderIndex: 1, _id: 1 }).select("_id").lean();

  // Repeated midpoint moves shrink the available gap; fresh 1000-point spacing restores room.
  const updates = columnTasks.map((task, index) => ({
    updateOne: {
      filter: { _id: task._id },
      update: { $set: { orderIndex: (index + 1) * ORDER_GAP } },
    },
  }));
  if (updates.length > 0) {
    await Task.bulkWrite(updates);
  }
}

// Sends a standard conflict response with the latest task so the client can recover.
function sendConflict(res, message, currentTask) {
  return res.status(409).json({
    error: { code: "TASK_VERSION_CONFLICT", message },
    currentTask,
  });
}

// Validates a move, calculates its fractional position, and saves it with a version-checked atomic update.
export async function moveTask(req, res, next) {
  try {
    const { columnId, prevId = null, nextId = null, version } = req.body;
    const taskId = req.params.id;

    if (!mongoose.isValidObjectId(taskId)
      || (prevId && !mongoose.isValidObjectId(prevId))
      || (nextId && !mongoose.isValidObjectId(nextId))
      || !COLUMNS.includes(columnId)
      || !Number.isInteger(version)
      || version < 0
      || (prevId && prevId === nextId)
      || taskId === prevId
      || taskId === nextId) {
      return res.status(400).json({
        error: { code: "INVALID_MOVE", message: "Move details are invalid." },
      });
    }

    const currentTask = await Task.findOne({ _id: taskId, userId: req.user._id }).lean();
    if (!currentTask) {
      return res.status(404).json({
        error: { code: "TASK_NOT_FOUND", message: "Task was not found." },
      });
    }

    // A known stale version cannot safely choose the intended neighbors.
    if (currentTask.version !== version) {
      return sendConflict(res, "Task changed before this move.", currentTask);
    }

    let neighbors = await findMoveNeighbors(prevId, nextId, columnId, req.user._id);
    if (!neighbors) {
      return sendConflict(res, "A destination neighbor changed before this move.", currentTask);
    }

    const otherDestinationTasks = await Task.countDocuments({
      columnId,
      userId: req.user._id,
      _id: { $nin: [taskId, prevId, nextId].filter(Boolean) },
    });
    if (!neighbors.previousTask && !neighbors.nextTask && otherDestinationTasks > 0) {
      return sendConflict(res, "Destination position changed before this move.", currentTask);
    }

    let orderIndex = calculateOrderIndex(neighbors.previousTask, neighbors.nextTask);
    if (neighbors.previousTask && neighbors.nextTask) {
      const gap = neighbors.nextTask.orderIndex - neighbors.previousTask.orderIndex;
      if (gap < MIN_GAP) {
        await renumberDestinationColumn(columnId, taskId, req.user._id);
        neighbors = await findMoveNeighbors(prevId, nextId, columnId, req.user._id);
        if (!neighbors) {
          return sendConflict(res, "A destination neighbor changed before this move.", currentTask);
        }

        orderIndex = calculateOrderIndex(neighbors.previousTask, neighbors.nextTask);
        const newGap = neighbors.nextTask.orderIndex - neighbors.previousTask.orderIndex;
        if (newGap < MIN_GAP) {
          return sendConflict(res, "Could not create enough space for this move.", currentTask);
        }
      }
    }

    // The version filter and increment make competing moves on this card mutually exclusive.
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: req.user._id, version },
      {
        $set: { columnId, orderIndex },
        $inc: { version: 1 },
      },
      { new: true, runValidators: true },
    );

    if (!updatedTask) {
      const latestTask = await Task.findOne({ _id: taskId, userId: req.user._id }).lean();
      return sendConflict(res, "Task changed before this move.", latestTask);
    }

    return res.json(updatedTask);
  } catch (error) {
    return next(error);
  }
}
