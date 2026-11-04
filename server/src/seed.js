// What this file does: seeds the database with sample tasks so you have data to look at immediately.
// When to edit: change the sample tasks, add more columns, or reset to a clean state.

import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "./db.js";
import { User } from "./models/User.js";

dotenv.config();

// Sample tasks – one for each column so the board looks populated on first run
const sampleTasks = [
  {
    title: "Research competitor apps",
    description: "Look at 3 similar products and note their best features.",
    priority: "High",
    tags: ["research"],
    columnId: "todo",
    orderIndex: 1000,
    version: 0,
  },
  {
    title: "Design the card component",
    description: "Create a wireframe for the task card UI.",
    priority: "Medium",
    tags: ["design", "ui"],
    columnId: "todo",
    orderIndex: 2000,
    version: 0,
  },
  {
    title: "Build the Express API",
    description: "Set up routes, controllers and the Mongoose model.",
    priority: "High",
    tags: ["backend"],
    columnId: "in-progress",
    orderIndex: 1000,
    version: 0,
  },
  {
    title: "Project scaffolding",
    description: "Monorepo structure, env files, scripts.",
    priority: "Low",
    tags: ["devops"],
    columnId: "done",
    orderIndex: 1000,
    version: 0,
  },
];

// Run the seed: clear the collection, then insert fresh sample data
async function seed() {
  await connectDatabase();

  // We import the model here (after DB connects) to avoid circular-import timing issues
  const { Task } = await import("./models/Task.js");
  const firstUser = await User.findOne().sort({ createdAt: 1, _id: 1 }).select("_id");

  // Remove everything so we always start from a known state
  await Task.deleteMany({});
  console.log("Cleared existing tasks");

  // Insert the sample tasks all at once
  const tasksForInsert = firstUser
    ? sampleTasks.map((task) => ({ ...task, userId: firstUser._id }))
    : sampleTasks;
  await Task.insertMany(tasksForInsert);
  console.log(`Seeded ${sampleTasks.length} tasks`);

  // Close the connection – the script should exit cleanly
  await mongoose.connection.close();
  console.log("Done – database connection closed");
}

seed();
