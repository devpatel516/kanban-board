// What this file does: connects to MongoDB and starts the Express server.
// When to edit: change port, add global middleware, or mount new route groups.

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./db.js";
import taskRoutes from "./routes/taskRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load variables from .env into process.env BEFORE anything else reads them.
dotenv.config();

const app = express();

// Allow the React client (and only the React client) to call this API.
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));

// Parse incoming JSON request bodies so req.body works in controllers.
app.use(express.json());

// ── Health route ──────────────────────────────────────────────────────────────
// A quick endpoint to confirm the server is alive.
// Useful for deployment health checks and debugging.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Task routes ───────────────────────────────────────────────────────────────
// All task endpoints live under /api/tasks (see routes/taskRoutes.js).
app.use("/api/tasks", taskRoutes);

// ── Central error handler ─────────────────────────────────────────────────────
// MUST be registered AFTER all routes. Express identifies this as an error
// handler because it has four arguments (err, req, res, next).
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Connect to the database first; only start accepting requests when it succeeds.
// This prevents the server from accepting calls before the DB is ready.
async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

