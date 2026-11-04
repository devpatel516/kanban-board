// What this file does: defines the Task shape stored in MongoDB and adds a DB index.
// When to edit: add/remove fields, change validation rules, or change index strategy.

import mongoose from "mongoose";

// The schema declares every field, its type, and any rules.
// Mongoose will reject documents that break these rules before they reach the DB.
const taskSchema = new mongoose.Schema(
  {
    // The card title – required so an empty card can never be saved.
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title must be 120 characters or fewer"],
    },

    // Optional longer text shown when the card is expanded.
    description: {
      type: String,
      default: "",
    },

    // Visual urgency indicator shown as a colored badge on the card.
    priority: {
      type: String,
      enum: {
        values: ["Low", "Medium", "High"],
        message: "Priority must be Low, Medium, or High",
      },
      default: "Medium",
    },

    // Free-form labels (e.g. "bug", "frontend") stored as an array of strings.
    tags: {
      type: [String],
      default: [],
    },

    // Which column the task lives in – must be one of the three fixed columns.
    columnId: {
      type: String,
      enum: {
        values: ["todo", "in-progress", "done"],
        message: "columnId must be todo, in-progress, or done",
      },
      required: [true, "columnId is required"],
    },

    // Fractional number used to sort cards within a column without renumbering everything.
    // Example: card A = 1000, card B = 2000 → card dropped between them gets 1500.
    orderIndex: {
      type: Number,
      default: 0,
    },

    // Optimistic-concurrency counter. The client sends the version it last read;
    // the server rejects the update if the stored version is already higher.
    // This prevents "last write wins" when two tabs are open at once.
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields – no manual work needed.
    timestamps: true,
  }
);

// Compound index on columnId + orderIndex.
// This makes the main query (get all tasks sorted per column) very fast,
// and also speeds up the "find max orderIndex in column" query inside createTask.
taskSchema.index({ columnId: 1, orderIndex: 1 });

export const Task = mongoose.model("Task", taskSchema);

