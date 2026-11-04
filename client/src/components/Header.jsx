// What this file does: renders the sticky top header with the app name and logo.
// When to edit: add a nav link, change the failure-test toggle, or change the app title.

import {
  setSimulateApiFailure,
  simulateApiFailure,
} from "../api/taskApi.js";
import "../styles/Header.css";

// Shows the app name and lets developers add the test header to API requests.
function Header() {
  // Updates the shared API flag so all future requests include the test header.
  function handleFailureSimulationChange(event) {
    setSimulateApiFailure(event.target.checked);
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
    </header>
  );
}

export default Header;
