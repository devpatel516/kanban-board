// What this file does: creates accounts and signs users in or out of the board.
// When to edit: change signup, login, or current-user responses.

import { User } from "../models/User.js";
import { Task } from "../models/Task.js";
import { createLoginToken, hashPassword, passwordMatches } from "../auth.js";

// Creates an account, then gives the first account ownership of pre-login sample cards.
export async function signUp(req, res, next) {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || name.length > 60 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || password.length < 8 || password.length > 128) {
      return res.status(400).json({
        error: {
          code: "INVALID_SIGNUP",
          message: "Enter a name, valid email, and password with at least 8 characters.",
        },
      });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
    });

    // Older sample cards have no owner; only the very first account receives them.
    const firstUser = await User.findOne().sort({ createdAt: 1, _id: 1 }).select("_id");
    if (String(firstUser._id) === String(user._id)) {
      await Task.updateMany({ userId: { $exists: false } }, { $set: { userId: user._id } });
    }

    return res.status(201).json({
      token: createLoginToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: { code: "EMAIL_IN_USE", message: "An account with this email already exists." },
      });
    }
    return next(error);
  }
}

// Checks the email and password, then returns a signed login token.
export async function logIn(req, res, next) {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const user = await User.findOne({ email }).select("+passwordHash");
    const passwordIsCorrect = user
      ? await passwordMatches(password, user.passwordHash)
      : false;

    if (!passwordIsCorrect) {
      return res.status(401).json({
        error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." },
      });
    }

    return res.json({
      token: createLoginToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
}

// Returns the safe profile fields for a token that was already verified.
export function getCurrentUser(req, res) {
  return res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
}
