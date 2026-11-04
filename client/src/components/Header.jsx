// What this file does: renders the sticky top header with the app name and logo.
// When to edit: add a nav link, change the failure-test toggle, or change the app title.

import { useState } from "react";
import {
  setSimulateApiFailure,
  simulateApiFailure,
} from "../api/taskApi.js";
import "../styles/Header.css";

// Shows the app name and lets developers add the test header to API requests.
function Header() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || "light");
  const nextThemeLabel = theme === "light" ? "dark" : "light";
  const themeButtonLabel = theme === "light" ? "🌙 Dark" : "☀️ Light";

  // Updates the shared API flag so all future requests include the test header.
  function handleFailureSimulationChange(event) {
    setSimulateApiFailure(event.target.checked);
  }

  // Changes the active palette and saves the choice for the next page load.
  function handleThemeToggle() {
    // Alternate between the two available palettes.
    let nextTheme = "light";
    if (theme === "light") nextTheme = "dark";
    // Update the root attribute so all theme tokens switch together.
    document.documentElement.dataset.theme = nextTheme;
    // Save the choice so the inline startup script can use it before paint.
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  }

  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="header-logo" aria-hidden="true">🐾</span>
        <h1 className="header-title">PetPooja</h1>
        <span className="header-subtitle">Kanban Board</span>
      </div>
      <label className="failure-simulation-toggle">
        <input
          type="checkbox"
          defaultChecked={simulateApiFailure}
          onChange={handleFailureSimulationChange}
        />
        <span>Simulate API failure</span>
      </label>
      <button
        type="button"
        className="theme-toggle"
        onClick={handleThemeToggle}
        aria-pressed={theme === "dark"}
        aria-label={`Switch to ${nextThemeLabel} theme`}
        title={`Switch to ${nextThemeLabel} theme`}
      >
        {themeButtonLabel}
      </button>
    </header>
  );
}

export default Header;
