// What this file does: defines the Task shape that is stored in MongoDB.
// When to edit: add/remove fields, change validation rules, or update defaults.

import mongoose from "mongoose";

// The schema declares every field, its type, and any rules.
// Mongoose will reject documents that break these rules before they hit the DB.
const taskSchema = new mongoose.Schema(
  {
    // Every card belongs to one account and is never returned to another account.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // The card title – required so an empty card can never be saved
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title must be 120 characters or fewer"],
    },

    // Optional longer text shown when the card is expanded
    description: {
      type: String,
      default: "",
    },

    // Visual urgency indicator shown as a colored badge on the card
    priority: {
      type: String,
      enum: {
        values: ["Low", "Medium", "High"],
        message: "Priority must be Low, Medium, or High",
      },
      default: "Medium",
    },

    // Free-form labels (e.g. "bug", "frontend") stored as an array of strings
    tags: {
      type: [String],
      default: [],
    },

    // Which column the task lives in – must be one of the three fixed columns
    columnId: {
      type: String,
      enum: {
        values: ["todo", "in-progress", "done"],
        message: "columnId must be todo, in-progress, or done",
      },
      required: true,
    },

    // Fractional number used to sort cards within a column without renumbering everything.
    // Example: if card A has orderIndex 1000 and card B has 2000,
    // a card dropped between them gets orderIndex 1500.
    orderIndex: {
      type: Number,
      default: 0,
    },

    // Optimistic-concurrency counter. The client sends the version it last saw;
    // the server rejects the update if the stored version is already higher.
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields – no manual work needed
    timestamps: true,
  }
);

export const Task = mongoose.model("Task", taskSchema);
