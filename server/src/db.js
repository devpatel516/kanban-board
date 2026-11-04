// What this file does: opens (and keeps open) the connection to MongoDB.
// When to edit: change connection options, add reconnect logic, or swap databases.

import mongoose from "mongoose";

// Connect to MongoDB using the URI stored in .env.
// Every line below is commented so you understand what Mongoose does for you.
export async function connectDatabase() {
  // mongoose.connect() returns a Promise; we await it so errors surface immediately.
  // No options needed: Mongoose 8+ uses the new URL parser and topology by default.
  await mongoose.connect(process.env.MONGODB_URI);

  // Only printed after the connection is fully open
  console.log("MongoDB connected:", mongoose.connection.host);

  // If the connection drops after startup, log it so you notice quickly
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected – check your network or Atlas status");
  });

  // If Mongoose reconnects automatically, let you know in the logs
  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
  });
}
