// What this file does: hashes passwords, signs login tokens, and protects private routes.
// When to edit: change token lifetime or the rules for authenticated requests.

import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { User } from "./models/User.js";

const scrypt = promisify(scryptCallback);
const TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

// Requires a private environment secret so signed login tokens cannot be forged.
function getTokenSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith("replace-this-with-")) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters in server/.env");
  }
  return secret;
}

// Stores a salted, one-way password hash so the original password is never saved.
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString("hex")}`;
}

// Compares a submitted password with its saved hash without revealing timing details.
export async function passwordMatches(password, savedHash) {
  const [salt, savedValue] = savedHash.split(":");
  const submittedHash = await scrypt(password, salt, 64);
  const savedBuffer = Buffer.from(savedValue, "hex");
  return savedBuffer.length === submittedHash.length
    && timingSafeEqual(savedBuffer, submittedHash);
}

// Creates a signed token that expires after one week.
export function createLoginToken(userId) {
  const payload = Buffer.from(JSON.stringify({
    sub: String(userId),
    exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
  })).toString("base64url");
  const signature = createHmac("sha256", getTokenSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

// Rejects altered or expired tokens before looking up the user.
function readLoginToken(token) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = createHmac("sha256", getTokenSecret()).update(payload).digest();
  const provided = Buffer.from(signature, "base64url");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  const details = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!details.sub || details.exp <= Math.floor(Date.now() / 1000)) return null;
  return details.sub;
}

// Attaches the signed-in user to the request or returns a standard 401 response.
export async function requireUser(req, res, next) {
  try {
    const authorization = req.get("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const userId = token ? readLoginToken(token) : null;
    const user = userId ? await User.findById(userId).select("name email") : null;
    if (!user) {
      return res.status(401).json({
        error: { code: "LOGIN_REQUIRED", message: "Please sign in to continue." },
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
