// What this file does: lets a person create an account or sign into their own board.
// When to edit: change the login form, signup fields, or welcome message.

import { useState } from "react";
import { logIn, setAuthToken, signUp } from "../api/taskApi.js";
import { BoardIcon } from "./Icons.jsx";
import "../styles/AuthScreen.css";

// Shows a friendly login/signup screen and starts a session when the server accepts it.
function AuthScreen({ onAuthenticated, initialErrorMessage, initialMode = "signup" }) {
  const [isSigningUp, setIsSigningUp] = useState(initialMode !== "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage || "");
  const [isSaving, setIsSaving] = useState(false);

  // Sends the form to the matching endpoint and saves the returned login token.
  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSaving(true);
    try {
      const result = isSigningUp
        ? await signUp({ name, email, password })
        : await logIn({ email, password });
      setAuthToken(result.token);
      onAuthenticated(result.user);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Switches forms without losing the values the person already entered.
  function handleModeToggle() {
    setErrorMessage("");
    setIsSigningUp(!isSigningUp);
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="auth-logo"><BoardIcon /></span>
          <span>Kanban Board</span>
        </div>
        <p className="auth-eyebrow">YOUR SPACE TO GET THINGS DONE</p>
        <h1 id="auth-title">{isSigningUp ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-description">
          {isSigningUp
            ? "Sign up to start organizing your own tasks and projects."
            : "Sign in to pick up right where you left off."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSigningUp && (
            <label>
              Your name
              <input
                autoComplete="name"
                maxLength={60}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Alex Patel"
                required
                value={name}
              />
            </label>
          )}
          <label>
            Email address
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Password
            <input
              autoComplete={isSigningUp ? "new-password" : "current-password"}
              maxLength={128}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
              type="password"
              value={password}
            />
          </label>
          {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}
          <button className="btn btn-primary auth-submit" disabled={isSaving} type="submit">
            {isSaving ? "Please wait…" : isSigningUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isSigningUp ? "Already have an account?" : "New to Kanban Board?"}
          <button onClick={handleModeToggle} type="button">
            {isSigningUp ? "Sign in" : "Create an account"}
          </button>
        </p>
        <p className="auth-privacy-note">Your board is private to your account.</p>
      </section>
      <aside className="auth-side-note">
        <span className="auth-side-icon"><BoardIcon /></span>
        <p>Make room for the work that matters.</p>
        <span>Plan it. Move it forward. Celebrate getting it done.</span>
      </aside>
    </main>
  );
}

export default AuthScreen;
