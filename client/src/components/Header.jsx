// What this file does: renders the sticky top header with the app name and logo.
// When to edit: add a nav link, a theme toggle, or change the app title.

import "../styles/Header.css";

function Header() {
  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="header-logo" aria-hidden="true">🐾</span>
        <h1 className="header-title">PetPooja</h1>
        <span className="header-subtitle">Kanban Board</span>
      </div>
    </header>
  );
}

export default Header;

