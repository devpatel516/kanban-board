// What this file does: fills the database with realistic sample tasks.
// When to edit: change the sample data – just edit the SAMPLE_TASKS array below.
// Run with: npm run seed

import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "./db.js";
import { Task } from "./models/Task.js";

dotenv.config();

// ─── Sample data ──────────────────────────────────────────────────────────────
// Edit this array to change what gets seeded.
// orderIndex is spaced by 1000 so you can insert cards between them later.
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_TASKS = [
  // ── To Do ──────────────────────────────────────────────────────────────────
  {
    title: "Research competitor pet-food apps",
    description: "Survey at least 3 similar apps and document their UX patterns and pricing pages.",
    priority: "High",
    tags: ["research", "strategy"],
    columnId: "todo",
    orderIndex: 1000,
    version: 0,
  },
  {
    title: "Design the homepage hero section",
    description: "Create a wireframe showing the value proposition, CTA button, and pet photo.",
    priority: "High",
    tags: ["design", "ui"],
    columnId: "todo",
    orderIndex: 2000,
    version: 0,
  },
  {
    title: "Write product description copy",
    description: "Draft copy for the top 20 menu items. Keep each description under 60 words.",
    priority: "Medium",
    tags: ["content", "marketing"],
    columnId: "todo",
    orderIndex: 3000,
    version: 0,
  },
  {
    title: "Set up email notification service",
    description: "Integrate a transactional email provider for order confirmations.",
    priority: "Medium",
    tags: ["backend", "email"],
    columnId: "todo",
    orderIndex: 4000,
    version: 0,
  },
  {
    title: "Add image upload for menu items",
    description: "Allow restaurant owners to upload a photo per dish. Store in cloud storage.",
    priority: "Low",
    tags: ["feature", "backend"],
    columnId: "todo",
    orderIndex: 5000,
    version: 0,
  },

  // ── In Progress ────────────────────────────────────────────────────────────
  {
    title: "Build the Kanban board UI",
    description: "React components: Board, Column, Card. Drag-and-drop with dnd-kit.",
    priority: "High",
    tags: ["frontend", "react"],
    columnId: "in-progress",
    orderIndex: 1000,
    version: 0,
  },
  {
    title: "Implement drag-and-drop ordering",
    description: "Use @dnd-kit/sortable. Update orderIndex via PATCH /tasks/:id/move on drop.",
    priority: "High",
    tags: ["frontend", "dnd"],
    columnId: "in-progress",
    orderIndex: 2000,
    version: 0,
  },
  {
    title: "Connect frontend to Express API",
    description: "Wire up all five endpoints in tasksApi.js. Show toast on success and error.",
    priority: "Medium",
    tags: ["frontend", "api"],
    columnId: "in-progress",
    orderIndex: 3000,
    version: 0,
  },
  {
    title: "Style the card component",
    description: "Priority badge colours, tag pills, hover shadow, responsive width.",
    priority: "Low",
    tags: ["css", "ui"],
    columnId: "in-progress",
    orderIndex: 4000,
    version: 0,
  },

  // ── Done ───────────────────────────────────────────────────────────────────
  {
    title: "Scaffold MERN monorepo",
    description: "Root package.json with concurrently, server ESM setup, Vite client.",
    priority: "High",
    tags: ["devops", "setup"],
    columnId: "done",
    orderIndex: 1000,
    version: 0,
  },
  {
    title: "Define Task Mongoose schema",
    description: "Fields: title, description, priority, tags, columnId, orderIndex, version.",
    priority: "Medium",
    tags: ["backend", "database"],
    columnId: "done",
    orderIndex: 2000,
    version: 0,
  },
  {
    title: "Write environment variable documentation",
    description: "Added .env.example for both server and client with comments on each variable.",
    priority: "Low",
    tags: ["docs"],
    columnId: "done",
    orderIndex: 3000,
    version: 0,
  },
];

// ─── Seed runner ──────────────────────────────────────────────────────────────

async function seed() {
  await connectDatabase();

  // Remove all existing tasks so we always start from a clean, known state.
  const deleteResult = await Task.deleteMany({});
  console.log(`Deleted ${deleteResult.deletedCount} existing tasks`);

  // Insert all sample tasks in one round-trip.
  const inserted = await Task.insertMany(SAMPLE_TASKS);
  console.log(`Seeded ${inserted.length} tasks across 3 columns`);

  // Close the connection – the script should exit cleanly after this.
  await mongoose.connection.close();
  console.log("Done – database connection closed");
}

seed();

