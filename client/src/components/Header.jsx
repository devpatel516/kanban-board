// What this file does: shows the board navigation, current account, and theme control.
// When to edit: change the board title, account actions, or navigation controls.

import { useState } from "react";
import { Link } from "react-router-dom";
import { BoardIcon, MoonIcon, SunIcon } from "./Icons.jsx";
import "../styles/Header.css";

// Gives the private board a compact frosted navigation bar.
function Header({ user, onLogOut }) {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || "light");
  const nextThemeLabel = theme === "light" ? "dark" : "light";

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
    <header className="app-header site-nav">
      <Link to="/" className="header-brand" aria-label="Kanban Board home">
        <BoardIcon />
        <span className="header-title">Kanban Board</span>
      </Link>
      <div className="header-account">
        <span className="header-user-name">{user.name}</span>
        <button type="button" className="btn btn-icon header-theme-toggle" onClick={handleThemeToggle} aria-pressed={theme === "dark"} aria-label={`Switch to ${nextThemeLabel} theme`} title={`Switch to ${nextThemeLabel} theme`}>
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
        <button type="button" className="btn header-logout" onClick={onLogOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}

export default Header;
