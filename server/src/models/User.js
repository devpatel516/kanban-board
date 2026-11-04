// What this file does: stores login details for each Kanban user.
// When to edit: change the profile fields or email rules for an account.

import mongoose from "mongoose";

// A user's email is their unique login name; the password field stores a hash only.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
