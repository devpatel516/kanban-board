// What this file does: maps signup and login URLs to authentication handlers.
// When to edit: add another account-related URL.

import { Router } from "express";
import { getCurrentUser, logIn, signUp } from "../controllers/authController.js";
import { requireUser } from "../auth.js";

const authRoutes = Router();

authRoutes.post("/signup", signUp);
authRoutes.post("/login", logIn);
authRoutes.get("/me", requireUser, getCurrentUser);

export default authRoutes;
